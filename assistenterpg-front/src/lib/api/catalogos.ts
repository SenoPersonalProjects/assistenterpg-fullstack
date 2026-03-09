// lib/api/catalogos.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  TipoFonte,
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  ProficienciaCatalogo,
  PericiaCatalogo,
  TipoGrauCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  HabilidadeCatalogo,
  TipoHabilidadeCatalogo,
  TecnicaAmaldicoadaCatalogo,
  TecnicaInataCatalogo,
  TipoTecnicaAmaldicoada,
  AlinhamentoCatalogo,
  PoderGenericoCatalogo,
  PassivasDisponiveisResponse,
} from '@/lib/types';

export type FiltrarTrilhasDto = {
  classeId?: number;
};

export type FiltrarHabilidadesDto = {
  tipo?: TipoHabilidadeCatalogo;
  origem?: string;
  fonte?: TipoFonte;
  suplementoId?: number;
  busca?: string;
  pagina?: number;
  limite?: number;
};

export type FiltrarTecnicasAmaldicoadasDto = {
  nome?: string;
  codigo?: string;
  tipo?: TipoTecnicaAmaldicoada;
  hereditaria?: boolean;
  claId?: number;
  claNome?: string;
  fonte?: TipoFonte;
  suplementoId?: number;
  incluirHabilidades?: boolean;
  incluirClas?: boolean;
};

type CatalogosBasicosOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

export type CatalogosBasicosResponse = {
  classes: ClasseCatalogo[];
  clas: ClaCatalogo[];
  origens: OrigemCatalogo[];
  proficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];
  tecnicasInatas: TecnicaInataCatalogo[];
  alinhamentos: AlinhamentoCatalogo[];
  pericias: PericiaCatalogo[];
};

type CatalogosBasicosCacheEntry = {
  data: CatalogosBasicosResponse;
  expiresAt: number;
};

const CATALOGOS_BASICOS_CACHE_TTL_MS = 60_000;
let catalogosBasicosCache: CatalogosBasicosCacheEntry | null = null;
let catalogosBasicosInFlight: Promise<CatalogosBasicosResponse> | null = null;

function cloneCatalogosBasicos(data: CatalogosBasicosResponse): CatalogosBasicosResponse {
  return {
    classes: [...data.classes],
    clas: [...data.clas],
    origens: [...data.origens],
    proficiencias: [...data.proficiencias],
    tiposGrau: [...data.tiposGrau],
    tecnicasInatas: [...data.tecnicasInatas],
    alinhamentos: [...data.alinhamentos],
    pericias: [...data.pericias],
  };
}

export function apiInvalidateCatalogosBasicosCache(): void {
  catalogosBasicosCache = null;
  catalogosBasicosInFlight = null;
}

export async function apiGetCatalogosBasicos(
  options: CatalogosBasicosOptions = {},
): Promise<CatalogosBasicosResponse> {
  const ttlMs = options.cacheTtlMs ?? CATALOGOS_BASICOS_CACHE_TTL_MS;

  if (options.forceRefresh) {
    apiInvalidateCatalogosBasicosCache();
  } else if (catalogosBasicosCache && catalogosBasicosCache.expiresAt > Date.now()) {
    return cloneCatalogosBasicos(catalogosBasicosCache.data);
  }

  if (catalogosBasicosInFlight) {
    const data = await catalogosBasicosInFlight;
    return cloneCatalogosBasicos(data);
  }

  const request = Promise.all([
    apiGetClasses(),
    apiGetClas(),
    apiGetOrigens(),
    apiGetProficiencias(),
    apiGetTiposGrau(),
    apiGetTecnicasInatas(),
    apiGetAlinhamentos(),
    apiGetPericias(),
  ])
    .then(
      ([
        classes,
        clas,
        origens,
        proficiencias,
        tiposGrau,
        tecnicasInatas,
        alinhamentos,
        pericias,
      ]) => {
        const data: CatalogosBasicosResponse = {
          classes,
          clas,
          origens,
          proficiencias,
          tiposGrau,
          tecnicasInatas,
          alinhamentos,
          pericias,
        };

        catalogosBasicosCache = {
          data,
          expiresAt: Date.now() + ttlMs,
        };

        return data;
      },
    )
    .finally(() => {
      catalogosBasicosInFlight = null;
    });

  catalogosBasicosInFlight = request;
  const data = await request;
  return cloneCatalogosBasicos(data);
}

export async function apiGetClasses(): Promise<ClasseCatalogo[]> {
  const { data } = await apiClient.get('/classes');
  return data;
}

export async function apiGetClas(): Promise<ClaCatalogo[]> {
  const { data } = await apiClient.get('/clas');
  return data;
}

