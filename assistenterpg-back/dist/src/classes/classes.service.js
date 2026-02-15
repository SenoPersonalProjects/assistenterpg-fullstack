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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const classe_exception_1 = require("../common/exceptions/classe.exception");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existente = await this.prisma.classe.findUnique({
            where: { nome: dto.nome },
        });
        if (existente) {
            throw new classe_exception_1.ClasseNomeDuplicadoException(dto.nome);
        }
        return this.prisma.classe.create({ data: dto });
    }
    mapToCatalogo(classe) {
        return {
            id: classe.id,
            nome: classe.nome,
            descricao: classe.descricao,
            periciasLivresBase: classe.periciasLivresBase,
            pericias: classe.pericias?.map((rel) => ({
                id: rel.id,
                tipo: rel.tipo,
                grupoEscolha: rel.grupoEscolha,
                pericia: {
                    id: rel.pericia.id,
                    codigo: rel.pericia.codigo,
                    nome: rel.pericia.nome,
                    descricao: rel.pericia.descricao,
                },
            })) ?? [],
            proficiencias: classe.proficiencias?.map((rel) => ({
                id: rel.proficiencia.id,
                codigo: rel.proficiencia.codigo,
                nome: rel.proficiencia.nome,
                descricao: rel.proficiencia.descricao,
                tipo: rel.proficiencia.tipo,
                categoria: rel.proficiencia.categoria,
                subtipo: rel.proficiencia.subtipo,
            })) ?? [],
            habilidadesIniciais: classe.habilidadesClasse?.map((hc) => hc.habilidade) ?? [],
        };
    }
    async findAll() {
        const classes = await this.prisma.classe.findMany({
            orderBy: { nome: 'asc' },
            include: {
                pericias: { include: { pericia: true } },
                proficiencias: { include: { proficiencia: true } },
                habilidadesClasse: {
                    where: { nivelConcedido: 1 },
                    include: {
                        habilidade: true,
                    },
                },
            },
        });
        return classes.map((c) => this.mapToCatalogo(c));
    }
    async findOne(id) {
        const classe = await this.prisma.classe.findUnique({
            where: { id },
            include: {
                pericias: { include: { pericia: true } },
                proficiencias: { include: { proficiencia: true } },
                habilidadesClasse: {
                    where: { nivelConcedido: 1 },
                    include: {
                        habilidade: true,
                    },
                },
            },
        });
        if (!classe) {
            throw new classe_exception_1.ClasseNaoEncontradaException(id);
        }
        return this.mapToCatalogo(classe);
    }
    async findTrilhas(id) {
        const classe = await this.prisma.classe.findUnique({ where: { id } });
        if (!classe) {
            throw new classe_exception_1.ClasseNaoEncontradaException(id);
        }
        const trilhas = await this.prisma.trilha.findMany({
            where: { classeId: id },
            orderBy: { nome: 'asc' },
        });
        return trilhas.map((t) => ({
            id: t.id,
            nome: t.nome,
            descricao: t.descricao,
            classeId: t.classeId,
        }));
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.nome) {
            const duplicado = await this.prisma.classe.findFirst({
                where: {
                    nome: dto.nome,
                    NOT: { id },
                },
            });
            if (duplicado) {
                throw new classe_exception_1.ClasseNomeDuplicadoException(dto.nome);
            }
        }
        return this.prisma.classe.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const [usosBase, usosCampanha] = await Promise.all([
            this.prisma.personagemBase.count({ where: { classeId: id } }),
            this.prisma.personagemCampanha.count({ where: { classeId: id } }),
        ]);
        const totalUsos = usosBase + usosCampanha;
        if (totalUsos > 0) {
            throw new classe_exception_1.ClasseEmUsoException(totalUsos, usosBase, usosCampanha);
        }
        await this.prisma.classe.delete({ where: { id } });
        return { sucesso: true };
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map