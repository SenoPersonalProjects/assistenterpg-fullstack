import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MembroCampanhaModel = runtime.Types.Result.DefaultSelection<Prisma.$MembroCampanhaPayload>;
export type AggregateMembroCampanha = {
    _count: MembroCampanhaCountAggregateOutputType | null;
    _avg: MembroCampanhaAvgAggregateOutputType | null;
    _sum: MembroCampanhaSumAggregateOutputType | null;
    _min: MembroCampanhaMinAggregateOutputType | null;
    _max: MembroCampanhaMaxAggregateOutputType | null;
};
export type MembroCampanhaAvgAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    usuarioId: number | null;
};
export type MembroCampanhaSumAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    usuarioId: number | null;
};
export type MembroCampanhaMinAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    usuarioId: number | null;
    papel: string | null;
    entrouEm: Date | null;
};
export type MembroCampanhaMaxAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    usuarioId: number | null;
    papel: string | null;
    entrouEm: Date | null;
};
export type MembroCampanhaCountAggregateOutputType = {
    id: number;
    campanhaId: number;
    usuarioId: number;
    papel: number;
    entrouEm: number;
    _all: number;
};
export type MembroCampanhaAvgAggregateInputType = {
    id?: true;
    campanhaId?: true;
    usuarioId?: true;
};
export type MembroCampanhaSumAggregateInputType = {
    id?: true;
    campanhaId?: true;
    usuarioId?: true;
};
export type MembroCampanhaMinAggregateInputType = {
    id?: true;
    campanhaId?: true;
    usuarioId?: true;
    papel?: true;
    entrouEm?: true;
};
export type MembroCampanhaMaxAggregateInputType = {
    id?: true;
    campanhaId?: true;
    usuarioId?: true;
    papel?: true;
    entrouEm?: true;
};
export type MembroCampanhaCountAggregateInputType = {
    id?: true;
    campanhaId?: true;
    usuarioId?: true;
    papel?: true;
    entrouEm?: true;
    _all?: true;
};
export type MembroCampanhaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MembroCampanhaWhereInput;
    orderBy?: Prisma.MembroCampanhaOrderByWithRelationInput | Prisma.MembroCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.MembroCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MembroCampanhaCountAggregateInputType;
    _avg?: MembroCampanhaAvgAggregateInputType;
    _sum?: MembroCampanhaSumAggregateInputType;
    _min?: MembroCampanhaMinAggregateInputType;
    _max?: MembroCampanhaMaxAggregateInputType;
};
export type GetMembroCampanhaAggregateType<T extends MembroCampanhaAggregateArgs> = {
    [P in keyof T & keyof AggregateMembroCampanha]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMembroCampanha[P]> : Prisma.GetScalarType<T[P], AggregateMembroCampanha[P]>;
};
export type MembroCampanhaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MembroCampanhaWhereInput;
    orderBy?: Prisma.MembroCampanhaOrderByWithAggregationInput | Prisma.MembroCampanhaOrderByWithAggregationInput[];
    by: Prisma.MembroCampanhaScalarFieldEnum[] | Prisma.MembroCampanhaScalarFieldEnum;
    having?: Prisma.MembroCampanhaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MembroCampanhaCountAggregateInputType | true;
    _avg?: MembroCampanhaAvgAggregateInputType;
    _sum?: MembroCampanhaSumAggregateInputType;
    _min?: MembroCampanhaMinAggregateInputType;
    _max?: MembroCampanhaMaxAggregateInputType;
};
export type MembroCampanhaGroupByOutputType = {
    id: number;
    campanhaId: number;
    usuarioId: number;
    papel: string;
    entrouEm: Date;
    _count: MembroCampanhaCountAggregateOutputType | null;
    _avg: MembroCampanhaAvgAggregateOutputType | null;
    _sum: MembroCampanhaSumAggregateOutputType | null;
    _min: MembroCampanhaMinAggregateOutputType | null;
    _max: MembroCampanhaMaxAggregateOutputType | null;
};
type GetMembroCampanhaGroupByPayload<T extends MembroCampanhaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MembroCampanhaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MembroCampanhaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MembroCampanhaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MembroCampanhaGroupByOutputType[P]>;
}>>;
export type MembroCampanhaWhereInput = {
    AND?: Prisma.MembroCampanhaWhereInput | Prisma.MembroCampanhaWhereInput[];
    OR?: Prisma.MembroCampanhaWhereInput[];
    NOT?: Prisma.MembroCampanhaWhereInput | Prisma.MembroCampanhaWhereInput[];
    id?: Prisma.IntFilter<"MembroCampanha"> | number;
    campanhaId?: Prisma.IntFilter<"MembroCampanha"> | number;
    usuarioId?: Prisma.IntFilter<"MembroCampanha"> | number;
    papel?: Prisma.StringFilter<"MembroCampanha"> | string;
    entrouEm?: Prisma.DateTimeFilter<"MembroCampanha"> | Date | string;
    campanha?: Prisma.XOR<Prisma.CampanhaScalarRelationFilter, Prisma.CampanhaWhereInput>;
    usuario?: Prisma.XOR<Prisma.UsuarioScalarRelationFilter, Prisma.UsuarioWhereInput>;
};
export type MembroCampanhaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    papel?: Prisma.SortOrder;
    entrouEm?: Prisma.SortOrder;
    campanha?: Prisma.CampanhaOrderByWithRelationInput;
    usuario?: Prisma.UsuarioOrderByWithRelationInput;
    _relevance?: Prisma.MembroCampanhaOrderByRelevanceInput;
};
export type MembroCampanhaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    campanhaId_usuarioId?: Prisma.MembroCampanhaCampanhaIdUsuarioIdCompoundUniqueInput;
    AND?: Prisma.MembroCampanhaWhereInput | Prisma.MembroCampanhaWhereInput[];
    OR?: Prisma.MembroCampanhaWhereInput[];
    NOT?: Prisma.MembroCampanhaWhereInput | Prisma.MembroCampanhaWhereInput[];
    campanhaId?: Prisma.IntFilter<"MembroCampanha"> | number;
    usuarioId?: Prisma.IntFilter<"MembroCampanha"> | number;
    papel?: Prisma.StringFilter<"MembroCampanha"> | string;
    entrouEm?: Prisma.DateTimeFilter<"MembroCampanha"> | Date | string;
    campanha?: Prisma.XOR<Prisma.CampanhaScalarRelationFilter, Prisma.CampanhaWhereInput>;
    usuario?: Prisma.XOR<Prisma.UsuarioScalarRelationFilter, Prisma.UsuarioWhereInput>;
}, "id" | "campanhaId_usuarioId">;
export type MembroCampanhaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    papel?: Prisma.SortOrder;
    entrouEm?: Prisma.SortOrder;
    _count?: Prisma.MembroCampanhaCountOrderByAggregateInput;
    _avg?: Prisma.MembroCampanhaAvgOrderByAggregateInput;
    _max?: Prisma.MembroCampanhaMaxOrderByAggregateInput;
    _min?: Prisma.MembroCampanhaMinOrderByAggregateInput;
    _sum?: Prisma.MembroCampanhaSumOrderByAggregateInput;
};
export type MembroCampanhaScalarWhereWithAggregatesInput = {
    AND?: Prisma.MembroCampanhaScalarWhereWithAggregatesInput | Prisma.MembroCampanhaScalarWhereWithAggregatesInput[];
    OR?: Prisma.MembroCampanhaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MembroCampanhaScalarWhereWithAggregatesInput | Prisma.MembroCampanhaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"MembroCampanha"> | number;
    campanhaId?: Prisma.IntWithAggregatesFilter<"MembroCampanha"> | number;
    usuarioId?: Prisma.IntWithAggregatesFilter<"MembroCampanha"> | number;
    papel?: Prisma.StringWithAggregatesFilter<"MembroCampanha"> | string;
    entrouEm?: Prisma.DateTimeWithAggregatesFilter<"MembroCampanha"> | Date | string;
};
export type MembroCampanhaCreateInput = {
    papel: string;
    entrouEm?: Date | string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutMembrosInput;
    usuario: Prisma.UsuarioCreateNestedOneWithoutMembrosCampanhaInput;
};
export type MembroCampanhaUncheckedCreateInput = {
    id?: number;
    campanhaId: number;
    usuarioId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaUpdateInput = {
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutMembrosNestedInput;
    usuario?: Prisma.UsuarioUpdateOneRequiredWithoutMembrosCampanhaNestedInput;
};
export type MembroCampanhaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaCreateManyInput = {
    id?: number;
    campanhaId: number;
    usuarioId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaUpdateManyMutationInput = {
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaListRelationFilter = {
    every?: Prisma.MembroCampanhaWhereInput;
    some?: Prisma.MembroCampanhaWhereInput;
    none?: Prisma.MembroCampanhaWhereInput;
};
export type MembroCampanhaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MembroCampanhaOrderByRelevanceInput = {
    fields: Prisma.MembroCampanhaOrderByRelevanceFieldEnum | Prisma.MembroCampanhaOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type MembroCampanhaCampanhaIdUsuarioIdCompoundUniqueInput = {
    campanhaId: number;
    usuarioId: number;
};
export type MembroCampanhaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    papel?: Prisma.SortOrder;
    entrouEm?: Prisma.SortOrder;
};
export type MembroCampanhaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type MembroCampanhaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    papel?: Prisma.SortOrder;
    entrouEm?: Prisma.SortOrder;
};
export type MembroCampanhaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    papel?: Prisma.SortOrder;
    entrouEm?: Prisma.SortOrder;
};
export type MembroCampanhaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type MembroCampanhaCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput> | Prisma.MembroCampanhaCreateWithoutUsuarioInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput | Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.MembroCampanhaCreateManyUsuarioInputEnvelope;
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
};
export type MembroCampanhaUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput> | Prisma.MembroCampanhaCreateWithoutUsuarioInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput | Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.MembroCampanhaCreateManyUsuarioInputEnvelope;
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
};
export type MembroCampanhaUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput> | Prisma.MembroCampanhaCreateWithoutUsuarioInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput | Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.MembroCampanhaCreateManyUsuarioInputEnvelope;
    set?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    disconnect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    delete?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    update?: Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.MembroCampanhaUpdateManyWithWhereWithoutUsuarioInput | Prisma.MembroCampanhaUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
};
export type MembroCampanhaUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput> | Prisma.MembroCampanhaCreateWithoutUsuarioInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput | Prisma.MembroCampanhaCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.MembroCampanhaCreateManyUsuarioInputEnvelope;
    set?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    disconnect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    delete?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    update?: Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.MembroCampanhaUpdateManyWithWhereWithoutUsuarioInput | Prisma.MembroCampanhaUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
};
export type MembroCampanhaCreateNestedManyWithoutCampanhaInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput> | Prisma.MembroCampanhaCreateWithoutCampanhaInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput | Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput[];
    createMany?: Prisma.MembroCampanhaCreateManyCampanhaInputEnvelope;
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
};
export type MembroCampanhaUncheckedCreateNestedManyWithoutCampanhaInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput> | Prisma.MembroCampanhaCreateWithoutCampanhaInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput | Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput[];
    createMany?: Prisma.MembroCampanhaCreateManyCampanhaInputEnvelope;
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
};
export type MembroCampanhaUpdateManyWithoutCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput> | Prisma.MembroCampanhaCreateWithoutCampanhaInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput | Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput[];
    upsert?: Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutCampanhaInput | Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutCampanhaInput[];
    createMany?: Prisma.MembroCampanhaCreateManyCampanhaInputEnvelope;
    set?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    disconnect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    delete?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    update?: Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutCampanhaInput | Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutCampanhaInput[];
    updateMany?: Prisma.MembroCampanhaUpdateManyWithWhereWithoutCampanhaInput | Prisma.MembroCampanhaUpdateManyWithWhereWithoutCampanhaInput[];
    deleteMany?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
};
export type MembroCampanhaUncheckedUpdateManyWithoutCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput> | Prisma.MembroCampanhaCreateWithoutCampanhaInput[] | Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput | Prisma.MembroCampanhaCreateOrConnectWithoutCampanhaInput[];
    upsert?: Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutCampanhaInput | Prisma.MembroCampanhaUpsertWithWhereUniqueWithoutCampanhaInput[];
    createMany?: Prisma.MembroCampanhaCreateManyCampanhaInputEnvelope;
    set?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    disconnect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    delete?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    connect?: Prisma.MembroCampanhaWhereUniqueInput | Prisma.MembroCampanhaWhereUniqueInput[];
    update?: Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutCampanhaInput | Prisma.MembroCampanhaUpdateWithWhereUniqueWithoutCampanhaInput[];
    updateMany?: Prisma.MembroCampanhaUpdateManyWithWhereWithoutCampanhaInput | Prisma.MembroCampanhaUpdateManyWithWhereWithoutCampanhaInput[];
    deleteMany?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
};
export type MembroCampanhaCreateWithoutUsuarioInput = {
    papel: string;
    entrouEm?: Date | string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutMembrosInput;
};
export type MembroCampanhaUncheckedCreateWithoutUsuarioInput = {
    id?: number;
    campanhaId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaCreateOrConnectWithoutUsuarioInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput>;
};
export type MembroCampanhaCreateManyUsuarioInputEnvelope = {
    data: Prisma.MembroCampanhaCreateManyUsuarioInput | Prisma.MembroCampanhaCreateManyUsuarioInput[];
    skipDuplicates?: boolean;
};
export type MembroCampanhaUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.MembroCampanhaUpdateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedUpdateWithoutUsuarioInput>;
    create: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedCreateWithoutUsuarioInput>;
};
export type MembroCampanhaUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateWithoutUsuarioInput, Prisma.MembroCampanhaUncheckedUpdateWithoutUsuarioInput>;
};
export type MembroCampanhaUpdateManyWithWhereWithoutUsuarioInput = {
    where: Prisma.MembroCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateManyMutationInput, Prisma.MembroCampanhaUncheckedUpdateManyWithoutUsuarioInput>;
};
export type MembroCampanhaScalarWhereInput = {
    AND?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
    OR?: Prisma.MembroCampanhaScalarWhereInput[];
    NOT?: Prisma.MembroCampanhaScalarWhereInput | Prisma.MembroCampanhaScalarWhereInput[];
    id?: Prisma.IntFilter<"MembroCampanha"> | number;
    campanhaId?: Prisma.IntFilter<"MembroCampanha"> | number;
    usuarioId?: Prisma.IntFilter<"MembroCampanha"> | number;
    papel?: Prisma.StringFilter<"MembroCampanha"> | string;
    entrouEm?: Prisma.DateTimeFilter<"MembroCampanha"> | Date | string;
};
export type MembroCampanhaCreateWithoutCampanhaInput = {
    papel: string;
    entrouEm?: Date | string;
    usuario: Prisma.UsuarioCreateNestedOneWithoutMembrosCampanhaInput;
};
export type MembroCampanhaUncheckedCreateWithoutCampanhaInput = {
    id?: number;
    usuarioId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaCreateOrConnectWithoutCampanhaInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput>;
};
export type MembroCampanhaCreateManyCampanhaInputEnvelope = {
    data: Prisma.MembroCampanhaCreateManyCampanhaInput | Prisma.MembroCampanhaCreateManyCampanhaInput[];
    skipDuplicates?: boolean;
};
export type MembroCampanhaUpsertWithWhereUniqueWithoutCampanhaInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    update: Prisma.XOR<Prisma.MembroCampanhaUpdateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedUpdateWithoutCampanhaInput>;
    create: Prisma.XOR<Prisma.MembroCampanhaCreateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedCreateWithoutCampanhaInput>;
};
export type MembroCampanhaUpdateWithWhereUniqueWithoutCampanhaInput = {
    where: Prisma.MembroCampanhaWhereUniqueInput;
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateWithoutCampanhaInput, Prisma.MembroCampanhaUncheckedUpdateWithoutCampanhaInput>;
};
export type MembroCampanhaUpdateManyWithWhereWithoutCampanhaInput = {
    where: Prisma.MembroCampanhaScalarWhereInput;
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateManyMutationInput, Prisma.MembroCampanhaUncheckedUpdateManyWithoutCampanhaInput>;
};
export type MembroCampanhaCreateManyUsuarioInput = {
    id?: number;
    campanhaId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaUpdateWithoutUsuarioInput = {
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutMembrosNestedInput;
};
export type MembroCampanhaUncheckedUpdateWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaUncheckedUpdateManyWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaCreateManyCampanhaInput = {
    id?: number;
    usuarioId: number;
    papel: string;
    entrouEm?: Date | string;
};
export type MembroCampanhaUpdateWithoutCampanhaInput = {
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuario?: Prisma.UsuarioUpdateOneRequiredWithoutMembrosCampanhaNestedInput;
};
export type MembroCampanhaUncheckedUpdateWithoutCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaUncheckedUpdateManyWithoutCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    papel?: Prisma.StringFieldUpdateOperationsInput | string;
    entrouEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MembroCampanhaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    campanhaId?: boolean;
    usuarioId?: boolean;
    papel?: boolean;
    entrouEm?: boolean;
    campanha?: boolean | Prisma.CampanhaDefaultArgs<ExtArgs>;
    usuario?: boolean | Prisma.UsuarioDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["membroCampanha"]>;
export type MembroCampanhaSelectScalar = {
    id?: boolean;
    campanhaId?: boolean;
    usuarioId?: boolean;
    papel?: boolean;
    entrouEm?: boolean;
};
export type MembroCampanhaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "campanhaId" | "usuarioId" | "papel" | "entrouEm", ExtArgs["result"]["membroCampanha"]>;
export type MembroCampanhaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campanha?: boolean | Prisma.CampanhaDefaultArgs<ExtArgs>;
    usuario?: boolean | Prisma.UsuarioDefaultArgs<ExtArgs>;
};
export type $MembroCampanhaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MembroCampanha";
    objects: {
        campanha: Prisma.$CampanhaPayload<ExtArgs>;
        usuario: Prisma.$UsuarioPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        campanhaId: number;
        usuarioId: number;
        papel: string;
        entrouEm: Date;
    }, ExtArgs["result"]["membroCampanha"]>;
    composites: {};
};
export type MembroCampanhaGetPayload<S extends boolean | null | undefined | MembroCampanhaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload, S>;
export type MembroCampanhaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MembroCampanhaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MembroCampanhaCountAggregateInputType | true;
};
export interface MembroCampanhaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MembroCampanha'];
        meta: {
            name: 'MembroCampanha';
        };
    };
    findUnique<T extends MembroCampanhaFindUniqueArgs>(args: Prisma.SelectSubset<T, MembroCampanhaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MembroCampanhaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MembroCampanhaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MembroCampanhaFindFirstArgs>(args?: Prisma.SelectSubset<T, MembroCampanhaFindFirstArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MembroCampanhaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MembroCampanhaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MembroCampanhaFindManyArgs>(args?: Prisma.SelectSubset<T, MembroCampanhaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MembroCampanhaCreateArgs>(args: Prisma.SelectSubset<T, MembroCampanhaCreateArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MembroCampanhaCreateManyArgs>(args?: Prisma.SelectSubset<T, MembroCampanhaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends MembroCampanhaDeleteArgs>(args: Prisma.SelectSubset<T, MembroCampanhaDeleteArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MembroCampanhaUpdateArgs>(args: Prisma.SelectSubset<T, MembroCampanhaUpdateArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MembroCampanhaDeleteManyArgs>(args?: Prisma.SelectSubset<T, MembroCampanhaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MembroCampanhaUpdateManyArgs>(args: Prisma.SelectSubset<T, MembroCampanhaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends MembroCampanhaUpsertArgs>(args: Prisma.SelectSubset<T, MembroCampanhaUpsertArgs<ExtArgs>>): Prisma.Prisma__MembroCampanhaClient<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MembroCampanhaCountArgs>(args?: Prisma.Subset<T, MembroCampanhaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MembroCampanhaCountAggregateOutputType> : number>;
    aggregate<T extends MembroCampanhaAggregateArgs>(args: Prisma.Subset<T, MembroCampanhaAggregateArgs>): Prisma.PrismaPromise<GetMembroCampanhaAggregateType<T>>;
    groupBy<T extends MembroCampanhaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MembroCampanhaGroupByArgs['orderBy'];
    } : {
        orderBy?: MembroCampanhaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MembroCampanhaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMembroCampanhaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MembroCampanhaFieldRefs;
}
export interface Prisma__MembroCampanhaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    campanha<T extends Prisma.CampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__CampanhaClient<runtime.Types.Result.GetResult<Prisma.$CampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    usuario<T extends Prisma.UsuarioDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UsuarioDefaultArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MembroCampanhaFieldRefs {
    readonly id: Prisma.FieldRef<"MembroCampanha", 'Int'>;
    readonly campanhaId: Prisma.FieldRef<"MembroCampanha", 'Int'>;
    readonly usuarioId: Prisma.FieldRef<"MembroCampanha", 'Int'>;
    readonly papel: Prisma.FieldRef<"MembroCampanha", 'String'>;
    readonly entrouEm: Prisma.FieldRef<"MembroCampanha", 'DateTime'>;
}
export type MembroCampanhaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where: Prisma.MembroCampanhaWhereUniqueInput;
};
export type MembroCampanhaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where: Prisma.MembroCampanhaWhereUniqueInput;
};
export type MembroCampanhaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where?: Prisma.MembroCampanhaWhereInput;
    orderBy?: Prisma.MembroCampanhaOrderByWithRelationInput | Prisma.MembroCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.MembroCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MembroCampanhaScalarFieldEnum | Prisma.MembroCampanhaScalarFieldEnum[];
};
export type MembroCampanhaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where?: Prisma.MembroCampanhaWhereInput;
    orderBy?: Prisma.MembroCampanhaOrderByWithRelationInput | Prisma.MembroCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.MembroCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MembroCampanhaScalarFieldEnum | Prisma.MembroCampanhaScalarFieldEnum[];
};
export type MembroCampanhaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where?: Prisma.MembroCampanhaWhereInput;
    orderBy?: Prisma.MembroCampanhaOrderByWithRelationInput | Prisma.MembroCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.MembroCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MembroCampanhaScalarFieldEnum | Prisma.MembroCampanhaScalarFieldEnum[];
};
export type MembroCampanhaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MembroCampanhaCreateInput, Prisma.MembroCampanhaUncheckedCreateInput>;
};
export type MembroCampanhaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MembroCampanhaCreateManyInput | Prisma.MembroCampanhaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MembroCampanhaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateInput, Prisma.MembroCampanhaUncheckedUpdateInput>;
    where: Prisma.MembroCampanhaWhereUniqueInput;
};
export type MembroCampanhaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MembroCampanhaUpdateManyMutationInput, Prisma.MembroCampanhaUncheckedUpdateManyInput>;
    where?: Prisma.MembroCampanhaWhereInput;
    limit?: number;
};
export type MembroCampanhaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where: Prisma.MembroCampanhaWhereUniqueInput;
    create: Prisma.XOR<Prisma.MembroCampanhaCreateInput, Prisma.MembroCampanhaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MembroCampanhaUpdateInput, Prisma.MembroCampanhaUncheckedUpdateInput>;
};
export type MembroCampanhaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
    where: Prisma.MembroCampanhaWhereUniqueInput;
};
export type MembroCampanhaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MembroCampanhaWhereInput;
    limit?: number;
};
export type MembroCampanhaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MembroCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.MembroCampanhaOmit<ExtArgs> | null;
    include?: Prisma.MembroCampanhaInclude<ExtArgs> | null;
};
export {};
