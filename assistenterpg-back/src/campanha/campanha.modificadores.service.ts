// src/campanha/campanha.modificadores.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaModificadorJaDesfeitoException,
  CampanhaModificadorInvalidoException,
  CampanhaModificadorNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import {
  CampanhaMapper,
  PersonagemCampanhaDetalhePayload,
  PERSONAGEM_CAMPANHA_DETALHE_SELECT,
} from './campanha.mapper';
import { clamp, lerCampoNumerico } from './engine/campanha.engine';
import {
  CONFIG_MODIFICADOR_CAMPO,
  FiltrosListarModificadoresCampanha,
  isCampoModificadorNumerico,
} from './engine/campanha.engine.types';
import {
  calcularGrauAprimoramentoEfetivo,
  calcularGrauTreinamentoEfetivo,
  resolverGrausAprimoramentoEfetivosCampanha,
  resolverPericiasEfetivasCampanha,
} from './engine/campanha-modificadores-efetivos';

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
          pericia: {
            select: {
              codigo: true,
              nome: true,
            },
          },
          tipoGrau: {
            select: {
              codigo: true,
              nome: true,
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
      periciaCodigo: modificador.periciaCodigo,
      tipoGrauCodigo: modificador.tipoGrauCodigo,
      pericia: modificador.pericia,
      tipoGrau: modificador.tipoGrau,
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
    const alvo = await this.validarAlvoModificador(
      personagemCampanhaId,
      dto,
      contextoPersonagem.personagem as unknown as Record<string, unknown>,
    );

    const resultado = await this.prisma.$transaction(async (tx) => {
      const modificador = await tx.personagemCampanhaModificador.create({
        data: {
          campanhaId,
          personagemCampanhaId,
          sessaoId: contextoSessaoCena.sessaoId,
          cenaId: contextoSessaoCena.cenaId,
          campo: dto.campo,
          periciaCodigo: alvo.periciaCodigo,
          tipoGrauCodigo: alvo.tipoGrauCodigo,
          valor: dto.valor,
          nome: dto.nome.trim(),
          descricao: dto.descricao?.trim() || null,
          criadoPorId: usuarioId,
        },
        include: {
          pericia: {
            select: {
              codigo: true,
              nome: true,
            },
          },
          tipoGrau: {
            select: {
              codigo: true,
              nome: true,
            },
          },
        },
      });

      let personagem: PersonagemCampanhaDetalhePayload;
      if (isCampoModificadorNumerico(dto.campo)) {
        if (!alvo.dataAtualizacao) {
          throw new CampanhaModificadorInvalidoException(
            'Modificador numerico sem dados de atualizacao.',
            { campo: dto.campo },
          );
        }
        personagem = await tx.personagemCampanha.update({
          where: { id: personagemCampanhaId },
          data: alvo.dataAtualizacao,
          select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
        });
      } else {
        personagem = await tx.personagemCampanha.findUniqueOrThrow({
          where: { id: personagemCampanhaId },
          select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
        });
      }

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
            periciaCodigo: alvo.periciaCodigo,
            tipoGrauCodigo: alvo.tipoGrauCodigo,
            sessaoId: contextoSessaoCena.sessaoId,
            cenaId: contextoSessaoCena.cenaId,
            valorAntes: alvo.valorAntes,
            valorDepois: alvo.valorDepois,
          },
        },
      });

      await tx.personagemCampanhaEntidadeVinculada.updateMany({
        where: {
          personagemCampanhaId,
          calculoAutomatico: { not: Prisma.DbNull },
        },
        data: { precisaRecalculo: true },
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

    const desfazer = await this.calcularDesfazerModificador(
      contexto.personagem,
      modificador,
    );

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
            pericia: {
              select: {
                codigo: true,
                nome: true,
              },
            },
            tipoGrau: {
              select: {
                codigo: true,
                nome: true,
              },
            },
          },
        });

      let personagem: PersonagemCampanhaDetalhePayload;
      if (desfazer.dataAtualizacao) {
        personagem = await tx.personagemCampanha.update({
          where: { id: personagemCampanhaId },
          data: desfazer.dataAtualizacao,
          select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
        });
      } else {
        personagem = await tx.personagemCampanha.findUniqueOrThrow({
          where: { id: personagemCampanhaId },
          select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
        });
      }

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
            periciaCodigo: modificador.periciaCodigo,
            tipoGrauCodigo: modificador.tipoGrauCodigo,
            sessaoId: modificador.sessaoId,
            cenaId: modificador.cenaId,
            valorAntes: desfazer.valorAntes,
            valorDepois: desfazer.valorDepois,
            motivo: motivo?.trim() || null,
          },
        },
      });

      await tx.personagemCampanhaEntidadeVinculada.updateMany({
        where: {
          personagemCampanhaId,
          calculoAutomatico: { not: Prisma.DbNull },
        },
        data: { precisaRecalculo: true },
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

  private async validarAlvoModificador(
    personagemCampanhaId: number,
    dto: AplicarModificadorPersonagemCampanhaDto,
    personagemNumerico: Record<string, unknown>,
  ): Promise<{
    periciaCodigo: string | null;
    tipoGrauCodigo: string | null;
    valorAntes: number;
    valorDepois: number;
    dataAtualizacao?: Prisma.PersonagemCampanhaUpdateInput;
  }> {
    const periciaCodigo = dto.periciaCodigo?.trim() || null;
    const tipoGrauCodigo = dto.tipoGrauCodigo?.trim() || null;

    if (isCampoModificadorNumerico(dto.campo)) {
      if (periciaCodigo || tipoGrauCodigo) {
        throw new CampanhaModificadorInvalidoException(
          'Campos numericos nao aceitam alvo de pericia ou grau.',
          { campo: dto.campo, periciaCodigo, tipoGrauCodigo },
        );
      }

      const configCampo = CONFIG_MODIFICADOR_CAMPO[dto.campo];
      const valorAtualCampo = lerCampoNumerico(
        personagemNumerico,
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
          personagemNumerico,
          configCampo.campoRecursoAtual,
        );
        const recursoAjustado = clamp(recursoAtual, 0, valorFinal);
        (dataAtualizacao as Record<string, number>)[
          configCampo.campoRecursoAtual
        ] = recursoAjustado;
      }

      return {
        periciaCodigo: null,
        tipoGrauCodigo: null,
        valorAntes: valorAtualCampo,
        valorDepois: valorFinal,
        dataAtualizacao,
      };
    }

    if (dto.campo === 'PERICIA_TREINAMENTO') {
      if (!periciaCodigo || tipoGrauCodigo) {
        throw new CampanhaModificadorInvalidoException(
          'Modificador de pericia exige periciaCodigo e nao aceita tipoGrauCodigo.',
          { campo: dto.campo, periciaCodigo, tipoGrauCodigo },
        );
      }

      const pericia = await this.prisma.pericia.findUnique({
        where: { codigo: periciaCodigo },
        select: { codigo: true },
      });
      if (!pericia) {
        throw new CampanhaModificadorInvalidoException(
          'Pericia do modificador nao encontrada.',
          { periciaCodigo },
        );
      }

      const valorAntes = await this.obterGrauTreinamentoEfetivo(
        personagemCampanhaId,
        periciaCodigo,
      );
      return {
        periciaCodigo,
        tipoGrauCodigo: null,
        valorAntes,
        valorDepois: calcularGrauTreinamentoEfetivo(valorAntes, dto.valor),
      };
    }

    if (dto.campo === 'GRAU_APRIMORAMENTO') {
      if (!tipoGrauCodigo || periciaCodigo) {
        throw new CampanhaModificadorInvalidoException(
          'Modificador de grau exige tipoGrauCodigo e nao aceita periciaCodigo.',
          { campo: dto.campo, periciaCodigo, tipoGrauCodigo },
        );
      }

      const tipoGrau = await this.prisma.tipoGrau.findUnique({
        where: { codigo: tipoGrauCodigo },
        select: { codigo: true },
      });
      if (!tipoGrau) {
        throw new CampanhaModificadorInvalidoException(
          'Tipo de grau do modificador nao encontrado.',
          { tipoGrauCodigo },
        );
      }

      const valorAntes = await this.obterGrauAprimoramentoEfetivo(
        personagemCampanhaId,
        tipoGrauCodigo,
      );
      return {
        periciaCodigo: null,
        tipoGrauCodigo,
        valorAntes,
        valorDepois: calcularGrauAprimoramentoEfetivo(valorAntes, dto.valor),
      };
    }

    throw new CampanhaModificadorInvalidoException(
      'Campo de modificador narrativo desconhecido.',
      { campo: dto.campo },
    );
  }

  private async calcularDesfazerModificador(
    personagem: Record<string, unknown>,
    modificador: {
      id: number;
      campo: string;
      valor: number;
      periciaCodigo: string | null;
      tipoGrauCodigo: string | null;
      personagemCampanhaId: number;
    },
  ): Promise<{
    valorAntes: number;
    valorDepois: number;
    dataAtualizacao?: Prisma.PersonagemCampanhaUpdateInput;
  }> {
    if (isCampoModificadorNumerico(modificador.campo)) {
      const configCampo = CONFIG_MODIFICADOR_CAMPO[modificador.campo];
      const valorAtualCampo = lerCampoNumerico(
        personagem,
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
          personagem,
          configCampo.campoRecursoAtual,
        );
        const recursoAjustado = clamp(recursoAtual, 0, valorFinal);
        (dataAtualizacao as Record<string, number>)[
          configCampo.campoRecursoAtual
        ] = recursoAjustado;
      }

      return {
        valorAntes: valorAtualCampo,
        valorDepois: valorFinal,
        dataAtualizacao,
      };
    }

    if (modificador.campo === 'PERICIA_TREINAMENTO') {
      const codigo = modificador.periciaCodigo?.trim();
      if (!codigo) {
        throw new CampanhaModificadorInvalidoException(
          'Modificador de pericia sem periciaCodigo.',
          { modificadorId: modificador.id },
        );
      }
      const valorAntes = await this.obterGrauTreinamentoEfetivo(
        modificador.personagemCampanhaId,
        codigo,
      );
      return {
        valorAntes,
        valorDepois: calcularGrauTreinamentoEfetivo(
          valorAntes,
          -modificador.valor,
        ),
      };
    }

    if (modificador.campo === 'GRAU_APRIMORAMENTO') {
      const codigo = modificador.tipoGrauCodigo?.trim();
      if (!codigo) {
        throw new CampanhaModificadorInvalidoException(
          'Modificador de grau sem tipoGrauCodigo.',
          { modificadorId: modificador.id },
        );
      }
      const valorAntes = await this.obterGrauAprimoramentoEfetivo(
        modificador.personagemCampanhaId,
        codigo,
      );
      return {
        valorAntes,
        valorDepois: calcularGrauAprimoramentoEfetivo(
          valorAntes,
          -modificador.valor,
        ),
      };
    }

    throw new CampanhaModificadorInvalidoException(
      'Campo de modificador narrativo desconhecido.',
      { campo: modificador.campo },
    );
  }

  private async obterGrauTreinamentoEfetivo(
    personagemCampanhaId: number,
    periciaCodigo: string,
  ): Promise<number> {
    const personagem = await this.prisma.personagemCampanha.findUniqueOrThrow({
      where: { id: personagemCampanhaId },
      select: {
        personagemBase: {
          select: {
            pericias: {
              select: {
                grauTreinamento: true,
                bonusExtra: true,
                pericia: {
                  select: {
                    codigo: true,
                    nome: true,
                    atributoBase: true,
                  },
                },
              },
            },
          },
        },
        modificadores: {
          where: { ativo: true },
          select: {
            campo: true,
            valor: true,
            periciaCodigo: true,
            tipoGrauCodigo: true,
          },
        },
      },
    });

    return (
      resolverPericiasEfetivasCampanha(
        personagem.personagemBase.pericias,
        personagem.modificadores,
      ).find((pericia) => pericia.codigo === periciaCodigo)?.grauTreinamento ??
      0
    );
  }

  private async obterGrauAprimoramentoEfetivo(
    personagemCampanhaId: number,
    tipoGrauCodigo: string,
  ): Promise<number> {
    const personagem = await this.prisma.personagemCampanha.findUniqueOrThrow({
      where: { id: personagemCampanhaId },
      select: {
        grausAprimoramento: {
          select: {
            valor: true,
            tipoGrau: {
              select: {
                codigo: true,
                nome: true,
              },
            },
          },
        },
        personagemBase: {
          select: {
            grausAprimoramento: {
              select: {
                valor: true,
                tipoGrau: {
                  select: {
                    codigo: true,
                    nome: true,
                  },
                },
              },
            },
          },
        },
        modificadores: {
          where: { ativo: true },
          select: {
            campo: true,
            valor: true,
            periciaCodigo: true,
            tipoGrauCodigo: true,
          },
        },
      },
    });
    const grausBase = personagem.grausAprimoramento.length
      ? personagem.grausAprimoramento
      : personagem.personagemBase.grausAprimoramento;

    return (
      resolverGrausAprimoramentoEfetivosCampanha(
        grausBase,
        personagem.modificadores,
      ).find((grau) => grau.tipoGrauCodigo === tipoGrauCodigo)?.valor ?? 0
    );
  }
}
