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
var HomebrewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomebrewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const homebrew_exception_1 = require("../common/exceptions/homebrew.exception");
const database_exception_1 = require("../common/exceptions/database.exception");
const validate_homebrew_dados_1 = require("./validators/validate-homebrew-dados");
const validate_homebrew_tecnica_1 = require("./validators/validate-homebrew-tecnica");
const validate_homebrew_equipamento_1 = require("./validators/validate-homebrew-equipamento");
const validate_homebrew_origem_1 = require("./validators/validate-homebrew-origem");
const validate_homebrew_trilha_1 = require("./validators/validate-homebrew-trilha");
const validate_homebrew_caminho_1 = require("./validators/validate-homebrew-caminho");
const validate_homebrew_cla_1 = require("./validators/validate-homebrew-cla");
const validate_homebrew_poder_1 = require("./validators/validate-homebrew-poder");
const homebrewDetalhadoInclude = {
    usuario: {
        select: {
            id: true,
            apelido: true,
            email: true,
        },
    },
};
let HomebrewsService = HomebrewsService_1 = class HomebrewsService {
    prisma;
    logger = new common_1.Logger(HomebrewsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    tratarErroPrisma(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            error instanceof client_1.Prisma.PrismaClientValidationError) {
            (0, database_exception_1.handlePrismaError)(error);
        }
    }
    extrairMensagensValidacao(error) {
        if (typeof error !== 'object' || error === null || !('response' in error)) {
            return null;
        }
        const response = error.response;
        if (typeof response !== 'object' ||
            response === null ||
            !('message' in response)) {
            return null;
        }
        const message = response.message;
        if (Array.isArray(message)) {
            const mensagens = message.filter((item) => typeof item === 'string');
            return mensagens.length > 0 ? mensagens : null;
        }
        if (typeof message === 'string') {
            return [message];
        }
        return null;
    }
    normalizarJsonParaPersistir(value) {
        if (value === null) {
            return client_1.Prisma.JsonNull;
        }
        return value;
    }
    mapearTags(tags) {
        if (!Array.isArray(tags)) {
            return [];
        }
        return tags.filter((tag) => typeof tag === 'string');
    }
    async listar(filtros, usuarioId, isAdmin = false) {
        try {
            const { nome, tipo, status, usuarioId: filtroUsuarioId, apenasPublicados, pagina = 1, limite = 20, } = filtros;
            const where = {};
            if (nome) {
                where.nome = { contains: nome };
            }
            if (tipo) {
                where.tipo = tipo;
            }
            if (status) {
                where.status = status;
            }
            if (filtroUsuarioId) {
                where.usuarioId = filtroUsuarioId;
            }
            if (apenasPublicados) {
                where.status = client_1.StatusPublicacao.PUBLICADO;
            }
            else if (!isAdmin) {
                if (usuarioId !== undefined) {
                    where.OR = [{ status: client_1.StatusPublicacao.PUBLICADO }, { usuarioId }];
                }
                else {
                    where.status = client_1.StatusPublicacao.PUBLICADO;
                }
            }
            const [total, homebrews] = await Promise.all([
                this.prisma.homebrew.count({ where }),
                this.prisma.homebrew.findMany({
                    where,
                    skip: (pagina - 1) * limite,
                    take: limite,
                    orderBy: { criadoEm: 'desc' },
                    select: {
                        id: true,
                        codigo: true,
                        nome: true,
                        descricao: true,
                        tipo: true,
                        status: true,
                        tags: true,
                        versao: true,
                        criadoEm: true,
                        atualizadoEm: true,
                        usuarioId: true,
                        usuario: {
                            select: {
                                id: true,
                                apelido: true,
                            },
                        },
                    },
                }),
            ]);
            return {
                dados: homebrews,
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas: Math.ceil(total / limite),
                },
            };
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorId(id, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findUnique({
                where: { id },
                include: homebrewDetalhadoInclude,
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(id);
            }
            this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);
            return this.mapDetalhado(homebrew);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async buscarPorCodigo(codigo, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findFirst({
                where: { codigo },
                include: homebrewDetalhadoInclude,
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(codigo);
            }
            this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);
            return this.mapDetalhado(homebrew);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async criar(createHomebrewDto, usuarioId) {
        try {
            await (0, validate_homebrew_dados_1.validateHomebrewDados)(createHomebrewDto.tipo, createHomebrewDto.dados);
            this.validarDadosCustomizados(createHomebrewDto.tipo, createHomebrewDto.dados);
            const codigo = this.gerarCodigo(usuarioId);
            const tags = Array.isArray(createHomebrewDto.tags)
                ? createHomebrewDto.tags
                : [];
            const data = {
                codigo,
                nome: createHomebrewDto.nome,
                descricao: createHomebrewDto.descricao ?? null,
                tipo: createHomebrewDto.tipo,
                status: createHomebrewDto.status ?? client_1.StatusPublicacao.RASCUNHO,
                dados: this.normalizarJsonParaPersistir(createHomebrewDto.dados),
                tags: this.normalizarJsonParaPersistir(tags),
                versao: createHomebrewDto.versao ?? '1.0.0',
                usuarioId,
            };
            const homebrew = await this.prisma.homebrew.create({
                data,
                include: homebrewDetalhadoInclude,
            });
            this.logger.log(`Homebrew criado: ${homebrew.codigo} por usu�rio ${usuarioId}`);
            return this.mapDetalhado(homebrew);
        }
        catch (error) {
            const mensagens = this.extrairMensagensValidacao(error);
            if (mensagens) {
                throw new homebrew_exception_1.HomebrewDadosInvalidosException(mensagens);
            }
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async atualizar(id, updateHomebrewDto, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findUnique({
                where: { id },
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(id);
            }
            if (homebrew.usuarioId !== usuarioId && !isAdmin) {
                throw new homebrew_exception_1.HomebrewSemPermissaoException('editar', 'este homebrew', id);
            }
            const dadosAtualizacao = {};
            if (updateHomebrewDto.nome !== undefined) {
                dadosAtualizacao.nome = updateHomebrewDto.nome;
            }
            if (updateHomebrewDto.descricao !== undefined) {
                dadosAtualizacao.descricao = updateHomebrewDto.descricao;
            }
            if (updateHomebrewDto.status !== undefined) {
                dadosAtualizacao.status = updateHomebrewDto.status;
            }
            if (updateHomebrewDto.tags !== undefined) {
                dadosAtualizacao.tags = this.normalizarJsonParaPersistir(updateHomebrewDto.tags);
            }
            const tipoFoiAlterado = updateHomebrewDto.tipo !== undefined &&
                updateHomebrewDto.tipo !== homebrew.tipo;
            if (updateHomebrewDto.tipo !== undefined) {
                dadosAtualizacao.tipo = updateHomebrewDto.tipo;
            }
            const tipoFinal = updateHomebrewDto.tipo ?? homebrew.tipo;
            let dadosForamAlterados = false;
            if (updateHomebrewDto.dados !== undefined) {
                await (0, validate_homebrew_dados_1.validateHomebrewDados)(tipoFinal, updateHomebrewDto.dados);
                this.validarDadosCustomizados(tipoFinal, updateHomebrewDto.dados);
                dadosAtualizacao.dados = this.normalizarJsonParaPersistir(updateHomebrewDto.dados);
                dadosForamAlterados = true;
            }
            else if (tipoFoiAlterado) {
                await (0, validate_homebrew_dados_1.validateHomebrewDados)(tipoFinal, homebrew.dados);
                this.validarDadosCustomizados(tipoFinal, homebrew.dados);
            }
            if (dadosForamAlterados || tipoFoiAlterado) {
                dadosAtualizacao.versao = this.incrementarVersao(homebrew.versao);
            }
            const atualizado = await this.prisma.homebrew.update({
                where: { id },
                data: dadosAtualizacao,
                include: homebrewDetalhadoInclude,
            });
            this.logger.log(`Homebrew atualizado: ${atualizado.codigo} (v${atualizado.versao})`);
            return this.mapDetalhado(atualizado);
        }
        catch (error) {
            const mensagens = this.extrairMensagensValidacao(error);
            if (mensagens) {
                throw new homebrew_exception_1.HomebrewDadosInvalidosException(mensagens);
            }
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async deletar(id, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findUnique({
                where: { id },
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(id);
            }
            if (homebrew.usuarioId !== usuarioId && !isAdmin) {
                throw new homebrew_exception_1.HomebrewSemPermissaoException('deletar', 'este homebrew', id);
            }
            await this.prisma.homebrew.delete({
                where: { id },
            });
            this.logger.log(`Homebrew deletado: ${homebrew.codigo} por usu�rio ${usuarioId}`);
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async publicar(id, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findUnique({
                where: { id },
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(id);
            }
            if (homebrew.usuarioId !== usuarioId && !isAdmin) {
                throw new homebrew_exception_1.HomebrewSemPermissaoException('publicar', 'este homebrew', id);
            }
            if (homebrew.status === client_1.StatusPublicacao.PUBLICADO) {
                throw new homebrew_exception_1.HomebrewJaPublicadoException(id);
            }
            const atualizado = await this.prisma.homebrew.update({
                where: { id },
                data: { status: client_1.StatusPublicacao.PUBLICADO },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            apelido: true,
                        },
                    },
                },
            });
            this.logger.log(`Homebrew publicado: ${atualizado.codigo}`);
            return atualizado;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async arquivar(id, usuarioId, isAdmin = false) {
        try {
            const homebrew = await this.prisma.homebrew.findUnique({
                where: { id },
            });
            if (!homebrew) {
                throw new homebrew_exception_1.HomebrewNaoEncontradoException(id);
            }
            if (homebrew.usuarioId !== usuarioId && !isAdmin) {
                throw new homebrew_exception_1.HomebrewSemPermissaoException('arquivar', 'este homebrew', id);
            }
            const atualizado = await this.prisma.homebrew.update({
                where: { id },
                data: { status: client_1.StatusPublicacao.ARQUIVADO },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            apelido: true,
                        },
                    },
                },
            });
            this.logger.log(`Homebrew arquivado: ${atualizado.codigo}`);
            return atualizado;
        }
        catch (error) {
            this.tratarErroPrisma(error);
            throw error;
        }
    }
    async meus(usuarioId, filtros) {
        return this.listar({ ...filtros, usuarioId }, usuarioId, false);
    }
    gerarCodigo(usuarioId) {
        const timestamp = Date.now();
        return `USER_${usuarioId}_HB_${timestamp}`;
    }
    validarDadosCustomizados(tipo, dados) {
        switch (tipo) {
            case client_1.TipoHomebrewConteudo.TECNICA_AMALDICOADA:
                (0, validate_homebrew_tecnica_1.validateHomebrewTecnicaCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.EQUIPAMENTO:
                (0, validate_homebrew_equipamento_1.validateHomebrewEquipamentoCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.ORIGEM:
                (0, validate_homebrew_origem_1.validateHomebrewOrigemCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.TRILHA:
                (0, validate_homebrew_trilha_1.validateHomebrewTrilhaCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.CAMINHO:
                (0, validate_homebrew_caminho_1.validateHomebrewCaminhoCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.CLA:
                (0, validate_homebrew_cla_1.validateHomebrewClaCustom)(dados);
                break;
            case client_1.TipoHomebrewConteudo.PODER_GENERICO:
                (0, validate_homebrew_poder_1.validateHomebrewPoderCustom)(dados);
                break;
        }
    }
    verificarPermissaoLeitura(homebrew, usuarioId, isAdmin = false) {
        const isOwner = homebrew.usuarioId === usuarioId;
        const isPublicado = homebrew.status === client_1.StatusPublicacao.PUBLICADO;
        if (!isPublicado && !isOwner && !isAdmin) {
            throw new homebrew_exception_1.HomebrewSemPermissaoException('visualizar', 'este homebrew', homebrew.id);
        }
    }
    incrementarVersao(versaoAtual) {
        const partes = versaoAtual.split('.');
        if (partes.length !== 3) {
            return '1.0.1';
        }
        const [major, minor, patch] = partes.map(Number);
        return `${major}.${minor}.${patch + 1}`;
    }
    mapDetalhado(homebrew) {
        return {
            id: homebrew.id,
            codigo: homebrew.codigo,
            nome: homebrew.nome,
            descricao: homebrew.descricao ?? undefined,
            tipo: homebrew.tipo,
            status: homebrew.status,
            dados: homebrew.dados,
            tags: this.mapearTags(homebrew.tags),
            versao: homebrew.versao,
            usuarioId: homebrew.usuarioId,
            usuarioApelido: homebrew.usuario.apelido,
            criadoEm: homebrew.criadoEm,
            atualizadoEm: homebrew.atualizadoEm,
        };
    }
};
exports.HomebrewsService = HomebrewsService;
exports.HomebrewsService = HomebrewsService = HomebrewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomebrewsService);
//# sourceMappingURL=homebrews.service.js.map