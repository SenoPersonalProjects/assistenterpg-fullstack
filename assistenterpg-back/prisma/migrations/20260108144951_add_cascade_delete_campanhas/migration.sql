-- DropForeignKey
ALTER TABLE `campanha` DROP FOREIGN KEY `Campanha_donoId_fkey`;

-- DropForeignKey
ALTER TABLE `convitecampanha` DROP FOREIGN KEY `ConviteCampanha_campanhaId_fkey`;

-- DropForeignKey
ALTER TABLE `membrocampanha` DROP FOREIGN KEY `MembroCampanha_campanhaId_fkey`;

-- DropForeignKey
ALTER TABLE `membrocampanha` DROP FOREIGN KEY `MembroCampanha_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `personagemcampanha` DROP FOREIGN KEY `PersonagemCampanha_campanhaId_fkey`;

-- DropForeignKey
ALTER TABLE `personagemcampanha` DROP FOREIGN KEY `PersonagemCampanha_personagemBaseId_fkey`;

-- DropForeignKey
ALTER TABLE `sessao` DROP FOREIGN KEY `Sessao_campanhaId_fkey`;

-- DropIndex
DROP INDEX `Campanha_donoId_fkey` ON `campanha`;

-- DropIndex
DROP INDEX `ConviteCampanha_campanhaId_fkey` ON `convitecampanha`;

-- DropIndex
DROP INDEX `MembroCampanha_usuarioId_fkey` ON `membrocampanha`;

-- DropIndex
DROP INDEX `PersonagemCampanha_campanhaId_fkey` ON `personagemcampanha`;

-- DropIndex
DROP INDEX `PersonagemCampanha_personagemBaseId_fkey` ON `personagemcampanha`;

-- DropIndex
DROP INDEX `Sessao_campanhaId_fkey` ON `sessao`;

-- AddForeignKey
ALTER TABLE `Campanha` ADD CONSTRAINT `Campanha_donoId_fkey` FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembroCampanha` ADD CONSTRAINT `MembroCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembroCampanha` ADD CONSTRAINT `MembroCampanha_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessao` ADD CONSTRAINT `Sessao_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConviteCampanha` ADD CONSTRAINT `ConviteCampanha_campanhaId_fkey` FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
