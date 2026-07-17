import type { VisibilidadeRolagemSessao } from '@/lib/api';

export type TipoAcaoMacroPersonalizada = 'ATAQUE' | 'DANO' | 'CRITICO' | 'FORMULA';

export type SolicitacaoRolagemMacroPersonalizada = {
  acao: TipoAcaoMacroPersonalizada;
  personagemSessaoId: number;
  macroId: number;
  ajusteFlatSessao?: number;
  ajusteDadosSessao?: number;
  dt?: number;
};

const TIPO_POR_ACAO = {
  ATAQUE: 'ATAQUE_MACRO_PERSONAGEM',
  DANO: 'DANO_MACRO_PERSONAGEM',
  CRITICO: 'CRITICO_MACRO_PERSONAGEM',
  FORMULA: 'FORMULA_MACRO_PERSONAGEM',
} as const;

export function montarIntencaoRolagemMacroPersonalizada(
  solicitacao: SolicitacaoRolagemMacroPersonalizada,
  visibilidade: VisibilidadeRolagemSessao,
  clientRequestId: string,
) {
  if (!Number.isInteger(solicitacao.personagemSessaoId) || solicitacao.personagemSessaoId < 1) {
    throw new Error('Personagem da macro inválido.');
  }
  if (!Number.isInteger(solicitacao.macroId) || solicitacao.macroId < 1) {
    throw new Error('Macro personalizada inválida.');
  }
  const ajusteFlatSessao = Math.trunc(solicitacao.ajusteFlatSessao ?? 0);
  const ajusteDadosSessao = Math.trunc(solicitacao.ajusteDadosSessao ?? 0);
  if (Math.abs(ajusteFlatSessao) > 100 || Math.abs(ajusteDadosSessao) > 10) {
    throw new Error('Ajustes da macro fora dos limites permitidos.');
  }

  const tipo = TIPO_POR_ACAO[solicitacao.acao];
  return {
    tipo,
    personagemSessaoId: solicitacao.personagemSessaoId,
    macroId: solicitacao.macroId,
    ...(tipo !== 'FORMULA_MACRO_PERSONAGEM' && ajusteFlatSessao ? { ajusteFlatSessao } : {}),
    ...(tipo === 'ATAQUE_MACRO_PERSONAGEM' && ajusteDadosSessao ? { ajusteDadosSessao } : {}),
    ...(tipo === 'ATAQUE_MACRO_PERSONAGEM' && solicitacao.dt !== undefined
      ? { contexto: { dt: solicitacao.dt } }
      : {}),
    visibilidade,
    clientRequestId,
  };
}
