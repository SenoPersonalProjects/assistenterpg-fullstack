-- Add optional session/scene context to campaign character modifiers
ALTER TABLE `PersonagemCampanhaModificador`
  ADD COLUMN `sessaoId` INTEGER NULL,
  ADD COLUMN `cenaId` INTEGER NULL;

CREATE INDEX `PersonagemCampanhaModificador_sessaoId_idx`
  ON `PersonagemCampanhaModificador`(`sessaoId`);

CREATE INDEX `PersonagemCampanhaModificador_cenaId_idx`
  ON `PersonagemCampanhaModificador`(`cenaId`);

CREATE INDEX `PCM_camp_pers_sess_ativo_idx`
  ON `PersonagemCampanhaModificador`(`campanhaId`, `personagemCampanhaId`, `sessaoId`, `ativo`);

CREATE INDEX `PCM_camp_pers_cena_ativo_idx`
  ON `PersonagemCampanhaModificador`(`campanhaId`, `personagemCampanhaId`, `cenaId`, `ativo`);
