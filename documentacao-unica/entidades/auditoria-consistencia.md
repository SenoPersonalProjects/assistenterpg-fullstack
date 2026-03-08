# Auditoria de Consistencia (Docs x Regras x Schema)

Atualizado em: 2026-03-08

## Metodo de verificacao

A auditoria foi feita comparando:

- controllers (rotas e autorizacao)
- services (regras de negocio e erros esperados)
- DTOs (formatos aceitos)
- `schema.prisma` (constraints e relacoes)
- documentacao em `documentacao-unica/README.md` e docs por entidade

## Resultado atual

- cobertura de modulos do backend no README: ok (todos os controllers principais aparecem)
- autenticacao/autorizacao:
  - escrita de `tecnicas-amaldicoadas`, `proficiencias`, `tipos-grau`, `condicoes` ajustada para `JWT+Admin`
  - documentacao alinhada com esse comportamento
- contratos de payload:
  - `tecnicas-amaldicoadas` e `catalogos menores` detalhados com campos obrigatorios/opcionais
- constraints de schema:
  - unicidades e regras principais refletidas na documentacao

## Pontos de atencao (comportamento atual, nao quebra)

- `proficiencias` e `tipos-grau`:
  - service nao faz precheck explicito de "em uso" antes de deletar
  - hoje a integridade fica majoritariamente delegada ao banco/Prisma (erro de FK quando aplicavel)
  - recomendacao futura: padronizar mensagem de negocio para erro "em uso" (similar ao que ja existe em `condicoes`, `classes`, `trilhas`, `origens`, `tecnicas`)

## Evidencias (arquivos chave)

- schema:
  - `assistenterpg-back/prisma/schema.prisma`
- regras de negocio:
  - `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`
  - `assistenterpg-back/src/condicoes/condicoes.service.ts`
  - `assistenterpg-back/src/proficiencias/proficiencias.service.ts`
  - `assistenterpg-back/src/tipos-grau/tipos-grau.service.ts`
- autorizacao:
  - `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts`
  - `assistenterpg-back/src/proficiencias/proficiencias.controller.ts`
  - `assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts`
  - `assistenterpg-back/src/condicoes/condicoes.controller.ts`
