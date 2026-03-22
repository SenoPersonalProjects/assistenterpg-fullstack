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
exports.HomebrewItemAmaldicoadoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const equipamento_base_dto_1 = require("../base/equipamento-base.dto");
class HomebrewItemAmaldicoadoDto extends equipamento_base_dto_1.EquipamentoBaseDto {
    tipoAmaldicoado;
    efeito;
}
exports.HomebrewItemAmaldicoadoDto = HomebrewItemAmaldicoadoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.TipoAmaldicoado),
    __metadata("design:type", String)
], HomebrewItemAmaldicoadoDto.prototype, "tipoAmaldicoado", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomebrewItemAmaldicoadoDto.prototype, "efeito", void 0);
//# sourceMappingURL=criar-homebrew-item-amaldicoado.dto.js.map