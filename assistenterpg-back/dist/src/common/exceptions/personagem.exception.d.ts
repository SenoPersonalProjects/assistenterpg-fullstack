import { BaseException } from './base.exception';
import { BusinessException } from './business.exception';
import { ValidationException } from './validation.exception';
export declare class PersonagemBaseNaoEncontradoException extends BaseException {
    constructor(personagemBaseId?: number);
}
export declare class ErroAtualizacaoPersonagemException extends BusinessException {
    constructor(details?: Record<string, unknown>);
}
export declare class AtributoNaoInteiroException extends ValidationException {
    constructor(nomeAtributo: string, valor: unknown);
}
export declare class AtributoForaDoLimiteException extends ValidationException {
    constructor(nomeAtributo: string, valor: number);
}
export declare class SomatorioAtributosInvalidoException extends ValidationException {
    constructor(nivel: number, somaAtual: number, somaEsperada: number);
}
export declare class AtributoChaveEaInvalidoException extends ValidationException {
    constructor(valor: unknown, valoresValidos: string[]);
}
export declare class PassivasExcedemLimiteException extends BusinessException {
    constructor(quantidadeEscolhida: number, elegiveis: string[]);
}
export declare class PassivasNaoElegiveisException extends BusinessException {
    constructor(escolhidos: string[], elegiveis: string[]);
}
export declare class PassivasEscolhaNecessariaException extends BusinessException {
    constructor(elegiveis: string[]);
}
export declare class CatalogoPassivasInconsisteException extends BaseException {
    constructor();
}
export declare class PassivaRequisitoNaoAtendidoException extends BusinessException {
    constructor(passivaName: string, atributo: string, requisito: number, valorAtual: number);
}
export declare class PassivasDuplicadasException extends BusinessException {
    constructor(atributo: string, quantidade: number);
}
export declare class PassivasLimiteAtributoExcedidoException extends BusinessException {
    constructor(quantidade: number, atributosComPassivas: string[]);
}
export declare class PassivaInexistenteException extends BaseException {
    constructor();
}
export declare class PassivasIntelectoConfigInvalidaException extends BusinessException {
    constructor(codigoPassiva: 'INT_I' | 'INT_II', maxTotal: number);
}
export declare class PassivaIntelectoPericiaInexistenteException extends BusinessException {
    constructor(codigoPassiva: string, periciaCodigo: string);
}
export declare class PassivaIntelectoTreinoNecessarioException extends BusinessException {
    constructor(codigoPassiva: string);
}
export declare class PassivaIntelectoGrauExcedeMaximoException extends BusinessException {
    constructor(tipoGrauCodigo: string, valorFinal: number, maximo: number);
}
export declare class ClasseNaoEncontradaException extends BaseException {
    constructor(classeId?: number);
}
export declare class ValoresClasseNaoDefinidosException extends BusinessException {
    constructor(classeNome: string);
}
export declare class GrauAprimoramentoNaoInteiroException extends ValidationException {
    constructor(tipoGrauCodigo: string, valor: unknown);
}
export declare class GrauAprimoramentoForaDoLimiteException extends ValidationException {
    constructor(tipoGrauCodigo: string, valor: number);
}
export declare class GrauAprimoramentoExcedeMaximoComBonusException extends BusinessException {
    constructor(tipoGrauCodigo: string, valorFinal: number, bonusHabilidades: number);
}
export declare class GrauAprimoramentoExcedeMaximoComPoderesException extends BusinessException {
    constructor(tipoGrauCodigo: string, valorFinal: number, bonusPoderes: number);
}
export declare class GrauTreinamentoNivelInvalidoException extends BusinessException {
    constructor(nivel: number, niveisValidos: number[]);
}
export declare class GrauTreinamentoExcedeMelhoriasException extends BusinessException {
    constructor(nivel: number, quantidadeInformada: number, maximo: number, intelecto: number);
}
export declare class GrauTreinamentoPericiaInexistenteException extends BaseException {
    constructor(periciaCodigo: string);
}
export declare class GrauTreinamentoPericiaDestreinadaException extends BusinessException {
    constructor(periciaCodigo: string);
}
export declare class GrauTreinamentoProgressaoInvalidaException extends BusinessException {
    constructor(periciaCodigo: string, grauAnterior: number, grauNovo: number);
}
export declare class GrauTreinamentoNivelMinimoException extends BusinessException {
    constructor(tipoGrau: 'Graduado' | 'Veterano' | 'Expert', grau: number, nivelMinimo: number);
}
export declare class ClaOuOrigemNaoEncontradoException extends BaseException {
    constructor(tipo: 'Clã' | 'Origem', id?: number);
}
export declare class OrigemRequerGrandeClaException extends BusinessException {
    constructor(origemNome?: string);
}
export declare class TecnicaInataNaoEncontradaException extends BusinessException {
    constructor(tecnicaInataId?: number);
}
export declare class TecnicaInataTipoInvalidoException extends BusinessException {
    constructor();
}
export declare class OrigemRequerTecnicaHereditariaException extends BusinessException {
    constructor(origemNome?: string);
}
export declare class OrigemBloqueiaTecnicaHereditariaException extends BusinessException {
    constructor(origemNome?: string);
}
export declare class TecnicaHereditariaIncompativelException extends BusinessException {
    constructor(claNome: string);
}
export declare class PericiaNaoEncontradaException extends BusinessException {
    constructor(periciaCodigo: string);
}
export declare class OrigemPericiaSemGrupoException extends BusinessException {
    constructor(origemPericiaId: number);
}
export declare class OrigemPericiaGrupoInvalidoException extends BusinessException {
    constructor(grupo: number, opcoes: string[]);
}
export declare class OrigemPericiaEscolhaInvalidaException extends BusinessException {
    constructor(periciaCodigo: string);
}
export declare class ClassePericiaSemGrupoException extends BusinessException {
    constructor(classePericiaId: number);
}
export declare class ClassePericiaGrupoInvalidoException extends BusinessException {
    constructor(grupo: number, opcoes: string[]);
}
export declare class ClassePericiaEscolhaInvalidaException extends BusinessException {
    constructor(periciaCodigo: string);
}
export declare class PericiaJujutsuNaoEncontradaException extends BaseException {
    constructor();
}
export declare class PoderesGenericosExcedemSlotsException extends BusinessException {
    constructor(nivel: number, slotsDisponiveis: number, quantidadeSelecionada: number);
}
export declare class PoderesGenericosNaoEncontradosException extends BaseException {
    constructor();
}
export declare class PoderGenericoNaoRepetivelException extends BusinessException {
    constructor(poderNome: string);
}
export declare class PoderGenericoRequisitoNivelException extends BusinessException {
    constructor(poderNome: string, nivelMinimo: number);
}
export declare class PoderGenericoRequerEscolhaException extends BusinessException {
    constructor(poderNome: string);
}
export declare class PoderGenericoConfigInvalidaException extends BusinessException {
    constructor(poderNome: string, campo: string, mensagem: string, extraDetails?: Record<string, any>);
}
export declare class PoderGenericoRequisitoPericiaException extends BusinessException {
    constructor(poderNome: string, pericias: string);
}
export declare class PoderGenericoRequisitoAtributoException extends BusinessException {
    constructor(poderNome: string, atributos: string);
}
export declare class PoderGenericoRequisitoGrauException extends BusinessException {
    constructor(poderNome: string, tipoGrauCodigo: string, valorMinimo: number);
}
export declare class PoderGenericoRequisitoPoderException extends BusinessException {
    constructor(poderNome: string, poderRequisito: string);
}
export declare class PoderGenericoPericiaMaximaException extends BusinessException {
    constructor(poderNome: string, periciaCodigo: string);
}
export declare class PoderGenericoPericiaNivelException extends BusinessException {
    constructor(poderNome: string, periciaCodigo: string, nivel: number);
}
export declare class ProficienciaNaoEncontradaException extends BusinessException {
    constructor(proficienciaCodigo: string);
}
export declare class TrilhaNaoEncontradaException extends BaseException {
    constructor(trilhaId?: number);
}
export declare class TrilhaIncompativelException extends BusinessException {
    constructor();
}
export declare class TrilhaRequisitoNaoAtendidoException extends BusinessException {
    constructor(mensagem: string);
}
export declare class CaminhoNaoEncontradoException extends BaseException {
    constructor(caminhoId?: number);
}
export declare class CaminhoSemTrilhaException extends BusinessException {
    constructor();
}
export declare class CaminhoIncompativelException extends BusinessException {
    constructor();
}
export declare class PericiasLivresExcedemLimiteException extends BusinessException {
    constructor(quantidadeSelecionada: number, maximo: number, detalhes: {
        maxBase: number;
        deIntelecto: number;
    });
}
export declare class GrausAprimoramentoExcedemTotalException extends BusinessException {
    constructor(nivel: number, pontosDistribuidos: number, maximoPermitido: number, detalhes: {
        base: number;
        extras: number;
    });
}
