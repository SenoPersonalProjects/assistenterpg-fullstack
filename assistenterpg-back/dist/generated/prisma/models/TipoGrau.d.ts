import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TipoGrauModel = runtime.Types.Result.DefaultSelection<Prisma.$TipoGrauPayload>;
export type AggregateTipoGrau = {
    _count: TipoGrauCountAggregateOutputType | null;
    _avg: TipoGrauAvgAggregateOutputType | null;
    _sum: TipoGrauSumAggregateOutputType | null;
    _min: TipoGrauMinAggregateOutputType | null;
    _max: TipoGrauMaxAggregateOutputType | null;
};
export type TipoGrauAvgAggregateOutputType = {
    id: number | null;
};
export type TipoGrauSumAggregateOutputType = {
    id: number | null;
};
export type TipoGrauMinAggregateOutputType = {
    id: number | null;
    codigo: string | null;
    nome: string | null;
    descricao: string | null;
};
export type TipoGrauMaxAggregateOutputType = {
    id: number | null;
    codigo: string | null;
    nome: string | null;
    descricao: string | null;
};
export type TipoGrauCountAggregateOutputType = {
    id: number;
    codigo: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type TipoGrauAvgAggregateInputType = {
    id?: true;
};
export type TipoGrauSumAggregateInputType = {
    id?: true;
};
export type TipoGrauMinAggregateInputType = {
    id?: true;
    codigo?: true;
    nome?: true;
    descricao?: true;
};
export type TipoGrauMaxAggregateInputType = {
    id?: true;
    codigo?: true;
    nome?: true;
    descricao?: true;
};
export type TipoGrauCountAggregateInputType = {
    id?: true;
    codigo?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type TipoGrauAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoGrauWhereInput;
    orderBy?: Prisma.TipoGrauOrderByWithRelationInput | Prisma.TipoGrauOrderByWithRelationInput[];
    cursor?: Prisma.TipoGrauWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TipoGrauCountAggregateInputType;
    _avg?: TipoGrauAvgAggregateInputType;
    _sum?: TipoGrauSumAggregateInputType;
    _min?: TipoGrauMinAggregateInputType;
    _max?: TipoGrauMaxAggregateInputType;
};
export type GetTipoGrauAggregateType<T extends TipoGrauAggregateArgs> = {
    [P in keyof T & keyof AggregateTipoGrau]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTipoGrau[P]> : Prisma.GetScalarType<T[P], AggregateTipoGrau[P]>;
};
export type TipoGrauGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoGrauWhereInput;
    orderBy?: Prisma.TipoGrauOrderByWithAggregationInput | Prisma.TipoGrauOrderByWithAggregationInput[];
    by: Prisma.TipoGrauScalarFieldEnum[] | Prisma.TipoGrauScalarFieldEnum;
    having?: Prisma.TipoGrauScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TipoGrauCountAggregateInputType | true;
    _avg?: TipoGrauAvgAggregateInputType;
    _sum?: TipoGrauSumAggregateInputType;
    _min?: TipoGrauMinAggregateInputType;
    _max?: TipoGrauMaxAggregateInputType;
};
export type TipoGrauGroupByOutputType = {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    _count: TipoGrauCountAggregateOutputType | null;
    _avg: TipoGrauAvgAggregateOutputType | null;
    _sum: TipoGrauSumAggregateOutputType | null;
    _min: TipoGrauMinAggregateOutputType | null;
    _max: TipoGrauMaxAggregateOutputType | null;
};
type GetTipoGrauGroupByPayload<T extends TipoGrauGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TipoGrauGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TipoGrauGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TipoGrauGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TipoGrauGroupByOutputType[P]>;
}>>;
export type TipoGrauWhereInput = {
    AND?: Prisma.TipoGrauWhereInput | Prisma.TipoGrauWhereInput[];
    OR?: Prisma.TipoGrauWhereInput[];
    NOT?: Prisma.TipoGrauWhereInput | Prisma.TipoGrauWhereInput[];
    id?: Prisma.IntFilter<"TipoGrau"> | number;
    codigo?: Prisma.StringFilter<"TipoGrau"> | string;
    nome?: Prisma.StringFilter<"TipoGrau"> | string;
    descricao?: Prisma.StringNullableFilter<"TipoGrau"> | string | null;
    grausBase?: Prisma.GrauPersonagemBaseListRelationFilter;
    grausCampanha?: Prisma.GrauPersonagemCampanhaListRelationFilter;
};
export type TipoGrauOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    grausBase?: Prisma.GrauPersonagemBaseOrderByRelationAggregateInput;
    grausCampanha?: Prisma.GrauPersonagemCampanhaOrderByRelationAggregateInput;
    _relevance?: Prisma.TipoGrauOrderByRelevanceInput;
};
export type TipoGrauWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    codigo?: string;
    AND?: Prisma.TipoGrauWhereInput | Prisma.TipoGrauWhereInput[];
    OR?: Prisma.TipoGrauWhereInput[];
    NOT?: Prisma.TipoGrauWhereInput | Prisma.TipoGrauWhereInput[];
    nome?: Prisma.StringFilter<"TipoGrau"> | string;
    descricao?: Prisma.StringNullableFilter<"TipoGrau"> | string | null;
    grausBase?: Prisma.GrauPersonagemBaseListRelationFilter;
    grausCampanha?: Prisma.GrauPersonagemCampanhaListRelationFilter;
}, "id" | "codigo">;
export type TipoGrauOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.TipoGrauCountOrderByAggregateInput;
    _avg?: Prisma.TipoGrauAvgOrderByAggregateInput;
    _max?: Prisma.TipoGrauMaxOrderByAggregateInput;
    _min?: Prisma.TipoGrauMinOrderByAggregateInput;
    _sum?: Prisma.TipoGrauSumOrderByAggregateInput;
};
export type TipoGrauScalarWhereWithAggregatesInput = {
    AND?: Prisma.TipoGrauScalarWhereWithAggregatesInput | Prisma.TipoGrauScalarWhereWithAggregatesInput[];
    OR?: Prisma.TipoGrauScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TipoGrauScalarWhereWithAggregatesInput | Prisma.TipoGrauScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TipoGrau"> | number;
    codigo?: Prisma.StringWithAggregatesFilter<"TipoGrau"> | string;
    nome?: Prisma.StringWithAggregatesFilter<"TipoGrau"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"TipoGrau"> | string | null;
};
export type TipoGrauCreateInput = {
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausBase?: Prisma.GrauPersonagemBaseCreateNestedManyWithoutTipoGrauInput;
    grausCampanha?: Prisma.GrauPersonagemCampanhaCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauUncheckedCreateInput = {
    id?: number;
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausBase?: Prisma.GrauPersonagemBaseUncheckedCreateNestedManyWithoutTipoGrauInput;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUncheckedCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauUpdateInput = {
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausBase?: Prisma.GrauPersonagemBaseUpdateManyWithoutTipoGrauNestedInput;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausBase?: Prisma.GrauPersonagemBaseUncheckedUpdateManyWithoutTipoGrauNestedInput;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUncheckedUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauCreateManyInput = {
    id?: number;
    codigo: string;
    nome: string;
    descricao?: string | null;
};
export type TipoGrauUpdateManyMutationInput = {
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type TipoGrauUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type TipoGrauOrderByRelevanceInput = {
    fields: Prisma.TipoGrauOrderByRelevanceFieldEnum | Prisma.TipoGrauOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type TipoGrauCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TipoGrauAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TipoGrauMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TipoGrauMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TipoGrauSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TipoGrauScalarRelationFilter = {
    is?: Prisma.TipoGrauWhereInput;
    isNot?: Prisma.TipoGrauWhereInput;
};
export type TipoGrauCreateNestedOneWithoutGrausBaseInput = {
    create?: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedCreateWithoutGrausBaseInput>;
    connectOrCreate?: Prisma.TipoGrauCreateOrConnectWithoutGrausBaseInput;
    connect?: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauUpdateOneRequiredWithoutGrausBaseNestedInput = {
    create?: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedCreateWithoutGrausBaseInput>;
    connectOrCreate?: Prisma.TipoGrauCreateOrConnectWithoutGrausBaseInput;
    upsert?: Prisma.TipoGrauUpsertWithoutGrausBaseInput;
    connect?: Prisma.TipoGrauWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TipoGrauUpdateToOneWithWhereWithoutGrausBaseInput, Prisma.TipoGrauUpdateWithoutGrausBaseInput>, Prisma.TipoGrauUncheckedUpdateWithoutGrausBaseInput>;
};
export type TipoGrauCreateNestedOneWithoutGrausCampanhaInput = {
    create?: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedCreateWithoutGrausCampanhaInput>;
    connectOrCreate?: Prisma.TipoGrauCreateOrConnectWithoutGrausCampanhaInput;
    connect?: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauUpdateOneRequiredWithoutGrausCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedCreateWithoutGrausCampanhaInput>;
    connectOrCreate?: Prisma.TipoGrauCreateOrConnectWithoutGrausCampanhaInput;
    upsert?: Prisma.TipoGrauUpsertWithoutGrausCampanhaInput;
    connect?: Prisma.TipoGrauWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TipoGrauUpdateToOneWithWhereWithoutGrausCampanhaInput, Prisma.TipoGrauUpdateWithoutGrausCampanhaInput>, Prisma.TipoGrauUncheckedUpdateWithoutGrausCampanhaInput>;
};
export type TipoGrauCreateWithoutGrausBaseInput = {
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausCampanha?: Prisma.GrauPersonagemCampanhaCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauUncheckedCreateWithoutGrausBaseInput = {
    id?: number;
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUncheckedCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauCreateOrConnectWithoutGrausBaseInput = {
    where: Prisma.TipoGrauWhereUniqueInput;
    create: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedCreateWithoutGrausBaseInput>;
};
export type TipoGrauUpsertWithoutGrausBaseInput = {
    update: Prisma.XOR<Prisma.TipoGrauUpdateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedUpdateWithoutGrausBaseInput>;
    create: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedCreateWithoutGrausBaseInput>;
    where?: Prisma.TipoGrauWhereInput;
};
export type TipoGrauUpdateToOneWithWhereWithoutGrausBaseInput = {
    where?: Prisma.TipoGrauWhereInput;
    data: Prisma.XOR<Prisma.TipoGrauUpdateWithoutGrausBaseInput, Prisma.TipoGrauUncheckedUpdateWithoutGrausBaseInput>;
};
export type TipoGrauUpdateWithoutGrausBaseInput = {
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauUncheckedUpdateWithoutGrausBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausCampanha?: Prisma.GrauPersonagemCampanhaUncheckedUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauCreateWithoutGrausCampanhaInput = {
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausBase?: Prisma.GrauPersonagemBaseCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauUncheckedCreateWithoutGrausCampanhaInput = {
    id?: number;
    codigo: string;
    nome: string;
    descricao?: string | null;
    grausBase?: Prisma.GrauPersonagemBaseUncheckedCreateNestedManyWithoutTipoGrauInput;
};
export type TipoGrauCreateOrConnectWithoutGrausCampanhaInput = {
    where: Prisma.TipoGrauWhereUniqueInput;
    create: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedCreateWithoutGrausCampanhaInput>;
};
export type TipoGrauUpsertWithoutGrausCampanhaInput = {
    update: Prisma.XOR<Prisma.TipoGrauUpdateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedUpdateWithoutGrausCampanhaInput>;
    create: Prisma.XOR<Prisma.TipoGrauCreateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedCreateWithoutGrausCampanhaInput>;
    where?: Prisma.TipoGrauWhereInput;
};
export type TipoGrauUpdateToOneWithWhereWithoutGrausCampanhaInput = {
    where?: Prisma.TipoGrauWhereInput;
    data: Prisma.XOR<Prisma.TipoGrauUpdateWithoutGrausCampanhaInput, Prisma.TipoGrauUncheckedUpdateWithoutGrausCampanhaInput>;
};
export type TipoGrauUpdateWithoutGrausCampanhaInput = {
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausBase?: Prisma.GrauPersonagemBaseUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauUncheckedUpdateWithoutGrausCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grausBase?: Prisma.GrauPersonagemBaseUncheckedUpdateManyWithoutTipoGrauNestedInput;
};
export type TipoGrauCountOutputType = {
    grausBase: number;
    grausCampanha: number;
};
export type TipoGrauCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    grausBase?: boolean | TipoGrauCountOutputTypeCountGrausBaseArgs;
    grausCampanha?: boolean | TipoGrauCountOutputTypeCountGrausCampanhaArgs;
};
export type TipoGrauCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauCountOutputTypeSelect<ExtArgs> | null;
};
export type TipoGrauCountOutputTypeCountGrausBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemBaseWhereInput;
};
export type TipoGrauCountOutputTypeCountGrausCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
};
export type TipoGrauSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    codigo?: boolean;
    nome?: boolean;
    descricao?: boolean;
    grausBase?: boolean | Prisma.TipoGrau$grausBaseArgs<ExtArgs>;
    grausCampanha?: boolean | Prisma.TipoGrau$grausCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.TipoGrauCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tipoGrau"]>;
export type TipoGrauSelectScalar = {
    id?: boolean;
    codigo?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type TipoGrauOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "codigo" | "nome" | "descricao", ExtArgs["result"]["tipoGrau"]>;
export type TipoGrauInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    grausBase?: boolean | Prisma.TipoGrau$grausBaseArgs<ExtArgs>;
    grausCampanha?: boolean | Prisma.TipoGrau$grausCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.TipoGrauCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $TipoGrauPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TipoGrau";
    objects: {
        grausBase: Prisma.$GrauPersonagemBasePayload<ExtArgs>[];
        grausCampanha: Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        codigo: string;
        nome: string;
        descricao: string | null;
    }, ExtArgs["result"]["tipoGrau"]>;
    composites: {};
};
export type TipoGrauGetPayload<S extends boolean | null | undefined | TipoGrauDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload, S>;
export type TipoGrauCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TipoGrauFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TipoGrauCountAggregateInputType | true;
};
export interface TipoGrauDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TipoGrau'];
        meta: {
            name: 'TipoGrau';
        };
    };
    findUnique<T extends TipoGrauFindUniqueArgs>(args: Prisma.SelectSubset<T, TipoGrauFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TipoGrauFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TipoGrauFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TipoGrauFindFirstArgs>(args?: Prisma.SelectSubset<T, TipoGrauFindFirstArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TipoGrauFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TipoGrauFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TipoGrauFindManyArgs>(args?: Prisma.SelectSubset<T, TipoGrauFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TipoGrauCreateArgs>(args: Prisma.SelectSubset<T, TipoGrauCreateArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TipoGrauCreateManyArgs>(args?: Prisma.SelectSubset<T, TipoGrauCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends TipoGrauDeleteArgs>(args: Prisma.SelectSubset<T, TipoGrauDeleteArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TipoGrauUpdateArgs>(args: Prisma.SelectSubset<T, TipoGrauUpdateArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TipoGrauDeleteManyArgs>(args?: Prisma.SelectSubset<T, TipoGrauDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TipoGrauUpdateManyArgs>(args: Prisma.SelectSubset<T, TipoGrauUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends TipoGrauUpsertArgs>(args: Prisma.SelectSubset<T, TipoGrauUpsertArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TipoGrauCountArgs>(args?: Prisma.Subset<T, TipoGrauCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TipoGrauCountAggregateOutputType> : number>;
    aggregate<T extends TipoGrauAggregateArgs>(args: Prisma.Subset<T, TipoGrauAggregateArgs>): Prisma.PrismaPromise<GetTipoGrauAggregateType<T>>;
    groupBy<T extends TipoGrauGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TipoGrauGroupByArgs['orderBy'];
    } : {
        orderBy?: TipoGrauGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TipoGrauGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTipoGrauGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TipoGrauFieldRefs;
}
export interface Prisma__TipoGrauClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    grausBase<T extends Prisma.TipoGrau$grausBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoGrau$grausBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    grausCampanha<T extends Prisma.TipoGrau$grausCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoGrau$grausCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TipoGrauFieldRefs {
    readonly id: Prisma.FieldRef<"TipoGrau", 'Int'>;
    readonly codigo: Prisma.FieldRef<"TipoGrau", 'String'>;
    readonly nome: Prisma.FieldRef<"TipoGrau", 'String'>;
    readonly descricao: Prisma.FieldRef<"TipoGrau", 'String'>;
}
export type TipoGrauFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where?: Prisma.TipoGrauWhereInput;
    orderBy?: Prisma.TipoGrauOrderByWithRelationInput | Prisma.TipoGrauOrderByWithRelationInput[];
    cursor?: Prisma.TipoGrauWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoGrauScalarFieldEnum | Prisma.TipoGrauScalarFieldEnum[];
};
export type TipoGrauFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where?: Prisma.TipoGrauWhereInput;
    orderBy?: Prisma.TipoGrauOrderByWithRelationInput | Prisma.TipoGrauOrderByWithRelationInput[];
    cursor?: Prisma.TipoGrauWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoGrauScalarFieldEnum | Prisma.TipoGrauScalarFieldEnum[];
};
export type TipoGrauFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where?: Prisma.TipoGrauWhereInput;
    orderBy?: Prisma.TipoGrauOrderByWithRelationInput | Prisma.TipoGrauOrderByWithRelationInput[];
    cursor?: Prisma.TipoGrauWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoGrauScalarFieldEnum | Prisma.TipoGrauScalarFieldEnum[];
};
export type TipoGrauCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TipoGrauCreateInput, Prisma.TipoGrauUncheckedCreateInput>;
};
export type TipoGrauCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TipoGrauCreateManyInput | Prisma.TipoGrauCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TipoGrauUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TipoGrauUpdateInput, Prisma.TipoGrauUncheckedUpdateInput>;
    where: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TipoGrauUpdateManyMutationInput, Prisma.TipoGrauUncheckedUpdateManyInput>;
    where?: Prisma.TipoGrauWhereInput;
    limit?: number;
};
export type TipoGrauUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where: Prisma.TipoGrauWhereUniqueInput;
    create: Prisma.XOR<Prisma.TipoGrauCreateInput, Prisma.TipoGrauUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TipoGrauUpdateInput, Prisma.TipoGrauUncheckedUpdateInput>;
};
export type TipoGrauDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
    where: Prisma.TipoGrauWhereUniqueInput;
};
export type TipoGrauDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoGrauWhereInput;
    limit?: number;
};
export type TipoGrau$grausBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.GrauPersonagemBaseWhereInput;
    orderBy?: Prisma.GrauPersonagemBaseOrderByWithRelationInput | Prisma.GrauPersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.GrauPersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GrauPersonagemBaseScalarFieldEnum | Prisma.GrauPersonagemBaseScalarFieldEnum[];
};
export type TipoGrau$grausCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
    orderBy?: Prisma.GrauPersonagemCampanhaOrderByWithRelationInput | Prisma.GrauPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GrauPersonagemCampanhaScalarFieldEnum | Prisma.GrauPersonagemCampanhaScalarFieldEnum[];
};
export type TipoGrauDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoGrauSelect<ExtArgs> | null;
    omit?: Prisma.TipoGrauOmit<ExtArgs> | null;
    include?: Prisma.TipoGrauInclude<ExtArgs> | null;
};
export {};
