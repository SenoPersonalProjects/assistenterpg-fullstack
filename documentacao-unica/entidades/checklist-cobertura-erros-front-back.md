# Checklist de Cobertura de Erros (Back x Front)

Atualizado em: 2026-03-08

## Escopo

Este checklist valida cobertura entre:

- codigos de erro definidos/emitidos no backend
- codigos mapeados em `assistenterpg-front/src/lib/api/error-handler.ts` (`ERROR_MESSAGES`)

## Metodo de verificacao

- backend:
  - extraidos codigos em `assistenterpg-back/src/common/exceptions/*.ts`
  - extraidos codigos explicitos `code: '...'` em `assistenterpg-back/src/**/*.ts` (exceto specs)
  - filtros:
    - ignora codigos internos Prisma (`P2002`, `P2003`, `P2014`, `P2025`)
    - ignora valores que nao sao codigos de erro (`INT_I`, `INT_II`)
- frontend:
  - extraidas chaves maiusculas em `ERROR_MESSAGES`

## Resultado atual

| Medida                                          | Valor  |
| ----------------------------------------------- | ------ |
| Total de codigos backend                        | `194`  |
| Total de codigos no frontend (`ERROR_MESSAGES`) | `201`  |
| Codigos backend sem mapeamento no frontend      | `0`    |
| Cobertura de mapeamento (backend -> frontend)   | `100%` |
| Codigos extras no frontend                      | `7`    |

## Codigos extras no frontend (intencionais)

| Codigo                       | Motivo                                      |
| ---------------------------- | ------------------------------------------- |
| `AUTH_CREDENCIAIS_INVALIDAS` | Alias legado/compatibilidade                |
| `ITEM_INVENTARIO_NOT_FOUND`  | Alias legado/compatibilidade                |
| `ESPACOS_INSUFICIENTES`      | Alias legado/compatibilidade                |
| `GRAU_XAMA_LIMITE_EXCEDIDO`  | Alias legado/compatibilidade                |
| `TECNICA_NOME_DUPLICADO`     | Alias legado/compatibilidade                |
| `NOT_FOUND`                  | Fallback generico por status                |
| `NETWORK_ERROR`              | Erro de rede no client (nao vem do backend) |

## Checklist operacional

- [x] Todo codigo de erro de backend possui mensagem no frontend
- [x] Codigos de validacao (`400`) estao mapeados
- [x] Codigos de regra de negocio (`422`) estao mapeados
- [x] Codigos de autorizacao/autenticacao (`401/403`) estao mapeados
- [x] Codigos de banco (`DB_*`) estao mapeados
- [x] Codigos novos adicionados na tratativa recente (`FONTE_SUPLEMENTO_OBRIGATORIA`, `SUPLEMENTO_ID_OBRIGATORIO`, `REFERENCIA_IMPORTACAO_INVALIDA`) estao mapeados
- [x] Aliases legados mantidos para nao quebrar comportamento atual

## Automacao implementada

- script local:
  - `assistenterpg-front/scripts/check-error-code-coverage.mjs`
  - execucao: `cd assistenterpg-front && npm run check:error-codes`
- CI (GitHub Actions):
  - `.github/workflows/error-code-coverage.yml`
  - falha o job quando um codigo novo do backend nao tiver entrada em `ERROR_MESSAGES`

## Proxima melhoria opcional

- adicionar este mesmo verificador como etapa obrigatoria junto do fluxo principal de testes/lint (caso exista outro workflow de CI consolidado).
