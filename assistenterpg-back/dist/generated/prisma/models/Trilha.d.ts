import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TrilhaModel = runtime.Types.Result.DefaultSelection<Prisma.$TrilhaPayload>;
export type AggregateTrilha = {
    _count: TrilhaCountAggregateOutputType | null;
    _avg: TrilhaAvgAggregateOutputType | null;
    _sum: TrilhaSumAggregateOutputType | null;
    _min: TrilhaMinAggregateOutputType | null;
    _max: TrilhaMaxAggregateOutputType | null;
};
export type TrilhaAvgAggregateOutputType = {
    id: number | null;
    classeId: number | null;
};
export type TrilhaSumAggregateOutputType = {
    id: number | null;
    classeId: number | null;
};
export type TrilhaMinAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    nome: string | null;
    descricao: string | null;
};
export type TrilhaMaxAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    nome: string | null;
    descricao: string | null;
};
export type TrilhaCountAggregateOutputType = {
    id: number;
    classeId: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type TrilhaAvgAggregateInputType = {
    id?: true;
    classeId?: true;
};
export type TrilhaSumAggregateInputType = {
    id?: true;
    classeId?: true;
};
export type TrilhaMinAggregateInputType = {
    id?: true;
    classeId?: true;
    nome?: true;
    descricao?: true;
};
export type TrilhaMaxAggregateInputType = {
    id?: true;
    classeId?: true;
    nome?: true;
    descricao?: true;
};
export type TrilhaCountAggregateInputType = {
    id?: true;
    classeId?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type TrilhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithRelationInput | Prisma.TrilhaOrderByWithRelationInput[];
    cursor?: Prisma.TrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TrilhaCountAggregateInputType;
    _avg?: TrilhaAvgAggregateInputType;
    _sum?: TrilhaSumAggregateInputType;
    _min?: TrilhaMinAggregateInputType;
    _max?: TrilhaMaxAggregateInputType;
};
export type GetTrilhaAggregateType<T extends TrilhaAggregateArgs> = {
    [P in keyof T & keyof AggregateTrilha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTrilha[P]> : Prisma.GetScalarType<T[P], AggregateTrilha[P]>;
};
export type TrilhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithAggregationInput | Prisma.TrilhaOrderByWithAggregationInput[];
    by: Prisma.TrilhaScalarFieldEnum[] | Prisma.TrilhaScalarFieldEnum;
    having?: Prisma.TrilhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TrilhaCountAggregateInputType | true;
    _avg?: TrilhaAvgAggregateInputType;
    _sum?: TrilhaSumAggregateInputType;
    _min?: TrilhaMinAggregateInputType;
    _max?: TrilhaMaxAggregateInputType;
};
export type TrilhaGroupByOutputType = {
    id: number;
    classeId: number;
    nome: string;
    descricao: string | null;
    _count: TrilhaCountAggregateOutputType | null;
    _avg: TrilhaAvgAggregateOutputType | null;
    _sum: TrilhaSumAggregateOutputType | null;
    _min: TrilhaMinAggregateOutputType | null;
    _max: TrilhaMaxAggregateOutputType | null;
};
type GetTrilhaGroupByPayload<T extends TrilhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TrilhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TrilhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TrilhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TrilhaGroupByOutputType[P]>;
}>>;
export type TrilhaWhereInput = {
    AND?: Prisma.TrilhaWhereInput | Prisma.TrilhaWhereInput[];
    OR?: Prisma.TrilhaWhereInput[];
    NOT?: Prisma.TrilhaWhereInput | Prisma.TrilhaWhereInput[];
    id?: Prisma.IntFilter<"Trilha"> | number;
    classeId?: Prisma.IntFilter<"Trilha"> | number;
    nome?: Prisma.StringFilter<"Trilha"> | string;
    descricao?: Prisma.StringNullableFilter<"Trilha"> | string | null;
    classe?: Prisma.XOR<Prisma.ClasseScalarRelationFilter, Prisma.ClasseWhereInput>;
    caminhos?: Prisma.CaminhoListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaListRelationFilter;
};
export type TrilhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    classe?: Prisma.ClasseOrderByWithRelationInput;
    caminhos?: Prisma.CaminhoOrderByRelationAggregateInput;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.PersonagemCampanhaOrderByRelationAggregateInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaOrderByRelationAggregateInput;
    _relevance?: Prisma.TrilhaOrderByRelevanceInput;
};
export type TrilhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TrilhaWhereInput | Prisma.TrilhaWhereInput[];
    OR?: Prisma.TrilhaWhereInput[];
    NOT?: Prisma.TrilhaWhereInput | Prisma.TrilhaWhereInput[];
    classeId?: Prisma.IntFilter<"Trilha"> | number;
    nome?: Prisma.StringFilter<"Trilha"> | string;
    descricao?: Prisma.StringNullableFilter<"Trilha"> | string | null;
    classe?: Prisma.XOR<Prisma.ClasseScalarRelationFilter, Prisma.ClasseWhereInput>;
    caminhos?: Prisma.CaminhoListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaListRelationFilter;
}, "id">;
export type TrilhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.TrilhaCountOrderByAggregateInput;
    _avg?: Prisma.TrilhaAvgOrderByAggregateInput;
    _max?: Prisma.TrilhaMaxOrderByAggregateInput;
    _min?: Prisma.TrilhaMinOrderByAggregateInput;
    _sum?: Prisma.TrilhaSumOrderByAggregateInput;
};
export type TrilhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.TrilhaScalarWhereWithAggregatesInput | Prisma.TrilhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.TrilhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TrilhaScalarWhereWithAggregatesInput | Prisma.TrilhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Trilha"> | number;
    classeId?: Prisma.IntWithAggregatesFilter<"Trilha"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Trilha"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Trilha"> | string | null;
};
export type TrilhaCreateInput = {
    nome: string;
    descricao?: string | null;
    classe: Prisma.ClasseCreateNestedOneWithoutTrilhasInput;
    caminhos?: Prisma.CaminhoCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutTrilhasNestedInput;
    caminhos?: Prisma.CaminhoUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaCreateManyInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
};
export type TrilhaUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type TrilhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type TrilhaNullableScalarRelationFilter = {
    is?: Prisma.TrilhaWhereInput | null;
    isNot?: Prisma.TrilhaWhereInput | null;
};
export type TrilhaListRelationFilter = {
    every?: Prisma.TrilhaWhereInput;
    some?: Prisma.TrilhaWhereInput;
    none?: Prisma.TrilhaWhereInput;
};
export type TrilhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TrilhaOrderByRelevanceInput = {
    fields: Prisma.TrilhaOrderByRelevanceFieldEnum | Prisma.TrilhaOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type TrilhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TrilhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
};
export type TrilhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TrilhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type TrilhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
};
export type TrilhaScalarRelationFilter = {
    is?: Prisma.TrilhaWhereInput;
    isNot?: Prisma.TrilhaWhereInput;
};
export type TrilhaCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaUpdateOneWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.TrilhaUpsertWithoutPersonagensBaseInput;
    disconnect?: Prisma.TrilhaWhereInput | boolean;
    delete?: Prisma.TrilhaWhereInput | boolean;
    connect?: Prisma.TrilhaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrilhaUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.TrilhaUpdateWithoutPersonagensBaseInput>, Prisma.TrilhaUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type TrilhaCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaUpdateOneWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.TrilhaUpsertWithoutPersonagensCampanhaInput;
    disconnect?: Prisma.TrilhaWhereInput | boolean;
    delete?: Prisma.TrilhaWhereInput | boolean;
    connect?: Prisma.TrilhaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrilhaUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.TrilhaUpdateWithoutPersonagensCampanhaInput>, Prisma.TrilhaUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type TrilhaCreateNestedManyWithoutClasseInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput> | Prisma.TrilhaCreateWithoutClasseInput[] | Prisma.TrilhaUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutClasseInput | Prisma.TrilhaCreateOrConnectWithoutClasseInput[];
    createMany?: Prisma.TrilhaCreateManyClasseInputEnvelope;
    connect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
};
export type TrilhaUncheckedCreateNestedManyWithoutClasseInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput> | Prisma.TrilhaCreateWithoutClasseInput[] | Prisma.TrilhaUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutClasseInput | Prisma.TrilhaCreateOrConnectWithoutClasseInput[];
    createMany?: Prisma.TrilhaCreateManyClasseInputEnvelope;
    connect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
};
export type TrilhaUpdateManyWithoutClasseNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput> | Prisma.TrilhaCreateWithoutClasseInput[] | Prisma.TrilhaUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutClasseInput | Prisma.TrilhaCreateOrConnectWithoutClasseInput[];
    upsert?: Prisma.TrilhaUpsertWithWhereUniqueWithoutClasseInput | Prisma.TrilhaUpsertWithWhereUniqueWithoutClasseInput[];
    createMany?: Prisma.TrilhaCreateManyClasseInputEnvelope;
    set?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    disconnect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    delete?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    connect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    update?: Prisma.TrilhaUpdateWithWhereUniqueWithoutClasseInput | Prisma.TrilhaUpdateWithWhereUniqueWithoutClasseInput[];
    updateMany?: Prisma.TrilhaUpdateManyWithWhereWithoutClasseInput | Prisma.TrilhaUpdateManyWithWhereWithoutClasseInput[];
    deleteMany?: Prisma.TrilhaScalarWhereInput | Prisma.TrilhaScalarWhereInput[];
};
export type TrilhaUncheckedUpdateManyWithoutClasseNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput> | Prisma.TrilhaCreateWithoutClasseInput[] | Prisma.TrilhaUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutClasseInput | Prisma.TrilhaCreateOrConnectWithoutClasseInput[];
    upsert?: Prisma.TrilhaUpsertWithWhereUniqueWithoutClasseInput | Prisma.TrilhaUpsertWithWhereUniqueWithoutClasseInput[];
    createMany?: Prisma.TrilhaCreateManyClasseInputEnvelope;
    set?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    disconnect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    delete?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    connect?: Prisma.TrilhaWhereUniqueInput | Prisma.TrilhaWhereUniqueInput[];
    update?: Prisma.TrilhaUpdateWithWhereUniqueWithoutClasseInput | Prisma.TrilhaUpdateWithWhereUniqueWithoutClasseInput[];
    updateMany?: Prisma.TrilhaUpdateManyWithWhereWithoutClasseInput | Prisma.TrilhaUpdateManyWithWhereWithoutClasseInput[];
    deleteMany?: Prisma.TrilhaScalarWhereInput | Prisma.TrilhaScalarWhereInput[];
};
export type TrilhaCreateNestedOneWithoutCaminhosInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutCaminhosInput, Prisma.TrilhaUncheckedCreateWithoutCaminhosInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutCaminhosInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaUpdateOneRequiredWithoutCaminhosNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutCaminhosInput, Prisma.TrilhaUncheckedCreateWithoutCaminhosInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutCaminhosInput;
    upsert?: Prisma.TrilhaUpsertWithoutCaminhosInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrilhaUpdateToOneWithWhereWithoutCaminhosInput, Prisma.TrilhaUpdateWithoutCaminhosInput>, Prisma.TrilhaUncheckedUpdateWithoutCaminhosInput>;
};
export type TrilhaCreateNestedOneWithoutHabilidadesTrilhaInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedCreateWithoutHabilidadesTrilhaInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutHabilidadesTrilhaInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.TrilhaCreateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedCreateWithoutHabilidadesTrilhaInput>;
    connectOrCreate?: Prisma.TrilhaCreateOrConnectWithoutHabilidadesTrilhaInput;
    upsert?: Prisma.TrilhaUpsertWithoutHabilidadesTrilhaInput;
    connect?: Prisma.TrilhaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrilhaUpdateToOneWithWhereWithoutHabilidadesTrilhaInput, Prisma.TrilhaUpdateWithoutHabilidadesTrilhaInput>, Prisma.TrilhaUncheckedUpdateWithoutHabilidadesTrilhaInput>;
};
export type TrilhaCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    classe: Prisma.ClasseCreateNestedOneWithoutTrilhasInput;
    caminhos?: Prisma.CaminhoCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensBaseInput>;
};
export type TrilhaUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.TrilhaUpdateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.TrilhaWhereInput;
};
export type TrilhaUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.TrilhaWhereInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateWithoutPersonagensBaseInput, Prisma.TrilhaUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type TrilhaUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutTrilhasNestedInput;
    caminhos?: Prisma.CaminhoUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    classe: Prisma.ClasseCreateNestedOneWithoutTrilhasInput;
    caminhos?: Prisma.CaminhoCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type TrilhaUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.TrilhaUpdateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.TrilhaWhereInput;
};
export type TrilhaUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.TrilhaWhereInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateWithoutPersonagensCampanhaInput, Prisma.TrilhaUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type TrilhaUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutTrilhasNestedInput;
    caminhos?: Prisma.CaminhoUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaCreateWithoutClasseInput = {
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateWithoutClasseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaCreateOrConnectWithoutClasseInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput>;
};
export type TrilhaCreateManyClasseInputEnvelope = {
    data: Prisma.TrilhaCreateManyClasseInput | Prisma.TrilhaCreateManyClasseInput[];
    skipDuplicates?: boolean;
};
export type TrilhaUpsertWithWhereUniqueWithoutClasseInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.TrilhaUpdateWithoutClasseInput, Prisma.TrilhaUncheckedUpdateWithoutClasseInput>;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutClasseInput, Prisma.TrilhaUncheckedCreateWithoutClasseInput>;
};
export type TrilhaUpdateWithWhereUniqueWithoutClasseInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateWithoutClasseInput, Prisma.TrilhaUncheckedUpdateWithoutClasseInput>;
};
export type TrilhaUpdateManyWithWhereWithoutClasseInput = {
    where: Prisma.TrilhaScalarWhereInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateManyMutationInput, Prisma.TrilhaUncheckedUpdateManyWithoutClasseInput>;
};
export type TrilhaScalarWhereInput = {
    AND?: Prisma.TrilhaScalarWhereInput | Prisma.TrilhaScalarWhereInput[];
    OR?: Prisma.TrilhaScalarWhereInput[];
    NOT?: Prisma.TrilhaScalarWhereInput | Prisma.TrilhaScalarWhereInput[];
    id?: Prisma.IntFilter<"Trilha"> | number;
    classeId?: Prisma.IntFilter<"Trilha"> | number;
    nome?: Prisma.StringFilter<"Trilha"> | string;
    descricao?: Prisma.StringNullableFilter<"Trilha"> | string | null;
};
export type TrilhaCreateWithoutCaminhosInput = {
    nome: string;
    descricao?: string | null;
    classe: Prisma.ClasseCreateNestedOneWithoutTrilhasInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateWithoutCaminhosInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutTrilhaInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaCreateOrConnectWithoutCaminhosInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutCaminhosInput, Prisma.TrilhaUncheckedCreateWithoutCaminhosInput>;
};
export type TrilhaUpsertWithoutCaminhosInput = {
    update: Prisma.XOR<Prisma.TrilhaUpdateWithoutCaminhosInput, Prisma.TrilhaUncheckedUpdateWithoutCaminhosInput>;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutCaminhosInput, Prisma.TrilhaUncheckedCreateWithoutCaminhosInput>;
    where?: Prisma.TrilhaWhereInput;
};
export type TrilhaUpdateToOneWithWhereWithoutCaminhosInput = {
    where?: Prisma.TrilhaWhereInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateWithoutCaminhosInput, Prisma.TrilhaUncheckedUpdateWithoutCaminhosInput>;
};
export type TrilhaUpdateWithoutCaminhosInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutTrilhasNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateWithoutCaminhosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaCreateWithoutHabilidadesTrilhaInput = {
    nome: string;
    descricao?: string | null;
    classe: Prisma.ClasseCreateNestedOneWithoutTrilhasInput;
    caminhos?: Prisma.CaminhoCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaUncheckedCreateWithoutHabilidadesTrilhaInput = {
    id?: number;
    classeId: number;
    nome: string;
    descricao?: string | null;
    caminhos?: Prisma.CaminhoUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTrilhaInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutTrilhaInput;
};
export type TrilhaCreateOrConnectWithoutHabilidadesTrilhaInput = {
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedCreateWithoutHabilidadesTrilhaInput>;
};
export type TrilhaUpsertWithoutHabilidadesTrilhaInput = {
    update: Prisma.XOR<Prisma.TrilhaUpdateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedUpdateWithoutHabilidadesTrilhaInput>;
    create: Prisma.XOR<Prisma.TrilhaCreateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedCreateWithoutHabilidadesTrilhaInput>;
    where?: Prisma.TrilhaWhereInput;
};
export type TrilhaUpdateToOneWithWhereWithoutHabilidadesTrilhaInput = {
    where?: Prisma.TrilhaWhereInput;
    data: Prisma.XOR<Prisma.TrilhaUpdateWithoutHabilidadesTrilhaInput, Prisma.TrilhaUncheckedUpdateWithoutHabilidadesTrilhaInput>;
};
export type TrilhaUpdateWithoutHabilidadesTrilhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutTrilhasNestedInput;
    caminhos?: Prisma.CaminhoUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateWithoutHabilidadesTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaCreateManyClasseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
};
export type TrilhaUpdateWithoutClasseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateWithoutClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    caminhos?: Prisma.CaminhoUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTrilhaNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutTrilhaNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput;
};
export type TrilhaUncheckedUpdateManyWithoutClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type TrilhaCountOutputType = {
    caminhos: number;
    personagensBase: number;
    personagensCampanha: number;
    habilidadesTrilha: number;
};
export type TrilhaCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    caminhos?: boolean | TrilhaCountOutputTypeCountCaminhosArgs;
    personagensBase?: boolean | TrilhaCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | TrilhaCountOutputTypeCountPersonagensCampanhaArgs;
    habilidadesTrilha?: boolean | TrilhaCountOutputTypeCountHabilidadesTrilhaArgs;
};
export type TrilhaCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaCountOutputTypeSelect<ExtArgs> | null;
};
export type TrilhaCountOutputTypeCountCaminhosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CaminhoWhereInput;
};
export type TrilhaCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type TrilhaCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemCampanhaWhereInput;
};
export type TrilhaCountOutputTypeCountHabilidadesTrilhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeTrilhaWhereInput;
};
export type TrilhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classeId?: boolean;
    nome?: boolean;
    descricao?: boolean;
    classe?: boolean | Prisma.ClasseDefaultArgs<ExtArgs>;
    caminhos?: boolean | Prisma.Trilha$caminhosArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Trilha$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Trilha$personagensCampanhaArgs<ExtArgs>;
    habilidadesTrilha?: boolean | Prisma.Trilha$habilidadesTrilhaArgs<ExtArgs>;
    _count?: boolean | Prisma.TrilhaCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["trilha"]>;
