-- Add sustain cost fields to technical abilities
SET @has_col_hab :=
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'habilidade_tecnica'
     AND COLUMN_NAME = 'custoSustentacaoEA');
SET @sql_hab := IF(
  @has_col_hab = 0,
  'ALTER TABLE `habilidade_tecnica` ADD COLUMN `custoSustentacaoEA` INTEGER NULL',
  'SELECT 1'
);
PREPARE stmt_hab FROM @sql_hab;
EXECUTE stmt_hab;
DEALLOCATE PREPARE stmt_hab;

SET @has_col_var :=
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'variacao_habilidade'
     AND COLUMN_NAME = 'custoSustentacaoEA');
SET @sql_var := IF(
  @has_col_var = 0,
  'ALTER TABLE `variacao_habilidade` ADD COLUMN `custoSustentacaoEA` INTEGER NULL',
  'SELECT 1'
);
PREPARE stmt_var FROM @sql_var;
EXECUTE stmt_var;
DEALLOCATE PREPARE stmt_var;

-- Track active sustained abilities during session flow
CREATE TABLE IF NOT EXISTS `PersonagemSessaoHabilidadeSustentada` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sessaoId` INTEGER NOT NULL,
  `personagemSessaoId` INTEGER NOT NULL,
  `habilidadeTecnicaId` INTEGER NOT NULL,
  `variacaoHabilidadeId` INTEGER NULL,
  `nomeHabilidade` VARCHAR(191) NOT NULL,
  `nomeVariacao` VARCHAR(191) NULL,
  `custoSustentacaoEA` INTEGER NOT NULL DEFAULT 1,
  `ativadaNaRodada` INTEGER NOT NULL DEFAULT 1,
  `ultimaCobrancaRodada` INTEGER NOT NULL DEFAULT 1,
  `ativa` BOOLEAN NOT NULL DEFAULT true,
  `criadaPorUsuarioId` INTEGER NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `desativadaEm` DATETIME(3) NULL,
  `desativadaPorUsuarioId` INTEGER NULL,
  `motivoDesativacao` TEXT NULL,

  INDEX `pshs_sessao_ativa_idx`(`sessaoId`, `ativa`),
  INDEX `pshs_personagem_ativa_idx`(`personagemSessaoId`, `ativa`),
  INDEX `pshs_habilidade_idx`(`habilidadeTecnicaId`),
  INDEX `pshs_variacao_idx`(`variacaoHabilidadeId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PersonagemSessaoHabilidadeSustentada`
  ADD CONSTRAINT `pshs_sessao_fk`
  FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pshs_personagem_sessao_fk`
  FOREIGN KEY (`personagemSessaoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pshs_habilidade_fk`
  FOREIGN KEY (`habilidadeTecnicaId`) REFERENCES `habilidade_tecnica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pshs_variacao_fk`
  FOREIGN KEY (`variacaoHabilidadeId`) REFERENCES `variacao_habilidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pshs_criada_por_fk`
  FOREIGN KEY (`criadaPorUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pshs_desativada_por_fk`
  FOREIGN KEY (`desativadaPorUsuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
