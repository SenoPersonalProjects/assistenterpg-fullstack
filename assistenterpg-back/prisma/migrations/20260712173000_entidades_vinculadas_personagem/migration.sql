CREATE TABLE `personagem_campanha_entidades_vinculadas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `campanhaId` INTEGER NOT NULL,
  `personagemCampanhaId` INTEGER NOT NULL,
  `tipo` ENUM('SHIKIGAMI', 'CORPO_AMALDICOADO', 'MALDICAO_CONTROLADA') NOT NULL,
  `estado` ENUM('DISPONIVEL', 'ATIVO', 'DESTRUIDO', 'SELADO', 'DESCARREGADO', 'ARQUIVADO') NOT NULL DEFAULT 'DISPONIVEL',
  `nome` VARCHAR(120) NOT NULL,
  `descricao` TEXT NULL,
  `conceito` TEXT NULL,
  `aparencia` TEXT NULL,
  `nivelReferencia` INTEGER NULL,
  `grauReferencia` INTEGER NULL,
  `tecnicaOrigemId` INTEGER NULL,
  `tipoGrauCodigo` VARCHAR(191) NULL,
  `npcAmeacaOrigemId` INTEGER NULL,
  `fichaTipo` ENUM('NPC', 'AMEACA') NOT NULL DEFAULT 'NPC',
  `tipoNpc` ENUM('HUMANO', 'FEITICEIRO', 'MALDICAO', 'ANIMAL', 'HIBRIDO', 'OUTRO') NOT NULL DEFAULT 'OUTRO',
  `tamanho` ENUM('MINUSCULO', 'PEQUENO', 'MEDIO', 'GRANDE', 'ENORME', 'COLOSSAL') NOT NULL DEFAULT 'MEDIO',
  `vd` INTEGER NOT NULL DEFAULT 0,
  `agilidade` INTEGER NOT NULL DEFAULT 0,
  `forca` INTEGER NOT NULL DEFAULT 0,
  `intelecto` INTEGER NOT NULL DEFAULT 0,
  `presenca` INTEGER NOT NULL DEFAULT 0,
  `vigor` INTEGER NOT NULL DEFAULT 0,
  `percepcao` INTEGER NOT NULL DEFAULT 0,
  `iniciativa` INTEGER NOT NULL DEFAULT 0,
  `fortitude` INTEGER NOT NULL DEFAULT 0,
  `reflexos` INTEGER NOT NULL DEFAULT 0,
  `vontade` INTEGER NOT NULL DEFAULT 0,
  `luta` INTEGER NOT NULL DEFAULT 0,
  `jujutsu` INTEGER NOT NULL DEFAULT 0,
  `defesa` INTEGER NOT NULL DEFAULT 10,
  `pontosVidaMax` INTEGER NOT NULL DEFAULT 1,
  `pontosVidaAtual` INTEGER NOT NULL DEFAULT 1,
  `rd` INTEGER NOT NULL DEFAULT 0,
  `deslocamentoMetros` INTEGER NOT NULL DEFAULT 6,
  `vagasOcupadas` INTEGER NOT NULL DEFAULT 1,
  `cargasMax` INTEGER NULL,
  `cargasAtual` INTEGER NULL,
  `periciasEspeciais` JSON NULL,
  `resistencias` JSON NULL,
  `vulnerabilidades` JSON NULL,
  `passivas` JSON NULL,
  `acoes` JSON NULL,
  `habilidades` JSON NULL,
  `custos` JSON NULL,
  `limites` JSON NULL,
  `config` JSON NULL,
  `criadoPorId` INTEGER NULL,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  INDEX `idx_ent_vinc_campanha`(`campanhaId`),
  INDEX `idx_ent_vinc_personagem`(`personagemCampanhaId`),
  INDEX `idx_ent_vinc_campanha_tipo`(`campanhaId`, `tipo`),
  INDEX `idx_ent_vinc_personagem_tipo`(`personagemCampanhaId`, `tipo`),
  INDEX `idx_ent_vinc_personagem_estado`(`personagemCampanhaId`, `estado`),
  INDEX `idx_ent_vinc_tecnica`(`tecnicaOrigemId`),
  INDEX `idx_ent_vinc_tipo_grau`(`tipoGrauCodigo`),
  INDEX `idx_ent_vinc_npc_origem`(`npcAmeacaOrigemId`),
  INDEX `idx_ent_vinc_criado_por`(`criadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_campanha_fkey`
  FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_personagem_fkey`
  FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_tecnica_fkey`
  FOREIGN KEY (`tecnicaOrigemId`) REFERENCES `tecnica_amaldicoada`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_tipo_grau_fkey`
  FOREIGN KEY (`tipoGrauCodigo`) REFERENCES `TipoGrau`(`codigo`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_npc_origem_fkey`
  FOREIGN KEY (`npcAmeacaOrigemId`) REFERENCES `NpcAmeaca`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `personagem_campanha_entidades_vinculadas`
  ADD CONSTRAINT `pc_ent_vinc_criado_por_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `NpcAmeacaSessao`
  ADD COLUMN `entidadeVinculadaId` INTEGER NULL,
  ADD COLUMN `personagemDonoId` INTEGER NULL,
  ADD COLUMN `personagemControladorSessaoId` INTEGER NULL,
  ADD COLUMN `tipoVinculo` ENUM('SHIKIGAMI', 'CORPO_AMALDICOADO', 'MALDICAO_CONTROLADA') NULL;

CREATE INDEX `NpcAmeacaSessao_entidadeVinculadaId_idx`
  ON `NpcAmeacaSessao`(`entidadeVinculadaId`);

CREATE INDEX `NpcAmeacaSessao_personagemDonoId_idx`
  ON `NpcAmeacaSessao`(`personagemDonoId`);

CREATE INDEX `NpcAmeacaSessao_personagemControladorSessaoId_idx`
  ON `NpcAmeacaSessao`(`personagemControladorSessaoId`);

CREATE INDEX `NpcAmeacaSessao_sessaoId_entidadeVinculadaId_idx`
  ON `NpcAmeacaSessao`(`sessaoId`, `entidadeVinculadaId`);

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_entidadeVinculadaId_fkey`
  FOREIGN KEY (`entidadeVinculadaId`) REFERENCES `personagem_campanha_entidades_vinculadas`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_personagemDonoId_fkey`
  FOREIGN KEY (`personagemDonoId`) REFERENCES `PersonagemCampanha`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `NpcAmeacaSessao`
  ADD CONSTRAINT `NpcAmeacaSessao_personagemControladorSessaoId_fkey`
  FOREIGN KEY (`personagemControladorSessaoId`) REFERENCES `PersonagemSessao`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
