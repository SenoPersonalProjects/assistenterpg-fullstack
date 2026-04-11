-- AlterTable
ALTER TABLE `PersonagemBase` ADD COLUMN `fontesConteudo` JSON NULL;

-- AlterTable
ALTER TABLE `inventario_item_base` ADD COLUMN `estado` JSON NULL;

-- CreateTable
CREATE TABLE `template_item_sessao_campanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `criadoPorId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('DOCUMENTO', 'PISTA', 'GERAL') NOT NULL,
    `categoria` ENUM('CATEGORIA_0', 'CATEGORIA_4', 'CATEGORIA_3', 'CATEGORIA_2', 'CATEGORIA_1', 'ESPECIAL') NOT NULL DEFAULT 'CATEGORIA_0',
    `peso` DOUBLE NOT NULL DEFAULT 0,
    `descricaoRevelada` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `template_item_sessao_campanha_campanhaId_idx`(`campanhaId`),
    INDEX `template_item_sessao_campanha_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_sessao_campanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `sessaoId` INTEGER NULL,
    `cenaId` INTEGER NULL,
    `personagemCampanhaId` INTEGER NULL,
    `criadoPorId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('DOCUMENTO', 'PISTA', 'GERAL') NOT NULL,
    `categoria` ENUM('CATEGORIA_0', 'CATEGORIA_4', 'CATEGORIA_3', 'CATEGORIA_2', 'CATEGORIA_1', 'ESPECIAL') NOT NULL DEFAULT 'CATEGORIA_0',
    `peso` DOUBLE NOT NULL DEFAULT 0,
    `descricaoRevelada` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `item_sessao_campanha_campanhaId_idx`(`campanhaId`),
    INDEX `item_sessao_campanha_sessaoId_idx`(`sessaoId`),
    INDEX `item_sessao_campanha_cenaId_idx`(`cenaId`),
    INDEX `item_sessao_campanha_personagemCampanhaId_idx`(`personagemCampanhaId`),
    INDEX `item_sessao_campanha_criadoPorId_idx`(`criadoPorId`),
    INDEX `item_sessao_campanha_campanhaId_personagemCampanhaId_idx`(`campanhaId`, `personagemCampanhaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `template_item_sessao_campanha` ADD CONSTRAINT `template_item_sessao_campanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_item_sessao_campanha` ADD CONSTRAINT `template_item_sessao_campanha_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_sessao_campanha` ADD CONSTRAINT `item_sessao_campanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_sessao_campanha` ADD CONSTRAINT `item_sessao_campanha_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_sessao_campanha` ADD CONSTRAINT `item_sessao_campanha_cenaId_fkey` FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_sessao_campanha` ADD CONSTRAINT `item_sessao_campanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_sessao_campanha` ADD CONSTRAINT `item_sessao_campanha_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
