"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarNpcSessaoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const adicionar_npc_sessao_dto_1 = require("./adicionar-npc-sessao.dto");
class AtualizarNpcSessaoDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(adicionar_npc_sessao_dto_1.AdicionarNpcSessaoDto, ['npcAmeacaId'])) {
}
exports.AtualizarNpcSessaoDto = AtualizarNpcSessaoDto;
//# sourceMappingURL=atualizar-npc-sessao.dto.js.map