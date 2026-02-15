import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadePersonagemBaseModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadePersonagemBasePayload>;
export type AggregateHabilidadePersonagemBase = {
    _count: HabilidadePersonagemBaseCountAggregateOutputType | null;
    _avg: HabilidadePersonagemBaseAvgAggregateOutputType | null;
    _sum: HabilidadePersonagemBaseSumAggregateOutputType | null;
    _min: HabilidadePersonagemBaseMinAggregateOutputType | null;
    _max: HabilidadePersonagemBaseMaxAggregateOutputType | null;
};
export type HabilidadePersonagemBaseAvgAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemBaseSumAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemBaseMinAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemBaseMaxAggregateOutputType = {
    id: number | null;
    personagemBaseId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemBaseCountAggregateOutputType = {
    id: number;
    personagemBaseId: number;
    habilidadeId: number;
    _all: number;
};
export type HabilidadePersonagemBaseAvgAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemBaseSumAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemBaseMinAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemBaseMaxAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemBaseCountAggregateInputType = {
    id?: true;
    personagemBaseId?: true;
    habilidadeId?: true;
    _all?: true;
};
export type HabilidadePersonagemBaseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithRelationInput | Prisma.HabilidadePersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadePersonagemBaseCountAggregateInputType;
    _avg?: HabilidadePersonagemBaseAvgAggregateInputType;
    _sum?: HabilidadePersonagemBaseSumAggregateInputType;
    _min?: HabilidadePersonagemBaseMinAggregateInputType;
    _max?: HabilidadePersonagemBaseMaxAggregateInputType;
};
export type GetHabilidadePersonagemBaseAggregateType<T extends HabilidadePersonagemBaseAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidadePersonagemBase]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidadePersonagemBase[P]> : Prisma.GetScalarType<T[P], AggregateHabilidadePersonagemBase[P]>;
};
export type HabilidadePersonagemBaseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithAggregationInput | Prisma.HabilidadePersonagemBaseOrderByWithAggregationInput[];
    by: Prisma.HabilidadePersonagemBaseScalarFieldEnum[] | Prisma.HabilidadePersonagemBaseScalarFieldEnum;
    having?: Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadePersonagemBaseCountAggregateInputType | true;
    _avg?: HabilidadePersonagemBaseAvgAggregateInputType;
    _sum?: HabilidadePersonagemBaseSumAggregateInputType;
    _min?: HabilidadePersonagemBaseMinAggregateInputType;
    _max?: HabilidadePersonagemBaseMaxAggregateInputType;
};
export type HabilidadePersonagemBaseGroupByOutputType = {
    id: number;
    personagemBaseId: number;
    habilidadeId: number;
    _count: HabilidadePersonagemBaseCountAggregateOutputType | null;
    _avg: HabilidadePersonagemBaseAvgAggregateOutputType | null;
    _sum: HabilidadePersonagemBaseSumAggregateOutputType | null;
    _min: HabilidadePersonagemBaseMinAggregateOutputType | null;
    _max: HabilidadePersonagemBaseMaxAggregateOutputType | null;
};
type GetHabilidadePersonagemBaseGroupByPayload<T extends HabilidadePersonagemBaseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadePersonagemBaseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadePersonagemBaseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadePersonagemBaseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadePersonagemBaseGroupByOutputType[P]>;
}>>;
export type HabilidadePersonagemBaseWhereInput = {
    AND?: Prisma.HabilidadePersonagemBaseWhereInput | Prisma.HabilidadePersonagemBaseWhereInput[];
    OR?: Prisma.HabilidadePersonagemBaseWhereInput[];
    NOT?: Prisma.HabilidadePersonagemBaseWhereInput | Prisma.HabilidadePersonagemBaseWhereInput[];
    id?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    personagemBaseId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    personagemBase?: Prisma.XOR<Prisma.PersonagemBaseScalarRelationFilter, Prisma.PersonagemBaseWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
};
export type HabilidadePersonagemBaseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    personagemBase?: Prisma.PersonagemBaseOrderByWithRelationInput;
    habilidade?: Prisma.HabilidadeOrderByWithRelationInput;
};
export type HabilidadePersonagemBaseWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    personagemBaseId_habilidadeId?: Prisma.HabilidadePersonagemBasePersonagemBaseIdHabilidadeIdCompoundUniqueInput;
    AND?: Prisma.HabilidadePersonagemBaseWhereInput | Prisma.HabilidadePersonagemBaseWhereInput[];
    OR?: Prisma.HabilidadePersonagemBaseWhereInput[];
    NOT?: Prisma.HabilidadePersonagemBaseWhereInput | Prisma.HabilidadePersonagemBaseWhereInput[];
    personagemBaseId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    personagemBase?: Prisma.XOR<Prisma.PersonagemBaseScalarRelationFilter, Prisma.PersonagemBaseWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
}, "id" | "personagemBaseId_habilidadeId">;
export type HabilidadePersonagemBaseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    _count?: Prisma.HabilidadePersonagemBaseCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadePersonagemBaseAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadePersonagemBaseMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadePersonagemBaseMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadePersonagemBaseSumOrderByAggregateInput;
};
export type HabilidadePersonagemBaseScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput | Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput | Prisma.HabilidadePersonagemBaseScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemBase"> | number;
    personagemBaseId?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemBase"> | number;
    habilidadeId?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemBase"> | number;
};
export type HabilidadePersonagemBaseCreateInput = {
    personagemBase: Prisma.PersonagemBaseCreateNestedOneWithoutHabilidadesBaseInput;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutPersonagensBaseInput;
};
export type HabilidadePersonagemBaseUncheckedCreateInput = {
    id?: number;
    personagemBaseId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemBaseUpdateInput = {
    personagemBase?: Prisma.PersonagemBaseUpdateOneRequiredWithoutHabilidadesBaseNestedInput;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutPersonagensBaseNestedInput;
};
export type HabilidadePersonagemBaseUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseCreateManyInput = {
    id?: number;
    personagemBaseId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemBaseUpdateManyMutationInput = {};
export type HabilidadePersonagemBaseUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseListRelationFilter = {
    every?: Prisma.HabilidadePersonagemBaseWhereInput;
    some?: Prisma.HabilidadePersonagemBaseWhereInput;
    none?: Prisma.HabilidadePersonagemBaseWhereInput;
};
export type HabilidadePersonagemBaseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HabilidadePersonagemBasePersonagemBaseIdHabilidadeIdCompoundUniqueInput = {
    personagemBaseId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemBaseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemBaseAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemBaseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemBaseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemBaseSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemBaseId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemBaseCreateNestedManyWithoutPersonagemBaseInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
};
export type HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutPersonagemBaseInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
};
export type HabilidadePersonagemBaseUpdateManyWithoutPersonagemBaseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    upsert?: Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    set?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput[];
    updateMany?: Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput[];
    deleteMany?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
};
export type HabilidadePersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput> | Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput[];
    upsert?: Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInputEnvelope;
    set?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput[];
    updateMany?: Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput | Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput[];
    deleteMany?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
};
export type HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
};
export type HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
};
export type HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
};
export type HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemBaseWhereUniqueInput | Prisma.HabilidadePersonagemBaseWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadePersonagemBaseUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
};
export type HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput = {
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutPersonagensBaseInput;
};
export type HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadePersonagemBaseCreateOrConnectWithoutPersonagemBaseInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput>;
};
export type HabilidadePersonagemBaseCreateManyPersonagemBaseInputEnvelope = {
    data: Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInput | Prisma.HabilidadePersonagemBaseCreateManyPersonagemBaseInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutPersonagemBaseInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput>;
    create: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutPersonagemBaseInput>;
};
export type HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutPersonagemBaseInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateWithoutPersonagemBaseInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput>;
};
export type HabilidadePersonagemBaseUpdateManyWithWhereWithoutPersonagemBaseInput = {
    where: Prisma.HabilidadePersonagemBaseScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateManyMutationInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseInput>;
};
export type HabilidadePersonagemBaseScalarWhereInput = {
    AND?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
    OR?: Prisma.HabilidadePersonagemBaseScalarWhereInput[];
    NOT?: Prisma.HabilidadePersonagemBaseScalarWhereInput | Prisma.HabilidadePersonagemBaseScalarWhereInput[];
    id?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    personagemBaseId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemBase"> | number;
};
export type HabilidadePersonagemBaseCreateWithoutHabilidadeInput = {
    personagemBase: Prisma.PersonagemBaseCreateNestedOneWithoutHabilidadesBaseInput;
};
export type HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput = {
    id?: number;
    personagemBaseId: number;
};
export type HabilidadePersonagemBaseCreateOrConnectWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemBaseCreateManyHabilidadeInputEnvelope = {
    data: Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInput | Prisma.HabilidadePersonagemBaseCreateManyHabilidadeInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemBaseUpsertWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateWithoutHabilidadeInput>;
    create: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemBaseUpdateWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateWithoutHabilidadeInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemBaseUpdateManyWithWhereWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemBaseScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateManyMutationInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeInput>;
};
export type HabilidadePersonagemBaseCreateManyPersonagemBaseInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadePersonagemBaseUpdateWithoutPersonagemBaseInput = {
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutPersonagensBaseNestedInput;
};
export type HabilidadePersonagemBaseUncheckedUpdateWithoutPersonagemBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseUncheckedUpdateManyWithoutPersonagemBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseCreateManyHabilidadeInput = {
    id?: number;
    personagemBaseId: number;
};
export type HabilidadePersonagemBaseUpdateWithoutHabilidadeInput = {
    personagemBase?: Prisma.PersonagemBaseUpdateOneRequiredWithoutHabilidadesBaseNestedInput;
};
export type HabilidadePersonagemBaseUncheckedUpdateWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemBaseId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemBaseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemBaseId?: boolean;
    habilidadeId?: boolean;
    personagemBase?: boolean | Prisma.PersonagemBaseDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidadePersonagemBase"]>;
