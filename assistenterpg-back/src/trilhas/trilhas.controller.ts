// src/trilhas/trilhas.controller.ts - EXPANDIDO

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
import { TrilhasService } from './trilhas.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { CreateCaminhoDto } from './dto/create-caminho.dto';
import { UpdateCaminhoDto } from './dto/update-caminho.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  // ========================================
  // ✅ CRUD DE TRILHAS
  // ========================================

  // CREATE - Criar nova trilha
  @Post()
  create(@Body() createDto: CreateTrilhaDto) {
    return this.trilhasService.create(createDto);
  }

  // FIND ALL - Listar trilhas (com filtro opcional por classe)
  @Get()
  findAll(@Query('classeId', new ParseIntPipe({ optional: true })) classeId?: number) {
    return this.trilhasService.findAll(classeId);
  }

  // FIND ONE - Buscar trilha por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.findOne(id);
  }

  // UPDATE - Atualizar trilha
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTrilhaDto) {
    return this.trilhasService.update(id, updateDto);
  }

  // DELETE - Remover trilha
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.remove(id);
  }

  // ========================================
  // ✅ MÉTODOS EXISTENTES (MANTIDOS)
  // ========================================

  @Get(':id/caminhos')
  findCaminhos(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.findCaminhos(id);
  }

  @Get(':id/habilidades')
  findHabilidades(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.findHabilidades(id);
  }

  // ========================================
  // ✅ CRUD DE CAMINHOS
  // ========================================

  // CREATE - Criar novo caminho
  @Post('caminhos')
  createCaminho(@Body() createDto: CreateCaminhoDto) {
    return this.trilhasService.createCaminho(createDto);
  }

  // UPDATE - Atualizar caminho
  @Patch('caminhos/:id')
  updateCaminho(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCaminhoDto,
  ) {
    return this.trilhasService.updateCaminho(id, updateDto);
  }

  // DELETE - Remover caminho
  @Delete('caminhos/:id')
  removeCaminho(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.removeCaminho(id);
  }
}
