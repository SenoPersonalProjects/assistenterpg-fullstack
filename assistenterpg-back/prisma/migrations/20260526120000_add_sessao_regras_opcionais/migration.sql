-- CreateTable
CREATE TABLE `SessaoRegraOpcional` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `chave` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `estado` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `SessaoRegraOpcional_sessaoId_ativo_idx`(`sessaoId`, `ativo`),
    UNIQUE INDEX `SessaoRegraOpcional_sessaoId_chave_key`(`sessaoId`, `chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SessaoRegraOpcional` ADD CONSTRAINT `SessaoRegraOpcional_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
