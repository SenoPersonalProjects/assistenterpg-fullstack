// src/common/exceptions/personagem.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';

// ============================================================================
// PERSONAGEM - GERAL
// ============================================================================

export class PersonagemBaseNaoEncontradoException extends BaseException {
  constructor(personagemBaseId?: number) {
    super(
      'Personagem-base não encontrado',
      HttpStatus.NOT_FOUND,
      'PERSONAGEM_BASE_NOT_FOUND',
      { personagemBaseId },
    );
  }
}

export class ErroAtualizacaoPersonagemException extends BusinessException {
  constructor(details?: Record<string, unknown>) {
    super(
      'Falha ao atualizar personagem-base',
      'UPDATE_PERSONAGEM_FAILED',
      details,
    );
  }
}

// ============================================================================
// ATRIBUTOS
// ============================================================================

export class AtributoNaoInteiroException extends ValidationException {
  constructor(nomeAtributo: string, valor: unknown) {
    super(
      `O atributo "${nomeAtributo}" deve ser um número inteiro`,
      nomeAtributo,
      { valorRecebido: valor, tipoEsperado: 'integer' },
      'ATTRIBUTE_NOT_INTEGER',
    );
  }
}

export class AtributoForaDoLimiteException extends ValidationException {
  constructor(nomeAtributo: string, valor: number) {
    super(
      `O atributo "${nomeAtributo}" deve estar entre 0 e 7`,
      nomeAtributo,
      { min: 0, max: 7, valorRecebido: valor },
      'ATTRIBUTE_OUT_OF_RANGE',
    );
  }
}

export class SomatorioAtributosInvalidoException extends ValidationException {
  constructor(nivel: number, somaAtual: number, somaEsperada: number) {
    super(
      `Soma de atributos inválida (${somaAtual}). Para nível ${nivel}, a soma deve ser ${somaEsperada}`,
      'atributos',
      { nivel, somaAtual, somaEsperada },
      'INVALID_ATTRIBUTE_SUM',
    );
  }
}

export class AtributoChaveEaInvalidoException extends ValidationException {
  constructor(valor: unknown, valoresValidos: string[]) {
    super(
      `O atributo-chave de Energia Amaldiçoada deve ser INT ou PRE`,
      'atributoChaveEa',
      { valorRecebido: valor, valoresValidos },
      'INVALID_EA_KEY_ATTRIBUTE',
    );
  }
}

// ============================================================================
// PASSIVAS DE ATRIBUTOS
// ============================================================================

export class PassivasExcedemLimiteException extends BusinessException {
  constructor(quantidadeEscolhida: number, elegiveis: string[]) {
    super(
      'Você deve escolher no máximo 2 atributos para passivas',
      'TOO_MANY_PASSIVES',
      { quantidadeEscolhida, maximo: 2, elegiveis },
    );
  }
}

export class PassivasNaoElegiveisException extends BusinessException {
  constructor(escolhidos: string[], elegiveis: string[]) {
    super(
      'Você selecionou atributos que não estão elegíveis (precisam ter valor >= 3)',
      'INELIGIBLE_PASSIVES',
      { escolhidos, elegiveis },
    );
  }
}

export class PassivasEscolhaNecessariaException extends BusinessException {
  constructor(elegiveis: string[]) {
    super(
      'Selecione exatamente 2 atributos para ativar passivas (há mais de 2 atributos elegíveis)',
      'PASSIVES_CHOICE_REQUIRED',
      { elegiveis, quantidadeNecessaria: 2 },
    );
  }
}

export class CatalogoPassivasInconsisteException extends BaseException {
  constructor() {
    super(
      'Catálogo de passivas inconsistente (faltam passivas I/II para algum atributo)',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'PASSIVES_CATALOG_INCONSISTENT',
    );
  }
}

export class PassivaRequisitoNaoAtendidoException extends BusinessException {
  constructor(
    passivaName: string,
    atributo: string,
    requisito: number,
    valorAtual: number,
  ) {
    super(
      `Passiva "${passivaName}" requer ${atributo} >= ${requisito}, mas você tem ${valorAtual}`,
      'PASSIVE_REQUIREMENT_NOT_MET',
      { passiva: passivaName, atributo, requisito, valorAtual },
    );
  }
}

