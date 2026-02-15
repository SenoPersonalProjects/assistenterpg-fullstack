import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EventoSessaoModel = runtime.Types.Result.DefaultSelection<Prisma.$EventoSessaoPayload>;
export type AggregateEventoSessao = {
    _count: EventoSessaoCountAggregateOutputType | null;
    _avg: EventoSessaoAvgAggregateOutputType | null;
    _sum: EventoSessaoSumAggregateOutputType | null;
    _min: EventoSessaoMinAggregateOutputType | null;
    _max: EventoSessaoMaxAggregateOutputType | null;
};
export type EventoSessaoAvgAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemAtorId: number | null;
    personagemAlvoId: number | null;
};
export type EventoSessaoSumAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    personagemAtorId: number | null;
    personagemAlvoId: number | null;
};
export type EventoSessaoMinAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    criadoEm: Date | null;
    tipoEvento: string | null;
    personagemAtorId: number | null;
    personagemAlvoId: number | null;
};
export type EventoSessaoMaxAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
    cenaId: number | null;
    criadoEm: Date | null;
    tipoEvento: string | null;
    personagemAtorId: number | null;
    personagemAlvoId: number | null;
};
export type EventoSessaoCountAggregateOutputType = {
    id: number;
    sessaoId: number;
    cenaId: number;
    criadoEm: number;
    tipoEvento: number;
    personagemAtorId: number;
    personagemAlvoId: number;
    dados: number;
    _all: number;
};
export type EventoSessaoAvgAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemAtorId?: true;
    personagemAlvoId?: true;
};
export type EventoSessaoSumAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    personagemAtorId?: true;
    personagemAlvoId?: true;
};
export type EventoSessaoMinAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    criadoEm?: true;
    tipoEvento?: true;
    personagemAtorId?: true;
    personagemAlvoId?: true;
};
export type EventoSessaoMaxAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    criadoEm?: true;
    tipoEvento?: true;
    personagemAtorId?: true;
    personagemAlvoId?: true;
};
export type EventoSessaoCountAggregateInputType = {
    id?: true;
    sessaoId?: true;
    cenaId?: true;
    criadoEm?: true;
    tipoEvento?: true;
    personagemAtorId?: true;
    personagemAlvoId?: true;
    dados?: true;
    _all?: true;
};
export type EventoSessaoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
    orderBy?: Prisma.EventoSessaoOrderByWithRelationInput | Prisma.EventoSessaoOrderByWithRelationInput[];
    cursor?: Prisma.EventoSessaoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EventoSessaoCountAggregateInputType;
    _avg?: EventoSessaoAvgAggregateInputType;
    _sum?: EventoSessaoSumAggregateInputType;
    _min?: EventoSessaoMinAggregateInputType;
    _max?: EventoSessaoMaxAggregateInputType;
};
export type GetEventoSessaoAggregateType<T extends EventoSessaoAggregateArgs> = {
    [P in keyof T & keyof AggregateEventoSessao]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEventoSessao[P]> : Prisma.GetScalarType<T[P], AggregateEventoSessao[P]>;
};
export type EventoSessaoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
    orderBy?: Prisma.EventoSessaoOrderByWithAggregationInput | Prisma.EventoSessaoOrderByWithAggregationInput[];
    by: Prisma.EventoSessaoScalarFieldEnum[] | Prisma.EventoSessaoScalarFieldEnum;
    having?: Prisma.EventoSessaoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EventoSessaoCountAggregateInputType | true;
    _avg?: EventoSessaoAvgAggregateInputType;
    _sum?: EventoSessaoSumAggregateInputType;
    _min?: EventoSessaoMinAggregateInputType;
    _max?: EventoSessaoMaxAggregateInputType;
};
export type EventoSessaoGroupByOutputType = {
    id: number;
    sessaoId: number;
    cenaId: number | null;
    criadoEm: Date;
    tipoEvento: string;
    personagemAtorId: number | null;
    personagemAlvoId: number | null;
    dados: runtime.JsonValue | null;
    _count: EventoSessaoCountAggregateOutputType | null;
    _avg: EventoSessaoAvgAggregateOutputType | null;
    _sum: EventoSessaoSumAggregateOutputType | null;
    _min: EventoSessaoMinAggregateOutputType | null;
    _max: EventoSessaoMaxAggregateOutputType | null;
};
type GetEventoSessaoGroupByPayload<T extends EventoSessaoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EventoSessaoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EventoSessaoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EventoSessaoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EventoSessaoGroupByOutputType[P]>;
}>>;
export type EventoSessaoWhereInput = {
    AND?: Prisma.EventoSessaoWhereInput | Prisma.EventoSessaoWhereInput[];
    OR?: Prisma.EventoSessaoWhereInput[];
    NOT?: Prisma.EventoSessaoWhereInput | Prisma.EventoSessaoWhereInput[];
    id?: Prisma.IntFilter<"EventoSessao"> | number;
    sessaoId?: Prisma.IntFilter<"EventoSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    criadoEm?: Prisma.DateTimeFilter<"EventoSessao"> | Date | string;
    tipoEvento?: Prisma.StringFilter<"EventoSessao"> | string;
    personagemAtorId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    personagemAlvoId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    dados?: Prisma.JsonNullableFilter<"EventoSessao">;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaNullableScalarRelationFilter, Prisma.CenaWhereInput> | null;
    personagemAtor?: Prisma.XOR<Prisma.PersonagemSessaoNullableScalarRelationFilter, Prisma.PersonagemSessaoWhereInput> | null;
    personagemAlvo?: Prisma.XOR<Prisma.PersonagemSessaoNullableScalarRelationFilter, Prisma.PersonagemSessaoWhereInput> | null;
};
export type EventoSessaoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    tipoEvento?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    dados?: Prisma.SortOrderInput | Prisma.SortOrder;
    sessao?: Prisma.SessaoOrderByWithRelationInput;
    cena?: Prisma.CenaOrderByWithRelationInput;
    personagemAtor?: Prisma.PersonagemSessaoOrderByWithRelationInput;
    personagemAlvo?: Prisma.PersonagemSessaoOrderByWithRelationInput;
    _relevance?: Prisma.EventoSessaoOrderByRelevanceInput;
};
export type EventoSessaoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.EventoSessaoWhereInput | Prisma.EventoSessaoWhereInput[];
    OR?: Prisma.EventoSessaoWhereInput[];
    NOT?: Prisma.EventoSessaoWhereInput | Prisma.EventoSessaoWhereInput[];
    sessaoId?: Prisma.IntFilter<"EventoSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    criadoEm?: Prisma.DateTimeFilter<"EventoSessao"> | Date | string;
    tipoEvento?: Prisma.StringFilter<"EventoSessao"> | string;
    personagemAtorId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    personagemAlvoId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    dados?: Prisma.JsonNullableFilter<"EventoSessao">;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    cena?: Prisma.XOR<Prisma.CenaNullableScalarRelationFilter, Prisma.CenaWhereInput> | null;
    personagemAtor?: Prisma.XOR<Prisma.PersonagemSessaoNullableScalarRelationFilter, Prisma.PersonagemSessaoWhereInput> | null;
    personagemAlvo?: Prisma.XOR<Prisma.PersonagemSessaoNullableScalarRelationFilter, Prisma.PersonagemSessaoWhereInput> | null;
}, "id">;
export type EventoSessaoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    tipoEvento?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    dados?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.EventoSessaoCountOrderByAggregateInput;
    _avg?: Prisma.EventoSessaoAvgOrderByAggregateInput;
    _max?: Prisma.EventoSessaoMaxOrderByAggregateInput;
    _min?: Prisma.EventoSessaoMinOrderByAggregateInput;
    _sum?: Prisma.EventoSessaoSumOrderByAggregateInput;
};
export type EventoSessaoScalarWhereWithAggregatesInput = {
    AND?: Prisma.EventoSessaoScalarWhereWithAggregatesInput | Prisma.EventoSessaoScalarWhereWithAggregatesInput[];
    OR?: Prisma.EventoSessaoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EventoSessaoScalarWhereWithAggregatesInput | Prisma.EventoSessaoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"EventoSessao"> | number;
    sessaoId?: Prisma.IntWithAggregatesFilter<"EventoSessao"> | number;
    cenaId?: Prisma.IntNullableWithAggregatesFilter<"EventoSessao"> | number | null;
    criadoEm?: Prisma.DateTimeWithAggregatesFilter<"EventoSessao"> | Date | string;
    tipoEvento?: Prisma.StringWithAggregatesFilter<"EventoSessao"> | string;
    personagemAtorId?: Prisma.IntNullableWithAggregatesFilter<"EventoSessao"> | number | null;
    personagemAlvoId?: Prisma.IntNullableWithAggregatesFilter<"EventoSessao"> | number | null;
    dados?: Prisma.JsonNullableWithAggregatesFilter<"EventoSessao">;
};
export type EventoSessaoCreateInput = {
    criadoEm?: Date | string;
    tipoEvento: string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao: Prisma.SessaoCreateNestedOneWithoutEventosInput;
    cena?: Prisma.CenaCreateNestedOneWithoutEventosInput;
    personagemAtor?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAtorInput;
    personagemAlvo?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAlvoInput;
};
export type EventoSessaoUncheckedCreateInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutEventosNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutEventosNestedInput;
    personagemAtor?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAtorNestedInput;
    personagemAlvo?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAlvoNestedInput;
};
export type EventoSessaoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateManyInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateManyMutationInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoListRelationFilter = {
    every?: Prisma.EventoSessaoWhereInput;
    some?: Prisma.EventoSessaoWhereInput;
    none?: Prisma.EventoSessaoWhereInput;
};
export type EventoSessaoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EventoSessaoOrderByRelevanceInput = {
    fields: Prisma.EventoSessaoOrderByRelevanceFieldEnum | Prisma.EventoSessaoOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type EventoSessaoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    tipoEvento?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrder;
    dados?: Prisma.SortOrder;
};
export type EventoSessaoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrder;
};
export type EventoSessaoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    tipoEvento?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrder;
};
export type EventoSessaoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    tipoEvento?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrder;
};
export type EventoSessaoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    cenaId?: Prisma.SortOrder;
    personagemAtorId?: Prisma.SortOrder;
    personagemAlvoId?: Prisma.SortOrder;
};
export type EventoSessaoCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput> | Prisma.EventoSessaoCreateWithoutSessaoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput | Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.EventoSessaoCreateManySessaoInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUncheckedCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput> | Prisma.EventoSessaoCreateWithoutSessaoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput | Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.EventoSessaoCreateManySessaoInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput> | Prisma.EventoSessaoCreateWithoutSessaoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput | Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutSessaoInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.EventoSessaoCreateManySessaoInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutSessaoInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutSessaoInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoUncheckedUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput> | Prisma.EventoSessaoCreateWithoutSessaoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput | Prisma.EventoSessaoCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutSessaoInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.EventoSessaoCreateManySessaoInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutSessaoInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutSessaoInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput> | Prisma.EventoSessaoCreateWithoutCenaInput[] | Prisma.EventoSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutCenaInput | Prisma.EventoSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.EventoSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUncheckedCreateNestedManyWithoutCenaInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput> | Prisma.EventoSessaoCreateWithoutCenaInput[] | Prisma.EventoSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutCenaInput | Prisma.EventoSessaoCreateOrConnectWithoutCenaInput[];
    createMany?: Prisma.EventoSessaoCreateManyCenaInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput> | Prisma.EventoSessaoCreateWithoutCenaInput[] | Prisma.EventoSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutCenaInput | Prisma.EventoSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.EventoSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoUncheckedUpdateManyWithoutCenaNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput> | Prisma.EventoSessaoCreateWithoutCenaInput[] | Prisma.EventoSessaoUncheckedCreateWithoutCenaInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutCenaInput | Prisma.EventoSessaoCreateOrConnectWithoutCenaInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutCenaInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutCenaInput[];
    createMany?: Prisma.EventoSessaoCreateManyCenaInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutCenaInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutCenaInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutCenaInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutCenaInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoCreateNestedManyWithoutPersonagemAtorInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput> | Prisma.EventoSessaoCreateWithoutPersonagemAtorInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAtorInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoCreateNestedManyWithoutPersonagemAlvoInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput> | Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAlvoInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAtorInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput> | Prisma.EventoSessaoCreateWithoutPersonagemAtorInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAtorInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUncheckedCreateNestedManyWithoutPersonagemAlvoInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput> | Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAlvoInputEnvelope;
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
};
export type EventoSessaoUpdateManyWithoutPersonagemAtorNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput> | Prisma.EventoSessaoCreateWithoutPersonagemAtorInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAtorInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAtorInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAtorInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAtorInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAtorInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAtorInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAtorInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoUpdateManyWithoutPersonagemAlvoNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput> | Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAlvoInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAlvoInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAlvoInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAlvoInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput> | Prisma.EventoSessaoCreateWithoutPersonagemAtorInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAtorInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAtorInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAtorInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAtorInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAtorInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAtorInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAtorInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAtorInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoNestedInput = {
    create?: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput> | Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput[] | Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput[];
    connectOrCreate?: Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput | Prisma.EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput[];
    upsert?: Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAlvoInput[];
    createMany?: Prisma.EventoSessaoCreateManyPersonagemAlvoInputEnvelope;
    set?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    disconnect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    delete?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    connect?: Prisma.EventoSessaoWhereUniqueInput | Prisma.EventoSessaoWhereUniqueInput[];
    update?: Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAlvoInput[];
    updateMany?: Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAlvoInput | Prisma.EventoSessaoUpdateManyWithWhereWithoutPersonagemAlvoInput[];
    deleteMany?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
};
export type EventoSessaoCreateWithoutSessaoInput = {
    criadoEm?: Date | string;
    tipoEvento: string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    cena?: Prisma.CenaCreateNestedOneWithoutEventosInput;
    personagemAtor?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAtorInput;
    personagemAlvo?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAlvoInput;
};
export type EventoSessaoUncheckedCreateWithoutSessaoInput = {
    id?: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateOrConnectWithoutSessaoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput>;
};
export type EventoSessaoCreateManySessaoInputEnvelope = {
    data: Prisma.EventoSessaoCreateManySessaoInput | Prisma.EventoSessaoCreateManySessaoInput[];
    skipDuplicates?: boolean;
};
export type EventoSessaoUpsertWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutSessaoInput, Prisma.EventoSessaoUncheckedUpdateWithoutSessaoInput>;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutSessaoInput, Prisma.EventoSessaoUncheckedCreateWithoutSessaoInput>;
};
export type EventoSessaoUpdateWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutSessaoInput, Prisma.EventoSessaoUncheckedUpdateWithoutSessaoInput>;
};
export type EventoSessaoUpdateManyWithWhereWithoutSessaoInput = {
    where: Prisma.EventoSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateManyMutationInput, Prisma.EventoSessaoUncheckedUpdateManyWithoutSessaoInput>;
};
export type EventoSessaoScalarWhereInput = {
    AND?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
    OR?: Prisma.EventoSessaoScalarWhereInput[];
    NOT?: Prisma.EventoSessaoScalarWhereInput | Prisma.EventoSessaoScalarWhereInput[];
    id?: Prisma.IntFilter<"EventoSessao"> | number;
    sessaoId?: Prisma.IntFilter<"EventoSessao"> | number;
    cenaId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    criadoEm?: Prisma.DateTimeFilter<"EventoSessao"> | Date | string;
    tipoEvento?: Prisma.StringFilter<"EventoSessao"> | string;
    personagemAtorId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    personagemAlvoId?: Prisma.IntNullableFilter<"EventoSessao"> | number | null;
    dados?: Prisma.JsonNullableFilter<"EventoSessao">;
};
export type EventoSessaoCreateWithoutCenaInput = {
    criadoEm?: Date | string;
    tipoEvento: string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao: Prisma.SessaoCreateNestedOneWithoutEventosInput;
    personagemAtor?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAtorInput;
    personagemAlvo?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAlvoInput;
};
export type EventoSessaoUncheckedCreateWithoutCenaInput = {
    id?: number;
    sessaoId: number;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateOrConnectWithoutCenaInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput>;
};
export type EventoSessaoCreateManyCenaInputEnvelope = {
    data: Prisma.EventoSessaoCreateManyCenaInput | Prisma.EventoSessaoCreateManyCenaInput[];
    skipDuplicates?: boolean;
};
export type EventoSessaoUpsertWithWhereUniqueWithoutCenaInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutCenaInput, Prisma.EventoSessaoUncheckedUpdateWithoutCenaInput>;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutCenaInput, Prisma.EventoSessaoUncheckedCreateWithoutCenaInput>;
};
export type EventoSessaoUpdateWithWhereUniqueWithoutCenaInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutCenaInput, Prisma.EventoSessaoUncheckedUpdateWithoutCenaInput>;
};
export type EventoSessaoUpdateManyWithWhereWithoutCenaInput = {
    where: Prisma.EventoSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateManyMutationInput, Prisma.EventoSessaoUncheckedUpdateManyWithoutCenaInput>;
};
export type EventoSessaoCreateWithoutPersonagemAtorInput = {
    criadoEm?: Date | string;
    tipoEvento: string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao: Prisma.SessaoCreateNestedOneWithoutEventosInput;
    cena?: Prisma.CenaCreateNestedOneWithoutEventosInput;
    personagemAlvo?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAlvoInput;
};
export type EventoSessaoUncheckedCreateWithoutPersonagemAtorInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateOrConnectWithoutPersonagemAtorInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput>;
};
export type EventoSessaoCreateManyPersonagemAtorInputEnvelope = {
    data: Prisma.EventoSessaoCreateManyPersonagemAtorInput | Prisma.EventoSessaoCreateManyPersonagemAtorInput[];
    skipDuplicates?: boolean;
};
export type EventoSessaoCreateWithoutPersonagemAlvoInput = {
    criadoEm?: Date | string;
    tipoEvento: string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao: Prisma.SessaoCreateNestedOneWithoutEventosInput;
    cena?: Prisma.CenaCreateNestedOneWithoutEventosInput;
    personagemAtor?: Prisma.PersonagemSessaoCreateNestedOneWithoutEventosComoAtorInput;
};
export type EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateOrConnectWithoutPersonagemAlvoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput>;
};
export type EventoSessaoCreateManyPersonagemAlvoInputEnvelope = {
    data: Prisma.EventoSessaoCreateManyPersonagemAlvoInput | Prisma.EventoSessaoCreateManyPersonagemAlvoInput[];
    skipDuplicates?: boolean;
};
export type EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAtorInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedUpdateWithoutPersonagemAtorInput>;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAtorInput>;
};
export type EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAtorInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutPersonagemAtorInput, Prisma.EventoSessaoUncheckedUpdateWithoutPersonagemAtorInput>;
};
export type EventoSessaoUpdateManyWithWhereWithoutPersonagemAtorInput = {
    where: Prisma.EventoSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateManyMutationInput, Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorInput>;
};
export type EventoSessaoUpsertWithWhereUniqueWithoutPersonagemAlvoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedUpdateWithoutPersonagemAlvoInput>;
    create: Prisma.XOR<Prisma.EventoSessaoCreateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedCreateWithoutPersonagemAlvoInput>;
};
export type EventoSessaoUpdateWithWhereUniqueWithoutPersonagemAlvoInput = {
    where: Prisma.EventoSessaoWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateWithoutPersonagemAlvoInput, Prisma.EventoSessaoUncheckedUpdateWithoutPersonagemAlvoInput>;
};
export type EventoSessaoUpdateManyWithWhereWithoutPersonagemAlvoInput = {
    where: Prisma.EventoSessaoScalarWhereInput;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateManyMutationInput, Prisma.EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoInput>;
};
export type EventoSessaoCreateManySessaoInput = {
    id?: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateWithoutSessaoInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    cena?: Prisma.CenaUpdateOneWithoutEventosNestedInput;
    personagemAtor?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAtorNestedInput;
    personagemAlvo?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAlvoNestedInput;
};
export type EventoSessaoUncheckedUpdateWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUncheckedUpdateManyWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateManyCenaInput = {
    id?: number;
    sessaoId: number;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateWithoutCenaInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutEventosNestedInput;
    personagemAtor?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAtorNestedInput;
    personagemAlvo?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAlvoNestedInput;
};
export type EventoSessaoUncheckedUpdateWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUncheckedUpdateManyWithoutCenaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateManyPersonagemAtorInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAlvoId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoCreateManyPersonagemAlvoInput = {
    id?: number;
    sessaoId: number;
    cenaId?: number | null;
    criadoEm?: Date | string;
    tipoEvento: string;
    personagemAtorId?: number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateWithoutPersonagemAtorInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutEventosNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutEventosNestedInput;
    personagemAlvo?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAlvoNestedInput;
};
export type EventoSessaoUncheckedUpdateWithoutPersonagemAtorInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUncheckedUpdateManyWithoutPersonagemAtorInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAlvoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUpdateWithoutPersonagemAlvoInput = {
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutEventosNestedInput;
    cena?: Prisma.CenaUpdateOneWithoutEventosNestedInput;
    personagemAtor?: Prisma.PersonagemSessaoUpdateOneWithoutEventosComoAtorNestedInput;
};
export type EventoSessaoUncheckedUpdateWithoutPersonagemAlvoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoUncheckedUpdateManyWithoutPersonagemAlvoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    cenaId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoEvento?: Prisma.StringFieldUpdateOperationsInput | string;
    personagemAtorId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    dados?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
};
export type EventoSessaoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessaoId?: boolean;
    cenaId?: boolean;
    criadoEm?: boolean;
    tipoEvento?: boolean;
    personagemAtorId?: boolean;
    personagemAlvoId?: boolean;
    dados?: boolean;
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.EventoSessao$cenaArgs<ExtArgs>;
    personagemAtor?: boolean | Prisma.EventoSessao$personagemAtorArgs<ExtArgs>;
    personagemAlvo?: boolean | Prisma.EventoSessao$personagemAlvoArgs<ExtArgs>;
}, ExtArgs["result"]["eventoSessao"]>;
export type EventoSessaoSelectScalar = {
    id?: boolean;
    sessaoId?: boolean;
    cenaId?: boolean;
    criadoEm?: boolean;
    tipoEvento?: boolean;
    personagemAtorId?: boolean;
    personagemAlvoId?: boolean;
    dados?: boolean;
};
export type EventoSessaoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessaoId" | "cenaId" | "criadoEm" | "tipoEvento" | "personagemAtorId" | "personagemAlvoId" | "dados", ExtArgs["result"]["eventoSessao"]>;
export type EventoSessaoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    cena?: boolean | Prisma.EventoSessao$cenaArgs<ExtArgs>;
    personagemAtor?: boolean | Prisma.EventoSessao$personagemAtorArgs<ExtArgs>;
    personagemAlvo?: boolean | Prisma.EventoSessao$personagemAlvoArgs<ExtArgs>;
};
export type $EventoSessaoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EventoSessao";
    objects: {
        sessao: Prisma.$SessaoPayload<ExtArgs>;
        cena: Prisma.$CenaPayload<ExtArgs> | null;
        personagemAtor: Prisma.$PersonagemSessaoPayload<ExtArgs> | null;
        personagemAlvo: Prisma.$PersonagemSessaoPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        sessaoId: number;
        cenaId: number | null;
        criadoEm: Date;
        tipoEvento: string;
        personagemAtorId: number | null;
        personagemAlvoId: number | null;
        dados: runtime.JsonValue | null;
    }, ExtArgs["result"]["eventoSessao"]>;
    composites: {};
};
export type EventoSessaoGetPayload<S extends boolean | null | undefined | EventoSessaoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload, S>;
export type EventoSessaoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EventoSessaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EventoSessaoCountAggregateInputType | true;
};
export interface EventoSessaoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EventoSessao'];
        meta: {
            name: 'EventoSessao';
        };
    };
    findUnique<T extends EventoSessaoFindUniqueArgs>(args: Prisma.SelectSubset<T, EventoSessaoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EventoSessaoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EventoSessaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EventoSessaoFindFirstArgs>(args?: Prisma.SelectSubset<T, EventoSessaoFindFirstArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EventoSessaoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EventoSessaoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EventoSessaoFindManyArgs>(args?: Prisma.SelectSubset<T, EventoSessaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EventoSessaoCreateArgs>(args: Prisma.SelectSubset<T, EventoSessaoCreateArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EventoSessaoCreateManyArgs>(args?: Prisma.SelectSubset<T, EventoSessaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends EventoSessaoDeleteArgs>(args: Prisma.SelectSubset<T, EventoSessaoDeleteArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EventoSessaoUpdateArgs>(args: Prisma.SelectSubset<T, EventoSessaoUpdateArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EventoSessaoDeleteManyArgs>(args?: Prisma.SelectSubset<T, EventoSessaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EventoSessaoUpdateManyArgs>(args: Prisma.SelectSubset<T, EventoSessaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends EventoSessaoUpsertArgs>(args: Prisma.SelectSubset<T, EventoSessaoUpsertArgs<ExtArgs>>): Prisma.Prisma__EventoSessaoClient<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EventoSessaoCountArgs>(args?: Prisma.Subset<T, EventoSessaoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EventoSessaoCountAggregateOutputType> : number>;
    aggregate<T extends EventoSessaoAggregateArgs>(args: Prisma.Subset<T, EventoSessaoAggregateArgs>): Prisma.PrismaPromise<GetEventoSessaoAggregateType<T>>;
    groupBy<T extends EventoSessaoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EventoSessaoGroupByArgs['orderBy'];
    } : {
        orderBy?: EventoSessaoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EventoSessaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventoSessaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EventoSessaoFieldRefs;
}
export interface Prisma__EventoSessaoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sessao<T extends Prisma.SessaoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SessaoDefaultArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cena<T extends Prisma.EventoSessao$cenaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EventoSessao$cenaArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    personagemAtor<T extends Prisma.EventoSessao$personagemAtorArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EventoSessao$personagemAtorArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    personagemAlvo<T extends Prisma.EventoSessao$personagemAlvoArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EventoSessao$personagemAlvoArgs<ExtArgs>>): Prisma.Prisma__PersonagemSessaoClient<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EventoSessaoFieldRefs {
    readonly id: Prisma.FieldRef<"EventoSessao", 'Int'>;
    readonly sessaoId: Prisma.FieldRef<"EventoSessao", 'Int'>;
    readonly cenaId: Prisma.FieldRef<"EventoSessao", 'Int'>;
    readonly criadoEm: Prisma.FieldRef<"EventoSessao", 'DateTime'>;
    readonly tipoEvento: Prisma.FieldRef<"EventoSessao", 'String'>;
    readonly personagemAtorId: Prisma.FieldRef<"EventoSessao", 'Int'>;
    readonly personagemAlvoId: Prisma.FieldRef<"EventoSessao", 'Int'>;
    readonly dados: Prisma.FieldRef<"EventoSessao", 'Json'>;
}
export type EventoSessaoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    where: Prisma.EventoSessaoWhereUniqueInput;
};
export type EventoSessaoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    where: Prisma.EventoSessaoWhereUniqueInput;
};
export type EventoSessaoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventoSessaoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventoSessaoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventoSessaoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventoSessaoCreateInput, Prisma.EventoSessaoUncheckedCreateInput>;
};
export type EventoSessaoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EventoSessaoCreateManyInput | Prisma.EventoSessaoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EventoSessaoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventoSessaoUpdateInput, Prisma.EventoSessaoUncheckedUpdateInput>;
    where: Prisma.EventoSessaoWhereUniqueInput;
};
export type EventoSessaoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EventoSessaoUpdateManyMutationInput, Prisma.EventoSessaoUncheckedUpdateManyInput>;
    where?: Prisma.EventoSessaoWhereInput;
    limit?: number;
};
export type EventoSessaoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    where: Prisma.EventoSessaoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoSessaoCreateInput, Prisma.EventoSessaoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EventoSessaoUpdateInput, Prisma.EventoSessaoUncheckedUpdateInput>;
};
export type EventoSessaoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
    where: Prisma.EventoSessaoWhereUniqueInput;
};
export type EventoSessaoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
    limit?: number;
};
export type EventoSessao$cenaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where?: Prisma.CenaWhereInput;
};
export type EventoSessao$personagemAtorArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type EventoSessao$personagemAlvoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemSessaoSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemSessaoOmit<ExtArgs> | null;
    include?: Prisma.PersonagemSessaoInclude<ExtArgs> | null;
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type EventoSessaoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoSessaoSelect<ExtArgs> | null;
    omit?: Prisma.EventoSessaoOmit<ExtArgs> | null;
    include?: Prisma.EventoSessaoInclude<ExtArgs> | null;
};
export {};
