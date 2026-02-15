import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UsuarioModel = runtime.Types.Result.DefaultSelection<Prisma.$UsuarioPayload>;
export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null;
    _avg: UsuarioAvgAggregateOutputType | null;
    _sum: UsuarioSumAggregateOutputType | null;
    _min: UsuarioMinAggregateOutputType | null;
    _max: UsuarioMaxAggregateOutputType | null;
};
export type UsuarioAvgAggregateOutputType = {
    id: number | null;
};
export type UsuarioSumAggregateOutputType = {
    id: number | null;
};
export type UsuarioMinAggregateOutputType = {
    id: number | null;
    apelido: string | null;
    email: string | null;
    senhaHash: string | null;
    criadoEm: Date | null;
    atualizadoEm: Date | null;
};
export type UsuarioMaxAggregateOutputType = {
    id: number | null;
    apelido: string | null;
    email: string | null;
    senhaHash: string | null;
    criadoEm: Date | null;
    atualizadoEm: Date | null;
};
export type UsuarioCountAggregateOutputType = {
    id: number;
    apelido: number;
    email: number;
    senhaHash: number;
    criadoEm: number;
    atualizadoEm: number;
    _all: number;
};
export type UsuarioAvgAggregateInputType = {
    id?: true;
};
export type UsuarioSumAggregateInputType = {
    id?: true;
};
export type UsuarioMinAggregateInputType = {
    id?: true;
    apelido?: true;
    email?: true;
    senhaHash?: true;
    criadoEm?: true;
    atualizadoEm?: true;
};
export type UsuarioMaxAggregateInputType = {
    id?: true;
    apelido?: true;
    email?: true;
    senhaHash?: true;
    criadoEm?: true;
    atualizadoEm?: true;
};
export type UsuarioCountAggregateInputType = {
    id?: true;
    apelido?: true;
    email?: true;
    senhaHash?: true;
    criadoEm?: true;
    atualizadoEm?: true;
    _all?: true;
};
export type UsuarioAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UsuarioCountAggregateInputType;
    _avg?: UsuarioAvgAggregateInputType;
    _sum?: UsuarioSumAggregateInputType;
    _min?: UsuarioMinAggregateInputType;
    _max?: UsuarioMaxAggregateInputType;
};
export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
    [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUsuario[P]> : Prisma.GetScalarType<T[P], AggregateUsuario[P]>;
};
export type UsuarioGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithAggregationInput | Prisma.UsuarioOrderByWithAggregationInput[];
    by: Prisma.UsuarioScalarFieldEnum[] | Prisma.UsuarioScalarFieldEnum;
    having?: Prisma.UsuarioScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UsuarioCountAggregateInputType | true;
    _avg?: UsuarioAvgAggregateInputType;
    _sum?: UsuarioSumAggregateInputType;
    _min?: UsuarioMinAggregateInputType;
    _max?: UsuarioMaxAggregateInputType;
};
export type UsuarioGroupByOutputType = {
    id: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm: Date;
    atualizadoEm: Date;
    _count: UsuarioCountAggregateOutputType | null;
    _avg: UsuarioAvgAggregateOutputType | null;
    _sum: UsuarioSumAggregateOutputType | null;
    _min: UsuarioMinAggregateOutputType | null;
    _max: UsuarioMaxAggregateOutputType | null;
};
type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UsuarioGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UsuarioGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UsuarioGroupByOutputType[P]>;
}>>;
export type UsuarioWhereInput = {
    AND?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    OR?: Prisma.UsuarioWhereInput[];
    NOT?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    id?: Prisma.IntFilter<"Usuario"> | number;
    apelido?: Prisma.StringFilter<"Usuario"> | string;
    email?: Prisma.StringFilter<"Usuario"> | string;
    senhaHash?: Prisma.StringFilter<"Usuario"> | string;
    criadoEm?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    atualizadoEm?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    campanhasQuePossui?: Prisma.CampanhaListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    membrosCampanha?: Prisma.MembroCampanhaListRelationFilter;
};
export type UsuarioOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    apelido?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    senhaHash?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    atualizadoEm?: Prisma.SortOrder;
    campanhasQuePossui?: Prisma.CampanhaOrderByRelationAggregateInput;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    membrosCampanha?: Prisma.MembroCampanhaOrderByRelationAggregateInput;
    _relevance?: Prisma.UsuarioOrderByRelevanceInput;
};
export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    email?: string;
    AND?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    OR?: Prisma.UsuarioWhereInput[];
    NOT?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    apelido?: Prisma.StringFilter<"Usuario"> | string;
    senhaHash?: Prisma.StringFilter<"Usuario"> | string;
    criadoEm?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    atualizadoEm?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    campanhasQuePossui?: Prisma.CampanhaListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    membrosCampanha?: Prisma.MembroCampanhaListRelationFilter;
}, "id" | "email">;
export type UsuarioOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    apelido?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    senhaHash?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    atualizadoEm?: Prisma.SortOrder;
    _count?: Prisma.UsuarioCountOrderByAggregateInput;
    _avg?: Prisma.UsuarioAvgOrderByAggregateInput;
    _max?: Prisma.UsuarioMaxOrderByAggregateInput;
    _min?: Prisma.UsuarioMinOrderByAggregateInput;
    _sum?: Prisma.UsuarioSumOrderByAggregateInput;
};
export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: Prisma.UsuarioScalarWhereWithAggregatesInput | Prisma.UsuarioScalarWhereWithAggregatesInput[];
    OR?: Prisma.UsuarioScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UsuarioScalarWhereWithAggregatesInput | Prisma.UsuarioScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Usuario"> | number;
    apelido?: Prisma.StringWithAggregatesFilter<"Usuario"> | string;
    email?: Prisma.StringWithAggregatesFilter<"Usuario"> | string;
    senhaHash?: Prisma.StringWithAggregatesFilter<"Usuario"> | string;
    criadoEm?: Prisma.DateTimeWithAggregatesFilter<"Usuario"> | Date | string;
    atualizadoEm?: Prisma.DateTimeWithAggregatesFilter<"Usuario"> | Date | string;
};
export type UsuarioCreateInput = {
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaCreateNestedManyWithoutDonoInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUncheckedCreateInput = {
    id?: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedCreateNestedManyWithoutDonoInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUpdateInput = {
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUpdateManyWithoutDonoNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedUpdateManyWithoutDonoNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioCreateManyInput = {
    id?: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
};
export type UsuarioUpdateManyMutationInput = {
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioOrderByRelevanceInput = {
    fields: Prisma.UsuarioOrderByRelevanceFieldEnum | Prisma.UsuarioOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type UsuarioCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    apelido?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    senhaHash?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    atualizadoEm?: Prisma.SortOrder;
};
export type UsuarioAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type UsuarioMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    apelido?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    senhaHash?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    atualizadoEm?: Prisma.SortOrder;
};
export type UsuarioMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    apelido?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    senhaHash?: Prisma.SortOrder;
    criadoEm?: Prisma.SortOrder;
    atualizadoEm?: Prisma.SortOrder;
};
export type UsuarioSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type UsuarioScalarRelationFilter = {
    is?: Prisma.UsuarioWhereInput;
    isNot?: Prisma.UsuarioWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type UsuarioCreateNestedOneWithoutCampanhasQuePossuiInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedCreateWithoutCampanhasQuePossuiInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutCampanhasQuePossuiInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateOneRequiredWithoutCampanhasQuePossuiNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedCreateWithoutCampanhasQuePossuiInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutCampanhasQuePossuiInput;
    upsert?: Prisma.UsuarioUpsertWithoutCampanhasQuePossuiInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsuarioUpdateToOneWithWhereWithoutCampanhasQuePossuiInput, Prisma.UsuarioUpdateWithoutCampanhasQuePossuiInput>, Prisma.UsuarioUncheckedUpdateWithoutCampanhasQuePossuiInput>;
};
export type UsuarioCreateNestedOneWithoutMembrosCampanhaInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedCreateWithoutMembrosCampanhaInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutMembrosCampanhaInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateOneRequiredWithoutMembrosCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedCreateWithoutMembrosCampanhaInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutMembrosCampanhaInput;
    upsert?: Prisma.UsuarioUpsertWithoutMembrosCampanhaInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsuarioUpdateToOneWithWhereWithoutMembrosCampanhaInput, Prisma.UsuarioUpdateWithoutMembrosCampanhaInput>, Prisma.UsuarioUncheckedUpdateWithoutMembrosCampanhaInput>;
};
export type UsuarioCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateOneRequiredWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.UsuarioUpsertWithoutPersonagensBaseInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsuarioUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.UsuarioUpdateWithoutPersonagensBaseInput>, Prisma.UsuarioUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type UsuarioCreateWithoutCampanhasQuePossuiInput = {
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUncheckedCreateWithoutCampanhasQuePossuiInput = {
    id?: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioCreateOrConnectWithoutCampanhasQuePossuiInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedCreateWithoutCampanhasQuePossuiInput>;
};
export type UsuarioUpsertWithoutCampanhasQuePossuiInput = {
    update: Prisma.XOR<Prisma.UsuarioUpdateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedUpdateWithoutCampanhasQuePossuiInput>;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedCreateWithoutCampanhasQuePossuiInput>;
    where?: Prisma.UsuarioWhereInput;
};
export type UsuarioUpdateToOneWithWhereWithoutCampanhasQuePossuiInput = {
    where?: Prisma.UsuarioWhereInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateWithoutCampanhasQuePossuiInput, Prisma.UsuarioUncheckedUpdateWithoutCampanhasQuePossuiInput>;
};
export type UsuarioUpdateWithoutCampanhasQuePossuiInput = {
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateWithoutCampanhasQuePossuiInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioCreateWithoutMembrosCampanhaInput = {
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaCreateNestedManyWithoutDonoInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutDonoInput;
};
export type UsuarioUncheckedCreateWithoutMembrosCampanhaInput = {
    id?: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedCreateNestedManyWithoutDonoInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutDonoInput;
};
export type UsuarioCreateOrConnectWithoutMembrosCampanhaInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedCreateWithoutMembrosCampanhaInput>;
};
export type UsuarioUpsertWithoutMembrosCampanhaInput = {
    update: Prisma.XOR<Prisma.UsuarioUpdateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedUpdateWithoutMembrosCampanhaInput>;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedCreateWithoutMembrosCampanhaInput>;
    where?: Prisma.UsuarioWhereInput;
};
export type UsuarioUpdateToOneWithWhereWithoutMembrosCampanhaInput = {
    where?: Prisma.UsuarioWhereInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateWithoutMembrosCampanhaInput, Prisma.UsuarioUncheckedUpdateWithoutMembrosCampanhaInput>;
};
export type UsuarioUpdateWithoutMembrosCampanhaInput = {
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUpdateManyWithoutDonoNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutDonoNestedInput;
};
export type UsuarioUncheckedUpdateWithoutMembrosCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedUpdateManyWithoutDonoNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutDonoNestedInput;
};
export type UsuarioCreateWithoutPersonagensBaseInput = {
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    apelido: string;
    email: string;
    senhaHash: string;
    criadoEm?: Date | string;
    atualizadoEm?: Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedCreateNestedManyWithoutDonoInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedCreateWithoutPersonagensBaseInput>;
};
export type UsuarioUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.UsuarioUpdateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.UsuarioWhereInput;
};
export type UsuarioUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.UsuarioWhereInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateWithoutPersonagensBaseInput, Prisma.UsuarioUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type UsuarioUpdateWithoutPersonagensBaseInput = {
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    apelido?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    senhaHash?: Prisma.StringFieldUpdateOperationsInput | string;
    criadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    atualizadoEm?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campanhasQuePossui?: Prisma.CampanhaUncheckedUpdateManyWithoutDonoNestedInput;
    membrosCampanha?: Prisma.MembroCampanhaUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioCountOutputType = {
    campanhasQuePossui: number;
    personagensBase: number;
    membrosCampanha: number;
};
export type UsuarioCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campanhasQuePossui?: boolean | UsuarioCountOutputTypeCountCampanhasQuePossuiArgs;
    personagensBase?: boolean | UsuarioCountOutputTypeCountPersonagensBaseArgs;
    membrosCampanha?: boolean | UsuarioCountOutputTypeCountMembrosCampanhaArgs;
};
export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioCountOutputTypeSelect<ExtArgs> | null;
};
export type UsuarioCountOutputTypeCountCampanhasQuePossuiArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CampanhaWhereInput;
};
export type UsuarioCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type UsuarioCountOutputTypeCountMembrosCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MembroCampanhaWhereInput;
};
export type UsuarioSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    apelido?: boolean;
    email?: boolean;
    senhaHash?: boolean;
    criadoEm?: boolean;
    atualizadoEm?: boolean;
    campanhasQuePossui?: boolean | Prisma.Usuario$campanhasQuePossuiArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Usuario$personagensBaseArgs<ExtArgs>;
    membrosCampanha?: boolean | Prisma.Usuario$membrosCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.UsuarioCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["usuario"]>;
