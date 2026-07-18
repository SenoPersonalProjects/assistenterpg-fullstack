-- CreateTable
CREATE TABLE `CampanhaRoletaPreset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `slot` ENUM('CLA', 'TECNICA', 'CUSTOMIZADO') NOT NULL,
    `modo` ENUM('CLA', 'TECNICA', 'SIMPLES') NOT NULL,
    `configVersao` INTEGER NOT NULL DEFAULT 1,
    `config` JSON NOT NULL,
    `revisao` INTEGER NOT NULL DEFAULT 1,
    `criadoPorId` INTEGER NULL,
    `atualizadoPorId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CampanhaRoletaPreset_campanhaId_slot_key`(`campanhaId`, `slot`),
    INDEX `CampanhaRoletaPreset_criadoPorId_idx`(`criadoPorId`),
    INDEX `CampanhaRoletaPreset_atualizadoPorId_idx`(`atualizadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampanhaRoletaPermissao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `podeConfigurar` BOOLEAN NOT NULL DEFAULT false,
    `podeGirar` BOOLEAN NOT NULL DEFAULT false,
    `concedidoPorId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CampanhaRoletaPermissao_campanhaId_usuarioId_key`(`campanhaId`, `usuarioId`),
    INDEX `CampanhaRoletaPermissao_usuarioId_idx`(`usuarioId`),
    INDEX `CampanhaRoletaPermissao_concedidoPorId_idx`(`concedidoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampanhaRoletaSorteio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `presetId` INTEGER NOT NULL,
    `slot` ENUM('CLA', 'TECNICA', 'CUSTOMIZADO') NOT NULL,
    `modo` ENUM('CLA', 'TECNICA', 'SIMPLES') NOT NULL,
    `alvoUsuarioId` INTEGER NULL,
    `status` ENUM('AGUARDANDO_GIRO_1', 'AGUARDANDO_GIRO_2', 'AGUARDANDO_ESCOLHA', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'AGUARDANDO_GIRO_1',
    `chaveAtiva` VARCHAR(80) NULL,
    `configSnapshot` JSON NOT NULL,
    `poolSnapshot` JSON NOT NULL,
    `resultados` JSON NOT NULL,
    `resultadoFinal` JSON NULL,
    `revisao` INTEGER NOT NULL DEFAULT 1,
    `iniciadoPorId` INTEGER NULL,
    `finalizadoPorId` INTEGER NULL,
    `canceladoPorId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `finalizadoEm` DATETIME(3) NULL,
    `canceladoEm` DATETIME(3) NULL,

    UNIQUE INDEX `CampanhaRoletaSorteio_chaveAtiva_key`(`chaveAtiva`),
    INDEX `CampanhaRoletaSorteio_campanhaId_slot_status_criadoEm_idx`(`campanhaId`, `slot`, `status`, `criadoEm`),
    INDEX `CampanhaRoletaSorteio_campanhaId_alvoUsuarioId_criadoEm_idx`(`campanhaId`, `alvoUsuarioId`, `criadoEm`),
    INDEX `CampanhaRoletaSorteio_presetId_idx`(`presetId`),
    INDEX `CampanhaRoletaSorteio_iniciadoPorId_idx`(`iniciadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampanhaRoletaEvento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `sorteioId` INTEGER NOT NULL,
    `atorUsuarioId` INTEGER NULL,
    `tipo` ENUM('SORTEIO_INICIADO', 'GIRO_REALIZADO', 'OPCAO_ESCOLHIDA', 'TERCEIRO_GIRO_REALIZADO', 'SORTEIO_CANCELADO') NOT NULL,
    `clientRequestId` VARCHAR(36) NOT NULL,
    `intencaoHash` VARCHAR(64) NOT NULL,
    `dados` JSON NOT NULL,
    `resposta` JSON NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CampanhaRoletaEvento_campanhaId_atorUsuarioId_clientRe_key`(`campanhaId`, `atorUsuarioId`, `clientRequestId`),
    INDEX `CampanhaRoletaEvento_campanhaId_criadoEm_idx`(`campanhaId`, `criadoEm`),
    INDEX `CampanhaRoletaEvento_sorteioId_criadoEm_idx`(`sorteioId`, `criadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CampanhaRoletaPreset` ADD CONSTRAINT `CampanhaRoletaPreset_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaPreset` ADD CONSTRAINT `CampanhaRoletaPreset_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaPreset` ADD CONSTRAINT `CampanhaRoletaPreset_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampanhaRoletaPermissao` ADD CONSTRAINT `CampanhaRoletaPermissao_campanhaId_usuarioId_fkey` FOREIGN KEY (`campanhaId`, `usuarioId`) REFERENCES `MembroCampanha`(`campanhaId`, `usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaPermissao` ADD CONSTRAINT `CampanhaRoletaPermissao_concedidoPorId_fkey` FOREIGN KEY (`concedidoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_presetId_fkey` FOREIGN KEY (`presetId`) REFERENCES `CampanhaRoletaPreset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_alvoUsuarioId_fkey` FOREIGN KEY (`alvoUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_iniciadoPorId_fkey` FOREIGN KEY (`iniciadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_finalizadoPorId_fkey` FOREIGN KEY (`finalizadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaSorteio` ADD CONSTRAINT `CampanhaRoletaSorteio_canceladoPorId_fkey` FOREIGN KEY (`canceladoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampanhaRoletaEvento` ADD CONSTRAINT `CampanhaRoletaEvento_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaEvento` ADD CONSTRAINT `CampanhaRoletaEvento_sorteioId_fkey` FOREIGN KEY (`sorteioId`) REFERENCES `CampanhaRoletaSorteio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampanhaRoletaEvento` ADD CONSTRAINT `CampanhaRoletaEvento_atorUsuarioId_fkey` FOREIGN KEY (`atorUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
