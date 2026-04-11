// src/campanha/campanha.personagens.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaPersonagemAssociacaoNegadaException,
  CampanhaPersonagemDesassociacaoNegadaException,
  CampanhaPersonagemEdicaoNegadaException,
  CampanhaPersonagemLimiteUsuarioException,
  PersonagemCampanhaNucleoCustoInsuficienteException,
  PersonagemCampanhaNucleoIndisponivelException,
  PersonagemCampanhaNucleoInvalidoException,
  PersonagemCampanhaNucleoSacrificioIndisponivelException,
  PersonagemCampanhaNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { PersonagemBaseNaoEncontradoException } from 'src/common/exceptions/personagem.exception';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { AtualizarNucleoPersonagemCampanhaDto } from './dto/atualizar-nucleo-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
import {
  CampanhaMapper,
  PERSONAGEM_CAMPANHA_DETALHE_SELECT,
} from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
import { clamp, isUniqueConstraintViolation } from './engine/campanha.engine';
import { SacrificarNucleoPersonagemCampanhaDto } from './dto/sacrificar-nucleo-personagem-campanha.dto';
import {
  calcularPvBarraMaximos,
  normalizarNucleosDisponiveis,
  normalizarPvBarrasTotal,
  nucleosPadrao,
  type NucleoAmaldicoadoCodigo,
} from 'src/common/utils/pv-barras';

