"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioCompletoDto = exports.StatsEquipadosDto = exports.ItemInventarioDto = exports.ModificacaoItemDto = exports.EquipamentoBaseDto = void 0;
class EquipamentoBaseDto {
    id;
    codigo;
    nome;
    tipo;
    categoria;
    espacos;
    complexidadeMaldicao;
}
exports.EquipamentoBaseDto = EquipamentoBaseDto;
class ModificacaoItemDto {
    id;
    codigo;
    nome;
    descricao;
    incrementoEspacos;
}
exports.ModificacaoItemDto = ModificacaoItemDto;
class ItemInventarioDto {
    id;
    equipamentoId;
    equipamento;
    quantidade;
    equipado;
    categoriaCalculada;
    espacosCalculados;
    nomeCustomizado;
    notas;
    modificacoes;
}
exports.ItemInventarioDto = ItemInventarioDto;
class StatsEquipadosDto {
    defesaTotal;
    danosTotais;
    reducoesDano;
    penalidadeCarga;
}
exports.StatsEquipadosDto = StatsEquipadosDto;
class InventarioCompletoDto {
    personagemBaseId;
    espacosTotal;
    espacosOcupados;
    espacosDisponiveis;
    sobrecarregado;
    itens;
    statsEquipados;
}
exports.InventarioCompletoDto = InventarioCompletoDto;
//# sourceMappingURL=inventario-completo.dto.js.map