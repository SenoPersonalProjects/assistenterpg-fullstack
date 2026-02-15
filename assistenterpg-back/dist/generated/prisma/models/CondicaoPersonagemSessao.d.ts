import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CondicaoPersonagemSessaoModel = runtime.Types.Result.DefaultSelection<Prisma.$CondicaoPersonagemSessaoPayload>;
export type AggregateCondicaoPersonagemSessao = {
    _count: CondicaoPersonagemSessaoCountAggregateOutputType | null;
    _avg: CondicaoPersonagemSessaoAvgAggregateOutputType | null;
    _sum: CondicaoPersonagemSessaoSumAggregateOutputType | null;
    _min: CondicaoPersonagemSessaoMinAggregateOutputType | null;
    _max: CondicaoPersonagemSessaoMaxAggregateOutputType | null;
};
export type CondicaoPersonagemSessaoAvgAggregateOutputType = {
    id: number | null;
    personagemSessaoId: number | null;
    condicaoId: number | null;
    cenaId: number | null;
    turnoAplicacao: number | null;
    duracaoTurnos: number | null;
};
export type CondicaoPersonagemSessaoSumAggregateOutputType = {
    id: number | null;
    personagemSessaoId: number | null;
    condicaoId: number | null;
    cenaId: number | null;
    turnoAplicacao: number | null;
    duracaoTurnos: number | null;
};
export type CondicaoPersonagemSessaoMinAggregateOutputType = {
    id: number | null;
    personagemSessaoId: number | null;
    condicaoId: number | null;
    cenaId: number | null;
    turnoAplicacao: number | null;
    duracaoTurnos: number | null;
};
export type CondicaoPersonagemSessaoMaxAggregateOutputType = {
    id: number | null;
    personagemSessaoId: number | null;
    condicaoId: number | null;
    cenaId: number | null;
    turnoAplicacao: number | null;
    duracaoTurnos: number | null;
};
export type CondicaoPersonagemSessaoCountAggregateOutputType = {
    id: number;
    personagemSessaoId: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos: number;
    _all: number;
};
export type CondicaoPersonagemSessaoAvgAggregateInputType = {
    id?: true;
    personagemSessaoId?: true;
    condicaoId?: true;
    cenaId?: true;
    turnoAplicacao?: true;
    duracaoTurnos?: true;
};
export type CondicaoPersonagemSessaoSumAggregateInputType = {
    id?: true;
    personagemSessaoId?: true;
    condicaoId?: true;
    cenaId?: true;
    turnoAplicacao?: true;
    duracaoTurnos?: true;
};
export type CondicaoPersonagemSessaoMinAggregateInputType = {
    id?: true;
    personagemSessaoId?: true;
    condicaoId?: true;
    cenaId?: true;
    turnoAplicacao?: true;
    duracaoTurnos?: true;
};
export type CondicaoPersonagemSessaoMaxAggregateInputType = {
    id?: true;
    personagemSessaoId?: true;
    condicaoId?: true;
    cenaId?: true;
    turnoAplicacao?: true;
    duracaoTurnos?: true;
};
export type CondicaoPersonagemSessaoCountAggregateInputType = {
    id?: true;
    personagemSessaoId?: true;
    condicaoId?: true;
    cenaId?: true;
    turnoAplicacao?: true;
    duracaoTurnos?: true;
    _all?: true;
};
export type CondicaoPersonagemSessaoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    orderBy?: Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput | Prisma.CondicaoPersonagemSessaoOrderByWithRelationInput[];
    cursor?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CondicaoPersonagemSessaoCountAggregateInputType;
    _avg?: CondicaoPersonagemSessaoAvgAggregateInputType;
    _sum?: CondicaoPersonagemSessaoSumAggregateInputType;
    _min?: CondicaoPersonagemSessaoMinAggregateInputType;
    _max?: CondicaoPersonagemSessaoMaxAggregateInputType;
};
export type GetCondicaoPersonagemSessaoAggregateType<T extends CondicaoPersonagemSessaoAggregateArgs> = {
    [P in keyof T & keyof AggregateCondicaoPersonagemSessao]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCondicaoPersonagemSessao[P]> : Prisma.GetScalarType<T[P], AggregateCondicaoPersonagemSessao[P]>;
};
export type CondicaoPersonagemSessaoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    orderBy?: Prisma.CondicaoPersonagemSessaoOrderByWithAggregationInput | Prisma.CondicaoPersonagemSessaoOrderByWithAggregationInput[];
    by: Prisma.CondicaoPersonagemSessaoScalarFieldEnum[] | Prisma.CondicaoPersonagemSessaoScalarFieldEnum;
    having?: Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CondicaoPersonagemSessaoCountAggregateInputType | true;
    _avg?: CondicaoPersonagemSessaoAvgAggregateInputType;
    _sum?: CondicaoPersonagemSessaoSumAggregateInputType;
    _min?: CondicaoPersonagemSessaoMinAggregateInputType;
    _max?: CondicaoPersonagemSessaoMaxAggregateInputType;
};
export type CondicaoPersonagemSessaoGroupByOutputType = {
    id: number;
    personagemSessaoId: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos: number | null;
    _count: CondicaoPersonagemSessaoCountAggregateOutputType | null;
    _avg: CondicaoPersonagemSessaoAvgAggregateOutputType | null;
    _sum: CondicaoPersonagemSessaoSumAggregateOutputType | null;
    _min: CondicaoPersonagemSessaoMinAggregateOutputType | null;
    _max: CondicaoPersonagemSessaoMaxAggregateOutputType | null;
};
type GetCondicaoPersonagemSessaoGroupByPayload<T extends CondicaoPersonagemSessaoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CondicaoPersonagemSessaoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CondicaoPersonagemSessaoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CondicaoPersonagemSessaoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CondicaoPersonagemSessaoGroupByOutputType[P]>;
}>>;
export type CondicaoPersonagemSessaoWhereInput = {
    AND?: Prisma.CondicaoPersonagemSessaoWhereInput | Prisma.CondicaoPersonagemSessaoWhereInput[];
    OR?: Prisma.CondicaoPersonagemSessaoWhereInput[];
    NOT?: Prisma.CondicaoPersonagemSessaoWhereInput | Prisma.CondicaoPersonagemSessaoWhereInput[];
    id?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    personagemSessaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    condicaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    cenaId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    turnoAplicacao?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    duracaoTurnos?: Prisma.IntNullableFilter<"CondicaoPersonagemSessao"> | number | null;
    personagemSessao?: Prisma.XOR<Prisma.PersonagemSessaoScalarRelationFilter, Prisma.PersonagemSessaoWhereInput>;
    condicao?: Prisma.XOR<Prisma.CondicaoScalarRelationFilter, Prisma.CondicaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaScalarRelationFilter, Prisma.CenaWhereInput>;
};
export type CondicaoPersonagemSessaoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagemSessao?: Prisma.PersonagemSessaoOrderByWithRelationInput;
    condicao?: Prisma.CondicaoOrderByWithRelationInput;
    cena?: Prisma.CenaOrderByWithRelationInput;
};
export type CondicaoPersonagemSessaoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.CondicaoPersonagemSessaoWhereInput | Prisma.CondicaoPersonagemSessaoWhereInput[];
    OR?: Prisma.CondicaoPersonagemSessaoWhereInput[];
    NOT?: Prisma.CondicaoPersonagemSessaoWhereInput | Prisma.CondicaoPersonagemSessaoWhereInput[];
    personagemSessaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    condicaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    cenaId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    turnoAplicacao?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    duracaoTurnos?: Prisma.IntNullableFilter<"CondicaoPersonagemSessao"> | number | null;
    personagemSessao?: Prisma.XOR<Prisma.PersonagemSessaoScalarRelationFilter, Prisma.PersonagemSessaoWhereInput>;
    condicao?: Prisma.XOR<Prisma.CondicaoScalarRelationFilter, Prisma.CondicaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaScalarRelationFilter, Prisma.CenaWhereInput>;
}, "id">;
export type CondicaoPersonagemSessaoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.CondicaoPersonagemSessaoCountOrderByAggregateInput;
    _avg?: Prisma.CondicaoPersonagemSessaoAvgOrderByAggregateInput;
    _max?: Prisma.CondicaoPersonagemSessaoMaxOrderByAggregateInput;
    _min?: Prisma.CondicaoPersonagemSessaoMinOrderByAggregateInput;
    _sum?: Prisma.CondicaoPersonagemSessaoSumOrderByAggregateInput;
};
export type CondicaoPersonagemSessaoScalarWhereWithAggregatesInput = {
    AND?: Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput | Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput[];
    OR?: Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput | Prisma.CondicaoPersonagemSessaoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"CondicaoPersonagemSessao"> | number;
    personagemSessaoId?: Prisma.IntWithAggregatesFilter<"CondicaoPersonagemSessao"> | number;
    condicaoId?: Prisma.IntWithAggregatesFilter<"CondicaoPersonagemSessao"> | number;
    cenaId?: Prisma.IntWithAggregatesFilter<"CondicaoPersonagemSessao"> | number;
    turnoAplicacao?: Prisma.IntWithAggregatesFilter<"CondicaoPersonagemSessao"> | number;
    duracaoTurnos?: Prisma.IntNullableWithAggregatesFilter<"CondicaoPersonagemSessao"> | number | null;
};
export type CondicaoPersonagemSessaoCreateInput = {
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
    personagemSessao: Prisma.PersonagemSessaoCreateNestedOneWithoutCondicoesInput;
    condicao: Prisma.CondicaoCreateNestedOneWithoutCondicoesPersonagemSessaoInput;
    cena: Prisma.CenaCreateNestedOneWithoutCondicoesInput;
};
export type CondicaoPersonagemSessaoUncheckedCreateInput = {
    id?: number;
    personagemSessaoId: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoUpdateInput = {
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemSessao?: Prisma.PersonagemSessaoUpdateOneRequiredWithoutCondicoesNestedInput;
    condicao?: Prisma.CondicaoUpdateOneRequiredWithoutCondicoesPersonagemSessaoNestedInput;
    cena?: Prisma.CenaUpdateOneRequiredWithoutCondicoesNestedInput;
};
export type CondicaoPersonagemSessaoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoCreateManyInput = {
    id?: number;
    personagemSessaoId: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoUpdateManyMutationInput = {
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoListRelationFilter = {
    every?: Prisma.CondicaoPersonagemSessaoWhereInput;
    some?: Prisma.CondicaoPersonagemSessaoWhereInput;
    none?: Prisma.CondicaoPersonagemSessaoWhereInput;
};
export type CondicaoPersonagemSessaoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personagemSessaoId?: Prisma.SortOrder;
    condicaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    turnoAplicacao?: Prisma.SortOrder;
    duracaoTurnos?: Prisma.SortOrder;
};
export type CondicaoPersonagemSessaoCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoCreateNestedManyWithoutPersonagemSessaoInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutPersonagemSessaoInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUpdateManyWithoutPersonagemSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemSessaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemSessaoInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutPersonagemSessaoInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemSessaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemSessaoInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutPersonagemSessaoInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoCreateNestedManyWithoutCondicaoInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCondicaoInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInputEnvelope;
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
};
export type CondicaoPersonagemSessaoUpdateManyWithoutCondicaoNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCondicaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCondicaoInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCondicaoInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCondicaoNestedInput = {
    create?: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput> | Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput[] | Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput[];
    connectOrCreate?: Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput[];
    upsert?: Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCondicaoInput[];
    createMany?: Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInputEnvelope;
    set?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    disconnect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    delete?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    connect?: Prisma.CondicaoPersonagemSessaoWhereUniqueInput | Prisma.CondicaoPersonagemSessaoWhereUniqueInput[];
    update?: Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCondicaoInput[];
    updateMany?: Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCondicaoInput | Prisma.CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCondicaoInput[];
    deleteMany?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
};
export type CondicaoPersonagemSessaoCreateWithoutCenaInput = {
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
    personagemSessao: Prisma.PersonagemSessaoCreateNestedOneWithoutCondicoesInput;
    condicao: Prisma.CondicaoCreateNestedOneWithoutCondicoesPersonagemSessaoInput;
};
export type CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput = {
    id?: number;
    personagemSessaoId: number;
    condicaoId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoCreateOrConnectWithoutCenaInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput>;
};
export type CondicaoPersonagemSessaoCreateManyCenaInputEnvelope = {
    data: Prisma.CondicaoPersonagemSessaoCreateManyCenaInput | Prisma.CondicaoPersonagemSessaoCreateManyCenaInput[];
    skipDuplicates?: boolean;
};
export type CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCenaInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutCenaInput>;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCenaInput>;
};
export type CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCenaInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutCenaInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutCenaInput>;
};
export type CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCenaInput = {
    where: Prisma.CondicaoPersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateManyMutationInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaInput>;
};
export type CondicaoPersonagemSessaoScalarWhereInput = {
    AND?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
    OR?: Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
    NOT?: Prisma.CondicaoPersonagemSessaoScalarWhereInput | Prisma.CondicaoPersonagemSessaoScalarWhereInput[];
    id?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    personagemSessaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    condicaoId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    cenaId?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    turnoAplicacao?: Prisma.IntFilter<"CondicaoPersonagemSessao"> | number;
    duracaoTurnos?: Prisma.IntNullableFilter<"CondicaoPersonagemSessao"> | number | null;
};
export type CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput = {
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
    condicao: Prisma.CondicaoCreateNestedOneWithoutCondicoesPersonagemSessaoInput;
    cena: Prisma.CenaCreateNestedOneWithoutCondicoesInput;
};
export type CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput = {
    id?: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoCreateOrConnectWithoutPersonagemSessaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput>;
};
export type CondicaoPersonagemSessaoCreateManyPersonagemSessaoInputEnvelope = {
    data: Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInput | Prisma.CondicaoPersonagemSessaoCreateManyPersonagemSessaoInput[];
    skipDuplicates?: boolean;
};
export type CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutPersonagemSessaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutPersonagemSessaoInput>;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutPersonagemSessaoInput>;
};
export type CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutPersonagemSessaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutPersonagemSessaoInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutPersonagemSessaoInput>;
};
export type CondicaoPersonagemSessaoUpdateManyWithWhereWithoutPersonagemSessaoInput = {
    where: Prisma.CondicaoPersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateManyMutationInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoInput>;
};
export type CondicaoPersonagemSessaoCreateWithoutCondicaoInput = {
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
    personagemSessao: Prisma.PersonagemSessaoCreateNestedOneWithoutCondicoesInput;
    cena: Prisma.CenaCreateNestedOneWithoutCondicoesInput;
};
export type CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput = {
    id?: number;
    personagemSessaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoCreateOrConnectWithoutCondicaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput>;
};
export type CondicaoPersonagemSessaoCreateManyCondicaoInputEnvelope = {
    data: Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInput | Prisma.CondicaoPersonagemSessaoCreateManyCondicaoInput[];
    skipDuplicates?: boolean;
};
export type CondicaoPersonagemSessaoUpsertWithWhereUniqueWithoutCondicaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutCondicaoInput>;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateWithoutCondicaoInput>;
};
export type CondicaoPersonagemSessaoUpdateWithWhereUniqueWithoutCondicaoInput = {
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateWithoutCondicaoInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateWithoutCondicaoInput>;
};
export type CondicaoPersonagemSessaoUpdateManyWithWhereWithoutCondicaoInput = {
    where: Prisma.CondicaoPersonagemSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateManyMutationInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCondicaoInput>;
};
export type CondicaoPersonagemSessaoCreateManyCenaInput = {
    id?: number;
    personagemSessaoId: number;
    condicaoId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoUpdateWithoutCenaInput = {
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemSessao?: Prisma.PersonagemSessaoUpdateOneRequiredWithoutCondicoesNestedInput;
    condicao?: Prisma.CondicaoUpdateOneRequiredWithoutCondicoesPersonagemSessaoNestedInput;
};
export type CondicaoPersonagemSessaoUncheckedUpdateWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoCreateManyPersonagemSessaoInput = {
    id?: number;
    condicaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoUpdateWithoutPersonagemSessaoInput = {
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    condicao?: Prisma.CondicaoUpdateOneRequiredWithoutCondicoesPersonagemSessaoNestedInput;
    cena?: Prisma.CenaUpdateOneRequiredWithoutCondicoesNestedInput;
};
export type CondicaoPersonagemSessaoUncheckedUpdateWithoutPersonagemSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutPersonagemSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    condicaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoCreateManyCondicaoInput = {
    id?: number;
    personagemSessaoId: number;
    cenaId: number;
    turnoAplicacao: number;
    duracaoTurnos?: number | null;
};
export type CondicaoPersonagemSessaoUpdateWithoutCondicaoInput = {
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemSessao?: Prisma.PersonagemSessaoUpdateOneRequiredWithoutCondicoesNestedInput;
    cena?: Prisma.CenaUpdateOneRequiredWithoutCondicoesNestedInput;
};
export type CondicaoPersonagemSessaoUncheckedUpdateWithoutCondicaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCondicaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagemSessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.IntFieldUpdateOperationsInput | number;
    turnoAplicacao?: Prisma.IntFieldUpdateOperationsInput | number;
    duracaoTurnos?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type CondicaoPersonagemSessaoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personagemSessaoId?: boolean;
    condicaoId?: boolean;
    cenaId?: boolean;
    turnoAplicacao?: boolean;
    duracaoTurnos?: boolean;
    personagemSessao?: boolean | Prisma.PersonagemSessaoDefaultArgs<ExtArgs>;
    condicao?: boolean | Prisma.CondicaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.CenaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["condicaoPersonagemSessao"]>;
export type CondicaoPersonagemSessaoSelectScalar = {
    id?: boolean;
    personagemSessaoId?: boolean;
    condicaoId?: boolean;
    cenaId?: boolean;
    turnoAplicacao?: boolean;
    duracaoTurnos?: boolean;
};
export type CondicaoPersonagemSessaoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personagemSessaoId" | "condicaoId" | "cenaId" | "turnoAplicacao" | "duracaoTurnos", ExtArgs["result"]["condicaoPersonagemSessao"]>;
export type CondicaoPersonagemSessaoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagemSessao?: boolean | Prisma.PersonagemSessaoDefaultArgs<ExtArgs>;
    condicao?: boolean | Prisma.CondicaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.CenaDefaultArgs<ExtArgs>;
};
export type $CondicaoPersonagemSessaoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CondicaoPersonagemSessao";
    objects: {
        personagemSessao: Prisma.$PersonagemSessaoPayload<ExtArgs>;
        condicao: Prisma.$CondicaoPayload<ExtArgs>;
        cena: Prisma.$CenaPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personagemSessaoId: number;
        condicaoId: number;
        cenaId: number;
        turnoAplicacao: number;
        duracaoTurnos: number | null;
    }, ExtArgs["result"]["condicaoPersonagemSessao"]>;
    composites: {};
};
export type CondicaoPersonagemSessaoGetPayload<S extends boolean | null | undefined | CondicaoPersonagemSessaoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload, S>;
export type CondicaoPersonagemSessaoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CondicaoPersonagemSessaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CondicaoPersonagemSessaoCountAggregateInputType | true;
};
export interface CondicaoPersonagemSessaoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CondicaoPersonagemSessao'];
        meta: {
            name: 'CondicaoPersonagemSessao';
        };
    };
    findUnique<T extends CondicaoPersonagemSessaoFindUniqueArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CondicaoPersonagemSessaoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CondicaoPersonagemSessaoFindFirstArgs>(args?: Prisma.SelectSubset<T, CondicaoPersonagemSessaoFindFirstArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CondicaoPersonagemSessaoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CondicaoPersonagemSessaoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CondicaoPersonagemSessaoFindManyArgs>(args?: Prisma.SelectSubset<T, CondicaoPersonagemSessaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CondicaoPersonagemSessaoCreateArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoCreateArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CondicaoPersonagemSessaoCreateManyArgs>(args?: Prisma.SelectSubset<T, CondicaoPersonagemSessaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends CondicaoPersonagemSessaoDeleteArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoDeleteArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CondicaoPersonagemSessaoUpdateArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoUpdateArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CondicaoPersonagemSessaoDeleteManyArgs>(args?: Prisma.SelectSubset<T, CondicaoPersonagemSessaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CondicaoPersonagemSessaoUpdateManyArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends CondicaoPersonagemSessaoUpsertArgs>(args: Prisma.SelectSubset<T, CondicaoPersonagemSessaoUpsertArgs<ExtArgs>>): Prisma.Prisma__CondicaoPersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CondicaoPersonagemSessaoCountArgs>(args?: Prisma.Subset<T, CondicaoPersonagemSessaoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CondicaoPersonagemSessaoCountAggregateOutputType> : number>;
    aggregate<T extends CondicaoPersonagemSessaoAggregateArgs>(args: Prisma.Subset<T, CondicaoPersonagemSessaoAggregateArgs>): Prisma.PrismaPromise<GetCondicaoPersonagemSessaoAggregateType<T>>;
    groupBy<T extends CondicaoPersonagemSessaoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CondicaoPersonagemSessaoGroupByArgs['orderBy'];
    } : {
        orderBy?: CondicaoPersonagemSessaoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CondicaoPersonagemSessaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCondicaoPersonagemSessaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CondicaoPersonagemSessaoFieldRefs;
}
export interface Prisma__CondicaoPersonagemSessaoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagemSessao<T extends Prisma.PersonagemSessaoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonagemSessaoDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    condicao<T extends Prisma.CondicaoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CondicaoDefaultArgs<ExtArgs>>): Prisma.Prisma__CondicaoClient<runtime.Types.Result.GetResult<Prisma.$CondicaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cena<T extends Prisma.CenaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CenaDefaultArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CondicaoPersonagemSessaoFieldRefs {
    readonly id: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
    readonly personagemSessaoId: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
    readonly condicaoId: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
    readonly cenaId: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
    readonly turnoAplicacao: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
    readonly duracaoTurnos: Prisma.FieldRef<"CondicaoPersonagemSessao", 'Int'>;
}
export type CondicaoPersonagemSessaoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
};
export type CondicaoPersonagemSessaoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
};
export type CondicaoPersonagemSessaoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CondicaoPersonagemSessaoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CondicaoPersonagemSessaoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CondicaoPersonagemSessaoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateInput>;
};
export type CondicaoPersonagemSessaoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CondicaoPersonagemSessaoCreateManyInput | Prisma.CondicaoPersonagemSessaoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CondicaoPersonagemSessaoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateInput>;
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
};
export type CondicaoPersonagemSessaoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateManyMutationInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyInput>;
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    limit?: number;
};
export type CondicaoPersonagemSessaoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.CondicaoPersonagemSessaoCreateInput, Prisma.CondicaoPersonagemSessaoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CondicaoPersonagemSessaoUpdateInput, Prisma.CondicaoPersonagemSessaoUncheckedUpdateInput>;
};
export type CondicaoPersonagemSessaoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
    where: Prisma.CondicaoPersonagemSessaoWhereUniqueInput;
};
export type CondicaoPersonagemSessaoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
    limit?: number;
};
export type CondicaoPersonagemSessaoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CondicaoPersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.CondicaoPersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.CondicaoPersonagemSessaoInclude<ExtArgs> | null;
};
export {};
