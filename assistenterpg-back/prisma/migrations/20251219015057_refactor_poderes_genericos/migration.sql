-- DropForeignKey
ALTER TABLE `graupersonagembase` DROP FOREIGN KEY `GrauPersonagemBase_personagemBaseId_fkey`;

-- DropForeignKey
ALTER TABLE `graupersonagemcampanha` DROP FOREIGN KEY `GrauPersonagemCampanha_personagemCampanhaId_fkey`;

-- DropForeignKey
ALTER TABLE `habilidadepersonagembase` DROP FOREIGN KEY `HabilidadePersonagemBase_personagemBaseId_fkey`;

-- DropForeignKey
ALTER TABLE `habilidadepersonagemcampanha` DROP FOREIGN KEY `HabilidadePersonagemCampanha_personagemCampanhaId_fkey`;

-- DropForeignKey
ALTER TABLE `personagembasepericia` DROP FOREIGN KEY `PersonagemBasePericia_personagemBaseId_fkey`;

-- DropForeignKey
ALTER TABLE `personagembaseproficiencia` DROP FOREIGN KEY `PersonagemBaseProficiencia_personagemBaseId_fkey`;

-- CreateTable
CREATE TABLE `PoderGenericoPersonagemBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,
    `config` JSON NULL,

    INDEX `PoderGenericoPersonagemBase_personagemBaseId_idx`(`personagemBaseId`),
    INDEX `PoderGenericoPersonagemBase_habilidadeId_idx`(`habilidadeId`),
    INDEX `PoderGenericoPersonagemBase_personagemBaseId_habilidadeId_idx`(`personagemBaseId`, `habilidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoderGenericoPersonagemCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `habilidadeId` INTEGER NOT NULL,
    `config` JSON NULL,

    INDEX `PoderGenericoPersonagemCampanha_personagemCampanhaId_idx`(`personagemCampanhaId`),
    INDEX `PoderGenericoPersonagemCampanha_habilidadeId_idx`(`habilidadeId`),
    INDEX `PoderGenericoPersonagemCampanha_personagemCampanhaId_habilid_idx`(`personagemCampanhaId`, `habilidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemBase` ADD CONSTRAINT `HabilidadePersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadePersonagemCampanha` ADD CONSTRAINT `HabilidadePersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoderGenericoPersonagemBase` ADD CONSTRAINT `PoderGenericoPersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoderGenericoPersonagemBase` ADD CONSTRAINT `PoderGenericoPersonagemBase_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoderGenericoPersonagemCampanha` ADD CONSTRAINT `PoderGenericoPersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoderGenericoPersonagemCampanha` ADD CONSTRAINT `PoderGenericoPersonagemCampanha_habilidadeId_fkey` FOREIGN KEY (`habilidadeId`) REFERENCES `Habilidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrauPersonagemBase` ADD CONSTRAINT `GrauPersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrauPersonagemCampanha` ADD CONSTRAINT `GrauPersonagemCampanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBaseProficiencia` ADD CONSTRAINT `PersonagemBaseProficiencia_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBasePericia` ADD CONSTRAINT `PersonagemBasePericia_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `graupersonagembase` RENAME INDEX `GrauPersonagemBase_tipoGrauId_fkey` TO `GrauPersonagemBase_tipoGrauId_idx`;

-- RenameIndex
ALTER TABLE `graupersonagemcampanha` RENAME INDEX `GrauPersonagemCampanha_tipoGrauId_fkey` TO `GrauPersonagemCampanha_tipoGrauId_idx`;

-- RenameIndex
ALTER TABLE `habilidadepersonagembase` RENAME INDEX `HabilidadePersonagemBase_habilidadeId_fkey` TO `HabilidadePersonagemBase_habilidadeId_idx`;

-- RenameIndex
ALTER TABLE `habilidadepersonagemcampanha` RENAME INDEX `HabilidadePersonagemCampanha_habilidadeId_fkey` TO `HabilidadePersonagemCampanha_habilidadeId_idx`;

-- RenameIndex
ALTER TABLE `personagembasepericia` RENAME INDEX `PersonagemBasePericia_periciaId_fkey` TO `PersonagemBasePericia_periciaId_idx`;

-- RenameIndex
ALTER TABLE `personagembaseproficiencia` RENAME INDEX `PersonagemBaseProficiencia_proficienciaId_fkey` TO `PersonagemBaseProficiencia_proficienciaId_idx`;