export class PassivasDuplicadasException extends BusinessException {
  constructor(atributo: string, quantidade: number) {
    super(
      `Você selecionou passivas duplicadas para ${atributo}`,
      'DUPLICATE_PASSIVES',
      { atributo, quantidadeSelecionada: quantidade },
    );
  }
}

export class PassivasLimiteAtributoExcedidoException extends BusinessException {
  constructor(quantidade: number, atributosComPassivas: string[]) {
    super(
      `Você pode ter passivas em no máximo 2 atributos diferentes`,
      'TOO_MANY_PASSIVE_ATTRIBUTES',
      {
        maximo: 2,
        quantidadeSelecionada: quantidade,
        atributos: atributosComPassivas,
      },
    );
  }
}

export class PassivaInexistenteException extends BaseException {
  constructor() {
    super(
      'Uma ou mais passivas selecionadas não existem',
      HttpStatus.NOT_FOUND,
      'PASSIVE_NOT_FOUND',
    );
  }
}

export class PassivasIntelectoConfigInvalidaException extends BusinessException {
  constructor(codigoPassiva: 'INT_I' | 'INT_II', maxTotal: number) {
    super(
      `Configuração inválida de ${codigoPassiva}: máximo ${maxTotal} entre perícias e proficiências`,
      'INTELLECT_PASSIVE_CONFIG_INVALID',
      { passiva: codigoPassiva, maximoTotal: maxTotal },
    );
  }
}

export class PassivaIntelectoPericiaInexistenteException extends BusinessException {
  constructor(codigoPassiva: string, periciaCodigo: string) {
    super(
      `Perícia configurada em ${codigoPassiva} não encontrada: ${periciaCodigo}`,
      'INTELLECT_PASSIVE_SKILL_NOT_FOUND',
      { passiva: codigoPassiva, periciaCodigo },
    );
  }
}

export class PassivaIntelectoTreinoNecessarioException extends BusinessException {
  constructor(codigoPassiva: string) {
    super(
      `${codigoPassiva} requer uma perícia para +1 grau de treinamento`,
      'INTELLECT_PASSIVE_TRAINING_REQUIRED',
      { passiva: codigoPassiva },
    );
  }
}

export class PassivaIntelectoGrauExcedeMaximoException extends BusinessException {
  constructor(tipoGrauCodigo: string, valorFinal: number, maximo: number) {
    super(
      `Intelecto II deixaria o grau de "${tipoGrauCodigo}" em ${valorFinal}, acima do máximo permitido (${maximo})`,
      'INTELLECT_PASSIVE_GRADE_EXCEEDS_MAX',
      { tipoGrauCodigo, valorFinal, maximo },
    );
  }
}

// ============================================================================
// DERIVADOS
// ============================================================================

export class ClasseNaoEncontradaException extends BaseException {
  constructor(classeId?: number) {
    super('Classe não encontrada', HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND', {
      classeId,
    });
  }
}

export class ValoresClasseNaoDefinidosException extends BusinessException {
  constructor(classeNome: string) {
    super(
      `Valores não definidos para a classe ${classeNome}`,
      'CLASS_VALUES_NOT_DEFINED',
      { classe: classeNome },
    );
  }
}

// ============================================================================
// GRAUS DE APRIMORAMENTO
// ============================================================================

export class GrauAprimoramentoNaoInteiroException extends ValidationException {
  constructor(tipoGrauCodigo: string, valor: unknown) {
    super(
      `Valor inválido para grau de aprimoramento em "${tipoGrauCodigo}" (deve ser inteiro)`,
      `grausAprimoramento.${tipoGrauCodigo}`,
      { valorRecebido: valor, tipoEsperado: 'integer' },
      'GRADE_NOT_INTEGER',
    );
  }
}

export class GrauAprimoramentoForaDoLimiteException extends ValidationException {
  constructor(tipoGrauCodigo: string, valor: number) {
    super(
      `Valor inválido para grau de aprimoramento em "${tipoGrauCodigo}" (deve estar entre 0 e 5)`,
      `grausAprimoramento.${tipoGrauCodigo}`,
      { min: 0, max: 5, valorRecebido: valor },
      'GRADE_OUT_OF_RANGE',
    );
  }
}

