// src/origens/dto/catalogo-origem.dto.ts
import { HabilidadeCatalogoDto } from 'src/habilidades/dto/catalogo-habilidade.dto';

export class OrigemPericiaCatalogoDto {
  id: number;
  tipo: 'FIXA' | 'ESCOLHA';
  grupoEscolha: number | null;
  pericia: {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    atributoBase: string;
    somenteTreinada: boolean;
    penalizaPorCarga: boolean;
    precisaKit: boolean;
  };
}

export class OrigemCatalogoDto {
  id: number;
  nome: string;
  descricao: string | null;

  requisitosTexto: string | null;
  requerGrandeCla: boolean;
  requerTecnicaHeriditaria: boolean;
  bloqueiaTecnicaHeriditaria: boolean;

  pericias: OrigemPericiaCatalogoDto[];

  // ✅ NOVO
  habilidadesIniciais: HabilidadeCatalogoDto[];
}
