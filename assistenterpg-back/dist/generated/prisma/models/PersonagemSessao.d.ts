import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PersonagemSessaoModel = runtime.Types.Result.DefaultSelection<Prisma.$PersonagemSessaoPayload>;
export type AggregatePersonagemSessao = {
    _count: PersonagemSessaoCountAggregateOutputType | null;
    _avg: PersonagemSessaoAvgAggregateOutputType | null;
    _sum: PersonagemSessaoSumAggregateOutputType | null;
    _min: PersonagemSessaoMinAggregateOutputType | null;
    _max: PersonagemSessaoMaxAggregateOutputType | null;
};
export type PersonagemSessaoAvgAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemCampanhaId: number | null;
};
export type PersonagemSessaoSumAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemCampanhaId: number | null;
};
export type PersonagemSessaoMinAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemCampanhaId: number | null;
};
export type PersonagemSessaoMaxAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemCampanhaId: number | null;
};
export type PersonagemSessaoCountAggregateOutputType = {
    id: number;
    sessaoId: number;
    cenaId: number;
    personagemCampanhaId: number;
    _all: number;
};
export type PersonagemSessaoAvgAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemCampanhaId?: true;
};
export type PersonagemSessaoSumAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemCampanhaId?: true;
};
export type PersonagemSessaoMinAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemCampanhaId?: true;
};
export type PersonagemSessaoMaxAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemCampanhaId?: true;
};
export type PersonagemSessaoCountAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemCampanhaId?: true;
    _all?: true;
};
export type PersonagemSessaoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemSessaoWhereInput;
    orderBy?: Prisma.PersonagemSessaoOrderByWithRelationInput | Prisma.PersonagemSessaoOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PersonagemSessaoCountAggregateInputType;
    _avg?: PersonagemSessaoAvgAggregateInputType;
    _sum?: PersonagemSessaoSumAggregateInputType;
    _min?: PersonagemSessaoMinAggregateInputType;
    _max?: PersonagemSessaoMaxAggregateInputType;
};
export type GetPersonagemSessaoAggregateType<T extends PersonagemSessaoAggregateArgs> = {
    [P in keyof T & keyof AggregatePersonagemSessao]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePersonagemSessao[P]> : Prisma.GetScalarType<T[P], AggregatePersonagemSessao[P]>;
};
export type PersonagemSessaoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemSessaoWhereInput;
    orderBy?: Prisma.PersonagemSessaoOrderByWithAggregationInput | Prisma.PersonagemSessaoOrderByWithAggregationInput[];
    by: Prisma.PersonagemSessaoScalarFieldEnum[] | Prisma.PersonagemSessaoScalarFieldEnum;
    having?: Prisma.PersonagemSessaoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PersonagemSessaoCountAggregateInputType | true;
    _avg?: PersonagemSessaoAvgAggregateInputType;
    _sum?: PersonagemSessaoSumAggregateInputType;
    _min?: PersonagemSessaoMinAggregateInputType;
    _max?: PersonagemSessaoMaxAggregateInputType;
};
export type PersonagemSessaoGroupByOutputType = {
    id: number;
    sessaoId: number;
    cenaId: number | null;
    personagemCampanhaId: number;
    _count: PersonagemSessaoCountAggregateOutputType | null;
    _avg: PersonagemSessaoAvgAggregateOutputType | null;
    _sum: PersonagemSessaoSumAggregateOutputType | null;
    _min: PersonagemSessaoMinAggregateOutputType | null;
    _max: PersonagemSessaoMaxAggregateOutputType | null;
};
type GetPersonagemSessaoGroupByPayload<T extends PersonagemSessaoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PersonagemSessaoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PersonagemSessaoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PersonagemSessaoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PersonagemSessaoGroupByOutputType[P]>;
}>>;
export type PersonagemSessaoWhereInput = {
    AND?: Prisma.PersonagemSessaoWhereInput | Prisma.PersonagemSessaoWhereInput[];
    OR?: Prisma.PersonagemSessaoWhereInput[];
    NOT?: Prisma.PersonagemSessaoWhereInput | Prisma.PersonagemSessaoWhereInput[];
    id?: Prisma.IntFilter<"PersonagemSessao"> | number;
    sessaoId?: Prisma.IntFilter<"PersonagemSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"PersonagemSessao"> | number | null;
    personagemCampanhaId?: Prisma.IntFilter<"PersonagemSessao"> | number;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaNullableScalarRelationFilter, Prisma.CenaWhereInput> | null;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    condicoes?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
    eventosComoAtor?: Prisma.EventoSessaoListRelationFilter;
    eventosComoAlvo?: Prisma.EventoSessaoListRelationFilter;
};
export type PersonagemSessaoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    sessao?: Prisma.SessaoOrderByWithRelationInput;
    cena?: Prisma.CenaOrderByWithRelationInput;
    personagemCampanha?: Prisma.PersonagemCampanhaOrderByWithRelationInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoOrderByRelationAggregateInput;
    eventosComoAtor?: Prisma.EventoSessaoOrderByRelationAggregateInput;
    eventosComoAlvo?: Prisma.EventoSessaoOrderByRelationAggregateInput;
};
export type PersonagemSessaoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.PersonagemSessaoWhereInput | Prisma.PersonagemSessaoWhereInput[];
    OR?: Prisma.PersonagemSessaoWhereInput[];
    NOT?: Prisma.PersonagemSessaoWhereInput | Prisma.PersonagemSessaoWhereInput[];
    sessaoId?: Prisma.IntFilter<"PersonagemSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"PersonagemSessao"> | number | null;
    personagemCampanhaId?: Prisma.IntFilter<"PersonagemSessao"> | number;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaNullableScalarRelationFilter, Prisma.CenaWhereInput> | null;
    personagemCampanha?: Prisma.XOR<Prisma.PersonagemCampanhaScalarRelationFilter, Prisma.PersonagemCampanhaWhereInput>;
    condicoes?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
    eventosComoAtor?: Prisma.EventoSessaoListRelationFilter;
    eventosComoAlvo?: Prisma.EventoSessaoListRelationFilter;
}, "id">;
export type PersonagemSessaoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
    _count?: Prisma.PersonagemSessaoCountOrderByAggregateInput;
    _avg?: Prisma.PersonagemSessaoAvgOrderByAggregateInput;
    _max?: Prisma.PersonagemSessaoMaxOrderByAggregateInput;
    _min?: Prisma.PersonagemSessaoMinOrderByAggregateInput;
    _sum?: Prisma.PersonagemSessaoSumOrderByAggregateInput;
};
export type PersonagemSessaoScalarWhereWithAggregatesInput = {
    AND?: Prisma.PersonagemSessaoScalarWhereWithAggregatesInput | Prisma.PersonagemSessaoScalarWhereWithAggregatesInput[];
    OR?: Prisma.PersonagemSessaoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PersonagemSessaoScalarWhereWithAggregatesInput | Prisma.PersonagemSessaoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"PersonagemSessao"> | number;
    sessaoId?: Prisma.IntWithAggregatesFilter<"PersonagemSessao"> | number;
    cenaId?: Prisma.IntNullableWithAggregatesFilter<"PersonagemSessao"> | number | null;
    personagemCampanhaId?: Prisma.IntWithAggregatesFilter<"PersonagemSessao"> | number;
};
export type PersonagemSessaoCreateInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUpdateInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoCreateManyInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
};
export type PersonagemSessaoUpdateManyMutationInput = {};
export type PersonagemSessaoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type PersonagemSessaoListRelationFilter = {
    every?: Prisma.PersonagemSessaoWhereInput;
    some?: Prisma.PersonagemSessaoWhereInput;
    none?: Prisma.PersonagemSessaoWhereInput;
};
export type PersonagemSessaoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PersonagemSessaoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
};
export type PersonagemSessaoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
};
export type PersonagemSessaoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
};
export type PersonagemSessaoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
};
export type PersonagemSessaoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemCampanhaId?: Prisma.SortOrder;
};
export type PersonagemSessaoScalarRelationFilter = {
    is?: Prisma.PersonagemSessaoWhereInput;
    isNot?: Prisma.PersonagemSessaoWhereInput;
};
export type PersonagemSessaoNullableScalarRelationFilter = {
    is?: Prisma.PersonagemSessaoWhereInput | null;
    isNot?: Prisma.PersonagemSessaoWhereInput | null;
};
export type PersonagemSessaoCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemCampanhaInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoUncheckedUpdateManyWithoutPersonagemCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput> | Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemCampanhaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemCampanhaInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutPersonagemCampanhaInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutPersonagemCampanhaInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput> | Prisma.PersonagemSessaoCreateWithoutSessaoInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput | Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.PersonagemSessaoCreateManySessaoInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUncheckedCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput> | Prisma.PersonagemSessaoCreateWithoutSessaoInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput | Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.PersonagemSessaoCreateManySessaoInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput> | Prisma.PersonagemSessaoCreateWithoutSessaoInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput | Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutSessaoInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.PersonagemSessaoCreateManySessaoInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutSessaoInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutSessaoInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoUncheckedUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput> | Prisma.PersonagemSessaoCreateWithoutSessaoInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput | Prisma.PersonagemSessaoCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutSessaoInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.PersonagemSessaoCreateManySessaoInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutSessaoInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutSessaoInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.PersonagemSessaoCreateWithoutCenaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.PersonagemSessaoCreateWithoutCenaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
};
export type PersonagemSessaoUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.PersonagemSessaoCreateWithoutCenaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.PersonagemSessaoCreateWithoutCenaInput[] | Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.PersonagemSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.PersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.PersonagemSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.PersonagemSessaoWhereUniqueInput | Prisma.PersonagemSessaoWhereUniqueInput[];
    update?: Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.PersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.PersonagemSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.PersonagemSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
};
export type PersonagemSessaoCreateNestedOneWithoutCondicoesInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCondicoesInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCondicoesInput;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoUpdateOneRequiredWithoutCondicoesNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCondicoesInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutCondicoesInput;
    upsert?: Prisma.PersonagemSessaoUpsertWithoutCondicoesInput;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonagemSessaoUpdateToOneWithWhereWithoutCondicoesInput, Prisma.PersonagemSessaoUpdateWithoutCondicoesInput>, Prisma.PersonagemSessaoUncheckedUpdateWithoutCondicoesInput>;
};
export type PersonagemSessaoCreateNestedOneWithoutEventosComoAtorInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAtorInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutEventosComoAtorInput;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoCreateNestedOneWithoutEventosComoAlvoInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAlvoInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutEventosComoAlvoInput;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoUpdateOneWithoutEventosComoAtorNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAtorInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutEventosComoAtorInput;
    upsert?: Prisma.PersonagemSessaoUpsertWithoutEventosComoAtorInput;
    disconnect?: Prisma.PersonagemSessaoWhereInput | boolean;
    delete?: Prisma.PersonagemSessaoWhereInput | boolean;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonagemSessaoUpdateToOneWithWhereWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUpdateWithoutEventosComoAtorInput>, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAtorInput>;
};
export type PersonagemSessaoUpdateOneWithoutEventosComoAlvoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAlvoInput>;
    connectOrCreate?: Prisma.PersonagemSessaoCreateOrConnectWithoutEventosComoAlvoInput;
    upsert?: Prisma.PersonagemSessaoUpsertWithoutEventosComoAlvoInput;
    disconnect?: Prisma.PersonagemSessaoWhereInput | boolean;
    delete?: Prisma.PersonagemSessaoWhereInput | boolean;
    connect?: Prisma.PersonagemSessaoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonagemSessaoUpdateToOneWithWhereWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUpdateWithoutEventosComoAlvoInput>, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAlvoInput>;
};
export type PersonagemSessaoCreateWithoutPersonagemCampanhaInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoCreateOrConnectWithoutPersonagemCampanhaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type PersonagemSessaoCreateManyPersonagemCampanhaInputEnvelope = {
    data: Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInput | Prisma.PersonagemSessaoCreateManyPersonagemCampanhaInput[];
    skipDuplicates?: boolean;
};
export type PersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutPersonagemCampanhaInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutPersonagemCampanhaInput>;
};
export type PersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemCampanhaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutPersonagemCampanhaInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutPersonagemCampanhaInput>;
};
export type PersonagemSessaoUpdateManyWithWhereWithoutPersonagemCampanhaInput = {
    where: Prisma.PersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateManyMutationInput, Prisma.PersonagemSessaoUncheckedUpdateManyWithoutPersonagemCampanhaInput>;
};
export type PersonagemSessaoScalarWhereInput = {
    AND?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
    OR?: Prisma.PersonagemSessaoScalarWhereInput[];
    NOT?: Prisma.PersonagemSessaoScalarWhereInput | Prisma.PersonagemSessaoScalarWhereInput[];
    id?: Prisma.IntFilter<"PersonagemSessao"> | number;
    sessaoId?: Prisma.IntFilter<"PersonagemSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"PersonagemSessao"> | number | null;
    personagemCampanhaId?: Prisma.IntFilter<"PersonagemSessao"> | number;
};
export type PersonagemSessaoCreateWithoutSessaoInput = {
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateWithoutSessaoInput = {
    id?: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoCreateOrConnectWithoutSessaoInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput>;
};
export type PersonagemSessaoCreateManySessaoInputEnvelope = {
    data: Prisma.PersonagemSessaoCreateManySessaoInput | Prisma.PersonagemSessaoCreateManySessaoInput[];
    skipDuplicates?: boolean;
};
export type PersonagemSessaoUpsertWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutSessaoInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutSessaoInput>;
};
export type PersonagemSessaoUpdateWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutSessaoInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutSessaoInput>;
};
export type PersonagemSessaoUpdateManyWithWhereWithoutSessaoInput = {
    where: Prisma.PersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateManyMutationInput, Prisma.PersonagemSessaoUncheckedUpdateManyWithoutSessaoInput>;
};
export type PersonagemSessaoCreateWithoutCenaInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateWithoutCenaInput = {
    id?: number;
    sessaoId: number;
    personagemCampanhaId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoCreateOrConnectWithoutCenaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput>;
};
export type PersonagemSessaoCreateManyCenaInputEnvelope = {
    data: Prisma.PersonagemSessaoCreateManyCenaInput | Prisma.PersonagemSessaoCreateManyCenaInput[];
    skipDuplicates?: boolean;
};
export type PersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutCenaInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCenaInput>;
};
export type PersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutCenaInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutCenaInput>;
};
export type PersonagemSessaoUpdateManyWithWhereWithoutCenaInput = {
    where: Prisma.PersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateManyMutationInput, Prisma.PersonagemSessaoUncheckedUpdateManyWithoutCenaInput>;
};
export type PersonagemSessaoCreateWithoutCondicoesInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateWithoutCondicoesInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoCreateOrConnectWithoutCondicoesInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCondicoesInput>;
};
export type PersonagemSessaoUpsertWithoutCondicoesInput = {
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutCondicoesInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedCreateWithoutCondicoesInput>;
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type PersonagemSessaoUpdateToOneWithWhereWithoutCondicoesInput = {
    where?: Prisma.PersonagemSessaoWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutCondicoesInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutCondicoesInput>;
};
export type PersonagemSessaoUpdateWithoutCondicoesInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutCondicoesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoCreateWithoutEventosComoAtorInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAlvo?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoUncheckedCreateWithoutEventosComoAtorInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput;
};
export type PersonagemSessaoCreateOrConnectWithoutEventosComoAtorInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAtorInput>;
};
export type PersonagemSessaoCreateWithoutEventosComoAlvoInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutPersonagensInput;
    cena?: Prisma.CenaCreateNestedOneWithoutPersonagensInput;
    personagemCampanha: Prisma.PersonagemCampanhaCreateNestedOneWithoutPersonagensSessaoInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoCreateNestedManyWithoutPersonagemAtorInput;
};
export type PersonagemSessaoUncheckedCreateWithoutEventosComoAlvoInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput;
};
export type PersonagemSessaoCreateOrConnectWithoutEventosComoAlvoInput = {
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAlvoInput>;
};
export type PersonagemSessaoUpsertWithoutEventosComoAtorInput = {
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAtorInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAtorInput>;
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type PersonagemSessaoUpdateToOneWithWhereWithoutEventosComoAtorInput = {
    where?: Prisma.PersonagemSessaoWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutEventosComoAtorInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAtorInput>;
};
export type PersonagemSessaoUpdateWithoutEventosComoAtorInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutEventosComoAtorInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUpsertWithoutEventosComoAlvoInput = {
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAlvoInput>;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedCreateWithoutEventosComoAlvoInput>;
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type PersonagemSessaoUpdateToOneWithWhereWithoutEventosComoAlvoInput = {
    where?: Prisma.PersonagemSessaoWhereInput;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateWithoutEventosComoAlvoInput, Prisma.PersonagemSessaoUncheckedUpdateWithoutEventosComoAlvoInput>;
};
export type PersonagemSessaoUpdateWithoutEventosComoAlvoInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutEventosComoAlvoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
};
export type PersonagemSessaoCreateManyPersonagemCampanhaInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
};
export type PersonagemSessaoUpdateWithoutPersonagemCampanhaInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateManyWithoutPersonagemCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type PersonagemSessaoCreateManySessaoInput = {
    id?: number;
    cenaId?: number | null;
    personagemCampanhaId: number;
};
export type PersonagemSessaoUpdateWithoutSessaoInput = {
    cena?: Prisma.CenaUpdateOneWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateManyWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type PersonagemSessaoCreateManyCenaInput = {
    id?: number;
    sessaoId: number;
    personagemCampanhaId: number;
};
export type PersonagemSessaoUpdateWithoutCenaInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutPersonagensNestedInput;
    personagemCampanha?: Prisma.PersonagemCampanhaUpdateOneRequiredWithoutPersonagensSessaoNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput;
    eventosComoAtor?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput;
    eventosComoAlvo?: Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput;
};
export type PersonagemSessaoUncheckedUpdateManyWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemCampanhaId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type PersonagemSessaoCountOutputType = {
    condicoes: number;
    eventosComoAtor: number;
    eventosComoAlvo: number;
};
export type PersonagemSessaoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    condicoes?: boolean | PersonagemSessaoCountOutputTypeCountCondicoesArgs;
    eventosComoAtor?: boolean | PersonagemSessaoCountOutputTypeCountEventosComoAtorArgs;
    eventosComoAlvo?: boolean | PersonagemSessaoCountOutputTypeCountEventosComoAlvoArgs;
};
export type PersonagemSessaoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoCountOutputTypeSelect<ExtArgs> | null;
};
export type PersonagemSessaoCountOutputTypeCountCondicoesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
};
export type PersonagemSessaoCountOutputTypeCountEventosComoAtorArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
};
export type PersonagemSessaoCountOutputTypeCountEventosComoAlvoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
};
export type PersonagemSessaoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessaoId?: boolean;
    cenaId?: boolean;
    personagemCampanhaId?: boolean;
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.PersonagemSessao$cenaArgs<ExtArgs>;
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    condicoes?: boolean | Prisma.PersonagemSessao$condicoesArgs<ExtArgs>;
    eventosComoAtor?: boolean | Prisma.PersonagemSessao$eventosComoAtorArgs<ExtArgs>;
    eventosComoAlvo?: boolean | Prisma.PersonagemSessao$eventosComoAlvoArgs<ExtArgs>;
    _count?: boolean | Prisma.PersonagemSessaoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["personagemSessao"]>;
