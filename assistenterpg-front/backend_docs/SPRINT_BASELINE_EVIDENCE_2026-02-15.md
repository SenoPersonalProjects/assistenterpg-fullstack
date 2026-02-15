# Evidências de validação de baseline backend (sprint)

Data: 2026-02-15
Repositório: `assistenterpg-back`

## 1) Instalação completa de dependências

Comando executado:

```bash
npm install --no-audit --no-fund
```

Resultado:

- **Falhou** com `E403 Forbidden` ao baixar pacote do registro NPM.

Trecho do log:

```text
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@eslint%2feslintrc
npm error 403 In most cases, you or one of your dependencies are requesting
npm error 403 a package version that is forbidden by your security policy, or
npm error 403 on a server you do not have access to.
```

## 2) Build do backend

Comando executado:

```bash
npm run build
```

Resultado:

- **Falhou** no script `prebuild` por erro de sintaxe em `scripts/check-prisma-client.js`.

Trecho do log:

```text
/workspace/assistenterpg-back/scripts/check-prisma-client.js:107
 * Falha cedo com uma mensagem clara quando o Prisma Client está desatualizado
 ^
SyntaxError: Unexpected token '*'
```

## 3) Testes unitários

Comando executado:

```bash
npm test -- --runInBand
```

Resultado:

- **Falhou** porque `jest` não está disponível (dependências não instaladas por bloqueio no passo 1).

Trecho do log:

```text
> assistenterpg-back@0.0.1 test
> jest --runInBand

sh: 1: jest: not found
```

## 4) Subida da API e validação de `/docs/openapi.json` (opcional forte)

Comando tentado:

```bash
npm run start
```

Resultado:

- **Falhou** porque `nest` não está disponível (dependências não instaladas por bloqueio no passo 1).
- Sem processo da API em execução, não foi possível validar `/docs/openapi.json` via HTTP.

Trecho do log:

```text
> assistenterpg-back@0.0.1 start
> nest start

sh: 1: nest: not found
```

## Conclusão

- O backend **não deve ser marcado como baseline oficial** para o agente do front até:
  1. liberar acesso de instalação de dependências NPM (erro `E403`);
  2. corrigir o erro de sintaxe em `scripts/check-prisma-client.js`;
  3. reexecutar build, testes e validação de OpenAPI com sucesso.
