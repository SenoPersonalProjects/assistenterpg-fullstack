import { randomUUID } from 'node:crypto';

const CONFIRMACAO_SESSAO_DESCARTAVEL =
  'EXECUTAR ROLAGENS NA SESSAO DESCARTAVEL';
const CONFIRMACAO_PRODUCAO = 'CONFIRMO USO DE DADOS DESCARTAVEIS EM PRODUCAO';
const COOKIE_CSRF = 'assistenterpg_csrf';
const LIMITE_EVENTOS_CHAT_PREFLIGHT = 120;
const PERICIAS_ATAQUE = new Set(['LUTA', 'PONTARIA', 'JUJUTSU']);

export type SmokeTarget = 'LOCAL' | 'TEST' | 'PRODUCTION';

export type SmokeLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type SmokeConfig = {
  target: SmokeTarget;
  baseUrl: string;
  email: string;
  password: string;
  campanhaId: number;
  sessaoId: number;
  expectedSessionTitle: string;
  personagemSessaoId: number;
  expectedCharacterName: string;
  personagemPericiaCodigo: string;
  personagemAtaqueCodigo: string;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
  npcSessaoId: number;
  expectedNpcName: string;
  npcPericiaCodigo: string;
  npcAcaoIndice: number;
};

type SmokeRollType =
  | 'FORMULA'
  | 'PERICIA_PERSONAGEM'
  | 'ATAQUE_PERSONAGEM'
  | 'TESTE_HABILIDADE_PERSONAGEM'
  | 'DANO_PERSONAGEM'
  | 'CRITICO_PERSONAGEM'
  | 'PERICIA_NPC'
  | 'ATAQUE_NPC'
  | 'DANO_NPC';

export type SmokeRollIntent = {
  nome: string;
  tipoEsperado: SmokeRollType;
  payload: Record<string, unknown> & { clientRequestId: string };
};

type FetchLike = typeof fetch;

type SmokeDependencies = {
  fetchImpl?: FetchLike;
  logger?: SmokeLogger;
  uuid?: () => string;
};

type SmokeCommandDependencies = SmokeDependencies & {
  run?: (
    config: SmokeConfig,
    dependencies?: SmokeDependencies,
  ) => Promise<SmokeRunResult>;
};

export type SmokeRunResult = {
  rolagensValidadas: number;
  replayIdempotenteValidado: boolean;
  invariantesPreservadas: boolean;
};

export class SmokeConfigError extends Error {
  constructor(
    message: string,
    readonly variables: string[] = [],
  ) {
    super(message);
    this.name = 'SmokeConfigError';
  }
}

export class SmokeExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmokeExecutionError';
  }
}

class SmokeHttpError extends SmokeExecutionError {
  constructor(
    operacao: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(`${operacao} falhou com HTTP ${status}${code ? ` (${code})` : ''}.`);
    this.name = 'SmokeHttpError';
  }
}

const REQUIRED_VARIABLES = [
  'SMOKE_TARGET',
  'SMOKE_BASE_URL',
  'SMOKE_EMAIL',
  'SMOKE_PASSWORD',
  'SMOKE_CAMPANHA_ID',
  'SMOKE_SESSAO_ID',
  'SMOKE_EXPECTED_SESSION_TITLE',
  'SMOKE_PERSONAGEM_SESSAO_ID',
  'SMOKE_EXPECTED_CHARACTER_NAME',
  'SMOKE_PERSONAGEM_PERICIA_CODIGO',
  'SMOKE_PERSONAGEM_ATAQUE_CODIGO',
  'SMOKE_HABILIDADE_TECNICA_ID',
  'SMOKE_NPC_SESSAO_ID',
  'SMOKE_EXPECTED_NPC_NAME',
  'SMOKE_NPC_PERICIA_CODIGO',
  'SMOKE_NPC_ACAO_INDICE',
  'SMOKE_CONFIRMATION',
] as const;

