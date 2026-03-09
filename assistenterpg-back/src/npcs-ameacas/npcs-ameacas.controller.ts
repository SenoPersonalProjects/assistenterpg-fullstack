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
import { CreateNpcAmeacaDto } from './dto/create-npc-ameaca.dto';
import { ListarNpcsAmeacasDto } from './dto/listar-npcs-ameacas.dto';
import { UpdateNpcAmeacaDto } from './dto/update-npc-ameaca.dto';
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
