import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type HabilidadeModel = runtime.Types.Result.DefaultSelection<Prisma.$HabilidadePayload>;
export type AggregateHabilidade = {
    _count: HabilidadeCountAggregateOutputType | null;
    _avg: HabilidadeAvgAggregateOutputType | null;
    _sum: HabilidadeSumAggregateOutputType | null;
    _min: HabilidadeMinAggregateOutputType | null;
    _max: HabilidadeMaxAggregateOutputType | null;
};
export type HabilidadeAvgAggregateOutputType = {
    id: number | null;
};
export type HabilidadeSumAggregateOutputType = {
    id: number | null;
};
export type HabilidadeMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    tipo: string | null;
    origem: string | null;
};
export type HabilidadeMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    tipo: string | null;
    origem: string | null;
};
export type HabilidadeCountAggregateOutputType = {
    id: number;
    nome: number;
    descricao: number;
    tipo: number;
    origem: number;
    _all: number;
};
export type HabilidadeAvgAggregateInputType = {
    id?: true;
};
export type HabilidadeSumAggregateInputType = {
    id?: true;
};
export type HabilidadeMinAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    tipo?: true;
    origem?: true;
};
export type HabilidadeMaxAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    tipo?: true;
    origem?: true;
};
export type HabilidadeCountAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    tipo?: true;
    origem?: true;
    _all?: true;
};
export type HabilidadeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeWhereInput;
    orderBy?: Prisma.HabilidadeOrderByWithRelationInput | Prisma.HabilidadeOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | HabilidadeCountAggregateInputType;
    _avg?: HabilidadeAvgAggregateInputType;
    _sum?: HabilidadeSumAggregateInputType;
    _min?: HabilidadeMinAggregateInputType;
    _max?: HabilidadeMaxAggregateInputType;
};
export type GetHabilidadeAggregateType<T extends HabilidadeAggregateArgs> = {
    [P in keyof T & keyof AggregateHabilidade]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateHabilidade[P]> : Prisma.GetScalarType<T[P], AggregateHabilidade[P]>;
};
export type HabilidadeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeWhereInput;
    orderBy?: Prisma.HabilidadeOrderByWithAggregationInput | Prisma.HabilidadeOrderByWithAggregationInput[];
    by: Prisma.HabilidadeScalarFieldEnum[] | Prisma.HabilidadeScalarFieldEnum;
    having?: Prisma.HabilidadeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: HabilidadeCountAggregateInputType | true;
    _avg?: HabilidadeAvgAggregateInputType;
    _sum?: HabilidadeSumAggregateInputType;
    _min?: HabilidadeMinAggregateInputType;
    _max?: HabilidadeMaxAggregateInputType;
};
export type HabilidadeGroupByOutputType = {
    id: number;
    nome: string;
    descricao: string | null;
    tipo: string;
    origem: string | null;
    _count: HabilidadeCountAggregateOutputType | null;
    _avg: HabilidadeAvgAggregateOutputType | null;
    _sum: HabilidadeSumAggregateOutputType | null;
    _min: HabilidadeMinAggregateOutputType | null;
    _max: HabilidadeMaxAggregateOutputType | null;
};
type GetHabilidadeGroupByPayload<T extends HabilidadeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<HabilidadeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof HabilidadeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], HabilidadeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], HabilidadeGroupByOutputType[P]>;
}>>;
export type HabilidadeWhereInput = {
    AND?: Prisma.HabilidadeWhereInput | Prisma.HabilidadeWhereInput[];
    OR?: Prisma.HabilidadeWhereInput[];
    NOT?: Prisma.HabilidadeWhereInput | Prisma.HabilidadeWhereInput[];
    id?: Prisma.IntFilter<"Habilidade"> | number;
    nome?: Prisma.StringFilter<"Habilidade"> | string;
    descricao?: Prisma.StringNullableFilter<"Habilidade"> | string | null;
    tipo?: Prisma.StringFilter<"Habilidade"> | string;
    origem?: Prisma.StringNullableFilter<"Habilidade"> | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaListRelationFilter;
    personagensComTecInata?: Prisma.PersonagemBaseListRelationFilter;
    habilidadesClasse?: Prisma.HabilidadeClasseListRelationFilter;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaListRelationFilter;
    habilidadesOrigem?: Prisma.HabilidadeOrigemListRelationFilter;
};
export type HabilidadeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipo?: Prisma.SortOrder;
    origem?: Prisma.SortOrderInput | Prisma.SortOrder;
    personagensBase?: Prisma.HabilidadePersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaOrderByRelationAggregateInput;
    personagensComTecInata?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    habilidadesClasse?: Prisma.HabilidadeClasseOrderByRelationAggregateInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaOrderByRelationAggregateInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemOrderByRelationAggregateInput;
    _relevance?: Prisma.HabilidadeOrderByRelevanceInput;
};
export type HabilidadeWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.HabilidadeWhereInput | Prisma.HabilidadeWhereInput[];
    OR?: Prisma.HabilidadeWhereInput[];
    NOT?: Prisma.HabilidadeWhereInput | Prisma.HabilidadeWhereInput[];
    nome?: Prisma.StringFilter<"Habilidade"> | string;
    descricao?: Prisma.StringNullableFilter<"Habilidade"> | string | null;
    tipo?: Prisma.StringFilter<"Habilidade"> | string;
    origem?: Prisma.StringNullableFilter<"Habilidade"> | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaListRelationFilter;
    personagensComTecInata?: Prisma.PersonagemBaseListRelationFilter;
    habilidadesClasse?: Prisma.HabilidadeClasseListRelationFilter;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaListRelationFilter;
    habilidadesOrigem?: Prisma.HabilidadeOrigemListRelationFilter;
}, "id">;
export type HabilidadeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipo?: Prisma.SortOrder;
    origem?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.HabilidadeCountOrderByAggregateInput;
    _avg?: Prisma.HabilidadeAvgOrderByAggregateInput;
    _max?: Prisma.HabilidadeMaxOrderByAggregateInput;
    _min?: Prisma.HabilidadeMinOrderByAggregateInput;
    _sum?: Prisma.HabilidadeSumOrderByAggregateInput;
};
export type HabilidadeScalarWhereWithAggregatesInput = {
    AND?: Prisma.HabilidadeScalarWhereWithAggregatesInput | Prisma.HabilidadeScalarWhereWithAggregatesInput[];
    OR?: Prisma.HabilidadeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.HabilidadeScalarWhereWithAggregatesInput | Prisma.HabilidadeScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Habilidade"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Habilidade"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Habilidade"> | string | null;
    tipo?: Prisma.StringWithAggregatesFilter<"Habilidade"> | string;
    origem?: Prisma.StringNullableWithAggregatesFilter<"Habilidade"> | string | null;
};
export type HabilidadeCreateInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateManyInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
};
export type HabilidadeUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type HabilidadeUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type HabilidadeNullableScalarRelationFilter = {
    is?: Prisma.HabilidadeWhereInput | null;
    isNot?: Prisma.HabilidadeWhereInput | null;
};
export type HabilidadeOrderByRelevanceInput = {
    fields: Prisma.HabilidadeOrderByRelevanceFieldEnum | Prisma.HabilidadeOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type HabilidadeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    tipo?: Prisma.SortOrder;
    origem?: Prisma.SortOrder;
};
export type HabilidadeAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type HabilidadeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    tipo?: Prisma.SortOrder;
    origem?: Prisma.SortOrder;
};
export type HabilidadeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    tipo?: Prisma.SortOrder;
    origem?: Prisma.SortOrder;
};
export type HabilidadeSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type HabilidadeScalarRelationFilter = {
    is?: Prisma.HabilidadeWhereInput;
    isNot?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeCreateNestedOneWithoutPersonagensComTecInataInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensComTecInataInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensComTecInataInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneWithoutPersonagensComTecInataNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensComTecInataInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensComTecInataInput;
    upsert?: Prisma.HabilidadeUpsertWithoutPersonagensComTecInataInput;
    disconnect?: Prisma.HabilidadeWhereInput | boolean;
    delete?: Prisma.HabilidadeWhereInput | boolean;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutPersonagensComTecInataInput, Prisma.HabilidadeUpdateWithoutPersonagensComTecInataInput>, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensComTecInataInput>;
};
export type HabilidadeCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneRequiredWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.HabilidadeUpsertWithoutPersonagensBaseInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.HabilidadeUpdateWithoutPersonagensBaseInput>, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type HabilidadeCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneRequiredWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.HabilidadeUpsertWithoutPersonagensCampanhaInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.HabilidadeUpdateWithoutPersonagensCampanhaInput>, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type HabilidadeCreateNestedOneWithoutHabilidadesClasseInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesClasseInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesClasseInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneRequiredWithoutHabilidadesClasseNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesClasseInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesClasseInput;
    upsert?: Prisma.HabilidadeUpsertWithoutHabilidadesClasseInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutHabilidadesClasseInput, Prisma.HabilidadeUpdateWithoutHabilidadesClasseInput>, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesClasseInput>;
};
export type HabilidadeCreateNestedOneWithoutHabilidadesTrilhaInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesTrilhaInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesTrilhaInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneRequiredWithoutHabilidadesTrilhaNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesTrilhaInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesTrilhaInput;
    upsert?: Prisma.HabilidadeUpsertWithoutHabilidadesTrilhaInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUpdateWithoutHabilidadesTrilhaInput>, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesTrilhaInput>;
};
export type HabilidadeCreateNestedOneWithoutHabilidadesOrigemInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesOrigemInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesOrigemInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateOneRequiredWithoutHabilidadesOrigemNestedInput = {
    create?: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesOrigemInput>;
    connectOrCreate?: Prisma.HabilidadeCreateOrConnectWithoutHabilidadesOrigemInput;
    upsert?: Prisma.HabilidadeUpsertWithoutHabilidadesOrigemInput;
    connect?: Prisma.HabilidadeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.HabilidadeUpdateToOneWithWhereWithoutHabilidadesOrigemInput, Prisma.HabilidadeUpdateWithoutHabilidadesOrigemInput>, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesOrigemInput>;
};
export type HabilidadeCreateWithoutPersonagensComTecInataInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutPersonagensComTecInataInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutPersonagensComTecInataInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensComTecInataInput>;
};
export type HabilidadeUpsertWithoutPersonagensComTecInataInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensComTecInataInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensComTecInataInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutPersonagensComTecInataInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensComTecInataInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensComTecInataInput>;
};
export type HabilidadeUpdateWithoutPersonagensComTecInataInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutPersonagensComTecInataInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensBaseInput>;
};
export type HabilidadeUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensBaseInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type HabilidadeUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type HabilidadeUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutPersonagensCampanhaInput, Prisma.HabilidadeUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type HabilidadeUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateWithoutHabilidadesClasseInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutHabilidadesClasseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutHabilidadesClasseInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesClasseInput>;
};
export type HabilidadeUpsertWithoutHabilidadesClasseInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesClasseInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesClasseInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutHabilidadesClasseInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesClasseInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesClasseInput>;
};
export type HabilidadeUpdateWithoutHabilidadesClasseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutHabilidadesClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateWithoutHabilidadesTrilhaInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutHabilidadesTrilhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutHabilidadesTrilhaInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesTrilhaInput>;
};
export type HabilidadeUpsertWithoutHabilidadesTrilhaInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesTrilhaInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesTrilhaInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutHabilidadesTrilhaInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesTrilhaInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesTrilhaInput>;
};
export type HabilidadeUpdateWithoutHabilidadesTrilhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutHabilidadesTrilhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesOrigem?: Prisma.HabilidadeOrigemUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCreateWithoutHabilidadesOrigemInput = {
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeUncheckedCreateWithoutHabilidadesOrigemInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    tipo: string;
    origem?: string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedCreateNestedManyWithoutHabilidadeInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutTecnicaInataInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutHabilidadeInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedCreateNestedManyWithoutHabilidadeInput;
};
export type HabilidadeCreateOrConnectWithoutHabilidadesOrigemInput = {
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesOrigemInput>;
};
export type HabilidadeUpsertWithoutHabilidadesOrigemInput = {
    update: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesOrigemInput>;
    create: Prisma.XOR<Prisma.HabilidadeCreateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedCreateWithoutHabilidadesOrigemInput>;
    where?: Prisma.HabilidadeWhereInput;
};
export type HabilidadeUpdateToOneWithWhereWithoutHabilidadesOrigemInput = {
    where?: Prisma.HabilidadeWhereInput;
    data: Prisma.XOR<Prisma.HabilidadeUpdateWithoutHabilidadesOrigemInput, Prisma.HabilidadeUncheckedUpdateWithoutHabilidadesOrigemInput>;
};
export type HabilidadeUpdateWithoutHabilidadesOrigemInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeUncheckedUpdateWithoutHabilidadesOrigemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tipo?: Prisma.StringFieldUpdateOperationsInput | string;
    origem?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.HabilidadePersonagemBaseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensCampanha?: Prisma.HabilidadePersonagemCampanhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
    personagensComTecInata?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutTecnicaInataNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutHabilidadeNestedInput;
    habilidadesTrilha?: Prisma.HabilidadeTrilhaUncheckedUpdateManyWithoutHabilidadeNestedInput;
};
export type HabilidadeCountOutputType = {
    personagensBase: number;
    personagensCampanha: number;
    personagensComTecInata: number;
    habilidadesClasse: number;
    habilidadesTrilha: number;
    habilidadesOrigem: number;
};
export type HabilidadeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | HabilidadeCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | HabilidadeCountOutputTypeCountPersonagensCampanhaArgs;
    personagensComTecInata?: boolean | HabilidadeCountOutputTypeCountPersonagensComTecInataArgs;
    habilidadesClasse?: boolean | HabilidadeCountOutputTypeCountHabilidadesClasseArgs;
    habilidadesTrilha?: boolean | HabilidadeCountOutputTypeCountHabilidadesTrilhaArgs;
    habilidadesOrigem?: boolean | HabilidadeCountOutputTypeCountHabilidadesOrigemArgs;
};
export type HabilidadeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeCountOutputTypeSelect<ExtArgs> | null;
};
export type HabilidadeCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
};
export type HabilidadeCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadePersonagemCampanhaWhereInput;
};
export type HabilidadeCountOutputTypeCountPersonagensComTecInataArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type HabilidadeCountOutputTypeCountHabilidadesClasseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeClasseWhereInput;
};
export type HabilidadeCountOutputTypeCountHabilidadesTrilhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeTrilhaWhereInput;
};
export type HabilidadeCountOutputTypeCountHabilidadesOrigemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeOrigemWhereInput;
};
export type HabilidadeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    tipo?: boolean;
    origem?: boolean;
    personagensBase?: boolean | Prisma.Habilidade$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Habilidade$personagensCampanhaArgs<ExtArgs>;
    personagensComTecInata?: boolean | Prisma.Habilidade$personagensComTecInataArgs<ExtArgs>;
    habilidadesClasse?: boolean | Prisma.Habilidade$habilidadesClasseArgs<ExtArgs>;
    habilidadesTrilha?: boolean | Prisma.Habilidade$habilidadesTrilhaArgs<ExtArgs>;
    habilidadesOrigem?: boolean | Prisma.Habilidade$habilidadesOrigemArgs<ExtArgs>;
    _count?: boolean | Prisma.HabilidadeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["habilidade"]>;
