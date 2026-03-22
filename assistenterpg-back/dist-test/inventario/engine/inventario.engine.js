"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ORDEM_CATEGORIAS = [
    client_1.CategoriaEquipamento.CATEGORIA_0,
    client_1.CategoriaEquipamento.CATEGORIA_4,
    client_1.CategoriaEquipamento.CATEGORIA_3,
    client_1.CategoriaEquipamento.CATEGORIA_2,
    client_1.CategoriaEquipamento.CATEGORIA_1,
    client_1.CategoriaEquipamento.ESPECIAL,
];
function isCategoriaEquipamento(value) {
    return (typeof value === 'string' &&
        ORDEM_CATEGORIAS.includes(value));
}
function isJsonObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function extrairNumeroJson(value, key) {
    if (!isJsonObject(value))
        return undefined;
    const raw = value[key];
    return typeof raw === 'number' ? raw : undefined;
}
let InventarioEngine = class InventarioEngine {
    calcularCategoriaFinal(categoriaOriginal, quantidadeModificacoes) {
        if (!isCategoriaEquipamento(categoriaOriginal)) {
            return client_1.CategoriaEquipamento.CATEGORIA_0;
        }
        const indexOriginal = ORDEM_CATEGORIAS.indexOf(categoriaOriginal);
        if (indexOriginal === -1) {
            return client_1.CategoriaEquipamento.CATEGORIA_0;
        }
        const indexFinal = Math.min(indexOriginal + quantidadeModificacoes, ORDEM_CATEGORIAS.length - 1);
        return ORDEM_CATEGORIAS[indexFinal];
    }
    calcularEspacosItem(item) {
        const espacosBase = item.equipamento.espacos;
        const incrementoModificacoes = item.modificacoes.reduce((total, mod) => total + (mod.modificacao.incrementoEspacos || 0), 0);
        const espacosUnitario = Math.max(0, espacosBase + incrementoModificacoes);
        return espacosUnitario * item.quantidade;
    }
    calcularEspacoUnitario(item) {
        const espacosBase = item.equipamento.espacos;
        const incrementoModificacoes = item.modificacoes.reduce((total, mod) => total + (mod.modificacao.incrementoEspacos || 0), 0);
        return Math.max(0, espacosBase + incrementoModificacoes);
    }
    calcularEspacosOcupados(itens) {
        return itens.reduce((total, item) => {
            return total + this.calcularEspacosItem(item);
        }, 0);
    }
    calcularEspacosExtraDeItens(itens) {
        let espacosExtra = 0;
        for (const item of itens) {
            const equip = item.equipamento;
            if (equip.espacos === 0 && equip.efeito) {
                const efeitoLower = equip.efeito.toLowerCase();
                const palavrasChave = [
                    'aumenta capacidade',
                    'aumenta sua capacidade',
                    'capacidade de carga',
                    'espaços de inventário',
                    'espaços extras',
                    'espaços adicionais',
                ];
                const temPalavraChave = palavrasChave.some((palavra) => efeitoLower.includes(palavra));
                if (temPalavraChave) {
                    const match = equip.efeito.match(/(\d+)\s*espaço/i);
                    if (match) {
                        const valor = parseInt(match[1], 10);
                        espacosExtra += valor * item.quantidade;
                    }
                }
            }
        }
        return espacosExtra;
    }
    calcularResultadoEspacos(itens, espacosBase, espacosExtra) {
        const espacosTotal = espacosBase + espacosExtra;
        const espacosOcupados = this.calcularEspacosOcupados(itens);
        const espacosDisponiveis = espacosTotal - espacosOcupados;
        const sobrecarregado = espacosOcupados > espacosTotal;
        return {
            espacosTotal,
            espacosOcupados,
            espacosDisponiveis,
            sobrecarregado,
        };
    }
    calcularStatsEquipados(itens) {
        const itensEquipados = itens.filter((item) => item.equipado);
        let defesaTotal = 0;
        itensEquipados.forEach((item) => {
            if (item.equipamento.tipo === client_1.TipoEquipamento.PROTECAO &&
                item.equipamento.bonusDefesa) {
                defesaTotal += item.equipamento.bonusDefesa * item.quantidade;
            }
            item.modificacoes.forEach((modJunction) => {
                const bonusDefesa = extrairNumeroJson(modJunction.modificacao.efeitosMecanicos, 'bonusDefesa');
                if (typeof bonusDefesa === 'number') {
                    defesaTotal += bonusDefesa * item.quantidade;
                }
            });
        });
        const danosPorChave = new Map();
        itensEquipados.forEach((item) => {
            if (!item.equipamento.danos) {
                return;
            }
            item.equipamento.danos.forEach((dano) => {
                const chave = `${dano.tipoDano}_${dano.empunhadura || 'default'}`;
                if (!danosPorChave.has(chave)) {
                    danosPorChave.set(chave, {
                        tipoDano: dano.tipoDano,
                        empunhadura: dano.empunhadura,
                        rolagens: [],
                        flat: 0,
                    });
                }
                const entry = danosPorChave.get(chave);
                entry.rolagens.push(dano.rolagem);
                entry.flat += dano.valorFlat;
            });
        });
        const danosTotais = Array.from(danosPorChave.values()).map((d) => ({
            tipoDano: d.tipoDano,
            empunhadura: d.empunhadura,
            rolagem: d.rolagens.join(' + '),
            flat: d.flat,
        }));
        const reducoesPorTipo = new Map();
        itensEquipados.forEach((item) => {
            if (item.equipamento.reducesDano) {
                item.equipamento.reducesDano.forEach((rd) => {
                    const valorAtual = reducoesPorTipo.get(rd.tipoReducao) || 0;
                    reducoesPorTipo.set(rd.tipoReducao, valorAtual + rd.valor * item.quantidade);
                });
            }
            item.modificacoes.forEach((modJunction) => {
                const rdAdicional = extrairNumeroJson(modJunction.modificacao.efeitosMecanicos, 'rdAdicional');
                if (typeof rdAdicional === 'number') {
                    if (item.equipamento.reducesDano) {
                        item.equipamento.reducesDano.forEach((rd) => {
                            const valorAtual = reducoesPorTipo.get(rd.tipoReducao) || 0;
                            reducoesPorTipo.set(rd.tipoReducao, valorAtual + rdAdicional * item.quantidade);
                        });
                    }
                }
            });
        });
        const reducoesDano = Array.from(reducoesPorTipo.entries()).map(([tipoReducao, valor]) => ({
            tipoReducao,
            valor,
        }));
        let penalidadeCarga = 0;
        itensEquipados.forEach((item) => {
            if (item.equipamento.tipo === client_1.TipoEquipamento.PROTECAO &&
                item.equipamento.penalidadeCarga) {
                penalidadeCarga += item.equipamento.penalidadeCarga;
            }
        });
        return {
            defesaTotal,
            danosTotais,
            reducoesDano,
            penalidadeCarga,
        };
    }
    validarSistemaVestir(itens) {
        const itensEquipados = itens.filter((item) => item.equipado);
        let totalVestiveis = 0;
        let totalVestimentas = 0;
        for (const item of itensEquipados) {
            const ehProtecao = item.equipamento.tipo === client_1.TipoEquipamento.PROTECAO;
            const ehVestimenta = item.equipamento.tipo === client_1.TipoEquipamento.ACESSORIO &&
                item.equipamento.tipoAcessorio === client_1.TipoAcessorio.VESTIMENTA;
            if (ehProtecao || ehVestimenta) {
                totalVestiveis += item.quantidade;
                if (ehVestimenta) {
                    totalVestimentas += item.quantidade;
                }
            }
        }
        const erros = [];
        if (totalVestiveis > 5) {
            erros.push(`Você tem ${totalVestiveis} itens vestidos, mas o máximo permitido é 5.`);
        }
        if (totalVestimentas > 2) {
            erros.push(`Você tem ${totalVestimentas} vestimentas equipadas, mas o máximo permitido é 2.`);
        }
        return {
            valido: erros.length === 0,
            erros,
            totalVestiveis,
            totalVestimentas,
            limiteVestiveis: 5,
            limiteVestimentas: 2,
        };
    }
    validarAdicaoItem(itemEspacos, espacosDisponiveis) {
        if (itemEspacos > espacosDisponiveis) {
            return {
                valido: false,
                erro: `Item ocupa ${itemEspacos} espaço(s), mas você tem apenas ${espacosDisponiveis} disponível(is).`,
            };
        }
        return { valido: true };
    }
    validarAplicacaoModificacao(item, modificacao, espacosDisponiveisAtuais) {
        const jaTemModificacao = item.modificacoes.some((m) => m.modificacao.id === modificacao.id);
        if (jaTemModificacao) {
            return {
                valido: false,
                erro: 'Este item já possui essa modificação.',
            };
        }
        const espacosAdicionais = modificacao.incrementoEspacos * item.quantidade;
        if (espacosAdicionais > espacosDisponiveisAtuais) {
            return {
                valido: false,
                erro: `Aplicar esta modificação requer ${espacosAdicionais} espaço(s) adicionais, mas você tem apenas ${espacosDisponiveisAtuais} disponível(is).`,
            };
        }
        return { valido: true };
    }
    calcularGrauXama(prestigioBase) {
        const ordemGraus = [
            { prestigioMin: 200, grau: client_1.GrauFeiticeiro.ESPECIAL },
            { prestigioMin: 120, grau: client_1.GrauFeiticeiro.GRAU_1 },
            { prestigioMin: 90, grau: client_1.GrauFeiticeiro.SEMI_1 },
            { prestigioMin: 60, grau: client_1.GrauFeiticeiro.GRAU_2 },
            { prestigioMin: 30, grau: client_1.GrauFeiticeiro.GRAU_3 },
            { prestigioMin: 0, grau: client_1.GrauFeiticeiro.GRAU_4 },
        ];
        const grauElegivel = ordemGraus
            .filter((grau) => grau.prestigioMin <= prestigioBase)
            .sort((a, b) => b.prestigioMin - a.prestigioMin)[0];
        return {
            grau: grauElegivel.grau,
            prestigioMinimo: grauElegivel.prestigioMin,
        };
    }
    validarLimitesGrauXama(prestigioBase, limitesPorCategoria, itensPorCategoria) {
        const { grau } = this.calcularGrauXama(prestigioBase);
        const erros = [];
        const limitesAtuais = { ...limitesPorCategoria };
        const itensPorCategoriaAtual = { ...itensPorCategoria };
        const categorias = [
            'CATEGORIA_0',
            'CATEGORIA_4',
            'CATEGORIA_3',
            'CATEGORIA_2',
            'CATEGORIA_1',
            'ESPECIAL',
        ];
        categorias.forEach((categoria) => {
            if (categoria === 'CATEGORIA_0')
                return;
            const limite = limitesPorCategoria[categoria] ?? 0;
            const atual = itensPorCategoriaAtual[categoria] ?? 0;
            if (atual > limite) {
                erros.push(`Categoria ${categoria}: ${atual}/${limite} itens ` +
                    `(Grau ${grau} não permite mais itens desta categoria)`);
            }
        });
        return {
            valido: erros.length === 0,
            erros,
            grauAtual: grau,
            limitesAtuais,
            itensPorCategoriaAtual,
        };
    }
    previewAdicionarItem(itensAtuais, novoItem, personagem, limitesGrauXama) {
        const espacos = this.calcularResultadoEspacos(itensAtuais, personagem.espacosInventarioBase, personagem.espacosInventarioExtra);
        const itensPorCategoriaAtual = itensAtuais.reduce((acc, item) => {
            const cat = item.categoriaCalculada || item.equipamento.categoria;
            acc[cat] = (acc[cat] ?? 0) + item.quantidade;
            return acc;
        }, {});
        const categoriaNovoItem = isCategoriaEquipamento(novoItem.equipamento.categoria)
            ? novoItem.equipamento.categoria
            : client_1.CategoriaEquipamento.CATEGORIA_0;
        itensPorCategoriaAtual[categoriaNovoItem] =
            (itensPorCategoriaAtual[categoriaNovoItem] ?? 0) + novoItem.quantidade;
        const validacaoGrauXama = this.validarLimitesGrauXama(personagem.prestigioBase, limitesGrauXama, itensPorCategoriaAtual);
        const stats = this.calcularStatsEquipados(itensAtuais);
        return {
            espacos,
            grauXama: validacaoGrauXama,
            stats,
        };
    }
};
exports.InventarioEngine = InventarioEngine;
exports.InventarioEngine = InventarioEngine = __decorate([
    (0, common_1.Injectable)()
], InventarioEngine);
//# sourceMappingURL=inventario.engine.js.map