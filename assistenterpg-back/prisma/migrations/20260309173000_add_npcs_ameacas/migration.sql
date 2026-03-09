CREATE TABLE `NpcAmeaca` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `donoId` INTEGER NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `descricao` TEXT NULL,
  `fichaTipo` ENUM('NPC', 'AMEACA') NOT NULL DEFAULT 'AMEACA',
  `tipo` ENUM('PESSOA', 'FEITICEIRO', 'MALDICAO', 'ANIMAL', 'HIBRIDO', 'ESPIRITO', 'OUTRO') NOT NULL,
  `tamanho` ENUM('MIUDO', 'PEQUENO', 'MEDIO', 'GRANDE', 'ENORME') NOT NULL DEFAULT 'MEDIO',
  `vd` INTEGER NOT NULL DEFAULT 0,
  `agilidade` INTEGER NOT NULL DEFAULT 0,
  `forca` INTEGER NOT NULL DEFAULT 0,
  `intelecto` INTEGER NOT NULL DEFAULT 0,
  `presenca` INTEGER NOT NULL DEFAULT 0,
  `vigor` INTEGER NOT NULL DEFAULT 0,
  `percepcao` INTEGER NOT NULL DEFAULT 0,
  `iniciativa` INTEGER NOT NULL DEFAULT 0,
  `fortitude` INTEGER NOT NULL DEFAULT 0,
  `reflexos` INTEGER NOT NULL DEFAULT 0,
  `vontade` INTEGER NOT NULL DEFAULT 0,
  `luta` INTEGER NOT NULL DEFAULT 0,
  `jujutsu` INTEGER NOT NULL DEFAULT 0,
  `defesa` INTEGER NOT NULL DEFAULT 10,
  `pontosVida` INTEGER NOT NULL DEFAULT 1,
  `machucado` INTEGER NULL,
  `deslocamentoMetros` INTEGER NOT NULL DEFAULT 6,
  `periciasEspeciais` JSON NULL,
  `resistencias` JSON NULL,
  `vulnerabilidades` JSON NULL,
  `passivas` JSON NULL,
  `acoes` JSON NULL,
  `usoTatico` TEXT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `NpcAmeaca_donoId_idx`(`donoId`),
  INDEX `NpcAmeaca_donoId_nome_idx`(`donoId`, `nome`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `NpcAmeaca`
  ADD CONSTRAINT `NpcAmeaca_donoId_fkey`
  FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
