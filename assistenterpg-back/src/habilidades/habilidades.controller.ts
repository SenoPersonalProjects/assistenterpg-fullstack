import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HabilidadesService } from './habilidades.service';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';
import { FilterHabilidadeDto } from './dto/filter-habilidade.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('habilidades')
export class HabilidadesController {
  constructor(private readonly habilidadesService: HabilidadesService) {}

  // ========================================
  // ✅ ROTAS ESPECÍFICAS
  // ========================================

  /**
   * ✅ GET /habilidades/poderes-genericos
   * Retorna todos os poderes genéricos com requisitos estruturados
   */
  @Get('poderes-genericos')
  findPoderesGenericos() {
    return this.habilidadesService.findPoderesGenericos();
  }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * FIND ALL - Listar habilidades com filtros
   * Query params:
   * - tipo: PODER_GENERICO | RECURSO_CLASSE | HABILIDADE_TRILHA | etc
   * - origem: string
   * - busca: string (nome ou descrição)
   * - pagina: number (default: 1)
   * - limite: number (default: 20)
   */
  @Get()
  findAll(@Query() filtros: FilterHabilidadeDto) {
    return this.habilidadesService.findAll(filtros);
  }

  /**
   * FIND ONE - Buscar habilidade por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habilidadesService.findOne(id);
  }

  /**
   * CREATE - Criar nova habilidade (ADMIN)
   */
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createDto: CreateHabilidadeDto) {
    return this.habilidadesService.create(createDto);
  }

  /**
   * UPDATE - Atualizar habilidade (ADMIN)
   */
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHabilidadeDto,
  ) {
    return this.habilidadesService.update(id, updateDto);
  }

  /**
   * DELETE - Remover habilidade (ADMIN)
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habilidadesService.remove(id);
  }
}
