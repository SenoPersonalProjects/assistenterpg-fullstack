/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Habilidade` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Habilidade_nome_key` ON `Habilidade`(`nome`);
