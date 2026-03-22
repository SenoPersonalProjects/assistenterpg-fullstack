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
exports.CampanhaInventarioService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const campanha_access_service_1 = require("./campanha.access.service");
const inventario_engine_1 = require("../inventario/engine/inventario.engine");
const inventario_mapper_1 = require("../inventario/inventario.mapper");
const inventario_exception_1 = require("src/common/exceptions/inventario.exception");
const database_exception_1 = require("src/common/exceptions/database.exception");
const regras_derivados_1 = require("../personagem-base/regras-criacao/regras-derivados");
const inventarioItemCampanhaComDadosInclude = client_1.Prisma.validator()({
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
});
const modificacaoCalculoSelect = client_1.Prisma.validator()({
    id: true,
    incrementoEspacos: true,
});
let CampanhaInventarioService = class CampanhaInventarioService {
    prisma;
    accessService;
    engine;
    mapper;
    constructor(prisma, accessService, engine, mapper) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.engine = engine;
        this.mapper = mapper;
    }
    tratarErroPrisma(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            error instanceof client_1.Prisma.PrismaClientValidationError) {
            (0, database_exception_1.handlePrismaError)(error);
        }
    }
    async validarPermissao(campanhaId, personagemCampanhaId, usuarioId) {
        return this.accessService.obterPersonagemCampanhaComPermissao(campanhaId, personagemCampanhaId, usuarioId, true);
    }
    async buscarLimitesGrauXama(prestigioBase, prisma) {
        const db = prisma ?? this.prisma;
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
    async carregarItensInventarioCampanha(personagemCampanhaId, prisma) {
        const db = prisma ?? this.prisma;
        const itens = await db.inventarioItemCampanha.findMany({
            where: { personagemCampanhaId },
            include: inventarioItemCampanhaComDadosInclude,
            orderBy: [{ equipado: 'desc' }, { equipamento: { nome: 'asc' } }],
        });
        return itens;
    }
    async calcularEspacosPersonagemCampanha(personagemCampanhaId, prisma) {
        const db = prisma ?? this.prisma;
        const personagem = await db.personagemCampanha.findUnique({
            where: { id: personagemCampanhaId },
            select: {
                personagemBaseId: true,
                defesaBase: true,
                defesaEquipamento: true,
                defesaOutros: true,
                esquiva: true,
                bloqueio: true,
                espacosInventarioBase: true,
                espacosInventarioExtra: true,
                prestigioGeral: true,
            },
        });
        if (!personagem) {
            return {
                personagemBaseId: 0,
                defesaBase: 10,
                defesaEquipamento: 0,
                defesaOutros: 0,
                esquiva: 0,
                bloqueio: 0,
                espacosBase: 0,
                espacosExtra: 0,
                prestigioGeral: 0,
            };
        }
        return {
            personagemBaseId: personagem.personagemBaseId,
            defesaBase: personagem.defesaBase ?? 10,
            defesaEquipamento: personagem.defesaEquipamento ?? 0,
            defesaOutros: personagem.defesaOutros ?? 0,
            esquiva: personagem.esquiva ?? 0,
            bloqueio: personagem.bloqueio ?? 0,
            espacosBase: personagem.espacosInventarioBase,
            espacosExtra: personagem.espacosInventarioExtra,
            prestigioGeral: personagem.prestigioGeral ?? 0,
        };
    }
    async obterPericiasPersonagemBase(personagemBaseId, prisma) {
        const db = prisma ?? this.prisma;
        const pericias = await db.personagemBase.findUnique({
            where: { id: personagemBaseId },
            select: {
                pericias: {
                    select: {
                        grauTreinamento: true,
                        bonusExtra: true,
                        pericia: { select: { codigo: true } },
                    },
                },
            },
        });
        const mapa = new Map();
        pericias?.pericias.forEach((pericia) => {
            mapa.set(pericia.pericia.codigo, {
                grauTreinamento: pericia.grauTreinamento,
                bonusExtra: pericia.bonusExtra,
            });
        });
        return mapa;
    }
    async atualizarEstadoInventarioCampanha(personagemCampanhaId, prisma) {
        const db = prisma ?? this.prisma;
        const itens = await this.carregarItensInventarioCampanha(personagemCampanhaId, db);
        const personagem = await this.calcularEspacosPersonagemCampanha(personagemCampanhaId, db);
        if (!personagem.personagemBaseId)
            return;
        const espacosExtraDeItens = this.engine.calcularEspacosExtraDeItens(itens);
        const espacosOcupados = this.engine.calcularEspacosOcupados(itens);
        const espacosTotal = personagem.espacosBase + espacosExtraDeItens;
        const sobrecarregado = espacosOcupados > espacosTotal;
        const statsEquipados = this.engine.calcularStatsEquipados(itens);
        const defesaEquipamentoNovo = statsEquipados.defesaTotal;
        const defesaTotalAntes = personagem.defesaBase +
            personagem.defesaEquipamento +
            personagem.defesaOutros;
        const defesaTotalNova = personagem.defesaBase + defesaEquipamentoNovo + personagem.defesaOutros;
        const periciasMap = await this.obterPericiasPersonagemBase(personagem.personagemBaseId, db);
        const { bloqueio: bloqueioBaseAntes, esquiva: esquivaBaseAntes } = (0, regras_derivados_1.calcularBloqueioEsquiva)({
            defesa: defesaTotalAntes,
            periciasMap,
        });
        const { bloqueio: bloqueioBaseNovo, esquiva: esquivaBaseNova } = (0, regras_derivados_1.calcularBloqueioEsquiva)({
            defesa: defesaTotalNova,
            periciasMap,
        });
        const deltaEsquiva = esquivaBaseNova - esquivaBaseAntes;
        const deltaBloqueio = bloqueioBaseNovo - bloqueioBaseAntes;
        await db.personagemCampanha.update({
            where: { id: personagemCampanhaId },
            data: {
                espacosInventarioExtra: espacosExtraDeItens,
                espacosOcupados,
                sobrecarregado,
                defesaEquipamento: defesaEquipamentoNovo,
                esquiva: personagem.esquiva + deltaEsquiva,
                bloqueio: personagem.bloqueio + deltaBloqueio,
            },
        });
    }
    async recalcularEstadoInventarioCampanha(personagemCampanhaId) {
        await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
    }
    async validarSistemaVestir(personagemCampanhaId, novoItemVestivel, itemIdIgnorar, prisma) {
        const db = prisma ?? this.prisma;
        const itens = await this.carregarItensInventarioCampanha(personagemCampanhaId, db);
        const itensEquipados = itens.filter((item) => item.equipado && item.id !== itemIdIgnorar);
        const itensSimulados = [...itensEquipados];
        const itemSimulado = {
            id: -1,
            equipamentoId: -1,
            equipado: true,
            quantidade: novoItemVestivel.quantidade,
            nomeCustomizado: null,
            notas: null,
            categoriaCalculada: null,
            equipamento: {
                id: -1,
                codigo: 'SIMULADO',
                nome: 'Item Simulado',
                tipo: novoItemVestivel.tipo,
                categoria: 'CATEGORIA_0',
                espacos: 0,
                complexidadeMaldicao: 'NENHUMA',
                tipoAcessorio: novoItemVestivel.tipoAcessorio,
                danos: [],
                reducesDano: [],
            },
            modificacoes: [],
        };
        itensSimulados.push(itemSimulado);
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
    async validarLimite2xCapacidade(personagemCampanhaId, espacosAdicionais, prisma) {
        const db = prisma ?? this.prisma;
        const itens = await this.carregarItensInventarioCampanha(personagemCampanhaId, db);
        const { espacosBase, espacosExtra } = await this.calcularEspacosPersonagemCampanha(personagemCampanhaId, db);
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
    async buscarInventarioCampanha(campanhaId, personagemCampanhaId, usuarioId) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        const itens = await this.carregarItensInventarioCampanha(personagemCampanhaId);
        const { espacosBase, espacosExtra, prestigioGeral, } = await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);
        const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioGeral);
        const resultadoEspacos = this.engine.calcularResultadoEspacos(itens, espacosBase, espacosExtra);
        const statsEquipados = this.engine.calcularStatsEquipados(itens);
        const itensPorCategoria = itens.reduce((acc, item) => {
            const cat = item.categoriaCalculada || item.equipamento.categoria;
            acc[cat] = (acc[cat] || 0) + item.quantidade;
            return acc;
        }, {});
        const validacaoGrau = this.engine.validarLimitesGrauXama(prestigioGeral, limitesGrauXama, itensPorCategoria);
        return {
            personagemCampanhaId,
            espacos: resultadoEspacos,
            itens: itens.map((item) => this.mapper.mapItem(item)),
            statsEquipados: this.mapper.mapStatsEquipados(statsEquipados),
            limitesCategoria: {
                grauAtual: validacaoGrau.grauAtual,
                limitesPorCategoria: validacaoGrau.limitesAtuais,
                itensPorCategoria: validacaoGrau.itensPorCategoriaAtual,
                excedentes: validacaoGrau.erros,
            },
        };
    }
    async adicionarItemCampanha(campanhaId, personagemCampanhaId, usuarioId, dto) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        try {
            const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
                where: { id: dto.equipamentoId },
                include: { danos: true, reducesDano: true },
            });
            if (!equipamento) {
                throw new inventario_exception_1.InventarioEquipamentoNaoEncontradoException(dto.equipamentoId);
            }
            let modificacoesValidas = [];
            if (dto.modificacoes && dto.modificacoes.length > 0) {
                modificacoesValidas = await this.prisma.modificacaoEquipamento.findMany({
                    where: { id: { in: dto.modificacoes } },
                    select: modificacaoCalculoSelect,
                });
                if (modificacoesValidas.length !== dto.modificacoes.length) {
                    const idsEncontrados = modificacoesValidas.map((m) => m.id);
                    const idsInvalidos = dto.modificacoes.filter((id) => !idsEncontrados.includes(id));
                    throw new inventario_exception_1.InventarioModificacaoInvalidaException(idsInvalidos);
                }
                for (const modId of dto.modificacoes) {
                    const compativel = await this.prisma.equipamentoModificacaoAplicavel.findFirst({
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
            await this.validarLimite2xCapacidade(personagemCampanhaId, espacosTotaisItem);
            if (dto.equipado) {
                await this.validarSistemaVestir(personagemCampanhaId, {
                    tipo: equipamento.tipo,
                    tipoAcessorio: equipamento.tipoAcessorio,
                    quantidade: dto.quantidade || 1,
                });
            }
            const item = await this.prisma.inventarioItemCampanha.create({
                data: {
                    personagemCampanhaId,
                    equipamentoId: dto.equipamentoId,
                    quantidade: dto.quantidade || 1,
                    equipado: dto.equipado ?? false,
                    categoriaCalculada,
                    nomeCustomizado: dto.nomeCustomizado,
                    notas: dto.notas,
                },
                include: inventarioItemCampanhaComDadosInclude,
            });
            if (modificacoesValidas.length > 0) {
                await this.prisma.inventarioItemCampanhaModificacao.createMany({
                    data: modificacoesValidas.map((mod) => ({
                        itemId: item.id,
                        modificacaoId: mod.id,
                    })),
                });
            }
            await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
            const itemComMods = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: item.id },
                include: inventarioItemCampanhaComDadosInclude,
            });
            if (!itemComMods) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(item.id);
            }
            return this.mapper.mapItem(itemComMods);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async atualizarItemCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        try {
            const itemExiste = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
                include: {
                    equipamento: true,
                    modificacoes: { include: { modificacao: true } },
                },
            });
            if (!itemExiste || itemExiste.personagemCampanhaId !== personagemCampanhaId) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            if (dto.quantidade !== undefined &&
                dto.quantidade !== itemExiste.quantidade) {
                const itensAtuais = await this.carregarItensInventarioCampanha(personagemCampanhaId);
                const { espacosBase, espacosExtra } = await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);
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
                await this.validarSistemaVestir(personagemCampanhaId, {
                    tipo: itemExiste.equipamento.tipo,
                    tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
                    quantidade: dto.quantidade ?? itemExiste.quantidade,
                }, itemId);
            }
            if (itemExiste.equipado &&
                dto.quantidade !== undefined &&
                dto.quantidade !== itemExiste.quantidade) {
                await this.validarSistemaVestir(personagemCampanhaId, {
                    tipo: itemExiste.equipamento.tipo,
                    tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
                    quantidade: dto.quantidade,
                }, itemId);
            }
            const itemAtualizado = await this.prisma.inventarioItemCampanha.update({
                where: { id: itemId },
                data: {
                    quantidade: dto.quantidade,
                    equipado: dto.equipado,
                    nomeCustomizado: dto.nomeCustomizado,
                    notas: dto.notas,
                },
                include: inventarioItemCampanhaComDadosInclude,
            });
            await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async removerItemCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        try {
            const item = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
            });
            if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            await this.prisma.inventarioItemCampanhaModificacao.deleteMany({
                where: { itemId: itemId },
            });
            await this.prisma.inventarioItemCampanha.delete({
                where: { id: itemId },
            });
            await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
            return { sucesso: true };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async aplicarModificacaoCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, dto) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        try {
            const item = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
                include: {
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
            if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
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
            await this.prisma.inventarioItemCampanhaModificacao.create({
                data: {
                    itemId,
                    modificacaoId: dto.modificacaoId,
                },
            });
            const novaQuantidadeModificacoes = item.modificacoes.length + 1;
            const categoriaCalculada = this.engine.calcularCategoriaFinal(item.equipamento.categoria, novaQuantidadeModificacoes);
            await this.prisma.inventarioItemCampanha.update({
                where: { id: itemId },
                data: { categoriaCalculada },
            });
            await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
            const itemAtualizado = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
                include: inventarioItemCampanhaComDadosInclude,
            });
            if (!itemAtualizado) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async removerModificacaoCampanha(campanhaId, personagemCampanhaId, usuarioId, itemId, modificacaoId) {
        await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);
        try {
            const item = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
                include: {
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
            if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            const temModificacao = item.modificacoes.some((m) => m.modificacao.id === modificacaoId);
            if (!temModificacao) {
                throw new inventario_exception_1.InventarioModificacaoNaoAplicadaException(modificacaoId, itemId);
            }
            await this.prisma.inventarioItemCampanhaModificacao.delete({
                where: {
                    itemId_modificacaoId: {
                        itemId,
                        modificacaoId,
                    },
                },
            });
            const novaQuantidadeModificacoes = item.modificacoes.length - 1;
            const categoriaCalculada = this.engine.calcularCategoriaFinal(item.equipamento.categoria, novaQuantidadeModificacoes);
            await this.prisma.inventarioItemCampanha.update({
                where: { id: itemId },
                data: { categoriaCalculada },
            });
            await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
            const itemAtualizado = await this.prisma.inventarioItemCampanha.findUnique({
                where: { id: itemId },
                include: inventarioItemCampanhaComDadosInclude,
            });
            if (!itemAtualizado) {
                throw new inventario_exception_1.InventarioItemNaoEncontradoException(itemId);
            }
            return this.mapper.mapItem(itemAtualizado);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
};
exports.CampanhaInventarioService = CampanhaInventarioService;
exports.CampanhaInventarioService = CampanhaInventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campanha_access_service_1.CampanhaAccessService,
        inventario_engine_1.InventarioEngine,
        inventario_mapper_1.InventarioMapper])
], CampanhaInventarioService);
//# sourceMappingURL=campanha.inventario.service.js.map