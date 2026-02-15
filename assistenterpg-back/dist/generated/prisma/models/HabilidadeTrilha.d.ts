import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadeTrilhaModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadeTrilhaPayload>;
export type AggregateHabilidadeTrilha = {
    _count: HabilidadeTrilhaCountAggregateOutputType | null;
    _avg: HabilidadeTrilhaAvgAggregateOutputType | null;
    _sum: HabilidadeTrilhaSumAggregateOutputType | null;
    _min: HabilidadeTrilhaMinAggregateOutputType | null;
    _max: HabilidadeTrilhaMaxAggregateOutputType | null;
};
export type HabilidadeTrilhaAvgAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeTrilhaSumAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeTrilhaMinAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeTrilhaMaxAggregateOutputType = {
    id: number | null;
    trilhaId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeTrilhaCountAggregateOutputType = {
    id: number;
    trilhaId: number;
    habilidadeId: number;
    nivelConcedido: number;
    _all: number;
};
export type HabilidadeTrilhaAvgAggregateInputType = {
    id?: true;
    trilhaId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeTrilhaSumAggregateInputType = {
    id?: true;
    trilhaId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeTrilhaMinAggregateInputType = {
    id?: true;
    trilhaId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeTrilhaMaxAggregateInputType = {
    id?: true;
    trilhaId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeTrilhaCountAggregateInputType = {
    id?: true;
    trilhaId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
    _all?: true;
};
export type HabilidadeTrilhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeTrilhaWhereInput;
    orderBy?: Prisma.HabilidadeTrilhaOrderByWithRelationInput | Prisma.HabilidadeTrilhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeTrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadeTrilhaCountAggregateInputType;
    _avg?: HabilidadeTrilhaAvgAggregateInputType;
    _sum?: HabilidadeTrilhaSumAggregateInputType;
    _min?: HabilidadeTrilhaMinAggregateInputType;
    _max?: HabilidadeTrilhaMaxAggregateInputType;
};
export type GetHabilidadeTrilhaAggregateType<T extends HabilidadeTrilhaAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidadeTrilha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidadeTrilha[P]> : Prisma.GetScalarType<T[P], AggregateHabilidadeTrilha[P]>;
};
export type HabilidadeTrilhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeTrilhaWhereInput;
    orderBy?: Prisma.HabilidadeTrilhaOrderByWithAggregationInput | Prisma.HabilidadeTrilhaOrderByWithAggregationInput[];
    by: Prisma.HabilidadeTrilhaScalarFieldEnum[] | Prisma.HabilidadeTrilhaScalarFieldEnum;
    having?: Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadeTrilhaCountAggregateInputType | true;
    _avg?: HabilidadeTrilhaAvgAggregateInputType;
    _sum?: HabilidadeTrilhaSumAggregateInputType;
    _min?: HabilidadeTrilhaMinAggregateInputType;
    _max?: HabilidadeTrilhaMaxAggregateInputType;
};
export type HabilidadeTrilhaGroupByOutputType = {
    id: number;
    trilhaId: number;
    habilidadeId: number;
    nivelConcedido: number;
    _count: HabilidadeTrilhaCountAggregateOutputType | null;
    _avg: HabilidadeTrilhaAvgAggregateOutputType | null;
    _sum: HabilidadeTrilhaSumAggregateOutputType | null;
    _min: HabilidadeTrilhaMinAggregateOutputType | null;
    _max: HabilidadeTrilhaMaxAggregateOutputType | null;
};
type GetHabilidadeTrilhaGroupByPayload<T extends HabilidadeTrilhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadeTrilhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadeTrilhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadeTrilhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadeTrilhaGroupByOutputType[P]>;
}>>;
export type HabilidadeTrilhaWhereInput = {
    AND?: Prisma.HabilidadeTrilhaWhereInput | Prisma.HabilidadeTrilhaWhereInput[];
    OR?: Prisma.HabilidadeTrilhaWhereInput[];
    NOT?: Prisma.HabilidadeTrilhaWhereInput | Prisma.HabilidadeTrilhaWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    trilhaId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    trilha?: Prisma.XOR<Prisma.TrilhaScalarRelationFilter, Prisma.TrilhaWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
};
export type HabilidadeTrilhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
    trilha?: Prisma.TrilhaOrderByWithRelationInput;
    habilidade?: Prisma.HabilidadeOrderByWithRelationInput;
};
export type HabilidadeTrilhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    trilhaId_habilidadeId_nivelConcedido?: Prisma.HabilidadeTrilhaTrilhaIdHabilidadeIdNivelConcedidoCompoundUniqueInput;
    AND?: Prisma.HabilidadeTrilhaWhereInput | Prisma.HabilidadeTrilhaWhereInput[];
    OR?: Prisma.HabilidadeTrilhaWhereInput[];
    NOT?: Prisma.HabilidadeTrilhaWhereInput | Prisma.HabilidadeTrilhaWhereInput[];
    trilhaId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    trilha?: Prisma.XOR<Prisma.TrilhaScalarRelationFilter, Prisma.TrilhaWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
}, "id" | "trilhaId_habilidadeId_nivelConcedido">;
export type HabilidadeTrilhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
    _count?: Prisma.HabilidadeTrilhaCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadeTrilhaAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadeTrilhaMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadeTrilhaMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadeTrilhaSumOrderByAggregateInput;
};
export type HabilidadeTrilhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput | Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput | Prisma.HabilidadeTrilhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"HabilidadeTrilha"> | number;
    trilhaId?: Prisma.IntWithAggregatesFilter<"HabilidadeTrilha"> | number;
    habilidadeId?: Prisma.IntWithAggregatesFilter<"HabilidadeTrilha"> | number;
    nivelConcedido?: Prisma.IntWithAggregatesFilter<"HabilidadeTrilha"> | number;
};
export type HabilidadeTrilhaCreateInput = {
    nivelConcedido: number;
    trilha: Prisma.TrilhaCreateNestedOneWithoutHabilidadesTrilhaInput;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesTrilhaInput;
};
export type HabilidadeTrilhaUncheckedCreateInput = {
    id?: number;
    trilhaId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaUpdateInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    trilha?: Prisma.TrilhaUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput;
};
export type HabilidadeTrilhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaCreateManyInput = {
    id?: number;
    trilhaId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaUpdateManyMutationInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaListRelationFilter = {
    every?: Prisma.HabilidadeTrilhaWhereInput;
    some?: Prisma.HabilidadeTrilhaWhereInput;
    none?: Prisma.HabilidadeTrilhaWhereInput;
};
export type HabilidadeTrilhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HabilidadeTrilhaTrilhaIdHabilidadeIdNivelConcedidoCompoundUniqueInput = {
    trilhaId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeTrilhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeTrilhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeTrilhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeTrilhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trilhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeTrilhaCreateNestedManyWithoutTrilhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput> | Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyTrilhaInputEnvelope;
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
};
export type HabilidadeTrilhaUncheckedCreateNestedManyWithoutTrilhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput> | Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyTrilhaInputEnvelope;
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
};
export type HabilidadeTrilhaUpdateManyWithoutTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput> | Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput[];
    upsert?: Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutTrilhaInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyTrilhaInputEnvelope;
    set?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    delete?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    update?: Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutTrilhaInput[];
    updateMany?: Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutTrilhaInput[];
    deleteMany?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
};
export type HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput> | Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput[];
    upsert?: Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutTrilhaInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyTrilhaInputEnvelope;
    set?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    delete?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    update?: Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutTrilhaInput[];
    updateMany?: Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutTrilhaInput | Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutTrilhaInput[];
    deleteMany?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
};
export type HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
};
export type HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
};
export type HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    delete?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    update?: Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
};
export type HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeTrilhaCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    delete?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    connect?: Prisma.HabilidadeTrilhaWhereUniqueInput | Prisma.HabilidadeTrilhaWhereUniqueInput[];
    update?: Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeTrilhaUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
};
export type HabilidadeTrilhaCreateWithoutTrilhaInput = {
    nivelConcedido: number;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesTrilhaInput;
};
export type HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput = {
    id?: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaCreateOrConnectWithoutTrilhaInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput>;
};
export type HabilidadeTrilhaCreateManyTrilhaInputEnvelope = {
    data: Prisma.HabilidadeTrilhaCreateManyTrilhaInput | Prisma.HabilidadeTrilhaCreateManyTrilhaInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeTrilhaUpsertWithWhereUniqueWithoutTrilhaInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedUpdateWithoutTrilhaInput>;
    create: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutTrilhaInput>;
};
export type HabilidadeTrilhaUpdateWithWhereUniqueWithoutTrilhaInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateWithoutTrilhaInput, Prisma.HabilidadeTrilhaUncheckedUpdateWithoutTrilhaInput>;
};
export type HabilidadeTrilhaUpdateManyWithWhereWithoutTrilhaInput = {
    where: Prisma.HabilidadeTrilhaScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateManyMutationInput, Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaInput>;
};
export type HabilidadeTrilhaScalarWhereInput = {
    AND?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
    OR?: Prisma.HabilidadeTrilhaScalarWhereInput[];
    NOT?: Prisma.HabilidadeTrilhaScalarWhereInput | Prisma.HabilidadeTrilhaScalarWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    trilhaId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeTrilha"> | number;
};
export type HabilidadeTrilhaCreateWithoutHabilidadeInput = {
    nivelConcedido: number;
    trilha: Prisma.TrilhaCreateNestedOneWithoutHabilidadesTrilhaInput;
};
export type HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput = {
    id?: number;
    trilhaId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaCreateOrConnectWithoutHabilidadeInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeTrilhaCreateManyHabilidadeInputEnvelope = {
    data: Prisma.HabilidadeTrilhaCreateManyHabilidadeInput | Prisma.HabilidadeTrilhaCreateManyHabilidadeInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeTrilhaUpsertWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedUpdateWithoutHabilidadeInput>;
    create: Prisma.XOR<Prisma.HabilidadeTrilhaCreateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeTrilhaUpdateWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateWithoutHabilidadeInput, Prisma.HabilidadeTrilhaUncheckedUpdateWithoutHabilidadeInput>;
};
export type HabilidadeTrilhaUpdateManyWithWhereWithoutHabilidadeInput = {
    where: Prisma.HabilidadeTrilhaScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateManyMutationInput, Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeInput>;
};
export type HabilidadeTrilhaCreateManyTrilhaInput = {
    id?: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaUpdateWithoutTrilhaInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput;
};
export type HabilidadeTrilhaUncheckedUpdateWithoutTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaUncheckedUpdateManyWithoutTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaCreateManyHabilidadeInput = {
    id?: number;
    trilhaId: number;
    nivelConcedido: number;
};
export type HabilidadeTrilhaUpdateWithoutHabilidadeInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    trilha?: Prisma.TrilhaUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput;
};
export type HabilidadeTrilhaUncheckedUpdateWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    trilhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeTrilhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    trilhaId?: boolean;
    habilidadeId?: boolean;
    nivelConcedido?: boolean;
    trilha?: boolean | Prisma.TrilhaDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidadeTrilha"]>;
