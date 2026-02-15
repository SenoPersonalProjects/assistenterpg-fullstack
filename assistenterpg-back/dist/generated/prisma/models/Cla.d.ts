import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClaModel = runtime.Types.Result.DefaultSelection<Prisma.$ClaPayload>;
export type AggregateCla = {
    _count: ClaCountAggregateOutputType | null;
    _avg: ClaAvgAggregateOutputType | null;
    _sum: ClaSumAggregateOutputType | null;
    _min: ClaMinAggregateOutputType | null;
    _max: ClaMaxAggregateOutputType | null;
};
export type ClaAvgAggregateOutputType = {
    id: number | null;
};
export type ClaSumAggregateOutputType = {
    id: number | null;
};
export type ClaMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    grandeCla: boolean | null;
};
export type ClaMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    grandeCla: boolean | null;
};
export type ClaCountAggregateOutputType = {
    id: number;
    nome: number;
    descricao: number;
    grandeCla: number;
    _all: number;
};
export type ClaAvgAggregateInputType = {
    id?: true;
};
export type ClaSumAggregateInputType = {
    id?: true;
};
export type ClaMinAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    grandeCla?: true;
};
export type ClaMaxAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    grandeCla?: true;
};
export type ClaCountAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    grandeCla?: true;
    _all?: true;
};
export type ClaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClaWhereInput;
    orderBy?: Prisma.ClaOrderByWithRelationInput | Prisma.ClaOrderByWithRelationInput[];
    cursor?: Prisma.ClaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClaCountAggregateInputType;
    _avg?: ClaAvgAggregateInputType;
    _sum?: ClaSumAggregateInputType;
    _min?: ClaMinAggregateInputType;
    _max?: ClaMaxAggregateInputType;
};
export type GetClaAggregateType<T extends ClaAggregateArgs> = {
    [P in keyof T & keyof AggregateCla]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCla[P]> : Prisma.GetScalarType<T[P], AggregateCla[P]>;
};
export type ClaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClaWhereInput;
    orderBy?: Prisma.ClaOrderByWithAggregationInput | Prisma.ClaOrderByWithAggregationInput[];
    by: Prisma.ClaScalarFieldEnum[] | Prisma.ClaScalarFieldEnum;
    having?: Prisma.ClaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClaCountAggregateInputType | true;
    _avg?: ClaAvgAggregateInputType;
    _sum?: ClaSumAggregateInputType;
    _min?: ClaMinAggregateInputType;
    _max?: ClaMaxAggregateInputType;
};
export type ClaGroupByOutputType = {
    id: number;
    nome: string;
    descricao: string | null;
    grandeCla: boolean;
    _count: ClaCountAggregateOutputType | null;
    _avg: ClaAvgAggregateOutputType | null;
    _sum: ClaSumAggregateOutputType | null;
    _min: ClaMinAggregateOutputType | null;
    _max: ClaMaxAggregateOutputType | null;
};
type GetClaGroupByPayload<T extends ClaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClaGroupByOutputType[P]>;
}>>;
export type ClaWhereInput = {
    AND?: Prisma.ClaWhereInput | Prisma.ClaWhereInput[];
    OR?: Prisma.ClaWhereInput[];
    NOT?: Prisma.ClaWhereInput | Prisma.ClaWhereInput[];
    id?: Prisma.IntFilter<"Cla"> | number;
    nome?: Prisma.StringFilter<"Cla"> | string;
    descricao?: Prisma.StringNullableFilter<"Cla"> | string | null;
    grandeCla?: Prisma.BoolFilter<"Cla"> | boolean;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
};
export type ClaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    grandeCla?: Prisma.SortOrder;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.PersonagemCampanhaOrderByRelationAggregateInput;
    _relevance?: Prisma.ClaOrderByRelevanceInput;
};
export type ClaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ClaWhereInput | Prisma.ClaWhereInput[];
    OR?: Prisma.ClaWhereInput[];
    NOT?: Prisma.ClaWhereInput | Prisma.ClaWhereInput[];
    nome?: Prisma.StringFilter<"Cla"> | string;
    descricao?: Prisma.StringNullableFilter<"Cla"> | string | null;
    grandeCla?: Prisma.BoolFilter<"Cla"> | boolean;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
}, "id">;
export type ClaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    grandeCla?: Prisma.SortOrder;
    _count?: Prisma.ClaCountOrderByAggregateInput;
    _avg?: Prisma.ClaAvgOrderByAggregateInput;
    _max?: Prisma.ClaMaxOrderByAggregateInput;
    _min?: Prisma.ClaMinOrderByAggregateInput;
    _sum?: Prisma.ClaSumOrderByAggregateInput;
};
export type ClaScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClaScalarWhereWithAggregatesInput | Prisma.ClaScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClaScalarWhereWithAggregatesInput | Prisma.ClaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Cla"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Cla"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Cla"> | string | null;
    grandeCla?: Prisma.BoolWithAggregatesFilter<"Cla"> | boolean;
};
export type ClaCreateInput = {
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClaInput;
};
export type ClaUncheckedCreateInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClaInput;
};
export type ClaUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClaNestedInput;
};
export type ClaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClaNestedInput;
};
export type ClaCreateManyInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
};
export type ClaUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClaScalarRelationFilter = {
    is?: Prisma.ClaWhereInput;
    isNot?: Prisma.ClaWhereInput;
};
export type ClaOrderByRelevanceInput = {
    fields: Prisma.ClaOrderByRelevanceFieldEnum | Prisma.ClaOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type ClaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grandeCla?: Prisma.SortOrder;
};
export type ClaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ClaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grandeCla?: Prisma.SortOrder;
};
export type ClaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grandeCla?: Prisma.SortOrder;
};
export type ClaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ClaCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensBaseInput, Prisma.ClaUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.ClaCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.ClaWhereUniqueInput;
};
export type ClaUpdateOneRequiredWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensBaseInput, Prisma.ClaUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.ClaCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.ClaUpsertWithoutPersonagensBaseInput;
    connect?: Prisma.ClaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClaUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.ClaUpdateWithoutPersonagensBaseInput>, Prisma.ClaUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type ClaCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.ClaCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.ClaWhereUniqueInput;
};
export type ClaUpdateOneRequiredWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.ClaCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.ClaUpsertWithoutPersonagensCampanhaInput;
    connect?: Prisma.ClaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClaUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.ClaUpdateWithoutPersonagensCampanhaInput>, Prisma.ClaUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type ClaCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClaInput;
};
export type ClaUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClaInput;
};
export type ClaCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.ClaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensBaseInput, Prisma.ClaUncheckedCreateWithoutPersonagensBaseInput>;
};
export type ClaUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.ClaUpdateWithoutPersonagensBaseInput, Prisma.ClaUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensBaseInput, Prisma.ClaUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.ClaWhereInput;
};
export type ClaUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.ClaWhereInput;
    data: Prisma.XOR<Prisma.ClaUpdateWithoutPersonagensBaseInput, Prisma.ClaUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type ClaUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClaNestedInput;
};
export type ClaUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClaNestedInput;
};
export type ClaCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClaInput;
};
export type ClaUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    grandeCla?: boolean;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClaInput;
};
export type ClaCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.ClaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type ClaUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.ClaUpdateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.ClaCreateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.ClaWhereInput;
};
export type ClaUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.ClaWhereInput;
    data: Prisma.XOR<Prisma.ClaUpdateWithoutPersonagensCampanhaInput, Prisma.ClaUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type ClaUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClaNestedInput;
};
export type ClaUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grandeCla?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClaNestedInput;
};
export type ClaCountOutputType = {
    personagensBase: number;
    personagensCampanha: number;
};
export type ClaCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | ClaCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | ClaCountOutputTypeCountPersonagensCampanhaArgs;
};
export type ClaCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaCountOutputTypeSelect<ExtArgs> | null;
};
export type ClaCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type ClaCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemCampanhaWhereInput;
};
export type ClaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    grandeCla?: boolean;
    personagensBase?: boolean | Prisma.Cla$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Cla$personagensCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.ClaCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cla"]>;
