"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullsOrder = exports.UsuarioOrderByRelevanceFieldEnum = exports.NullableJsonNullValueInput = exports.SortOrder = exports.ItemPersonagemCampanhaScalarFieldEnum = exports.ItemScalarFieldEnum = exports.HabilidadeOrigemScalarFieldEnum = exports.HabilidadeTrilhaScalarFieldEnum = exports.HabilidadeClasseScalarFieldEnum = exports.GrauPersonagemCampanhaScalarFieldEnum = exports.GrauPersonagemBaseScalarFieldEnum = exports.TipoGrauScalarFieldEnum = exports.HabilidadePersonagemCampanhaScalarFieldEnum = exports.HabilidadePersonagemBaseScalarFieldEnum = exports.HabilidadeScalarFieldEnum = exports.OrigemScalarFieldEnum = exports.ClaScalarFieldEnum = exports.CaminhoScalarFieldEnum = exports.TrilhaScalarFieldEnum = exports.ClasseScalarFieldEnum = exports.EventoSessaoScalarFieldEnum = exports.CondicaoPersonagemSessaoScalarFieldEnum = exports.CondicaoScalarFieldEnum = exports.PersonagemSessaoScalarFieldEnum = exports.CenaScalarFieldEnum = exports.SessaoScalarFieldEnum = exports.PersonagemCampanhaScalarFieldEnum = exports.PersonagemBaseScalarFieldEnum = exports.MembroCampanhaScalarFieldEnum = exports.CampanhaScalarFieldEnum = exports.UsuarioScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
exports.defineExtension = exports.ItemOrderByRelevanceFieldEnum = exports.TipoGrauOrderByRelevanceFieldEnum = exports.HabilidadeOrderByRelevanceFieldEnum = exports.OrigemOrderByRelevanceFieldEnum = exports.ClaOrderByRelevanceFieldEnum = exports.CaminhoOrderByRelevanceFieldEnum = exports.TrilhaOrderByRelevanceFieldEnum = exports.ClasseOrderByRelevanceFieldEnum = exports.EventoSessaoOrderByRelevanceFieldEnum = exports.QueryMode = exports.JsonNullValueFilter = exports.CondicaoOrderByRelevanceFieldEnum = exports.SessaoOrderByRelevanceFieldEnum = exports.PersonagemCampanhaOrderByRelevanceFieldEnum = exports.PersonagemBaseOrderByRelevanceFieldEnum = exports.MembroCampanhaOrderByRelevanceFieldEnum = exports.CampanhaOrderByRelevanceFieldEnum = void 0;
const runtime = __importStar(require("@prisma/client/runtime/library"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "6.19.0",
    engine: "2ba551f319ab1df4bc874a89965d8b3641056773"
};
exports.NullTypes = {
    DbNull: runtime.objectEnumValues.classes.DbNull,
    JsonNull: runtime.objectEnumValues.classes.JsonNull,
    AnyNull: runtime.objectEnumValues.classes.AnyNull,
};
exports.DbNull = runtime.objectEnumValues.instances.DbNull;
exports.JsonNull = runtime.objectEnumValues.instances.JsonNull;
exports.AnyNull = runtime.objectEnumValues.instances.AnyNull;
exports.ModelName = {
    Usuario: 'Usuario',
    Campanha: 'Campanha',
    MembroCampanha: 'MembroCampanha',
    PersonagemBase: 'PersonagemBase',
    PersonagemCampanha: 'PersonagemCampanha',
    Sessao: 'Sessao',
    Cena: 'Cena',
    PersonagemSessao: 'PersonagemSessao',
    Condicao: 'Condicao',
    CondicaoPersonagemSessao: 'CondicaoPersonagemSessao',
    EventoSessao: 'EventoSessao',
    Classe: 'Classe',
    Trilha: 'Trilha',
    Caminho: 'Caminho',
    Cla: 'Cla',
    Origem: 'Origem',
    Habilidade: 'Habilidade',
    HabilidadePersonagemBase: 'HabilidadePersonagemBase',
    HabilidadePersonagemCampanha: 'HabilidadePersonagemCampanha',
    TipoGrau: 'TipoGrau',
    GrauPersonagemBase: 'GrauPersonagemBase',
    GrauPersonagemCampanha: 'GrauPersonagemCampanha',
    HabilidadeClasse: 'HabilidadeClasse',
    HabilidadeTrilha: 'HabilidadeTrilha',
    HabilidadeOrigem: 'HabilidadeOrigem',
    Item: 'Item',
    ItemPersonagemCampanha: 'ItemPersonagemCampanha'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UsuarioScalarFieldEnum = {
    id: 'id',
    apelido: 'apelido',
    email: 'email',
    senhaHash: 'senhaHash',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
};
exports.CampanhaScalarFieldEnum = {
    id: 'id',
    donoId: 'donoId',
    nome: 'nome',
    descricao: 'descricao',
    status: 'status',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
};
exports.MembroCampanhaScalarFieldEnum = {
    id: 'id',
    campanhaId: 'campanhaId',
    usuarioId: 'usuarioId',
    papel: 'papel',
    entrouEm: 'entrouEm'
};
exports.PersonagemBaseScalarFieldEnum = {
    id: 'id',
    donoId: 'donoId',
    nome: 'nome',
    nivel: 'nivel',
    grauXama: 'grauXama',
    claId: 'claId',
    origemId: 'origemId',
    classeId: 'classeId',
    trilhaId: 'trilhaId',
    caminhoId: 'caminhoId',
    agilidade: 'agilidade',
    forca: 'forca',
    intelecto: 'intelecto',
    presenca: 'presenca',
    vigor: 'vigor',
    tecnicaInataId: 'tecnicaInataId'
};
exports.PersonagemCampanhaScalarFieldEnum = {
    id: 'id',
    campanhaId: 'campanhaId',
    personagemBaseId: 'personagemBaseId',
    nome: 'nome',
    nivel: 'nivel',
    grauXama: 'grauXama',
    claId: 'claId',
    origemId: 'origemId',
    classeId: 'classeId',
    trilhaId: 'trilhaId',
    caminhoId: 'caminhoId',
    pvMax: 'pvMax',
    pvAtual: 'pvAtual',
    peMax: 'peMax',
    peAtual: 'peAtual',
    eaMax: 'eaMax',
    eaAtual: 'eaAtual',
    sanMax: 'sanMax',
    sanAtual: 'sanAtual',
    limitePePorTurno: 'limitePePorTurno',
    limiteEaPorTurno: 'limiteEaPorTurno',
    prestigioGeral: 'prestigioGeral',
    prestigioCla: 'prestigioCla'
};
exports.SessaoScalarFieldEnum = {
    id: 'id',
    campanhaId: 'campanhaId',
    titulo: 'titulo'
};
exports.CenaScalarFieldEnum = {
    id: 'id',
    sessaoId: 'sessaoId'
};
exports.PersonagemSessaoScalarFieldEnum = {
    id: 'id',
    sessaoId: 'sessaoId',
    cenaId: 'cenaId',
    personagemCampanhaId: 'personagemCampanhaId'
};
exports.CondicaoScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao'
};
exports.CondicaoPersonagemSessaoScalarFieldEnum = {
    id: 'id',
    personagemSessaoId: 'personagemSessaoId',
    condicaoId: 'condicaoId',
    cenaId: 'cenaId',
    turnoAplicacao: 'turnoAplicacao',
    duracaoTurnos: 'duracaoTurnos'
};
exports.EventoSessaoScalarFieldEnum = {
    id: 'id',
    sessaoId: 'sessaoId',
    cenaId: 'cenaId',
    criadoEm: 'criadoEm',
    tipoEvento: 'tipoEvento',
    personagemAtorId: 'personagemAtorId',
    personagemAlvoId: 'personagemAlvoId',
    dados: 'dados'
};
exports.ClasseScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao'
};
exports.TrilhaScalarFieldEnum = {
    id: 'id',
    classeId: 'classeId',
    nome: 'nome',
    descricao: 'descricao'
};
exports.CaminhoScalarFieldEnum = {
    id: 'id',
    trilhaId: 'trilhaId',
    nome: 'nome',
    descricao: 'descricao'
};
exports.ClaScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao',
    grandeCla: 'grandeCla'
};
exports.OrigemScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao'
};
exports.HabilidadeScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao',
    tipo: 'tipo',
    origem: 'origem'
};
exports.HabilidadePersonagemBaseScalarFieldEnum = {
    id: 'id',
    personagemBaseId: 'personagemBaseId',
    habilidadeId: 'habilidadeId'
};
exports.HabilidadePersonagemCampanhaScalarFieldEnum = {
    id: 'id',
    personagemCampanhaId: 'personagemCampanhaId',
    habilidadeId: 'habilidadeId'
};
exports.TipoGrauScalarFieldEnum = {
    id: 'id',
    codigo: 'codigo',
    nome: 'nome',
    descricao: 'descricao'
};
exports.GrauPersonagemBaseScalarFieldEnum = {
    id: 'id',
    personagemBaseId: 'personagemBaseId',
    tipoGrauId: 'tipoGrauId',
    valor: 'valor'
};
exports.GrauPersonagemCampanhaScalarFieldEnum = {
    id: 'id',
    personagemCampanhaId: 'personagemCampanhaId',
    tipoGrauId: 'tipoGrauId',
    valor: 'valor'
};
exports.HabilidadeClasseScalarFieldEnum = {
    id: 'id',
    classeId: 'classeId',
    habilidadeId: 'habilidadeId',
    nivelConcedido: 'nivelConcedido'
};
exports.HabilidadeTrilhaScalarFieldEnum = {
    id: 'id',
    trilhaId: 'trilhaId',
    habilidadeId: 'habilidadeId',
    nivelConcedido: 'nivelConcedido'
};
exports.HabilidadeOrigemScalarFieldEnum = {
    id: 'id',
    origemId: 'origemId',
    habilidadeId: 'habilidadeId'
};
exports.ItemScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    tipoItem: 'tipoItem',
    descricao: 'descricao',
    grauItem: 'grauItem',
    pesoCarga: 'pesoCarga'
};
exports.ItemPersonagemCampanhaScalarFieldEnum = {
    id: 'id',
    personagemCampanhaId: 'personagemCampanhaId',
    itemId: 'itemId',
    quantidade: 'quantidade',
    equipado: 'equipado'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.UsuarioOrderByRelevanceFieldEnum = {
    apelido: 'apelido',
    email: 'email',
    senhaHash: 'senhaHash'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.CampanhaOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao',
    status: 'status'
};
exports.MembroCampanhaOrderByRelevanceFieldEnum = {
    papel: 'papel'
};
exports.PersonagemBaseOrderByRelevanceFieldEnum = {
    nome: 'nome',
    grauXama: 'grauXama'
};
exports.PersonagemCampanhaOrderByRelevanceFieldEnum = {
    nome: 'nome',
    grauXama: 'grauXama'
};
exports.SessaoOrderByRelevanceFieldEnum = {
    titulo: 'titulo'
};
exports.CondicaoOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.EventoSessaoOrderByRelevanceFieldEnum = {
    tipoEvento: 'tipoEvento'
};
exports.ClasseOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.TrilhaOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.CaminhoOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.ClaOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.OrigemOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao'
};
exports.HabilidadeOrderByRelevanceFieldEnum = {
    nome: 'nome',
    descricao: 'descricao',
    tipo: 'tipo',
    origem: 'origem'
};
exports.TipoGrauOrderByRelevanceFieldEnum = {
    codigo: 'codigo',
    nome: 'nome',
    descricao: 'descricao'
};
exports.ItemOrderByRelevanceFieldEnum = {
    nome: 'nome',
    tipoItem: 'tipoItem',
    descricao: 'descricao'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map