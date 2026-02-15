// src/common/exceptions/compendio.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';

// ============================================================================
// COMPÊNDIO - CATEGORIAS
// ============================================================================

export class CompendioCategoriaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Categoria não encontrada',
      HttpStatus.NOT_FOUND,
      'COMPENDIO_CATEGORIA_NOT_FOUND',
      { identificador },
    );
  }
}

export class CompendioCategoriaDuplicadaException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Categoria com código "${codigo}" já existe`,
      'COMPENDIO_CATEGORIA_DUPLICADA',
      { codigo },
    );
  }
}

export class CompendioCategoriaComSubcategoriasException extends BusinessException {
  constructor(categoriaId: number, quantidadeSubcategorias: number) {
    super(
      'Não é possível remover categoria com subcategorias',
      'COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS',
      { categoriaId, quantidadeSubcategorias },
    );
  }
}

// ============================================================================
// COMPÊNDIO - SUBCATEGORIAS
// ============================================================================

export class CompendioSubcategoriaException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Subcategoria não encontrada',
      HttpStatus.NOT_FOUND,
      'COMPENDIO_SUBCATEGORIA_NOT_FOUND',
      { identificador },
    );
  }
}

export class CompendioSubcategoriaDuplicadaException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Subcategoria com código "${codigo}" já existe`,
      'COMPENDIO_SUBCATEGORIA_DUPLICADA',
      { codigo },
    );
  }
}

export class CompendioSubcategoriaComArtigosException extends BusinessException {
  constructor(subcategoriaId: number, quantidadeArtigos: number) {
    super(
      'Não é possível remover subcategoria com artigos',
      'COMPENDIO_SUBCATEGORIA_COM_ARTIGOS',
      { subcategoriaId, quantidadeArtigos },
    );
  }
}

// ============================================================================
// COMPÊNDIO - ARTIGOS
// ============================================================================

export class CompendioArtigoException extends BaseException {
  constructor(identificador?: string | number) {
    super(
      'Artigo não encontrado',
      HttpStatus.NOT_FOUND,
      'COMPENDIO_ARTIGO_NOT_FOUND',
      { identificador },
    );
  }
}

export class CompendioArtigoDuplicadoException extends BusinessException {
  constructor(codigo: string) {
    super(
      `Artigo com código "${codigo}" já existe`,
      'COMPENDIO_ARTIGO_DUPLICADO',
      { codigo },
    );
  }
}

// ============================================================================
// COMPÊNDIO - BUSCA
// ============================================================================

export class CompendioBuscaInvalidaException extends ValidationException {
  constructor(tamanhoMinimo: number, tamanhoRecebido: number) {
    super(
      `A busca deve ter pelo menos ${tamanhoMinimo} caracteres`,
      'query',
      { tamanhoMinimo, tamanhoRecebido },
      'COMPENDIO_BUSCA_INVALIDA',
    );
  }
}
