import type {
  CampanhaRoletaConfig,
  CampanhaRoletaConfigSnapshot,
  CampanhaRoletaPool,
  CampanhaRoletaPoolItem,
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
