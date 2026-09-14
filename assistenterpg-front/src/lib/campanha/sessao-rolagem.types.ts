/**
 * Contratos de intenção de rolagem compartilhados entre a camada de sessão e
 * os componentes. Não dependem da árvore visual para que HTTP e realtime usem
 * a mesma semântica.
 */
export type AlvoRolagemSessao = 'PERSONAGEM' | 'NPC';
export type TipoRolagemSessao = 'PERICIA' | 'ATAQUE';
export type ModoRetencaoDadosSessao = 'SUM' | 'HIGHEST' | 'LOWEST';

export type RolagemPericiaSessaoPayload = {
  alvoTipo: AlvoRolagemSessao;
  tipoRolagem?: TipoRolagemSessao;
  alvoNome: string;
  personagemSessaoId?: number;
  personagemCampanhaId?: number;
  npcSessaoId?: number;
  periciaCodigo?: string;
  periciaNome: string;
  atributoBase?: string | null;
  dados: number;
  bonus: number;
  keepMode: ModoRetencaoDadosSessao;
};
