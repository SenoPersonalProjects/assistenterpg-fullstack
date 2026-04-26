-- Alteracoes para equipamento homebrew inline e tecnica inata propria por personagem

ALTER TABLE `equipamento_catalogo`
  ADD COLUMN `usuarioId` INTEGER NULL,
  ADD COLUMN `homebrewOrigemId` INTEGER NULL;

ALTER TABLE `tecnica_amaldicoada`
  DROP INDEX `tecnica_amaldicoada_nome_key`,
  ADD COLUMN `usuarioId` INTEGER NULL,
  ADD COLUMN `tecnicaBaseId` INTEGER NULL;

ALTER TABLE `habilidade_tecnica`
  ADD COLUMN `habilidadeBaseId` INTEGER NULL,
  ADD COLUMN `habilitada` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `variacao_habilidade`
  ADD COLUMN `variacaoBaseId` INTEGER NULL;

ALTER TABLE `personagembase`
  ADD COLUMN `tecnicaInataPropriaId` INTEGER NULL;

ALTER TABLE `personagemcampanha`
  ADD COLUMN `tecnicaInataPropriaId` INTEGER NULL,
  ADD COLUMN `tecnicaInataSincronizaBase` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `equipamento_catalogo_usuarioId_idx` ON `equipamento_catalogo`(`usuarioId`);
CREATE INDEX `equipamento_catalogo_homebrewOrigemId_idx` ON `equipamento_catalogo`(`homebrewOrigemId`);

CREATE INDEX `tecnica_amaldicoada_usuarioId_idx` ON `tecnica_amaldicoada`(`usuarioId`);
CREATE INDEX `tecnica_amaldicoada_tecnicaBaseId_idx` ON `tecnica_amaldicoada`(`tecnicaBaseId`);

CREATE INDEX `habilidade_tecnica_habilidadeBaseId_idx` ON `habilidade_tecnica`(`habilidadeBaseId`);
CREATE INDEX `variacao_habilidade_variacaoBaseId_idx` ON `variacao_habilidade`(`variacaoBaseId`);

CREATE UNIQUE INDEX `personagembase_tecnicaInataPropriaId_key` ON `personagembase`(`tecnicaInataPropriaId`);
CREATE UNIQUE INDEX `personagemcampanha_tecnicaInataPropriaId_key` ON `personagemcampanha`(`tecnicaInataPropriaId`);

ALTER TABLE `equipamento_catalogo`
  ADD CONSTRAINT `equipamento_catalogo_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `equipamento_catalogo_homebrewOrigemId_fkey`
    FOREIGN KEY (`homebrewOrigemId`) REFERENCES `homebrews`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `tecnica_amaldicoada`
  ADD CONSTRAINT `tecnica_amaldicoada_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tecnica_amaldicoada_tecnicaBaseId_fkey`
    FOREIGN KEY (`tecnicaBaseId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `habilidade_tecnica`
  ADD CONSTRAINT `habilidade_tecnica_habilidadeBaseId_fkey`
    FOREIGN KEY (`habilidadeBaseId`) REFERENCES `habilidade_tecnica`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `variacao_habilidade`
  ADD CONSTRAINT `variacao_habilidade_variacaoBaseId_fkey`
    FOREIGN KEY (`variacaoBaseId`) REFERENCES `variacao_habilidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `personagembase`
  ADD CONSTRAINT `PersonagemBase_tecnicaInataPropriaId_fkey`
    FOREIGN KEY (`tecnicaInataPropriaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `personagemcampanha`
  ADD CONSTRAINT `PersonagemCampanha_tecnicaInataPropriaId_fkey`
    FOREIGN KEY (`tecnicaInataPropriaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