export type UsuarioSelectScalar = {
    id?: boolean;
    apelido?: boolean;
    email?: boolean;
    senhaHash?: boolean;
    criadoEm?: boolean;
    atualizadoEm?: boolean;
};
export type UsuarioOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "apelido" | "email" | "senhaHash" | "criadoEm" | "atualizadoEm", ExtArgs["result"]["usuario"]>;
export type UsuarioInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campanhasQuePossui?: boolean | Prisma.Usuario$campanhasQuePossuiArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Usuario$personagensBaseArgs<ExtArgs>;
    membrosCampanha?: boolean | Prisma.Usuario$membrosCampanhaArgs<ExtArgs>;
    _count?: boolean | Prisma.UsuarioCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $UsuarioPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Usuario";
    objects: {
        campanhasQuePossui: Prisma.$CampanhaPayload<ExtArgs>[];
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        membrosCampanha: Prisma.$MembroCampanhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        apelido: string;
        email: string;
        senhaHash: string;
        criadoEm: Date;
        atualizadoEm: Date;
    }, ExtArgs["result"]["usuario"]>;
    composites: {};
};
export type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UsuarioPayload, S>;
export type UsuarioCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UsuarioCountAggregateInputType | true;
};
export interface UsuarioDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Usuario'];
        meta: {
            name: 'Usuario';
        };
    };
    findUnique<T extends UsuarioFindUniqueArgs>(args: Prisma.SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UsuarioFindFirstArgs>(args?: Prisma.SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UsuarioFindManyArgs>(args?: Prisma.SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UsuarioCreateArgs>(args: Prisma.SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UsuarioCreateManyArgs>(args?: Prisma.SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends UsuarioDeleteArgs>(args: Prisma.SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UsuarioUpdateArgs>(args: Prisma.SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: Prisma.SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UsuarioUpdateManyArgs>(args: Prisma.SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends UsuarioUpsertArgs>(args: Prisma.SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UsuarioCountArgs>(args?: Prisma.Subset<T, UsuarioCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UsuarioCountAggregateOutputType> : number>;
    aggregate<T extends UsuarioAggregateArgs>(args: Prisma.Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>;
    groupBy<T extends UsuarioGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UsuarioGroupByArgs['orderBy'];
    } : {
        orderBy?: UsuarioGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UsuarioFieldRefs;
}
export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    campanhasQuePossui<T extends Prisma.Usuario$campanhasQuePossuiArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Usuario$campanhasQuePossuiArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensBase<T extends Prisma.Usuario$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Usuario$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    membrosCampanha<T extends Prisma.Usuario$membrosCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Usuario$membrosCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MembroCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UsuarioFieldRefs {
    readonly id: Prisma.FieldRef<"Usuario", 'Int'>;
    readonly apelido: Prisma.FieldRef<"Usuario", 'String'>;
    readonly email: Prisma.FieldRef<"Usuario", 'String'>;
    readonly senhaHash: Prisma.FieldRef<"Usuario", 'String'>;
    readonly criadoEm: Prisma.FieldRef<"Usuario", 'DateTime'>;
    readonly atualizadoEm: Prisma.FieldRef<"Usuario", 'DateTime'>;
}
export type UsuarioFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsuarioCreateInput, Prisma.UsuarioUncheckedCreateInput>;
};
export type UsuarioCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UsuarioCreateManyInput | Prisma.UsuarioCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsuarioUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsuarioUpdateInput, Prisma.UsuarioUncheckedUpdateInput>;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UsuarioUpdateManyMutationInput, Prisma.UsuarioUncheckedUpdateManyInput>;
    where?: Prisma.UsuarioWhereInput;
    limit?: number;
};
export type UsuarioUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateInput, Prisma.UsuarioUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UsuarioUpdateInput, Prisma.UsuarioUncheckedUpdateInput>;
};
export type UsuarioDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    limit?: number;
};
export type Usuario$campanhasQuePossuiArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampanhaSelect<ExtArgs> | null;
    omit?: Prisma.CampanhaOmit<ExtArgs> | null;
    include?: Prisma.CampanhaInclude<ExtArgs> | null;
    where?: Prisma.CampanhaWhereInput;
    orderBy?: Prisma.CampanhaOrderByWithRelationInput | Prisma.CampanhaOrderByWithRelationInput[];
    cursor?: Prisma.CampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CampanhaScalarFieldEnum | Prisma.CampanhaScalarFieldEnum[];
};
export type Usuario$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.PersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.PersonagemBaseWhereInput;
    orderBy?: Prisma.PersonagemBaseOrderByWithRelationInput | Prisma.PersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonagemBaseScalarFieldEnum | Prisma.PersonagemBaseScalarFieldEnum[];
};
export type Usuario$membrosCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UsuarioDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
};
export {};
