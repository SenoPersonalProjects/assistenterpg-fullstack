ALTER TABLE `Usuario`
  ADD COLUMN `senhaGeradaPorOAuth` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `usuarios_oauth_identidades` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `provider` ENUM('GOOGLE') NOT NULL,
  `providerUserId` VARCHAR(128) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `emailNormalizado` VARCHAR(255) NOT NULL,
  `emailVerificado` BOOLEAN NOT NULL DEFAULT false,
  `nome` VARCHAR(255) NULL,
  `avatarUrl` TEXT NULL,
  `scopes` JSON NULL,
  `ultimoLoginEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `usuarios_oauth_identidades_provider_providerUserId_key`(`provider`, `providerUserId`),
  INDEX `usuarios_oauth_identidades_usuarioId_idx`(`usuarioId`),
  INDEX `usuarios_oauth_identidades_provider_emailNormalizado_idx`(`provider`, `emailNormalizado`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `usuarios_google_credenciais` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `refreshTokenCriptografado` TEXT NULL,
  `accessTokenCriptografado` TEXT NULL,
  `accessTokenExpiraEm` DATETIME(3) NULL,
  `scopes` JSON NULL,
  `calendarAutorizadoEm` DATETIME(3) NULL,
  `revogadoEm` DATETIME(3) NULL,
  `ultimoRefreshEm` DATETIME(3) NULL,
  `ultimoErro` TEXT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `usuarios_google_credenciais_usuarioId_key`(`usuarioId`),
  INDEX `usuarios_google_credenciais_revogadoEm_idx`(`revogadoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `oauth_states` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `stateHash` VARCHAR(64) NOT NULL,
  `modo` ENUM('LOGIN', 'REGISTER', 'LINK', 'CALENDAR') NOT NULL,
  `usuarioId` INTEGER NULL,
  `sid` INTEGER NULL,
  `redirectPath` VARCHAR(512) NULL,
  `scopes` JSON NULL,
  `codeVerifierCriptografado` TEXT NOT NULL,
  `expiraEm` DATETIME(3) NOT NULL,
  `consumidoEm` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `oauth_states_stateHash_key`(`stateHash`),
  INDEX `oauth_states_usuarioId_modo_idx`(`usuarioId`, `modo`),
  INDEX `oauth_states_expiraEm_idx`(`expiraEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sessoes_agendadas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `campanhaId` INTEGER NOT NULL,
  `criadorId` INTEGER NOT NULL,
  `sessaoId` INTEGER NULL,
  `titulo` VARCHAR(120) NOT NULL,
  `descricao` TEXT NULL,
  `inicioEm` DATETIME(3) NOT NULL,
  `fimEm` DATETIME(3) NOT NULL,
  `timezone` VARCHAR(80) NOT NULL,
  `status` ENUM('AGENDADA', 'PROCESSANDO_ABERTURA', 'ABERTA', 'CANCELADA', 'FALHA_ABERTURA') NOT NULL DEFAULT 'AGENDADA',
  `canceladaEm` DATETIME(3) NULL,
  `abertaEm` DATETIME(3) NULL,
  `falhaAbertura` TEXT NULL,
  `adicionarAoGoogleCalendar` BOOLEAN NOT NULL DEFAULT false,
  `adicionarGoogleMeet` BOOLEAN NOT NULL DEFAULT false,
  `googleCalendarEventId` VARCHAR(255) NULL,
  `googleCalendarHtmlLink` TEXT NULL,
  `googleCalendarICalUID` VARCHAR(255) NULL,
  `googleMeetLink` TEXT NULL,
  `calendarSyncStatus` ENUM('NAO_SOLICITADO', 'PENDENTE', 'SINCRONIZADO', 'FALHOU', 'CANCELADO') NOT NULL DEFAULT 'NAO_SOLICITADO',
  `calendarSyncError` TEXT NULL,
  `calendarSyncAttempts` INTEGER NOT NULL DEFAULT 0,
  `nextCalendarSyncAt` DATETIME(3) NULL,
  `lastCalendarSyncAt` DATETIME(3) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `sessoes_agendadas_sessaoId_key`(`sessaoId`),
  INDEX `sessoes_agendadas_status_inicioEm_idx`(`status`, `inicioEm`),
  INDEX `sessoes_agendadas_campanhaId_status_inicioEm_idx`(`campanhaId`, `status`, `inicioEm`),
  INDEX `sessoes_agendadas_criadorId_status_idx`(`criadorId`, `status`),
  INDEX `sessoes_agendadas_nextCalendarSyncAt_idx`(`nextCalendarSyncAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `usuarios_oauth_identidades`
  ADD CONSTRAINT `usuarios_oauth_identidades_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `usuarios_google_credenciais`
  ADD CONSTRAINT `usuarios_google_credenciais_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `oauth_states`
  ADD CONSTRAINT `oauth_states_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sessoes_agendadas`
  ADD CONSTRAINT `sessoes_agendadas_campanhaId_fkey`
  FOREIGN KEY (`campanhaId`) REFERENCES `Campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sessoes_agendadas`
  ADD CONSTRAINT `sessoes_agendadas_criadorId_fkey`
  FOREIGN KEY (`criadorId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sessoes_agendadas`
  ADD CONSTRAINT `sessoes_agendadas_sessaoId_fkey`
  FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
