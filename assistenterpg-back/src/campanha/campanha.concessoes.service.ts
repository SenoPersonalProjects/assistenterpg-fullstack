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
        poderesGenericos: { include: { habilidade: { select: { id: true, nome: true, descricao: true } } } },
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
    return this.prisma.poderGenericoPersonagemCampanha.create({
      data: { personagemCampanhaId, habilidadeId: poder.id, config: dto.config as Prisma.InputJsonValue | undefined },
      include: { habilidade: true },
    });
  }

  async removerPoder(campanhaId: number, personagemCampanhaId: number, poderId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    await this.prisma.poderGenericoPersonagemCampanha.deleteMany({ where: { id: poderId, personagemCampanhaId } });
    return { sucesso: true };
  }

  async concederProficiencia(campanhaId: number, personagemCampanhaId: number, usuarioId: number, dto: ConcederProficienciaCampanhaDto) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    return this.prisma.personagemCampanhaProficiencia.upsert({
      where: { personagemCampanhaId_proficienciaId: { personagemCampanhaId, proficienciaId: dto.proficienciaId } },
      create: { personagemCampanhaId, proficienciaId: dto.proficienciaId, criadoPorId: usuarioId },
      update: {}, include: { proficiencia: true },
    });
  }

  async removerProficiencia(campanhaId: number, personagemCampanhaId: number, proficienciaId: number, usuarioId: number) {
    await this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    await this.prisma.personagemCampanhaProficiencia.deleteMany({ where: { personagemCampanhaId, proficienciaId } });
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
