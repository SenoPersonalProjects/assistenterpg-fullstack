-- Add sustain PE cost fields to technical abilities and active session sustains

SET @has_col_hab :=
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'habilidade_tecnica'
     AND COLUMN_NAME = 'custoSustentacaoPE');
SET @sql_hab := IF(
  @has_col_hab = 0,
  'ALTER TABLE `habilidade_tecnica` ADD COLUMN `custoSustentacaoPE` INTEGER NULL',
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
     AND COLUMN_NAME = 'custoSustentacaoPE');
SET @sql_var := IF(
  @has_col_var = 0,
  'ALTER TABLE `variacao_habilidade` ADD COLUMN `custoSustentacaoPE` INTEGER NULL',
  'SELECT 1'
);
PREPARE stmt_var FROM @sql_var;
EXECUTE stmt_var;
DEALLOCATE PREPARE stmt_var;

SET @has_table_sess :=
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'PersonagemSessaoHabilidadeSustentada');
SET @has_col_sess :=
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'PersonagemSessaoHabilidadeSustentada'
     AND COLUMN_NAME = 'custoSustentacaoPE');
SET @sql_sess := IF(
  @has_table_sess = 1 AND @has_col_sess = 0,
  'ALTER TABLE `PersonagemSessaoHabilidadeSustentada` ADD COLUMN `custoSustentacaoPE` INTEGER NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt_sess FROM @sql_sess;
EXECUTE stmt_sess;
DEALLOCATE PREPARE stmt_sess;
