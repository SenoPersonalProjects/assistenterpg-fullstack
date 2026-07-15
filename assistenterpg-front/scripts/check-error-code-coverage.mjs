import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const currentFile = fileURLToPath(import.meta.url);
const defaultRepoRoot = path.resolve(path.dirname(currentFile), "../..");

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

function isErrorCode(value) {
  return /^[A-Z][A-Z0-9_]+$/.test(value);
}

function isPrismaCode(value) {
  return /^P\d{4}$/.test(value);
}

function addCode(codes, value) {
  if (
    isErrorCode(value) &&
    !ignoredBackendCodes.has(value) &&
    !isPrismaCode(value)
  ) {
    codes.add(value);
  }
}

function stringLiteralValue(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
}

function rightmostExpressionName(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text;
  }
  return null;
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }
  return null;
}

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

export function collectBackendErrorCodesFromSource(
  content,
  fileName = "source.ts",
  { exceptionCatalog = false } = {},
) {
  const codes = new Set();
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const collectLiteralDescendants = (node) => {
    const value = stringLiteralValue(node);
    if (value) {
      addCode(codes, value);
    }
    ts.forEachChild(node, collectLiteralDescendants);
  };

  const visit = (node) => {
    if (exceptionCatalog) {
      const value = stringLiteralValue(node);
      if (value) {
        addCode(codes, value);
      }
    }

    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(node.name) === "code"
    ) {
      const value = stringLiteralValue(node.initializer);
      if (value) {
        addCode(codes, value);
      }
    }

    if (
      ts.isNewExpression(node) &&
      rightmostExpressionName(node.expression) === "BusinessException"
    ) {
      const value = node.arguments?.[1]
        ? stringLiteralValue(node.arguments[1])
        : null;
      if (value) {
        addCode(codes, value);
      }
    }

    if (
      ts.isTypeAliasDeclaration(node) &&
      /(Erro|Error)Code$/.test(node.name.text)
    ) {
      collectLiteralDescendants(node.type);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return codes;
}

export function collectFrontendErrorCodesFromSource(
  content,
  fileName = "error-handler.ts",
) {
  const codes = new Set();
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "ERROR_MESSAGES" &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);
      if (initializer && ts.isObjectLiteralExpression(initializer)) {
        for (const property of initializer.properties) {
          if (!ts.isPropertyAssignment(property)) {
            continue;
          }
          const code = propertyNameText(property.name);
          if (code && isErrorCode(code)) {
            codes.add(code);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return codes;
}

export function buildCoverageReport(repoRoot = defaultRepoRoot) {
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
  const exceptionFiles = new Set(
    walkFiles(
      backendExceptionsDir,
      (file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"),
    ),
  );
  const backendTsFiles = walkFiles(
    backendSrcDir,
    (file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"),
  );

  for (const file of backendTsFiles) {
    const collected = collectBackendErrorCodesFromSource(
      readFileSync(file, "utf8"),
      file,
      { exceptionCatalog: exceptionFiles.has(file) },
    );
    for (const code of collected) {
      backendCodes.add(code);
    }
  }

  const frontCodes = collectFrontendErrorCodesFromSource(
    readFileSync(frontErrorHandlerFile, "utf8"),
    frontErrorHandlerFile,
  );
  const backendList = [...backendCodes].sort();
  const frontList = [...frontCodes].sort();
  const missingInFront = backendList.filter((code) => !frontCodes.has(code));
  const extraInFront = frontList.filter((code) => !backendCodes.has(code));
  const unexpectedExtraInFront = extraInFront.filter(
    (code) => !allowedFrontOnlyCodes.has(code),
  );

  return {
    backendList,
    frontList,
    missingInFront,
    extraInFront,
    unexpectedExtraInFront,
  };
}

export function main(repoRoot = defaultRepoRoot) {
  const report = buildCoverageReport(repoRoot);
  console.log(`backend codes: ${report.backendList.length}`);
  console.log(`frontend mapped codes: ${report.frontList.length}`);
  console.log(`missing in frontend: ${report.missingInFront.length}`);
  console.log(`extra in frontend: ${report.extraInFront.length}`);

  if (report.missingInFront.length > 0) {
    console.error("\nCodigos faltando no frontend:");
    for (const code of report.missingInFront) {
      console.error(`- ${code}`);
    }
  }

  if (report.unexpectedExtraInFront.length > 0) {
    console.error(
      "\nCodigos extras no frontend (nao permitidos por allowlist):",
    );
    for (const code of report.unexpectedExtraInFront) {
      console.error(`- ${code}`);
    }
  }

  if (
    report.missingInFront.length > 0 ||
    report.unexpectedExtraInFront.length > 0
  ) {
    process.exitCode = 1;
    return report;
  }

  console.log("\nCobertura de codigos de erro backend -> frontend: OK");
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  try {
    main();
  } catch (error) {
    console.error("Falha ao verificar cobertura de codigos de erro.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
