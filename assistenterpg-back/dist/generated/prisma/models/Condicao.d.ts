import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CondicaoModel = runtime.Types.Result.DefaultSelection<Prisma.$CondicaoPayload>;
export type AggregateCondicao = {
    _count: CondicaoCountAggregateOutputType | null;
    _avg: CondicaoAvgAggregateOutputType | null;
    _sum: CondicaoSumAggregateOutputType | null;
    _min: CondicaoMinAggregateOutputType | null;
    _max: CondicaoMaxAggregateOutputType | null;
};
export type CondicaoAvgAggregateOutputType = {
    id: number | null;
};
export type CondicaoSumAggregateOutputType = {
    id: number | null;
};
export type CondicaoMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type CondicaoMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type CondicaoCountAggregateOutputType = {
    id: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type CondicaoAvgAggregateInputType = {
    id?: true;
};
export type CondicaoSumAggregateInputType = {
    id?: true;
};
export type CondicaoMinAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type CondicaoMaxAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type CondicaoCountAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type CondicaoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoWhereInput;
    orderBy?: Prisma.CondicaoOrderByWithRelationInput | Prisma.CondicaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CondicaoCountAggregateInputType;
    _avg?: CondicaoAvgAggregateInputType;
    _sum?: CondicaoSumAggregateInputType;
    _min?: CondicaoMinAggregateInputType;
    _max?: CondicaoMaxAggregateInputType;
};
export type GetCondicaoAggregateType<T extends CondicaoAggregateArgs> = {
    [P in keyof T & keyof AggregateCondicao]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCondicao[P]> : Prisma.GetScalarType<T[P], AggregateCondicao[P]>;
};
export type CondicaoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoWhereInput;
    orderBy?: Prisma.CondicaoOrderByWithAggregationInput | Prisma.CondicaoOrderByWithAggregationInput[];
    by: Prisma.CondicaoScalarFieldEnum[] | Prisma.CondicaoScalarFieldEnum;
    having?: Prisma.CondicaoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CondicaoCountAggregateInputType | true;
    _avg?: CondicaoAvgAggregateInputType;
    _sum?: CondicaoSumAggregateInputType;
    _min?: CondicaoMinAggregateInputType;
    _max?: CondicaoMaxAggregateInputType;
};
export type CondicaoGroupByOutputType = {
    id: number;
    nome: string;
    descricao: string;
    _count: CondicaoCountAggregateOutputType | null;
    _avg: CondicaoAvgAggregateOutputType | null;
    _sum: CondicaoSumAggregateOutputType | null;
    _min: CondicaoMinAggregateOutputType | null;
    _max: CondicaoMaxAggregateOutputType | null;
};
type GetCondicaoGroupByPayload<T extends CondicaoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CondicaoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CondicaoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CondicaoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CondicaoGroupByOutputType[P]>;
}>>;
export type CondicaoWhereInput = {
    AND?: Prisma.CondicaoWhereInput | Prisma.CondicaoWhereInput[];
    OR?: Prisma.CondicaoWhereInput[];
    NOT?: Prisma.CondicaoWhereInput | Prisma.CondicaoWhereInput[];
    id?: Prisma.IntFilter<"Condicao"> | number;
    nome?: Prisma.StringFilter<"Condicao"> | string;
    descricao?: Prisma.StringFilter<"Condicao"> | string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
};
export type CondicaoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoOrderByRelationAggregateInput;
    _relevance?: Prisma.CondicaoOrderByRelevanceInput;
};
export type CondicaoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    nome?: string;
    AND?: Prisma.CondicaoWhereInput | Prisma.CondicaoWhereInput[];
    OR?: Prisma.CondicaoWhereInput[];
    NOT?: Prisma.CondicaoWhereInput | Prisma.CondicaoWhereInput[];
    descricao?: Prisma.StringFilter<"Condicao"> | string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
}, "id" | "nome">;
export type CondicaoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    _count?: Prisma.CondicaoCountOrderByAggregateInput;
    _avg?: Prisma.CondicaoAvgOrderByAggregateInput;
    _max?: Prisma.CondicaoMaxOrderByAggregateInput;
    _min?: Prisma.CondicaoMinOrderByAggregateInput;
    _sum?: Prisma.CondicaoSumOrderByAggregateInput;
};
export type CondicaoScalarWhereWithAggregatesInput = {
    AND?: Prisma.CondicaoScalarWhereWithAggregatesInput | Prisma.CondicaoScalarWhereWithAggregatesInput[];
    OR?: Prisma.CondicaoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CondicaoScalarWhereWithAggregatesInput | Prisma.CondicaoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Condicao"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Condicao"> | string;
    descricao?: Prisma.StringWithAggregatesFilter<"Condicao"> | string;
};
export type CondicaoCreateInput = {
    nome: string;
    descricao: string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutCondicaoInput;
};
export type CondicaoUncheckedCreateInput = {
    id?: number;
    nome: string;
    descricao: string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCondicaoInput;
};
export type CondicaoUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutCondicaoNestedInput;
};
export type CondicaoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
    condicoesPersonagemSessao?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCondicaoNestedInput;
};
export type CondicaoCreateManyInput = {
    id?: number;
    nome: string;
    descricao: string;
};
export type CondicaoUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CondicaoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CondicaoOrderByRelevanceInput = {
    fields: Prisma.CondicaoOrderByRelevanceFieldEnum | Prisma.CondicaoOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type CondicaoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CondicaoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type CondicaoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CondicaoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CondicaoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type CondicaoScalarRelationFilter = {
    is?: Prisma.CondicaoWhereInput;
    isNot?: Prisma.CondicaoWhereInput;
};
export type CondicaoCreateNestedOneWithoutCondicoesPersonagemSessaoInput = {
    create?: Prisma.XOR<Prisma.CondicaoCreateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedCreateWithoutCondicoesPersonagemSessaoInput>;
    connectOrCreate?: Prisma.CondicaoCreateOrConnectWithoutCondicoesPersonagemSessaoInput;
    connect?: Prisma.CondicaoWhereUniqueInput;
};
export type CondicaoUpdateOneRequiredWithoutCondicoesPersonagemSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoCreateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedCreateWithoutCondicoesPersonagemSessaoInput>;
    connectOrCreate?: Prisma.CondicaoCreateOrConnectWithoutCondicoesPersonagemSessaoInput;
    upsert?: Prisma.CondicaoUpsertWithoutCondicoesPersonagemSessaoInput;
    connect?: Prisma.CondicaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CondicaoUpdateToOneWithWhereWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUpdateWithoutCondicoesPersonagemSessaoInput>, Prisma.CondicaoUncheckedUpdateWithoutCondicoesPersonagemSessaoInput>;
};
export type CondicaoCreateWithoutCondicoesPersonagemSessaoInput = {
    nome: string;
    descricao: string;
};
export type CondicaoUncheckedCreateWithoutCondicoesPersonagemSessaoInput = {
    id?: number;
    nome: string;
    descricao: string;
};
export type CondicaoCreateOrConnectWithoutCondicoesPersonagemSessaoInput = {
    where: Prisma.CondicaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoCreateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedCreateWithoutCondicoesPersonagemSessaoInput>;
};
export type CondicaoUpsertWithoutCondicoesPersonagemSessaoInput = {
    update: Prisma.XOR<Prisma.CondicaoUpdateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedUpdateWithoutCondicoesPersonagemSessaoInput>;
    create: Prisma.XOR<Prisma.CondicaoCreateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedCreateWithoutCondicoesPersonagemSessaoInput>;
    where?: Prisma.CondicaoWhereInput;
};
export type CondicaoUpdateToOneWithWhereWithoutCondicoesPersonagemSessaoInput = {
    where?: Prisma.CondicaoWhereInput;
    data: Prisma.XOR<Prisma.CondicaoUpdateWithoutCondicoesPersonagemSessaoInput, Prisma.CondicaoUncheckedUpdateWithoutCondicoesPersonagemSessaoInput>;
};
export type CondicaoUpdateWithoutCondicoesPersonagemSessaoInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CondicaoUncheckedUpdateWithoutCondicoesPersonagemSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CondicaoCountOutputType = {
    condicoesPersonagemSessao: number;
};
export type CondicaoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    condicoesPersonagemSessao?: boolean | CondicaoCountOutputTypeCountCondicoesPersonagemSessaoArgs;
};
export type CondicaoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoCountOutputTypeSelect<ExtArgs> | null;
};
export type CondicaoCountOutputTypeCountCondicoesPersonagemSessaoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
};
export type CondicaoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    condicoesPersonagemSessao?: boolean | Prisma.Condicao$condicoesPersonagemSessaoArgs<ExtArgs>;
    _count?: boolean | Prisma.CondicaoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["condicao"]>;
