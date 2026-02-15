import { CategoriaEquipamento, TipoUsoEquipamento } from '@prisma/client';
export declare class EquipamentoBaseDto {
    categoria: CategoriaEquipamento;
    espacos: number;
    tipoUso?: TipoUsoEquipamento;
}
