-- Add columns to support explicit dice count overrides on main NPC skills
ALTER TABLE `NpcAmeaca`
  ADD COLUMN `percepcaoDados` INTEGER NULL,
  ADD COLUMN `iniciativaDados` INTEGER NULL,
  ADD COLUMN `fortitudeDados` INTEGER NULL,
  ADD COLUMN `reflexosDados` INTEGER NULL,
  ADD COLUMN `vontadeDados` INTEGER NULL,
  ADD COLUMN `lutaDados` INTEGER NULL,
  ADD COLUMN `jujutsuDados` INTEGER NULL;

-- Enforce the new official enum values
ALTER TABLE `NpcAmeaca`
  MODIFY `tipo` ENUM('HUMANO', 'FEITICEIRO', 'MALDICAO', 'ANIMAL', 'HIBRIDO', 'OUTRO') NOT NULL;

ALTER TABLE `NpcAmeacaSessao`
  MODIFY `tipo` ENUM('HUMANO', 'FEITICEIRO', 'MALDICAO', 'ANIMAL', 'HIBRIDO', 'OUTRO') NOT NULL;

ALTER TABLE `NpcAmeaca`
  MODIFY `tamanho` ENUM('MINUSCULO', 'PEQUENO', 'MEDIO', 'GRANDE', 'ENORME', 'COLOSSAL') NOT NULL DEFAULT 'MEDIO';