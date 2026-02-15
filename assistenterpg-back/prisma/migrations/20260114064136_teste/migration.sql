/*
  Warnings:

  - You are about to drop the column `incrementoCategoria` on the `modificacao_equipamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `equipamento_catalogo` ADD COLUMN `tipoUso` ENUM('CONSUMIVEL', 'VESTIVEL', 'GERAL') NULL;

-- AlterTable
ALTER TABLE `modificacao_equipamento` DROP COLUMN `incrementoCategoria`,
    ADD COLUMN `incrementoEspacos` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `equipamento_catalogo_categoria_idx` ON `equipamento_catalogo`(`categoria`);

-- CreateIndex
CREATE INDEX `equipamento_catalogo_tipoAmaldicoado_idx` ON `equipamento_catalogo`(`tipoAmaldicoado`);
