// src/inventario/utils/inventario-capacidade.ts

export function calcularEspacosInventarioBase(atributoBase: number): number {
  if (!Number.isFinite(atributoBase) || atributoBase <= 0) return 2;
  return atributoBase * 5;
}

export function calcularAtributoBaseInventario(params: {
  forca: number;
  intelecto?: number;
  somarIntelecto?: boolean;
}): number {
  const intelecto = params.somarIntelecto ? (params.intelecto ?? 0) : 0;
  return params.forca + intelecto;
}
