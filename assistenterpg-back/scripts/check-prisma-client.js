#!/usr/bin/env node

/**
 * Ensures Prisma Client is available before backend build.
 *
 * Flow:
 * 1) validate required exports from @prisma/client;
 * 2) if missing, try `prisma generate` automatically (unless disabled);
 * 3) validate again and fail with actionable message.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const REQUIRED_EXPORTS = ['PrismaClient', 'RoleUsuario'];

function printHeader(msg) {
  console.error(`\n${msg}`);
}

function printManualHelp(extra = '') {
  printHeader('Prisma Client nao esta pronto para compilar o backend.');
  console.error('   Execute manualmente:');
  console.error("   DATABASE_URL='<url>' npx prisma generate\n");
  if (extra) console.error(`   Detalhe: ${extra}\n`);
  console.error(
    '   Dica: em ambientes com proxy/rede restrita, valide acesso a binaries.prisma.sh.',
  );
  console.error('   Consulte: documentacao-unica/README.md\n');
}

function validateClient() {
  const validationScript = `
    const prisma = require('@prisma/client');
    const requiredExports = ${JSON.stringify(REQUIRED_EXPORTS)};
    const missing = requiredExports.filter((key) => !prisma[key]);
    if (missing.length) {
      console.error('Exports ausentes em @prisma/client: ' + missing.join(', '));
      process.exit(1);
    }
  `;
  const result = spawnSync(process.execPath, ['-e', validationScript], {
    encoding: 'utf8',
    env: process.env,
  });

  if (result.status === 0) {
    return { ok: true };
  }

  return {
    ok: false,
    reason:
      result.error?.message ||
      result.stderr?.trim() ||
      `validacao do Prisma Client saiu com codigo ${result.status ?? 'desconhecido'}`,
  };
}

function runGenerate() {
  const prismaBin = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
  );
  const result = spawnSync(prismaBin, ['generate'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    return { ok: false, reason: result.error.message };
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    return {
      ok: false,
      reason: `prisma generate saiu com codigo ${result.status}`,
    };
  }

  return { ok: true };
}

const initial = validateClient();
if (initial.ok) {
  console.log('Prisma Client encontrado e compativel para o build.');
  process.exit(0);
}

const autoGenerateEnabled =
  process.env.PRISMA_PREBUILD_AUTO_GENERATE !== 'false';

if (!autoGenerateEnabled) {
  printManualHelp(initial.reason);
  process.exit(1);
}

printHeader(
  'Prisma Client ausente/incompativel. Tentando gerar automaticamente...',
);

const generated = runGenerate();
if (!generated.ok) {
  printManualHelp(`Falha ao executar prisma generate: ${generated.reason}`);
  process.exit(1);
}

const afterGenerate = validateClient();
if (!afterGenerate.ok) {
  printManualHelp(
    `Apos generate, validacao ainda falhou: ${afterGenerate.reason}`,
  );
  process.exit(1);
}

console.log('Prisma Client gerado automaticamente e validado para o build.');
