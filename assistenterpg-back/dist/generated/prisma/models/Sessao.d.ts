import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SessaoModel = runtime.Types.Result.DefaultSelection<Prisma.$SessaoPayload>;
export type AggregateSessao = {
    _count: SessaoCountAggregateOutputType | null;
    _avg: SessaoAvgAggregateOutputType | null;
    _sum: SessaoSumAggregateOutputType | null;
    _min: SessaoMinAggregateOutputType | null;
    _max: SessaoMaxAggregateOutputType | null;
};
export type SessaoAvgAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
};
export type SessaoSumAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
};
export type SessaoMinAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    titulo: string | null;
};
export type SessaoMaxAggregateOutputType = {
    id: number | null;
    campanhaId: number | null;
    titulo: string | null;
};
export type SessaoCountAggregateOutputType = {
    id: number;
    campanhaId: number;
    titulo: number;
    _all: number;
};
export type SessaoAvgAggregateInputType = {
    id?: true;
    campanhaId?: true;
};
export type SessaoSumAggregateInputType = {
    id?: true;
    campanhaId?: true;
};
export type SessaoMinAggregateInputType = {
    id?: true;
    campanhaId?: true;
    titulo?: true;
};
export type SessaoMaxAggregateInputType = {
    id?: true;
    campanhaId?: true;
    titulo?: true;
};
export type SessaoCountAggregateInputType = {
    id?: true;
    campanhaId?: true;
    titulo?: true;
    _all?: true;
};
export type SessaoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessaoWhereInput;
    orderBy?: Prisma.SessaoOrderByWithRelationInput | Prisma.SessaoOrderByWithRelationInput[];
    cursor?: Prisma.SessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SessaoCountAggregateInputType;
    _avg?: SessaoAvgAggregateInputType;
    _sum?: SessaoSumAggregateInputType;
    _min?: SessaoMinAggregateInputType;
    _max?: SessaoMaxAggregateInputType;
};
export type GetSessaoAggregateType<T extends SessaoAggregateArgs> = {
    [P in keyof T & keyof AggregateSessao]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSessao[P]> : Prisma.GetScalarType<T[P], AggregateSessao[P]>;
};
export type SessaoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessaoWhereInput;
    orderBy?: Prisma.SessaoOrderByWithAggregationInput | Prisma.SessaoOrderByWithAggregationInput[];
    by: Prisma.SessaoScalarFieldEnum[] | Prisma.SessaoScalarFieldEnum;
    having?: Prisma.SessaoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SessaoCountAggregateInputType | true;
    _avg?: SessaoAvgAggregateInputType;
    _sum?: SessaoSumAggregateInputType;
    _min?: SessaoMinAggregateInputType;
    _max?: SessaoMaxAggregateInputType;
};
export type SessaoGroupByOutputType = {
    id: number;
    campanhaId: number;
    titulo: string;
    _count: SessaoCountAggregateOutputType | null;
    _avg: SessaoAvgAggregateOutputType | null;
    _sum: SessaoSumAggregateOutputType | null;
    _min: SessaoMinAggregateOutputType | null;
    _max: SessaoMaxAggregateOutputType | null;
};
type GetSessaoGroupByPayload<T extends SessaoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SessaoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SessaoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SessaoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SessaoGroupByOutputType[P]>;
}>>;
export type SessaoWhereInput = {
    AND?: Prisma.SessaoWhereInput | Prisma.SessaoWhereInput[];
    OR?: Prisma.SessaoWhereInput[];
    NOT?: Prisma.SessaoWhereInput | Prisma.SessaoWhereInput[];
    id?: Prisma.IntFilter<"Sessao"> | number;
    campanhaId?: Prisma.IntFilter<"Sessao"> | number;
    titulo?: Prisma.StringFilter<"Sessao"> | string;
    campanha?: Prisma.XOR<Prisma.CampanhaScalarRelationFilter, Prisma.CampanhaWhereInput>;
    cenas?: Prisma.CenaListRelationFilter;
    personagens?: Prisma.PersonagemSessaoListRelationFilter;
    eventos?: Prisma.EventoSessaoListRelationFilter;
};
export type SessaoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    campanha?: Prisma.CampanhaOrderByWithRelationInput;
    cenas?: Prisma.CenaOrderByRelationAggregateInput;
    personagens?: Prisma.PersonagemSessaoOrderByRelationAggregateInput;
    eventos?: Prisma.EventoSessaoOrderByRelationAggregateInput;
    _relevance?: Prisma.SessaoOrderByRelevanceInput;
};
export type SessaoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.SessaoWhereInput | Prisma.SessaoWhereInput[];
    OR?: Prisma.SessaoWhereInput[];
    NOT?: Prisma.SessaoWhereInput | Prisma.SessaoWhereInput[];
    campanhaId?: Prisma.IntFilter<"Sessao"> | number;
    titulo?: Prisma.StringFilter<"Sessao"> | string;
    campanha?: Prisma.XOR<Prisma.CampanhaScalarRelationFilter, Prisma.CampanhaWhereInput>;
    cenas?: Prisma.CenaListRelationFilter;
    personagens?: Prisma.PersonagemSessaoListRelationFilter;
    eventos?: Prisma.EventoSessaoListRelationFilter;
}, "id">;
export type SessaoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    _count?: Prisma.SessaoCountOrderByAggregateInput;
    _avg?: Prisma.SessaoAvgOrderByAggregateInput;
    _max?: Prisma.SessaoMaxOrderByAggregateInput;
    _min?: Prisma.SessaoMinOrderByAggregateInput;
    _sum?: Prisma.SessaoSumOrderByAggregateInput;
};
export type SessaoScalarWhereWithAggregatesInput = {
    AND?: Prisma.SessaoScalarWhereWithAggregatesInput | Prisma.SessaoScalarWhereWithAggregatesInput[];
    OR?: Prisma.SessaoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SessaoScalarWhereWithAggregatesInput | Prisma.SessaoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Sessao"> | number;
    campanhaId?: Prisma.IntWithAggregatesFilter<"Sessao"> | number;
    titulo?: Prisma.StringWithAggregatesFilter<"Sessao"> | string;
};
export type SessaoCreateInput = {
    titulo: string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutSessoesInput;
    cenas?: Prisma.CenaCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutSessaoInput;
};
export type SessaoUncheckedCreateInput = {
    id?: number;
    campanhaId: number;
    titulo: string;
    cenas?: Prisma.CenaUncheckedCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutSessaoInput;
};
export type SessaoUpdateInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutSessoesNestedInput;
    cenas?: Prisma.CenaUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    cenas?: Prisma.CenaUncheckedUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
};
export type SessaoCreateManyInput = {
    id?: number;
    campanhaId: number;
    titulo: string;
};
export type SessaoUpdateManyMutationInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type SessaoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type SessaoListRelationFilter = {
    every?: Prisma.SessaoWhereInput;
    some?: Prisma.SessaoWhereInput;
    none?: Prisma.SessaoWhereInput;
};
export type SessaoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SessaoOrderByRelevanceInput = {
    fields: Prisma.SessaoOrderByRelevanceFieldEnum | Prisma.SessaoOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type SessaoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
};
export type SessaoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
};
export type SessaoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
};
export type SessaoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
};
export type SessaoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    campanhaId?: Prisma.SortOrder;
};
export type SessaoScalarRelationFilter = {
    is?: Prisma.SessaoWhereInput;
    isNot?: Prisma.SessaoWhereInput;
};
export type SessaoCreateNestedManyWithoutCampanhaInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput> | Prisma.SessaoCreateWithoutCampanhaInput[] | Prisma.SessaoUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCampanhaInput | Prisma.SessaoCreateOrConnectWithoutCampanhaInput[];
    createMany?: Prisma.SessaoCreateManyCampanhaInputEnvelope;
    connect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
};
export type SessaoUncheckedCreateNestedManyWithoutCampanhaInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput> | Prisma.SessaoCreateWithoutCampanhaInput[] | Prisma.SessaoUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCampanhaInput | Prisma.SessaoCreateOrConnectWithoutCampanhaInput[];
    createMany?: Prisma.SessaoCreateManyCampanhaInputEnvelope;
    connect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
};
export type SessaoUpdateManyWithoutCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput> | Prisma.SessaoCreateWithoutCampanhaInput[] | Prisma.SessaoUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCampanhaInput | Prisma.SessaoCreateOrConnectWithoutCampanhaInput[];
    upsert?: Prisma.SessaoUpsertWithWhereUniqueWithoutCampanhaInput | Prisma.SessaoUpsertWithWhereUniqueWithoutCampanhaInput[];
    createMany?: Prisma.SessaoCreateManyCampanhaInputEnvelope;
    set?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    disconnect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    delete?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    connect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    update?: Prisma.SessaoUpdateWithWhereUniqueWithoutCampanhaInput | Prisma.SessaoUpdateWithWhereUniqueWithoutCampanhaInput[];
    updateMany?: Prisma.SessaoUpdateManyWithWhereWithoutCampanhaInput | Prisma.SessaoUpdateManyWithWhereWithoutCampanhaInput[];
    deleteMany?: Prisma.SessaoScalarWhereInput | Prisma.SessaoScalarWhereInput[];
};
export type SessaoUncheckedUpdateManyWithoutCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput> | Prisma.SessaoCreateWithoutCampanhaInput[] | Prisma.SessaoUncheckedCreateWithoutCampanhaInput[];
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCampanhaInput | Prisma.SessaoCreateOrConnectWithoutCampanhaInput[];
    upsert?: Prisma.SessaoUpsertWithWhereUniqueWithoutCampanhaInput | Prisma.SessaoUpsertWithWhereUniqueWithoutCampanhaInput[];
    createMany?: Prisma.SessaoCreateManyCampanhaInputEnvelope;
    set?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    disconnect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    delete?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    connect?: Prisma.SessaoWhereUniqueInput | Prisma.SessaoWhereUniqueInput[];
    update?: Prisma.SessaoUpdateWithWhereUniqueWithoutCampanhaInput | Prisma.SessaoUpdateWithWhereUniqueWithoutCampanhaInput[];
    updateMany?: Prisma.SessaoUpdateManyWithWhereWithoutCampanhaInput | Prisma.SessaoUpdateManyWithWhereWithoutCampanhaInput[];
    deleteMany?: Prisma.SessaoScalarWhereInput | Prisma.SessaoScalarWhereInput[];
};
export type SessaoCreateNestedOneWithoutCenasInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCenasInput, Prisma.SessaoUncheckedCreateWithoutCenasInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCenasInput;
    connect?: Prisma.SessaoWhereUniqueInput;
};
export type SessaoUpdateOneRequiredWithoutCenasNestedInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutCenasInput, Prisma.SessaoUncheckedCreateWithoutCenasInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutCenasInput;
    upsert?: Prisma.SessaoUpsertWithoutCenasInput;
    connect?: Prisma.SessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SessaoUpdateToOneWithWhereWithoutCenasInput, Prisma.SessaoUpdateWithoutCenasInput>, Prisma.SessaoUncheckedUpdateWithoutCenasInput>;
};
export type SessaoCreateNestedOneWithoutPersonagensInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutPersonagensInput, Prisma.SessaoUncheckedCreateWithoutPersonagensInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutPersonagensInput;
    connect?: Prisma.SessaoWhereUniqueInput;
};
export type SessaoUpdateOneRequiredWithoutPersonagensNestedInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutPersonagensInput, Prisma.SessaoUncheckedCreateWithoutPersonagensInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutPersonagensInput;
    upsert?: Prisma.SessaoUpsertWithoutPersonagensInput;
    connect?: Prisma.SessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SessaoUpdateToOneWithWhereWithoutPersonagensInput, Prisma.SessaoUpdateWithoutPersonagensInput>, Prisma.SessaoUncheckedUpdateWithoutPersonagensInput>;
};
export type SessaoCreateNestedOneWithoutEventosInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutEventosInput, Prisma.SessaoUncheckedCreateWithoutEventosInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutEventosInput;
    connect?: Prisma.SessaoWhereUniqueInput;
};
export type SessaoUpdateOneRequiredWithoutEventosNestedInput = {
    create?: Prisma.XOR<Prisma.SessaoCreateWithoutEventosInput, Prisma.SessaoUncheckedCreateWithoutEventosInput>;
    connectOrCreate?: Prisma.SessaoCreateOrConnectWithoutEventosInput;
    upsert?: Prisma.SessaoUpsertWithoutEventosInput;
    connect?: Prisma.SessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SessaoUpdateToOneWithWhereWithoutEventosInput, Prisma.SessaoUpdateWithoutEventosInput>, Prisma.SessaoUncheckedUpdateWithoutEventosInput>;
};
export type SessaoCreateWithoutCampanhaInput = {
    titulo: string;
    cenas?: Prisma.CenaCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutSessaoInput;
};
export type SessaoUncheckedCreateWithoutCampanhaInput = {
    id?: number;
    titulo: string;
    cenas?: Prisma.CenaUncheckedCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutSessaoInput;
};
export type SessaoCreateOrConnectWithoutCampanhaInput = {
    where: Prisma.SessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput>;
};
export type SessaoCreateManyCampanhaInputEnvelope = {
    data: Prisma.SessaoCreateManyCampanhaInput | Prisma.SessaoCreateManyCampanhaInput[];
    skipDuplicates?: boolean;
};
export type SessaoUpsertWithWhereUniqueWithoutCampanhaInput = {
    where: Prisma.SessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.SessaoUpdateWithoutCampanhaInput, Prisma.SessaoUncheckedUpdateWithoutCampanhaInput>;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutCampanhaInput, Prisma.SessaoUncheckedCreateWithoutCampanhaInput>;
};
export type SessaoUpdateWithWhereUniqueWithoutCampanhaInput = {
    where: Prisma.SessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.SessaoUpdateWithoutCampanhaInput, Prisma.SessaoUncheckedUpdateWithoutCampanhaInput>;
};
export type SessaoUpdateManyWithWhereWithoutCampanhaInput = {
    where: Prisma.SessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.SessaoUpdateManyMutationInput, Prisma.SessaoUncheckedUpdateManyWithoutCampanhaInput>;
};
export type SessaoScalarWhereInput = {
    AND?: Prisma.SessaoScalarWhereInput | Prisma.SessaoScalarWhereInput[];
    OR?: Prisma.SessaoScalarWhereInput[];
    NOT?: Prisma.SessaoScalarWhereInput | Prisma.SessaoScalarWhereInput[];
    id?: Prisma.IntFilter<"Sessao"> | number;
    campanhaId?: Prisma.IntFilter<"Sessao"> | number;
    titulo?: Prisma.StringFilter<"Sessao"> | string;
};
export type SessaoCreateWithoutCenasInput = {
    titulo: string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutSessoesInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutSessaoInput;
};
export type SessaoUncheckedCreateWithoutCenasInput = {
    id?: number;
    campanhaId: number;
    titulo: string;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutSessaoInput;
};
export type SessaoCreateOrConnectWithoutCenasInput = {
    where: Prisma.SessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutCenasInput, Prisma.SessaoUncheckedCreateWithoutCenasInput>;
};
export type SessaoUpsertWithoutCenasInput = {
    update: Prisma.XOR<Prisma.SessaoUpdateWithoutCenasInput, Prisma.SessaoUncheckedUpdateWithoutCenasInput>;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutCenasInput, Prisma.SessaoUncheckedCreateWithoutCenasInput>;
    where?: Prisma.SessaoWhereInput;
};
export type SessaoUpdateToOneWithWhereWithoutCenasInput = {
    where?: Prisma.SessaoWhereInput;
    data: Prisma.XOR<Prisma.SessaoUpdateWithoutCenasInput, Prisma.SessaoUncheckedUpdateWithoutCenasInput>;
};
export type SessaoUpdateWithoutCenasInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutSessoesNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateWithoutCenasInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
};
export type SessaoCreateWithoutPersonagensInput = {
    titulo: string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutSessoesInput;
    cenas?: Prisma.CenaCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutSessaoInput;
};
export type SessaoUncheckedCreateWithoutPersonagensInput = {
    id?: number;
    campanhaId: number;
    titulo: string;
    cenas?: Prisma.CenaUncheckedCreateNestedManyWithoutSessaoInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutSessaoInput;
};
export type SessaoCreateOrConnectWithoutPersonagensInput = {
    where: Prisma.SessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutPersonagensInput, Prisma.SessaoUncheckedCreateWithoutPersonagensInput>;
};
export type SessaoUpsertWithoutPersonagensInput = {
    update: Prisma.XOR<Prisma.SessaoUpdateWithoutPersonagensInput, Prisma.SessaoUncheckedUpdateWithoutPersonagensInput>;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutPersonagensInput, Prisma.SessaoUncheckedCreateWithoutPersonagensInput>;
    where?: Prisma.SessaoWhereInput;
};
export type SessaoUpdateToOneWithWhereWithoutPersonagensInput = {
    where?: Prisma.SessaoWhereInput;
    data: Prisma.XOR<Prisma.SessaoUpdateWithoutPersonagensInput, Prisma.SessaoUncheckedUpdateWithoutPersonagensInput>;
};
export type SessaoUpdateWithoutPersonagensInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutSessoesNestedInput;
    cenas?: Prisma.CenaUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateWithoutPersonagensInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    cenas?: Prisma.CenaUncheckedUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
};
export type SessaoCreateWithoutEventosInput = {
    titulo: string;
    campanha: Prisma.CampanhaCreateNestedOneWithoutSessoesInput;
    cenas?: Prisma.CenaCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutSessaoInput;
};
export type SessaoUncheckedCreateWithoutEventosInput = {
    id?: number;
    campanhaId: number;
    titulo: string;
    cenas?: Prisma.CenaUncheckedCreateNestedManyWithoutSessaoInput;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutSessaoInput;
};
export type SessaoCreateOrConnectWithoutEventosInput = {
    where: Prisma.SessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutEventosInput, Prisma.SessaoUncheckedCreateWithoutEventosInput>;
};
export type SessaoUpsertWithoutEventosInput = {
    update: Prisma.XOR<Prisma.SessaoUpdateWithoutEventosInput, Prisma.SessaoUncheckedUpdateWithoutEventosInput>;
    create: Prisma.XOR<Prisma.SessaoCreateWithoutEventosInput, Prisma.SessaoUncheckedCreateWithoutEventosInput>;
    where?: Prisma.SessaoWhereInput;
};
export type SessaoUpdateToOneWithWhereWithoutEventosInput = {
    where?: Prisma.SessaoWhereInput;
    data: Prisma.XOR<Prisma.SessaoUpdateWithoutEventosInput, Prisma.SessaoUncheckedUpdateWithoutEventosInput>;
};
export type SessaoUpdateWithoutEventosInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    campanha?: Prisma.CampanhaUpdateOneRequiredWithoutSessoesNestedInput;
    cenas?: Prisma.CenaUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateWithoutEventosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    campanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    cenas?: Prisma.CenaUncheckedUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
};
export type SessaoCreateManyCampanhaInput = {
    id?: number;
    titulo: string;
};
export type SessaoUpdateWithoutCampanhaInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    cenas?: Prisma.CenaUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateWithoutCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    cenas?: Prisma.CenaUncheckedUpdateManyWithoutSessaoNestedInput;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutSessaoNestedInput;
};
export type SessaoUncheckedUpdateManyWithoutCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type SessaoCountOutputType = {
    cenas: number;
    personagens: number;
    eventos: number;
};
export type SessaoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cenas?: boolean | SessaoCountOutputTypeCountCenasArgs;
    personagens?: boolean | SessaoCountOutputTypeCountPersonagensArgs;
    eventos?: boolean | SessaoCountOutputTypeCountEventosArgs;
};
export type SessaoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoCountOutputTypeSelect<ExtArgs> | null;
};
export type SessaoCountOutputTypeCountCenasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CenaWhereInput;
};
export type SessaoCountOutputTypeCountPersonagensArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type SessaoCountOutputTypeCountEventosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
};
export type SessaoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    campanhaId?: boolean;
    titulo?: boolean;
    campanha?: boolean | Prisma.CampanhaDefaultArgs<ExtArgs>;
    cenas?: boolean | Prisma.Sessao$cenasArgs<ExtArgs>;
    personagens?: boolean | Prisma.Sessao$personagensArgs<ExtArgs>;
    eventos?: boolean | Prisma.Sessao$eventosArgs<ExtArgs>;
    _count?: boolean | Prisma.SessaoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessao"]>;
