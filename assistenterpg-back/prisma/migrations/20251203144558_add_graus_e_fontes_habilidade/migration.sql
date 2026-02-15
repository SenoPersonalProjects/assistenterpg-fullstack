/*
  Warnings:

  - You are about to drop the column `grauTecAmaldicoada` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecAntiBarreira` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecBarreira` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecCadaveres` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecReversa` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecShikigami` on the `personagembase` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecAmaldicoada` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecAntiBarreira` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecBarreira` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecCadaveres` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecReversa` on the `personagemcampanha` table. All the data in the column will be lost.
  - You are about to drop the column `grauTecShikigami` on the `personagemcampanha` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `personagembase` DROP COLUMN `grauTecAmaldicoada`,
    DROP COLUMN `grauTecAntiBarreira`,
    DROP COLUMN `grauTecBarreira`,
    DROP COLUMN `grauTecCadaveres`,
    DROP COLUMN `grauTecReversa`,
    DROP COLUMN `grauTecShikigami`;

-- AlterTable
ALTER TABLE `personagemcampanha` DROP COLUMN `grauTecAmaldicoada`,
    DROP COLUMN `grauTecAntiBarreira`,
    DROP COLUMN `grauTecBarreira`,
    DROP COLUMN `grauTecCadaveres`,
    DROP COLUMN `grauTecReversa`,
    DROP COLUMN `grauTecShikigami`;

-- CreateTable
CREATE TABLE `TipoGrau` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `TipoGrau_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GrauPersonagemBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `tipoGrauId` INTEGER NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `GrauPersonagemBase_personagemBaseId_tipoGrauId_key`(`personagemBaseId`, `tipoGrauId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GrauPersonagemCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `tipoGrauId` INTEGER NOT NULL,
    `valor` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `GrauPersonagemCampanha_personagemCampanhaId_tipoGrauId_key`(`personagemCampanhaId`, `tipoGrauId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HabilidadeClasse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classeId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,
    `nivelConcedido` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadeClasse_classeId_habilidadeId_nivelConcedido_key`(`classeId`, `habilidadeId`, `nivelConcedido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HabilidadeTrilha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trilhaId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,
    `nivelConcedido` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadeTrilha_trilhaId_habilidadeId_nivelConcedido_key`(`trilhaId`, `habilidadeId`, `nivelConcedido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HabilidadeOrigem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `origemId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,

    UNIQUE INDEX `HabilidadeOrigem_origemId_habilidadeId_key`(`origemId`, `habilidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GrauPersonagemBase` ADD CONSTRAINT `GrauPersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrauPersonagemBase` ADD CONSTRAINT `GrauPersonagemBase_tipoGrauId_fkey` FOREIGN KEY (`tipoGrauId`) REFERENCES `TipoGrau`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrauPersonagemCampanha` ADD CONSTRAINT `GrauPersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrauPersonagemCampanha` ADD CONSTRAINT `GrauPersonagemCampanha_tipoGrauId_fkey` FOREIGN KEY (`tipoGrauId`) REFERENCES `TipoGrau`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeClasse` ADD CONSTRAINT `HabilidadeClasse_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeClasse` ADD CONSTRAINT `HabilidadeClasse_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeTrilha` ADD CONSTRAINT `HabilidadeTrilha_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeTrilha` ADD CONSTRAINT `HabilidadeTrilha_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeOrigem` ADD CONSTRAINT `HabilidadeOrigem_origemId_fkey` FOREIGN KEY (`origemId`) REFERENCES `Origem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeOrigem` ADD CONSTRAINT `HabilidadeOrigem_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
