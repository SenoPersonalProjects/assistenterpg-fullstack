import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly Usuario: "Usuario";
    readonly Campanha: "Campanha";
    readonly MembroCampanha: "MembroCampanha";
    readonly PersonagemBase: "PersonagemBase";
    readonly PersonagemCampanha: "PersonagemCampanha";
    readonly Sessao: "Sessao";
    readonly Cena: "Cena";
    readonly PersonagemSessao: "PersonagemSessao";
    readonly Condicao: "Condicao";
    readonly CondicaoPersonagemSessao: "CondicaoPersonagemSessao";
    readonly EventoSessao: "EventoSessao";
    readonly Classe: "Classe";
    readonly Trilha: "Trilha";
    readonly Caminho: "Caminho";
    readonly Cla: "Cla";
    readonly Origem: "Origem";
    readonly Habilidade: "Habilidade";
    readonly HabilidadePersonagemBase: "HabilidadePersonagemBase";
    readonly HabilidadePersonagemCampanha: "HabilidadePersonagemCampanha";
    readonly TipoGrau: "TipoGrau";
    readonly GrauPersonagemBase: "GrauPersonagemBase";
    readonly GrauPersonagemCampanha: "GrauPersonagemCampanha";
    readonly HabilidadeClasse: "HabilidadeClasse";
    readonly HabilidadeTrilha: "HabilidadeTrilha";
    readonly HabilidadeOrigem: "HabilidadeOrigem";
    readonly Item: "Item";
    readonly ItemPersonagemCampanha: "ItemPersonagemCampanha";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UsuarioScalarFieldEnum: {
    readonly id: "id";
    readonly apelido: "apelido";
    readonly email: "email";
    readonly senhaHash: "senhaHash";
    readonly criadoEm: "criadoEm";
    readonly atualizadoEm: "atualizadoEm";
};
export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum];
export declare const CampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly donoId: "donoId";
    readonly nome: "nome";
    readonly descricao: "descricao";
    readonly status: "status";
    readonly criadoEm: "criadoEm";
    readonly atualizadoEm: "atualizadoEm";
};
export type CampanhaScalarFieldEnum = (typeof CampanhaScalarFieldEnum)[keyof typeof CampanhaScalarFieldEnum];
export declare const MembroCampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly campanhaId: "campanhaId";
    readonly usuarioId: "usuarioId";
    readonly papel: "papel";
    readonly entrouEm: "entrouEm";
};
export type MembroCampanhaScalarFieldEnum = (typeof MembroCampanhaScalarFieldEnum)[keyof typeof MembroCampanhaScalarFieldEnum];
export declare const PersonagemBaseScalarFieldEnum: {
    readonly id: "id";
    readonly donoId: "donoId";
    readonly nome: "nome";
    readonly nivel: "nivel";
    readonly grauXama: "grauXama";
    readonly claId: "claId";
    readonly origemId: "origemId";
    readonly classeId: "classeId";
    readonly trilhaId: "trilhaId";
    readonly caminhoId: "caminhoId";
    readonly agilidade: "agilidade";
    readonly forca: "forca";
    readonly intelecto: "intelecto";
    readonly presenca: "presenca";
    readonly vigor: "vigor";
    readonly tecnicaInataId: "tecnicaInataId";
};
export type PersonagemBaseScalarFieldEnum = (typeof PersonagemBaseScalarFieldEnum)[keyof typeof PersonagemBaseScalarFieldEnum];
export declare const PersonagemCampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly campanhaId: "campanhaId";
    readonly personagemBaseId: "personagemBaseId";
    readonly nome: "nome";
    readonly nivel: "nivel";
    readonly grauXama: "grauXama";
    readonly claId: "claId";
    readonly origemId: "origemId";
    readonly classeId: "classeId";
    readonly trilhaId: "trilhaId";
    readonly caminhoId: "caminhoId";
    readonly pvMax: "pvMax";
    readonly pvAtual: "pvAtual";
    readonly peMax: "peMax";
    readonly peAtual: "peAtual";
    readonly eaMax: "eaMax";
    readonly eaAtual: "eaAtual";
    readonly sanMax: "sanMax";
    readonly sanAtual: "sanAtual";
    readonly limitePePorTurno: "limitePePorTurno";
    readonly limiteEaPorTurno: "limiteEaPorTurno";
    readonly prestigioGeral: "prestigioGeral";
    readonly prestigioCla: "prestigioCla";
};
export type PersonagemCampanhaScalarFieldEnum = (typeof PersonagemCampanhaScalarFieldEnum)[keyof typeof PersonagemCampanhaScalarFieldEnum];
export declare const SessaoScalarFieldEnum: {
    readonly id: "id";
    readonly campanhaId: "campanhaId";
    readonly titulo: "titulo";
};
export type SessaoScalarFieldEnum = (typeof SessaoScalarFieldEnum)[keyof typeof SessaoScalarFieldEnum];
export declare const CenaScalarFieldEnum: {
    readonly id: "id";
    readonly sessaoId: "sessaoId";
};
export type CenaScalarFieldEnum = (typeof CenaScalarFieldEnum)[keyof typeof CenaScalarFieldEnum];
export declare const PersonagemSessaoScalarFieldEnum: {
    readonly id: "id";
    readonly sessaoId: "sessaoId";
    readonly cenaId: "cenaId";
    readonly personagemCampanhaId: "personagemCampanhaId";
};
export type PersonagemSessaoScalarFieldEnum = (typeof PersonagemSessaoScalarFieldEnum)[keyof typeof PersonagemSessaoScalarFieldEnum];
export declare const CondicaoScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type CondicaoScalarFieldEnum = (typeof CondicaoScalarFieldEnum)[keyof typeof CondicaoScalarFieldEnum];
export declare const CondicaoPersonagemSessaoScalarFieldEnum: {
    readonly id: "id";
    readonly personagemSessaoId: "personagemSessaoId";
    readonly condicaoId: "condicaoId";
    readonly cenaId: "cenaId";
    readonly turnoAplicacao: "turnoAplicacao";
    readonly duracaoTurnos: "duracaoTurnos";
};
export type CondicaoPersonagemSessaoScalarFieldEnum = (typeof CondicaoPersonagemSessaoScalarFieldEnum)[keyof typeof CondicaoPersonagemSessaoScalarFieldEnum];
export declare const EventoSessaoScalarFieldEnum: {
    readonly id: "id";
    readonly sessaoId: "sessaoId";
    readonly cenaId: "cenaId";
    readonly criadoEm: "criadoEm";
    readonly tipoEvento: "tipoEvento";
    readonly personagemAtorId: "personagemAtorId";
    readonly personagemAlvoId: "personagemAlvoId";
    readonly dados: "dados";
};
export type EventoSessaoScalarFieldEnum = (typeof EventoSessaoScalarFieldEnum)[keyof typeof EventoSessaoScalarFieldEnum];
export declare const ClasseScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type ClasseScalarFieldEnum = (typeof ClasseScalarFieldEnum)[keyof typeof ClasseScalarFieldEnum];
export declare const TrilhaScalarFieldEnum: {
    readonly id: "id";
    readonly classeId: "classeId";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type TrilhaScalarFieldEnum = (typeof TrilhaScalarFieldEnum)[keyof typeof TrilhaScalarFieldEnum];
export declare const CaminhoScalarFieldEnum: {
    readonly id: "id";
    readonly trilhaId: "trilhaId";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type CaminhoScalarFieldEnum = (typeof CaminhoScalarFieldEnum)[keyof typeof CaminhoScalarFieldEnum];
export declare const ClaScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly descricao: "descricao";
    readonly grandeCla: "grandeCla";
};
export type ClaScalarFieldEnum = (typeof ClaScalarFieldEnum)[keyof typeof ClaScalarFieldEnum];
export declare const OrigemScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type OrigemScalarFieldEnum = (typeof OrigemScalarFieldEnum)[keyof typeof OrigemScalarFieldEnum];
export declare const HabilidadeScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly descricao: "descricao";
    readonly tipo: "tipo";
    readonly origem: "origem";
};
export type HabilidadeScalarFieldEnum = (typeof HabilidadeScalarFieldEnum)[keyof typeof HabilidadeScalarFieldEnum];
export declare const HabilidadePersonagemBaseScalarFieldEnum: {
    readonly id: "id";
    readonly personagemBaseId: "personagemBaseId";
    readonly habilidadeId: "habilidadeId";
};
export type HabilidadePersonagemBaseScalarFieldEnum = (typeof HabilidadePersonagemBaseScalarFieldEnum)[keyof typeof HabilidadePersonagemBaseScalarFieldEnum];
export declare const HabilidadePersonagemCampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly personagemCampanhaId: "personagemCampanhaId";
    readonly habilidadeId: "habilidadeId";
};
export type HabilidadePersonagemCampanhaScalarFieldEnum = (typeof HabilidadePersonagemCampanhaScalarFieldEnum)[keyof typeof HabilidadePersonagemCampanhaScalarFieldEnum];
export declare const TipoGrauScalarFieldEnum: {
    readonly id: "id";
    readonly codigo: "codigo";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type TipoGrauScalarFieldEnum = (typeof TipoGrauScalarFieldEnum)[keyof typeof TipoGrauScalarFieldEnum];
export declare const GrauPersonagemBaseScalarFieldEnum: {
    readonly id: "id";
    readonly personagemBaseId: "personagemBaseId";
    readonly tipoGrauId: "tipoGrauId";
    readonly valor: "valor";
};
export type GrauPersonagemBaseScalarFieldEnum = (typeof GrauPersonagemBaseScalarFieldEnum)[keyof typeof GrauPersonagemBaseScalarFieldEnum];
export declare const GrauPersonagemCampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly personagemCampanhaId: "personagemCampanhaId";
    readonly tipoGrauId: "tipoGrauId";
    readonly valor: "valor";
};
export type GrauPersonagemCampanhaScalarFieldEnum = (typeof GrauPersonagemCampanhaScalarFieldEnum)[keyof typeof GrauPersonagemCampanhaScalarFieldEnum];
export declare const HabilidadeClasseScalarFieldEnum: {
    readonly id: "id";
    readonly classeId: "classeId";
    readonly habilidadeId: "habilidadeId";
    readonly nivelConcedido: "nivelConcedido";
};
export type HabilidadeClasseScalarFieldEnum = (typeof HabilidadeClasseScalarFieldEnum)[keyof typeof HabilidadeClasseScalarFieldEnum];
export declare const HabilidadeTrilhaScalarFieldEnum: {
    readonly id: "id";
    readonly trilhaId: "trilhaId";
    readonly habilidadeId: "habilidadeId";
    readonly nivelConcedido: "nivelConcedido";
};
export type HabilidadeTrilhaScalarFieldEnum = (typeof HabilidadeTrilhaScalarFieldEnum)[keyof typeof HabilidadeTrilhaScalarFieldEnum];
export declare const HabilidadeOrigemScalarFieldEnum: {
    readonly id: "id";
    readonly origemId: "origemId";
    readonly habilidadeId: "habilidadeId";
};
export type HabilidadeOrigemScalarFieldEnum = (typeof HabilidadeOrigemScalarFieldEnum)[keyof typeof HabilidadeOrigemScalarFieldEnum];
export declare const ItemScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly tipoItem: "tipoItem";
    readonly descricao: "descricao";
    readonly grauItem: "grauItem";
    readonly pesoCarga: "pesoCarga";
};
export type ItemScalarFieldEnum = (typeof ItemScalarFieldEnum)[keyof typeof ItemScalarFieldEnum];
export declare const ItemPersonagemCampanhaScalarFieldEnum: {
    readonly id: "id";
    readonly personagemCampanhaId: "personagemCampanhaId";
    readonly itemId: "itemId";
    readonly quantidade: "quantidade";
    readonly equipado: "equipado";
};
export type ItemPersonagemCampanhaScalarFieldEnum = (typeof ItemPersonagemCampanhaScalarFieldEnum)[keyof typeof ItemPersonagemCampanhaScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const UsuarioOrderByRelevanceFieldEnum: {
    readonly apelido: "apelido";
    readonly email: "email";
    readonly senhaHash: "senhaHash";
};
export type UsuarioOrderByRelevanceFieldEnum = (typeof UsuarioOrderByRelevanceFieldEnum)[keyof typeof UsuarioOrderByRelevanceFieldEnum];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const CampanhaOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
    readonly status: "status";
};
export type CampanhaOrderByRelevanceFieldEnum = (typeof CampanhaOrderByRelevanceFieldEnum)[keyof typeof CampanhaOrderByRelevanceFieldEnum];
export declare const MembroCampanhaOrderByRelevanceFieldEnum: {
    readonly papel: "papel";
};
export type MembroCampanhaOrderByRelevanceFieldEnum = (typeof MembroCampanhaOrderByRelevanceFieldEnum)[keyof typeof MembroCampanhaOrderByRelevanceFieldEnum];
export declare const PersonagemBaseOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly grauXama: "grauXama";
};
export type PersonagemBaseOrderByRelevanceFieldEnum = (typeof PersonagemBaseOrderByRelevanceFieldEnum)[keyof typeof PersonagemBaseOrderByRelevanceFieldEnum];
export declare const PersonagemCampanhaOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly grauXama: "grauXama";
};
export type PersonagemCampanhaOrderByRelevanceFieldEnum = (typeof PersonagemCampanhaOrderByRelevanceFieldEnum)[keyof typeof PersonagemCampanhaOrderByRelevanceFieldEnum];
export declare const SessaoOrderByRelevanceFieldEnum: {
    readonly titulo: "titulo";
};
export type SessaoOrderByRelevanceFieldEnum = (typeof SessaoOrderByRelevanceFieldEnum)[keyof typeof SessaoOrderByRelevanceFieldEnum];
export declare const CondicaoOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type CondicaoOrderByRelevanceFieldEnum = (typeof CondicaoOrderByRelevanceFieldEnum)[keyof typeof CondicaoOrderByRelevanceFieldEnum];
export declare const JsonNullValueFilter: {
    readonly DbNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly AnyNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const EventoSessaoOrderByRelevanceFieldEnum: {
    readonly tipoEvento: "tipoEvento";
};
export type EventoSessaoOrderByRelevanceFieldEnum = (typeof EventoSessaoOrderByRelevanceFieldEnum)[keyof typeof EventoSessaoOrderByRelevanceFieldEnum];
export declare const ClasseOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type ClasseOrderByRelevanceFieldEnum = (typeof ClasseOrderByRelevanceFieldEnum)[keyof typeof ClasseOrderByRelevanceFieldEnum];
export declare const TrilhaOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type TrilhaOrderByRelevanceFieldEnum = (typeof TrilhaOrderByRelevanceFieldEnum)[keyof typeof TrilhaOrderByRelevanceFieldEnum];
export declare const CaminhoOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type CaminhoOrderByRelevanceFieldEnum = (typeof CaminhoOrderByRelevanceFieldEnum)[keyof typeof CaminhoOrderByRelevanceFieldEnum];
export declare const ClaOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type ClaOrderByRelevanceFieldEnum = (typeof ClaOrderByRelevanceFieldEnum)[keyof typeof ClaOrderByRelevanceFieldEnum];
export declare const OrigemOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type OrigemOrderByRelevanceFieldEnum = (typeof OrigemOrderByRelevanceFieldEnum)[keyof typeof OrigemOrderByRelevanceFieldEnum];
export declare const HabilidadeOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly descricao: "descricao";
    readonly tipo: "tipo";
    readonly origem: "origem";
};
export type HabilidadeOrderByRelevanceFieldEnum = (typeof HabilidadeOrderByRelevanceFieldEnum)[keyof typeof HabilidadeOrderByRelevanceFieldEnum];
export declare const TipoGrauOrderByRelevanceFieldEnum: {
    readonly codigo: "codigo";
    readonly nome: "nome";
    readonly descricao: "descricao";
};
export type TipoGrauOrderByRelevanceFieldEnum = (typeof TipoGrauOrderByRelevanceFieldEnum)[keyof typeof TipoGrauOrderByRelevanceFieldEnum];
export declare const ItemOrderByRelevanceFieldEnum: {
    readonly nome: "nome";
    readonly tipoItem: "tipoItem";
    readonly descricao: "descricao";
};
export type ItemOrderByRelevanceFieldEnum = (typeof ItemOrderByRelevanceFieldEnum)[keyof typeof ItemOrderByRelevanceFieldEnum];
