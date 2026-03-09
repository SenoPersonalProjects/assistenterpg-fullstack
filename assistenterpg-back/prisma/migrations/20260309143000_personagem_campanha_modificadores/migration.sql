-- Add owner reference to campaign character
ALTER TABLE `PersonagemCampanha`
  ADD COLUMN `donoId` INTEGER NULL;

UPDATE `PersonagemCampanha` pc
JOIN `PersonagemBase` pb ON pb.`id` = pc.`personagemBaseId`
SET pc.`donoId` = pb.`donoId`
WHERE pc.`donoId` IS NULL;

ALTER TABLE `PersonagemCampanha`
  MODIFY `donoId` INTEGER NOT NULL;

ALTER TABLE `PersonagemCampanha`
  ADD CONSTRAINT `PersonagemCampanha_donoId_fkey`
  FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `PersonagemCampanha_donoId_idx` ON `PersonagemCampanha`(`donoId`);
CREATE UNIQUE INDEX `PersonagemCampanha_campanhaId_personagemBaseId_key` ON `PersonagemCampanha`(`campanhaId`, `personagemBaseId`);
CREATE UNIQUE INDEX `PersonagemCampanha_campanhaId_donoId_key` ON `PersonagemCampanha`(`campanhaId`, `donoId`);

-- History table for safe undo/audit trail
CREATE TABLE `PersonagemCampanhaHistorico` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `personagemCampanhaId` INTEGER NOT NULL,
  `campanhaId` INTEGER NOT NULL,
  `criadoPorId` INTEGER NULL,
  `tipo` VARCHAR(191) NOT NULL,
  `descricao` TEXT NULL,
  `dados` JSON NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `PersonagemCampanhaHistorico_personagemCampanhaId_criadoEm_idx`(`personagemCampanhaId`, `criadoEm`),
  INDEX `PersonagemCampanhaHistorico_campanhaId_criadoEm_idx`(`campanhaId`, `criadoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PersonagemCampanhaHistorico`
  ADD CONSTRAINT `PersonagemCampanhaHistorico_personagemCampanhaId_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaHistorico`
  ADD CONSTRAINT `PersonagemCampanhaHistorico_campanhaId_fkey`
  FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaHistorico`
  ADD CONSTRAINT `PersonagemCampanhaHistorico_criadoPorId_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Source-aware modifiers table
CREATE TABLE `PersonagemCampanhaModificador` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `personagemCampanhaId` INTEGER NOT NULL,
  `campanhaId` INTEGER NOT NULL,
  `campo` ENUM(
    'PV_MAX',
    'PE_MAX',
    'EA_MAX',
    'SAN_MAX',
    'DEFESA_BASE',
    'DEFESA_EQUIPAMENTO',
    'DEFESA_OUTROS',
    'ESQUIVA',
    'BLOQUEIO',
    'DESLOCAMENTO',
    'LIMITE_PE_EA_POR_TURNO',
    'PRESTIGIO_GERAL',
    'PRESTIGIO_CLA'
  ) NOT NULL,
  `valor` INTEGER NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `descricao` TEXT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `criadoPorId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `desfeitoPorId` INTEGER NULL,
  `desfeitoEm` DATETIME(3) NULL,
  `motivoDesfazer` TEXT NULL,

  INDEX `PersonagemCampanhaModificador_personagemCampanhaId_ativo_idx`(`personagemCampanhaId`, `ativo`),
  INDEX `PersonagemCampanhaModificador_campanhaId_criadoEm_idx`(`campanhaId`, `criadoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_personagemCampanhaId_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_campanhaId_fkey`
  FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_criadoPorId_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_desfeitoPorId_fkey`
  FOREIGN KEY (`desfeitoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
