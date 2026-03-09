import { InventarioService } from './inventario.service';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { AplicarModificacaoDto } from './dto/aplicar-modificacao.dto';
import { RemoverModificacaoDto } from './dto/remover-modificacao.dto';
import { PreviewItemDto } from './dto/preview-item.dto';
import { PreviewItensInventarioDto } from './dto/preview-itens-inventario.dto';
export declare class InventarioController {
    private readonly inventarioService;
    constructor(inventarioService: InventarioService);
    buscarInventario(req: {
        user: {
            id: number;
        };
    }, personagemBaseId: number): Promise<import("./engine/inventario.types").ResumoInventarioCompleto>;
    previewAdicionarItem(req: {
        user: {
            id: number;
        };
    }, dto: PreviewItemDto): Promise<import("./engine/inventario.types").PreviewAdicionarItemResponse>;
    previewItensInventario(dto: PreviewItensInventarioDto): Promise<unknown>;
    adicionarItem(req: {
        user: {
            id: number;
        };
    }, dto: AdicionarItemDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    atualizarItem(req: {
        user: {
            id: number;
        };
    }, itemId: number, dto: AtualizarItemDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    removerItem(req: {
        user: {
            id: number;
        };
    }, itemId: number): Promise<{
        sucesso: boolean;
        mensagem: string;
    }>;
    aplicarModificacao(req: {
        user: {
            id: number;
        };
    }, dto: AplicarModificacaoDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
    removerModificacao(req: {
        user: {
            id: number;
        };
    }, dto: RemoverModificacaoDto): Promise<import("./dto/inventario-completo.dto").ItemInventarioDto>;
}
