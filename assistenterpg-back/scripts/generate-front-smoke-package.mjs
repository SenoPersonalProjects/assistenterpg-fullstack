import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'front.wizard.smoke@test.local';
const SENHA = 'FrontSmoke123';
const APELIDO = 'FrontSmoke';

const PKG_DIR = path.join('docs', 'front-smoke-2026-03-05');
const FIXTURES_DIR = path.join(PKG_DIR, 'fixtures');
const RESPONSES_DIR = path.join(PKG_DIR, 'responses');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, value) {
  const json = JSON.stringify(value, null, 2);
  await fs.writeFile(filePath, json, 'utf8');
}

function parseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiRequest({
  method,
  endpoint,
  token,
  jsonBody,
  rawBody,
  contentType = 'application/json',
  extraHeaders = {},
}) {
  const headers = { ...extraHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;

  const body =
    rawBody !== undefined
      ? rawBody
      : jsonBody !== undefined
        ? JSON.stringify(jsonBody)
        : undefined;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });
  const text = await response.text();

  return {
    statusCode: response.status,
    body: parseBody(text),
  };
}

function createBasePayload(name) {
  return {
    nome: name,
    nivel: 1,
    claId: 18,
    origemId: 4,
    classeId: 3,
    trilhaId: null,
    caminhoId: null,
    agilidade: 2,
    forca: 2,
    intelecto: 2,
    presenca: 2,
    vigor: 1,
    estudouEscolaTecnica: false,
    idade: null,
    prestigioBase: 0,
    prestigioClaBase: null,
    alinhamentoId: null,
    background: 'Fixture para smoke test front',
    atributoChaveEa: 'INT',
    tecnicaInataId: null,
    proficienciasCodigos: [],
    grausAprimoramento: [],
    grausTreinamento: [],
    poderesGenericos: [],
    passivasAtributoIds: [],
    passivasAtributosAtivos: [],
    passivasAtributosConfig: {},
    periciasClasseEscolhidasCodigos: [],
    periciasOrigemEscolhidasCodigos: [],
    periciasLivresCodigos: [],
    periciasLivresExtras: 0,
    itensInventario: [],
  };
}

