"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarOrigemClaTecnica = validarOrigemClaTecnica;
const personagem_exception_1 = require("../../common/exceptions/personagem.exception");
async function validarOrigemClaTecnica(claId, origemId, tecnicaInataId, prisma) {
    const [cla, origem] = await Promise.all([
        prisma.cla.findUnique({ where: { id: claId } }),
        prisma.origem.findUnique({ where: { id: origemId } }),
    ]);
    if (!cla)
        throw new personagem_exception_1.ClaOuOrigemNaoEncontradoException('Clã', claId);
    if (!origem)
        throw new personagem_exception_1.ClaOuOrigemNaoEncontradoException('Origem', origemId);
    if (origem.requerGrandeCla && !cla.grandeCla) {
        throw new personagem_exception_1.OrigemRequerGrandeClaException(origem.nome);
    }
    if (tecnicaInataId) {
        const tecnicaInata = await prisma.tecnicaAmaldicoada.findUnique({
            where: { id: tecnicaInataId },
            select: {
                tipo: true,
                hereditaria: true,
                clas: {
                    select: { claId: true },
                },
            },
        });
        if (!tecnicaInata) {
            throw new personagem_exception_1.TecnicaInataNaoEncontradaException(tecnicaInataId);
        }
        if (tecnicaInata.tipo !== 'INATA') {
            throw new personagem_exception_1.TecnicaInataTipoInvalidoException();
        }
        if (origem.requerTecnicaHeriditaria) {
            const tecnicaEhDoCla = tecnicaInata.hereditaria &&
                tecnicaInata.clas.some((rel) => rel.claId === cla.id);
            if (!tecnicaEhDoCla) {
                throw new personagem_exception_1.OrigemRequerTecnicaHereditariaException(origem.nome);
            }
        }
        if (origem.bloqueiaTecnicaHeriditaria && tecnicaInata.hereditaria) {
            throw new personagem_exception_1.OrigemBloqueiaTecnicaHereditariaException(origem.nome);
        }
        if (tecnicaInata.hereditaria) {
            const tecnicaEhCompativel = tecnicaInata.clas.some((rel) => rel.claId === cla.id);
            if (!tecnicaEhCompativel) {
                throw new personagem_exception_1.TecnicaHereditariaIncompativelException(cla.nome);
            }
        }
    }
}
//# sourceMappingURL=regras-origem-cla.js.map