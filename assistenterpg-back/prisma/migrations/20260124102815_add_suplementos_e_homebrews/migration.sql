/*
  Warnings:

  - You are about to drop the column `apenas_amaldicoadas` on the `modificacao_equipamento` table. All the data in the column will be lost.
  - You are about to drop the column `requerComplexidade` on the `modificacao_equipamento` table. All the data in the column will be lost.
  - You are about to drop the column `origem` on the `tecnica_amaldicoada` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `caminho` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `classe` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `equipamento_catalogo` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `habilidade` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `modificacao_equipamento` DROP COLUMN `apenas_amaldicoadas`,
    DROP COLUMN `requerComplexidade`,
    ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `restricoes` JSON NULL,
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `origem` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `tecnica_amaldicoada` DROP COLUMN `origem`,
    ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `trilha` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `role` ENUM('USUARIO', 'ADMIN') NOT NULL DEFAULT 'USUARIO';

-- CreateTable
CREATE TABLE `suplementos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `versao` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `status` ENUM('RASCUNHO', 'PUBLICADO', 'ARQUIVADO') NOT NULL DEFAULT 'RASCUNHO',
    `icone` TEXT NULL,
    `banner` TEXT NULL,
    `tags` JSON NULL,
    `autor` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suplementos_codigo_key`(`codigo`),
    INDEX `suplementos_status_idx`(`status`),
    INDEX `suplementos_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_suplemento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `suplementoId` INTEGER NOT NULL,
    `ativadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `usuario_suplemento_usuarioId_idx`(`usuarioId`),
    INDEX `usuario_suplemento_suplementoId_idx`(`suplementoId`),
    UNIQUE INDEX `usuario_suplemento_usuarioId_suplementoId_key`(`usuarioId`, `suplementoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homebrews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('TRILHA', 'CAMINHO', 'ORIGEM', 'EQUIPAMENTO', 'PODER_GENERICO', 'TECNICA_AMALDICOADA') NOT NULL,
    `status` ENUM('RASCUNHO', 'PUBLICADO', 'ARQUIVADO') NOT NULL DEFAULT 'RASCUNHO',
    `usuarioId` INTEGER NOT NULL,
    `dados` JSON NOT NULL,
    `tags` JSON NULL,
    `versao` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `homebrews_usuarioId_idx`(`usuarioId`),
    INDEX `homebrews_tipo_idx`(`tipo`),
    INDEX `homebrews_status_idx`(`status`),
    UNIQUE INDEX `homebrews_usuarioId_codigo_key`(`usuarioId`, `codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Caminho_fonte_idx` ON `Caminho`(`fonte`);

-- CreateIndex
CREATE INDEX `Caminho_suplementoId_idx` ON `Caminho`(`suplementoId`);

-- CreateIndex
CREATE INDEX `Classe_fonte_idx` ON `Classe`(`fonte`);

-- CreateIndex
CREATE INDEX `Classe_suplementoId_idx` ON `Classe`(`suplementoId`);

-- CreateIndex
CREATE INDEX `equipamento_catalogo_fonte_idx` ON `equipamento_catalogo`(`fonte`);

-- CreateIndex
CREATE INDEX `equipamento_catalogo_suplementoId_idx` ON `equipamento_catalogo`(`suplementoId`);

-- CreateIndex
CREATE INDEX `Habilidade_fonte_idx` ON `Habilidade`(`fonte`);

-- CreateIndex
CREATE INDEX `Habilidade_suplementoId_idx` ON `Habilidade`(`suplementoId`);

-- CreateIndex
CREATE INDEX `modificacao_equipamento_tipo_idx` ON `modificacao_equipamento`(`tipo`);

-- CreateIndex
CREATE INDEX `modificacao_equipamento_fonte_idx` ON `modificacao_equipamento`(`fonte`);

-- CreateIndex
CREATE INDEX `modificacao_equipamento_suplementoId_idx` ON `modificacao_equipamento`(`suplementoId`);

-- CreateIndex
CREATE INDEX `Origem_fonte_idx` ON `Origem`(`fonte`);

-- CreateIndex
CREATE INDEX `Origem_suplementoId_idx` ON `Origem`(`suplementoId`);

-- CreateIndex
CREATE INDEX `tecnica_amaldicoada_fonte_idx` ON `tecnica_amaldicoada`(`fonte`);

-- CreateIndex
CREATE INDEX `tecnica_amaldicoada_suplementoId_idx` ON `tecnica_amaldicoada`(`suplementoId`);

-- CreateIndex
CREATE INDEX `Trilha_fonte_idx` ON `Trilha`(`fonte`);

-- CreateIndex
CREATE INDEX `Trilha_suplementoId_idx` ON `Trilha`(`suplementoId`);

-- AddForeignKey
ALTER TABLE `Classe` ADD CONSTRAINT `Classe_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trilha` ADD CONSTRAINT `Trilha_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caminho` ADD CONSTRAINT `Caminho_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Origem` ADD CONSTRAINT `Origem_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Habilidade` ADD CONSTRAINT `Habilidade_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_catalogo` ADD CONSTRAINT `equipamento_catalogo_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modificacao_equipamento` ADD CONSTRAINT `modificacao_equipamento_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tecnica_amaldicoada` ADD CONSTRAINT `tecnica_amaldicoada_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_suplemento` ADD CONSTRAINT `usuario_suplemento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_suplemento` ADD CONSTRAINT `usuario_suplemento_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homebrews` ADD CONSTRAINT `homebrews_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
