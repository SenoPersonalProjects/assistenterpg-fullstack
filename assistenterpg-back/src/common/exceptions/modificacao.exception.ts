// src/common/exceptions/modificacao.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// MODIFICAÇÃO - EXCEÇÕES
// ============================================================================

export class ModificacaoNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Modificação não encontrada',
      HttpStatus.NOT_FOUND,
      'MODIFICACAO_NOT_FOUND',
      { identificador },
    );
  }
}

export class ModificacaoCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Modificação com código "${codigo}" já existe`,
      'MODIFICACAO_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

// ✅ CORRIGIDO: Removido o espaço no nome da classe
export class ModificacaoSuplementoNaoEncontradoException extends BaseException {
  constructor(suplementoId: number) {
    super(
      `Suplemento com ID ${suplementoId} não encontrado`,
      HttpStatus.NOT_FOUND,
      'MODIFICACAO_SUPLEMENTO_NOT_FOUND',
      { suplementoId },
    );
  }
}

export class ModificacaoFonteInvalidaException extends BusinessException {
  constructor() {
    super(
      'Ao fornecer suplementoId, fonte deve ser SUPLEMENTO',
      'MODIFICACAO_FONTE_INVALIDA',
    );
  }
}

export class ModificacaoEquipamentosInvalidosException extends BaseException {
  constructor(idsInvalidos?: number[]) {
    super(
      'Um ou mais equipamentos fornecidos não existem',
      HttpStatus.NOT_FOUND,
      'MODIFICACAO_EQUIPAMENTOS_INVALIDOS',
      { idsInvalidos },
    );
  }
}

export class ModificacaoEmUsoException extends BusinessException {
  constructor(
    modificacaoId: number,
    totalUsos: number,
    detalhesUso: {
      itensBase: number;
      itensCampanha: number;
    },
  ) {
    super(
      `Modificação está sendo usada em ${totalUsos} item(ns) de inventário. Remova as referências primeiro.`,
      'MODIFICACAO_EM_USO',
      { modificacaoId, totalUsos, detalhesUso },
    );
  }
}

export class ModificacaoEquipamentoNaoEncontradoException extends BaseException {
  constructor(equipamentoId: number) {
    super(
      'Equipamento não encontrado',
      HttpStatus.NOT_FOUND,
      'MODIFICACAO_EQUIPAMENTO_NOT_FOUND',
      { equipamentoId },
    );
  }
}
