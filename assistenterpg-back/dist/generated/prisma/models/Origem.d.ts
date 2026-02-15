import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OrigemModel = runtime.Types.Result.DefaultSelection<Prisma.$OrigemPayload>;
export type AggregateOrigem = {
    _count: OrigemCountAggregateOutputType | null;
    _avg: OrigemAvgAggregateOutputType | null;
    _sum: OrigemSumAggregateOutputType | null;
    _min: OrigemMinAggregateOutputType | null;
    _max: OrigemMaxAggregateOutputType | null;
};
export type OrigemAvgAggregateOutputType = {
    id: number | null;
};
export type OrigemSumAggregateOutputType = {
    id: number | null;
};
export type OrigemMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type OrigemMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type OrigemCountAggregateOutputType = {
    id: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type OrigemAvgAggregateInputType = {
    id?: true;
};
export type OrigemSumAggregateInputType = {
    id?: true;
};
export type OrigemMinAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type OrigemMaxAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type OrigemCountAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type OrigemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrigemWhereInput;
    orderBy?: Prisma.OrigemOrderByWithRelationInput | Prisma.OrigemOrderByWithRelationInput[];
    cursor?: Prisma.OrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OrigemCountAggregateInputType;
    _avg?: OrigemAvgAggregateInputType;
    _sum?: OrigemSumAggregateInputType;
    _min?: OrigemMinAggregateInputType;
    _max?: OrigemMaxAggregateInputType;
};
export type GetOrigemAggregateType<T extends OrigemAggregateArgs> = {
    [P in keyof T & keyof AggregateOrigem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrigem[P]> : Prisma.GetScalarType<T[P], AggregateOrigem[P]>;
};
export type OrigemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrigemWhereInput;
    orderBy?: Prisma.OrigemOrderByWithAggregationInput | Prisma.OrigemOrderByWithAggregationInput[];
    by: Prisma.OrigemScalarFieldEnum[] | Prisma.OrigemScalarFieldEnum;
    having?: Prisma.OrigemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrigemCountAggregateInputType | true;
    _avg?: OrigemAvgAggregateInputType;
    _sum?: OrigemSumAggregateInputType;
    _min?: OrigemMinAggregateInputType;
    _max?: OrigemMaxAggregateInputType;
};
export type OrigemGroupByOutputType = {
    id: number;
    nome: string;
    descricao: string | null;
    _count: OrigemCountAggregateOutputType | null;
    _avg: OrigemAvgAggregateOutputType | null;
    _sum: OrigemSumAggregateOutputType | null;
    _min: OrigemMinAggregateOutputType | null;
    _max: OrigemMaxAggregateOutputType | null;
};
type GetOrigemGroupByPayload<T extends OrigemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrigemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrigemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrigemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrigemGroupByOutputType[P]>;
}>>;
export type OrigemWhereInput = {
    AND?: Prisma.OrigemWhereInput | Prisma.OrigemWhereInput[];
    OR?: Prisma.OrigemWhereInput[];
    NOT?: Prisma.OrigemWhereInput | Prisma.OrigemWhereInput[];
    id?: Prisma.IntFilter<"Origem"> | number;
    nome?: Prisma.StringFilter<"Origem"> | string;
    descricao?: Prisma.StringNullableFilter<"Origem"> | string | null;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesOrigem?: Prisma.HabilidadeOrigemListRelationFilter;
};
export type OrigemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.PersonagemCampanhaOrderByRelationAggregateInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemOrderByRelationAggregateInput;
    _relevance?: Prisma.OrigemOrderByRelevanceInput;
};
export type OrigemWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.OrigemWhereInput | Prisma.OrigemWhereInput[];
    OR?: Prisma.OrigemWhereInput[];
    NOT?: Prisma.OrigemWhereInput | Prisma.OrigemWhereInput[];
    nome?: Prisma.StringFilter<"Origem"> | string;
    descricao?: Prisma.StringNullableFilter<"Origem"> | string | null;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesOrigem?: Prisma.HabilidadeOrigemListRelationFilter;
}, "id">;
export type OrigemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.OrigemCountOrderByAggregateInput;
    _avg?: Prisma.OrigemAvgOrderByAggregateInput;
    _max?: Prisma.OrigemMaxOrderByAggregateInput;
    _min?: Prisma.OrigemMinOrderByAggregateInput;
    _sum?: Prisma.OrigemSumOrderByAggregateInput;
};
export type OrigemScalarWhereWithAggregatesInput = {
    AND?: Prisma.OrigemScalarWhereWithAggregatesInput | Prisma.OrigemScalarWhereWithAggregatesInput[];
    OR?: Prisma.OrigemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OrigemScalarWhereWithAggregatesInput | Prisma.OrigemScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Origem"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Origem"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Origem"> | string | null;
};
export type OrigemCreateInput = {
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutOrigemInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutOrigemInput;
};
export type OrigemUncheckedCreateInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutOrigemInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutOrigemInput;
};
export type OrigemUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutOrigemNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutOrigemNestedInput;
};
export type OrigemUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutOrigemNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutOrigemNestedInput;
};
export type OrigemCreateManyInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
};
export type OrigemUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type OrigemUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type OrigemScalarRelationFilter = {
    is?: Prisma.OrigemWhereInput;
    isNot?: Prisma.OrigemWhereInput;
};
export type OrigemOrderByRelevanceInput = {
    fields: Prisma.OrigemOrderByRelevanceFieldEnum | Prisma.OrigemOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type OrigemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type OrigemAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type OrigemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type OrigemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type OrigemSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type OrigemCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.OrigemWhereUniqueInput;
};
export type OrigemUpdateOneRequiredWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.OrigemUpsertWithoutPersonagensBaseInput;
    connect?: Prisma.OrigemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrigemUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.OrigemUpdateWithoutPersonagensBaseInput>, Prisma.OrigemUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type OrigemCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.OrigemWhereUniqueInput;
};
export type OrigemUpdateOneRequiredWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.OrigemUpsertWithoutPersonagensCampanhaInput;
    connect?: Prisma.OrigemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrigemUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.OrigemUpdateWithoutPersonagensCampanhaInput>, Prisma.OrigemUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type OrigemCreateNestedOneWithoutHabilidadesOrigemInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedCreateWithoutHabilidadesOrigemInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutHabilidadesOrigemInput;
    connect?: Prisma.OrigemWhereUniqueInput;
};
export type OrigemUpdateOneRequiredWithoutHabilidadesOrigemNestedInput = {
    create?: Prisma.XOR<Prisma.OrigemCreateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedCreateWithoutHabilidadesOrigemInput>;
    connectOrCreate?: Prisma.OrigemCreateOrConnectWithoutHabilidadesOrigemInput;
    upsert?: Prisma.OrigemUpsertWithoutHabilidadesOrigemInput;
    connect?: Prisma.OrigemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrigemUpdateToOneWithWhereWithoutHabilidadesOrigemInput, Prisma.OrigemUpdateWithoutHabilidadesOrigemInput>, Prisma.OrigemUncheckedUpdateWithoutHabilidadesOrigemInput>;
};
export type OrigemCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutOrigemInput;
};
export type OrigemUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutOrigemInput;
};
export type OrigemCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.OrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedCreateWithoutPersonagensBaseInput>;
};
export type OrigemUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.OrigemUpdateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.OrigemWhereInput;
};
export type OrigemUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.OrigemWhereInput;
    data: Prisma.XOR<Prisma.OrigemUpdateWithoutPersonagensBaseInput, Prisma.OrigemUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type OrigemUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutOrigemNestedInput;
};
export type OrigemUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutOrigemNestedInput;
};
export type OrigemCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutOrigemInput;
};
export type OrigemUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutOrigemInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutOrigemInput;
};
export type OrigemCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.OrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type OrigemUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.OrigemUpdateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.OrigemWhereInput;
};
export type OrigemUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.OrigemWhereInput;
    data: Prisma.XOR<Prisma.OrigemUpdateWithoutPersonagensCampanhaInput, Prisma.OrigemUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type OrigemUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutOrigemNestedInput;
};
export type OrigemUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutOrigemNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutOrigemNestedInput;
};
export type OrigemCreateWithoutHabilidadesOrigemInput = {
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutOrigemInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutOrigemInput;
};
export type OrigemUncheckedCreateWithoutHabilidadesOrigemInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutOrigemInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutOrigemInput;
};
export type OrigemCreateOrConnectWithoutHabilidadesOrigemInput = {
    where: Prisma.OrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedCreateWithoutHabilidadesOrigemInput>;
};
export type OrigemUpsertWithoutHabilidadesOrigemInput = {
    update: Prisma.XOR<Prisma.OrigemUpdateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedUpdateWithoutHabilidadesOrigemInput>;
    create: Prisma.XOR<Prisma.OrigemCreateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedCreateWithoutHabilidadesOrigemInput>;
    where?: Prisma.OrigemWhereInput;
};
export type OrigemUpdateToOneWithWhereWithoutHabilidadesOrigemInput = {
    where?: Prisma.OrigemWhereInput;
    data: Prisma.XOR<Prisma.OrigemUpdateWithoutHabilidadesOrigemInput, Prisma.OrigemUncheckedUpdateWithoutHabilidadesOrigemInput>;
};
export type OrigemUpdateWithoutHabilidadesOrigemInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutOrigemNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutOrigemNestedInput;
};
export type OrigemUncheckedUpdateWithoutHabilidadesOrigemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutOrigemNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutOrigemNestedInput;
};
export type OrigemCountOutputType = {
    personagensBase: number;
    personagensCampanha: number;
    habilidadesOrigem: number;
};
export type OrigemCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | OrigemCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | OrigemCountOutputTypeCountPersonagensCampanhaArgs;
    habilidadesOrigem?: boolean | OrigemCountOutputTypeCountHabilidadesOrigemArgs;
};
export type OrigemCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemCountOutputTypeSelect<ExtArgs> | null;
};
export type OrigemCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type OrigemCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemCampanhaWhereInput;
};
export type OrigemCountOutputTypeCountHabilidadesOrigemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeOrigemWhereInput;
};
export type OrigemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    personagensBase?: boolean | Prisma.Origem$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Origem$personagensCampanhaArgs<ExtArgs>;
    habilidadesOrigem?: boolean | Prisma.Origem$habilidadesOrigemArgs<ExtArgs>;
    _count?: boolean | Prisma.OrigemCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["origem"]>;
