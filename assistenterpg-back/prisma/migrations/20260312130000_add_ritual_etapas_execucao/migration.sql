-- Add support for "Ritual de Etapas" in technical abilities execution mode.
ALTER TABLE `habilidade_tecnica`
  MODIFY `execucao` ENUM(
    'ACAO_MOVIMENTO',
    'ACAO_LIVRE',
    'ACAO_PADRAO',
    'ACAO_COMPLETA',
    'RITUAL_ETAPAS',
    'AO_ATACAR',
    'REACAO_ESPECIAL',
    'REACAO_BLOQUEIO',
    'REACAO_ESQUIVA',
    'REACAO',
    'SUSTENTADA'
  ) NOT NULL;

ALTER TABLE `variacao_habilidade`
  MODIFY `execucao` ENUM(
    'ACAO_MOVIMENTO',
    'ACAO_LIVRE',
    'ACAO_PADRAO',
    'ACAO_COMPLETA',
    'RITUAL_ETAPAS',
    'AO_ATACAR',
    'REACAO_ESPECIAL',
    'REACAO_BLOQUEIO',
    'REACAO_ESQUIVA',
    'REACAO',
    'SUSTENTADA'
  ) NULL;
