import { CategoriaEquipamento, TipoUsoEquipamento, TipoEquipamento } from '@prisma/client';
export declare class EquipamentoBaseDto {
    tipo: TipoEquipamento;
    categoria: CategoriaEquipamento;
    espacos: number;
    tipoUso?: TipoUsoEquipamento;
}