export class GrauAprimoramentoExcedeMaximoComBonusException extends BusinessException {
  constructor(
    tipoGrauCodigo: string,
    valorFinal: number,
    bonusHabilidades: number,
  ) {
    super(
      `Grau de "${tipoGrauCodigo}" ficaria acima de 5 (${valorFinal}) com os bônus de habilidades. ` +
        `Reduza seus graus livres neste tipo para no máximo ${5 - bonusHabilidades}`,
      'GRADE_EXCEEDS_MAX_WITH_BONUS',
      { tipoGrauCodigo, valorFinal, bonusHabilidades, maximo: 5 },
    );
  }
}

export class GrauAprimoramentoExcedeMaximoComPoderesException extends BusinessException {
  constructor(
    tipoGrauCodigo: string,
    valorFinal: number,
    bonusPoderes: number,
  ) {
    super(
      `Grau de "${tipoGrauCodigo}" ficaria acima de 5 (${valorFinal}) com os bônus de poderes genéricos. ` +
        `Reduza seus graus livres neste tipo para no máximo ${5 - bonusPoderes}`,
      'GRADE_EXCEEDS_MAX_WITH_POWERS',
      { tipoGrauCodigo, valorFinal, bonusPoderes, maximo: 5 },
    );
  }
}

// ============================================================================
// GRAUS DE TREINAMENTO
// ============================================================================

export class GrauTreinamentoNivelInvalidoException extends BusinessException {
  constructor(nivel: number, niveisValidos: number[]) {
    super(
      `Nível ${nivel} não concede grau de treinamento ou personagem não alcançou esse nível`,
      'TRAINING_LEVEL_INVALID',
      { nivelInformado: nivel, niveisValidos },
    );
  }
}

export class GrauTreinamentoExcedeMelhoriasException extends BusinessException {
  constructor(
    nivel: number,
    quantidadeInformada: number,
    maximo: number,
    intelecto: number,
  ) {
    super(
      `No nível ${nivel}, você pode fazer no máximo ${maximo} melhorias (2 + INT ${intelecto})`,
      'TRAINING_EXCEEDS_IMPROVEMENTS',
      { nivel, quantidadeInformada, maximo, intelecto },
    );
  }
}

export class GrauTreinamentoPericiaInexistenteException extends BaseException {
  constructor(periciaCodigo: string) {
    super(
      `Perícia "${periciaCodigo}" não encontrada`,
      HttpStatus.NOT_FOUND,
      'TRAINING_SKILL_NOT_FOUND',
      { periciaCodigo },
    );
  }
}

export class GrauTreinamentoPericiaDestreinadaException extends BusinessException {
  constructor(periciaCodigo: string) {
    super(
      `Perícia "${periciaCodigo}" precisa estar treinada para receber melhoria de grau de treinamento`,
      'TRAINING_SKILL_UNTRAINED',
      { periciaCodigo },
    );
  }
}

export class GrauTreinamentoProgressaoInvalidaException extends BusinessException {
  constructor(periciaCodigo: string, grauAnterior: number, grauNovo: number) {
    super(
      `Melhoria inválida para "${periciaCodigo}": de ${grauAnterior} para ${grauNovo}. Deve aumentar em +5`,
      'TRAINING_INVALID_PROGRESSION',
      { periciaCodigo, grauAnterior, grauNovo, incrementoEsperado: 5 },
    );
  }
}

export class GrauTreinamentoNivelMinimoException extends BusinessException {
  constructor(
    tipoGrau: 'Graduado' | 'Veterano' | 'Expert',
    grau: number,
    nivelMinimo: number,
  ) {
    super(
      `${tipoGrau} (${grau}) só pode ser alcançado a partir do nível ${nivelMinimo}`,
      'TRAINING_LEVEL_REQUIREMENT',
      { tipoGrau, grau, nivelMinimo },
    );
  }
}

// ============================================================================
// ORIGEM / CLÃ / TÉCNICA
// ============================================================================

export class ClaOuOrigemNaoEncontradoException extends BaseException {
  constructor(tipo: 'Clã' | 'Origem', id?: number) {
    super(
      `${tipo} não encontrado`,
      HttpStatus.NOT_FOUND,
      tipo === 'Clã' ? 'CLAN_NOT_FOUND' : 'ORIGIN_NOT_FOUND',
      { tipo, id },
    );
  }
}

