/*
  Warnings:

  - You are about to alter the column `grauNome` on the `grau_feiticeiro_limite` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(14))`.

*/
-- AlterTable
ALTER TABLE `grau_feiticeiro_limite` MODIFY `grauNome` ENUM('GRAU_4', 'GRAU_3', 'GRAU_2', 'SEMI_1', 'GRAU_1', 'ESPECIAL') NOT NULL;
