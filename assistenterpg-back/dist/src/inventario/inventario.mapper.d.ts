import { ItemInventarioDto, InventarioCompletoDto, StatsEquipadosDto } from './dto/inventario-completo.dto';
import { ItemInventarioComDados, StatsEquipados } from './engine/inventario.types';
import { InventarioEngine } from './engine/inventario.engine';
export declare class InventarioMapper {
    private readonly engine;
    constructor(engine: InventarioEngine);
    mapItem(item: ItemInventarioComDados): ItemInventarioDto;
    mapStatsEquipados(stats: StatsEquipados): StatsEquipadosDto;
    mapInventarioCompleto(personagemBaseId: number, itens: ItemInventarioComDados[], espacosBase: number, espacosExtra: number): InventarioCompletoDto;
}
