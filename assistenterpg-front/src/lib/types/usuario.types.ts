// lib/types/usuario.types.ts
/**
 * Types relacionados a usuário, preferências e estatísticas
 */

export type EstatisticasUsuario = {
  campanhas: number;
  personagens: number;
  artigosLidos: number;
};

export type PreferenciasUsuario = {
  id: number;
  usuarioId: number;
  notificacoesEmail: boolean;
  notificacoesPush: boolean;
  notificacoesConvites: boolean;
  notificacoesAtualizacoes: boolean;
  idioma: string;
};

export type AtualizarPreferenciasPayload = {
  notificacoesEmail?: boolean;
  notificacoesPush?: boolean;
  notificacoesConvites?: boolean;
  notificacoesAtualizacoes?: boolean;
  idioma?: string;
};

export type AlterarSenhaResponse = {
  mensagem: string;
};

export type DadosExportados = {
  exportadoEm: string;
  usuario: {
    id: number;
    apelido: string;
    email: string;
    criadoEm: string;
  };
  personagens: Array<Record<string, unknown>>;
  campanhas: Array<Record<string, unknown>>;
  preferencias: PreferenciasUsuario | null;
};

export type ExcluirContaResponse = {
  mensagem: string;
};