export type SessaoSelectScalar = {
    id?: boolean;
    campanhaId?: boolean;
    titulo?: boolean;
};
export type SessaoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "campanhaId" | "titulo", ExtArgs["result"]["sessao"]>;
export type SessaoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campanha?: boolean | Prisma.CampanhaDefaultArgs<ExtArgs>;
    cenas?: boolean | Prisma.Sessao$cenasArgs<ExtArgs>;
    personagens?: boolean | Prisma.Sessao$personagensArgs<ExtArgs>;
    eventos?: boolean | Prisma.Sessao$eventosArgs<ExtArgs>;
    _count?: boolean | Prisma.SessaoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $SessaoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Sessao";
    objects: {
        campanha: Prisma.$CampanhaPayload<ExtArgs>;
        cenas: Prisma.$CenaPayload<ExtArgs>[];
        personagens: Prisma.$PersonagemSessaoPayload<ExtArgs>[];
        eventos: Prisma.$EventoSessaoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        campanhaId: number;
        titulo: string;
    }, ExtArgs["result"]["sessao"]>;
    composites: {};
};
export type SessaoGetPayload<S extends boolean | null | undefined | SessaoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SessaoPayload, S>;
export type SessaoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SessaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SessaoCountAggregateInputType | true;
};
export interface SessaoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Sessao'];
        meta: {
            name: 'Sessao';
        };
    };
    findUnique<T extends SessaoFindUniqueArgs>(args: Prisma.SelectSubset<T, SessaoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SessaoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SessaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SessaoFindFirstArgs>(args?: Prisma.SelectSubset<T, SessaoFindFirstArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SessaoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SessaoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SessaoFindManyArgs>(args?: Prisma.SelectSubset<T, SessaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SessaoCreateArgs>(args: Prisma.SelectSubset<T, SessaoCreateArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SessaoCreateManyArgs>(args?: Prisma.SelectSubset<T, SessaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends SessaoDeleteArgs>(args: Prisma.SelectSubset<T, SessaoDeleteArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SessaoUpdateArgs>(args: Prisma.SelectSubset<T, SessaoUpdateArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SessaoDeleteManyArgs>(args?: Prisma.SelectSubset<T, SessaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SessaoUpdateManyArgs>(args: Prisma.SelectSubset<T, SessaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends SessaoUpsertArgs>(args: Prisma.SelectSubset<T, SessaoUpsertArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SessaoCountArgs>(args?: Prisma.Subset<T, SessaoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SessaoCountAggregateOutputType> : number>;
    aggregate<T extends SessaoAggregateArgs>(args: Prisma.Subset<T, SessaoAggregateArgs>): Prisma.PrismaPromise<GetSessaoAggregateType<T>>;
    groupBy<T extends SessaoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SessaoGroupByArgs['orderBy'];
    } : {
        orderBy?: SessaoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SessaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SessaoFieldRefs;
}
export interface Prisma__SessaoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    campanha<T extends Prisma.CampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__CampanhaClient<runtime.Types.Result.GetResult<Prisma.$CampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cenas<T extends Prisma.Sessao$cenasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Sessao$cenasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagens<T extends Prisma.Sessao$personagensArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Sessao$personagensArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    eventos<T extends Prisma.Sessao$eventosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Sessao$eventosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SessaoFieldRefs {
    readonly id: Prisma.FieldRef<"Sessao", 'Int'>;
    readonly campanhaId: Prisma.FieldRef<"Sessao", 'Int'>;
    readonly titulo: Prisma.FieldRef<"Sessao", 'String'>;
}
export type SessaoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where: Prisma.SessaoWhereUniqueInput;
};
export type SessaoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where: Prisma.SessaoWhereUniqueInput;
};
export type SessaoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where?: Prisma.SessaoWhereInput;
    orderBy?: Prisma.SessaoOrderByWithRelationInput | Prisma.SessaoOrderByWithRelationInput[];
    cursor?: Prisma.SessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessaoScalarFieldEnum | Prisma.SessaoScalarFieldEnum[];
};
export type SessaoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where?: Prisma.SessaoWhereInput;
    orderBy?: Prisma.SessaoOrderByWithRelationInput | Prisma.SessaoOrderByWithRelationInput[];
    cursor?: Prisma.SessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessaoScalarFieldEnum | Prisma.SessaoScalarFieldEnum[];
};
export type SessaoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where?: Prisma.SessaoWhereInput;
    orderBy?: Prisma.SessaoOrderByWithRelationInput | Prisma.SessaoOrderByWithRelationInput[];
    cursor?: Prisma.SessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessaoScalarFieldEnum | Prisma.SessaoScalarFieldEnum[];
};
export type SessaoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessaoCreateInput, Prisma.SessaoUncheckedCreateInput>;
};
export type SessaoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SessaoCreateManyInput | Prisma.SessaoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SessaoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessaoUpdateInput, Prisma.SessaoUncheckedUpdateInput>;
    where: Prisma.SessaoWhereUniqueInput;
};
export type SessaoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SessaoUpdateManyMutationInput, Prisma.SessaoUncheckedUpdateManyInput>;
    where?: Prisma.SessaoWhereInput;
    limit?: number;
};
export type SessaoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where: Prisma.SessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessaoCreateInput, Prisma.SessaoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SessaoUpdateInput, Prisma.SessaoUncheckedUpdateInput>;
};
export type SessaoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
    where: Prisma.SessaoWhereUniqueInput;
};
export type SessaoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessaoWhereInput;
    limit?: number;
};
export type Sessao$cenasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where?: Prisma.CenaWhereInput;
    orderBy?: Prisma.CenaOrderByWithRelationInput | Prisma.CenaOrderByWithRelationInput[];
    cursor?: Prisma.CenaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CenaScalarFieldEnum | Prisma.CenaScalarFieldEnum[];
};
export type Sessao$personagensArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where?: Prisma.PersonagemSessaoWhereInput;
    orderBy?: Prisma.PersonagemSessaoOrderByWithRelationInput | Prisma.PersonagemSessaoOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonagemSessaoScalarFieldEnum | Prisma.PersonagemSessaoScalarFieldEnum[];
};
export type Sessao$eventosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    where?: Prisma.EventoSessaoWhereInput;
    orderBy?: Prisma.EventoSessaoOrderByWithRelationInput | Prisma.EventoSessaoOrderByWithRelationInput[];
    cursor?: Prisma.EventoSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EventoSessaoScalarFieldEnum | Prisma.EventoSessaoScalarFieldEnum[];
};
export type SessaoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessaoSelect<ExtArgs> | null;
    omit?: Prisma.SessaoOmit<ExtArgs> | null;
    include?: Prisma.SessaoInclude<ExtArgs> | null;
};
export {};
