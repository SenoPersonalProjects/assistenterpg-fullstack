# Guia de scripts para TiDB

Este guia separa dois fluxos diferentes:

- `update-tidb.ps1`: atualiza o banco remoto sem apagar o banco.
- `sync-tidb.ps1`: recria o banco remoto a partir de dump local. Use só quando a intenção for substituir tudo.

Os dois scripts leem `documentacao-unica/PRIVATE-OPS.md`, que fica fora do Git. Nenhum deles deve imprimir senhas.

## Fluxo recomendado: update sem recriar banco

Use este fluxo quando houver:

- migration nova;
- seed idempotente alterado;
- conteúdo do compêndio atualizado;
- suplemento oficial atualizado por seed seguro.

Exemplo para atualizar apenas o compêndio no TiDB:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica/update-tidb.ps1 `
  -OpsFile documentacao-unica/PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Migrate `
  -Seeds compendio `
  -BackupBefore `
  -ConfirmationText "ATUALIZAR test"
```

O script faz:

1. testa a conexão com o TiDB;
2. valida o Prisma contra o alvo remoto;
3. cria backup lógico remoto se `-BackupBefore` for usado;
4. executa `prisma migrate deploy` se `-Migrate` for usado;
5. executa apenas os seeds selecionados;
6. valida tabelas, `_prisma_migrations` e, no caso de `compendio`, o artigo `regras-opcionais`.

## Preflight

Use antes de mexer no remoto:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica/update-tidb.ps1 `
  -OpsFile documentacao-unica/PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Seeds compendio `
  -PreflightOnly
```

O preflight não roda migration, não roda seed e não cria backup. Ele valida arquivos, ferramentas, credenciais, conexão e configuração Prisma.

## Validação remota sem escrita

Use depois de um update, ou quando a saída de um processo longo for perdida por timeout:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica/update-tidb.ps1 `
  -OpsFile documentacao-unica/PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Seeds compendio `
  -ValidateOnly
```

Esse modo não roda migration, não roda seed e não cria backup. Ele testa conexão, valida Prisma e consulta o TiDB para confirmar contagem de tabelas, `_prisma_migrations` e, quando `compendio` estiver selecionado, o artigo `regras-opcionais`.

## Seeds permitidos

Seeds liberados no `update-tidb.ps1`:

- `compendio`: seguro e idempotente, recomendado para atualização do livro principal.
- `sobrevivendo`: seed do suplemento oficial.
- `técnicas-inatas`: seed focado de técnicas inatas.
- `tecnicas-nao-inatas`: seed focado de técnicas não inatas.
- `correcoes-texto`: seed seguro para reaplicar textos corrigidos em catálogos, equipamentos e habilidades sem rodar o seed completo.
- `modificacoes-aplicaveis`: recria relações de modificações aplicáveis; usar com atenção.
- `full`: seed completo. Bloqueado por padrão.

Para rodar seed completo:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica/update-tidb.ps1 `
  -OpsFile documentacao-unica/PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Migrate `
  -Seeds full `
  -BackupBefore `
  -AllowFullSeed `
  -ConfirmationText "ATUALIZAR test FULL"
```

O seed completo contém operações que recriam relações internas de catálogo. Ele não apaga o banco, mas pode alterar dados de catálogo em massa.

## Fluxo destrutivo: rebuild total

Use `sync-tidb.ps1` quando for necessário substituir completamente o TiDB pelo dump local.

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica/sync-tidb.ps1 `
  -OpsFile documentacao-unica/PRIVATE-OPS.md `
  -LocalDatabase assistenterpg `
  -RemoteDatabase test `
  -ConfirmationText "APAGAR test"
```

Esse fluxo faz `DROP DATABASE`, cria o banco remoto novamente e importa um dump corrigido do banco local. Não use para atualizações simples de seed ou migrations.

## Regras práticas

- Para mudança de conteúdo do compêndio: use `update-tidb.ps1 -Migrate -Seeds compendio -BackupBefore`.
- Para migration de schema sem seed: use `update-tidb.ps1 -Migrate -Seeds "" -BackupBefore`.
- Para seed específico sem migration: use `update-tidb.ps1 -Seeds compendio -BackupBefore`.
- Para ambiente totalmente divergente ou banco remoto quebrado: use `sync-tidb.ps1`.
- Depois de qualquer update remoto, valide a aplicação apontando para o TiDB antes de considerar a públicação concluída.

## Segurança operacional

- `PRIVATE-OPS.md` deve continuar fora do Git.
- Não cole senhas em comandos de terminal.
- Não rode `sync-tidb.ps1` sem entender que ele é destrutivo.
- Prefira `-BackupBefore` sempre que houver dados remotos que não estejam garantidamente replicados no banco local.
- O backup do `update-tidb.ps1` é lógico e compatível com TiDB; ele usa `mysqldump --skip-lock-tables`, sem `DROP DATABASE` e sem `--single-transaction`.
- Se o update falhar após migration e antes do seed, corrija a causa e rode o mesmo `update-tidb.ps1` novamente; migrations Prisma já registradas não devem ser reaplicadas.
