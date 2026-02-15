/*
  Warnings:

  - You are about to drop the column `grauXama` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauXama` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `limiteEaPorTurno` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `limitePePorTurno` on the `personagemcampanha` table. All the data in the column will be lost.
  - Added the required column `limitePeEaPorTurno` to the `PersonagemCampanha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `personagembase` DROP COLUMN `grauXama`;

-- AlterTable
ALTER TABLE `personagemcampanha` DROP COLUMN `grauXama`,
    DROP COLUMN `limiteEaPorTurno`,
    DROP COLUMN `limitePePorTurno`,
    ADD COLUMN `bloqueio` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `defesaBase` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `defesaEquipamento` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `defesaOutros` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `deslocamento` INTEGER NOT NULL DEFAULT 9,
    ADD COLUMN `esquiva` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `limitePeEaPorTurno` INTEGER NOT NULL,
    ADD COLUMN `turnosEnlouquecendo` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `turnosMorrendo` INTEGER NOT NULL DEFAULT 3,
    MODIFY `prestigioCla` INTEGER NULL;

-- CreateTable
CREATE TABLE `Proficiencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `Proficiencia_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemBaseProficiencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `proficienciaId` INTEGER NOT NULL,

    UNIQUE INDEX `PersonagemBaseProficiencia_personagemBaseId_proficienciaId_key`(`personagemBaseId`, `proficienciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResistenciaTipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `ResistenciaTipo_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemCampanhaResistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `resistenciaTipoId` INTEGER NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `PersonagemCampanhaResistencia_personagemCampanhaId_resistenc_key`(`personagemCampanhaId`, `resistenciaTipoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemBaseProficiencia` ADD CONSTRAINT `PersonagemBaseProficiencia_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBaseProficiencia` ADD CONSTRAINT `PersonagemBaseProficiencia_proficienciaId_fkey` FOREIGN KEY (`proficienciaId`) REFERENCES `Proficiencia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaResistencia` ADD CONSTRAINT `PersonagemCampanhaResistencia_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaResistencia` ADD CONSTRAINT `PersonagemCampanhaResistencia_resistenciaTipoId_fkey` FOREIGN KEY (`resistenciaTipoId`) REFERENCES `ResistenciaTipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
