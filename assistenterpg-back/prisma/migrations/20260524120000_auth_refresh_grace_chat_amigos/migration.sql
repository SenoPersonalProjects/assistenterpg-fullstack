ALTER TABLE `sessoes_autenticacao`
  ADD COLUMN `revogacaoMotivo` VARCHAR(191) NULL,
  ADD COLUMN `rotacionadaEm` DATETIME(3) NULL;

CREATE INDEX `sessoes_autenticacao_usuarioId_revogacaoMotivo_rotacionadaEm_idx`
  ON `sessoes_autenticacao`(`usuarioId`, `revogacaoMotivo`, `rotacionadaEm`);

CREATE TABLE `conversas_amizade` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioAId` INTEGER NOT NULL,
  `usuarioBId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `conversas_amizade_usuarioAId_usuarioBId_key`(`usuarioAId`, `usuarioBId`),
  INDEX `conversas_amizade_usuarioAId_atualizadoEm_idx`(`usuarioAId`, `atualizadoEm`),
  INDEX `conversas_amizade_usuarioBId_atualizadoEm_idx`(`usuarioBId`, `atualizadoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mensagens_amizade` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `conversaId` INTEGER NOT NULL,
  `autorId` INTEGER NOT NULL,
  `conteudo` TEXT NOT NULL,
  `removidoEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `mensagens_amizade_conversaId_criadoEm_idx`(`conversaId`, `criadoEm`),
  INDEX `mensagens_amizade_autorId_criadoEm_idx`(`autorId`, `criadoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `leituras_conversas_amizade` (
  `conversaId` INTEGER NOT NULL,
  `usuarioId` INTEGER NOT NULL,
  `lidaAteMensagemId` INTEGER NULL,
  `lidaEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `leituras_conversas_amizade_usuarioId_lidaEm_idx`(`usuarioId`, `lidaEm`),
  PRIMARY KEY (`conversaId`, `usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `conversas_amizade`
  ADD CONSTRAINT `conversas_amizade_usuarioAId_fkey`
  FOREIGN KEY (`usuarioAId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `conversas_amizade`
  ADD CONSTRAINT `conversas_amizade_usuarioBId_fkey`
  FOREIGN KEY (`usuarioBId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensagens_amizade`
  ADD CONSTRAINT `mensagens_amizade_conversaId_fkey`
  FOREIGN KEY (`conversaId`) REFERENCES `conversas_amizade`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensagens_amizade`
  ADD CONSTRAINT `mensagens_amizade_autorId_fkey`
  FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `leituras_conversas_amizade`
  ADD CONSTRAINT `leituras_conversas_amizade_conversaId_fkey`
  FOREIGN KEY (`conversaId`) REFERENCES `conversas_amizade`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `leituras_conversas_amizade`
  ADD CONSTRAINT `leituras_conversas_amizade_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
