import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ItemModel = runtime.Types.Result.DefaultSelection<Prisma.$ItemPayload>;
export type AggregateItem = {
    _count: ItemCountAggregateOutputType | null;
    _avg: ItemAvgAggregateOutputType | null;
    _sum: ItemSumAggregateOutputType | null;
    _min: ItemMinAggregateOutputType | null;
    _max: ItemMaxAggregateOutputType | null;
};
export type ItemAvgAggregateOutputType = {
    id: number | null;
    grauItem: number | null;
    pesoCarga: number | null;
};
export type ItemSumAggregateOutputType = {
    id: number | null;
    grauItem: number | null;
    pesoCarga: number | null;
};
export type ItemMinAggregateOutputType = {
    id: number | null;
    nome: string | null;
    tipoItem: string | null;
    descricao: string | null;
    grauItem: number | null;
    pesoCarga: number | null;
};
export type ItemMaxAggregateOutputType = {
    id: number | null;
    nome: string | null;
    tipoItem: string | null;
    descricao: string | null;
    grauItem: number | null;
    pesoCarga: number | null;
};
export type ItemCountAggregateOutputType = {
    id: number;
    nome: number;
    tipoItem: number;
    descricao: number;
    grauItem: number;
    pesoCarga: number;
    _all: number;
};
export type ItemAvgAggregateInputType = {
    id?: true;
    grauItem?: true;
    pesoCarga?: true;
};
export type ItemSumAggregateInputType = {
    id?: true;
    grauItem?: true;
    pesoCarga?: true;
};
export type ItemMinAggregateInputType = {
    id?: true;
    nome?: true;
    tipoItem?: true;
    descricao?: true;
    grauItem?: true;
    pesoCarga?: true;
};
export type ItemMaxAggregateInputType = {
    id?: true;
    nome?: true;
    tipoItem?: true;
    descricao?: true;
    grauItem?: true;
    pesoCarga?: true;
};
export type ItemCountAggregateInputType = {
    id?: true;
    nome?: true;
    tipoItem?: true;
    descricao?: true;
    grauItem?: true;
    pesoCarga?: true;
    _all?: true;
};
export type ItemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithRelationInput | Prisma.ItemOrderByWithRelationInput[];
    cursor?: Prisma.ItemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ItemCountAggregateInputType;
    _avg?: ItemAvgAggregateInputType;
    _sum?: ItemSumAggregateInputType;
    _min?: ItemMinAggregateInputType;
    _max?: ItemMaxAggregateInputType;
};
export type GetItemAggregateType<T extends ItemAggregateArgs> = {
    [P in keyof T & keyof AggregateItem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateItem[P]> : Prisma.GetScalarType<T[P], AggregateItem[P]>;
};
export type ItemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithAggregationInput | Prisma.ItemOrderByWithAggregationInput[];
    by: Prisma.ItemScalarFieldEnum[] | Prisma.ItemScalarFieldEnum;
    having?: Prisma.ItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ItemCountAggregateInputType | true;
    _avg?: ItemAvgAggregateInputType;
    _sum?: ItemSumAggregateInputType;
    _min?: ItemMinAggregateInputType;
    _max?: ItemMaxAggregateInputType;
};
export type ItemGroupByOutputType = {
    id: number;
    nome: string;
    tipoItem: string;
    descricao: string | null;
    grauItem: number | null;
    pesoCarga: number | null;
    _count: ItemCountAggregateOutputType | null;
    _avg: ItemAvgAggregateOutputType | null;
    _sum: ItemSumAggregateOutputType | null;
    _min: ItemMinAggregateOutputType | null;
    _max: ItemMaxAggregateOutputType | null;
};
type GetItemGroupByPayload<T extends ItemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ItemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ItemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ItemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ItemGroupByOutputType[P]>;
}>>;
export type ItemWhereInput = {
    AND?: Prisma.ItemWhereInput | Prisma.ItemWhereInput[];
    OR?: Prisma.ItemWhereInput[];
    NOT?: Prisma.ItemWhereInput | Prisma.ItemWhereInput[];
    id?: Prisma.IntFilter<"Item"> | number;
    nome?: Prisma.StringFilter<"Item"> | string;
    tipoItem?: Prisma.StringFilter<"Item"> | string;
    descricao?: Prisma.StringNullableFilter<"Item"> | string | null;
    grauItem?: Prisma.IntNullableFilter<"Item"> | number | null;
    pesoCarga?: Prisma.IntNullableFilter<"Item"> | number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaListRelationFilter;
};
export type ItemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    tipoItem?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    grauItem?: Prisma.SortOrderInput | Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrderInput | Prisma.SortOrder;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaOrderByRelationAggregateInput;
    _relevance?: Prisma.ItemOrderByRelevanceInput;
};
export type ItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ItemWhereInput | Prisma.ItemWhereInput[];
    OR?: Prisma.ItemWhereInput[];
    NOT?: Prisma.ItemWhereInput | Prisma.ItemWhereInput[];
    nome?: Prisma.StringFilter<"Item"> | string;
    tipoItem?: Prisma.StringFilter<"Item"> | string;
    descricao?: Prisma.StringNullableFilter<"Item"> | string | null;
    grauItem?: Prisma.IntNullableFilter<"Item"> | number | null;
    pesoCarga?: Prisma.IntNullableFilter<"Item"> | number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaListRelationFilter;
}, "id">;
export type ItemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    tipoItem?: Prisma.SortOrder;
    descricao?: Prisma.SortOrderInput | Prisma.SortOrder;
    grauItem?: Prisma.SortOrderInput | Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ItemCountOrderByAggregateInput;
    _avg?: Prisma.ItemAvgOrderByAggregateInput;
    _max?: Prisma.ItemMaxOrderByAggregateInput;
    _min?: Prisma.ItemMinOrderByAggregateInput;
    _sum?: Prisma.ItemSumOrderByAggregateInput;
};
export type ItemScalarWhereWithAggregatesInput = {
    AND?: Prisma.ItemScalarWhereWithAggregatesInput | Prisma.ItemScalarWhereWithAggregatesInput[];
    OR?: Prisma.ItemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ItemScalarWhereWithAggregatesInput | Prisma.ItemScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Item"> | number;
    nome?: Prisma.StringWithAggregatesFilter<"Item"> | string;
    tipoItem?: Prisma.StringWithAggregatesFilter<"Item"> | string;
    descricao?: Prisma.StringNullableWithAggregatesFilter<"Item"> | string | null;
    grauItem?: Prisma.IntNullableWithAggregatesFilter<"Item"> | number | null;
    pesoCarga?: Prisma.IntNullableWithAggregatesFilter<"Item"> | number | null;
};
export type ItemCreateInput = {
    nome: string;
    tipoItem: string;
    descricao?: string | null;
    grauItem?: number | null;
    pesoCarga?: number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaCreateNestedManyWithoutItemInput;
};
export type ItemUncheckedCreateInput = {
    id?: number;
    nome: string;
    tipoItem: string;
    descricao?: string | null;
    grauItem?: number | null;
    pesoCarga?: number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaUncheckedCreateNestedManyWithoutItemInput;
};
export type ItemUpdateInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaUpdateManyWithoutItemNestedInput;
};
export type ItemUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    itensPersonagem?: Prisma.ItemPersonagemCampanhaUncheckedUpdateManyWithoutItemNestedInput;
};
export type ItemCreateManyInput = {
    id?: number;
    nome: string;
    tipoItem: string;
    descricao?: string | null;
    grauItem?: number | null;
    pesoCarga?: number | null;
};
export type ItemUpdateManyMutationInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type ItemUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type ItemOrderByRelevanceInput = {
    fields: Prisma.ItemOrderByRelevanceFieldEnum | Prisma.ItemOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type ItemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    tipoItem?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grauItem?: Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrder;
};
export type ItemAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    grauItem?: Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrder;
};
export type ItemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    tipoItem?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grauItem?: Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrder;
};
export type ItemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    tipoItem?: Prisma.SortOrder;
    descricao?: Prisma.SortOrder;
    grauItem?: Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrder;
};
export type ItemSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    grauItem?: Prisma.SortOrder;
    pesoCarga?: Prisma.SortOrder;
};
export type ItemScalarRelationFilter = {
    is?: Prisma.ItemWhereInput;
    isNot?: Prisma.ItemWhereInput;
};
export type ItemCreateNestedOneWithoutItensPersonagemInput = {
    create?: Prisma.XOR<Prisma.ItemCreateWithoutItensPersonagemInput, Prisma.ItemUncheckedCreateWithoutItensPersonagemInput>;
    connectOrCreate?: Prisma.ItemCreateOrConnectWithoutItensPersonagemInput;
    connect?: Prisma.ItemWhereUniqueInput;
};
export type ItemUpdateOneRequiredWithoutItensPersonagemNestedInput = {
    create?: Prisma.XOR<Prisma.ItemCreateWithoutItensPersonagemInput, Prisma.ItemUncheckedCreateWithoutItensPersonagemInput>;
    connectOrCreate?: Prisma.ItemCreateOrConnectWithoutItensPersonagemInput;
    upsert?: Prisma.ItemUpsertWithoutItensPersonagemInput;
    connect?: Prisma.ItemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ItemUpdateToOneWithWhereWithoutItensPersonagemInput, Prisma.ItemUpdateWithoutItensPersonagemInput>, Prisma.ItemUncheckedUpdateWithoutItensPersonagemInput>;
};
export type ItemCreateWithoutItensPersonagemInput = {
    nome: string;
    tipoItem: string;
    descricao?: string | null;
    grauItem?: number | null;
    pesoCarga?: number | null;
};
export type ItemUncheckedCreateWithoutItensPersonagemInput = {
    id?: number;
    nome: string;
    tipoItem: string;
    descricao?: string | null;
    grauItem?: number | null;
    pesoCarga?: number | null;
};
export type ItemCreateOrConnectWithoutItensPersonagemInput = {
    where: Prisma.ItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.ItemCreateWithoutItensPersonagemInput, Prisma.ItemUncheckedCreateWithoutItensPersonagemInput>;
};
export type ItemUpsertWithoutItensPersonagemInput = {
    update: Prisma.XOR<Prisma.ItemUpdateWithoutItensPersonagemInput, Prisma.ItemUncheckedUpdateWithoutItensPersonagemInput>;
    create: Prisma.XOR<Prisma.ItemCreateWithoutItensPersonagemInput, Prisma.ItemUncheckedCreateWithoutItensPersonagemInput>;
    where?: Prisma.ItemWhereInput;
};
export type ItemUpdateToOneWithWhereWithoutItensPersonagemInput = {
    where?: Prisma.ItemWhereInput;
    data: Prisma.XOR<Prisma.ItemUpdateWithoutItensPersonagemInput, Prisma.ItemUncheckedUpdateWithoutItensPersonagemInput>;
};
export type ItemUpdateWithoutItensPersonagemInput = {
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type ItemUncheckedUpdateWithoutItensPersonagemInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    tipoItem?: Prisma.StringFieldUpdateOperationsInput | string;
    descricao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    grauItem?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    pesoCarga?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type ItemCountOutputType = {
    itensPersonagem: number;
};
export type ItemCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    itensPersonagem?: boolean | ItemCountOutputTypeCountItensPersonagemArgs;
};
export type ItemCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemCountOutputTypeSelect<ExtArgs> | null;
};
export type ItemCountOutputTypeCountItensPersonagemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
};
export type ItemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    tipoItem?: boolean;
    descricao?: boolean;
    grauItem?: boolean;
    pesoCarga?: boolean;
    itensPersonagem?: boolean | Prisma.Item$itensPersonagemArgs<ExtArgs>;
    _count?: boolean | Prisma.ItemCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["item"]>;
