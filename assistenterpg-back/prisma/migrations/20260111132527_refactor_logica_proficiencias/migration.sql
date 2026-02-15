/*
  Warnings:

  - You are about to drop the column `pennalidadeNaoProficiencia` on the `arma_amaldicoada` table. All the data in the column will be lost.
  - You are about to drop the column `pennalidadeNaoProficiencia` on the `artefato_amaldicoado` table. All the data in the column will be lost.
  - You are about to drop the column `pennalidadeNaoProficiencia` on the `protecao_amaldicoada` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `arma_amaldicoada` DROP COLUMN `pennalidadeNaoProficiencia`;

-- AlterTable
ALTER TABLE `artefato_amaldicoado` DROP COLUMN `pennalidadeNaoProficiencia`;

-- AlterTable
ALTER TABLE `protecao_amaldicoada` DROP COLUMN `pennalidadeNaoProficiencia`;