export class OrigemRequerGrandeClaException extends BusinessException {
  constructor(origemNome?: string) {
    super(
      'Esta origem só pode ser escolhida por membros de um dos três grandes clãs',
      'ORIGIN_REQUIRES_GREAT_CLAN',
      { origem: origemNome },
    );
  }
}

export class TecnicaInataNaoEncontradaException extends BusinessException {
  constructor(tecnicaInataId?: number) {
    super(
      'Técnica inata selecionada é inválida',
      'INNATE_TECHNIQUE_NOT_FOUND',
      { tecnicaInataId },
    );
  }
}

export class TecnicaInataTipoInvalidoException extends BusinessException {
  constructor() {
    super(
      'A técnica inata precisa ser uma técnica amaldiçoada do tipo INATA',
      'INNATE_TECHNIQUE_INVALID_TYPE',
    );
  }
}

export class OrigemRequerTecnicaHereditariaException extends BusinessException {
  constructor(origemNome?: string) {
    super(
      'Esta origem exige uma técnica inata hereditária do seu clã',
      'ORIGIN_REQUIRES_HEREDITARY_TECHNIQUE',
      { origem: origemNome },
    );
  }
}

export class OrigemBloqueiaTecnicaHereditariaException extends BusinessException {
  constructor(origemNome?: string) {
    super(
      'Esta origem não pode receber técnica inata hereditária',
      'ORIGIN_BLOCKS_HEREDITARY_TECHNIQUE',
      { origem: origemNome },
    );
  }
}

export class TecnicaHereditariaIncompativelException extends BusinessException {
  constructor(claNome: string) {
    super(
      `Esta técnica hereditária não está disponível para o clã ${claNome}`,
      'HEREDITARY_TECHNIQUE_INCOMPATIBLE',
      { cla: claNome },
    );
  }
}

// ============================================================================
// PERÍCIAS
// ============================================================================

export class PericiaNaoEncontradaException extends BusinessException {
  constructor(periciaCodigo: string) {
    super(
      `Perícia com código "${periciaCodigo}" não encontrada`,
      'SKILL_NOT_FOUND',
      { periciaCodigo },
    );
  }
}

export class OrigemPericiaSemGrupoException extends BusinessException {
  constructor(origemPericiaId: number) {
    super(
      `OrigemPericia ${origemPericiaId} é do tipo ESCOLHA, mas está sem grupoEscolha`,
      'ORIGIN_SKILL_MISSING_GROUP',
      { origemPericiaId },
    );
  }
}

export class OrigemPericiaGrupoInvalidoException extends BusinessException {
  constructor(grupo: number, opcoes: string[]) {
    super(
      `Grupo de perícia da origem (grupo ${grupo}) deve ter exatamente 1 escolha válida`,
      'ORIGIN_SKILL_GROUP_INVALID',
      { grupo, opcoes },
    );
  }
}

export class OrigemPericiaEscolhaInvalidaException extends BusinessException {
  constructor(periciaCodigo: string) {
    super(
      `Perícia de origem escolhida "${periciaCodigo}" não pertence à lista de escolhas da origem`,
      'ORIGIN_SKILL_CHOICE_INVALID',
      { periciaCodigo },
    );
  }
}

export class ClassePericiaSemGrupoException extends BusinessException {
  constructor(classePericiaId: number) {
    super(
      `ClassePericia ${classePericiaId} é do tipo ESCOLHA, mas está sem grupoEscolha`,
      'CLASS_SKILL_MISSING_GROUP',
      { classePericiaId },
    );
  }
}

export class ClassePericiaGrupoInvalidoException extends BusinessException {
  constructor(grupo: number, opcoes: string[]) {
    super(
      `Grupo de perícia da classe (grupo ${grupo}) deve ter exatamente 1 escolha válida`,
      'CLASS_SKILL_GROUP_INVALID',
      { grupo, opcoes },
    );
  }
}

