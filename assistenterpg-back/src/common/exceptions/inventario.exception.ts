// src/common/exceptions/inventario.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// INVENTÁRIO - EXCEÇÕES GERAIS
// ============================================================================

export class InventarioPersonagemNaoEncontradoException extends BaseException {
  constructor(personagemBaseId: number) {
    super(
      'Personagem não encontrado',
      HttpStatus.NOT_FOUND,
      'INVENTARIO_PERSONAGEM_NOT_FOUND',
      { personagemBaseId },
    );
  }
}

export class InventarioSemPermissaoException extends BaseException {
  constructor(personagemBaseId: number, usuarioId: number) {
    super(
      'Você não tem permissão para acessar este personagem',
      HttpStatus.FORBIDDEN,
      'INVENTARIO_SEM_PERMISSAO',
      { personagemBaseId, usuarioId },
    );
  }
}

// ============================================================================
// INVENTÁRIO - ITENS
// ============================================================================

export class InventarioItemNaoEncontradoException extends BaseException {
  constructor(itemId: number) {
    super(
      'Item não encontrado',
      HttpStatus.NOT_FOUND,
      'INVENTARIO_ITEM_NOT_FOUND',
      { itemId },
    );
  }
}

export class InventarioEquipamentoNaoEncontradoException extends BaseException {
  constructor(equipamentoId: number) {
    super(
      'Equipamento não encontrado',
      HttpStatus.NOT_FOUND,
      'INVENTARIO_EQUIPAMENTO_NOT_FOUND',
      { equipamentoId },
    );
  }
}

// ============================================================================
// INVENTÁRIO - LIMITES E CAPACIDADE
// ============================================================================

export class InventarioLimiteVestirExcedidoException extends BusinessException {
  constructor(detalhes: {
    erros: string[];
    totalVestiveis: number;
    totalVestimentas: number;
    limiteVestiveis: number;
    limiteVestimentas: number;
  }) {
    super(
      'Limites de itens vestidos excedidos',
      'INVENTARIO_LIMITE_VESTIR_EXCEDIDO',
      detalhes,
    );
  }
}

export class InventarioCapacidadeExcedidaException extends BusinessException {
  constructor(detalhes: {
    espacosOcupados: number;
    espacosAdicionais: number;
    espacosAposAdicao: number;
    capacidadeNormal: number;
    limiteMaximo: number;
    excedente: number;
  }) {
    super(
      'Limite máximo de capacidade excedido',
      'INVENTARIO_CAPACIDADE_EXCEDIDA',
      detalhes,
    );
  }
}

export class InventarioEspacosInsuficientesException extends BusinessException {
  constructor(espacosNecessarios: number, espacosDisponiveis: number) {
    super(
      `Nova quantidade requer ${espacosNecessarios} espaços, mas você tem apenas ${espacosDisponiveis} disponíveis`,
      'INVENTARIO_ESPACOS_INSUFICIENTES',
      { espacosNecessarios, espacosDisponiveis },
    );
  }
}

export class InventarioGrauXamaExcedidoException extends BusinessException {
  constructor(grauAtual: string, erros: string[]) {
    super(
      'Limites de Grau Xamã excedidos',
      'INVENTARIO_GRAU_XAMA_EXCEDIDO',
      { grauAtual, erros },
    );
  }
}

// ============================================================================
// INVENTÁRIO - MODIFICAÇÕES
// ============================================================================

export class InventarioModificacaoNaoEncontradaException extends BaseException {
  constructor(modificacaoId: number) {
    super(
      'Modificação não encontrada',
      HttpStatus.NOT_FOUND,
      'INVENTARIO_MODIFICACAO_NOT_FOUND',
      { modificacaoId },
    );
  }
}

export class InventarioModificacaoInvalidaException extends BusinessException {
  constructor(modificacoesInvalidas: number[]) {
    super(
      'Uma ou mais modificações não existem',
      'INVENTARIO_MODIFICACAO_INVALIDA',
      { modificacoesInvalidas },
    );
  }
}

export class InventarioModificacaoIncompativelException extends BusinessException {
  constructor(modificacaoId: number, equipamentoId: number) {
    super(
      `Modificação ID ${modificacaoId} não é compatível com este equipamento`,
      'INVENTARIO_MODIFICACAO_INCOMPATIVEL',
      { modificacaoId, equipamentoId },
    );
  }
}

export class InventarioModificacaoDuplicadaException extends BusinessException {
  constructor(modificacaoId: number, itemId: number) {
    super(
      'Este item já possui essa modificação',
      'INVENTARIO_MODIFICACAO_DUPLICADA',
      { modificacaoId, itemId },
    );
  }
}

export class InventarioModificacaoNaoAplicadaException extends BusinessException {
  constructor(modificacaoId: number, itemId: number) {
    super(
      'Este item não possui essa modificação',
      'INVENTARIO_MODIFICACAO_NAO_APLICADA',
      { modificacaoId, itemId },
    );
  }
}
