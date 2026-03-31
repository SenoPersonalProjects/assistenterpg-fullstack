-- CreateTable
CREATE TABLE `anotacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `titulo` VARCHAR(120) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `campanhaId` INTEGER NULL,
    `sessaoId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `anotacoes_usuarioId_criadoEm_idx`(`usuarioId`, `criadoEm`),
    INDEX `anotacoes_campanhaId_idx`(`campanhaId`),
    INDEX `anotacoes_sessaoId_idx`(`sessaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anotacoes` ADD CONSTRAINT `anotacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anotacoes` ADD CONSTRAINT `anotacoes_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anotacoes` ADD CONSTRAINT `anotacoes_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
