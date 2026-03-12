"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicaDetalhadaDto = exports.HabilidadeTecnicaDto = exports.HabilidadeVariacaoDto = exports.ClaResumoDto = void 0;
class ClaResumoDto {
    id;
    nome;
    grandeCla;
}
exports.ClaResumoDto = ClaResumoDto;
class HabilidadeVariacaoDto {
    id;
    nome;
    descricao;
    substituiCustos;
    custoPE;
    custoEA;
    custoSustentacaoEA;
    custoSustentacaoPE;
    execucao;
    area;
    alcance;
    alvo;
    duracao;
    resistencia;
    dtResistencia;
    criticoValor;
    criticoMultiplicador;
    danoFlat;
    danoFlatTipo;
    dadosDano;
    escalonaPorGrau;
    escalonamentoCustoEA;
    escalonamentoCustoPE;
    escalonamentoTipo;
    escalonamentoEfeito;
    escalonamentoDano;
    efeitoAdicional;
    requisitos;
    ordem;
}
exports.HabilidadeVariacaoDto = HabilidadeVariacaoDto;
class HabilidadeTecnicaDto {
    id;
    codigo;
    nome;
    descricao;
    requisitos;
    execucao;
    area;
    alcance;
    alvo;
    duracao;
    resistencia;
    dtResistencia;
    custoPE;
    custoEA;
    custoSustentacaoEA;
    custoSustentacaoPE;
    testesExigidos;
    criticoValor;
    criticoMultiplicador;
    danoFlat;
    danoFlatTipo;
    dadosDano;
    escalonaPorGrau;
    grauTipoGrauCodigo;
    escalonamentoCustoEA;
    escalonamentoCustoPE;
    escalonamentoTipo;
    escalonamentoEfeito;
    escalonamentoDano;
    efeito;
    ordem;
    variacoes;
}
exports.HabilidadeTecnicaDto = HabilidadeTecnicaDto;
class TecnicaDetalhadaDto {
    id;
    codigo;
    nome;
    descricao;
    tipo;
    hereditaria;
    linkExterno;
    fonte;
    suplementoId;
    requisitos;
    clasHereditarios;
    habilidades;
    criadoEm;
    atualizadoEm;
}
exports.TecnicaDetalhadaDto = TecnicaDetalhadaDto;
//# sourceMappingURL=tecnica-detalhada.dto.js.map