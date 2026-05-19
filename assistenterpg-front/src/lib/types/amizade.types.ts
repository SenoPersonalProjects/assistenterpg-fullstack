export type AmigoResumo = {
  amizadeId: number;
  id: number;
  apelido: string;
  online: boolean;
  desde: string;
};

export type UsuarioAmizadeResumo = {
  id: number;
  apelido: string;
};

export type SolicitacaoAmizadeResumo = {
  id: number;
  usuario: UsuarioAmizadeResumo;
  status: 'PENDENTE' | string;
  criadoEm: string;
};

export type SolicitacoesAmizade = {
  recebidas: SolicitacaoAmizadeResumo[];
  enviadas: SolicitacaoAmizadeResumo[];
};

export type AmigoConvidavelCampanha = {
  id: number;
  apelido: string;
  online: boolean;
  jaMembro: boolean;
  convitePendente: boolean;
};