async function main() {
  await ensureDir(FIXTURES_DIR);
  await ensureDir(RESPONSES_DIR);

  // Register user (ignore non-201 if already exists).
  await apiRequest({
    method: 'POST',
    endpoint: '/auth/register',
    jsonBody: { apelido: APELIDO, email: EMAIL, senha: SENHA },
  });

  const login = await apiRequest({
    method: 'POST',
    endpoint: '/auth/login',
    jsonBody: { email: EMAIL, senha: SENHA },
  });
  if (login.statusCode !== 201 || !login.body?.access_token) {
    throw new Error(`Login failed: ${JSON.stringify(login)}`);
  }
  const token = login.body.access_token;
  const userId = login.body.usuario?.id;
  const role = login.body.usuario?.role;

  // Ensure fixture character exists.
  const meus = await apiRequest({
    method: 'GET',
    endpoint: '/personagens-base/meus',
    token,
  });
  if (meus.statusCode !== 200 || !Array.isArray(meus.body)) {
    throw new Error(`Failed to list characters: ${JSON.stringify(meus)}`);
  }
  let fixtureChar = meus.body.find((p) => p.nome === 'Smoke Wizard Base');

  if (!fixtureChar) {
    const createRes = await apiRequest({
      method: 'POST',
      endpoint: '/personagens-base',
      token,
      jsonBody: createBasePayload('Smoke Wizard Base'),
    });
    if (createRes.statusCode !== 201) {
      throw new Error(`Failed to create fixture: ${JSON.stringify(createRes)}`);
    }
    fixtureChar = createRes.body;
  }

  const fixtureId = fixtureChar.id;

  // Export valid.
  const exportRes = await apiRequest({
    method: 'GET',
    endpoint: `/personagens-base/${fixtureId}/exportar`,
    token,
  });
  await writeJson(path.join(RESPONSES_DIR, 'export-valido.response.json'), exportRes);
  await writeJson(path.join(FIXTURES_DIR, 'personagem-export-valido.json'), exportRes.body);

  // Import valid.
  const importPayload = {
    schema: exportRes.body.schema,
    schemaVersion: exportRes.body.schemaVersion,
    exportadoEm: exportRes.body.exportadoEm,
    nomeSobrescrito: 'Smoke Importado V1',
    personagem: exportRes.body.personagem,
    referencias: exportRes.body.referencias,
  };
  await writeJson(path.join(FIXTURES_DIR, 'personagem-import-valido.json'), importPayload);
  const importValid = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/importar',
    token,
    jsonBody: importPayload,
  });
  await writeJson(path.join(RESPONSES_DIR, 'import-valido.response.json'), importValid);

  // Import invalid reference.
  const invalidRef = JSON.parse(JSON.stringify(importPayload));
  invalidRef.personagem.claId = 999999;
  invalidRef.referencias.cla.id = 999999;
  invalidRef.referencias.cla.nome = 'CLA_INEXISTENTE_TESTE';
  await writeJson(
    path.join(FIXTURES_DIR, 'personagem-import-referencia-invalida.json'),
    invalidRef,
  );
  const importInvalidRef = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/importar',
    token,
    jsonBody: invalidRef,
  });
  await writeJson(
    path.join(RESPONSES_DIR, 'import-referencia-invalida.response.json'),
    importInvalidRef,
  );

  // Import malformed JSON.
  const importMalformed = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/importar',
    token,
    rawBody: '{"schema":"assistenterpg.personagem-base.v1","personagem":{',
  });
  await writeJson(
    path.join(RESPONSES_DIR, 'import-json-malformado.response.json'),
    importMalformed,
  );

  // Preview: invalid item (returns 201 with top-level errosItens).
  const previewItemInvalid = createBasePayload('Preview Itens Invalidos');
  previewItemInvalid.itensInventario = [
    { equipamentoId: 999999, quantidade: 1, equipado: false, modificacoesIds: [] },
  ];
  const previewA = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/preview',
    token,
    jsonBody: previewItemInvalid,
  });
  await writeJson(
    path.join(RESPONSES_DIR, 'preview-itens-retorna-errosItens.response.json'),
    previewA,
  );

  // Preview: details without errosItens.
  const previewAttrInvalid = createBasePayload('Preview Erro Soma');
  previewAttrInvalid.agilidade = 1;
  previewAttrInvalid.forca = 1;
  previewAttrInvalid.intelecto = 1;
  previewAttrInvalid.presenca = 1;
  previewAttrInvalid.vigor = 1;
  const previewB = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/preview',
    token,
    jsonBody: previewAttrInvalid,
  });
  await writeJson(path.join(RESPONSES_DIR, 'preview-erro-atributos.response.json'), previewB);

  // Preview: code/message only (no details).
  const previewPathInvalid = createBasePayload('Preview Erro Caminho');
  previewPathInvalid.caminhoId = 1;
  const previewC = await apiRequest({
    method: 'POST',
    endpoint: '/personagens-base/preview',
    token,
    jsonBody: previewPathInvalid,
  });
  await writeJson(
    path.join(RESPONSES_DIR, 'preview-erro-caminho-sem-trilha.response.json'),
    previewC,
  );

  // CORS preflight.
  const corsResponse = await fetch(`${BASE_URL}/personagens-base/meus`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3001',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  const corsData = {
    statusCode: corsResponse.status,
    accessControlAllowOrigin: corsResponse.headers.get('access-control-allow-origin'),
    accessControlAllowCredentials: corsResponse.headers.get(
      'access-control-allow-credentials',
    ),
    accessControlAllowMethods: corsResponse.headers.get('access-control-allow-methods'),
  };
  await writeJson(
    path.join(RESPONSES_DIR, 'cors-preflight-localhost-3001.response.json'),
    corsData,
  );

  const metadata = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    frontendAllowedOrigin: 'http://localhost:3001',
    openApiUrl: `${BASE_URL}/docs/openapi.json`,
    smokeUser: {
      email: EMAIL,
      senha: SENHA,
      userId,
      role,
    },
    fixtureCharacter: {
      id: fixtureId,
      nome: 'Smoke Wizard Base',
    },
    notes: [
      'POST /personagens-base/preview currently does not emit HTTP error payload with details.errosItens.',
      'Inventory item failures in preview return 201 with top-level errosItens array in response body.',
    ],
  };
  await writeJson(path.join(PKG_DIR, 'metadata.json'), metadata);

  const curl = `# Login
curl -X POST ${BASE_URL}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"${EMAIL}","senha":"${SENHA}"}'

# Export
curl -X GET ${BASE_URL}/personagens-base/${fixtureId}/exportar \\
  -H "Authorization: Bearer <TOKEN>"

# Import valid
curl -X POST ${BASE_URL}/personagens-base/importar \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  --data-binary @fixtures/personagem-import-valido.json

# Import invalid reference
curl -X POST ${BASE_URL}/personagens-base/importar \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  --data-binary @fixtures/personagem-import-referencia-invalida.json
`;
  await fs.writeFile(path.join(PKG_DIR, 'curl-snippets.txt'), curl, 'utf8');

  console.log('PACKAGE_READY');
  console.log(`PKG_PATH=${PKG_DIR}`);
  console.log(`FIXTURE_USER=${EMAIL}`);
  console.log(`FIXTURE_CHAR_ID=${fixtureId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
