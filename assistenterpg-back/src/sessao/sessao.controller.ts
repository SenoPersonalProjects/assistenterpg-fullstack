import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessaoService } from './sessao.service';
import { CreateSessaoCampanhaDto } from './dto/create-sessao-campanha.dto';
import { ListarChatSessaoDto } from './dto/listar-chat-sessao.dto';
import { EnviarChatSessaoDto } from './dto/enviar-chat-sessao.dto';
import { AtualizarCenaSessaoDto } from './dto/atualizar-cena-sessao.dto';
import { AdicionarNpcSessaoDto } from './dto/adicionar-npc-sessao.dto';
import { AtualizarNpcSessaoDto } from './dto/atualizar-npc-sessao.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas/:campanhaId/sessoes')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) {}

  @Get()
  async listarSessoesCampanha(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.listarSessoesCampanha(campanhaId, req.user.id);
  }

  @Post()
  async criarSessaoCampanha(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CreateSessaoCampanhaDto,
  ) {
    return this.sessaoService.criarSessaoCampanha(campanhaId, req.user.id, dto);
  }

  @Get(':sessaoId')
  async buscarDetalheSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.buscarDetalheSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );
  }

  @Get(':sessaoId/chat')
  async listarChatSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Query() query: ListarChatSessaoDto,
  ) {
    return this.sessaoService.listarChatSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      query.afterId,
    );
  }

  @Post(':sessaoId/chat')
  async enviarMensagemChatSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: EnviarChatSessaoDto,
  ) {
    return this.sessaoService.enviarMensagemChatSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto.mensagem,
    );
  }

  @Post(':sessaoId/turno/avancar')
  async avancarTurnoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.avancarTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );
  }

  @Patch(':sessaoId/cena')
  async atualizarCenaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarCenaSessaoDto,
  ) {
    return this.sessaoService.atualizarCenaSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  @Post(':sessaoId/npcs')
  async adicionarNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarNpcSessaoDto,
  ) {
    return this.sessaoService.adicionarNpcSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  @Patch(':sessaoId/npcs/:npcSessaoId')
  async atualizarNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('npcSessaoId', ParseIntPipe) npcSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarNpcSessaoDto,
  ) {
    return this.sessaoService.atualizarNpcSessao(
      campanhaId,
      sessaoId,
      npcSessaoId,
      req.user.id,
      dto,
    );
  }

  @Delete(':sessaoId/npcs/:npcSessaoId')
  async removerNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('npcSessaoId', ParseIntPipe) npcSessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.removerNpcSessao(
      campanhaId,
      sessaoId,
      npcSessaoId,
      req.user.id,
    );
  }
}
