import {
  SmokeConfigError,
  SmokeCookieJar,
  assertInvariantesPreservadas,
  capturarInvariantesSessao,
  carregarSmokeConfig,
  construirIntencoesSmoke,
  executarComandoSmoke,
  executarSmokeAutenticado,
  validarFixtureSmoke,
} from './smoke-rolagens-autoritativas';

const validEnv: NodeJS.ProcessEnv = {
  SMOKE_TARGET: 'LOCAL',
  SMOKE_BASE_URL: 'http://localhost:3000',
  SMOKE_EMAIL: 'smoke@example.test',
  SMOKE_PASSWORD: 'senha-descartavel',
  SMOKE_CAMPANHA_ID: '10',
  SMOKE_SESSAO_ID: '20',
  SMOKE_EXPECTED_SESSION_TITLE: 'Smoke descartavel',
  SMOKE_PERSONAGEM_SESSAO_ID: '30',
  SMOKE_EXPECTED_CHARACTER_NAME: 'Personagem Smoke',
  SMOKE_PERSONAGEM_PERICIA_CODIGO: 'percepcao',
  SMOKE_PERSONAGEM_ATAQUE_CODIGO: 'luta',
  SMOKE_HABILIDADE_TECNICA_ID: '40',
  SMOKE_NPC_SESSAO_ID: '50',
  SMOKE_EXPECTED_NPC_NAME: 'NPC Smoke',
  SMOKE_NPC_PERICIA_CODIGO: 'fortitude',
  SMOKE_NPC_ACAO_INDICE: '0',
  SMOKE_CONFIRMATION: 'EXECUTAR ROLAGENS NA SESSAO DESCARTAVEL',
};

function criarDetalheValido() {
  return {
    id: 20,
    campanhaId: 10,
    titulo: 'Smoke descartavel',
    status: 'EM_ANDAMENTO',
    rodadaAtual: 1,
    indiceTurnoAtual: 0,
    efeitosTurnoPendentes: null,
    permissoes: { ehMestre: true },
    cards: [
      {
        personagemSessaoId: 30,
        nomePersonagem: 'Personagem Smoke',
        recursos: {
          pvAtual: 20,
          pvMax: 20,
          peAtual: 10,
          peMax: 10,
          eaAtual: 8,
          eaMax: 8,
          sanAtual: 15,
          sanMax: 15,
        },
        pericias: [{ codigo: 'PERCEPCAO' }, { codigo: 'LUTA' }],
        habilidadesClasse: [],
        tecnicaInata: {
          habilidades: [
            {
              id: 40,
              testesExigidos: [{ pericia: 'JUJUTSU' }],
              dadosDano: [{ quantidade: 1, faces: 8 }],
              danoFlat: null,
              criticoMultiplicador: null,
              variacoes: [
                {
                  id: 41,
                  dadosDano: [{ quantidade: 2, faces: 6 }],
                  danoFlat: 2,
                  criticoMultiplicador: 3,
                },
              ],
            },
          ],
        },
        tecnicasNaoInatas: [],
        condicoesAtivas: [],
        sustentacoesAtivas: [],
      },
    ],
    npcs: [
      {
        npcSessaoId: 50,
        nome: 'NPC Smoke',
        pontosVidaAtual: 30,
        sanAtual: null,
        eaAtual: null,
        pericias: [{ codigo: 'FORTITUDE' }],
        acoes: [{ nome: 'Golpe', teste: '2d20+5', dano: '2d8+3' }],
        condicoesAtivas: [],
      },
    ],
  };
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has('Content-Type')) {
    responseHeaders.set('Content-Type', 'application/json');
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}

