import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type GrauPersonagemBaseModel = runtime.Types.Result.DefaultSelection<Prisma.$GrauPersonagemBasePayload>;
export type AggregateGrauPersonagemBase = {
    _count: GrauPersonagemBaseCountAggregateOutputType | null;
    _avg: GrauPersonagemBaseAvgAggregateOutputType | null;
    _sum: GrauPersonagemBaseSumAggregateOutputType | null;
    _min: GrauPersonagemBaseMinAggregateOutputType | null;
    _max: GrauPersonagemBaseMaxAggregateOutputType | null;
};
export type GrauPersonagemBaseAvgAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemBaseSumAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemBaseMinAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemBaseMaxAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    tipoGrauId: number | null;
    valor: number | null;
};
export type GrauPersonagemBaseCountAggregateOutputType = {
    id: number;
    personagemBaseId: number;
    tipoGrauId: number;
    valor: number;
    _all: number;
};
export type GrauPersonagemBaseAvgAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemBaseSumAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemBaseMinAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemBaseMaxAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    tipoGrauId?: true;
    valor?: true;
};
export type GrauPersonagemBaseCountAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    tipoGrauId?: true;
    valor?: true;
    _all?: true;
};
export type GrauPersonagemBaseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemBaseWhereInput;
    orderBy?: Prisma.GrauPersonagemBaseOrderByWithRelationInput | Prisma.GrauPersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.GrauPersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | GrauPersonagemBaseCountAggregateInputType;
    _avg?: GrauPersonagemBaseAvgAggregateInputType;
    _sum?: GrauPersonagemBaseSumAggregateInputType;
    _min?: GrauPersonagemBaseMinAggregateInputType;
    _max?: GrauPersonagemBaseMaxAggregateInputType;
};
export type GetGrauPersonagemBaseAggregateType<T extends GrauPersonagemBaseAggregateArgs> = {
    [P in keyof T & keyof AggregateGrauPersonagemBase]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGrauPersonagemBase[P]> : Prisma.GetScalarType<T[P], AggregateGrauPersonagemBase[P]>;
};
export type GrauPersonagemBaseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemBaseWhereInput;
    orderBy?: Prisma.GrauPersonagemBaseOrderByWithAggregationInput | Prisma.GrauPersonagemBaseOrderByWithAggregationInput[];
    by: Prisma.GrauPersonagemBaseScalarFieldEnum[] | Prisma.GrauPersonagemBaseScalarFieldEnum;
    having?: Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GrauPersonagemBaseCountAggregateInputType | true;
    _avg?: GrauPersonagemBaseAvgAggregateInputType;
    _sum?: GrauPersonagemBaseSumAggregateInputType;
    _min?: GrauPersonagemBaseMinAggregateInputType;
    _max?: GrauPersonagemBaseMaxAggregateInputType;
};
export type GrauPersonagemBaseGroupByOutputType = {
    id: number;
    personagemBaseId: number;
    tipoGrauId: number;
    valor: number;
    _count: GrauPersonagemBaseCountAggregateOutputType | null;
    _avg: GrauPersonagemBaseAvgAggregateOutputType | null;
    _sum: GrauPersonagemBaseSumAggregateOutputType | null;
    _min: GrauPersonagemBaseMinAggregateOutputType | null;
    _max: GrauPersonagemBaseMaxAggregateOutputType | null;
};
type GetGrauPersonagemBaseGroupByPayload<T extends GrauPersonagemBaseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GrauPersonagemBaseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GrauPersonagemBaseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GrauPersonagemBaseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GrauPersonagemBaseGroupByOutputType[P]>;
}>>;
export type GrauPersonagemBaseWhereInput = {
    AND?: Prisma.GrauPersonagemBaseWhereInput | Prisma.GrauPersonagemBaseWhereInput[];
    OR?: Prisma.GrauPersonagemBaseWhereInput[];
    NOT?: Prisma.GrauPersonagemBaseWhereInput | Prisma.GrauPersonagemBaseWhereInput[];
    id?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    personagemBaseId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    personagemBase?: Prisma.XOR<Prisma.PersonagemBaseScalarRelationFilter, Prisma.PersonagemBaseWhereInput>;
    tipoGrau?: Prisma.XOR<Prisma.TipoGrauScalarRelationFilter, Prisma.TipoGrauWhereInput>;
};
export type GrauPersonagemBaseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
    personagemBase?: Prisma.PersonagemBaseOrderByWithRelationInput;
    tipoGrau?: Prisma.TipoGrauOrderByWithRelationInput;
};
export type GrauPersonagemBaseWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    personagemBaseId_tipoGrauId?: Prisma.GrauPersonagemBasePersonagemBaseIdTipoGrauIdCompoundUniqueInput;
    AND?: Prisma.GrauPersonagemBaseWhereInput | Prisma.GrauPersonagemBaseWhereInput[];
    OR?: Prisma.GrauPersonagemBaseWhereInput[];
    NOT?: Prisma.GrauPersonagemBaseWhereInput | Prisma.GrauPersonagemBaseWhereInput[];
    personagemBaseId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    personagemBase?: Prisma.XOR<Prisma.PersonagemBaseScalarRelationFilter, Prisma.PersonagemBaseWhereInput>;
    tipoGrau?: Prisma.XOR<Prisma.TipoGrauScalarRelationFilter, Prisma.TipoGrauWhereInput>;
}, "id" | "personagemBaseId_tipoGrauId">;
export type GrauPersonagemBaseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
    _count?: Prisma.GrauPersonagemBaseCountOrderByAggregateInput;
    _avg?: Prisma.GrauPersonagemBaseAvgOrderByAggregateInput;
    _max?: Prisma.GrauPersonagemBaseMaxOrderByAggregateInput;
    _min?: Prisma.GrauPersonagemBaseMinOrderByAggregateInput;
    _sum?: Prisma.GrauPersonagemBaseSumOrderByAggregateInput;
};
export type GrauPersonagemBaseScalarWhereWithAggregatesInput = {
    AND?: Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput | Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput[];
    OR?: Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput | Prisma.GrauPersonagemBaseScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"GrauPersonagemBase"> | number;
    personagemBaseId?: Prisma.IntWithAggregatesFilter<"GrauPersonagemBase"> | number;
    tipoGrauId?: Prisma.IntWithAggregatesFilter<"GrauPersonagemBase"> | number;
    valor?: Prisma.IntWithAggregatesFilter<"GrauPersonagemBase"> | number;
};
export type GrauPersonagemBaseCreateInput = {
    valor?: number;
    personagemBase: Prisma.PersonagemBaseCreateNestedOneWithoutGrausBaseInput;
    tipoGrau: Prisma.TipoGrauCreateNestedOneWithoutGrausBaseInput;
};
export type GrauPersonagemBaseUncheckedCreateInput = {
    id?: number;
    personagemBaseId: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemBaseUpdateInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBase?: Prisma.PersonagemBaseUpdateOneRequiredWithoutGrausBaseNestedInput;
    tipoGrau?: Prisma.TipoGrauUpdateOneRequiredWithoutGrausBaseNestedInput;
};
export type GrauPersonagemBaseUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseCreateManyInput = {
    id?: number;
    personagemBaseId: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemBaseUpdateManyMutationInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseListRelationFilter = {
    every?: Prisma.GrauPersonagemBaseWhereInput;
    some?: Prisma.GrauPersonagemBaseWhereInput;
    none?: Prisma.GrauPersonagemBaseWhereInput;
};
export type GrauPersonagemBaseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GrauPersonagemBasePersonagemBaseIdTipoGrauIdCompoundUniqueInput = {
    personagemBaseId: number;
    tipoGrauId: number;
};
export type GrauPersonagemBaseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemBaseAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemBaseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemBaseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemBaseSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    tipoGrauId?: Prisma.SortOrder;
    valor?: Prisma.SortOrder;
};
export type GrauPersonagemBaseCreateNestedManyWithoutPersonagemBaseInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
};
export type GrauPersonagemBaseUncheckedCreateNestedManyWithoutPersonagemBaseInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
};
export type GrauPersonagemBaseUpdateManyWithoutPersonagemBaseNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    upsert?: Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    set?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    update?: Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput[];
    updateMany?: Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput[];
    deleteMany?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
};
export type GrauPersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    upsert?: Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    set?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    update?: Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput[];
    updateMany?: Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput | Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput[];
    deleteMany?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
};
export type GrauPersonagemBaseCreateNestedManyWithoutTipoGrauInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyTipoGrauInputEnvelope;
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
};
export type GrauPersonagemBaseUncheckedCreateNestedManyWithoutTipoGrauInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyTipoGrauInputEnvelope;
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
};
export type GrauPersonagemBaseUpdateManyWithoutTipoGrauNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput[];
    upsert?: Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyTipoGrauInputEnvelope;
    set?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    update?: Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutTipoGrauInput[];
    updateMany?: Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutTipoGrauInput[];
    deleteMany?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
};
export type GrauPersonagemBaseUncheckedUpdateManyWithoutTipoGrauNestedInput = {
    create?: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput> | Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput[] | Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput[];
    connectOrCreate?: Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput | Prisma.GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput[];
    upsert?: Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpsertWithWhereUniqueWithoutTipoGrauInput[];
    createMany?: Prisma.GrauPersonagemBaseCreateManyTipoGrauInputEnvelope;
    set?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    delete?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    connect?: Prisma.GrauPersonagemBaseWhereUniqueInput | Prisma.GrauPersonagemBaseWhereUniqueInput[];
    update?: Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpdateWithWhereUniqueWithoutTipoGrauInput[];
    updateMany?: Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutTipoGrauInput | Prisma.GrauPersonagemBaseUpdateManyWithWhereWithoutTipoGrauInput[];
    deleteMany?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
};
export type GrauPersonagemBaseCreateWithoutPersonagemBaseInput = {
    valor?: number;
    tipoGrau: Prisma.TipoGrauCreateNestedOneWithoutGrausBaseInput;
};
export type GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput = {
    id?: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemBaseCreateOrConnectWithoutPersonagemBaseInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput>;
};
export type GrauPersonagemBaseCreateManyPersonagemBaseInputEnvelope = {
    data: Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInput | Prisma.GrauPersonagemBaseCreateManyPersonagemBaseInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    update: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput>;
    create: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutPersonagemBaseInput>;
};
export type GrauPersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateWithoutPersonagemBaseInput, Prisma.GrauPersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput>;
};
export type GrauPersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput = {
    where: Prisma.GrauPersonagemBaseScalarWhereInput;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateManyMutationInput, Prisma.GrauPersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseInput>;
};
export type GrauPersonagemBaseScalarWhereInput = {
    AND?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
    OR?: Prisma.GrauPersonagemBaseScalarWhereInput[];
    NOT?: Prisma.GrauPersonagemBaseScalarWhereInput | Prisma.GrauPersonagemBaseScalarWhereInput[];
    id?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    personagemBaseId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    tipoGrauId?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
    valor?: Prisma.IntFilter<"GrauPersonagemBase"> | number;
};
export type GrauPersonagemBaseCreateWithoutTipoGrauInput = {
    valor?: number;
    personagemBase: Prisma.PersonagemBaseCreateNestedOneWithoutGrausBaseInput;
};
export type GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput = {
    id?: number;
    personagemBaseId: number;
    valor?: number;
};
export type GrauPersonagemBaseCreateOrConnectWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput>;
};
export type GrauPersonagemBaseCreateManyTipoGrauInputEnvelope = {
    data: Prisma.GrauPersonagemBaseCreateManyTipoGrauInput | Prisma.GrauPersonagemBaseCreateManyTipoGrauInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemBaseUpsertWithWhereUniqueWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    update: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedUpdateWithoutTipoGrauInput>;
    create: Prisma.XOR<Prisma.GrauPersonagemBaseCreateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedCreateWithoutTipoGrauInput>;
};
export type GrauPersonagemBaseUpdateWithWhereUniqueWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateWithoutTipoGrauInput, Prisma.GrauPersonagemBaseUncheckedUpdateWithoutTipoGrauInput>;
};
export type GrauPersonagemBaseUpdateManyWithWhereWithoutTipoGrauInput = {
    where: Prisma.GrauPersonagemBaseScalarWhereInput;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateManyMutationInput, Prisma.GrauPersonagemBaseUncheckedUpdateManyWithoutTipoGrauInput>;
};
export type GrauPersonagemBaseCreateManyPersonagemBaseInput = {
    id?: number;
    tipoGrauId: number;
    valor?: number;
};
export type GrauPersonagemBaseUpdateWithoutPersonagemBaseInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrau?: Prisma.TipoGrauUpdateOneRequiredWithoutGrausBaseNestedInput;
};
export type GrauPersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoGrauId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseCreateManyTipoGrauInput = {
    id?: number;
    personagemBaseId: number;
    valor?: number;
};
export type GrauPersonagemBaseUpdateWithoutTipoGrauInput = {
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBase?: Prisma.PersonagemBaseUpdateOneRequiredWithoutGrausBaseNestedInput;
};
export type GrauPersonagemBaseUncheckedUpdateWithoutTipoGrauInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseUncheckedUpdateManyWithoutTipoGrauInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    valor?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GrauPersonagemBaseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemBaseId?: boolean;
    tipoGrauId?: boolean;
    valor?: boolean;
    personagemBase?: boolean | Prisma.PersonagemBaseDefaultArgs<ExtArgs>;
    tipoGrau?: boolean | Prisma.TipoGrauDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["grauPersonagemBase"]>;
