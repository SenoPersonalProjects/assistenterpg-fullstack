import type {
  CampanhaRoletaCatalogoItem,
  CampanhaRoletaConfig,
  CampanhaRoletaConfigSnapshot,
  CampanhaRoletaEstado,
  CampanhaRoletaHistoricoItem,
  CampanhaRoletaModo,
  CampanhaRoletaPool,
  CampanhaRoletaPoolItem,
  CampanhaRoletaPreset,
  CampanhaRoletaSlot,
} from '@/lib/api/campanha-roleta';

export type RepeticaoRoleta = { nome: string; quantidade: number };

export type EtapaGiroRoleta = 1 | 2 | 3;

export type ChanceRoleta = {
  elegivel: boolean;
  peso: number;
  pesoTotal: number;
  probabilidade: number;
  umEm: number | null;
};

export type GrupoCatalogoRoleta = {
  chave: string;
  nome: string;
  descricao: string;
  itens: CampanhaRoletaCatalogoItem[];
};

export type ResumoConfigRoleta = {
  pool: CampanhaRoletaPool;
  fontesAtivas: number;
  tecnicasHereditariasCondicionais: number;
  erros: string[];
};

export function removerEstadoPorSlotRoleta<T>(
  estado: Partial<Record<CampanhaRoletaSlot, T>>,
  slot: CampanhaRoletaSlot,
): Partial<Record<CampanhaRoletaSlot, T>> {
  const proximo = { ...estado };
  delete proximo[slot];
  return proximo;
}

export function historicoCompativelComPresetRoleta(
  item: CampanhaRoletaHistoricoItem | undefined,
  preset: CampanhaRoletaPreset | null,
): CampanhaRoletaHistoricoItem | null {
  if (!item || !preset || item.status !== 'FINALIZADO' || item.slot !== preset.slot) {
    return null;
  }
  const configHistorica = lerConfigSnapshotRoleta(item.configSnapshot);
  return configHistorica?.presetRevisao === preset.revisao ? item : null;
}

const LIMITES_LISTA_MANUAL = {
  caracteres: 10_000,
  ocorrencias: 200,
  nome: 80,
  resultadosDistintos: 1_000,
  pesoTotal: 2_000,
} as const;

