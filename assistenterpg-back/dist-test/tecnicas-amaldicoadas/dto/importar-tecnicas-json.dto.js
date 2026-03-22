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
exports.ImportarTecnicasJsonDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const parseBooleanQueryValue = ({ value, obj, key, }) => {
    const rawValue = obj && typeof key === 'string' && key.length > 0 ? obj[key] : value;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return undefined;
    }
    if (typeof rawValue === 'boolean') {
        return rawValue;
    }
    if (typeof rawValue === 'string') {
        const normalized = rawValue.trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) {
            return true;
        }
        if (['0', 'false', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }
    return rawValue;
};
class ImportarTecnicasJsonDto {
    schema;
    schemaVersion;
    modo;
    tecnicas;
    substituirHabilidadesAusentes;
    substituirVariacoesAusentes;
}
exports.ImportarTecnicasJsonDto = ImportarTecnicasJsonDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportarTecnicasJsonDto.prototype, "schema", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ImportarTecnicasJsonDto.prototype, "schemaVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportarTecnicasJsonDto.prototype, "modo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ImportarTecnicasJsonDto.prototype, "tecnicas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], ImportarTecnicasJsonDto.prototype, "substituirHabilidadesAusentes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(parseBooleanQueryValue),
    __metadata("design:type", Boolean)
], ImportarTecnicasJsonDto.prototype, "substituirVariacoesAusentes", void 0);
//# sourceMappingURL=importar-tecnicas-json.dto.js.map