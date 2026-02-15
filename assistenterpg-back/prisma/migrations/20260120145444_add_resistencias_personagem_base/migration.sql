/*
  Warnings:

  - You are about to drop the column `defesa` on the `personagembase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `personagembase` DROP COLUMN `defesa`,
    ADD COLUMN `defesaBase` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `defesaEquipamento` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `defesaOutros` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `personagem_base_resistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `resistenciaTipoId` INTEGER NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 0,

    INDEX `personagem_base_resistencia_personagemBaseId_idx`(`personagemBaseId`),
    INDEX `personagem_base_resistencia_resistenciaTipoId_idx`(`resistenciaTipoId`),
    UNIQUE INDEX `personagem_base_resistencia_personagemBaseId_resistenciaTipo_key`(`personagemBaseId`, `resistenciaTipoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `personagem_base_resistencia` ADD CONSTRAINT `personagem_base_resistencia_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personagem_base_resistencia` ADD CONSTRAINT `personagem_base_resistencia_resistenciaTipoId_fkey` FOREIGN KEY (`resistenciaTipoId`) REFERENCES `ResistenciaTipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
