CREATE TABLE `homebrew_grupos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `descricao` TEXT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `homebrew_grupos_usuarioId_idx`(`usuarioId`),
  INDEX `homebrew_grupos_usuarioId_nome_idx`(`usuarioId`, `nome`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `homebrew_grupo_itens` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `grupoId` INTEGER NOT NULL,
  `homebrewId` INTEGER NOT NULL,

  INDEX `homebrew_grupo_itens_homebrewId_idx`(`homebrewId`),
  UNIQUE INDEX `homebrew_grupo_itens_grupoId_homebrewId_key`(`grupoId`, `homebrewId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `npc_ameaca_grupos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuarioId` INTEGER NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `descricao` TEXT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  INDEX `npc_ameaca_grupos_usuarioId_idx`(`usuarioId`),
  INDEX `npc_ameaca_grupos_usuarioId_nome_idx`(`usuarioId`, `nome`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `npc_ameaca_grupo_itens` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `grupoId` INTEGER NOT NULL,
  `npcAmeacaId` INTEGER NOT NULL,

  INDEX `npc_ameaca_grupo_itens_npcAmeacaId_idx`(`npcAmeacaId`),
  UNIQUE INDEX `npc_ameaca_grupo_itens_grupoId_npcAmeacaId_key`(`grupoId`, `npcAmeacaId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SessaoRelatorio` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sessaoId` INTEGER NOT NULL,
  `dadosJson` JSON NOT NULL,
  `geradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `SessaoRelatorio_sessaoId_key`(`sessaoId`),
  INDEX `SessaoRelatorio_geradoEm_idx`(`geradoEm`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `homebrew_grupos`
  ADD CONSTRAINT `homebrew_grupos_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `homebrew_grupo_itens`
  ADD CONSTRAINT `homebrew_grupo_itens_grupoId_fkey`
    FOREIGN KEY (`grupoId`) REFERENCES `homebrew_grupos`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `homebrew_grupo_itens_homebrewId_fkey`
    FOREIGN KEY (`homebrewId`) REFERENCES `homebrews`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `npc_ameaca_grupos`
  ADD CONSTRAINT `npc_ameaca_grupos_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `npc_ameaca_grupo_itens`
  ADD CONSTRAINT `npc_ameaca_grupo_itens_grupoId_fkey`
    FOREIGN KEY (`grupoId`) REFERENCES `npc_ameaca_grupos`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `npc_ameaca_grupo_itens_npcAmeacaId_fkey`
    FOREIGN KEY (`npcAmeacaId`) REFERENCES `NpcAmeaca`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SessaoRelatorio`
  ADD CONSTRAINT `SessaoRelatorio_sessaoId_fkey`
    FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
