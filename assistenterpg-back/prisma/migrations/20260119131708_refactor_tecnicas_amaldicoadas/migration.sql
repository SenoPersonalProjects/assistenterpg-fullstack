/*
  Warnings:

  - You are about to drop the `habilidadeclahereditario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `habilidadeclahereditario` DROP FOREIGN KEY `HabilidadeClaHereditario_claId_fkey`;

-- DropForeignKey
ALTER TABLE `habilidadeclahereditario` DROP FOREIGN KEY `HabilidadeClaHereditario_habilidadeId_fkey`;

-- DropForeignKey
ALTER TABLE `personagembase` DROP FOREIGN KEY `PersonagemBase_tecnicaInataId_fkey`;

-- DropIndex
DROP INDEX `PersonagemBase_tecnicaInataId_fkey` ON `personagembase`;

-- AlterTable
ALTER TABLE `personagemcampanha` ADD COLUMN `tecnicaInataId` INTEGER NULL;

-- DropTable
DROP TABLE `habilidadeclahereditario`;

-- CreateTable
CREATE TABLE `tecnica_amaldicoada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('INATA', 'NAO_INATA') NOT NULL,
    `hereditaria` BOOLEAN NOT NULL DEFAULT false,
    `linkExterno` TEXT NULL,
    `requisitos` JSON NULL,
    `origem` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tecnica_amaldicoada_codigo_key`(`codigo`),
    UNIQUE INDEX `tecnica_amaldicoada_nome_key`(`nome`),
    INDEX `tecnica_amaldicoada_tipo_idx`(`tipo`),
    INDEX `tecnica_amaldicoada_hereditaria_idx`(`hereditaria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tecnica_cla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tecnicaId` INTEGER NOT NULL,
    `claId` INTEGER NOT NULL,

    UNIQUE INDEX `tecnica_cla_tecnicaId_claId_key`(`tecnicaId`, `claId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habilidade_tecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tecnicaId` INTEGER NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `requisitos` JSON NULL,
    `execucao` ENUM('ACAO_MOVIMENTO', 'ACAO_LIVRE', 'ACAO_PADRAO', 'ACAO_COMPLETA', 'AO_ATACAR', 'REACAO_ESPECIAL', 'REACAO_BLOQUEIO', 'REACAO_ESQUIVA', 'REACAO', 'SUSTENTADA') NOT NULL,
    `area` ENUM('CONE', 'LINHA', 'CUBO', 'ESFERA', 'OUTROS') NULL,
    `alcance` VARCHAR(191) NULL,
    `alvo` VARCHAR(191) NULL,
    `duracao` VARCHAR(191) NULL,
    `resistencia` TEXT NULL,
    `dtResistencia` TEXT NULL,
    `custoPE` INTEGER NOT NULL DEFAULT 0,
    `custoEA` INTEGER NOT NULL DEFAULT 0,
    `testesExigidos` JSON NULL,
    `criticoValor` INTEGER NULL,
    `criticoMultiplicador` INTEGER NULL,
    `danoFlat` INTEGER NULL DEFAULT 0,
    `danoFlatTipo` ENUM('CORTANTE', 'PERFURANTE', 'IMPACTO', 'BALISTICO', 'FOGO', 'ELETRICO', 'ACIDO', 'FRIO', 'ENERGIA_AMALDICOADA', 'MENTAL') NULL,
    `dadosDano` JSON NULL,
    `escalonaPorGrau` BOOLEAN NOT NULL DEFAULT false,
    `grauTipoGrauCodigo` VARCHAR(191) NULL,
    `escalonamentoCustoEA` INTEGER NOT NULL DEFAULT 0,
    `escalonamentoDano` JSON NULL,
    `efeito` TEXT NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `habilidade_tecnica_codigo_key`(`codigo`),
    INDEX `habilidade_tecnica_tecnicaId_idx`(`tecnicaId`),
    INDEX `habilidade_tecnica_ordem_idx`(`ordem`),
    INDEX `habilidade_tecnica_grauTipoGrauCodigo_idx`(`grauTipoGrauCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variacao_habilidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `habilidadeTecnicaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `substituiCustos` BOOLEAN NOT NULL DEFAULT false,
    `custoPE` INTEGER NULL,
    `custoEA` INTEGER NULL,
    `execucao` ENUM('ACAO_MOVIMENTO', 'ACAO_LIVRE', 'ACAO_PADRAO', 'ACAO_COMPLETA', 'AO_ATACAR', 'REACAO_ESPECIAL', 'REACAO_BLOQUEIO', 'REACAO_ESQUIVA', 'REACAO', 'SUSTENTADA') NULL,
    `area` ENUM('CONE', 'LINHA', 'CUBO', 'ESFERA', 'OUTROS') NULL,
    `alcance` VARCHAR(191) NULL,
    `alvo` TEXT NULL,
    `duracao` TEXT NULL,
    `resistencia` TEXT NULL,
    `dtResistencia` TEXT NULL,
    `criticoValor` INTEGER NULL,
    `criticoMultiplicador` INTEGER NULL,
    `danoFlat` INTEGER NULL,
    `danoFlatTipo` ENUM('CORTANTE', 'PERFURANTE', 'IMPACTO', 'BALISTICO', 'FOGO', 'ELETRICO', 'ACIDO', 'FRIO', 'ENERGIA_AMALDICOADA', 'MENTAL') NULL,
    `dadosDano` JSON NULL,
    `escalonaPorGrau` BOOLEAN NULL,
    `escalonamentoCustoEA` INTEGER NULL,
    `escalonamentoDano` JSON NULL,
    `efeitoAdicional` TEXT NULL,
    `requisitos` JSON NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `variacao_habilidade_habilidadeTecnicaId_idx`(`habilidadeTecnicaId`),
    INDEX `variacao_habilidade_ordem_idx`(`ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personagem_base_tecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `tecnicaId` INTEGER NOT NULL,

    INDEX `personagem_base_tecnica_personagemBaseId_idx`(`personagemBaseId`),
    INDEX `personagem_base_tecnica_tecnicaId_idx`(`tecnicaId`),
    UNIQUE INDEX `personagem_base_tecnica_personagemBaseId_tecnicaId_key`(`personagemBaseId`, `tecnicaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personagem_campanha_tecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `tecnicaId` INTEGER NOT NULL,

    INDEX `personagem_campanha_tecnica_personagemCampanhaId_idx`(`personagemCampanhaId`),
    INDEX `personagem_campanha_tecnica_tecnicaId_idx`(`tecnicaId`),
    UNIQUE INDEX `personagem_campanha_tecnica_personagemCampanhaId_tecnicaId_key`(`personagemCampanhaId`, `tecnicaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonagemBase` ADD CONSTRAINT `PersonagemBase_tecnicaInataId_fkey` FOREIGN KEY (`tecnicaInataId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonagemCampanha` ADD CONSTRAINT `PersonagemCampanha_tecnicaInataId_fkey` FOREIGN KEY (`tecnicaInataId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tecnica_cla` ADD CONSTRAINT `tecnica_cla_tecnicaId_fkey` FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tecnica_cla` ADD CONSTRAINT `tecnica_cla_claId_fkey` FOREIGN KEY (`claId`) REFERENCES `Cla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habilidade_tecnica` ADD CONSTRAINT `habilidade_tecnica_tecnicaId_fkey` FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variacao_habilidade` ADD CONSTRAINT `variacao_habilidade_habilidadeTecnicaId_fkey` FOREIGN KEY (`habilidadeTecnicaId`) REFERENCES `habilidade_tecnica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personagem_base_tecnica` ADD CONSTRAINT `personagem_base_tecnica_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personagem_base_tecnica` ADD CONSTRAINT `personagem_base_tecnica_tecnicaId_fkey` FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personagem_campanha_tecnica` ADD CONSTRAINT `personagem_campanha_tecnica_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personagem_campanha_tecnica` ADD CONSTRAINT `personagem_campanha_tecnica_tecnicaId_fkey` FOREIGN KEY (`tecnicaId`) REFERENCES `tecnica_amaldicoada`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
