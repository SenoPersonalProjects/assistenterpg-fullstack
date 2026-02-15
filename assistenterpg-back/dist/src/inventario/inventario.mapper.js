"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioMapper = void 0;
const common_1 = require("@nestjs/common");
const inventario_engine_1 = require("./engine/inventario.engine");
let InventarioMapper = class InventarioMapper {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    mapItem(item) {
        const categoriaCalculada = item.categoriaCalculada
            ? item.categoriaCalculada
            : this.engine.calcularCategoriaFinal(item.equipamento.categoria, item.modificacoes.length);
        const espacosCalculados = this.engine.calcularEspacoUnitario(item);
        return {
            id: item.id,
            equipamentoId: item.equipamentoId,
            equipamento: {
                id: item.equipamento.id,
                codigo: item.equipamento.codigo,
                nome: item.equipamento.nome,
                tipo: item.equipamento.tipo,
                categoria: item.equipamento.categoria,
                espacos: item.equipamento.espacos,
                complexidadeMaldicao: item.equipamento
                    .complexidadeMaldicao,
            },
            quantidade: item.quantidade,
            equipado: item.equipado,
            categoriaCalculada,
            espacosCalculados,
            nomeCustomizado: item.nomeCustomizado || null,
            notas: item.notas || null,
            modificacoes: item.modificacoes.map((m) => ({
                id: m.modificacao.id,
                codigo: m.modificacao.codigo,
                nome: m.modificacao.nome,
                descricao: m.modificacao.descricao || null,
                incrementoEspacos: m.modificacao.incrementoEspacos,
            })),
        };
    }
    mapStatsEquipados(stats) {
        return {
            defesaTotal: stats.defesaTotal,
            danosTotais: stats.danosTotais.map((d) => ({
                tipoDano: d.tipoDano,
                empunhadura: d.empunhadura,
                rolagem: d.rolagem,
                flat: d.flat,
            })),
            reducoesDano: stats.reducoesDano.map((r) => ({
                tipoReducao: r.tipoReducao,
                valor: r.valor,
            })),
            penalidadeCarga: stats.penalidadeCarga,
        };
    }
    mapInventarioCompleto(personagemBaseId, itens, espacosBase, espacosExtra) {
        const resultadoEspacos = this.engine.calcularResultadoEspacos(itens, espacosBase, espacosExtra);
        const statsEquipados = this.engine.calcularStatsEquipados(itens);
        return {
            personagemBaseId,
            espacosTotal: resultadoEspacos.espacosTotal,
            espacosOcupados: resultadoEspacos.espacosOcupados,
            espacosDisponiveis: resultadoEspacos.espacosDisponiveis,
            sobrecarregado: resultadoEspacos.sobrecarregado,
            itens: itens.map((item) => this.mapItem(item)),
            statsEquipados: this.mapStatsEquipados(statsEquipados),
        };
    }
};
exports.InventarioMapper = InventarioMapper;
exports.InventarioMapper = InventarioMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventario_engine_1.InventarioEngine])
], InventarioMapper);
//# sourceMappingURL=inventario.mapper.js.map