import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CaminhoModel = runtime.Types.Result.DefaultSelection<Prisma.$CaminhoPayload>;
export type AggregateCaminho = {
    _count: CaminhoCountAggregateOutputType | null;
    _avg: CaminhoAvgAggregateOutputType | null;
    _sum: CaminhoSumAggregateOutputType | null;
    _min: CaminhoMinAggregateOutputType | null;
    _max: CaminhoMaxAggregateOutputType | null;
};
export type CaminhoAvgAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
};
export type CaminhoSumAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
};
export type CaminhoMinAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    nome: string | null;
    descricao: string | null;
};
export type CaminhoMaxAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    nome: string | null;
    descricao: string | null;
};
export type CaminhoCountAggregateOutputType = {
    id: number;
    trilhaId: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type CaminhoAvgAggregateInputType = {
    id?: true;
    trilhaId?: true;
};
export type CaminhoSumAggregateInputType = {
    id?: true;
    trilhaId?: true;
};
export type CaminhoMinAggregateInputType = {
    id?: true;
    trilhaId?: true;
    nome?: true;
    descricao?: true;
};
export type CaminhoMaxAggregateInputType = {
    id?: true;
    trilhaId?: true;
    nome?: true;
    descricao?: true;
};
export type CaminhoCountAggregateInputType = {
    id?: true;
    trilhaId?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type CaminhoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CaminhoWhereInput;
    orderBy?: Prisma.CaminhoOrderByWithRelationInput | Prisma.CaminhoOrderByWithRelationInput[];
    cursor?: Prisma.CaminhoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CaminhoCountAggregateInputType;
    _avg?: CaminhoAvgAggregateInputType;
    _sum?: CaminhoSumAggregateInputType;
    _min?: CaminhoMinAggregateInputType;
    _max?: CaminhoMaxAggregateInputType;
};
export type GetCaminhoAggregateType<T extends CaminhoAggregateArgs> = {
    [P in keyof T & keyof AggregateCaminho]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCaminho[P]> : Prisma.GetScalarType<T[P], AggregateCaminho[P]>;
};
export type CaminhoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CaminhoWhereInput;
    orderBy?: Prisma.CaminhoOrderByWithAggregationInput | Prisma.CaminhoOrderByWithAggregationInput[];
    by: Prisma.CaminhoScalarFieldEnum[] | Prisma.CaminhoScalarFieldEnum;
    having?: Prisma.CaminhoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CaminhoCountAggregateInputType | true;
    _avg?: CaminhoAvgAggregateInputType;
    _sum?: CaminhoSumAggregateInputType;
    _min?: CaminhoMinAggregateInputType;
    _max?: CaminhoMaxAggregateInputType;
};
export type CaminhoGroupByOutputType = {
    id: number;
    trilhaId: number;
    nome: string;
    descricao: string | null;
    _count: CaminhoCountAggregateOutputType | null;
    _avg: CaminhoAvgAggregateOutputType | null;
    _sum: CaminhoSumAggregateOutputType | null;
    _min: CaminhoMinAggregateOutputType | null;
    _max: CaminhoMaxAggregateOutputType | null;
};
type GetCaminhoGroupByPayload<T extends CaminhoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CaminhoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CaminhoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CaminhoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CaminhoGroupByOutputType[P]>;
}>>;
export type CaminhoWhereInput = {
    AND?: Prisma.CaminhoWhereInput | Prisma.CaminhoWhereInput[];
    OR?: Prisma.CaminhoWhereInput[];
    NOT?: Prisma.CaminhoWhereInput | Prisma.CaminhoWhereInput[];
    id?: Prisma.IntFilter<"Caminho"> | number;
    trilhaId?: Prisma.IntFilter<"Caminho"> | number;
    nome?: Prisma.StringFilter<"Caminho"> | string;
    descricao?: Prisma.StringNullableFilter<"Caminho"> | string | null;
    trilha?: Prisma.XOR<Prisma.TrilhaScalarRelationFilter, Prisma.TrilhaWhereInput>;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
};
export type CaminhoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    trilha?: Prisma.TrilhaOrderByWithRelationInput;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.PersonagemCampanhaOrderByRelationAggregateInput;
    _relevance?: Prisma.CaminhoOrderByRelevanceInput;
};
export type CaminhoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.CaminhoWhereInput | Prisma.CaminhoWhereInput[];
    OR?: Prisma.CaminhoWhereInput[];
    NOT?: Prisma.CaminhoWhereInput | Prisma.CaminhoWhereInput[];
    trilhaId?: Prisma.IntFilter<"Caminho"> | number;
    nome?: Prisma.StringFilter<"Caminho"> | string;
    descricao?: Prisma.StringNullableFilter<"Caminho"> | string | null;
    trilha?: Prisma.XOR<Prisma.TrilhaScalarRelationFilter, Prisma.TrilhaWhereInput>;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
}, "id">;
export type CaminhoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.CaminhoCountOrderByAggregateInput;
    _avg?: Prisma.CaminhoAvgOrderByAggregateInput;
    _max?: Prisma.CaminhoMaxOrderByAggregateInput;
    _min?: Prisma.CaminhoMinOrderByAggregateInput;
    _sum?: Prisma.CaminhoSumOrderByAggregateInput;
};
export type CaminhoScalarWhereWithAggregatesInput = {
    AND?: Prisma.CaminhoScalarWhereWithAggregatesInput | Prisma.CaminhoScalarWhereWithAggregatesInput[];
    OR?: Prisma.CaminhoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CaminhoScalarWhereWithAggregatesInput | Prisma.CaminhoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Caminho"> | number;
    trilhaId?: Prisma.IntWithAggregatesFilter<"Caminho"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Caminho"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Caminho"> | string | null;
};
export type CaminhoCreateInput = {
    nome: string;
    descricao?: string | null;
    trilha: Prisma.TrilhaCreateNestedOneWithoutCaminhosInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutCaminhoInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoUncheckedCreateInput = {
    id?: number;
    trilhaId: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutCaminhoInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilha?: Prisma.TrilhaUpdateOneRequiredWithoutCaminhosNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutCaminhoNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutCaminhoNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoCreateManyInput = {
    id?: number;
    trilhaId: number;
    nome: string;
    descricao?: string | null;
};
export type CaminhoUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type CaminhoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type CaminhoNullableScalarRelationFilter = {
    is?: Prisma.CaminhoWhereInput | null;
    isNot?: Prisma.CaminhoWhereInput | null;
};
export type CaminhoListRelationFilter = {
    every?: Prisma.CaminhoWhereInput;
    some?: Prisma.CaminhoWhereInput;
    none?: Prisma.CaminhoWhereInput;
};
export type CaminhoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CaminhoOrderByRelevanceInput = {
    fields: Prisma.CaminhoOrderByRelevanceFieldEnum | Prisma.CaminhoOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type CaminhoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CaminhoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
};
export type CaminhoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CaminhoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type CaminhoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
};
export type CaminhoCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoUpdateOneWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.CaminhoUpsertWithoutPersonagensBaseInput;
    disconnect?: Prisma.CaminhoWhereInput | boolean;
    delete?: Prisma.CaminhoWhereInput | boolean;
    connect?: Prisma.CaminhoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CaminhoUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.CaminhoUpdateWithoutPersonagensBaseInput>, Prisma.CaminhoUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type CaminhoCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoUpdateOneWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.CaminhoUpsertWithoutPersonagensCampanhaInput;
    disconnect?: Prisma.CaminhoWhereInput | boolean;
    delete?: Prisma.CaminhoWhereInput | boolean;
    connect?: Prisma.CaminhoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CaminhoUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.CaminhoUpdateWithoutPersonagensCampanhaInput>, Prisma.CaminhoUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type CaminhoCreateNestedManyWithoutTrilhaInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput> | Prisma.CaminhoCreateWithoutTrilhaInput[] | Prisma.CaminhoUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutTrilhaInput | Prisma.CaminhoCreateOrConnectWithoutTrilhaInput[];
    createMany?: Prisma.CaminhoCreateManyTrilhaInputEnvelope;
    connect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
};
export type CaminhoUncheckedCreateNestedManyWithoutTrilhaInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput> | Prisma.CaminhoCreateWithoutTrilhaInput[] | Prisma.CaminhoUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutTrilhaInput | Prisma.CaminhoCreateOrConnectWithoutTrilhaInput[];
    createMany?: Prisma.CaminhoCreateManyTrilhaInputEnvelope;
    connect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
};
export type CaminhoUpdateManyWithoutTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput> | Prisma.CaminhoCreateWithoutTrilhaInput[] | Prisma.CaminhoUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutTrilhaInput | Prisma.CaminhoCreateOrConnectWithoutTrilhaInput[];
    upsert?: Prisma.CaminhoUpsertWithWhereUniqueWithoutTrilhaInput | Prisma.CaminhoUpsertWithWhereUniqueWithoutTrilhaInput[];
    createMany?: Prisma.CaminhoCreateManyTrilhaInputEnvelope;
    set?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    disconnect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    delete?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    connect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    update?: Prisma.CaminhoUpdateWithWhereUniqueWithoutTrilhaInput | Prisma.CaminhoUpdateWithWhereUniqueWithoutTrilhaInput[];
    updateMany?: Prisma.CaminhoUpdateManyWithWhereWithoutTrilhaInput | Prisma.CaminhoUpdateManyWithWhereWithoutTrilhaInput[];
    deleteMany?: Prisma.CaminhoScalarWhereInput | Prisma.CaminhoScalarWhereInput[];
};
export type CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput> | Prisma.CaminhoCreateWithoutTrilhaInput[] | Prisma.CaminhoUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.CaminhoCreateOrConnectWithoutTrilhaInput | Prisma.CaminhoCreateOrConnectWithoutTrilhaInput[];
    upsert?: Prisma.CaminhoUpsertWithWhereUniqueWithoutTrilhaInput | Prisma.CaminhoUpsertWithWhereUniqueWithoutTrilhaInput[];
    createMany?: Prisma.CaminhoCreateManyTrilhaInputEnvelope;
    set?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    disconnect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    delete?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    connect?: Prisma.CaminhoWhereUniqueInput | Prisma.CaminhoWhereUniqueInput[];
    update?: Prisma.CaminhoUpdateWithWhereUniqueWithoutTrilhaInput | Prisma.CaminhoUpdateWithWhereUniqueWithoutTrilhaInput[];
    updateMany?: Prisma.CaminhoUpdateManyWithWhereWithoutTrilhaInput | Prisma.CaminhoUpdateManyWithWhereWithoutTrilhaInput[];
    deleteMany?: Prisma.CaminhoScalarWhereInput | Prisma.CaminhoScalarWhereInput[];
};
export type CaminhoCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    trilha: Prisma.TrilhaCreateNestedOneWithoutCaminhosInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    trilhaId: number;
    nome: string;
    descricao?: string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.CaminhoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensBaseInput>;
};
export type CaminhoUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.CaminhoUpdateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.CaminhoWhereInput;
};
export type CaminhoUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.CaminhoWhereInput;
    data: Prisma.XOR<Prisma.CaminhoUpdateWithoutPersonagensBaseInput, Prisma.CaminhoUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type CaminhoUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilha?: Prisma.TrilhaUpdateOneRequiredWithoutCaminhosNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    trilha: Prisma.TrilhaCreateNestedOneWithoutCaminhosInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    trilhaId: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.CaminhoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type CaminhoUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.CaminhoUpdateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.CaminhoWhereInput;
};
export type CaminhoUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.CaminhoWhereInput;
    data: Prisma.XOR<Prisma.CaminhoUpdateWithoutPersonagensCampanhaInput, Prisma.CaminhoUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type CaminhoUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilha?: Prisma.TrilhaUpdateOneRequiredWithoutCaminhosNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoCreateWithoutTrilhaInput = {
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutCaminhoInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoUncheckedCreateWithoutTrilhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutCaminhoInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutCaminhoInput;
};
export type CaminhoCreateOrConnectWithoutTrilhaInput = {
    where: Prisma.CaminhoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput>;
};
export type CaminhoCreateManyTrilhaInputEnvelope = {
    data: Prisma.CaminhoCreateManyTrilhaInput | Prisma.CaminhoCreateManyTrilhaInput[];
    skipDuplicates?: boolean;
};
export type CaminhoUpsertWithWhereUniqueWithoutTrilhaInput = {
    where: Prisma.CaminhoWhereUniqueInput;
    update: Prisma.XOR<Prisma.CaminhoUpdateWithoutTrilhaInput, Prisma.CaminhoUncheckedUpdateWithoutTrilhaInput>;
    create: Prisma.XOR<Prisma.CaminhoCreateWithoutTrilhaInput, Prisma.CaminhoUncheckedCreateWithoutTrilhaInput>;
};
export type CaminhoUpdateWithWhereUniqueWithoutTrilhaInput = {
    where: Prisma.CaminhoWhereUniqueInput;
    data: Prisma.XOR<Prisma.CaminhoUpdateWithoutTrilhaInput, Prisma.CaminhoUncheckedUpdateWithoutTrilhaInput>;
};
export type CaminhoUpdateManyWithWhereWithoutTrilhaInput = {
    where: Prisma.CaminhoScalarWhereInput;
    data: Prisma.XOR<Prisma.CaminhoUpdateManyMutationInput, Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaInput>;
};
export type CaminhoScalarWhereInput = {
    AND?: Prisma.CaminhoScalarWhereInput | Prisma.CaminhoScalarWhereInput[];
    OR?: Prisma.CaminhoScalarWhereInput[];
    NOT?: Prisma.CaminhoScalarWhereInput | Prisma.CaminhoScalarWhereInput[];
    id?: Prisma.IntFilter<"Caminho"> | number;
    trilhaId?: Prisma.IntFilter<"Caminho"> | number;
    nome?: Prisma.StringFilter<"Caminho"> | string;
    descricao?: Prisma.StringNullableFilter<"Caminho"> | string | null;
};
export type CaminhoCreateManyTrilhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
};
export type CaminhoUpdateWithoutTrilhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutCaminhoNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoUncheckedUpdateWithoutTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutCaminhoNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutCaminhoNestedInput;
};
export type CaminhoUncheckedUpdateManyWithoutTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type CaminhoCountOutputType = {
    personagensBase: number;
    personagensCampanha: number;
};
export type CaminhoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | CaminhoCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | CaminhoCountOutputTypeCountPersonagensCampanhaArgs;
};
export type CaminhoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoCountOutputTypeSelect<ExtArgs> | null;
};
export type CaminhoCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type CaminhoCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemCampanhaWhereInput;
};
export type CaminhoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    trilhaId?: boolean;
    nome?: boolean;
    descricao?: boolean;
    trilha?: boolean | Prisma.TrilhaDefaultArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Caminho$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Caminho$personagensCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.CaminhoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["caminho"]>;
