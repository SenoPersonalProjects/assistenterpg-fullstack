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
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const inventario_engine_1 = require("./engine/inventario.engine");
const inventario_mapper_1 = require("./inventario.mapper");
const inventario_exception_1 = require("../common/exceptions/inventario.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
let InventarioService = class InventarioService {
    prisma;
    engine;
    mapper;
    constructor(prisma, engine, mapper) {
        this.prisma = prisma;
        this.engine = engine;
        this.mapper = mapper;
    }
    async validarPropriedade(personagemBaseId, donoId, prisma) {
        const db = prisma || this.prisma;
        const personagem = await db.personagemBase.findFirst({
            where: { id: personagemBaseId, donoId },
        });
        if (!personagem) {
            throw new inventario_exception_1.InventarioSemPermissaoException(personagemBaseId, donoId);
        }
    }
    async buscarLimitesGrauXama(prestigioBase, prisma) {
        const db = prisma || this.prisma;
        const limiteGrau = await db.grauFeiticeiroLimite.findFirst({
            where: {
                prestigioMin: {
                    lte: prestigioBase,
                },
            },
            orderBy: {
                prestigioMin: 'desc',
            },
        });
        return limiteGrau?.limitesPorCategoria || {};
    }
    async carregarItensInventario(personagemBaseId, prisma) {
        const db = prisma || this.prisma;
        const itens = await db.inventarioItemBase.findMany({
            where: { personagemBaseId },
            include: {
                equipamento: {
                    include: {
                        danos: {
                            orderBy: { ordem: 'asc' },
                        },
                        reducesDano: true,
                    },
                },
                modificacoes: {
                    include: {
                        modificacao: true,
                    },
                },
            },
            orderBy: [{ equipado: 'desc' }, { equipamento: { nome: 'asc' } }],
        });
        return itens;
    }
    async calcularEspacosPersonagem(personagemBaseId, prisma) {
        const db = prisma || this.prisma;
        const personagem = await db.personagemBase.findUnique({
            where: { id: personagemBaseId },
            select: {
                forca: true,
                espacosInventarioBase: true,
                espacosInventarioExtra: true,
                prestigioBase: true,
            },
        });
        if (!personagem) {
            throw new inventario_exception_1.InventarioPersonagemNaoEncontradoException(personagemBaseId);
        }
        return {
            espacosBase: personagem.espacosInventarioBase,
            espacosExtra: personagem.espacosInventarioExtra,
            prestigioBase: personagem.prestigioBase,
        };
    }
    async atualizarEstadoInventario(personagemBaseId, prisma) {
        const db = prisma || this.prisma;
        const itens = await this.carregarItensInventario(personagemBaseId, db);
        const personagem = await db.personagemBase.findUnique({
            where: { id: personagemBaseId },
            select: {
                forca: true,
                espacosInventarioBase: true,
            },
        });
        if (!personagem)
            return;
        const espacosExtraDeItens = this.engine.calcularEspacosExtraDeItens(itens);
        const espacosOcupados = this.engine.calcularEspacosOcupados(itens);
        const espacosTotal = personagem.espacosInventarioBase + espacosExtraDeItens;
        const sobrecarregado = espacosOcupados > espacosTotal;
        const statsEquipados = this.engine.calcularStatsEquipados(itens);
        const resistenciasMap = new Map();
        statsEquipados.reducoesDano.forEach((rd) => {
            resistenciasMap.set(rd.tipoReducao, rd.valor);
        });
        await db.personagemBase.update({
            where: { id: personagemBaseId },
            data: {
                espacosInventarioExtra: espacosExtraDeItens,
                espacosOcupados,
                sobrecarregado,
                defesaEquipamento: statsEquipados.defesaTotal,
            },
        });
        await db.personagemBaseResistencia.deleteMany({
            where: { personagemBaseId },
        });
        if (resistenciasMap.size > 0) {
            const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(resistenciasMap, db);
            if (resistenciasParaCriar.length > 0) {
                await db.personagemBaseResistencia.createMany({
                    data: resistenciasParaCriar.map((r) => ({
                        personagemBaseId,
                        resistenciaTipoId: r.resistenciaTipoId,
                        valor: r.valor,
                    })),
                });
            }
        }
    }
    async prepararResistenciasParaCriacao(resistencias, prisma) {
        const db = prisma || this.prisma;
        if (!resistencias || resistencias.size === 0) {
            return [];
        }
        const resistenciasValidas = Array.from(resistencias.entries()).filter(([_, valor]) => valor > 0);
        if (resistenciasValidas.length === 0) {
            return [];
        }
        const codigos = resistenciasValidas.map(([codigo]) => codigo);
        const resistenciasTipo = await db.resistenciaTipo.findMany({
            where: { codigo: { in: codigos } },
            select: { id: true, codigo: true },
        });
        const codigoToId = new Map(resistenciasTipo.map((r) => [r.codigo, r.id]));
        return resistenciasValidas
            .filter(([codigo]) => codigoToId.has(codigo))
            .map(([codigo, valor]) => ({
            resistenciaTipoId: codigoToId.get(codigo),
            valor,
        }));
    }
    async validarSistemaVestir(personagemBaseId, novoItemVestivel, itemIdIgnorar, prisma) {
        const db = prisma || this.prisma;
        const itens = await this.carregarItensInventario(personagemBaseId, db);
        const itensEquipados = itens.filter((item) => item.equipado && item.id !== itemIdIgnorar);
        const itensSimulados = [...itensEquipados];
        itensSimulados.push({
            equipado: true,
            quantidade: novoItemVestivel.quantidade,
            equipamento: {
                tipo: novoItemVestivel.tipo,
                tipoAcessorio: novoItemVestivel.tipoAcessorio,
            },
        });
        const validacao = this.engine.validarSistemaVestir(itensSimulados);
        if (!validacao.valido) {
            throw new inventario_exception_1.InventarioLimiteVestirExcedidoException({
                erros: validacao.erros,
                totalVestiveis: validacao.totalVestiveis,
                totalVestimentas: validacao.totalVestimentas,
                limiteVestiveis: validacao.limiteVestiveis,
                limiteVestimentas: validacao.limiteVestimentas,
            });
        }
    }
    async validarLimite2xCapacidade(personagemBaseId, espacosAdicionais, prisma) {
        const db = prisma || this.prisma;
        const itens = await this.carregarItensInventario(personagemBaseId, db);
        const { espacosBase, espacosExtra } = await this.calcularEspacosPersonagem(personagemBaseId, db);
        const espacosOcupados = this.engine.calcularEspacosOcupados(itens);
        const capacidadeTotal = espacosBase + espacosExtra;
        const limiteMaximo = capacidadeTotal * 2;
        const espacosAposAdicao = espacosOcupados + espacosAdicionais;
        if (espacosAposAdicao > limiteMaximo) {
            throw new inventario_exception_1.InventarioCapacidadeExcedidaException({
                espacosOcupados,
                espacosAdicionais,
                espacosAposAdicao,
                capacidadeNormal: capacidadeTotal,
                limiteMaximo,
                excedente: espacosAposAdicao - limiteMaximo,
            });
        }
    }
    async buscarInventario(donoId, personagemBaseId) {
        await this.validarPropriedade(personagemBaseId, donoId);
        const itens = await this.carregarItensInventario(personagemBaseId);
        const { espacosBase, espacosExtra, prestigioBase } = await this.calcularEspacosPersonagem(personagemBaseId);
        const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);
        const resultadoEspacos = this.engine.calcularResultadoEspacos(itens, espacosBase, espacosExtra);
        const statsEquipados = this.engine.calcularStatsEquipados(itens);
        const itensPorCategoria = itens.reduce((acc, item) => {
            const cat = item.categoriaCalculada || item.equipamento.categoria;
            acc[cat] = (acc[cat] || 0) + item.quantidade;
            return acc;
        }, {});
        const resumoPorCategoria = Object.entries(limitesGrauXama).map(([cat, limite]) => ({
            categoria: cat,
            quantidadeItens: itensPorCategoria[cat] || 0,
            quantidadeTotal: itensPorCategoria[cat] || 0,
            limiteGrauXama: limite,
            podeAdicionarMais: (itensPorCategoria[cat] || 0) < limite,
        }));
        return {
            espacos: resultadoEspacos,
            grauXama: {
                grauAtual: this.engine.calcularGrauXama(prestigioBase).grau,
                prestigioMinimoRequisito: Math.max(...Object.values(limitesGrauXama).map(Number)),
            },
            resumoPorCategoria,
            podeAdicionarCategoria0: true,
            statsEquipados,
        };
    }
    async previewAdicionarItem(donoId, dto) {
        await this.validarPropriedade(dto.personagemBaseId, donoId);
        const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
            where: { id: dto.equipamentoId },
            include: {
                danos: true,
                reducesDano: true,
            },
        });
        if (!equipamento) {
            throw new inventario_exception_1.InventarioEquipamentoNaoEncontradoException(dto.equipamentoId);
        }
        const itensAtuais = await this.carregarItensInventario(dto.personagemBaseId);
        const { espacosBase, espacosExtra, prestigioBase } = await this.calcularEspacosPersonagem(dto.personagemBaseId);
        const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);
        const previewCompleto = this.engine.previewAdicionarItem(itensAtuais, {
            equipamento,
            quantidade: dto.quantidade || 1,
        }, {
            espacosInventarioBase: espacosBase,
            espacosInventarioExtra: espacosExtra,
            prestigioBase,
        }, limitesGrauXama);
        return previewCompleto;
    }
    async previewItensInventario(dto) {
        try {
            const { forca, prestigioBase, itens } = dto;
            const equipamentosIds = [...new Set(itens.map((i) => i.equipamentoId))];
            const equipamentos = await this.prisma.equipamentoCatalogo.findMany({
                where: { id: { in: equipamentosIds } },
            });
            const modificacoesIds = [
                ...new Set(itens.flatMap((i) => i.modificacoes || [])),
            ];
            const modificacoes = modificacoesIds.length > 0
                ? await this.prisma.modificacaoEquipamento.findMany({
                    where: { id: { in: modificacoesIds } },
                })
                : [];
            const equipamentosMap = new Map(equipamentos.map((e) => [e.id, e]));
            const modificacoesMap = new Map(modificacoes.map((m) => [m.id, m]));
            const itensCalculados = itens.map((item) => {
                const equipamento = equipamentosMap.get(item.equipamentoId);
                if (!equipamento) {
                    throw new inventario_exception_1.InventarioEquipamentoNaoEncontradoException(item.equipamentoId);
                }
                const modsDoItem = (item.modificacoes || [])
                    .map((id) => modificacoesMap.get(id))
                    .filter((mod) => mod !== undefined);
                const categoriaCalculada = this.engine.calcularCategoriaFinal(equipamento.categoria, modsDoItem.length);
                const espacosBaseItem = equipamento.espacos;
                const incrementoMods = modsDoItem.reduce((total, m) => total + (m.incrementoEspacos || 0), 0);
                const espacosCalculados = Math.max(0, espacosBaseItem + incrementoMods);
                return {
                    equipamentoId: item.equipamentoId,
                    quantidade: item.quantidade,
                    equipado: item.equipado,
                    categoriaCalculada: String(categoriaCalculada),
                    espacosCalculados,
                    nomeCustomizado: item.nomeCustomizado,
                    modificacoes: modsDoItem.map((m) => ({
                        id: m.id,
                        nome: m.nome,
                        incrementoEspacos: m.incrementoEspacos || 0,
                    })),
                    equipamento: {
                        id: equipamento.id,
                        nome: equipamento.nome,
                        codigo: equipamento.codigo,
                        tipo: equipamento.tipo,
                        categoria: equipamento.categoria,
                        espacos: equipamento.espacos,
                    },
                };
            });
            const espacosBase = forca * 5;
            const espacosExtra = this.engine.calcularEspacosExtraDeItens(itensCalculados.map((i) => ({
                equipamentoId: i.equipamentoId,
                quantidade: i.quantidade,
                equipamento: equipamentosMap.get(i.equipamentoId),
            })));
            const espacosTotal = espacosBase + espacosExtra;
            const espacosOcupados = itensCalculados.reduce((total, item) => {
                return total + item.espacosCalculados * item.quantidade;
            }, 0);
            const sobrecarregado = espacosOcupados > espacosTotal;
            const grauXamaInfo = this.engine.calcularGrauXama(prestigioBase);
            const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);
            const itensPorCategoria = {
                CATEGORIA_0: 0,
                CATEGORIA_4: 0,
                CATEGORIA_3: 0,
                CATEGORIA_2: 0,
                CATEGORIA_1: 0,
                ESPECIAL: 0,
            };
            itensCalculados.forEach((item) => {
                const cat = item.categoriaCalculada;
                itensPorCategoria[cat] =
                    (itensPorCategoria[cat] || 0) + item.quantidade;
            });
            return {
                itens: itensCalculados,
                espacosBase,
                espacosExtra,
                espacosTotal,
                espacosOcupados,
                sobrecarregado,
                grauXama: {
                    grau: grauXamaInfo.grau,
                    limitesPorCategoria: limitesGrauXama,
                },
                itensPorCategoria,
            };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async adicionarItem(donoId, dto, options) {
        try {
            const db = options?.tx || this.prisma;
            if (!options?.skipOwnershipCheck) {
                await this.validarPropriedade(dto.personagemBaseId, donoId, db);
                const preview = await this.previewAdicionarItem(donoId, {
                    personagemBaseId: dto.personagemBaseId,
                    equipamentoId: dto.equipamentoId,
                    quantidade: dto.quantidade,
                    modificacoes: dto.modificacoes,
                });
                if (!preview.grauXama.valido && !dto.ignorarLimitesGrauXama) {
                    throw new inventario_exception_1.InventarioGrauXamaExcedidoException(preview.grauXama.grauAtual, preview.grauXama.erros);
                }
            }
            const equipamento = await db.equipamentoCatalogo.findUnique({
                where: { id: dto.equipamentoId },
                include: {
                    danos: true,
                    reducesDano: true,
                },
            });
            if (!equipamento) {
                throw new inventario_exception_1.InventarioEquipamentoNaoEncontradoException(dto.equipamentoId);
            }
            let modificacoesValidas = [];
            if (dto.modificacoes && dto.modificacoes.length > 0) {
                modificacoesValidas = await db.modificacaoEquipamento.findMany({
                    where: { id: { in: dto.modificacoes } },
                });
                if (modificacoesValidas.length !== dto.modificacoes.length) {
                    const idsEncontrados = modificacoesValidas.map((m) => m.id);
                    const idsInvalidos = dto.modificacoes.filter((id) => !idsEncontrados.includes(id));
                    throw new inventario_exception_1.InventarioModificacaoInvalidaException(idsInvalidos);
                }
                for (const modId of dto.modificacoes) {
                    const compativel = await db.equipamentoModificacaoAplicavel.findFirst({
                        where: {
                            equipamentoId: dto.equipamentoId,
                            modificacaoId: modId,
                        },
                    });
                    if (!compativel) {
                        throw new inventario_exception_1.InventarioModificacaoIncompativelException(modId, dto.equipamentoId);
                    }
                }
            }
            const categoriaCalculada = this.engine.calcularCategoriaFinal(equipamento.categoria, modificacoesValidas.length);
            const espacosBaseItem = equipamento.espacos;
            const incrementoMods = modificacoesValidas.reduce((total, m) => total + (m.incrementoEspacos || 0), 0);
            const espacosUnitario = Math.max(0, espacosBaseItem + incrementoMods);
            const espacosTotaisItem = espacosUnitario * (dto.quantidade || 1);
            await this.validarLimite2xCapacidade(dto.personagemBaseId, espacosTotaisItem, db);
            if (dto.equipado) {
                await this.validarSistemaVestir(dto.personagemBaseId, {
                    tipo: equipamento.tipo,
                    tipoAcessorio: equipamento.tipoAcessorio,
                    quantidade: dto.quantidade || 1,
                }, undefined, db);
            }
            const item = await db.inventarioItemBase.create({
                data: {
                    personagemBaseId: dto.personagemBaseId,
                    equipamentoId: dto.equipamentoId,
                    quantidade: dto.quantidade || 1,
                    equipado: dto.equipado ?? false,
                    categoriaCalculada,
                    espacosCalculados: espacosUnitario,
                    nomeCustomizado: dto.nomeCustomizado,
                    notas: dto.notas,
                },
                include: {
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: {
                            modificacao: true,
                        },
                    },
                },
            });
            if (modificacoesValidas.length > 0) {
                await db.inventarioItemBaseModificacao.createMany({
                    data: modificacoesValidas.map((mod) => ({
                        itemId: item.id,
                        modificacaoId: mod.id,
                    })),
                });
            }
            await this.atualizarEstadoInventario(dto.personagemBaseId, db);
            const itemComMods = await db.inventarioItemBase.findUnique({
                where: { id: item.id },
                include: {
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: {
                            modificacao: true,
                        },
                    },
                },
            });
            return this.mapper.mapItem(itemComMods);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async atualizarItem(donoId, itemId, dto) {
        try {
            const itemExiste = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: {
                    personagemBase: true,
                    equipamento: true,
                    modificacoes: {
                        include: { modificacao: true },
                    },
                },
            });
            if (!itemExiste) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            await this.validarPropriedade(itemExiste.personagemBaseId, donoId);
            if (dto.quantidade !== undefined &&
                dto.quantidade !== itemExiste.quantidade) {
                const itensAtuais = await this.carregarItensInventario(itemExiste.personagemBaseId);
                const { espacosBase, espacosExtra } = await this.calcularEspacosPersonagem(itemExiste.personagemBaseId);
                const espacosSemEsteItem = itensAtuais
                    .filter((i) => i.id !== itemId)
                    .reduce((total, i) => total + this.engine.calcularEspacosItem(i), 0);
                const espacosDisponiveis = espacosBase + espacosExtra - espacosSemEsteItem;
                const espacosBaseItem = itemExiste.equipamento.espacos;
                const incrementoMods = itemExiste.modificacoes.reduce((total, m) => total + (m.modificacao.incrementoEspacos || 0), 0);
                const espacosNovaQuantidade = Math.max(0, espacosBaseItem + incrementoMods) * dto.quantidade;
                const capacidadeTotal = espacosBase + espacosExtra;
                const limiteMaximo = capacidadeTotal * 2;
                const espacosTotaisApos = espacosSemEsteItem + espacosNovaQuantidade;
                if (espacosTotaisApos > limiteMaximo) {
                    throw new inventario_exception_1.InventarioCapacidadeExcedidaException({
                        espacosOcupados: espacosSemEsteItem,
                        espacosAdicionais: espacosNovaQuantidade,
                        espacosAposAdicao: espacosTotaisApos,
                        capacidadeNormal: capacidadeTotal,
                        limiteMaximo,
                        excedente: espacosTotaisApos - limiteMaximo,
                    });
                }
                if (espacosNovaQuantidade > espacosDisponiveis) {
                    throw new inventario_exception_1.InventarioEspacosInsuficientesException(espacosNovaQuantidade, espacosDisponiveis);
                }
            }
            if (dto.equipado === true && !itemExiste.equipado) {
                await this.validarSistemaVestir(itemExiste.personagemBaseId, {
                    tipo: itemExiste.equipamento.tipo,
                    tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
                    quantidade: dto.quantidade ?? itemExiste.quantidade,
                }, itemId);
            }
            if (itemExiste.equipado &&
                dto.quantidade !== undefined &&
                dto.quantidade !== itemExiste.quantidade) {
                await this.validarSistemaVestir(itemExiste.personagemBaseId, {
                    tipo: itemExiste.equipamento.tipo,
                    tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
                    quantidade: dto.quantidade,
                }, itemId);
            }
            const itemAtualizado = await this.prisma.inventarioItemBase.update({
                where: { id: itemId },
                data: {
                    quantidade: dto.quantidade,
                    equipado: dto.equipado,
                    nomeCustomizado: dto.nomeCustomizado,
                    notas: dto.notas,
                },
                include: {
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: {
                            modificacao: true,
                        },
                    },
                },
            });
            await this.atualizarEstadoInventario(itemExiste.personagemBaseId);
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removerItem(donoId, itemId) {
        try {
            const item = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: { personagemBase: true },
            });
            if (!item) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            await this.validarPropriedade(item.personagemBaseId, donoId);
            await this.prisma.inventarioItemBaseModificacao.deleteMany({
                where: { itemId: itemId },
            });
            await this.prisma.inventarioItemBase.delete({
                where: { id: itemId },
            });
            await this.atualizarEstadoInventario(item.personagemBaseId);
            return { sucesso: true, mensagem: 'Item removido com sucesso' };
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async aplicarModificacao(donoId, itemId, dto) {
        try {
            const item = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: {
                    personagemBase: true,
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: { modificacao: true },
                    },
                },
            });
            if (!item) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            await this.validarPropriedade(item.personagemBaseId, donoId);
            const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
                where: { id: dto.modificacaoId },
            });
            if (!modificacao) {
                throw new inventario_exception_1.InventarioModificacaoNaoEncontradaException(dto.modificacaoId);
            }
            const compativel = await this.prisma.equipamentoModificacaoAplicavel.findFirst({
                where: {
                    equipamentoId: item.equipamentoId,
                    modificacaoId: dto.modificacaoId,
                },
            });
            if (!compativel) {
                throw new inventario_exception_1.InventarioModificacaoIncompativelException(dto.modificacaoId, item.equipamentoId);
            }
            const jaTemModificacao = item.modificacoes.some((m) => m.modificacao.id === dto.modificacaoId);
            if (jaTemModificacao) {
                throw new inventario_exception_1.InventarioModificacaoDuplicadaException(dto.modificacaoId, itemId);
            }
            await this.prisma.inventarioItemBaseModificacao.create({
                data: {
                    itemId: itemId,
                    modificacaoId: dto.modificacaoId,
                },
            });
            const novaQuantidadeModificacoes = item.modificacoes.length + 1;
            const categoriaCalculada = this.engine.calcularCategoriaFinal(item.equipamento.categoria, novaQuantidadeModificacoes);
            const espacosBaseItem = item.equipamento.espacos;
            const incrementoModsNovo = item.modificacoes.reduce((total, m) => total + (m.modificacao.incrementoEspacos || 0), 0) + (modificacao.incrementoEspacos || 0);
            const espacosCalculadosNovo = Math.max(0, espacosBaseItem + incrementoModsNovo);
            await this.prisma.inventarioItemBase.update({
                where: { id: itemId },
                data: {
                    categoriaCalculada,
                    espacosCalculados: espacosCalculadosNovo,
                },
            });
            await this.atualizarEstadoInventario(item.personagemBaseId);
            const itemAtualizado = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: {
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: {
                            modificacao: true,
                        },
                    },
                },
            });
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
    async removerModificacao(donoId, itemId, dto) {
        try {
            const item = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: {
                    personagemBase: true,
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: { modificacao: true },
                    },
                },
            });
            if (!item) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            await this.validarPropriedade(item.personagemBaseId, donoId);
            const temModificacao = item.modificacoes.some((m) => m.modificacao.id === dto.modificacaoId);
            if (!temModificacao) {
                throw new inventario_exception_1.InventarioModificacaoNaoAplicadaException(dto.modificacaoId, itemId);
            }
            await this.prisma.inventarioItemBaseModificacao.delete({
                where: {
                    itemId_modificacaoId: {
                        itemId: itemId,
                        modificacaoId: dto.modificacaoId,
                    },
                },
            });
            const novaQuantidadeModificacoes = item.modificacoes.length - 1;
            const categoriaCalculada = this.engine.calcularCategoriaFinal(item.equipamento.categoria, novaQuantidadeModificacoes);
            const modRemovida = item.modificacoes.find((m) => m.modificacao.id === dto.modificacaoId);
            const espacosBaseItem = item.equipamento.espacos;
            const incrementoModsNovo = item.modificacoes
                .filter((m) => m.modificacao.id !== dto.modificacaoId)
                .reduce((total, m) => total + (m.modificacao.incrementoEspacos || 0), 0);
            const espacosCalculadosNovo = Math.max(0, espacosBaseItem + incrementoModsNovo);
            await this.prisma.inventarioItemBase.update({
                where: { id: itemId },
                data: {
                    categoriaCalculada,
                    espacosCalculados: espacosCalculadosNovo,
                },
            });
            await this.atualizarEstadoInventario(item.personagemBaseId);
            const itemAtualizado = await this.prisma.inventarioItemBase.findUnique({
                where: { id: itemId },
                include: {
                    equipamento: {
                        include: {
                            danos: true,
                            reducesDano: true,
                        },
                    },
                    modificacoes: {
                        include: {
                            modificacao: true,
                        },
                    },
                },
            });
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            if (error.code?.startsWith('P')) {
                (0, database_exception_1.handlePrismaError)(error);
            }
            throw error;
        }
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventario_engine_1.InventarioEngine,
        inventario_mapper_1.InventarioMapper])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map