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
exports.TecnicasAmaldicoadasImportExportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnicas_amaldicoadas_engine_types_1 = require("./engine/tecnicas-amaldicoadas.engine.types");
const tecnicas_amaldicoadas_mapper_1 = require("./tecnicas-amaldicoadas.mapper");
const tecnicas_amaldicoadas_errors_1 = require("./tecnicas-amaldicoadas.errors");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
const tecnicas_amaldicoadas_crud_service_1 = require("./tecnicas-amaldicoadas.crud.service");
const tecnicas_amaldicoadas_habilidades_service_1 = require("./tecnicas-amaldicoadas.habilidades.service");
const tecnicas_amaldicoadas_variacoes_service_1 = require("./tecnicas-amaldicoadas.variacoes.service");
let TecnicasAmaldicoadasImportExportService = class TecnicasAmaldicoadasImportExportService {
    prisma;
    crudService;
    habilidadesService;
    variacoesService;
    constructor(prisma, crudService, habilidadesService, variacoesService) {
        this.prisma = prisma;
        this.crudService = crudService;
        this.habilidadesService = habilidadesService;
        this.variacoesService = variacoesService;
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
    lerJsonOpcional(source, campo) {
        const raw = source[campo];
        if (raw === undefined) {
            return undefined;
        }
        return raw;
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
        const rawArray = raw;
        const normalized = rawArray
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
            dadosDano: this.lerJsonOpcional(source, 'dadosDano'),
            escalonaPorGrau: this.lerBooleanOpcional(source, 'escalonaPorGrau', path),
            escalonamentoCustoEA: this.lerInteiroOpcional(source, 'escalonamentoCustoEA', path),
            escalonamentoCustoPE: this.lerInteiroOpcional(source, 'escalonamentoCustoPE', path),
            escalonamentoTipo: this.lerEnumOpcional(source, 'escalonamentoTipo', client_1.TipoEscalonamentoHabilidade, path),
            escalonamentoEfeito: this.lerJsonOpcional(source, 'escalonamentoEfeito'),
            escalonamentoDano: this.lerJsonOpcional(source, 'escalonamentoDano'),
            efeitoAdicional: this.lerStringOpcional(source, 'efeitoAdicional'),
            requisitos: this.lerJsonOpcional(source, 'requisitos'),
            ordem: this.lerInteiroOpcional(source, 'ordem', path),
        };
    }
    parseHabilidadeImport(raw, tecnicaPath, index) {
        const path = `${tecnicaPath}.habilidades[${index}]`;
        const source = this.garantirObjeto(raw, path);
        const variacoesRaw = Array.isArray(source.variacoes)
            ? source.variacoes
            : [];
        return {
            id: this.lerInteiroOpcional(source, 'id', path),
            codigo: this.lerStringObrigatoria(source, 'codigo', path),
            nome: this.lerStringObrigatoria(source, 'nome', path),
            descricao: this.lerStringObrigatoria(source, 'descricao', path),
            requisitos: this.lerJsonOpcional(source, 'requisitos'),
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
            testesExigidos: this.lerJsonOpcional(source, 'testesExigidos'),
            criticoValor: this.lerInteiroOpcional(source, 'criticoValor', path),
            criticoMultiplicador: this.lerInteiroOpcional(source, 'criticoMultiplicador', path),
            danoFlat: this.lerInteiroOpcional(source, 'danoFlat', path),
            danoFlatTipo: this.lerEnumOpcional(source, 'danoFlatTipo', client_1.TipoDano, path),
            dadosDano: this.lerJsonOpcional(source, 'dadosDano'),
            escalonaPorGrau: this.lerBooleanOpcional(source, 'escalonaPorGrau', path) ?? false,
            grauTipoGrauCodigo: this.lerStringOpcional(source, 'grauTipoGrauCodigo'),
            escalonamentoCustoEA: this.lerInteiroOpcional(source, 'escalonamentoCustoEA', path) ?? 0,
            escalonamentoCustoPE: this.lerInteiroOpcional(source, 'escalonamentoCustoPE', path) ?? 0,
            escalonamentoTipo: this.lerEnumOpcional(source, 'escalonamentoTipo', client_1.TipoEscalonamentoHabilidade, path) ?? client_1.TipoEscalonamentoHabilidade.OUTRO,
            escalonamentoEfeito: this.lerJsonOpcional(source, 'escalonamentoEfeito'),
            escalonamentoDano: this.lerJsonOpcional(source, 'escalonamentoDano'),
            efeito: this.lerStringObrigatoria(source, 'efeito', path),
            ordem: this.lerInteiroOpcional(source, 'ordem', path),
            variacoes: variacoesRaw.map((variacao, variacaoIndex) => this.parseVariacaoImport(variacao, path, variacaoIndex)),
        };
    }
    parseTecnicaImport(raw, index) {
        const path = `tecnicas[${index}]`;
        const source = this.garantirObjeto(raw, path);
        const habilidadesRaw = Array.isArray(source.habilidades)
            ? source.habilidades
            : [];
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
            requisitos: this.lerJsonOpcional(source, 'requisitos'),
            habilidades: habilidadesRaw.map((habilidade, habilidadeIndex) => this.parseHabilidadeImport(habilidade, path, habilidadeIndex)),
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
    getGuiaImportacaoJson() {
        const exemploMinimo = {
            schema: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA,
            schemaVersion: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA_VERSION,
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
            schema: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA,
            schemaVersion: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA_VERSION,
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
            schema: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA,
            schemaVersion: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA_VERSION,
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
                    include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
                });
                if (!tecnica) {
                    throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(query.id);
                }
                tecnicas = [tecnica];
            }
            else if (query.codigo) {
                const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { codigo: query.codigo },
                    include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
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
                    include: tecnicas_amaldicoadas_mapper_1.tecnicaDetalhadaInclude,
                    orderBy: { nome: 'asc' },
                });
            }
            return {
                schema: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA,
                schemaVersion: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA_VERSION,
                exportadoEm: new Date().toISOString(),
                totalTecnicas: tecnicas.length,
                tecnicas: tecnicas.map((tecnica) => this.mapTecnicaExportJson(tecnica, incluirIds)),
            };
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
                schema: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA,
                schemaVersion: tecnicas_amaldicoadas_engine_types_1.TECNICAS_JSON_SCHEMA_VERSION,
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
                    await this.crudService.updateTecnica(tecnicaExistente.id, {
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
                    const created = await this.crudService.createTecnica({
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
                        await this.habilidadesService.updateHabilidade(habilidadeExistente.id, {
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
                        const created = await this.habilidadesService.createHabilidade({
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
                            await this.variacoesService.updateVariacao(variacaoId, {
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
                            const created = await this.variacoesService.createVariacao({
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
                                await this.variacoesService.removeVariacao(variacaoAtual.id);
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
                            await this.habilidadesService.removeHabilidade(habilidadeAtual.id);
                            resumo.habilidades.removidas += 1;
                        }
                    }
                }
            }
            return resumo;
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
};
exports.TecnicasAmaldicoadasImportExportService = TecnicasAmaldicoadasImportExportService;
exports.TecnicasAmaldicoadasImportExportService = TecnicasAmaldicoadasImportExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tecnicas_amaldicoadas_crud_service_1.TecnicasAmaldicoadasCrudService,
        tecnicas_amaldicoadas_habilidades_service_1.TecnicasAmaldicoadasHabilidadesService,
        tecnicas_amaldicoadas_variacoes_service_1.TecnicasAmaldicoadasVariacoesService])
], TecnicasAmaldicoadasImportExportService);
//# sourceMappingURL=tecnicas-amaldicoadas.import-export.service.js.map