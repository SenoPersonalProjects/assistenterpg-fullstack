"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoderGenericoRequerEscolhaException = exports.PoderGenericoRequisitoNivelException = exports.PoderGenericoNaoRepetivelException = exports.PoderesGenericosNaoEncontradosException = exports.PoderesGenericosExcedemSlotsException = exports.PericiaJujutsuNaoEncontradaException = exports.ClassePericiaEscolhaInvalidaException = exports.ClassePericiaGrupoInvalidoException = exports.ClassePericiaSemGrupoException = exports.OrigemPericiaEscolhaInvalidaException = exports.OrigemPericiaGrupoInvalidoException = exports.OrigemPericiaSemGrupoException = exports.PericiaNaoEncontradaException = exports.TecnicaHereditariaIncompativelException = exports.OrigemBloqueiaTecnicaHereditariaException = exports.OrigemRequerTecnicaHereditariaException = exports.TecnicaInataTipoInvalidoException = exports.TecnicaInataNaoEncontradaException = exports.OrigemRequerGrandeClaException = exports.ClaOuOrigemNaoEncontradoException = exports.GrauTreinamentoNivelMinimoException = exports.GrauTreinamentoProgressaoInvalidaException = exports.GrauTreinamentoPericiaDestreinadaException = exports.GrauTreinamentoPericiaInexistenteException = exports.GrauTreinamentoExcedeMelhoriasException = exports.GrauTreinamentoNivelInvalidoException = exports.GrauAprimoramentoExcedeMaximoComPoderesException = exports.GrauAprimoramentoExcedeMaximoComBonusException = exports.GrauAprimoramentoForaDoLimiteException = exports.GrauAprimoramentoNaoInteiroException = exports.ValoresClasseNaoDefinidosException = exports.ClasseNaoEncontradaException = exports.PassivaIntelectoGrauExcedeMaximoException = exports.PassivaIntelectoTreinoNecessarioException = exports.PassivaIntelectoPericiaInexistenteException = exports.PassivasIntelectoConfigInvalidaException = exports.PassivaInexistenteException = exports.PassivasLimiteAtributoExcedidoException = exports.PassivasDuplicadasException = exports.PassivaRequisitoNaoAtendidoException = exports.CatalogoPassivasInconsisteException = exports.PassivasEscolhaNecessariaException = exports.PassivasNaoElegiveisException = exports.PassivasExcedemLimiteException = exports.AtributoChaveEaInvalidoException = exports.SomatorioAtributosInvalidoException = exports.AtributoForaDoLimiteException = exports.AtributoNaoInteiroException = exports.ErroAtualizacaoPersonagemException = exports.PersonagemBaseNaoEncontradoException = void 0;
exports.GrausAprimoramentoExcedemTotalException = exports.PericiasLivresExcedemLimiteException = exports.CaminhoIncompativelException = exports.CaminhoSemTrilhaException = exports.CaminhoNaoEncontradoException = exports.TrilhaRequisitoNaoAtendidoException = exports.TrilhaIncompativelException = exports.TrilhaNaoEncontradaException = exports.ProficienciaNaoEncontradaException = exports.PoderGenericoPericiaNivelException = exports.PoderGenericoPericiaMaximaException = exports.PoderGenericoRequisitoPoderException = exports.PoderGenericoRequisitoGrauException = exports.PoderGenericoRequisitoAtributoException = exports.PoderGenericoRequisitoPericiaException = exports.PoderGenericoConfigInvalidaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
const validation_exception_1 = require("./validation.exception");
class PersonagemBaseNaoEncontradoException extends base_exception_1.BaseException {
    constructor(personagemBaseId) {
        super('Personagem-base não encontrado', common_1.HttpStatus.NOT_FOUND, 'PERSONAGEM_BASE_NOT_FOUND', { personagemBaseId });
    }
}
exports.PersonagemBaseNaoEncontradoException = PersonagemBaseNaoEncontradoException;
class ErroAtualizacaoPersonagemException extends business_exception_1.BusinessException {
    constructor(details) {
        super('Falha ao atualizar personagem-base', 'UPDATE_PERSONAGEM_FAILED', details);
    }
}
exports.ErroAtualizacaoPersonagemException = ErroAtualizacaoPersonagemException;
class AtributoNaoInteiroException extends validation_exception_1.ValidationException {
    constructor(nomeAtributo, valor) {
        super(`O atributo "${nomeAtributo}" deve ser um número inteiro`, nomeAtributo, { valorRecebido: valor, tipoEsperado: 'integer' }, 'ATTRIBUTE_NOT_INTEGER');
    }
}
exports.AtributoNaoInteiroException = AtributoNaoInteiroException;
class AtributoForaDoLimiteException extends validation_exception_1.ValidationException {
    constructor(nomeAtributo, valor) {
        super(`O atributo "${nomeAtributo}" deve estar entre 0 e 7`, nomeAtributo, { min: 0, max: 7, valorRecebido: valor }, 'ATTRIBUTE_OUT_OF_RANGE');
    }
}
exports.AtributoForaDoLimiteException = AtributoForaDoLimiteException;
class SomatorioAtributosInvalidoException extends validation_exception_1.ValidationException {
    constructor(nivel, somaAtual, somaEsperada) {
        super(`Soma de atributos inválida (${somaAtual}). Para nível ${nivel}, a soma deve ser ${somaEsperada}`, 'atributos', { nivel, somaAtual, somaEsperada }, 'INVALID_ATTRIBUTE_SUM');
    }
}
exports.SomatorioAtributosInvalidoException = SomatorioAtributosInvalidoException;
class AtributoChaveEaInvalidoException extends validation_exception_1.ValidationException {
    constructor(valor, valoresValidos) {
        super(`O atributo-chave de Energia Amaldiçoada deve ser INT ou PRE`, 'atributoChaveEa', { valorRecebido: valor, valoresValidos }, 'INVALID_EA_KEY_ATTRIBUTE');
    }
}
exports.AtributoChaveEaInvalidoException = AtributoChaveEaInvalidoException;
class PassivasExcedemLimiteException extends business_exception_1.BusinessException {
    constructor(quantidadeEscolhida, elegiveis) {
        super('Você deve escolher no máximo 2 atributos para passivas', 'TOO_MANY_PASSIVES', { quantidadeEscolhida, maximo: 2, elegiveis });
    }
}
exports.PassivasExcedemLimiteException = PassivasExcedemLimiteException;
class PassivasNaoElegiveisException extends business_exception_1.BusinessException {
    constructor(escolhidos, elegiveis) {
        super('Você selecionou atributos que não estão elegíveis (precisam ter valor >= 3)', 'INELIGIBLE_PASSIVES', { escolhidos, elegiveis });
    }
}
exports.PassivasNaoElegiveisException = PassivasNaoElegiveisException;
class PassivasEscolhaNecessariaException extends business_exception_1.BusinessException {
    constructor(elegiveis) {
        super('Selecione exatamente 2 atributos para ativar passivas (há mais de 2 atributos elegíveis)', 'PASSIVES_CHOICE_REQUIRED', { elegiveis, quantidadeNecessaria: 2 });
    }
}
exports.PassivasEscolhaNecessariaException = PassivasEscolhaNecessariaException;
class CatalogoPassivasInconsisteException extends base_exception_1.BaseException {
    constructor() {
        super('Catálogo de passivas inconsistente (faltam passivas I/II para algum atributo)', common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'PASSIVES_CATALOG_INCONSISTENT');
    }
}
exports.CatalogoPassivasInconsisteException = CatalogoPassivasInconsisteException;
class PassivaRequisitoNaoAtendidoException extends business_exception_1.BusinessException {
    constructor(passivaName, atributo, requisito, valorAtual) {
        super(`Passiva "${passivaName}" requer ${atributo} >= ${requisito}, mas você tem ${valorAtual}`, 'PASSIVE_REQUIREMENT_NOT_MET', { passiva: passivaName, atributo, requisito, valorAtual });
    }
}
exports.PassivaRequisitoNaoAtendidoException = PassivaRequisitoNaoAtendidoException;
class PassivasDuplicadasException extends business_exception_1.BusinessException {
    constructor(atributo, quantidade) {
        super(`Você selecionou passivas duplicadas para ${atributo}`, 'DUPLICATE_PASSIVES', { atributo, quantidadeSelecionada: quantidade });
    }
}
exports.PassivasDuplicadasException = PassivasDuplicadasException;
class PassivasLimiteAtributoExcedidoException extends business_exception_1.BusinessException {
    constructor(quantidade, atributosComPassivas) {
        super(`Você pode ter passivas em no máximo 2 atributos diferentes`, 'TOO_MANY_PASSIVE_ATTRIBUTES', {
            maximo: 2,
            quantidadeSelecionada: quantidade,
            atributos: atributosComPassivas,
        });
    }
}
exports.PassivasLimiteAtributoExcedidoException = PassivasLimiteAtributoExcedidoException;
class PassivaInexistenteException extends base_exception_1.BaseException {
    constructor() {
        super('Uma ou mais passivas selecionadas não existem', common_1.HttpStatus.NOT_FOUND, 'PASSIVE_NOT_FOUND');
    }
}
exports.PassivaInexistenteException = PassivaInexistenteException;
class PassivasIntelectoConfigInvalidaException extends business_exception_1.BusinessException {
    constructor(codigoPassiva, maxTotal) {
        super(`Configuração inválida de ${codigoPassiva}: máximo ${maxTotal} entre perícias e proficiências`, 'INTELLECT_PASSIVE_CONFIG_INVALID', { passiva: codigoPassiva, maximoTotal: maxTotal });
    }
}
exports.PassivasIntelectoConfigInvalidaException = PassivasIntelectoConfigInvalidaException;
class PassivaIntelectoPericiaInexistenteException extends business_exception_1.BusinessException {
    constructor(codigoPassiva, periciaCodigo) {
        super(`Perícia configurada em ${codigoPassiva} não encontrada: ${periciaCodigo}`, 'INTELLECT_PASSIVE_SKILL_NOT_FOUND', { passiva: codigoPassiva, periciaCodigo });
    }
}
exports.PassivaIntelectoPericiaInexistenteException = PassivaIntelectoPericiaInexistenteException;
class PassivaIntelectoTreinoNecessarioException extends business_exception_1.BusinessException {
    constructor(codigoPassiva) {
        super(`${codigoPassiva} requer uma perícia para +1 grau de treinamento`, 'INTELLECT_PASSIVE_TRAINING_REQUIRED', { passiva: codigoPassiva });
    }
}
exports.PassivaIntelectoTreinoNecessarioException = PassivaIntelectoTreinoNecessarioException;
class PassivaIntelectoGrauExcedeMaximoException extends business_exception_1.BusinessException {
    constructor(tipoGrauCodigo, valorFinal, maximo) {
        super(`Intelecto II deixaria o grau de "${tipoGrauCodigo}" em ${valorFinal}, acima do máximo permitido (${maximo})`, 'INTELLECT_PASSIVE_GRADE_EXCEEDS_MAX', { tipoGrauCodigo, valorFinal, maximo });
    }
}
exports.PassivaIntelectoGrauExcedeMaximoException = PassivaIntelectoGrauExcedeMaximoException;
class ClasseNaoEncontradaException extends base_exception_1.BaseException {
    constructor(classeId) {
        super('Classe não encontrada', common_1.HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND', {
            classeId,
        });
    }
}
exports.ClasseNaoEncontradaException = ClasseNaoEncontradaException;
class ValoresClasseNaoDefinidosException extends business_exception_1.BusinessException {
    constructor(classeNome) {
        super(`Valores não definidos para a classe ${classeNome}`, 'CLASS_VALUES_NOT_DEFINED', { classe: classeNome });
    }
}
exports.ValoresClasseNaoDefinidosException = ValoresClasseNaoDefinidosException;
class GrauAprimoramentoNaoInteiroException extends validation_exception_1.ValidationException {
    constructor(tipoGrauCodigo, valor) {
        super(`Valor inválido para grau de aprimoramento em "${tipoGrauCodigo}" (deve ser inteiro)`, `grausAprimoramento.${tipoGrauCodigo}`, { valorRecebido: valor, tipoEsperado: 'integer' }, 'GRADE_NOT_INTEGER');
    }
}
exports.GrauAprimoramentoNaoInteiroException = GrauAprimoramentoNaoInteiroException;
class GrauAprimoramentoForaDoLimiteException extends validation_exception_1.ValidationException {
    constructor(tipoGrauCodigo, valor) {
        super(`Valor inválido para grau de aprimoramento em "${tipoGrauCodigo}" (deve estar entre 0 e 5)`, `grausAprimoramento.${tipoGrauCodigo}`, { min: 0, max: 5, valorRecebido: valor }, 'GRADE_OUT_OF_RANGE');
    }
}
exports.GrauAprimoramentoForaDoLimiteException = GrauAprimoramentoForaDoLimiteException;
class GrauAprimoramentoExcedeMaximoComBonusException extends business_exception_1.BusinessException {
    constructor(tipoGrauCodigo, valorFinal, bonusHabilidades) {
        super(`Grau de "${tipoGrauCodigo}" ficaria acima de 5 (${valorFinal}) com os bônus de habilidades. ` +
            `Reduza seus graus livres neste tipo para no máximo ${5 - bonusHabilidades}`, 'GRADE_EXCEEDS_MAX_WITH_BONUS', { tipoGrauCodigo, valorFinal, bonusHabilidades, maximo: 5 });
    }
}
exports.GrauAprimoramentoExcedeMaximoComBonusException = GrauAprimoramentoExcedeMaximoComBonusException;
class GrauAprimoramentoExcedeMaximoComPoderesException extends business_exception_1.BusinessException {
    constructor(tipoGrauCodigo, valorFinal, bonusPoderes) {
        super(`Grau de "${tipoGrauCodigo}" ficaria acima de 5 (${valorFinal}) com os bônus de poderes genéricos. ` +
            `Reduza seus graus livres neste tipo para no máximo ${5 - bonusPoderes}`, 'GRADE_EXCEEDS_MAX_WITH_POWERS', { tipoGrauCodigo, valorFinal, bonusPoderes, maximo: 5 });
    }
}
exports.GrauAprimoramentoExcedeMaximoComPoderesException = GrauAprimoramentoExcedeMaximoComPoderesException;
class GrauTreinamentoNivelInvalidoException extends business_exception_1.BusinessException {
    constructor(nivel, niveisValidos) {
        super(`Nível ${nivel} não concede grau de treinamento ou personagem não alcançou esse nível`, 'TRAINING_LEVEL_INVALID', { nivelInformado: nivel, niveisValidos });
    }
}
exports.GrauTreinamentoNivelInvalidoException = GrauTreinamentoNivelInvalidoException;
class GrauTreinamentoExcedeMelhoriasException extends business_exception_1.BusinessException {
    constructor(nivel, quantidadeInformada, maximo, intelecto) {
        super(`No nível ${nivel}, você pode fazer no máximo ${maximo} melhorias (2 + INT ${intelecto})`, 'TRAINING_EXCEEDS_IMPROVEMENTS', { nivel, quantidadeInformada, maximo, intelecto });
    }
}
exports.GrauTreinamentoExcedeMelhoriasException = GrauTreinamentoExcedeMelhoriasException;
class GrauTreinamentoPericiaInexistenteException extends base_exception_1.BaseException {
    constructor(periciaCodigo) {
        super(`Perícia "${periciaCodigo}" não encontrada`, common_1.HttpStatus.NOT_FOUND, 'TRAINING_SKILL_NOT_FOUND', { periciaCodigo });
    }
}
exports.GrauTreinamentoPericiaInexistenteException = GrauTreinamentoPericiaInexistenteException;
class GrauTreinamentoPericiaDestreinadaException extends business_exception_1.BusinessException {
    constructor(periciaCodigo) {
        super(`Perícia "${periciaCodigo}" precisa estar treinada para receber melhoria de grau de treinamento`, 'TRAINING_SKILL_UNTRAINED', { periciaCodigo });
    }
}
exports.GrauTreinamentoPericiaDestreinadaException = GrauTreinamentoPericiaDestreinadaException;
class GrauTreinamentoProgressaoInvalidaException extends business_exception_1.BusinessException {
    constructor(periciaCodigo, grauAnterior, grauNovo) {
        super(`Melhoria inválida para "${periciaCodigo}": de ${grauAnterior} para ${grauNovo}. Deve aumentar em +5`, 'TRAINING_INVALID_PROGRESSION', { periciaCodigo, grauAnterior, grauNovo, incrementoEsperado: 5 });
    }
}
exports.GrauTreinamentoProgressaoInvalidaException = GrauTreinamentoProgressaoInvalidaException;
class GrauTreinamentoNivelMinimoException extends business_exception_1.BusinessException {
    constructor(tipoGrau, grau, nivelMinimo) {
        super(`${tipoGrau} (${grau}) só pode ser alcançado a partir do nível ${nivelMinimo}`, 'TRAINING_LEVEL_REQUIREMENT', { tipoGrau, grau, nivelMinimo });
    }
}
exports.GrauTreinamentoNivelMinimoException = GrauTreinamentoNivelMinimoException;
class ClaOuOrigemNaoEncontradoException extends base_exception_1.BaseException {
    constructor(tipo, id) {
        super(`${tipo} não encontrado`, common_1.HttpStatus.NOT_FOUND, tipo === 'Clã' ? 'CLAN_NOT_FOUND' : 'ORIGIN_NOT_FOUND', { tipo, id });
    }
}
exports.ClaOuOrigemNaoEncontradoException = ClaOuOrigemNaoEncontradoException;
class OrigemRequerGrandeClaException extends business_exception_1.BusinessException {
    constructor(origemNome) {
        super('Esta origem só pode ser escolhida por membros de um dos três grandes clãs', 'ORIGIN_REQUIRES_GREAT_CLAN', { origem: origemNome });
    }
}
exports.OrigemRequerGrandeClaException = OrigemRequerGrandeClaException;
class TecnicaInataNaoEncontradaException extends business_exception_1.BusinessException {
    constructor(tecnicaInataId) {
        super('Técnica inata selecionada é inválida', 'INNATE_TECHNIQUE_NOT_FOUND', { tecnicaInataId });
    }
}
exports.TecnicaInataNaoEncontradaException = TecnicaInataNaoEncontradaException;
class TecnicaInataTipoInvalidoException extends business_exception_1.BusinessException {
    constructor() {
        super('A técnica inata precisa ser uma técnica amaldiçoada do tipo INATA', 'INNATE_TECHNIQUE_INVALID_TYPE');
    }
}
exports.TecnicaInataTipoInvalidoException = TecnicaInataTipoInvalidoException;
class OrigemRequerTecnicaHereditariaException extends business_exception_1.BusinessException {
    constructor(origemNome) {
        super('Esta origem exige uma técnica inata hereditária do seu clã', 'ORIGIN_REQUIRES_HEREDITARY_TECHNIQUE', { origem: origemNome });
    }
}
exports.OrigemRequerTecnicaHereditariaException = OrigemRequerTecnicaHereditariaException;
class OrigemBloqueiaTecnicaHereditariaException extends business_exception_1.BusinessException {
    constructor(origemNome) {
        super('Esta origem não pode receber técnica inata hereditária', 'ORIGIN_BLOCKS_HEREDITARY_TECHNIQUE', { origem: origemNome });
    }
}
exports.OrigemBloqueiaTecnicaHereditariaException = OrigemBloqueiaTecnicaHereditariaException;
class TecnicaHereditariaIncompativelException extends business_exception_1.BusinessException {
    constructor(claNome) {
        super(`Esta técnica hereditária não está disponível para o clã ${claNome}`, 'HEREDITARY_TECHNIQUE_INCOMPATIBLE', { cla: claNome });
    }
}
exports.TecnicaHereditariaIncompativelException = TecnicaHereditariaIncompativelException;
class PericiaNaoEncontradaException extends business_exception_1.BusinessException {
    constructor(periciaCodigo) {
        super(`Perícia com código "${periciaCodigo}" não encontrada`, 'SKILL_NOT_FOUND', { periciaCodigo });
    }
}
exports.PericiaNaoEncontradaException = PericiaNaoEncontradaException;
class OrigemPericiaSemGrupoException extends business_exception_1.BusinessException {
    constructor(origemPericiaId) {
        super(`OrigemPericia ${origemPericiaId} é do tipo ESCOLHA, mas está sem grupoEscolha`, 'ORIGIN_SKILL_MISSING_GROUP', { origemPericiaId });
    }
}
exports.OrigemPericiaSemGrupoException = OrigemPericiaSemGrupoException;
class OrigemPericiaGrupoInvalidoException extends business_exception_1.BusinessException {
    constructor(grupo, opcoes) {
        super(`Grupo de perícia da origem (grupo ${grupo}) deve ter exatamente 1 escolha válida`, 'ORIGIN_SKILL_GROUP_INVALID', { grupo, opcoes });
    }
}
exports.OrigemPericiaGrupoInvalidoException = OrigemPericiaGrupoInvalidoException;
class OrigemPericiaEscolhaInvalidaException extends business_exception_1.BusinessException {
    constructor(periciaCodigo) {
        super(`Perícia de origem escolhida "${periciaCodigo}" não pertence à lista de escolhas da origem`, 'ORIGIN_SKILL_CHOICE_INVALID', { periciaCodigo });
    }
}
exports.OrigemPericiaEscolhaInvalidaException = OrigemPericiaEscolhaInvalidaException;
class ClassePericiaSemGrupoException extends business_exception_1.BusinessException {
    constructor(classePericiaId) {
        super(`ClassePericia ${classePericiaId} é do tipo ESCOLHA, mas está sem grupoEscolha`, 'CLASS_SKILL_MISSING_GROUP', { classePericiaId });
    }
}
exports.ClassePericiaSemGrupoException = ClassePericiaSemGrupoException;
class ClassePericiaGrupoInvalidoException extends business_exception_1.BusinessException {
    constructor(grupo, opcoes) {
        super(`Grupo de perícia da classe (grupo ${grupo}) deve ter exatamente 1 escolha válida`, 'CLASS_SKILL_GROUP_INVALID', { grupo, opcoes });
    }
}
exports.ClassePericiaGrupoInvalidoException = ClassePericiaGrupoInvalidoException;
class ClassePericiaEscolhaInvalidaException extends business_exception_1.BusinessException {
    constructor(periciaCodigo) {
        super(`Perícia de classe escolhida "${periciaCodigo}" não pertence à lista de escolhas da classe`, 'CLASS_SKILL_CHOICE_INVALID', { periciaCodigo });
    }
}
exports.ClassePericiaEscolhaInvalidaException = ClassePericiaEscolhaInvalidaException;
class PericiaJujutsuNaoEncontradaException extends base_exception_1.BaseException {
    constructor() {
        super('Perícia Jujutsu não encontrada no sistema', common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'JUJUTSU_SKILL_NOT_FOUND');
    }
}
exports.PericiaJujutsuNaoEncontradaException = PericiaJujutsuNaoEncontradaException;
class PoderesGenericosExcedemSlotsException extends business_exception_1.BusinessException {
    constructor(nivel, slotsDisponiveis, quantidadeSelecionada) {
        super(`Nível ${nivel} permite no máximo ${slotsDisponiveis} poderes genéricos, mas ${quantidadeSelecionada} foram selecionados`, 'POWERS_EXCEED_SLOTS', { nivel, slotsDisponiveis, quantidadeSelecionada });
    }
}
exports.PoderesGenericosExcedemSlotsException = PoderesGenericosExcedemSlotsException;
class PoderesGenericosNaoEncontradosException extends base_exception_1.BaseException {
    constructor() {
        super('Um ou mais poderes genéricos não foram encontrados', common_1.HttpStatus.NOT_FOUND, 'POWERS_NOT_FOUND');
    }
}
exports.PoderesGenericosNaoEncontradosException = PoderesGenericosNaoEncontradosException;
class PoderGenericoNaoRepetivelException extends business_exception_1.BusinessException {
    constructor(poderNome) {
        super(`O poder "${poderNome}" não pode ser escolhido mais de uma vez`, 'POWER_NOT_REPEATABLE', { poder: poderNome });
    }
}
exports.PoderGenericoNaoRepetivelException = PoderGenericoNaoRepetivelException;
class PoderGenericoRequisitoNivelException extends business_exception_1.BusinessException {
    constructor(poderNome, nivelMinimo) {
        super(`"${poderNome}" requer nível mínimo ${nivelMinimo}`, 'POWER_LEVEL_REQUIREMENT', { poder: poderNome, nivelMinimo });
    }
}
exports.PoderGenericoRequisitoNivelException = PoderGenericoRequisitoNivelException;
class PoderGenericoRequerEscolhaException extends business_exception_1.BusinessException {
    constructor(poderNome) {
        super(`"${poderNome}" exige uma escolha (config) mas nenhuma foi enviada`, 'POWER_REQUIRES_CHOICE', { poder: poderNome });
    }
}
exports.PoderGenericoRequerEscolhaException = PoderGenericoRequerEscolhaException;
class PoderGenericoConfigInvalidaException extends business_exception_1.BusinessException {
    constructor(poderNome, campo, mensagem, extraDetails) {
        super(`"${poderNome}": ${mensagem}`, 'POWER_CONFIG_INVALID', {
            poder: poderNome,
            campo,
            ...extraDetails,
        });
    }
}
exports.PoderGenericoConfigInvalidaException = PoderGenericoConfigInvalidaException;
class PoderGenericoRequisitoPericiaException extends business_exception_1.BusinessException {
    constructor(poderNome, pericias) {
        super(`"${poderNome}" requer ${pericias}`, 'POWER_SKILL_REQUIREMENT', {
            poder: poderNome,
            requisitoPericias: pericias,
        });
    }
}
exports.PoderGenericoRequisitoPericiaException = PoderGenericoRequisitoPericiaException;
class PoderGenericoRequisitoAtributoException extends business_exception_1.BusinessException {
    constructor(poderNome, atributos) {
        super(`"${poderNome}" requer ${atributos}`, 'POWER_ATTRIBUTE_REQUIREMENT', {
            poder: poderNome,
            requisitoAtributos: atributos,
        });
    }
}
exports.PoderGenericoRequisitoAtributoException = PoderGenericoRequisitoAtributoException;
class PoderGenericoRequisitoGrauException extends business_exception_1.BusinessException {
    constructor(poderNome, tipoGrauCodigo, valorMinimo) {
        super(`"${poderNome}" requer ${tipoGrauCodigo} ${valorMinimo}+`, 'POWER_GRADE_REQUIREMENT', { poder: poderNome, tipoGrauCodigo, valorMinimo });
    }
}
exports.PoderGenericoRequisitoGrauException = PoderGenericoRequisitoGrauException;
class PoderGenericoRequisitoPoderException extends business_exception_1.BusinessException {
    constructor(poderNome, poderRequisito) {
        super(`"${poderNome}" requer o poder "${poderRequisito}"`, 'POWER_POWER_REQUIREMENT', { poder: poderNome, poderRequisito });
    }
}
exports.PoderGenericoRequisitoPoderException = PoderGenericoRequisitoPoderException;
class PoderGenericoPericiaMaximaException extends business_exception_1.BusinessException {
    constructor(poderNome, periciaCodigo) {
        super(`"${poderNome}": "${periciaCodigo}" já está no máximo (Expert)`, 'POWER_SKILL_MAX_REACHED', { poder: poderNome, periciaCodigo });
    }
}
exports.PoderGenericoPericiaMaximaException = PoderGenericoPericiaMaximaException;
class PoderGenericoPericiaNivelException extends business_exception_1.BusinessException {
    constructor(poderNome, periciaCodigo, nivel) {
        super(`"${poderNome}": não é possível elevar "${periciaCodigo}" acima do permitido no nível ${nivel}`, 'POWER_SKILL_LEVEL_LIMIT', { poder: poderNome, periciaCodigo, nivel });
    }
}
exports.PoderGenericoPericiaNivelException = PoderGenericoPericiaNivelException;
class ProficienciaNaoEncontradaException extends business_exception_1.BusinessException {
    constructor(proficienciaCodigo) {
        super(`Proficiência "${proficienciaCodigo}" não encontrada no sistema`, 'PROFICIENCY_NOT_FOUND', { proficienciaCodigo });
    }
}
exports.ProficienciaNaoEncontradaException = ProficienciaNaoEncontradaException;
class TrilhaNaoEncontradaException extends base_exception_1.BaseException {
    constructor(trilhaId) {
        super('Trilha não encontrada', common_1.HttpStatus.NOT_FOUND, 'PATH_NOT_FOUND', {
            trilhaId,
        });
    }
}
exports.TrilhaNaoEncontradaException = TrilhaNaoEncontradaException;
class TrilhaIncompativelException extends business_exception_1.BusinessException {
    constructor() {
        super('A trilha selecionada não pertence à classe escolhida', 'PATH_INCOMPATIBLE_WITH_CLASS');
    }
}
exports.TrilhaIncompativelException = TrilhaIncompativelException;
class TrilhaRequisitoNaoAtendidoException extends business_exception_1.BusinessException {
    constructor(mensagem) {
        super(mensagem, 'PATH_REQUIREMENT_NOT_MET');
    }
}
exports.TrilhaRequisitoNaoAtendidoException = TrilhaRequisitoNaoAtendidoException;
class CaminhoNaoEncontradoException extends base_exception_1.BaseException {
    constructor(caminhoId) {
        super('Caminho não encontrado', common_1.HttpStatus.NOT_FOUND, 'WAY_NOT_FOUND', {
            caminhoId,
        });
    }
}
exports.CaminhoNaoEncontradoException = CaminhoNaoEncontradoException;
class CaminhoSemTrilhaException extends business_exception_1.BusinessException {
    constructor() {
        super('Não é possível selecionar um caminho sem uma trilha', 'WAY_REQUIRES_PATH');
    }
}
exports.CaminhoSemTrilhaException = CaminhoSemTrilhaException;
class CaminhoIncompativelException extends business_exception_1.BusinessException {
    constructor() {
        super('O caminho selecionado não pertence à trilha escolhida', 'WAY_INCOMPATIBLE_WITH_PATH');
    }
}
exports.CaminhoIncompativelException = CaminhoIncompativelException;
class PericiasLivresExcedemLimiteException extends business_exception_1.BusinessException {
    constructor(quantidadeSelecionada, maximo, detalhes) {
        super(`Número de perícias livres (${quantidadeSelecionada}) excede o máximo permitido (${maximo})`, 'PERICIAS_LIVRES_EXCEDEM_LIMITE', { quantidadeSelecionada, maximo, detalhes });
    }
}
exports.PericiasLivresExcedemLimiteException = PericiasLivresExcedemLimiteException;
class GrausAprimoramentoExcedemTotalException extends business_exception_1.BusinessException {
    constructor(nivel, pontosDistribuidos, maximoPermitido, detalhes) {
        super(`Você distribuiu ${pontosDistribuidos} graus livres, mas o máximo permitido no nível ${nivel} é ${maximoPermitido}`, 'GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL', { nivel, pontosDistribuidos, maximoPermitido, detalhes });
    }
}
exports.GrausAprimoramentoExcedemTotalException = GrausAprimoramentoExcedemTotalException;
//# sourceMappingURL=personagem.exception.js.map