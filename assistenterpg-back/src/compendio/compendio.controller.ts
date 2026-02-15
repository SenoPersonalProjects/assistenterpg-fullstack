// src/compendio/compendio.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CompendioService } from './compendio.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ Descomentar quando tiver auth

@Controller('compendio')
export class CompendioController {
  constructor(private readonly compendioService: CompendioService) {}

  // ==================== CATEGORIAS ====================

  @Get('categorias')
  async listarCategorias(
    @Query('todas') todas?: string,
    @Query() paginacao?: PaginationQueryDto,
  ) {
    const apenasAtivas = todas !== 'true';
    return this.compendioService.listarCategorias(
      apenasAtivas,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('categorias/codigo/:codigo')
  async buscarCategoriaPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarCategoriaPorCodigo(codigo);
  }

  @Post('categorias')
  // @UseGuards(JwtAuthGuard) // ✅ Descomentar para proteger rota
  async criarCategoria(@Body() dto: CreateCategoriaDto) {
    return this.compendioService.criarCategoria(dto);
  }

  @Put('categorias/:id')
  // @UseGuards(JwtAuthGuard)
  async atualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.compendioService.atualizarCategoria(id, dto);
  }

  @Delete('categorias/:id')
  // @UseGuards(JwtAuthGuard)
  async removerCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerCategoria(id);
  }

  // ==================== SUBCATEGORIAS ====================

  @Get('categorias/:categoriaId/subcategorias')
  async listarSubcategorias(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Query('todas') todas?: string,
    @Query() paginacao?: PaginationQueryDto,
  ) {
    const apenasAtivas = todas !== 'true';
    return this.compendioService.listarSubcategorias(
      categoriaId,
      apenasAtivas,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('subcategorias/codigo/:codigo')
  async buscarSubcategoriaPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarSubcategoriaPorCodigo(codigo);
  }

  @Post('subcategorias')
  // @UseGuards(JwtAuthGuard)
  async criarSubcategoria(@Body() dto: CreateSubcategoriaDto) {
    return this.compendioService.criarSubcategoria(dto);
  }

  @Put('subcategorias/:id')
  // @UseGuards(JwtAuthGuard)
  async atualizarSubcategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcategoriaDto,
  ) {
    return this.compendioService.atualizarSubcategoria(id, dto);
  }

  @Delete('subcategorias/:id')
  // @UseGuards(JwtAuthGuard)
  async removerSubcategoria(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerSubcategoria(id);
  }

  // ==================== ARTIGOS ====================

  @Get('artigos')
  async listarArtigos(
    @Query('subcategoriaId') subcategoriaId?: string,
    @Query('todas') todas?: string,
    @Query() paginacao?: PaginationQueryDto,
  ) {
    const apenasAtivos = todas !== 'true';
    const subId = subcategoriaId ? parseInt(subcategoriaId, 10) : undefined;
    return this.compendioService.listarArtigos(
      subId,
      apenasAtivos,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('artigos/codigo/:codigo')
  async buscarArtigoPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarArtigoPorCodigo(codigo);
  }

  @Post('artigos')
  // @UseGuards(JwtAuthGuard)
  async criarArtigo(@Body() dto: CreateArtigoDto) {
    return this.compendioService.criarArtigo(dto);
  }

  @Put('artigos/:id')
  // @UseGuards(JwtAuthGuard)
  async atualizarArtigo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArtigoDto,
  ) {
    return this.compendioService.atualizarArtigo(id, dto);
  }

  @Delete('artigos/:id')
  // @UseGuards(JwtAuthGuard)
  async removerArtigo(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerArtigo(id);
  }

  // ==================== BUSCA & DESTAQUES ====================

  @Get('buscar')
  async buscar(@Query('q') query: string) {
    return this.compendioService.buscar(query);
  }

  @Get('destaques')
  async listarDestaques() {
    return this.compendioService.listarDestaques();
  }
}
