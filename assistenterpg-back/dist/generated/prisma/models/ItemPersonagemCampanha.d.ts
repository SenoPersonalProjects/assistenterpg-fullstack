import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ItemPersonagemCampanhaModel = runtime.Types.Result.DefaultSelection<Prisma.$ItemPersonagemCampanhaPayload>;
export type AggregateItemPersonagemCampanha = {
    _count: ItemPersonagemCampanhaCountAggregateOutputType | null;
    _avg: ItemPersonagemCampanhaAvgAggregateOutputType | null;
    _sum: ItemPersonagemCampanhaSumAggregateOutputType | null;
    _min: ItemPersonagemCampanhaMinAggregateOutputType | null;
    _max: ItemPersonagemCampanhaMaxAggregateOutputType | null;
};
export type ItemPersonagemCampanhaAvgAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    itemId: number | null;
    quantidade: number | null;
};
export type ItemPersonagemCampanhaSumAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    itemId: number | null;
    quantidade: number | null;
};
export type ItemPersonagemCampanhaMinAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    itemId: number | null;
    quantidade: number | null;
    equipado: boolean | null;
};
export type ItemPersonagemCampanhaMaxAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    itemId: number | null;
    quantidade: number | null;
    equipado: boolean | null;
};
export type ItemPersonagemCampanhaCountAggregateOutputType = {
    id: number;
    personagemCampanhaId: number;
    itemId: number;
    quantidade: number;
    equipado: number;
    _all: number;
};
export type ItemPersonagemCampanhaAvgAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    itemId?: true;
    quantidade?: true;
};
export type ItemPersonagemCampanhaSumAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    itemId?: true;
    quantidade?: true;
};
export type ItemPersonagemCampanhaMinAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    itemId?: true;
    quantidade?: true;
    equipado?: true;
};
export type ItemPersonagemCampanhaMaxAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    itemId?: true;
    quantidade?: true;
    equipado?: true;
};
export type ItemPersonagemCampanhaCountAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    itemId?: true;
    quantidade?: true;
    equipado?: true;
    _all?: true;
};
export type ItemPersonagemCampanhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithRelationInput | Prisma.ItemPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ItemPersonagemCampanhaCountAggregateInputType;
    _avg?: ItemPersonagemCampanhaAvgAggregateInputType;
    _sum?: ItemPersonagemCampanhaSumAggregateInputType;
    _min?: ItemPersonagemCampanhaMinAggregateInputType;
    _max?: ItemPersonagemCampanhaMaxAggregateInputType;
};
export type GetItemPersonagemCampanhaAggregateType<T extends ItemPersonagemCampanhaAggregateArgs> = {
    [P in keyof T & keyof AggregateItemPersonagemCampanha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateItemPersonagemCampanha[P]> : Prisma.GetScalarType<T[P], AggregateItemPersonagemCampanha[P]>;
};
export type ItemPersonagemCampanhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithAggregationInput | Prisma.ItemPersonagemCampanhaOrderByWithAggregationInput[];
    by: Prisma.ItemPersonagemCampanhaScalarFieldEnum[] | Prisma.ItemPersonagemCampanhaScalarFieldEnum;
    having?: Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ItemPersonagemCampanhaCountAggregateInputType | true;
    _avg?: ItemPersonagemCampanhaAvgAggregateInputType;
    _sum?: ItemPersonagemCampanhaSumAggregateInputType;
    _min?: ItemPersonagemCampanhaMinAggregateInputType;
    _max?: ItemPersonagemCampanhaMaxAggregateInputType;
};
export type ItemPersonagemCampanhaGroupByOutputType = {
    id: number;
    personagemCampanhaId: number;
    itemId: number;
    quantidade: number;
    equipado: boolean;
    _count: ItemPersonagemCampanhaCountAggregateOutputType | null;
    _avg: ItemPersonagemCampanhaAvgAggregateOutputType | null;
    _sum: ItemPersonagemCampanhaSumAggregateOutputType | null;
    _min: ItemPersonagemCampanhaMinAggregateOutputType | null;
    _max: ItemPersonagemCampanhaMaxAggregateOutputType | null;
};
type GetItemPersonagemCampanhaGroupByPayload<T extends ItemPersonagemCampanhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ItemPersonagemCampanhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ItemPersonagemCampanhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ItemPersonagemCampanhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ItemPersonagemCampanhaGroupByOutputType[P]>;
}>>;
export type ItemPersonagemCampanhaWhereInput = {
    AND?: Prisma.ItemPersonagemCampanhaWhereInput | Prisma.ItemPersonagemCampanhaWhereInput[];
    OR?: Prisma.ItemPersonagemCampanhaWhereInput[];
    NOT?: Prisma.ItemPersonagemCampanhaWhereInput | Prisma.ItemPersonagemCampanhaWhereInput[];
    id?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    itemId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    quantidade?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    equipado?: Prisma.BoolFilter<"ItemPersonagemCampanha"> | boolean;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    item?: Prisma.XOR<Prisma.ItemScalarRelationFilter, Prisma.ItemWhereInput>;
};
export type ItemPersonagemCampanhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
    equipado?: Prisma.SortOrder;
    personagemCampanha?: Prisma.PersonagemCampanhaOrderByWithRelationInput;
    item?: Prisma.ItemOrderByWithRelationInput;
};
export type ItemPersonagemCampanhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    personagemCampanhaId_itemId?: Prisma.ItemPersonagemCampanhaPersonagemCampanhaIdItemIdCompoundUniqueInput;
    AND?: Prisma.ItemPersonagemCampanhaWhereInput | Prisma.ItemPersonagemCampanhaWhereInput[];
    OR?: Prisma.ItemPersonagemCampanhaWhereInput[];
    NOT?: Prisma.ItemPersonagemCampanhaWhereInput | Prisma.ItemPersonagemCampanhaWhereInput[];
    personagemCampanhaId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    itemId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    quantidade?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    equipado?: Prisma.BoolFilter<"ItemPersonagemCampanha"> | boolean;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    item?: Prisma.XOR<Prisma.ItemScalarRelationFilter, Prisma.ItemWhereInput>;
}, "id" | "personagemCampanhaId_itemId">;
export type ItemPersonagemCampanhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
    equipado?: Prisma.SortOrder;
    _count?: Prisma.ItemPersonagemCampanhaCountOrderByAggregateInput;
    _avg?: Prisma.ItemPersonagemCampanhaAvgOrderByAggregateInput;
    _max?: Prisma.ItemPersonagemCampanhaMaxOrderByAggregateInput;
    _min?: Prisma.ItemPersonagemCampanhaMinOrderByAggregateInput;
    _sum?: Prisma.ItemPersonagemCampanhaSumOrderByAggregateInput;
};
export type ItemPersonagemCampanhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.ItemPersonagemCampanhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"ItemPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntWithAggregatesFilter<"ItemPersonagemCampanha"> | number;
    itemId?: Prisma.IntWithAggregatesFilter<"ItemPersonagemCampanha"> | number;
    quantidade?: Prisma.IntWithAggregatesFilter<"ItemPersonagemCampanha"> | number;
    equipado?: Prisma.BoolWithAggregatesFilter<"ItemPersonagemCampanha"> | boolean;
};
export type ItemPersonagemCampanhaCreateInput = {
    quantidade?: number;
    equipado?: boolean;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutItensInput;
    item: Prisma.ItemCreateNestedOneWithoutItensPersonagemInput;
};
export type ItemPersonagemCampanhaUncheckedCreateInput = {
    id?: number;
    personagemCampanhaId: number;
    itemId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaUpdateInput = {
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutItensNestedInput;
    item?: Prisma.ItemUpdateOneRequiredWithoutItensPersonagemNestedInput;
};
export type ItemPersonagemCampanhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    itemId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaCreateManyInput = {
    id?: number;
    personagemCampanhaId: number;
    itemId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaUpdateManyMutationInput = {
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    itemId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaListRelationFilter = {
    every?: Prisma.ItemPersonagemCampanhaWhereInput;
    some?: Prisma.ItemPersonagemCampanhaWhereInput;
    none?: Prisma.ItemPersonagemCampanhaWhereInput;
};
export type ItemPersonagemCampanhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaPersonagemCampanhaIdItemIdCompoundUniqueInput = {
    personagemCampanhaId: number;
    itemId: number;
};
export type ItemPersonagemCampanhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
    equipado?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
    equipado?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
    equipado?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    quantidade?: Prisma.SortOrder;
};
export type ItemPersonagemCampanhaCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
};
export type ItemPersonagemCampanhaUncheckedCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
};
export type ItemPersonagemCampanhaUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
};
export type ItemPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
};
export type ItemPersonagemCampanhaCreateNestedManyWithoutItemInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput> | Prisma.ItemPersonagemCampanhaCreateWithoutItemInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyItemInputEnvelope;
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
};
export type ItemPersonagemCampanhaUncheckedCreateNestedManyWithoutItemInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput> | Prisma.ItemPersonagemCampanhaCreateWithoutItemInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyItemInputEnvelope;
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
};
export type ItemPersonagemCampanhaUpdateManyWithoutItemNestedInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput> | Prisma.ItemPersonagemCampanhaCreateWithoutItemInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput[];
    upsert?: Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutItemInput | Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutItemInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyItemInputEnvelope;
    set?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutItemInput | Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutItemInput[];
    updateMany?: Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutItemInput | Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutItemInput[];
    deleteMany?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
};
export type ItemPersonagemCampanhaUncheckedUpdateManyWithoutItemNestedInput = {
    create?: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput> | Prisma.ItemPersonagemCampanhaCreateWithoutItemInput[] | Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput | Prisma.ItemPersonagemCampanhaCreateOrConnectWithoutItemInput[];
    upsert?: Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutItemInput | Prisma.ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutItemInput[];
    createMany?: Prisma.ItemPersonagemCampanhaCreateManyItemInputEnvelope;
    set?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.ItemPersonagemCampanhaWhereUniqueInput | Prisma.ItemPersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutItemInput | Prisma.ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutItemInput[];
    updateMany?: Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutItemInput | Prisma.ItemPersonagemCampanhaUpdateManyWithWhereWithoutItemInput[];
    deleteMany?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
};
export type ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput = {
    quantidade?: number;
    equipado?: boolean;
    item: Prisma.ItemCreateNestedOneWithoutItensPersonagemInput;
};
export type ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput = {
    id?: number;
    itemId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type ItemPersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope = {
    data: Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInput | Prisma.ItemPersonagemCampanhaCreateManyPersonagemCampanhaInput[];
    skipDuplicates?: boolean;
};
export type ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
    create: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
};
export type ItemPersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput = {
    where: Prisma.ItemPersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateManyMutationInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput>;
};
export type ItemPersonagemCampanhaScalarWhereInput = {
    AND?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
    OR?: Prisma.ItemPersonagemCampanhaScalarWhereInput[];
    NOT?: Prisma.ItemPersonagemCampanhaScalarWhereInput | Prisma.ItemPersonagemCampanhaScalarWhereInput[];
    id?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    itemId?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    quantidade?: Prisma.IntFilter<"ItemPersonagemCampanha"> | number;
    equipado?: Prisma.BoolFilter<"ItemPersonagemCampanha"> | boolean;
};
export type ItemPersonagemCampanhaCreateWithoutItemInput = {
    quantidade?: number;
    equipado?: boolean;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutItensInput;
};
export type ItemPersonagemCampanhaUncheckedCreateWithoutItemInput = {
    id?: number;
    personagemCampanhaId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaCreateOrConnectWithoutItemInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput>;
};
export type ItemPersonagemCampanhaCreateManyItemInputEnvelope = {
    data: Prisma.ItemPersonagemCampanhaCreateManyItemInput | Prisma.ItemPersonagemCampanhaCreateManyItemInput[];
    skipDuplicates?: boolean;
};
export type ItemPersonagemCampanhaUpsertWithWhereUniqueWithoutItemInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateWithoutItemInput>;
    create: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedCreateWithoutItemInput>;
};
export type ItemPersonagemCampanhaUpdateWithWhereUniqueWithoutItemInput = {
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateWithoutItemInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateWithoutItemInput>;
};
export type ItemPersonagemCampanhaUpdateManyWithWhereWithoutItemInput = {
    where: Prisma.ItemPersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateManyMutationInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateManyWithoutItemInput>;
};
export type ItemPersonagemCampanhaCreateManyPersonagemCampanhaInput = {
    id?: number;
    itemId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaUpdateWithoutPersonagemCampanhaInput = {
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    item?: Prisma.ItemUpdateOneRequiredWithoutItensPersonagemNestedInput;
};
export type ItemPersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    itemId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    itemId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaCreateManyItemInput = {
    id?: number;
    personagemCampanhaId: number;
    quantidade?: number;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaUpdateWithoutItemInput = {
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutItensNestedInput;
};
export type ItemPersonagemCampanhaUncheckedUpdateWithoutItemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaUncheckedUpdateManyWithoutItemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantidade?: Prisma.IntFieldUpdateOperationsInput | number;
    equipado?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ItemPersonagemCampanhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemCampanhaId?: boolean;
    itemId?: boolean;
    quantidade?: boolean;
    equipado?: boolean;
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    item?: boolean | Prisma.ItemDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["itemPersonagemCampanha"]>;
export type ItemPersonagemCampanhaSelectScalar = {
    id?: boolean;
    personagemCampanhaId?: boolean;
    itemId?: boolean;
    quantidade?: boolean;
    equipado?: boolean;
};
export type ItemPersonagemCampanhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemCampanhaId" | "itemId" | "quantidade" | "equipado", ExtArgs["result"]["itemPersonagemCampanha"]>;
export type ItemPersonagemCampanhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    item?: boolean | Prisma.ItemDefaultArgs<ExtArgs>;
};
export type $ItemPersonagemCampanhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ItemPersonagemCampanha";
    objects: {
        personagemCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>;
        item: Prisma.$ItemPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemCampanhaId: number;
        itemId: number;
        quantidade: number;
        equipado: boolean;
    }, ExtArgs["result"]["itemPersonagemCampanha"]>;
    composites: {};
};
export type ItemPersonagemCampanhaGetPayload<S extends boolean | null | undefined | ItemPersonagemCampanhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload, S>;
export type ItemPersonagemCampanhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ItemPersonagemCampanhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ItemPersonagemCampanhaCountAggregateInputType | true;
};
export interface ItemPersonagemCampanhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ItemPersonagemCampanha'];
        meta: {
            name: 'ItemPersonagemCampanha';
        };
    };
    findUnique<T extends ItemPersonagemCampanhaFindUniqueArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ItemPersonagemCampanhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ItemPersonagemCampanhaFindFirstArgs>(args?: Prisma.SelectSubset<T, ItemPersonagemCampanhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ItemPersonagemCampanhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ItemPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ItemPersonagemCampanhaFindManyArgs>(args?: Prisma.SelectSubset<T, ItemPersonagemCampanhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ItemPersonagemCampanhaCreateArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaCreateArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ItemPersonagemCampanhaCreateManyArgs>(args?: Prisma.SelectSubset<T, ItemPersonagemCampanhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends ItemPersonagemCampanhaDeleteArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaDeleteArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ItemPersonagemCampanhaUpdateArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaUpdateArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ItemPersonagemCampanhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, ItemPersonagemCampanhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ItemPersonagemCampanhaUpdateManyArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends ItemPersonagemCampanhaUpsertArgs>(args: Prisma.SelectSubset<T, ItemPersonagemCampanhaUpsertArgs<ExtArgs>>): Prisma.Prisma__ItemPersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ItemPersonagemCampanhaCountArgs>(args?: Prisma.Subset<T, ItemPersonagemCampanhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ItemPersonagemCampanhaCountAggregateOutputType> : number>;
    aggregate<T extends ItemPersonagemCampanhaAggregateArgs>(args: Prisma.Subset<T, ItemPersonagemCampanhaAggregateArgs>): Prisma.PrismaPromise<GetItemPersonagemCampanhaAggregateType<T>>;
    groupBy<T extends ItemPersonagemCampanhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ItemPersonagemCampanhaGroupByArgs['orderBy'];
    } : {
        orderBy?: ItemPersonagemCampanhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ItemPersonagemCampanhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemPersonagemCampanhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ItemPersonagemCampanhaFieldRefs;
}
export interface Prisma__ItemPersonagemCampanhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemCampanha<T extends Prisma.PersonagemCampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    item<T extends Prisma.ItemDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ItemDefaultArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ItemPersonagemCampanhaFieldRefs {
    readonly id: Prisma.FieldRef<"ItemPersonagemCampanha", 'Int'>;
    readonly personagemCampanhaId: Prisma.FieldRef<"ItemPersonagemCampanha", 'Int'>;
    readonly itemId: Prisma.FieldRef<"ItemPersonagemCampanha", 'Int'>;
    readonly quantidade: Prisma.FieldRef<"ItemPersonagemCampanha", 'Int'>;
    readonly equipado: Prisma.FieldRef<"ItemPersonagemCampanha", 'Boolean'>;
}
export type ItemPersonagemCampanhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
};
export type ItemPersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
};
export type ItemPersonagemCampanhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithRelationInput | Prisma.ItemPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemPersonagemCampanhaScalarFieldEnum | Prisma.ItemPersonagemCampanhaScalarFieldEnum[];
};
export type ItemPersonagemCampanhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithRelationInput | Prisma.ItemPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemPersonagemCampanhaScalarFieldEnum | Prisma.ItemPersonagemCampanhaScalarFieldEnum[];
};
export type ItemPersonagemCampanhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithRelationInput | Prisma.ItemPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemPersonagemCampanhaScalarFieldEnum | Prisma.ItemPersonagemCampanhaScalarFieldEnum[];
};
export type ItemPersonagemCampanhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateInput, Prisma.ItemPersonagemCampanhaUncheckedCreateInput>;
};
export type ItemPersonagemCampanhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ItemPersonagemCampanhaCreateManyInput | Prisma.ItemPersonagemCampanhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ItemPersonagemCampanhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateInput>;
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
};
export type ItemPersonagemCampanhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateManyMutationInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateManyInput>;
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    limit?: number;
};
export type ItemPersonagemCampanhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.ItemPersonagemCampanhaCreateInput, Prisma.ItemPersonagemCampanhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ItemPersonagemCampanhaUpdateInput, Prisma.ItemPersonagemCampanhaUncheckedUpdateInput>;
};
export type ItemPersonagemCampanhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
};
export type ItemPersonagemCampanhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    limit?: number;
};
export type ItemPersonagemCampanhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
};
export {};
