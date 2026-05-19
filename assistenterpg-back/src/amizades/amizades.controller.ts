import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AmizadesService } from './amizades.service';
import { CriarSolicitacaoAmizadeDto } from './dto/criar-solicitacao-amizade.dto';
import { ResolverUsuarioAmizadeDto } from './dto/resolver-usuario-amizade.dto';

@Controller('amizades')
@UseGuards(JwtAuthGuard)
export class AmizadesController {
  constructor(private readonly amizadesService: AmizadesService) {}

  @Get()
  listarAmigos(@Request() req: { user: { id: number } }) {
    return this.amizadesService.listarAmigos(req.user.id);
  }

  @Get('solicitacoes')
  listarSolicitacoes(@Request() req: { user: { id: number } }) {
    return this.amizadesService.listarSolicitacoes(req.user.id);
  }

  @Get('usuarios/resolver')
  resolverUsuario(@Query() query: ResolverUsuarioAmizadeDto) {
    return this.amizadesService.resolverUsuario(query.identificador);
  }

  @Post('solicitacoes')
  criarSolicitacao(
    @Request() req: { user: { id: number } },
    @Body() dto: CriarSolicitacaoAmizadeDto,
  ) {
    return this.amizadesService.criarSolicitacao(
      req.user.id,
      dto.identificador,
    );
  }

  @Post('solicitacoes/:id/aceitar')
  aceitarSolicitacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.amizadesService.aceitarSolicitacao(req.user.id, id);
  }

  @Post('solicitacoes/:id/recusar')
  recusarSolicitacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.amizadesService.recusarSolicitacao(req.user.id, id);
  }

  @Delete('solicitacoes/:id')
  cancelarSolicitacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.amizadesService.cancelarSolicitacao(req.user.id, id);
  }

  @Delete(':usuarioId')
  removerAmizade(
    @Request() req: { user: { id: number } },
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.amizadesService.removerAmizade(req.user.id, usuarioId);
  }
}
