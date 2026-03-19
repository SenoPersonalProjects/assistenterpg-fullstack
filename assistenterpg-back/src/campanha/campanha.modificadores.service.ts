// src/campanha/campanha.modificadores.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaModificadorJaDesfeitoException,
  CampanhaModificadorNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import {
  CampanhaMapper,
  PERSONAGEM_CAMPANHA_DETALHE_SELECT,
} from './campanha.mapper';
import { clamp, lerCampoNumerico } from './engine/campanha.engine';
import {
  CONFIG_MODIFICADOR_CAMPO,
  FiltrosListarModificadoresCampanha,
} from './engine/campanha.engine.types';

@Injectable()
export class CampanhaModificadoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
    private readonly contextoService: CampanhaContextoService,
    private readonly mapper: CampanhaMapper,
  ) {}

  async listarModificadoresPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    incluirInativos = false,
    filtros: FiltrosListarModificadoresCampanha = {},
  ) {
    await this.accessService.obterPersonagemCampanhaComPermissao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      false,
    );
    const contexto = await this.contextoService.validarContextoSessaoCena(
      campanhaId,
      filtros.sessaoId,
      filtros.cenaId,
    );

    const modificadores =
      await this.prisma.personagemCampanhaModificador.findMany({
        where: {
          campanhaId,
          personagemCampanhaId,
          ...(contexto.sessaoId !== null
            ? { sessaoId: contexto.sessaoId }
            : {}),
          ...(contexto.cenaId !== null ? { cenaId: contexto.cenaId } : {}),
          ...(incluirInativos ? {} : { ativo: true }),
        },
        include: {
          criadoPor: {
            select: {
              id: true,
              apelido: true,
            },
          },
          desfeitoPor: {
            select: {
              id: true,
              apelido: true,
            },
          },
        },
        orderBy: [{ ativo: 'desc' }, { criadoEm: 'desc' }],
      });

    return modificadores.map((modificador) => ({
      id: modificador.id,
      campanhaId: modificador.campanhaId,
      personagemCampanhaId: modificador.personagemCampanhaId,
      sessaoId: modificador.sessaoId,
      cenaId: modificador.cenaId,
      campo: modificador.campo,
      valor: modificador.valor,
      nome: modificador.nome,
      descricao: modificador.descricao,
      ativo: modificador.ativo,
      criadoEm: modificador.criadoEm,
      criadoPorId: modificador.criadoPorId,
      criadoPor: modificador.criadoPor,
      desfeitoEm: modificador.desfeitoEm,
      desfeitoPorId: modificador.desfeitoPorId,
      desfeitoPor: modificador.desfeitoPor,
      motivoDesfazer: modificador.motivoDesfazer,
    }));
  }

  async aplicarModificadorPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AplicarModificadorPersonagemCampanhaDto,
  ) {
    const contextoPersonagem =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const contextoSessaoCena =
      await this.contextoService.validarContextoSessaoCena(
        campanhaId,
        dto.sessaoId,
        dto.cenaId,
      );
    const configCampo = CONFIG_MODIFICADOR_CAMPO[dto.campo];
    const valorAtualCampo = lerCampoNumerico(
      contextoPersonagem.personagem,
      configCampo.campoBanco,
    );
    const valorCalculado = valorAtualCampo + dto.valor;
    const valorFinal =
      configCampo.minimo === undefined
        ? valorCalculado
        : Math.max(configCampo.minimo, valorCalculado);

    const dataAtualizacao = {
      [configCampo.campoBanco]: valorFinal,
    } as Prisma.PersonagemCampanhaUpdateInput;

    if (configCampo.campoRecursoAtual) {
      const recursoAtual = lerCampoNumerico(
        contextoPersonagem.personagem,
        configCampo.campoRecursoAtual,
      );
      const recursoAjustado = clamp(recursoAtual, 0, valorFinal);
      (dataAtualizacao as Record<string, number>)[
        configCampo.campoRecursoAtual
      ] = recursoAjustado;
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      const modificador = await tx.personagemCampanhaModificador.create({
        data: {
          campanhaId,
          personagemCampanhaId,
          sessaoId: contextoSessaoCena.sessaoId,
          cenaId: contextoSessaoCena.cenaId,
          campo: dto.campo,
          valor: dto.valor,
          nome: dto.nome.trim(),
          descricao: dto.descricao?.trim() || null,
          criadoPorId: usuarioId,
        },
      });

      const personagem = await tx.personagemCampanha.update({
        where: { id: personagemCampanhaId },
        data: dataAtualizacao,
        select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
      });

      await tx.personagemCampanhaHistorico.create({
        data: {
          personagemCampanhaId,
          campanhaId,
          criadoPorId: usuarioId,
          tipo: 'MODIFICADOR_APLICADO',
          descricao: `Modificador aplicado em ${dto.campo}`,
          dados: {
            modificadorId: modificador.id,
            campo: dto.campo,
            valor: dto.valor,
            nome: dto.nome,
            sessaoId: contextoSessaoCena.sessaoId,
            cenaId: contextoSessaoCena.cenaId,
            valorAntes: valorAtualCampo,
            valorDepois: valorFinal,
          },
        },
      });

      return { modificador, personagem };
    });

    return {
      modificador: resultado.modificador,
      personagem: this.mapper.mapearPersonagemCampanhaResposta(
        resultado.personagem,
      ),
    };
  }

  async desfazerModificadorPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    modificadorId: number,
    usuarioId: number,
    motivo?: string,
  ) {
    const contexto =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );

    const modificador =
      await this.prisma.personagemCampanhaModificador.findFirst({
        where: {
          id: modificadorId,
          campanhaId,
          personagemCampanhaId,
        },
      });

    if (!modificador) {
      throw new CampanhaModificadorNaoEncontradoException(
        modificadorId,
        personagemCampanhaId,
      );
    }

    if (!modificador.ativo) {
      throw new CampanhaModificadorJaDesfeitoException(
        modificadorId,
        personagemCampanhaId,
      );
    }

    const configCampo = CONFIG_MODIFICADOR_CAMPO[modificador.campo];
    const valorAtualCampo = lerCampoNumerico(
      contexto.personagem,
      configCampo.campoBanco,
    );
    const valorCalculado = valorAtualCampo - modificador.valor;
    const valorFinal =
      configCampo.minimo === undefined
        ? valorCalculado
        : Math.max(configCampo.minimo, valorCalculado);

    const dataAtualizacao = {
      [configCampo.campoBanco]: valorFinal,
    } as Prisma.PersonagemCampanhaUpdateInput;

    if (configCampo.campoRecursoAtual) {
      const recursoAtual = lerCampoNumerico(
        contexto.personagem,
        configCampo.campoRecursoAtual,
      );
      const recursoAjustado = clamp(recursoAtual, 0, valorFinal);
      (dataAtualizacao as Record<string, number>)[
        configCampo.campoRecursoAtual
      ] = recursoAjustado;
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      const modificadorAtualizado =
        await tx.personagemCampanhaModificador.update({
          where: { id: modificadorId },
          data: {
            ativo: false,
            desfeitoEm: new Date(),
            desfeitoPorId: usuarioId,
            motivoDesfazer: motivo?.trim() || null,
          },
          include: {
            criadoPor: {
              select: {
                id: true,
                apelido: true,
              },
            },
            desfeitoPor: {
              select: {
                id: true,
                apelido: true,
              },
            },
          },
        });

      const personagem = await tx.personagemCampanha.update({
        where: { id: personagemCampanhaId },
        data: dataAtualizacao,
        select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
      });

      await tx.personagemCampanhaHistorico.create({
        data: {
          personagemCampanhaId,
          campanhaId,
          criadoPorId: usuarioId,
          tipo: 'MODIFICADOR_DESFEITO',
          descricao: `Modificador desfeito em ${modificador.campo}`,
          dados: {
            modificadorId: modificador.id,
            campo: modificador.campo,
            valor: modificador.valor,
            sessaoId: modificador.sessaoId,
            cenaId: modificador.cenaId,
            valorAntes: valorAtualCampo,
            valorDepois: valorFinal,
            motivo: motivo?.trim() || null,
          },
        },
      });

      return { modificador: modificadorAtualizado, personagem };
    });

    return {
      modificador: resultado.modificador,
      personagem: this.mapper.mapearPersonagemCampanhaResposta(
        resultado.personagem,
      ),
    };
  }
}
