export type JsonImportGuideField = {
  path: string;
  type: string;
  required: boolean;
  description: string;
  reference?: string;
};

export type JsonImportGuideReferenceRow = {
  id?: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  extra?: Record<string, unknown>;
};

export type JsonImportGuideReference = {
  key: string;
  title: string;
  description?: string;
  columns: string[];
  rows: JsonImportGuideReferenceRow[];
};

export type JsonImportGuide = {
  schema: string;
  schemaVersion: number;
  descricao: string;
  regras: string[];
  exportTypes: string[];
  campos: JsonImportGuideField[];
  exemplos: {
    minimo: unknown;
    completo: unknown;
  };
  referencias: JsonImportGuideReference[];
  camposObrigatorios?: Record<string, string[]>;
};
