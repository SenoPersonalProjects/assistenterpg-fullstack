# PR 1 — Build/Test Health (status)

## Objetivo

Diminuir o tempo de diagnóstico e falhar cedo quando o Prisma Client estiver incompatível com o schema.

## Entregas desta etapa

- `prebuild` adicionado no `package.json` para validar Prisma Client antes do `nest build`, com tentativa automática de `prisma generate`.
- `prebuild` adicionado no `package.json` para validar Prisma Client antes do `nest build`.
- Script `scripts/check-prisma-client.js` criado para mensagem de erro explícita.
- `tsconfig.build.json` atualizado para excluir `prisma/**` do build da aplicação Nest (seeds/migrations não fazem parte do runtime HTTP).

## Resultado prático

- Em vez de centenas de erros pouco acionáveis, o pipeline agora falha com motivo claro quando o Prisma Client não foi gerado.
- Redução parcial de ruído no build da aplicação ao remover escopo de seed/migrations da compilação principal.

## Próximas ações (PR 1.1)

1. Resolver geração de Prisma Client no ambiente de CI/rede.
2. Depois da geração, corrigir erros de tipagem residuais em DTOs/Services.
3. Reexecutar `npm run build` até ficar verde.

## Apoio operacional

- Guia rápido para destravar geração do client: `backend_docs/PRISMA_GENERATE_TROUBLESHOOTING.md`.

- Para desabilitar a tentativa automática em cenários específicos: `PRISMA_PREBUILD_AUTO_GENERATE=false npm run build`.
