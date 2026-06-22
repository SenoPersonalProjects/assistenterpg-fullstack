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
import { AdminGuard } from '../auth/guards/admin.guard';

// DTOs - Técnicas
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { ExportarTecnicasJsonDto } from './dto/exportar-tecnicas-json.dto';
import { ImportarTecnicasJsonDto } from './dto/importar-tecnicas-json.dto';

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

  @Get('importar-json/guia')
  async getGuiaImportacaoJson() {
    return this.service.getGuiaImportacaoJson();
  }

  @Get('exportar-json')
  async exportarJson(@Query() query: ExportarTecnicasJsonDto) {
    return this.service.exportarTecnicasJson(query);
  }

  @Get(':id')
  async findOneTecnica(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneTecnica(id);
  }

  @Post('importar-json')
  @UseGuards(AdminGuard)
  async importarJson(
    @Request() req: { user: { id: number } },
    @Body() dto: ImportarTecnicasJsonDto,
  ) {
    return this.service.importarTecnicasJson(dto);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createTecnica(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateTecnicaDto,
  ) {
    return this.service.createTecnica(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateTecnica(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTecnicaDto,
  ) {
    return this.service.updateTecnica(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  async createHabilidade(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateHabilidadeTecnicaDto,
  ) {
    return this.service.createHabilidade(dto);
  }

  @Patch('habilidades/:id')
  @UseGuards(AdminGuard)
  async updateHabilidade(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHabilidadeTecnicaDto,
  ) {
    return this.service.updateHabilidade(id, dto);
  }

  @Delete('habilidades/:id')
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  async createVariacao(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateVariacaoHabilidadeDto,
  ) {
    return this.service.createVariacao(dto);
  }

  @Patch('variacoes/:id')
  @UseGuards(AdminGuard)
  async updateVariacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVariacaoHabilidadeDto,
  ) {
    return this.service.updateVariacao(id, dto);
  }

  @Delete('variacoes/:id')
  @UseGuards(AdminGuard)
  async removeVariacao(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.service.removeVariacao(id);
    return { sucesso: true };
  }
}
