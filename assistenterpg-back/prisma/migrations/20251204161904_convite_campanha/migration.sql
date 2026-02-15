-- CreateTable
CREATE TABLE `ConviteCampanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanhaId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondidoEm` DATETIME(3) NULL,

    UNIQUE INDEX `ConviteCampanha_codigo_key`(`codigo`),
    INDEX `ConviteCampanha_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConviteCampanha` ADD CONSTRAINT `ConviteCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
