/*
  Warnings:

  - You are about to drop the column `claHereditarioId` on the `habilidade` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `habilidade` DROP FOREIGN KEY `Habilidade_claHereditarioId_fkey`;

-- DropIndex
DROP INDEX `Habilidade_claHereditarioId_fkey` ON `habilidade`;

-- AlterTable
ALTER TABLE `habilidade` DROP COLUMN `claHereditarioId`;

-- AlterTable
ALTER TABLE `origem` ADD COLUMN `bloqueiaTecnicaHereditária` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `HabilidadeClaHereditario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `habilidadeId` INTEGER NOT NULL,
    `claId` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadeClaHereditario_habilidadeId_claId_key`(`habilidadeId`, `claId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HabilidadeClaHereditario` ADD CONSTRAINT `HabilidadeClaHereditario_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeClaHereditario` ADD CONSTRAINT `HabilidadeClaHereditario_claId_fkey` FOREIGN KEY (`claId`) REFERENCES `Cla`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeTrilha` ADD CONSTRAINT `HabilidadeTrilha_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
