"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicasAmaldicoadasMapper = exports.tecnicaUsoInclude = exports.tecnicaDetalhadaInclude = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.tecnicaDetalhadaInclude = client_1.Prisma.validator()({
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
});
exports.tecnicaUsoInclude = client_1.Prisma.validator()({
    _count: {
        select: {
            personagensBaseComInata: true,
            personagensCampanhaComInata: true,
            personagensBaseAprendeu: true,
            personagensCampanhaAprendeu: true,
        },
    },
});
let TecnicasAmaldicoadasMapper = class TecnicasAmaldicoadasMapper {
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
exports.TecnicasAmaldicoadasMapper = TecnicasAmaldicoadasMapper;
exports.TecnicasAmaldicoadasMapper = TecnicasAmaldicoadasMapper = __decorate([
    (0, common_1.Injectable)()
], TecnicasAmaldicoadasMapper);
//# sourceMappingURL=tecnicas-amaldicoadas.mapper.js.map