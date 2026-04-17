ALTER TABLE `PersonagemSessaoHabilidadeSustentada`
  ADD COLUMN `acumulos` INTEGER NOT NULL DEFAULT 1;

ALTER TABLE `CondicaoPersonagemSessao`
  ADD COLUMN `acumulos` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `fonteCodigo` VARCHAR(191) NULL,
  ADD COLUMN `limiteFonte` INTEGER NULL;
