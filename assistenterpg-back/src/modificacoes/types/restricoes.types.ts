// src/modificacoes/types/restricoes.types.ts

import {
  TipoEquipamento,
  TipoProtecao,
  TipoArma,
  SubtipoArmaDistancia,
  ProficienciaArma,
  ProficienciaProtecao,
  AlcanceArma,
  EmpunhaduraArma,
  ComplexidadeMaldicao,
} from '@prisma/client';

export interface RestricoesModificacao {
  // ===== RESTRIÇÕES DE TIPO DE EQUIPAMENTO =====
  tiposEquipamento?: TipoEquipamento[];

  // ===== RESTRIÇÕES DE CATEGORIA =====
  categoriaMinima?: number; // Ex: 2 (aceita 2, 1, ESPECIAL)
  categoriaMaxima?: number; // Ex: 2 (aceita 4, 3, 2)

  // ===== RESTRIÇÕES DE SUBTIPOS =====
  tiposProtecao?: TipoProtecao[];
  tiposArma?: TipoArma[];
  subtiposArmaDistancia?: SubtipoArmaDistancia[];

  // ===== RESTRIÇÕES DE PROFICIÊNCIA =====
  proficienciasArma?: ProficienciaArma[];
  proficienciasProtecao?: ProficienciaProtecao[];

  // ===== RESTRIÇÕES DE AMALDIÇOADOS =====
  apenasAmaldicoados?: boolean;
  apenasMundanos?: boolean; // Exclusivo para não-amaldiçoados
  complexidadeMinima?: ComplexidadeMaldicao;
  complexidadeMaxima?: ComplexidadeMaldicao;

  // ===== RESTRIÇÕES DE OUTRAS MODIFICAÇÕES =====
  codigosIncompativeis?: string[]; // Códigos de modificações incompatíveis
  codigosRequeridos?: string[]; // Códigos de modificações necessárias
  limiteMaximoGlobal?: number; // Ex: 1 = só pode ter 1 dessa modificação no item

  // ===== RESTRIÇÕES DE ATRIBUTOS DO EQUIPAMENTO =====
  alcancesPermitidos?: AlcanceArma[];
  empunhadurasPermitidas?: EmpunhaduraArma[];

  // ===== RESTRIÇÕES ESPECÍFICAS =====
  excluiEscudos?: boolean; // Flag para excluir escudos explicitamente

  // ===== RESTRIÇÕES CUSTOMIZADAS =====
  outros?: {
    requereEmpunhadura?: boolean;
    apenasMunicao?: boolean;
    apenasExplosivos?: boolean;
    proficienciaProtecao?: string; // Referência textual (não validada)
    [key: string]: any;
  };
}

/**
 * Resultado da validação de restrições
 */
export interface ResultadoValidacaoRestricoes {
  valido: boolean;
  erros: string[];
}
