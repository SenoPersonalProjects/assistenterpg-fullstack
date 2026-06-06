ALTER TABLE `Usuario`
  MODIFY `status` ENUM('ATIVA', 'DESATIVADA', 'PENDENTE_EXCLUSAO', 'EXCLUIDA') NOT NULL DEFAULT 'ATIVA',
  ADD COLUMN `exclusaoSolicitadaEm` DATETIME(3) NULL,
  ADD COLUMN `exclusaoAgendadaPara` DATETIME(3) NULL;

CREATE INDEX `Usuario_status_exclusaoAgendadaPara_idx`
  ON `Usuario`(`status`, `exclusaoAgendadaPara`);
