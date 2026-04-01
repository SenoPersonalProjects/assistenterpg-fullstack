// src/campanha/campanha.mapper.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calcularPvBarraMaximos,
  normalizarNucleosDisponiveis,
} from 'src/common/utils/pv-barras';

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
        nome: true,
        descricao: true,
        criadoEm: true,
        criadoPorId: true,
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
        limitePeEaPorTurno: personagem.limitePeEaPorTurno,
        prestigioGeral: personagem.prestigioGeral,
        prestigioCla: personagem.prestigioCla,
        deslocamento: personagem.deslocamento,
        esquiva: personagem.esquiva,
        bloqueio: personagem.bloqueio,
        turnosMorrendo: personagem.turnosMorrendo,
        turnosEnlouquecendo: personagem.turnosEnlouquecendo,
      },
      personagemBase: personagem.personagemBase,
      dono: personagem.dono,
      modificadoresAtivos: personagem.modificadores,
    };
  }
}
