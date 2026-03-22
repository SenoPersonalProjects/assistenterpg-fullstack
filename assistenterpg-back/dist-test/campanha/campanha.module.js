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
const inventario_module_1 = require("../inventario/inventario.module");
const campanha_mapper_1 = require("./campanha.mapper");
const campanha_persistence_1 = require("./campanha.persistence");
const campanha_access_service_1 = require("./campanha.access.service");
const campanha_contexto_service_1 = require("./campanha.contexto.service");
const campanha_personagens_service_1 = require("./campanha.personagens.service");
const campanha_modificadores_service_1 = require("./campanha.modificadores.service");
const campanha_convites_service_1 = require("./campanha.convites.service");
const campanha_inventario_service_1 = require("./campanha.inventario.service");
let CampanhaModule = class CampanhaModule {
};
exports.CampanhaModule = CampanhaModule;
exports.CampanhaModule = CampanhaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, inventario_module_1.InventarioModule],
        providers: [
            campanha_service_1.CampanhaService,
            campanha_mapper_1.CampanhaMapper,
            campanha_persistence_1.CampanhaPersistence,
            campanha_access_service_1.CampanhaAccessService,
            campanha_contexto_service_1.CampanhaContextoService,
            campanha_personagens_service_1.CampanhaPersonagensService,
            campanha_modificadores_service_1.CampanhaModificadoresService,
            campanha_convites_service_1.CampanhaConvitesService,
            campanha_inventario_service_1.CampanhaInventarioService,
        ],
        controllers: [campanha_controller_1.CampanhaController],
    })
], CampanhaModule);
//# sourceMappingURL=campanha.module.js.map