import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CenaModel = runtime.Types.Result.DefaultSelection<Prisma.$CenaPayload>;
export type AggregateCena = {
    _count: CenaCountAggregateOutputType | null;
    _avg: CenaAvgAggregateOutputType | null;
    _sum: CenaSumAggregateOutputType | null;
    _min: CenaMinAggregateOutputType | null;
    _max: CenaMaxAggregateOutputType | null;
};
export type CenaAvgAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
};
export type CenaSumAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
};
export type CenaMinAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
};
export type CenaMaxAggregateOutputType = {
    id: number | null;
    sessaoId: number | null;
};
export type CenaCountAggregateOutputType = {
    id: number;
    sessaoId: number;
    _all: number;
};
export type CenaAvgAggregateInputType = {
    id?: true;
    sessaoId?: true;
};
export type CenaSumAggregateInputType = {
    id?: true;
    sessaoId?: true;
};
export type CenaMinAggregateInputType = {
    id?: true;
    sessaoId?: true;
};
export type CenaMaxAggregateInputType = {
    id?: true;
    sessaoId?: true;
};
export type CenaCountAggregateInputType = {
    id?: true;
    sessaoId?: true;
    _all?: true;
};
export type CenaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CenaWhereInput;
    orderBy?: Prisma.CenaOrderByWithRelationInput | Prisma.CenaOrderByWithRelationInput[];
    cursor?: Prisma.CenaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CenaCountAggregateInputType;
    _avg?: CenaAvgAggregateInputType;
    _sum?: CenaSumAggregateInputType;
    _min?: CenaMinAggregateInputType;
    _max?: CenaMaxAggregateInputType;
};
export type GetCenaAggregateType<T extends CenaAggregateArgs> = {
    [P in keyof T & keyof AggregateCena]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCena[P]> : Prisma.GetScalarType<T[P], AggregateCena[P]>;
};
export type CenaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CenaWhereInput;
    orderBy?: Prisma.CenaOrderByWithAggregationInput | Prisma.CenaOrderByWithAggregationInput[];
    by: Prisma.CenaScalarFieldEnum[] | Prisma.CenaScalarFieldEnum;
    having?: Prisma.CenaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CenaCountAggregateInputType | true;
    _avg?: CenaAvgAggregateInputType;
    _sum?: CenaSumAggregateInputType;
    _min?: CenaMinAggregateInputType;
    _max?: CenaMaxAggregateInputType;
};
export type CenaGroupByOutputType = {
    id: number;
    sessaoId: number;
    _count: CenaCountAggregateOutputType | null;
    _avg: CenaAvgAggregateOutputType | null;
    _sum: CenaSumAggregateOutputType | null;
    _min: CenaMinAggregateOutputType | null;
    _max: CenaMaxAggregateOutputType | null;
};
type GetCenaGroupByPayload<T extends CenaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CenaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CenaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CenaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CenaGroupByOutputType[P]>;
}>>;
export type CenaWhereInput = {
    AND?: Prisma.CenaWhereInput | Prisma.CenaWhereInput[];
    OR?: Prisma.CenaWhereInput[];
    NOT?: Prisma.CenaWhereInput | Prisma.CenaWhereInput[];
    id?: Prisma.IntFilter<"Cena"> | number;
    sessaoId?: Prisma.IntFilter<"Cena"> | number;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    personagens?: Prisma.PersonagemSessaoListRelationFilter;
    condicoes?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
    eventos?: Prisma.EventoSessaoListRelationFilter;
};
export type CenaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    sessao?: Prisma.SessaoOrderByWithRelationInput;
    personagens?: Prisma.PersonagemSessaoOrderByRelationAggregateInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoOrderByRelationAggregateInput;
    eventos?: Prisma.EventoSessaoOrderByRelationAggregateInput;
};
export type CenaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.CenaWhereInput | Prisma.CenaWhereInput[];
    OR?: Prisma.CenaWhereInput[];
    NOT?: Prisma.CenaWhereInput | Prisma.CenaWhereInput[];
    sessaoId?: Prisma.IntFilter<"Cena"> | number;
    sessao?: Prisma.XOR<Prisma.SessaoScalarRelationFilter, Prisma.SessaoWhereInput>;
    personagens?: Prisma.PersonagemSessaoListRelationFilter;
    condicoes?: Prisma.CondicaoPersonagemSessaoListRelationFilter;
    eventos?: Prisma.EventoSessaoListRelationFilter;
}, "id">;
export type CenaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
    _count?: Prisma.CenaCountOrderByAggregateInput;
    _avg?: Prisma.CenaAvgOrderByAggregateInput;
    _max?: Prisma.CenaMaxOrderByAggregateInput;
    _min?: Prisma.CenaMinOrderByAggregateInput;
    _sum?: Prisma.CenaSumOrderByAggregateInput;
};
export type CenaScalarWhereWithAggregatesInput = {
    AND?: Prisma.CenaScalarWhereWithAggregatesInput | Prisma.CenaScalarWhereWithAggregatesInput[];
    OR?: Prisma.CenaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CenaScalarWhereWithAggregatesInput | Prisma.CenaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Cena"> | number;
    sessaoId?: Prisma.IntWithAggregatesFilter<"Cena"> | number;
};
export type CenaCreateInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutCenasInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutCenaInput;
};
export type CenaUncheckedCreateInput = {
    id?: number;
    sessaoId: number;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutCenaInput;
};
export type CenaUpdateInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutCenasNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutCenaNestedInput;
};
export type CenaCreateManyInput = {
    id?: number;
    sessaoId: number;
};
export type CenaUpdateManyMutationInput = {};
export type CenaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type CenaListRelationFilter = {
    every?: Prisma.CenaWhereInput;
    some?: Prisma.CenaWhereInput;
    none?: Prisma.CenaWhereInput;
};
export type CenaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CenaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
};
export type CenaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
};
export type CenaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
};
export type CenaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
};
export type CenaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessaoId?: Prisma.SortOrder;
};
export type CenaNullableScalarRelationFilter = {
    is?: Prisma.CenaWhereInput | null;
    isNot?: Prisma.CenaWhereInput | null;
};
export type CenaScalarRelationFilter = {
    is?: Prisma.CenaWhereInput;
    isNot?: Prisma.CenaWhereInput;
};
export type CenaCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput> | Prisma.CenaCreateWithoutSessaoInput[] | Prisma.CenaUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutSessaoInput | Prisma.CenaCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.CenaCreateManySessaoInputEnvelope;
    connect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
};
export type CenaUncheckedCreateNestedManyWithoutSessaoInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput> | Prisma.CenaCreateWithoutSessaoInput[] | Prisma.CenaUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutSessaoInput | Prisma.CenaCreateOrConnectWithoutSessaoInput[];
    createMany?: Prisma.CenaCreateManySessaoInputEnvelope;
    connect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
};
export type CenaUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput> | Prisma.CenaCreateWithoutSessaoInput[] | Prisma.CenaUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutSessaoInput | Prisma.CenaCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.CenaUpsertWithWhereUniqueWithoutSessaoInput | Prisma.CenaUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.CenaCreateManySessaoInputEnvelope;
    set?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    disconnect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    delete?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    connect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    update?: Prisma.CenaUpdateWithWhereUniqueWithoutSessaoInput | Prisma.CenaUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.CenaUpdateManyWithWhereWithoutSessaoInput | Prisma.CenaUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.CenaScalarWhereInput | Prisma.CenaScalarWhereInput[];
};
export type CenaUncheckedUpdateManyWithoutSessaoNestedInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput> | Prisma.CenaCreateWithoutSessaoInput[] | Prisma.CenaUncheckedCreateWithoutSessaoInput[];
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutSessaoInput | Prisma.CenaCreateOrConnectWithoutSessaoInput[];
    upsert?: Prisma.CenaUpsertWithWhereUniqueWithoutSessaoInput | Prisma.CenaUpsertWithWhereUniqueWithoutSessaoInput[];
    createMany?: Prisma.CenaCreateManySessaoInputEnvelope;
    set?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    disconnect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    delete?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    connect?: Prisma.CenaWhereUniqueInput | Prisma.CenaWhereUniqueInput[];
    update?: Prisma.CenaUpdateWithWhereUniqueWithoutSessaoInput | Prisma.CenaUpdateWithWhereUniqueWithoutSessaoInput[];
    updateMany?: Prisma.CenaUpdateManyWithWhereWithoutSessaoInput | Prisma.CenaUpdateManyWithWhereWithoutSessaoInput[];
    deleteMany?: Prisma.CenaScalarWhereInput | Prisma.CenaScalarWhereInput[];
};
export type CenaCreateNestedOneWithoutPersonagensInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutPersonagensInput, Prisma.CenaUncheckedCreateWithoutPersonagensInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutPersonagensInput;
    connect?: Prisma.CenaWhereUniqueInput;
};
export type CenaUpdateOneWithoutPersonagensNestedInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutPersonagensInput, Prisma.CenaUncheckedCreateWithoutPersonagensInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutPersonagensInput;
    upsert?: Prisma.CenaUpsertWithoutPersonagensInput;
    disconnect?: Prisma.CenaWhereInput | boolean;
    delete?: Prisma.CenaWhereInput | boolean;
    connect?: Prisma.CenaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CenaUpdateToOneWithWhereWithoutPersonagensInput, Prisma.CenaUpdateWithoutPersonagensInput>, Prisma.CenaUncheckedUpdateWithoutPersonagensInput>;
};
export type CenaCreateNestedOneWithoutCondicoesInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutCondicoesInput, Prisma.CenaUncheckedCreateWithoutCondicoesInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutCondicoesInput;
    connect?: Prisma.CenaWhereUniqueInput;
};
export type CenaUpdateOneRequiredWithoutCondicoesNestedInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutCondicoesInput, Prisma.CenaUncheckedCreateWithoutCondicoesInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutCondicoesInput;
    upsert?: Prisma.CenaUpsertWithoutCondicoesInput;
    connect?: Prisma.CenaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CenaUpdateToOneWithWhereWithoutCondicoesInput, Prisma.CenaUpdateWithoutCondicoesInput>, Prisma.CenaUncheckedUpdateWithoutCondicoesInput>;
};
export type CenaCreateNestedOneWithoutEventosInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutEventosInput, Prisma.CenaUncheckedCreateWithoutEventosInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutEventosInput;
    connect?: Prisma.CenaWhereUniqueInput;
};
export type CenaUpdateOneWithoutEventosNestedInput = {
    create?: Prisma.XOR<Prisma.CenaCreateWithoutEventosInput, Prisma.CenaUncheckedCreateWithoutEventosInput>;
    connectOrCreate?: Prisma.CenaCreateOrConnectWithoutEventosInput;
    upsert?: Prisma.CenaUpsertWithoutEventosInput;
    disconnect?: Prisma.CenaWhereInput | boolean;
    delete?: Prisma.CenaWhereInput | boolean;
    connect?: Prisma.CenaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CenaUpdateToOneWithWhereWithoutEventosInput, Prisma.CenaUpdateWithoutEventosInput>, Prisma.CenaUncheckedUpdateWithoutEventosInput>;
};
export type CenaCreateWithoutSessaoInput = {
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutCenaInput;
};
export type CenaUncheckedCreateWithoutSessaoInput = {
    id?: number;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutCenaInput;
};
export type CenaCreateOrConnectWithoutSessaoInput = {
    where: Prisma.CenaWhereUniqueInput;
    create: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput>;
};
export type CenaCreateManySessaoInputEnvelope = {
    data: Prisma.CenaCreateManySessaoInput | Prisma.CenaCreateManySessaoInput[];
    skipDuplicates?: boolean;
};
export type CenaUpsertWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.CenaWhereUniqueInput;
    update: Prisma.XOR<Prisma.CenaUpdateWithoutSessaoInput, Prisma.CenaUncheckedUpdateWithoutSessaoInput>;
    create: Prisma.XOR<Prisma.CenaCreateWithoutSessaoInput, Prisma.CenaUncheckedCreateWithoutSessaoInput>;
};
export type CenaUpdateWithWhereUniqueWithoutSessaoInput = {
    where: Prisma.CenaWhereUniqueInput;
    data: Prisma.XOR<Prisma.CenaUpdateWithoutSessaoInput, Prisma.CenaUncheckedUpdateWithoutSessaoInput>;
};
export type CenaUpdateManyWithWhereWithoutSessaoInput = {
    where: Prisma.CenaScalarWhereInput;
    data: Prisma.XOR<Prisma.CenaUpdateManyMutationInput, Prisma.CenaUncheckedUpdateManyWithoutSessaoInput>;
};
export type CenaScalarWhereInput = {
    AND?: Prisma.CenaScalarWhereInput | Prisma.CenaScalarWhereInput[];
    OR?: Prisma.CenaScalarWhereInput[];
    NOT?: Prisma.CenaScalarWhereInput | Prisma.CenaScalarWhereInput[];
    id?: Prisma.IntFilter<"Cena"> | number;
    sessaoId?: Prisma.IntFilter<"Cena"> | number;
};
export type CenaCreateWithoutPersonagensInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutCenasInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutCenaInput;
};
export type CenaUncheckedCreateWithoutPersonagensInput = {
    id?: number;
    sessaoId: number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutCenaInput;
};
export type CenaCreateOrConnectWithoutPersonagensInput = {
    where: Prisma.CenaWhereUniqueInput;
    create: Prisma.XOR<Prisma.CenaCreateWithoutPersonagensInput, Prisma.CenaUncheckedCreateWithoutPersonagensInput>;
};
export type CenaUpsertWithoutPersonagensInput = {
    update: Prisma.XOR<Prisma.CenaUpdateWithoutPersonagensInput, Prisma.CenaUncheckedUpdateWithoutPersonagensInput>;
    create: Prisma.XOR<Prisma.CenaCreateWithoutPersonagensInput, Prisma.CenaUncheckedCreateWithoutPersonagensInput>;
    where?: Prisma.CenaWhereInput;
};
export type CenaUpdateToOneWithWhereWithoutPersonagensInput = {
    where?: Prisma.CenaWhereInput;
    data: Prisma.XOR<Prisma.CenaUpdateWithoutPersonagensInput, Prisma.CenaUncheckedUpdateWithoutPersonagensInput>;
};
export type CenaUpdateWithoutPersonagensInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutCenasNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateWithoutPersonagensInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutCenaNestedInput;
};
export type CenaCreateWithoutCondicoesInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutCenasInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoCreateNestedManyWithoutCenaInput;
};
export type CenaUncheckedCreateWithoutCondicoesInput = {
    id?: number;
    sessaoId: number;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    eventos?: Prisma.EventoSessaoUncheckedCreateNestedManyWithoutCenaInput;
};
export type CenaCreateOrConnectWithoutCondicoesInput = {
    where: Prisma.CenaWhereUniqueInput;
    create: Prisma.XOR<Prisma.CenaCreateWithoutCondicoesInput, Prisma.CenaUncheckedCreateWithoutCondicoesInput>;
};
export type CenaUpsertWithoutCondicoesInput = {
    update: Prisma.XOR<Prisma.CenaUpdateWithoutCondicoesInput, Prisma.CenaUncheckedUpdateWithoutCondicoesInput>;
    create: Prisma.XOR<Prisma.CenaCreateWithoutCondicoesInput, Prisma.CenaUncheckedCreateWithoutCondicoesInput>;
    where?: Prisma.CenaWhereInput;
};
export type CenaUpdateToOneWithWhereWithoutCondicoesInput = {
    where?: Prisma.CenaWhereInput;
    data: Prisma.XOR<Prisma.CenaUpdateWithoutCondicoesInput, Prisma.CenaUncheckedUpdateWithoutCondicoesInput>;
};
export type CenaUpdateWithoutCondicoesInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutCenasNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateWithoutCondicoesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutCenaNestedInput;
};
export type CenaCreateWithoutEventosInput = {
    sessao: Prisma.SessaoCreateNestedOneWithoutCenasInput;
    personagens?: Prisma.PersonagemSessaoCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoCreateNestedManyWithoutCenaInput;
};
export type CenaUncheckedCreateWithoutEventosInput = {
    id?: number;
    sessaoId: number;
    personagens?: Prisma.PersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedCreateNestedManyWithoutCenaInput;
};
export type CenaCreateOrConnectWithoutEventosInput = {
    where: Prisma.CenaWhereUniqueInput;
    create: Prisma.XOR<Prisma.CenaCreateWithoutEventosInput, Prisma.CenaUncheckedCreateWithoutEventosInput>;
};
export type CenaUpsertWithoutEventosInput = {
    update: Prisma.XOR<Prisma.CenaUpdateWithoutEventosInput, Prisma.CenaUncheckedUpdateWithoutEventosInput>;
    create: Prisma.XOR<Prisma.CenaCreateWithoutEventosInput, Prisma.CenaUncheckedCreateWithoutEventosInput>;
    where?: Prisma.CenaWhereInput;
};
export type CenaUpdateToOneWithWhereWithoutEventosInput = {
    where?: Prisma.CenaWhereInput;
    data: Prisma.XOR<Prisma.CenaUpdateWithoutEventosInput, Prisma.CenaUncheckedUpdateWithoutEventosInput>;
};
export type CenaUpdateWithoutEventosInput = {
    sessao?: Prisma.SessaoUpdateOneRequiredWithoutCenasNestedInput;
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateWithoutEventosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    sessaoId?: Prisma.IntFieldUpdateOperationsInput | number;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
};
export type CenaCreateManySessaoInput = {
    id?: number;
};
export type CenaUpdateWithoutSessaoInput = {
    personagens?: Prisma.PersonagemSessaoUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personagens?: Prisma.PersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    condicoes?: Prisma.CondicaoPersonagemSessaoUncheckedUpdateManyWithoutCenaNestedInput;
    eventos?: Prisma.EventoSessaoUncheckedUpdateManyWithoutCenaNestedInput;
};
export type CenaUncheckedUpdateManyWithoutSessaoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type CenaCountOutputType = {
    personagens: number;
    condicoes: number;
    eventos: number;
};
export type CenaCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagens?: boolean | CenaCountOutputTypeCountPersonagensArgs;
    condicoes?: boolean | CenaCountOutputTypeCountCondicoesArgs;
    eventos?: boolean | CenaCountOutputTypeCountEventosArgs;
};
export type CenaCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaCountOutputTypeSelect<ExtArgs> | null;
};
export type CenaCountOutputTypeCountPersonagensArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemSessaoWhereInput;
};
export type CenaCountOutputTypeCountCondicoesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CondicaoPersonagemSessaoWhereInput;
};
export type CenaCountOutputTypeCountEventosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoSessaoWhereInput;
};
export type CenaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessaoId?: boolean;
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    personagens?: boolean | Prisma.Cena$personagensArgs<ExtArgs>;
    condicoes?: boolean | Prisma.Cena$condicoesArgs<ExtArgs>;
    eventos?: boolean | Prisma.Cena$eventosArgs<ExtArgs>;
    _count?: boolean | Prisma.CenaCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cena"]>;