export type TrilhaSelectScalar = {
    id?: boolean;
    classeId?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type TrilhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classeId" | "nome" | "descricao", ExtArgs["result"]["trilha"]>;
export type TrilhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    classe?: boolean | Prisma.ClasseDefaultArgs<ExtArgs>;
    caminhos?: boolean | Prisma.Trilha$caminhosArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Trilha$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Trilha$personagensCampanhaArgs<ExtArgs>;
    habilidadesTrilha?: boolean | Prisma.Trilha$habilidadesTrilhaArgs<ExtArgs>;
    _count?: boolean | Prisma.TrilhaCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $TrilhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Trilha";
    objects: {
        classe: Prisma.$ClassePayload<ExtArgs>;
        caminhos: Prisma.$CaminhoPayload<ExtArgs>[];
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>[];
        habilidadesTrilha: Prisma.$HabilidadeTrilhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        classeId: number;
        nome: string;
        descricao: string | null;
    }, ExtArgs["result"]["trilha"]>;
    composites: {};
};
export type TrilhaGetPayload<S extends boolean | null | undefined | TrilhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TrilhaPayload, S>;
export type TrilhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TrilhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TrilhaCountAggregateInputType | true;
};
export interface TrilhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Trilha'];
        meta: {
            name: 'Trilha';
        };
    };
    findUnique<T extends TrilhaFindUniqueArgs>(args: Prisma.SelectSubset<T, TrilhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TrilhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TrilhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TrilhaFindFirstArgs>(args?: Prisma.SelectSubset<T, TrilhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TrilhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TrilhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TrilhaFindManyArgs>(args?: Prisma.SelectSubset<T, TrilhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TrilhaCreateArgs>(args: Prisma.SelectSubset<T, TrilhaCreateArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TrilhaCreateManyArgs>(args?: Prisma.SelectSubset<T, TrilhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends TrilhaDeleteArgs>(args: Prisma.SelectSubset<T, TrilhaDeleteArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TrilhaUpdateArgs>(args: Prisma.SelectSubset<T, TrilhaUpdateArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TrilhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, TrilhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TrilhaUpdateManyArgs>(args: Prisma.SelectSubset<T, TrilhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends TrilhaUpsertArgs>(args: Prisma.SelectSubset<T, TrilhaUpsertArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TrilhaCountArgs>(args?: Prisma.Subset<T, TrilhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TrilhaCountAggregateOutputType> : number>;
    aggregate<T extends TrilhaAggregateArgs>(args: Prisma.Subset<T, TrilhaAggregateArgs>): Prisma.PrismaPromise<GetTrilhaAggregateType<T>>;
    groupBy<T extends TrilhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TrilhaGroupByArgs['orderBy'];
    } : {
        orderBy?: TrilhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TrilhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrilhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TrilhaFieldRefs;
}
export interface Prisma__TrilhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    classe<T extends Prisma.ClasseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClasseDefaultArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    caminhos<T extends Prisma.Trilha$caminhosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trilha$caminhosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CaminhoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensBase<T extends Prisma.Trilha$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trilha$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Trilha$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trilha$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesTrilha<T extends Prisma.Trilha$habilidadesTrilhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trilha$habilidadesTrilhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TrilhaFieldRefs {
    readonly id: Prisma.FieldRef<"Trilha", 'Int'>;
    readonly classeId: Prisma.FieldRef<"Trilha", 'Int'>;
    readonly nome: Prisma.FieldRef<"Trilha", 'String'>;
    readonly descricao: Prisma.FieldRef<"Trilha", 'String'>;
}
export type TrilhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithRelationInput | Prisma.TrilhaOrderByWithRelationInput[];
    cursor?: Prisma.TrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrilhaScalarFieldEnum | Prisma.TrilhaScalarFieldEnum[];
};
export type TrilhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithRelationInput | Prisma.TrilhaOrderByWithRelationInput[];
    cursor?: Prisma.TrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrilhaScalarFieldEnum | Prisma.TrilhaScalarFieldEnum[];
};
export type TrilhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithRelationInput | Prisma.TrilhaOrderByWithRelationInput[];
    cursor?: Prisma.TrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrilhaScalarFieldEnum | Prisma.TrilhaScalarFieldEnum[];
};
export type TrilhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrilhaCreateInput, Prisma.TrilhaUncheckedCreateInput>;
};
export type TrilhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TrilhaCreateManyInput | Prisma.TrilhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TrilhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrilhaUpdateInput, Prisma.TrilhaUncheckedUpdateInput>;
    where: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TrilhaUpdateManyMutationInput, Prisma.TrilhaUncheckedUpdateManyInput>;
    where?: Prisma.TrilhaWhereInput;
    limit?: number;
};
export type TrilhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where: Prisma.TrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrilhaCreateInput, Prisma.TrilhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TrilhaUpdateInput, Prisma.TrilhaUncheckedUpdateInput>;
};
export type TrilhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where: Prisma.TrilhaWhereUniqueInput;
};
export type TrilhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrilhaWhereInput;
    limit?: number;
};
export type Trilha$caminhosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Trilha$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Trilha$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Trilha$habilidadesTrilhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeTrilhaWhereInput;
    orderBy?: Prisma.HabilidadeTrilhaOrderByWithRelationInput | Prisma.HabilidadeTrilhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeTrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeTrilhaScalarFieldEnum | Prisma.HabilidadeTrilhaScalarFieldEnum[];
};
export type TrilhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
};
export {};
