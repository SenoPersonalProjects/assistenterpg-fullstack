# Epifania e Dominio Incompleto — atualizacao de implementacao

Status: Em validacao manual

## Entrega

- A Epifania usa uma Expansao completa cadastrada na Tecnica Inata efetiva
  como perfil autoritativo. Nome, custos e estrutura deixam de depender de
  valores digitados pelo mestre, e o servidor recusa uma habilidade externa.
- Sem uma Expansao cadastrada, o perfil narrativo e salvo na ficha da
  campanha e reutilizado nos proximos usos. Ele nao cria conteudo global.
- Uma Epifania bem-sucedida passa a criar o Dominio em `ABRINDO`. O mestre
  pode `FORMAR` ou `INTERROMPER`; os bonus do Dominio Incompleto so existem
  depois da formacao e a interrupcao continua usando o esgotamento antecipado.
- Disputas usam uma rolagem real de Jujutsu no servidor. O evento registra
  expressao, dados, total e ajustes. Dominio Incompleto aplica literalmente
  `-2d20`, respeitando o piso de `1d20` do resolvedor.

## Validacao manual pendente

- [ ] Formar e interromper uma Epifania, confirmando que os bonus so aparecem
  apos `FORMAR` e que a interrupcao gera uma rodada de esgotamento.
- [ ] Selecionar uma Expansao cadastrada e conferir a cobranca automatica.
- [ ] Salvar e reutilizar um perfil narrativo sem Expansao cadastrada.
- [ ] Conferir o evento de uma disputa com Dominio Incompleto e validar o
  ajuste `-2d20` e os dados rolados.