export type PersonagemSessaoSelectScalar = {
    id?: boolean;
    sessaoId?: boolean;
    cenaId?: boolean;
    personagemCampanhaId?: boolean;
};
export type PersonagemSessaoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessaoId" | "cenaId" | "personagemCampanhaId", ExtArgs["result"]["personagemSessao"]>;
export type PersonagemSessaoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.PersonagemSessao$cenaArgs<ExtArgs>;
    personagemCampanha?: boolean | Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>;
    condicoes?: boolean | Prisma.PersonagemSessao$condicoesArgs<ExtArgs>;
    eventosComoAtor?: boolean | Prisma.PersonagemSessao$eventosComoAtorArgs<ExtArgs>;
    eventosComoAlvo?: boolean | Prisma.PersonagemSessao$eventosComoAlvoArgs<ExtArgs>;
    _count?: boolean | Prisma.PersonagemSessaoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $PersonagemSessaoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PersonagemSessao";
    objects: {
        sessao: Prisma.$SessaoPayload<ExtArgs>;
        cena: Prisma.$CenaPayload<ExtArgs> | null;
        personagemCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>;
        condicoes: Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>[];
        eventosComoAtor: Prisma.$EventoSessaoPayload<ExtArgs>[];
        eventosComoAlvo: Prisma.$EventoSessaoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        sessaoId: number;
        cenaId: number | null;
        personagemCampanhaId: number;
    }, ExtArgs["result"]["personagemSessao"]>;
    composites: {};
};
export type PersonagemSessaoGetPayload<S extends boolean | null | undefined | PersonagemSessaoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload, S>;
export type PersonagemSessaoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PersonagemSessaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PersonagemSessaoCountAggregateInputType | true;
};
export interface PersonagemSessaoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PersonagemSessao'];
        meta: {
            name: 'PersonagemSessao';
        };
    };
    findUnique<T extends PersonagemSessaoFindUniqueArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PersonagemSessaoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PersonagemSessaoFindFirstArgs>(args?: Prisma.SelectSubset<T, PersonagemSessaoFindFirstArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PersonagemSessaoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PersonagemSessaoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PersonagemSessaoFindManyArgs>(args?: Prisma.SelectSubset<T, PersonagemSessaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PersonagemSessaoCreateArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoCreateArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PersonagemSessaoCreateManyArgs>(args?: Prisma.SelectSubset<T, PersonagemSessaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends PersonagemSessaoDeleteArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoDeleteArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PersonagemSessaoUpdateArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoUpdateArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PersonagemSessaoDeleteManyArgs>(args?: Prisma.SelectSubset<T, PersonagemSessaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PersonagemSessaoUpdateManyArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends PersonagemSessaoUpsertArgs>(args: Prisma.SelectSubset<T, PersonagemSessaoUpsertArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PersonagemSessaoCountArgs>(args?: Prisma.Subset<T, PersonagemSessaoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PersonagemSessaoCountAggregateOutputType> : number>;
    aggregate<T extends PersonagemSessaoAggregateArgs>(args: Prisma.Subset<T, PersonagemSessaoAggregateArgs>): Prisma.PrismaPromise<GetPersonagemSessaoAggregateType<T>>;
    groupBy<T extends PersonagemSessaoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PersonagemSessaoGroupByArgs['orderBy'];
    } : {
        orderBy?: PersonagemSessaoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PersonagemSessaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonagemSessaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PersonagemSessaoFieldRefs;
}
export interface Prisma__PersonagemSessaoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sessao<T extends Prisma.SessaoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SessaoDefaultArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cena<T extends Prisma.PersonagemSessao$cenaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemSessao$cenaArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    personagemCampanha<T extends Prisma.PersonagemCampanhaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemCampanhaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemCampanhaClient<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    condicoes<T extends Prisma.PersonagemSessao$condicoesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemSessao$condicoesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    eventosComoAtor<T extends Prisma.PersonagemSessao$eventosComoAtorArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemSessao$eventosComoAtorArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    eventosComoAlvo<T extends Prisma.PersonagemSessao$eventosComoAlvoArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemSessao$eventosComoAlvoArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PersonagemSessaoFieldRefs {
    readonly id: Prisma.FieldRef<"PersonagemSessao", 'Int'>;
    readonly sessaoId: Prisma.FieldRef<"PersonagemSessao", 'Int'>;
    readonly cenaId: Prisma.FieldRef<"PersonagemSessao", 'Int'>;
    readonly personagemCampanhaId: Prisma.FieldRef<"PersonagemSessao", 'Int'>;
}
export type PersonagemSessaoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonagemSessaoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonagemSessaoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonagemSessaoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonagemSessaoCreateInput, Prisma.PersonagemSessaoUncheckedCreateInput>;
};
export type PersonagemSessaoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PersonagemSessaoCreateManyInput | Prisma.PersonagemSessaoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PersonagemSessaoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateInput, Prisma.PersonagemSessaoUncheckedUpdateInput>;
    where: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PersonagemSessaoUpdateManyMutationInput, Prisma.PersonagemSessaoUncheckedUpdateManyInput>;
    where?: Prisma.PersonagemSessaoWhereInput;
    limit?: number;
};
export type PersonagemSessaoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.PersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonagemSessaoCreateInput, Prisma.PersonagemSessaoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PersonagemSessaoUpdateInput, Prisma.PersonagemSessaoUncheckedUpdateInput>;
};
export type PersonagemSessaoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.PersonagemSessaoWhereUniqueInput;
};
export type PersonagemSessaoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemSessaoWhereInput;
    limit?: number;
};
export type PersonagemSessao$cenaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where?: Prisma.CenaWhereInput;
};
export type PersonagemSessao$condicoesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    orderBy?: Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput | Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CondicaoPersonagemSessaoScalarFieldEnum | Prisma.CondicaoPersonagemSessaoScalarFieldEnum[];
};
export type PersonagemSessao$eventosComoAtorArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonagemSessao$eventosComoAlvoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonagemSessaoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
};
export {};
