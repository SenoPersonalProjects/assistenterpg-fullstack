// src/origens/origens.controller.ts - MELHORADO

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
import { OrigensService } from './origens.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('origens')
export class OrigensController {
  constructor(private readonly origensService: OrigensService) {}

  /**
   * CREATE - Criar nova origem (ADMIN)
   */
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateOrigemDto) {
    return this.origensService.create(dto);
  }

  /**
   * FIND ALL - Listar todas as origens
   */
  @Get()
  findAll() {
    return this.origensService.findAll();
  }

  /**
   * FIND ONE - Buscar origem por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.origensService.findOne(id);
  }

  /**
   * UPDATE - Atualizar origem (ADMIN)
   */
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrigemDto) {
    return this.origensService.update(id, dto);
  }

  /**
   * DELETE - Remover origem (ADMIN)
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.origensService.remove(id);
  }
}
