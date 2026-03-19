-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_criada_por_fk`;

-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_desativada_por_fk`;

-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_habilidade_fk`;

-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_personagem_sessao_fk`;

-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_sessao_fk`;

-- DropForeignKey
ALTER TABLE `personagemsessaohabilidadesustentada` DROP FOREIGN KEY `pshs_variacao_fk`;

-- AlterTable
ALTER TABLE `npcameacasessao` ADD COLUMN `eaAtual` INTEGER NULL,
    ADD COLUMN `eaMax` INTEGER NULL,
    ADD COLUMN `sanAtual` INTEGER NULL,
    ADD COLUMN `sanMax` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Campanha_donoId_idx` ON `Campanha`(`donoId`);

-- CreateIndex
CREATE INDEX `MembroCampanha_usuarioId_idx` ON `MembroCampanha`(`usuarioId`);

-- CreateIndex
CREATE INDEX `PersonagemBase_donoId_idx` ON `PersonagemBase`(`donoId`);

-- CreateIndex
CREATE INDEX `PersonagemCampanha_campanhaId_idx` ON `PersonagemCampanha`(`campanhaId`);

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_personagemSessaoId_fkey` FOREIGN KEY (`personagemSessaoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_habilidadeTecnicaId_fkey` FOREIGN KEY (`habilidadeTecnicaId`) REFERENCES `habilidade_tecnica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_variacaoHabilidadeId_fkey` FOREIGN KEY (`variacaoHabilidadeId`) REFERENCES `variacao_habilidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_criadaPorUsuarioId_fkey` FOREIGN KEY (`criadaPorUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD CONSTRAINT `PersonagemSessaoHabilidadeSustentada_desativadaPorUsuarioId_fkey` FOREIGN KEY (`desativadaPorUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `personagemcampanha` RENAME INDEX `PersonagemCampanha_personagemBaseId_fkey` TO `PersonagemCampanha_personagemBaseId_idx`;

-- RenameIndex
ALTER TABLE `personagemsessaohabilidadesustentada` RENAME INDEX `pshs_habilidade_idx` TO `PersonagemSessaoHabilidadeSustentada_habilidadeTecnicaId_idx`;

-- RenameIndex
ALTER TABLE `personagemsessaohabilidadesustentada` RENAME INDEX `pshs_personagem_ativa_idx` TO `PersonagemSessaoHabilidadeSustentada_personagemSessaoId_ativ_idx`;

-- RenameIndex
ALTER TABLE `personagemsessaohabilidadesustentada` RENAME INDEX `pshs_sessao_ativa_idx` TO `PersonagemSessaoHabilidadeSustentada_sessaoId_ativa_idx`;

-- RenameIndex
ALTER TABLE `personagemsessaohabilidadesustentada` RENAME INDEX `pshs_variacao_idx` TO `PersonagemSessaoHabilidadeSustentada_variacaoHabilidadeId_idx`;
