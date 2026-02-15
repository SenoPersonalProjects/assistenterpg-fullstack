// src/common/exceptions/tecnica-amaldicoada.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';

// ============================================================================
// TÉCNICA AMALDIÇOADA - EXCEÇÕES
// ============================================================================

export class TecnicaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Técnica amaldiçoada não encontrada',
      HttpStatus.NOT_FOUND,
      'TECNICA_NOT_FOUND',
      { identificador },
    );
  }
}

export class TecnicaCodigoOuNomeDuplicadoException extends BusinessException {
  constructor(codigo: string, nome: string) {
    super(
      `Técnica com código "${codigo}" ou nome "${nome}" já existe`,
      'TECNICA_CODIGO_OU_NOME_DUPLICADO',
      { codigo, nome },
    );
  }
}

export class TecnicaNaoInataHereditariaException extends BusinessException {
  constructor(tipo: string) {
    super(
      'Apenas técnicas INATAS podem ser hereditárias',
      'TECNICA_NAO_INATA_HEREDITARIA',
      { tipoAtual: tipo },
    );
  }
}

export class TecnicaHereditariaSemClaException extends BusinessException {
  constructor(tecnicaId?: number) {
    super(
      'Técnicas hereditárias devem ter pelo menos um clã',
      'TECNICA_HEREDITARIA_SEM_CLA',
      { tecnicaId },
    );
  }
}

export class TecnicaSuplementoNaoEncontradoException extends BaseException {
  constructor(suplementoId: number) {
    super(
      `Suplemento com ID ${suplementoId} não encontrado`,
      HttpStatus.NOT_FOUND,
      'TECNICA_SUPLEMENTO_NOT_FOUND',
      { suplementoId },
    );
  }
}

export class TecnicaEmUsoException extends BusinessException {
  constructor(
    tecnicaId: number,
    totalUsos: number,
    detalhesUso: {
      personagensBaseComInata: number;
      personagensCampanhaComInata: number;
      personagensBaseAprendeu: number;
      personagensCampanhaAprendeu: number;
    },
  ) {
    super(
      `Técnica está em uso por ${totalUsos} personagem(ns) e não pode ser deletada`,
      'TECNICA_EM_USO',
      { tecnicaId, totalUsos, detalhesUso },
    );
  }
}

export class TecnicaClaNaoEncontradoException extends BaseException {
  constructor(claNome: string) {
    super(
      `Clã "${claNome}" não encontrado`,
      HttpStatus.NOT_FOUND,
      'TECNICA_CLA_NOT_FOUND',
      { claNome },
    );
  }
}

// ============================================================================
// HABILIDADE TÉCNICA - EXCEÇÕES
// ============================================================================

export class HabilidadeTecnicaNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Habilidade de técnica não encontrada',
      HttpStatus.NOT_FOUND,
      'HABILIDADE_TECNICA_NOT_FOUND',
      { identificador },
    );
  }
}

export class HabilidadeCodigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Habilidade com código "${codigo}" já existe`,
      'HABILIDADE_CODIGO_DUPLICADO',
      { codigo },
    );
  }
}

// ============================================================================
// VARIAÇÃO HABILIDADE - EXCEÇÕES
// ============================================================================

export class VariacaoHabilidadeNaoEncontradaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Variação de habilidade não encontrada',
      HttpStatus.NOT_FOUND,
      'VARIACAO_HABILIDADE_NOT_FOUND',
      { identificador },
    );
  }
}