function normalizarChaveRoleta(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function categoriaCompativelComModo(
  item: CampanhaRoletaCatalogoItem,
  modo: CampanhaRoletaModo,
): boolean {
  if (modo === 'CLA') return item.categoria === 'CLA';
  if (modo === 'TECNICA') return item.categoria === 'TECNICA';
  return item.categoria !== 'MANUAL';
}

export function fonteCatalogoHabilitadaRoleta(
  item: CampanhaRoletaCatalogoItem,
  config: CampanhaRoletaConfig,
): boolean {
  if (item.fonte === 'SISTEMA_BASE') return config.fontes.sistemaBase;
  if (item.fonte === 'SUPLEMENTO') {
    return item.fonteId !== undefined && config.fontes.suplementoIds.includes(item.fonteId);
  }
  if (item.fonte === 'HOMEBREW') {
    return item.fonteId !== undefined && config.fontes.homebrewIds.includes(item.fonteId);
  }
  return false;
}

export function itensCatalogoDisponiveisRoleta(params: {
  itens: CampanhaRoletaCatalogoItem[];
  modo: CampanhaRoletaModo;
  config: CampanhaRoletaConfig;
}): CampanhaRoletaCatalogoItem[] {
  return params.itens.filter(
    (item) =>
      categoriaCompativelComModo(item, params.modo) &&
      fonteCatalogoHabilitadaRoleta(item, params.config),
  );
}

export function itemSelecionadoRoleta(
  chave: string,
  modo: CampanhaRoletaModo,
  config: CampanhaRoletaConfig,
): boolean {
  if (modo === 'SIMPLES') return config.inclusoesCatalogo.includes(chave);
  return !config.exclusoes.includes(chave);
}

export function aplicarSelecaoCatalogoRoleta(
  config: CampanhaRoletaConfig,
  modo: CampanhaRoletaModo,
  chaves: string[],
  selecionado: boolean,
): CampanhaRoletaConfig {
  const conjunto = new Set(chaves);
  if (modo === 'SIMPLES') {
    const inclusoes = new Set(config.inclusoesCatalogo);
    for (const chave of chaves) {
      if (selecionado) inclusoes.add(chave);
      else inclusoes.delete(chave);
    }
    return {
      ...config,
      inclusoesCatalogo: [...inclusoes],
      exclusoes: config.exclusoes.filter((chave) => !conjunto.has(chave)),
    };
  }
  const exclusoes = new Set(config.exclusoes);
  for (const chave of chaves) {
    if (selecionado) exclusoes.delete(chave);
    else exclusoes.add(chave);
  }
  return { ...config, exclusoes: [...exclusoes] };
}

export function limparOverridesItensRoleta(
  config: CampanhaRoletaConfig,
  chaves: string[],
): CampanhaRoletaConfig {
  const conjunto = new Set(chaves);
  return {
    ...config,
    inclusoesCatalogo: config.inclusoesCatalogo.filter(
      (chave) => !conjunto.has(chave),
    ),
    exclusoes: config.exclusoes.filter((chave) => !conjunto.has(chave)),
    compatibilidadesHereditarias: config.compatibilidadesHereditarias.filter(
      (item) => !conjunto.has(item.tecnicaChave),
    ),
  };
}

function montarItensManuaisRoleta(texto: string): {
  itens: CampanhaRoletaPoolItem[];
  erros: string[];
} {
  const erros: string[] = [];
  if (texto.length > LIMITES_LISTA_MANUAL.caracteres) {
    erros.push('A lista própria excede 10.000 caracteres.');
  }
  const entradas = texto
    .split(';')
    .map((nome) => nome.trim())
    .filter(Boolean);
  if (entradas.length > LIMITES_LISTA_MANUAL.ocorrencias) {
    erros.push('A lista própria excede 200 ocorrências.');
  }
  const agrupados = new Map<string, { nome: string; ocorrencias: number }>();
  for (const nome of entradas.slice(0, LIMITES_LISTA_MANUAL.ocorrencias)) {
    if (nome.length > LIMITES_LISTA_MANUAL.nome) {
      erros.push(`“${nome.slice(0, 20)}…” excede 80 caracteres.`);
      continue;
    }
    const normalizada = normalizarChaveRoleta(nome);
    if (!normalizada) continue;
    const chave = `MANUAL:${normalizada}`;
    const atual = agrupados.get(chave);
    agrupados.set(chave, {
      nome: atual?.nome ?? nome,
      ocorrencias: (atual?.ocorrencias ?? 0) + 1,
    });
  }
  return {
    itens: [...agrupados.entries()].map(([chave, item]) => ({
      chave,
      nome: item.nome,
      categoria: 'MANUAL',
      fonte: 'MANUAL',
      ocorrencias: item.ocorrencias,
      pesoUnitario: 1,
      pesoTotal: item.ocorrencias,
      incluidoManualmente: true,
    })),
    erros,
  };
}

export function montarResumoConfigRoleta(params: {
  modo: CampanhaRoletaModo;
  config: CampanhaRoletaConfig;
  catalogo: CampanhaRoletaEstado['catalogo'];
}): ResumoConfigRoleta {
  const disponiveis = itensCatalogoDisponiveisRoleta({
    itens: params.catalogo.itens,
    modo: params.modo,
    config: params.config,
  });
  const itensCatalogo = disponiveis
    .filter((item) => itemSelecionadoRoleta(item.chave, params.modo, params.config))
    .map<CampanhaRoletaPoolItem>((item) => ({
      ...item,
      ocorrencias: 1,
      pesoUnitario: 1,
      pesoTotal: 1,
      incluidoManualmente: params.config.inclusoesCatalogo.includes(item.chave),
    }));
  const manuais = montarItensManuaisRoleta(params.config.listaManualTexto);
  const itens = [...itensCatalogo, ...manuais.itens].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );
  const pesoTotal = itens.reduce((total, item) => total + item.pesoTotal, 0);
  const fontesAtivas =
    Number(params.config.fontes.sistemaBase) +
    params.config.fontes.suplementoIds.length +
    params.config.fontes.homebrewIds.length;
  const erros = [...manuais.erros];
  if (itens.length === 0) erros.push('Selecione ao menos uma possibilidade ou informe uma lista própria.');
  if (itens.length > LIMITES_LISTA_MANUAL.resultadosDistintos) {
    erros.push('A roleta excede 1.000 resultados distintos.');
  }
  if (pesoTotal > LIMITES_LISTA_MANUAL.pesoTotal) {
    erros.push('A roleta excede o peso total de 2.000.');
  }
  return {
    pool: {
      modo: params.modo,
      claSelecionadoChave: null,
      claDuplicadoChave: null,
      itens,
      quantidadeResultados: itens.length,
      pesoTotal,
    },
    fontesAtivas,
    tecnicasHereditariasCondicionais:
      params.modo === 'TECNICA'
        ? itensCatalogo.filter(
            (item) => item.hereditaria && !item.incluidoManualmente,
          ).length
        : 0,
    erros,
  };
}