export const SMOKE_HELP = `Smoke autenticado de rolagens autoritativas

Uso:
  npm run smoke:auth -- --help
  npm run smoke:auth -- --validate-config
  npm run smoke:auth -- --dry-run
  npm run smoke:auth -- --run

Nenhuma chamada HTTP e feita sem --run. O modo --run exige uma sessao
descartavel existente e confirmacoes literais descritas no guia operacional.`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(
  env: NodeJS.ProcessEnv,
  name: string,
  missing: string[],
): string {
  const value = env[name]?.trim();
  if (!value) {
    missing.push(name);
    return '';
  }
  return value;
}

function parseInteger(name: string, value: string, min: number, max?: number) {
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    (max !== undefined && parsed > max)
  ) {
    throw new SmokeConfigError(`${name} deve ser um inteiro valido.`, [name]);
  }
  return parsed;
}

function parseOptionalInteger(
  env: NodeJS.ProcessEnv,
  name: string,
  min: number,
  max?: number,
): number | undefined {
  const value = env[name]?.trim();
  return value ? parseInteger(name, value, min, max) : undefined;
}

function parseBaseUrl(raw: string, target: SmokeTarget): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SmokeConfigError('SMOKE_BASE_URL deve ser uma URL valida.', [
      'SMOKE_BASE_URL',
    ]);
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new SmokeConfigError(
      'SMOKE_BASE_URL nao pode conter credenciais, query ou fragmento.',
      ['SMOKE_BASE_URL'],
    );
  }

  const localhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (target === 'LOCAL' && !localhost) {
    throw new SmokeConfigError('SMOKE_TARGET=LOCAL exige um host local.', [
      'SMOKE_TARGET',
      'SMOKE_BASE_URL',
    ]);
  }
  if (target !== 'LOCAL' && (localhost || url.protocol !== 'https:')) {
    throw new SmokeConfigError('Alvos remotos exigem HTTPS e host nao local.', [
      'SMOKE_TARGET',
      'SMOKE_BASE_URL',
    ]);
  }

  return url.toString().replace(/\/$/, '');
}

