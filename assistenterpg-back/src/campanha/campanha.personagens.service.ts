// src/campanha/campanha.personagens.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaPersonagemAssociacaoNegadaException,
  CampanhaPersonagemDesassociacaoNegadaException,
  CampanhaPersonagemEdicaoNegadaException,
  CampanhaPersonagemLimiteUsuarioException,
  PersonagemCampanhaNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { PersonagemBaseNaoEncontradoException } from 'src/common/exceptions/personagem.exception';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { CampanhaAccessService } from './campanha.access.service';
import {
  CampanhaMapper,
  PERSONAGEM_CAMPANHA_DETALHE_SELECT,
} from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
import { clamp, isUniqueConstraintViolation } from './engine/campanha.engine';

@Injectable()
export class CampanhaPersonagensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
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
            pvAtual: personagemBase.pvMaximo,
            peMax: personagemBase.peMaximo,
            peAtual: personagemBase.peMaximo,
            eaMax: personagemBase.eaMaximo,
            eaAtual: personagemBase.eaMaximo,
            sanMax: personagemBase.sanMaximo,
            sanAtual: personagemBase.sanMaximo,
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

      return personagemCriado.id;
    });

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
          : clamp(dto.pvAtual, 0, contexto.personagem.pvMax),
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
