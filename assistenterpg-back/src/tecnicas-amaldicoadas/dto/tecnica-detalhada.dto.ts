// src/tecnicas-amaldicoadas/dto/tecnica-detalhada.dto.ts

import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client'; // ✅ NOVO

export class ClaResumoDto {
  id: number;
  nome: string;
  grandeCla: boolean;
}

export class HabilidadeVariacaoDto {
  id: number;
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE?: number;
  custoEA?: number;
  custoSustentacaoEA?: number;
  custoSustentacaoPE?: number;
  execucao?: string;
  area?: string;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: string;
  dadosDano?: any;
  escalonaPorGrau?: boolean;
  escalonamentoCustoEA?: number;
  escalonamentoCustoPE?: number;
  escalonamentoTipo?: string;
  escalonamentoEfeito?: any;
  escalonamentoDano?: any;
  efeitoAdicional?: string;
  requisitos?: any;
  ordem: number;
}

export class HabilidadeTecnicaDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos?: any;
  execucao: string;
  area?: string;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  custoPE: number;
  custoEA: number;
  custoSustentacaoEA?: number;
  custoSustentacaoPE?: number;
  testesExigidos?: any;
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: string;
  dadosDano?: any;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo?: string;
  escalonamentoCustoEA: number;
  escalonamentoCustoPE: number;
  escalonamentoTipo?: string;
  escalonamentoEfeito?: any;
  escalonamentoDano?: any;
  efeito: string;
  ordem: number;
  variacoes?: HabilidadeVariacaoDto[];
}

export class TecnicaDetalhadaDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoTecnicaAmaldicoada;
  hereditaria: boolean;
  linkExterno?: string;

  // ✅ CORRIGIDO: origem → fonte
  fonte: TipoFonte;

  // ✅ NOVO: suplementoId
  suplementoId?: number;

  requisitos?: any;
  clasHereditarios?: ClaResumoDto[];
  habilidades?: HabilidadeTecnicaDto[];
  criadoEm: Date;
  atualizadoEm: Date;
}
