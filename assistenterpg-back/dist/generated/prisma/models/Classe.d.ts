import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClasseModel = runtime.Types.Result.DefaultSelection<Prisma.$ClassePayload>;
export type AggregateClasse = {
    _count: ClasseCountAggregateOutputType | null;
    _avg: ClasseAvgAggregateOutputType | null;
    _sum: ClasseSumAggregateOutputType | null;
    _min: ClasseMinAggregateOutputType | null;
    _max: ClasseMaxAggregateOutputType | null;
};
export type ClasseAvgAggregateOutputType = {
    id: number | null;
};
export type ClasseSumAggregateOutputType = {
    id: number | null;
};
export type ClasseMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type ClasseMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    descricao: string | null;
};
export type ClasseCountAggregateOutputType = {
    id: number;
    nome: number;
    descricao: number;
    _all: number;
};
export type ClasseAvgAggregateInputType = {
    id?: true;
};
export type ClasseSumAggregateInputType = {
    id?: true;
};
export type ClasseMinAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type ClasseMaxAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
};
export type ClasseCountAggregateInputType = {
    id?: true;
    nome?: true;
    descricao?: true;
    _all?: true;
};
export type ClasseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClasseWhereInput;
    orderBy?: Prisma.ClasseOrderByWithRelationInput | Prisma.ClasseOrderByWithRelationInput[];
    cursor?: Prisma.ClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClasseCountAggregateInputType;
    _avg?: ClasseAvgAggregateInputType;
    _sum?: ClasseSumAggregateInputType;
    _min?: ClasseMinAggregateInputType;
    _max?: ClasseMaxAggregateInputType;
};
export type GetClasseAggregateType<T extends ClasseAggregateArgs> = {
    [P in keyof T & keyof AggregateClasse]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClasse[P]> : Prisma.GetScalarType<T[P], AggregateClasse[P]>;
};
export type ClasseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClasseWhereInput;
    orderBy?: Prisma.ClasseOrderByWithAggregationInput | Prisma.ClasseOrderByWithAggregationInput[];
    by: Prisma.ClasseScalarFieldEnum[] | Prisma.ClasseScalarFieldEnum;
    having?: Prisma.ClasseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClasseCountAggregateInputType | true;
    _avg?: ClasseAvgAggregateInputType;
    _sum?: ClasseSumAggregateInputType;
    _min?: ClasseMinAggregateInputType;
    _max?: ClasseMaxAggregateInputType;
};
export type ClasseGroupByOutputType = {
    id: number;
    nome: string;
    descricao: string | null;
    _count: ClasseCountAggregateOutputType | null;
    _avg: ClasseAvgAggregateOutputType | null;
    _sum: ClasseSumAggregateOutputType | null;
    _min: ClasseMinAggregateOutputType | null;
    _max: ClasseMaxAggregateOutputType | null;
};
type GetClasseGroupByPayload<T extends ClasseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClasseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClasseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClasseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClasseGroupByOutputType[P]>;
}>>;
export type ClasseWhereInput = {
    AND?: Prisma.ClasseWhereInput | Prisma.ClasseWhereInput[];
    OR?: Prisma.ClasseWhereInput[];
    NOT?: Prisma.ClasseWhereInput | Prisma.ClasseWhereInput[];
    id?: Prisma.IntFilter<"Classe"> | number;
    nome?: Prisma.StringFilter<"Classe"> | string;
    descricao?: Prisma.StringNullableFilter<"Classe"> | string | null;
    trilhas?: Prisma.TrilhaListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesClasse?: Prisma.HabilidadeClasseListRelationFilter;
};
export type ClasseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    trilhas?: Prisma.TrilhaOrderByRelationAggregateInput;
    personagensBase?: Prisma.PersonagemBaseOrderByRelationAggregateInput;
    personagensCampanha?: Prisma.PersonagemCampanhaOrderByRelationAggregateInput;
    habilidadesClasse?: Prisma.HabilidadeClasseOrderByRelationAggregateInput;
    _relevance?: Prisma.ClasseOrderByRelevanceInput;
};
export type ClasseWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ClasseWhereInput | Prisma.ClasseWhereInput[];
    OR?: Prisma.ClasseWhereInput[];
    NOT?: Prisma.ClasseWhereInput | Prisma.ClasseWhereInput[];
    nome?: Prisma.StringFilter<"Classe"> | string;
    descricao?: Prisma.StringNullableFilter<"Classe"> | string | null;
    trilhas?: Prisma.TrilhaListRelationFilter;
    personagensBase?: Prisma.PersonagemBaseListRelationFilter;
    personagensCampanha?: Prisma.PersonagemCampanhaListRelationFilter;
    habilidadesClasse?: Prisma.HabilidadeClasseListRelationFilter;
}, "id">;
export type ClasseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ClasseCountOrderByAggregateInput;
    _avg?: Prisma.ClasseAvgOrderByAggregateInput;
    _max?: Prisma.ClasseMaxOrderByAggregateInput;
    _min?: Prisma.ClasseMinOrderByAggregateInput;
    _sum?: Prisma.ClasseSumOrderByAggregateInput;
};
export type ClasseScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClasseScalarWhereWithAggregatesInput | Prisma.ClasseScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClasseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClasseScalarWhereWithAggregatesInput | Prisma.ClasseScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Classe"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Classe"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Classe"> | string | null;
};
export type ClasseCreateInput = {
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutClasseInput;
};
export type ClasseUncheckedCreateInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaUncheckedCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutClasseInput;
};
export type ClasseUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutClasseNestedInput;
};
export type ClasseUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUncheckedUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutClasseNestedInput;
};
export type ClasseCreateManyInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
};
export type ClasseUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClasseUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClasseScalarRelationFilter = {
    is?: Prisma.ClasseWhereInput;
    isNot?: Prisma.ClasseWhereInput;
};
export type ClasseOrderByRelevanceInput = {
    fields: Prisma.ClasseOrderByRelevanceFieldEnum | Prisma.ClasseOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type ClasseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type ClasseAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ClasseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type ClasseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
};
export type ClasseSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ClasseCreateNestedOneWithoutPersonagensBaseInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutPersonagensBaseInput;
    connect?: Prisma.ClasseWhereUniqueInput;
};
export type ClasseUpdateOneRequiredWithoutPersonagensBaseNestedInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedCreateWithoutPersonagensBaseInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutPersonagensBaseInput;
    upsert?: Prisma.ClasseUpsertWithoutPersonagensBaseInput;
    connect?: Prisma.ClasseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClasseUpdateToOneWithWhereWithoutPersonagensBaseInput, Prisma.ClasseUpdateWithoutPersonagensBaseInput>, Prisma.ClasseUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type ClasseCreateNestedOneWithoutPersonagensCampanhaInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutPersonagensCampanhaInput;
    connect?: Prisma.ClasseWhereUniqueInput;
};
export type ClasseUpdateOneRequiredWithoutPersonagensCampanhaNestedInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedCreateWithoutPersonagensCampanhaInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutPersonagensCampanhaInput;
    upsert?: Prisma.ClasseUpsertWithoutPersonagensCampanhaInput;
    connect?: Prisma.ClasseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClasseUpdateToOneWithWhereWithoutPersonagensCampanhaInput, Prisma.ClasseUpdateWithoutPersonagensCampanhaInput>, Prisma.ClasseUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type ClasseCreateNestedOneWithoutTrilhasInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutTrilhasInput, Prisma.ClasseUncheckedCreateWithoutTrilhasInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutTrilhasInput;
    connect?: Prisma.ClasseWhereUniqueInput;
};
export type ClasseUpdateOneRequiredWithoutTrilhasNestedInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutTrilhasInput, Prisma.ClasseUncheckedCreateWithoutTrilhasInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutTrilhasInput;
    upsert?: Prisma.ClasseUpsertWithoutTrilhasInput;
    connect?: Prisma.ClasseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClasseUpdateToOneWithWhereWithoutTrilhasInput, Prisma.ClasseUpdateWithoutTrilhasInput>, Prisma.ClasseUncheckedUpdateWithoutTrilhasInput>;
};
export type ClasseCreateNestedOneWithoutHabilidadesClasseInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedCreateWithoutHabilidadesClasseInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutHabilidadesClasseInput;
    connect?: Prisma.ClasseWhereUniqueInput;
};
export type ClasseUpdateOneRequiredWithoutHabilidadesClasseNestedInput = {
    create?: Prisma.XOR<Prisma.ClasseCreateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedCreateWithoutHabilidadesClasseInput>;
    connectOrCreate?: Prisma.ClasseCreateOrConnectWithoutHabilidadesClasseInput;
    upsert?: Prisma.ClasseUpsertWithoutHabilidadesClasseInput;
    connect?: Prisma.ClasseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClasseUpdateToOneWithWhereWithoutHabilidadesClasseInput, Prisma.ClasseUpdateWithoutHabilidadesClasseInput>, Prisma.ClasseUncheckedUpdateWithoutHabilidadesClasseInput>;
};
export type ClasseCreateWithoutPersonagensBaseInput = {
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutClasseInput;
};
export type ClasseUncheckedCreateWithoutPersonagensBaseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaUncheckedCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutClasseInput;
};
export type ClasseCreateOrConnectWithoutPersonagensBaseInput = {
    where: Prisma.ClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedCreateWithoutPersonagensBaseInput>;
};
export type ClasseUpsertWithoutPersonagensBaseInput = {
    update: Prisma.XOR<Prisma.ClasseUpdateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedUpdateWithoutPersonagensBaseInput>;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedCreateWithoutPersonagensBaseInput>;
    where?: Prisma.ClasseWhereInput;
};
export type ClasseUpdateToOneWithWhereWithoutPersonagensBaseInput = {
    where?: Prisma.ClasseWhereInput;
    data: Prisma.XOR<Prisma.ClasseUpdateWithoutPersonagensBaseInput, Prisma.ClasseUncheckedUpdateWithoutPersonagensBaseInput>;
};
export type ClasseUpdateWithoutPersonagensBaseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutClasseNestedInput;
};
export type ClasseUncheckedUpdateWithoutPersonagensBaseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUncheckedUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutClasseNestedInput;
};
export type ClasseCreateWithoutPersonagensCampanhaInput = {
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutClasseInput;
};
export type ClasseUncheckedCreateWithoutPersonagensCampanhaInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaUncheckedCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutClasseInput;
};
export type ClasseCreateOrConnectWithoutPersonagensCampanhaInput = {
    where: Prisma.ClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedCreateWithoutPersonagensCampanhaInput>;
};
export type ClasseUpsertWithoutPersonagensCampanhaInput = {
    update: Prisma.XOR<Prisma.ClasseUpdateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedUpdateWithoutPersonagensCampanhaInput>;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedCreateWithoutPersonagensCampanhaInput>;
    where?: Prisma.ClasseWhereInput;
};
export type ClasseUpdateToOneWithWhereWithoutPersonagensCampanhaInput = {
    where?: Prisma.ClasseWhereInput;
    data: Prisma.XOR<Prisma.ClasseUpdateWithoutPersonagensCampanhaInput, Prisma.ClasseUncheckedUpdateWithoutPersonagensCampanhaInput>;
};
export type ClasseUpdateWithoutPersonagensCampanhaInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutClasseNestedInput;
};
export type ClasseUncheckedUpdateWithoutPersonagensCampanhaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUncheckedUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutClasseNestedInput;
};
export type ClasseCreateWithoutTrilhasInput = {
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseCreateNestedManyWithoutClasseInput;
};
export type ClasseUncheckedCreateWithoutTrilhasInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClasseInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedCreateNestedManyWithoutClasseInput;
};
export type ClasseCreateOrConnectWithoutTrilhasInput = {
    where: Prisma.ClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutTrilhasInput, Prisma.ClasseUncheckedCreateWithoutTrilhasInput>;
};
export type ClasseUpsertWithoutTrilhasInput = {
    update: Prisma.XOR<Prisma.ClasseUpdateWithoutTrilhasInput, Prisma.ClasseUncheckedUpdateWithoutTrilhasInput>;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutTrilhasInput, Prisma.ClasseUncheckedCreateWithoutTrilhasInput>;
    where?: Prisma.ClasseWhereInput;
};
export type ClasseUpdateToOneWithWhereWithoutTrilhasInput = {
    where?: Prisma.ClasseWhereInput;
    data: Prisma.XOR<Prisma.ClasseUpdateWithoutTrilhasInput, Prisma.ClasseUncheckedUpdateWithoutTrilhasInput>;
};
export type ClasseUpdateWithoutTrilhasInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUpdateManyWithoutClasseNestedInput;
};
export type ClasseUncheckedUpdateWithoutTrilhasInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClasseNestedInput;
    habilidadesClasse?: Prisma.HabilidadeClasseUncheckedUpdateManyWithoutClasseNestedInput;
};
export type ClasseCreateWithoutHabilidadesClasseInput = {
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaCreateNestedManyWithoutClasseInput;
};
export type ClasseUncheckedCreateWithoutHabilidadesClasseInput = {
    id?: number;
    nome: string;
    descricao?: string | null;
    trilhas?: Prisma.TrilhaUncheckedCreateNestedManyWithoutClasseInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedCreateNestedManyWithoutClasseInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedCreateNestedManyWithoutClasseInput;
};
export type ClasseCreateOrConnectWithoutHabilidadesClasseInput = {
    where: Prisma.ClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedCreateWithoutHabilidadesClasseInput>;
};
export type ClasseUpsertWithoutHabilidadesClasseInput = {
    update: Prisma.XOR<Prisma.ClasseUpdateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedUpdateWithoutHabilidadesClasseInput>;
    create: Prisma.XOR<Prisma.ClasseCreateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedCreateWithoutHabilidadesClasseInput>;
    where?: Prisma.ClasseWhereInput;
};
export type ClasseUpdateToOneWithWhereWithoutHabilidadesClasseInput = {
    where?: Prisma.ClasseWhereInput;
    data: Prisma.XOR<Prisma.ClasseUpdateWithoutHabilidadesClasseInput, Prisma.ClasseUncheckedUpdateWithoutHabilidadesClasseInput>;
};
export type ClasseUpdateWithoutHabilidadesClasseInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUpdateManyWithoutClasseNestedInput;
};
export type ClasseUncheckedUpdateWithoutHabilidadesClasseInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trilhas?: Prisma.TrilhaUncheckedUpdateManyWithoutClasseNestedInput;
    personagensBase?: Prisma.PersonagemBaseUncheckedUpdateManyWithoutClasseNestedInput;
    personagensCampanha?: Prisma.PersonagemCampanhaUncheckedUpdateManyWithoutClasseNestedInput;
};
export type ClasseCountOutputType = {
    trilhas: number;
    personagensBase: number;
    personagensCampanha: number;
    habilidadesClasse: number;
};
export type ClasseCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trilhas?: boolean | ClasseCountOutputTypeCountTrilhasArgs;
    personagensBase?: boolean | ClasseCountOutputTypeCountPersonagensBaseArgs;
    personagensCampanha?: boolean | ClasseCountOutputTypeCountPersonagensCampanhaArgs;
    habilidadesClasse?: boolean | ClasseCountOutputTypeCountHabilidadesClasseArgs;
};
export type ClasseCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseCountOutputTypeSelect<ExtArgs> | null;
};
export type ClasseCountOutputTypeCountTrilhasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrilhaWhereInput;
};
export type ClasseCountOutputTypeCountPersonagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemBaseWhereInput;
};
export type ClasseCountOutputTypeCountPersonagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonagemCampanhaWhereInput;
};
export type ClasseCountOutputTypeCountHabilidadesClasseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.HabilidadeClasseWhereInput;
};
export type ClasseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
    trilhas?: boolean | Prisma.Classe$trilhasArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Classe$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Classe$personagensCampanhaArgs<ExtArgs>;
    habilidadesClasse?: boolean | Prisma.Classe$habilidadesClasseArgs<ExtArgs>;
    _count?: boolean | Prisma.ClasseCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classe"]>;
