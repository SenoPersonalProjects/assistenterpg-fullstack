# Checklist de Cobertura de Erros (Back x Front)

Atualizado em: 2026-03-08

## Escopo

Este checklist válida cobertura entre:

- codigos de erro definidos/emitidos no backend
- codigos mapeados em `assistenterpg-front/src/lib/api/error-handler.ts` (`ERROR_MESSAGES`)

## Método de verificação

- backend:
  - extraidos codigos em `assistenterpg-back/src/common/exceptions/*.ts`
  - extraidos codigos explícitos `code: '...'` em `assistenterpg-back/src/**/*.ts` (exceto specs)
  - filtros:
    - ignora codigos internos Prisma (`P2002`, `P2003`, `P2014`, `P2025`)
    - ignora valores que não são codigos de erro (`INT_I`, `INT_II`)
- frontend:
  - extraidas chaves maiusculas em `ERROR_MESSAGES`

## Resultado atual

| Medida                                          | Valor  |
| ----------------------------------------------- | ------ |
| Total de códigos backend                        | `194`  |
| Total de códigos no frontend (`ERROR_MESSAGES`) | `201`  |
| Códigos backend sem mapeamento no frontend      | `0`    |
| Cobertura de mapeamento (backend -> frontend)   | `100%` |
| Códigos extras no frontend                      | `7`    |

## Códigos extras no frontend (intencionais)

| Codigo                       | Motivo                                      |
| ---------------------------- | ------------------------------------------- |
| `AUTH_CREDENCIAIS_INVALIDAS` | Alias legado/compatibilidade                |
| `ITEM_INVENTARIO_NOT_FOUND`  | Alias legado/compatibilidade                |
| `ESPACOS_INSUFICIENTES`      | Alias legado/compatibilidade                |
| `GRAU_XAMA_LIMITE_EXCEDIDO`  | Alias legado/compatibilidade                |
| `TECNICA_NOME_DUPLICADO`     | Alias legado/compatibilidade                |
| `NOT_FOUND`                  | Fallback genérico por status                |
| `NETWORK_ERROR`              | Erro de rede no client (não vem do backend) |

## Checklist operacional

- [x] Todo código de erro de backend possui mensagem no frontend
- [x] Códigos de validação (`400`) estão mapeados
- [x] Códigos de regra de negócio (`422`) estão mapeados
- [x] Códigos de autorização/autenticação (`401/403`) estão mapeados
- [x] Códigos de banco (`DB_*`) estão mapeados
- [x] Códigos novos adicionados na tratativa recente (`FONTE_SUPLEMENTO_OBRIGATORIA`, `SUPLEMENTO_ID_OBRIGATORIO`, `REFERENCIA_IMPORTACAO_INVALIDA`) estão mapeados
- [x] Aliases legados mantidos para não quebrar comportamento atual

## Automacao implementada

- script local:
  - `assistenterpg-front/scripts/check-error-code-coverage.mjs`
  - execução: `cd assistenterpg-front && npm run check:error-codes`
- CI (GitHub Actions):
  - `.github/workflows/error-code-coverage.yml`
  - falha o job quando um codigo novo do backend não tiver entrada em `ERROR_MESSAGES`

## Proxima melhoria opcional

- adicionar este mesmo verificador como etapa obrigatória junto do fluxo principal de testes/lint (caso exista outro workflow de CI consolidado).
