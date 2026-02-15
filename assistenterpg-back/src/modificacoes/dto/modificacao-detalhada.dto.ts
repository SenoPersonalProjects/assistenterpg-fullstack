// src/modificacoes/dto/modificacao-detalhada.dto.ts

import { TipoModificacao, TipoFonte } from '@prisma/client';
import { RestricoesModificacao } from '../types/restricoes.types';

export class ModificacaoDetalhadaDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: TipoModificacao;
  incrementoEspacos: number;

  // ✅ NOVO: Sistema de restrições
  restricoes: RestricoesModificacao | null;

  efeitosMecanicos: any | null;

  // ✅ NOVO: Fonte e suplemento
  fonte: TipoFonte;
  suplementoId: number | null;

  // ✅ OPCIONAL: Informações sobre uso
  equipamentosCompatíveis?: Array<{
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
  }>;

  quantidadeUsos?: {
    itensBase: number;
    itensCampanha: number;
    total: number;
  };
}
