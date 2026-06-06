ALTER TABLE `Usuario`
  ADD COLUMN `status` ENUM('ATIVA', 'DESATIVADA', 'EXCLUIDA') NOT NULL DEFAULT 'ATIVA',
  ADD COLUMN `desativadoEm` DATETIME(3) NULL,
  ADD COLUMN `excluidoEm` DATETIME(3) NULL;

CREATE TABLE `registros_pendentes_usuario` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `apelido` VARCHAR(191) NOT NULL,
  `senhaHash` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `tokenExpiraEm` DATETIME(3) NOT NULL,
  `expiraEm` DATETIME(3) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `registros_pendentes_usuario_email_key`(`email`),
  UNIQUE INDEX `registros_pendentes_usuario_tokenHash_key`(`tokenHash`),
  INDEX `registros_pendentes_usuario_tokenExpiraEm_idx`(`tokenExpiraEm`),
  INDEX `registros_pendentes_usuario_expiraEm_idx`(`expiraEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `alteracoes_email_pendentes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `novoEmail` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `tokenExpiraEm` DATETIME(3) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `alteracoes_email_pendentes_usuarioId_key`(`usuarioId`),
  UNIQUE INDEX `alteracoes_email_pendentes_novoEmail_key`(`novoEmail`),
  UNIQUE INDEX `alteracoes_email_pendentes_tokenHash_key`(`tokenHash`),
  INDEX `alteracoes_email_pendentes_tokenExpiraEm_idx`(`tokenExpiraEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `limites_requisicao_seguranca` (
  `chaveHash` VARCHAR(64) NOT NULL,
  `contador` INTEGER NOT NULL,
  `janelaIniciaEm` DATETIME(3) NOT NULL,
  `bloqueadoAte` DATETIME(3) NULL,
  `expiraEm` DATETIME(3) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `limites_requisicao_seguranca_expiraEm_idx`(`expiraEm`),
  INDEX `limites_requisicao_seguranca_bloqueadoAte_idx`(`bloqueadoAte`),
  PRIMARY KEY (`chaveHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sessoes_autenticacao`
  ADD COLUMN `familiaId` VARCHAR(64) NULL;

UPDATE `sessoes_autenticacao`
SET `familiaId` = CONCAT('legacy-', `id`)
WHERE `familiaId` IS NULL;

ALTER TABLE `sessoes_autenticacao`
  MODIFY `familiaId` VARCHAR(64) NOT NULL;

CREATE INDEX `sessoes_autenticacao_familiaId_revogadaEm_idx`
  ON `sessoes_autenticacao`(`familiaId`, `revogadaEm`);

ALTER TABLE `alteracoes_email_pendentes`
  ADD CONSTRAINT `alteracoes_email_pendentes_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