export function agruparCatalogoRoleta(params: {
  catalogo: CampanhaRoletaEstado['catalogo'];
  modo: CampanhaRoletaModo;
  config: CampanhaRoletaConfig;
}): GrupoCatalogoRoleta[] {
  const suplementos = new Map(
    params.catalogo.suplementos.map((item) => [item.id, item.nome]),
  );
  const homebrews = new Map(
    params.catalogo.homebrews.map((item) => [
      item.id,
      `${item.nome} · ${item.autor.apelido}`,
    ]),
  );
  const grupos = new Map<string, GrupoCatalogoRoleta>();
  for (const item of itensCatalogoDisponiveisRoleta({
    itens: params.catalogo.itens,
    modo: params.modo,
    config: params.config,
  })) {
    const chave =
      item.fonte === 'SISTEMA_BASE'
        ? 'SISTEMA_BASE'
        : `${item.fonte}:${item.fonteId ?? 0}`;
    const nome =
      item.fonte === 'SISTEMA_BASE'
        ? 'Sistema base'
        : item.fonte === 'SUPLEMENTO'
          ? suplementos.get(item.fonteId ?? 0) ?? 'Suplemento'
          : homebrews.get(item.fonteId ?? 0) ?? 'Homebrew';
    const atual = grupos.get(chave) ?? {
      chave,
      nome,
      descricao:
        item.fonte === 'SISTEMA_BASE'
          ? 'Conteúdo oficial do sistema'
          : item.fonte === 'SUPLEMENTO'
            ? 'Suplemento publicado'
            : 'Homebrew publicado',
      itens: [],
    };
    atual.itens.push(item);
    grupos.set(chave, atual);
  }
  return [...grupos.values()].map((grupo) => ({
    ...grupo,
    itens: grupo.itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
  }));
}

export function agruparRepeticoesRoleta(texto: string): RepeticaoRoleta[] {
  const mapa = new Map<string, RepeticaoRoleta>();
  for (const entrada of texto.split(';').map((item) => item.trim()).filter(Boolean)) {
    const chave = entrada.toLocaleLowerCase('pt-BR');
    const atual = mapa.get(chave);
    mapa.set(chave, {
      nome: atual?.nome ?? entrada,
      quantidade: (atual?.quantidade ?? 0) + 1,
    });
  }
  return [...mapa.values()].filter((item) => item.quantidade > 1);
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function arrayDeStrings(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === 'string');
}

function configRoletaValida(valor: unknown): valor is CampanhaRoletaConfig {
  if (!objeto(valor) || !objeto(valor.fontes)) return false;
  const fontes = valor.fontes;
  const compatibilidadesValidas =
    Array.isArray(valor.compatibilidadesHereditarias) &&
    valor.compatibilidadesHereditarias.every(
      (item) =>
        objeto(item) &&
        typeof item.tecnicaChave === 'string' &&
        arrayDeStrings(item.claChaves),
    );
  return (
    typeof fontes.sistemaBase === 'boolean' &&
    Array.isArray(fontes.suplementoIds) &&
    fontes.suplementoIds.every(Number.isInteger) &&
    Array.isArray(fontes.homebrewIds) &&
    fontes.homebrewIds.every(Number.isInteger) &&
    arrayDeStrings(valor.exclusoes) &&
    arrayDeStrings(valor.inclusoesCatalogo) &&
    typeof valor.listaManualTexto === 'string' &&
    compatibilidadesValidas
  );
}

export function lerConfigSnapshotRoleta(
  valor: unknown,
): CampanhaRoletaConfigSnapshot | null {
  if (!objeto(valor)) return null;
  if (!['CLA', 'TECNICA', 'CUSTOMIZADO'].includes(String(valor.slot))) return null;
  if (!['CLA', 'TECNICA', 'SIMPLES'].includes(String(valor.modo))) return null;
  if (
    typeof valor.configVersao !== 'number' ||
    !Number.isInteger(valor.configVersao) ||
    typeof valor.presetRevisao !== 'number' ||
    !Number.isInteger(valor.presetRevisao)
  ) {
    return null;
  }
  if (!configRoletaValida(valor.config)) return null;
  return valor as CampanhaRoletaConfigSnapshot;
}

export function calcularChanceRoleta(params: {
  pool: CampanhaRoletaPool;
  item: CampanhaRoletaPoolItem;
  etapa?: EtapaGiroRoleta;
  primeiroResultadoChave?: string | null;
}): ChanceRoleta {
  const etapa = params.etapa ?? 1;
  const primeiroResultado =
    etapa === 2 && params.primeiroResultadoChave
      ? params.pool.itens.find((item) => item.chave === params.primeiroResultadoChave)
      : null;
  const itemExcluido = Boolean(
    primeiroResultado && params.item.chave === primeiroResultado.chave,
  );
  const pesoTotal =
    etapa === 2 && primeiroResultado
      ? params.pool.pesoTotal - primeiroResultado.pesoTotal
      : params.pool.pesoTotal;
  const peso = itemExcluido ? 0 : params.item.pesoTotal;
  const elegivel = !itemExcluido && peso > 0 && pesoTotal > 0;
  const probabilidade = elegivel ? peso / pesoTotal : 0;
  return {
    elegivel,
    peso,
    pesoTotal: Math.max(0, pesoTotal),
    probabilidade,
    umEm: elegivel && probabilidade > 0 ? 1 / probabilidade : null,
  };
}

const formatadorChance = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatarChanceRoleta(chance: ChanceRoleta): string {
  if (!chance.elegivel || chance.pesoTotal <= 0 || chance.umEm === null) {
    return 'Inelegível nesta etapa';
  }
  const percentual = formatadorChance.format(chance.probabilidade * 100);
  const umEm = formatadorChance.format(chance.umEm);
  return `${percentual}% · aprox. 1 em ${umEm} · peso ${chance.peso}/${chance.pesoTotal}`;
}
