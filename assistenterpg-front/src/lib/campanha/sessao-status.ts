import type { CondicaoAtivaSessaoCampanha } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

type RecursosStatus = {
  pvAtual: number;
  pvMax: number;
  sanAtual: number;
  sanMax: number;
};

type OpcoesStatus = {
  indisponivelQuandoSemRecurso?: boolean;
};

function normalizarStatusTexto(valor: string): string {
  return textoSeguro(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function encontrarCondicaoPorChaveOuNome(
  condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  chave: string,
  termos: string[] = [],
): CondicaoAtivaSessaoCampanha | null {
  const condicaoAutomatica = condicoesAtivas.find(
    (condicao) => condicao.chaveAutomacao === chave,
  );
  if (condicaoAutomatica) return condicaoAutomatica;
  if (termos.length === 0) return null;
  return (
    condicoesAtivas.find((condicao) => {
      const nome = normalizarStatusTexto(condicao.nome);
      return termos.some((termo) => nome.includes(termo));
    }) ?? null
  );
}

export function resolverStatusFisico(
  recursos: RecursosStatus | null,
  condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  limiteMorrendo?: number | null,
  opcoes: OpcoesStatus = {},
): string | null {
  const condicaoMorta = encontrarCondicaoPorChaveOuNome(condicoesAtivas, 'MORTO', [
    'morto',
  ]);
  const condicaoMorrendo = encontrarCondicaoPorChaveOuNome(
    condicoesAtivas,
    'MORRENDO',
    ['morrendo'],
  );
  const condicaoMachucado = encontrarCondicaoPorChaveOuNome(
    condicoesAtivas,
    'MACHUCADO',
    ['machucado'],
  );

  if (condicaoMorta) {
    return 'Morto';
  }

  if (condicaoMorrendo) {
    if (
      typeof limiteMorrendo === 'number' &&
      condicaoMorrendo.contadorTurnos > limiteMorrendo
    ) {
      return 'Morto';
    }
    return 'Morrendo';
  }

  if (!recursos) {
    return opcoes.indisponivelQuandoSemRecurso ? 'Indisponivel' : null;
  }

  if (recursos.pvAtual <= 0) {
    return 'Morrendo';
  }

  if (condicaoMachucado) {
    return 'Machucado';
  }

  if (recursos.pvMax > 0 && recursos.pvAtual <= recursos.pvMax / 2) {
    return 'Machucado';
  }

  return 'Vivo';
}

export function resolverStatusMental(
  recursos: RecursosStatus | null,
  condicoesAtivas: CondicaoAtivaSessaoCampanha[],
  limiteEnlouquecendo?: number | null,
  opcoes: OpcoesStatus = {},
): string | null {
  const condicaoLouca = encontrarCondicaoPorChaveOuNome(condicoesAtivas, 'INSANO', [
    'louco',
    'insano',
    'insanidade',
    'loucura permanente',
  ]);
  const condicaoEnlouquecendo = encontrarCondicaoPorChaveOuNome(
    condicoesAtivas,
    'ENLOUQUECENDO',
    ['enlouquecendo'],
  );

  if (condicaoLouca) {
    return 'Louco';
  }

  if (condicaoEnlouquecendo) {
    if (
      typeof limiteEnlouquecendo === 'number' &&
      condicaoEnlouquecendo.contadorTurnos > limiteEnlouquecendo
    ) {
      return 'Louco';
    }
    return 'Enlouquecendo';
  }

  if (!recursos) {
    return opcoes.indisponivelQuandoSemRecurso ? 'Indisponivel' : null;
  }

  if (recursos.sanAtual <= 0) {
    return 'Enlouquecendo';
  }

  if (recursos.sanMax > 0 && recursos.sanAtual <= recursos.sanMax / 2) {
    return 'Ruim';
  }

  return 'Bom';
}
