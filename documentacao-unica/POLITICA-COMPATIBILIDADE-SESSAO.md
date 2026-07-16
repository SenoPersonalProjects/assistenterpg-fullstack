# Política de Compatibilidade de Sessão

## Autoridade de rolagens

- `POST /campanhas/:campanhaId/sessoes/:sessaoId/rolagens` é o caminho autoritativo para rolagens mecânicas.
- O servidor resolve a fonte, gera os dados, calcula o resultado e persiste a intenção idempotente.
- `clientRequestId` é obrigatório nesse endpoint.
- O frontend oficial deve enviar somente intenções e identificadores pelos helpers de `/rolagens`.

## Chat e compatibilidade histórica

- `POST /campanhas/:campanhaId/sessoes/:sessaoId/chat` é destinado a texto livre e narrativo.
- O frontend oficial usa o helper textual, que não aceita `dadosRolagem` nem `contextoRolagem`.
- Esses campos continuam no DTO e no helper legado apenas para clientes antigos e histórico.
- Novos payloads recebidos por esse contrato são marcados como `CLIENTE_LEGADO` e não comprovam total, crítico, Perito, Inspiração, Escalada ou qualquer efeito mecânico.
- A leitura dos marcadores `dice:v1` até `dice:v5` deve ser preservada.

## Idempotência e precondições

- O frontend oficial envia `clientRequestId` nas mutações de habilidade, condição, sustentação, Inspiração e consumível.
- Clientes antigos ainda podem omitir esse UUID. A operação permanece aceita, mas o backend registra um warning estruturado e seguro.
- Ajustes manuais de recursos devem enviar os campos `*AtualEsperado` para detectar snapshots obsoletos.
- A ausência dessas precondições ainda não bloqueia clientes antigos e também gera apenas warning.
- UUIDs e precondições poderão se tornar obrigatórios em uma versão futura, após medição e comunicação de compatibilidade.

## Observabilidade

- Warnings de compatibilidade não alteram resposta, status HTTP, regra de jogo ou idempotência existente.
- Os logs registram somente código do evento, fluxo e identificadores operacionais necessários.
- DTOs completos, mensagens, fórmulas, resultados, cookies, tokens e credenciais não devem ser registrados.
