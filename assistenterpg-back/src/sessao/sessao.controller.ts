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
import { SessaoActivationService } from './sessao-activation.service';
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
import { UsarHabilidadeClasseSessaoDto } from './dto/usar-habilidade-classe-sessao.dto';
import { EncerrarSustentacaoSessaoDto } from './dto/encerrar-sustentacao-sessao.dto';
import { ControleTurnoSessaoDto } from './dto/controle-turno-sessao.dto';
import { AplicarCondicaoSessaoDto } from './dto/aplicar-condicao-sessao.dto';
import { RemoverCondicaoSessaoDto } from './dto/remover-condicao-sessao.dto';
import { SessaoGateway } from './sessao.gateway';
import { AdicionarPersonagemSessaoDto } from './dto/adicionar-personagem-sessao.dto';
import { AtualizarRecursosPersonagemSessaoDto } from './dto/atualizar-recursos-personagem-sessao.dto';
import {
  AjustarInspiracaoSessaoDto,
  AtualizarIniciativaAlternadaSessaoDto,
  AtualizarEncontroSocialSessaoDto,
  AtualizarEscaladaDadosSessaoDto,
  AtualizarRegraOpcionalSessaoDto,
  ConsumirItemSessaoDto,
  GastarInspiracaoSessaoDto,
  MarcarParticipanteIniciativaAlternadaDto,
} from './dto/regras-opcionais-sessao.dto';
import {
  ConcederMaldicaoControladaSessaoDto,
  InvocarEntidadeVinculadaSessaoDto,
} from 'src/campanha/dto/entidade-vinculada-personagem.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas/:campanhaId/sessoes')
export class SessaoController {
  constructor(
    private readonly sessaoService: SessaoService,
    private readonly sessaoGateway: SessaoGateway,
    private readonly sessaoActivationService: SessaoActivationService,
  ) {}

  @Get()
  async listarSessoesCampanha(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    await this.sessaoActivationService.processarVencidasComFallbackLazy(
      campanhaId,
    );
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
      dto,
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

  @Post(':sessaoId/personagens/:personagemSessaoId/habilidades-classe/usar')
  async usarHabilidadeClasseSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemSessaoId', ParseIntPipe) personagemSessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: UsarHabilidadeClasseSessaoDto,
  ) {
    const resultado = await this.sessaoService.usarHabilidadeClasseSessao(
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
    const resultado =
      await this.sessaoService.atualizarRecursosPersonagemSessao(
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
    @Body() dto: ControleTurnoSessaoDto,
  ) {
    const resultado = await this.sessaoService.avancarTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
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
    @Body() dto: ControleTurnoSessaoDto,
  ) {
    const resultado = await this.sessaoService.voltarTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
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
    @Body() dto: ControleTurnoSessaoDto,
  ) {
    const resultado = await this.sessaoService.pularTurnoSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );

    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'TURNO_PULADO',
    );

    return resultado;
  }

  @Post(':sessaoId/turno/efeitos/:eventoId/reprocessar')
  async reprocessarEfeitosAutomaticosTurnoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado =
      await this.sessaoService.reprocessarEfeitosAutomaticosTurnoSessao(
        campanhaId,
        sessaoId,
        eventoId,
        req.user.id,
      );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'EFEITOS_TURNO_REPROCESSADOS',
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

