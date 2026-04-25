import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateNpcAmeacaDto } from './dto/create-npc-ameaca.dto';
import { CreateNpcAmeacaGrupoDto } from './dto/create-npc-ameaca-grupo.dto';
import { ListarNpcsAmeacasDto } from './dto/listar-npcs-ameacas.dto';
import { UpdateNpcAmeacaDto } from './dto/update-npc-ameaca.dto';
import { UpdateNpcAmeacaGrupoDto } from './dto/update-npc-ameaca-grupo.dto';
import { NpcsAmeacasService } from './npcs-ameacas.service';

@UseGuards(AuthGuard('jwt'))
@Controller('npcs-ameacas')
export class NpcsAmeacasController {
  constructor(private readonly npcsAmeacasService: NpcsAmeacasService) {}

  @Post()
  criar(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateNpcAmeacaDto,
  ) {
    return this.npcsAmeacasService.criar(req.user.id, dto);
  }

  @Get('meus')
  listarMeus(
    @Request() req: { user: { id: number } },
    @Query() query: ListarNpcsAmeacasDto,
  ) {
    return this.npcsAmeacasService.listarDoUsuario(req.user.id, query);
  }

  @Get('grupos')
  listarGrupos(@Request() req: { user: { id: number } }) {
    return this.npcsAmeacasService.listarGrupos(req.user.id);
  }

  @Get('grupos/:id')
  buscarGrupoPorId(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.buscarGrupoPorId(req.user.id, id);
  }

  @Post('grupos')
  criarGrupo(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateNpcAmeacaGrupoDto,
  ) {
    return this.npcsAmeacasService.criarGrupo(req.user.id, dto);
  }

  @Patch('grupos/:id')
  atualizarGrupo(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNpcAmeacaGrupoDto,
  ) {
    return this.npcsAmeacasService.atualizarGrupo(req.user.id, id, dto);
  }

  @Delete('grupos/:id')
  removerGrupo(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.removerGrupo(req.user.id, id);
  }

  @Get('grupos/:id/exportar')
  @Header('Content-Type', 'application/json')
  exportarGrupo(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.exportarGrupo(req.user.id, id);
  }

  @Get(':id/exportar')
  @Header('Content-Type', 'application/json')
  exportarNpcAmeaca(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.exportarNpcAmeaca(req.user.id, id);
  }

  @Get(':id')
  buscarPorId(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.buscarPorId(req.user.id, id);
  }

  @Patch(':id')
  atualizar(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNpcAmeacaDto,
  ) {
    return this.npcsAmeacasService.atualizar(req.user.id, id, dto);
  }

  @Delete(':id')
  remover(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.npcsAmeacasService.remover(req.user.id, id);
  }
}
