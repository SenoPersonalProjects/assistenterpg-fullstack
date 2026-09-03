import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import {
  ConcederPoderGenericoCampanhaDto,
  ConcederProficienciaCampanhaDto,
  CriarHabilidadePersonalizadaCampanhaDto,
} from './dto/concessoes-personagem-campanha.dto';

@Injectable()
export class CampanhaConcessoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  private fontePermitida(fontes: Prisma.JsonValue | null, fonte: TipoFonte, suplementoId: number | null) {
    if (fontes === null) return true;
    if (fonte === TipoFonte.SISTEMA_BASE) return true;
    if (!fontes || typeof fontes !== 'object' || Array.isArray(fontes)) return false;
    const ids = (fontes as Record<string, unknown>).suplementoIds;
    return fonte === TipoFonte.SUPLEMENTO && suplementoId !== null && Array.isArray(ids) && ids.includes(suplementoId);
  }

  async listar(campanhaId: number, personagemCampanhaId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, false);
    const personagem = await this.prisma.personagemCampanha.findUniqueOrThrow({
      where: { id: personagemCampanhaId },
      select: {
        poderesGenericos: { include: { habilidade: { select: { id: true, nome: true, descricao: true, mecanicasEspeciais: true } } } },
        proficienciasConcedidas: { include: { proficiencia: true } },
        habilidadesPersonalizadas: true,
      },
    });
    return personagem;
  }

  async concederPoder(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: ConcederPoderGenericoCampanhaDto) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    const [poder, campanha] = await Promise.all([
      this.prisma.habilidade.findUnique({ where: { id: dto.habilidadeId } }),
      this.prisma.campanha.findUnique({ where: { id: campanhaId }, select: { fontesConteudo: true } }),
    ]);
    if (!poder || poder.tipo !== 'PODER_GENERICO' || !campanha || !this.fontePermitida(campanha.fontesConteudo, poder.fonte, poder.suplementoId)) {
      throw new BadRequestException('Poder genérico indisponível para esta campanha.');
    }
    const mecanicas = poder.mecanicasEspeciais && typeof poder.mecanicasEspeciais === 'object' && !Array.isArray(poder.mecanicasEspeciais) ? poder.mecanicasEspeciais as Record<string, unknown> : null;
    const escolha = mecanicas?.escolha && typeof mecanicas.escolha === 'object' && !Array.isArray(mecanicas.escolha) ? mecanicas.escolha as Record<string, unknown> : null;
    if (escolha && (!dto.config || Object.keys(dto.config).length === 0)) throw new BadRequestException('Este poder exige uma configuração antes de ser concedido.');
    if (escolha?.tipo === 'SHIKIGAMI') {
      const shikigamiId = Number(dto.config?.shikigamiId);
      const vinculado = Number.isInteger(shikigamiId) && await this.prisma.personagemCampanhaEntidadeVinculada.findFirst({ where: { id: shikigamiId, personagemCampanhaId, tipo: 'SHIKIGAMI' }, select: { id: true } });
      if (!vinculado) throw new BadRequestException('Selecione um shikigami válido vinculado ao personagem.');
    }
    const registro = await this.prisma.poderGenericoPersonagemCampanha.create({
      data: { personagemCampanhaId, habilidadeId: poder.id, config: dto.config as Prisma.InputJsonValue | undefined },
      include: { habilidade: true },
    });
    await this.prisma.personagemCampanhaHistorico.create({
      data: { personagemCampanhaId, campanhaId, criadoPorId: usuarioId, tipo: 'PODER_CONCEDIDO', descricao: `Poder genérico concedido: ${poder.nome}`, dados: { poderId: registro.id, habilidadeId: poder.id, config: (dto.config ?? null) as Prisma.InputJsonValue } },
    });
    return registro;
  }

  async removerPoder(campanhaId: number, personagemCampanhaId: number, poderId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    const registro = await this.prisma.poderGenericoPersonagemCampanha.findFirst({ where: { id: poderId, personagemCampanhaId }, include: { habilidade: { select: { nome: true, id: true } } } });
    await this.prisma.poderGenericoPersonagemCampanha.deleteMany({ where: { id: poderId, personagemCampanhaId } });
    if (registro) await this.prisma.personagemCampanhaHistorico.create({ data: { personagemCampanhaId, campanhaId, criadoPorId: usuarioId, tipo: 'PODER_REMOVIDO', descricao: `Poder genérico removido: ${registro.habilidade.nome}`, dados: { poderId, habilidadeId: registro.habilidade.id } } });
    return { sucesso: true };
  }

  async concederProficiencia(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: ConcederProficienciaCampanhaDto) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    const registro = await this.prisma.personagemCampanhaProficiencia.upsert({
      where: { personagemCampanhaId_proficienciaId: { personagemCampanhaId, proficienciaId: dto.proficienciaId } },
      create: { personagemCampanhaId, proficienciaId: dto.proficienciaId, criadoPorId: usuarioId },
      update: {}, include: { proficiencia: true },
    });
    await this.prisma.personagemCampanhaHistorico.create({ data: { personagemCampanhaId, campanhaId, criadoPorId: usuarioId, tipo: 'PROFICIENCIA_CONCEDIDA', descricao: `Proficiência concedida: ${registro.proficiencia.nome}`, dados: { proficienciaId: registro.proficienciaId } } });
    return registro;
  }

  async removerProficiencia(campanhaId: number, personagemCampanhaId: number, proficienciaId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    const registro = await this.prisma.personagemCampanhaProficiencia.findUnique({ where: { personagemCampanhaId_proficienciaId: { personagemCampanhaId, proficienciaId } }, include: { proficiencia: { select: { nome: true } } } });
    await this.prisma.personagemCampanhaProficiencia.deleteMany({ where: { personagemCampanhaId, proficienciaId } });
    if (registro) await this.prisma.personagemCampanhaHistorico.create({ data: { personagemCampanhaId, campanhaId, criadoPorId: usuarioId, tipo: 'PROFICIENCIA_REMOVIDA', descricao: `Proficiência removida: ${registro.proficiencia.nome}`, dados: { proficienciaId } } });
    return { sucesso: true };
  }

  async criarHabilidadePersonalizada(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: CriarHabilidadePersonalizadaCampanhaDto) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    return this.prisma.personagemCampanhaHabilidadePersonalizada.create({
      data: { campanhaId, personagemCampanhaId, criadoPorId: usuarioId, nome: dto.nome.trim(), descricao: dto.descricao.trim() },
    });
  }

  async removerHabilidadePersonalizada(campanhaId: number, personagemCampanhaId: number, habilidadeId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    await this.prisma.personagemCampanhaHabilidadePersonalizada.deleteMany({ where: { id: habilidadeId, campanhaId, personagemCampanhaId } });
    return { sucesso: true };
  }
}
