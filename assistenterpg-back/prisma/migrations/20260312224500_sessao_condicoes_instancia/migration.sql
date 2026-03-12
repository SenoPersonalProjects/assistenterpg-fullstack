ALTER TABLE `CondicaoPersonagemSessao`
  DROP FOREIGN KEY `CondicaoPersonagemSessao_personagemSessaoId_fkey`;

ALTER TABLE `CondicaoPersonagemSessao`
  MODIFY COLUMN `personagemSessaoId` INTEGER NULL,
  ADD COLUMN `sessaoId` INTEGER NULL,
  ADD COLUMN `npcSessaoId` INTEGER NULL,
  ADD COLUMN `duracaoModo` VARCHAR(191) NOT NULL DEFAULT 'ATE_REMOVER',
  ADD COLUMN `duracaoValor` INTEGER NULL,
  ADD COLUMN `restanteDuracao` INTEGER NULL,
  ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `automatica` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `chaveAutomacao` VARCHAR(191) NULL,
  ADD COLUMN `contadorTurnos` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `origemDescricao` TEXT NULL,
  ADD COLUMN `observacao` TEXT NULL,
  ADD COLUMN `removidaEm` DATETIME(3) NULL,
  ADD COLUMN `motivoRemocao` TEXT NULL;

UPDATE `CondicaoPersonagemSessao` cps
INNER JOIN `PersonagemSessao` ps ON ps.`id` = cps.`personagemSessaoId`
SET cps.`sessaoId` = ps.`sessaoId`
WHERE cps.`sessaoId` IS NULL;

ALTER TABLE `CondicaoPersonagemSessao`
  ADD CONSTRAINT `CondicaoPersonagemSessao_personagemSessaoId_fkey`
    FOREIGN KEY (`personagemSessaoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CondicaoPersonagemSessao_sessaoId_fkey`
    FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CondicaoPersonagemSessao_npcSessaoId_fkey`
    FOREIGN KEY (`npcSessaoId`) REFERENCES `NpcAmeacaSessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `CondicaoPersonagemSessao_sessaoId_ativo_idx` ON `CondicaoPersonagemSessao`(`sessaoId`, `ativo`);
CREATE INDEX `CondicaoPersonagemSessao_personagemSessaoId_ativo_idx` ON `CondicaoPersonagemSessao`(`personagemSessaoId`, `ativo`);
CREATE INDEX `CondicaoPersonagemSessao_npcSessaoId_ativo_idx` ON `CondicaoPersonagemSessao`(`npcSessaoId`, `ativo`);
CREATE INDEX `CondicaoPersonagemSessao_condicaoId_idx` ON `CondicaoPersonagemSessao`(`condicaoId`);
