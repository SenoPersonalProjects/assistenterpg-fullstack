// src/suplementos/suplementos.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SuplementosService } from './suplementos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateSuplementoDto } from './dto/create-suplemento.dto';
import { UpdateSuplementoDto } from './dto/update-suplemento.dto';
import { FiltrarSuplementosDto } from './dto/filtrar-suplementos.dto';

@Controller('suplementos')
export class SuplementosController {
  constructor(private readonly suplementosService: SuplementosService) {}

  // ==========================================
  // 📚 ENDPOINTS PÚBLICOS/USUÁRIO
  // ==========================================

  /**
   * GET /suplementos
   * Listar todos os suplementos (com filtros opcionais)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: { user: { id: number } },
    @Query() filtros: FiltrarSuplementosDto,
  ) {
    return this.suplementosService.findAll(filtros, req.user.id);
  }

  /**
   * GET /suplementos/:id
   * Buscar suplemento por ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.suplementosService.findOne(id, req.user.id);
  }

  /**
   * GET /suplementos/codigo/:codigo
   * Buscar suplemento por código
   */
  @Get('codigo/:codigo')
  @UseGuards(JwtAuthGuard)
  async findByCodigo(
    @Request() req: { user: { id: number } },
    @Param('codigo') codigo: string,
  ) {
    return this.suplementosService.findByCodigo(codigo, req.user.id);
  }

  // ==========================================
  // 👤 GERENCIAMENTO DE SUPLEMENTOS DO USUÁRIO
  // ==========================================

  /**
   * GET /suplementos/me/ativos
   * Listar suplementos ativos do usuário logado
   */
  @Get('me/ativos')
  @UseGuards(JwtAuthGuard)
  async findMeusSuplemetos(@Request() req: { user: { id: number } }) {
    return this.suplementosService.findSuplementosAtivos(req.user.id);
  }

  /**
   * POST /suplementos/:id/ativar
   * Ativar suplemento para o usuário logado
   */
  @Post(':id/ativar')
  @UseGuards(JwtAuthGuard)
  async ativarSuplemento(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.suplementosService.ativarSuplemento(req.user.id, id);
    return { message: 'Suplemento ativado com sucesso' };
  }

  /**
   * DELETE /suplementos/:id/desativar
   * Desativar suplemento para o usuário logado
   */
  @Delete(':id/desativar')
  @UseGuards(JwtAuthGuard)
  async desativarSuplemento(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.suplementosService.desativarSuplemento(req.user.id, id);
    return { message: 'Suplemento desativado com sucesso' };
  }

  // ==========================================
  // 🔒 ENDPOINTS ADMIN
  // ==========================================

  /**
   * POST /suplementos
   * Criar novo suplemento (ADMIN)
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() dto: CreateSuplementoDto) {
    return this.suplementosService.create(dto);
  }

  /**
   * PATCH /suplementos/:id
   * Atualizar suplemento (ADMIN)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSuplementoDto,
  ) {
    return this.suplementosService.update(id, dto);
  }

  /**
   * DELETE /suplementos/:id
   * Deletar suplemento (ADMIN)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.suplementosService.remove(id);
    return { message: 'Suplemento deletado com sucesso' };
  }
}
