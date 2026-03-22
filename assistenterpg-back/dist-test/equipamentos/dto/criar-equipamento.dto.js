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
exports.CriarEquipamentoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CriarEquipamentoDto {
    codigo;
    nome;
    tipo;
    fonte;
    suplementoId;
    descricao;
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
exports.CriarEquipamentoDto = CriarEquipamentoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Código deve ter no mínimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Código deve ter no máximo 50 caracteres' }),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Nome deve ter no máximo 200 caracteres' }),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoEquipamento, {
        message: `Tipo deve ser: ${Object.values(client_1.TipoEquipamento).join(', ')}`,
    }),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFonte),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "fonte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "suplementoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' }),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CategoriaEquipamento),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "espacos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ComplexidadeMaldicao),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "complexidadeMaldicao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoUsoEquipamento),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoUso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAmaldicoado),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoAmaldicoado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "efeitoMaldicao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarEquipamentoDto.prototype, "requerFerramentasAmaldicoadas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaArma),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "proficienciaArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.EmpunhaduraArma, { each: true }),
    __metadata("design:type", Array)
], CriarEquipamentoDto.prototype, "empunhaduras", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoArma),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoArma", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubtipoArmaDistancia),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "subtipoDistancia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarEquipamentoDto.prototype, "agil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "criticoValor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "criticoMultiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AlcanceArma),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoMunicaoCodigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "habilidadeEspecial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProficienciaProtecao),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "proficienciaProtecao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoProtecao),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoProtecao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "bonusDefesa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "penalidadeCarga", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "duracaoCenas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarEquipamentoDto.prototype, "recuperavel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAcessorio),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoAcessorio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "periciaBonificada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "bonusPericia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarEquipamentoDto.prototype, "requereEmpunhar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CriarEquipamentoDto.prototype, "maxVestimentas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoExplosivo),
    __metadata("design:type", String)
], CriarEquipamentoDto.prototype, "tipoExplosivo", void 0);
//# sourceMappingURL=criar-equipamento.dto.js.map