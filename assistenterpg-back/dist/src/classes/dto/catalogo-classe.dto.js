"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClasseCatalogoDto = exports.ClasseProficienciaCatalogoDto = exports.ClassePericiaCatalogoDto = void 0;
class ClassePericiaCatalogoDto {
    id;
    tipo;
    grupoEscolha;
    pericia;
}
exports.ClassePericiaCatalogoDto = ClassePericiaCatalogoDto;
class ClasseProficienciaCatalogoDto {
    id;
    codigo;
    nome;
    descricao;
    tipo;
    categoria;
    subtipo;
}
exports.ClasseProficienciaCatalogoDto = ClasseProficienciaCatalogoDto;
class ClasseCatalogoDto {
    id;
    nome;
    descricao;
    fonte;
    suplementoId;
    periciasLivresBase;
    pericias;
    proficiencias;
    habilidadesIniciais;
}
exports.ClasseCatalogoDto = ClasseCatalogoDto;
//# sourceMappingURL=catalogo-classe.dto.js.map