export type ItemSelectScalar = {
    id?: boolean;
    nome?: boolean;
    tipoItem?: boolean;
    descricao?: boolean;
    grauItem?: boolean;
    pesoCarga?: boolean;
};
export type ItemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "tipoItem" | "descricao" | "grauItem" | "pesoCarga", ExtArgs["result"]["item"]>;
export type ItemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    itensPersonagem?: boolean | Prisma.Item$itensPersonagemArgs<ExtArgs>;
    _count?: boolean | Prisma.ItemCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $ItemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Item";
    objects: {
        itensPersonagem: Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nome: string;
        tipoItem: string;
        descricao: string | null;
        grauItem: number | null;
        pesoCarga: number | null;
    }, ExtArgs["result"]["item"]>;
    composites: {};
};
export type ItemGetPayload<S extends boolean | null | undefined | ItemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ItemPayload, S>;
export type ItemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ItemCountAggregateInputType | true;
};
export interface ItemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Item'];
        meta: {
            name: 'Item';
        };
    };
    findUnique<T extends ItemFindUniqueArgs>(args: Prisma.SelectSubset<T, ItemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ItemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ItemFindFirstArgs>(args?: Prisma.SelectSubset<T, ItemFindFirstArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ItemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ItemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ItemFindManyArgs>(args?: Prisma.SelectSubset<T, ItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ItemCreateArgs>(args: Prisma.SelectSubset<T, ItemCreateArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ItemCreateManyArgs>(args?: Prisma.SelectSubset<T, ItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends ItemDeleteArgs>(args: Prisma.SelectSubset<T, ItemDeleteArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ItemUpdateArgs>(args: Prisma.SelectSubset<T, ItemUpdateArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ItemDeleteManyArgs>(args?: Prisma.SelectSubset<T, ItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ItemUpdateManyArgs>(args: Prisma.SelectSubset<T, ItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends ItemUpsertArgs>(args: Prisma.SelectSubset<T, ItemUpsertArgs<ExtArgs>>): Prisma.Prisma__ItemClient<runtime.Types.Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ItemCountArgs>(args?: Prisma.Subset<T, ItemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ItemCountAggregateOutputType> : number>;
    aggregate<T extends ItemAggregateArgs>(args: Prisma.Subset<T, ItemAggregateArgs>): Prisma.PrismaPromise<GetItemAggregateType<T>>;
    groupBy<T extends ItemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ItemGroupByArgs['orderBy'];
    } : {
        orderBy?: ItemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ItemFieldRefs;
}
export interface Prisma__ItemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    itensPersonagem<T extends Prisma.Item$itensPersonagemArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Item$itensPersonagemArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ItemPersonagemCampanhaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ItemFieldRefs {
    readonly id: Prisma.FieldRef<"Item", 'Int'>;
    readonly nome: Prisma.FieldRef<"Item", 'String'>;
    readonly tipoItem: Prisma.FieldRef<"Item", 'String'>;
    readonly descricao: Prisma.FieldRef<"Item", 'String'>;
    readonly grauItem: Prisma.FieldRef<"Item", 'Int'>;
    readonly pesoCarga: Prisma.FieldRef<"Item", 'Int'>;
}
export type ItemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where: Prisma.ItemWhereUniqueInput;
};
export type ItemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where: Prisma.ItemWhereUniqueInput;
};
export type ItemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithRelationInput | Prisma.ItemOrderByWithRelationInput[];
    cursor?: Prisma.ItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemScalarFieldEnum | Prisma.ItemScalarFieldEnum[];
};
export type ItemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithRelationInput | Prisma.ItemOrderByWithRelationInput[];
    cursor?: Prisma.ItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemScalarFieldEnum | Prisma.ItemScalarFieldEnum[];
};
export type ItemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithRelationInput | Prisma.ItemOrderByWithRelationInput[];
    cursor?: Prisma.ItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemScalarFieldEnum | Prisma.ItemScalarFieldEnum[];
};
export type ItemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ItemCreateInput, Prisma.ItemUncheckedCreateInput>;
};
export type ItemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ItemCreateManyInput | Prisma.ItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ItemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ItemUpdateInput, Prisma.ItemUncheckedUpdateInput>;
    where: Prisma.ItemWhereUniqueInput;
};
export type ItemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ItemUpdateManyMutationInput, Prisma.ItemUncheckedUpdateManyInput>;
    where?: Prisma.ItemWhereInput;
    limit?: number;
};
export type ItemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where: Prisma.ItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.ItemCreateInput, Prisma.ItemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ItemUpdateInput, Prisma.ItemUncheckedUpdateInput>;
};
export type ItemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
    where: Prisma.ItemWhereUniqueInput;
};
export type ItemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ItemWhereInput;
    limit?: number;
};
export type Item$itensPersonagemArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemPersonagemCampanhaSelect<ExtArgs> | null;
    omit?: Prisma.ItemPersonagemCampanhaOmit<ExtArgs> | null;
    include?: Prisma.ItemPersonagemCampanhaInclude<ExtArgs> | null;
    where?: Prisma.ItemPersonagemCampanhaWhereInput;
    orderBy?: Prisma.ItemPersonagemCampanhaOrderByWithRelationInput | Prisma.ItemPersonagemCampanhaOrderByWithRelationInput[];
    cursor?: Prisma.ItemPersonagemCampanhaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ItemPersonagemCampanhaScalarFieldEnum | Prisma.ItemPersonagemCampanhaScalarFieldEnum[];
};
export type ItemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ItemSelect<ExtArgs> | null;
    omit?: Prisma.ItemOmit<ExtArgs> | null;
    include?: Prisma.ItemInclude<ExtArgs> | null;
};
export {};
