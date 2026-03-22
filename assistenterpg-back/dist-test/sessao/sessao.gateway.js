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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SessaoGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessaoGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const sessao_service_1 = require("./sessao.service");
function resolverCorsOrigins() {
    const bruto = process.env.CORS_ORIGINS;
    if (!bruto)
        return true;
    const origens = bruto
        .split(',')
        .map((origem) => origem.trim())
        .filter(Boolean);
    return origens.length > 0 ? origens : true;
}
let SessaoGateway = SessaoGateway_1 = class SessaoGateway {
    sessaoService;
    jwtService;
    logger = new common_1.Logger(SessaoGateway_1.name);
    salasPorSocket = new Map();
    usuariosPorSala = new Map();
    metaPorSala = new Map();
    server;
    constructor(sessaoService, jwtService) {
        this.sessaoService = sessaoService;
        this.jwtService = jwtService;
    }
    handleConnection(client) {
        const token = this.extrairToken(client);
        if (!token) {
            client.disconnect(true);
            return;
        }
        try {
            const payload = this.jwtService.verify(token);
            this.definirUsuarioId(client, payload.sub);
        }
        catch {
            this.logger.warn(`Socket desconectado por token invalido: ${client.id}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.removerPresencaSocket(client);
    }
    async handleJoinSala(client, body) {
        const campanhaId = Number(body?.campanhaId);
        const sessaoId = Number(body?.sessaoId);
        const usuarioId = this.obterUsuarioId(client);
        if (!usuarioId ||
            !Number.isInteger(campanhaId) ||
            !Number.isInteger(sessaoId)) {
            client.emit('sessao:erro', {
                code: 'JOIN_INVALIDO',
            });
            return { ok: false };
        }
        try {
            await this.sessaoService.validarAcessoSessao(campanhaId, sessaoId, usuarioId);
            const chaveSala = this.chaveSala(campanhaId, sessaoId);
            await client.join(chaveSala);
            this.registrarPresenca(chaveSala, campanhaId, sessaoId, usuarioId, client.id);
            client.emit('sessao:joined', { campanhaId, sessaoId });
            this.emitirPresencaPorChave(chaveSala);
            return { ok: true };
        }
        catch {
            client.emit('sessao:erro', {
                code: 'ACESSO_NEGADO',
            });
            return { ok: false };
        }
    }
    emitirSessaoAtualizada(campanhaId, sessaoId, tipo) {
        if (!this.server)
            return;
        const payload = {
            campanhaId,
            sessaoId,
            tipo,
            em: new Date().toISOString(),
        };
        this.server
            .to(this.chaveSala(campanhaId, sessaoId))
            .emit('sessao:atualizada', payload);
    }
    chaveSala(campanhaId, sessaoId) {
        return `sessao:${campanhaId}:${sessaoId}`;
    }
    registrarPresenca(chaveSala, campanhaId, sessaoId, usuarioId, socketId) {
        let salasSocket = this.salasPorSocket.get(socketId);
        if (!salasSocket) {
            salasSocket = new Set();
            this.salasPorSocket.set(socketId, salasSocket);
        }
        if (salasSocket.has(chaveSala))
            return;
        salasSocket.add(chaveSala);
        this.metaPorSala.set(chaveSala, { campanhaId, sessaoId });
        let usuariosSala = this.usuariosPorSala.get(chaveSala);
        if (!usuariosSala) {
            usuariosSala = new Map();
            this.usuariosPorSala.set(chaveSala, usuariosSala);
        }
        usuariosSala.set(usuarioId, (usuariosSala.get(usuarioId) ?? 0) + 1);
    }
    removerPresencaSocket(client) {
        const socketId = client.id;
        const usuarioId = this.obterUsuarioId(client);
        const salasSocket = this.salasPorSocket.get(socketId);
        if (!salasSocket || !usuarioId) {
            this.salasPorSocket.delete(socketId);
            return;
        }
        for (const chaveSala of salasSocket) {
            const usuariosSala = this.usuariosPorSala.get(chaveSala);
            if (!usuariosSala)
                continue;
            const conexoesUsuario = usuariosSala.get(usuarioId) ?? 0;
            if (conexoesUsuario <= 1) {
                usuariosSala.delete(usuarioId);
            }
            else {
                usuariosSala.set(usuarioId, conexoesUsuario - 1);
            }
            if (usuariosSala.size === 0) {
                this.usuariosPorSala.delete(chaveSala);
                this.metaPorSala.delete(chaveSala);
            }
            this.emitirPresencaPorChave(chaveSala);
        }
        this.salasPorSocket.delete(socketId);
    }
    emitirPresencaPorChave(chaveSala) {
        if (!this.server)
            return;
        const meta = this.metaPorSala.get(chaveSala);
        if (!meta)
            return;
        const usuariosSala = this.usuariosPorSala.get(chaveSala);
        const onlineUsuarioIds = usuariosSala
            ? Array.from(usuariosSala.keys()).sort((a, b) => a - b)
            : [];
        const payload = {
            campanhaId: meta.campanhaId,
            sessaoId: meta.sessaoId,
            onlineUsuarioIds,
            em: new Date().toISOString(),
        };
        this.server.to(chaveSala).emit('sessao:presenca', payload);
    }
    obterUsuarioId(client) {
        const data = client.data;
        return typeof data.usuarioId === 'number' ? data.usuarioId : undefined;
    }
    definirUsuarioId(client, usuarioId) {
        const data = client.data;
        data.usuarioId = usuarioId;
    }
    extrairToken(client) {
        const authHeader = client.handshake.headers.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            return authHeader.slice(7).trim();
        }
        const authPayload = client.handshake.auth;
        const authToken = authPayload?.token;
        if (typeof authToken === 'string' && authToken.trim() !== '') {
            return authToken.startsWith('Bearer ')
                ? authToken.slice(7).trim()
                : authToken.trim();
        }
        const queryPayload = client.handshake.query;
        const queryToken = queryPayload?.token;
        if (typeof queryToken === 'string' && queryToken.trim() !== '') {
            return queryToken.startsWith('Bearer ')
                ? queryToken.slice(7).trim()
                : queryToken.trim();
        }
        return null;
    }
};
exports.SessaoGateway = SessaoGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], SessaoGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sessao:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessaoGateway.prototype, "handleJoinSala", null);
exports.SessaoGateway = SessaoGateway = SessaoGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/sessoes',
        cors: {
            origin: resolverCorsOrigins(),
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [sessao_service_1.SessaoService,
        jwt_1.JwtService])
], SessaoGateway);
//# sourceMappingURL=sessao.gateway.js.map