import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Metrics = runtime.Metrics;
export type Metric<T> = runtime.Metric<T>;
export type MetricHistogram = runtime.MetricHistogram;
export type MetricHistogramBucket = runtime.MetricHistogramBucket;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
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
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
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
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "usuario" | "campanha" | "membroCampanha" | "personagemBase" | "personagemCampanha" | "sessao" | "cena" | "personagemSessao" | "condicao" | "condicaoPersonagemSessao" | "eventoSessao" | "classe" | "trilha" | "caminho" | "cla" | "origem" | "habilidade" | "habilidadePersonagemBase" | "habilidadePersonagemCampanha" | "tipoGrau" | "grauPersonagemBase" | "grauPersonagemCampanha" | "habilidadeClasse" | "habilidadeTrilha" | "habilidadeOrigem" | "item" | "itemPersonagemCampanha";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        Usuario: {
            payload: Prisma.$UsuarioPayload<ExtArgs>;
            fields: Prisma.UsuarioFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UsuarioFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                findFirst: {
                    args: Prisma.UsuarioFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                findMany: {
                    args: Prisma.UsuarioFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>[];
                };
                create: {
                    args: Prisma.UsuarioCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                createMany: {
                    args: Prisma.UsuarioCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.UsuarioDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                update: {
                    args: Prisma.UsuarioUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                deleteMany: {
                    args: Prisma.UsuarioDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UsuarioUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.UsuarioUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                aggregate: {
                    args: Prisma.UsuarioAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUsuario>;
                };
                groupBy: {
                    args: Prisma.UsuarioGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsuarioGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UsuarioCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsuarioCountAggregateOutputType> | number;
                };
            };
        };
        Campanha: {
            payload: Prisma.$CampanhaPayload<ExtArgs>;
            fields: Prisma.CampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.CampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                findMany: {
                    args: Prisma.CampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>[];
                };
                create: {
                    args: Prisma.CampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                createMany: {
                    args: Prisma.CampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                update: {
                    args: Prisma.CampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.CampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.CampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCampanha>;
                };
                groupBy: {
                    args: Prisma.CampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CampanhaCountAggregateOutputType> | number;
                };
            };
        };
        MembroCampanha: {
            payload: Prisma.$MembroCampanhaPayload<ExtArgs>;
            fields: Prisma.MembroCampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MembroCampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MembroCampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.MembroCampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MembroCampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                findMany: {
                    args: Prisma.MembroCampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>[];
                };
                create: {
                    args: Prisma.MembroCampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                createMany: {
                    args: Prisma.MembroCampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.MembroCampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                update: {
                    args: Prisma.MembroCampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.MembroCampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MembroCampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.MembroCampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MembroCampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.MembroCampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMembroCampanha>;
                };
                groupBy: {
                    args: Prisma.MembroCampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MembroCampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MembroCampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MembroCampanhaCountAggregateOutputType> | number;
                };
            };
        };
        PersonagemBase: {
            payload: Prisma.$PersonagemBasePayload<ExtArgs>;
            fields: Prisma.PersonagemBaseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PersonagemBaseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PersonagemBaseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                findFirst: {
                    args: Prisma.PersonagemBaseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PersonagemBaseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                findMany: {
                    args: Prisma.PersonagemBaseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>[];
                };
                create: {
                    args: Prisma.PersonagemBaseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                createMany: {
                    args: Prisma.PersonagemBaseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.PersonagemBaseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                update: {
                    args: Prisma.PersonagemBaseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                deleteMany: {
                    args: Prisma.PersonagemBaseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PersonagemBaseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.PersonagemBaseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemBasePayload>;
                };
                aggregate: {
                    args: Prisma.PersonagemBaseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePersonagemBase>;
                };
                groupBy: {
                    args: Prisma.PersonagemBaseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemBaseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PersonagemBaseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemBaseCountAggregateOutputType> | number;
                };
            };
        };
        PersonagemCampanha: {
            payload: Prisma.$PersonagemCampanhaPayload<ExtArgs>;
            fields: Prisma.PersonagemCampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PersonagemCampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.PersonagemCampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                findMany: {
                    args: Prisma.PersonagemCampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>[];
                };
                create: {
                    args: Prisma.PersonagemCampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                createMany: {
                    args: Prisma.PersonagemCampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.PersonagemCampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                update: {
                    args: Prisma.PersonagemCampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.PersonagemCampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PersonagemCampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.PersonagemCampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemCampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.PersonagemCampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePersonagemCampanha>;
                };
                groupBy: {
                    args: Prisma.PersonagemCampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemCampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PersonagemCampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemCampanhaCountAggregateOutputType> | number;
                };
            };
        };
        Sessao: {
            payload: Prisma.$SessaoPayload<ExtArgs>;
            fields: Prisma.SessaoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SessaoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SessaoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                findFirst: {
                    args: Prisma.SessaoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SessaoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                findMany: {
                    args: Prisma.SessaoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>[];
                };
                create: {
                    args: Prisma.SessaoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                createMany: {
                    args: Prisma.SessaoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.SessaoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                update: {
                    args: Prisma.SessaoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                deleteMany: {
                    args: Prisma.SessaoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SessaoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.SessaoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessaoPayload>;
                };
                aggregate: {
                    args: Prisma.SessaoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSessao>;
                };
                groupBy: {
                    args: Prisma.SessaoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessaoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SessaoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessaoCountAggregateOutputType> | number;
                };
            };
        };
        Cena: {
            payload: Prisma.$CenaPayload<ExtArgs>;
            fields: Prisma.CenaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CenaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CenaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                findFirst: {
                    args: Prisma.CenaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CenaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                findMany: {
                    args: Prisma.CenaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>[];
                };
                create: {
                    args: Prisma.CenaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                createMany: {
                    args: Prisma.CenaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CenaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                update: {
                    args: Prisma.CenaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                deleteMany: {
                    args: Prisma.CenaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CenaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CenaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CenaPayload>;
                };
                aggregate: {
                    args: Prisma.CenaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCena>;
                };
                groupBy: {
                    args: Prisma.CenaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CenaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CenaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CenaCountAggregateOutputType> | number;
                };
            };
        };
        PersonagemSessao: {
            payload: Prisma.$PersonagemSessaoPayload<ExtArgs>;
            fields: Prisma.PersonagemSessaoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PersonagemSessaoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PersonagemSessaoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                findFirst: {
                    args: Prisma.PersonagemSessaoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PersonagemSessaoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                findMany: {
                    args: Prisma.PersonagemSessaoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>[];
                };
                create: {
                    args: Prisma.PersonagemSessaoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                createMany: {
                    args: Prisma.PersonagemSessaoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.PersonagemSessaoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                update: {
                    args: Prisma.PersonagemSessaoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                deleteMany: {
                    args: Prisma.PersonagemSessaoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PersonagemSessaoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.PersonagemSessaoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonagemSessaoPayload>;
                };
                aggregate: {
                    args: Prisma.PersonagemSessaoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePersonagemSessao>;
                };
                groupBy: {
                    args: Prisma.PersonagemSessaoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemSessaoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PersonagemSessaoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonagemSessaoCountAggregateOutputType> | number;
                };
            };
        };
        Condicao: {
            payload: Prisma.$CondicaoPayload<ExtArgs>;
            fields: Prisma.CondicaoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CondicaoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CondicaoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                findFirst: {
                    args: Prisma.CondicaoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CondicaoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                findMany: {
                    args: Prisma.CondicaoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>[];
                };
                create: {
                    args: Prisma.CondicaoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                createMany: {
                    args: Prisma.CondicaoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CondicaoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                update: {
                    args: Prisma.CondicaoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                deleteMany: {
                    args: Prisma.CondicaoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CondicaoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CondicaoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPayload>;
                };
                aggregate: {
                    args: Prisma.CondicaoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCondicao>;
                };
                groupBy: {
                    args: Prisma.CondicaoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CondicaoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CondicaoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CondicaoCountAggregateOutputType> | number;
                };
            };
        };
        CondicaoPersonagemSessao: {
            payload: Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>;
            fields: Prisma.CondicaoPersonagemSessaoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CondicaoPersonagemSessaoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CondicaoPersonagemSessaoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                findFirst: {
                    args: Prisma.CondicaoPersonagemSessaoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CondicaoPersonagemSessaoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                findMany: {
                    args: Prisma.CondicaoPersonagemSessaoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>[];
                };
                create: {
                    args: Prisma.CondicaoPersonagemSessaoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                createMany: {
                    args: Prisma.CondicaoPersonagemSessaoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CondicaoPersonagemSessaoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                update: {
                    args: Prisma.CondicaoPersonagemSessaoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                deleteMany: {
                    args: Prisma.CondicaoPersonagemSessaoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CondicaoPersonagemSessaoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CondicaoPersonagemSessaoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CondicaoPersonagemSessaoPayload>;
                };
                aggregate: {
                    args: Prisma.CondicaoPersonagemSessaoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCondicaoPersonagemSessao>;
                };
                groupBy: {
                    args: Prisma.CondicaoPersonagemSessaoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CondicaoPersonagemSessaoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CondicaoPersonagemSessaoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CondicaoPersonagemSessaoCountAggregateOutputType> | number;
                };
            };
        };
        EventoSessao: {
            payload: Prisma.$EventoSessaoPayload<ExtArgs>;
            fields: Prisma.EventoSessaoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EventoSessaoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EventoSessaoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                findFirst: {
                    args: Prisma.EventoSessaoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EventoSessaoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                findMany: {
                    args: Prisma.EventoSessaoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>[];
                };
                create: {
                    args: Prisma.EventoSessaoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                createMany: {
                    args: Prisma.EventoSessaoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.EventoSessaoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                update: {
                    args: Prisma.EventoSessaoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                deleteMany: {
                    args: Prisma.EventoSessaoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EventoSessaoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.EventoSessaoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoSessaoPayload>;
                };
                aggregate: {
                    args: Prisma.EventoSessaoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEventoSessao>;
                };
                groupBy: {
                    args: Prisma.EventoSessaoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventoSessaoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EventoSessaoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventoSessaoCountAggregateOutputType> | number;
                };
            };
        };
        Classe: {
            payload: Prisma.$ClassePayload<ExtArgs>;
            fields: Prisma.ClasseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClasseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClasseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                findFirst: {
                    args: Prisma.ClasseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClasseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                findMany: {
                    args: Prisma.ClasseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>[];
                };
                create: {
                    args: Prisma.ClasseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                createMany: {
                    args: Prisma.ClasseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.ClasseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                update: {
                    args: Prisma.ClasseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                deleteMany: {
                    args: Prisma.ClasseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClasseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.ClasseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClassePayload>;
                };
                aggregate: {
                    args: Prisma.ClasseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClasse>;
                };
                groupBy: {
                    args: Prisma.ClasseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClasseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClasseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClasseCountAggregateOutputType> | number;
                };
            };
        };
        Trilha: {
            payload: Prisma.$TrilhaPayload<ExtArgs>;
            fields: Prisma.TrilhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TrilhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TrilhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                findFirst: {
                    args: Prisma.TrilhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TrilhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                findMany: {
                    args: Prisma.TrilhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>[];
                };
                create: {
                    args: Prisma.TrilhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                createMany: {
                    args: Prisma.TrilhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.TrilhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                update: {
                    args: Prisma.TrilhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                deleteMany: {
                    args: Prisma.TrilhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TrilhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.TrilhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrilhaPayload>;
                };
                aggregate: {
                    args: Prisma.TrilhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTrilha>;
                };
                groupBy: {
                    args: Prisma.TrilhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TrilhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TrilhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TrilhaCountAggregateOutputType> | number;
                };
            };
        };
        Caminho: {
            payload: Prisma.$CaminhoPayload<ExtArgs>;
            fields: Prisma.CaminhoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CaminhoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CaminhoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                findFirst: {
                    args: Prisma.CaminhoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CaminhoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                findMany: {
                    args: Prisma.CaminhoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>[];
                };
                create: {
                    args: Prisma.CaminhoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                createMany: {
                    args: Prisma.CaminhoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CaminhoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                update: {
                    args: Prisma.CaminhoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                deleteMany: {
                    args: Prisma.CaminhoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CaminhoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CaminhoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CaminhoPayload>;
                };
                aggregate: {
                    args: Prisma.CaminhoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCaminho>;
                };
                groupBy: {
                    args: Prisma.CaminhoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CaminhoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CaminhoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CaminhoCountAggregateOutputType> | number;
                };
            };
        };
        Cla: {
            payload: Prisma.$ClaPayload<ExtArgs>;
            fields: Prisma.ClaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                findFirst: {
                    args: Prisma.ClaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                findMany: {
                    args: Prisma.ClaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>[];
                };
                create: {
                    args: Prisma.ClaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                createMany: {
                    args: Prisma.ClaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.ClaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                update: {
                    args: Prisma.ClaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                deleteMany: {
                    args: Prisma.ClaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.ClaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClaPayload>;
                };
                aggregate: {
                    args: Prisma.ClaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCla>;
                };
                groupBy: {
                    args: Prisma.ClaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClaCountAggregateOutputType> | number;
                };
            };
        };
        Origem: {
            payload: Prisma.$OrigemPayload<ExtArgs>;
            fields: Prisma.OrigemFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrigemFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrigemFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                findFirst: {
                    args: Prisma.OrigemFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrigemFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                findMany: {
                    args: Prisma.OrigemFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>[];
                };
                create: {
                    args: Prisma.OrigemCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                createMany: {
                    args: Prisma.OrigemCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.OrigemDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                update: {
                    args: Prisma.OrigemUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                deleteMany: {
                    args: Prisma.OrigemDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrigemUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.OrigemUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrigemPayload>;
                };
                aggregate: {
                    args: Prisma.OrigemAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrigem>;
                };
                groupBy: {
                    args: Prisma.OrigemGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrigemGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrigemCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrigemCountAggregateOutputType> | number;
                };
            };
        };
        Habilidade: {
            payload: Prisma.$HabilidadePayload<ExtArgs>;
            fields: Prisma.HabilidadeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                findMany: {
                    args: Prisma.HabilidadeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>[];
                };
                create: {
                    args: Prisma.HabilidadeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                createMany: {
                    args: Prisma.HabilidadeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                update: {
                    args: Prisma.HabilidadeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidade>;
                };
                groupBy: {
                    args: Prisma.HabilidadeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeCountAggregateOutputType> | number;
                };
            };
        };
        HabilidadePersonagemBase: {
            payload: Prisma.$HabilidadePersonagemBasePayload<ExtArgs>;
            fields: Prisma.HabilidadePersonagemBaseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadePersonagemBaseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadePersonagemBaseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadePersonagemBaseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadePersonagemBaseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                findMany: {
                    args: Prisma.HabilidadePersonagemBaseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>[];
                };
                create: {
                    args: Prisma.HabilidadePersonagemBaseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                createMany: {
                    args: Prisma.HabilidadePersonagemBaseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadePersonagemBaseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                update: {
                    args: Prisma.HabilidadePersonagemBaseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadePersonagemBaseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadePersonagemBaseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadePersonagemBaseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemBasePayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadePersonagemBaseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidadePersonagemBase>;
                };
                groupBy: {
                    args: Prisma.HabilidadePersonagemBaseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadePersonagemBaseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadePersonagemBaseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadePersonagemBaseCountAggregateOutputType> | number;
                };
            };
        };
        HabilidadePersonagemCampanha: {
            payload: Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>;
            fields: Prisma.HabilidadePersonagemCampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadePersonagemCampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadePersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadePersonagemCampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadePersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                findMany: {
                    args: Prisma.HabilidadePersonagemCampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>[];
                };
                create: {
                    args: Prisma.HabilidadePersonagemCampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                createMany: {
                    args: Prisma.HabilidadePersonagemCampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadePersonagemCampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                update: {
                    args: Prisma.HabilidadePersonagemCampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadePersonagemCampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadePersonagemCampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadePersonagemCampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadePersonagemCampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadePersonagemCampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidadePersonagemCampanha>;
                };
                groupBy: {
                    args: Prisma.HabilidadePersonagemCampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadePersonagemCampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadePersonagemCampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadePersonagemCampanhaCountAggregateOutputType> | number;
                };
            };
        };
        TipoGrau: {
            payload: Prisma.$TipoGrauPayload<ExtArgs>;
            fields: Prisma.TipoGrauFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TipoGrauFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TipoGrauFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                findFirst: {
                    args: Prisma.TipoGrauFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TipoGrauFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                findMany: {
                    args: Prisma.TipoGrauFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>[];
                };
                create: {
                    args: Prisma.TipoGrauCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                createMany: {
                    args: Prisma.TipoGrauCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.TipoGrauDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                update: {
                    args: Prisma.TipoGrauUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                deleteMany: {
                    args: Prisma.TipoGrauDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TipoGrauUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.TipoGrauUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoGrauPayload>;
                };
                aggregate: {
                    args: Prisma.TipoGrauAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTipoGrau>;
                };
                groupBy: {
                    args: Prisma.TipoGrauGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TipoGrauGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TipoGrauCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TipoGrauCountAggregateOutputType> | number;
                };
            };
        };
        GrauPersonagemBase: {
            payload: Prisma.$GrauPersonagemBasePayload<ExtArgs>;
            fields: Prisma.GrauPersonagemBaseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GrauPersonagemBaseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GrauPersonagemBaseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                findFirst: {
                    args: Prisma.GrauPersonagemBaseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GrauPersonagemBaseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                findMany: {
                    args: Prisma.GrauPersonagemBaseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>[];
                };
                create: {
                    args: Prisma.GrauPersonagemBaseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                createMany: {
                    args: Prisma.GrauPersonagemBaseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.GrauPersonagemBaseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                update: {
                    args: Prisma.GrauPersonagemBaseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                deleteMany: {
                    args: Prisma.GrauPersonagemBaseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GrauPersonagemBaseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.GrauPersonagemBaseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemBasePayload>;
                };
                aggregate: {
                    args: Prisma.GrauPersonagemBaseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGrauPersonagemBase>;
                };
                groupBy: {
                    args: Prisma.GrauPersonagemBaseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrauPersonagemBaseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GrauPersonagemBaseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrauPersonagemBaseCountAggregateOutputType> | number;
                };
            };
        };
        GrauPersonagemCampanha: {
            payload: Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>;
            fields: Prisma.GrauPersonagemCampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GrauPersonagemCampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GrauPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.GrauPersonagemCampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GrauPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                findMany: {
                    args: Prisma.GrauPersonagemCampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>[];
                };
                create: {
                    args: Prisma.GrauPersonagemCampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                createMany: {
                    args: Prisma.GrauPersonagemCampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.GrauPersonagemCampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                update: {
                    args: Prisma.GrauPersonagemCampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.GrauPersonagemCampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GrauPersonagemCampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.GrauPersonagemCampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrauPersonagemCampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.GrauPersonagemCampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGrauPersonagemCampanha>;
                };
                groupBy: {
                    args: Prisma.GrauPersonagemCampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrauPersonagemCampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GrauPersonagemCampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrauPersonagemCampanhaCountAggregateOutputType> | number;
                };
            };
        };
        HabilidadeClasse: {
            payload: Prisma.$HabilidadeClassePayload<ExtArgs>;
            fields: Prisma.HabilidadeClasseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadeClasseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadeClasseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadeClasseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadeClasseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                findMany: {
                    args: Prisma.HabilidadeClasseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>[];
                };
                create: {
                    args: Prisma.HabilidadeClasseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                createMany: {
                    args: Prisma.HabilidadeClasseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadeClasseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                update: {
                    args: Prisma.HabilidadeClasseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadeClasseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadeClasseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadeClasseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeClassePayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadeClasseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidadeClasse>;
                };
                groupBy: {
                    args: Prisma.HabilidadeClasseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeClasseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadeClasseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeClasseCountAggregateOutputType> | number;
                };
            };
        };
        HabilidadeTrilha: {
            payload: Prisma.$HabilidadeTrilhaPayload<ExtArgs>;
            fields: Prisma.HabilidadeTrilhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadeTrilhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadeTrilhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadeTrilhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadeTrilhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                findMany: {
                    args: Prisma.HabilidadeTrilhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>[];
                };
                create: {
                    args: Prisma.HabilidadeTrilhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                createMany: {
                    args: Prisma.HabilidadeTrilhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadeTrilhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                update: {
                    args: Prisma.HabilidadeTrilhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadeTrilhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadeTrilhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadeTrilhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeTrilhaPayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadeTrilhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidadeTrilha>;
                };
                groupBy: {
                    args: Prisma.HabilidadeTrilhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeTrilhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadeTrilhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeTrilhaCountAggregateOutputType> | number;
                };
            };
        };
        HabilidadeOrigem: {
            payload: Prisma.$HabilidadeOrigemPayload<ExtArgs>;
            fields: Prisma.HabilidadeOrigemFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabilidadeOrigemFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabilidadeOrigemFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                findFirst: {
                    args: Prisma.HabilidadeOrigemFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabilidadeOrigemFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                findMany: {
                    args: Prisma.HabilidadeOrigemFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>[];
                };
                create: {
                    args: Prisma.HabilidadeOrigemCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                createMany: {
                    args: Prisma.HabilidadeOrigemCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.HabilidadeOrigemDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                update: {
                    args: Prisma.HabilidadeOrigemUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                deleteMany: {
                    args: Prisma.HabilidadeOrigemDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabilidadeOrigemUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.HabilidadeOrigemUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabilidadeOrigemPayload>;
                };
                aggregate: {
                    args: Prisma.HabilidadeOrigemAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabilidadeOrigem>;
                };
                groupBy: {
                    args: Prisma.HabilidadeOrigemGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeOrigemGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabilidadeOrigemCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabilidadeOrigemCountAggregateOutputType> | number;
                };
            };
        };
        Item: {
            payload: Prisma.$ItemPayload<ExtArgs>;
            fields: Prisma.ItemFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ItemFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ItemFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                findFirst: {
                    args: Prisma.ItemFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ItemFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                findMany: {
                    args: Prisma.ItemFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>[];
                };
                create: {
                    args: Prisma.ItemCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                createMany: {
                    args: Prisma.ItemCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.ItemDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                update: {
                    args: Prisma.ItemUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                deleteMany: {
                    args: Prisma.ItemDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ItemUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.ItemUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPayload>;
                };
                aggregate: {
                    args: Prisma.ItemAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateItem>;
                };
                groupBy: {
                    args: Prisma.ItemGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ItemGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ItemCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ItemCountAggregateOutputType> | number;
                };
            };
        };
        ItemPersonagemCampanha: {
            payload: Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>;
            fields: Prisma.ItemPersonagemCampanhaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ItemPersonagemCampanhaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ItemPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                findFirst: {
                    args: Prisma.ItemPersonagemCampanhaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ItemPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                findMany: {
                    args: Prisma.ItemPersonagemCampanhaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>[];
                };
                create: {
                    args: Prisma.ItemPersonagemCampanhaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                createMany: {
                    args: Prisma.ItemPersonagemCampanhaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.ItemPersonagemCampanhaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                update: {
                    args: Prisma.ItemPersonagemCampanhaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                deleteMany: {
                    args: Prisma.ItemPersonagemCampanhaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ItemPersonagemCampanhaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.ItemPersonagemCampanhaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ItemPersonagemCampanhaPayload>;
                };
                aggregate: {
                    args: Prisma.ItemPersonagemCampanhaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateItemPersonagemCampanha>;
                };
                groupBy: {
                    args: Prisma.ItemPersonagemCampanhaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ItemPersonagemCampanhaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ItemPersonagemCampanhaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ItemPersonagemCampanhaCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type BatchPayload = {
    count: number;
};
export type Datasource = {
    url?: string;
};
export type Datasources = {
    db?: Datasource;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientOptions {
    datasources?: Datasources;
    datasourceUrl?: string;
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    adapter?: runtime.SqlDriverAdapterFactory | null;
    omit?: GlobalOmitConfig;
}
export type GlobalOmitConfig = {
    usuario?: Prisma.UsuarioOmit;
    campanha?: Prisma.CampanhaOmit;
    membroCampanha?: Prisma.MembroCampanhaOmit;
    personagemBase?: Prisma.PersonagemBaseOmit;
    personagemCampanha?: Prisma.PersonagemCampanhaOmit;
    sessao?: Prisma.SessaoOmit;
    cena?: Prisma.CenaOmit;
    personagemSessao?: Prisma.PersonagemSessaoOmit;
    condicao?: Prisma.CondicaoOmit;
    condicaoPersonagemSessao?: Prisma.CondicaoPersonagemSessaoOmit;
    eventoSessao?: Prisma.EventoSessaoOmit;
    classe?: Prisma.ClasseOmit;
    trilha?: Prisma.TrilhaOmit;
    caminho?: Prisma.CaminhoOmit;
    cla?: Prisma.ClaOmit;
    origem?: Prisma.OrigemOmit;
    habilidade?: Prisma.HabilidadeOmit;
    habilidadePersonagemBase?: Prisma.HabilidadePersonagemBaseOmit;
    habilidadePersonagemCampanha?: Prisma.HabilidadePersonagemCampanhaOmit;
    tipoGrau?: Prisma.TipoGrauOmit;
    grauPersonagemBase?: Prisma.GrauPersonagemBaseOmit;
    grauPersonagemCampanha?: Prisma.GrauPersonagemCampanhaOmit;
    habilidadeClasse?: Prisma.HabilidadeClasseOmit;
    habilidadeTrilha?: Prisma.HabilidadeTrilhaOmit;
    habilidadeOrigem?: Prisma.HabilidadeOrigemOmit;
    item?: Prisma.ItemOmit;
    itemPersonagemCampanha?: Prisma.ItemPersonagemCampanhaOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
