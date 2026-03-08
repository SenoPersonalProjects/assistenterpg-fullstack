// src/modificacoes/modificacoes.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModificacoesService } from './modificacoes.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('modificacoes')
export class ModificacoesController {
  constructor(private readonly modificacoesService: ModificacoesService) {}

  // ========================================
  // ✅ ROTAS PÚBLICAS (apenas autenticadas)
  // ========================================

  /**
   * GET /modificacoes
   * Lista modificações com filtros
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listar(@Query() filtros: FiltrarModificacoesDto) {
    return this.modificacoesService.listar(filtros);
  }

  /**
   * GET /modificacoes/:id
   * Busca modificação por ID com detalhes
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.modificacoesService.buscarPorId(id);
  }

  /**
   * GET /modificacoes/equipamento/:equipamentoId/compativeis
   * Busca modificações compatíveis com um equipamento específico
   */
  @Get('equipamento/:equipamentoId/compativeis')
  @UseGuards(AuthGuard('jwt'))
  async buscarCompatíveis(
    @Param('equipamentoId', ParseIntPipe) equipamentoId: number,
  ) {
    return this.modificacoesService.buscarCompatíveisComEquipamento(
      equipamentoId,
    );
  }

  // ========================================
  // ✅ ROTAS ADMIN (requerem AdminGuard)
  // ========================================
  /**
   * CREATE - Criar nova modificação (ADMIN)
   */
  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(@Body() createDto: CreateModificacaoDto) {
    return this.modificacoesService.create(createDto);
  }

  /**
   * UPDATE - Atualizar modificação (ADMIN)
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateModificacaoDto,
  ) {
    return this.modificacoesService.update(id, updateDto);
  }

  /**
   * DELETE - Remover modificação (ADMIN)
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modificacoesService.remove(id);
  }
}