describe('smoke autenticado de rolagens autoritativas', () => {
  it('falha fechado e lista somente nomes de variaveis quando a configuracao falta', () => {
    expect(() => carregarSmokeConfig({})).toThrow(SmokeConfigError);

    try {
      carregarSmokeConfig({});
      throw new Error('deveria falhar');
    } catch (error) {
      expect(error).toBeInstanceOf(SmokeConfigError);
      expect((error as SmokeConfigError).variables).toContain('SMOKE_PASSWORD');
      expect((error as Error).message).not.toContain('senha-descartavel');
    }
  });

  it('exige uma segunda confirmacao para producao', () => {
    expect(() =>
      carregarSmokeConfig({
        ...validEnv,
        SMOKE_TARGET: 'PRODUCTION',
        SMOKE_BASE_URL: 'https://api.example.test',
      }),
    ).toThrow(/SMOKE_PRODUCTION_CONFIRMATION/);

    expect(
      carregarSmokeConfig({
        ...validEnv,
        SMOKE_TARGET: 'PRODUCTION',
        SMOKE_BASE_URL: 'https://api.example.test',
        SMOKE_PRODUCTION_CONFIRMATION:
          'CONFIRMO USO DE DADOS DESCARTAVEIS EM PRODUCAO',
      }).target,
    ).toBe('PRODUCTION');
  });

  it('omite acumulos iguais a um e preserva escalonamento solicitado', () => {
    expect(
      carregarSmokeConfig({ ...validEnv, SMOKE_ACUMULOS: '1' }).acumulos,
    ).toBeUndefined();
    expect(
      carregarSmokeConfig({ ...validEnv, SMOKE_ACUMULOS: '3' }).acumulos,
    ).toBe(3);
  });

  it('monta payloads mecanicos minimos sem formula ou resultado do cliente', () => {
    const config = carregarSmokeConfig({
      ...validEnv,
      SMOKE_VARIACAO_HABILIDADE_ID: '41',
      SMOKE_ACUMULOS: '2',
    });
    let sequence = 0;
    const intents = construirIntencoesSmoke(
      config,
      () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
    );

    expect(intents).toHaveLength(9);
    expect(intents.map((intent) => intent.tipoEsperado)).toEqual([
      'FORMULA',
      'PERICIA_PERSONAGEM',
      'ATAQUE_PERSONAGEM',
      'TESTE_HABILIDADE_PERSONAGEM',
      'DANO_PERSONAGEM',
      'CRITICO_PERSONAGEM',
      'PERICIA_NPC',
      'ATAQUE_NPC',
      'DANO_NPC',
    ]);
    for (const intent of intents.filter(
      ({ tipoEsperado }) => tipoEsperado !== 'FORMULA',
    )) {
      expect(intent.payload).not.toHaveProperty('expressao');
      expect(intent.payload).not.toHaveProperty('dados');
      expect(intent.payload).not.toHaveProperty('total');
      expect(intent.payload).not.toHaveProperty('resultado');
    }
    expect(
      intents.find(({ tipoEsperado }) => tipoEsperado === 'DANO_PERSONAGEM')
        ?.payload,
    ).toMatchObject({ variacaoHabilidadeId: 41, acumulos: 2 });
  });

  it('valida a fixture descartavel e rejeita Perito pendente', () => {
    const config = carregarSmokeConfig(validEnv);
    const detalhe = criarDetalheValido();

    expect(() => validarFixtureSmoke(detalhe, config)).not.toThrow();
    detalhe.cards[0].habilidadesClasse = [
      { efeitoPendente: { id: 'pendente' } },
    ] as never[];
    expect(() => validarFixtureSmoke(detalhe, config)).toThrow(
      /Perito pendente/,
    );
  });

  it('valida variacao pertencente a habilidade', () => {
    const config = carregarSmokeConfig({
      ...validEnv,
      SMOKE_VARIACAO_HABILIDADE_ID: '41',
    });
    expect(() =>
      validarFixtureSmoke(criarDetalheValido(), config),
    ).not.toThrow();
  });

  it('detecta alteracao de recursos e preserva snapshots equivalentes', () => {
    const antes = criarDetalheValido();
    const depois = structuredClone(antes);
    const snapshotAntes = capturarInvariantesSessao(antes);

    expect(() =>
      assertInvariantesPreservadas(
        snapshotAntes,
        capturarInvariantesSessao(depois),
      ),
    ).not.toThrow();

    depois.cards[0].recursos.pvAtual -= 1;
    expect(() =>
      assertInvariantesPreservadas(
        snapshotAntes,
        capturarInvariantesSessao(depois),
      ),
    ).toThrow(/PV, SAN, EA, PE/);
  });

  it('mantem cookies apenas em memoria e remove cookies expirados', () => {
    const jar = new SmokeCookieJar();
    const headers = new Headers();
    headers.append(
      'set-cookie',
      'assistenterpg_access=token; HttpOnly; Path=/',
    );
    headers.append('set-cookie', 'assistenterpg_csrf=csrf; Path=/');
    jar.capture(headers);

    expect(jar.header()).toContain('assistenterpg_access=token');
    expect(jar.get('assistenterpg_csrf')).toBe('csrf');

    const expired = new Headers({
      'set-cookie': 'assistenterpg_access=; Max-Age=0; Path=/',
    });
    jar.capture(expired);
    expect(jar.header()).not.toContain('assistenterpg_access');
  });

  it('nao executa rede ou runner quando variaveis obrigatorias faltam', async () => {
    const run = jest.fn();
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    await expect(
      executarComandoSmoke(['--run'], {}, { run, logger }),
    ).resolves.toBe(2);
    expect(run).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('SMOKE_PASSWORD'),
    );
  });

  it('dry-run valida e descreve o plano sem executar o runner', async () => {
    const run = jest.fn();
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    await expect(
      executarComandoSmoke(['--dry-run'], validEnv, { run, logger }),
    ).resolves.toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('nenhuma chamada HTTP'),
    );
  });

  it('executa o runner somente com --run e configuracao valida', async () => {
    const run = jest.fn().mockResolvedValue({
      rolagensValidadas: 9,
      replayIdempotenteValidado: true,
      invariantesPreservadas: true,
    });
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    await expect(
      executarComandoSmoke(['--run'], validEnv, { run, logger }),
    ).resolves.toBe(0);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('executa o fluxo HTTP completo sem duplicar replay ou expor credenciais', async () => {
    const config = carregarSmokeConfig(validEnv);
    const detalhe = criarDetalheValido();
    const eventos: Array<Record<string, unknown>> = [];
    const requests: Array<{ path: string; method: string; body: unknown }> = [];
    let nextEventId = 100;
    const fetchImpl = jest.fn(
      (input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve().then(() => {
          const inputUrl =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url;
          const url = new URL(inputUrl);
          const method = init?.method ?? 'GET';
          const body =
            typeof init?.body === 'string' ? JSON.parse(init.body) : null;
          requests.push({ path: url.pathname, method, body });

          if (url.pathname.endsWith('/rolagens') && !init?.headers) {
            return jsonResponse({ code: 'AUTH_AUSENTE' }, 401);
          }
          const headers = new Headers(init?.headers);
          if (url.pathname.endsWith('/rolagens') && !headers.has('Cookie')) {
            return jsonResponse({ code: 'AUTH_AUSENTE' }, 401);
          }
          if (url.pathname === '/auth/login') {
            const responseHeaders = new Headers({
              'Content-Type': 'application/json',
            });
            responseHeaders.append(
              'set-cookie',
              'assistenterpg_access=access; HttpOnly; Path=/',
            );
            responseHeaders.append(
              'set-cookie',
              'assistenterpg_csrf=csrf; Path=/',
            );
            return jsonResponse({ usuario: { id: 1 } }, 200, responseHeaders);
          }
          if (url.pathname === '/auth/logout') {
            expect(headers.get('x-csrf-token')).toBe('csrf');
            return jsonResponse({ mensagem: 'ok' });
          }
          if (url.pathname.endsWith('/chat')) {
            return jsonResponse(eventos);
          }
          if (url.pathname.endsWith('/eventos')) {
            return jsonResponse(
              eventos.map((evento) => ({ id: evento.id, dados: evento })),
            );
          }
          if (url.pathname.endsWith('/rolagens')) {
            expect(headers.get('x-csrf-token')).toBe('csrf');
            const payload = body as Record<string, unknown>;
            const repetido = eventos.find(
              (evento) =>
                (evento.dadosRolagem as Record<string, unknown>)
                  .clientRequestId === payload.clientRequestId,
            );
            if (repetido) return jsonResponse(repetido);
            const evento = {
              id: nextEventId++,
              mensagem: 'rolagem',
              dadosRolagem: {
                versao: 1,
                origem: 'SERVIDOR',
                ...(payload.tipo === 'FORMULA' ? {} : { tipo: payload.tipo }),
                clientRequestId: payload.clientRequestId,
                payloads: [],
              },
            };
            eventos.push(evento);
            return jsonResponse(evento);
          }
          if (
            url.pathname ===
            `/campanhas/${config.campanhaId}/sessoes/${config.sessaoId}`
          ) {
            return jsonResponse(detalhe);
          }
          return jsonResponse({ code: 'NOT_FOUND' }, 404);
        }),
    ) as unknown as typeof fetch;
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    let sequence = 0;

    await expect(
      executarSmokeAutenticado(config, {
        fetchImpl,
        logger,
        uuid: () =>
          `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
      }),
    ).resolves.toEqual({
      rolagensValidadas: 9,
      replayIdempotenteValidado: true,
      invariantesPreservadas: true,
    });

    expect(eventos).toHaveLength(9);
    expect(
      requests.filter(({ path }) => path.endsWith('/rolagens')),
    ).toHaveLength(11);
    for (const request of requests.filter(
      ({ path, body }) =>
        path.endsWith('/rolagens') &&
        typeof body === 'object' &&
        body !== null &&
        (body as Record<string, unknown>).tipo !== 'FORMULA',
    )) {
      expect(request.body).not.toHaveProperty('expressao');
      expect(request.body).not.toHaveProperty('total');
    }
    const output = JSON.stringify({
      info: logger.info.mock.calls,
      warn: logger.warn.mock.calls,
      error: logger.error.mock.calls,
    });
    expect(output).not.toContain(validEnv.SMOKE_PASSWORD);
    expect(output).not.toContain(validEnv.SMOKE_EMAIL);
  });
});
