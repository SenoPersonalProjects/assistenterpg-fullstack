// src/campanha/campanha.service.ts

import { Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaNaoEncontradaException,
  CampanhaAcessoNegadoException,
  CampanhaApenasDonoException,
} from 'src/common/exceptions/campanha.exception';
import { AplicarModificadorPersonagemCampanhaDto } from './dto/aplicar-modificador-personagem-campanha.dto';
import { AtualizarNucleoPersonagemCampanhaDto } from './dto/atualizar-nucleo-personagem-campanha.dto';
import { AtualizarRecursosPersonagemCampanhaDto } from './dto/atualizar-recursos-personagem-campanha.dto';
import {
  AdicionarItemInventarioCampanhaDto,
  AtualizarItemInventarioCampanhaDto,
  AplicarModificacaoInventarioCampanhaDto,
} from './dto/inventario-campanha.dto';
import { SacrificarNucleoPersonagemCampanhaDto } from './dto/sacrificar-nucleo-personagem-campanha.dto';
import {
  FiltrosListarModificadoresCampanha,
  PapelCampanha,
} from './engine/campanha.engine.types';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaPersonagensService } from './campanha.personagens.service';
import { CampanhaModificadoresService } from './campanha.modificadores.service';
import { CampanhaConvitesService } from './campanha.convites.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
import { CampanhaItensSessaoService } from './campanha.itens-sessao.service';
import {
  AtribuirItemSessaoCampanhaDto,
  AtualizarItemSessaoCampanhaDto,
  AtualizarTemplateItemSessaoCampanhaDto,
  CriarItemSessaoCampanhaDto,
  CriarTemplateItemSessaoCampanhaDto,
  RevelarItemSessaoCampanhaDto,
  SolicitarTransferenciaItemSessaoCampanhaDto,
} from './dto/itens-sessao-campanha.dto';

