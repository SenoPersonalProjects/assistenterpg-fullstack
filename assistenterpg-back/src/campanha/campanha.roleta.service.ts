import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  CampanhaRoletaEventoTipo,
  CampanhaRoletaModo,
  CampanhaRoletaSlot,
  CampanhaRoletaSorteioStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import {
  CampanhaRoletaAcessoNegadoException,
  CampanhaRoletaConfigInvalidaException,
  CampanhaRoletaConflitoException,
  CampanhaRoletaIdempotenciaConflitoException,
  CampanhaRoletaPermissaoInvalidaException,
  CampanhaRoletaSorteioInvalidoException,
  CampanhaRoletaSorteioNaoEncontradoException,
} from '../common/exceptions/campanha-roleta.exception';
import type {
  AcaoSorteioCampanhaRoletaDto,
  EscolherSorteioCampanhaRoletaDto,
  HistoricoCampanhaRoletaQueryDto,
  IniciarSorteioCampanhaRoletaDto,
  PreviewCampanhaRoletaDto,
  SalvarPermissaoCampanhaRoletaDto,
  SalvarPresetCampanhaRoletaDto,
} from './dto/campanha-roleta.dto';
import {
  CAMPANHA_ROLETA_CONFIG_VERSAO,
  criarPresetsPadraoRoleta,
  filtrarCatalogoRoletaPorFontes,
  montarPoolRoleta,
  normalizarConfigRoleta,
  sortearItemRoleta,
  type CampanhaRoletaCatalogoItem,
  type CampanhaRoletaConfigV1,
  type CampanhaRoletaPoolItem,
  type CampanhaRoletaPoolSnapshot,
} from './campanha-roleta';

const sorteioInclude = Prisma.validator<Prisma.CampanhaRoletaSorteioInclude>()({
  alvo: { select: { id: true, apelido: true } },
  iniciadoPor: { select: { id: true, apelido: true } },
  finalizadoPor: { select: { id: true, apelido: true } },
  canceladoPor: { select: { id: true, apelido: true } },
});

type SorteioComAtores = Prisma.CampanhaRoletaSorteioGetPayload<{
  include: typeof sorteioInclude;
}>;

type CapacidadesRoleta = {
  ehMestre: boolean;
  papel: string | null;
  podeConfigurar: boolean;
  podeGirar: boolean;
  podeIniciar: boolean;
  podeCancelar: boolean;
  podeGerenciarPermissoes: boolean;
};

type RespostaMutacao<T> = {
  dados: T;
  emitir: boolean;
  eventoTipo: CampanhaRoletaEventoTipo;
};

