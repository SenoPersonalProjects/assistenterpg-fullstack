"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampanhaModule = void 0;
const common_1 = require("@nestjs/common");
const campanha_service_1 = require("./campanha.service");
const campanha_controller_1 = require("./campanha.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let CampanhaModule = class CampanhaModule {
};
exports.CampanhaModule = CampanhaModule;
exports.CampanhaModule = CampanhaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [campanha_service_1.CampanhaService],
        controllers: [campanha_controller_1.CampanhaController],
    })
], CampanhaModule);
//# sourceMappingURL=campanha.module.js.map