"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipamentoDetalhadoDto = exports.ModificacaoDisponivelDto = exports.ArtefatoAmaldicoadoDto = exports.ProtecaoAmaldicoadaDto = exports.ArmaAmaldicoadaDto = exports.ReducaoDanoDetalhadaDto = exports.DanoDetalhadoDto = void 0;
class DanoDetalhadoDto {
    empunhadura;
    tipoDano;
    rolagem;
    valorFlat;
}
exports.DanoDetalhadoDto = DanoDetalhadoDto;
class ReducaoDanoDetalhadaDto {
    tipoReducao;
    valor;
}
exports.ReducaoDanoDetalhadaDto = ReducaoDanoDetalhadaDto;
class ArmaAmaldicoadaDto {
    tipoBase;
    proficienciaRequerida;
    efeito;
}
exports.ArmaAmaldicoadaDto = ArmaAmaldicoadaDto;
class ProtecaoAmaldicoadaDto {
    tipoBase;
    bonusDefesa;
    penalidadeCarga;
    proficienciaRequerida;
    efeito;
}
exports.ProtecaoAmaldicoadaDto = ProtecaoAmaldicoadaDto;
class ArtefatoAmaldicoadoDto {
    tipoBase;
    proficienciaRequerida;
    efeito;
    custoUso;
    manutencao;
}
exports.ArtefatoAmaldicoadoDto = ArtefatoAmaldicoadoDto;
class ModificacaoDisponivelDto {
    id;
    codigo;
    nome;
    descricao;
    tipo;
    incrementoEspacos;
}
exports.ModificacaoDisponivelDto = ModificacaoDisponivelDto;
class EquipamentoDetalhadoDto {
    id;
    codigo;
    nome;
    descricao;
    tipo;
    fonte;
    suplementoId;
    categoria;
    espacos;
    complexidadeMaldicao;
    proficienciaArma;
    empunhaduras;
    tipoArma;
    subtipoDistancia;
    agil;
    criticoValor;
    criticoMultiplicador;
    alcance;
    tipoMunicaoCodigo;
    habilidadeEspecial;
    danos;
    proficienciaProtecao;
    tipoProtecao;
    bonusDefesa;
    penalidadeCarga;
    reducoesDano;
    duracaoCenas;
    recuperavel;
    tipoAcessorio;
    periciaBonificada;
    bonusPericia;
    requereEmpunhar;
    maxVestimentas;
    tipoExplosivo;
    efeito;
    tipoUso;
    tipoAmaldicoado;
    efeitoMaldicao;
    requerFerramentasAmaldicoadas;
    armaAmaldicoada;
    protecaoAmaldicoada;
    artefatoAmaldicoado;
    modificacoesDisponiveis;
}
exports.EquipamentoDetalhadoDto = EquipamentoDetalhadoDto;
//# sourceMappingURL=equipamento-detalhado.dto.js.map