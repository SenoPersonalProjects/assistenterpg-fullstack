import { ItemInventarioComDados, StatsEquipados, ResultadoEspacos, PreviewAdicionarItemResponse, ValidacaoGrauXama, ValidacaoVestir } from './inventario.types';
import { CategoriaEquipamento, GrauFeiticeiro } from '@prisma/client';
export declare class InventarioEngine {
    calcularCategoriaFinal(categoriaOriginal: CategoriaEquipamento | string, quantidadeModificacoes: number): CategoriaEquipamento;
    calcularEspacosItem(item: ItemInventarioComDados): number;
    calcularEspacoUnitario(item: ItemInventarioComDados): number;
    calcularEspacosOcupados(itens: ItemInventarioComDados[]): number;
    calcularEspacosExtraDeItens(itens: ItemInventarioComDados[]): number;
    calcularResultadoEspacos(itens: ItemInventarioComDados[], espacosBase: number, espacosExtra: number): ResultadoEspacos;
    calcularStatsEquipados(itens: ItemInventarioComDados[]): StatsEquipados;
    validarSistemaVestir(itens: ItemInventarioComDados[]): ValidacaoVestir;
    validarAdicaoItem(itemEspacos: number, espacosDisponiveis: number): {
        valido: boolean;
        erro?: string;
    };
    validarAplicacaoModificacao(item: ItemInventarioComDados, modificacao: {
        id: number;
        incrementoEspacos: number;
    }, espacosDisponiveisAtuais: number): {
        valido: boolean;
        erro?: string;
    };
    calcularGrauXama(prestigioBase: number): {
        grau: GrauFeiticeiro;
        prestigioMinimo: number;
    };
    validarLimitesGrauXama(prestigioBase: number, limitesPorCategoria: Record<string, number>, itensPorCategoria: Record<string, number>): ValidacaoGrauXama;
    previewAdicionarItem(itensAtuais: ItemInventarioComDados[], novoItem: {
        equipamento: any;
        quantidade: number;
    }, personagem: {
        espacosInventarioBase: number;
        espacosInventarioExtra: number;
        prestigioBase: number;
    }, limitesGrauXama: Record<string, number>): PreviewAdicionarItemResponse;
}
