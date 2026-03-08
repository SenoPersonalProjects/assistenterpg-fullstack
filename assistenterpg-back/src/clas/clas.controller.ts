// src/clas/clas.controller.ts - MELHORADO

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClasService } from './clas.service';
import { CreateClaDto } from './dto/create-cla.dto';
import { UpdateClaDto } from './dto/update-cla.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('clas')
export class ClasController {
  constructor(private readonly claService: ClasService) {}

  /**
   * CREATE - Criar novo clã (ADMIN)
   */
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateClaDto) {
    return this.claService.create(dto);
  }

  /**
   * FIND ALL - Listar todos os clãs
   */
  @Get()
  findAll() {
    return this.claService.findAll();
  }

  /**
   * FIND ONE - Buscar clã por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.claService.findOne(id);
  }

  /**
   * UPDATE - Atualizar clã (ADMIN)
   */
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClaDto) {
    return this.claService.update(id, dto);
  }

  /**
   * DELETE - Remover clã (ADMIN)
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.claService.remove(id);
  }
}