@Injectable()
export class CampanhaRoletaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  private json(valor: unknown): Prisma.InputJsonValue {
    return valor as Prisma.InputJsonValue;
  }

  private hashIntencao(valor: unknown): string {
    return createHash('sha256').update(JSON.stringify(valor)).digest('hex');
  }

  private async garantirPresets(campanhaId: number, usuarioId?: number) {
    await this.prisma.campanhaRoletaPreset.createMany({
      data: criarPresetsPadraoRoleta(usuarioId).map((preset) => ({
        campanhaId,
        ...preset,
      })),
      skipDuplicates: true,
    });
  }

  private async obterCapacidades(
    campanhaId: number,
    usuarioId: number,
  ): Promise<CapacidadesRoleta> {
    const acesso = await this.accessService.garantirAcesso(
      campanhaId,
      usuarioId,
    );
    const permissao = acesso.ehMestre
      ? null
      : await this.prisma.campanhaRoletaPermissao.findUnique({
          where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
        });
    const podeConfigurar =
      acesso.ehMestre || permissao?.podeConfigurar === true;
    const podeGirar = acesso.ehMestre || permissao?.podeGirar === true;
    return {
      ehMestre: acesso.ehMestre,
      papel: acesso.papel,
      podeConfigurar,
      podeGirar,
      podeIniciar: podeConfigurar || podeGirar,
      podeCancelar: podeConfigurar,
      podeGerenciarPermissoes: acesso.ehMestre,
    };
  }

  private exigir(capacidade: boolean, acao: string): void {
    if (!capacidade) throw new CampanhaRoletaAcessoNegadoException(acao);
  }

  private validarModoSlot(
    slot: CampanhaRoletaSlot,
    modo: CampanhaRoletaModo,
  ): void {
    if (slot === 'CLA' && modo !== 'CLA') {
      throw new CampanhaRoletaConfigInvalidaException(
        'o slot CLA deve permanecer no modo CLA',
      );
    }
    if (slot === 'TECNICA' && modo !== 'TECNICA') {
      throw new CampanhaRoletaConfigInvalidaException(
        'o slot TECNICA deve permanecer no modo TECNICA',
      );
    }
  }

  private normalizarConfig(config: unknown): CampanhaRoletaConfigV1 {
    try {
      return normalizarConfigRoleta(config);
    } catch (error) {
      throw new CampanhaRoletaConfigInvalidaException(
        error instanceof Error ? error.message : 'config desconhecida',
      );
    }
  }

  private dadosHomebrew(dados: Prisma.JsonValue): Record<string, unknown> {
    return dados && typeof dados === 'object' && !Array.isArray(dados)
      ? (dados as Record<string, unknown>)
      : {};
  }

  private async carregarCatalogo(campanhaId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        donoId: true,
        dono: { select: { id: true, apelido: true } },
        membros: {
          select: {
            usuarioId: true,
            papel: true,
            usuario: { select: { id: true, apelido: true } },
          },
        },
      },
    });
    if (!campanha) {
      await this.accessService.garantirAcesso(campanhaId, -1);
      throw new Error('campanha inexistente');
    }
    const usuariosAtuais = [
      campanha.donoId,
      ...campanha.membros.map((membro) => membro.usuarioId),
    ];
    const [suplementos, clas, tecnicas, homebrews] = await Promise.all([
      this.prisma.suplemento.findMany({
        where: { status: 'PUBLICADO' },
        select: { id: true, codigo: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.cla.findMany({
        where: {
          OR: [
            { fonte: 'SISTEMA_BASE' },
            { fonte: 'SUPLEMENTO', suplemento: { status: 'PUBLICADO' } },
          ],
        },
        select: { id: true, nome: true, fonte: true, suplementoId: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.tecnicaAmaldicoada.findMany({
        where: {
          tipo: 'INATA',
          OR: [
            { fonte: 'SISTEMA_BASE' },
            { fonte: 'SUPLEMENTO', suplemento: { status: 'PUBLICADO' } },
          ],
        },
        select: {
          id: true,
          nome: true,
          fonte: true,
          suplementoId: true,
          hereditaria: true,
          clas: { select: { claId: true } },
        },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.homebrew.findMany({
        where: {
          usuarioId: { in: usuariosAtuais },
          status: 'PUBLICADO',
          tipo: { in: ['CLA', 'TECNICA_AMALDICOADA'] },
        },
        select: {
          id: true,
          nome: true,
          tipo: true,
          dados: true,
          usuarioId: true,
          usuario: { select: { id: true, apelido: true } },
        },
        orderBy: { nome: 'asc' },
      }),
    ]);

    const itens: CampanhaRoletaCatalogoItem[] = [
      ...clas.map((cla) => ({
        chave: `CLA:${cla.id}`,
        nome: cla.nome,
        categoria: 'CLA' as const,
        fonte: cla.fonte,
        fonteId: cla.suplementoId ?? undefined,
      })),
      ...tecnicas.map((tecnica) => ({
        chave: `TECNICA:${tecnica.id}`,
        nome: tecnica.nome,
        categoria: 'TECNICA' as const,
        fonte: tecnica.fonte,
        fonteId: tecnica.suplementoId ?? undefined,
        hereditaria: tecnica.hereditaria,
        claCompativeisChaves: tecnica.clas.map((item) => `CLA:${item.claId}`),
      })),
      ...homebrews.map((homebrew) => {
        const dados = this.dadosHomebrew(homebrew.dados);
        const categoria =
          homebrew.tipo === 'CLA' ? ('CLA' as const) : ('TECNICA' as const);
        return {
          chave: `HOMEBREW:${categoria}:${homebrew.id}`,
          nome: homebrew.nome,
          categoria,
          fonte: 'HOMEBREW' as const,
          fonteId: homebrew.id,
          hereditaria: categoria === 'TECNICA' && dados.hereditaria === true,
          claCompativeisChaves: [] as string[],
        };
      }),
    ];
    return {
      itens,
      suplementos,
      homebrews: homebrews.map((homebrew) => ({
        id: homebrew.id,
        nome: homebrew.nome,
        tipo: homebrew.tipo,
        autor: homebrew.usuario,
      })),
      participantes: [
        { ...campanha.dono, papel: 'DONO' },
        ...campanha.membros.map((membro) => ({
          ...membro.usuario,
          papel: membro.papel,
        })),
      ],
    };
  }

  private filtrarCatalogoPorFontes(
    catalogo: CampanhaRoletaCatalogoItem[],
    config: CampanhaRoletaConfigV1,
  ): CampanhaRoletaCatalogoItem[] {
    return filtrarCatalogoRoletaPorFontes(catalogo, config);
  }

  private async resolverPool(params: {
    campanhaId: number;
    modo: CampanhaRoletaModo;
    config: CampanhaRoletaConfigV1;
    claSelecionadoChave?: string;
    claDuplicadoChave?: string;
  }): Promise<CampanhaRoletaPoolSnapshot> {
    const catalogo = await this.carregarCatalogo(params.campanhaId);
    try {
      const pool = montarPoolRoleta({
        ...params,
        catalogo: this.filtrarCatalogoPorFontes(catalogo.itens, params.config),
      });
      if (
        params.claDuplicadoChave &&
        !pool.itens.some((item) => item.chave === params.claDuplicadoChave)
      ) {
        throw new Error('o cla escolhido para duplicar nao pertence ao pool');
      }
      return pool;
    } catch (error) {
      throw new CampanhaRoletaConfigInvalidaException(
        error instanceof Error ? error.message : 'pool invalido',
      );
    }
  }

  private mapearSorteio(sorteio: SorteioComAtores) {
    return {
      id: sorteio.id,
      campanhaId: sorteio.campanhaId,
      presetId: sorteio.presetId,
      slot: sorteio.slot,
      modo: sorteio.modo,
      alvo: sorteio.alvo,
      status: sorteio.status,
      configSnapshot: sorteio.configSnapshot,
      poolSnapshot: sorteio.poolSnapshot,
      resultados: sorteio.resultados,
      resultadoFinal: sorteio.resultadoFinal,
      revisao: sorteio.revisao,
      iniciadoPor: sorteio.iniciadoPor,
      finalizadoPor: sorteio.finalizadoPor,
      canceladoPor: sorteio.canceladoPor,
      criadoEm: sorteio.criadoEm,
      atualizadoEm: sorteio.atualizadoEm,
      finalizadoEm: sorteio.finalizadoEm,
      canceladoEm: sorteio.canceladoEm,
    };
  }

  private normalizarPoolSnapshot(
    valor: Prisma.JsonValue,
  ): CampanhaRoletaPoolSnapshot {
    const pool = valor as unknown as CampanhaRoletaPoolSnapshot;
    if (
      !pool ||
      !Array.isArray(pool.itens) ||
      typeof pool.pesoTotal !== 'number'
    ) {
      throw new CampanhaRoletaSorteioInvalidoException(
        'snapshot do pool esta corrompido',
      );
    }
    return pool;
  }

  private normalizarResultados(
    valor: Prisma.JsonValue,
  ): CampanhaRoletaPoolItem[] {
    return Array.isArray(valor)
      ? (valor as unknown as CampanhaRoletaPoolItem[])
      : [];
  }

  private async obterReplay(
    campanhaId: number,
    usuarioId: number,
    clientRequestId: string,
    intencaoHash: string,
  ): Promise<RespostaMutacao<unknown> | null> {
    const evento = await this.prisma.campanhaRoletaEvento.findUnique({
      where: {
        campanhaId_atorUsuarioId_clientRequestId: {
          campanhaId,
          atorUsuarioId: usuarioId,
          clientRequestId,
        },
      },
      select: { intencaoHash: true, resposta: true, tipo: true },
    });
    if (!evento) return null;
    if (evento.intencaoHash !== intencaoHash) {
      throw new CampanhaRoletaIdempotenciaConflitoException(clientRequestId);
    }
    return {
      dados: evento.resposta,
      emitir: false,
      eventoTipo: evento.tipo,
    };
  }

  private async tratarConflitoIdempotencia<T>(params: {
    error: unknown;
    campanhaId: number;
    usuarioId: number;
    clientRequestId: string;
    intencaoHash: string;
  }): Promise<RespostaMutacao<T>> {
    if (
      params.error instanceof Prisma.PrismaClientKnownRequestError &&
      params.error.code === 'P2002'
    ) {
      const replay = await this.obterReplay(
        params.campanhaId,
        params.usuarioId,
        params.clientRequestId,
        params.intencaoHash,
      );
      if (replay) return replay as RespostaMutacao<T>;
      throw new CampanhaRoletaConflitoException(
        'ja existe um sorteio ativo neste preset',
      );
    }
    throw params.error;
  }

  private async validarAlvo(campanhaId: number, alvoUsuarioId?: number) {
    if (!alvoUsuarioId) return null;
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        donoId: true,
        dono: { select: { id: true, apelido: true } },
        membros: {
          where: { usuarioId: alvoUsuarioId },
          select: {
            papel: true,
            usuario: { select: { id: true, apelido: true } },
          },
        },
      },
    });
    if (campanha?.donoId === alvoUsuarioId) return campanha.dono;
    const membro = campanha?.membros[0];
    if (!membro || membro.papel === 'OBSERVADOR') {
      throw new CampanhaRoletaSorteioInvalidoException(
        'o alvo deve ser dono, MESTRE ou JOGADOR atual da campanha',
      );
    }
    return membro.usuario;
  }

  async obterEstado(campanhaId: number, usuarioId: number) {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    await this.garantirPresets(campanhaId, usuarioId);
    const [presets, permissoes, sorteiosAtivos, catalogo] = await Promise.all([
      this.prisma.campanhaRoletaPreset.findMany({
        where: { campanhaId },
        orderBy: { id: 'asc' },
      }),
      this.prisma.campanhaRoletaPermissao.findMany({
        where: { campanhaId },
        include: {
          membro: {
            select: { usuario: { select: { id: true, apelido: true } } },
          },
        },
        orderBy: { usuarioId: 'asc' },
      }),
      this.prisma.campanhaRoletaSorteio.findMany({
        where: { campanhaId, chaveAtiva: { not: null } },
        include: sorteioInclude,
      }),
      this.carregarCatalogo(campanhaId),
    ]);
    return {
      campanhaId,
      capacidades,
      presets: presets.map((preset) => ({
        ...preset,
        config: this.normalizarConfig(preset.config),
      })),
      permissoes: capacidades.podeGerenciarPermissoes
        ? permissoes.map(({ membro, ...permissao }) => ({
            ...permissao,
            usuario: membro.usuario,
          }))
        : [],
      sorteiosAtivos: sorteiosAtivos.map((sorteio) =>
        this.mapearSorteio(sorteio),
      ),
      catalogo,
    };
  }

  async preview(
    campanhaId: number,
    usuarioId: number,
    dto: PreviewCampanhaRoletaDto,
  ) {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    this.exigir(capacidades.podeConfigurar, 'pre-visualizar configuracoes');
    this.validarModoSlot(dto.slot, dto.modo);
    const config = this.normalizarConfig(dto.config);
    return this.resolverPool({
      campanhaId,
      modo: dto.modo,
      config,
      claSelecionadoChave: dto.claSelecionadoChave,
      claDuplicadoChave: dto.claDuplicadoChave,
    });
  }

  async salvarPreset(
    campanhaId: number,
    slot: CampanhaRoletaSlot,
    usuarioId: number,
    dto: SalvarPresetCampanhaRoletaDto,
  ) {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    this.exigir(capacidades.podeConfigurar, 'configurar a roleta');
    this.validarModoSlot(slot, dto.modo);
    const config = this.normalizarConfig(dto.config);
    await this.resolverPool({ campanhaId, modo: dto.modo, config });
    await this.garantirPresets(campanhaId, usuarioId);
    const atualizada = await this.prisma.campanhaRoletaPreset.updateMany({
      where: { campanhaId, slot, revisao: dto.revisaoEsperada },
      data: {
        modo: dto.modo,
        configVersao: CAMPANHA_ROLETA_CONFIG_VERSAO,
        config: this.json(config),
        revisao: { increment: 1 },
        atualizadoPorId: usuarioId,
      },
    });
    if (atualizada.count !== 1) {
      throw new CampanhaRoletaConflitoException('revisao do preset divergente');
    }
    return this.prisma.campanhaRoletaPreset.findUniqueOrThrow({
      where: { campanhaId_slot: { campanhaId, slot } },
    });
  }

  async salvarPermissao(
    campanhaId: number,
    usuarioAlvoId: number,
    usuarioId: number,
    dto: SalvarPermissaoCampanhaRoletaDto,
  ) {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    this.exigir(
      capacidades.podeGerenciarPermissoes,
      'gerenciar permissoes da roleta',
    );
    const membro = await this.prisma.membroCampanha.findUnique({
      where: {
        campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvoId },
      },
      select: { papel: true },
    });
    if (!membro || membro.papel !== 'JOGADOR') {
      throw new CampanhaRoletaPermissaoInvalidaException(
        'somente membros JOGADOR podem receber delegacao',
      );
    }
    if (!dto.podeConfigurar && !dto.podeGirar) {
      await this.prisma.campanhaRoletaPermissao.deleteMany({
        where: { campanhaId, usuarioId: usuarioAlvoId },
      });
      return { usuarioId: usuarioAlvoId, removida: true };
    }
    const permissao = await this.prisma.campanhaRoletaPermissao.upsert({
      where: {
        campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvoId },
      },
      create: {
        campanhaId,
        usuarioId: usuarioAlvoId,
        podeConfigurar: dto.podeConfigurar,
        podeGirar: dto.podeGirar,
        concedidoPorId: usuarioId,
      },
      update: {
        podeConfigurar: dto.podeConfigurar,
        podeGirar: dto.podeGirar,
        concedidoPorId: usuarioId,
      },
      include: {
        membro: {
          select: { usuario: { select: { id: true, apelido: true } } },
        },
      },
    });
    const { membro: membroPermissao, ...dados } = permissao;
    return { ...dados, usuario: membroPermissao.usuario };
  }

  async removerPermissao(
    campanhaId: number,
    usuarioAlvoId: number,
    usuarioId: number,
  ) {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    this.exigir(
      capacidades.podeGerenciarPermissoes,
      'gerenciar permissoes da roleta',
    );
    await this.prisma.campanhaRoletaPermissao.deleteMany({
      where: { campanhaId, usuarioId: usuarioAlvoId },
    });
    return { usuarioId: usuarioAlvoId, removida: true };
  }

  private async claAnteriorDoAlvo(
    campanhaId: number,
    alvoUsuarioId?: number,
  ): Promise<string | undefined> {
    if (!alvoUsuarioId) return undefined;
    const anterior = await this.prisma.campanhaRoletaSorteio.findFirst({
      where: {
        campanhaId,
        alvoUsuarioId,
        modo: 'CLA',
        status: 'FINALIZADO',
        resultadoFinal: { not: Prisma.JsonNull },
      },
      orderBy: { finalizadoEm: 'desc' },
      select: { resultadoFinal: true },
    });
    const resultado = anterior?.resultadoFinal as
      | { chave?: unknown }
      | undefined;
    return typeof resultado?.chave === 'string' ? resultado.chave : undefined;
  }

  async iniciarSorteio(
    campanhaId: number,
    usuarioId: number,
    dto: IniciarSorteioCampanhaRoletaDto,
  ): Promise<RespostaMutacao<unknown>> {
    const capacidades = await this.obterCapacidades(campanhaId, usuarioId);
    this.exigir(capacidades.podeIniciar, 'iniciar um sorteio');
    await this.validarAlvo(campanhaId, dto.alvoUsuarioId);
    await this.garantirPresets(campanhaId, usuarioId);
    const preset = await this.prisma.campanhaRoletaPreset.findUniqueOrThrow({
      where: { campanhaId_slot: { campanhaId, slot: dto.slot } },
    });
    if (preset.revisao !== dto.presetRevisaoEsperada) {
      throw new CampanhaRoletaConflitoException('revisao do preset divergente');
    }
    const config = this.normalizarConfig(preset.config);
    if (
      preset.modo === 'TECNICA' &&
      !dto.alvoUsuarioId &&
      !capacidades.ehMestre
    ) {
      throw new CampanhaRoletaSorteioInvalidoException(
        'um delegado deve informar o jogador-alvo no sorteio de tecnica',
      );
    }
    const claSelecionadoChave =
      dto.claSelecionadoChave ??
      (preset.modo === 'TECNICA'
        ? await this.claAnteriorDoAlvo(campanhaId, dto.alvoUsuarioId)
        : undefined);
    if (preset.modo === 'TECNICA' && !claSelecionadoChave) {
      throw new CampanhaRoletaSorteioInvalidoException(
        'um cla deve ser informado ou sorteado anteriormente para o alvo',
      );
    }
    const pool = await this.resolverPool({
      campanhaId,
      modo: preset.modo,
      config,
      claSelecionadoChave,
      claDuplicadoChave: dto.claDuplicadoChave,
    });
    const intencao = {
      operacao: 'INICIAR',
      campanhaId,
      usuarioId,
      ...dto,
      claSelecionadoChave,
    };
    const intencaoHash = this.hashIntencao(intencao);
    const replay = await this.obterReplay(
      campanhaId,
      usuarioId,
      dto.clientRequestId,
      intencaoHash,
    );
    if (replay) return replay;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const sorteio = await tx.campanhaRoletaSorteio.create({
          data: {
            campanhaId,
            presetId: preset.id,
            slot: preset.slot,
            modo: preset.modo,
            alvoUsuarioId: dto.alvoUsuarioId,
            chaveAtiva: `${campanhaId}:${preset.slot}`,
            configSnapshot: this.json({
              slot: preset.slot,
              modo: preset.modo,
              configVersao: preset.configVersao,
              presetRevisao: preset.revisao,
              config,
            }),
            poolSnapshot: this.json(pool),
            resultados: this.json([]),
            iniciadoPorId: usuarioId,
          },
          include: sorteioInclude,
        });
        const resposta = { sorteio: this.mapearSorteio(sorteio) };
        const evento = await tx.campanhaRoletaEvento.create({
          data: {
            campanhaId,
            sorteioId: sorteio.id,
            atorUsuarioId: usuarioId,
            tipo: 'SORTEIO_INICIADO',
            clientRequestId: dto.clientRequestId,
            intencaoHash,
            dados: this.json(intencao),
            resposta: this.json(resposta),
          },
        });
        return {
          dados: { ...resposta, eventoId: evento.id },
          emitir: true,
          eventoTipo: evento.tipo,
        };
      });
    } catch (error) {
      return this.tratarConflitoIdempotencia({
        error,
        campanhaId,
        usuarioId,
        clientRequestId: dto.clientRequestId,
        intencaoHash,
      });
    }
  }

  private async buscarSorteioAtivo(campanhaId: number, sorteioId: number) {
    const sorteio = await this.prisma.campanhaRoletaSorteio.findFirst({
      where: { id: sorteioId, campanhaId },
      include: sorteioInclude,
    });
    if (!sorteio)
      throw new CampanhaRoletaSorteioNaoEncontradoException(sorteioId);
    return sorteio;
  }

  private podeDecidir(
    capacidades: CapacidadesRoleta,
    sorteio: SorteioComAtores,
    usuarioId: number,
  ): boolean {
    return capacidades.ehMestre || sorteio.alvoUsuarioId === usuarioId;
  }

  private async executarAcao<T>(params: {
    campanhaId: number;
    sorteioId: number;
    usuarioId: number;
    dto: AcaoSorteioCampanhaRoletaDto;
    eventoTipo: CampanhaRoletaEventoTipo;
    operacao: string;
    validar: (
      capacidades: CapacidadesRoleta,
      sorteio: SorteioComAtores,
    ) => void;
    aplicar: (
      tx: Prisma.TransactionClient,
      sorteio: SorteioComAtores,
    ) => Promise<T>;
  }): Promise<RespostaMutacao<T>> {
    const capacidades = await this.obterCapacidades(
      params.campanhaId,
      params.usuarioId,
    );
    const sorteio = await this.buscarSorteioAtivo(
      params.campanhaId,
      params.sorteioId,
    );
    params.validar(capacidades, sorteio);
    const intencao = {
      operacao: params.operacao,
      campanhaId: params.campanhaId,
      sorteioId: params.sorteioId,
      usuarioId: params.usuarioId,
      ...params.dto,
    };
    const intencaoHash = this.hashIntencao(intencao);
    const replay = await this.obterReplay(
      params.campanhaId,
      params.usuarioId,
      params.dto.clientRequestId,
      intencaoHash,
    );
    if (replay) return replay as RespostaMutacao<T>;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const reserva = await tx.campanhaRoletaEvento.create({
          data: {
            campanhaId: params.campanhaId,
            sorteioId: params.sorteioId,
            atorUsuarioId: params.usuarioId,
            tipo: params.eventoTipo,
            clientRequestId: params.dto.clientRequestId,
            intencaoHash,
            dados: this.json(intencao),
            resposta: this.json({ pendente: true }),
          },
        });
        const resultado = await params.aplicar(tx, sorteio);
        await tx.campanhaRoletaEvento.update({
          where: { id: reserva.id },
          data: { resposta: this.json(resultado) },
        });
        return {
          dados: resultado,
          emitir: true,
          eventoTipo: params.eventoTipo,
        };
      });
    } catch (error) {
      return this.tratarConflitoIdempotencia<T>({
        error,
        campanhaId: params.campanhaId,
        usuarioId: params.usuarioId,
        clientRequestId: params.dto.clientRequestId,
        intencaoHash,
      });
    }
  }

  async girar(
    campanhaId: number,
    sorteioId: number,
    usuarioId: number,
    dto: AcaoSorteioCampanhaRoletaDto,
  ) {
    return this.executarAcao({
      campanhaId,
      sorteioId,
      usuarioId,
      dto,
      eventoTipo: 'GIRO_REALIZADO',
      operacao: 'GIRAR',
      validar: (capacidades, sorteio) => {
        const alvoPodeGirar = sorteio.alvoUsuarioId === usuarioId;
        this.exigir(
          capacidades.podeGirar || alvoPodeGirar,
          'girar esta roleta',
        );
        if (
          !['AGUARDANDO_GIRO_1', 'AGUARDANDO_GIRO_2'].includes(sorteio.status)
        ) {
          throw new CampanhaRoletaSorteioInvalidoException(
            'o sorteio nao aguarda um giro',
            sorteio.id,
          );
        }
      },
      aplicar: async (tx, sorteio) => {
        const pool = this.normalizarPoolSnapshot(sorteio.poolSnapshot);
        const resultados = this.normalizarResultados(sorteio.resultados);
        const excluir =
          sorteio.modo === 'TECNICA' && resultados.length === 1
            ? resultados[0].chave
            : undefined;
        let resultado: CampanhaRoletaPoolItem;
        try {
          resultado = sortearItemRoleta(pool, excluir);
        } catch (error) {
          throw new CampanhaRoletaSorteioInvalidoException(
            error instanceof Error ? error.message : 'pool sem resultado',
            sorteio.id,
          );
        }
        const novosResultados = [...resultados, resultado];
        let status: CampanhaRoletaSorteioStatus;
        if (sorteio.modo === 'TECNICA') {
          status =
            novosResultados.length === 1
              ? 'AGUARDANDO_GIRO_2'
              : 'AGUARDANDO_ESCOLHA';
        } else {
          status = 'FINALIZADO';
        }
        const finalizou = status === 'FINALIZADO';
        const atualizada = await tx.campanhaRoletaSorteio.updateMany({
          where: {
            id: sorteio.id,
            campanhaId,
            revisao: dto.revisaoEsperada,
            status: sorteio.status,
          },
          data: {
            resultados: this.json(novosResultados),
            resultadoFinal: finalizou ? this.json(resultado) : undefined,
            status,
            chaveAtiva: finalizou ? null : sorteio.chaveAtiva,
            finalizadoPorId: finalizou ? usuarioId : undefined,
            finalizadoEm: finalizou ? new Date() : undefined,
            revisao: { increment: 1 },
          },
        });
        if (atualizada.count !== 1) {
          throw new CampanhaRoletaConflitoException(
            'revisao do sorteio divergente',
          );
        }
        const salvo = await tx.campanhaRoletaSorteio.findUniqueOrThrow({
          where: { id: sorteio.id },
          include: sorteioInclude,
        });
        return {
          sorteio: this.mapearSorteio(salvo),
          giro: {
            etapa: novosResultados.length,
            resultado,
            duracaoMs: 4500,
            animacaoId: `${sorteio.id}:${sorteio.revisao + 1}`,
          },
        };
      },
    });
  }

  async escolher(
    campanhaId: number,
    sorteioId: number,
    usuarioId: number,
    dto: EscolherSorteioCampanhaRoletaDto,
  ) {
    return this.executarAcao({
      campanhaId,
      sorteioId,
      usuarioId,
      dto,
      eventoTipo: 'OPCAO_ESCOLHIDA',
      operacao: 'ESCOLHER',
      validar: (capacidades, sorteio) => {
        this.exigir(
          this.podeDecidir(capacidades, sorteio, usuarioId),
          'decidir pelo alvo',
        );
        if (
          sorteio.modo !== 'TECNICA' ||
          sorteio.status !== 'AGUARDANDO_ESCOLHA'
        ) {
          throw new CampanhaRoletaSorteioInvalidoException(
            'o sorteio nao aguarda escolha entre tecnicas',
            sorteio.id,
          );
        }
      },
      aplicar: async (tx, sorteio) => {
        const resultados = this.normalizarResultados(sorteio.resultados);
        const resultado = resultados[dto.indiceEscolhido];
        if (!resultado) {
          throw new CampanhaRoletaSorteioInvalidoException(
            'opcao escolhida nao existe',
            sorteio.id,
          );
        }
        const atualizada = await tx.campanhaRoletaSorteio.updateMany({
          where: {
            id: sorteio.id,
            campanhaId,
            revisao: dto.revisaoEsperada,
            status: 'AGUARDANDO_ESCOLHA',
          },
          data: {
            status: 'FINALIZADO',
            chaveAtiva: null,
            resultadoFinal: this.json(resultado),
            finalizadoPorId: usuarioId,
            finalizadoEm: new Date(),
            revisao: { increment: 1 },
          },
        });
        if (atualizada.count !== 1) {
          throw new CampanhaRoletaConflitoException(
            'revisao do sorteio divergente',
          );
        }
        const salvo = await tx.campanhaRoletaSorteio.findUniqueOrThrow({
          where: { id: sorteio.id },
          include: sorteioInclude,
        });
        return { sorteio: this.mapearSorteio(salvo), resultado };
      },
    });
  }

  async terceiroGiro(
    campanhaId: number,
    sorteioId: number,
    usuarioId: number,
    dto: AcaoSorteioCampanhaRoletaDto,
  ) {
    return this.executarAcao({
      campanhaId,
      sorteioId,
      usuarioId,
      dto,
      eventoTipo: 'TERCEIRO_GIRO_REALIZADO',
      operacao: 'TERCEIRO_GIRO',
      validar: (capacidades, sorteio) => {
        this.exigir(
          this.podeDecidir(capacidades, sorteio, usuarioId),
          'solicitar o terceiro giro pelo alvo',
        );
        if (
          sorteio.modo !== 'TECNICA' ||
          sorteio.status !== 'AGUARDANDO_ESCOLHA'
        ) {
          throw new CampanhaRoletaSorteioInvalidoException(
            'o sorteio nao permite terceiro giro',
            sorteio.id,
          );
        }
      },
      aplicar: async (tx, sorteio) => {
        const pool = this.normalizarPoolSnapshot(sorteio.poolSnapshot);
        const resultado = sortearItemRoleta(pool);
        const resultados = [
          ...this.normalizarResultados(sorteio.resultados),
          resultado,
        ];
        const atualizada = await tx.campanhaRoletaSorteio.updateMany({
          where: {
            id: sorteio.id,
            campanhaId,
            revisao: dto.revisaoEsperada,
            status: 'AGUARDANDO_ESCOLHA',
          },
          data: {
            status: 'FINALIZADO',
            chaveAtiva: null,
            resultados: this.json(resultados),
            resultadoFinal: this.json(resultado),
            finalizadoPorId: usuarioId,
            finalizadoEm: new Date(),
            revisao: { increment: 1 },
          },
        });
        if (atualizada.count !== 1) {
          throw new CampanhaRoletaConflitoException(
            'revisao do sorteio divergente',
          );
        }
        const salvo = await tx.campanhaRoletaSorteio.findUniqueOrThrow({
          where: { id: sorteio.id },
          include: sorteioInclude,
        });
        return {
          sorteio: this.mapearSorteio(salvo),
          giro: {
            etapa: 3,
            resultado,
            duracaoMs: 4500,
            animacaoId: `${sorteio.id}:${sorteio.revisao + 1}`,
          },
        };
      },
    });
  }

  async cancelar(
    campanhaId: number,
    sorteioId: number,
    usuarioId: number,
    dto: AcaoSorteioCampanhaRoletaDto,
  ) {
    return this.executarAcao({
      campanhaId,
      sorteioId,
      usuarioId,
      dto,
      eventoTipo: 'SORTEIO_CANCELADO',
      operacao: 'CANCELAR',
      validar: (capacidades, sorteio) => {
        this.exigir(capacidades.podeCancelar, 'cancelar este sorteio');
        if (['FINALIZADO', 'CANCELADO'].includes(sorteio.status)) {
          throw new CampanhaRoletaSorteioInvalidoException(
            'o sorteio ja foi encerrado',
            sorteio.id,
          );
        }
      },
      aplicar: async (tx, sorteio) => {
        const atualizada = await tx.campanhaRoletaSorteio.updateMany({
          where: {
            id: sorteio.id,
            campanhaId,
            revisao: dto.revisaoEsperada,
            status: sorteio.status,
          },
          data: {
            status: 'CANCELADO',
            chaveAtiva: null,
            canceladoPorId: usuarioId,
            canceladoEm: new Date(),
            revisao: { increment: 1 },
          },
        });
        if (atualizada.count !== 1) {
          throw new CampanhaRoletaConflitoException(
            'revisao do sorteio divergente',
          );
        }
        const salvo = await tx.campanhaRoletaSorteio.findUniqueOrThrow({
          where: { id: sorteio.id },
          include: sorteioInclude,
        });
        return { sorteio: this.mapearSorteio(salvo) };
      },
    });
  }

  async listarHistorico(
    campanhaId: number,
    usuarioId: number,
    query: HistoricoCampanhaRoletaQueryDto,
  ) {
    await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const where = { campanhaId };
    const [itens, total] = await Promise.all([
      this.prisma.campanhaRoletaSorteio.findMany({
        where,
        include: {
          ...sorteioInclude,
          eventos: {
            orderBy: { criadoEm: 'asc' },
            select: {
              id: true,
              tipo: true,
              dados: true,
              resposta: true,
              criadoEm: true,
              ator: { select: { id: true, apelido: true } },
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.prisma.campanhaRoletaSorteio.count({ where }),
    ]);
    return {
      itens: itens.map((item) => ({
        ...this.mapearSorteio(item),
        eventos: item.eventos,
      })),
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}
