import {
  Controller,
  Get,
  Header,
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
import { Request as ExpressRequest } from 'express';
import { RoleUsuario } from '@prisma/client';
import { HomebrewsService } from './homebrews.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { CreateHomebrewGrupoDto } from './dto/create-homebrew-grupo.dto';
import { UpdateHomebrewGrupoDto } from './dto/update-homebrew-grupo.dto';

type UsuarioAutenticado = {
  id: number;
  role: RoleUsuario;
};

type AuthenticatedRequest = ExpressRequest & {
  user: UsuarioAutenticado;
};

@UseGuards(AuthGuard('jwt'))
@Controller('homebrews')
export class HomebrewsController {
  constructor(private readonly homebrewsService: HomebrewsService) {}

  private getUserContext(req: AuthenticatedRequest): {
    usuarioId: number;
    isAdmin: boolean;
  } {
    return {
      usuarioId: req.user.id,
      isAdmin: req.user.role === RoleUsuario.ADMIN,
    };
  }

  @Get('meus')
  meus(
    @Request() req: AuthenticatedRequest,
    @Query() filtros: FiltrarHomebrewsDto,
  ) {
    const { usuarioId } = this.getUserContext(req);
    return this.homebrewsService.meus(usuarioId, filtros);
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(
    @Param('codigo') codigo: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.buscarPorCodigo(codigo, usuarioId, isAdmin);
  }

  @Get('grupos')
  listarGrupos(@Request() req: AuthenticatedRequest) {
    return this.homebrewsService.listarGrupos(req.user.id);
  }

  @Get('grupos/:id')
  buscarGrupoPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homebrewsService.buscarGrupoPorId(id, req.user.id);
  }

  @Post('grupos')
  criarGrupo(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateHomebrewGrupoDto,
  ) {
    return this.homebrewsService.criarGrupo(req.user.id, dto);
  }

  @Patch('grupos/:id')
  atualizarGrupo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateHomebrewGrupoDto,
  ) {
    return this.homebrewsService.atualizarGrupo(id, req.user.id, dto);
  }

  @Delete('grupos/:id')
  removerGrupo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homebrewsService.removerGrupo(id, req.user.id);
  }

  @Get('grupos/:id/exportar')
  @Header('Content-Type', 'application/json')
  exportarGrupo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homebrewsService.exportarGrupo(id, req.user.id);
  }

  @Get()
  listar(
    @Query() filtros: FiltrarHomebrewsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.listar(filtros, usuarioId, isAdmin);
  }

  @Get(':id/exportar')
  @Header('Content-Type', 'application/json')
  exportarHomebrew(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.exportarHomebrew(id, usuarioId, isAdmin);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.buscarPorId(id, usuarioId, isAdmin);
  }

  @Post()
  criar(
    @Body() createHomebrewDto: CreateHomebrewDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId } = this.getUserContext(req);
    return this.homebrewsService.criar(createHomebrewDto, usuarioId);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomebrewDto: UpdateHomebrewDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.atualizar(
      id,
      updateHomebrewDto,
      usuarioId,
      isAdmin,
    );
  }

  @Delete(':id')
  deletar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.deletar(id, usuarioId, isAdmin);
  }

  @Patch(':id/publicar')
  publicar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.publicar(id, usuarioId, isAdmin);
  }

  @Patch(':id/arquivar')
  arquivar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const { usuarioId, isAdmin } = this.getUserContext(req);
    return this.homebrewsService.arquivar(id, usuarioId, isAdmin);
  }
}
