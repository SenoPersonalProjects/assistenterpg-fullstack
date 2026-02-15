/*
  Warnings:

  - You are about to drop the column `bloqueiaTecnicaHereditária` on the `origem` table. All the data in the column will be lost.
  - You are about to drop the column `requerTecnicaHereditária` on the `origem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `origem` DROP COLUMN `bloqueiaTecnicaHereditária`,
    DROP COLUMN `requerTecnicaHereditária`,
    ADD COLUMN `bloqueiaTecnicaHeriditaria` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `requerTecnicaHeriditaria` BOOLEAN NOT NULL DEFAULT false;
