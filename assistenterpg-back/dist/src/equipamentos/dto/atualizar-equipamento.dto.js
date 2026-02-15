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
exports.AtualizarEquipamentoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class AtualizarEquipamentoDto {
    codigo;
    nome;
    descricao;
    tipo;
    categoria;
    espacos;
    complexidadeMaldicao;
    tipoUso;
    tipoAmaldicoado;
    efeito;
    efeitoMaldicao;
    requerFerramentasAmaldicoadas;
    proficienciaArma;
    empunhaduras;
    tipoArma;
    subtipoDistancia;
    agil;
    criticoValor;
    criticoMultiplicador;
    alcance;
    tipoMunicaoCodigo;
    habilidadeEspecial;
    proficienciaProtecao;
    tipoProtecao;
    bonusDefesa;
    penalidadeCarga;
    duracaoCenas;
    recuperavel;
    tipoAcessorio;
    periciaBonificada;
    bonusPericia;
    requereEmpunhar;
    maxVestimentas;
    tipoExplosivo;
}
exports.AtualizarEquipamentoDto = AtualizarEquipamentoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoEquipamento),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CategoriaEquipamento),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "espacos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ComplexidadeMaldicao),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "complexidadeMaldicao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoUsoEquipamento),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoUso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAmaldicoado),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoAmaldicoado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "efeitoMaldicao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AtualizarEquipamentoDto.prototype, "requerFerramentasAmaldicoadas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaArma),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "proficienciaArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.EmpunhaduraArma, { each: true }),
    __metadata("design:type", Array)
], AtualizarEquipamentoDto.prototype, "empunhaduras", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoArma),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubtipoArmaDistancia),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "subtipoDistancia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AtualizarEquipamentoDto.prototype, "agil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AlcanceArma),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoMunicaoCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "habilidadeEspecial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaProtecao),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "proficienciaProtecao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoProtecao),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoProtecao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "bonusDefesa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "penalidadeCarga", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "duracaoCenas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AtualizarEquipamentoDto.prototype, "recuperavel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAcessorio),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoAcessorio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "periciaBonificada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "bonusPericia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AtualizarEquipamentoDto.prototype, "requereEmpunhar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AtualizarEquipamentoDto.prototype, "maxVestimentas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoExplosivo),
    __metadata("design:type", String)
], AtualizarEquipamentoDto.prototype, "tipoExplosivo", void 0);
//# sourceMappingURL=atualizar-equipamento.dto.js.map