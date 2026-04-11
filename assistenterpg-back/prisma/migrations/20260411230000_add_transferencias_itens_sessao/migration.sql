-- CreateTable
CREATE TABLE `transferencia_item_sessao_campanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `solicitanteId` INTEGER NOT NULL,
    `portadorAnteriorId` INTEGER NULL,
    `destinoTipo` ENUM('PERSONAGEM', 'NPC') NOT NULL,
    `destinoPersonagemCampanhaId` INTEGER NULL,
    `destinoNpcSessaoId` INTEGER NULL,
    `status` ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `respondidaPorId` INTEGER NULL,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondidaEm` DATETIME(3) NULL,
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `tisc_campanha_status_idx`(`campanhaId`, `status`),
    INDEX `tisc_item_status_idx`(`itemId`, `status`),
    INDEX `tisc_solicitante_status_idx`(`solicitanteId`, `status`),
    INDEX `tisc_portador_anterior_idx`(`portadorAnteriorId`),
    INDEX `TISC_dest_personagem_status_idx`(`destinoPersonagemCampanhaId`, `status`),
    INDEX `TISC_dest_npc_status_idx`(`destinoNpcSessaoId`, `status`),
    INDEX `tisc_respondida_por_idx`(`respondidaPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_campanha_fk` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_item_fk` FOREIGN KEY (`itemId`) REFERENCES `item_sessao_campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_solicitante_fk` FOREIGN KEY (`solicitanteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_respondida_por_fk` FOREIGN KEY (`respondidaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_portador_anterior_fk` FOREIGN KEY (`portadorAnteriorId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_dest_personagem_fk` FOREIGN KEY (`destinoPersonagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencia_item_sessao_campanha` ADD CONSTRAINT `tisc_dest_npc_fk` FOREIGN KEY (`destinoNpcSessaoId`) REFERENCES `NpcAmeacaSessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