export type HabilidadeSelectScalar = {
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    tipo?: boolean;
    origem?: boolean;
};
export type HabilidadeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "descricao" | "tipo" | "origem", ExtArgs["result"]["habilidade"]>;
export type HabilidadeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personagensBase?: boolean | Prisma.Habilidade$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Habilidade$personagensCampanhaArgs<ExtArgs>;
    personagensComTecInata?: boolean | Prisma.Habilidade$personagensComTecInataArgs<ExtArgs>;
    habilidadesClasse?: boolean | Prisma.Habilidade$habilidadesClasseArgs<ExtArgs>;
    habilidadesTrilha?: boolean | Prisma.Habilidade$habilidadesTrilhaArgs<ExtArgs>;
    habilidadesOrigem?: boolean | Prisma.Habilidade$habilidadesOrigemArgs<ExtArgs>;
    _count?: boolean | Prisma.HabilidadeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $HabilidadePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Habilidade";
    objects: {
        personagensBase: Prisma.$HabilidadePersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>[];
        personagensComTecInata: Prisma.$PersonagemBasePayload<ExtArgs>[];
        habilidadesClasse: Prisma.$HabilidadeClassePayload<ExtArgs>[];
        habilidadesTrilha: Prisma.$HabilidadeTrilhaPayload<ExtArgs>[];
        habilidadesOrigem: Prisma.$HabilidadeOrigemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        descricao: string | null;
        tipo: string;
        origem: string | null;
    }, ExtArgs["result"]["habilidade"]>;
    composites: {};
};
export type HabilidadeGetPayload<S extends boolean | null | undefined | HabilidadeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$HabilidadePayload, S>;
export type HabilidadeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<HabilidadeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: HabilidadeCountAggregateInputType | true;
};
export interface HabilidadeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Habilidade'];
        meta: {
            name: 'Habilidade';
        };
    };
    findUnique<T extends HabilidadeFindUniqueArgs>(args: Prisma.SelectSubset<T, HabilidadeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends HabilidadeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, HabilidadeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends HabilidadeFindFirstArgs>(args?: Prisma.SelectSubset<T, HabilidadeFindFirstArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends HabilidadeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, HabilidadeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends HabilidadeFindManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends HabilidadeCreateArgs>(args: Prisma.SelectSubset<T, HabilidadeCreateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends HabilidadeCreateManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends HabilidadeDeleteArgs>(args: Prisma.SelectSubset<T, HabilidadeDeleteArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends HabilidadeUpdateArgs>(args: Prisma.SelectSubset<T, HabilidadeUpdateArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends HabilidadeDeleteManyArgs>(args?: Prisma.SelectSubset<T, HabilidadeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends HabilidadeUpdateManyArgs>(args: Prisma.SelectSubset<T, HabilidadeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends HabilidadeUpsertArgs>(args: Prisma.SelectSubset<T, HabilidadeUpsertArgs<ExtArgs>>): Prisma.Prisma__HabilidadeClient<runtime.Types.Result.GetResult<Prisma.$HabilidadePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends HabilidadeCountArgs>(args?: Prisma.Subset<T, HabilidadeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], HabilidadeCountAggregateOutputType> : number>;
    aggregate<T extends HabilidadeAggregateArgs>(args: Prisma.Subset<T, HabilidadeAggregateArgs>): Prisma.PrismaPromise<GetHabilidadeAggregateType<T>>;
    groupBy<T extends HabilidadeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: HabilidadeGroupByArgs['orderBy'];
    } : {
        orderBy?: HabilidadeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, HabilidadeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHabilidadeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: HabilidadeFieldRefs;
}
export interface Prisma__HabilidadeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personagensBase<T extends Prisma.Habilidade$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Habilidade$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadePersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensComTecInata<T extends Prisma.Habilidade$personagensComTecInataArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$personagensComTecInataArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesClasse<T extends Prisma.Habilidade$habilidadesClasseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$habilidadesClasseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesTrilha<T extends Prisma.Habilidade$habilidadesTrilhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$habilidadesTrilhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeTrilhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesOrigem<T extends Prisma.Habilidade$habilidadesOrigemArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Habilidade$habilidadesOrigemArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeOrigemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface HabilidadeFieldRefs {
    readonly id: Prisma.FieldRef<"Habilidade", 'Int'>;
    readonly nome: Prisma.FieldRef<"Habilidade", 'String'>;
    readonly descricao: Prisma.FieldRef<"Habilidade", 'String'>;
    readonly tipo: Prisma.FieldRef<"Habilidade", 'String'>;
    readonly origem: Prisma.FieldRef<"Habilidade", 'String'>;
}
export type HabilidadeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeWhereInput;
    orderBy?: Prisma.HabilidadeOrderByWithRelationInput | Prisma.HabilidadeOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeScalarFieldEnum | Prisma.HabilidadeScalarFieldEnum[];
};
export type HabilidadeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeWhereInput;
    orderBy?: Prisma.HabilidadeOrderByWithRelationInput | Prisma.HabilidadeOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeScalarFieldEnum | Prisma.HabilidadeScalarFieldEnum[];
};
export type HabilidadeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeWhereInput;
    orderBy?: Prisma.HabilidadeOrderByWithRelationInput | Prisma.HabilidadeOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeScalarFieldEnum | Prisma.HabilidadeScalarFieldEnum[];
};
export type HabilidadeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeCreateInput, Prisma.HabilidadeUncheckedCreateInput>;
};
export type HabilidadeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.HabilidadeCreateManyInput | Prisma.HabilidadeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type HabilidadeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.HabilidadeUpdateInput, Prisma.HabilidadeUncheckedUpdateInput>;
    where: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.HabilidadeUpdateManyMutationInput, Prisma.HabilidadeUncheckedUpdateManyInput>;
    where?: Prisma.HabilidadeWhereInput;
    limit?: number;
};
export type HabilidadeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where: Prisma.HabilidadeWhereUniqueInput;
    create: Prisma.XOR<Prisma.HabilidadeCreateInput, Prisma.HabilidadeUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.HabilidadeUpdateInput, Prisma.HabilidadeUncheckedUpdateInput>;
};
export type HabilidadeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
    where: Prisma.HabilidadeWhereUniqueInput;
};
export type HabilidadeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeWhereInput;
    limit?: number;
};
export type Habilidade$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadePersonagemBaseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadePersonagemBaseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadePersonagemBaseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadePersonagemBaseWhereInput;
    orderBy?: Prisma.HabilidadePersonagemBaseOrderByWithRelationInput | Prisma.HabilidadePersonagemBaseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadePersonagemBaseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadePersonagemBaseScalarFieldEnum | Prisma.HabilidadePersonagemBaseScalarFieldEnum[];
};
export type Habilidade$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Habilidade$personagensComTecInataArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Habilidade$habilidadesClasseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeClasseSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeClasseOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeClasseInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeClasseWhereInput;
    orderBy?: Prisma.HabilidadeClasseOrderByWithRelationInput | Prisma.HabilidadeClasseOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeClasseScalarFieldEnum | Prisma.HabilidadeClasseScalarFieldEnum[];
};
export type Habilidade$habilidadesTrilhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeTrilhaSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeTrilhaOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeTrilhaInclude<ExtArgs> | null;
    where?: Prisma.HabilidadeTrilhaWhereInput;
    orderBy?: Prisma.HabilidadeTrilhaOrderByWithRelationInput | Prisma.HabilidadeTrilhaOrderByWithRelationInput[];
    cursor?: Prisma.HabilidadeTrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.HabilidadeTrilhaScalarFieldEnum | Prisma.HabilidadeTrilhaScalarFieldEnum[];
};
export type Habilidade$habilidadesOrigemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type HabilidadeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.HabilidadeSelect<ExtArgs> | null;
    omit?: Prisma.HabilidadeOmit<ExtArgs> | null;
    include?: Prisma.HabilidadeInclude<ExtArgs> | null;
};
export {};
