// src/personagem-base/personagem-base.controller.ts
import {
  Body,
  Controller,
  Get,
  Header,
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
import { PersonagemBaseService } from './personagem-base.service';
import { CreatePersonagemBaseDto } from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { ImportarPersonagemBaseDto } from './dto/importar-personagem-base.dto';
import {
  ConsultarInfoGrausTreinamentoDto,
  ConsultarPericiasElegiveisDto,
} from './dto/consultar-graus-treinamento.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('personagens-base')
export class PersonagemBaseController {
  constructor(private readonly personagemBaseService: PersonagemBaseService) {}

  @Post()
  async criar(
    @Request() req: { user: { id: number } },
    @Body() dto: CreatePersonagemBaseDto,
  ) {
    return this.personagemBaseService.criar(req.user.id, dto);
  }

  // ✅ Endpoint de preview (calcula mas não salva)
  @Post('preview')
  async preview(
    @Request() req: { user: { id: number } },
    @Body() dto: CreatePersonagemBaseDto,
  ) {
    return this.personagemBaseService.preview(req.user.id, dto);
  }

  // ✅ NOVO: Consulta níveis que concedem graus de treinamento e quantas melhorias
  @Get('graus-treinamento/info')
  consultarInfoGrausTreinamento(
    @Query() query: ConsultarInfoGrausTreinamentoDto,
  ) {
    return this.personagemBaseService.consultarInfoGrausTreinamento(
      Number(query.nivel),
      Number(query.intelecto),
    );
  }

  // ✅ NOVO: Consulta perícias elegíveis para grau de treinamento
  @Post('graus-treinamento/pericias-elegiveis')
  async consultarPericiasElegiveis(
    @Body() body: ConsultarPericiasElegiveisDto,
  ) {
    return this.personagemBaseService.consultarPericiasElegiveis(
      body.periciasComGrauInicial,
    );
  }

  // ✅ NOVO: Lista todas as passivas de atributos disponíveis
  @Get('passivas-disponiveis')
  async listarPassivasDisponiveis() {
    return this.personagemBaseService.listarPassivasDisponiveis();
  }

  // ✅ NOVO: Lista técnicas inatas disponíveis para o personagem
  @Get('tecnicas-disponiveis')
  async listarTecnicasDisponiveis(
    @Query('claId', ParseIntPipe) claId: number,
    @Query('origemId', new ParseIntPipe({ optional: true }))
    origemId?: number,
  ) {
    return this.personagemBaseService.listarTecnicasDisponveis(claId, origemId);
  }

  @Get('meus')
  async listarMeus(@Request() req: { user: { id: number } }) {
    return this.personagemBaseService.listarDoUsuario(req.user.id);
  }

  @Get(':id/exportar')
  @Header('Content-Type', 'application/json')
  @Header(
    'Content-Disposition',
    'attachment; filename="personagem-base-export.json"',
  )
  async exportar(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.personagemBaseService.exportar(req.user.id, id);
  }

  @Post('importar')
  async importar(
    @Request() req: { user: { id: number } },
    @Body() dto: ImportarPersonagemBaseDto,
  ) {
    return this.personagemBaseService.importar(req.user.id, dto);
  }

  @Get(':id')
  async buscarPorId(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Query('incluirInventario') incluirInventario?: string,
  ) {
    const incluir = incluirInventario === 'true';
    return this.personagemBaseService.buscarPorId(req.user.id, id, incluir);
  }

  @Patch(':id')
  async atualizar(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonagemBaseDto,
  ) {
    return this.personagemBaseService.atualizar(req.user.id, id, dto);
  }

  @Delete(':id')
  async remover(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.personagemBaseService.remover(req.user.id, id);
  }
}
