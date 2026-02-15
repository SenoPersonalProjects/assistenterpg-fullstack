/*
  Warnings:

  - A unique constraint covering the columns `[trilhaId,habilidadeId,nivelConcedido,caminhoId]` on the table `HabilidadeTrilha` will be added. If there are existing duplicate values, this will fail.
*/

-- DropForeignKey
ALTER TABLE `habilidadetrilha` DROP FOREIGN KEY `HabilidadeTrilha_trilhaId_fkey`;

-- DropIndex
DROP INDEX `HabilidadeTrilha_trilhaId_habilidadeId_nivelConcedido_key` ON `habilidadetrilha`;

-- AlterTable Habilidade: marcar técnicas hereditárias
ALTER TABLE `habilidade`
  ADD COLUMN `claHereditarioId` INTEGER NULL,
  ADD COLUMN `hereditaria` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable HabilidadeTrilha: ligar opcionalmente a Caminho
ALTER TABLE `habilidadetrilha`
  ADD COLUMN `caminhoId` INTEGER NULL;

-- CreateIndex: novo unique incluindo caminhoId
CREATE UNIQUE INDEX `HabilidadeTrilha_trilhaId_habilidadeId_nivelConcedido_caminh_key`
  ON `HabilidadeTrilha`(`trilhaId`, `habilidadeId`, `nivelConcedido`, `caminhoId`);

-- REMOVIDO: FK duplicada de EventoSessao.cenaId
-- ALTER TABLE `EventoSessao` ADD CONSTRAINT `EventoSessao_cenaId_fkey`
--   FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Habilidade -> Cla (hereditário)
ALTER TABLE `Habilidade`
  ADD CONSTRAINT `Habilidade_claHereditarioId_fkey`
  FOREIGN KEY (`claHereditarioId`) REFERENCES `Cla`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: HabilidadeTrilha -> Caminho (opcional)
ALTER TABLE `HabilidadeTrilha`
  ADD CONSTRAINT `HabilidadeTrilha_caminhoId_fkey`
  FOREIGN KEY (`caminhoId`) REFERENCES `Caminho`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
