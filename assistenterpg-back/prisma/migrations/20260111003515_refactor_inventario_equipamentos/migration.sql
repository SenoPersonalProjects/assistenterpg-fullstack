/*
  Warnings:

  - You are about to drop the column `dadosPorEmpunhadura` on the `equipamento_catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `reducoesDano` on the `equipamento_catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `grauNome` on the `grau_feiticeiro_limite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[grau]` on the table `grau_feiticeiro_limite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grau` to the `grau_feiticeiro_limite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `equipamento_catalogo` DROP COLUMN `dadosPorEmpunhadura`,
    DROP COLUMN `reducoesDano`;

-- AlterTable
ALTER TABLE `grau_feiticeiro_limite` DROP COLUMN `grauNome`,
    ADD COLUMN `descricao` TEXT NULL,
    ADD COLUMN `grau` ENUM('GRAU_4', 'GRAU_3', 'GRAU_2', 'SEMI_1', 'GRAU_1', 'ESPECIAL') NOT NULL;

-- AlterTable
ALTER TABLE `modificacao_equipamento` ADD COLUMN `apenas_amaldicoadas` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `requerComplexidade` ENUM('NENHUMA', 'SIMPLES', 'COMPLEXA') NULL;

-- CreateTable
CREATE TABLE `equipamento_dano` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `empunhadura` ENUM('LEVE', 'UMA_MAO', 'DUAS_MAOS') NULL,
    `tipoDano` ENUM('CORTANTE', 'PERFURANTE', 'IMPACTO', 'BALISTICO', 'FOGO', 'ELETRICO', 'ACIDO', 'FRIO', 'ENERGIA_AMALDICOADA', 'MENTAL') NOT NULL,
    `rolagem` VARCHAR(191) NOT NULL,
    `valorFlat` INTEGER NOT NULL DEFAULT 0,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `equipamento_dano_equipamentoId_idx`(`equipamentoId`),
    INDEX `equipamento_dano_tipoDano_idx`(`tipoDano`),
    UNIQUE INDEX `equipamento_dano_equipamentoId_empunhadura_tipoDano_key`(`equipamentoId`, `empunhadura`, `tipoDano`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamento_reducao_dano` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `tipoReducao` ENUM('BALISTICO', 'CORTANTE', 'IMPACTO', 'PERFURANTE', 'JUJUTSU', 'GERAL') NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `equipamento_reducao_dano_equipamentoId_idx`(`equipamentoId`),
    INDEX `equipamento_reducao_dano_tipoReducao_idx`(`tipoReducao`),
    UNIQUE INDEX `equipamento_reducao_dano_equipamentoId_tipoReducao_key`(`equipamentoId`, `tipoReducao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arma_amaldicoada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `tipoBase` VARCHAR(191) NOT NULL,
    `proficienciaRequerida` BOOLEAN NOT NULL DEFAULT false,
    `efeito` TEXT NULL,
    `pennalidadeNaoProficiencia` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `arma_amaldicoada_equipamentoId_key`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protecao_amaldicoada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `tipoBase` VARCHAR(191) NOT NULL,
    `bonusDefesa` INTEGER NOT NULL DEFAULT 0,
    `penalidadeCarga` INTEGER NOT NULL DEFAULT 0,
    `proficienciaRequerida` BOOLEAN NOT NULL DEFAULT false,
    `efeito` TEXT NULL,
    `pennalidadeNaoProficiencia` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `protecao_amaldicoada_equipamentoId_key`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artefato_amaldicoado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `tipoBase` VARCHAR(191) NOT NULL,
    `proficienciaRequerida` BOOLEAN NOT NULL DEFAULT false,
    `efeito` TEXT NULL,
    `custoUso` TEXT NULL,
    `manutencao` TEXT NULL,
    `pennalidadeNaoProficiencia` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artefato_amaldicoado_equipamentoId_key`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `grau_feiticeiro_limite_grau_key` ON `grau_feiticeiro_limite`(`grau`);

-- CreateIndex
CREATE INDEX `grau_feiticeiro_limite_grau_idx` ON `grau_feiticeiro_limite`(`grau`);

-- AddForeignKey
ALTER TABLE `equipamento_dano` ADD CONSTRAINT `equipamento_dano_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_reducao_dano` ADD CONSTRAINT `equipamento_reducao_dano_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arma_amaldicoada` ADD CONSTRAINT `arma_amaldicoada_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protecao_amaldicoada` ADD CONSTRAINT `protecao_amaldicoada_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artefato_amaldicoado` ADD CONSTRAINT `artefato_amaldicoado_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