export class ClassePericiaEscolhaInvalidaException extends BusinessException {
  constructor(periciaCodigo: string) {
    super(
      `Perícia de classe escolhida "${periciaCodigo}" não pertence à lista de escolhas da classe`,
      'CLASS_SKILL_CHOICE_INVALID',
      { periciaCodigo },
    );
  }
}

export class PericiaJujutsuNaoEncontradaException extends BaseException {
  constructor() {
    super(
      'Perícia Jujutsu não encontrada no sistema',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'JUJUTSU_SKILL_NOT_FOUND',
    );
  }
}

// ============================================================================
// PODERES GENÉRICOS
// ============================================================================

export class PoderesGenericosExcedemSlotsException extends BusinessException {
  constructor(
    nivel: number,
    slotsDisponiveis: number,
    quantidadeSelecionada: number,
  ) {
    super(
      `Nível ${nivel} permite no máximo ${slotsDisponiveis} poderes genéricos, mas ${quantidadeSelecionada} foram selecionados`,
      'POWERS_EXCEED_SLOTS',
      { nivel, slotsDisponiveis, quantidadeSelecionada },
    );
  }
}

export class PoderesGenericosNaoEncontradosException extends BaseException {
  constructor() {
    super(
      'Um ou mais poderes genéricos não foram encontrados',
      HttpStatus.NOT_FOUND,
      'POWERS_NOT_FOUND',
    );
  }
}

export class PoderGenericoNaoRepetivelException extends BusinessException {
  constructor(poderNome: string) {
    super(
      `O poder "${poderNome}" não pode ser escolhido mais de uma vez`,
      'POWER_NOT_REPEATABLE',
      { poder: poderNome },
    );
  }
}

export class PoderGenericoRequisitoNivelException extends BusinessException {
  constructor(poderNome: string, nivelMinimo: number) {
    super(
      `"${poderNome}" requer nível mínimo ${nivelMinimo}`,
      'POWER_LEVEL_REQUIREMENT',
      { poder: poderNome, nivelMinimo },
    );
  }
}

export class PoderGenericoRequerEscolhaException extends BusinessException {
  constructor(poderNome: string) {
    super(
      `"${poderNome}" exige uma escolha (config) mas nenhuma foi enviada`,
      'POWER_REQUIRES_CHOICE',
      { poder: poderNome },
    );
  }
}

export class PoderGenericoConfigInvalidaException extends BusinessException {
  constructor(
    poderNome: string,
    campo: string,
    mensagem: string,
    extraDetails?: Record<string, any>,
  ) {
    super(`"${poderNome}": ${mensagem}`, 'POWER_CONFIG_INVALID', {
      poder: poderNome,
      campo,
      ...extraDetails,
    });
  }
}

export class PoderGenericoRequisitoPericiaException extends BusinessException {
  constructor(poderNome: string, pericias: string) {
    super(`"${poderNome}" requer ${pericias}`, 'POWER_SKILL_REQUIREMENT', {
      poder: poderNome,
      requisitoPericias: pericias,
    });
  }
}

export class PoderGenericoRequisitoAtributoException extends BusinessException {
  constructor(poderNome: string, atributos: string) {
    super(`"${poderNome}" requer ${atributos}`, 'POWER_ATTRIBUTE_REQUIREMENT', {
      poder: poderNome,
      requisitoAtributos: atributos,
    });
  }
}

export class PoderGenericoRequisitoGrauException extends BusinessException {
  constructor(poderNome: string, tipoGrauCodigo: string, valorMinimo: number) {
    super(
      `"${poderNome}" requer ${tipoGrauCodigo} ${valorMinimo}+`,
      'POWER_GRADE_REQUIREMENT',
      { poder: poderNome, tipoGrauCodigo, valorMinimo },
    );
  }
}

export class PoderGenericoRequisitoPoderException extends BusinessException {
  constructor(poderNome: string, poderRequisito: string) {
    super(
      `"${poderNome}" requer o poder "${poderRequisito}"`,
      'POWER_POWER_REQUIREMENT',
      { poder: poderNome, poderRequisito },
    );
  }
}

export class PoderGenericoPericiaMaximaException extends BusinessException {
  constructor(poderNome: string, periciaCodigo: string) {
    super(
      `"${poderNome}": "${periciaCodigo}" já está no máximo (Expert)`,
      'POWER_SKILL_MAX_REACHED',
      { poder: poderNome, periciaCodigo },
    );
  }
}

