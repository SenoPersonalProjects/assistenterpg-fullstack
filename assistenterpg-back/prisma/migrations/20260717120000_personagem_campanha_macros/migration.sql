-- CreateTable
CREATE TABLE `PersonagemCampanhaMacro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `personagemCampanhaId` INTEGER NOT NULL,
    `criadoPorId` INTEGER NULL,
    `atualizadoPorId` INTEGER NULL,
    `removidoPorId` INTEGER NULL,
    `nome` VARCHAR(80) NOT NULL,
    `descricao` VARCHAR(500) NULL,
    `tipo` ENUM('ATAQUE_PERICIA', 'DANO_FORMULA', 'FORMULA_LIVRE') NOT NULL,
    `visibilidadePadrao` ENUM('PUBLICA', 'SECRETA_MESTRE') NOT NULL DEFAULT 'PUBLICA',
    `configVersao` INTEGER NOT NULL DEFAULT 1,
    `config` JSON NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `revisao` INTEGER NOT NULL DEFAULT 1,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `removidoEm` DATETIME(3) NULL,

    INDEX `PersonagemCampanhaMacro_campanhaId_personagemCampanhaId_ativ_idx`(`campanhaId`, `personagemCampanhaId`, `ativo`, `ordem`, `id`),
    INDEX `PersonagemCampanhaMacro_criadoPorId_idx`(`criadoPorId`),
    INDEX `PersonagemCampanhaMacro_atualizadoPorId_idx`(`atualizadoPorId`),
    INDEX `PersonagemCampanhaMacro_removidoPorId_idx`(`removidoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaMacro` ADD CONSTRAINT `PersonagemCampanhaMacro_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaMacro` ADD CONSTRAINT `PersonagemCampanhaMacro_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaMacro` ADD CONSTRAINT `PersonagemCampanhaMacro_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaMacro` ADD CONSTRAINT `PersonagemCampanhaMacro_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanhaMacro` ADD CONSTRAINT `PersonagemCampanhaMacro_removidoPorId_fkey` FOREIGN KEY (`removidoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
