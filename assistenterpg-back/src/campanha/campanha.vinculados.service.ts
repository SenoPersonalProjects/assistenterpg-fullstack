import { Injectable } from '@nestjs/common';
import {
  EstadoEntidadeVinculadaPersonagem,
  Prisma,
  TamanhoNpcAmeaca,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { CampanhaAccessService } from './campanha.access.service';
import {
  AtualizarEntidadeVinculadaPersonagemDto,
  AtualizarEstadoEntidadeVinculadaDto,
  ConcederMaldicaoControladaSessaoDto,
  CriarEntidadeVinculadaPersonagemDto,
} from './dto/entidade-vinculada-personagem.dto';

const entidadeVinculadaInclude = {
  personagemCampanha: {
    select: {
      id: true,
      nome: true,
      nivel: true,
      donoId: true,
      personagemBase: { select: { nome: true } },
    },
  },
  tecnicaOrigem: { select: { id: true, codigo: true, nome: true } },
  tipoGrau: { select: { codigo: true, nome: true } },
  npcAmeacaOrigem: {
    select: { id: true, nome: true, tipo: true, fichaTipo: true },
  },
  criadoPor: { select: { id: true, apelido: true } },
  instanciasSessao: {
    select: {
      id: true,
      sessaoId: true,
      cenaId: true,
      pontosVidaAtual: true,
      ocultoJogadores: true,
    },
    orderBy: { id: 'desc' as const },
  },
} satisfies Prisma.PersonagemCampanhaEntidadeVinculadaInclude;

type EntidadeVinculadaMapeavel =
  Prisma.PersonagemCampanhaEntidadeVinculadaGetPayload<{
    include: typeof entidadeVinculadaInclude;
  }>;

type AcessoCampanha = Awaited<
  ReturnType<CampanhaAccessService['garantirAcesso']>
>;

type DadosEntidadeVinculada =
  Partial<Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput>;

type OpcoesValidacaoCriacao = {
  validarLimiteCadastro?: boolean;
};

type NpcAmeacaOrigemSnapshot = {
  id: number;
  nome: string;
  descricao: string | null;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  tamanho: TamanhoNpcAmeaca;
  vd: number;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  percepcao: number;
  iniciativa: number;
  fortitude: number;
  reflexos: number;
  vontade: number;
  luta: number;
  jujutsu: number;
  defesa: number;
  pontosVida: number;
  deslocamentoMetros: number;
  periciasEspeciais: Prisma.JsonValue | null;
  resistencias: Prisma.JsonValue | null;
  vulnerabilidades: Prisma.JsonValue | null;
  passivas: Prisma.JsonValue | null;
  acoes: Prisma.JsonValue | null;
  usoTatico: string | null;
};

const CODIGOS_SHIKIGAMI = [
  'TECNICA_SHIKIGAMI',
  'NAOINATA_TECNICA_SHIKIGAMI',
  'DEZ_SOMBRAS',
];

const CODIGOS_CORPOS = [
  'TECNICA_CADAVERES',
  'NAOINATA_TECNICA_CORPOS_AMALDICOADOS',
  'MANIPULACAO_FANTOCHES',
];

@Injectable()
export class CampanhaVinculadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  async listar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        false,
      );
    this.validarPodeVerPersonagem(acesso, personagem.donoId, usuarioId);

    const entidades =
      await this.prisma.personagemCampanhaEntidadeVinculada.findMany({
        where: { campanhaId, personagemCampanhaId },
        include: entidadeVinculadaInclude,
        orderBy: [{ estado: 'asc' }, { tipo: 'asc' }, { nome: 'asc' }],
      });

    return entidades.map((entidade) => this.mapearEntidade(entidade, acesso));
  }

  async obter(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        false,
      );
    this.validarPodeVerPersonagem(acesso, personagem.donoId, usuarioId);
    const entidade = await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );
    return this.mapearEntidade(entidade, acesso);
  }

  async criar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: CriarEntidadeVinculadaPersonagemDto,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    await this.validarCriacaoPorTipo(acesso, personagem.id, usuarioId, dto);
    const data = await this.montarDadosCriacao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      dto,
    );
    this.validarPontosVidaEntidade(data);

    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.create({
        data,
        include: entidadeVinculadaInclude,
      });

    return this.mapearEntidade(entidade, acesso);
  }

  async atualizar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
    dto: AtualizarEntidadeVinculadaPersonagemDto,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const atual = await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );
    const tipo = dto.tipo ?? atual.tipo;
    await this.validarCriacaoPorTipo(
      acesso,
      personagem.id,
      usuarioId,
      {
        ...dto,
        tipo,
        nome: dto.nome ?? atual.nome,
        npcAmeacaOrigemId: dto.npcAmeacaOrigemId ?? atual.npcAmeacaOrigemId,
      },
      {
        validarLimiteCadastro:
          atual.tipo !== TipoEntidadeVinculadaPersonagem.SHIKIGAMI &&
          tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      },
    );

    const data = await this.montarDadosAtualizacao(dto, atual);
    this.validarPontosVidaEntidade(data, atual);
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.update({
        where: { id: vinculadoId },
        data: data as Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedUpdateInput,
        include: entidadeVinculadaInclude,
      });

    return this.mapearEntidade(entidade, acesso);
  }

  async duplicar(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const atual = await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );

    const dataDuplicada = {
      ...this.snapshotEntidadeParaCreate(atual),
      campanhaId: atual.campanhaId,
      personagemCampanhaId: atual.personagemCampanhaId,
      tipo: atual.tipo,
      nome: `Copia de ${atual.nome}`.slice(0, 120),
      estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
      criadoPorId: usuarioId,
    } satisfies Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput;

    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.create({
        data: dataDuplicada,
        include: entidadeVinculadaInclude,
      });

    return this.mapearEntidade(entidade, acesso);
  }

  async atualizarEstado(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
    dto: AtualizarEstadoEntidadeVinculadaDto,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.update({
        where: { id: vinculadoId },
        data: { estado: dto.estado },
        include: entidadeVinculadaInclude,
      });
    return this.mapearEntidade(entidade, acesso);
  }

  async remover(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.update({
        where: { id: vinculadoId },
        data: { estado: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
        include: entidadeVinculadaInclude,
      });
    return this.mapearEntidade(entidade, acesso);
  }

  async recalcular(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
  ) {
    const { acesso } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const atual = await this.obterEntidadeOuFalhar(
      campanhaId,
      personagemCampanhaId,
      vinculadoId,
    );
    if (
      atual.tipo !== TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA ||
      !atual.npcAmeacaOrigemId
    ) {
      return this.mapearEntidade(atual, acesso);
    }

    const origem = await this.prisma.npcAmeaca.findUnique({
      where: { id: atual.npcAmeacaOrigemId },
    });
    if (!origem) {
      throw new BusinessException(
        'Ameaca original da maldicao controlada nao foi encontrada',
        'ENTIDADE_NPC_ORIGEM_NAO_ENCONTRADA',
        { npcAmeacaOrigemId: atual.npcAmeacaOrigemId },
      );
    }
    const data = this.montarSnapshotMaldicaoControlada(origem, {
      nome: atual.nome,
      descricao: atual.descricao,
    });
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.update({
        where: { id: vinculadoId },
        data,
        include: entidadeVinculadaInclude,
      });
    return this.mapearEntidade(entidade, acesso);
  }

  async concederMaldicaoControlada(
    campanhaId: number,
    usuarioId: number,
    dto: ConcederMaldicaoControladaSessaoDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(
      campanhaId,
      usuarioId,
    );
    this.assertMestre(acesso, 'conceder maldicao controlada');

    const personagem = await this.prisma.personagemCampanha.findFirst({
      where: { id: dto.personagemCampanhaId, campanhaId },
      select: { id: true, donoId: true },
    });
    if (!personagem) {
      throw new BusinessException(
        'Personagem da campanha nao encontrado',
        'ENTIDADE_PERSONAGEM_NAO_ENCONTRADO',
        { personagemCampanhaId: dto.personagemCampanhaId, campanhaId },
      );
    }

    const origem = await this.obterOrigemMaldicaoControlada(
      usuarioId,
      dto.npcAmeacaId,
      dto.npcSessaoId,
      campanhaId,
    );
    const data = this.montarSnapshotMaldicaoControlada(origem, {
      nome: dto.nome,
      descricao: dto.descricao,
    });
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.create({
        data: {
          ...data,
          campanhaId,
          personagemCampanhaId: personagem.id,
          tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
          nome: String(data.nome ?? dto.nome ?? origem.nome).trim(),
          criadoPorId: usuarioId,
        },
        include: entidadeVinculadaInclude,
      });
    return this.mapearEntidade(entidade, acesso);
  }

  mapearEntidade(entidade: EntidadeVinculadaMapeavel, acesso?: AcessoCampanha) {
    const instanciasAtivas = entidade.instanciasSessao ?? [];
    return {
      id: entidade.id,
      campanhaId: entidade.campanhaId,
      personagemCampanhaId: entidade.personagemCampanhaId,
      tipo: entidade.tipo,
      estado: entidade.estado,
      nome: entidade.nome,
      descricao: entidade.descricao,
      conceito: entidade.conceito,
      aparencia: entidade.aparencia,
      nivelReferencia: entidade.nivelReferencia,
      grauReferencia: entidade.grauReferencia,
      tecnicaOrigemId: entidade.tecnicaOrigemId,
      tipoGrauCodigo: entidade.tipoGrauCodigo,
      npcAmeacaOrigemId: entidade.npcAmeacaOrigemId,
      fichaTipo: entidade.fichaTipo,
      tipoNpc: entidade.tipoNpc,
      tamanho: entidade.tamanho,
      vd: entidade.vd,
      agilidade: entidade.agilidade,
      forca: entidade.forca,
      intelecto: entidade.intelecto,
      presenca: entidade.presenca,
      vigor: entidade.vigor,
      percepcao: entidade.percepcao,
      iniciativa: entidade.iniciativa,
      fortitude: entidade.fortitude,
      reflexos: entidade.reflexos,
      vontade: entidade.vontade,
      luta: entidade.luta,
      jujutsu: entidade.jujutsu,
      defesa: entidade.defesa,
      pontosVidaMax: entidade.pontosVidaMax,
      pontosVidaAtual: entidade.pontosVidaAtual,
      rd: entidade.rd,
      deslocamentoMetros: entidade.deslocamentoMetros,
      vagasOcupadas: entidade.vagasOcupadas,
      cargasMax: entidade.cargasMax,
      cargasAtual: entidade.cargasAtual,
      periciasEspeciais: entidade.periciasEspeciais,
      resistencias: entidade.resistencias,
      vulnerabilidades: entidade.vulnerabilidades,
      passivas: entidade.passivas,
      acoes: entidade.acoes,
      habilidades: entidade.habilidades,
      custos: entidade.custos,
      limites: entidade.limites,
      config: entidade.config,
      criadoPorId: entidade.criadoPorId,
      criadoEm: entidade.criadoEm,
      atualizadoEm: entidade.atualizadoEm,
      personagem: entidade.personagemCampanha,
      tecnicaOrigem: entidade.tecnicaOrigem,
      tipoGrau: entidade.tipoGrau,
      npcAmeacaOrigem: entidade.npcAmeacaOrigem,
      criadoPor: entidade.criadoPor,
      instanciasAtivas,
      permissoes: acesso
        ? {
            podeEditar: acesso.ehMestre,
            podeIgnorarLimites: acesso.ehMestre,
          }
        : undefined,
    };
  }

  private async obterEntidadeOuFalhar(
    campanhaId: number,
    personagemCampanhaId: number,
    vinculadoId: number,
  ) {
    const entidade =
      await this.prisma.personagemCampanhaEntidadeVinculada.findFirst({
        where: { id: vinculadoId, campanhaId, personagemCampanhaId },
        include: entidadeVinculadaInclude,
      });
    if (!entidade) {
      throw new BusinessException(
        'Entidade vinculada nao encontrada',
        'ENTIDADE_VINCULADA_NAO_ENCONTRADA',
        { campanhaId, personagemCampanhaId, vinculadoId },
      );
    }
    return entidade;
  }

  private async montarDadosCriacao(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: CriarEntidadeVinculadaPersonagemDto,
  ): Promise<Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput> {
    if (dto.tipo === TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA) {
      if (!dto.npcAmeacaOrigemId) {
        throw new BusinessException(
          'Maldicao controlada exige uma ameaca de origem',
          'ENTIDADE_MALDICAO_ORIGEM_OBRIGATORIA',
        );
      }
      const origem = await this.prisma.npcAmeaca.findUnique({
        where: { id: dto.npcAmeacaOrigemId },
      });
      if (!origem || origem.tipo !== TipoNpcAmeaca.MALDICAO) {
        throw new BusinessException(
          'A origem da maldicao controlada precisa ser uma maldicao',
          'ENTIDADE_MALDICAO_ORIGEM_INVALIDA',
          { npcAmeacaOrigemId: dto.npcAmeacaOrigemId },
        );
      }
      const snapshot = this.montarSnapshotMaldicaoControlada(origem, dto);
      return {
        campanhaId,
        personagemCampanhaId,
        tipo: dto.tipo,
        criadoPorId: usuarioId,
        ...snapshot,
        nome: String(snapshot.nome ?? dto.nome ?? origem.nome).trim(),
      };
    }

    const snapshot = this.normalizarSnapshotManual(dto);
    if (
      snapshot.pontosVidaAtual === undefined &&
      snapshot.pontosVidaMax !== undefined
    ) {
      snapshot.pontosVidaAtual = snapshot.pontosVidaMax;
    }
    return {
      campanhaId,
      personagemCampanhaId,
      tipo: dto.tipo,
      criadoPorId: usuarioId,
      ...snapshot,
      nome: dto.nome.trim(),
    };
  }

  private async montarDadosAtualizacao(
    dto: AtualizarEntidadeVinculadaPersonagemDto,
    atual: EntidadeVinculadaMapeavel,
  ): Promise<DadosEntidadeVinculada> {
    if (
      (dto.tipo ?? atual.tipo) ===
        TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA &&
      dto.npcAmeacaOrigemId &&
      dto.npcAmeacaOrigemId !== atual.npcAmeacaOrigemId
    ) {
      const origem = await this.prisma.npcAmeaca.findUnique({
        where: { id: dto.npcAmeacaOrigemId },
      });
      if (!origem || origem.tipo !== TipoNpcAmeaca.MALDICAO) {
        throw new BusinessException(
          'A origem da maldicao controlada precisa ser uma maldicao',
          'ENTIDADE_MALDICAO_ORIGEM_INVALIDA',
          { npcAmeacaOrigemId: dto.npcAmeacaOrigemId },
        );
      }
      return this.montarSnapshotMaldicaoControlada(origem, dto);
    }

    return this.normalizarSnapshotManual(dto);
  }

  private normalizarSnapshotManual(
    dto: Partial<CriarEntidadeVinculadaPersonagemDto>,
  ): DadosEntidadeVinculada {
    const data: DadosEntidadeVinculada = {};
    const assign = (key: string, value: unknown) => {
      if (value !== undefined) {
        (data as Record<string, unknown>)[key] = value;
      }
    };

    assign('nome', dto.nome?.trim() || undefined);
    assign('descricao', dto.descricao ?? undefined);
    assign('conceito', dto.conceito ?? undefined);
    assign('aparencia', dto.aparencia ?? undefined);
    assign('nivelReferencia', dto.nivelReferencia ?? undefined);
    assign('grauReferencia', dto.grauReferencia ?? undefined);
    assign('tecnicaOrigemId', dto.tecnicaOrigemId ?? undefined);
    assign('tipoGrauCodigo', dto.tipoGrauCodigo ?? undefined);
    assign('npcAmeacaOrigemId', dto.npcAmeacaOrigemId ?? undefined);
    assign('fichaTipo', dto.fichaTipo ?? undefined);
    assign('tipoNpc', dto.tipoNpc ?? undefined);
    assign('tamanho', dto.tamanho ?? undefined);
    assign('vd', dto.vd ?? undefined);
    assign('agilidade', dto.agilidade ?? undefined);
    assign('forca', dto.forca ?? undefined);
    assign('intelecto', dto.intelecto ?? undefined);
    assign('presenca', dto.presenca ?? undefined);
    assign('vigor', dto.vigor ?? undefined);
    assign('percepcao', dto.percepcao ?? undefined);
    assign('iniciativa', dto.iniciativa ?? undefined);
    assign('fortitude', dto.fortitude ?? undefined);
    assign('reflexos', dto.reflexos ?? undefined);
    assign('vontade', dto.vontade ?? undefined);
    assign('luta', dto.luta ?? undefined);
    assign('jujutsu', dto.jujutsu ?? undefined);
    assign('defesa', dto.defesa ?? undefined);
    assign('pontosVidaMax', dto.pontosVidaMax ?? undefined);
    assign('pontosVidaAtual', dto.pontosVidaAtual ?? undefined);
    assign('rd', dto.rd ?? undefined);
    assign('deslocamentoMetros', dto.deslocamentoMetros ?? undefined);
    assign('vagasOcupadas', dto.vagasOcupadas ?? undefined);
    assign('cargasMax', dto.cargasMax ?? undefined);
    assign('cargasAtual', dto.cargasAtual ?? dto.cargasMax ?? undefined);
    assign('periciasEspeciais', this.jsonInput(dto.periciasEspeciais));
    assign('resistencias', this.jsonInput(dto.resistencias));
    assign('vulnerabilidades', this.jsonInput(dto.vulnerabilidades));
    assign('passivas', this.jsonInput(dto.passivas));
    assign('acoes', this.jsonInput(dto.acoes));
    assign('habilidades', this.jsonInput(dto.habilidades));
    assign('custos', this.jsonInput(dto.custos));
    assign('limites', this.jsonInput(dto.limites));
    assign('config', this.jsonInput(dto.config));
    if (dto.tipo) assign('tipo', dto.tipo);
    return data;
  }

  private montarSnapshotMaldicaoControlada(
    origem: NpcAmeacaOrigemSnapshot,
    dto: Partial<CriarEntidadeVinculadaPersonagemDto>,
  ): DadosEntidadeVinculada {
    const pvControlado = Math.max(
      1,
      origem.pontosVida - Math.ceil(origem.pontosVida / 3),
    );
    return {
      nome: dto.nome?.trim() || origem.nome,
      descricao: dto.descricao ?? origem.descricao ?? undefined,
      conceito: dto.conceito ?? origem.usoTatico ?? undefined,
      aparencia: dto.aparencia ?? undefined,
      npcAmeacaOrigemId: origem.id,
      fichaTipo: origem.fichaTipo,
      tipoNpc: TipoNpcAmeaca.MALDICAO,
      tamanho: origem.tamanho,
      vd: origem.vd,
      agilidade: origem.agilidade,
      forca: origem.forca,
      intelecto: origem.intelecto,
      presenca: origem.presenca,
      vigor: origem.vigor,
      percepcao: origem.percepcao,
      iniciativa: origem.iniciativa,
      fortitude: origem.fortitude,
      reflexos: origem.reflexos,
      vontade: origem.vontade,
      luta: origem.luta,
      jujutsu: origem.jujutsu,
      defesa: origem.defesa,
      pontosVidaMax: pvControlado,
      pontosVidaAtual: pvControlado,
      deslocamentoMetros: origem.deslocamentoMetros,
      periciasEspeciais: this.jsonInput(origem.periciasEspeciais),
      resistencias: this.jsonInput(origem.resistencias),
      vulnerabilidades: this.jsonInput(origem.vulnerabilidades),
      passivas: this.jsonInput(origem.passivas),
      acoes: this.jsonInput(origem.acoes),
      config: this.jsonInput({
        origemTipo: 'NPC_AMEACA',
        pvOriginal: origem.pontosVida,
        pvControlado,
        reducaoPv: Math.ceil(origem.pontosVida / 3),
      }),
    };
  }

  private snapshotEntidadeParaCreate(
    entidade: EntidadeVinculadaMapeavel,
  ): DadosEntidadeVinculada {
    return {
      campanhaId: entidade.campanhaId,
      personagemCampanhaId: entidade.personagemCampanhaId,
      tipo: entidade.tipo,
      descricao: entidade.descricao,
      conceito: entidade.conceito,
      aparencia: entidade.aparencia,
      nivelReferencia: entidade.nivelReferencia,
      grauReferencia: entidade.grauReferencia,
      tecnicaOrigemId: entidade.tecnicaOrigemId,
      tipoGrauCodigo: entidade.tipoGrauCodigo,
      npcAmeacaOrigemId: entidade.npcAmeacaOrigemId,
      fichaTipo: entidade.fichaTipo,
      tipoNpc: entidade.tipoNpc,
      tamanho: entidade.tamanho,
      vd: entidade.vd,
      agilidade: entidade.agilidade,
      forca: entidade.forca,
      intelecto: entidade.intelecto,
      presenca: entidade.presenca,
      vigor: entidade.vigor,
      percepcao: entidade.percepcao,
      iniciativa: entidade.iniciativa,
      fortitude: entidade.fortitude,
      reflexos: entidade.reflexos,
      vontade: entidade.vontade,
      luta: entidade.luta,
      jujutsu: entidade.jujutsu,
      defesa: entidade.defesa,
      pontosVidaMax: entidade.pontosVidaMax,
      pontosVidaAtual: entidade.pontosVidaAtual,
      rd: entidade.rd,
      deslocamentoMetros: entidade.deslocamentoMetros,
      vagasOcupadas: entidade.vagasOcupadas,
      cargasMax: entidade.cargasMax,
      cargasAtual: entidade.cargasAtual,
      periciasEspeciais: this.jsonInput(entidade.periciasEspeciais),
      resistencias: this.jsonInput(entidade.resistencias),
      vulnerabilidades: this.jsonInput(entidade.vulnerabilidades),
      passivas: this.jsonInput(entidade.passivas),
      acoes: this.jsonInput(entidade.acoes),
      habilidades: this.jsonInput(entidade.habilidades),
      custos: this.jsonInput(entidade.custos),
      limites: this.jsonInput(entidade.limites),
      config: this.jsonInput(entidade.config),
    };
  }

  private async obterOrigemMaldicaoControlada(
    usuarioId: number,
    npcAmeacaId: number | undefined,
    npcSessaoId: number | undefined,
    campanhaId: number,
  ) {
    if (!npcAmeacaId && !npcSessaoId) {
      throw new BusinessException(
        'Informe uma maldicao do catalogo ou da sessao',
        'ENTIDADE_MALDICAO_ORIGEM_OBRIGATORIA',
      );
    }
    if (npcAmeacaId && npcSessaoId) {
      throw new BusinessException(
        'Informe apenas uma origem para a maldicao controlada',
        'ENTIDADE_MALDICAO_ORIGEM_DUPLICADA',
      );
    }
    if (npcAmeacaId) {
      const origem = await this.prisma.npcAmeaca.findFirst({
        where: { id: npcAmeacaId, donoId: usuarioId },
      });
      if (!origem || origem.tipo !== TipoNpcAmeaca.MALDICAO) {
        throw new BusinessException(
          'A origem precisa ser uma maldicao do catalogo',
          'ENTIDADE_MALDICAO_ORIGEM_INVALIDA',
          { npcAmeacaId },
        );
      }
      return origem;
    }

    const origemSessao = await this.prisma.npcAmeacaSessao.findFirst({
      where: { id: npcSessaoId, sessao: { campanhaId } },
    });
    if (!origemSessao || origemSessao.tipo !== TipoNpcAmeaca.MALDICAO) {
      throw new BusinessException(
        'A origem da sessao precisa ser uma maldicao',
        'ENTIDADE_MALDICAO_ORIGEM_INVALIDA',
        { npcSessaoId },
      );
    }
    return {
      id: origemSessao.npcAmeacaId ?? 0,
      donoId: usuarioId,
      nome: origemSessao.nomeExibicao,
      descricao: origemSessao.notasCena,
      fichaTipo: origemSessao.fichaTipo,
      tipo: origemSessao.tipo,
      tamanho: origemSessao.tamanho ?? 'MEDIO',
      vd: origemSessao.vd,
      agilidade: origemSessao.agilidade ?? 0,
      forca: origemSessao.forca ?? 0,
      intelecto: origemSessao.intelecto ?? 0,
      presenca: origemSessao.presenca ?? 0,
      vigor: origemSessao.vigor ?? 0,
      percepcao: origemSessao.percepcao ?? 0,
      iniciativa: origemSessao.iniciativa ?? 0,
      fortitude: origemSessao.fortitude ?? 0,
      reflexos: origemSessao.reflexos ?? 0,
      vontade: origemSessao.vontade ?? 0,
      luta: origemSessao.luta ?? 0,
      jujutsu: origemSessao.jujutsu ?? 0,
      percepcaoDados: null,
      iniciativaDados: null,
      fortitudeDados: null,
      reflexosDados: null,
      vontadeDados: null,
      lutaDados: null,
      jujutsuDados: null,
      defesa: origemSessao.defesa,
      pontosVida: origemSessao.pontosVidaMax,
      machucado: origemSessao.machucado,
      deslocamentoMetros: origemSessao.deslocamentoMetros,
      periciasEspeciais: null,
      resistencias: null,
      vulnerabilidades: null,
      passivas: origemSessao.passivasGuia,
      acoes: origemSessao.acoesGuia,
      usoTatico: null,
      criadoEm: origemSessao.criadoEm,
      atualizadoEm: origemSessao.atualizadoEm,
    };
  }

  private async validarCriacaoPorTipo(
    acesso: AcessoCampanha,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: Pick<
      CriarEntidadeVinculadaPersonagemDto,
      'tipo' | 'overrideMestre' | 'npcAmeacaOrigemId' | 'limites' | 'config'
    > & { nome?: string },
    opcoes: OpcoesValidacaoCriacao = {},
  ) {
    if (dto.overrideMestre && acesso.ehMestre) return;
    if (dto.tipo === TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA) {
      this.assertMestre(acesso, 'registrar maldicao controlada');
      return;
    }
    const codigos =
      dto.tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI
        ? CODIGOS_SHIKIGAMI
        : CODIGOS_CORPOS;
    const codigosPersonagem =
      await this.listarCodigosTecnicasPersonagem(personagemCampanhaId);
    const possuiTecnica = codigosPersonagem.some((codigo) =>
      codigos.includes(codigo),
    );
    if (!possuiTecnica && !acesso.ehMestre) {
      throw new BusinessException(
        'Personagem nao possui tecnica compativel para este vinculado',
        'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
        { personagemCampanhaId, codigos, usuarioId },
      );
    }
    if (
      dto.tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI &&
      opcoes.validarLimiteCadastro !== false
    ) {
      await this.validarLimiteCadastroShikigami(
        acesso,
        personagemCampanhaId,
        codigosPersonagem,
        dto,
      );
    }
  }

  private async listarCodigosTecnicasPersonagem(personagemCampanhaId: number) {
    const personagem = await this.prisma.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: {
        tecnicaInata: { select: { codigo: true } },
        tecnicaInataPropria: { select: { codigo: true } },
        personagemBase: {
          select: {
            tecnicaInata: { select: { codigo: true } },
            tecnicaInataPropria: { select: { codigo: true } },
          },
        },
        tecnicasAprendidas: {
          select: { tecnica: { select: { codigo: true } } },
        },
      },
    });
    if (!personagem) return [];
    const encontrados = [
      personagem.tecnicaInata?.codigo,
      personagem.tecnicaInataPropria?.codigo,
      personagem.personagemBase.tecnicaInata?.codigo,
      personagem.personagemBase.tecnicaInataPropria?.codigo,
      ...personagem.tecnicasAprendidas.map((item) => item.tecnica.codigo),
    ].filter((codigo): codigo is string => Boolean(codigo));
    return encontrados;
  }

  private async validarLimiteCadastroShikigami(
    acesso: AcessoCampanha,
    personagemCampanhaId: number,
    codigosPersonagem: string[],
    dto: Pick<CriarEntidadeVinculadaPersonagemDto, 'limites' | 'config'>,
  ) {
    const limiteConfigurado = acesso.ehMestre
      ? (this.lerNumeroConfig(dto.limites, [
          'cadastroMaximo',
          'limiteCadastro',
          'limiteCadastrados',
        ]) ??
        this.lerNumeroConfig(dto.config, [
          'cadastroMaximo',
          'limiteCadastro',
          'limiteCadastrados',
        ]))
      : null;
    const limiteCadastro =
      limiteConfigurado ?? (codigosPersonagem.includes('DEZ_SOMBRAS') ? 10 : 1);
    const cadastrados =
      await this.prisma.personagemCampanhaEntidadeVinculada.count({
        where: {
          personagemCampanhaId,
          tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
          estado: {
            not: EstadoEntidadeVinculadaPersonagem.ARQUIVADO,
          },
        },
      });
    if (cadastrados >= limiteCadastro) {
      throw new BusinessException(
        'Limite de shikigamis cadastrados atingido',
        'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO',
        { personagemCampanhaId, limiteCadastro, cadastrados },
      );
    }
  }

  private validarPontosVidaEntidade(
    data: DadosEntidadeVinculada,
    atual?: Pick<
      EntidadeVinculadaMapeavel,
      'pontosVidaMax' | 'pontosVidaAtual'
    >,
  ) {
    const pontosVidaMax = this.numeroPersistencia(
      data.pontosVidaMax,
      atual?.pontosVidaMax ?? 1,
    );
    const pontosVidaAtual = Object.prototype.hasOwnProperty.call(
      data,
      'pontosVidaAtual',
    )
      ? this.numeroPersistencia(
          data.pontosVidaAtual,
          atual?.pontosVidaAtual ?? 1,
        )
      : (atual?.pontosVidaAtual ?? pontosVidaMax);

    if (
      pontosVidaMax < 1 ||
      pontosVidaAtual < 0 ||
      pontosVidaAtual > pontosVidaMax
    ) {
      throw new BusinessException(
        'PV atual nao pode ser maior que o PV maximo',
        'ENTIDADE_PV_INVALIDO',
        { pontosVidaMax, pontosVidaAtual },
      );
    }
  }

  private numeroPersistencia(valor: unknown, fallback: number): number {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }
    return fallback;
  }

  private lerNumeroConfig(
    json: Record<string, unknown> | null | undefined,
    chaves: string[],
  ): number | null {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      return null;
    }
    for (const chave of chaves) {
      const valor = json[chave];
      if (typeof valor === 'number' && Number.isFinite(valor) && valor > 0) {
        return Math.floor(valor);
      }
    }
    return null;
  }

  private validarPodeVerPersonagem(
    acesso: AcessoCampanha,
    donoId: number,
    usuarioId: number,
  ) {
    if (!acesso.ehMestre && donoId !== usuarioId) {
      throw new BusinessException(
        'Voce nao pode ver vinculados deste personagem',
        'ENTIDADE_ACESSO_NEGADO',
      );
    }
  }

  private assertMestre(acesso: AcessoCampanha, acao: string) {
    if (!acesso.ehMestre) {
      throw new BusinessException(
        `Apenas o mestre pode ${acao}`,
        'ENTIDADE_APENAS_MESTRE',
      );
    }
  }

  private jsonInput(
    value: Prisma.JsonValue | Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (value === undefined || value === null) return undefined;
    return value as Prisma.InputJsonValue;
  }
}
