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
exports.PersonagemBasePersistence = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PersonagemBasePersistence = class PersonagemBasePersistence {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criarComEstado(params, prisma = this.prisma) {
        const { donoId, dataBase, estado } = params;
        const dataSanitizado = { ...dataBase };
        if (dataSanitizado.proficienciasCodigos !== undefined) {
            dataSanitizado.proficienciasExtrasCodigos =
                dataSanitizado.proficienciasCodigos;
        }
        delete dataSanitizado.proficienciasCodigos;
        delete dataSanitizado.periciasLivresExtras;
        delete dataSanitizado.itensInventario;
        delete dataSanitizado.passivasAtributoIds;
        delete dataSanitizado.defesa;
        delete dataSanitizado.defesaTotal;
        const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(estado.resistenciasFinais, prisma);
        const itensInventarioParaCriar = this.prepararItensInventarioParaCriacao(estado.dtoNormalizado?.itensInventario ?? []);
        return prisma.personagemBase.create({
            data: {
                ...dataSanitizado,
                donoId,
                passivasAtributosAtivos: estado.passivasResolvidas.ativos,
                passivasAtributosConfig: estado.passivasAtributosConfigLimpo ?? undefined,
                periciasClasseEscolhidasCodigos: estado.dtoNormalizado?.periciasClasseEscolhidasCodigos ?? [],
                periciasOrigemEscolhidasCodigos: estado.dtoNormalizado?.periciasOrigemEscolhidasCodigos ?? [],
                periciasLivresCodigos: estado.dtoNormalizado?.periciasLivresCodigos ?? [],
                proficiencias: {
                    create: estado.profsFinais.map((codigo) => ({
                        proficiencia: { connect: { codigo } },
                    })),
                },
                grausAprimoramento: {
                    create: estado.grausFinais.map((g) => ({
                        tipoGrau: { connect: { codigo: g.tipoGrauCodigo } },
                        valor: g.valor,
                    })),
                },
                pericias: {
                    create: Array.from(estado.periciasMapCodigo.values()).map((p) => ({
                        pericia: { connect: { id: p.periciaId } },
                        grauTreinamento: p.grauTreinamento,
                        bonusExtra: p.bonusExtra,
                    })),
                },
                grausTreinamento: estado.grausTreinamento?.length
                    ? {
                        create: estado.grausTreinamento.flatMap((gt) => gt.melhorias.map((m) => ({
                            nivel: gt.nivel,
                            periciaCodigo: m.periciaCodigo,
                            grauAnterior: m.grauAnterior,
                            grauNovo: m.grauNovo,
                        }))),
                    }
                    : undefined,
                habilidadesBase: {
                    create: estado.habilidadesParaPersistir.map((h) => ({
                        habilidade: { connect: { id: h.habilidadeId } },
                    })),
                },
                poderesGenericos: estado.poderesGenericosNormalizados.length
                    ? {
                        create: estado.poderesGenericosNormalizados.map((p) => ({
                            habilidade: { connect: { id: p.habilidadeId } },
                            config: p.config,
                        })),
                    }
                    : undefined,
                passivas: estado.passivasResolvidas.passivaIds.length
                    ? {
                        create: estado.passivasResolvidas.passivaIds.map((passivaId) => ({
                            passiva: { connect: { id: passivaId } },
                        })),
                    }
                    : undefined,
                resistencias: resistenciasParaCriar.length
                    ? {
                        create: resistenciasParaCriar,
                    }
                    : undefined,
                inventarioItens: itensInventarioParaCriar.length
                    ? {
                        create: itensInventarioParaCriar,
                    }
                    : undefined,
            },
            include: {
                cla: true,
                origem: true,
                classe: true,
                trilha: true,
                caminho: true,
                resistencias: {
                    include: {
                        resistenciaTipo: true,
                    },
                },
                inventarioItens: {
                    include: {
                        equipamento: true,
                        modificacoes: {
                            include: {
                                modificacao: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async atualizarRebuildComEstado(params, prisma = this.prisma) {
        const { id, dataUpdateBase, estado } = params;
        const dataUpdateSanitizado = { ...dataUpdateBase };
        if (dataUpdateSanitizado.proficienciasCodigos !== undefined) {
            dataUpdateSanitizado.proficienciasExtrasCodigos =
                dataUpdateSanitizado.proficienciasCodigos;
        }
        delete dataUpdateSanitizado.proficienciasCodigos;
        delete dataUpdateSanitizado.periciasLivresExtras;
        delete dataUpdateSanitizado.itensInventario;
        delete dataUpdateSanitizado.passivasAtributoIds;
        delete dataUpdateSanitizado.defesa;
        delete dataUpdateSanitizado.defesaTotal;
        const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(estado.resistenciasFinais, prisma);
        const itensInventarioParaCriar = this.prepararItensInventarioParaCriacao(estado.dtoNormalizado?.itensInventario ?? []);
        await prisma.personagemBase.update({
            where: { id },
            data: dataUpdateSanitizado,
        });
        await prisma.personagemBase.update({
            where: { id },
            data: {
                proficiencias: {
                    deleteMany: {},
                    create: estado.profsFinais.map((codigo) => ({
                        proficiencia: { connect: { codigo } },
                    })),
                },
                grausAprimoramento: {
                    deleteMany: {},
                    create: estado.grausFinais.map((g) => ({
                        tipoGrau: { connect: { codigo: g.tipoGrauCodigo } },
                        valor: g.valor,
                    })),
                },
                pericias: {
                    deleteMany: {},
                    create: Array.from(estado.periciasMapCodigo.values()).map((p) => ({
                        pericia: { connect: { id: p.periciaId } },
                        grauTreinamento: p.grauTreinamento,
                        bonusExtra: p.bonusExtra,
                    })),
                },
                grausTreinamento: {
                    deleteMany: {},
                    create: (estado.grausTreinamento ?? []).flatMap((gt) => gt.melhorias.map((m) => ({
                        nivel: gt.nivel,
                        periciaCodigo: m.periciaCodigo,
                        grauAnterior: m.grauAnterior,
                        grauNovo: m.grauNovo,
                    }))),
                },
                habilidadesBase: {
                    deleteMany: {},
                    create: estado.habilidadesParaPersistir.map((h) => ({
                        habilidade: { connect: { id: h.habilidadeId } },
                    })),
                },
                poderesGenericos: {
                    deleteMany: {},
                    create: estado.poderesGenericosNormalizados.map((p) => ({
                        habilidade: { connect: { id: p.habilidadeId } },
                        config: p.config,
                    })),
                },
                passivas: {
                    deleteMany: {},
                    ...(estado.passivasResolvidas.passivaIds.length
                        ? {
                            create: estado.passivasResolvidas.passivaIds.map((passivaId) => ({
                                passiva: { connect: { id: passivaId } },
                            })),
                        }
                        : {}),
                },
                resistencias: {
                    deleteMany: {},
                    ...(resistenciasParaCriar.length
                        ? {
                            create: resistenciasParaCriar,
                        }
                        : {}),
                },
                inventarioItens: {
                    deleteMany: {},
                    ...(itensInventarioParaCriar.length
                        ? {
                            create: itensInventarioParaCriar,
                        }
                        : {}),
                },
            },
            include: {
                cla: true,
                classe: true,
                resistencias: {
                    include: {
                        resistenciaTipo: true,
                    },
                },
                inventarioItens: {
                    include: {
                        equipamento: true,
                        modificacoes: {
                            include: {
                                modificacao: true,
                            },
                        },
                    },
                },
            },
        });
        return prisma.personagemBase.findUnique({
            where: { id },
            include: {
                cla: true,
                classe: true,
                resistencias: {
                    include: {
                        resistenciaTipo: true,
                    },
                },
                inventarioItens: {
                    include: {
                        equipamento: true,
                        modificacoes: {
                            include: {
                                modificacao: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async prepararResistenciasParaCriacao(resistenciasFinais, prisma) {
        if (!resistenciasFinais || resistenciasFinais.size === 0) {
            return [];
        }
        const resistenciasValidas = Array.from(resistenciasFinais.entries()).filter(([_, valor]) => valor > 0);
        if (resistenciasValidas.length === 0) {
            return [];
        }
        const codigos = resistenciasValidas.map(([codigo]) => codigo);
        const resistenciasTipo = await prisma.resistenciaTipo.findMany({
            where: { codigo: { in: codigos } },
            select: { codigo: true },
        });
        const codigosValidos = new Set(resistenciasTipo.map((r) => r.codigo));
        return resistenciasValidas
            .filter(([codigo]) => codigosValidos.has(codigo))
            .map(([codigo, valor]) => ({
            valor,
            resistenciaTipo: { connect: { codigo } },
        }));
    }
    prepararItensInventarioParaCriacao(itensInventario) {
        if (!itensInventario || itensInventario.length === 0) {
            return [];
        }
        return itensInventario.map((item) => ({
            equipamento: { connect: { id: item.equipamentoId } },
            quantidade: item.quantidade,
            equipado: item.equipado,
            nomeCustomizado: item.nomeCustomizado || null,
            notas: item.notas || null,
            modificacoes: item.modificacoesIds && item.modificacoesIds.length > 0
                ? {
                    create: item.modificacoesIds.map((modId) => ({
                        modificacao: { connect: { id: modId } },
                    })),
                }
                : undefined,
        }));
    }
};
exports.PersonagemBasePersistence = PersonagemBasePersistence;
exports.PersonagemBasePersistence = PersonagemBasePersistence = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonagemBasePersistence);
//# sourceMappingURL=personagem-base.persistence.js.map