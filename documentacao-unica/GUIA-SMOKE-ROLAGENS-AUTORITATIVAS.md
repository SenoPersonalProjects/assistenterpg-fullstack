# Smoke autenticado de rolagens autoritativas

## Objetivo

Este smoke valida as rolagens autoritativas em uma sessao descartavel ja
existente. Ele nao cria usuario, campanha, sessao, personagem, NPC ou tecnica.
Tambem nao executa seed, migration, `db push` ou alteracao direta de banco.

O comando e opt-in e nao faz chamadas HTTP sem `--run`.

## Efeitos esperados

Uma execucao completa:

- cria uma sessao normal de autenticacao e a revoga no logout;
- cria nove eventos `CHAT` na sessao descartavel;
- repete o critico com o mesmo `clientRequestId` para validar idempotencia, sem
  criar um decimo evento;
- le o detalhe, chat e timeline para validar persistencia e invariantes;
- nao chama endpoints de dano, cura, recursos, condicoes ou inventario.

O primeiro `GET` do detalhe usa o comportamento normal da mesa. Se a sessao
estiver com condicoes automaticas desatualizadas, o backend pode executar a
sincronizacao lazy ja existente antes do snapshot. Por isso a sessao precisa
ser descartavel. As comparacoes de invariantes sao feitas depois desse
preflight e isolam os efeitos das rolagens.

## Fixture manual minima

Prepare manualmente no ambiente escolhido:

1. Conta verificada e descartavel com papel de mestre na campanha.
2. Campanha e sessao descartaveis, com sessao nao encerrada, sem efeitos de
   turno pendentes e com menos de 120 mensagens no chat.
3. Personagem na sessao, sem Perito pendente, com:
   - uma pericia comum;
   - uma pericia de ataque entre `LUTA`, `PONTARIA` e `JUJUTSU`;
   - uma habilidade de tecnica disponivel que possua `testesExigidos` e dano
     estruturados; o multiplicador de critico pode usar o fallback autoritativo
     atual do backend.
4. NPC na sessao com:
   - uma pericia persistida;
   - uma acao cujo mesmo indice possua `teste` e `dano` validos.
5. Opcionalmente, uma variacao da habilidade com dano e critico estruturados.

Nao use campanha, sessao ou personagens importantes. O script compara os nomes
esperados com o detalhe retornado antes de criar qualquer evento.

## Variaveis

Obrigatorias:

- `SMOKE_TARGET`: `LOCAL`, `TEST` ou `PRODUCTION`;
- `SMOKE_BASE_URL`: URL base do backend;
- `SMOKE_EMAIL` e `SMOKE_PASSWORD`;
- `SMOKE_CAMPANHA_ID` e `SMOKE_SESSAO_ID`;
- `SMOKE_EXPECTED_SESSION_TITLE`;
- `SMOKE_PERSONAGEM_SESSAO_ID`;
- `SMOKE_EXPECTED_CHARACTER_NAME`;
- `SMOKE_PERSONAGEM_PERICIA_CODIGO`;
- `SMOKE_PERSONAGEM_ATAQUE_CODIGO`;
- `SMOKE_HABILIDADE_TECNICA_ID`;
- `SMOKE_NPC_SESSAO_ID`;
- `SMOKE_EXPECTED_NPC_NAME`;
- `SMOKE_NPC_PERICIA_CODIGO`;
- `SMOKE_NPC_ACAO_INDICE`;
- `SMOKE_CONFIRMATION`, exatamente:
  `EXECUTAR ROLAGENS NA SESSAO DESCARTAVEL`.

Opcionais:

- `SMOKE_VARIACAO_HABILIDADE_ID`;
- `SMOKE_ACUMULOS`: de 1 a 5; valor 1 e omitido do payload;
- `SMOKE_PRODUCTION_CONFIRMATION`, obrigatoria apenas para producao e
  exatamente `CONFIRMO USO DE DADOS DESCARTAVEIS EM PRODUCAO`.

Regras de alvo:

- `LOCAL` aceita somente `localhost`, `127.0.0.1` ou `::1`;
- `TEST` e `PRODUCTION` exigem HTTPS e host nao local;
- URL com usuario, senha, query ou fragmento e rejeitada;
- producao exige as duas confirmacoes literais.

Nao versionar valores. Nao colocar a senha no historico do terminal. Em
PowerShell, uma opcao e obter as credenciais interativamente:

```powershell
$credencial = Get-Credential
$env:SMOKE_EMAIL = $credencial.UserName
$env:SMOKE_PASSWORD = $credencial.GetNetworkCredential().Password
```

Configure as demais variaveis no ambiente do processo ou em um gerenciador de
segredos operacional. Os placeholders de `assistenterpg-back/.env.example`
nao contem valores reais e nao sao carregados automaticamente pelo smoke.

## Comandos seguros

No backend:

```powershell
cd assistenterpg-back
npm run smoke:auth -- --help
npm run smoke:auth -- --validate-config
npm run smoke:auth -- --dry-run
```

- `--help` nao le configuracao e nao faz rede;
- `--validate-config` valida variaveis e guardas, sem fazer rede;
- `--dry-run` mostra os tipos de rolagem planejados, sem fazer rede;
- sem argumento, o comando falha fechado e mostra a ajuda.

Somente depois de confirmar visualmente o ambiente e a fixture:

```powershell
npm run smoke:auth -- --run
```

Ao terminar, remova as variaveis do processo:

```powershell
Get-ChildItem Env:SMOKE_* | Remove-Item
```

## Cobertura automatizada

O smoke executa e valida:

1. `/rolagens` retorna `401` sem autenticacao;
2. login por cookie e CSRF;
3. formula simples;
4. pericia e ataque de personagem;
5. teste, dano e critico de habilidade estruturada;
6. pericia, ataque por acao e dano de NPC;
7. `dadosRolagem.origem = SERVIDOR` e tipo mecanico esperado;
8. evento presente no chat e na timeline;
9. replay do critico retorna o mesmo evento;
10. PV, SAN, EA, PE, turno, sustentacoes e condicoes permanecem iguais.

O script nunca envia formula nos payloads mecanicos. A unica formula enviada
pelo cliente e `1d20` na intencao `FORMULA`, que faz parte do contrato dessa
rolagem narrativa.

## Verificacao visual complementar

O script HTTP confirma a mesma origem `SERVIDOR` usada pelo frontend para o
badge, mas nao abre navegador. Depois do smoke, abra manualmente a sessao
descartavel e confirme:

- badge `Servidor` nos nove eventos;
- chat e timeline sem duplicata do replay;
- ausencia de erro de console e loop de requests;
- cura, itens, consumiveis, macros e fontes textuais continuam no fluxo legado.

Essa verificacao visual nao exige criar novos dados nem repetir as rolagens.

## Limites

- O script confirma persistencia, mas nao conta emissoes WebSocket diretamente.
- Nao valida consumo de Perito; a fixture e rejeitada se houver Perito pendente.
- Nao valida concessao de Inspiracao porque as intencoes nao enviam DT.
- Nao executa em CI por padrao e nenhum workflow o referencia.
- Nao ha fallback para o fluxo legado quando uma fonte estruturada e rejeitada.
