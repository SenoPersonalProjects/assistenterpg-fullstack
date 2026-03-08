import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const backendExceptionsDir = path.join(
  repoRoot,
  "assistenterpg-back",
  "src",
  "common",
  "exceptions",
);
const backendSrcDir = path.join(repoRoot, "assistenterpg-back", "src");
const frontErrorHandlerFile = path.join(
  repoRoot,
  "assistenterpg-front",
  "src",
  "lib",
  "api",
  "error-handler.ts",
);

const ignoredBackendCodes = new Set(["INT_I", "INT_II"]);
const allowedFrontOnlyCodes = new Set([
  "AUTH_CREDENCIAIS_INVALIDAS",
  "ITEM_INVENTARIO_NOT_FOUND",
  "ESPACOS_INSUFICIENTES",
  "GRAU_XAMA_LIMITE_EXCEDIDO",
  "TECNICA_NOME_DUPLICADO",
  "NOT_FOUND",
  "NETWORK_ERROR",
]);

function walkFiles(dir, predicate) {
  const result = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath, predicate));
      continue;
    }

    if (predicate(fullPath)) {
      result.push(fullPath);
    }
  }
  return result;
}

function readUtf8(filePath) {
  return readFileSync(filePath, "utf8");
}

function addMatchesToSet(content, regex, set, normalize = (v) => v) {
  let match;
  while ((match = regex.exec(content)) !== null) {
    const value = normalize(match[1]);
    if (value) {
      set.add(value);
    }
  }
}

function isPrismaCode(value) {
  return /^P\d{4}$/.test(value);
}

function main() {
  if (!statSync(backendExceptionsDir).isDirectory()) {
    throw new Error(`Diretorio nao encontrado: ${backendExceptionsDir}`);
  }
  if (!statSync(backendSrcDir).isDirectory()) {
    throw new Error(`Diretorio nao encontrado: ${backendSrcDir}`);
  }
  if (!statSync(frontErrorHandlerFile).isFile()) {
    throw new Error(`Arquivo nao encontrado: ${frontErrorHandlerFile}`);
  }

  const backendCodes = new Set();
  const frontCodes = new Set();

  const exceptionFiles = walkFiles(
    backendExceptionsDir,
    (file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"),
  );
  const backendTsFiles = walkFiles(
    backendSrcDir,
    (file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"),
  );

  for (const file of exceptionFiles) {
    const content = readUtf8(file);
    addMatchesToSet(content, /'([A-Z][A-Z0-9_]+)'/g, backendCodes);
  }

  for (const file of backendTsFiles) {
    const content = readUtf8(file);
    addMatchesToSet(content, /code\s*:\s*'([A-Z][A-Z0-9_]+)'/g, backendCodes);
  }

  for (const code of [...backendCodes]) {
    if (ignoredBackendCodes.has(code) || isPrismaCode(code)) {
      backendCodes.delete(code);
    }
  }

  const frontContent = readUtf8(frontErrorHandlerFile);
  addMatchesToSet(frontContent, /^\s*([A-Z][A-Z0-9_]+)\s*:/gm, frontCodes);

  const backendList = [...backendCodes].sort();
  const frontList = [...frontCodes].sort();

  const missingInFront = backendList.filter((code) => !frontCodes.has(code));
  const extraInFront = frontList.filter((code) => !backendCodes.has(code));
  const unexpectedExtraInFront = extraInFront.filter(
    (code) => !allowedFrontOnlyCodes.has(code),
  );

  console.log(`backend codes: ${backendList.length}`);
  console.log(`frontend mapped codes: ${frontList.length}`);
  console.log(`missing in frontend: ${missingInFront.length}`);
  console.log(`extra in frontend: ${extraInFront.length}`);

  if (missingInFront.length > 0) {
    console.error("\nCodigos faltando no frontend:");
    for (const code of missingInFront) {
      console.error(`- ${code}`);
    }
  }

  if (unexpectedExtraInFront.length > 0) {
    console.warn(
      "\nCodigos extras no frontend (nao permitidos por allowlist):",
    );
    for (const code of unexpectedExtraInFront) {
      console.warn(`- ${code}`);
    }
  }

  if (missingInFront.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("\nCobertura de codigos de erro backend -> frontend: OK");
}

try {
  main();
} catch (error) {
  console.error("Falha ao verificar cobertura de codigos de erro.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
