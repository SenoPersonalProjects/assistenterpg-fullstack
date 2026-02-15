/*
  Warnings:

  - A unique constraint covering the columns `[trilhaId,habilidadeId,nivelConcedido]` on the table `HabilidadeTrilha` will be added. If there are existing duplicate values, this will fail.
*/

-- DropForeignKey
ALTER TABLE `habilidadetrilha` DROP FOREIGN KEY `HabilidadeTrilha_trilhaId_fkey`;

-- DropIndex
DROP INDEX `HabilidadeTrilha_trilhaId_habilidadeId_nivelConcedido_caminh_key` ON `habilidadetrilha`;

-- CreateIndex
CREATE UNIQUE INDEX `HabilidadeTrilha_trilhaId_habilidadeId_nivelConcedido_key`
  ON `HabilidadeTrilha`(`trilhaId`, `habilidadeId`, `nivelConcedido`);
