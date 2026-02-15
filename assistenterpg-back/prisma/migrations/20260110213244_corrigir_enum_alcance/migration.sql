/*
  Warnings:

  - The values [UNIVERSAL] on the enum `modificacao_equipamento_tipo` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `alcance` on table `equipamento_catalogo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `equipamento_catalogo` MODIFY `alcance` ENUM('CURTO', 'MEDIO', 'LONGO', 'EXTREMO') NOT NULL;

-- AlterTable
ALTER TABLE `modificacao_equipamento` MODIFY `tipo` ENUM('CORPO_A_CORPO_E_DISPARO', 'ARMA_FOGO', 'MUNICAO', 'PROTECAO') NOT NULL;
