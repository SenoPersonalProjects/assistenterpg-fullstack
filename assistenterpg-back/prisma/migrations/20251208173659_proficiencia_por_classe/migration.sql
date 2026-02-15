-- CreateTable
CREATE TABLE `ClasseProficiencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classeId` INTEGER NOT NULL,
    `proficienciaId` INTEGER NOT NULL,

    UNIQUE INDEX `ClasseProficiencia_classeId_proficienciaId_key`(`classeId`, `proficienciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClasseProficiencia` ADD CONSTRAINT `ClasseProficiencia_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClasseProficiencia` ADD CONSTRAINT `ClasseProficiencia_proficienciaId_fkey` FOREIGN KEY (`proficienciaId`) REFERENCES `Proficiencia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
