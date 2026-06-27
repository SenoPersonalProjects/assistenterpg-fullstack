import {
  Body,
  Controller,
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
import {
  AtualizarSessaoAgendadaDto,
  ConflitosSessaoAgendadaQueryDto,
  CriarSessaoAgendadaDto,
} from './dto/sessao-agendada.dto';
import { SessaoAgendadaService } from './sessao-agendada.service';

type AuthenticatedRequest = {
  user: { id: number };
};

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas/:campanhaId/sessoes-agendadas')
export class SessaoAgendadaController {
  constructor(private readonly service: SessaoAgendadaService) {}

  @Get()
  listar(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.service.listar(campanhaId, req.user.id);
  }

  @Get('conflitos')
  listarConflitos(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: AuthenticatedRequest,
    @Query() query: ConflitosSessaoAgendadaQueryDto,
  ) {
    return this.service.listarConflitos(campanhaId, req.user.id, query);
  }

  @Post()
  criar(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CriarSessaoAgendadaDto,
  ) {
    return this.service.criar(campanhaId, req.user.id, dto);
  }

  @Patch(':agendamentoId')
  atualizar(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @Request() req: AuthenticatedRequest,
    @Body() dto: AtualizarSessaoAgendadaDto,
  ) {
    return this.service.atualizar(campanhaId, agendamentoId, req.user.id, dto);
  }

  @Post(':agendamentoId/cancelar')
  cancelar(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.service.cancelar(campanhaId, agendamentoId, req.user.id);
  }

  @Post(':agendamentoId/abrir')
  abrirAgora(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.service.abrirAgora(campanhaId, agendamentoId, req.user.id);
  }

  @Post(':agendamentoId/calendar/retry')
  retryCalendar(
    @Param('campanhaId', ParseIntPipe) campanhaId: number,
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.service.retryCalendar(campanhaId, agendamentoId, req.user.id);
  }
}
