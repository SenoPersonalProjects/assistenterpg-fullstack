DROP INDEX `PersonagemCampanha_campanhaId_donoId_key` ON `PersonagemCampanha`;

CREATE INDEX `PersonagemCampanha_campanhaId_donoId_idx`
  ON `PersonagemCampanha`(`campanhaId`, `donoId`);