export type ClaSelectScalar = {
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    grandeCla?: boolean;
};
export type ClaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "descricao" | "grandeCla", ExtArgs["result"]["cla"]>;
export type ClaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | Prisma.Cla$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Cla$personagensCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.ClaCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $ClaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Cla";
    objects: {
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        descricao: string | null;
        grandeCla: boolean;
    }, ExtArgs["result"]["cla"]>;
    composites: {};
};
export type ClaGetPayload<S extends boolean | null | undefined | ClaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClaPayload, S>;
export type ClaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClaCountAggregateInputType | true;
};
export interface ClaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Cla'];
        meta: {
            name: 'Cla';
        };
    };
    findUnique<T extends ClaFindUniqueArgs>(args: Prisma.SelectSubset<T, ClaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClaFindFirstArgs>(args?: Prisma.SelectSubset<T, ClaFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClaFindManyArgs>(args?: Prisma.SelectSubset<T, ClaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClaCreateArgs>(args: Prisma.SelectSubset<T, ClaCreateArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClaCreateManyArgs>(args?: Prisma.SelectSubset<T, ClaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends ClaDeleteArgs>(args: Prisma.SelectSubset<T, ClaDeleteArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClaUpdateArgs>(args: Prisma.SelectSubset<T, ClaUpdateArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClaDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClaUpdateManyArgs>(args: Prisma.SelectSubset<T, ClaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends ClaUpsertArgs>(args: Prisma.SelectSubset<T, ClaUpsertArgs<ExtArgs>>): Prisma.Prisma__ClaClient<runtime.Types.Result.GetResult<Prisma.$ClaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClaCountArgs>(args?: Prisma.Subset<T, ClaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClaCountAggregateOutputType> : number>;
    aggregate<T extends ClaAggregateArgs>(args: Prisma.Subset<T, ClaAggregateArgs>): Prisma.PrismaPromise<GetClaAggregateType<T>>;
    groupBy<T extends ClaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClaGroupByArgs['orderBy'];
    } : {
        orderBy?: ClaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClaFieldRefs;
}
export interface Prisma__ClaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagensBase<T extends Prisma.Cla$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cla$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Cla$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cla$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClaFieldRefs {
    readonly id: Prisma.FieldRef<"Cla", 'Int'>;
    readonly nome: Prisma.FieldRef<"Cla", 'String'>;
    readonly descricao: Prisma.FieldRef<"Cla", 'String'>;
    readonly grandeCla: Prisma.FieldRef<"Cla", 'Boolean'>;
}
export type ClaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where: Prisma.ClaWhereUniqueInput;
};
export type ClaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where: Prisma.ClaWhereUniqueInput;
};
export type ClaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where?: Prisma.ClaWhereInput;
    orderBy?: Prisma.ClaOrderByWithRelationInput | Prisma.ClaOrderByWithRelationInput[];
    cursor?: Prisma.ClaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClaScalarFieldEnum | Prisma.ClaScalarFieldEnum[];
};
export type ClaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where?: Prisma.ClaWhereInput;
    orderBy?: Prisma.ClaOrderByWithRelationInput | Prisma.ClaOrderByWithRelationInput[];
    cursor?: Prisma.ClaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClaScalarFieldEnum | Prisma.ClaScalarFieldEnum[];
};
export type ClaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where?: Prisma.ClaWhereInput;
    orderBy?: Prisma.ClaOrderByWithRelationInput | Prisma.ClaOrderByWithRelationInput[];
    cursor?: Prisma.ClaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClaScalarFieldEnum | Prisma.ClaScalarFieldEnum[];
};
export type ClaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClaCreateInput, Prisma.ClaUncheckedCreateInput>;
};
export type ClaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClaCreateManyInput | Prisma.ClaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClaUpdateInput, Prisma.ClaUncheckedUpdateInput>;
    where: Prisma.ClaWhereUniqueInput;
};
export type ClaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClaUpdateManyMutationInput, Prisma.ClaUncheckedUpdateManyInput>;
    where?: Prisma.ClaWhereInput;
    limit?: number;
};
export type ClaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where: Prisma.ClaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClaCreateInput, Prisma.ClaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClaUpdateInput, Prisma.ClaUncheckedUpdateInput>;
};
export type ClaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
    where: Prisma.ClaWhereUniqueInput;
};
export type ClaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClaWhereInput;
    limit?: number;
};
export type Cla$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.PersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.PersonagemBaseWhereInput;
    orderBy?: Prisma.PersonagemBaseOrderByWithRelationInput | Prisma.PersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonagemBaseScalarFieldEnum | Prisma.PersonagemBaseScalarFieldEnum[];
};
export type Cla$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.PersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.PersonagemCampanhaWhereInput;
    orderBy?: Prisma.PersonagemCampanhaOrderByWithRelationInput | Prisma.PersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonagemCampanhaScalarFieldEnum | Prisma.PersonagemCampanhaScalarFieldEnum[];
};
export type ClaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClaSelect<ExtArgs> | null;
    omit?: Prisma.ClaOmit<ExtArgs> | null;
    include?: Prisma.ClaInclude<ExtArgs> | null;
};
export {};