export type HabilidadePersonagemBaseSelectScalar = {
    id?: boolean;
    personagemBaseId?: boolean;
    habilidadeId?: boolean;
};
export type HabilidadePersonagemBaseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemBaseId" | "habilidadeId", ExtArgs["result"]["habilidadePersonagemBase"]>;
export type HabilidadePersonagemBaseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemBase?: boolean | Prisma.PersonagemBaseDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
};
export type $HabilidadePersonagemBasePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HabilidadePersonagemBase";
    objects: {
        personagemBase: Prisma.$PersonagemBasePayload<ExtArgs>;
        habilidade: Prisma.$HabilidadePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemBaseId: number;
        habilidadeId: number;
    }, ExtArgs["result"]["habilidadePersonagemBase"]>;
    composites: {};
};
export type HabilidadePersonagemBaseGetPayload<S extends boolean | null | undefined | HabilidadePersonagemBaseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload, S>;
export type HabilidadePersonagemBaseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadePersonagemBaseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadePersonagemBaseCountAggregateInputType | true;
};
export interface HabilidadePersonagemBaseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HabilidadePersonagemBase'];
        meta: {
            name: 'HabilidadePersonagemBase';
        };
    };
    findUnique<T extends HabilidadePersonagemBaseFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadePersonagemBaseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadePersonagemBaseFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemBaseFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadePersonagemBaseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemBaseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadePersonagemBaseFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemBaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadePersonagemBaseCreateArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadePersonagemBaseCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemBaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadePersonagemBaseDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadePersonagemBaseUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadePersonagemBaseDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemBaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadePersonagemBaseUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadePersonagemBaseUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemBaseUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadePersonagemBaseCountArgs>(args?: Prisma.Subset<T, HabilidadePersonagemBaseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadePersonagemBaseCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadePersonagemBaseAggregateArgs>(args: Prisma.Subset<T, HabilidadePersonagemBaseAggregateArgs>): Prisma.PrismaPromise<GetHabilidadePersonagemBaseAggregateType<T>>;
    groupBy<T extends HabilidadePersonagemBaseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadePersonagemBaseGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadePersonagemBaseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadePersonagemBaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadePersonagemBaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadePersonagemBaseFieldRefs;
}
export interface Prisma__HabilidadePersonagemBaseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemBase<T extends Prisma.PersonagemBaseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemBaseDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemBaseClient<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    habilidade<T extends Prisma.HabilidadeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.HabilidadeDefaultArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadePersonagemBaseFieldRefs {
    readonly id: Prisma.FieldRef<"HabilidadePersonagemBase", 'Int'>;
    readonly personagemBaseId: Prisma.FieldRef<"HabilidadePersonagemBase", 'Int'>;
    readonly habilidadeId: Prisma.FieldRef<"HabilidadePersonagemBase", 'Int'>;
}
export type HabilidadePersonagemBaseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
};
export type HabilidadePersonagemBaseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
};
export type HabilidadePersonagemBaseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithRelationInput | Prisma.HabilidadePersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemBaseScalarFieldEnum | Prisma.HabilidadePersonagemBaseScalarFieldEnum[];
};
export type HabilidadePersonagemBaseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithRelationInput | Prisma.HabilidadePersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemBaseScalarFieldEnum | Prisma.HabilidadePersonagemBaseScalarFieldEnum[];
};
export type HabilidadePersonagemBaseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithRelationInput | Prisma.HabilidadePersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemBaseScalarFieldEnum | Prisma.HabilidadePersonagemBaseScalarFieldEnum[];
};
export type HabilidadePersonagemBaseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateInput, Prisma.HabilidadePersonagemBaseUncheckedCreateInput>;
};
export type HabilidadePersonagemBaseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadePersonagemBaseCreateManyInput | Prisma.HabilidadePersonagemBaseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemBaseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateInput>;
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
};
export type HabilidadePersonagemBaseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateManyMutationInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    limit?: number;
};
export type HabilidadePersonagemBaseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemBaseCreateInput, Prisma.HabilidadePersonagemBaseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadePersonagemBaseUpdateInput, Prisma.HabilidadePersonagemBaseUncheckedUpdateInput>;
};
export type HabilidadePersonagemBaseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
};
export type HabilidadePersonagemBaseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    limit?: number;
};
export type HabilidadePersonagemBaseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
};
export {};
