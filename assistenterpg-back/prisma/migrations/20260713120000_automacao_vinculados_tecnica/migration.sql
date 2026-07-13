CREATE TABLE `tecnica_vinculado_config` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tecnicaId` INTEGER NOT NULL,
  `tipoVinculado` ENUM('SHIKIGAMI', 'CORPO_AMALDICOADO', 'MALDICAO_CONTROLADA') NOT NULL,
  `modo` ENUM('CRIAVEL', 'PREDEFINIDOS', 'HIBRIDO') NOT NULL DEFAULT 'CRIAVEL',
  `limitesJson` JSON NULL,
  `regrasJson` JSON NULL,
  `calculoJson` JSON NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  UNIQUE INDEX `tecnica_vinculado_config_tecnicaId_tipoVinculado_key`(`tecnicaId`, `tipoVinculado`),
  INDEX `idx_tec_vinc_config_tipo_ativo`(`tipoVinculado`, `ativo`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tecnica_vinculado_template` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tecnicaId` INTEGER NOT NULL,
  `tipoVinculado` ENUM('SHIKIGAMI', 'CORPO_AMALDICOADO', 'MALDICAO_CONTROLADA') NOT NULL,
  `codigo` VARCHAR(100) NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` TEXT NULL,
  `conceito` TEXT NULL,
  `aparencia` TEXT NULL,
  `snapshotJson` JSON NULL,
  `requisitosJson` JSON NULL,
  `bloqueadoPorPadrao` BOOLEAN NOT NULL DEFAULT true,
  `ordem` INTEGER NOT NULL DEFAULT 0,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  UNIQUE INDEX `tecnica_vinculado_template_tecnicaId_codigo_key`(`tecnicaId`, `codigo`),
  INDEX `idx_tec_vinc_template_lista`(`tecnicaId`, `tipoVinculado`, `ativo`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD COLUMN `templateId` INTEGER NULL,
  ADD COLUMN `precisaRecalculo` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `calculoAutomatico` JSON NULL,
  ADD COLUMN `overrideMestre` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `idx_ent_vinc_template`
  ON `personagem_campanha_entidades_vinculadas`(`templateId`);

CREATE INDEX `idx_ent_vinc_recalculo`
  ON `personagem_campanha_entidades_vinculadas`(`personagemCampanhaId`, `precisaRecalculo`);

ALTER TABLE `tecnica_vinculado_config`
  ADD CONSTRAINT `tecnica_vinculado_config_tecnicaId_fkey`
  FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tecnica_vinculado_template`
  ADD CONSTRAINT `tecnica_vinculado_template_tecnicaId_fkey`
  FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `personagem_campanha_entidades_vinculadas_templateId_fkey`
  FOREIGN KEY (`templateId`) REFERENCES `tecnica_vinculado_template`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
