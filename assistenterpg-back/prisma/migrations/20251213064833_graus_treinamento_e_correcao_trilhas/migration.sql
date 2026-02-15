-- CreateTable
CREATE TABLE `GrauTreinamentoPersonagemBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `nivel` INTEGER NOT NULL,
    `periciaCodigo` VARCHAR(191) NOT NULL,
    `grauAnterior` INTEGER NOT NULL,
    `grauNovo` INTEGER NOT NULL,

    UNIQUE INDEX `GrauTreinamentoPersonagemBase_personagemBaseId_nivel_pericia_key`(`personagemBaseId`, `nivel`, `periciaCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GrauTreinamentoPersonagemBase` ADD CONSTRAINT `GrauTreinamentoPersonagemBase_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
