import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';

// DTOs - Técnicas
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';

// DTOs - Habilidades
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';

// DTOs - Variações
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tecnicas-amaldicoadas')
export class TecnicasAmaldicoadasController {
  constructor(private readonly service: TecnicasAmaldicoadasService) {}

  // ==========================================
  // 📚 ROTAS DE TÉCNICAS
  // ==========================================

  @Get()
  async findAllTecnicas(@Query() filtros: FiltrarTecnicasDto) {
    return this.service.findAllTecnicas(filtros);
  }

  @Get('codigo/:codigo')
  async findTecnicaByCodigo(@Param('codigo') codigo: string) {
    return this.service.findTecnicaByCodigo(codigo);
  }

  @Get('cla/:claId')
  async findTecnicasByCla(@Param('claId', ParseIntPipe) claId: number) {
    return this.service.findTecnicasByCla(claId);
  }

  @Get(':id')
  async findOneTecnica(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneTecnica(id);
  }

  @Post()
  async createTecnica(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateTecnicaDto,
  ) {
    return this.service.createTecnica(dto);
  }

  @Patch(':id')
  async updateTecnica(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTecnicaDto,
  ) {
    return this.service.updateTecnica(id, dto);
  }

  @Delete(':id')
  async removeTecnica(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.service.removeTecnica(id);
    return { sucesso: true };
  }

  // ==========================================
  // 🎯 ROTAS DE HABILIDADES
  // ==========================================

  @Get(':tecnicaId/habilidades')
  async findAllHabilidades(
    @Param('tecnicaId', ParseIntPipe) tecnicaId: number,
  ) {
    return this.service.findAllHabilidades(tecnicaId);
  }

  @Get('habilidades/:id')
  async findOneHabilidade(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneHabilidade(id);
  }

  @Post('habilidades')
  async createHabilidade(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateHabilidadeTecnicaDto,
  ) {
    return this.service.createHabilidade(dto);
  }

  @Patch('habilidades/:id')
  async updateHabilidade(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHabilidadeTecnicaDto,
  ) {
    return this.service.updateHabilidade(id, dto);
  }

  @Delete('habilidades/:id')
  async removeHabilidade(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.service.removeHabilidade(id);
    return { sucesso: true };
  }

  // ==========================================
  // 🔄 ROTAS DE VARIAÇÕES
  // ==========================================

  @Get('habilidades/:habilidadeId/variacoes')
  async findAllVariacoes(
    @Param('habilidadeId', ParseIntPipe) habilidadeId: number,
  ) {
    return this.service.findAllVariacoes(habilidadeId);
  }

  @Get('variacoes/:id')
  async findOneVariacao(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneVariacao(id);
  }

  @Post('variacoes')
  async createVariacao(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateVariacaoHabilidadeDto,
  ) {
    return this.service.createVariacao(dto);
  }

  @Patch('variacoes/:id')
  async updateVariacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVariacaoHabilidadeDto,
  ) {
    return this.service.updateVariacao(id, dto);
  }

  @Delete('variacoes/:id')
  async removeVariacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.service.removeVariacao(id);
    return { sucesso: true };
  }
}