export type CondicaoSelectScalar = {
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type CondicaoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "descricao", ExtArgs["result"]["condicao"]>;
export type CondicaoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    condicoesPersonagemSessao?: boolean | Prisma.Condicao$condicoesPersonagemSessaoArgs<ExtArgs>;
    _count?: boolean | Prisma.CondicaoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $CondicaoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Condicao";
    objects: {
        condicoesPersonagemSessao: Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        descricao: string;
    }, ExtArgs["result"]["condicao"]>;
    composites: {};
};
export type CondicaoGetPayload<S extends boolean | null | undefined | CondicaoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CondicaoPayload, S>;
export type CondicaoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CondicaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CondicaoCountAggregateInputType | true;
};
export interface CondicaoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Condicao'];
        meta: {
            name: 'Condicao';
        };
    };
    findUnique<T extends CondicaoFindUniqueArgs>(args: Prisma.SelectSubset<T, CondicaoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CondicaoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CondicaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CondicaoFindFirstArgs>(args?: Prisma.SelectSubset<T, CondicaoFindFirstArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CondicaoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CondicaoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CondicaoFindManyArgs>(args?: Prisma.SelectSubset<T, CondicaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CondicaoCreateArgs>(args: Prisma.SelectSubset<T, CondicaoCreateArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CondicaoCreateManyArgs>(args?: Prisma.SelectSubset<T, CondicaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends CondicaoDeleteArgs>(args: Prisma.SelectSubset<T, CondicaoDeleteArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CondicaoUpdateArgs>(args: Prisma.SelectSubset<T, CondicaoUpdateArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CondicaoDeleteManyArgs>(args?: Prisma.SelectSubset<T, CondicaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CondicaoUpdateManyArgs>(args: Prisma.SelectSubset<T, CondicaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends CondicaoUpsertArgs>(args: Prisma.SelectSubset<T, CondicaoUpsertArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CondicaoCountArgs>(args?: Prisma.Subset<T, CondicaoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CondicaoCountAggregateOutputType> : number>;
    aggregate<T extends CondicaoAggregateArgs>(args: Prisma.Subset<T, CondicaoAggregateArgs>): Prisma.PrismaPromise<GetCondicaoAggregateType<T>>;
    groupBy<T extends CondicaoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CondicaoGroupByArgs['orderBy'];
    } : {
        orderBy?: CondicaoGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CondicaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCondicaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CondicaoFieldRefs;
}
export interface Prisma__CondicaoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    condicoesPersonagemSessao<T extends Prisma.Condicao$condicoesPersonagemSessaoArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Condicao$condicoesPersonagemSessaoArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CondicaoFieldRefs {
    readonly id: Prisma.FieldRef<"Condicao", 'Int'>;
    readonly nome: Prisma.FieldRef<"Condicao", 'String'>;
    readonly descricao: Prisma.FieldRef<"Condicao", 'String'>;
}
export type CondicaoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoWhereUniqueInput;
};
export type CondicaoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoWhereUniqueInput;
};
export type CondicaoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where?: Prisma.CondicaoWhereInput;
    orderBy?: Prisma.CondicaoOrderByWithRelationInput | Prisma.CondicaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CondicaoScalarFieldEnum | Prisma.CondicaoScalarFieldEnum[];
};
export type CondicaoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where?: Prisma.CondicaoWhereInput;
    orderBy?: Prisma.CondicaoOrderByWithRelationInput | Prisma.CondicaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CondicaoScalarFieldEnum | Prisma.CondicaoScalarFieldEnum[];
};
export type CondicaoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where?: Prisma.CondicaoWhereInput;
    orderBy?: Prisma.CondicaoOrderByWithRelationInput | Prisma.CondicaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CondicaoScalarFieldEnum | Prisma.CondicaoScalarFieldEnum[];
};
export type CondicaoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CondicaoCreateInput, Prisma.CondicaoUncheckedCreateInput>;
};
export type CondicaoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CondicaoCreateManyInput | Prisma.CondicaoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CondicaoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CondicaoUpdateInput, Prisma.CondicaoUncheckedUpdateInput>;
    where: Prisma.CondicaoWhereUniqueInput;
};
export type CondicaoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CondicaoUpdateManyMutationInput, Prisma.CondicaoUncheckedUpdateManyInput>;
    where?: Prisma.CondicaoWhereInput;
    limit?: number;
};
export type CondicaoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoCreateInput, Prisma.CondicaoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CondicaoUpdateInput, Prisma.CondicaoUncheckedUpdateInput>;
};
export type CondicaoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoWhereUniqueInput;
};
export type CondicaoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoWhereInput;
    limit?: number;
};
export type Condicao$condicoesPersonagemSessaoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    orderBy?: Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput | Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CondicaoPersonagemSessaoScalarFieldEnum | Prisma.CondicaoPersonagemSessaoScalarFieldEnum[];
};
export type CondicaoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoInclude<ExtArgs> | null;
};
export {};
