// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts
import { Injectable } from '@nestjs/common';

import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';
import { ExportarTecnicasJsonDto } from './dto/exportar-tecnicas-json.dto';
import { ImportarTecnicasJsonDto } from './dto/importar-tecnicas-json.dto';
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';
import {
  ImportacaoTecnicasResumo,
  RegistroJson,
} from './engine/tecnicas-amaldicoadas.engine.types';
import { TecnicasAmaldicoadasCrudService } from './tecnicas-amaldicoadas.crud.service';
import { TecnicasAmaldicoadasImportExportService } from './tecnicas-amaldicoadas.import-export.service';
import { TecnicasAmaldicoadasHabilidadesService } from './tecnicas-amaldicoadas.habilidades.service';
import { TecnicasAmaldicoadasVariacoesService } from './tecnicas-amaldicoadas.variacoes.service';

@Injectable()
export class TecnicasAmaldicoadasService {
  constructor(
    private readonly crudService: TecnicasAmaldicoadasCrudService,
    private readonly importExportService: TecnicasAmaldicoadasImportExportService,
    private readonly habilidadesService: TecnicasAmaldicoadasHabilidadesService,
    private readonly variacoesService: TecnicasAmaldicoadasVariacoesService,
  ) {}

  getGuiaImportacaoJson(): RegistroJson {
    return this.importExportService.getGuiaImportacaoJson();
  }

  async exportarTecnicasJson(
    query: ExportarTecnicasJsonDto,
  ): Promise<RegistroJson> {
    return this.importExportService.exportarTecnicasJson(query);
  }

  async importarTecnicasJson(
    dto: ImportarTecnicasJsonDto,
  ): Promise<ImportacaoTecnicasResumo> {
    return this.importExportService.importarTecnicasJson(dto);
  }

  async findAllTecnicas(
    filtros: FiltrarTecnicasDto,
  ): Promise<TecnicaDetalhadaDto[]> {
    return this.crudService.findAllTecnicas(filtros);
  }

  async findOneTecnica(id: number): Promise<TecnicaDetalhadaDto> {
    return this.crudService.findOneTecnica(id);
  }

  async findTecnicaByCodigo(codigo: string): Promise<TecnicaDetalhadaDto> {
    return this.crudService.findTecnicaByCodigo(codigo);
  }

  async createTecnica(dto: CreateTecnicaDto): Promise<TecnicaDetalhadaDto> {
    return this.crudService.createTecnica(dto);
  }

  async updateTecnica(
    id: number,
    dto: UpdateTecnicaDto,
  ): Promise<TecnicaDetalhadaDto> {
    return this.crudService.updateTecnica(id, dto);
  }

  async removeTecnica(id: number): Promise<void> {
    return this.crudService.removeTecnica(id);
  }

  async findTecnicasByCla(claId: number): Promise<TecnicaDetalhadaDto[]> {
    return this.crudService.findTecnicasByCla(claId);
  }

  async findAllHabilidades(tecnicaId: number) {
    return this.habilidadesService.findAllHabilidades(tecnicaId);
  }

  async findOneHabilidade(id: number) {
    return this.habilidadesService.findOneHabilidade(id);
  }

  async createHabilidade(dto: CreateHabilidadeTecnicaDto) {
    return this.habilidadesService.createHabilidade(dto);
  }

  async updateHabilidade(id: number, dto: UpdateHabilidadeTecnicaDto) {
    return this.habilidadesService.updateHabilidade(id, dto);
  }

  async removeHabilidade(id: number): Promise<void> {
    return this.habilidadesService.removeHabilidade(id);
  }

  async findAllVariacoes(habilidadeTecnicaId: number) {
    return this.variacoesService.findAllVariacoes(habilidadeTecnicaId);
  }

  async findOneVariacao(id: number) {
    return this.variacoesService.findOneVariacao(id);
  }

  async createVariacao(dto: CreateVariacaoHabilidadeDto) {
    return this.variacoesService.createVariacao(dto);
  }

  async updateVariacao(id: number, dto: UpdateVariacaoHabilidadeDto) {
    return this.variacoesService.updateVariacao(id, dto);
  }

  async removeVariacao(id: number): Promise<void> {
    return this.variacoesService.removeVariacao(id);
  }
}
