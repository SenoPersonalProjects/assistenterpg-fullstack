// lib/types/campanha.types.ts
/**
 * Types relacionados a campanhas e convites
 */

export type CampanhaResumo = {
  id: number;
  nome: string;
  descricao: string | null;
  status: string;
  criadoEm: string;
  dono: { id: number; apelido: string };
  _count: { membros: number; personagens: number; sessoes: number };
};

export type ConviteCampanha = {
  id: number;
  campanhaId: number;
  email: string;
  codigo: string;
  status: string;
  criadoEm: string;
  respondidoEm: string | null;
  campanha?: {
    id: number;
    nome: string;
    dono?: { apelido: string };
  };
};
