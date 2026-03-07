// src/classes/dto/catalogo-classe.dto.ts
import { HabilidadeCatalogoDto } from 'src/habilidades/dto/catalogo-habilidade.dto';

export class ClassePericiaCatalogoDto {
  id: number;
  tipo: string; // 'FIXA' | 'ESCOLHA'
  grupoEscolha: number | null;
  pericia: {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
  };
}

export class ClasseProficienciaCatalogoDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  categoria: string;
  subtipo: string | null;
}

export class ClasseCatalogoDto {
  id: number;
  nome: string;
  descricao: string | null;
  fonte: string;
  suplementoId: number | null;
  periciasLivresBase: number;
  pericias: ClassePericiaCatalogoDto[];
  proficiencias: ClasseProficienciaCatalogoDto[];

  // ✅ NOVO: habilidades concedidas no nível 1
  habilidadesIniciais: HabilidadeCatalogoDto[];
}
