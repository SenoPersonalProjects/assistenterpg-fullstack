/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Caminho` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Cla` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Classe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Origem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Trilha` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Caminho_nome_key` ON `Caminho`(`nome`);

-- CreateIndex
CREATE UNIQUE INDEX `Cla_nome_key` ON `Cla`(`nome`);

-- CreateIndex
CREATE UNIQUE INDEX `Classe_nome_key` ON `Classe`(`nome`);

-- CreateIndex
CREATE UNIQUE INDEX `Origem_nome_key` ON `Origem`(`nome`);

-- CreateIndex
CREATE UNIQUE INDEX `Trilha_nome_key` ON `Trilha`(`nome`);
