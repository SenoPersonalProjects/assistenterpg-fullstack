import { apiClient } from './axios-client';

export type CampanhaRoletaSlot = 'CLA' | 'TECNICA' | 'CUSTOMIZADO';
export type CampanhaRoletaModo = 'CLA' | 'TECNICA' | 'SIMPLES';
export type CampanhaRoletaStatus =
  | 'AGUARDANDO_GIRO_1'
  | 'AGUARDANDO_GIRO_2'
  | 'AGUARDANDO_ESCOLHA'
  | 'FINALIZADO'
  | 'CANCELADO';

export type CampanhaRoletaConfig = {
  fontes: {
    sistemaBase: boolean;
    suplementoIds: number[];
    homebrewIds: number[];
  };
  exclusoes: string[];
  inclusoesCatalogo: string[];
  listaManualTexto: string;
  compatibilidadesHereditarias: Array<{
    tecnicaChave: string;
    claChaves: string[];
  }>;
};

export type CampanhaRoletaCatalogoItem = {
  chave: string;
  nome: string;
  categoria: 'CLA' | 'TECNICA' | 'MANUAL';
  fonte: 'SISTEMA_BASE' | 'SUPLEMENTO' | 'HOMEBREW' | 'MANUAL';
  fonteId?: number;
  hereditaria?: boolean;
  claCompativeisChaves?: string[];
};

export type CampanhaRoletaPoolItem = CampanhaRoletaCatalogoItem & {
  ocorrencias: number;
  pesoUnitario: number;
  pesoTotal: number;
  incluidoManualmente: boolean;
};

export type CampanhaRoletaPool = {
  modo: CampanhaRoletaModo;
  claSelecionadoChave: string | null;
  claDuplicadoChave: string | null;
  itens: CampanhaRoletaPoolItem[];
  quantidadeResultados: number;
  pesoTotal: number;
};

export type CampanhaRoletaPreset = {
  id: number;
  campanhaId: number;
  slot: CampanhaRoletaSlot;
  modo: CampanhaRoletaModo;
  configVersao: number;
  config: CampanhaRoletaConfig;
  revisao: number;
  atualizadoEm: string;
};

export type CampanhaRoletaSorteio = {
  id: number;
  campanhaId: number;
  presetId: number;
  slot: CampanhaRoletaSlot;
  modo: CampanhaRoletaModo;
  alvo: { id: number; apelido: string } | null;
  status: CampanhaRoletaStatus;
  configSnapshot: unknown;
  poolSnapshot: CampanhaRoletaPool;
  resultados: CampanhaRoletaPoolItem[];
  resultadoFinal: CampanhaRoletaPoolItem | null;
  revisao: number;
  iniciadoPor: { id: number; apelido: string } | null;
  finalizadoPor: { id: number; apelido: string } | null;
  canceladoPor: { id: number; apelido: string } | null;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string | null;
  canceladoEm: string | null;
};

export type CampanhaRoletaEstado = {
  campanhaId: number;
  capacidades: {
    ehMestre: boolean;
    papel: string | null;
    podeConfigurar: boolean;
    podeGirar: boolean;
    podeIniciar: boolean;
    podeCancelar: boolean;
    podeGerenciarPermissoes: boolean;
  };
  presets: CampanhaRoletaPreset[];
  permissoes: Array<{
    id: number;
    usuarioId: number;
    podeConfigurar: boolean;
    podeGirar: boolean;
    usuario: { id: number; apelido: string };
  }>;
  sorteiosAtivos: CampanhaRoletaSorteio[];
  catalogo: {
    itens: CampanhaRoletaCatalogoItem[];
    suplementos: Array<{ id: number; codigo: string; nome: string }>;
    homebrews: Array<{
      id: number;
      nome: string;
      tipo: 'CLA' | 'TECNICA_AMALDICOADA';
      autor: { id: number; apelido: string };
    }>;
    participantes: Array<{ id: number; apelido: string; papel: string }>;
  };
};

export type CampanhaRoletaGiro = {
  sorteio: CampanhaRoletaSorteio;
  giro: {
    etapa: number;
    resultado: CampanhaRoletaPoolItem;
    duracaoMs: number;
    animacaoId: string;
  };
};

