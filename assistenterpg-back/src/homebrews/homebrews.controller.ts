// src/homebrews/homebrews.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomebrewsService } from './homebrews.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { RoleUsuario } from '@prisma/client'; // Adicionar no topo

@UseGuards(AuthGuard('jwt'))
@Controller('homebrews')
export class HomebrewsController {
  constructor(private readonly homebrewsService: HomebrewsService) {}

  // ========================================
  // ✅ ROTAS ESPECÍFICAS (antes do CRUD genérico)
  // ========================================

  /**
   * GET /homebrews/meus
   * Listar homebrews do usuário autenticado
   */
  @Get('meus')
  meus(@Request() req: any, @Query() filtros: FiltrarHomebrewsDto) {
    const usuarioId = req.user.id;
    return this.homebrewsService.meus(usuarioId, filtros);
  }

  /**
   * GET /homebrews/codigo/:codigo
   * Buscar homebrew por código
   */
  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string, @Request() req: any) {
    const usuarioId = req.user?.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.buscarPorCodigo(codigo, usuarioId, isAdmin);
  }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * GET /homebrews
   * Listar homebrews com filtros
   * Query params:
   * - nome: string
   * - tipo: TipoHomebrewConteudo
   * - status: StatusPublicacao
   * - usuarioId: number
   * - apenasPublicados: boolean
   * - pagina: number (default: 1)
   * - limite: number (default: 20)
   */
  @Get()
  listar(@Query() filtros: FiltrarHomebrewsDto, @Request() req: any) {
    const usuarioId = req.user?.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.listar(filtros, usuarioId, isAdmin);
  }

  /**
   * GET /homebrews/:id
   * Buscar homebrew por ID
   */
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const usuarioId = req.user?.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.buscarPorId(id, usuarioId, isAdmin);
  }

  /**
   * POST /homebrews
   * Criar novo homebrew
   */
  @Post()
  criar(@Body() createHomebrewDto: CreateHomebrewDto, @Request() req: any) {
    const usuarioId = req.user.id;
    return this.homebrewsService.criar(createHomebrewDto, usuarioId);
  }

  /**
   * PATCH /homebrews/:id
   * Atualizar homebrew
   */
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomebrewDto: UpdateHomebrewDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.atualizar(
      id,
      updateHomebrewDto,
      usuarioId,
      isAdmin,
    );
  }

  /**
   * DELETE /homebrews/:id
   * Deletar homebrew
   */
  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const usuarioId = req.user.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.deletar(id, usuarioId, isAdmin);
  }

  /**
   * PATCH /homebrews/:id/publicar
   * Publicar homebrew (mudar status para PUBLICADO)
   */
  @Patch(':id/publicar')
  publicar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const usuarioId = req.user.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.publicar(id, usuarioId, isAdmin);
  }

  /**
   * PATCH /homebrews/:id/arquivar
   * Arquivar homebrew (mudar status para ARQUIVADO)
   */
  @Patch(':id/arquivar')
  arquivar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const usuarioId = req.user.id;
    const isAdmin = req.user?.role === RoleUsuario.ADMIN;
    return this.homebrewsService.arquivar(id, usuarioId, isAdmin);
  }
}