export type GrauPersonagemBaseSelectScalar = {
    id?: boolean;
    personagemBaseId?: boolean;
    tipoGrauId?: boolean;
    valor?: boolean;
};
export type GrauPersonagemBaseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemBaseId" | "tipoGrauId" | "valor", ExtArgs["result"]["grauPersonagemBase"]>;
export type GrauPersonagemBaseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemBase?: boolean | Prisma.PersonagemBaseDefaultArgs<ExtArgs>;
    tipoGrau?: boolean | Prisma.TipoGrauDefaultArgs<ExtArgs>;
};
export type $GrauPersonagemBasePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GrauPersonagemBase";
    objects: {
        personagemBase: Prisma.$PersonagemBasePayload<ExtArgs>;
        tipoGrau: Prisma.$TipoGrauPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemBaseId: number;
        tipoGrauId: number;
        valor: number;
    }, ExtArgs["result"]["grauPersonagemBase"]>;
    composites: {};
};
export type GrauPersonagemBaseGetPayload<S extends boolean | null | undefined | GrauPersonagemBaseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload, S>;
export type GrauPersonagemBaseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GrauPersonagemBaseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GrauPersonagemBaseCountAggregateInputType | true;
};
export interface GrauPersonagemBaseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GrauPersonagemBase'];
        meta: {
            name: 'GrauPersonagemBase';
        };
    };
    findUnique<T extends GrauPersonagemBaseFindUniqueArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends GrauPersonagemBaseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends GrauPersonagemBaseFindFirstArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemBaseFindFirstArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends GrauPersonagemBaseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemBaseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends GrauPersonagemBaseFindManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemBaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends GrauPersonagemBaseCreateArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseCreateArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends GrauPersonagemBaseCreateManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemBaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends GrauPersonagemBaseDeleteArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseDeleteArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends GrauPersonagemBaseUpdateArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseUpdateArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends GrauPersonagemBaseDeleteManyArgs>(args?: Prisma.SelectSubset<T, GrauPersonagemBaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends GrauPersonagemBaseUpdateManyArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends GrauPersonagemBaseUpsertArgs>(args: Prisma.SelectSubset<T, GrauPersonagemBaseUpsertArgs<ExtArgs>>): Prisma.Prisma__GrauPersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$GrauPersonagemBasePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends GrauPersonagemBaseCountArgs>(args?: Prisma.Subset<T, GrauPersonagemBaseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GrauPersonagemBaseCountAggregateOutputType> : number>;
    aggregate<T extends GrauPersonagemBaseAggregateArgs>(args: Prisma.Subset<T, GrauPersonagemBaseAggregateArgs>): Prisma.PrismaPromise<GetGrauPersonagemBaseAggregateType<T>>;
    groupBy<T extends GrauPersonagemBaseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GrauPersonagemBaseGroupByArgs['orderBy'];
    } : {
        orderBy?: GrauPersonagemBaseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GrauPersonagemBaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGrauPersonagemBaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: GrauPersonagemBaseFieldRefs;
}
export interface Prisma__GrauPersonagemBaseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemBase<T extends Prisma.PersonagemBaseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemBaseDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tipoGrau<T extends Prisma.TipoGrauDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoGrauDefaultArgs<ExtArgs>>): Prisma.Prisma__TipoGrauClient<runtime.Types.Result.GetResult<Prisma.$TipoGrauPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface GrauPersonagemBaseFieldRefs {
    readonly id: Prisma.FieldRef<"GrauPersonagemBase", 'Int'>;
    readonly personagemBaseId: Prisma.FieldRef<"GrauPersonagemBase", 'Int'>;
    readonly tipoGrauId: Prisma.FieldRef<"GrauPersonagemBase", 'Int'>;
    readonly valor: Prisma.FieldRef<"GrauPersonagemBase", 'Int'>;
}
export type GrauPersonagemBaseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
};
export type GrauPersonagemBaseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
};
export type GrauPersonagemBaseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemBaseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemBaseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type GrauPersonagemBaseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseCreateInput, Prisma.GrauPersonagemBaseUncheckedCreateInput>;
};
export type GrauPersonagemBaseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.GrauPersonagemBaseCreateManyInput | Prisma.GrauPersonagemBaseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type GrauPersonagemBaseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateInput, Prisma.GrauPersonagemBaseUncheckedUpdateInput>;
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
};
export type GrauPersonagemBaseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateManyMutationInput, Prisma.GrauPersonagemBaseUncheckedUpdateManyInput>;
    where?: Prisma.GrauPersonagemBaseWhereInput;
    limit?: number;
};
export type GrauPersonagemBaseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrauPersonagemBaseCreateInput, Prisma.GrauPersonagemBaseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.GrauPersonagemBaseUpdateInput, Prisma.GrauPersonagemBaseUncheckedUpdateInput>;
};
export type GrauPersonagemBaseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.GrauPersonagemBaseWhereUniqueInput;
};
export type GrauPersonagemBaseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrauPersonagemBaseWhereInput;
    limit?: number;
};
export type GrauPersonagemBaseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrauPersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.GrauPersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.GrauPersonagemBaseInclude<ExtArgs> | null;
};
export {};
