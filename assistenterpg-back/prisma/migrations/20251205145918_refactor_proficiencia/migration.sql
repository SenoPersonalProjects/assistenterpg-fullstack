/*
  Warnings:

  - Added the required column `categoria` to the `Proficiencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Proficiencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proficiencia` ADD COLUMN `categoria` VARCHAR(191) NOT NULL,
    ADD COLUMN `subtipo` VARCHAR(191) NULL,
    ADD COLUMN `tipo` VARCHAR(191) NOT NULL;
