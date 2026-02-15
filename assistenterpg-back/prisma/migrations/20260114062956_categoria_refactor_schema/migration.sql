/*
  Warnings:

  - You are about to alter the column `categoria` on the `equipamento_catalogo` table. The data in that column will be cast from `Int` to `Enum(EnumId(4))`.
  - The values [CONSUMIVEL,VESTIVEL,GERAL] on the enum `equipamento_catalogo_tipoAmaldicoado` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `incrementoCategoria` on the `modificacao_equipamento` table. All the data in the column will be lost.

*/

-- Passo 1: Limpar dados inválidos de tipoAmaldicoado ANTES de modificar o enum
UPDATE `equipamento_catalogo` 
SET `tipoAmaldicoado` = 'ARMA' 
WHERE `tipoAmaldicoado` IN ('CONSUMIVEL', 'VESTIVEL', 'GERAL') 
  OR `tipoAmaldicoado` IS NULL;

-- Passo 2: Converter categoria de INT para ENUM usando CASE
ALTER TABLE `equipamento_catalogo` 
ADD COLUMN `categoria_temp` VARCHAR(50);

UPDATE `equipamento_catalogo` 
SET `categoria_temp` = CASE 
    WHEN `categoria` = 0 THEN 'CATEGORIA_0'
    WHEN `categoria` = 1 THEN 'CATEGORIA_1'
    WHEN `categoria` = 2 THEN 'CATEGORIA_2'
    WHEN `categoria` = 3 THEN 'CATEGORIA_3'
    WHEN `categoria` = 4 THEN 'CATEGORIA_4'
    ELSE 'CATEGORIA_0'
END;

-- Passo 3: Dropar coluna antiga e renomear a temporária
ALTER TABLE `equipamento_catalogo` 
DROP COLUMN `categoria`,
RENAME COLUMN `categoria_temp` TO `categoria`;

-- Passo 4: Modificar tipoAmaldicoado (agora sem os valores inválidos)
ALTER TABLE `equipamento_catalogo` 
MODIFY `tipoAmaldicoado` ENUM('ARMA', 'PROTECAO', 'ITEM', 'ARTEFATO') NULL;

-- Passo 5: Modificar categoria para ENUM
ALTER TABLE `equipamento_catalogo` 
MODIFY `categoria` ENUM('CATEGORIA_0', 'CATEGORIA_1', 'CATEGORIA_2', 'CATEGORIA_3', 'CATEGORIA_4', 'ESPECIAL') NOT NULL DEFAULT 'CATEGORIA_0';

-- Passo 6: Remover incrementoCategoria e adicionar incrementoEsp
/*
  Warnings:

  - You are about to alter the column `categoria` on the `equipamento_catalogo` table. The data in that column will be cast from `Int` to `Enum(EnumId(4))`.
  - The values [CONSUMIVEL,VESTIVEL,GERAL] on the enum `equipamento_catalogo_tipoAmaldicoado` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `incrementoCategoria` on the `modificacao_equipamento` table. All the data in the column will be lost.

*/

-- Passo 1: Limpar dados inválidos de tipoAmaldicoado ANTES de modificar o enum
UPDATE `equipamento_catalogo` 
SET `tipoAmaldicoado` = 'ARMA' 
WHERE `tipoAmaldicoado` IN ('CONSUMIVEL', 'VESTIVEL', 'GERAL') 
  OR `tipoAmaldicoado` IS NULL;

-- Passo 2: Converter categoria de INT para ENUM usando CASE
ALTER TABLE `equipamento_catalogo` 
ADD COLUMN `categoria_temp` VARCHAR(50);

UPDATE `equipamento_catalogo` 
SET `categoria_temp` = CASE 
    WHEN `categoria` = 0 THEN 'CATEGORIA_0'
    WHEN `categoria` = 1 THEN 'CATEGORIA_1'
    WHEN `categoria` = 2 THEN 'CATEGORIA_2'
    WHEN `categoria` = 3 THEN 'CATEGORIA_3'
    WHEN `categoria` = 4 THEN 'CATEGORIA_4'
    ELSE 'CATEGORIA_0'
END;

-- Passo 3: Dropar coluna antiga e renomear a temporária
ALTER TABLE `equipamento_catalogo` 
DROP COLUMN `categoria`,
RENAME COLUMN `categoria_temp` TO `categoria`;

-- Passo 4: Modificar tipoAmaldicoado (agora sem os valores inválidos)
ALTER TABLE `equipamento_catalogo` 
MODIFY `tipoAmaldicoado` ENUM('ARMA', 'PROTECAO', 'ITEM', 'ARTEFATO') NULL;

-- Passo 5: Modificar categoria para ENUM
ALTER TABLE `equipamento_catalogo` 
MODIFY `categoria` ENUM('CATEGORIA_0', 'CATEGORIA_1', 'CATEGORIA_2', 'CATEGORIA_3', 'CATEGORIA_4', 'ESPECIAL') NOT NULL DEFAULT 'CATEGORIA_0';

-- Passo 6: Remover incrementoCategoria e adicionar incrementoEsp
