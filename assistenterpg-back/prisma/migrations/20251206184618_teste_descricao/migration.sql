/*
  Warnings:

  - Added the required column `descricao` to the `Pericia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pericia` ADD COLUMN `descricao` TEXT NOT NULL;
