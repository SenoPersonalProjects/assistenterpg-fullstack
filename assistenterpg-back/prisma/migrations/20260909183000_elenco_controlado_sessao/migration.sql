ALTER TABLE `Sessao`
  ADD COLUMN `elencoControladoPeloMestre` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `PersonagemSessao`
  ADD COLUMN `controladorUsuarioId` INTEGER NULL;

CREATE INDEX `PersonagemSessao_controladorUsuarioId_idx`
  ON `PersonagemSessao`(`controladorUsuarioId`);

ALTER TABLE `PersonagemSessao`
  ADD CONSTRAINT `PersonagemSessao_controladorUsuarioId_fkey`
  FOREIGN KEY (`controladorUsuarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `NpcAmeaca`
  ADD COLUMN `peMax` INTEGER NULL;

ALTER TABLE `NpcAmeacaSessao`
  ADD COLUMN `controladorUsuarioId` INTEGER NULL,
  ADD COLUMN `peAtual` INTEGER NULL,
  ADD COLUMN `peMax` INTEGER NULL;

CREATE INDEX `NpcAmeacaSessao_controladorUsuarioId_idx`
  ON `NpcAmeacaSessao`(`controladorUsuarioId`);

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_controladorUsuarioId_fkey`
  FOREIGN KEY (`controladorUsuarioId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
