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
exports.CreatePersonagemBaseDto = exports.ItemInventarioDto = exports.PassivasAtributoConfigDto = exports.PassivaIntelectoConfigDto = exports.PoderGenericoInstanciaDto = exports.GrauTreinamentoDto = exports.MelhoriaTreinamentoDto = exports.GrauAprimoramentoDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GrauAprimoramentoDto {
    tipoGrauCodigo;
    valor;
}
exports.GrauAprimoramentoDto = GrauAprimoramentoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GrauAprimoramentoDto.prototype, "tipoGrauCodigo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GrauAprimoramentoDto.prototype, "valor", void 0);
class MelhoriaTreinamentoDto {
    periciaCodigo;
    grauAnterior;
    grauNovo;
}
exports.MelhoriaTreinamentoDto = MelhoriaTreinamentoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MelhoriaTreinamentoDto.prototype, "periciaCodigo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsIn)([0, 5, 10, 15]),
    __metadata("design:type", Number)
], MelhoriaTreinamentoDto.prototype, "grauAnterior", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsIn)([5, 10, 15, 20]),
    __metadata("design:type", Number)
], MelhoriaTreinamentoDto.prototype, "grauNovo", void 0);
class GrauTreinamentoDto {
    nivel;
    melhorias;
}
exports.GrauTreinamentoDto = GrauTreinamentoDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsIn)([3, 7, 11, 16]),
    __metadata("design:type", Number)
], GrauTreinamentoDto.prototype, "nivel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MelhoriaTreinamentoDto),
    __metadata("design:type", Array)
], GrauTreinamentoDto.prototype, "melhorias", void 0);
class PoderGenericoInstanciaDto {
    habilidadeId;
    config;
}
exports.PoderGenericoInstanciaDto = PoderGenericoInstanciaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PoderGenericoInstanciaDto.prototype, "habilidadeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PoderGenericoInstanciaDto.prototype, "config", void 0);
class PassivaIntelectoConfigDto {
    periciasCodigos;
    proficienciasCodigos;
    periciaCodigoTreino;
    tipoGrauCodigoAprimoramento;
}
exports.PassivaIntelectoConfigDto = PassivaIntelectoConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PassivaIntelectoConfigDto.prototype, "periciasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PassivaIntelectoConfigDto.prototype, "proficienciasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PassivaIntelectoConfigDto.prototype, "periciaCodigoTreino", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PassivaIntelectoConfigDto.prototype, "tipoGrauCodigoAprimoramento", void 0);
class PassivasAtributoConfigDto {
    INT_I;
    INT_II;
}
exports.PassivasAtributoConfigDto = PassivasAtributoConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PassivaIntelectoConfigDto),
    __metadata("design:type", PassivaIntelectoConfigDto)
], PassivasAtributoConfigDto.prototype, "INT_I", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PassivaIntelectoConfigDto),
    __metadata("design:type", PassivaIntelectoConfigDto)
], PassivasAtributoConfigDto.prototype, "INT_II", void 0);
class ItemInventarioDto {
    equipamentoId;
    quantidade;
    equipado;
    modificacoesIds;
    nomeCustomizado;
    notas;
}
exports.ItemInventarioDto = ItemInventarioDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ItemInventarioDto.prototype, "equipamentoId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], ItemInventarioDto.prototype, "quantidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ItemInventarioDto.prototype, "equipado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], ItemInventarioDto.prototype, "modificacoesIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ItemInventarioDto.prototype, "nomeCustomizado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ItemInventarioDto.prototype, "notas", void 0);
class CreatePersonagemBaseDto {
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
    proficienciasCodigos = [];
    grausAprimoramento = [];
    grausTreinamento;
    poderesGenericos;
    passivasAtributoIds;
    passivasAtributosAtivos;
    passivasAtributosConfig;
    periciasClasseEscolhidasCodigos = [];
    periciasOrigemEscolhidasCodigos = [];
    periciasLivresCodigos = [];
    periciasLivresExtras;
    itensInventario;
}
exports.CreatePersonagemBaseDto = CreatePersonagemBaseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePersonagemBaseDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "nivel", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "claId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "origemId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "classeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "trilhaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "caminhoId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "agilidade", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "forca", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "intelecto", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "presenca", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "vigor", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePersonagemBaseDto.prototype, "estudouEscolaTecnica", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "idade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "prestigioBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "prestigioClaBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "alinhamentoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "background", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AtributoBaseEA),
    __metadata("design:type", String)
], CreatePersonagemBaseDto.prototype, "atributoChaveEa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreatePersonagemBaseDto.prototype, "tecnicaInataId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "proficienciasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GrauAprimoramentoDto),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "grausAprimoramento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GrauTreinamentoDto),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "grausTreinamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PoderGenericoInstanciaDto),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "poderesGenericos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "passivasAtributoIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.AtributoBase, { each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "passivasAtributosAtivos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PassivasAtributoConfigDto),
    __metadata("design:type", PassivasAtributoConfigDto)
], CreatePersonagemBaseDto.prototype, "passivasAtributosConfig", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "periciasClasseEscolhidasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "periciasOrigemEscolhidasCodigos", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "periciasLivresCodigos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePersonagemBaseDto.prototype, "periciasLivresExtras", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemInventarioDto),
    __metadata("design:type", Array)
], CreatePersonagemBaseDto.prototype, "itensInventario", void 0);
//# sourceMappingURL=create-personagem-base.dto.js.map