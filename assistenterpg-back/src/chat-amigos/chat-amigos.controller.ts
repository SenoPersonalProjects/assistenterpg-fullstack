import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatAmigosGateway } from './chat-amigos.gateway';
import { ChatAmigosService } from './chat-amigos.service';
import { EnviarMensagemAmigoDto } from './dto/enviar-mensagem-amigo.dto';
import { ListarMensagensAmigoDto } from './dto/listar-mensagens-amigo.dto';

@Controller('chat-amigos')
@UseGuards(JwtAuthGuard)
export class ChatAmigosController {
  constructor(
    private readonly chatAmigosService: ChatAmigosService,
    private readonly chatAmigosGateway: ChatAmigosGateway,
  ) {}

  @Get('conversas')
  listarConversas(@Request() req: { user: { id: number } }) {
    return this.chatAmigosService.listarConversas(req.user.id);
  }

  @Get('conversas/:amigoId/mensagens')
  listarMensagens(
    @Request() req: { user: { id: number } },
    @Param('amigoId', ParseIntPipe) amigoId: number,
    @Query() query: ListarMensagensAmigoDto,
  ) {
    return this.chatAmigosService.listarMensagens(req.user.id, amigoId, query);
  }

  @Post('conversas/:amigoId/mensagens')
  async enviarMensagem(
    @Request() req: { user: { id: number } },
    @Param('amigoId', ParseIntPipe) amigoId: number,
    @Body() dto: EnviarMensagemAmigoDto,
  ) {
    const resultado = await this.chatAmigosService.enviarMensagem(
      req.user.id,
      amigoId,
      dto.conteudo,
    );
    this.chatAmigosGateway.emitirMensagem(resultado.mensagem);
    return resultado;
  }

  @Post('conversas/:amigoId/lida')
  async marcarComoLida(
    @Request() req: { user: { id: number } },
    @Param('amigoId', ParseIntPipe) amigoId: number,
  ) {
    const resultado = await this.chatAmigosService.marcarComoLida(
      req.user.id,
      amigoId,
    );
    this.chatAmigosGateway.emitirLeitura({
      usuarioId: req.user.id,
      amigoId,
      conversaId: resultado.conversaId,
      lidaAteMensagemId: resultado.lidaAteMensagemId,
    });
    return resultado;
  }
}
