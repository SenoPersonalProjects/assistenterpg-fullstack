"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessaoModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../prisma/prisma.module");
const sessao_controller_1 = require("./sessao.controller");
const sessao_service_1 = require("./sessao.service");
const sessao_gateway_1 = require("./sessao.gateway");
let SessaoModule = class SessaoModule {
};
exports.SessaoModule = SessaoModule;
exports.SessaoModule = SessaoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    if (!secret && configService.get('NODE_ENV') === 'production') {
                        throw new Error('JWT_SECRET e obrigatorio em producao');
                    }
                    return {
                        secret: secret || 'dev-secret',
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [sessao_controller_1.SessaoController],
        providers: [sessao_service_1.SessaoService, sessao_gateway_1.SessaoGateway],
    })
], SessaoModule);
//# sourceMappingURL=sessao.module.js.map