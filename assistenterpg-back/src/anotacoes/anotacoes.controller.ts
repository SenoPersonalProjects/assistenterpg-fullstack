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
import { AnotacoesService } from './anotacoes.service';
import { CreateAnotacaoDto } from './dto/create-anotacao.dto';
import { UpdateAnotacaoDto } from './dto/update-anotacao.dto';
import { FiltrarAnotacoesDto } from './dto/filtrar-anotacoes.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('anotacoes')
export class AnotacoesController {
  constructor(private readonly anotacoesService: AnotacoesService) {}

  @Get()
  listar(
    @Request() req: { user: { id: number } },
    @Query() filtros: FiltrarAnotacoesDto,
  ) {
    return this.anotacoesService.listar(req.user.id, filtros);
  }

  @Post()
  criar(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateAnotacaoDto,
  ) {
    return this.anotacoesService.criar(req.user.id, dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: UpdateAnotacaoDto,
  ) {
    return this.anotacoesService.atualizar(id, req.user.id, dto);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.anotacoesService.remover(id, req.user.id);
  }
}
