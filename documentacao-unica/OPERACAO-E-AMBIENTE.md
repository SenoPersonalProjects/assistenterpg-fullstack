# Operação e ambiente

Esta é a referência operacional vigente. Registros de decisões e alterações
permanecem na auditoria, sem substituir este guia.

## Ambiente suportado

- Node.js: `>=20 <25` (CI usa Node 24; Node 20 é suportado localmente).
- npm com lockfiles do projeto: sempre usar `npm ci` em instalação limpa.
- Banco local: MySQL 8 pelo `docker compose` do backend.
- Banco remoto: TiDB compatível com MySQL, manipulado somente pelo roteiro
  não destrutivo de `update-tidb.ps1`.

## Validação local

```powershell
node documentacao-unica/validar-documentacao.mjs

cd assistenterpg-back
npm ci
npm run prisma:generate:safe
npx prisma validate
npm run lint:check
npm test -- --runInBand
npm run build

cd ..\assistenterpg-front
npm ci
npm run lint:check
npm test
npm run build
```

`npm run lint` no backend aplica correções automáticas. Em verificações, use
`npm run lint:check` para não modificar o worktree.

## Saúde e diagnóstico

- `GET /health/live`: confirma que o processo HTTP está em execução.
- `GET /health/ready`: também testa a conectividade de leitura com o banco.
- As respostas incluem nome do serviço, versão de deploy disponível no
  ambiente e timestamp; não expõem URL, credenciais nem erro interno do banco.

Para investigar uma falha, preserve o `traceId` ou `x-request-id` retornado
pela API e relacione-o ao commit/deploy. Não inclua cookies, tokens, bodies de
autenticação ou `DATABASE_URL` em relatórios.

## Backup recorrente do TiDB

O backup agendado usa o mesmo procedimento seguro de `update-tidb.ps1` e só
remove dumps anteriores depois que o novo arquivo é criado, não está vazio e
teve seu SHA-256 calculado. A retenção padrão é **uma cópia**.

1. Defina as variáveis persistentes do usuário que executará a tarefa:
   `ASSISTENTERPG_API_URL` (URL do backend Render) e
   `ASSISTENTERPG_BACKUP_STATUS_TOKEN` (o mesmo segredo configurado no Render
   como `BACKUP_STATUS_TOKEN`).
2. Confirme que o `PRIVATE-OPS.md` local está preenchido e não versionado.
3. Registre a tarefa diária, que por padrão roda às 03:10:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica\registrar-tarefa-backup-tidb.ps1
```

4. Execute uma vez manualmente para validar credenciais e o registro no painel:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica\backup-tidb-agendado.ps1
```

Use `-Retencao 2` somente se duas cópias forem realmente necessárias. Em caso
de falha, a rotina aborta sem apagar os backups existentes.

## Migrations e TiDB

O Quality Gate sobe um MySQL 8 descartável e executa, antes de testes e build:

```powershell
npx prisma db push --skip-generate
npx prisma validate
```

Isso valida o schema vigente em banco vazio. A cadeia de migrations anterior ao
baseline atual não é replayável em banco vazio (por divergência histórica de
nomes físicos de tabelas), portanto o CI não altera nem simula o histórico
aplicado do TiDB produtivo. SQL específico de TiDB e qualquer migration remota
continuam exigindo preflight, backup e validação posterior.

Para atualização remota não destrutiva, o procedimento oficial é:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica\update-tidb.ps1 `
  -OpsFile documentacao-unica\PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Migrate `
  -Seeds compendio `
  -BackupBefore `
  -ConfirmationText "ATUALIZAR test"
```

Execute primeiro com `-PreflightOnly`. `PRIVATE-OPS.md` nunca vai para o Git e
deve conter apenas os dados privados exigidos pelo script.

## Ensaio de recuperação

O ensaio deve ser feito em banco isolado, nunca sobre o TiDB de produção:

1. Gerar backup com `-BackupBefore` e registrar SHA-256, tamanho e horário.
2. Criar banco temporário com nome explícito, fora do alvo de produção.
3. Restaurar o dump usando o procedimento do ambiente isolado.
4. Executar `npx prisma migrate status`, contagens mínimas e smoke autenticado.
5. Registrar duração do backup/restauração, integridade e consultas críticas.
6. Apagar apenas o banco temporário validado ao final do ensaio.

Não é permitido testar restauração, `sync-tidb.ps1` ou comandos destrutivos
contra um banco remoto sem confirmação explícita do alvo e backup verificável.