@Injectable()
export class CampanhaPersonagensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
    private readonly inventarioService: CampanhaInventarioService,
    private readonly mapper: CampanhaMapper,
    private readonly persistence: CampanhaPersistence,
  ) {}

  async listarPersonagensCampanha(campanhaId: number, usuarioId: number) {
    await this.accessService.garantirAcesso(campanhaId, usuarioId);

    const personagens =
      await this.persistence.listarPersonagensCampanha(campanhaId);

    return personagens.map((personagem) =>
      this.mapper.mapearPersonagemCampanhaResposta(personagem),
    );
  }

  async listarPersonagensBaseDisponiveisParaAssociacao(
    campanhaId: number,
    usuarioId: number,
  ) {
    const acesso = await this.accessService.garantirAcesso(
      campanhaId,
      usuarioId,
    );

    const idsDonosPermitidos = acesso.ehMestre
      ? [
          acesso.campanha.donoId,
          ...acesso.campanha.membros.map((membro) => membro.usuarioId),
        ]
      : [usuarioId];
    const idsDonosUnicos = Array.from(new Set(idsDonosPermitidos));

    const personagensJaAssociados =
      await this.prisma.personagemCampanha.findMany({
        where: { campanhaId },
        select: { personagemBaseId: true },
      });
    const idsPersonagensJaAssociados = personagensJaAssociados.map(
      (personagem) => personagem.personagemBaseId,
    );

    const personagensBase = await this.prisma.personagemBase.findMany({
      where: {
        donoId: { in: idsDonosUnicos },
        ...(idsPersonagensJaAssociados.length > 0
          ? { id: { notIn: idsPersonagensJaAssociados } }
          : {}),
      },
      select: {
        id: true,
        nome: true,
        nivel: true,
        donoId: true,
        dono: {
          select: {
            id: true,
            apelido: true,
          },
        },
      },
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
    });

    return personagensBase.map((personagem) => ({
      id: personagem.id,
      nome: personagem.nome,
      nivel: personagem.nivel,
      donoId: personagem.donoId,
      dono: {
        id: personagem.dono.id,
        apelido: personagem.dono.apelido,
      },
    }));
  }

  async vincularPersonagemBase(
    campanhaId: number,
    solicitanteId: number,
    personagemBaseId: number,
  ) {
    const acesso = await this.accessService.garantirAcesso(
      campanhaId,
      solicitanteId,
    );

    const personagemBase = await this.prisma.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        id: true,
        donoId: true,
        nome: true,
        nivel: true,
        claId: true,
        origemId: true,
        classeId: true,
        trilhaId: true,
        caminhoId: true,
        pvMaximo: true,
        pvBarrasTotal: true,
        peMaximo: true,
        eaMaximo: true,
        sanMaximo: true,
        limitePeEaPorTurno: true,
        prestigioBase: true,
        prestigioClaBase: true,
        defesaBase: true,
        defesaEquipamento: true,
        defesaOutros: true,
        esquiva: true,
        bloqueio: true,
        deslocamento: true,
        turnosMorrendo: true,
        turnosEnlouquecendo: true,
        espacosInventarioBase: true,
        espacosInventarioExtra: true,
        espacosOcupados: true,
        sobrecarregado: true,
        tecnicaInataId: true,
        resistencias: {
          select: {
            resistenciaTipoId: true,
            valor: true,
          },
        },
      },
    });

    if (!personagemBase) {
      throw new PersonagemBaseNaoEncontradoException(personagemBaseId);
    }

    const donoParticipaDaCampanha =
      personagemBase.donoId === acesso.campanha.donoId ||
      acesso.campanha.membros.some(
        (membro) => membro.usuarioId === personagemBase.donoId,
      );

    if (!donoParticipaDaCampanha) {
      throw new CampanhaPersonagemAssociacaoNegadaException(
        campanhaId,
        solicitanteId,
        personagemBaseId,
      );
    }

    const solicitanteEhDonoDoPersonagem =
      personagemBase.donoId === solicitanteId;
    if (!acesso.ehMestre && !solicitanteEhDonoDoPersonagem) {
      throw new CampanhaPersonagemAssociacaoNegadaException(
        campanhaId,
        solicitanteId,
        personagemBaseId,
      );
    }

    const donoEhMestreNaCampanha =
      personagemBase.donoId === acesso.campanha.donoId ||
      acesso.campanha.membros.some(
        (membro) =>
          membro.usuarioId === personagemBase.donoId &&
          membro.papel === 'MESTRE',
      );
    const deveAplicarLimitePorUsuario = !donoEhMestreNaCampanha;

    if (deveAplicarLimitePorUsuario) {
      const personagemExistenteDoDono =
        await this.prisma.personagemCampanha.findFirst({
          where: {
            campanhaId,
            donoId: personagemBase.donoId,
          },
          select: { id: true },
        });

      if (personagemExistenteDoDono) {
        throw new CampanhaPersonagemLimiteUsuarioException(
          campanhaId,
          personagemBase.donoId,
        );
      }
    }

    const personagemCampanhaId = await this.prisma.$transaction(async (tx) => {
      if (deveAplicarLimitePorUsuario) {
        const personagemExistenteDoDono = await tx.personagemCampanha.findFirst(
          {
            where: {
              campanhaId,
              donoId: personagemBase.donoId,
            },
            select: { id: true },
          },
        );

        if (personagemExistenteDoDono) {
          throw new CampanhaPersonagemLimiteUsuarioException(
            campanhaId,
            personagemBase.donoId,
          );
        }
      }

      const pvBarrasTotal = normalizarPvBarrasTotal(
        personagemBase.pvBarrasTotal,
      );
      const pvBarrasRestantes = pvBarrasTotal;
      const { pvBarraMaxAtual } = calcularPvBarraMaximos(
        personagemBase.pvMaximo,
        pvBarrasTotal,
        pvBarrasRestantes,
      );
      const nucleosDisponiveis = pvBarrasTotal > 1 ? nucleosPadrao() : [];
      const nucleoAmaldicoadoAtivo =
        pvBarrasTotal > 1 ? nucleosDisponiveis[0] : null;

      let personagemCriado: { id: number };
      try {
        personagemCriado = await tx.personagemCampanha.create({
          data: {
            campanhaId,
            personagemBaseId: personagemBase.id,
            donoId: personagemBase.donoId,
            nome: personagemBase.nome,
            nivel: personagemBase.nivel,
            claId: personagemBase.claId,
            origemId: personagemBase.origemId,
            classeId: personagemBase.classeId,
            trilhaId: personagemBase.trilhaId,
            caminhoId: personagemBase.caminhoId,
            pvMax: personagemBase.pvMaximo,
            pvAtual: pvBarraMaxAtual,
            peMax: personagemBase.peMaximo,
            peAtual: personagemBase.peMaximo,
            eaMax: personagemBase.eaMaximo,
            eaAtual: personagemBase.eaMaximo,
            sanMax: personagemBase.sanMaximo,
            sanAtual: personagemBase.sanMaximo,
            pvBarrasTotal,
            pvBarrasRestantes,
            nucleoAmaldicoadoAtivo,
            nucleosDisponiveis,
            limitePeEaPorTurno: personagemBase.limitePeEaPorTurno,
            prestigioGeral: personagemBase.prestigioBase,
            prestigioCla: personagemBase.prestigioClaBase,
            defesaBase: personagemBase.defesaBase,
            defesaEquipamento: personagemBase.defesaEquipamento,
            defesaOutros: personagemBase.defesaOutros,
            esquiva: personagemBase.esquiva,
            bloqueio: personagemBase.bloqueio,
            deslocamento: personagemBase.deslocamento,
            turnosMorrendo: personagemBase.turnosMorrendo,
            turnosEnlouquecendo: personagemBase.turnosEnlouquecendo,
            espacosInventarioBase: personagemBase.espacosInventarioBase,
            espacosInventarioExtra: personagemBase.espacosInventarioExtra,
            espacosOcupados: personagemBase.espacosOcupados,
            sobrecarregado: personagemBase.sobrecarregado,
            tecnicaInataId: personagemBase.tecnicaInataId,
          },
          select: {
            id: true,
          },
        });
      } catch (error) {
        const conflitoDono = isUniqueConstraintViolation(error, [
          'campanhaId',
          'donoId',
        ]);
        const conflitoPersonagemBase = isUniqueConstraintViolation(error, [
          'campanhaId',
          'personagemBaseId',
        ]);

        if (
          (conflitoDono && deveAplicarLimitePorUsuario) ||
          conflitoPersonagemBase
        ) {
          throw new CampanhaPersonagemLimiteUsuarioException(
            campanhaId,
            personagemBase.donoId,
          );
        }
        throw error;
      }

      if (personagemBase.resistencias.length > 0) {
        await tx.personagemCampanhaResistencia.createMany({
          data: personagemBase.resistencias.map((resistencia) => ({
            personagemCampanhaId: personagemCriado.id,
            resistenciaTipoId: resistencia.resistenciaTipoId,
            valor: resistencia.valor,
          })),
        });
      }

      await tx.personagemCampanhaHistorico.create({
        data: {
          personagemCampanhaId: personagemCriado.id,
          campanhaId,
          criadoPorId: solicitanteId,
          tipo: 'VINCULO_PERSONAGEM_BASE',
          descricao: 'Personagem-base associado a campanha',
          dados: {
            personagemBaseId: personagemBase.id,
            donoId: personagemBase.donoId,
          },
        },
      });

      const itensInventarioBase = await tx.inventarioItemBase.findMany({
        where: { personagemBaseId: personagemBase.id },
        include: {
          modificacoes: true,
        },
      });

      for (const itemBase of itensInventarioBase) {
        const itemCriado = await tx.inventarioItemCampanha.create({
          data: {
            personagemCampanhaId: personagemCriado.id,
            equipamentoId: itemBase.equipamentoId,
            quantidade: itemBase.quantidade,
            equipado: itemBase.equipado,
            categoriaCalculada: itemBase.categoriaCalculada,
            nomeCustomizado: itemBase.nomeCustomizado,
            notas: itemBase.notas,
            estado:
              itemBase.estado !== undefined && itemBase.estado !== null
                ? (itemBase.estado as Prisma.InputJsonValue)
                : undefined,
          },
          select: { id: true },
        });

        if (itemBase.modificacoes.length > 0) {
          await tx.inventarioItemCampanhaModificacao.createMany({
            data: itemBase.modificacoes.map((mod) => ({
              itemId: itemCriado.id,
              modificacaoId: mod.modificacaoId,
            })),
          });
        }
      }

      return personagemCriado.id;
    });

    await this.inventarioService.recalcularEstadoInventarioCampanha(
      personagemCampanhaId,
    );

    const personagemCampanha =
      await this.persistence.buscarPersonagemCampanhaDetalhe(
        personagemCampanhaId,
      );

    if (!personagemCampanha) {
      throw new PersonagemCampanhaNaoEncontradoException(
        personagemCampanhaId,
        campanhaId,
      );
    }

    return this.mapper.mapearPersonagemCampanhaResposta(personagemCampanha);
  }

  async desassociarPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    const acesso = await this.accessService.garantirAcesso(
      campanhaId,
      usuarioId,
    );

    const personagem = await this.prisma.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: {
        id: true,
        campanhaId: true,
        personagemBaseId: true,
        donoId: true,
      },
    });

    if (!personagem || personagem.campanhaId !== campanhaId) {
      throw new PersonagemCampanhaNaoEncontradoException(
        personagemCampanhaId,
        campanhaId,
      );
    }

    const podeRemover = acesso.ehMestre || personagem.donoId === usuarioId;
    if (!podeRemover) {
      throw new CampanhaPersonagemEdicaoNegadaException(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
      );
    }

    const participacaoEmSessao = await this.prisma.personagemSessao.findFirst({
      where: {
        personagemCampanhaId,
      },
      select: {
        id: true,
        sessaoId: true,
      },
    });

    if (participacaoEmSessao) {
      throw new CampanhaPersonagemDesassociacaoNegadaException(
        campanhaId,
        personagemCampanhaId,
        participacaoEmSessao.sessaoId,
      );
    }

    await this.prisma.personagemCampanha.delete({
      where: {
        id: personagemCampanhaId,
      },
    });

    return {
      id: personagemCampanhaId,
      campanhaId,
      personagemBaseId: personagem.personagemBaseId,
      message: 'Personagem desassociado com sucesso',
    };
  }

  async atualizarRecursosPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AtualizarRecursosPersonagemCampanhaDto,
  ) {
    const contexto =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );

    const infoPv = calcularPvBarraMaximos(
      contexto.personagem.pvMax,
      contexto.personagem.pvBarrasTotal,
      contexto.personagem.pvBarrasRestantes,
    );

    const antes = {
      pvAtual: contexto.personagem.pvAtual,
      peAtual: contexto.personagem.peAtual,
      eaAtual: contexto.personagem.eaAtual,
      sanAtual: contexto.personagem.sanAtual,
    };

    const depois = {
      pvAtual:
        dto.pvAtual == null
          ? contexto.personagem.pvAtual
          : clamp(dto.pvAtual, 0, infoPv.pvBarraMaxAtual),
      peAtual:
        dto.peAtual == null
          ? contexto.personagem.peAtual
          : clamp(dto.peAtual, 0, contexto.personagem.peMax),
      eaAtual:
        dto.eaAtual == null
          ? contexto.personagem.eaAtual
          : clamp(dto.eaAtual, 0, contexto.personagem.eaMax),
      sanAtual:
        dto.sanAtual == null
          ? contexto.personagem.sanAtual
          : clamp(dto.sanAtual, 0, contexto.personagem.sanMax),
    };

    const atualizado = await this.prisma.$transaction(async (tx) => {
      const personagem = await tx.personagemCampanha.update({
        where: { id: personagemCampanhaId },
        data: {
          pvAtual: depois.pvAtual,
          peAtual: depois.peAtual,
          eaAtual: depois.eaAtual,
          sanAtual: depois.sanAtual,
        },
        select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
      });

      await tx.personagemCampanhaHistorico.create({
        data: {
          personagemCampanhaId,
          campanhaId,
          criadoPorId: usuarioId,
          tipo: 'ATUALIZACAO_RECURSOS',
          descricao: 'Recursos atuais da ficha foram atualizados manualmente',
          dados: {
            antes,
            depois,
          },
        },
      });

      return personagem;
    });

    return this.mapper.mapearPersonagemCampanhaResposta(atualizado);
  }

  async atualizarNucleoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AtualizarNucleoPersonagemCampanhaDto,
  ) {
    const contexto =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );

    const pvBarrasTotal = normalizarPvBarrasTotal(
      contexto.personagem.pvBarrasTotal,
    );
    if (pvBarrasTotal <= 1) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'Personagem nao possui multiplos nucleos.',
      );
    }

    const nucleo = dto.nucleo as NucleoAmaldicoadoCodigo;
    const nucleosDisponiveis = normalizarNucleosDisponiveis(
      contexto.personagem.nucleosDisponiveis,
    );

    if (!nucleosDisponiveis.includes(nucleo)) {
      throw new PersonagemCampanhaNucleoIndisponivelException(nucleo);
    }

    const atualizado = await this.prisma.personagemCampanha.update({
      where: { id: personagemCampanhaId },
      data: { nucleoAmaldicoadoAtivo: nucleo },
      select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
    });

    return this.mapper.mapearPersonagemCampanhaResposta(atualizado);
  }

  async sacrificarNucleoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: SacrificarNucleoPersonagemCampanhaDto,
  ) {
    const contexto =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );

    const infoPv = calcularPvBarraMaximos(
      contexto.personagem.pvMax,
      contexto.personagem.pvBarrasTotal,
      contexto.personagem.pvBarrasRestantes,
    );

    if (infoPv.pvBarrasTotal <= 1) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'Personagem nao possui multiplas barras de PV.',
      );
    }

    if (contexto.personagem.pvAtual > 0) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'PV atual deve estar zerado para sacrificar um nucleo.',
      );
    }

    if (infoPv.pvBarrasRestantes <= 1) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'Nao ha nucleos restantes para sacrificar.',
      );
    }

    const nucleosDisponiveis = normalizarNucleosDisponiveis(
      contexto.personagem.nucleosDisponiveis,
    );
    const nucleoAtivo =
      (contexto.personagem
        .nucleoAmaldicoadoAtivo as NucleoAmaldicoadoCodigo | null) ??
      nucleosDisponiveis[0] ??
      'EQUILIBRIO';

    const modo = dto.modo;
    const nucleoAlvo =
      modo === 'OUTRO' ? dto.nucleo : (nucleoAtivo as string | undefined);

    if (!nucleoAlvo) {
      throw new PersonagemCampanhaNucleoInvalidoException(String(nucleoAlvo));
    }

    if (!nucleosDisponiveis.includes(nucleoAlvo as NucleoAmaldicoadoCodigo)) {
      throw new PersonagemCampanhaNucleoIndisponivelException(nucleoAlvo);
    }

    if (modo === 'OUTRO' && nucleoAlvo === nucleoAtivo) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'Escolha um nucleo diferente do ativo.',
      );
    }

    if (modo === 'OUTRO' && contexto.personagem.peAtual < 3) {
      throw new PersonagemCampanhaNucleoCustoInsuficienteException(
        3,
        contexto.personagem.peAtual,
      );
    }

    const novosNucleos = nucleosDisponiveis.filter(
      (codigo) => codigo !== nucleoAlvo,
    );

    if (novosNucleos.length < 1) {
      throw new PersonagemCampanhaNucleoSacrificioIndisponivelException(
        'Nao ha outro nucleo disponivel apos o sacrificio.',
      );
    }

    const novoNucleoAtivo = modo === 'ATUAL' ? novosNucleos[0] : nucleoAtivo;

    const infoAtualizado = calcularPvBarraMaximos(
      contexto.personagem.pvMax,
      infoPv.pvBarrasTotal,
      infoPv.pvBarrasRestantes - 1,
    );

    const atualizado = await this.prisma.personagemCampanha.update({
      where: { id: personagemCampanhaId },
      data: {
        pvBarrasRestantes: infoAtualizado.pvBarrasRestantes,
        pvAtual: infoAtualizado.pvBarraMaxAtual,
        nucleoAmaldicoadoAtivo: novoNucleoAtivo,
        nucleosDisponiveis: novosNucleos,
        peAtual:
          modo === 'OUTRO'
            ? Math.max(0, contexto.personagem.peAtual - 3)
            : contexto.personagem.peAtual,
      },
      select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
    });

    return this.mapper.mapearPersonagemCampanhaResposta(atualizado);
  }

  async listarHistoricoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    await this.accessService.obterPersonagemCampanhaComPermissao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      false,
    );

    const historico = await this.prisma.personagemCampanhaHistorico.findMany({
      where: {
        campanhaId,
        personagemCampanhaId,
      },
      include: {
        criadoPor: {
          select: {
            id: true,
            apelido: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    });

    return historico;
  }
}
