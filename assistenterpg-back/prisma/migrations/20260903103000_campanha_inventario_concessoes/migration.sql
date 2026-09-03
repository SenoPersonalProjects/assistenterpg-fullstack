ALTER TABLE `Campanha` ADD COLUMN IF NOT EXISTS `fontesConteudo` JSON NULL;

ALTER TABLE `PersonagemCampanhaModificador`
  MODIFY `campo` ENUM(
    'PV_MAX', 'PE_MAX', 'EA_MAX', 'SAN_MAX', 'DEFESA_BASE',
    'DEFESA_EQUIPAMENTO', 'DEFESA_OUTROS', 'ESQUIVA', 'BLOQUEIO',
    'DESLOCAMENTO', 'LIMITE_PE_EA_POR_TURNO', 'PRESTIGIO_GERAL',
    'PRESTIGIO_CLA', 'PERICIA_TREINAMENTO', 'PERICIA_BONUS',
    'GRAU_APRIMORAMENTO', 'ATRIBUTO', 'RESISTENCIA', 'BONUS_DT_FEITICOS'
  ) NOT NULL;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD COLUMN IF NOT EXISTS `atributoCodigo` VARCHAR(32) NULL;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD COLUMN IF NOT EXISTS `resistenciaTipoId` INTEGER NULL;

CREATE INDEX IF NOT EXISTS `PersonagemCampanhaModificador_resistenciaTipoId_idx`
  ON `PersonagemCampanhaModificador`(`resistenciaTipoId`);

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_resistenciaTipoId_fkey`
  FOREIGN KEY (`resistenciaTipoId`) REFERENCES `ResistenciaTipo`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaResistencia`
  DROP FOREIGN KEY `PersonagemCampanhaResistencia_personagemCampanhaId_fkey`;

ALTER TABLE `PersonagemCampanhaResistencia`
  ADD CONSTRAINT `PersonagemCampanhaResistencia_personagemCampanhaId_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventario_item_campanha`
  ADD COLUMN IF NOT EXISTS `itemBaseOrigemId` INTEGER NULL;

CREATE UNIQUE INDEX IF NOT EXISTS `inventario_item_campanha_personagem_origem_key`
  ON `inventario_item_campanha`(`personagemCampanhaId`, `itemBaseOrigemId`);

CREATE TABLE `inventario_item_campanha_base_suprimido` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `personagemCampanhaId` INTEGER NOT NULL,
  `itemBaseOrigemId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `inventario_item_campanha_base_suprimido_personagem_origem_key` (`personagemCampanhaId`, `itemBaseOrigemId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `inventario_item_campanha_base_suprimido`
  ADD CONSTRAINT `inventario_item_campanha_base_suprimido_personagem_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `PersonagemCampanhaProficiencia` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `personagemCampanhaId` INTEGER NOT NULL,
  `proficienciaId` INTEGER NOT NULL,
  `criadoPorId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `PersonagemCampanhaProficiencia_personagem_proficiencia_key` (`personagemCampanhaId`, `proficienciaId`),
  INDEX `PersonagemCampanhaProficiencia_proficienciaId_idx` (`proficienciaId`),
  INDEX `PersonagemCampanhaProficiencia_criadoPorId_idx` (`criadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PersonagemCampanhaProficiencia`
  ADD CONSTRAINT `PersonagemCampanhaProficiencia_personagem_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PersonagemCampanhaProficiencia_proficiencia_fkey`
  FOREIGN KEY (`proficienciaId`) REFERENCES `Proficiencia`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `PersonagemCampanhaProficiencia_criadoPor_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `PersonagemCampanhaHabilidadePersonalizada` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `campanhaId` INTEGER NOT NULL,
  `personagemCampanhaId` INTEGER NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` TEXT NOT NULL,
  `criadoPorId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `PCHabPersonalizada_campanha_personagem_idx` (`campanhaId`, `personagemCampanhaId`),
  INDEX `PersonagemCampanhaHabilidadePersonalizada_criadoPorId_idx` (`criadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PersonagemCampanhaHabilidadePersonalizada`
  ADD CONSTRAINT `PersonagemCampanhaHabilidadePersonalizada_campanha_fkey`
  FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PersonagemCampanhaHabilidadePersonalizada_personagem_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PersonagemCampanhaHabilidadePersonalizada_criadoPor_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
