-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `apelido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donoId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembroCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `papel` VARCHAR(191) NOT NULL,
    `entrouEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MembroCampanha_campanhaId_usuarioId_key`(`campanhaId`, `usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `personagemBaseId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cena` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonagemSessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `cenaId` INTEGER NULL,
    `personagemCampanhaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Condicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Condicao_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CondicaoPersonagemSessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemSessaoId` INTEGER NOT NULL,
    `condicaoId` INTEGER NOT NULL,
    `cenaId` INTEGER NOT NULL,
    `turnoAplicacao` INTEGER NOT NULL,
    `duracaoTurnos` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoSessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `cenaId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipoEvento` VARCHAR(191) NOT NULL,
    `personagemAtorId` INTEGER NULL,
    `personagemAlvoId` INTEGER NULL,
    `dados` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campanha` ADD CONSTRAINT `Campanha_donoId_fkey` FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembroCampanha` ADD CONSTRAINT `MembroCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembroCampanha` ADD CONSTRAINT `MembroCampanha_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_donoId_fkey` FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessao` ADD CONSTRAINT `Sessao_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cena` ADD CONSTRAINT `Cena_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessao` ADD CONSTRAINT `PersonagemSessao_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessao` ADD CONSTRAINT `PersonagemSessao_cenaId_fkey` FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessao` ADD CONSTRAINT `PersonagemSessao_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondicaoPersonagemSessao` ADD CONSTRAINT `CondicaoPersonagemSessao_personagemSessaoId_fkey` FOREIGN KEY (`personagemSessaoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondicaoPersonagemSessao` ADD CONSTRAINT `CondicaoPersonagemSessao_condicaoId_fkey` FOREIGN KEY (`condicaoId`) REFERENCES `Condicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondicaoPersonagemSessao` ADD CONSTRAINT `CondicaoPersonagemSessao_cenaId_fkey` FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoSessao` ADD CONSTRAINT `EventoSessao_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoSessao` ADD CONSTRAINT `EventoSessao_cenaId_fkey` FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoSessao` ADD CONSTRAINT `EventoSessao_personagemAtorId_fkey` FOREIGN KEY (`personagemAtorId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoSessao` ADD CONSTRAINT `EventoSessao_personagemAlvoId_fkey` FOREIGN KEY (`personagemAlvoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