export function carregarSmokeConfig(env: NodeJS.ProcessEnv): SmokeConfig {
  const missing: string[] = [];
  const values = Object.fromEntries(
    REQUIRED_VARIABLES.map((name) => [name, getString(env, name, missing)]),
  ) as Record<(typeof REQUIRED_VARIABLES)[number], string>;

  if (missing.length > 0) {
    throw new SmokeConfigError(
      `Variaveis obrigatorias ausentes: ${missing.join(', ')}.`,
      missing,
    );
  }

  const target = values.SMOKE_TARGET.toUpperCase();
  if (!['LOCAL', 'TEST', 'PRODUCTION'].includes(target)) {
    throw new SmokeConfigError(
      'SMOKE_TARGET deve ser LOCAL, TEST ou PRODUCTION.',
      ['SMOKE_TARGET'],
    );
  }

  if (values.SMOKE_CONFIRMATION !== CONFIRMACAO_SESSAO_DESCARTAVEL) {
    throw new SmokeConfigError(
      'SMOKE_CONFIRMATION nao confirma uma sessao descartavel.',
      ['SMOKE_CONFIRMATION'],
    );
  }

  if (
    target === 'PRODUCTION' &&
    env.SMOKE_PRODUCTION_CONFIRMATION?.trim() !== CONFIRMACAO_PRODUCAO
  ) {
    throw new SmokeConfigError(
      'Producao exige SMOKE_PRODUCTION_CONFIRMATION explicita.',
      ['SMOKE_PRODUCTION_CONFIRMATION'],
    );
  }

  const personagemAtaqueCodigo =
    values.SMOKE_PERSONAGEM_ATAQUE_CODIGO.toUpperCase();
  if (!PERICIAS_ATAQUE.has(personagemAtaqueCodigo)) {
    throw new SmokeConfigError(
      'SMOKE_PERSONAGEM_ATAQUE_CODIGO deve ser LUTA, PONTARIA ou JUJUTSU.',
      ['SMOKE_PERSONAGEM_ATAQUE_CODIGO'],
    );
  }

  const acumulosRaw = parseOptionalInteger(env, 'SMOKE_ACUMULOS', 1, 5);

  return {
    target: target as SmokeTarget,
    baseUrl: parseBaseUrl(values.SMOKE_BASE_URL, target as SmokeTarget),
    email: values.SMOKE_EMAIL,
    password: values.SMOKE_PASSWORD,
    campanhaId: parseInteger('SMOKE_CAMPANHA_ID', values.SMOKE_CAMPANHA_ID, 1),
    sessaoId: parseInteger('SMOKE_SESSAO_ID', values.SMOKE_SESSAO_ID, 1),
    expectedSessionTitle: values.SMOKE_EXPECTED_SESSION_TITLE,
    personagemSessaoId: parseInteger(
      'SMOKE_PERSONAGEM_SESSAO_ID',
      values.SMOKE_PERSONAGEM_SESSAO_ID,
      1,
    ),
    expectedCharacterName: values.SMOKE_EXPECTED_CHARACTER_NAME,
    personagemPericiaCodigo:
      values.SMOKE_PERSONAGEM_PERICIA_CODIGO.toUpperCase(),
    personagemAtaqueCodigo,
    habilidadeTecnicaId: parseInteger(
      'SMOKE_HABILIDADE_TECNICA_ID',
      values.SMOKE_HABILIDADE_TECNICA_ID,
      1,
    ),
    variacaoHabilidadeId: parseOptionalInteger(
      env,
      'SMOKE_VARIACAO_HABILIDADE_ID',
      1,
    ),
    ...(acumulosRaw && acumulosRaw > 1 ? { acumulos: acumulosRaw } : {}),
    npcSessaoId: parseInteger(
      'SMOKE_NPC_SESSAO_ID',
      values.SMOKE_NPC_SESSAO_ID,
      1,
    ),
    expectedNpcName: values.SMOKE_EXPECTED_NPC_NAME,
    npcPericiaCodigo: values.SMOKE_NPC_PERICIA_CODIGO.toUpperCase(),
    npcAcaoIndice: parseInteger(
      'SMOKE_NPC_ACAO_INDICE',
      values.SMOKE_NPC_ACAO_INDICE,
      0,
    ),
  };
}

