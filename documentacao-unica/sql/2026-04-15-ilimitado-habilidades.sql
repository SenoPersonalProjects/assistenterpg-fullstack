-- Atualizacao da tecnica inata Ilimitado
-- Gerado a partir do seed local em 2026-04-15T04:46:51.112Z
START TRANSACTION;

-- Compatibilidade com bancos que ainda usam o codigo legado INFINITO para a tecnica Ilimitado.
UPDATE `tecnica_amaldicoada` t
SET t.`codigo` = 'ILIMITADO', t.`atualizadoEm` = NOW()
WHERE t.`codigo` = 'INFINITO'
  AND NOT EXISTS (SELECT 1 FROM `tecnica_amaldicoada` x WHERE x.`codigo` = 'ILIMITADO');

INSERT INTO `tecnica_amaldicoada` (`codigo`, `nome`, `descricao`, `tipo`, `hereditaria`, `requisitos`, `fonte`, `criadoEm`, `atualizadoEm`)
VALUES ('ILIMITADO', 'Ilimitado', 'Manipulacao do espaco atraves do conceito de infinito.', 'INATA', TRUE, CAST('{"observacao":"Tecnica inata baseada em manipulacao espacial, Lapso Azul, Reversao Vermelho, Vazio Roxo e Expansao de Dominio.","recursoOpcional":"Alguns efeitos citam os 6 Olhos; quando o usuario nao possuir esse recurso, aplique as penalidades descritas no efeito."}' AS JSON), 'SISTEMA_BASE', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `tipo` = VALUES(`tipo`),
  `hereditaria` = VALUES(`hereditaria`),
  `requisitos` = VALUES(`requisitos`),
  `fonte` = VALUES(`fonte`),
  `atualizadoEm` = NOW();

SET @tecnicaId := (SELECT `id` FROM `tecnica_amaldicoada` WHERE `codigo` = 'ILIMITADO' LIMIT 1);

-- Vinculos hereditarios com cla.
INSERT IGNORE INTO `tecnica_cla` (`tecnicaId`, `claId`)
SELECT @tecnicaId, c.`id` FROM `cla` c WHERE c.`nome` = 'Gojo' LIMIT 1;
INSERT IGNORE INTO `tecnica_cla` (`tecnicaId`, `claId`)
SELECT @tecnicaId, c.`id` FROM `cla` c WHERE c.`nome` = 'Okkotsu' LIMIT 1;

-- Remove variacoes das habilidades do Ilimitado antes de recriar de forma idempotente.
DELETE FROM `variacao_habilidade`
WHERE `habilidadeTecnicaId` IN (
  SELECT `id` FROM `habilidade_tecnica`
  WHERE `codigo` IN ('INATA_ILIMITADO_MUGEN', 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS', 'INATA_ILIMITADO_AZUL_PERSEGUIR', 'INATA_ILIMITADO_AZUL_ATRAIR', 'INATA_ILIMITADO_AZUL_ATRACAO_LEVE', 'INATA_ILIMITADO_PUNHO_AZUL', 'INATA_ILIMITADO_VERMELHO', 'INATA_ILIMITADO_VAZIO_ROXO', 'INATA_ILIMITADO_VAZIO_ROXO_IRRESTRITO', 'INATA_ILIMITADO_EXPANSAO_VAZIO_INFINITO')
);

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_MUGEN', 'Mugen', 'Invoca um campo paradoxal que desacelera tudo que entra no alcance do usuario.', NULL, 'REACAO', NULL, 'Pessoal', 'Voce', 'Instantaneo', NULL, NULL, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, 0, 0, 'OUTRO', NULL, NULL, 'Voce pode gastar sua reacao para anular um dano que sofreria de um ataque ou tecnica, contanto que esse ataque precise viajar o espaco para te atingir. O espaco infinito gerado torna o usuario inatingivel contra esse efeito especifico.', 10, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_MUGEN' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Superior', 'Mantem o campo infinito ativo para barrar ataques fisicos e tecnicas Jujutsu.', TRUE, 0, 4, 2, NULL, 'ACAO_PADRAO', NULL, 'Pessoal', 'Voce', 'Sustentado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Enquanto sustentado, voce fica inatingivel por ataques fisicos e tecnicas Jujutsu, exceto expansao de dominio, extensao de dominio e excecoes especificas no uso de tecnicas Jujutsu.', NULL, 10, NOW(), NOW());
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Maxima', 'Condensa o infinito ao redor do usuario em alcance corpo a corpo.', TRUE, 2, 4, 2, NULL, 'ACAO_PADRAO', NULL, 'Corpo a corpo (1,5m)', 'Voce', 'Sustentado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Enquanto sustentado, funciona em alcance corpo a corpo, impedindo qualquer coisa de chegar a 1,5m de voce. Aumenta a efetividade do Mugen contra extensoes de dominio e tecnicas Jujutsu, mas nao impede o acerto garantido de uma expansao de dominio.', NULL, 20, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS', 'Esferas do Lapso da Tecnica Amaldicoada: Azul', 'Cria e sustenta uma esfera condensada de Azul, representando espaco negativo.', NULL, 'ACAO_MOVIMENTO', NULL, 'Curto', '1 esfera do Azul', 'Sustentado', NULL, NULL, 0, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, 0, 0, 'OUTRO', NULL, NULL, 'Cria e sustenta a esfera do Azul condensado. Uma vez por turno, voce pode mover a esfera como acao livre dentro do alcance curto. Apos usar uma das variacoes possiveis da esfera, ela desaparece, exceto quando o efeito disser o contrario.', 20, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Liberacao Superior', 'Cria multiplas esferas de Azul para controle espacial avancado.', FALSE, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pode criar mais de uma esfera, ate o valor do atributo de calculo de energia amaldicoada (INT). O custo efetivo e 1 EA por esfera + 2 EA. Voce pode mover todas juntas para o mesmo lugar como acao livre, ou individualmente; cada esfera movida separadamente custa uma acao livre, e a partir da segunda tambem custa uma acao de movimento.', CAST('{"graus":[{"valorMinimo":2,"tipoGrauCodigo":"TECNICA_AMALDICOADA"}]}' AS JSON), 10, NOW(), NOW());
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Liberacao Maxima', 'Cria uma unica esfera massiva do Azul com tamanho 2x2 quadrados.', TRUE, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cria uma esfera massiva de 2x2 quadrados (3x3m). Muda o funcionamento das tecnicas que consomem a esfera conforme a Liberacao Maxima de cada uma.', CAST('{"graus":[{"valorMinimo":2,"tipoGrauCodigo":"TECNICA_AMALDICOADA"}]}' AS JSON), 20, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_AZUL_PERSEGUIR', 'Azul - Perseguir', 'Usa uma esfera do Azul para perseguir um alvo e puxar violentamente materia em sua direcao.', CAST('{"requerSustentacao":"INATA_ILIMITADO_LAPSO_AZUL_ESFERAS"}' AS JSON), 'ACAO_PADRAO', NULL, 'Curto', 'Ser ou objeto', 'Instantaneo', 'Reflexos anula', NULL, 0, 1, NULL, NULL, CAST('["Pontaria com Jujutsu"]' AS JSON), NULL, NULL, NULL, NULL, CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'DANO', CAST('{"porAcumulo":"+1d6 de dano de Energia Amaldicoada por +1 EA"}' AS JSON), CAST('{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'Cria um vacuo onde o proprio mundo e forcado a corrigir o espaco negativo. A esfera persegue um alvo no alcance da tecnica, causando 1d6 de dano de Energia Amaldicoada e deixando-o FRACO por 1 rodada. A resistencia anula a condicao. O custo e 1 EA por esfera usada.', 30, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_AZUL_PERSEGUIR' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Com Liberacao Maxima', 'A esfera massiva puxa e esmaga tudo em uma linha reta.', TRUE, NULL, 3, NULL, NULL, 'ACAO_COMPLETA', 'LINHA', 'Curto, linha de 3m de largura', 'Seres na reta', 'Instantaneo', 'Fortitude', NULL, NULL, NULL, 4, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":2}]' AS JSON), TRUE, 1, NULL, 'DANO', NULL, CAST('{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'A massa puxa e esmaga tudo para dentro de si, causando 4 + 2d6 de dano a todos os seres e objetos pegos e deixando-os DEBILITADOS por 1 rodada; resistencia reduz para FRACOS. A esfera nao desaparece apos o efeito, torna 6m ao redor TERRENO DIFICIL, nao pode ser movida como as outras e vira OBJETO ESTACIONARIO. Para desaparecer, basta parar de sustentar. Requisito para Vazio Roxo Irrestrito.', CAST('{"requerVariacao":"Liberacao Maxima"}' AS JSON), 10, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_AZUL_ATRAIR', 'Azul - Atrair', 'Faz a esfera do Azul atrair tudo ao redor do ponto onde foi posicionada.', CAST('{"requerSustentacao":"INATA_ILIMITADO_LAPSO_AZUL_ESFERAS"}' AS JSON), 'ACAO_PADRAO', 'ESFERA', 'Ponto da esfera em alcance curto', 'Seres ou objetos na area', 'Instantaneo', 'Reflexos', NULL, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":2}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'DANO', CAST('{"porAcumulo":"+1d6 de dano de Energia Amaldicoada por +1 EA"}' AS JSON), CAST('{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'Atrai tudo dentro de um circulo de 6m de raio ao redor da esfera, causando 2d6 de dano em todos os seres e objetos na area e deixando-os ENREDADOS por 1 rodada. A resistencia evita a condicao.', 40, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_AZUL_ATRAIR' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Com Liberacao Maxima', 'A massa maxima do Azul puxa e esmaga tudo dentro da area.', TRUE, NULL, 5, NULL, NULL, 'ACAO_PADRAO', 'ESFERA', 'Ponto da esfera em alcance curto', 'Seres ou objetos na area', 'Instantaneo', 'Fortitude', NULL, NULL, NULL, 4, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":4}]' AS JSON), TRUE, 1, NULL, 'DANO', NULL, CAST('{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'A massa puxa e esmaga tudo em um raio de 6m, causando 4 + 4d6 de dano e deixando os alvos ENREDADOS por 2 rodadas; a resistencia evita a condicao. A esfera nao desaparece apos o efeito, torna 6m ao redor TERRENO DIFICIL, pode ser movida como as outras e vira OBJETO ESTACIONARIO. Para desaparecer, basta parar de sustentar. Requisito para Vazio Roxo Irrestrito.', CAST('{"requerVariacao":"Liberacao Maxima"}' AS JSON), 10, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_AZUL_ATRACAO_LEVE', 'Azul - Atracao Leve', 'Usa a esfera do Azul para prender alvos sem causar dano direto.', CAST('{"requerSustentacao":"INATA_ILIMITADO_LAPSO_AZUL_ESFERAS"}' AS JSON), 'ACAO_PADRAO', 'ESFERA', 'Ponto da esfera em alcance curto', 'Seres ou objetos na area', 'Instantaneo', 'Reflexos', 'DT de tecnicas + 5', 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'REGRAS', CAST('{"porAcumulo":"+1d6 na DT para evitar a condicao por +1 EA"}' AS JSON), NULL, 'Atrai tudo dentro de um circulo de 6m de raio sem causar dano, deixando os alvos ENREDADOS por 1d3 rodadas. A resistencia evita a condicao. Pode adicionar +1d6 na DT para evitar a condicao para cada +1 EA gasto, ate o limite do Grau de Aprimoramento em Tecnica Amaldicoada.', 50, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_AZUL_ATRACAO_LEVE' LIMIT 1);

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_PUNHO_AZUL', 'Variacao do Lapso: Punho Azul (Ao-Ken)', 'Aplica o conceito de espaco negativo milimetricamente a frente dos punhos.', CAST('{"requerHabilidade":"INATA_ILIMITADO_LAPSO_AZUL_ESFERAS"}' AS JSON), 'AO_ATACAR', NULL, 'Toque', '1 ser atingido', 'Instantaneo', NULL, NULL, 0, 1, NULL, NULL, CAST('["Luta"]' AS JSON), NULL, NULL, NULL, NULL, CAST('[{"dado":"d6","tipo":"Tipo do ataque","quantidade":1}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'DANO', CAST('{"porAcumulo":"+1d6 de dano do tipo do ataque por +1 EA"}' AS JSON), CAST('{"dado":"d6","tipo":"Tipo do ataque","quantidade":1}' AS JSON), 'O vacuo criado puxa o alvo violentamente em direcao ao golpe no momento do impacto, adicionando +1d6 de dano do tipo do seu ataque. O ataque recebe a propriedade Impacto: se acertar, voce pode fazer a manobra Derrubar como acao livre usando seu teste de ataque como teste da manobra.', 60, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_PUNHO_AZUL' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Superior', 'Intensifica a atracao para garantir precisao letal.', TRUE, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST('[{"dado":"d6","tipo":"Tipo do ataque","quantidade":2}]' AS JSON), NULL, NULL, NULL, NULL, NULL, NULL, 'O vacuo impede que o inimigo se esquive corretamente. Voce recebe +2 no teste de ataque e muda o bonus para +2d6 de dano do tipo do seu ataque.', NULL, 10, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_VERMELHO', 'Reversao de Tecnica Amaldicoada: Vermelho', 'Reverte o Azul com energia reversa, criando uma forca repulsiva extremamente poderosa.', CAST('{"graus":[{"valorMinimo":1,"tipoGrauCodigo":"TECNICA_REVERSA"}],"requerTecnicaNaoInata":"NAOINATA_TECNICA_REVERSA"}' AS JSON), 'ACAO_PADRAO', 'LINHA', 'Linha reta de 18m', 'Seres na linha reta', 'Instantaneo', 'Fortitude reduz metade', NULL, 0, 4, NULL, NULL, CAST('["Pontaria com Jujutsu"]' AS JSON), NULL, NULL, 4, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":2}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'DANO', CAST('{"porAcumulo":"+1d6 de dano de Energia Amaldicoada por +1 EA"}' AS JSON), CAST('{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'Apenas o primeiro ser na reta recebe o dano completo; os demais recebem metade. Alvos acertados recebem 4 + 2d6 de dano de Energia Amaldicoada e sao empurrados pelo deslocamento restante do raio. Se colidirem com objeto estacionario, recebem 1d6 de dano por quadrado deslocado, ate 6d6. Fortitude evita ser empurrado.', 70, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_VERMELHO' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Liberacao Superior', 'Amplifica o Vermelho para uma repulsao ainda mais devastadora.', TRUE, 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d6","tipo":"ENERGIA_AMALDICOADA","quantidade":4}]' AS JSON), NULL, NULL, NULL, NULL, NULL, NULL, 'Amplifica o dano para 4 + 4d6 e remove o limite de dano de colisao com objeto estacionario. Falhar no teste de resistencia tambem deixa o alvo CAIDO e DESPREVENIDO por 1 rodada.', NULL, 10, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_VAZIO_ROXO', 'Convergencia de Tecnica Amaldicoada: Vazio Roxo', 'Combina Azul e Vermelho em uma massa imaginaria que oblitera tudo em linha reta.', CAST('{"graus":[{"valorMinimo":3,"tipoGrauCodigo":"TECNICA_AMALDICOADA"},{"valorMinimo":1,"tipoGrauCodigo":"TECNICA_REVERSA"}],"requerHabilidades":["INATA_ILIMITADO_LAPSO_AZUL_ESFERAS","INATA_ILIMITADO_VERMELHO"]}' AS JSON), 'RITUAL_ETAPAS', 'LINHA', 'Longo', 'Linha reta de 3m de largura', 'Instantaneo', 'Reflexos', NULL, 2, 8, NULL, NULL, CAST('["Pontaria com Jujutsu"]' AS JSON), NULL, NULL, 10, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":6}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 1, 0, 'DANO', CAST('{"porAcumulo":"+1d12 de dano de Energia Amaldicoada por +1 EA"}' AS JSON), CAST('{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'Exige 2 acoes padroes. Causa 6d12 + 10 de dano em uma linha reta de 3m de largura. Apos usar o Vazio Roxo sem possuir os 6 Olhos, o usuario fica FATIGADO ate o fim da cena. Se ficar inconsciente por usar a tecnica, fica FATIGADO ate o proximo descanso confortavel.', 80, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_VAZIO_ROXO' LIMIT 1);
INSERT INTO `variacao_habilidade` (`habilidadeTecnicaId`, `nome`, `descricao`, `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@habilidadeId, 'Superior', 'Aumenta a intensidade e a espessura do Vazio Roxo.', TRUE, 4, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":10}]' AS JSON), TRUE, 1, NULL, 'DANO', NULL, CAST('{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'Adiciona mais 1 quadrado na espessura da linha reta, +4d12 de dano e +5 no teste. E acumulativo ate o limite do Grau de Aprimoramento em Tecnica Amaldicoada. Sem possuir os 6 Olhos, usar esta versao deixa o usuario EXAUSTO ate o fim da cena.', NULL, 10, NOW(), NOW());

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_VAZIO_ROXO_IRRESTRITO', 'Variacao: Vazio Roxo Irrestrito', 'Ritual de detonacao remota que colide um Azul maximo ativo com um Vermelho superior.', CAST('{"graus":[{"valorMinimo":3,"tipoGrauCodigo":"TECNICA_AMALDICOADA"},{"valorMinimo":1,"tipoGrauCodigo":"TECNICA_REVERSA"}],"ritual":"Acao 1: lancar uma variacao com Liberacao Maxima do Azul. Acao 2: lancar a Liberacao Superior do Vermelho atingindo a Esfera Maxima do Azul. Acao 3: detonar a colisao como acao livre por 3 EA e 1 PE.","requerHabilidades":["INATA_ILIMITADO_AZUL_PERSEGUIR","INATA_ILIMITADO_AZUL_ATRAIR","INATA_ILIMITADO_VERMELHO"]}' AS JSON), 'RITUAL_ETAPAS', 'ESFERA', 'Explosao de 12m de raio', 'Seres e objetos na area', 'Instantaneo', 'Reflexos reduz metade', 'DT de tecnicas + 5', 1, 3, NULL, NULL, NULL, NULL, NULL, 12, 'ENERGIA_AMALDICOADA', CAST('[{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":7}]' AS JSON), TRUE, 'TECNICA_AMALDICOADA', 2, 0, 'DANO', CAST('{"porAcumulo":"+1d12 de dano de Energia Amaldicoada por +2 EA"}' AS JSON), CAST('{"dado":"d12","tipo":"ENERGIA_AMALDICOADA","quantidade":1}' AS JSON), 'O custo total e o custo do Azul + custo do Vermelho + 3 EA e 1 PE do encantamento final. Detona a colisao entre um Azul e um Vermelho ativos para criar uma explosao omnidirecional de 12m de raio, causando 7d12 + 12 de dano. O usuario recebe metade do dano total por padrao; se passar no teste de Reflexos, tambem reduz esse dano pela metade. Seres que falham recebem dano total e ficam DEBILITADOS; se passarem, recebem metade e ficam FRACOS.', 90, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_VAZIO_ROXO_IRRESTRITO' LIMIT 1);

INSERT INTO `habilidade_tecnica` (`tecnicaId`, `codigo`, `nome`, `descricao`, `requisitos`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeito`, `ordem`, `criadoEm`, `atualizadoEm`)
VALUES (@tecnicaId, 'INATA_ILIMITADO_EXPANSAO_VAZIO_INFINITO', 'Expansao de Dominio: Vazio Infinito', 'Dominio letal e restritivo que forca os alvos a processarem informacao infinita.', CAST('{"mudra":"O dedo medio da mao direita cruza sobre o indicador (Dedo de Indra).","tipoDominio":"Letal / Restritivo"}' AS JSON), 'ACAO_COMPLETA', 'ESFERA', 'Raio de 10m (barreira fechada)', 'Todos os seres dentro da area, exceto o usuario e quem ele estiver tocando fisicamente', 'Sustentado', 'Sem resistencia inicial; defesa apenas por tecnica anti-barreira no momento da ativacao', NULL, 4, 16, 2, NULL, NULL, NULL, NULL, NULL, NULL, CAST('[{"dado":"d8","tipo":"MENTAL","quantidade":2}]' AS JSON), FALSE, NULL, 0, 0, 'OUTRO', NULL, NULL, 'O ambiente e substituido por um vacuo negro e branco preenchido por linhas de luz que representam o fluxo de informacao do universo. Como acerto garantido, inimigos dentro do dominio ficam ATORDOADOS e IMOVEIS, sem acoes, reacoes ou movimento. No inicio de cada turno de um inimigo dentro do dominio, ele sofre 2d8 de dano Mental/Sanidade; se for uma maldicao ou inimigo sem SANIDADE, recebe 2d6 de dano Jujutsu.', 100, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `tecnicaId` = @tecnicaId,
  `nome` = VALUES(`nome`),
  `descricao` = VALUES(`descricao`),
  `requisitos` = VALUES(`requisitos`),
  `execucao` = VALUES(`execucao`),
  `area` = VALUES(`area`),
  `alcance` = VALUES(`alcance`),
  `alvo` = VALUES(`alvo`),
  `duracao` = VALUES(`duracao`),
  `resistencia` = VALUES(`resistencia`),
  `dtResistencia` = VALUES(`dtResistencia`),
  `custoPE` = VALUES(`custoPE`),
  `custoEA` = VALUES(`custoEA`),
  `custoSustentacaoEA` = VALUES(`custoSustentacaoEA`),
  `custoSustentacaoPE` = VALUES(`custoSustentacaoPE`),
  `testesExigidos` = VALUES(`testesExigidos`),
  `criticoValor` = VALUES(`criticoValor`),
  `criticoMultiplicador` = VALUES(`criticoMultiplicador`),
  `danoFlat` = VALUES(`danoFlat`),
  `danoFlatTipo` = VALUES(`danoFlatTipo`),
  `dadosDano` = VALUES(`dadosDano`),
  `escalonaPorGrau` = VALUES(`escalonaPorGrau`),
  `grauTipoGrauCodigo` = VALUES(`grauTipoGrauCodigo`),
  `escalonamentoCustoEA` = VALUES(`escalonamentoCustoEA`),
  `escalonamentoCustoPE` = VALUES(`escalonamentoCustoPE`),
  `escalonamentoTipo` = VALUES(`escalonamentoTipo`),
  `escalonamentoEfeito` = VALUES(`escalonamentoEfeito`),
  `escalonamentoDano` = VALUES(`escalonamentoDano`),
  `efeito` = VALUES(`efeito`),
  `ordem` = VALUES(`ordem`),
  `atualizadoEm` = NOW();

SET @habilidadeId := (SELECT `id` FROM `habilidade_tecnica` WHERE `codigo` = 'INATA_ILIMITADO_EXPANSAO_VAZIO_INFINITO' LIMIT 1);

-- Opcional: remocao de habilidades antigas do Ilimitado que nao estejam nesta versao.
-- DELETE FROM `habilidade_tecnica`
-- WHERE `tecnicaId` = @tecnicaId
--   AND `codigo` NOT IN ('INATA_ILIMITADO_MUGEN', 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS', 'INATA_ILIMITADO_AZUL_PERSEGUIR', 'INATA_ILIMITADO_AZUL_ATRAIR', 'INATA_ILIMITADO_AZUL_ATRACAO_LEVE', 'INATA_ILIMITADO_PUNHO_AZUL', 'INATA_ILIMITADO_VERMELHO', 'INATA_ILIMITADO_VAZIO_ROXO', 'INATA_ILIMITADO_VAZIO_ROXO_IRRESTRITO', 'INATA_ILIMITADO_EXPANSAO_VAZIO_INFINITO');

COMMIT;