export type OrigemSelectScalar = {
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type OrigemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "descricao", ExtArgs["result"]["origem"]>;
export type OrigemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | Prisma.Origem$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Origem$personagensCampanhaArgs<ExtArgs>;
    habilidadesOrigem?: boolean | Prisma.Origem$habilidadesOrigemArgs<ExtArgs>;
    _count?: boolean | Prisma.OrigemCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $OrigemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Origem";
    objects: {
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>[];
        habilidadesOrigem: Prisma.$HabilidadeOrigemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        descricao: string | null;
    }, ExtArgs["result"]["origem"]>;
    composites: {};
};
export type OrigemGetPayload<S extends boolean | null | undefined | OrigemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OrigemPayload, S>;
export type OrigemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OrigemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrigemCountAggregateInputType | true;
};
export interface OrigemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Origem'];
        meta: {
            name: 'Origem';
        };
    };
    findUnique<T extends OrigemFindUniqueArgs>(args: Prisma.SelectSubset<T, OrigemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OrigemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OrigemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OrigemFindFirstArgs>(args?: Prisma.SelectSubset<T, OrigemFindFirstArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OrigemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OrigemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OrigemFindManyArgs>(args?: Prisma.SelectSubset<T, OrigemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OrigemCreateArgs>(args: Prisma.SelectSubset<T, OrigemCreateArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OrigemCreateManyArgs>(args?: Prisma.SelectSubset<T, OrigemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends OrigemDeleteArgs>(args: Prisma.SelectSubset<T, OrigemDeleteArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OrigemUpdateArgs>(args: Prisma.SelectSubset<T, OrigemUpdateArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OrigemDeleteManyArgs>(args?: Prisma.SelectSubset<T, OrigemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OrigemUpdateManyArgs>(args: Prisma.SelectSubset<T, OrigemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends OrigemUpsertArgs>(args: Prisma.SelectSubset<T, OrigemUpsertArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OrigemCountArgs>(args?: Prisma.Subset<T, OrigemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrigemCountAggregateOutputType> : number>;
    aggregate<T extends OrigemAggregateArgs>(args: Prisma.Subset<T, OrigemAggregateArgs>): Prisma.PrismaPromise<GetOrigemAggregateType<T>>;
    groupBy<T extends OrigemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OrigemGroupByArgs['orderBy'];
    } : {
        orderBy?: OrigemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OrigemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrigemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OrigemFieldRefs;
}
export interface Prisma__OrigemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagensBase<T extends Prisma.Origem$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Origem$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Origem$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Origem$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesOrigem<T extends Prisma.Origem$habilidadesOrigemArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Origem$habilidadesOrigemArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OrigemFieldRefs {
    readonly id: Prisma.FieldRef<"Origem", 'Int'>;
    readonly nome: Prisma.FieldRef<"Origem", 'String'>;
    readonly descricao: Prisma.FieldRef<"Origem", 'String'>;
}
export type OrigemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where: Prisma.OrigemWhereUniqueInput;
};
export type OrigemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where: Prisma.OrigemWhereUniqueInput;
};
export type OrigemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where?: Prisma.OrigemWhereInput;
    orderBy?: Prisma.OrigemOrderByWithRelationInput | Prisma.OrigemOrderByWithRelationInput[];
    cursor?: Prisma.OrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrigemScalarFieldEnum | Prisma.OrigemScalarFieldEnum[];
};
export type OrigemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where?: Prisma.OrigemWhereInput;
    orderBy?: Prisma.OrigemOrderByWithRelationInput | Prisma.OrigemOrderByWithRelationInput[];
    cursor?: Prisma.OrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrigemScalarFieldEnum | Prisma.OrigemScalarFieldEnum[];
};
export type OrigemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where?: Prisma.OrigemWhereInput;
    orderBy?: Prisma.OrigemOrderByWithRelationInput | Prisma.OrigemOrderByWithRelationInput[];
    cursor?: Prisma.OrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrigemScalarFieldEnum | Prisma.OrigemScalarFieldEnum[];
};
export type OrigemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrigemCreateInput, Prisma.OrigemUncheckedCreateInput>;
};
export type OrigemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OrigemCreateManyInput | Prisma.OrigemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OrigemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrigemUpdateInput, Prisma.OrigemUncheckedUpdateInput>;
    where: Prisma.OrigemWhereUniqueInput;
};
export type OrigemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OrigemUpdateManyMutationInput, Prisma.OrigemUncheckedUpdateManyInput>;
    where?: Prisma.OrigemWhereInput;
    limit?: number;
};
export type OrigemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where: Prisma.OrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrigemCreateInput, Prisma.OrigemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OrigemUpdateInput, Prisma.OrigemUncheckedUpdateInput>;
};
export type OrigemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
    where: Prisma.OrigemWhereUniqueInput;
};
export type OrigemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrigemWhereInput;
    limit?: number;
};
export type Origem$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Origem$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Origem$habilidadesOrigemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeOrigemWhereInput;
    orderBy?: Prisma.HabilidadeOrigemOrderByWithRelationInput | Prisma.HabilidadeOrigemOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeOrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeOrigemScalarFieldEnum | Prisma.HabilidadeOrigemScalarFieldEnum[];
};
export type OrigemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrigemSelect<ExtArgs> | null;
    omit?: Prisma.OrigemOmit<ExtArgs> | null;
    include?: Prisma.OrigemInclude<ExtArgs> | null;
};
export {};
