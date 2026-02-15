-- CreateTable
CREATE TABLE `compendio_categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(100) NOT NULL,
    `nome` VARCHAR(200) NOT NULL,
    `descricao` TEXT NULL,
    `icone` VARCHAR(50) NULL,
    `cor` VARCHAR(20) NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compendio_categorias_codigo_key`(`codigo`),
    INDEX `compendio_categorias_ordem_idx`(`ordem`),
    INDEX `compendio_categorias_ativo_idx`(`ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compendio_subcategorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(100) NOT NULL,
    `nome` VARCHAR(200) NOT NULL,
    `descricao` TEXT NULL,
    `categoria_id` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compendio_subcategorias_codigo_key`(`codigo`),
    INDEX `compendio_subcategorias_categoria_id_idx`(`categoria_id`),
    INDEX `compendio_subcategorias_ordem_idx`(`ordem`),
    INDEX `compendio_subcategorias_ativo_idx`(`ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compendio_artigos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(100) NOT NULL,
    `titulo` VARCHAR(300) NOT NULL,
    `resumo` TEXT NULL,
    `conteudo` TEXT NOT NULL,
    `subcategoria_id` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `tags` JSON NULL,
    `palavras_chave` TEXT NULL,
    `nivel_dificuldade` VARCHAR(20) NULL,
    `artigos_relacionados` JSON NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `destaque` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compendio_artigos_codigo_key`(`codigo`),
    INDEX `compendio_artigos_subcategoria_id_idx`(`subcategoria_id`),
    INDEX `compendio_artigos_ordem_idx`(`ordem`),
    INDEX `compendio_artigos_ativo_idx`(`ativo`),
    INDEX `compendio_artigos_destaque_idx`(`destaque`),
    FULLTEXT INDEX `compendio_artigos_titulo_resumo_palavras_chave_idx`(`titulo`, `resumo`, `palavras_chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compendio_subcategorias` ADD CONSTRAINT `compendio_subcategorias_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `compendio_categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compendio_artigos` ADD CONSTRAINT `compendio_artigos_subcategoria_id_fkey` FOREIGN KEY (`subcategoria_id`) REFERENCES `compendio_subcategorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
