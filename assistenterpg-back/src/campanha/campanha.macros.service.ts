import { Injectable } from '@nestjs/common';
import { Prisma, type MacroPersonalizadaTipo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import type {
  AtualizarMacroPersonagemCampanhaDto,
  CriarMacroPersonagemCampanhaDto,
} from './dto/macro-personagem-campanha.dto';
import {
  configMacroParaPrisma,
  MACRO_PERSONAGEM_CONFIG_VERSAO,
  MACRO_PERSONAGEM_LIMITE_ATIVAS,
  MacroPersonalizadaConfigError,
  normalizarConfigMacroPersonalizada,
  type MacroPersonalizadaConfigV1,
} from './personagem-campanha-macro';
import {
  MacroPersonagemConfigInvalidaException,
  MacroPersonagemLimiteExcedidoException,
  MacroPersonagemNaoEncontradaException,
  MacroPersonagemPericiaInvalidaException,
  MacroPersonagemRevisaoConflitoException,
  MacroPersonagemVisibilidadeNegadaException,
} from '../common/exceptions/macro-personagem.exception';

const macroInclude = Prisma.validator<Prisma.PersonagemCampanhaMacroInclude>()({
  criadoPor: { select: { id: true, apelido: true } },
  atualizadoPor: { select: { id: true, apelido: true } },
});

type MacroEntity = Prisma.PersonagemCampanhaMacroGetPayload<{
  include: typeof macroInclude;
}>;

@Injectable()
export class CampanhaMacrosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  private normalizarNome(nome: string): string {
    const normalizado = nome.trim();
    if (!normalizado) {
      throw new MacroPersonagemConfigInvalidaException(
        'O nome da macro e obrigatorio.',
      );
    }
    return normalizado;
  }

  private normalizarDescricao(descricao?: string): string | null {
    const normalizada = descricao?.trim();
    return normalizada ? normalizada : null;
  }

  private normalizarConfig(
    tipo: MacroPersonalizadaTipo,
    config: unknown,
  ): MacroPersonalizadaConfigV1 {
    try {
      return normalizarConfigMacroPersonalizada(tipo, config);
    } catch (error) {
      if (error instanceof MacroPersonalizadaConfigError) {
        throw new MacroPersonagemConfigInvalidaException(error.message);
      }
      throw error;
    }
  }

  private async validarPericia(
    tipo: MacroPersonalizadaTipo,
    config: MacroPersonalizadaConfigV1,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    if (tipo !== 'ATAQUE_PERICIA') return;
    const periciaCodigo = (config as { periciaCodigo: string }).periciaCodigo;
    const existe = await tx.pericia.findUnique({
      where: { codigo: periciaCodigo },
      select: { codigo: true },
    });
    if (!existe) {
      throw new MacroPersonagemPericiaInvalidaException(periciaCodigo);
    }
  }

  private validarVisibilidade(
    visibilidade: 'PUBLICA' | 'SECRETA_MESTRE',
    ehMestre: boolean,
  ): void {
    if (visibilidade === 'SECRETA_MESTRE' && !ehMestre) {
      throw new MacroPersonagemVisibilidadeNegadaException();
    }
  }

  private mapearMacro(macro: MacroEntity) {
    const config = this.normalizarConfig(macro.tipo, macro.config);
    return {
      id: macro.id,
      campanhaId: macro.campanhaId,
      personagemCampanhaId: macro.personagemCampanhaId,
      nome: macro.nome,
      descricao: macro.descricao,
      tipo: macro.tipo,
      visibilidadePadrao: macro.visibilidadePadrao,
      configVersao: macro.configVersao,
      config,
      ordem: macro.ordem,
      ativo: macro.ativo,
      revisao: macro.revisao,
      criadoEm: macro.criadoEm,
      atualizadoEm: macro.atualizadoEm,
      criadoPor: macro.criadoPor,
      atualizadoPor: macro.atualizadoPor,
    };
  }

  async listar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    await this.accessService.obterPersonagemCampanhaComPermissao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      true,
    );
    const macros = await this.prisma.personagemCampanhaMacro.findMany({
      where: { campanhaId, personagemCampanhaId, ativo: true },
      include: macroInclude,
      orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
    return {
      personagemCampanhaId,
      macros: macros.map((macro) => this.mapearMacro(macro)),
    };
  }

  async criar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: CriarMacroPersonagemCampanhaDto,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const visibilidade = dto.visibilidadePadrao ?? 'PUBLICA';
    this.validarVisibilidade(visibilidade, acesso.ehMestre);
    const config = this.normalizarConfig(dto.tipo, dto.config);

    const macro = await this.prisma.$transaction(async (tx) => {
      const total = await tx.personagemCampanhaMacro.count({
        where: { campanhaId, personagemCampanhaId, ativo: true },
      });
      if (total >= MACRO_PERSONAGEM_LIMITE_ATIVAS) {
        throw new MacroPersonagemLimiteExcedidoException(
          MACRO_PERSONAGEM_LIMITE_ATIVAS,
        );
      }
      await this.validarPericia(dto.tipo, config, tx);
      const ultima = await tx.personagemCampanhaMacro.aggregate({
        where: { campanhaId, personagemCampanhaId, ativo: true },
        _max: { ordem: true },
      });
      return tx.personagemCampanhaMacro.create({
        data: {
          campanhaId,
          personagemCampanhaId,
          criadoPorId: usuarioId,
          atualizadoPorId: usuarioId,
          nome: this.normalizarNome(dto.nome),
          descricao: this.normalizarDescricao(dto.descricao),
          tipo: dto.tipo,
          visibilidadePadrao: visibilidade,
          configVersao: MACRO_PERSONAGEM_CONFIG_VERSAO,
          config: configMacroParaPrisma(config),
          ordem: (ultima._max.ordem ?? -1) + 1,
        },
        include: macroInclude,
      });
    });
    return this.mapearMacro(macro);
  }

  async atualizar(
    campanhaId: number,
    personagemCampanhaId: number,
    macroId: number,
    usuarioId: number,
    dto: AtualizarMacroPersonagemCampanhaDto,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const visibilidade = dto.visibilidadePadrao ?? 'PUBLICA';
    this.validarVisibilidade(visibilidade, acesso.ehMestre);
    const config = this.normalizarConfig(dto.tipo, dto.config);
    await this.validarPericia(dto.tipo, config);

    const existente = await this.prisma.personagemCampanhaMacro.findFirst({
      where: { id: macroId, campanhaId, personagemCampanhaId, ativo: true },
      select: { id: true },
    });
    if (!existente) throw new MacroPersonagemNaoEncontradaException(macroId);

    const atualizada = await this.prisma.personagemCampanhaMacro.updateMany({
      where: {
        id: macroId,
        campanhaId,
        personagemCampanhaId,
        ativo: true,
        revisao: dto.revisaoEsperada,
      },
      data: {
        nome: this.normalizarNome(dto.nome),
        descricao: this.normalizarDescricao(dto.descricao),
        tipo: dto.tipo,
        visibilidadePadrao: visibilidade,
        configVersao: MACRO_PERSONAGEM_CONFIG_VERSAO,
        config: configMacroParaPrisma(config),
        atualizadoPorId: usuarioId,
        revisao: { increment: 1 },
      },
    });
    if (atualizada.count !== 1) {
      throw new MacroPersonagemRevisaoConflitoException(macroId);
    }
    const macro = await this.prisma.personagemCampanhaMacro.findUnique({
      where: { id: macroId },
      include: macroInclude,
    });
    if (!macro) throw new MacroPersonagemNaoEncontradaException(macroId);
    return this.mapearMacro(macro);
  }

  async remover(
    campanhaId: number,
    personagemCampanhaId: number,
    macroId: number,
    usuarioId: number,
  ) {
    await this.accessService.obterPersonagemCampanhaComPermissao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      true,
    );
    const removida = await this.prisma.personagemCampanhaMacro.updateMany({
      where: { id: macroId, campanhaId, personagemCampanhaId, ativo: true },
      data: {
        ativo: false,
        removidoEm: new Date(),
        removidoPorId: usuarioId,
        atualizadoPorId: usuarioId,
        revisao: { increment: 1 },
      },
    });
    if (removida.count !== 1) {
      throw new MacroPersonagemNaoEncontradaException(macroId);
    }
    return { id: macroId, ativo: false };
  }
}
