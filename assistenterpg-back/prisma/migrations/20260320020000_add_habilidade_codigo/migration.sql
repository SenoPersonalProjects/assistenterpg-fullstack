-- Add codigo to Habilidade and unique index
ALTER TABLE `Habilidade`
  ADD COLUMN `codigo` VARCHAR(60) NULL;

CREATE UNIQUE INDEX `Habilidade_codigo_key` ON `Habilidade`(`codigo`);
