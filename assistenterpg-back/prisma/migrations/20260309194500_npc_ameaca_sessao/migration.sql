CREATE TABLE `NpcAmeacaSessao` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sessaoId` INTEGER NOT NULL,
  `cenaId` INTEGER NULL,
  `npcAmeacaId` INTEGER NULL,
  `nomeExibicao` VARCHAR(191) NOT NULL,
  `fichaTipo` ENUM('NPC', 'AMEACA') NOT NULL DEFAULT 'AMEACA',
  `tipo` ENUM('PESSOA', 'FEITICEIRO', 'MALDICAO', 'ANIMAL', 'HIBRIDO', 'ESPIRITO', 'OUTRO') NOT NULL,
  `vd` INTEGER NOT NULL DEFAULT 0,
  `defesa` INTEGER NOT NULL DEFAULT 10,
  `pontosVidaAtual` INTEGER NOT NULL DEFAULT 1,
  `pontosVidaMax` INTEGER NOT NULL DEFAULT 1,
  `machucado` INTEGER NULL,
  `deslocamentoMetros` INTEGER NOT NULL DEFAULT 6,
  `passivasGuia` JSON NULL,
  `acoesGuia` JSON NULL,
  `notasCena` TEXT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `NpcAmeacaSessao_sessaoId_idx`(`sessaoId`),
  INDEX `NpcAmeacaSessao_cenaId_idx`(`cenaId`),
  INDEX `NpcAmeacaSessao_npcAmeacaId_idx`(`npcAmeacaId`),
  INDEX `NpcAmeacaSessao_sessaoId_cenaId_idx`(`sessaoId`, `cenaId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_sessaoId_fkey`
  FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_cenaId_fkey`
  FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_npcAmeacaId_fkey`
  FOREIGN KEY (`npcAmeacaId`) REFERENCES `NpcAmeaca`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
