-- CreateTable
CREATE TABLE `compendio_livros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(100) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descricao` TEXT NULL,
    `icone` VARCHAR(50) NULL,
    `cor` VARCHAR(20) NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('RASCUNHO', 'PUBLICADO', 'ARQUIVADO') NOT NULL DEFAULT 'PUBLICADO',
    `suplemento_id` INTEGER NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compendio_livros_codigo_key`(`codigo`),
    INDEX `compendio_livros_ordem_idx`(`ordem`),
    INDEX `compendio_livros_status_idx`(`status`),
    INDEX `compendio_livros_suplemento_id_idx`(`suplemento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default book for existing rows before enforcing the relation.
INSERT INTO `compendio_livros` (`codigo`, `titulo`, `descricao`, `icone`, `cor`, `ordem`, `status`, `criado_em`, `atualizado_em`)
VALUES (
    'livro-principal',
    'Livro Principal',
    'Regras principais do sistema Jujutsu Kaisen RPG.',
    'rules',
    '#7c5cfc',
    1,
    'PUBLICADO',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
);

-- AlterTable
ALTER TABLE `compendio_categorias` ADD COLUMN `livro_id` INTEGER NULL;

UPDATE `compendio_categorias`
SET `livro_id` = (SELECT `id` FROM `compendio_livros` WHERE `codigo` = 'livro-principal')
WHERE `livro_id` IS NULL;

ALTER TABLE `compendio_categorias` MODIFY `livro_id` INTEGER NOT NULL;

-- Drop old global uniqueness.
DROP INDEX `compendio_categorias_codigo_key` ON `compendio_categorias`;
DROP INDEX `compendio_subcategorias_codigo_key` ON `compendio_subcategorias`;
DROP INDEX `compendio_artigos_codigo_key` ON `compendio_artigos`;

-- Create scoped uniqueness.
CREATE UNIQUE INDEX `compendio_categorias_livro_id_codigo_key` ON `compendio_categorias`(`livro_id`, `codigo`);
CREATE INDEX `compendio_categorias_livro_id_idx` ON `compendio_categorias`(`livro_id`);
CREATE UNIQUE INDEX `compendio_subcategorias_categoria_id_codigo_key` ON `compendio_subcategorias`(`categoria_id`, `codigo`);
CREATE UNIQUE INDEX `compendio_artigos_subcategoria_id_codigo_key` ON `compendio_artigos`(`subcategoria_id`, `codigo`);

-- AddForeignKey
ALTER TABLE `compendio_livros` ADD CONSTRAINT `compendio_livros_suplemento_id_fkey` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compendio_categorias` ADD CONSTRAINT `compendio_categorias_livro_id_fkey` FOREIGN KEY (`livro_id`) REFERENCES `compendio_livros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
