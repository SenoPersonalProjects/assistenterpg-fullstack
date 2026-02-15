/*
  Warnings:

  - The values [AGI,FOR,VIG] on the enum `PersonagemBase_atributoChaveEa` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `periciasClasseEscolhidasCodigos` JSON NULL,
    ADD COLUMN `periciasLivresCodigos` JSON NULL,
    ADD COLUMN `periciasOrigemEscolhidasCodigos` JSON NULL,
    MODIFY `atributoChaveEa` ENUM('INT', 'PRE') NOT NULL DEFAULT 'INT';
