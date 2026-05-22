CREATE TABLE `sessoes_autenticacao` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `refreshTokenHash` VARCHAR(191) NOT NULL,
  `csrfTokenHash` VARCHAR(191) NOT NULL,
  `userAgent` TEXT NULL,
  `ipHash` VARCHAR(191) NULL,
  `expiraEm` DATETIME(3) NOT NULL,
  `revogadaEm` DATETIME(3) NULL,
  `ultimoUsoEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `sessoes_autenticacao_refreshTokenHash_key`(`refreshTokenHash`),
  INDEX `sessoes_autenticacao_usuarioId_revogadaEm_idx`(`usuarioId`, `revogadaEm`),
  INDEX `sessoes_autenticacao_usuarioId_expiraEm_idx`(`usuarioId`, `expiraEm`),
  INDEX `sessoes_autenticacao_expiraEm_idx`(`expiraEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sessoes_autenticacao`
  ADD CONSTRAINT `sessoes_autenticacao_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
