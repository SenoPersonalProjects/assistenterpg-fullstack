ALTER TABLE `PersonagemCampanhaModificador`
  MODIFY `campo` ENUM(
    'PV_MAX',
    'PE_MAX',
    'EA_MAX',
    'SAN_MAX',
    'DEFESA_BASE',
    'DEFESA_EQUIPAMENTO',
    'DEFESA_OUTROS',
    'ESQUIVA',
    'BLOQUEIO',
    'DESLOCAMENTO',
    'LIMITE_PE_EA_POR_TURNO',
    'PRESTIGIO_GERAL',
    'PRESTIGIO_CLA',
    'PERICIA_TREINAMENTO',
    'GRAU_APRIMORAMENTO'
  ) NOT NULL,
  ADD COLUMN `periciaCodigo` VARCHAR(191) NULL,
  ADD COLUMN `tipoGrauCodigo` VARCHAR(191) NULL;

CREATE INDEX `PersonagemCampanhaModificador_periciaCodigo_idx`
  ON `PersonagemCampanhaModificador`(`periciaCodigo`);

CREATE INDEX `PersonagemCampanhaModificador_tipoGrauCodigo_idx`
  ON `PersonagemCampanhaModificador`(`tipoGrauCodigo`);

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_periciaCodigo_fkey`
  FOREIGN KEY (`periciaCodigo`) REFERENCES `Pericia`(`codigo`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PersonagemCampanhaModificador`
  ADD CONSTRAINT `PersonagemCampanhaModificador_tipoGrauCodigo_fkey`
  FOREIGN KEY (`tipoGrauCodigo`) REFERENCES `TipoGrau`(`codigo`)
  ON DELETE SET NULL ON UPDATE CASCADE;
