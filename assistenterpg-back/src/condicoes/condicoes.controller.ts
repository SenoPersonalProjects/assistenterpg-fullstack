// src/condicoes/condicoes.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CondicoesService } from './condicoes.service';
import { CreateCondicaoDto } from './dto/create-condicao.dto';
import { UpdateCondicaoDto } from './dto/update-condicao.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('condicoes')
export class CondicoesController {
  constructor(private readonly condicoesService: CondicoesService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createCondicaoDto: CreateCondicaoDto) {
    return this.condicoesService.create(createCondicaoDto);
  }

  @Get()
  findAll() {
    return this.condicoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.condicoesService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCondicaoDto: UpdateCondicaoDto,
  ) {
    return this.condicoesService.update(id, updateCondicaoDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.condicoesService.remove(id);
  }
}
