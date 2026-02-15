import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadeOrigemModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadeOrigemPayload>;
export type AggregateHabilidadeOrigem = {
    _count: HabilidadeOrigemCountAggregateOutputType | null;
    _avg: HabilidadeOrigemAvgAggregateOutputType | null;
    _sum: HabilidadeOrigemSumAggregateOutputType | null;
    _min: HabilidadeOrigemMinAggregateOutputType | null;
    _max: HabilidadeOrigemMaxAggregateOutputType | null;
};
export type HabilidadeOrigemAvgAggregateOutputType = {
    id: number | null;
    origemId: number | null;
    habilidadeId: number | null;
};
export type HabilidadeOrigemSumAggregateOutputType = {
    id: number | null;
    origemId: number | null;
    habilidadeId: number | null;
};
export type HabilidadeOrigemMinAggregateOutputType = {
    id: number | null;
    origemId: number | null;
    habilidadeId: number | null;
};
export type HabilidadeOrigemMaxAggregateOutputType = {
    id: number | null;
    origemId: number | null;
    habilidadeId: number | null;
};
export type HabilidadeOrigemCountAggregateOutputType = {
    id: number;
    origemId: number;
    habilidadeId: number;
    _all: number;
};
export type HabilidadeOrigemAvgAggregateInputType = {
    id?: true;
    origemId?: true;
    habilidadeId?: true;
};
export type HabilidadeOrigemSumAggregateInputType = {
    id?: true;
    origemId?: true;
    habilidadeId?: true;
};
export type HabilidadeOrigemMinAggregateInputType = {
    id?: true;
    origemId?: true;
    habilidadeId?: true;
};
export type HabilidadeOrigemMaxAggregateInputType = {
    id?: true;
    origemId?: true;
    habilidadeId?: true;
};
export type HabilidadeOrigemCountAggregateInputType = {
    id?: true;
    origemId?: true;
    habilidadeId?: true;
    _all?: true;
};
export type HabilidadeOrigemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeOrigemWhereInput;
    orderBy?: Prisma.HabilidadeOrigemOrderByWithRelationInput | Prisma.HabilidadeOrigemOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeOrigemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadeOrigemCountAggregateInputType;
    _avg?: HabilidadeOrigemAvgAggregateInputType;
    _sum?: HabilidadeOrigemSumAggregateInputType;
    _min?: HabilidadeOrigemMinAggregateInputType;
    _max?: HabilidadeOrigemMaxAggregateInputType;
};
export type GetHabilidadeOrigemAggregateType<T extends HabilidadeOrigemAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidadeOrigem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidadeOrigem[P]> : Prisma.GetScalarType<T[P], AggregateHabilidadeOrigem[P]>;
};
export type HabilidadeOrigemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeOrigemWhereInput;
    orderBy?: Prisma.HabilidadeOrigemOrderByWithAggregationInput | Prisma.HabilidadeOrigemOrderByWithAggregationInput[];
    by: Prisma.HabilidadeOrigemScalarFieldEnum[] | Prisma.HabilidadeOrigemScalarFieldEnum;
    having?: Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadeOrigemCountAggregateInputType | true;
    _avg?: HabilidadeOrigemAvgAggregateInputType;
    _sum?: HabilidadeOrigemSumAggregateInputType;
    _min?: HabilidadeOrigemMinAggregateInputType;
    _max?: HabilidadeOrigemMaxAggregateInputType;
};
export type HabilidadeOrigemGroupByOutputType = {
    id: number;
    origemId: number;
    habilidadeId: number;
    _count: HabilidadeOrigemCountAggregateOutputType | null;
    _avg: HabilidadeOrigemAvgAggregateOutputType | null;
    _sum: HabilidadeOrigemSumAggregateOutputType | null;
    _min: HabilidadeOrigemMinAggregateOutputType | null;
    _max: HabilidadeOrigemMaxAggregateOutputType | null;
};
type GetHabilidadeOrigemGroupByPayload<T extends HabilidadeOrigemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadeOrigemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadeOrigemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadeOrigemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadeOrigemGroupByOutputType[P]>;
}>>;
export type HabilidadeOrigemWhereInput = {
    AND?: Prisma.HabilidadeOrigemWhereInput | Prisma.HabilidadeOrigemWhereInput[];
    OR?: Prisma.HabilidadeOrigemWhereInput[];
    NOT?: Prisma.HabilidadeOrigemWhereInput | Prisma.HabilidadeOrigemWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    origemId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    origem?: Prisma.XOR<Prisma.OrigemScalarRelationFilter, Prisma.OrigemWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
};
export type HabilidadeOrigemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    origem?: Prisma.OrigemOrderByWithRelationInput;
    habilidade?: Prisma.HabilidadeOrderByWithRelationInput;
};
export type HabilidadeOrigemWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    origemId_habilidadeId?: Prisma.HabilidadeOrigemOrigemIdHabilidadeIdCompoundUniqueInput;
    AND?: Prisma.HabilidadeOrigemWhereInput | Prisma.HabilidadeOrigemWhereInput[];
    OR?: Prisma.HabilidadeOrigemWhereInput[];
    NOT?: Prisma.HabilidadeOrigemWhereInput | Prisma.HabilidadeOrigemWhereInput[];
    origemId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    origem?: Prisma.XOR<Prisma.OrigemScalarRelationFilter, Prisma.OrigemWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
}, "id" | "origemId_habilidadeId">;
export type HabilidadeOrigemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    _count?: Prisma.HabilidadeOrigemCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadeOrigemAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadeOrigemMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadeOrigemMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadeOrigemSumOrderByAggregateInput;
};
export type HabilidadeOrigemScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput | Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput | Prisma.HabilidadeOrigemScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"HabilidadeOrigem"> | number;
    origemId?: Prisma.IntWithAggregatesFilter<"HabilidadeOrigem"> | number;
    habilidadeId?: Prisma.IntWithAggregatesFilter<"HabilidadeOrigem"> | number;
};
export type HabilidadeOrigemCreateInput = {
    origem: Prisma.OrigemCreateNestedOneWithoutHabilidadesOrigemInput;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesOrigemInput;
};
export type HabilidadeOrigemUncheckedCreateInput = {
    id?: number;
    origemId: number;
    habilidadeId: number;
};
export type HabilidadeOrigemUpdateInput = {
    origem?: Prisma.OrigemUpdateOneRequiredWithoutHabilidadesOrigemNestedInput;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesOrigemNestedInput;
};
export type HabilidadeOrigemUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    origemId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemCreateManyInput = {
    id?: number;
    origemId: number;
    habilidadeId: number;
};
export type HabilidadeOrigemUpdateManyMutationInput = {};
export type HabilidadeOrigemUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    origemId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemListRelationFilter = {
    every?: Prisma.HabilidadeOrigemWhereInput;
    some?: Prisma.HabilidadeOrigemWhereInput;
    none?: Prisma.HabilidadeOrigemWhereInput;
};
export type HabilidadeOrigemOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HabilidadeOrigemOrigemIdHabilidadeIdCompoundUniqueInput = {
    origemId: number;
    habilidadeId: number;
};
export type HabilidadeOrigemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadeOrigemAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadeOrigemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadeOrigemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadeOrigemSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    origemId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadeOrigemCreateNestedManyWithoutOrigemInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput> | Prisma.HabilidadeOrigemCreateWithoutOrigemInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyOrigemInputEnvelope;
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
};
export type HabilidadeOrigemUncheckedCreateNestedManyWithoutOrigemInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput> | Prisma.HabilidadeOrigemCreateWithoutOrigemInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyOrigemInputEnvelope;
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
};
export type HabilidadeOrigemUpdateManyWithoutOrigemNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput> | Prisma.HabilidadeOrigemCreateWithoutOrigemInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput[];
    upsert?: Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutOrigemInput | Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutOrigemInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyOrigemInputEnvelope;
    set?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    delete?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    update?: Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutOrigemInput | Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutOrigemInput[];
    updateMany?: Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutOrigemInput | Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutOrigemInput[];
    deleteMany?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
};
export type HabilidadeOrigemUncheckedUpdateManyWithoutOrigemNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput> | Prisma.HabilidadeOrigemCreateWithoutOrigemInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutOrigemInput[];
    upsert?: Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutOrigemInput | Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutOrigemInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyOrigemInputEnvelope;
    set?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    delete?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    update?: Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutOrigemInput | Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutOrigemInput[];
    updateMany?: Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutOrigemInput | Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutOrigemInput[];
    deleteMany?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
};
export type HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
};
export type HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
};
export type HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    delete?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    update?: Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
};
export type HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput[] | Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadeOrigemCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    disconnect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    delete?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    connect?: Prisma.HabilidadeOrigemWhereUniqueInput | Prisma.HabilidadeOrigemWhereUniqueInput[];
    update?: Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadeOrigemUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
};
export type HabilidadeOrigemCreateWithoutOrigemInput = {
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutHabilidadesOrigemInput;
};
export type HabilidadeOrigemUncheckedCreateWithoutOrigemInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadeOrigemCreateOrConnectWithoutOrigemInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput>;
};
export type HabilidadeOrigemCreateManyOrigemInputEnvelope = {
    data: Prisma.HabilidadeOrigemCreateManyOrigemInput | Prisma.HabilidadeOrigemCreateManyOrigemInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeOrigemUpsertWithWhereUniqueWithoutOrigemInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeOrigemUpdateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedUpdateWithoutOrigemInput>;
    create: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutOrigemInput>;
};
export type HabilidadeOrigemUpdateWithWhereUniqueWithoutOrigemInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateWithoutOrigemInput, Prisma.HabilidadeOrigemUncheckedUpdateWithoutOrigemInput>;
};
export type HabilidadeOrigemUpdateManyWithWhereWithoutOrigemInput = {
    where: Prisma.HabilidadeOrigemScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateManyMutationInput, Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutOrigemInput>;
};
export type HabilidadeOrigemScalarWhereInput = {
    AND?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
    OR?: Prisma.HabilidadeOrigemScalarWhereInput[];
    NOT?: Prisma.HabilidadeOrigemScalarWhereInput | Prisma.HabilidadeOrigemScalarWhereInput[];
    id?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    origemId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadeOrigem"> | number;
};
export type HabilidadeOrigemCreateWithoutHabilidadeInput = {
    origem: Prisma.OrigemCreateNestedOneWithoutHabilidadesOrigemInput;
};
export type HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput = {
    id?: number;
    origemId: number;
};
export type HabilidadeOrigemCreateOrConnectWithoutHabilidadeInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeOrigemCreateManyHabilidadeInputEnvelope = {
    data: Prisma.HabilidadeOrigemCreateManyHabilidadeInput | Prisma.HabilidadeOrigemCreateManyHabilidadeInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeOrigemUpsertWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadeOrigemUpdateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedUpdateWithoutHabilidadeInput>;
    create: Prisma.XOR<Prisma.HabilidadeOrigemCreateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadeOrigemUpdateWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateWithoutHabilidadeInput, Prisma.HabilidadeOrigemUncheckedUpdateWithoutHabilidadeInput>;
};
export type HabilidadeOrigemUpdateManyWithWhereWithoutHabilidadeInput = {
    where: Prisma.HabilidadeOrigemScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateManyMutationInput, Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeInput>;
};
export type HabilidadeOrigemCreateManyOrigemInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadeOrigemUpdateWithoutOrigemInput = {
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutHabilidadesOrigemNestedInput;
};
export type HabilidadeOrigemUncheckedUpdateWithoutOrigemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemUncheckedUpdateManyWithoutOrigemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemCreateManyHabilidadeInput = {
    id?: number;
    origemId: number;
};
export type HabilidadeOrigemUpdateWithoutHabilidadeInput = {
    origem?: Prisma.OrigemUpdateOneRequiredWithoutHabilidadesOrigemNestedInput;
};
export type HabilidadeOrigemUncheckedUpdateWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    origemId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    origemId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadeOrigemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    origemId?: boolean;
    habilidadeId?: boolean;
    origem?: boolean | Prisma.OrigemDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidadeOrigem"]>;
