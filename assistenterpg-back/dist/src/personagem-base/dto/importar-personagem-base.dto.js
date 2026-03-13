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
exports.ImportarPersonagemBaseDto = exports.ReferenciasImportacaoPersonagemDto = exports.ReferenciaItemInventarioDto = exports.ReferenciaModificacaoItemDto = exports.ReferenciaPassivaDto = exports.ReferenciaPoderGenericoDto = exports.ReferenciaCatalogoDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_personagem_base_dto_1 = require("./create-personagem-base.dto");
class ReferenciaCatalogoDto {
    id;
    nome;
    codigo;
}
exports.ReferenciaCatalogoDto = ReferenciaCatalogoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciaCatalogoDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaCatalogoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaCatalogoDto.prototype, "codigo", void 0);
class ReferenciaPoderGenericoDto {
    index;
    habilidadeId;
    habilidadeNome;
}
exports.ReferenciaPoderGenericoDto = ReferenciaPoderGenericoDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReferenciaPoderGenericoDto.prototype, "index", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciaPoderGenericoDto.prototype, "habilidadeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaPoderGenericoDto.prototype, "habilidadeNome", void 0);
class ReferenciaPassivaDto {
    index;
    passivaId;
    codigo;
    nome;
}
exports.ReferenciaPassivaDto = ReferenciaPassivaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReferenciaPassivaDto.prototype, "index", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciaPassivaDto.prototype, "passivaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaPassivaDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaPassivaDto.prototype, "nome", void 0);
class ReferenciaModificacaoItemDto {
    index;
    modificacaoId;
    codigo;
    nome;
}
exports.ReferenciaModificacaoItemDto = ReferenciaModificacaoItemDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReferenciaModificacaoItemDto.prototype, "index", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciaModificacaoItemDto.prototype, "modificacaoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaModificacaoItemDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaModificacaoItemDto.prototype, "nome", void 0);
class ReferenciaItemInventarioDto {
    index;
    equipamentoId;
    equipamentoCodigo;
    equipamentoNome;
    modificacoes;
}
exports.ReferenciaItemInventarioDto = ReferenciaItemInventarioDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReferenciaItemInventarioDto.prototype, "index", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciaItemInventarioDto.prototype, "equipamentoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaItemInventarioDto.prototype, "equipamentoCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenciaItemInventarioDto.prototype, "equipamentoNome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenciaModificacaoItemDto),
    __metadata("design:type", Array)
], ReferenciaItemInventarioDto.prototype, "modificacoes", void 0);
class ReferenciasImportacaoPersonagemDto {
    personagemIdOriginal;
    cla;
    origem;
    classe;
    trilha;
    caminho;
    alinhamento;
    tecnicaInata;
    poderesGenericos;
    passivas;
    itensInventario;
}
exports.ReferenciasImportacaoPersonagemDto = ReferenciasImportacaoPersonagemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReferenciasImportacaoPersonagemDto.prototype, "personagemIdOriginal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "cla", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "origem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "classe", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "trilha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "caminho", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "alinhamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciaCatalogoDto),
    __metadata("design:type", ReferenciaCatalogoDto)
], ReferenciasImportacaoPersonagemDto.prototype, "tecnicaInata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenciaPoderGenericoDto),
    __metadata("design:type", Array)
], ReferenciasImportacaoPersonagemDto.prototype, "poderesGenericos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenciaPassivaDto),
    __metadata("design:type", Array)
], ReferenciasImportacaoPersonagemDto.prototype, "passivas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenciaItemInventarioDto),
    __metadata("design:type", Array)
], ReferenciasImportacaoPersonagemDto.prototype, "itensInventario", void 0);
class ImportarPersonagemBaseDto {
    schema;
    schemaVersion;
    exportadoEm;
    nomeSobrescrito;
    personagem;
    referencias;
}
exports.ImportarPersonagemBaseDto = ImportarPersonagemBaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportarPersonagemBaseDto.prototype, "schema", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ImportarPersonagemBaseDto.prototype, "schemaVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportarPersonagemBaseDto.prototype, "exportadoEm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportarPersonagemBaseDto.prototype, "nomeSobrescrito", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.CreatePersonagemBaseDto),
    __metadata("design:type", create_personagem_base_dto_1.CreatePersonagemBaseDto)
], ImportarPersonagemBaseDto.prototype, "personagem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReferenciasImportacaoPersonagemDto),
    __metadata("design:type", ReferenciasImportacaoPersonagemDto)
], ImportarPersonagemBaseDto.prototype, "referencias", void 0);
//# sourceMappingURL=importar-personagem-base.dto.js.map