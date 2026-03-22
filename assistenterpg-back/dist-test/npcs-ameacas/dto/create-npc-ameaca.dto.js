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
exports.CreateNpcAmeacaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class NpcAmeacaPericiaEspecialDto {
    codigo;
    dados;
    bonus;
    descricao;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NpcAmeacaPericiaEspecialDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], NpcAmeacaPericiaEspecialDto.prototype, "dados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], NpcAmeacaPericiaEspecialDto.prototype, "bonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], NpcAmeacaPericiaEspecialDto.prototype, "descricao", void 0);
class NpcAmeacaPassivaDto {
    nome;
    descricao;
    gatilho;
    alcance;
    alvo;
    duracao;
    requisitos;
    efeitoGuia;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "gatilho", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "alvo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "duracao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], NpcAmeacaPassivaDto.prototype, "efeitoGuia", void 0);
class NpcAmeacaAcaoDto {
    nome;
    tipoExecucao;
    alcance;
    alvo;
    duracao;
    resistencia;
    dtResistencia;
    custoPE;
    custoEA;
    teste;
    dano;
    critico;
    efeito;
    requisitos;
    descricao;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "tipoExecucao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "alcance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "alvo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "duracao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "resistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "dtResistencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999),
    __metadata("design:type", Number)
], NpcAmeacaAcaoDto.prototype, "custoPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999),
    __metadata("design:type", Number)
], NpcAmeacaAcaoDto.prototype, "custoEA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "teste", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "dano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "critico", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "efeito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "requisitos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], NpcAmeacaAcaoDto.prototype, "descricao", void 0);
class CreateNpcAmeacaDto {
    nome;
    descricao;
    fichaTipo;
    tipo;
    tamanho;
    vd;
    agilidade;
    forca;
    intelecto;
    presenca;
    vigor;
    percepcao;
    iniciativa;
    fortitude;
    reflexos;
    vontade;
    luta;
    jujutsu;
    percepcaoDados;
    iniciativaDados;
    fortitudeDados;
    reflexosDados;
    vontadeDados;
    lutaDados;
    jujutsuDados;
    defesa;
    pontosVida;
    machucado;
    deslocamentoMetros;
    periciasEspeciais;
    resistencias;
    vulnerabilidades;
    passivas;
    acoes;
    usoTatico;
}
exports.CreateNpcAmeacaDto = CreateNpcAmeacaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TipoFichaNpcAmeaca),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "fichaTipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoNpcAmeaca),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TamanhoNpcAmeaca),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "tamanho", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "vd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "agilidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "forca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "intelecto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "presenca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "vigor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "percepcao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "iniciativa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "fortitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "reflexos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "vontade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "luta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "jujutsu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "percepcaoDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "iniciativaDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "fortitudeDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "reflexosDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "vontadeDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "lutaDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "jujutsuDados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "defesa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "pontosVida", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Object)
], CreateNpcAmeacaDto.prototype, "machucado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], CreateNpcAmeacaDto.prototype, "deslocamentoMetros", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NpcAmeacaPericiaEspecialDto),
    __metadata("design:type", Array)
], CreateNpcAmeacaDto.prototype, "periciasEspeciais", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(120, { each: true }),
    __metadata("design:type", Array)
], CreateNpcAmeacaDto.prototype, "resistencias", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(120, { each: true }),
    __metadata("design:type", Array)
], CreateNpcAmeacaDto.prototype, "vulnerabilidades", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NpcAmeacaPassivaDto),
    __metadata("design:type", Array)
], CreateNpcAmeacaDto.prototype, "passivas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NpcAmeacaAcaoDto),
    __metadata("design:type", Array)
], CreateNpcAmeacaDto.prototype, "acoes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateNpcAmeacaDto.prototype, "usoTatico", void 0);
//# sourceMappingURL=create-npc-ameaca.dto.js.map