export class PoderGenericoPericiaNivelException extends BusinessException {
  constructor(poderNome: string, periciaCodigo: string, nivel: number) {
    super(
      `"${poderNome}": não é possível elevar "${periciaCodigo}" acima do permitido no nível ${nivel}`,
      'POWER_SKILL_LEVEL_LIMIT',
      { poder: poderNome, periciaCodigo, nivel },
    );
  }
}

export class HabilidadeRequerEscolhaException extends BusinessException {
  constructor(habilidadeNome: string) {
    super(
      `"${habilidadeNome}" exige uma escolha (config) mas nenhuma foi enviada`,
      'HABILIDADE_REQUIRES_CHOICE',
      { habilidade: habilidadeNome },
    );
  }
}

export class HabilidadeConfigInvalidaException extends BusinessException {
  constructor(
    habilidadeNome: string,
    campo: string,
    mensagem: string,
    extraDetails?: Record<string, any>,
  ) {
    super(`"${habilidadeNome}": ${mensagem}`, 'HABILIDADE_CONFIG_INVALID', {
      habilidade: habilidadeNome,
      campo,
      ...extraDetails,
    });
  }
}

export class ProficienciaNaoEncontradaException extends BusinessException {
  constructor(proficienciaCodigo: string) {
    super(
      `Proficiência "${proficienciaCodigo}" não encontrada no sistema`,
      'PROFICIENCY_NOT_FOUND',
      { proficienciaCodigo },
    );
  }
}

// ============================================================================
// TRILHA / CAMINHO
// ============================================================================

export class TrilhaNaoEncontradaException extends BaseException {
  constructor(trilhaId?: number) {
    super('Trilha não encontrada', HttpStatus.NOT_FOUND, 'PATH_NOT_FOUND', {
      trilhaId,
    });
  }
}

export class TrilhaIncompativelException extends BusinessException {
  constructor() {
    super(
      'A trilha selecionada não pertence à classe escolhida',
      'PATH_INCOMPATIBLE_WITH_CLASS',
    );
  }
}

export class TrilhaRequisitoNaoAtendidoException extends BusinessException {
  constructor(mensagem: string) {
    super(mensagem, 'PATH_REQUIREMENT_NOT_MET');
  }
}

export class CaminhoNaoEncontradoException extends BaseException {
  constructor(caminhoId?: number) {
    super('Caminho não encontrado', HttpStatus.NOT_FOUND, 'WAY_NOT_FOUND', {
      caminhoId,
    });
  }
}

export class CaminhoSemTrilhaException extends BusinessException {
  constructor() {
    super(
      'Não é possível selecionar um caminho sem uma trilha',
      'WAY_REQUIRES_PATH',
    );
  }
}

export class CaminhoIncompativelException extends BusinessException {
  constructor() {
    super(
      'O caminho selecionado não pertence à trilha escolhida',
      'WAY_INCOMPATIBLE_WITH_PATH',
    );
  }
}

// ============================================================================
// PERÍCIAS LIVRES
// ============================================================================

export class PericiasLivresExcedemLimiteException extends BusinessException {
  constructor(
    quantidadeSelecionada: number,
    maximo: number,
    detalhes: {
      maxBase: number;
      deIntelecto: number;
    },
  ) {
    super(
      `Número de perícias livres (${quantidadeSelecionada}) excede o máximo permitido (${maximo})`,
      'PERICIAS_LIVRES_EXCEDEM_LIMITE',
      { quantidadeSelecionada, maximo, detalhes },
    );
  }
}

// ============================================================================
// GRAUS DE APRIMORAMENTO - TOTAL
// ============================================================================

export class GrausAprimoramentoExcedemTotalException extends BusinessException {
  constructor(
    nivel: number,
    pontosDistribuidos: number,
    maximoPermitido: number,
    detalhes: {
      base: number;
      extras: number;
    },
  ) {
    super(
      `Você distribuiu ${pontosDistribuidos} graus livres, mas o máximo permitido no nível ${nivel} é ${maximoPermitido}`,
      'GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL',
      { nivel, pontosDistribuidos, maximoPermitido, detalhes },
    );
  }
}
