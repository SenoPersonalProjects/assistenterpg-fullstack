const { chromium, request } = require('playwright');
const fs = require('fs');
const path = require('path');

const FRONT_BASE = 'http://localhost:3001';
const BACK_BASE = 'http://localhost:3000';
const CHARACTER_ID = 1;

const LOGIN_EMAIL = 'front.wizard.smoke@test.local';
const LOGIN_PASSWORD = 'FrontSmoke123';

const OUT_DIR = path.join(process.cwd(), 'evidence', 'front-smoke-2026-03-05', 'visual');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function getToken() {
  const api = await request.newContext({ baseURL: BACK_BASE });
  const res = await api.post('/auth/login', {
    data: {
      email: LOGIN_EMAIL,
      senha: LOGIN_PASSWORD,
    },
  });

  if (![200, 201].includes(res.status())) {
    const body = await res.text();
    throw new Error(`Falha no login (${res.status()}): ${body}`);
  }

  const body = await res.json();
  await api.dispose();

  if (!body?.access_token) {
    throw new Error('Login retornou sem access_token.');
  }

  return body.access_token;
}

async function clickNext(page) {
  const btn = page.getByRole('button', { name: /Avan/i }).first();
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  await page.waitForTimeout(500);
}

async function goToStep10FromEdit(page) {
  await page.goto(`${FRONT_BASE}/personagens-base/${CHARACTER_ID}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Editar/i }).first().waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: /Editar/i }).first().click();

  await page.getByText(/Etapa 1 de 11/i).first().waitFor({ timeout: 30000 });

  for (let i = 0; i < 9; i++) {
    await clickNext(page);
  }

  await page.getByText(/Etapa 10 de 11/i).first().waitFor({ timeout: 30000 });
}

async function captureScenario(browser, {
  name,
  file,
  routeMode,
  waitText,
}) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  let routeHits = 0;
  const previewResponses = [];

  page.on('response', async (res) => {
    if (!res.url().includes('/personagens-base/preview')) return;
    let body;
    try {
      body = await res.json();
    } catch {
      try {
        body = await res.text();
      } catch {
        body = null;
      }
    }
    const summary =
      body && typeof body === 'object' && !Array.isArray(body)
        ? {
            code: body.code ?? null,
            message: body.message ?? null,
            hasErrosItens: Array.isArray(body.errosItens) && body.errosItens.length > 0,
            errosItens: body.errosItens ?? null,
            espacosInventario: body.espacosInventario ?? null,
            trilhaId: body.trilhaId ?? null,
            caminhoId: body.caminhoId ?? null,
          }
        : body;

    previewResponses.push({
      status: res.status(),
      summary,
    });
    if (previewResponses.length > 4) {
      previewResponses.shift();
    }
  });

  const token = await getToken();
  await page.goto(`${FRONT_BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((value) => {
    window.localStorage.setItem('assistenterpg_token', value);
  }, token);

  await goToStep10FromEdit(page);

  if (routeMode) {
    await page.route('**/personagens-base/preview', async (route) => {
      try {
        routeHits += 1;
        const req = route.request();
        if (req.method() !== 'POST') {
          await route.continue();
          return;
        }

        const raw = req.postData();
        if (!raw) {
          await route.continue();
          return;
        }

        let payload = {};
        try {
          payload = JSON.parse(raw);
        } catch {
          await route.continue();
          return;
        }

        if (routeMode === 'global_error') {
          payload.trilhaId = null;
          payload.caminhoId = 1;
        }

        if (routeMode === 'item_error') {
          payload.itensInventario = [
            {
              equipamentoId: 999999,
              quantidade: 1,
              equipado: false,
              modificacoesIds: [],
            },
          ];
        }

        await route.continue({
          method: req.method(),
          postData: JSON.stringify(payload),
          headers: {
            ...req.headers(),
            'content-type': 'application/json',
          },
        });
      } catch {
        await route.continue();
      }
    });
  }

  await clickNext(page);

  await page.getByText(/Revisão final|Revisao final/i).first().waitFor({ timeout: 25000 });

  if (waitText) {
    try {
      await page.getByText(waitText, { exact: false }).first().waitFor({ timeout: 25000 });
    } catch {
      // Não aborta evidência se o texto exato variar.
    }
  }

  await page.waitForTimeout(2200);

  if (name === 'estado-inventario') {
    try {
      await page.getByText(/^Inventário$/i).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    } catch {
      // Mantém captura mesmo se o scroll falhar.
    }
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
  }

  const outPath = path.join(OUT_DIR, file);
  await page.screenshot({ path: outPath, fullPage: false });

  await context.close();
  return { outPath, routeHits, previewResponses };
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const outputs = [];

    outputs.push(
      await captureScenario(browser, {
        name: 'erro-global',
        file: 'visual-a-erro-global-revisao.png',
        routeMode: 'global_error',
        waitText: /Erro|Atenção|Atencao|Dados inválidos|Dados invalidos|caminho/i,
      }),
    );

    outputs.push(
      await captureScenario(browser, {
        name: 'erros-itens',
        file: 'visual-b-erro-por-item-errosItens.png',
        routeMode: 'item_error',
        waitText: /inventário possui inconsistências|inventario possui inconsistencias|Equipamento 999999|Equipamento não encontrado|Erros de inventário/i,
      }),
    );

    outputs.push(
      await captureScenario(browser, {
        name: 'estado-inventario',
        file: 'visual-c-estado-inventario.png',
        routeMode: null,
        waitText: /Capacidade de carga|Espaços restantes|Espacos restantes|Estado/i,
      }),
    );

    const reportPath = path.join(OUT_DIR, 'visual-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          files: outputs.map((f) => ({
            file: path.relative(process.cwd(), f.outPath),
            routeHits: f.routeHits,
            previewResponses: f.previewResponses,
          })),
        },
        null,
        2,
      ),
      'utf8',
    );

    console.log('VISUAL_EVIDENCE_OK');
    console.log(outputs.map((o) => `${o.outPath} (routeHits=${o.routeHits})`).join('\n'));
    console.log(reportPath);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('VISUAL_EVIDENCE_ERROR');
  console.error(error);
  process.exit(1);
});
