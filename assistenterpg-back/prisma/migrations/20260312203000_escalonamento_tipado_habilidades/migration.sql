ALTER TABLE `habilidade_tecnica`
  ADD COLUMN `escalonamentoCustoPE` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `escalonamentoTipo` ENUM('DANO', 'CURA', 'NUMERICO', 'REGRAS', 'OUTRO') NOT NULL DEFAULT 'OUTRO',
  ADD COLUMN `escalonamentoEfeito` JSON NULL;

ALTER TABLE `variacao_habilidade`
  ADD COLUMN `escalonamentoCustoPE` INTEGER NULL,
  ADD COLUMN `escalonamentoTipo` ENUM('DANO', 'CURA', 'NUMERICO', 'REGRAS', 'OUTRO') NULL,
  ADD COLUMN `escalonamentoEfeito` JSON NULL;
