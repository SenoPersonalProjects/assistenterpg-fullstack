-- CreateTable
CREATE TABLE `PassivaAtributo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `atributo` ENUM('AGILIDADE', 'FORCA', 'INTELECTO', 'PRESENCA', 'VIGOR') NOT NULL,
    `nivel` INTEGER NOT NULL,
    `requisito` INTEGER NOT NULL DEFAULT 3,
    `descricao` TEXT NOT NULL,
    `efeitos` JSON NOT NULL,

    UNIQUE INDEX `PassivaAtributo_codigo_key`(`codigo`),
    INDEX `PassivaAtributo_atributo_nivel_idx`(`atributo`, `nivel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemBasePassiva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `passivaId` INTEGER NOT NULL,

    INDEX `PersonagemBasePassiva_personagemBaseId_idx`(`personagemBaseId`),
    UNIQUE INDEX `PersonagemBasePassiva_personagemBaseId_passivaId_key`(`personagemBaseId`, `passivaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemBasePassiva` ADD CONSTRAINT `PersonagemBasePassiva_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBasePassiva` ADD CONSTRAINT `PersonagemBasePassiva_passivaId_fkey` FOREIGN KEY (`passivaId`) REFERENCES `PassivaAtributo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
