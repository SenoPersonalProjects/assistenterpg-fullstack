ALTER TABLE `NpcAmeaca` ADD COLUMN `eaMax` INTEGER NULL;
ALTER TABLE `NpcAmeacaSessao` ADD COLUMN `estadoAcoes` JSON NULL;
ALTER TABLE `DefesaAntiDominioSessao` ADD COLUMN `zona` JSON NULL;
ALTER TABLE `PersonagemBase` ADD COLUMN `configuracaoDezSombras` JSON NULL;
ALTER TABLE `PersonagemCampanha` ADD COLUMN `configuracaoDezSombras` JSON NULL, ADD COLUMN `estadoDezSombras` JSON NULL;
CREATE TABLE `NpcAmeacaCampanha` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `campanhaId` INTEGER NOT NULL,
  `npcAmeacaId` INTEGER NOT NULL,
  `ficha` JSON NOT NULL,
  `atualizadoEm` DATETIME(3) NOT NULL,
  UNIQUE INDEX `NpcAmeacaCampanha_campanhaId_npcAmeacaId_key` (`campanhaId`, `npcAmeacaId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `NpcAmeacaCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `NpcAmeacaCampanha_npcAmeacaId_fkey` FOREIGN KEY (`npcAmeacaId`) REFERENCES `NpcAmeaca`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
