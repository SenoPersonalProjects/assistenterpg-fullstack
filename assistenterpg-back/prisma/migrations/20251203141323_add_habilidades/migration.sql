/*
  Warnings:

  - Added the required column `agilidade` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `claId` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classeId` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forca` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grauXama` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intelecto` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origemId` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presenca` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vigor` to the `PersonagemBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `claId` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classeId` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eaAtual` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eaMax` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grauXama` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limiteEaPorTurno` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limitePePorTurno` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origemId` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peAtual` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peMax` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pvAtual` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pvMax` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sanAtual` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sanMax` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `agilidade` INTEGER NOT NULL,
    ADD COLUMN `caminhoId` INTEGER NULL,
    ADD COLUMN `claId` INTEGER NOT NULL,
    ADD COLUMN `classeId` INTEGER NOT NULL,
    ADD COLUMN `forca` INTEGER NOT NULL,
    ADD COLUMN `grauTecAmaldicoada` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecAntiBarreira` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecBarreira` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecCadaveres` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecReversa` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecShikigami` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauXama` VARCHAR(191) NOT NULL,
    ADD COLUMN `intelecto` INTEGER NOT NULL,
    ADD COLUMN `nivel` INTEGER NOT NULL,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL,
    ADD COLUMN `origemId` INTEGER NOT NULL,
    ADD COLUMN `presenca` INTEGER NOT NULL,
    ADD COLUMN `tecnicaInataId` INTEGER NULL,
    ADD COLUMN `trilhaId` INTEGER NULL,
    ADD COLUMN `vigor` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `personagemcampanha` ADD COLUMN `caminhoId` INTEGER NULL,
    ADD COLUMN `claId` INTEGER NOT NULL,
    ADD COLUMN `classeId` INTEGER NOT NULL,
    ADD COLUMN `eaAtual` INTEGER NOT NULL,
    ADD COLUMN `eaMax` INTEGER NOT NULL,
    ADD COLUMN `grauTecAmaldicoada` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecAntiBarreira` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecBarreira` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecCadaveres` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecReversa` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauTecShikigami` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `grauXama` VARCHAR(191) NOT NULL,
    ADD COLUMN `limiteEaPorTurno` INTEGER NOT NULL,
    ADD COLUMN `limitePePorTurno` INTEGER NOT NULL,
    ADD COLUMN `nivel` INTEGER NOT NULL,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL,
    ADD COLUMN `origemId` INTEGER NOT NULL,
    ADD COLUMN `peAtual` INTEGER NOT NULL,
    ADD COLUMN `peMax` INTEGER NOT NULL,
    ADD COLUMN `prestigioCla` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `prestigioGeral` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pvAtual` INTEGER NOT NULL,
    ADD COLUMN `pvMax` INTEGER NOT NULL,
    ADD COLUMN `sanAtual` INTEGER NOT NULL,
    ADD COLUMN `sanMax` INTEGER NOT NULL,
    ADD COLUMN `trilhaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Classe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trilha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classeId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Caminho` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trilhaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `grandeCla` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Origem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Habilidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `origem` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HabilidadePersonagemBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadePersonagemBase_personagemBaseId_habilidadeId_key`(`personagemBaseId`, `habilidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HabilidadePersonagemCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadePersonagemCampanha_personagemCampanhaId_habilidade_key`(`personagemCampanhaId`, `habilidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `tipoItem` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `grauItem` INTEGER NULL,
    `pesoCarga` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemPersonagemCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `equipado` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `ItemPersonagemCampanha_personagemCampanhaId_itemId_key`(`personagemCampanhaId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_tecnicaInataId_fkey` FOREIGN KEY (`tecnicaInataId`) REFERENCES `Habilidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_claId_fkey` FOREIGN KEY (`claId`) REFERENCES `Cla`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_origemId_fkey` FOREIGN KEY (`origemId`) REFERENCES `Origem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_caminhoId_fkey` FOREIGN KEY (`caminhoId`) REFERENCES `Caminho`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_claId_fkey` FOREIGN KEY (`claId`) REFERENCES `Cla`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_origemId_fkey` FOREIGN KEY (`origemId`) REFERENCES `Origem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_caminhoId_fkey` FOREIGN KEY (`caminhoId`) REFERENCES `Caminho`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trilha` ADD CONSTRAINT `Trilha_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caminho` ADD CONSTRAINT `Caminho_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemBase` ADD CONSTRAINT `HabilidadePersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemBase` ADD CONSTRAINT `HabilidadePersonagemBase_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemCampanha` ADD CONSTRAINT `HabilidadePersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemCampanha` ADD CONSTRAINT `HabilidadePersonagemCampanha_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPersonagemCampanha` ADD CONSTRAINT `ItemPersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPersonagemCampanha` ADD CONSTRAINT `ItemPersonagemCampanha_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
