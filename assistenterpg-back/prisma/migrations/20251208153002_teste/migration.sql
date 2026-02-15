-- 1) criar colunas permitindo NULL
ALTER TABLE `OrigemPericia`
  ADD COLUMN `grupoEscolha` INTEGER NULL,
  ADD COLUMN `tipo` VARCHAR(191) NULL;

-- 2) preencher registros antigos como FIXA
UPDATE `OrigemPericia`
SET `tipo` = 'FIXA'
WHERE `tipo` IS NULL;

-- 3) tornar NOT NULL com default
ALTER TABLE `OrigemPericia`
  MODIFY `tipo` VARCHAR(191) NOT NULL DEFAULT 'FIXA';
