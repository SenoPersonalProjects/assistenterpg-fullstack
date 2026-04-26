// src/equipamentos/equipamentos.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { FiltrarEquipamentosDto } from './dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  /**
   * GET /equipamentos
   * Lista equipamentos com filtros
   * Filtros suportados: tipo, categoria, alcance, proficiencia, complexidade
   */
  @Get()
  async listar(@Query() filtros: FiltrarEquipamentosDto) {
    return this.equipamentosService.listar(filtros);
  }

  @Get('meus-homebrew')
  @UseGuards(JwtAuthGuard)
  async listarMeusHomebrew(@Request() req: { user: { id: number } }) {
    return this.equipamentosService.listarMeusHomebrew(req.user.id);
  }

  /**
   * GET /equipamentos/:id
   * Busca equipamento por ID com todas as relações carregadas
   */
  @Get(':id')
  async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.equipamentosService.buscarPorId(id);
  }

  /**
   * GET /equipamentos/codigo/:codigo
   * Busca equipamento por código único
   */
  @Get('codigo/:codigo')
  async buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.equipamentosService.buscarPorCodigo(codigo);
  }

  /**
   * POST /equipamentos
   * Cria um novo equipamento
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() data: CriarEquipamentoDto) {
    return this.equipamentosService.criar(data);
  }

  /**
   * PUT /equipamentos/:id
   * Atualiza um equipamento existente
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AtualizarEquipamentoDto,
  ) {
    return this.equipamentosService.atualizar(id, data);
  }

  /**
   * DELETE /equipamentos/:id
   * Deleta um equipamento (se não estiver em uso)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number) {
    await this.equipamentosService.deletar(id);
  }
}
