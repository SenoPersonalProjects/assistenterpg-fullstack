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
import { AdicionarNpcSimplesSessaoDto } from './dto/adicionar-npc-simples-sessao.dto';
import { ListarEventosSessaoDto } from './dto/listar-eventos-sessao.dto';
import { DesfazerEventoSessaoDto } from './dto/desfazer-evento-sessao.dto';
import { AtualizarOrdemIniciativaSessaoDto } from './dto/atualizar-ordem-iniciativa-sessao.dto';
import { AtualizarValorIniciativaSessaoDto } from './dto/atualizar-valor-iniciativa-sessao.dto';
import { UsarHabilidadeSessaoDto } from './dto/usar-habilidade-sessao.dto';
import { EncerrarSustentacaoSessaoDto } from './dto/encerrar-sustentacao-sessao.dto';
import { AplicarCondicaoSessaoDto } from './dto/aplicar-condicao-sessao.dto';
import { RemoverCondicaoSessaoDto } from './dto/remover-condicao-sessao.dto';
import { SessaoGateway } from './sessao.gateway';
import { AdicionarPersonagemSessaoDto } from './dto/adicionar-personagem-sessao.dto';
import { AtualizarRecursosPersonagemSessaoDto } from './dto/atualizar-recursos-personagem-sessao.dto';

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

  @Get(':sessaoId/relatorio')
  async buscarRelatorioSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.buscarRelatorioSessao(
      campanhaId,
      sessaoId,
      req.user.id,
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

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'CHAT_NOVA',
    );

    return resultado;
  }

  @Post(':sessaoId/personagens/:personagemSessaoId/habilidades/usar')
  async usarHabilidadeSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemSessaoId', ParseIntPipe) personagemSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: UsarHabilidadeSessaoDto,
  ) {
    const resultado = await this.sessaoService.usarHabilidadeSessao(
      campanhaId,
      sessaoId,
      personagemSessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'HABILIDADE_USADA',
    );

    return resultado;
  }

  @Patch(':sessaoId/personagens/:personagemSessaoId/recursos')
  async atualizarRecursosPersonagemSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemSessaoId', ParseIntPipe) personagemSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarRecursosPersonagemSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarRecursosPersonagemSessao(
      campanhaId,
      sessaoId,
      personagemSessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'RECURSO_AJUSTADO',
    );

    return resultado;
  }

  @Post(':sessaoId/condicoes/aplicar')
  async aplicarCondicaoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AplicarCondicaoSessaoDto,
  ) {
    const resultado = await this.sessaoService.aplicarCondicaoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'CONDICAO_APLICADA',
    );

    return resultado;
  }

  @Post(':sessaoId/condicoes/:condicaoSessaoId/remover')
  async removerCondicaoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('condicaoSessaoId', ParseIntPipe) condicaoSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: RemoverCondicaoSessaoDto,
  ) {
    const resultado = await this.sessaoService.removerCondicaoSessao(
      campanhaId,
      sessaoId,
      condicaoSessaoId,
      req.user.id,
      dto.motivo,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'CONDICAO_REMOVIDA',
    );

    return resultado;
  }

  @Post(
    ':sessaoId/personagens/:personagemSessaoId/sustentacoes/:sustentacaoId/encerrar',
  )
  async encerrarSustentacaoHabilidadeSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemSessaoId', ParseIntPipe) personagemSessaoId: number,
    @Param('sustentacaoId', ParseIntPipe) sustentacaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: EncerrarSustentacaoSessaoDto,
  ) {
    const resultado =
      await this.sessaoService.encerrarSustentacaoHabilidadeSessao(
        campanhaId,
        sessaoId,
        personagemSessaoId,
        sustentacaoId,
        req.user.id,
        dto.motivo,
      );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'HABILIDADE_SUSTENTADA_ENCERRADA',
    );

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

  @Post(':sessaoId/turno/voltar')
  async voltarTurnoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.voltarTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'TURNO_RECUADO',
    );

    return resultado;
  }

  @Post(':sessaoId/turno/pular')
  async pularTurnoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.pularTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'TURNO_PULADO',
    );

    return resultado;
  }

  @Patch(':sessaoId/iniciativa/ordem')
  async atualizarOrdemIniciativaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarOrdemIniciativaSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarOrdemIniciativaSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'ORDEM_INICIATIVA_ATUALIZADA',
    );

    return resultado;
  }

  @Patch(':sessaoId/iniciativa/valor')
  async atualizarValorIniciativaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarValorIniciativaSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarValorIniciativaSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INICIATIVA_VALOR_ATUALIZADO',
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

  @Post(':sessaoId/personagens')
  async adicionarPersonagemSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarPersonagemSessaoDto,
  ) {
    const resultado = await this.sessaoService.adicionarPersonagemSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'PERSONAGEM_ATUALIZADO',
    );

    return resultado;
  }

  @Delete(':sessaoId/personagens/:personagemSessaoId')
  async removerPersonagemSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemSessaoId', ParseIntPipe) personagemSessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado = await this.sessaoService.removerPersonagemSessao(
      campanhaId,
      sessaoId,
      personagemSessaoId,
      req.user.id,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'PERSONAGEM_ATUALIZADO',
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

  @Post(':sessaoId/npcs-simples')
  async adicionarNpcSimplesSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarNpcSimplesSessaoDto,
  ) {
    const resultado = await this.sessaoService.adicionarNpcSimplesSessao(
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
