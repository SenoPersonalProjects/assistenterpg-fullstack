"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonagemBaseModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const inventario_module_1 = require("../inventario/inventario.module");
const personagem_base_controller_1 = require("./personagem-base.controller");
const personagem_base_mapper_1 = require("./personagem-base.mapper");
const personagem_base_persistence_1 = require("./personagem-base.persistence");
const personagem_base_service_1 = require("./personagem-base.service");
let PersonagemBaseModule = class PersonagemBaseModule {
};
exports.PersonagemBaseModule = PersonagemBaseModule;
exports.PersonagemBaseModule = PersonagemBaseModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, inventario_module_1.InventarioModule],
        providers: [personagem_base_service_1.PersonagemBaseService, personagem_base_mapper_1.PersonagemBaseMapper, personagem_base_persistence_1.PersonagemBasePersistence],
        controllers: [personagem_base_controller_1.PersonagemBaseController],
    })
], PersonagemBaseModule);
//# sourceMappingURL=personagem-base.module.js.map