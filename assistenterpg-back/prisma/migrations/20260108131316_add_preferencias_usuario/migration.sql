-- CreateTable
CREATE TABLE `preferencias_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `notificacoesEmail` BOOLEAN NOT NULL DEFAULT true,
    `notificacoesPush` BOOLEAN NOT NULL DEFAULT false,
    `notificacoesConvites` BOOLEAN NOT NULL DEFAULT true,
    `notificacoesAtualizacoes` BOOLEAN NOT NULL DEFAULT true,
    `idioma` VARCHAR(191) NOT NULL DEFAULT 'pt-BR',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `preferencias_usuario_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `preferencias_usuario` ADD CONSTRAINT `preferencias_usuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
