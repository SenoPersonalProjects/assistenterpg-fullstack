ALTER TABLE `NpcAmeacaSessao`
  ADD COLUMN `tamanho` ENUM('MINUSCULO','PEQUENO','MEDIO','GRANDE','ENORME','COLOSSAL') NULL DEFAULT 'MEDIO' AFTER `tipo`,
  ADD COLUMN `agilidade` INTEGER NULL AFTER `machucado`,
  ADD COLUMN `forca` INTEGER NULL AFTER `agilidade`,
  ADD COLUMN `intelecto` INTEGER NULL AFTER `forca`,
  ADD COLUMN `presenca` INTEGER NULL AFTER `intelecto`,
  ADD COLUMN `vigor` INTEGER NULL AFTER `presenca`,
  ADD COLUMN `percepcao` INTEGER NULL AFTER `vigor`,
  ADD COLUMN `iniciativa` INTEGER NULL AFTER `percepcao`,
  ADD COLUMN `fortitude` INTEGER NULL AFTER `iniciativa`,
  ADD COLUMN `reflexos` INTEGER NULL AFTER `fortitude`,
  ADD COLUMN `vontade` INTEGER NULL AFTER `reflexos`,
  ADD COLUMN `luta` INTEGER NULL AFTER `vontade`,
  ADD COLUMN `jujutsu` INTEGER NULL AFTER `luta`;
