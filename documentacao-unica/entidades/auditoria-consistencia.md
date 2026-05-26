# Auditoria de Consistencia (Docs x Regras x Schema)

Atualizado em: 2026-03-08

## Método de verificação

A auditoria foi feita comparando:

- controllers (rotas e autorizacao)
- services (regras de negocio e erros esperados)
- DTOs (formatos aceitos)
- `schema.prisma` (constraints e relações)
- documentação em `documentacao-unica/README.md` e docs por entidade

## Resultado atual

- cobertura de módulos do backend no README: ok (todos os controllers principais aparecem)
- cobertura por entidade em arquivos dedicados:
  - `auth-usuarios-campanhas`: ok
  - `catalogos-progressão`: ok
  - `tecnicas-amaldicoadas`: ok
  - `catálogos-menores`: ok
  - `personagens-base`: ok
  - `inventario`: ok
  - `equipamentos-modificacoes`: ok
  - `compendio`: ok
  - `suplementos-homebrews`: ok
- contratos de payload:
  - campos obrigatórios/opcionais e formatos de query documentados por entidade
- constraints de schema:
  - unicidades, relações e bloqueios de exclusão em uso refletidos na documentação
- erros:
  - envelope global atualizado com `traceId` e header `x-request-id`
  - codigos de erro por domínio mapeados nos docs de entidade

## Pontos de atencao (comportamento atual, não quebra)

- `proficiencias` e `tipos-grau`:
  - service não faz precheck explícito de "em uso" antes de deletar
  - integridade fica delegada ao banco/Prisma (erro de FK quando aplicável)

## Evidencias (arquivos chave)

- schema:
  - `assistenterpg-back/prisma/schema.prisma`
- regras de negocio:
  - `assistenterpg-back/src/auth/auth.service.ts`
  - `assistenterpg-back/src/usuario/usuario.service.ts`
  - `assistenterpg-back/src/campanha/campanha.service.ts`
  - `assistenterpg-back/src/classes/classes.service.ts`
  - `assistenterpg-back/src/clas/clas.service.ts`
  - `assistenterpg-back/src/trilhas/trilhas.service.ts`
  - `assistenterpg-back/src/origens/origens.service.ts`
  - `assistenterpg-back/src/habilidades/habilidades.service.ts`
  - `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`
  - `assistenterpg-back/src/personagem-base/personagem-base.service.ts`
  - `assistenterpg-back/src/inventario/inventario.service.ts`
  - `assistenterpg-back/src/equipamentos/equipamentos.service.ts`
  - `assistenterpg-back/src/modificacoes/modificacoes.service.ts`
  - `assistenterpg-back/src/compendio/compendio.service.ts`
  - `assistenterpg-back/src/suplementos/suplementos.service.ts`
  - `assistenterpg-back/src/homebrews/homebrews.service.ts`
- autorizacao:
  - `assistenterpg-back/src/auth/jwt-auth.guard.ts`
  - `assistenterpg-back/src/auth/guards/admin.guard.ts`
  - controllers dos módulos citados acima
