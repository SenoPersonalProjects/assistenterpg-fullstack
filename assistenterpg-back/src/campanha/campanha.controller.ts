// src/campanha/campanha.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampanhaService } from './campanha.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { AddMembroDto } from './dto/add-membro.dto';
import { CreateConviteDto } from './dto/create-convite.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas')
export class CampanhaController {
  constructor(private readonly campanhaService: CampanhaService) {}

  @Post()
  async criar(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateCampanhaDto,
  ) {
    return this.campanhaService.criarCampanha(req.user.id, dto);
  }

  @Get('minhas')
  async listarMinhas(
    @Request() req: { user: { id: number } },
    @Query() paginacao: PaginationQueryDto,
  ) {
    return this.campanhaService.listarMinhasCampanhas(
      req.user.id,
      paginacao.page,
      paginacao.limit,
    );
  }

  @Get(':id')
  async detalhar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.buscarPorIdParaUsuario(id, req.user.id);
  }

  @Delete(':id')
  async excluir(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.excluirCampanha(id, req.user.id);
  }

  @Get(':id/membros')
  async listarMembros(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarMembros(id, req.user.id);
  }

  @Post(':id/membros')
  async adicionarMembro(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AddMembroDto,
  ) {
    return this.campanhaService.adicionarMembro(id, req.user.id, dto);
  }

  // ----- Convites -----

  @Post(':id/convites')
  async criarConvite(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CreateConviteDto,
  ) {
    return this.campanhaService.criarConvitePorEmail(
      id,
      req.user.id,
      dto.email,
    );
  }

  @Get('convites/pendentes')
  async listarConvitesPendentes(@Request() req: { user: { id: number } }) {
    return this.campanhaService.listarConvitesPendentesPorUsuario(req.user.id);
  }

  @Post('convites/:codigo/aceitar')
  async aceitarConvite(
    @Param('codigo') codigo: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.aceitarConvite(codigo, req.user.id);
  }

  @Post('convites/:codigo/recusar')
  async recusarConvite(
    @Param('codigo') codigo: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.recusarConvite(codigo, req.user.id);
  }
}