export type CenaSelectScalar = {
    id?: boolean;
    sessaoId?: boolean;
};
export type CenaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessaoId", ExtArgs["result"]["cena"]>;
export type CenaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessao?: boolean | Prisma.SessaoDefaultArgs<ExtArgs>;
    personagens?: boolean | Prisma.Cena$personagensArgs<ExtArgs>;
    condicoes?: boolean | Prisma.Cena$condicoesArgs<ExtArgs>;
    eventos?: boolean | Prisma.Cena$eventosArgs<ExtArgs>;
    _count?: boolean | Prisma.CenaCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $CenaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Cena";
    objects: {
        sessao: Prisma.$SessaoPayload<ExtArgs>;
        personagens: Prisma.$PersonagemSessaoPayload<ExtArgs>[];
        condicoes: Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>[];
        eventos: Prisma.$EventoSessaoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        sessaoId: number;
    }, ExtArgs["result"]["cena"]>;
    composites: {};
};
export type CenaGetPayload<S extends boolean | null | undefined | CenaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CenaPayload, S>;
export type CenaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CenaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CenaCountAggregateInputType | true;
};
export interface CenaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Cena'];
        meta: {
            name: 'Cena';
        };
    };
    findUnique<T extends CenaFindUniqueArgs>(args: Prisma.SelectSubset<T, CenaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CenaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CenaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CenaFindFirstArgs>(args?: Prisma.SelectSubset<T, CenaFindFirstArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CenaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CenaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CenaFindManyArgs>(args?: Prisma.SelectSubset<T, CenaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CenaCreateArgs>(args: Prisma.SelectSubset<T, CenaCreateArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CenaCreateManyArgs>(args?: Prisma.SelectSubset<T, CenaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends CenaDeleteArgs>(args: Prisma.SelectSubset<T, CenaDeleteArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CenaUpdateArgs>(args: Prisma.SelectSubset<T, CenaUpdateArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CenaDeleteManyArgs>(args?: Prisma.SelectSubset<T, CenaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CenaUpdateManyArgs>(args: Prisma.SelectSubset<T, CenaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends CenaUpsertArgs>(args: Prisma.SelectSubset<T, CenaUpsertArgs<ExtArgs>>): Prisma.Prisma__CenaClient<runtime.Types.Result.GetResult<Prisma.$CenaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CenaCountArgs>(args?: Prisma.Subset<T, CenaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CenaCountAggregateOutputType> : number>;
    aggregate<T extends CenaAggregateArgs>(args: Prisma.Subset<T, CenaAggregateArgs>): Prisma.PrismaPromise<GetCenaAggregateType<T>>;
    groupBy<T extends CenaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CenaGroupByArgs['orderBy'];
    } : {
        orderBy?: CenaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CenaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCenaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CenaFieldRefs;
}
export interface Prisma__CenaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sessao<T extends Prisma.SessaoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SessaoDefaultArgs<ExtArgs>>): Prisma.Prisma__SessaoClient<runtime.Types.Result.GetResult<Prisma.$SessaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    personagens<T extends Prisma.Cena$personagensArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cena$personagensArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    condicoes<T extends Prisma.Cena$condicoesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cena$condicoesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CondicaoPersonagemSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    eventos<T extends Prisma.Cena$eventosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cena$eventosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoSessaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CenaFieldRefs {
    readonly id: Prisma.FieldRef<"Cena", 'Int'>;
    readonly sessaoId: Prisma.FieldRef<"Cena", 'Int'>;
}
export type CenaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where: Prisma.CenaWhereUniqueInput;
};
export type CenaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where: Prisma.CenaWhereUniqueInput;
};
export type CenaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CenaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CenaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CenaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CenaCreateInput, Prisma.CenaUncheckedCreateInput>;
};
export type CenaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CenaCreateManyInput | Prisma.CenaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CenaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CenaUpdateInput, Prisma.CenaUncheckedUpdateInput>;
    where: Prisma.CenaWhereUniqueInput;
};
export type CenaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CenaUpdateManyMutationInput, Prisma.CenaUncheckedUpdateManyInput>;
    where?: Prisma.CenaWhereInput;
    limit?: number;
};
export type CenaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where: Prisma.CenaWhereUniqueInput;
    create: Prisma.XOR<Prisma.CenaCreateInput, Prisma.CenaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CenaUpdateInput, Prisma.CenaUncheckedUpdateInput>;
};
export type CenaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
    where: Prisma.CenaWhereUniqueInput;
};
export type CenaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CenaWhereInput;
    limit?: number;
};
export type Cena$personagensArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Cena$condicoesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Cena$eventosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CenaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CenaSelect<ExtArgs> | null;
    omit?: Prisma.CenaOmit<ExtArgs> | null;
    include?: Prisma.CenaInclude<ExtArgs> | null;
};
export {};
