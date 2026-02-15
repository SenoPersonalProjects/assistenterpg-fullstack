/*
  Warnings:

  - The values [CORTANTE,PERFURANTE,JUJUTSU,GERAL] on the enum `equipamento_reducao_dano_tipoReducao` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `cla` ADD COLUMN `fonte` ENUM('SISTEMA_BASE', 'SUPLEMENTO', 'HOMEBREW') NOT NULL DEFAULT 'SISTEMA_BASE',
    ADD COLUMN `suplementoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `equipamento_reducao_dano` MODIFY `tipoReducao` ENUM('DANO', 'BALISTICO', 'IMPACTO', 'CORTE', 'PERFURACAO', 'FOGO', 'ELETRICIDADE', 'FRIO', 'ENERGIA_AMALDICOADA', 'ENERGIA_POSITIVA', 'MENTAL', 'FISICO', 'SOBRENATURAL', 'MUNDANO') NOT NULL;

-- AlterTable
ALTER TABLE `homebrews` MODIFY `tipo` ENUM('CLA', 'TRILHA', 'CAMINHO', 'ORIGEM', 'EQUIPAMENTO', 'PODER_GENERICO', 'TECNICA_AMALDICOADA') NOT NULL;

-- CreateIndex
CREATE INDEX `Cla_fonte_idx` ON `Cla`(`fonte`);

-- CreateIndex
CREATE INDEX `Cla_suplementoId_idx` ON `Cla`(`suplementoId`);

-- AddForeignKey
ALTER TABLE `Cla` ADD CONSTRAINT `Cla_suplementoId_fkey` FOREIGN KEY (`suplementoId`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
