import { describe, expect, it } from "vitest";
import {
  collectBackendErrorCodesFromSource,
  collectFrontendErrorCodesFromSource,
} from "./check-error-code-coverage.mjs";

describe("check-error-code-coverage", () => {
  it("coleta codigos nos contextos semanticos do backend", () => {
    const source = `
      type SessaoErroCode = "JOIN_INVALIDO" | "SESSAO_INVALIDA";
      throw new BusinessException("Falha", "ERRO_DIRETO");
      const resposta = { code: "ERRO_TRANSPORTE" };
      const ignorado = "NAO_E_UM_CODIGO_DE_ERRO";
      const prisma = { code: "P2002" };
      type GrauCode = "INT_I" | "INT_II";
    `;

    expect(
      [...collectBackendErrorCodesFromSource(source)].sort(),
    ).toEqual([
      "ERRO_DIRETO",
      "ERRO_TRANSPORTE",
      "JOIN_INVALIDO",
      "SESSAO_INVALIDA",
    ]);
  });

  it("coleta todos os codigos declarados no catalogo de excecoes", () => {
    const source = `
      export class ExemploException extends Error {
        constructor() {
          super("Mensagem", "ERRO_CATALOGO");
        }
      }
    `;

    expect([
      ...collectBackendErrorCodesFromSource(source, "exception.ts", {
        exceptionCatalog: true,
      }),
    ]).toEqual(["ERRO_CATALOGO"]);
  });

  it("coleta somente as chaves do catalogo frontend", () => {
    const source = `
      const FORA_DO_CATALOGO = "ignorado";
      export const ERROR_MESSAGES: Record<string, string> = {
        ERRO_UM: "Mensagem um",
        "ERRO_DOIS": "Mensagem dois",
      };
    `;

    expect([...collectFrontendErrorCodesFromSource(source)].sort()).toEqual([
      "ERRO_DOIS",
      "ERRO_UM",
    ]);
  });
});
