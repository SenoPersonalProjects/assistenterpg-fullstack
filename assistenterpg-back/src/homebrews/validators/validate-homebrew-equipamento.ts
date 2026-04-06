// src/homebrews/validators/validate-homebrew-equipamento.ts

import { TipoAmaldicoado, TipoEquipamento } from '@prisma/client';
import {
  ValorForaDoIntervaloException,
  ValidationException,
} from '../../common/exceptions/validation.exception';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validarFerramentaAmaldicoada(dados: Record<string, unknown>): void {
  const tipoAmaldicoado = dados.tipoAmaldicoado;

  const temArma = isRecord(dados.armaAmaldicoada);
  const temProtecao = isRecord(dados.protecaoAmaldicoada);
  const temArtefato = isRecord(dados.artefatoAmaldicoado);

  if (!temArma && !temProtecao && !temArtefato) {
    throw new ValidationException(
      'Ferramenta amaldiçoada deve ter arma, protecao ou artefato configurado',
      'tipoAmaldicoado',
      {
        camposEsperados: [
          'armaAmaldicoada',
          'protecaoAmaldicoada',
          'artefatoAmaldicoado',
        ],
      },
      'MISSING_AMALDICOADO_PAYLOAD',
    );
  }

  if (tipoAmaldicoado === TipoAmaldicoado.ITEM) {
    throw new ValidationException(
      'Ferramenta amaldiçoada nao suporta tipo ITEM',
      'tipoAmaldicoado',
      {
        tipoRecebido: tipoAmaldicoado,
        tiposValidos: [
          TipoAmaldicoado.ARMA,
          TipoAmaldicoado.PROTECAO,
          TipoAmaldicoado.ARTEFATO,
        ],
      },
      'INVALID_AMALDICOADO_TYPE',
    );
  }

  if (tipoAmaldicoado === TipoAmaldicoado.ARMA && !temArma) {
    throw new ValidationException(
      'tipoAmaldicoado=ARMA exige campo armaAmaldicoada',
      'armaAmaldicoada',
      { tipoAmaldicoado },
      'MISSING_AMALDICOADO_SUBTYPE_DATA',
    );
  }

  if (tipoAmaldicoado === TipoAmaldicoado.PROTECAO && !temProtecao) {
    throw new ValidationException(
      'tipoAmaldicoado=PROTECAO exige campo protecaoAmaldicoada',
      'protecaoAmaldicoada',
      { tipoAmaldicoado },
      'MISSING_AMALDICOADO_SUBTYPE_DATA',
    );
  }

  if (tipoAmaldicoado === TipoAmaldicoado.ARTEFATO && !temArtefato) {
    throw new ValidationException(
      'tipoAmaldicoado=ARTEFATO exige campo artefatoAmaldicoado',
      'artefatoAmaldicoado',
      { tipoAmaldicoado },
      'MISSING_AMALDICOADO_SUBTYPE_DATA',
    );
  }
}

function validarItemAmaldicoado(dados: Record<string, unknown>): void {
  const tipoAmaldicoado = dados.tipoAmaldicoado;

  if (
    tipoAmaldicoado !== undefined &&
    tipoAmaldicoado !== TipoAmaldicoado.ITEM
  ) {
    throw new ValidationException(
      'Item amaldiçoado aceita apenas tipoAmaldicoado=ITEM',
      'tipoAmaldicoado',
      { tipoRecebido: tipoAmaldicoado, tipoEsperado: TipoAmaldicoado.ITEM },
      'INVALID_AMALDICOADO_TYPE',
    );
  }
}

/**
 * Validacoes customizadas para Equipamentos
 * (alem das validacoes do DTO)
 */
export function validateHomebrewEquipamentoCustom(dados: unknown): void {
  if (!isRecord(dados)) return;

  if (dados.categoria !== undefined && dados.categoria !== null) {
    const categoriasValidas = [
      'CATEGORIA_0',
      'CATEGORIA_1',
      'CATEGORIA_2',
      'CATEGORIA_3',
      'CATEGORIA_4',
      'ESPECIAL',
    ];

    const categoria = dados.categoria;
    if (
      typeof categoria !== 'string' ||
      !categoriasValidas.includes(categoria)
    ) {
      const categoriaTexto =
        typeof categoria === 'string' ? categoria : '<invalida>';
      throw new ValidationException(
        `Categoria invalida: "${categoriaTexto}"`,
        'categoria',
        { categoriasValidas },
        'INVALID_CATEGORY',
      );
    }
  }

  if (dados.espacos !== undefined) {
    const espacos = dados.espacos;
    if (typeof espacos !== 'number' || espacos < 0 || espacos > 10) {
      throw new ValorForaDoIntervaloException(
        'espacos',
        0,
        10,
        Number(espacos),
      );
    }
  }

  if (dados.tipo === TipoEquipamento.FERRAMENTA_AMALDICOADA) {
    validarFerramentaAmaldicoada(dados);
  }

  if (dados.tipo === TipoEquipamento.ITEM_AMALDICOADO) {
    validarItemAmaldicoado(dados);
  }
}
