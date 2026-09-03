// src/campanha/campanha.mapper.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calcularPvBarraMaximos,
  normalizarNucleosDisponiveis,
} from 'src/common/utils/pv-barras';
import {
  calcularBonusDtFeiticosNarrativo,
  calcularBonusPorAtributoNarrativos,
  calcularBonusPorResistenciaNarrativos,
  resolverGrausAprimoramentoEfetivosCampanha,
  resolverPericiasEfetivasCampanha,
} from './engine/campanha-modificadores-efetivos';

export const PERSONAGEM_CAMPANHA_DETALHE_SELECT =
  Prisma.validator<Prisma.PersonagemCampanhaSelect>()({
    id: true,
    campanhaId: true,
    personagemBaseId: true,
    donoId: true,
    nome: true,
    nivel: true,
    pvMax: true,
    pvAtual: true,
    pvBarrasTotal: true,
    pvBarrasRestantes: true,
    nucleoAmaldicoadoAtivo: true,
    nucleosDisponiveis: true,
    peMax: true,
    peAtual: true,
    eaMax: true,
    eaAtual: true,
    sanMax: true,
    sanAtual: true,
    limitePeEaPorTurno: true,
    prestigioGeral: true,
    prestigioCla: true,
    defesaBase: true,
    defesaEquipamento: true,
    defesaOutros: true,
    esquiva: true,
    bloqueio: true,
    deslocamento: true,
    turnosMorrendo: true,
    turnosEnlouquecendo: true,
    personagemBase: {
      select: {
        id: true,
        nome: true,
        agilidade: true,
        forca: true,
        intelecto: true,
        presenca: true,
        vigor: true,
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
    dono: {
      select: {
        id: true,
        apelido: true,
      },
    },
    modificadores: {
      where: {
        ativo: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      select: {
        id: true,
        campo: true,
        valor: true,
        periciaCodigo: true,
        tipoGrauCodigo: true,
        atributoCodigo: true,
        resistenciaTipoId: true,
        nome: true,
        descricao: true,
        criadoEm: true,
        criadoPorId: true,
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
    },
    resistencias: {
      select: {
        resistenciaTipoId: true,
        valor: true,
        resistenciaTipo: { select: { id: true, nome: true } },
      },
    },
  });

export type PersonagemCampanhaDetalhePayload =
  Prisma.PersonagemCampanhaGetPayload<{
    select: typeof PERSONAGEM_CAMPANHA_DETALHE_SELECT;
  }>;

@Injectable()
export class CampanhaMapper {
  mapearPersonagemCampanhaResposta(
    personagem: PersonagemCampanhaDetalhePayload,
  ) {
    const infoPv = calcularPvBarraMaximos(
      personagem.pvMax,
      personagem.pvBarrasTotal,
      personagem.pvBarrasRestantes,
    );
    const grausCampanha = personagem.grausAprimoramento ?? [];
    const grausBase = personagem.personagemBase.grausAprimoramento ?? [];
    const periciasBase = personagem.personagemBase.pericias ?? [];
    const modificadoresAtivos = personagem.modificadores ?? [];
    const grausPreferenciais = grausCampanha.length ? grausCampanha : grausBase;
    const periciasEfetivas = resolverPericiasEfetivasCampanha(
      periciasBase,
      modificadoresAtivos,
    );
    const grausAprimoramentoEfetivos =
      resolverGrausAprimoramentoEfetivosCampanha(
        grausPreferenciais,
        modificadoresAtivos,
      );
    const bonusAtributos = calcularBonusPorAtributoNarrativos(modificadoresAtivos);
    const bonusResistencias = calcularBonusPorResistenciaNarrativos(modificadoresAtivos);
    const atributoEfetivo = (codigo: string, valor: number | null | undefined) =>
      Math.max(0, Number(valor ?? 0) + (bonusAtributos.get(codigo) ?? 0));

    return {
      id: personagem.id,
      campanhaId: personagem.campanhaId,
      personagemBaseId: personagem.personagemBaseId,
      donoId: personagem.donoId,
      nome: personagem.nome,
      nivel: personagem.nivel,
      recursos: {
        pvAtual: personagem.pvAtual,
        pvMax: personagem.pvMax,
        pvBarrasTotal: personagem.pvBarrasTotal,
        pvBarrasRestantes: personagem.pvBarrasRestantes,
        pvBarraMaxAtual: infoPv.pvBarraMaxAtual,
        nucleoAtivo: personagem.nucleoAmaldicoadoAtivo ?? null,
        nucleosDisponiveis: normalizarNucleosDisponiveis(
          personagem.nucleosDisponiveis,
        ),
        peAtual: personagem.peAtual,
        peMax: personagem.peMax,
        eaAtual: personagem.eaAtual,
        eaMax: personagem.eaMax,
        sanAtual: personagem.sanAtual,
        sanMax: personagem.sanMax,
      },
      defesa: {
        base: personagem.defesaBase,
        equipamento: personagem.defesaEquipamento,
        outros: personagem.defesaOutros,
        total:
          personagem.defesaBase +
          personagem.defesaEquipamento +
          personagem.defesaOutros,
      },
      atributos: {
        agilidade: atributoEfetivo('AGILIDADE', personagem.personagemBase.agilidade),
        forca: atributoEfetivo('FORCA', personagem.personagemBase.forca),
        intelecto: atributoEfetivo('INTELECTO', personagem.personagemBase.intelecto),
        presenca: atributoEfetivo('PRESENCA', personagem.personagemBase.presenca),
        vigor: atributoEfetivo('VIGOR', personagem.personagemBase.vigor),
        limitePeEaPorTurno: personagem.limitePeEaPorTurno,
        prestigioGeral: personagem.prestigioGeral,
        prestigioCla: personagem.prestigioCla,
        deslocamento: personagem.deslocamento,
        esquiva: personagem.esquiva,
        bloqueio: personagem.bloqueio,
        turnosMorrendo: personagem.turnosMorrendo,
        turnosEnlouquecendo: personagem.turnosEnlouquecendo,
      },
      personagemBase: {
        id: personagem.personagemBase.id,
        nome: personagem.personagemBase.nome,
      },
      dono: personagem.dono,
      modificadoresAtivos: personagem.modificadores,
      pericias: periciasEfetivas,
      grausAprimoramento: grausAprimoramentoEfetivos,
      resistencias: (personagem.resistencias ?? []).map((resistencia) => ({
        ...resistencia,
        valorEfetivo: resistencia.valor + (bonusResistencias.get(resistencia.resistenciaTipoId) ?? 0),
      })),
      bonusDtFeiticos: calcularBonusDtFeiticosNarrativo(modificadoresAtivos),
    };
  }
}
