// src/inventario/inventario.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ ATUALIZADO
import { InventarioService } from './inventario.service';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { AplicarModificacaoDto } from './dto/aplicar-modificacao.dto';
import { RemoverModificacaoDto } from './dto/remover-modificacao.dto';
import { PreviewItemDto } from './dto/preview-item.dto';
import { PreviewItensInventarioDto } from './dto/preview-itens-inventario.dto';

@UseGuards(JwtAuthGuard) // ✅ ATUALIZADO
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // ==================== CONSULTAS ====================

  /**
   * GET /inventario/personagem/:personagemBaseId
   * Busca inventário completo do personagem
   */
  @Get('personagem/:personagemBaseId')
  async buscarInventario(
    @Request() req: { user: { id: number } },
    @Param('personagemBaseId', ParseIntPipe) personagemBaseId: number,
  ) {
    return this.inventarioService.buscarInventario(
      req.user.id,
      personagemBaseId,
    );
  }

  /**
   * POST /inventario/preview-adicionar
   * Preview de adicionar item (não salva)
   */
  @Post('preview-adicionar')
  async previewAdicionarItem(
    @Request() req: { user: { id: number } },
    @Body() dto: PreviewItemDto,
  ) {
    return this.inventarioService.previewAdicionarItem(req.user.id, dto);
  }

  /**
   * POST /inventario/preview
   * Preview de múltiplos itens (wizard)
   */
  @Post('preview')
  async previewItensInventario(
    @Body() dto: PreviewItensInventarioDto,
  ): Promise<unknown> {
    return this.inventarioService.previewItensInventario(
      dto,
    ) as Promise<unknown>;
  }

  // ==================== CRUD DE ITENS ====================

  @Post('adicionar')
  async adicionarItem(
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarItemDto,
  ) {
    return this.inventarioService.adicionarItem(req.user.id, dto);
  }

  @Patch('item/:itemId')
  async atualizarItem(
    @Request() req: { user: { id: number } },
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: AtualizarItemDto,
  ) {
    return this.inventarioService.atualizarItem(req.user.id, itemId, dto);
  }

  @Delete('item/:itemId')
  async removerItem(
    @Request() req: { user: { id: number } },
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.inventarioService.removerItem(req.user.id, itemId);
  }

  // ==================== MODIFICAÇÕES ====================

  @Post('aplicar-modificacao')
  async aplicarModificacao(
    @Request() req: { user: { id: number } },
    @Body() dto: AplicarModificacaoDto,
  ) {
    // ✅ CORRIGIDO: Extrair itemId do DTO e passar como segundo parâmetro
    return this.inventarioService.aplicarModificacao(
      req.user.id,
      dto.itemId, // ✅ NOVO: Segundo parâmetro
      dto, // ✅ Terceiro parâmetro
    );
  }

  @Post('remover-modificacao')
  async removerModificacao(
    @Request() req: { user: { id: number } },
    @Body() dto: RemoverModificacaoDto,
  ) {
    // ✅ CORRIGIDO: Extrair itemId do DTO e passar como segundo parâmetro
    return this.inventarioService.removerModificacao(
      req.user.id,
      dto.itemId, // ✅ NOVO: Segundo parâmetro
      dto, // ✅ Terceiro parâmetro
    );
  }
}
