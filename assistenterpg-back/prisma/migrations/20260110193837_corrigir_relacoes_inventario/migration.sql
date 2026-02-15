/*
  Warnings:

  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `itempersonagemcampanha` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `itempersonagemcampanha` DROP FOREIGN KEY `ItemPersonagemCampanha_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `itempersonagemcampanha` DROP FOREIGN KEY `ItemPersonagemCampanha_personagemCampanhaId_fkey`;

-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `espacosInventarioBase` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `espacosInventarioExtra` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `espacosOcupados` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sobrecarregado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `personagemcampanha` ADD COLUMN `espacosInventarioBase` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `espacosInventarioExtra` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `espacosOcupados` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sobrecarregado` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `item`;

-- DropTable
DROP TABLE `itempersonagemcampanha`;

-- CreateTable
CREATE TABLE `equipamento_catalogo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('ARMA', 'MUNICAO', 'PROTECAO', 'ACESSORIO', 'EXPLOSIVO', 'ITEM_OPERACIONAL', 'ITEM_AMALDICOADO', 'FERRAMENTA_AMALDICOADA', 'GENERICO') NOT NULL,
    `categoria` INTEGER NOT NULL DEFAULT 0,
    `espacos` INTEGER NOT NULL DEFAULT 1,
    `proficienciaArma` ENUM('SIMPLES', 'TATICA', 'PESADA') NULL,
    `empunhaduras` JSON NULL,
    `tipoArma` ENUM('CORPO_A_CORPO', 'A_DISTANCIA') NULL,
    `subtipoDistancia` ENUM('ARREMESSO', 'DISPARO', 'FOGO') NULL,
    `agil` BOOLEAN NOT NULL DEFAULT false,
    `dadosPorEmpunhadura` JSON NULL,
    `criticoValor` INTEGER NULL,
    `criticoMultiplicador` INTEGER NULL,
    `alcance` VARCHAR(191) NULL,
    `tipoMunicaoCodigo` VARCHAR(191) NULL,
    `habilidadeEspecial` TEXT NULL,
    `duracaoCenas` INTEGER NULL,
    `recuperavel` BOOLEAN NOT NULL DEFAULT false,
    `proficienciaProtecao` ENUM('LEVE', 'PESADA', 'ESCUDO') NULL,
    `tipoProtecao` ENUM('VESTIVEL', 'EMPUNHAVEL') NULL,
    `bonusDefesa` INTEGER NOT NULL DEFAULT 0,
    `penalidadeCarga` INTEGER NOT NULL DEFAULT 0,
    `reducoesDano` JSON NULL,
    `tipoAcessorio` ENUM('KIT_PERICIA', 'UTENSILIO', 'VESTIMENTA') NULL,
    `periciaBonificada` VARCHAR(191) NULL,
    `bonusPericia` INTEGER NOT NULL DEFAULT 0,
    `requereEmpunhar` BOOLEAN NOT NULL DEFAULT false,
    `maxVestimentas` INTEGER NOT NULL DEFAULT 0,
    `tipoExplosivo` ENUM('GRANADA_ATORDOAMENTO', 'GRANADA_FRAGMENTACAO', 'GRANADA_FUMACA', 'GRANADA_INCENDIARIA', 'MINA_ANTIPESSOAL') NULL,
    `efeito` TEXT NULL,
    `complexidadeMaldicao` ENUM('NENHUMA', 'SIMPLES', 'COMPLEXA') NOT NULL DEFAULT 'NENHUMA',
    `efeitoMaldicao` TEXT NULL,
    `requerFerramentasAmaldicoadas` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `equipamento_catalogo_codigo_key`(`codigo`),
    INDEX `equipamento_catalogo_tipo_idx`(`tipo`),
    INDEX `equipamento_catalogo_categoria_idx`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modificacao_equipamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipo` ENUM('CORPO_A_CORPO_E_DISPARO', 'ARMA_FOGO', 'MUNICAO', 'PROTECAO', 'UNIVERSAL') NOT NULL,
    `incrementoCategoria` INTEGER NOT NULL DEFAULT 1,
    `efeitosMecanicos` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `modificacao_equipamento_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamento_modificacao_aplicavel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `modificacaoId` INTEGER NOT NULL,

    UNIQUE INDEX `equipamento_modificacao_aplicavel_equipamentoId_modificacaoI_key`(`equipamentoId`, `modificacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_item_base` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemBaseId` INTEGER NOT NULL,
    `equipamentoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `equipado` BOOLEAN NOT NULL DEFAULT false,
    `nomeCustomizado` VARCHAR(191) NULL,
    `notas` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `inventario_item_base_personagemBaseId_idx`(`personagemBaseId`),
    INDEX `inventario_item_base_equipamentoId_idx`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_item_base_modificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `modificacaoId` INTEGER NOT NULL,

    UNIQUE INDEX `inventario_item_base_modificacao_itemId_modificacaoId_key`(`itemId`, `modificacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_item_campanha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personagemCampanhaId` INTEGER NOT NULL,
    `equipamentoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `equipado` BOOLEAN NOT NULL DEFAULT false,
    `nomeCustomizado` VARCHAR(191) NULL,
    `notas` TEXT NULL,
    `estado` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `inventario_item_campanha_personagemCampanhaId_idx`(`personagemCampanhaId`),
    INDEX `inventario_item_campanha_equipamentoId_idx`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_item_campanha_modificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `modificacaoId` INTEGER NOT NULL,

    UNIQUE INDEX `inventario_item_campanha_modificacao_itemId_modificacaoId_key`(`itemId`, `modificacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grau_feiticeiro_limite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestigioMin` INTEGER NOT NULL,
    `grauNome` VARCHAR(191) NOT NULL,
    `limitesPorCategoria` JSON NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grau_feiticeiro_limite_prestigioMin_key`(`prestigioMin`),
    INDEX `grau_feiticeiro_limite_prestigioMin_idx`(`prestigioMin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipamento_modificacao_aplicavel` ADD CONSTRAINT `equipamento_modificacao_aplicavel_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_modificacao_aplicavel` ADD CONSTRAINT `equipamento_modificacao_aplicavel_modificacaoId_fkey` FOREIGN KEY (`modificacaoId`) REFERENCES `modificacao_equipamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_base` ADD CONSTRAINT `inventario_item_base_personagemBaseId_fkey` FOREIGN KEY (`personagemBaseId`) REFERENCES `PersonagemBase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_base` ADD CONSTRAINT `inventario_item_base_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_base_modificacao` ADD CONSTRAINT `inventario_item_base_modificacao_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventario_item_base`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_base_modificacao` ADD CONSTRAINT `inventario_item_base_modificacao_modificacaoId_fkey` FOREIGN KEY (`modificacaoId`) REFERENCES `modificacao_equipamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_campanha` ADD CONSTRAINT `inventario_item_campanha_personagemCampanhaId_fkey` FOREIGN KEY (`personagemCampanhaId`) REFERENCES `PersonagemCampanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_campanha` ADD CONSTRAINT `inventario_item_campanha_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamento_catalogo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_campanha_modificacao` ADD CONSTRAINT `inventario_item_campanha_modificacao_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventario_item_campanha`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario_item_campanha_modificacao` ADD CONSTRAINT `inventario_item_campanha_modificacao_modificacaoId_fkey` FOREIGN KEY (`modificacaoId`) REFERENCES `modificacao_equipamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
