// src/campanha/campanha.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampanhaService } from './campanha.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { AddMembroDto } from './dto/add-membro.dto';
import { CreateConviteDto } from './dto/create-convite.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { VincularPersonagemCampanhaDto } from './dto/vincular-personagem-campanha.dto';
import { AtualizarNucleoPersonagemCampanhaDto } from './dto/atualizar-nucleo-personagem-campanha.dto';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { DesfazerModificadorPersonagemCampanhaDto } from './dto/desfazer-modificador-personagem-campanha.dto';
import {
  AdicionarItemInventarioCampanhaDto,
  AtualizarItemInventarioCampanhaDto,
  AplicarModificacaoInventarioCampanhaDto,
} from './dto/inventario-campanha.dto';
import { SacrificarNucleoPersonagemCampanhaDto } from './dto/sacrificar-nucleo-personagem-campanha.dto';
import {
  AtribuirItemSessaoCampanhaDto,
  AtualizarItemSessaoCampanhaDto,
  AtualizarTemplateItemSessaoCampanhaDto,
  CriarItemSessaoCampanhaDto,
  CriarTemplateItemSessaoCampanhaDto,
  RevelarItemSessaoCampanhaDto,
  SolicitarTransferenciaItemSessaoCampanhaDto,
} from './dto/itens-sessao-campanha.dto';
import {
  AtualizarEntidadeVinculadaPersonagemDto,
  AtualizarEstadoEntidadeVinculadaDto,
  AssociarTemplateEntidadeVinculadaDto,
  CriarEntidadeVinculadaPersonagemDto,
} from './dto/entidade-vinculada-personagem.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('campanhas')
export class CampanhaController {
  constructor(private readonly campanhaService: CampanhaService) {}

  @Post()
  async criar(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateCampanhaDto,
  ) {
    return this.campanhaService.criarCampanha(req.user.id, dto);
  }

  @Get('minhas')
  async listarMinhas(
    @Request() req: { user: { id: number } },
    @Query() paginacao: PaginationQueryDto,
  ) {
    return this.campanhaService.listarMinhasCampanhas(
      req.user.id,
      paginacao.page,
      paginacao.limit,
    );
  }