export type HabilidadeTrilhaSelectScalar = {
    id?: boolean;
    trilhaId?: boolean;
    habilidadeId?: boolean;
    nivelConcedido?: boolean;
};
export type HabilidadeTrilhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "trilhaId" | "habilidadeId" | "nivelConcedido", ExtArgs["result"]["habilidadeTrilha"]>;
export type HabilidadeTrilhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trilha?: boolean | Prisma.TrilhaDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
};
export type $HabilidadeTrilhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HabilidadeTrilha";
    objects: {
        trilha: Prisma.$TrilhaPayload<ExtArgs>;
        habilidade: Prisma.$HabilidadePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        trilhaId: number;
        habilidadeId: number;
        nivelConcedido: number;
    }, ExtArgs["result"]["habilidadeTrilha"]>;
    composites: {};
};
export type HabilidadeTrilhaGetPayload<S extends boolean | null | undefined | HabilidadeTrilhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload, S>;
export type HabilidadeTrilhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadeTrilhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadeTrilhaCountAggregateInputType | true;
};
export interface HabilidadeTrilhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HabilidadeTrilha'];
        meta: {
            name: 'HabilidadeTrilha';
        };
    };
    findUnique<T extends HabilidadeTrilhaFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadeTrilhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadeTrilhaFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadeTrilhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadeTrilhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadeTrilhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadeTrilhaFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeTrilhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadeTrilhaCreateArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadeTrilhaCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeTrilhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadeTrilhaDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadeTrilhaUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadeTrilhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeTrilhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadeTrilhaUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadeTrilhaUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadeTrilhaUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadeTrilhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadeTrilhaCountArgs>(args?: Prisma.Subset<T, HabilidadeTrilhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadeTrilhaCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadeTrilhaAggregateArgs>(args: Prisma.Subset<T, HabilidadeTrilhaAggregateArgs>): Prisma.PrismaPromise<GetHabilidadeTrilhaAggregateType<T>>;
    groupBy<T extends HabilidadeTrilhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadeTrilhaGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadeTrilhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadeTrilhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadeTrilhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadeTrilhaFieldRefs;
}
export interface Prisma__HabilidadeTrilhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    trilha<T extends Prisma.TrilhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrilhaDefaultArgs<ExtArgs>>): Prisma.Prisma__TrilhaClient<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    habilidade<T extends Prisma.HabilidadeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.HabilidadeDefaultArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadeTrilhaFieldRefs {
    readonly id: Prisma.FieldRef<"HabilidadeTrilha", 'Int'>;
    readonly trilhaId: Prisma.FieldRef<"HabilidadeTrilha", 'Int'>;
    readonly habilidadeId: Prisma.FieldRef<"HabilidadeTrilha", 'Int'>;
    readonly nivelConcedido: Prisma.FieldRef<"HabilidadeTrilha", 'Int'>;
}
export type HabilidadeTrilhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
};
export type HabilidadeTrilhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
};
export type HabilidadeTrilhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeTrilhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeTrilhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeTrilhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaCreateInput, Prisma.HabilidadeTrilhaUncheckedCreateInput>;
};
export type HabilidadeTrilhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadeTrilhaCreateManyInput | Prisma.HabilidadeTrilhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeTrilhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateInput, Prisma.HabilidadeTrilhaUncheckedUpdateInput>;
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
};
export type HabilidadeTrilhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateManyMutationInput, Prisma.HabilidadeTrilhaUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadeTrilhaWhereInput;
    limit?: number;
};
export type HabilidadeTrilhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeTrilhaCreateInput, Prisma.HabilidadeTrilhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadeTrilhaUpdateInput, Prisma.HabilidadeTrilhaUncheckedUpdateInput>;
};
export type HabilidadeTrilhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadeTrilhaWhereUniqueInput;
};
export type HabilidadeTrilhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeTrilhaWhereInput;
    limit?: number;
};
export type HabilidadeTrilhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
};
export {};
