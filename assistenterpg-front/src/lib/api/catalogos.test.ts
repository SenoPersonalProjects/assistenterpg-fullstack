import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiGetCatalogosBasicos,
  apiInvalidateCatalogosBasicosCache,
} from './catalogos';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

function payloadByUrl(url: string, version: string): unknown {
  switch (url) {
    case '/classes':
      return [
        {
          id: 1,
          nome: `Classe ${version}`,
          descricao: null,
          periciasLivresBase: 1,
          pericias: [],
        },
      ];
    case '/clas':
      return [{ id: 1, nome: `Cla ${version}`, descricao: null, grandeCla: false }];
    case '/origens':
      return [
        {
          id: 1,
          nome: `Origem ${version}`,
          descricao: null,
          requerGrandeCla: false,
          requerTecnicaHeriditaria: false,
          bloqueiaTecnicaHeriditaria: false,
          pericias: [],
        },
      ];
    case '/proficiencias':
      return [
        {
          id: 1,
          codigo: `PROF_${version}`,
          nome: `Proficiencia ${version}`,
          descricao: null,
          tipo: 'ARMA',
          categoria: 'SIMPLES',
          subtipo: null,
        },
      ];
    case '/tipos-grau':
      return [
        {
          id: 1,
          codigo: `GRAU_${version}`,
          nome: `Grau ${version}`,
          descricao: null,
        },
      ];
    case '/tecnicas-amaldicoadas?tipo=INATA':
      return [
        {
          id: 1,
          codigo: `TEC_${version}`,
          nome: `Tecnica ${version}`,
          descricao: null,
          tipo: 'INATA',
          hereditaria: false,
          clasHereditarios: [],
        },
      ];
    case '/alinhamentos':
      return [{ id: 1, nome: `Alinhamento ${version}`, descricao: null }];
    case '/pericias':
      return [
        {
          id: 1,
          codigo: `PER_${version}`,
          nome: `Pericia ${version}`,
          descricao: null,
          atributoBase: 'AGILIDADE',
          somenteTreinada: false,
          penalizaPorCarga: false,
          precisaKit: false,
        },
      ];
    default:
      throw new Error(`URL nao mockada: ${url}`);
  }
}

describe('catalogos api cache and dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiInvalidateCatalogosBasicosCache();
  });

  it('dedupes in-flight request and serves from cache', async () => {
    mockedApiClient.get.mockImplementation((url: string) =>
      Promise.resolve({ data: payloadByUrl(url, 'A') }),
    );

    const p1 = apiGetCatalogosBasicos();
    const p2 = apiGetCatalogosBasicos();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(8);
    expect(r1.classes[0]?.nome).toBe('Classe A');
    expect(r2.classes[0]?.nome).toBe('Classe A');

    r1.classes.push({
      id: 999,
      nome: 'Mutacao local',
      descricao: null,
      periciasLivresBase: 0,
      pericias: [],
    });

    const r3 = await apiGetCatalogosBasicos();
    expect(r3.classes).toHaveLength(1);
    expect(mockedApiClient.get).toHaveBeenCalledTimes(8);
  });

  it('forces refresh when requested', async () => {
    mockedApiClient.get.mockImplementation((url: string) =>
      Promise.resolve({ data: payloadByUrl(url, 'A') }),
    );

    const primeiro = await apiGetCatalogosBasicos();

    mockedApiClient.get.mockImplementation((url: string) =>
      Promise.resolve({ data: payloadByUrl(url, 'B') }),
    );

    const segundo = await apiGetCatalogosBasicos({ forceRefresh: true });

    expect(primeiro.classes[0]?.nome).toBe('Classe A');
    expect(segundo.classes[0]?.nome).toBe('Classe B');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(16);
  });
});
