# Revisão de integração Front ↔ Back

## Escopo revisado
- `assistenterpg-front/src/lib/api/*`
- `assistenterpg-front/src/lib/types/*`
- `assistenterpg-back/src/*` (controllers/dtos/services principais com foco em contrato HTTP)

## Ajuste aplicado
Foi corrigida a integração de **modificações de inventário** no front:

1. `src/lib/api/modificacoes.ts` estava com erro de merge (arquivo quebrado com bloco duplicado), gerando falha de parse/lint.
2. O front estava enviando filtros legados (`apenasAmaldicoadas`, `requerComplexidade`) que não são mais filtros aceitos pelo backend.
3. O mapper do front foi alinhado ao contrato atual do backend, usando `restricoes` retornadas pela API para derivar:
   - `apenasAmaldicoadas`
   - `requerComplexidade`
4. Também foram adicionados no payload tipado do front os campos de origem de contrato atual:
   - `fonte`
   - `suplementoId`
   - filtros `fontes[]` e `suplementoId`

## Resultado da revisão
- O ponto crítico que quebrava o front para consumir `/modificacoes` foi corrigido.
- Ainda existem pendências globais de lint/test no repositório (front e back), mas não foram introduzidas por essa correção específica.