export function construirIntencoesSmoke(
  config: SmokeConfig,
  uuid: () => string = randomUUID,
): SmokeRollIntent[] {
  const fonteHabilidade = {
    personagemSessaoId: config.personagemSessaoId,
    habilidadeTecnicaId: config.habilidadeTecnicaId,
    ...(config.variacaoHabilidadeId
      ? { variacaoHabilidadeId: config.variacaoHabilidadeId }
      : {}),
    ...(config.acumulos ? { acumulos: config.acumulos } : {}),
  };

  return [
    {
      nome: 'formula simples',
      tipoEsperado: 'FORMULA',
      payload: {
        tipo: 'FORMULA',
        expressao: '1d20',
        contexto: { tipo: 'OUTRO' },
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'pericia de personagem',
      tipoEsperado: 'PERICIA_PERSONAGEM',
      payload: {
        tipo: 'PERICIA_PERSONAGEM',
        personagemSessaoId: config.personagemSessaoId,
        periciaCodigo: config.personagemPericiaCodigo,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'ataque de personagem',
      tipoEsperado: 'ATAQUE_PERSONAGEM',
      payload: {
        tipo: 'ATAQUE_PERSONAGEM',
        personagemSessaoId: config.personagemSessaoId,
        periciaCodigo: config.personagemAtaqueCodigo,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'teste de habilidade',
      tipoEsperado: 'TESTE_HABILIDADE_PERSONAGEM',
      payload: {
        tipo: 'TESTE_HABILIDADE_PERSONAGEM',
        personagemSessaoId: config.personagemSessaoId,
        habilidadeTecnicaId: config.habilidadeTecnicaId,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'dano de habilidade',
      tipoEsperado: 'DANO_PERSONAGEM',
      payload: {
        tipo: 'DANO_PERSONAGEM',
        origemDano: 'HABILIDADE_TECNICA',
        ...fonteHabilidade,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'critico de habilidade',
      tipoEsperado: 'CRITICO_PERSONAGEM',
      payload: {
        tipo: 'CRITICO_PERSONAGEM',
        origemCritico: 'HABILIDADE_TECNICA',
        ...fonteHabilidade,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'pericia de NPC',
      tipoEsperado: 'PERICIA_NPC',
      payload: {
        tipo: 'PERICIA_NPC',
        npcSessaoId: config.npcSessaoId,
        periciaCodigo: config.npcPericiaCodigo,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'ataque de NPC',
      tipoEsperado: 'ATAQUE_NPC',
      payload: {
        tipo: 'ATAQUE_NPC',
        origemAtaque: 'ACAO',
        npcSessaoId: config.npcSessaoId,
        acaoIndice: config.npcAcaoIndice,
        clientRequestId: uuid(),
      },
    },
    {
      nome: 'dano de NPC',
      tipoEsperado: 'DANO_NPC',
      payload: {
        tipo: 'DANO_NPC',
        origemDano: 'ACAO',
        npcSessaoId: config.npcSessaoId,
        acaoIndice: config.npcAcaoIndice,
        clientRequestId: uuid(),
      },
    },
  ];
}

function splitSetCookieHeader(raw: string): string[] {
  return raw.split(/,(?=\s*[^;,\s]+=)/g);
}

export class SmokeCookieJar {
  private readonly cookies = new Map<string, string>();

  capture(headers: Headers) {
    const headersWithCookies = headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies =
      headersWithCookies.getSetCookie?.() ??
      (headers.get('set-cookie')
        ? splitSetCookieHeader(headers.get('set-cookie') as string)
        : []);

    for (const setCookie of setCookies) {
      const [pair, ...attributes] = setCookie.split(';');
      const separator = pair.indexOf('=');
      if (separator <= 0) continue;
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      const expired = attributes.some((attribute) =>
        /^\s*max-age=0\s*$/i.test(attribute),
      );
      if (!value || expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  header(): string | undefined {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  get(name: string): string | undefined {
    return this.cookies.get(name);
  }
}

class SmokeHttpClient {
  private readonly cookies = new SmokeCookieJar();

  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike,
  ) {}

  async request<T>(
    operacao: string,
    path: string,
    init: { method?: string; body?: unknown; authenticated?: boolean } = {},
  ): Promise<T> {
    const method = init.method ?? 'GET';
    const headers = new Headers({ Accept: 'application/json' });
    if (init.body !== undefined)
      headers.set('Content-Type', 'application/json');
    if (init.authenticated !== false) {
      const cookie = this.cookies.header();
      if (cookie) headers.set('Cookie', cookie);
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrf = this.cookies.get(COOKIE_CSRF);
        if (!csrf) {
          throw new SmokeExecutionError(
            `${operacao} foi bloqueada: cookie CSRF ausente.`,
          );
        }
        headers.set('x-csrf-token', csrf);
      }
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      redirect: 'manual',
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    });
    this.cookies.capture(response.headers);
    const body = await parseResponseBody(response);
    if (!response.ok) {
      const code =
        isRecord(body) && typeof body.code === 'string' ? body.code : undefined;
      throw new SmokeHttpError(operacao, response.status, code);
    }
    return body as T;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getArray(record: Record<string, unknown>, key: string): unknown[] {
  return Array.isArray(record[key]) ? record[key] : [];
}

function getRequiredRecord(
  record: Record<string, unknown>,
  key: string,
  descricao: string,
): Record<string, unknown> {
  const value = record[key];
  if (!isRecord(value)) {
    throw new SmokeExecutionError(`${descricao} ausente no detalhe da sessao.`);
  }
  return value;
}

function findByInteger(
  values: unknown[],
  key: string,
  expected: number,
): Record<string, unknown> | null {
  return (
    (values.find((value) => isRecord(value) && value[key] === expected) as
      | Record<string, unknown>
      | undefined) ?? null
  );
}

function hasStructuredValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return false;
}

function listTechniqueAbilities(card: Record<string, unknown>) {
  const techniques = [
    ...(isRecord(card.tecnicaInata) ? [card.tecnicaInata] : []),
    ...getArray(card, 'tecnicasNaoInatas').filter(isRecord),
  ];
  return techniques.flatMap((technique) =>
    getArray(technique, 'habilidades').filter(isRecord),
  );
}

export function validarFixtureSmoke(
  detalhe: unknown,
  config: SmokeConfig,
): void {
  if (!isRecord(detalhe)) {
    throw new SmokeExecutionError('Detalhe da sessao possui formato invalido.');
  }
  if (
    detalhe.id !== config.sessaoId ||
    detalhe.campanhaId !== config.campanhaId
  ) {
    throw new SmokeExecutionError('Sessao retornada nao corresponde ao alvo.');
  }
  if (detalhe.titulo !== config.expectedSessionTitle) {
    throw new SmokeExecutionError(
      'Titulo da sessao nao corresponde ao esperado.',
    );
  }
  if (detalhe.status === 'ENCERRADA') {
    throw new SmokeExecutionError('A sessao descartavel esta encerrada.');
  }
  if (detalhe.efeitosTurnoPendentes) {
    throw new SmokeExecutionError(
      'A sessao possui efeitos de turno pendentes.',
    );
  }

  const permissoes = getRequiredRecord(detalhe, 'permissoes', 'Permissoes');
  if (permissoes.ehMestre !== true) {
    throw new SmokeExecutionError(
      'A conta de smoke precisa ser mestre para cobrir rolagens de NPC.',
    );
  }

  const card = findByInteger(
    getArray(detalhe, 'cards'),
    'personagemSessaoId',
    config.personagemSessaoId,
  );
  if (!card || card.nomePersonagem !== config.expectedCharacterName) {
    throw new SmokeExecutionError(
      'Personagem descartavel nao corresponde ao esperado.',
    );
  }
  if (!isRecord(card.recursos)) {
    throw new SmokeExecutionError(
      'Recursos do personagem nao estao disponiveis.',
    );
  }
  const pericias = getArray(card, 'pericias').filter(isRecord);
  for (const codigo of [
    config.personagemPericiaCodigo,
    config.personagemAtaqueCodigo,
  ]) {
    if (!pericias.some((pericia) => pericia.codigo === codigo)) {
      throw new SmokeExecutionError(
        'Pericia configurada nao existe no personagem.',
      );
    }
  }

  const possuiPeritoPendente = getArray(card, 'habilidadesClasse')
    .filter(isRecord)
    .some((habilidade) => Boolean(habilidade.efeitoPendente));
  if (possuiPeritoPendente) {
    throw new SmokeExecutionError(
      'O personagem possui Perito pendente; use uma fixture sem consumo pendente.',
    );
  }

  const habilidade = findByInteger(
    listTechniqueAbilities(card),
    'id',
    config.habilidadeTecnicaId,
  );
  if (!habilidade) {
    throw new SmokeExecutionError(
      'Habilidade estruturada nao existe no personagem.',
    );
  }
  if (!hasStructuredValue(habilidade.testesExigidos)) {
    throw new SmokeExecutionError('Habilidade nao possui teste estruturado.');
  }

  const variacao = config.variacaoHabilidadeId
    ? findByInteger(
        getArray(habilidade, 'variacoes'),
        'id',
        config.variacaoHabilidadeId,
      )
    : null;
  if (config.variacaoHabilidadeId && !variacao) {
    throw new SmokeExecutionError(
      'Variacao estruturada nao pertence a habilidade.',
    );
  }
  const fonteDano = variacao ?? habilidade;
  if (
    !hasStructuredValue(fonteDano.dadosDano) &&
    typeof fonteDano.danoFlat !== 'number'
  ) {
    throw new SmokeExecutionError(
      'Fonte selecionada nao possui dano estruturado.',
    );
  }
  const npc = findByInteger(
    getArray(detalhe, 'npcs'),
    'npcSessaoId',
    config.npcSessaoId,
  );
  if (!npc || npc.nome !== config.expectedNpcName) {
    throw new SmokeExecutionError(
      'NPC descartavel nao corresponde ao esperado.',
    );
  }
  if (
    !getArray(npc, 'pericias')
      .filter(isRecord)
      .some((pericia) => pericia.codigo === config.npcPericiaCodigo)
  ) {
    throw new SmokeExecutionError('Pericia configurada nao existe no NPC.');
  }
  const acao = getArray(npc, 'acoes')[config.npcAcaoIndice];
  if (
    !isRecord(acao) ||
    typeof acao.teste !== 'string' ||
    !acao.teste.trim() ||
    typeof acao.dano !== 'string' ||
    !acao.dano.trim()
  ) {
    throw new SmokeExecutionError(
      'Acao de NPC precisa ter teste e dano persistidos.',
    );
  }
}

function normalizeForSnapshot(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForSnapshot);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, normalizeForSnapshot(entry)]),
  );
}

export function capturarInvariantesSessao(detalhe: unknown): unknown {
  if (!isRecord(detalhe)) {
    throw new SmokeExecutionError('Detalhe da sessao possui formato invalido.');
  }
  return normalizeForSnapshot({
    status: detalhe.status,
    rodadaAtual: detalhe.rodadaAtual,
    indiceTurnoAtual: detalhe.indiceTurnoAtual,
    personagens: getArray(detalhe, 'cards')
      .filter(isRecord)
      .map((card) => ({
        personagemSessaoId: card.personagemSessaoId,
        recursos: card.recursos,
        condicoesAtivas: card.condicoesAtivas,
        sustentacoesAtivas: card.sustentacoesAtivas,
      }))
      .sort(
        (left, right) =>
          Number(left.personagemSessaoId) - Number(right.personagemSessaoId),
      ),
    npcs: getArray(detalhe, 'npcs')
      .filter(isRecord)
      .map((npc) => ({
        npcSessaoId: npc.npcSessaoId,
        pontosVidaAtual: npc.pontosVidaAtual,
        sanAtual: npc.sanAtual,
        eaAtual: npc.eaAtual,
        condicoesAtivas: npc.condicoesAtivas,
      }))
      .sort(
        (left, right) => Number(left.npcSessaoId) - Number(right.npcSessaoId),
      ),
  });
}

export function assertInvariantesPreservadas(before: unknown, after: unknown) {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new SmokeExecutionError(
      'PV, SAN, EA, PE, turno, sustentacoes ou condicoes mudaram durante o smoke.',
    );
  }
}

function validarEventoRolagem(
  evento: unknown,
  intencao: SmokeRollIntent,
): { id: number } {
  if (!isRecord(evento) || !Number.isInteger(evento.id)) {
    throw new SmokeExecutionError(`${intencao.nome}: evento CHAT invalido.`);
  }
  const dadosRolagem = evento.dadosRolagem;
  if (!isRecord(dadosRolagem) || dadosRolagem.origem !== 'SERVIDOR') {
    throw new SmokeExecutionError(`${intencao.nome}: origem nao e SERVIDOR.`);
  }
  const tipoValido =
    intencao.tipoEsperado === 'FORMULA'
      ? dadosRolagem.tipo === undefined || dadosRolagem.tipo === 'FORMULA'
      : dadosRolagem.tipo === intencao.tipoEsperado;
  if (
    !tipoValido ||
    dadosRolagem.clientRequestId !== intencao.payload.clientRequestId
  ) {
    throw new SmokeExecutionError(
      `${intencao.nome}: retorno nao corresponde a intencao.`,
    );
  }
  return { id: evento.id as number };
}

function buildRollPath(config: SmokeConfig) {
  return `/campanhas/${config.campanhaId}/sessoes/${config.sessaoId}/rolagens`;
}

function buildSessionPath(config: SmokeConfig) {
  return `/campanhas/${config.campanhaId}/sessoes/${config.sessaoId}`;
}

async function verificarRotaProtegida(
  config: SmokeConfig,
  fetchImpl: FetchLike,
  uuid: () => string,
) {
  const response = await fetchImpl(
    `${config.baseUrl}${buildRollPath(config)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'FORMULA',
        expressao: '1d20',
        clientRequestId: uuid(),
      }),
      redirect: 'manual',
    },
  );
  if (response.status !== 401) {
    throw new SmokeExecutionError(
      `Rota sem autenticacao deveria retornar 401, mas retornou ${response.status}.`,
    );
  }
}

export async function executarSmokeAutenticado(
  config: SmokeConfig,
  dependencies: SmokeDependencies = {},
): Promise<SmokeRunResult> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const logger = dependencies.logger ?? console;
  const uuid = dependencies.uuid ?? randomUUID;
  const client = new SmokeHttpClient(config.baseUrl, fetchImpl);

  logger.info('[smoke] Validando protecao da rota sem autenticacao.');
  await verificarRotaProtegida(config, fetchImpl, uuid);

  let autenticado = false;
  try {
    logger.info('[smoke] Autenticando conta descartavel.');
    await client.request('Login', '/auth/login', {
      method: 'POST',
      authenticated: false,
      body: { email: config.email, senha: config.password, rememberMe: false },
    });
    autenticado = true;

    logger.info(
      '[smoke] Validando fixture descartavel e invariantes iniciais.',
    );
    const detalheAntes = await client.request<unknown>(
      'Leitura inicial da sessao',
      buildSessionPath(config),
    );
    validarFixtureSmoke(detalheAntes, config);
    const snapshotAntes = capturarInvariantesSessao(detalheAntes);

    const chatAntes = await client.request<unknown[]>(
      'Leitura inicial do chat',
      `${buildSessionPath(config)}/chat`,
    );
    if (
      !Array.isArray(chatAntes) ||
      chatAntes.length >= LIMITE_EVENTOS_CHAT_PREFLIGHT
    ) {
      throw new SmokeExecutionError(
        'A sessao descartavel possui chat demais para uma verificacao inequivoca.',
      );
    }

    const intents = construirIntencoesSmoke(config, uuid);
    const eventos: Array<{ id: number; intencao: SmokeRollIntent }> = [];
    for (const intencao of intents) {
      logger.info(`[smoke] Executando ${intencao.nome}.`);
      const evento = await client.request<unknown>(
        `Rolagem: ${intencao.nome}`,
        buildRollPath(config),
        { method: 'POST', body: intencao.payload },
      );
      eventos.push({ ...validarEventoRolagem(evento, intencao), intencao });
    }

    const critico = eventos.find(
      ({ intencao }) => intencao.tipoEsperado === 'CRITICO_PERSONAGEM',
    );
    if (!critico) {
      throw new SmokeExecutionError('Intencao de critico nao foi executada.');
    }
    logger.info('[smoke] Repetindo uma intencao para validar idempotencia.');
    const replay = await client.request<unknown>(
      'Replay idempotente',
      buildRollPath(config),
      { method: 'POST', body: critico.intencao.payload },
    );
    const replayValidado = validarEventoRolagem(replay, critico.intencao);
    if (replayValidado.id !== critico.id) {
      throw new SmokeExecutionError('Replay idempotente criou outro evento.');
    }

    const chatDepois = await client.request<unknown[]>(
      'Leitura final do chat',
      `${buildSessionPath(config)}/chat`,
    );
    const chatIds = new Set(
      (Array.isArray(chatDepois) ? chatDepois : [])
        .filter(isRecord)
        .map((evento) => evento.id)
        .filter((id): id is number => Number.isInteger(id)),
    );
    if (eventos.some((evento) => !chatIds.has(evento.id))) {
      throw new SmokeExecutionError('Nem todos os eventos aparecem no chat.');
    }
    if (
      (Array.isArray(chatDepois) ? chatDepois : [])
        .filter(isRecord)
        .filter((evento) => evento.id === critico.id).length !== 1
    ) {
      throw new SmokeExecutionError('Replay duplicou o evento no chat.');
    }

    const timeline = await client.request<unknown[]>(
      'Leitura final da timeline',
      `${buildSessionPath(config)}/eventos?limit=200&incluirChat=true`,
    );
    const timelineIds = new Set(
      (Array.isArray(timeline) ? timeline : [])
        .filter(isRecord)
        .map((evento) => evento.id)
        .filter((id): id is number => Number.isInteger(id)),
    );
    if (eventos.some((evento) => !timelineIds.has(evento.id))) {
      throw new SmokeExecutionError(
        'Nem todos os eventos aparecem na timeline.',
      );
    }

    const detalheDepois = await client.request<unknown>(
      'Leitura final da sessao',
      buildSessionPath(config),
    );
    assertInvariantesPreservadas(
      snapshotAntes,
      capturarInvariantesSessao(detalheDepois),
    );

    logger.info(
      '[smoke] Smoke autenticado concluido sem alterar estado mecanico.',
    );
    return {
      rolagensValidadas: eventos.length,
      replayIdempotenteValidado: true,
      invariantesPreservadas: true,
    };
  } finally {
    if (autenticado) {
      try {
        await client.request('Logout', '/auth/logout', { method: 'POST' });
      } catch {
        logger.warn(
          '[smoke] Nao foi possivel encerrar a sessao de autenticacao.',
        );
      }
    }
  }
}

export async function executarComandoSmoke(
  args: string[],
  env: NodeJS.ProcessEnv,
  dependencies: SmokeCommandDependencies = {},
): Promise<number> {
  const logger = dependencies.logger ?? console;
  const command = args[0];
  if (command === '--help' || command === '-h') {
    logger.info(SMOKE_HELP);
    return 0;
  }
  if (!['--validate-config', '--dry-run', '--run'].includes(command ?? '')) {
    logger.error(SMOKE_HELP);
    return 2;
  }

  let config: SmokeConfig;
  try {
    config = carregarSmokeConfig(env);
  } catch (error) {
    logger.error(sanitizarErroSmoke(error));
    return 2;
  }

  logger.info(`[smoke] Configuracao valida para alvo ${config.target}.`);
  if (command === '--validate-config') return 0;

  const intents = construirIntencoesSmoke(config, dependencies.uuid);
  logger.info(
    `[smoke] Plano: ${intents.map((intencao) => intencao.nome).join(', ')}.`,
  );
  if (command === '--dry-run') {
    logger.info(
      '[smoke] Dry-run concluido; nenhuma chamada HTTP foi executada.',
    );
    return 0;
  }

  try {
    const run = dependencies.run ?? executarSmokeAutenticado;
    await run(config, dependencies);
    return 0;
  } catch (error) {
    logger.error(sanitizarErroSmoke(error));
    return 1;
  }
}

export function sanitizarErroSmoke(error: unknown): string {
  if (
    error instanceof SmokeConfigError ||
    error instanceof SmokeExecutionError
  ) {
    return `[smoke] ${error.message}`;
  }
  return '[smoke] Falha inesperada. Consulte logs seguros do servico sem expor credenciais.';
}
