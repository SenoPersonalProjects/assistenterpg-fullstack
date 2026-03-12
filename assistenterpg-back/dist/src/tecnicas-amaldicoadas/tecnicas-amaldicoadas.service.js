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
exports.TecnicasAmaldicoadasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const tecnica_amaldicoada_exception_1 = require("../common/exceptions/tecnica-amaldicoada.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
const tecnicaDetalhadaInclude = {
    clas: {
        include: {
            cla: {
                select: {
                    id: true,
                    nome: true,
                    grandeCla: true,
                },
            },
        },
    },
    habilidades: {
        include: {
            variacoes: {
                orderBy: { ordem: 'asc' },
            },
        },
        orderBy: { ordem: 'asc' },
    },
    suplemento: true,
};
const TECNICAS_JSON_SCHEMA = 'tecnicas-amaldicoadas.import-export';
const TECNICAS_JSON_SCHEMA_VERSION = 1;
const tecnicaUsoInclude = {
    _count: {
        select: {
            personagensBaseComInata: true,
            personagensCampanhaComInata: true,
            personagensBaseAprendeu: true,
            personagensCampanhaAprendeu: true,
        },
    },
};
let TecnicasAmaldicoadasService = class TecnicasAmaldicoadasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    tratarErroPrisma(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            error instanceof client_1.Prisma.PrismaClientValidationError) {
            (0, database_exception_1.handlePrismaError)(error);
        }
    }
    normalizarJsonOuNull(value) {
        if (value === undefined || value === null) {
            return client_1.Prisma.JsonNull;
        }
        return value;
    }
    normalizarJsonOpcional(value) {
        if (value === undefined) {
            return undefined;
        }
        if (value === null) {
            return client_1.Prisma.JsonNull;
        }
        return value;
    }
    async validarFonteSuplemento(fonte, suplementoId) {
        if (suplementoId) {
            const suplemento = await this.prisma.suplemento.findUnique({
                where: { id: suplementoId },
                select: { id: true },
            });
            if (!suplemento) {
                throw new tecnica_amaldicoada_exception_1.TecnicaSuplementoNaoEncontradoException(suplementoId);
            }
            if (fonte !== client_1.TipoFonte.SUPLEMENTO) {
                throw new common_1.BadRequestException({
                    code: 'FONTE_SUPLEMENTO_OBRIGATORIA',
                    message: 'Quando suplementoId for informado, fonte deve ser SUPLEMENTO',
                    field: 'fonte',
                });
            }
            return;
        }
        if (fonte === client_1.TipoFonte.SUPLEMENTO) {
            throw new common_1.BadRequestException({
                code: 'SUPLEMENTO_ID_OBRIGATORIO',
                message: 'fonte SUPLEMENTO exige suplementoId',
                field: 'suplementoId',
            });
        }
    }
    garantirObjeto(value, path) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_INVALIDO',
                message: `${path} deve ser um objeto JSON.`,
            });
        }
        return value;
    }
    lerStringObrigatoria(source, campo, path) {
        const raw = source[campo];
        if (typeof raw !== 'string' || raw.trim().length === 0) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_OBRIGATORIO',
                message: `${path}.${campo} e obrigatorio e deve ser string nao vazia.`,
            });
        }
        return raw.trim();
    }
    lerStringOpcional(source, campo) {
        const raw = source[campo];
        if (raw === undefined || raw === null) {
            return undefined;
        }
        if (typeof raw !== 'string') {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_INVALIDO',
                message: `${campo} deve ser string quando informado.`,
            });
        }
        const normalized = raw.trim();
        return normalized.length > 0 ? normalized : undefined;
    }
    lerNumeroOpcional(source, campo, path) {
        const raw = source[campo];
        if (raw === undefined || raw === null || raw === '') {
            return undefined;
        }
        if (typeof raw !== 'number' || !Number.isFinite(raw)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_INVALIDO',
                message: `${path}.${campo} deve ser numero valido.`,
            });
        }
        return raw;
    }
    lerInteiroOpcional(source, campo, path) {
        const value = this.lerNumeroOpcional(source, campo, path);
        if (value === undefined) {
            return undefined;
        }
        if (!Number.isInteger(value)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_INVALIDO',
                message: `${path}.${campo} deve ser numero inteiro.`,
            });
        }
        return value;
    }
    lerBooleanOpcional(source, campo, path) {
        const raw = source[campo];
        if (raw === undefined || raw === null || raw === '') {
            return undefined;
        }
        if (typeof raw === 'boolean') {
            return raw;
        }
        if (typeof raw === 'number') {
            if (raw === 1)
                return true;
            if (raw === 0)
                return false;
        }
        if (typeof raw === 'string') {
            const normalized = raw.trim().toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(normalized))
                return true;
            if (['false', '0', 'no', 'off'].includes(normalized))
                return false;
        }
        throw new common_1.BadRequestException({
            code: 'JSON_IMPORT_CAMPO_INVALIDO',
            message: `${path}.${campo} deve ser booleano.`,
        });
    }
    lerArrayStringsOpcional(source, campo, path) {
        const raw = source[campo];
        if (raw === undefined || raw === null) {
            return undefined;
        }
        if (!Array.isArray(raw)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_INVALIDO',
                message: `${path}.${campo} deve ser array de strings.`,
            });
        }
        const normalized = raw
            .map((item) => (typeof item === 'string' ? item.trim() : item))
            .filter((item) => typeof item === 'string' && item.length > 0);
        return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
    }
    lerEnumObrigatorio(source, campo, enumRef, path) {
        const raw = source[campo];
        if (typeof raw !== 'string' || raw.trim().length === 0) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_OBRIGATORIO',
                message: `${path}.${campo} e obrigatorio.`,
            });
        }
        const value = raw.trim();
        if (!Object.values(enumRef).includes(value)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_ENUM_INVALIDO',
                message: `${path}.${campo} invalido. Valores aceitos: ${Object.values(enumRef).join(', ')}.`,
            });
        }
        return value;
    }
    lerEnumOpcional(source, campo, enumRef, path) {
        const raw = source[campo];
        if (raw === undefined || raw === null || raw === '') {
            return undefined;
        }
        if (typeof raw !== 'string') {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_CAMPO_INVALIDO',
                message: `${path}.${campo} deve ser string.`,
            });
        }
        const value = raw.trim();
        if (!Object.values(enumRef).includes(value)) {
            throw new common_1.BadRequestException({
                code: 'JSON_IMPORT_ENUM_INVALIDO',
                message: `${path}.${campo} invalido. Valores aceitos: ${Object.values(enumRef).join(', ')}.`,
            });
        }
        return value;
    }
    parseVariacaoImport(raw, habilidadePath, index) {
        const path = `${habilidadePath}.variacoes[${index}]`;
        const source = this.garantirObjeto(raw, path);
        return {
            id: this.lerInteiroOpcional(source, 'id', path),
            nome: this.lerStringObrigatoria(source, 'nome', path),
            descricao: this.lerStringObrigatoria(source, 'descricao', path),
            substituiCustos: this.lerBooleanOpcional(source, 'substituiCustos', path) ?? false,
            custoPE: this.lerInteiroOpcional(source, 'custoPE', path),
            custoEA: this.lerInteiroOpcional(source, 'custoEA', path),
            custoSustentacaoEA: this.lerInteiroOpcional(source, 'custoSustentacaoEA', path),
            custoSustentacaoPE: this.lerInteiroOpcional(source, 'custoSustentacaoPE', path),
            execucao: this.lerEnumOpcional(source, 'execucao', client_1.TipoExecucao, path),
            area: this.lerEnumOpcional(source, 'area', client_1.AreaEfeito, path),
            alcance: this.lerStringOpcional(source, 'alcance'),
            alvo: this.lerStringOpcional(source, 'alvo'),
            duracao: this.lerStringOpcional(source, 'duracao'),
            resistencia: this.lerStringOpcional(source, 'resistencia'),
            dtResistencia: this.lerStringOpcional(source, 'dtResistencia'),
            criticoValor: this.lerInteiroOpcional(source, 'criticoValor', path),
            criticoMultiplicador: this.lerInteiroOpcional(source, 'criticoMultiplicador', path),
            danoFlat: this.lerInteiroOpcional(source, 'danoFlat', path),
            danoFlatTipo: this.lerEnumOpcional(source, 'danoFlatTipo', client_1.TipoDano, path),
            dadosDano: source.dadosDano,
            escalonaPorGrau: this.lerBooleanOpcional(source, 'escalonaPorGrau', path),
            escalonamentoCustoEA: this.lerInteiroOpcional(source, 'escalonamentoCustoEA', path),
            escalonamentoCustoPE: this.lerInteiroOpcional(source, 'escalonamentoCustoPE', path),
            escalonamentoTipo: this.lerEnumOpcional(source, 'escalonamentoTipo', client_1.TipoEscalonamentoHabilidade, path),
            escalonamentoEfeito: source.escalonamentoEfeito,
            escalonamentoDano: source.escalonamentoDano,
            efeitoAdicional: this.lerStringOpcional(source, 'efeitoAdicional'),
            requisitos: source.requisitos,
            ordem: this.lerInteiroOpcional(source, 'ordem', path),
        };
    }
    parseHabilidadeImport(raw, tecnicaPath, index) {
        const path = `${tecnicaPath}.habilidades[${index}]`;
        const source = this.garantirObjeto(raw, path);
        const variacoesRaw = source.variacoes;
        return {
            id: this.lerInteiroOpcional(source, 'id', path),
            codigo: this.lerStringObrigatoria(source, 'codigo', path),
            nome: this.lerStringObrigatoria(source, 'nome', path),
            descricao: this.lerStringObrigatoria(source, 'descricao', path),
            requisitos: source.requisitos,
            execucao: this.lerEnumObrigatorio(source, 'execucao', client_1.TipoExecucao, path),
            area: this.lerEnumOpcional(source, 'area', client_1.AreaEfeito, path),
            alcance: this.lerStringOpcional(source, 'alcance'),
            alvo: this.lerStringOpcional(source, 'alvo'),
            duracao: this.lerStringOpcional(source, 'duracao'),
            resistencia: this.lerStringOpcional(source, 'resistencia'),
            dtResistencia: this.lerStringOpcional(source, 'dtResistencia'),
            custoPE: this.lerInteiroOpcional(source, 'custoPE', path),
            custoEA: this.lerInteiroOpcional(source, 'custoEA', path),
            custoSustentacaoEA: this.lerInteiroOpcional(source, 'custoSustentacaoEA', path),
            custoSustentacaoPE: this.lerInteiroOpcional(source, 'custoSustentacaoPE', path),
            testesExigidos: source.testesExigidos,
            criticoValor: this.lerInteiroOpcional(source, 'criticoValor', path),
            criticoMultiplicador: this.lerInteiroOpcional(source, 'criticoMultiplicador', path),
            danoFlat: this.lerInteiroOpcional(source, 'danoFlat', path),
            danoFlatTipo: this.lerEnumOpcional(source, 'danoFlatTipo', client_1.TipoDano, path),
            dadosDano: source.dadosDano,
            escalonaPorGrau: this.lerBooleanOpcional(source, 'escalonaPorGrau', path) ?? false,
            grauTipoGrauCodigo: this.lerStringOpcional(source, 'grauTipoGrauCodigo'),
            escalonamentoCustoEA: this.lerInteiroOpcional(source, 'escalonamentoCustoEA', path) ?? 0,
            escalonamentoCustoPE: this.lerInteiroOpcional(source, 'escalonamentoCustoPE', path) ?? 0,
            escalonamentoTipo: this.lerEnumOpcional(source, 'escalonamentoTipo', client_1.TipoEscalonamentoHabilidade, path) ?? client_1.TipoEscalonamentoHabilidade.OUTRO,
            escalonamentoEfeito: source.escalonamentoEfeito,
            escalonamentoDano: source.escalonamentoDano,
            efeito: this.lerStringObrigatoria(source, 'efeito', path),
            ordem: this.lerInteiroOpcional(source, 'ordem', path),
            variacoes: Array.isArray(variacoesRaw)
                ? variacoesRaw.map((variacao, variacaoIndex) => this.parseVariacaoImport(variacao, path, variacaoIndex))
                : [],
        };
    }
    parseTecnicaImport(raw, index) {
        const path = `tecnicas[${index}]`;
        const source = this.garantirObjeto(raw, path);
        const habilidadesRaw = source.habilidades;
        return {
            id: this.lerInteiroOpcional(source, 'id', path),
            codigo: this.lerStringObrigatoria(source, 'codigo', path).toUpperCase(),
            nome: this.lerStringObrigatoria(source, 'nome', path),
            descricao: this.lerStringObrigatoria(source, 'descricao', path),
            tipo: this.lerEnumObrigatorio(source, 'tipo', client_1.TipoTecnicaAmaldicoada, path),
            hereditaria: this.lerBooleanOpcional(source, 'hereditaria', path),
            clasHereditarios: this.lerArrayStringsOpcional(source, 'clasHereditarios', path),
            linkExterno: this.lerStringOpcional(source, 'linkExterno'),
            fonte: this.lerEnumOpcional(source, 'fonte', client_1.TipoFonte, path) ??
                client_1.TipoFonte.SISTEMA_BASE,
            suplementoId: this.lerInteiroOpcional(source, 'suplementoId', path),
            requisitos: source.requisitos,
            habilidades: Array.isArray(habilidadesRaw)
                ? habilidadesRaw.map((habilidade, habilidadeIndex) => this.parseHabilidadeImport(habilidade, path, habilidadeIndex))
                : [],
        };
    }
    mapTecnicaExportJson(tecnica, incluirIds) {
        return {
            ...(incluirIds ? { id: tecnica.id } : {}),
            codigo: tecnica.codigo,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            tipo: tecnica.tipo,
            hereditaria: tecnica.hereditaria,
            clasHereditarios: tecnica.clas.map((rel) => rel.cla.nome),
            linkExterno: tecnica.linkExterno,
            fonte: tecnica.fonte,
            suplementoId: tecnica.suplementoId,
            requisitos: tecnica.requisitos,
            habilidades: tecnica.habilidades.map((habilidade) => ({
                ...(incluirIds ? { id: habilidade.id } : {}),
                codigo: habilidade.codigo,
                nome: habilidade.nome,
                descricao: habilidade.descricao,
                requisitos: habilidade.requisitos,
                execucao: habilidade.execucao,
                area: habilidade.area,
                alcance: habilidade.alcance,
                alvo: habilidade.alvo,
                duracao: habilidade.duracao,
                resistencia: habilidade.resistencia,
                dtResistencia: habilidade.dtResistencia,
                custoPE: habilidade.custoPE,
                custoEA: habilidade.custoEA,
                custoSustentacaoEA: habilidade.custoSustentacaoEA,
                custoSustentacaoPE: habilidade.custoSustentacaoPE,
                testesExigidos: habilidade.testesExigidos,
                criticoValor: habilidade.criticoValor,
                criticoMultiplicador: habilidade.criticoMultiplicador,
                danoFlat: habilidade.danoFlat,
                danoFlatTipo: habilidade.danoFlatTipo,
                dadosDano: habilidade.dadosDano,
                escalonaPorGrau: habilidade.escalonaPorGrau,
                grauTipoGrauCodigo: habilidade.grauTipoGrauCodigo,
                escalonamentoCustoEA: habilidade.escalonamentoCustoEA,
                escalonamentoCustoPE: habilidade.escalonamentoCustoPE,
                escalonamentoTipo: habilidade.escalonamentoTipo,
                escalonamentoEfeito: habilidade.escalonamentoEfeito,
                escalonamentoDano: habilidade.escalonamentoDano,
                efeito: habilidade.efeito,
                ordem: habilidade.ordem,
                variacoes: habilidade.variacoes.map((variacao) => ({
                    ...(incluirIds ? { id: variacao.id } : {}),
                    nome: variacao.nome,
                    descricao: variacao.descricao,
                    substituiCustos: variacao.substituiCustos,
                    custoPE: variacao.custoPE,
                    custoEA: variacao.custoEA,
                    custoSustentacaoEA: variacao.custoSustentacaoEA,
                    custoSustentacaoPE: variacao.custoSustentacaoPE,
                    execucao: variacao.execucao,
                    area: variacao.area,
                    alcance: variacao.alcance,
                    alvo: variacao.alvo,
                    duracao: variacao.duracao,
                    resistencia: variacao.resistencia,
                    dtResistencia: variacao.dtResistencia,
                    criticoValor: variacao.criticoValor,
                    criticoMultiplicador: variacao.criticoMultiplicador,
                    danoFlat: variacao.danoFlat,
                    danoFlatTipo: variacao.danoFlatTipo,
                    dadosDano: variacao.dadosDano,
                    escalonaPorGrau: variacao.escalonaPorGrau,
                    escalonamentoCustoEA: variacao.escalonamentoCustoEA,
                    escalonamentoCustoPE: variacao.escalonamentoCustoPE,
                    escalonamentoTipo: variacao.escalonamentoTipo,
                    escalonamentoEfeito: variacao.escalonamentoEfeito,
                    escalonamentoDano: variacao.escalonamentoDano,
                    efeitoAdicional: variacao.efeitoAdicional,
                    requisitos: variacao.requisitos,
                    ordem: variacao.ordem,
                })),
            })),
        };
    }
    async getGuiaImportacaoJson() {
        const exemploMinimo = {
            schema: TECNICAS_JSON_SCHEMA,
            schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
            modo: 'UPSERT',
            tecnicas: [
                {
                    codigo: 'TEC_EXEMPLO',
                    nome: 'Tecnica Exemplo',
                    descricao: 'Descricao resumida da tecnica.',
                    tipo: 'INATA',
                    hereditaria: false,
                    fonte: 'SISTEMA_BASE',
                    habilidades: [],
                },
            ],
        };
        const exemploCompleto = {
            schema: TECNICAS_JSON_SCHEMA,
            schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
            modo: 'UPSERT',
            substituirHabilidadesAusentes: false,
            substituirVariacoesAusentes: false,
            tecnicas: [
                {
                    codigo: 'TEC_EXEMPLO_COMPLETO',
                    nome: 'Tecnica Exemplo Completo',
                    descricao: 'Tecnica com habilidade e variacao.',
                    tipo: 'NAO_INATA',
                    hereditaria: false,
                    clasHereditarios: [],
                    linkExterno: null,
                    fonte: 'SISTEMA_BASE',
                    suplementoId: null,
                    requisitos: { observacao: 'Campo JSON livre' },
                    habilidades: [
                        {
                            codigo: 'HAB_EXEMPLO_01',
                            nome: 'Habilidade Exemplo',
                            descricao: 'Descricao da habilidade.',
                            execucao: 'ACAO_PADRAO',
                            alcance: 'CURTO (9m)',
                            alvo: '1 ser',
                            duracao: 'INSTANTANEA',
                            custoPE: 1,
                            custoEA: 2,
                            escalonaPorGrau: true,
                            escalonamentoCustoEA: 1,
                            escalonamentoCustoPE: 0,
                            escalonamentoTipo: 'DANO_DADOS',
                            escalonamentoDano: {
                                quantidade: 1,
                                dado: 'd6',
                                tipo: 'AMALDICOADO_JUJUTSU',
                            },
                            efeito: 'Descricao do efeito principal.',
                            ordem: 0,
                            variacoes: [
                                {
                                    nome: 'Variacao Superior',
                                    descricao: 'Sobrescreve parte do custo.',
                                    substituiCustos: false,
                                    custoEA: 1,
                                    custoPE: 1,
                                    efeitoAdicional: 'Texto adicional da variacao.',
                                    ordem: 0,
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        return {
            schema: TECNICAS_JSON_SCHEMA,
            schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
            descricao: 'Formato oficial para importar/exportar tecnicas amaldicoadas com habilidades e variacoes.',
            regras: [
                'A importacao usa modo UPSERT por codigo de tecnica e codigo de habilidade.',
                'Variacoes usam id (quando informado) ou nome dentro da habilidade para atualizar.',
                'CRUD manual continua disponivel no painel admin (tecnica -> habilidades -> variacoes).',
                'substituirHabilidadesAusentes=true remove habilidades nao presentes no arquivo para cada tecnica importada.',
                'substituirVariacoesAusentes=true remove variacoes nao presentes no arquivo para cada habilidade importada.',
            ],
            exemplos: {
                minimo: exemploMinimo,
                completo: exemploCompleto,
            },
            camposObrigatorios: {
                tecnica: ['codigo', 'nome', 'descricao', 'tipo'],
                habilidade: ['codigo', 'nome', 'descricao', 'execucao', 'efeito'],
                variacao: ['nome', 'descricao'],
            },
        };
    }
    async exportarTecnicasJson(query) {
        try {
            const incluirIds = query.incluirIds !== false;
            let tecnicas = [];
            if (query.id) {
                const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { id: query.id },
                    include: tecnicaDetalhadaInclude,
                });
                if (!tecnica) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(query.id);
                }
                tecnicas = [tecnica];
            }
            else if (query.codigo) {
                const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { codigo: query.codigo },
                    include: tecnicaDetalhadaInclude,
                });
                if (!tecnica) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(query.codigo);
                }
                tecnicas = [tecnica];
            }
            else {
                const where = {};
                if (query.nome)
                    where.nome = { contains: query.nome };
                if (query.tipo)
                    where.tipo = query.tipo;
                if (query.hereditaria !== undefined)
                    where.hereditaria = query.hereditaria;
                if (query.fonte)
                    where.fonte = query.fonte;
                if (query.suplementoId)
                    where.suplementoId = query.suplementoId;
                if (query.claId || query.claNome) {
                    where.clas = {
                        some: query.claId
                            ? { claId: query.claId }
                            : { cla: { nome: query.claNome } },
                    };
                }
                tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
                    where,
                    include: tecnicaDetalhadaInclude,
                    orderBy: { nome: 'asc' },
                });
            }
            return {
                schema: TECNICAS_JSON_SCHEMA,
                schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
                exportadoEm: new Date().toISOString(),
                totalTecnicas: tecnicas.length,
                tecnicas: tecnicas.map((tecnica) => this.mapTecnicaExportJson(tecnica, incluirIds)),
            };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async importarTecnicasJson(dto) {
        try {
            const tecnicas = Array.isArray(dto.tecnicas)
                ? dto.tecnicas.map((item, index) => this.parseTecnicaImport(item, index))
                : [];
            if (tecnicas.length === 0) {
                throw new common_1.BadRequestException({
                    code: 'JSON_IMPORT_VAZIO',
                    message: 'Arquivo sem tecnicas para importar.',
                });
            }
            const resumo = {
                schema: TECNICAS_JSON_SCHEMA,
                schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
                modo: 'UPSERT',
                totalRecebido: tecnicas.length,
                tecnicas: { criadas: 0, atualizadas: 0 },
                habilidades: { criadas: 0, atualizadas: 0, removidas: 0 },
                variacoes: { criadas: 0, atualizadas: 0, removidas: 0 },
                avisos: [],
            };
            for (const tecnicaImport of tecnicas) {
                const tecnicaExistente = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { codigo: tecnicaImport.codigo },
                    select: { id: true },
                });
                let tecnicaId = tecnicaExistente?.id;
                if (tecnicaExistente) {
                    await this.updateTecnica(tecnicaExistente.id, {
                        nome: tecnicaImport.nome,
                        descricao: tecnicaImport.descricao,
                        tipo: tecnicaImport.tipo,
                        hereditaria: tecnicaImport.hereditaria,
                        clasHereditarios: tecnicaImport.clasHereditarios,
                        linkExterno: tecnicaImport.linkExterno,
                        fonte: tecnicaImport.fonte,
                        suplementoId: tecnicaImport.suplementoId,
                        requisitos: tecnicaImport.requisitos,
                    });
                    resumo.tecnicas.atualizadas += 1;
                }
                else {
                    const created = await this.createTecnica({
                        codigo: tecnicaImport.codigo,
                        nome: tecnicaImport.nome,
                        descricao: tecnicaImport.descricao,
                        tipo: tecnicaImport.tipo,
                        hereditaria: tecnicaImport.hereditaria ?? false,
                        clasHereditarios: tecnicaImport.clasHereditarios,
                        linkExterno: tecnicaImport.linkExterno,
                        fonte: tecnicaImport.fonte,
                        suplementoId: tecnicaImport.suplementoId,
                        requisitos: tecnicaImport.requisitos,
                    });
                    tecnicaId = created.id;
                    resumo.tecnicas.criadas += 1;
                }
                if (!tecnicaId) {
                    throw new common_1.BadRequestException({
                        code: 'JSON_IMPORT_TECNICA_INVALIDA',
                        message: `Nao foi possivel resolver tecnica ${tecnicaImport.codigo}.`,
                    });
                }
                const habilidadeIdsImportadas = new Set();
                for (const habilidadeImport of tecnicaImport.habilidades) {
                    const habilidadeExistente = await this.prisma.habilidadeTecnica.findUnique({
                        where: { codigo: habilidadeImport.codigo },
                        select: { id: true, tecnicaId: true },
                    });
                    let habilidadeId = habilidadeExistente?.id;
                    if (habilidadeExistente) {
                        if (habilidadeExistente.tecnicaId !== tecnicaId) {
                            throw new common_1.BadRequestException({
                                code: 'JSON_IMPORT_HABILIDADE_OUTRA_TECNICA',
                                message: `Habilidade ${habilidadeImport.codigo} ja pertence a outra tecnica.`,
                            });
                        }
                        await this.updateHabilidade(habilidadeExistente.id, {
                            nome: habilidadeImport.nome,
                            descricao: habilidadeImport.descricao,
                            requisitos: habilidadeImport.requisitos,
                            execucao: habilidadeImport.execucao,
                            area: habilidadeImport.area,
                            alcance: habilidadeImport.alcance,
                            alvo: habilidadeImport.alvo,
                            duracao: habilidadeImport.duracao,
                            resistencia: habilidadeImport.resistencia,
                            dtResistencia: habilidadeImport.dtResistencia,
                            custoPE: habilidadeImport.custoPE,
                            custoEA: habilidadeImport.custoEA,
                            custoSustentacaoEA: habilidadeImport.custoSustentacaoEA,
                            custoSustentacaoPE: habilidadeImport.custoSustentacaoPE,
                            testesExigidos: habilidadeImport.testesExigidos,
                            criticoValor: habilidadeImport.criticoValor,
                            criticoMultiplicador: habilidadeImport.criticoMultiplicador,
                            danoFlat: habilidadeImport.danoFlat,
                            danoFlatTipo: habilidadeImport.danoFlatTipo,
                            dadosDano: habilidadeImport.dadosDano,
                            escalonaPorGrau: habilidadeImport.escalonaPorGrau,
                            grauTipoGrauCodigo: habilidadeImport.grauTipoGrauCodigo,
                            escalonamentoCustoEA: habilidadeImport.escalonamentoCustoEA,
                            escalonamentoCustoPE: habilidadeImport.escalonamentoCustoPE,
                            escalonamentoTipo: habilidadeImport.escalonamentoTipo,
                            escalonamentoEfeito: habilidadeImport.escalonamentoEfeito,
                            escalonamentoDano: habilidadeImport.escalonamentoDano,
                            efeito: habilidadeImport.efeito,
                            ordem: habilidadeImport.ordem,
                        });
                        resumo.habilidades.atualizadas += 1;
                    }
                    else {
                        const created = await this.createHabilidade({
                            tecnicaId,
                            codigo: habilidadeImport.codigo,
                            nome: habilidadeImport.nome,
                            descricao: habilidadeImport.descricao,
                            requisitos: habilidadeImport.requisitos,
                            execucao: habilidadeImport.execucao,
                            area: habilidadeImport.area,
                            alcance: habilidadeImport.alcance,
                            alvo: habilidadeImport.alvo,
                            duracao: habilidadeImport.duracao,
                            resistencia: habilidadeImport.resistencia,
                            dtResistencia: habilidadeImport.dtResistencia,
                            custoPE: habilidadeImport.custoPE,
                            custoEA: habilidadeImport.custoEA,
                            custoSustentacaoEA: habilidadeImport.custoSustentacaoEA,
                            custoSustentacaoPE: habilidadeImport.custoSustentacaoPE,
                            testesExigidos: habilidadeImport.testesExigidos,
                            criticoValor: habilidadeImport.criticoValor,
                            criticoMultiplicador: habilidadeImport.criticoMultiplicador,
                            danoFlat: habilidadeImport.danoFlat,
                            danoFlatTipo: habilidadeImport.danoFlatTipo,
                            dadosDano: habilidadeImport.dadosDano,
                            escalonaPorGrau: habilidadeImport.escalonaPorGrau,
                            grauTipoGrauCodigo: habilidadeImport.grauTipoGrauCodigo,
                            escalonamentoCustoEA: habilidadeImport.escalonamentoCustoEA,
                            escalonamentoCustoPE: habilidadeImport.escalonamentoCustoPE,
                            escalonamentoTipo: habilidadeImport.escalonamentoTipo,
                            escalonamentoEfeito: habilidadeImport.escalonamentoEfeito,
                            escalonamentoDano: habilidadeImport.escalonamentoDano,
                            efeito: habilidadeImport.efeito,
                            ordem: habilidadeImport.ordem,
                        });
                        habilidadeId = created.id;
                        resumo.habilidades.criadas += 1;
                    }
                    if (!habilidadeId) {
                        throw new common_1.BadRequestException({
                            code: 'JSON_IMPORT_HABILIDADE_INVALIDA',
                            message: `Nao foi possivel resolver habilidade ${habilidadeImport.codigo}.`,
                        });
                    }
                    habilidadeIdsImportadas.add(habilidadeId);
                    const variacoesAtuais = await this.prisma.variacaoHabilidade.findMany({
                        where: { habilidadeTecnicaId: habilidadeId },
                        select: { id: true, nome: true },
                    });
                    const variacaoIdsImportadas = new Set();
                    for (const variacaoImport of habilidadeImport.variacoes) {
                        let variacaoId = variacaoImport.id;
                        if (variacaoId) {
                            const variacaoPorId = variacoesAtuais.find((variacao) => variacao.id === variacaoId);
                            if (!variacaoPorId) {
                                resumo.avisos.push(`Variacao id=${variacaoId} nao encontrada em ${habilidadeImport.codigo}; usando match por nome.`);
                                variacaoId = undefined;
                            }
                        }
                        if (!variacaoId) {
                            variacaoId = variacoesAtuais.find((variacao) => variacao.nome === variacaoImport.nome)?.id;
                        }
                        if (variacaoId) {
                            await this.updateVariacao(variacaoId, {
                                nome: variacaoImport.nome,
                                descricao: variacaoImport.descricao,
                                substituiCustos: variacaoImport.substituiCustos,
                                custoPE: variacaoImport.custoPE,
                                custoEA: variacaoImport.custoEA,
                                custoSustentacaoEA: variacaoImport.custoSustentacaoEA,
                                custoSustentacaoPE: variacaoImport.custoSustentacaoPE,
                                execucao: variacaoImport.execucao,
                                area: variacaoImport.area,
                                alcance: variacaoImport.alcance,
                                alvo: variacaoImport.alvo,
                                duracao: variacaoImport.duracao,
                                resistencia: variacaoImport.resistencia,
                                dtResistencia: variacaoImport.dtResistencia,
                                criticoValor: variacaoImport.criticoValor,
                                criticoMultiplicador: variacaoImport.criticoMultiplicador,
                                danoFlat: variacaoImport.danoFlat,
                                danoFlatTipo: variacaoImport.danoFlatTipo,
                                dadosDano: variacaoImport.dadosDano,
                                escalonaPorGrau: variacaoImport.escalonaPorGrau,
                                escalonamentoCustoEA: variacaoImport.escalonamentoCustoEA,
                                escalonamentoCustoPE: variacaoImport.escalonamentoCustoPE,
                                escalonamentoTipo: variacaoImport.escalonamentoTipo,
                                escalonamentoEfeito: variacaoImport.escalonamentoEfeito,
                                escalonamentoDano: variacaoImport.escalonamentoDano,
                                efeitoAdicional: variacaoImport.efeitoAdicional,
                                requisitos: variacaoImport.requisitos,
                                ordem: variacaoImport.ordem,
                            });
                            variacaoIdsImportadas.add(variacaoId);
                            resumo.variacoes.atualizadas += 1;
                        }
                        else {
                            const created = await this.createVariacao({
                                habilidadeTecnicaId: habilidadeId,
                                nome: variacaoImport.nome,
                                descricao: variacaoImport.descricao,
                                substituiCustos: variacaoImport.substituiCustos,
                                custoPE: variacaoImport.custoPE,
                                custoEA: variacaoImport.custoEA,
                                custoSustentacaoEA: variacaoImport.custoSustentacaoEA,
                                custoSustentacaoPE: variacaoImport.custoSustentacaoPE,
                                execucao: variacaoImport.execucao,
                                area: variacaoImport.area,
                                alcance: variacaoImport.alcance,
                                alvo: variacaoImport.alvo,
                                duracao: variacaoImport.duracao,
                                resistencia: variacaoImport.resistencia,
                                dtResistencia: variacaoImport.dtResistencia,
                                criticoValor: variacaoImport.criticoValor,
                                criticoMultiplicador: variacaoImport.criticoMultiplicador,
                                danoFlat: variacaoImport.danoFlat,
                                danoFlatTipo: variacaoImport.danoFlatTipo,
                                dadosDano: variacaoImport.dadosDano,
                                escalonaPorGrau: variacaoImport.escalonaPorGrau,
                                escalonamentoCustoEA: variacaoImport.escalonamentoCustoEA,
                                escalonamentoCustoPE: variacaoImport.escalonamentoCustoPE,
                                escalonamentoTipo: variacaoImport.escalonamentoTipo,
                                escalonamentoEfeito: variacaoImport.escalonamentoEfeito,
                                escalonamentoDano: variacaoImport.escalonamentoDano,
                                efeitoAdicional: variacaoImport.efeitoAdicional,
                                requisitos: variacaoImport.requisitos,
                                ordem: variacaoImport.ordem,
                            });
                            variacaoIdsImportadas.add(created.id);
                            resumo.variacoes.criadas += 1;
                        }
                    }
                    if (dto.substituirVariacoesAusentes) {
                        for (const variacaoAtual of variacoesAtuais) {
                            if (!variacaoIdsImportadas.has(variacaoAtual.id)) {
                                await this.removeVariacao(variacaoAtual.id);
                                resumo.variacoes.removidas += 1;
                            }
                        }
                    }
                }
                if (dto.substituirHabilidadesAusentes) {
                    const habilidadesAtuais = await this.prisma.habilidadeTecnica.findMany({
                        where: { tecnicaId },
                        select: { id: true },
                    });
                    for (const habilidadeAtual of habilidadesAtuais) {
                        if (!habilidadeIdsImportadas.has(habilidadeAtual.id)) {
                            await this.removeHabilidade(habilidadeAtual.id);
                            resumo.habilidades.removidas += 1;
                        }
                    }
                }
            }
            return resumo;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findAllTecnicas(filtros) {
        try {
            const where = {};
            if (filtros.nome) {
                where.nome = { contains: filtros.nome };
            }
            if (filtros.codigo) {
                where.codigo = filtros.codigo;
            }
            if (filtros.tipo) {
                where.tipo = filtros.tipo;
            }
            if (filtros.hereditaria !== undefined) {
                where.hereditaria = filtros.hereditaria;
            }
            if (filtros.fonte) {
                where.fonte = filtros.fonte;
            }
            if (filtros.suplementoId) {
                where.suplementoId = filtros.suplementoId;
            }
            if (filtros.claId || filtros.claNome) {
                where.clas = {
                    some: filtros.claId
                        ? { claId: filtros.claId }
                        : { cla: { nome: filtros.claNome } },
                };
            }
            const incluirClas = filtros.incluirClas !== false;
            const incluirHabilidades = filtros.incluirHabilidades === true;
            const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
                where,
                include: tecnicaDetalhadaInclude,
                orderBy: { nome: 'asc' },
            });
            return tecnicas.map((tecnica) => this.mapTecnicaToDto(tecnica, {
                incluirClas,
                incluirHabilidades,
            }));
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findOneTecnica(id) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
                include: tecnicaDetalhadaInclude,
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            return this.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findTecnicaByCodigo(codigo) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { codigo },
                include: tecnicaDetalhadaInclude,
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(codigo);
            }
            return this.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async createTecnica(dto) {
        try {
            const existe = await this.prisma.tecnicaAmaldicoada.findFirst({
                where: {
                    OR: [{ codigo: dto.codigo }, { nome: dto.nome }],
                },
            });
            if (existe) {
                throw new tecnica_amaldicoada_exception_1.TecnicaCodigoOuNomeDuplicadoException(dto.codigo, dto.nome);
            }
            if (dto.hereditaria && dto.tipo !== client_1.TipoTecnicaAmaldicoada.INATA) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoInataHereditariaException(dto.tipo);
            }
            if (dto.hereditaria &&
                (!dto.clasHereditarios || dto.clasHereditarios.length === 0)) {
                throw new tecnica_amaldicoada_exception_1.TecnicaHereditariaSemClaException();
            }
            const suplementoIdFinal = dto.suplementoId ?? null;
            const fonteFinal = dto.fonte ??
                (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : client_1.TipoFonte.SISTEMA_BASE);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const tecnica = await this.prisma.tecnicaAmaldicoada.create({
                data: {
                    codigo: dto.codigo,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    tipo: dto.tipo,
                    hereditaria: dto.hereditaria ?? false,
                    linkExterno: dto.linkExterno ?? null,
                    fonte: fonteFinal,
                    suplementoId: suplementoIdFinal,
                    requisitos: this.normalizarJsonOuNull(dto.requisitos),
                },
            });
            if (dto.hereditaria &&
                dto.clasHereditarios &&
                dto.clasHereditarios.length > 0) {
                await this.vincularClas(tecnica.id, dto.clasHereditarios);
            }
            return this.findOneTecnica(tecnica.id);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async updateTecnica(id, dto) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            if (dto.nome) {
                const tecnicaComMesmoNome = await this.prisma.tecnicaAmaldicoada.findFirst({
                    where: {
                        nome: dto.nome,
                        NOT: { id },
                    },
                });
                if (tecnicaComMesmoNome) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaCodigoOuNomeDuplicadoException(tecnica.codigo, dto.nome);
                }
            }
            const tipoFinal = dto.tipo ?? tecnica.tipo;
            const hereditariaFinal = dto.hereditaria ?? tecnica.hereditaria;
            if (hereditariaFinal && tipoFinal === client_1.TipoTecnicaAmaldicoada.NAO_INATA) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoInataHereditariaException(tipoFinal);
            }
            const suplementoIdFinal = dto.suplementoId !== undefined
                ? dto.suplementoId
                : tecnica.suplementoId;
            const fonteFinal = dto.fonte ?? (suplementoIdFinal ? client_1.TipoFonte.SUPLEMENTO : tecnica.fonte);
            await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
            const shouldUpdateClas = dto.clasHereditarios !== undefined || dto.hereditaria === false;
            if (dto.hereditaria === true && dto.clasHereditarios === undefined) {
                const totalClasVinculados = await this.prisma.tecnicaCla.count({
                    where: { tecnicaId: id },
                });
                if (totalClasVinculados === 0) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaHereditariaSemClaException(id);
                }
            }
            if (shouldUpdateClas) {
                if (hereditariaFinal &&
                    (!dto.clasHereditarios || dto.clasHereditarios.length === 0)) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaHereditariaSemClaException(id);
                }
                await this.prisma.tecnicaCla.deleteMany({ where: { tecnicaId: id } });
                if (hereditariaFinal &&
                    dto.clasHereditarios &&
                    dto.clasHereditarios.length > 0) {
                    await this.vincularClas(id, dto.clasHereditarios);
                }
            }
            await this.prisma.tecnicaAmaldicoada.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    tipo: dto.tipo,
                    hereditaria: dto.hereditaria,
                    linkExterno: dto.linkExterno,
                    fonte: fonteFinal,
                    ...(dto.suplementoId !== undefined && {
                        suplementoId: dto.suplementoId,
                    }),
                    requisitos: this.normalizarJsonOpcional(dto.requisitos),
                },
            });
            return this.findOneTecnica(id);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async removeTecnica(id) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id },
                include: tecnicaUsoInclude,
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            const detalhesUso = {
                personagensBaseComInata: tecnica._count.personagensBaseComInata,
                personagensCampanhaComInata: tecnica._count.personagensCampanhaComInata,
                personagensBaseAprendeu: tecnica._count.personagensBaseAprendeu,
                personagensCampanhaAprendeu: tecnica._count.personagensCampanhaAprendeu,
            };
            const totalUso = Object.values(detalhesUso).reduce((acc, val) => acc + val, 0);
            if (totalUso > 0) {
                throw new tecnica_amaldicoada_exception_1.TecnicaEmUsoException(id, totalUso, detalhesUso);
            }
            await this.prisma.tecnicaAmaldicoada.delete({ where: { id } });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findTecnicasByCla(claId) {
        try {
            const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
                where: {
                    hereditaria: true,
                    clas: {
                        some: { claId },
                    },
                },
                include: tecnicaDetalhadaInclude,
                orderBy: { nome: 'asc' },
            });
            return tecnicas.map((tecnica) => this.mapTecnicaToDto(tecnica));
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findAllHabilidades(tecnicaId) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id: tecnicaId },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(tecnicaId);
            }
            return this.prisma.habilidadeTecnica.findMany({
                where: { tecnicaId },
                include: {
                    variacoes: {
                        orderBy: { ordem: 'asc' },
                    },
                },
                orderBy: { ordem: 'asc' },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findOneHabilidade(id) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
                include: {
                    tecnica: {
                        select: {
                            id: true,
                            codigo: true,
                            nome: true,
                        },
                    },
                    variacoes: {
                        orderBy: { ordem: 'asc' },
                    },
                },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            return habilidade;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async createHabilidade(dto) {
        try {
            const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                where: { id: dto.tecnicaId },
            });
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(dto.tecnicaId);
            }
            const existe = await this.prisma.habilidadeTecnica.findUnique({
                where: { codigo: dto.codigo },
            });
            if (existe) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeCodigoDuplicadoException(dto.codigo);
            }
            return this.prisma.habilidadeTecnica.create({
                data: {
                    tecnicaId: dto.tecnicaId,
                    codigo: dto.codigo,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    requisitos: this.normalizarJsonOuNull(dto.requisitos),
                    execucao: dto.execucao,
                    area: dto.area ?? null,
                    alcance: dto.alcance ?? null,
                    alvo: dto.alvo ?? null,
                    duracao: dto.duracao ?? null,
                    resistencia: dto.resistencia ?? null,
                    dtResistencia: dto.dtResistencia ?? null,
                    custoPE: dto.custoPE ?? 0,
                    custoEA: dto.custoEA ?? 0,
                    custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
                    custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
                    testesExigidos: this.normalizarJsonOuNull(dto.testesExigidos),
                    criticoValor: dto.criticoValor ?? null,
                    criticoMultiplicador: dto.criticoMultiplicador ?? null,
                    danoFlat: dto.danoFlat ?? null,
                    danoFlatTipo: dto.danoFlatTipo ?? null,
                    dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau ?? false,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE ?? 0,
                    escalonamentoTipo: dto.escalonamentoTipo ?? 'OUTRO',
                    escalonamentoEfeito: this.normalizarJsonOuNull(dto.escalonamentoEfeito),
                    escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
                    efeito: dto.efeito,
                    ordem: dto.ordem ?? 0,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async updateHabilidade(id, dto) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            return this.prisma.habilidadeTecnica.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    requisitos: this.normalizarJsonOpcional(dto.requisitos),
                    execucao: dto.execucao,
                    area: dto.area,
                    alcance: dto.alcance,
                    alvo: dto.alvo,
                    duracao: dto.duracao,
                    resistencia: dto.resistencia,
                    dtResistencia: dto.dtResistencia,
                    custoPE: dto.custoPE,
                    custoEA: dto.custoEA,
                    custoSustentacaoEA: dto.custoSustentacaoEA,
                    custoSustentacaoPE: dto.custoSustentacaoPE,
                    testesExigidos: this.normalizarJsonOpcional(dto.testesExigidos),
                    criticoValor: dto.criticoValor,
                    criticoMultiplicador: dto.criticoMultiplicador,
                    danoFlat: dto.danoFlat,
                    danoFlatTipo: dto.danoFlatTipo,
                    dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau,
                    grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE,
                    escalonamentoTipo: dto.escalonamentoTipo,
                    escalonamentoEfeito: this.normalizarJsonOpcional(dto.escalonamentoEfeito),
                    escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
                    efeito: dto.efeito,
                    ordem: dto.ordem,
                },
                include: {
                    variacoes: true,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async removeHabilidade(id) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(id);
            }
            await this.prisma.habilidadeTecnica.delete({ where: { id } });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findAllVariacoes(habilidadeTecnicaId) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id: habilidadeTecnicaId },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(habilidadeTecnicaId);
            }
            return this.prisma.variacaoHabilidade.findMany({
                where: { habilidadeTecnicaId },
                orderBy: { ordem: 'asc' },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async findOneVariacao(id) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
                include: {
                    habilidadeTecnica: {
                        select: {
                            id: true,
                            codigo: true,
                            nome: true,
                            tecnica: {
                                select: {
                                    id: true,
                                    codigo: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            return variacao;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async createVariacao(dto) {
        try {
            const habilidade = await this.prisma.habilidadeTecnica.findUnique({
                where: { id: dto.habilidadeTecnicaId },
            });
            if (!habilidade) {
                throw new tecnica_amaldicoada_exception_1.HabilidadeTecnicaNaoEncontradaException(dto.habilidadeTecnicaId);
            }
            return this.prisma.variacaoHabilidade.create({
                data: {
                    habilidadeTecnicaId: dto.habilidadeTecnicaId,
                    nome: dto.nome,
                    descricao: dto.descricao,
                    substituiCustos: dto.substituiCustos ?? false,
                    custoPE: dto.custoPE ?? null,
                    custoEA: dto.custoEA ?? null,
                    custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
                    custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
                    execucao: dto.execucao ?? null,
                    area: dto.area ?? null,
                    alcance: dto.alcance ?? null,
                    alvo: dto.alvo ?? null,
                    duracao: dto.duracao ?? null,
                    resistencia: dto.resistencia ?? null,
                    dtResistencia: dto.dtResistencia ?? null,
                    criticoValor: dto.criticoValor ?? null,
                    criticoMultiplicador: dto.criticoMultiplicador ?? null,
                    danoFlat: dto.danoFlat ?? null,
                    danoFlatTipo: dto.danoFlatTipo ?? null,
                    dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau ?? null,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE ?? null,
                    escalonamentoTipo: dto.escalonamentoTipo ?? null,
                    escalonamentoEfeito: this.normalizarJsonOuNull(dto.escalonamentoEfeito),
                    escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
                    efeitoAdicional: dto.efeitoAdicional ?? null,
                    requisitos: this.normalizarJsonOuNull(dto.requisitos),
                    ordem: dto.ordem ?? 0,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async updateVariacao(id, dto) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            return this.prisma.variacaoHabilidade.update({
                where: { id },
                data: {
                    nome: dto.nome,
                    descricao: dto.descricao,
                    substituiCustos: dto.substituiCustos,
                    custoPE: dto.custoPE,
                    custoEA: dto.custoEA,
                    custoSustentacaoEA: dto.custoSustentacaoEA,
                    custoSustentacaoPE: dto.custoSustentacaoPE,
                    execucao: dto.execucao,
                    area: dto.area,
                    alcance: dto.alcance,
                    alvo: dto.alvo,
                    duracao: dto.duracao,
                    resistencia: dto.resistencia,
                    dtResistencia: dto.dtResistencia,
                    criticoValor: dto.criticoValor,
                    criticoMultiplicador: dto.criticoMultiplicador,
                    danoFlat: dto.danoFlat,
                    danoFlatTipo: dto.danoFlatTipo,
                    dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
                    escalonaPorGrau: dto.escalonaPorGrau,
                    escalonamentoCustoEA: dto.escalonamentoCustoEA,
                    escalonamentoCustoPE: dto.escalonamentoCustoPE,
                    escalonamentoTipo: dto.escalonamentoTipo,
                    escalonamentoEfeito: this.normalizarJsonOpcional(dto.escalonamentoEfeito),
                    escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
                    efeitoAdicional: dto.efeitoAdicional,
                    requisitos: this.normalizarJsonOpcional(dto.requisitos),
                    ordem: dto.ordem,
                },
            });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async removeVariacao(id) {
        try {
            const variacao = await this.prisma.variacaoHabilidade.findUnique({
                where: { id },
            });
            if (!variacao) {
                throw new tecnica_amaldicoada_exception_1.VariacaoHabilidadeNaoEncontradaException(id);
            }
            await this.prisma.variacaoHabilidade.delete({ where: { id } });
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async vincularClas(tecnicaId, claNomes) {
        for (const nome of claNomes) {
            const cla = await this.prisma.cla.findUnique({ where: { nome } });
            if (!cla) {
                throw new tecnica_amaldicoada_exception_1.TecnicaClaNaoEncontradoException(nome);
            }
            await this.prisma.tecnicaCla.create({
                data: {
                    tecnicaId,
                    claId: cla.id,
                },
            });
        }
    }
    mapTecnicaToDto(tecnica, options) {
        const incluirClas = options?.incluirClas !== false;
        const incluirHabilidades = options?.incluirHabilidades !== false;
        return {
            id: tecnica.id,
            codigo: tecnica.codigo,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            tipo: tecnica.tipo,
            hereditaria: tecnica.hereditaria,
            linkExterno: tecnica.linkExterno ?? undefined,
            fonte: tecnica.fonte,
            suplementoId: tecnica.suplementoId ?? undefined,
            requisitos: tecnica.requisitos ?? undefined,
            clasHereditarios: incluirClas
                ? tecnica.clas.map((tecnicaCla) => tecnicaCla.cla)
                : [],
            habilidades: incluirHabilidades
                ? tecnica.habilidades
                : [],
            criadoEm: tecnica.criadoEm,
            atualizadoEm: tecnica.atualizadoEm,
        };
    }
};
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService;
exports.TecnicasAmaldicoadasService = TecnicasAmaldicoadasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TecnicasAmaldicoadasService);
//# sourceMappingURL=tecnicas-amaldicoadas.service.js.map