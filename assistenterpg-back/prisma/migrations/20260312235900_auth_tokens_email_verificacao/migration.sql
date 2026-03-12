ALTER TABLE `usuario`
  ADD COLUMN `emailVerificadoEm` DATETIME(3) NULL;

UPDATE `usuario`
SET `emailVerificadoEm` = NOW(3)
WHERE `emailVerificadoEm` IS NULL;

CREATE TABLE `auth_tokens` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `tipo` ENUM('RECUPERACAO_SENHA', 'VERIFICACAO_EMAIL') NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiraEm` DATETIME(3) NOT NULL,
  `usadoEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `auth_tokens_tokenHash_key`(`tokenHash`),
  INDEX `AuthToken_usuario_tipo_usado_idx`(`usuarioId`, `tipo`, `usadoEm`),
  INDEX `AuthToken_tipo_expira_idx`(`tipo`, `expiraEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
