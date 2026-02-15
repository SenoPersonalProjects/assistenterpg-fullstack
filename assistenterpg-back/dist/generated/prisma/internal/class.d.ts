import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options?: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = Prisma.PrismaClientOptions['omit'], in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    $connect(): runtime.Types.Utils.JsPromise<void>;
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    get usuario(): Prisma.UsuarioDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get campanha(): Prisma.CampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get membroCampanha(): Prisma.MembroCampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get personagemBase(): Prisma.PersonagemBaseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get personagemCampanha(): Prisma.PersonagemCampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get sessao(): Prisma.SessaoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get cena(): Prisma.CenaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get personagemSessao(): Prisma.PersonagemSessaoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get condicao(): Prisma.CondicaoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get condicaoPersonagemSessao(): Prisma.CondicaoPersonagemSessaoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get eventoSessao(): Prisma.EventoSessaoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get classe(): Prisma.ClasseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get trilha(): Prisma.TrilhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get caminho(): Prisma.CaminhoDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get cla(): Prisma.ClaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get origem(): Prisma.OrigemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidade(): Prisma.HabilidadeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidadePersonagemBase(): Prisma.HabilidadePersonagemBaseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidadePersonagemCampanha(): Prisma.HabilidadePersonagemCampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tipoGrau(): Prisma.TipoGrauDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get grauPersonagemBase(): Prisma.GrauPersonagemBaseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get grauPersonagemCampanha(): Prisma.GrauPersonagemCampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidadeClasse(): Prisma.HabilidadeClasseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidadeTrilha(): Prisma.HabilidadeTrilhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get habilidadeOrigem(): Prisma.HabilidadeOrigemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get item(): Prisma.ItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get itemPersonagemCampanha(): Prisma.ItemPersonagemCampanhaDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(dirname: string): PrismaClientConstructor;