  @Get(':id')
  async detalhar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.buscarPorIdParaUsuario(id, req.user.id);
  }

  @Delete(':id')
  async excluir(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.excluirCampanha(id, req.user.id);
  }

  @Get(':id/membros')
  async listarMembros(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarMembros(id, req.user.id);
  }

  @Get(':id/amigos-convidaveis')
  async listarAmigosConvidaveis(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarAmigosConvidaveis(id, req.user.id);
  }

  @Post(':id/membros')
  async adicionarMembro(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AddMembroDto,
  ) {
    return this.campanhaService.adicionarMembro(id, req.user.id, dto);
  }

  @Get(':id/personagens')
  async listarPersonagensCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarPersonagensCampanha(id, req.user.id);
  }

  @Get(':id/personagens-base-disponiveis')
  async listarPersonagensBaseDisponiveis(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarPersonagensBaseDisponiveisParaAssociacao(
      id,
      req.user.id,
    );
  }

  @Post(':id/personagens')
  async vincularPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: VincularPersonagemCampanhaDto,
  ) {
    return this.campanhaService.vincularPersonagemBase(
      id,
      req.user.id,
      dto.personagemBaseId,
      dto.sincronizarTecnicaInata ?? false,
    );
  }

  @Delete(':id/personagens/:personagemCampanhaId')
  async desassociarPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.desassociarPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/atualizar-da-ficha-base')
  async atualizarPersonagemDaFichaBase(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.atualizarPersonagemDaFichaBase(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/vinculados')
  async listarEntidadesVinculadasPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarEntidadesVinculadasPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/vinculados/capacidades')
  async listarCapacidadesEntidadesVinculadas(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarCapacidadesEntidadesVinculadas(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/vinculados/templates')
  async listarTemplatesEntidadesVinculadas(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarTemplatesEntidadesVinculadas(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Post(
    ':id/personagens/:personagemCampanhaId/vinculados/templates/:templateId/associar',
  )
  async associarTemplateEntidadeVinculada(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AssociarTemplateEntidadeVinculadaDto,
  ) {
    return this.campanhaService.associarTemplateEntidadeVinculada(
      id,
      personagemCampanhaId,
      req.user.id,
      templateId,
      dto,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/vinculados')
  async criarEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CriarEntidadeVinculadaPersonagemDto,
  ) {
    return this.campanhaService.criarEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId')
  async obterEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.obterEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
    );
  }

  @Patch(':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId')
  async atualizarEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEntidadeVinculadaPersonagemDto,
  ) {
    return this.campanhaService.atualizarEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
      dto,
    );
  }

  @Post(
    ':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId/recalcular',
  )
  async recalcularEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.recalcularEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
    );
  }

  @Post(
    ':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId/duplicar',
  )
  async duplicarEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.duplicarEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId/estado')
  async atualizarEstadoEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarEstadoEntidadeVinculadaDto,
  ) {
    return this.campanhaService.atualizarEstadoEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
      dto,
    );
  }

  @Delete(':id/personagens/:personagemCampanhaId/vinculados/:vinculadoId')
  async removerEntidadeVinculadaPersonagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('vinculadoId', ParseIntPipe) vinculadoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.removerEntidadeVinculadaPersonagem(
      id,
      personagemCampanhaId,
      req.user.id,
      vinculadoId,
    );
  }

  @Patch(':id/personagens/:personagemCampanhaId/recursos')
  async atualizarRecursosPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarRecursosPersonagemCampanhaDto,
  ) {
    return this.campanhaService.atualizarRecursosPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/personagens/:personagemCampanhaId/nucleo')
  async atualizarNucleoPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarNucleoPersonagemCampanhaDto,
  ) {
    return this.campanhaService.atualizarNucleoPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/nucleos/sacrificar')
  async sacrificarNucleoPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: SacrificarNucleoPersonagemCampanhaDto,
  ) {
    return this.campanhaService.sacrificarNucleoPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/modificadores')
  async listarModificadoresPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Query('incluirInativos') incluirInativos?: string,
    @Query('sessaoId') sessaoId?: string,
    @Query('cenaId') cenaId?: string,
  ) {
    const parseOptionalQueryInt = (
      valor: string | undefined,
      campo: 'sessaoId' | 'cenaId',
    ): number | undefined => {
      if (typeof valor !== 'string' || valor.trim() === '') {
        return undefined;
      }
      const numero = Number(valor);
      if (!Number.isInteger(numero) || numero < 1) {
        throw new BadRequestException(`${campo} deve ser inteiro >= 1`);
      }
      return numero;
    };

    const sessaoIdNumero = parseOptionalQueryInt(sessaoId, 'sessaoId');
    const cenaIdNumero = parseOptionalQueryInt(cenaId, 'cenaId');

    return this.campanhaService.listarModificadoresPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      incluirInativos === 'true',
      {
        sessaoId: sessaoIdNumero,
        cenaId: cenaIdNumero,
      },
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/modificadores')
  async aplicarModificadorPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AplicarModificadorPersonagemCampanhaDto,
  ) {
    return this.campanhaService.aplicarModificadorPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Post(
    ':id/personagens/:personagemCampanhaId/modificadores/:modificadorId/desfazer',
  )
  async desfazerModificadorPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('modificadorId', ParseIntPipe) modificadorId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: DesfazerModificadorPersonagemCampanhaDto,
  ) {
    return this.campanhaService.desfazerModificadorPersonagemCampanha(
      id,
      personagemCampanhaId,
      modificadorId,
      req.user.id,
      dto.motivo,
    );
  }

  @Get(':id/personagens/:personagemCampanhaId/historico')
  async listarHistoricoPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarHistoricoPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  // ----- Inventário de campanha -----

  @Get(':id/personagens/:personagemCampanhaId/inventario')
  async buscarInventarioPersonagemCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.buscarInventarioPersonagemCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/inventario')
  async adicionarItemInventarioCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AdicionarItemInventarioCampanhaDto,
  ) {
    return this.campanhaService.adicionarItemInventarioCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/personagens/:personagemCampanhaId/inventario/:itemId')
  async atualizarItemInventarioCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarItemInventarioCampanhaDto,
  ) {
    return this.campanhaService.atualizarItemInventarioCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      itemId,
      dto,
    );
  }

  @Delete(':id/personagens/:personagemCampanhaId/inventario/:itemId')
  async removerItemInventarioCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.removerItemInventarioCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      itemId,
    );
  }

  @Post(':id/personagens/:personagemCampanhaId/inventario/:itemId/modificacoes')
  async aplicarModificacaoInventarioCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AplicarModificacaoInventarioCampanhaDto,
  ) {
    return this.campanhaService.aplicarModificacaoInventarioCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      itemId,
      dto,
    );
  }

  @Delete(
    ':id/personagens/:personagemCampanhaId/inventario/:itemId/modificacoes/:modificacaoId',
  )
  async removerModificacaoInventarioCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('personagemCampanhaId', ParseIntPipe) personagemCampanhaId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modificacaoId', ParseIntPipe) modificacaoId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.removerModificacaoInventarioCampanha(
      id,
      personagemCampanhaId,
      req.user.id,
      itemId,
      modificacaoId,
    );
  }

  // ----- Itens de sessão da campanha -----

  @Get(':id/itens-sessao')
  async listarItensSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarItensSessaoCampanha(id, req.user.id);
  }

  @Post(':id/itens-sessao')
  async criarItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CriarItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.criarItemSessaoCampanha(id, req.user.id, dto);
  }

  @Get(':id/itens-sessao/transferencias/pendentes')
  async listarTransferenciasItensSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarTransferenciasItensSessaoCampanha(
      id,
      req.user.id,
    );
  }

  @Post(':id/itens-sessao/transferencias/:transferenciaId/aceitar')
  async aceitarTransferenciaItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('transferenciaId', ParseIntPipe) transferenciaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.aceitarTransferenciaItemSessaoCampanha(
      id,
      req.user.id,
      transferenciaId,
    );
  }

  @Post(':id/itens-sessao/transferencias/:transferenciaId/recusar')
  async recusarTransferenciaItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('transferenciaId', ParseIntPipe) transferenciaId: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.recusarTransferenciaItemSessaoCampanha(
      id,
      req.user.id,
      transferenciaId,
    );
  }

  @Get(':id/itens-sessao/templates')
  async listarTemplatesItensSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.listarTemplatesItensSessaoCampanha(
      id,
      req.user.id,
    );
  }

  @Post(':id/itens-sessao/templates')
  async criarTemplateItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CriarTemplateItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.criarTemplateItemSessaoCampanha(
      id,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/itens-sessao/templates/:templateId')
  async atualizarTemplateItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarTemplateItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.atualizarTemplateItemSessaoCampanha(
      id,
      req.user.id,
      templateId,
      dto,
    );
  }

  @Post(':id/itens-sessao/templates/:templateId/instanciar')
  async instanciarTemplateItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: Partial<CriarItemSessaoCampanhaDto>,
  ) {
    return this.campanhaService.instanciarTemplateItemSessaoCampanha(
      id,
      req.user.id,
      templateId,
      dto,
    );
  }

  @Patch(':id/itens-sessao/:itemId')
  async atualizarItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtualizarItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.atualizarItemSessaoCampanha(
      id,
      req.user.id,
      itemId,
      dto,
    );
  }

  @Patch(':id/itens-sessao/:itemId/atribuicao')
  async atribuirItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: AtribuirItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.atribuirItemSessaoCampanha(
      id,
      req.user.id,
      itemId,
      dto,
    );
  }

  @Patch(':id/itens-sessao/:itemId/revelacao')
  async revelarItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: RevelarItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.revelarItemSessaoCampanha(
      id,
      req.user.id,
      itemId,
      dto,
    );
  }

  @Post(':id/itens-sessao/:itemId/transferencias')
  async solicitarTransferenciaItemSessaoCampanha(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: { id: number } },
    @Body() dto: SolicitarTransferenciaItemSessaoCampanhaDto,
  ) {
    return this.campanhaService.solicitarTransferenciaItemSessaoCampanha(
      id,
      req.user.id,
      itemId,
      dto,
    );
  }

  // ----- Convites -----

  @Post(':id/convites')
  async criarConvite(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
    @Body() dto: CreateConviteDto,
  ) {
    const email = dto.email?.trim();
    const apelido = dto.apelido?.trim();
    const usuarioId = dto.usuarioId;
    if (!email && !apelido && !usuarioId) {
      throw new BadRequestException(
        'Informe email, apelido ou usuário para o convite.',
      );
    }

    return this.campanhaService.criarConvite(
      id,
      req.user.id,
      { email, apelido, usuarioId },
      dto.papel,
    );
  }

  @Get('convites/pendentes')
  async listarConvitesPendentes(@Request() req: { user: { id: number } }) {
    return this.campanhaService.listarConvitesPendentesPorUsuario(req.user.id);
  }

  @Post('convites/:codigo/aceitar')
  async aceitarConvite(
    @Param('codigo') codigo: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.aceitarConvite(codigo, req.user.id);
  }

  @Post('convites/:codigo/recusar')
  async recusarConvite(
    @Param('codigo') codigo: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.campanhaService.recusarConvite(codigo, req.user.id);
  }
}
