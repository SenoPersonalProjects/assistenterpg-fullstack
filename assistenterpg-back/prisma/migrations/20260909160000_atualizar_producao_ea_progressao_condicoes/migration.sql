ALTER TABLE `habilidade_tecnica`
  ADD COLUMN `escalonamentoCustoSustentacaoEA` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `escalonamentoCustoSustentacaoPE` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `mecanicasSessao` JSON NULL;

ALTER TABLE `variacao_habilidade`
  ADD COLUMN `escalonamentoCustoSustentacaoEA` INTEGER NULL,
  ADD COLUMN `escalonamentoCustoSustentacaoPE` INTEGER NULL,
  ADD COLUMN `mecanicasSessao` JSON NULL;

ALTER TABLE `Condicao`
  ADD COLUMN `codigo` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Condicao_codigo_key` ON `Condicao`(`codigo`);

ALTER TABLE `CondicaoPersonagemSessao`
  ADD COLUMN `sustentacaoHabilidadeId` INTEGER NULL;

CREATE INDEX `CondicaoPersonagemSessao_sustentacaoHabilidadeId_idx`
  ON `CondicaoPersonagemSessao`(`sustentacaoHabilidadeId`);

ALTER TABLE `CondicaoPersonagemSessao`
  ADD CONSTRAINT `CondicaoPersonagemSessao_sustentacaoHabilidadeId_fkey`
  FOREIGN KEY (`sustentacaoHabilidadeId`)
  REFERENCES `PersonagemSessaoHabilidadeSustentada`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE `Condicao`
SET `codigo` = 'CURA_ACELERADA'
WHERE `nome` = 'Cura Acelerada' AND `codigo` IS NULL;

UPDATE `Condicao`
SET `codigo` = 'PRODUCAO_ACELERADA'
WHERE `nome` = 'Produção Acelerada' AND `codigo` IS NULL;

UPDATE `PersonagemBasePericia` AS pericia
INNER JOIN `PersonagemBase` AS personagem
  ON personagem.id = pericia.personagemBaseId
INNER JOIN `GrauTreinamentoPersonagemBase` AS grau
  ON grau.personagemBaseId = pericia.personagemBaseId
INNER JOIN `Pericia` AS catalogo
  ON catalogo.id = pericia.periciaId AND catalogo.codigo = grau.periciaCodigo
SET pericia.grauTreinamento = GREATEST(0, pericia.grauTreinamento - 1)
WHERE grau.nivel = 7 AND personagem.nivel < 8;

UPDATE `GrauTreinamentoPersonagemBase`
SET `nivel` = 8
WHERE `nivel` = 7;
