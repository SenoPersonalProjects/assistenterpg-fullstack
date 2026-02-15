"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicasAmaldicoadasModule = void 0;
const common_1 = require("@nestjs/common");
const tecnicas_amaldicoadas_controller_1 = require("./tecnicas-amaldicoadas.controller");
const tecnicas_amaldicoadas_service_1 = require("./tecnicas-amaldicoadas.service");
const prisma_module_1 = require("../prisma/prisma.module");
let TecnicasAmaldicoadasModule = class TecnicasAmaldicoadasModule {
};
exports.TecnicasAmaldicoadasModule = TecnicasAmaldicoadasModule;
exports.TecnicasAmaldicoadasModule = TecnicasAmaldicoadasModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [tecnicas_amaldicoadas_controller_1.TecnicasAmaldicoadasController],
        providers: [tecnicas_amaldicoadas_service_1.TecnicasAmaldicoadasService],
        exports: [tecnicas_amaldicoadas_service_1.TecnicasAmaldicoadasService],
    })
], TecnicasAmaldicoadasModule);
//# sourceMappingURL=tecnicas-amaldicoadas.module.js.map