  @Post(':sessaoId/vinculados/:vinculadoId/invocar')
  async invocarEntidadeVinculadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: InvocarEntidadeVinculadaSessaoDto,
  ) {
    const resultado = await this.sessaoService.invocarEntidadeVinculadaSessao(
      campanhaId,
      sessaoId,
      vinculadoId,
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

  @Post(':sessaoId/maldicoes/conceder')
  async concederMaldicaoControladaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: ConcederMaldicaoControladaSessaoDto,
  ) {
    const resultado = await this.sessaoService.concederMaldicaoControladaSessao(
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

  @Post(':sessaoId/npcs/:npcSessaoId/desinvocar')
  async desinvocarEntidadeVinculadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('npcSessaoId', ParseIntPipe) npcSessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    const resultado =
      await this.sessaoService.desinvocarEntidadeVinculadaSessao(
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

  @Get(':sessaoId/regras-opcionais')
  async listarRegrasOpcionaisSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.listarRegrasOpcionaisSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );
  }

  @Patch(':sessaoId/regras-opcionais')
  async atualizarRegraOpcionalSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarRegraOpcionalSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarRegraOpcionalSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'REGRA_OPCIONAL_ATUALIZADA',
    );
    return resultado;
  }

  @Post(':sessaoId/inspiracao/:personagemCampanhaId/ajustar')
  async ajustarInspiracaoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AjustarInspiracaoSessaoDto,
  ) {
    const resultado = await this.sessaoService.ajustarInspiracaoSessao(
      campanhaId,
      sessaoId,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INSPIRACAO_AJUSTADA',
    );
    return resultado;
  }

  @Post(':sessaoId/inspiracao/:personagemCampanhaId/gastar')
  async gastarInspiracaoSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: GastarInspiracaoSessaoDto,
  ) {
    const resultado = await this.sessaoService.gastarInspiracaoSessao(
      campanhaId,
      sessaoId,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INSPIRACAO_GASTA',
    );
    return resultado;
  }

  @Patch(':sessaoId/mecanicas/social/encontros')
  async atualizarEncontroSocialSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEncontroSocialSessaoDto,
  ) {
    return this.executarAtualizacaoEncontroSocialSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  @Post(':sessaoId/mecanicas/social/encontros')
  async criarEncontroSocialSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEncontroSocialSessaoDto,
  ) {
    return this.executarAtualizacaoEncontroSocialSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  private async executarAtualizacaoEncontroSocialSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AtualizarEncontroSocialSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarEncontroSocialSessao(
      campanhaId,
      sessaoId,
      usuarioId,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'ENCONTRO_SOCIAL_ATUALIZADO',
    );
    return resultado;
  }

  @Patch(':sessaoId/mecanicas/escalada')
  async atualizarEscaladaDadosSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEscaladaDadosSessaoDto,
  ) {
    return this.executarAtualizacaoEscaladaDadosSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  @Post(':sessaoId/mecanicas/escalada')
  async criarEscaladaDadosSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEscaladaDadosSessaoDto,
  ) {
    return this.executarAtualizacaoEscaladaDadosSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
  }

  private async executarAtualizacaoEscaladaDadosSessao(
    campanhaId: number,
    sessaoId: number,
    usuarioId: number,
    dto: AtualizarEscaladaDadosSessaoDto,
  ) {
    const resultado = await this.sessaoService.atualizarEscaladaDadosSessao(
      campanhaId,
      sessaoId,
      usuarioId,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'ESCALADA_DADOS_ATUALIZADA',
    );
    return resultado;
  }

  @Get(':sessaoId/iniciativa-alternada')
  async obterIniciativaAlternadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.sessaoService.obterIniciativaAlternadaSessao(
      campanhaId,
      sessaoId,
      req.user.id,
    );
  }

  @Patch(':sessaoId/iniciativa-alternada')
  async atualizarIniciativaAlternadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarIniciativaAlternadaSessaoDto,
  ) {
    const resultado =
      await this.sessaoService.atualizarIniciativaAlternadaSessao(
        campanhaId,
        sessaoId,
        req.user.id,
        dto,
      );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INICIATIVA_ALTERNADA_ATUALIZADA',
    );
    return resultado;
  }

  @Post(':sessaoId/iniciativa-alternada/marcar')
  async marcarParticipanteIniciativaAlternadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: MarcarParticipanteIniciativaAlternadaDto,
  ) {
    const resultado =
      await this.sessaoService.marcarParticipanteIniciativaAlternadaSessao(
        campanhaId,
        sessaoId,
        req.user.id,
        dto,
      );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INICIATIVA_ALTERNADA_ATUALIZADA',
    );
    return resultado;
  }

  @Post(':sessaoId/iniciativa-alternada/avancar-lado')
  async avancarLadoIniciativaAlternadaSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: ControleTurnoSessaoDto,
  ) {
    const resultado =
      await this.sessaoService.avancarLadoIniciativaAlternadaSessao(
        campanhaId,
        sessaoId,
        req.user.id,
        dto,
      );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'INICIATIVA_ALTERNADA_ATUALIZADA',
    );
    return resultado;
  }

  @Post(':sessaoId/consumiveis/usar')
  async consumirItemSessao(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('sessaoId', ParseIntPipe) sessaoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: ConsumirItemSessaoDto,
  ) {
    const resultado = await this.sessaoService.consumirItemSessao(
      campanhaId,
      sessaoId,
      req.user.id,
      dto,
    );
    this.sessaoGateway.emitirSessaoAtualizada(
      campanhaId,
      sessaoId,
      'CONSUMIVEL_USADO',
    );
    return resultado;
  }
}
