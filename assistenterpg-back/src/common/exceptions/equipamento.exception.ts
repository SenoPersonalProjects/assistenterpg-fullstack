// src/common/exceptions/equipamento.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// EQUIPAMENTO - EXCEÇÕES
// ============================================================================

export class EquipamentoNaoEncontradoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Equipamento não encontrado',
      HttpStatus.NOT_FOUND,
      'EQUIPAMENTO_NOT_FOUND',
      { identificador },
    );
  }
}

export class EquipamentoCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Já existe um equipamento com o código ${codigo}`,
      'EQUIPAMENTO_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

export class EquipamentoEmUsoException extends BusinessException {
  constructor(
    equipamentoId: number,
    totalUsos: number,
    usosInventarioBase: number,
    usosInventarioCampanha: number,
  ) {
    super(
      `Não é possível deletar este equipamento pois ele está sendo usado em ${totalUsos} inventário(s)`,
      'EQUIPAMENTO_EM_USO',
      { equipamentoId, totalUsos, usosInventarioBase, usosInventarioCampanha },
    );
  }
}