export type CampanhaRoletaHistorico = {
  itens: Array<
    CampanhaRoletaSorteio & {
      eventos: Array<{
        id: number;
        tipo: string;
        dados: unknown;
        resposta: unknown;
        criadoEm: string;
        ator: { id: number; apelido: string } | null;
      }>;
    }
  >;
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export function criarClientRequestIdRoleta(): string {
  return crypto.randomUUID();
}

export async function apiObterRoletaCampanha(
  campanhaId: number,
): Promise<CampanhaRoletaEstado> {
  const { data } = await apiClient.get(`/campanhas/${campanhaId}/roleta`);
  return data;
}

export async function apiPreviewRoletaCampanha(
  campanhaId: number,
  payload: {
    slot: CampanhaRoletaSlot;
    modo: CampanhaRoletaModo;
    config: CampanhaRoletaConfig;
    claSelecionadoChave?: string;
    claDuplicadoChave?: string;
  },
): Promise<CampanhaRoletaPool> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/roleta/preview`,
    payload,
  );
  return data;
}

export async function apiSalvarPresetRoletaCampanha(
  campanhaId: number,
  slot: CampanhaRoletaSlot,
  payload: {
    modo: CampanhaRoletaModo;
    config: CampanhaRoletaConfig;
    revisaoEsperada: number;
  },
): Promise<CampanhaRoletaPreset> {
  const { data } = await apiClient.put(
    `/campanhas/${campanhaId}/roleta/presets/${slot}`,
    payload,
  );
  return data;
}

export async function apiSalvarPermissaoRoletaCampanha(
  campanhaId: number,
  usuarioId: number,
  payload: { podeConfigurar: boolean; podeGirar: boolean },
) {
  const { data } = await apiClient.put(
    `/campanhas/${campanhaId}/roleta/permissoes/${usuarioId}`,
    payload,
  );
  return data;
}

export async function apiRemoverPermissaoRoletaCampanha(
  campanhaId: number,
  usuarioId: number,
) {
  const { data } = await apiClient.delete(
    `/campanhas/${campanhaId}/roleta/permissoes/${usuarioId}`,
  );
  return data;
}

export async function apiIniciarSorteioRoletaCampanha(
  campanhaId: number,
  payload: {
    slot: CampanhaRoletaSlot;
    alvoUsuarioId?: number;
    claSelecionadoChave?: string;
    claDuplicadoChave?: string;
    presetRevisaoEsperada: number;
    clientRequestId: string;
  },
): Promise<{ sorteio: CampanhaRoletaSorteio; eventoId?: number }> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/roleta/sorteios`,
    payload,
  );
  return data;
}

async function executarAcaoRoleta<T>(
  campanhaId: number,
  sorteioId: number,
  acao: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const { data } = await apiClient.post(
    `/campanhas/${campanhaId}/roleta/sorteios/${sorteioId}/${acao}`,
    payload,
  );
  return data;
}

export function apiGirarRoletaCampanha(
  campanhaId: number,
  sorteioId: number,
  revisaoEsperada: number,
): Promise<CampanhaRoletaGiro> {
  return executarAcaoRoleta(campanhaId, sorteioId, 'girar', {
    revisaoEsperada,
    clientRequestId: criarClientRequestIdRoleta(),
  });
}

export function apiEscolherRoletaCampanha(
  campanhaId: number,
  sorteioId: number,
  revisaoEsperada: number,
  indiceEscolhido: 0 | 1,
): Promise<{ sorteio: CampanhaRoletaSorteio; resultado: CampanhaRoletaPoolItem }> {
  return executarAcaoRoleta(campanhaId, sorteioId, 'escolher', {
    revisaoEsperada,
    indiceEscolhido,
    clientRequestId: criarClientRequestIdRoleta(),
  });
}

export function apiTerceiroGiroRoletaCampanha(
  campanhaId: number,
  sorteioId: number,
  revisaoEsperada: number,
): Promise<CampanhaRoletaGiro> {
  return executarAcaoRoleta(campanhaId, sorteioId, 'terceiro-giro', {
    revisaoEsperada,
    clientRequestId: criarClientRequestIdRoleta(),
  });
}

export function apiCancelarSorteioRoletaCampanha(
  campanhaId: number,
  sorteioId: number,
  revisaoEsperada: number,
): Promise<{ sorteio: CampanhaRoletaSorteio }> {
  return executarAcaoRoleta(campanhaId, sorteioId, 'cancelar', {
    revisaoEsperada,
    clientRequestId: criarClientRequestIdRoleta(),
  });
}

export async function apiHistoricoRoletaCampanha(
  campanhaId: number,
  pagina = 1,
  limite = 20,
): Promise<CampanhaRoletaHistorico> {
  const { data } = await apiClient.get(
    `/campanhas/${campanhaId}/roleta/historico?pagina=${pagina}&limite=${limite}`,
  );
  return data;
}
