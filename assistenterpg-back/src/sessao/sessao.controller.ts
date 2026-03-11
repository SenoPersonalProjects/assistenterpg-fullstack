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
import { ListarEventosSessaoDto } from './dto/listar-eventos-sessao.dto';
import { DesfazerEventoSessaoDto } from './dto/desfazer-evento-sessao.dto';
import { SessaoGateway } from './sessao.gateway';

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas/:campanhaId/sessoes')
export class SessaoController {
  constructor(
    private readonly sessaoService: SessaoService,
    private readonly sessaoGateway: SessaoGateway,
  ) {}

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

  @Get(':sessaoId/eventos')
  async listarEventosSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Query() query: ListarEventosSessaoDto,
  ) {
    return this.sessaoService.listarEventosSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      query,
    );
  }

  @Post(':sessaoId/chat')
  async enviarMensagemChatSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: EnviarChatSessaoDto,
  ) {
    const resultado = await this.sessaoService.enviarMensagemChatSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto.mensagem,
    );

    this.sessaoGateway.emitirSessaoAtualizada(campanhaId, sessaoId, 'CHAT_NOVA');

    return resultado;
  }

  @Post(':sessaoId/turno/avancar')
  async avancarTurnoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.avancarTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'TURNO_AVANCADO',
    );

    return resultado;
  }

  @Post(':sessaoId/encerrar')
  async encerrarSessaoCampanha(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.encerrarSessaoCampanha(
      campanhaId,
      sessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'SESSAO_ENCERRADA',
    );

    return resultado;
  }

  @Patch(':sessaoId/cena')
  async atualizarCenaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarCenaSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarCenaSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'CENA_ATUALIZADA',
    );

    return resultado;
  }

  @Post(':sessaoId/npcs')
  async adicionarNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarNpcSessaoDto,
  ) {
    const resultado = await this.sessaoService.adicionarNpcSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'NPC_ATUALIZADO',
    );

    return resultado;
  }

  @Patch(':sessaoId/npcs/:npcSessaoId')
  async atualizarNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('npcSessaoId', ParseIntPipe) npcSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarNpcSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarNpcSessao(
      campanhaId,
      sessaoId,
      npcSessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'NPC_ATUALIZADO',
    );

    return resultado;
  }

  @Delete(':sessaoId/npcs/:npcSessaoId')
  async removerNpcSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('npcSessaoId', ParseIntPipe) npcSessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.removerNpcSessao(
      campanhaId,
      sessaoId,
      npcSessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'NPC_ATUALIZADO',
    );

    return resultado;
  }

  @Post(':sessaoId/eventos/:eventoId/desfazer')
  async desfazerEventoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: DesfazerEventoSessaoDto,
  ) {
    const resultado = await this.sessaoService.desfazerEventoSessao(
      campanhaId,
      sessaoId,
      eventoId,
      req.user.id,
      dto.motivo,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'SESSAO_EVENTO_DESFEITO',
    );

    return resultado;
  }
}
