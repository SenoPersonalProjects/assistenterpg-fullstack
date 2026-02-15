#!/usr/bin/env node

/**
 * Garante que o Prisma Client esteja disponível para compilar a API.
 *
 * Fluxo:
 * 1) valida exports essenciais de @prisma/client;
 * 2) se faltar, tenta `prisma generate` automaticamente (a menos que desabilitado);
 * 3) revalida e falha com mensagem acionável.
 */

const { spawnSync } = require('node:child_process');

const REQUIRED_EXPORTS = ['PrismaClient', 'RoleUsuario'];

function printHeader(msg) {
  console.error(`\n${msg}`);
}

function printManualHelp(extra = '') {
  printHeader('❌ Prisma Client não está pronto para compilar o backend.');
  console.error('   Execute manualmente:');
  console.error("   DATABASE_URL='<url>' npx prisma generate\n");
  if (extra) console.error(`   Detalhe: ${extra}\n`);
  console.error(
    '   Dica: em ambientes com proxy/rede restrita, valide acesso a binaries.prisma.sh.',
  );
  console.error('   Consulte: docs/PRISMA_GENERATE_TROUBLESHOOTING.md\n');
}

function validateClient() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prisma = require('@prisma/client');

    const missing = REQUIRED_EXPORTS.filter((key) => !prisma?.[key]);
    if (missing.length) {
      return {
        ok: false,
        reason: `Exports ausentes em @prisma/client: ${missing.join(', ')}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function runGenerate() {
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(cmd, ['prisma', 'generate'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    return { ok: false, reason: result.error.message };
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    return {
      ok: false,
      reason: `prisma generate saiu com código ${result.status}`,
    };
  }

  return { ok: true };
}

const initial = validateClient();
if (initial.ok) {
  console.log('✅ Prisma Client encontrado e compatível para o build.');
  process.exit(0);
}

const autoGenerateEnabled =
  process.env.PRISMA_PREBUILD_AUTO_GENERATE !== 'false';

if (!autoGenerateEnabled) {
  printManualHelp(initial.reason);
  process.exit(1);
}

printHeader(
  '⚠️ Prisma Client ausente/incompatível. Tentando gerar automaticamente...',
);

const generated = runGenerate();
if (!generated.ok) {
  printManualHelp(`Falha ao executar prisma generate: ${generated.reason}`);
  process.exit(1);
}

const afterGenerate = validateClient();
if (!afterGenerate.ok) {
  printManualHelp(
    `Após generate, validação ainda falhou: ${afterGenerate.reason}`,
  );
  process.exit(1);
}

console.log('✅ Prisma Client gerado automaticamente e validado para o build.');
 * Falha cedo com uma mensagem clara quando o Prisma Client está desatualizado
 * ou não foi gerado para o schema atual.
 */

function exitWithHelp(extra = '') {
  console.error('\n❌ Prisma Client não está pronto para compilar o backend.');
  console.error('   Execute antes:');
  console.error("   DATABASE_URL='<url>' npx prisma generate\n");
  if (extra) console.error(`   Detalhe: ${extra}\n`);
  console.error('   Dica: em ambientes com proxy/rede restrita, valide acesso a binaries.prisma.sh.\n');
  process.exit(1);
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const prisma = require('@prisma/client');

  if (!prisma?.PrismaClient) {
    exitWithHelp('Export PrismaClient não encontrado em @prisma/client.');
  }

  // enum amplamente usado no código; quando ausente, o client está incompatível com o schema.
  if (!prisma?.RoleUsuario) {
    exitWithHelp('Enum RoleUsuario não encontrado em @prisma/client.');
  }

  console.log('✅ Prisma Client encontrado e com enums esperados para o build.');
} catch (error) {
  exitWithHelp(error instanceof Error ? error.message : String(error));
}