@Injectable()
export class CampanhaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
    private readonly personagensService: CampanhaPersonagensService,
    private readonly modificadoresService: CampanhaModificadoresService,
    private readonly convitesService: CampanhaConvitesService,
    private readonly inventarioService: CampanhaInventarioService,
    private readonly itensSessaoService: CampanhaItensSessaoService,
  ) {}

  async criarCampanha(
    donoId: number,
    dto: { nome: string; descricao?: string },
  ) {
    return this.prisma.campanha.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? '',
        status: 'ATIVA',
        donoId,
      },
      include: {
        dono: {
          select: { id: true, apelido: true, email: true },
        },
        _count: {
          select: { membros: true, personagens: true, sessoes: true },
        },
      },
    });
  }

  async listarMinhasCampanhas(
    usuarioId: number,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      OR: [
        { donoId: usuarioId },
        {
          membros: {
            some: { usuarioId },
          },
        },
      ],
    };

    const include = {
      dono: {
        select: { id: true, apelido: true },
      },
      _count: {
        select: { membros: true, personagens: true, sessoes: true },
      },
    };

    const orderBy = {
      criadoEm: 'desc' as const,
    };

    if (!page || !limit) {
      return this.prisma.campanha.findMany({
        where,
        include,
        orderBy,
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.campanha.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.campanha.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarPorIdParaUsuario(id: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id },
      include: {
        dono: { select: { id: true, apelido: true } },
        membros: {
          include: {
            usuario: { select: { id: true, apelido: true } },
          },
        },
        _count: {
          select: { personagens: true, sessoes: true },
        },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(id);
    }

    const ehDono = campanha.donoId === usuarioId;
    const ehMembro = campanha.membros.some((m) => m.usuarioId === usuarioId);

    if (!ehDono && !ehMembro) {
      throw new CampanhaAcessoNegadoException(id, usuarioId);
    }

    return campanha;
  }

  async excluirCampanha(campanhaId: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: { donoId: true },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== usuarioId) {
      throw new CampanhaApenasDonoException('excluir a campanha');
    }

    await this.prisma.campanha.delete({
      where: { id: campanhaId },
    });

    return {
      message: 'Campanha excluida com sucesso',
      id: campanhaId,
    };
  }

  async listarMembros(campanhaId: number, usuarioId: number) {
    await this.accessService.garantirAcesso(campanhaId, usuarioId);

    return this.prisma.membroCampanha.findMany({
      where: { campanhaId },
      include: {
        usuario: {
          select: { id: true, apelido: true, email: true },
        },
      },
      orderBy: { entrouEm: 'asc' },
    });
  }

  async adicionarMembro(
    campanhaId: number,
    solicitanteId: number,
    dados: { usuarioId: number; papel: PapelCampanha },
  ) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    if (campanha.donoId !== solicitanteId) {
      throw new CampanhaApenasDonoException('gerenciar membros');
    }

    return this.prisma.membroCampanha.create({
      data: {
        campanhaId,
        usuarioId: dados.usuarioId,
        papel: dados.papel,
      },
      include: {
        usuario: { select: { id: true, apelido: true, email: true } },
      },
    });
  }

  async listarPersonagensCampanha(campanhaId: number, usuarioId: number) {
    return this.personagensService.listarPersonagensCampanha(
      campanhaId,
      usuarioId,
    );
  }

  async listarPersonagensBaseDisponiveisParaAssociacao(
    campanhaId: number,
    usuarioId: number,
  ) {
    return this.personagensService.listarPersonagensBaseDisponiveisParaAssociacao(
      campanhaId,
      usuarioId,
    );
  }

  async vincularPersonagemBase(
    campanhaId: number,
    solicitanteId: number,
    personagemBaseId: number,
    sincronizarTecnicaInata = false,
  ) {
    return this.personagensService.vincularPersonagemBase(
      campanhaId,
      solicitanteId,
      personagemBaseId,
      sincronizarTecnicaInata,
    );
  }

  async desassociarPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    return this.personagensService.desassociarPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
    );
  }

  async atualizarRecursosPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AtualizarRecursosPersonagemCampanhaDto,
  ) {
    return this.personagensService.atualizarRecursosPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
  }

  async atualizarNucleoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AtualizarNucleoPersonagemCampanhaDto,
  ) {
    return this.personagensService.atualizarNucleoPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
  }

  async sacrificarNucleoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: SacrificarNucleoPersonagemCampanhaDto,
  ) {
    return this.personagensService.sacrificarNucleoPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
  }

  async listarModificadoresPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    incluirInativos = false,
    filtros: FiltrosListarModificadoresCampanha = {},
  ) {
    return this.modificadoresService.listarModificadoresPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      incluirInativos,
      filtros,
    );
  }

  async aplicarModificadorPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AplicarModificadorPersonagemCampanhaDto,
  ) {
    return this.modificadoresService.aplicarModificadorPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
  }

  async desfazerModificadorPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    modificadorId: number,
    usuarioId: number,
    motivo?: string,
  ) {
    return this.modificadoresService.desfazerModificadorPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      modificadorId,
      usuarioId,
      motivo,
    );
  }

  async listarHistoricoPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    return this.personagensService.listarHistoricoPersonagemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
    );
  }

  async buscarInventarioPersonagemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    return this.inventarioService.buscarInventarioCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
    );
  }

  async adicionarItemInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AdicionarItemInventarioCampanhaDto,
  ) {
    return this.inventarioService.adicionarItemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
  }

  async atualizarItemInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtualizarItemInventarioCampanhaDto,
  ) {
    return this.inventarioService.atualizarItemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      itemId,
      dto,
    );
  }

  async removerItemInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
  ) {
    return this.inventarioService.removerItemCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      itemId,
    );
  }

  async aplicarModificacaoInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AplicarModificacaoInventarioCampanhaDto,
  ) {
    return this.inventarioService.aplicarModificacaoCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      itemId,
      dto,
    );
  }

  async removerModificacaoInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    modificacaoId: number,
  ) {
    return this.inventarioService.removerModificacaoCampanha(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      itemId,
      modificacaoId,
    );
  }

  async listarItensSessaoCampanha(campanhaId: number, usuarioId: number) {
    return this.itensSessaoService.listarItens(campanhaId, usuarioId);
  }

  async listarTransferenciasItensSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
  ) {
    return this.itensSessaoService.listarTransferenciasPendentes(
      campanhaId,
      usuarioId,
    );
  }

  async listarTemplatesItensSessaoCampanha(campanhaId: number, usuarioId: number) {
    return this.itensSessaoService.listarTemplates(campanhaId, usuarioId);
  }

  async criarTemplateItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    dto: CriarTemplateItemSessaoCampanhaDto,
  ) {
    return this.itensSessaoService.criarTemplate(campanhaId, usuarioId, dto);
  }

  async atualizarTemplateItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    templateId: number,
    dto: AtualizarTemplateItemSessaoCampanhaDto,
  ) {
    return this.itensSessaoService.atualizarTemplate(
      campanhaId,
      usuarioId,
      templateId,
      dto,
    );
  }

  async instanciarTemplateItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    templateId: number,
    dto: Partial<CriarItemSessaoCampanhaDto>,
  ) {
    return this.itensSessaoService.instanciarTemplate(
      campanhaId,
      usuarioId,
      templateId,
      dto,
    );
  }

  async criarItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    dto: CriarItemSessaoCampanhaDto,
  ) {
    const item = await this.itensSessaoService.criarItem(campanhaId, usuarioId, dto);
    if (item.personagemCampanhaId) {
      await this.inventarioService.recalcularEstadoInventarioCampanha(
        item.personagemCampanhaId,
      );
    }
    return item;
  }

  async atualizarItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtualizarItemSessaoCampanhaDto,
  ) {
    const anterior = await this.prisma.itemSessaoCampanha.findFirst({
      where: { id: itemId, campanhaId },
      select: { personagemCampanhaId: true },
    });
    const item = await this.itensSessaoService.atualizarItem(
      campanhaId,
      usuarioId,
      itemId,
      dto,
    );
    const ids = new Set<number>();
    if (anterior?.personagemCampanhaId) ids.add(anterior.personagemCampanhaId);
    if (item.personagemCampanhaId) ids.add(item.personagemCampanhaId);
    await Promise.all(
      [...ids].map((id) =>
        this.inventarioService.recalcularEstadoInventarioCampanha(id),
      ),
    );
    return item;
  }

  async atribuirItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtribuirItemSessaoCampanhaDto,
  ) {
    const anterior = await this.prisma.itemSessaoCampanha.findFirst({
      where: { id: itemId, campanhaId },
      select: { personagemCampanhaId: true },
    });
    const item = await this.itensSessaoService.atribuirItem(
      campanhaId,
      usuarioId,
      itemId,
      dto,
    );
    const ids = new Set<number>();
    if (anterior?.personagemCampanhaId) ids.add(anterior.personagemCampanhaId);
    if (item.personagemCampanhaId) ids.add(item.personagemCampanhaId);
    await Promise.all(
      [...ids].map((id) =>
        this.inventarioService.recalcularEstadoInventarioCampanha(id),
      ),
    );
    return item;
  }

  async revelarItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: RevelarItemSessaoCampanhaDto,
  ) {
    return this.itensSessaoService.revelarItem(campanhaId, usuarioId, itemId, dto);
  }

  async solicitarTransferenciaItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: SolicitarTransferenciaItemSessaoCampanhaDto,
  ) {
    return this.itensSessaoService.solicitarTransferencia(
      campanhaId,
      usuarioId,
      itemId,
      dto,
    );
  }

  async aceitarTransferenciaItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    transferenciaId: number,
  ) {
    const transferencia = await this.prisma.transferenciaItemSessaoCampanha.findFirst({
      where: { id: transferenciaId, campanhaId },
      select: {
        portadorAnteriorId: true,
        destinoPersonagemCampanhaId: true,
      },
    });
    const resultado = await this.itensSessaoService.aceitarTransferencia(
      campanhaId,
      usuarioId,
      transferenciaId,
    );
    const ids = new Set<number>();
    if (transferencia?.portadorAnteriorId) ids.add(transferencia.portadorAnteriorId);
    if (transferencia?.destinoPersonagemCampanhaId) {
      ids.add(transferencia.destinoPersonagemCampanhaId);
    }
    await Promise.all(
      [...ids].map((id) =>
        this.inventarioService.recalcularEstadoInventarioCampanha(id),
      ),
    );
    return resultado;
  }

  async recusarTransferenciaItemSessaoCampanha(
    campanhaId: number,
    usuarioId: number,
    transferenciaId: number,
  ) {
    return this.itensSessaoService.recusarTransferencia(
      campanhaId,
      usuarioId,
      transferenciaId,
    );
  }

  async criarConvitePorEmail(
    campanhaId: number,
    donoId: number,
    email: string,
    papel: PapelCampanha,
  ) {
    return this.convitesService.criarConvitePorEmail(
      campanhaId,
      donoId,
      email,
      papel,
    );
  }

  async criarConvite(
    campanhaId: number,
    donoId: number,
    dados: { email?: string; apelido?: string },
    papel: PapelCampanha,
  ) {
    return this.convitesService.criarConvite(campanhaId, donoId, dados, papel);
  }

  async listarConvitesPendentesPorUsuario(usuarioId: number) {
    return this.convitesService.listarConvitesPendentesPorUsuario(usuarioId);
  }

  async aceitarConvite(codigo: string, usuarioId: number) {
    return this.convitesService.aceitarConvite(codigo, usuarioId);
  }

  async recusarConvite(codigo: string, usuarioId: number) {
    return this.convitesService.recusarConvite(codigo, usuarioId);
  }
}