export type ClasseSelectScalar = {
    id?: boolean;
    nome?: boolean;
    descricao?: boolean;
};
export type ClasseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "descricao", ExtArgs["result"]["classe"]>;
export type ClasseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trilhas?: boolean | Prisma.Classe$trilhasArgs<ExtArgs>;
    personagensBase?: boolean | Prisma.Classe$personagensBaseArgs<ExtArgs>;
    personagensCampanha?: boolean | Prisma.Classe$personagensCampanhaArgs<ExtArgs>;
    habilidadesClasse?: boolean | Prisma.Classe$habilidadesClasseArgs<ExtArgs>;
    _count?: boolean | Prisma.ClasseCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $ClassePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Classe";
    objects: {
        trilhas: Prisma.$TrilhaPayload<ExtArgs>[];
        personagensBase: Prisma.$PersonagemBasePayload<ExtArgs>[];
        personagensCampanha: Prisma.$PersonagemCampanhaPayload<ExtArgs>[];
        habilidadesClasse: Prisma.$HabilidadeClassePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        descricao: string | null;
    }, ExtArgs["result"]["classe"]>;
    composites: {};
};
export type ClasseGetPayload<S extends boolean | null | undefined | ClasseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClassePayload, S>;
export type ClasseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClasseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClasseCountAggregateInputType | true;
};
export interface ClasseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Classe'];
        meta: {
            name: 'Classe';
        };
    };
    findUnique<T extends ClasseFindUniqueArgs>(args: Prisma.SelectSubset<T, ClasseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClasseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClasseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClasseFindFirstArgs>(args?: Prisma.SelectSubset<T, ClasseFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClasseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClasseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClasseFindManyArgs>(args?: Prisma.SelectSubset<T, ClasseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClasseCreateArgs>(args: Prisma.SelectSubset<T, ClasseCreateArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClasseCreateManyArgs>(args?: Prisma.SelectSubset<T, ClasseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends ClasseDeleteArgs>(args: Prisma.SelectSubset<T, ClasseDeleteArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClasseUpdateArgs>(args: Prisma.SelectSubset<T, ClasseUpdateArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClasseDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClasseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClasseUpdateManyArgs>(args: Prisma.SelectSubset<T, ClasseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends ClasseUpsertArgs>(args: Prisma.SelectSubset<T, ClasseUpsertArgs<ExtArgs>>): Prisma.Prisma__ClasseClient<runtime.Types.Result.GetResult<Prisma.$ClassePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClasseCountArgs>(args?: Prisma.Subset<T, ClasseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClasseCountAggregateOutputType> : number>;
    aggregate<T extends ClasseAggregateArgs>(args: Prisma.Subset<T, ClasseAggregateArgs>): Prisma.PrismaPromise<GetClasseAggregateType<T>>;
    groupBy<T extends ClasseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClasseGroupByArgs['orderBy'];
    } : {
        orderBy?: ClasseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClasseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClasseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClasseFieldRefs;
}
export interface Prisma__ClasseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    trilhas<T extends Prisma.Classe$trilhasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Classe$trilhasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrilhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensBase<T extends Prisma.Classe$personagensBaseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Classe$personagensBaseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemBasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personagensCampanha<T extends Prisma.Classe$personagensCampanhaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Classe$personagensCampanhaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    habilidadesClasse<T extends Prisma.Classe$habilidadesClasseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Classe$habilidadesClasseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$HabilidadeClassePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClasseFieldRefs {
    readonly id: Prisma.FieldRef<"Classe", 'Int'>;
    readonly nome: Prisma.FieldRef<"Classe", 'String'>;
    readonly descricao: Prisma.FieldRef<"Classe", 'String'>;
}
export type ClasseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where: Prisma.ClasseWhereUniqueInput;
};
export type ClasseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where: Prisma.ClasseWhereUniqueInput;
};
export type ClasseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where?: Prisma.ClasseWhereInput;
    orderBy?: Prisma.ClasseOrderByWithRelationInput | Prisma.ClasseOrderByWithRelationInput[];
    cursor?: Prisma.ClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClasseScalarFieldEnum | Prisma.ClasseScalarFieldEnum[];
};
export type ClasseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where?: Prisma.ClasseWhereInput;
    orderBy?: Prisma.ClasseOrderByWithRelationInput | Prisma.ClasseOrderByWithRelationInput[];
    cursor?: Prisma.ClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClasseScalarFieldEnum | Prisma.ClasseScalarFieldEnum[];
};
export type ClasseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where?: Prisma.ClasseWhereInput;
    orderBy?: Prisma.ClasseOrderByWithRelationInput | Prisma.ClasseOrderByWithRelationInput[];
    cursor?: Prisma.ClasseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClasseScalarFieldEnum | Prisma.ClasseScalarFieldEnum[];
};
export type ClasseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClasseCreateInput, Prisma.ClasseUncheckedCreateInput>;
};
export type ClasseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClasseCreateManyInput | Prisma.ClasseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClasseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClasseUpdateInput, Prisma.ClasseUncheckedUpdateInput>;
    where: Prisma.ClasseWhereUniqueInput;
};
export type ClasseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClasseUpdateManyMutationInput, Prisma.ClasseUncheckedUpdateManyInput>;
    where?: Prisma.ClasseWhereInput;
    limit?: number;
};
export type ClasseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where: Prisma.ClasseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClasseCreateInput, Prisma.ClasseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClasseUpdateInput, Prisma.ClasseUncheckedUpdateInput>;
};
export type ClasseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
    where: Prisma.ClasseWhereUniqueInput;
};
export type ClasseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClasseWhereInput;
    limit?: number;
};
export type Classe$trilhasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrilhaSelect<ExtArgs> | null;
    omit?: Prisma.TrilhaOmit<ExtArgs> | null;
    include?: Prisma.TrilhaInclude<ExtArgs> | null;
    where?: Prisma.TrilhaWhereInput;
    orderBy?: Prisma.TrilhaOrderByWithRelationInput | Prisma.TrilhaOrderByWithRelationInput[];
    cursor?: Prisma.TrilhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrilhaScalarFieldEnum | Prisma.TrilhaScalarFieldEnum[];
};
export type Classe$personagensBaseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Classe$personagensCampanhaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.PersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.PersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.PersonagemCampanhaWhereInput;
    orderBy?: Prisma.PersonagemCampanhaOrderByWithRelationInput | Prisma.PersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.PersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonagemCampanhaScalarFieldEnum | Prisma.PersonagemCampanhaScalarFieldEnum[];
};
export type Classe$habilidadesClasseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClasseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClasseSelect<ExtArgs> | null;
    omit?: Prisma.ClasseOmit<ExtArgs> | null;
    include?: Prisma.ClasseInclude<ExtArgs> | null;
};
export {};
