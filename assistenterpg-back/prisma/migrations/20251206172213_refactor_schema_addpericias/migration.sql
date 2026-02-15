-- AlterTable
ALTER TABLE `classe` ADD COLUMN `periciasLivresBase` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `origem` ADD COLUMN `requerGrandeCla` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `requerTecnicaHereditária` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `requisitosTexto` TEXT NULL;

-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `estudouEscolaTecnica` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `ClassePericia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classeId` INTEGER NOT NULL,
    `periciaId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `grupoEscolha` INTEGER NULL,

    UNIQUE INDEX `ClassePericia_classeId_periciaId_key`(`classeId`, `periciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrigemPericia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `origemId` INTEGER NOT NULL,
    `periciaId` INTEGER NOT NULL,

    UNIQUE INDEX `OrigemPericia_origemId_periciaId_key`(`origemId`, `periciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pericia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `atributoBase` ENUM('AGI', 'FOR', 'INT', 'PRE', 'VIG') NOT NULL,
    `somenteTreinada` BOOLEAN NOT NULL DEFAULT false,
    `penalizaPorCarga` BOOLEAN NOT NULL DEFAULT false,
    `precisaKit` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Pericia_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemBasePericia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `periciaId` INTEGER NOT NULL,
    `grauTreinamento` INTEGER NOT NULL DEFAULT 0,
    `bonusExtra` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `PersonagemBasePericia_personagemBaseId_periciaId_key`(`personagemBaseId`, `periciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClassePericia` ADD CONSTRAINT `ClassePericia_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassePericia` ADD CONSTRAINT `ClassePericia_periciaId_fkey` FOREIGN KEY (`periciaId`) REFERENCES `Pericia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrigemPericia` ADD CONSTRAINT `OrigemPericia_origemId_fkey` FOREIGN KEY (`origemId`) REFERENCES `Origem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrigemPericia` ADD CONSTRAINT `OrigemPericia_periciaId_fkey` FOREIGN KEY (`periciaId`) REFERENCES `Pericia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBasePericia` ADD CONSTRAINT `PersonagemBasePericia_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBasePericia` ADD CONSTRAINT `PersonagemBasePericia_periciaId_fkey` FOREIGN KEY (`periciaId`) REFERENCES `Pericia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
