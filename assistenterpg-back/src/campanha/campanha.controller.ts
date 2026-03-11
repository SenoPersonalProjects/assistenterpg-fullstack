// src/campanha/campanha.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { VincularPersonagemCampanhaDto } from './dto/vincular-personagem-campanha.dto';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { DesfazerModificadorPersonagemCampanhaDto } from './dto/desfazer-modificador-personagem-campanha.dto';

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

  @Get(':id/personagens')
  async listarPersonagensCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarPersonagensCampanha(id, req.user.id);
  }

  @Get(':id/personagens-base-disponiveis')
  async listarPersonagensBaseDisponiveis(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarPersonagensBaseDisponiveisParaAssociacao(
      id,
      req.user.id,
    );
  }

  @Post(':id/personagens')
  async vincularPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: VincularPersonagemCampanhaDto,
  ) {
    return this.campanhaService.vincularPersonagemBase(
      id,
      req.user.id,
      dto.personagemBaseId,
    );
  }

  @Patch(':id/personagens/:personagemCampanhaId/recursos')
  async atualizarRecursosPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarRecursosPersonagemCampanhaDto,
  ) {
    return this.campanhaService.atualizarRecursosPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/modificadores')
  async listarModificadoresPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Query('incluirInativos') incluirInativos?: string,
  ) {
    return this.campanhaService.listarModificadoresPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      incluirInativos === 'true',
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/modificadores')
  async aplicarModificadorPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AplicarModificadorPersonagemCampanhaDto,
  ) {
    return this.campanhaService.aplicarModificadorPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Post(
    ':id/personagens/:personagemCampanhaId/modificadores/:modificadorId/desfazer',
  )
  async desfazerModificadorPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('modificadorId', ParseIntPipe) modificadorId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: DesfazerModificadorPersonagemCampanhaDto,
  ) {
    return this.campanhaService.desfazerModificadorPersonagemCampanha(
      id,
      personagemCampanhaId,
      modificadorId,
      req.user.id,
      dto.motivo,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/historico')
  async listarHistoricoPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarHistoricoPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
    );
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
      dto.papel,
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
