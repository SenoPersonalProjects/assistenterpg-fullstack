export type TipoAcaoMacroArma = 'ATAQUE' | 'DANO' | 'CRITICO';

type VisibilidadeRolagem = 'PUBLICA' | 'SECRETA_MESTRE';

export type IntencaoRolagemMacroArma =
  | {
      tipo: 'ATAQUE_ITEM_PERSONAGEM';
      personagemSessaoId: number;
      itemInventarioCampanhaId: number;
      atributoEscolhido?: 'FOR' | 'AGI';
      ajusteFlatManual?: number;
      ajusteDadosManual?: number;
      visibilidade: VisibilidadeRolagem;
      clientRequestId: string;
    }
  | {
      tipo: 'DANO_ITEM_PERSONAGEM' | 'CRITICO_ITEM_PERSONAGEM';
      personagemSessaoId: number;
      itemInventarioCampanhaId: number;
      empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';
      ajusteFlatManual?: number;
      visibilidade: VisibilidadeRolagem;
      clientRequestId: string;
    };

export function montarIntencaoRolagemMacroArma(
  input: {
    acao: TipoAcaoMacroArma;
    personagemSessaoId: number;
    itemInventarioCampanhaId: number;
    atributoEscolhido?: 'FOR' | 'AGI';
    empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';
    ajusteFlatManual: number;
    ajusteDadosManual: number;
  },
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
): IntencaoRolagemMacroArma {
  if (
    !Number.isInteger(input.personagemSessaoId) ||
    input.personagemSessaoId <= 0 ||
    !Number.isInteger(input.itemInventarioCampanhaId) ||
    input.itemInventarioCampanhaId <= 0
  ) {
    throw new Error('Personagem ou arma invalidos para a macro.');
  }
  const ajusteFlatManual = Math.max(-100, Math.min(100, Math.trunc(input.ajusteFlatManual)));
  if (input.acao === 'ATAQUE') {
    return {
      tipo: 'ATAQUE_ITEM_PERSONAGEM',
      personagemSessaoId: input.personagemSessaoId,
      itemInventarioCampanhaId: input.itemInventarioCampanhaId,
      ...(input.atributoEscolhido ? { atributoEscolhido: input.atributoEscolhido } : {}),
      ...(ajusteFlatManual ? { ajusteFlatManual } : {}),
      ...(input.ajusteDadosManual
        ? { ajusteDadosManual: Math.max(-10, Math.min(10, Math.trunc(input.ajusteDadosManual))) }
        : {}),
      visibilidade,
      clientRequestId,
    };
  }
  return {
    tipo: input.acao === 'CRITICO' ? 'CRITICO_ITEM_PERSONAGEM' : 'DANO_ITEM_PERSONAGEM',
    personagemSessaoId: input.personagemSessaoId,
    itemInventarioCampanhaId: input.itemInventarioCampanhaId,
    ...(input.empunhadura ? { empunhadura: input.empunhadura } : {}),
    ...(ajusteFlatManual ? { ajusteFlatManual } : {}),
    visibilidade,
    clientRequestId,
  };
}
