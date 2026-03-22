"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampanhaMapper = exports.PERSONAGEM_CAMPANHA_DETALHE_SELECT = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.PERSONAGEM_CAMPANHA_DETALHE_SELECT = client_1.Prisma.validator()({
    id: true,
    campanhaId: true,
    personagemBaseId: true,
    donoId: true,
    nome: true,
    nivel: true,
    pvMax: true,
    pvAtual: true,
    peMax: true,
    peAtual: true,
    eaMax: true,
    eaAtual: true,
    sanMax: true,
    sanAtual: true,
    limitePeEaPorTurno: true,
    prestigioGeral: true,
    prestigioCla: true,
    defesaBase: true,
    defesaEquipamento: true,
    defesaOutros: true,
    esquiva: true,
    bloqueio: true,
    deslocamento: true,
    turnosMorrendo: true,
    turnosEnlouquecendo: true,
    personagemBase: {
        select: {
            id: true,
            nome: true,
        },
    },
    dono: {
        select: {
            id: true,
            apelido: true,
        },
    },
    modificadores: {
        where: {
            ativo: true,
        },
        orderBy: {
            criadoEm: 'desc',
        },
        select: {
            id: true,
            campo: true,
            valor: true,
            nome: true,
            descricao: true,
            criadoEm: true,
            criadoPorId: true,
        },
    },
});
let CampanhaMapper = class CampanhaMapper {
    mapearPersonagemCampanhaResposta(personagem) {
        return {
            id: personagem.id,
            campanhaId: personagem.campanhaId,
            personagemBaseId: personagem.personagemBaseId,
            donoId: personagem.donoId,
            nome: personagem.nome,
            nivel: personagem.nivel,
            recursos: {
                pvAtual: personagem.pvAtual,
                pvMax: personagem.pvMax,
                peAtual: personagem.peAtual,
                peMax: personagem.peMax,
                eaAtual: personagem.eaAtual,
                eaMax: personagem.eaMax,
                sanAtual: personagem.sanAtual,
                sanMax: personagem.sanMax,
            },
            defesa: {
                base: personagem.defesaBase,
                equipamento: personagem.defesaEquipamento,
                outros: personagem.defesaOutros,
                total: personagem.defesaBase +
                    personagem.defesaEquipamento +
                    personagem.defesaOutros,
            },
            atributos: {
                limitePeEaPorTurno: personagem.limitePeEaPorTurno,
                prestigioGeral: personagem.prestigioGeral,
                prestigioCla: personagem.prestigioCla,
                deslocamento: personagem.deslocamento,
                esquiva: personagem.esquiva,
                bloqueio: personagem.bloqueio,
                turnosMorrendo: personagem.turnosMorrendo,
                turnosEnlouquecendo: personagem.turnosEnlouquecendo,
            },
            personagemBase: personagem.personagemBase,
            dono: personagem.dono,
            modificadoresAtivos: personagem.modificadores,
        };
    }
};
exports.CampanhaMapper = CampanhaMapper;
exports.CampanhaMapper = CampanhaMapper = __decorate([
    (0, common_1.Injectable)()
], CampanhaMapper);
//# sourceMappingURL=campanha.mapper.js.map