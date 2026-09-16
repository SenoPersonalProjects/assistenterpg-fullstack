ALTER TABLE `DominioSessao`
  ADD COLUMN `incompleto` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `atributoEpifania` VARCHAR(24) NULL,
  ADD COLUMN `bonusDadosEfeito` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `EpifaniaDominioSessao` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sessaoId` INTEGER NOT NULL,
  `cenaId` INTEGER NOT NULL,
  `personagemSessaoId` INTEGER NOT NULL,
  `tentativasFalhas` INTEGER NOT NULL DEFAULT 0,
  `ultimaDt` INTEGER NOT NULL DEFAULT 20,
  `ultimoResultado` INTEGER NULL,
  `manifestadaEm` DATETIME(3) NULL,
  `dominioSessaoId` INTEGER NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL,

  UNIQUE INDEX `epifania_dominio_sessao_unico`(`sessaoId`, `cenaId`, `personagemSessaoId`),
  INDEX `EpifaniaDominioSessao_dominioSessaoId_idx`(`dominioSessaoId`),
  CONSTRAINT `EpifaniaDominioSessao_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `Sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EpifaniaDominioSessao_cenaId_fkey` FOREIGN KEY (`cenaId`) REFERENCES `Cena`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EpifaniaDominioSessao_personagemSessaoId_fkey` FOREIGN KEY (`personagemSessaoId`) REFERENCES `PersonagemSessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EpifaniaDominioSessao_dominioSessaoId_fkey` FOREIGN KEY (`dominioSessaoId`) REFERENCES `DominioSessao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  PRIMARY KEY (`id`)
);
