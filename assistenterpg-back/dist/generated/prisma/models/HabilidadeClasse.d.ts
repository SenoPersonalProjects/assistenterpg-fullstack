import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadeClasseModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadeClassePayload>;
export type AggregateHabilidadeClasse = {
    _count: HabilidadeClasseCountAggregateOutputType | null;
    _avg: HabilidadeClasseAvgAggregateOutputType | null;
    _sum: HabilidadeClasseSumAggregateOutputType | null;
    _min: HabilidadeClasseMinAggregateOutputType | null;
    _max: HabilidadeClasseMaxAggregateOutputType | null;
};
export type HabilidadeClasseAvgAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeClasseSumAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeClasseMinAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeClasseMaxAggregateOutputType = {
    id: number | null;
    classeId: number | null;
    habilidadeId: number | null;
    nivelConcedido: number | null;
};
export type HabilidadeClasseCountAggregateOutputType = {
    id: number;
    classeId: number;
    habilidadeId: number;
    nivelConcedido: number;
    _all: number;
};
export type HabilidadeClasseAvgAggregateInputType = {
    id?: true;
    classeId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeClasseSumAggregateInputType = {
    id?: true;
    classeId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeClasseMinAggregateInputType = {
    id?: true;
    classeId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeClasseMaxAggregateInputType = {
    id?: true;
    classeId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
};
export type HabilidadeClasseCountAggregateInputType = {
    id?: true;
    classeId?: true;
    habilidadeId?: true;
    nivelConcedido?: true;
    _all?: true;
};
export type HabilidadeClasseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithRelationInput | Prisma.HabilidadeClasseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadeClasseCountAggregateInputType;
    _avg?: HabilidadeClasseAvgAggregateInputType;
    _sum?: HabilidadeClasseSumAggregateInputType;
    _min?: HabilidadeClasseMinAggregateInputType;
    _max?: HabilidadeClasseMaxAggregateInputType;
};
export type GetHabilidadeClasseAggregateType<T extends HabilidadeClasseAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidadeClasse]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidadeClasse[P]> : Prisma.GetScalarType<T[P], AggregateHabilidadeClasse[P]>;
};
export type HabilidadeClasseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithAggregationInput | Prisma.HabilidadeClasseOrderByWithAggregationInput[];
    by: Prisma.HabilidadeClasseScalarFieldEnum[] | Prisma.HabilidadeClasseScalarFieldEnum;
    having?: Prisma.HabilidadeClasseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadeClasseCountAggregateInputType | true;
    _avg?: HabilidadeClasseAvgAggregateInputType;
    _sum?: HabilidadeClasseSumAggregateInputType;
    _min?: HabilidadeClasseMinAggregateInputType;
    _max?: HabilidadeClasseMaxAggregateInputType;
};
export type HabilidadeClasseGroupByOutputType = {
    id: number;
    classeId: number;
    habilidadeId: number;
    nivelConcedido: number;
    _count: HabilidadeClasseCountAggregateOutputType | null;
    _avg: HabilidadeClasseAvgAggregateOutputType | null;
    _sum: HabilidadeClasseSumAggregateOutputType | null;
    _min: HabilidadeClasseMinAggregateOutputType | null;
    _max: HabilidadeClasseMaxAggregateOutputType | null;
};
type GetHabilidadeClasseGroupByPayload<T extends HabilidadeClasseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadeClasseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadeClasseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadeClasseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadeClasseGroupByOutputType[P]>;
}>>;
export type HabilidadeClasseWhereInput = {
    AND?: Prisma.HabilidadeClasseWhereInput | Prisma.HabilidadeClasseWhereInput[];
    OR?: Prisma.HabilidadeClasseWhereInput[];
    NOT?: Prisma.HabilidadeClasseWhereInput | Prisma.HabilidadeClasseWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    classeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    classe?: Prisma.XOR<Prisma.ClasseScalarRelationFilter, Prisma.ClasseWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
};
export type HabilidadeClasseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
    classe?: Prisma.ClasseOrderByWithRelationInput;
    habilidade?: Prisma.HabilidadeOrderByWithRelationInput;
};
export type HabilidadeClasseWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    classeId_habilidadeId_nivelConcedido?: Prisma.HabilidadeClasseClasseIdHabilidadeIdNivelConcedidoCompoundUniqueInput;
    AND?: Prisma.HabilidadeClasseWhereInput | Prisma.HabilidadeClasseWhereInput[];
    OR?: Prisma.HabilidadeClasseWhereInput[];
    NOT?: Prisma.HabilidadeClasseWhereInput | Prisma.HabilidadeClasseWhereInput[];
    classeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    classe?: Prisma.XOR<Prisma.ClasseScalarRelationFilter, Prisma.ClasseWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
}, "id" | "classeId_habilidadeId_nivelConcedido">;
export type HabilidadeClasseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
    _count?: Prisma.HabilidadeClasseCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadeClasseAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadeClasseMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadeClasseMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadeClasseSumOrderByAggregateInput;
};
export type HabilidadeClasseScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadeClasseScalarWhereWithAggregatesInput | Prisma.HabilidadeClasseScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadeClasseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadeClasseScalarWhereWithAggregatesInput | Prisma.HabilidadeClasseScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"HabilidadeClasse"> | number;
    classeId?: Prisma.IntWithAggregatesFilter<"HabilidadeClasse"> | number;
    habilidadeId?: Prisma.IntWithAggregatesFilter<"HabilidadeClasse"> | number;
    nivelConcedido?: Prisma.IntWithAggregatesFilter<"HabilidadeClasse"> | number;
};
export type HabilidadeClasseCreateInput = {
    nivelConcedido: number;
    classe: Prisma.ClasseCreateNestedOneWithoutHabilidadesClasseInput;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesClasseInput;
};
export type HabilidadeClasseUncheckedCreateInput = {
    id?: number;
    classeId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseUpdateInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutHabilidadesClasseNestedInput;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesClasseNestedInput;
};
export type HabilidadeClasseUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseCreateManyInput = {
    id?: number;
    classeId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseUpdateManyMutationInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseListRelationFilter = {
    every?: Prisma.HabilidadeClasseWhereInput;
    some?: Prisma.HabilidadeClasseWhereInput;
    none?: Prisma.HabilidadeClasseWhereInput;
};
export type HabilidadeClasseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HabilidadeClasseClasseIdHabilidadeIdNivelConcedidoCompoundUniqueInput = {
    classeId: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeClasseAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeClasseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeClasseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeClasseSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classeId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    nivelConcedido?: Prisma.SortOrder;
};
export type HabilidadeClasseCreateNestedManyWithoutClasseInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput> | Prisma.HabilidadeClasseCreateWithoutClasseInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput | Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyClasseInputEnvelope;
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
};
export type HabilidadeClasseUncheckedCreateNestedManyWithoutClasseInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput> | Prisma.HabilidadeClasseCreateWithoutClasseInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput | Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyClasseInputEnvelope;
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
};
export type HabilidadeClasseUpdateManyWithoutClasseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput> | Prisma.HabilidadeClasseCreateWithoutClasseInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput | Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput[];
    upsert?: Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutClasseInput | Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutClasseInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyClasseInputEnvelope;
    set?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    delete?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    update?: Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutClasseInput | Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutClasseInput[];
    updateMany?: Prisma.HabilidadeClasseUpdateManyWithWhereWithoutClasseInput | Prisma.HabilidadeClasseUpdateManyWithWhereWithoutClasseInput[];
    deleteMany?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
};
export type HabilidadeClasseUncheckedUpdateManyWithoutClasseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput> | Prisma.HabilidadeClasseCreateWithoutClasseInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput | Prisma.HabilidadeClasseCreateOrConnectWithoutClasseInput[];
    upsert?: Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutClasseInput | Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutClasseInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyClasseInputEnvelope;
    set?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    delete?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    update?: Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutClasseInput | Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutClasseInput[];
    updateMany?: Prisma.HabilidadeClasseUpdateManyWithWhereWithoutClasseInput | Prisma.HabilidadeClasseUpdateManyWithWhereWithoutClasseInput[];
    deleteMany?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
};
export type HabilidadeClasseCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeClasseCreateWithoutHabilidadeInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
};
export type HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeClasseCreateWithoutHabilidadeInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
};
export type HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeClasseCreateWithoutHabilidadeInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    delete?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    update?: Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeClasseUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeClasseUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
};
export type HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeClasseCreateWithoutHabilidadeInput[] | Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeClasseCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeClasseUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeClasseCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    delete?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    connect?: Prisma.HabilidadeClasseWhereUniqueInput | Prisma.HabilidadeClasseWhereUniqueInput[];
    update?: Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeClasseUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeClasseUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeClasseUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
};
export type HabilidadeClasseCreateWithoutClasseInput = {
    nivelConcedido: number;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesClasseInput;
};
export type HabilidadeClasseUncheckedCreateWithoutClasseInput = {
    id?: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseCreateOrConnectWithoutClasseInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput>;
};
export type HabilidadeClasseCreateManyClasseInputEnvelope = {
    data: Prisma.HabilidadeClasseCreateManyClasseInput | Prisma.HabilidadeClasseCreateManyClasseInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeClasseUpsertWithWhereUniqueWithoutClasseInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeClasseUpdateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedUpdateWithoutClasseInput>;
    create: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedCreateWithoutClasseInput>;
};
export type HabilidadeClasseUpdateWithWhereUniqueWithoutClasseInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateWithoutClasseInput, Prisma.HabilidadeClasseUncheckedUpdateWithoutClasseInput>;
};
export type HabilidadeClasseUpdateManyWithWhereWithoutClasseInput = {
    where: Prisma.HabilidadeClasseScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateManyMutationInput, Prisma.HabilidadeClasseUncheckedUpdateManyWithoutClasseInput>;
};
export type HabilidadeClasseScalarWhereInput = {
    AND?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
    OR?: Prisma.HabilidadeClasseScalarWhereInput[];
    NOT?: Prisma.HabilidadeClasseScalarWhereInput | Prisma.HabilidadeClasseScalarWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    classeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeClasse"> | number;
    nivelConcedido?: Prisma.IntFilter<"HabilidadeClasse"> | number;
};
export type HabilidadeClasseCreateWithoutHabilidadeInput = {
    nivelConcedido: number;
    classe: Prisma.ClasseCreateNestedOneWithoutHabilidadesClasseInput;
};
export type HabilidadeClasseUncheckedCreateWithoutHabilidadeInput = {
    id?: number;
    classeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseCreateOrConnectWithoutHabilidadeInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeClasseCreateManyHabilidadeInputEnvelope = {
    data: Prisma.HabilidadeClasseCreateManyHabilidadeInput | Prisma.HabilidadeClasseCreateManyHabilidadeInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeClasseUpsertWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeClasseUpdateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedUpdateWithoutHabilidadeInput>;
    create: Prisma.XOR<Prisma.HabilidadeClasseCreateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeClasseUpdateWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateWithoutHabilidadeInput, Prisma.HabilidadeClasseUncheckedUpdateWithoutHabilidadeInput>;
};
export type HabilidadeClasseUpdateManyWithWhereWithoutHabilidadeInput = {
    where: Prisma.HabilidadeClasseScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateManyMutationInput, Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeInput>;
};
export type HabilidadeClasseCreateManyClasseInput = {
    id?: number;
    habilidadeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseUpdateWithoutClasseInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesClasseNestedInput;
};
export type HabilidadeClasseUncheckedUpdateWithoutClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseUncheckedUpdateManyWithoutClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseCreateManyHabilidadeInput = {
    id?: number;
    classeId: number;
    nivelConcedido: number;
};
export type HabilidadeClasseUpdateWithoutHabilidadeInput = {
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
    classe?: Prisma.ClasseUpdateOneRequiredWithoutHabilidadesClasseNestedInput;
};
export type HabilidadeClasseUncheckedUpdateWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    classeId?: Prisma.IntFieldUpdateOperationsInput | number;
    nivelConcedido?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeClasseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classeId?: boolean;
    habilidadeId?: boolean;
    nivelConcedido?: boolean;
    classe?: boolean | Prisma.ClasseDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidadeClasse"]>;
export type HabilidadeClasseSelectScalar = {
    id?: boolean;
    classeId?: boolean;
    habilidadeId?: boolean;
    nivelConcedido?: boolean;
};
export type HabilidadeClasseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classeId" | "habilidadeId" | "nivelConcedido", ExtArgs["result"]["habilidadeClasse"]>;
export type HabilidadeClasseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    classe?: boolean | Prisma.ClasseDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
};
export type $HabilidadeClassePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HabilidadeClasse";
    objects: {
        classe: Prisma.$ClassePayload<ExtArgs>;
        habilidade: Prisma.$HabilidadePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        classeId: number;
        habilidadeId: number;
        nivelConcedido: number;
    }, ExtArgs["result"]["habilidadeClasse"]>;
    composites: {};
};
export type HabilidadeClasseGetPayload<S extends boolean | null | undefined | HabilidadeClasseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload, S>;
export type HabilidadeClasseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadeClasseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadeClasseCountAggregateInputType | true;
};
export interface HabilidadeClasseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HabilidadeClasse'];
        meta: {
            name: 'HabilidadeClasse';
        };
    };
    findUnique<T extends HabilidadeClasseFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadeClasseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadeClasseFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadeClasseFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadeClasseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadeClasseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadeClasseFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeClasseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadeClasseCreateArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadeClasseCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeClasseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadeClasseDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadeClasseUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadeClasseDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeClasseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadeClasseUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadeClasseUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadeClasseUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClasseClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadeClasseCountArgs>(args?: Prisma.Subset<T, HabilidadeClasseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadeClasseCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadeClasseAggregateArgs>(args: Prisma.Subset<T, HabilidadeClasseAggregateArgs>): Prisma.PrismaPromise<GetHabilidadeClasseAggregateType<T>>;
    groupBy<T extends HabilidadeClasseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadeClasseGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadeClasseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadeClasseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadeClasseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadeClasseFieldRefs;
}
export interface Prisma__HabilidadeClasseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    classe<T extends Prisma.ClasseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClasseDefaultArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    habilidade<T extends Prisma.HabilidadeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.HabilidadeDefaultArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadeClasseFieldRefs {
    readonly id: Prisma.FieldRef<"HabilidadeClasse", 'Int'>;
    readonly classeId: Prisma.FieldRef<"HabilidadeClasse", 'Int'>;
    readonly habilidadeId: Prisma.FieldRef<"HabilidadeClasse", 'Int'>;
    readonly nivelConcedido: Prisma.FieldRef<"HabilidadeClasse", 'Int'>;
}
export type HabilidadeClasseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where: Prisma.HabilidadeClasseWhereUniqueInput;
};
export type HabilidadeClasseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where: Prisma.HabilidadeClasseWhereUniqueInput;
};
export type HabilidadeClasseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithRelationInput | Prisma.HabilidadeClasseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeClasseScalarFieldEnum | Prisma.HabilidadeClasseScalarFieldEnum[];
};
export type HabilidadeClasseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithRelationInput | Prisma.HabilidadeClasseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeClasseScalarFieldEnum | Prisma.HabilidadeClasseScalarFieldEnum[];
};
export type HabilidadeClasseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithRelationInput | Prisma.HabilidadeClasseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeClasseScalarFieldEnum | Prisma.HabilidadeClasseScalarFieldEnum[];
};
export type HabilidadeClasseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeClasseCreateInput, Prisma.HabilidadeClasseUncheckedCreateInput>;
};
export type HabilidadeClasseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadeClasseCreateManyInput | Prisma.HabilidadeClasseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeClasseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateInput, Prisma.HabilidadeClasseUncheckedUpdateInput>;
    where: Prisma.HabilidadeClasseWhereUniqueInput;
};
export type HabilidadeClasseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadeClasseUpdateManyMutationInput, Prisma.HabilidadeClasseUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadeClasseWhereInput;
    limit?: number;
};
export type HabilidadeClasseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where: Prisma.HabilidadeClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeClasseCreateInput, Prisma.HabilidadeClasseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadeClasseUpdateInput, Prisma.HabilidadeClasseUncheckedUpdateInput>;
};
export type HabilidadeClasseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where: Prisma.HabilidadeClasseWhereUniqueInput;
};
export type HabilidadeClasseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeClasseWhereInput;
    limit?: number;
};
export type HabilidadeClasseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
};
export {};
