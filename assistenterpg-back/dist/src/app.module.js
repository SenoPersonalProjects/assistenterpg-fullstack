"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const usuario_module_1 = require("./usuario/usuario.module");
const auth_module_1 = require("./auth/auth.module");
const campanha_module_1 = require("./campanha/campanha.module");
const personagem_base_module_1 = require("./personagem-base/personagem-base.module");
const clas_module_1 = require("./clas/clas.module");
const classes_module_1 = require("./classes/classes.module");
const origens_module_1 = require("./origens/origens.module");
const proficiencias_module_1 = require("./proficiencias/proficiencias.module");
const tipos_grau_module_1 = require("./tipos-grau/tipos-grau.module");
const pericias_module_1 = require("./pericias/pericias.module");
const trilhas_module_1 = require("./trilhas/trilhas.module");
const habilidades_module_1 = require("./habilidades/habilidades.module");
const alinhamentos_module_1 = require("./alinhamentos/alinhamentos.module");
const compendio_module_1 = require("./compendio/compendio.module");
const inventario_module_1 = require("./inventario/inventario.module");
const equipamentos_module_1 = require("./equipamentos/equipamentos.module");
const modificacoes_module_1 = require("./modificacoes/modificacoes.module");
const condicoes_module_1 = require("./condicoes/condicoes.module");
const tecnicas_amaldicoadas_module_1 = require("./tecnicas-amaldicoadas/tecnicas-amaldicoadas.module");
const suplementos_module_1 = require("./suplementos/suplementos.module");
const homebrews_module_1 = require("./homebrews/homebrews.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, usuario_module_1.UsuarioModule, auth_module_1.AuthModule, campanha_module_1.CampanhaModule, personagem_base_module_1.PersonagemBaseModule, clas_module_1.ClasModule, classes_module_1.ClassesModule, origens_module_1.OrigensModule, proficiencias_module_1.ProficienciasModule, tipos_grau_module_1.TiposGrauModule, pericias_module_1.PericiasModule, trilhas_module_1.TrilhasModule, habilidades_module_1.HabilidadesModule, alinhamentos_module_1.AlinhamentosModule, compendio_module_1.CompendioModule, inventario_module_1.InventarioModule, equipamentos_module_1.EquipamentosModule, modificacoes_module_1.ModificacoesModule, condicoes_module_1.CondicoesModule, tecnicas_amaldicoadas_module_1.TecnicasAmaldicoadasModule, suplementos_module_1.SuplementosModule, homebrews_module_1.HomebrewsModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map