export type CaminhoSelectScalar = {
    id?: boolean;
    trilhaId?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type CaminhoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "trilhaId" | "nome" | "descricao", ExtArgs["result"]["caminho"]>;
export type CaminhoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trilha?: boolean | Prisma.TrilhaDefaultArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Caminho$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Caminho$personagensCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.CaminhoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $CaminhoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Caminho";
    objects: {
        trilha: Prisma.$TrilhaPayload<ExtArgs>;
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        trilhaId: number;
        nome: string;
        descricao: string | null;
    }, ExtArgs["result"]["caminho"]>;
    composites: {};
};
export type CaminhoGetPayload<S extends boolean | null | undefined | CaminhoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CaminhoPayload, S>;
export type CaminhoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CaminhoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CaminhoCountAggregateInputType | true;
};
export interface CaminhoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Caminho'];
        meta: {
            name: 'Caminho';
        };
    };
    findUnique<T extends CaminhoFindUniqueArgs>(args: Prisma.SelectSubset<T, CaminhoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CaminhoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CaminhoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CaminhoFindFirstArgs>(args?: Prisma.SelectSubset<T, CaminhoFindFirstArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CaminhoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CaminhoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CaminhoFindManyArgs>(args?: Prisma.SelectSubset<T, CaminhoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CaminhoCreateArgs>(args: Prisma.SelectSubset<T, CaminhoCreateArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CaminhoCreateManyArgs>(args?: Prisma.SelectSubset<T, CaminhoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends CaminhoDeleteArgs>(args: Prisma.SelectSubset<T, CaminhoDeleteArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CaminhoUpdateArgs>(args: Prisma.SelectSubset<T, CaminhoUpdateArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CaminhoDeleteManyArgs>(args?: Prisma.SelectSubset<T, CaminhoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CaminhoUpdateManyArgs>(args: Prisma.SelectSubset<T, CaminhoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends CaminhoUpsertArgs>(args: Prisma.SelectSubset<T, CaminhoUpsertArgs<ExtArgs>>): Prisma.Prisma__CaminhoClient<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CaminhoCountArgs>(args?: Prisma.Subset<T, CaminhoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CaminhoCountAggregateOutputType> : number>;
    aggregate<T extends CaminhoAggregateArgs>(args: Prisma.Subset<T, CaminhoAggregateArgs>): Prisma.PrismaPromise<GetCaminhoAggregateType<T>>;
    groupBy<T extends CaminhoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CaminhoGroupByArgs['orderBy'];
    } : {
        orderBy?: CaminhoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CaminhoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCaminhoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CaminhoFieldRefs;
}
export interface Prisma__CaminhoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    trilha<T extends Prisma.TrilhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrilhaDefaultArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    personagensBase<T extends Prisma.Caminho$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Caminho$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Caminho$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Caminho$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CaminhoFieldRefs {
    readonly id: Prisma.FieldRef<"Caminho", 'Int'>;
    readonly trilhaId: Prisma.FieldRef<"Caminho", 'Int'>;
    readonly nome: Prisma.FieldRef<"Caminho", 'String'>;
    readonly descricao: Prisma.FieldRef<"Caminho", 'String'>;
}
export type CaminhoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where?: Prisma.CaminhoWhereInput;
    orderBy?: Prisma.CaminhoOrderByWithRelationInput | Prisma.CaminhoOrderByWithRelationInput[];
    cursor?: Prisma.CaminhoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CaminhoScalarFieldEnum | Prisma.CaminhoScalarFieldEnum[];
};
export type CaminhoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where?: Prisma.CaminhoWhereInput;
    orderBy?: Prisma.CaminhoOrderByWithRelationInput | Prisma.CaminhoOrderByWithRelationInput[];
    cursor?: Prisma.CaminhoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CaminhoScalarFieldEnum | Prisma.CaminhoScalarFieldEnum[];
};
export type CaminhoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where?: Prisma.CaminhoWhereInput;
    orderBy?: Prisma.CaminhoOrderByWithRelationInput | Prisma.CaminhoOrderByWithRelationInput[];
    cursor?: Prisma.CaminhoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CaminhoScalarFieldEnum | Prisma.CaminhoScalarFieldEnum[];
};
export type CaminhoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CaminhoCreateInput, Prisma.CaminhoUncheckedCreateInput>;
};
export type CaminhoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CaminhoCreateManyInput | Prisma.CaminhoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CaminhoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CaminhoUpdateInput, Prisma.CaminhoUncheckedUpdateInput>;
    where: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CaminhoUpdateManyMutationInput, Prisma.CaminhoUncheckedUpdateManyInput>;
    where?: Prisma.CaminhoWhereInput;
    limit?: number;
};
export type CaminhoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where: Prisma.CaminhoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CaminhoCreateInput, Prisma.CaminhoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CaminhoUpdateInput, Prisma.CaminhoUncheckedUpdateInput>;
};
export type CaminhoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
    where: Prisma.CaminhoWhereUniqueInput;
};
export type CaminhoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CaminhoWhereInput;
    limit?: number;
};
export type Caminho$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Caminho$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CaminhoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CaminhoSelect<ExtArgs> | null;
    omit?: Prisma.CaminhoOmit<ExtArgs> | null;
    include?: Prisma.CaminhoInclude<ExtArgs> | null;
};
export {};
