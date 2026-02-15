-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `alinhamentoId` INTEGER NULL,
    ADD COLUMN `atributoChaveEa` ENUM('AGI', 'FOR', 'INT', 'PRE', 'VIG') NOT NULL DEFAULT 'INT',
    ADD COLUMN `background` TEXT NULL,
    ADD COLUMN `idade` INTEGER NULL,
    ADD COLUMN `prestigioBase` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `prestigioClaBase` INTEGER NULL;

-- CreateTable
CREATE TABLE `Alinhamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,

    UNIQUE INDEX `Alinhamento_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_alinhamentoId_fkey` FOREIGN KEY (`alinhamentoId`) REFERENCES `Alinhamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilidadeTrilha` ADD CONSTRAINT `HabilidadeTrilha_trilhaId_fkey` FOREIGN KEY (`trilhaId`) REFERENCES `Trilha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
