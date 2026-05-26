-- CreateTable
CREATE TABLE `sessao_iniciativa_alternada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `ladoAtualId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessao_iniciativa_alternada_sessaoId_key`(`sessaoId`),
    INDEX `sessao_iniciativa_alternada_sessaoId_idx`(`sessaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao_iniciativa_alternada_lado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iniciativaAlternadaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `sessao_iniciativa_alternada_lado_iniciativaAlternadaId_idx`(`iniciativaAlternadaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao_iniciativa_alternada_participante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iniciativaAlternadaId` INTEGER NOT NULL,
    `ladoId` INTEGER NOT NULL,
    `participanteToken` VARCHAR(191) NOT NULL,
    `tipoParticipante` VARCHAR(191) NOT NULL,
    `personagemSessaoId` INTEGER NULL,
    `npcSessaoId` INTEGER NULL,
    `nome` VARCHAR(191) NOT NULL,
    `jaAgiu` BOOLEAN NOT NULL DEFAULT false,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SIA_participante_token_unique`(`iniciativaAlternadaId`, `participanteToken`),
    INDEX `sessao_iniciativa_alternada_participante_ladoId_idx`(`ladoId`),
    INDEX `sessao_iniciativa_alternada_participante_personagemSessaoId_idx`(`personagemSessaoId`),
    INDEX `sessao_iniciativa_alternada_participante_npcSessaoId_idx`(`npcSessaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `equipamento_catalogo` ADD COLUMN `efeitoConsumo` JSON NULL;

-- AddForeignKey
ALTER TABLE `sessao_iniciativa_alternada` ADD CONSTRAINT `sia_sessao_fk` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_iniciativa_alternada_lado` ADD CONSTRAINT `sia_lado_sia_fk` FOREIGN KEY (`iniciativaAlternadaId`) REFERENCES `sessao_iniciativa_alternada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_iniciativa_alternada_participante` ADD CONSTRAINT `sia_part_sia_fk` FOREIGN KEY (`iniciativaAlternadaId`) REFERENCES `sessao_iniciativa_alternada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_iniciativa_alternada_participante` ADD CONSTRAINT `sia_part_lado_fk` FOREIGN KEY (`ladoId`) REFERENCES `sessao_iniciativa_alternada_lado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
