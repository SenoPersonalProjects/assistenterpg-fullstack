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
exports.EquipamentosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const equipamento_exception_1 = require("../common/exceptions/equipamento.exception");
let EquipamentosService = class EquipamentosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listar(filtros) {
        const { tipo, complexidadeMaldicao, proficienciaArma, proficienciaProtecao, alcance, tipoAcessorio, categoria, apenasAmaldicoados, busca, pagina = 1, limite = 20, } = filtros;
        const where = {};
        if (tipo)
            where.tipo = tipo;
        if (complexidadeMaldicao)
            where.complexidadeMaldicao = complexidadeMaldicao;
        if (proficienciaArma)
            where.proficienciaArma = proficienciaArma;
        if (proficienciaProtecao)
            where.proficienciaProtecao = proficienciaProtecao;
        if (alcance)
            where.alcance = alcance;
        if (tipoAcessorio)
            where.tipoAcessorio = tipoAcessorio;
        if (categoria !== undefined)
            where.categoria = categoria;
        const orConditions = [];
        if (apenasAmaldicoados) {
            orConditions.push({ tipo: client_1.TipoEquipamento.ITEM_AMALDICOADO }, { tipo: client_1.TipoEquipamento.FERRAMENTA_AMALDICOADA }, { complexidadeMaldicao: { not: 'NENHUMA' } });
        }
        if (busca) {
            orConditions.push({ nome: { contains: busca, mode: 'insensitive' } }, { descricao: { contains: busca, mode: 'insensitive' } }, { codigo: { contains: busca, mode: 'insensitive' } });
        }
        if (orConditions.length > 0) {
            where.OR = orConditions;
        }
        const [total, equipamentos] = await Promise.all([
            this.prisma.equipamentoCatalogo.count({ where }),
            this.prisma.equipamentoCatalogo.findMany({
                where,
                skip: (pagina - 1) * limite,
                take: limite,
                orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
                select: {
                    id: true,
                    codigo: true,
                    nome: true,
                    descricao: true,
                    tipo: true,
                    categoria: true,
                    espacos: true,
                    complexidadeMaldicao: true,
                    proficienciaArma: true,
                    proficienciaProtecao: true,
                    alcance: true,
                    tipoAcessorio: true,
                    tipoArma: true,
                    subtipoDistancia: true,
                    tipoUso: true,
                    tipoAmaldicoado: true,
                    efeito: true,
                    armaAmaldicoada: {
                        select: {
                            id: true,
                            tipoBase: true,
                        },
                    },
                    protecaoAmaldicoada: {
                        select: {
                            id: true,
                            tipoBase: true,
                            bonusDefesa: true,
                        },
                    },
                    artefatoAmaldicoado: {
                        select: {
                            id: true,
                            tipoBase: true,
                        },
                    },
                },
            }),
        ]);
        return {
            dados: equipamentos.map((eq) => this.mapResumo(eq)),
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite),
            },
        };
    }
    async buscarPorId(id) {
        const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
            where: { id },
            include: {
                danos: {
                    orderBy: { ordem: 'asc' },
                },
                reducesDano: true,
                armaAmaldicoada: true,
                protecaoAmaldicoada: true,
                artefatoAmaldicoado: true,
                modificacoesAplicaveis: {
                    include: {
                        modificacao: true,
                    },
                },
            },
        });
        if (!equipamento) {
            throw new equipamento_exception_1.EquipamentoNaoEncontradoException(id);
        }
        return this.mapDetalhado(equipamento);
    }
    async buscarPorCodigo(codigo) {
        const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
            where: { codigo },
            include: {
                danos: {
                    orderBy: { ordem: 'asc' },
                },
                reducesDano: true,
                armaAmaldicoada: true,
                protecaoAmaldicoada: true,
                artefatoAmaldicoado: true,
                modificacoesAplicaveis: {
                    include: {
                        modificacao: true,
                    },
                },
            },
        });
        if (!equipamento) {
            throw new equipamento_exception_1.EquipamentoNaoEncontradoException(codigo);
        }
        return this.mapDetalhado(equipamento);
    }
    async criar(data) {
        const existente = await this.prisma.equipamentoCatalogo.findUnique({
            where: { codigo: data.codigo },
        });
        if (existente) {
            throw new equipamento_exception_1.EquipamentoCodigoDuplicadoException(data.codigo);
        }
        const dadosCriacao = {
            codigo: data.codigo,
            nome: data.nome,
            descricao: data.descricao || null,
            tipo: data.tipo,
            categoria: data.categoria || 'CATEGORIA_0',
            espacos: data.espacos || 1,
            complexidadeMaldicao: data.complexidadeMaldicao || 'NENHUMA',
            tipoUso: data.tipoUso || null,
            tipoAmaldicoado: data.tipoAmaldicoado || null,
            efeito: data.efeito || null,
            efeitoMaldicao: data.efeitoMaldicao || null,
            requerFerramentasAmaldicoadas: data.requerFerramentasAmaldicoadas || false,
        };
        if (data.tipo === 'ARMA') {
            Object.assign(dadosCriacao, {
                proficienciaArma: data.proficienciaArma || null,
                empunhaduras: data.empunhaduras ? JSON.stringify(data.empunhaduras) : null,
                tipoArma: data.tipoArma || null,
                subtipoDistancia: data.subtipoDistancia || null,
                agil: data.agil || false,
                criticoValor: data.criticoValor || null,
                criticoMultiplicador: data.criticoMultiplicador || null,
                alcance: data.alcance || null,
                tipoMunicaoCodigo: data.tipoMunicaoCodigo || null,
                habilidadeEspecial: data.habilidadeEspecial || null,
            });
        }
        if (data.tipo === 'PROTECAO') {
            Object.assign(dadosCriacao, {
                proficienciaProtecao: data.proficienciaProtecao || null,
                tipoProtecao: data.tipoProtecao || null,
                bonusDefesa: data.bonusDefesa || 0,
                penalidadeCarga: data.penalidadeCarga || 0,
            });
        }
        if (data.tipo === 'ACESSORIO') {
            Object.assign(dadosCriacao, {
                tipoAcessorio: data.tipoAcessorio || null,
                periciaBonificada: data.periciaBonificada || null,
                bonusPericia: data.bonusPericia || 0,
                requereEmpunhar: data.requereEmpunhar || false,
                maxVestimentas: data.maxVestimentas || 0,
            });
        }
        if (data.tipo === 'MUNICAO') {
            Object.assign(dadosCriacao, {
                duracaoCenas: data.duracaoCenas || null,
                recuperavel: data.recuperavel || false,
            });
        }
        if (data.tipo === 'EXPLOSIVO') {
            dadosCriacao.tipoExplosivo = data.tipoExplosivo || null;
        }
        const equipamento = await this.prisma.equipamentoCatalogo.create({
            data: dadosCriacao,
            include: {
                danos: true,
                reducesDano: true,
                armaAmaldicoada: true,
                protecaoAmaldicoada: true,
                artefatoAmaldicoado: true,
                modificacoesAplicaveis: {
                    include: {
                        modificacao: true,
                    },
                },
            },
        });
        return this.mapDetalhado(equipamento);
    }
    async atualizar(id, data) {
        const existente = await this.prisma.equipamentoCatalogo.findUnique({
            where: { id },
        });
        if (!existente) {
            throw new equipamento_exception_1.EquipamentoNaoEncontradoException(id);
        }
        if (data.codigo && data.codigo !== existente.codigo) {
            const codigoExiste = await this.prisma.equipamentoCatalogo.findUnique({
                where: { codigo: data.codigo },
            });
            if (codigoExiste) {
                throw new equipamento_exception_1.EquipamentoCodigoDuplicadoException(data.codigo);
            }
        }
        const dadosAtualizacao = {};
        if (data.codigo !== undefined)
            dadosAtualizacao.codigo = data.codigo;
        if (data.nome !== undefined)
            dadosAtualizacao.nome = data.nome;
        if (data.descricao !== undefined)
            dadosAtualizacao.descricao = data.descricao;
        if (data.tipo !== undefined)
            dadosAtualizacao.tipo = data.tipo;
        if (data.categoria !== undefined)
            dadosAtualizacao.categoria = data.categoria;
        if (data.espacos !== undefined)
            dadosAtualizacao.espacos = data.espacos;
        if (data.complexidadeMaldicao !== undefined)
            dadosAtualizacao.complexidadeMaldicao = data.complexidadeMaldicao;
        if (data.tipoUso !== undefined)
            dadosAtualizacao.tipoUso = data.tipoUso;
        if (data.tipoAmaldicoado !== undefined)
            dadosAtualizacao.tipoAmaldicoado = data.tipoAmaldicoado;
        if (data.efeito !== undefined)
            dadosAtualizacao.efeito = data.efeito;
        if (data.efeitoMaldicao !== undefined)
            dadosAtualizacao.efeitoMaldicao = data.efeitoMaldicao;
        if (data.requerFerramentasAmaldicoadas !== undefined)
            dadosAtualizacao.requerFerramentasAmaldicoadas = data.requerFerramentasAmaldicoadas;
        if (data.proficienciaArma !== undefined)
            dadosAtualizacao.proficienciaArma = data.proficienciaArma;
        if (data.empunhaduras !== undefined)
            dadosAtualizacao.empunhaduras = JSON.stringify(data.empunhaduras);
        if (data.tipoArma !== undefined)
            dadosAtualizacao.tipoArma = data.tipoArma;
        if (data.subtipoDistancia !== undefined)
            dadosAtualizacao.subtipoDistancia = data.subtipoDistancia;
        if (data.agil !== undefined)
            dadosAtualizacao.agil = data.agil;
        if (data.criticoValor !== undefined)
            dadosAtualizacao.criticoValor = data.criticoValor;
        if (data.criticoMultiplicador !== undefined)
            dadosAtualizacao.criticoMultiplicador = data.criticoMultiplicador;
        if (data.alcance !== undefined)
            dadosAtualizacao.alcance = data.alcance;
        if (data.tipoMunicaoCodigo !== undefined)
            dadosAtualizacao.tipoMunicaoCodigo = data.tipoMunicaoCodigo;
        if (data.habilidadeEspecial !== undefined)
            dadosAtualizacao.habilidadeEspecial = data.habilidadeEspecial;
        if (data.proficienciaProtecao !== undefined)
            dadosAtualizacao.proficienciaProtecao = data.proficienciaProtecao;
        if (data.tipoProtecao !== undefined)
            dadosAtualizacao.tipoProtecao = data.tipoProtecao;
        if (data.bonusDefesa !== undefined)
            dadosAtualizacao.bonusDefesa = data.bonusDefesa;
        if (data.penalidadeCarga !== undefined)
            dadosAtualizacao.penalidadeCarga = data.penalidadeCarga;
        if (data.tipoAcessorio !== undefined)
            dadosAtualizacao.tipoAcessorio = data.tipoAcessorio;
        if (data.periciaBonificada !== undefined)
            dadosAtualizacao.periciaBonificada = data.periciaBonificada;
        if (data.bonusPericia !== undefined)
            dadosAtualizacao.bonusPericia = data.bonusPericia;
        if (data.requereEmpunhar !== undefined)
            dadosAtualizacao.requereEmpunhar = data.requereEmpunhar;
        if (data.maxVestimentas !== undefined)
            dadosAtualizacao.maxVestimentas = data.maxVestimentas;
        if (data.duracaoCenas !== undefined)
            dadosAtualizacao.duracaoCenas = data.duracaoCenas;
        if (data.recuperavel !== undefined)
            dadosAtualizacao.recuperavel = data.recuperavel;
        if (data.tipoExplosivo !== undefined)
            dadosAtualizacao.tipoExplosivo = data.tipoExplosivo;
        const equipamento = await this.prisma.equipamentoCatalogo.update({
            where: { id },
            data: dadosAtualizacao,
            include: {
                danos: true,
                reducesDano: true,
                armaAmaldicoada: true,
                protecaoAmaldicoada: true,
                artefatoAmaldicoado: true,
                modificacoesAplicaveis: {
                    include: {
                        modificacao: true,
                    },
                },
            },
        });
        return this.mapDetalhado(equipamento);
    }
    async deletar(id) {
        const existente = await this.prisma.equipamentoCatalogo.findUnique({
            where: { id },
        });
        if (!existente) {
            throw new equipamento_exception_1.EquipamentoNaoEncontradoException(id);
        }
        const [emUsoBase, emUsoCampanha] = await Promise.all([
            this.prisma.inventarioItemBase.count({ where: { equipamentoId: id } }),
            this.prisma.inventarioItemCampanha.count({ where: { equipamentoId: id } }),
        ]);
        const totalUsos = emUsoBase + emUsoCampanha;
        if (totalUsos > 0) {
            throw new equipamento_exception_1.EquipamentoEmUsoException(id, totalUsos, emUsoBase, emUsoCampanha);
        }
        await this.prisma.equipamentoCatalogo.delete({
            where: { id },
        });
    }
    mapResumo(equipamento) {
        return {
            id: equipamento.id,
            codigo: equipamento.codigo,
            nome: equipamento.nome,
            descricao: equipamento.descricao,
            tipo: equipamento.tipo,
            categoria: equipamento.categoria,
            espacos: equipamento.espacos,
            complexidadeMaldicao: equipamento.complexidadeMaldicao,
            proficienciaArma: equipamento.proficienciaArma,
            proficienciaProtecao: equipamento.proficienciaProtecao,
            alcance: equipamento.alcance,
            tipoAcessorio: equipamento.tipoAcessorio,
            tipoArma: equipamento.tipoArma,
            subtipoDistancia: equipamento.subtipoDistancia,
            tipoUso: equipamento.tipoUso,
            tipoAmaldicoado: equipamento.tipoAmaldicoado,
            efeito: equipamento.efeito,
            armaAmaldicoada: equipamento.armaAmaldicoada || null,
            protecaoAmaldicoada: equipamento.protecaoAmaldicoada || null,
            artefatoAmaldicoado: equipamento.artefatoAmaldicoado || null,
        };
    }
    mapDetalhado(equipamento) {
        let empunhaduras = null;
        if (equipamento.empunhaduras) {
            try {
                empunhaduras = JSON.parse(equipamento.empunhaduras);
            }
            catch {
                empunhaduras = null;
            }
        }
        return {
            id: equipamento.id,
            codigo: equipamento.codigo,
            nome: equipamento.nome,
            descricao: equipamento.descricao,
            tipo: equipamento.tipo,
            categoria: equipamento.categoria,
            espacos: equipamento.espacos,
            complexidadeMaldicao: equipamento.complexidadeMaldicao,
            proficienciaArma: equipamento.proficienciaArma,
            empunhaduras,
            tipoArma: equipamento.tipoArma,
            subtipoDistancia: equipamento.subtipoDistancia,
            agil: equipamento.agil,
            criticoValor: equipamento.criticoValor,
            criticoMultiplicador: equipamento.criticoMultiplicador,
            alcance: equipamento.alcance,
            tipoMunicaoCodigo: equipamento.tipoMunicaoCodigo,
            habilidadeEspecial: equipamento.habilidadeEspecial,
            danos: equipamento.danos?.map((d) => ({
                empunhadura: d.empunhadura,
                tipoDano: d.tipoDano,
                rolagem: d.rolagem,
                valorFlat: d.valorFlat,
            })),
            proficienciaProtecao: equipamento.proficienciaProtecao,
            tipoProtecao: equipamento.tipoProtecao,
            bonusDefesa: equipamento.bonusDefesa,
            penalidadeCarga: equipamento.penalidadeCarga,
            reducoesDano: equipamento.reducesDano?.map((r) => ({
                tipoReducao: r.tipoReducao,
                valor: r.valor,
            })),
            duracaoCenas: equipamento.duracaoCenas,
            recuperavel: equipamento.recuperavel,
            tipoAcessorio: equipamento.tipoAcessorio,
            periciaBonificada: equipamento.periciaBonificada,
            bonusPericia: equipamento.bonusPericia,
            requereEmpunhar: equipamento.requereEmpunhar,
            maxVestimentas: equipamento.maxVestimentas,
            tipoExplosivo: equipamento.tipoExplosivo,
            efeito: equipamento.efeito,
            tipoUso: equipamento.tipoUso,
            tipoAmaldicoado: equipamento.tipoAmaldicoado,
            efeitoMaldicao: equipamento.efeitoMaldicao,
            requerFerramentasAmaldicoadas: equipamento.requerFerramentasAmaldicoadas,
            armaAmaldicoada: equipamento.armaAmaldicoada
                ? {
                    tipoBase: equipamento.armaAmaldicoada.tipoBase,
                    proficienciaRequerida: equipamento.armaAmaldicoada.proficienciaRequerida,
                    efeito: equipamento.armaAmaldicoada.efeito,
                }
                : null,
            protecaoAmaldicoada: equipamento.protecaoAmaldicoada
                ? {
                    tipoBase: equipamento.protecaoAmaldicoada.tipoBase,
                    bonusDefesa: equipamento.protecaoAmaldicoada.bonusDefesa,
                    penalidadeCarga: equipamento.protecaoAmaldicoada.penalidadeCarga,
                    proficienciaRequerida: equipamento.protecaoAmaldicoada.proficienciaRequerida,
                    efeito: equipamento.protecaoAmaldicoada.efeito,
                }
                : null,
            artefatoAmaldicoado: equipamento.artefatoAmaldicoado
                ? {
                    tipoBase: equipamento.artefatoAmaldicoado.tipoBase,
                    proficienciaRequerida: equipamento.artefatoAmaldicoado.proficienciaRequerida,
                    efeito: equipamento.artefatoAmaldicoado.efeito,
                    custoUso: equipamento.artefatoAmaldicoado.custoUso,
                    manutencao: equipamento.artefatoAmaldicoado.manutencao,
                }
                : null,
            modificacoesDisponiveis: equipamento.modificacoesAplicaveis?.map((ma) => ({
                id: ma.modificacao.id,
                codigo: ma.modificacao.codigo,
                nome: ma.modificacao.nome,
                descricao: ma.modificacao.descricao,
                tipo: ma.modificacao.tipo,
                incrementoEspacos: ma.modificacao.incrementoEspacos,
            })),
        };
    }
};
exports.EquipamentosService = EquipamentosService;
exports.EquipamentosService = EquipamentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EquipamentosService);
//# sourceMappingURL=equipamentos.service.js.map