import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type GrauPersonagemCampanhaModel = runtime.Types.Result.DefaultSelection<Prisma.$GrauPersonagemCampanhaPayload>;
export type AggregateGrauPersonagemCampanha = {
    _count: GrauPersonagemCampanhaCountAggregateOutputType | null;
    _avg: GrauPersonagemCampanhaAvgAggregateOutputType | null;
    _sum: GrauPersonagemCampanhaSumAggregateOutputType | null;
    _min: GrauPersonagemCampanhaMinAggregateOutputType | null;
    _max: GrauPersonagemCampanhaMaxAggregateOutputType | null;
};
export type GrauPersonagemCampanhaAvgAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemCampanhaSumAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemCampanhaMinAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemCampanhaMaxAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemCampanhaCountAggregateOutputType = {
    id: number;
    personagemCampanhaId: number;
    tipoGrauId: number;
    valor: number;
    _all: number;
};
export type GrauPersonagemCampanhaAvgAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemCampanhaSumAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemCampanhaMinAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemCampanhaMaxAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemCampanhaCountAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    tipoGrauId?: true;
    valor?: true;
    _all?: true;
};
export type GrauPersonagemCampanhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
    orderBy?: Prisma.GrauPersonagemCampanhaOrderByWithRelationInput | Prisma.GrauPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | GrauPersonagemCampanhaCountAggregateInputType;
    _avg?: GrauPersonagemCampanhaAvgAggregateInputType;
    _sum?: GrauPersonagemCampanhaSumAggregateInputType;
    _min?: GrauPersonagemCampanhaMinAggregateInputType;
    _max?: GrauPersonagemCampanhaMaxAggregateInputType;
};
export type GetGrauPersonagemCampanhaAggregateType<T extends GrauPersonagemCampanhaAggregateArgs> = {
    [P in keyof T & keyof AggregateGrauPersonagemCampanha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGrauPersonagemCampanha[P]> : Prisma.GetScalarType<T[P], AggregateGrauPersonagemCampanha[P]>;
};
export type GrauPersonagemCampanhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
    orderBy?: Prisma.GrauPersonagemCampanhaOrderByWithAggregationInput | Prisma.GrauPersonagemCampanhaOrderByWithAggregationInput[];
    by: Prisma.GrauPersonagemCampanhaScalarFieldEnum[] | Prisma.GrauPersonagemCampanhaScalarFieldEnum;
    having?: Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GrauPersonagemCampanhaCountAggregateInputType | true;
    _avg?: GrauPersonagemCampanhaAvgAggregateInputType;
    _sum?: GrauPersonagemCampanhaSumAggregateInputType;
    _min?: GrauPersonagemCampanhaMinAggregateInputType;
    _max?: GrauPersonagemCampanhaMaxAggregateInputType;
};
export type GrauPersonagemCampanhaGroupByOutputType = {
    id: number;
    personagemCampanhaId: number;
    tipoGrauId: number;
    valor: number;
    _count: GrauPersonagemCampanhaCountAggregateOutputType | null;
    _avg: GrauPersonagemCampanhaAvgAggregateOutputType | null;
    _sum: GrauPersonagemCampanhaSumAggregateOutputType | null;
    _min: GrauPersonagemCampanhaMinAggregateOutputType | null;
    _max: GrauPersonagemCampanhaMaxAggregateOutputType | null;
};
type GetGrauPersonagemCampanhaGroupByPayload<T extends GrauPersonagemCampanhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GrauPersonagemCampanhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GrauPersonagemCampanhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GrauPersonagemCampanhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GrauPersonagemCampanhaGroupByOutputType[P]>;
}>>;
export type GrauPersonagemCampanhaWhereInput = {
    AND?: Prisma.GrauPersonagemCampanhaWhereInput | Prisma.GrauPersonagemCampanhaWhereInput[];
    OR?: Prisma.GrauPersonagemCampanhaWhereInput[];
    NOT?: Prisma.GrauPersonagemCampanhaWhereInput | Prisma.GrauPersonagemCampanhaWhereInput[];
    id?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    tipoGrau?: Prisma.XOR<Prisma.TipoGrauScalarRelationFilter, Prisma.TipoGrauWhereInput>;
};
export type GrauPersonagemCampanhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
    personagemCampanha?: Prisma.PersonagemCampanhaOrderByWithRelationInput;
    tipoGrau?: Prisma.TipoGrauOrderByWithRelationInput;
};
export type GrauPersonagemCampanhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    personagemCampanhaId_tipoGrauId?: Prisma.GrauPersonagemCampanhaPersonagemCampanhaIdTipoGrauIdCompoundUniqueInput;
    AND?: Prisma.GrauPersonagemCampanhaWhereInput | Prisma.GrauPersonagemCampanhaWhereInput[];
    OR?: Prisma.GrauPersonagemCampanhaWhereInput[];
    NOT?: Prisma.GrauPersonagemCampanhaWhereInput | Prisma.GrauPersonagemCampanhaWhereInput[];
    personagemCampanhaId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    tipoGrau?: Prisma.XOR<Prisma.TipoGrauScalarRelationFilter, Prisma.TipoGrauWhereInput>;
}, "id" | "personagemCampanhaId_tipoGrauId">;
export type GrauPersonagemCampanhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
    _count?: Prisma.GrauPersonagemCampanhaCountOrderByAggregateInput;
    _avg?: Prisma.GrauPersonagemCampanhaAvgOrderByAggregateInput;
    _max?: Prisma.GrauPersonagemCampanhaMaxOrderByAggregateInput;
    _min?: Prisma.GrauPersonagemCampanhaMinOrderByAggregateInput;
    _sum?: Prisma.GrauPersonagemCampanhaSumOrderByAggregateInput;
};
export type GrauPersonagemCampanhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.GrauPersonagemCampanhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"GrauPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntWithAggregatesFilter<"GrauPersonagemCampanha"> | number;
    tipoGrauId?: Prisma.IntWithAggregatesFilter<"GrauPersonagemCampanha"> | number;
    valor?: Prisma.IntWithAggregatesFilter<"GrauPersonagemCampanha"> | number;
};
export type GrauPersonagemCampanhaCreateInput = {
    valor?: number;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutGrausCampanhaInput;
    tipoGrau: Prisma.TipoGrauCreateNestedOneWithoutGrausCampanhaInput;
};
export type GrauPersonagemCampanhaUncheckedCreateInput = {
    id?: number;
    personagemCampanhaId: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaUpdateInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutGrausCampanhaNestedInput;
    tipoGrau?: Prisma.TipoGrauUpdateOneRequiredWithoutGrausCampanhaNestedInput;
};
export type GrauPersonagemCampanhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaCreateManyInput = {
    id?: number;
    personagemCampanhaId: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaUpdateManyMutationInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaListRelationFilter = {
    every?: Prisma.GrauPersonagemCampanhaWhereInput;
    some?: Prisma.GrauPersonagemCampanhaWhereInput;
    none?: Prisma.GrauPersonagemCampanhaWhereInput;
};
export type GrauPersonagemCampanhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaPersonagemCampanhaIdTipoGrauIdCompoundUniqueInput = {
    personagemCampanhaId: number;
    tipoGrauId: number;
};
export type GrauPersonagemCampanhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemCampanhaCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
};
export type GrauPersonagemCampanhaUncheckedCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
};
export type GrauPersonagemCampanhaUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
};
export type GrauPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
};
export type GrauPersonagemCampanhaCreateNestedManyWithoutTipoGrauInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInputEnvelope;
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
};
export type GrauPersonagemCampanhaUncheckedCreateNestedManyWithoutTipoGrauInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInputEnvelope;
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
};
export type GrauPersonagemCampanhaUpdateManyWithoutTipoGrauNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput[];
    upsert?: Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInputEnvelope;
    set?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutTipoGrauInput[];
    updateMany?: Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutTipoGrauInput[];
    deleteMany?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
};
export type GrauPersonagemCampanhaUncheckedUpdateManyWithoutTipoGrauNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput[];
    upsert?: Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInputEnvelope;
    set?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemCampanhaWhereUniqueInput | Prisma.GrauPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutTipoGrauInput[];
    updateMany?: Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutTipoGrauInput | Prisma.GrauPersonagemCampanhaUpdateManyWithWhereWithoutTipoGrauInput[];
    deleteMany?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
};
export type GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput = {
    valor?: number;
    tipoGrau: Prisma.TipoGrauCreateNestedOneWithoutGrausCampanhaInput;
};
export type GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput = {
    id?: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type GrauPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope = {
    data: Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInput | Prisma.GrauPersonagemCampanhaCreateManyPersonagemCampanhaInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
    create: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
};
export type GrauPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput = {
    where: Prisma.GrauPersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateManyMutationInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput>;
};
export type GrauPersonagemCampanhaScalarWhereInput = {
    AND?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
    OR?: Prisma.GrauPersonagemCampanhaScalarWhereInput[];
    NOT?: Prisma.GrauPersonagemCampanhaScalarWhereInput | Prisma.GrauPersonagemCampanhaScalarWhereInput[];
    id?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemCampanha"> | number;
};
export type GrauPersonagemCampanhaCreateWithoutTipoGrauInput = {
    valor?: number;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutGrausCampanhaInput;
};
export type GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput = {
    id?: number;
    personagemCampanhaId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaCreateOrConnectWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput>;
};
export type GrauPersonagemCampanhaCreateManyTipoGrauInputEnvelope = {
    data: Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInput | Prisma.GrauPersonagemCampanhaCreateManyTipoGrauInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemCampanhaUpsertWithWhereUniqueWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateWithoutTipoGrauInput>;
    create: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedCreateWithoutTipoGrauInput>;
};
export type GrauPersonagemCampanhaUpdateWithWhereUniqueWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateWithoutTipoGrauInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateWithoutTipoGrauInput>;
};
export type GrauPersonagemCampanhaUpdateManyWithWhereWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateManyMutationInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateManyWithoutTipoGrauInput>;
};
export type GrauPersonagemCampanhaCreateManyPersonagemCampanhaInput = {
    id?: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrau?: Prisma.TipoGrauUpdateOneRequiredWithoutGrausCampanhaNestedInput;
};
export type GrauPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaCreateManyTipoGrauInput = {
    id?: number;
    personagemCampanhaId: number;
    valor?: number;
};
export type GrauPersonagemCampanhaUpdateWithoutTipoGrauInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutGrausCampanhaNestedInput;
};
export type GrauPersonagemCampanhaUncheckedUpdateWithoutTipoGrauInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaUncheckedUpdateManyWithoutTipoGrauInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemCampanhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemCampanhaId?: boolean;
    tipoGrauId?: boolean;
    valor?: boolean;
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    tipoGrau?: boolean | Prisma.TipoGrauDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["grauPersonagemCampanha"]>;
export type GrauPersonagemCampanhaSelectScalar = {
    id?: boolean;
    personagemCampanhaId?: boolean;
    tipoGrauId?: boolean;
    valor?: boolean;
};
export type GrauPersonagemCampanhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemCampanhaId" | "tipoGrauId" | "valor", ExtArgs["result"]["grauPersonagemCampanha"]>;
export type GrauPersonagemCampanhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    tipoGrau?: boolean | Prisma.TipoGrauDefaultArgs<ExtArgs>;
};
export type $GrauPersonagemCampanhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GrauPersonagemCampanha";
    objects: {
        personagemCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>;
        tipoGrau: Prisma.$TipoGrauPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemCampanhaId: number;
        tipoGrauId: number;
        valor: number;
    }, ExtArgs["result"]["grauPersonagemCampanha"]>;
    composites: {};
};
export type GrauPersonagemCampanhaGetPayload<S extends boolean | null | undefined | GrauPersonagemCampanhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload, S>;
export type GrauPersonagemCampanhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GrauPersonagemCampanhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GrauPersonagemCampanhaCountAggregateInputType | true;
};
export interface GrauPersonagemCampanhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GrauPersonagemCampanha'];
        meta: {
            name: 'GrauPersonagemCampanha';
        };
    };
    findUnique<T extends GrauPersonagemCampanhaFindUniqueArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends GrauPersonagemCampanhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends GrauPersonagemCampanhaFindFirstArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemCampanhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends GrauPersonagemCampanhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends GrauPersonagemCampanhaFindManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemCampanhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends GrauPersonagemCampanhaCreateArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaCreateArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends GrauPersonagemCampanhaCreateManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemCampanhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends GrauPersonagemCampanhaDeleteArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaDeleteArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends GrauPersonagemCampanhaUpdateArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaUpdateArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends GrauPersonagemCampanhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemCampanhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends GrauPersonagemCampanhaUpdateManyArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends GrauPersonagemCampanhaUpsertArgs>(args: Prisma.SelectSubset<T, GrauPersonagemCampanhaUpsertArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemCampanhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends GrauPersonagemCampanhaCountArgs>(args?: Prisma.Subset<T, GrauPersonagemCampanhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GrauPersonagemCampanhaCountAggregateOutputType> : number>;
    aggregate<T extends GrauPersonagemCampanhaAggregateArgs>(args: Prisma.Subset<T, GrauPersonagemCampanhaAggregateArgs>): Prisma.PrismaPromise<GetGrauPersonagemCampanhaAggregateType<T>>;
    groupBy<T extends GrauPersonagemCampanhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GrauPersonagemCampanhaGroupByArgs['orderBy'];
    } : {
        orderBy?: GrauPersonagemCampanhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GrauPersonagemCampanhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGrauPersonagemCampanhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: GrauPersonagemCampanhaFieldRefs;
}
export interface Prisma__GrauPersonagemCampanhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemCampanha<T extends Prisma.PersonagemCampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tipoGrau<T extends Prisma.TipoGrauDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoGrauDefaultArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface GrauPersonagemCampanhaFieldRefs {
    readonly id: Prisma.FieldRef<"GrauPersonagemCampanha", 'Int'>;
    readonly personagemCampanhaId: Prisma.FieldRef<"GrauPersonagemCampanha", 'Int'>;
    readonly tipoGrauId: Prisma.FieldRef<"GrauPersonagemCampanha", 'Int'>;
    readonly valor: Prisma.FieldRef<"GrauPersonagemCampanha", 'Int'>;
}
export type GrauPersonagemCampanhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
};
export type GrauPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
};
export type GrauPersonagemCampanhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemCampanhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemCampanhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateInput, Prisma.GrauPersonagemCampanhaUncheckedCreateInput>;
};
export type GrauPersonagemCampanhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.GrauPersonagemCampanhaCreateManyInput | Prisma.GrauPersonagemCampanhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemCampanhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateInput>;
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
};
export type GrauPersonagemCampanhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateManyMutationInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateManyInput>;
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
    limit?: number;
};
export type GrauPersonagemCampanhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemCampanhaCreateInput, Prisma.GrauPersonagemCampanhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.GrauPersonagemCampanhaUpdateInput, Prisma.GrauPersonagemCampanhaUncheckedUpdateInput>;
};
export type GrauPersonagemCampanhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemCampanhaWhereUniqueInput;
};
export type GrauPersonagemCampanhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemCampanhaWhereInput;
    limit?: number;
};
export type GrauPersonagemCampanhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemCampanhaInclude<ExtArgs> | null;
};
export {};