export type HabilidadeOrigemSelectScalar = {
    id?: boolean;
    origemId?: boolean;
    habilidadeId?: boolean;
};
export type HabilidadeOrigemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "origemId" | "habilidadeId", ExtArgs["result"]["habilidadeOrigem"]>;
export type HabilidadeOrigemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    origem?: boolean | Prisma.OrigemDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
};
export type $HabilidadeOrigemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HabilidadeOrigem";
    objects: {
        origem: Prisma.$OrigemPayload<ExtArgs>;
        habilidade: Prisma.$HabilidadePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        origemId: number;
        habilidadeId: number;
    }, ExtArgs["result"]["habilidadeOrigem"]>;
    composites: {};
};
export type HabilidadeOrigemGetPayload<S extends boolean | null | undefined | HabilidadeOrigemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload, S>;
export type HabilidadeOrigemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadeOrigemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadeOrigemCountAggregateInputType | true;
};
export interface HabilidadeOrigemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HabilidadeOrigem'];
        meta: {
            name: 'HabilidadeOrigem';
        };
    };
    findUnique<T extends HabilidadeOrigemFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadeOrigemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadeOrigemFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadeOrigemFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadeOrigemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadeOrigemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadeOrigemFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeOrigemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadeOrigemCreateArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadeOrigemCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeOrigemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadeOrigemDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadeOrigemUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadeOrigemDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeOrigemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadeOrigemUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadeOrigemUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadeOrigemUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadeOrigemClient<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadeOrigemCountArgs>(args?: Prisma.Subset<T, HabilidadeOrigemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadeOrigemCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadeOrigemAggregateArgs>(args: Prisma.Subset<T, HabilidadeOrigemAggregateArgs>): Prisma.PrismaPromise<GetHabilidadeOrigemAggregateType<T>>;
    groupBy<T extends HabilidadeOrigemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadeOrigemGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadeOrigemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadeOrigemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadeOrigemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadeOrigemFieldRefs;
}
export interface Prisma__HabilidadeOrigemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    origem<T extends Prisma.OrigemDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrigemDefaultArgs<ExtArgs>>): Prisma.Prisma__OrigemClient<runtime.Types.Result.GetResult<Prisma.$OrigemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    habilidade<T extends Prisma.HabilidadeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.HabilidadeDefaultArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadeOrigemFieldRefs {
    readonly id: Prisma.FieldRef<"HabilidadeOrigem", 'Int'>;
    readonly origemId: Prisma.FieldRef<"HabilidadeOrigem", 'Int'>;
    readonly habilidadeId: Prisma.FieldRef<"HabilidadeOrigem", 'Int'>;
}
export type HabilidadeOrigemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
};
export type HabilidadeOrigemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
};
export type HabilidadeOrigemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeOrigemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeOrigemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeOrigemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeOrigemCreateInput, Prisma.HabilidadeOrigemUncheckedCreateInput>;
};
export type HabilidadeOrigemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadeOrigemCreateManyInput | Prisma.HabilidadeOrigemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeOrigemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateInput, Prisma.HabilidadeOrigemUncheckedUpdateInput>;
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
};
export type HabilidadeOrigemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadeOrigemUpdateManyMutationInput, Prisma.HabilidadeOrigemUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadeOrigemWhereInput;
    limit?: number;
};
export type HabilidadeOrigemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeOrigemCreateInput, Prisma.HabilidadeOrigemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadeOrigemUpdateInput, Prisma.HabilidadeOrigemUncheckedUpdateInput>;
};
export type HabilidadeOrigemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
    where: Prisma.HabilidadeOrigemWhereUniqueInput;
};
export type HabilidadeOrigemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeOrigemWhereInput;
    limit?: number;
};
export type HabilidadeOrigemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeOrigemSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOrigemOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeOrigemInclude<ExtArgs> | null;
};
export {};
