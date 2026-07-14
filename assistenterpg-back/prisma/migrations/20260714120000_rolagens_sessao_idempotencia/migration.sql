ALTER TABLE `EventoSessao`
  ADD COLUMN `solicitanteUsuarioId` INTEGER NULL,
  ADD COLUMN `clientRequestId` VARCHAR(36) NULL;

CREATE UNIQUE INDEX `EventoSessao_sessao_usuario_request_key`
  ON `EventoSessao`(`sessaoId`, `solicitanteUsuarioId`, `clientRequestId`);
