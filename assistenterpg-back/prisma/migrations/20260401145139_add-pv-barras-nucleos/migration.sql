-- AlterTable
ALTER TABLE `equipamento_catalogo` MODIFY `espacos` DOUBLE NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `inventario_item_base` MODIFY `espacosCalculados` DOUBLE NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `personagembase` ADD COLUMN `habilidadesConfig` JSON NULL,
    ADD COLUMN `pvBarrasTotal` INTEGER NOT NULL DEFAULT 1,
    MODIFY `espacosInventarioBase` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `espacosInventarioExtra` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `espacosOcupados` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `personagemcampanha` ADD COLUMN `nucleoAmaldicoadoAtivo` VARCHAR(191) NULL,
    ADD COLUMN `nucleosDisponiveis` JSON NULL,
    ADD COLUMN `pvBarrasRestantes` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `pvBarrasTotal` INTEGER NOT NULL DEFAULT 1,
    MODIFY `espacosInventarioBase` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `espacosInventarioExtra` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `espacosOcupados` DOUBLE NOT NULL DEFAULT 0;
