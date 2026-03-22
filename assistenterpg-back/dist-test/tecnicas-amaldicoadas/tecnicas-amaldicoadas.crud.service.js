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
exports.TecnicasAmaldicoadasCrudService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const tecnicas_amaldicoadas_mapper_1 = require("./tecnicas-amaldicoadas.mapper");
const tecnicas_amaldicoadas_persistence_1 = require("./tecnicas-amaldicoadas.persistence");
const tecnica_amaldicoada_exception_1 = require("src/common/exceptions/tecnica-amaldicoada.exception");
const tecnicas_amaldicoadas_engine_1 = require("./engine/tecnicas-amaldicoadas.engine");
const tecnicas_amaldicoadas_errors_1 = require("./tecnicas-amaldicoadas.errors");
const tecnicas_amaldicoadas_validations_service_1 = require("./tecnicas-amaldicoadas.validations.service");
const tecnicas_amaldicoadas_clas_service_1 = require("./tecnicas-amaldicoadas.clas.service");
let TecnicasAmaldicoadasCrudService = class TecnicasAmaldicoadasCrudService {
    prisma;
    mapper;
    persistence;
    validationsService;
    clasService;
    constructor(prisma, mapper, persistence, validationsService, clasService) {
        this.prisma = prisma;
        this.mapper = mapper;
        this.persistence = persistence;
        this.validationsService = validationsService;
        this.clasService = clasService;
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
            const tecnicas = await this.persistence.listarTecnicasDetalhadas(where);
            return tecnicas.map((tecnica) => this.mapper.mapTecnicaToDto(tecnica, {
                incluirClas,
                incluirHabilidades,
            }));
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
    async findOneTecnica(id) {
        try {
            const tecnica = await this.persistence.buscarTecnicaDetalhadaPorId(id);
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(id);
            }
            return this.mapper.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
    async findTecnicaByCodigo(codigo) {
        try {
            const tecnica = await this.persistence.buscarTecnicaDetalhadaPorCodigo(codigo);
            if (!tecnica) {
                throw new tecnica_amaldicoada_exception_1.TecnicaNaoEncontradaException(codigo);
            }
            return this.mapper.mapTecnicaToDto(tecnica);
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            await this.validationsService.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
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
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOuNull)(dto.requisitos),
                },
            });
            if (dto.hereditaria &&
                dto.clasHereditarios &&
                dto.clasHereditarios.length > 0) {
                await this.clasService.vincularClas(tecnica.id, dto.clasHereditarios);
            }
            return this.findOneTecnica(tecnica.id);
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
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
            await this.validationsService.validarFonteSuplemento(fonteFinal, suplementoIdFinal);
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
                    await this.clasService.vincularClas(id, dto.clasHereditarios);
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
                    requisitos: (0, tecnicas_amaldicoadas_engine_1.normalizarJsonOpcional)(dto.requisitos),
                },
            });
            return this.findOneTecnica(id);
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
    async removeTecnica(id) {
        try {
            const tecnica = await this.persistence.buscarTecnicaComUso(id);
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
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
    async findTecnicasByCla(claId) {
        try {
            const tecnicas = await this.persistence.buscarTecnicasHereditariaPorCla(claId);
            return tecnicas.map((tecnica) => this.mapper.mapTecnicaToDto(tecnica));
        }
        catch (error) {
            (0, tecnicas_amaldicoadas_errors_1.tratarErroPrisma)(error);
            throw error;
        }
    }
};
exports.TecnicasAmaldicoadasCrudService = TecnicasAmaldicoadasCrudService;
exports.TecnicasAmaldicoadasCrudService = TecnicasAmaldicoadasCrudService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tecnicas_amaldicoadas_mapper_1.TecnicasAmaldicoadasMapper,
        tecnicas_amaldicoadas_persistence_1.TecnicasAmaldicoadasPersistence,
        tecnicas_amaldicoadas_validations_service_1.TecnicasAmaldicoadasValidationsService,
        tecnicas_amaldicoadas_clas_service_1.TecnicasAmaldicoadasClasService])
], TecnicasAmaldicoadasCrudService);
//# sourceMappingURL=tecnicas-amaldicoadas.crud.service.js.map