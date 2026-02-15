-- AlterTable
ALTER TABLE `habilidade` ADD COLUMN `mecanicasEspeciais` JSON NULL;

-- AlterTable
ALTER TABLE `trilha` ADD COLUMN `requisitos` JSON NULL;

-- CreateTable
CREATE TABLE `HabilidadeEfeitoGrau` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `habilidadeId` INTEGER NOT NULL,
    `tipoGrauCodigo` VARCHAR(191) NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 1,
    `escalonamentoPorNivel` JSON NULL,

    UNIQUE INDEX `HabilidadeEfeitoGrau_habilidadeId_tipoGrauCodigo_key`(`habilidadeId`, `tipoGrauCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HabilidadeEfeitoGrau` ADD CONSTRAINT `HabilidadeEfeitoGrau_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeEfeitoGrau` ADD CONSTRAINT `HabilidadeEfeitoGrau_tipoGrauCodigo_fkey` FOREIGN KEY (`tipoGrauCodigo`) REFERENCES `TipoGrau`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
