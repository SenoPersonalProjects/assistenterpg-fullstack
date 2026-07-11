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
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { ReorderCompendioDto } from './dto/reorder-compendio.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('compendio')
export class CompendioController {
  constructor(private readonly compendioService: CompendioService) {}

  @Get('escudo-mestre')
  async buscarEscudoMestre() {
    return this.compendioService.buscarEscudoMestre();
  }

  // ==================== LIVROS ====================

  @Get('livros')
  async listarLivros() {
    return this.compendioService.listarLivros();
  }

  @Get('livros/:livroCodigo')
  async buscarLivroPorCodigo(@Param('livroCodigo') livroCodigo: string) {
    return this.compendioService.buscarLivroPorCodigo(livroCodigo);
  }

  @Get('admin/livros')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listarLivrosAdmin() {
    return this.compendioService.listarLivrosAdmin();
  }

  @Post('admin/livros')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async criarLivro(@Body() dto: CreateLivroDto) {
    return this.compendioService.criarLivro(dto);
  }

  @Put('admin/livros/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async atualizarLivro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLivroDto,
  ) {
    return this.compendioService.atualizarLivro(id, dto);
  }

  @Post('admin/reordenar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reordenar(@Body() dto: ReorderCompendioDto) {
    return this.compendioService.reordenar(dto);
  }

  @Get('admin/exportar-seed')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async exportarSeedCompendio() {
    return this.compendioService.exportarSeedCompendio();
  }

  @Get('livros/:livroCodigo/categorias/:categoriaCodigo')
  async buscarCategoriaDoLivroPorCodigo(
    @Param('livroCodigo') livroCodigo: string,
    @Param('categoriaCodigo') categoriaCodigo: string,
  ) {
    return this.compendioService.buscarCategoriaDoLivroPorCodigo(
      livroCodigo,
      categoriaCodigo,
    );
  }

  @Get(
    'livros/:livroCodigo/categorias/:categoriaCodigo/subcategorias/:subcategoriaCodigo',
  )
  async buscarSubcategoriaDoLivroPorCodigo(
    @Param('livroCodigo') livroCodigo: string,
    @Param('categoriaCodigo') categoriaCodigo: string,
    @Param('subcategoriaCodigo') subcategoriaCodigo: string,
  ) {
    return this.compendioService.buscarSubcategoriaDoLivroPorCodigo(
      livroCodigo,
      categoriaCodigo,
      subcategoriaCodigo,
    );
  }

  @Get(
    'livros/:livroCodigo/categorias/:categoriaCodigo/subcategorias/:subcategoriaCodigo/artigos/:artigoCodigo',
  )
  async buscarArtigoDoLivroPorCodigo(
    @Param('livroCodigo') livroCodigo: string,
    @Param('categoriaCodigo') categoriaCodigo: string,
    @Param('subcategoriaCodigo') subcategoriaCodigo: string,
    @Param('artigoCodigo') artigoCodigo: string,
  ) {
    return this.compendioService.buscarArtigoDoLivroPorCodigo(
      livroCodigo,
      categoriaCodigo,
      subcategoriaCodigo,
      artigoCodigo,
    );
  }

  // ==================== CATEGORIAS ====================

  @Get('categorias')
  async listarCategorias(@Query() paginacao?: PaginationQueryDto) {
    return this.compendioService.listarCategorias(
      true,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('categorias/codigo/:codigo')
  async buscarCategoriaPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarCategoriaPorCodigo(codigo);
  }

  @Post('categorias')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async criarCategoria(@Body() dto: CreateCategoriaDto) {
    return this.compendioService.criarCategoria(dto);
  }

  @Put('categorias/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async atualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.compendioService.atualizarCategoria(id, dto);
  }

  @Delete('categorias/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removerCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerCategoria(id);
  }

  // ==================== SUBCATEGORIAS ====================

  @Get('categorias/:categoriaId/subcategorias')
  async listarSubcategorias(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Query() paginacao?: PaginationQueryDto,
  ) {
    return this.compendioService.listarSubcategorias(
      categoriaId,
      true,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('subcategorias/codigo/:codigo')
  async buscarSubcategoriaPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarSubcategoriaPorCodigo(codigo);
  }

  @Post('subcategorias')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async criarSubcategoria(@Body() dto: CreateSubcategoriaDto) {
    return this.compendioService.criarSubcategoria(dto);
  }

  @Put('subcategorias/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async atualizarSubcategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcategoriaDto,
  ) {
    return this.compendioService.atualizarSubcategoria(id, dto);
  }

  @Delete('subcategorias/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removerSubcategoria(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerSubcategoria(id);
  }

  // ==================== ARTIGOS ====================

  @Get('artigos')
  async listarArtigos(
    @Query('subcategoriaId', new ParseIntPipe({ optional: true }))
    subcategoriaId?: number,
    @Query() paginacao?: PaginationQueryDto,
  ) {
    return this.compendioService.listarArtigos(
      subcategoriaId,
      true,
      paginacao?.page,
      paginacao?.limit,
    );
  }

  @Get('artigos/codigo/:codigo')
  async buscarArtigoPorCodigo(@Param('codigo') codigo: string) {
    return this.compendioService.buscarArtigoPorCodigo(codigo);
  }

  @Post('artigos')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async criarArtigo(@Body() dto: CreateArtigoDto) {
    return this.compendioService.criarArtigo(dto);
  }

  @Put('artigos/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async atualizarArtigo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArtigoDto,
  ) {
    return this.compendioService.atualizarArtigo(id, dto);
  }

  @Delete('artigos/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removerArtigo(@Param('id', ParseIntPipe) id: number) {
    return this.compendioService.removerArtigo(id);
  }

  // ==================== BUSCA & DESTAQUES ====================

  @Get('buscar')
  async buscar(
    @Query('q') query: string,
    @Query('livroCodigo') livroCodigo?: string,
  ) {
    return this.compendioService.buscar(query, livroCodigo);
  }

  @Get('destaques')
  async listarDestaques(@Query('livroCodigo') livroCodigo?: string) {
    return this.compendioService.listarDestaques(livroCodigo);
  }
}