export async function apiGetOrigens(): Promise<OrigemCatalogo[]> {
  const { data } = await apiClient.get('/origens');
  return data;
}

export async function apiGetProficiencias(): Promise<ProficienciaCatalogo[]> {
  const { data } = await apiClient.get('/proficiencias');
  return data;
}

export async function apiGetPericias(): Promise<PericiaCatalogo[]> {
  const { data } = await apiClient.get('/pericias');
  return data;
}

export async function apiGetTiposGrau(): Promise<TipoGrauCatalogo[]> {
  const { data } = await apiClient.get('/tipos-grau');
  return data;
}

export async function apiGetTrilhas(filtros?: FiltrarTrilhasDto): Promise<TrilhaCatalogo[]> {
  const params = new URLSearchParams();

  if (filtros?.classeId !== undefined) params.append('classeId', filtros.classeId.toString());

  const query = params.toString();
  const { data } = await apiClient.get(`/trilhas${query ? `?${query}` : ''}`);
  return data;
}

export async function apiGetTrilhasDaClasse(classeId: number): Promise<TrilhaCatalogo[]> {
  return apiGetTrilhas({ classeId });
}

export async function apiGetHabilidades(
  filtros?: FiltrarHabilidadesDto,
): Promise<ListResult<HabilidadeCatalogo>> {
  const params = new URLSearchParams();

  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.origem) params.append('origem', filtros.origem);
  if (filtros?.fonte) params.append('fonte', filtros.fonte);
  if (filtros?.suplementoId !== undefined)
    params.append('suplementoId', filtros.suplementoId.toString());
  if (filtros?.busca) params.append('busca', filtros.busca);
  if (filtros?.pagina !== undefined) params.append('pagina', filtros.pagina.toString());
  if (filtros?.limite !== undefined) params.append('limite', filtros.limite.toString());

  const query = params.toString();
  const { data } = await apiClient.get(`/habilidades${query ? `?${query}` : ''}`);
  return normalizeListResult<HabilidadeCatalogo>(data);
}

export async function apiGetCaminhosDaTrilha(trilhaId: number): Promise<CaminhoCatalogo[]> {
  const { data } = await apiClient.get(`/trilhas/${trilhaId}/caminhos`);
  return data;
}

export async function apiGetTecnicasAmaldicoadas(
  filtros?: FiltrarTecnicasAmaldicoadasDto,
): Promise<TecnicaAmaldicoadaCatalogo[]> {
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.codigo) params.append('codigo', filtros.codigo);
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.hereditaria !== undefined)
    params.append('hereditaria', filtros.hereditaria.toString());
  if (filtros?.claId !== undefined) params.append('claId', filtros.claId.toString());
  if (filtros?.claNome) params.append('claNome', filtros.claNome);
  if (filtros?.fonte) params.append('fonte', filtros.fonte);
  if (filtros?.suplementoId !== undefined)
    params.append('suplementoId', filtros.suplementoId.toString());
  if (filtros?.incluirHabilidades !== undefined)
    params.append('incluirHabilidades', filtros.incluirHabilidades.toString());
  if (filtros?.incluirClas !== undefined)
    params.append('incluirClas', filtros.incluirClas.toString());

  const query = params.toString();
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas${query ? `?${query}` : ''}`);
  return Array.isArray(data) ? data : [];
}

export async function apiGetTecnicasInatas(): Promise<TecnicaInataCatalogo[]> {
  const data = await apiGetTecnicasAmaldicoadas({ tipo: 'INATA' as TipoTecnicaAmaldicoada });

  return data.map((tecnica) => ({
    id: tecnica.id,
    codigo: tecnica.codigo,
    nome: tecnica.nome,
    descricao: tecnica.descricao,
    tipo: tecnica.tipo,
    hereditaria: tecnica.hereditaria ?? false,
    fonte: tecnica.fonte,
    suplementoId: tecnica.suplementoId ?? null,
    clasHereditarios: (tecnica.clasHereditarios ?? []).map((cla) => ({
      claId: cla.id,
      claNome: cla.nome,
    })),
  }));
}

export async function apiGetAlinhamentos(): Promise<AlinhamentoCatalogo[]> {
  const { data } = await apiClient.get('/alinhamentos');
  return data;
}

export async function apiGetPoderesGenericos(): Promise<PoderGenericoCatalogo[]> {
  const { data } = await apiClient.get('/habilidades/poderes-genericos');
  return data;
}

export async function apiGetPassivasDisponiveis(): Promise<PassivasDisponiveisResponse> {
  const { data } = await apiClient.get('/personagens-base/passivas-disponiveis');
  return data;
}
