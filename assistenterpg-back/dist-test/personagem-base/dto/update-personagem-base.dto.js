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
exports.UpdatePersonagemBaseDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_personagem_base_dto_1 = require("./create-personagem-base.dto");
class UpdatePersonagemBaseDto {
    nome;
    nivel;
    claId;
    origemId;
    classeId;
    trilhaId;
    caminhoId;
    agilidade;
    forca;
    intelecto;
    presenca;
    vigor;
    estudouEscolaTecnica;
    idade;
    prestigioBase;
    prestigioClaBase;
    alinhamentoId;
    background;
    atributoChaveEa;
    tecnicaInataId;
    proficienciasCodigos;
    grausAprimoramento;
    grausTreinamento;
    poderesGenericos;
    passivasAtributoIds;
    passivasAtributosAtivos;
    passivasAtributosConfig;
    periciasClasseEscolhidasCodigos;
    periciasOrigemEscolhidasCodigos;
    periciasLivresCodigos;
    periciasLivresExtras;
    itensInventario;
}
exports.UpdatePersonagemBaseDto = UpdatePersonagemBaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePersonagemBaseDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "nivel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "claId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "origemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "classeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "trilhaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "caminhoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "agilidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "forca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "intelecto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "presenca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "vigor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePersonagemBaseDto.prototype, "estudouEscolaTecnica", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "idade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "prestigioBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "prestigioClaBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "alinhamentoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "background", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AtributoBaseEA),
    __metadata("design:type", String)
], UpdatePersonagemBaseDto.prototype, "atributoChaveEa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePersonagemBaseDto.prototype, "tecnicaInataId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "proficienciasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.GrauAprimoramentoDto),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "grausAprimoramento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.GrauTreinamentoDto),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "grausTreinamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.PoderGenericoInstanciaDto),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "poderesGenericos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "passivasAtributoIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.AtributoBase, { each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "passivasAtributosAtivos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.PassivasAtributoConfigDto),
    __metadata("design:type", create_personagem_base_dto_1.PassivasAtributoConfigDto)
], UpdatePersonagemBaseDto.prototype, "passivasAtributosConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "periciasClasseEscolhidasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "periciasOrigemEscolhidasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "periciasLivresCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePersonagemBaseDto.prototype, "periciasLivresExtras", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_personagem_base_dto_1.ItemInventarioDto),
    __metadata("design:type", Array)
], UpdatePersonagemBaseDto.prototype, "itensInventario", void 0);
//# sourceMappingURL=update-personagem-base.dto.js.map