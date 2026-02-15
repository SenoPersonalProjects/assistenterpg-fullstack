import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadePersonagemCampanhaModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadePersonagemCampanhaPayload>;
export type AggregateHabilidadePersonagemCampanha = {
    _count: HabilidadePersonagemCampanhaCountAggregateOutputType | null;
    _avg: HabilidadePersonagemCampanhaAvgAggregateOutputType | null;
    _sum: HabilidadePersonagemCampanhaSumAggregateOutputType | null;
    _min: HabilidadePersonagemCampanhaMinAggregateOutputType | null;
    _max: HabilidadePersonagemCampanhaMaxAggregateOutputType | null;
};
export type HabilidadePersonagemCampanhaAvgAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemCampanhaSumAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemCampanhaMinAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemCampanhaMaxAggregateOutputType = {
    id: number | null;
    personagemCampanhaId: number | null;
    habilidadeId: number | null;
};
export type HabilidadePersonagemCampanhaCountAggregateOutputType = {
    id: number;
    personagemCampanhaId: number;
    habilidadeId: number;
    _all: number;
};
export type HabilidadePersonagemCampanhaAvgAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemCampanhaSumAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemCampanhaMinAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemCampanhaMaxAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    habilidadeId?: true;
};
export type HabilidadePersonagemCampanhaCountAggregateInputType = {
    id?: true;
    personagemCampanhaId?: true;
    habilidadeId?: true;
    _all?: true;
};
export type HabilidadePersonagemCampanhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    orderBy?: Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput | Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadePersonagemCampanhaCountAggregateInputType;
    _avg?: HabilidadePersonagemCampanhaAvgAggregateInputType;
    _sum?: HabilidadePersonagemCampanhaSumAggregateInputType;
    _min?: HabilidadePersonagemCampanhaMinAggregateInputType;
    _max?: HabilidadePersonagemCampanhaMaxAggregateInputType;
};
export type GetHabilidadePersonagemCampanhaAggregateType<T extends HabilidadePersonagemCampanhaAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidadePersonagemCampanha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidadePersonagemCampanha[P]> : Prisma.GetScalarType<T[P], AggregateHabilidadePersonagemCampanha[P]>;
};
export type HabilidadePersonagemCampanhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    orderBy?: Prisma.HabilidadePersonagemCampanhaOrderByWithAggregationInput | Prisma.HabilidadePersonagemCampanhaOrderByWithAggregationInput[];
    by: Prisma.HabilidadePersonagemCampanhaScalarFieldEnum[] | Prisma.HabilidadePersonagemCampanhaScalarFieldEnum;
    having?: Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadePersonagemCampanhaCountAggregateInputType | true;
    _avg?: HabilidadePersonagemCampanhaAvgAggregateInputType;
    _sum?: HabilidadePersonagemCampanhaSumAggregateInputType;
    _min?: HabilidadePersonagemCampanhaMinAggregateInputType;
    _max?: HabilidadePersonagemCampanhaMaxAggregateInputType;
};
export type HabilidadePersonagemCampanhaGroupByOutputType = {
    id: number;
    personagemCampanhaId: number;
    habilidadeId: number;
    _count: HabilidadePersonagemCampanhaCountAggregateOutputType | null;
    _avg: HabilidadePersonagemCampanhaAvgAggregateOutputType | null;
    _sum: HabilidadePersonagemCampanhaSumAggregateOutputType | null;
    _min: HabilidadePersonagemCampanhaMinAggregateOutputType | null;
    _max: HabilidadePersonagemCampanhaMaxAggregateOutputType | null;
};
type GetHabilidadePersonagemCampanhaGroupByPayload<T extends HabilidadePersonagemCampanhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadePersonagemCampanhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadePersonagemCampanhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadePersonagemCampanhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadePersonagemCampanhaGroupByOutputType[P]>;
}>>;
export type HabilidadePersonagemCampanhaWhereInput = {
    AND?: Prisma.HabilidadePersonagemCampanhaWhereInput | Prisma.HabilidadePersonagemCampanhaWhereInput[];
    OR?: Prisma.HabilidadePersonagemCampanhaWhereInput[];
    NOT?: Prisma.HabilidadePersonagemCampanhaWhereInput | Prisma.HabilidadePersonagemCampanhaWhereInput[];
    id?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
};
export type HabilidadePersonagemCampanhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    personagemCampanha?: Prisma.PersonagemCampanhaOrderByWithRelationInput;
    habilidade?: Prisma.HabilidadeOrderByWithRelationInput;
};
export type HabilidadePersonagemCampanhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    personagemCampanhaId_habilidadeId?: Prisma.HabilidadePersonagemCampanhaPersonagemCampanhaIdHabilidadeIdCompoundUniqueInput;
    AND?: Prisma.HabilidadePersonagemCampanhaWhereInput | Prisma.HabilidadePersonagemCampanhaWhereInput[];
    OR?: Prisma.HabilidadePersonagemCampanhaWhereInput[];
    NOT?: Prisma.HabilidadePersonagemCampanhaWhereInput | Prisma.HabilidadePersonagemCampanhaWhereInput[];
    personagemCampanhaId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    habilidade?: Prisma.XOR<Prisma.HabilidadeScalarRelationFilter, Prisma.HabilidadeWhereInput>;
}, "id" | "personagemCampanhaId_habilidadeId">;
export type HabilidadePersonagemCampanhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
    _count?: Prisma.HabilidadePersonagemCampanhaCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadePersonagemCampanhaAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadePersonagemCampanhaMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadePersonagemCampanhaMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadePersonagemCampanhaSumOrderByAggregateInput;
};
export type HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput | Prisma.HabilidadePersonagemCampanhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemCampanha"> | number;
    habilidadeId?: Prisma.IntWithAggregatesFilter<"HabilidadePersonagemCampanha"> | number;
};
export type HabilidadePersonagemCampanhaCreateInput = {
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutHabilidadesCampanhaInput;
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutPersonagensCampanhaInput;
};
export type HabilidadePersonagemCampanhaUncheckedCreateInput = {
    id?: number;
    personagemCampanhaId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemCampanhaUpdateInput = {
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutHabilidadesCampanhaNestedInput;
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutPersonagensCampanhaNestedInput;
};
export type HabilidadePersonagemCampanhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaCreateManyInput = {
    id?: number;
    personagemCampanhaId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemCampanhaUpdateManyMutationInput = {};
export type HabilidadePersonagemCampanhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaListRelationFilter = {
    every?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    some?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    none?: Prisma.HabilidadePersonagemCampanhaWhereInput;
};
export type HabilidadePersonagemCampanhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaPersonagemCampanhaIdHabilidadeIdCompoundUniqueInput = {
    personagemCampanhaId: number;
    habilidadeId: number;
};
export type HabilidadePersonagemCampanhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    habilidadeId?: Prisma.SortOrder;
};
export type HabilidadePersonagemCampanhaCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
};
export type HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
};
export type HabilidadePersonagemCampanhaUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
};
export type HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
};
export type HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
};
export type HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInputEnvelope;
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
};
export type HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
};
export type HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput> | Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput[] | Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput[];
    connectOrCreate?: Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput[];
    upsert?: Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutHabilidadeInput[];
    createMany?: Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInputEnvelope;
    set?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    disconnect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    delete?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    connect?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput | Prisma.HabilidadePersonagemCampanhaWhereUniqueInput[];
    update?: Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutHabilidadeInput[];
    updateMany?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutHabilidadeInput | Prisma.HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutHabilidadeInput[];
    deleteMany?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
};
export type HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput = {
    habilidade: Prisma.HabilidadeCreateNestedOneWithoutPersonagensCampanhaInput;
};
export type HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadePersonagemCampanhaCreateOrConnectWithoutPersonagemCampanhaInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInputEnvelope = {
    data: Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInput | Prisma.HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
    create: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateWithoutPersonagemCampanhaInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput>;
};
export type HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutPersonagemCampanhaInput = {
    where: Prisma.HabilidadePersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateManyMutationInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput>;
};
export type HabilidadePersonagemCampanhaScalarWhereInput = {
    AND?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
    OR?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
    NOT?: Prisma.HabilidadePersonagemCampanhaScalarWhereInput | Prisma.HabilidadePersonagemCampanhaScalarWhereInput[];
    id?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    personagemCampanhaId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
    habilidadeId?: Prisma.IntFilter<"HabilidadePersonagemCampanha"> | number;
};
export type HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput = {
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutHabilidadesCampanhaInput;
};
export type HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput = {
    id?: number;
    personagemCampanhaId: number;
};
export type HabilidadePersonagemCampanhaCreateOrConnectWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemCampanhaCreateManyHabilidadeInputEnvelope = {
    data: Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInput | Prisma.HabilidadePersonagemCampanhaCreateManyHabilidadeInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemCampanhaUpsertWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateWithoutHabilidadeInput>;
    create: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemCampanhaUpdateWithWhereUniqueWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateWithoutHabilidadeInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateWithoutHabilidadeInput>;
};
export type HabilidadePersonagemCampanhaUpdateManyWithWhereWithoutHabilidadeInput = {
    where: Prisma.HabilidadePersonagemCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateManyMutationInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeInput>;
};
export type HabilidadePersonagemCampanhaCreateManyPersonagemCampanhaInput = {
    id?: number;
    habilidadeId: number;
};
export type HabilidadePersonagemCampanhaUpdateWithoutPersonagemCampanhaInput = {
    habilidade?: Prisma.HabilidadeUpdateOneRequiredWithoutPersonagensCampanhaNestedInput;
};
export type HabilidadePersonagemCampanhaUncheckedUpdateWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    habilidadeId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaCreateManyHabilidadeInput = {
    id?: number;
    personagemCampanhaId: number;
};
export type HabilidadePersonagemCampanhaUpdateWithoutHabilidadeInput = {
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutHabilidadesCampanhaNestedInput;
};
export type HabilidadePersonagemCampanhaUncheckedUpdateWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type HabilidadePersonagemCampanhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemCampanhaId?: boolean;
    habilidadeId?: boolean;
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidadePersonagemCampanha"]>;
export type HabilidadePersonagemCampanhaSelectScalar = {
    id?: boolean;
    personagemCampanhaId?: boolean;
    habilidadeId?: boolean;
};
export type HabilidadePersonagemCampanhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemCampanhaId" | "habilidadeId", ExtArgs["result"]["habilidadePersonagemCampanha"]>;
export type HabilidadePersonagemCampanhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    habilidade?: boolean | Prisma.HabilidadeDefaultArgs<ExtArgs>;
};
export type $HabilidadePersonagemCampanhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "HabilidadePersonagemCampanha";
    objects: {
        personagemCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>;
        habilidade: Prisma.$HabilidadePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemCampanhaId: number;
        habilidadeId: number;
    }, ExtArgs["result"]["habilidadePersonagemCampanha"]>;
    composites: {};
};
export type HabilidadePersonagemCampanhaGetPayload<S extends boolean | null | undefined | HabilidadePersonagemCampanhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload, S>;
export type HabilidadePersonagemCampanhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadePersonagemCampanhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadePersonagemCampanhaCountAggregateInputType | true;
};
export interface HabilidadePersonagemCampanhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['HabilidadePersonagemCampanha'];
        meta: {
            name: 'HabilidadePersonagemCampanha';
        };
    };
    findUnique<T extends HabilidadePersonagemCampanhaFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadePersonagemCampanhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadePersonagemCampanhaFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadePersonagemCampanhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadePersonagemCampanhaFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadePersonagemCampanhaCreateArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadePersonagemCampanhaCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadePersonagemCampanhaDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadePersonagemCampanhaUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadePersonagemCampanhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadePersonagemCampanhaUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadePersonagemCampanhaUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadePersonagemCampanhaUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadePersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadePersonagemCampanhaCountArgs>(args?: Prisma.Subset<T, HabilidadePersonagemCampanhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadePersonagemCampanhaCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadePersonagemCampanhaAggregateArgs>(args: Prisma.Subset<T, HabilidadePersonagemCampanhaAggregateArgs>): Prisma.PrismaPromise<GetHabilidadePersonagemCampanhaAggregateType<T>>;
    groupBy<T extends HabilidadePersonagemCampanhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadePersonagemCampanhaGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadePersonagemCampanhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadePersonagemCampanhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadePersonagemCampanhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadePersonagemCampanhaFieldRefs;
}
export interface Prisma__HabilidadePersonagemCampanhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemCampanha<T extends Prisma.PersonagemCampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    habilidade<T extends Prisma.HabilidadeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.HabilidadeDefaultArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadePersonagemCampanhaFieldRefs {
    readonly id: Prisma.FieldRef<"HabilidadePersonagemCampanha", 'Int'>;
    readonly personagemCampanhaId: Prisma.FieldRef<"HabilidadePersonagemCampanha", 'Int'>;
    readonly habilidadeId: Prisma.FieldRef<"HabilidadePersonagemCampanha", 'Int'>;
}
export type HabilidadePersonagemCampanhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
};
export type HabilidadePersonagemCampanhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
};
export type HabilidadePersonagemCampanhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    orderBy?: Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput | Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemCampanhaScalarFieldEnum | Prisma.HabilidadePersonagemCampanhaScalarFieldEnum[];
};
export type HabilidadePersonagemCampanhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    orderBy?: Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput | Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemCampanhaScalarFieldEnum | Prisma.HabilidadePersonagemCampanhaScalarFieldEnum[];
};
export type HabilidadePersonagemCampanhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    orderBy?: Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput | Prisma.HabilidadePersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemCampanhaScalarFieldEnum | Prisma.HabilidadePersonagemCampanhaScalarFieldEnum[];
};
export type HabilidadePersonagemCampanhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateInput>;
};
export type HabilidadePersonagemCampanhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadePersonagemCampanhaCreateManyInput | Prisma.HabilidadePersonagemCampanhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadePersonagemCampanhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateInput>;
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
};
export type HabilidadePersonagemCampanhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateManyMutationInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    limit?: number;
};
export type HabilidadePersonagemCampanhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaCreateInput, Prisma.HabilidadePersonagemCampanhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadePersonagemCampanhaUpdateInput, Prisma.HabilidadePersonagemCampanhaUncheckedUpdateInput>;
};
export type HabilidadePersonagemCampanhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
    where: Prisma.HabilidadePersonagemCampanhaWhereUniqueInput;
};
export type HabilidadePersonagemCampanhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
    limit?: number;
};
export type HabilidadePersonagemCampanhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemCampanhaInclude<ExtArgs> | null;
};
export {};
