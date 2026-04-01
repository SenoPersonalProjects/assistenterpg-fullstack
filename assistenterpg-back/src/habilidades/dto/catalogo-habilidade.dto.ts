export class HabilidadeCatalogoDto {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: string;
  mecanicasEspeciais?: unknown;
}
