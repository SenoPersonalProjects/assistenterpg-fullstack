CREATE TABLE `amizades` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioAId` INTEGER NOT NULL,
  `usuarioBId` INTEGER NOT NULL,
  `solicitanteId` INTEGER NOT NULL,
  `destinatarioId` INTEGER NOT NULL,
  `status` ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA', 'REMOVIDA') NOT NULL DEFAULT 'PENDENTE',
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `respondidoEm` DATETIME(3) NULL,
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `amizades_usuarioAId_usuarioBId_key`(`usuarioAId`, `usuarioBId`),
  INDEX `amizades_solicitanteId_status_idx`(`solicitanteId`, `status`),
  INDEX `amizades_destinatarioId_status_idx`(`destinatarioId`, `status`),
  INDEX `amizades_usuarioAId_status_idx`(`usuarioAId`, `status`),
  INDEX `amizades_usuarioBId_status_idx`(`usuarioBId`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `amizades`
  ADD CONSTRAINT `amizades_usuarioAId_fkey`
  FOREIGN KEY (`usuarioAId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `amizades`
  ADD CONSTRAINT `amizades_usuarioBId_fkey`
  FOREIGN KEY (`usuarioBId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `amizades`
  ADD CONSTRAINT `amizades_solicitanteId_fkey`
  FOREIGN KEY (`solicitanteId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `amizades`
  ADD CONSTRAINT `amizades_destinatarioId_fkey`
  FOREIGN KEY (`destinatarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
