import { Injectable } from '@nestjs/common';
import {
  EstadoEntidadeVinculadaPersonagem,
  ModoVinculadoTecnica,
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
  AssociarTemplateEntidadeVinculadaDto,
  ConcederMaldicaoControladaSessaoDto,
  CriarEntidadeVinculadaPersonagemDto,
  PapelCalculoEntidadeVinculada,
} from './dto/entidade-vinculada-personagem.dto';
import {
  calcularFichaAutomaticaVinculado,
  ConfigVinculadoNormalizada,
  lerPontariaVinculado,
  normalizarConfigVinculado,
  PapelCalculoVinculado,
} from './engine/entidades-vinculadas-capacidades';
import {
  resolverGrausAprimoramentoEfetivosCampanha,
  resolverPericiasEfetivasCampanha,
} from './engine/campanha-modificadores-efetivos';
import {
  bloquearPersonagemCampanhaTx,
  executarComRetryConcorrencia,
} from './campanha-concorrencia';

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
  template: {
    select: {
      id: true,
      codigo: true,
      nome: true,
      tecnicaId: true,
      bloqueadoPorPadrao: true,
    },
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
  validarModoCriacao?: boolean;
};

type ContextoAutomacaoVinculados = {
  personagem: {
    id: number;
    donoId: number;
    nivel: number;
    limitePeEaPorTurno: number;
    maiorAtributo: number;
    testeJujutsu: number;
  };
  configs: ConfigVinculadoNormalizada[];
  graus: Map<string, number>;
};

type ResolucaoCriacaoVinculado = {
  contexto: ContextoAutomacaoVinculados | null;
  config: ConfigVinculadoNormalizada | null;
  overrideMestre: boolean;
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

  async listarCapacidades(
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
    const contexto = await this.carregarContextoAutomacao(personagemCampanhaId);
    const entidades =
      await this.prisma.personagemCampanhaEntidadeVinculada.findMany({
        where: {
          campanhaId,
          personagemCampanhaId,
          estado: { not: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
        },
        select: {
          tipo: true,
          estado: true,
          tecnicaOrigemId: true,
          vagasOcupadas: true,
        },
      });
    const instanciasAtivas = await this.prisma.npcAmeacaSessao.findMany({
      where: {
        personagemDonoId: personagemCampanhaId,
        entidadeVinculadaId: { not: null },
        sessao: { status: { not: 'ENCERRADA' } },
      },
      select: {
        tipoVinculo: true,
        entidadeVinculada: {
          select: { tecnicaOrigemId: true, vagasOcupadas: true },
        },
      },
    });

    const tipos = Object.values(TipoEntidadeVinculadaPersonagem).map((tipo) =>
      this.montarCapacidadeTipo(
        tipo,
        contexto,
        contexto.configs.filter((config) => config.tipoVinculado === tipo),
        entidades.filter((entidade) => entidade.tipo === tipo),
        instanciasAtivas.filter((instancia) => instancia.tipoVinculo === tipo),
      ),
    );

    return {
      personagemCampanhaId,
      nivel: contexto.personagem.nivel,
      permissoes: {
        podeIgnorarLimites: acesso.ehMestre,
        podeEditar: acesso.ehMestre || personagem.donoId === usuarioId,
      },
      tipos,
    };
  }

  async listarTemplates(
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
    const contexto = await this.carregarContextoAutomacao(personagemCampanhaId);
    const tecnicaIds = contexto.configs
      .filter((config) => config.usaTemplates)
      .map((config) => config.tecnicaId);
    if (tecnicaIds.length === 0) return [];

    const templates = await this.prisma.tecnicaVinculadoTemplate.findMany({
      where: { tecnicaId: { in: tecnicaIds }, ativo: true },
      include: {
        tecnica: { select: { id: true, codigo: true, nome: true } },
        entidades: {
          where: {
            personagemCampanhaId,
            estado: { not: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
          },
          select: { id: true, estado: true },
        },
      },
      orderBy: [{ tecnicaId: 'asc' }, { ordem: 'asc' }, { nome: 'asc' }],
    });

    return templates.map((template) => ({
      id: template.id,
      codigo: template.codigo,
      nome: template.nome,
      descricao: template.descricao,
      conceito: template.conceito,
      aparencia: template.aparencia,
      tipoVinculado: template.tipoVinculado,
      bloqueadoPorPadrao: template.bloqueadoPorPadrao,
      ordem: template.ordem,
      tecnica: template.tecnica,
      associado: template.entidades.length > 0,
      entidadeAssociadaId: template.entidades[0]?.id ?? null,
    }));
  }

  async associarTemplate(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    templateId: number,
    dto: AssociarTemplateEntidadeVinculadaDto,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    const overrideMestre = dto.overrideMestre === true;
    if (overrideMestre && !acesso.ehMestre) {
      throw new BusinessException(
        'Apenas o mestre pode ignorar limites de vinculados',
        'ENTIDADE_OVERRIDE_NEGADO',
      );
    }
    return executarComRetryConcorrencia('associar template de vinculado', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        const contexto = await this.carregarContextoAutomacao(
          personagem.id,
          tx,
        );
        const template = await tx.tecnicaVinculadoTemplate.findFirst({
          where: { id: templateId, ativo: true },
          include: {
            tecnica: { select: { id: true, codigo: true, nome: true } },
          },
        });
        if (!template) {
          throw new BusinessException(
            'Template de vinculado nao encontrado',
            'ENTIDADE_TEMPLATE_NAO_ENCONTRADO',
            { templateId },
          );
        }
        const config = contexto.configs.find(
          (item) =>
            item.tecnicaId === template.tecnicaId &&
            item.tipoVinculado === template.tipoVinculado &&
            item.usaTemplates,
        );
        if (!config && !overrideMestre) {
          throw new BusinessException(
            'Personagem nao possui a tecnica deste template',
            'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
            { templateId, tecnicaCodigo: template.tecnica.codigo },
          );
        }
        const existente =
          await tx.personagemCampanhaEntidadeVinculada.findFirst({
            where: {
              personagemCampanhaId,
              templateId,
              estado: { not: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
            },
            select: { id: true },
          });
        if (existente) {
          throw new BusinessException(
            'Este template ja esta associado ao personagem',
            'ENTIDADE_TEMPLATE_JA_ASSOCIADO',
            { templateId, vinculadoId: existente.id },
          );
        }
        if (config && !overrideMestre) {
          await this.validarLimiteCadastroConfigurado(
            personagemCampanhaId,
            config,
            1,
            undefined,
            tx,
          );
        }

        const base: Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput =
          {
            campanhaId,
            personagemCampanhaId,
            tipo: template.tipoVinculado,
            nome: template.nome,
            descricao: template.descricao,
            conceito: template.conceito,
            aparencia: template.aparencia,
            tecnicaOrigemId: template.tecnicaId,
            templateId: template.id,
            criadoPorId: usuarioId,
            overrideMestre,
            precisaRecalculo: true,
          };
        const comSnapshot = {
          ...base,
          ...this.normalizarSnapshotTemplate(template.snapshotJson),
        };
        const calculo = config
          ? this.calcularAutomaticoDados(
              comSnapshot,
              contexto,
              config,
              'Template associado',
            )
          : null;
        const entidade = await tx.personagemCampanhaEntidadeVinculada.create({
          data: {
            ...comSnapshot,
            nivelReferencia: contexto.personagem.nivel,
            grauReferencia: config
              ? this.resolverGrauConfig(config, contexto)
              : null,
            tipoGrauCodigo: config?.tipoGrauCodigo ?? null,
            calculoAutomatico: this.jsonInput(calculo),
          },
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
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
    return executarComRetryConcorrencia('criar entidade vinculada', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        const resolucao = await this.validarCriacaoPorTipo(
          acesso,
          personagem.id,
          usuarioId,
          dto,
          {},
          tx,
        );
        let data = await this.montarDadosCriacao(
          campanhaId,
          personagemCampanhaId,
          usuarioId,
          dto,
          acesso.ehMestre,
          tx,
        );
        this.validarPontosVidaEntidade(data);
        data = this.aplicarAutomacaoCriacao(data, dto, resolucao);
        this.validarPontosVidaEntidade(data);

        const entidade = await tx.personagemCampanhaEntidadeVinculada.create({
          data,
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
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
    return executarComRetryConcorrencia('atualizar entidade vinculada', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        const atual = await this.obterEntidadeOuFalhar(
          campanhaId,
          personagemCampanhaId,
          vinculadoId,
          tx,
        );
        const tipo = dto.tipo ?? atual.tipo;
        const resolucao = await this.validarCriacaoPorTipo(
          acesso,
          personagem.id,
          usuarioId,
          {
            ...dto,
            tipo,
            nome: dto.nome ?? atual.nome,
            npcAmeacaOrigemId: dto.npcAmeacaOrigemId ?? atual.npcAmeacaOrigemId,
            tecnicaOrigemId: dto.tecnicaOrigemId ?? atual.tecnicaOrigemId,
          },
          {
            validarModoCriacao: false,
            validarLimiteCadastro: false,
          },
          tx,
        );

        const mudouConsumoCadastro =
          tipo !== atual.tipo ||
          (dto.vagasOcupadas !== undefined &&
            dto.vagasOcupadas !== atual.vagasOcupadas) ||
          (dto.tecnicaOrigemId !== undefined &&
            dto.tecnicaOrigemId !== atual.tecnicaOrigemId);
        if (
          mudouConsumoCadastro &&
          resolucao.config &&
          !resolucao.overrideMestre
        ) {
          await this.validarLimiteCadastroConfigurado(
            personagemCampanhaId,
            resolucao.config,
            dto.vagasOcupadas ?? atual.vagasOcupadas,
            atual.id,
            tx,
          );
        }

        const data = await this.montarDadosAtualizacao(dto, atual, tx);
        this.marcarRecalculoSeNecessario(data, dto, atual, resolucao);
        this.validarPontosVidaEntidade(data, atual);
        const entidade = await tx.personagemCampanhaEntidadeVinculada.update({
          where: { id: vinculadoId },
          data: data as Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedUpdateInput,
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
  }

  async duplicar(
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
        true,
      );
    return executarComRetryConcorrencia('duplicar entidade vinculada', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        const atual = await this.obterEntidadeOuFalhar(
          campanhaId,
          personagemCampanhaId,
          vinculadoId,
          tx,
        );
        const overrideMestre = acesso.ehMestre && atual.overrideMestre;
        const resolucao = await this.validarCriacaoPorTipo(
          acesso,
          personagem.id,
          usuarioId,
          {
            tipo: atual.tipo,
            overrideMestre,
            npcAmeacaOrigemId: atual.npcAmeacaOrigemId,
            tecnicaOrigemId: atual.tecnicaOrigemId,
            vagasOcupadas: atual.vagasOcupadas,
          },
          {},
          tx,
        );

        const dataDuplicada = {
          ...this.snapshotEntidadeParaCreate(atual),
          campanhaId: atual.campanhaId,
          personagemCampanhaId: atual.personagemCampanhaId,
          tipo: atual.tipo,
          nome: `Copia de ${atual.nome}`.slice(0, 120),
          estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
          templateId: null,
          precisaRecalculo: atual.calculoAutomatico !== null,
          overrideMestre: resolucao.overrideMestre,
          criadoPorId: usuarioId,
        } satisfies Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput;

        const entidade = await tx.personagemCampanhaEntidadeVinculada.create({
          data: dataDuplicada,
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
  }

  async atualizarEstado(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    vinculadoId: number,
    dto: AtualizarEstadoEntidadeVinculadaDto,
  ) {
    const { acesso, personagem } =
      await this.accessService.obterPersonagemCampanhaComPermissao(
        campanhaId,
        personagemCampanhaId,
        usuarioId,
        true,
      );
    return executarComRetryConcorrencia('alterar estado de vinculado', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        const atual = await this.obterEntidadeOuFalhar(
          campanhaId,
          personagemCampanhaId,
          vinculadoId,
          tx,
        );
        if (
          atual.estado === EstadoEntidadeVinculadaPersonagem.ARQUIVADO &&
          dto.estado !== EstadoEntidadeVinculadaPersonagem.ARQUIVADO
        ) {
          await this.validarCriacaoPorTipo(
            acesso,
            personagem.id,
            usuarioId,
            {
              tipo: atual.tipo,
              overrideMestre: atual.overrideMestre && acesso.ehMestre,
              npcAmeacaOrigemId: atual.npcAmeacaOrigemId,
              tecnicaOrigemId: atual.tecnicaOrigemId,
              vagasOcupadas: atual.vagasOcupadas,
            },
            { validarModoCriacao: false },
            tx,
          );
        }
        const entidade = await tx.personagemCampanhaEntidadeVinculada.update({
          where: { id: vinculadoId },
          data: { estado: dto.estado },
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
  }

  async remover(
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
        true,
      );
    return executarComRetryConcorrencia('arquivar entidade vinculada', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearPersonagemCampanhaTx(tx, campanhaId, personagem.id);
        await this.obterEntidadeOuFalhar(
          campanhaId,
          personagemCampanhaId,
          vinculadoId,
          tx,
        );
        const entidade = await tx.personagemCampanhaEntidadeVinculada.update({
          where: { id: vinculadoId },
          data: { estado: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
          include: entidadeVinculadaInclude,
        });
        return this.mapearEntidade(entidade, acesso);
      }),
    );
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
    if (atual.tipo !== TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA) {
      const contexto =
        await this.carregarContextoAutomacao(personagemCampanhaId);
      const config = this.localizarConfigEntidade(atual, contexto.configs);
      if (!config && !atual.overrideMestre) {
        throw new BusinessException(
          'A tecnica de origem nao possui configuracao de recalculo',
          'ENTIDADE_CONFIGURACAO_NAO_ENCONTRADA',
          { vinculadoId, tecnicaOrigemId: atual.tecnicaOrigemId },
        );
      }
      if (!config) return this.mapearEntidade(atual, acesso);

      const calculo = this.calcularAutomaticoAtual(atual, contexto, config);
      const pvAnteriorCalculado = this.lerNumeroJson(atual.calculoAutomatico, [
        'derivados',
        'pontosVidaMax',
      ]);
      const primeiroCalculo = pvAnteriorCalculado === null;
      const entidade =
        await this.prisma.personagemCampanhaEntidadeVinculada.update({
          where: { id: vinculadoId },
          data: {
            nivelReferencia: contexto.personagem.nivel,
            grauReferencia: this.resolverGrauConfig(config, contexto),
            tipoGrauCodigo: config.tipoGrauCodigo,
            calculoAutomatico: this.jsonInput(calculo),
            precisaRecalculo: false,
            pontosVidaMax: calculo.derivados.pontosVidaMax,
            pontosVidaAtual: primeiroCalculo
              ? calculo.derivados.pontosVidaMax
              : Math.min(
                  atual.pontosVidaAtual,
                  calculo.derivados.pontosVidaMax,
                ),
            defesa: calculo.derivados.defesa,
            rd: calculo.derivados.rd,
            cargasMax: atual.cargasMax ?? calculo.cargasSugeridas ?? undefined,
            cargasAtual:
              atual.cargasAtual ?? calculo.cargasSugeridas ?? undefined,
          },
          include: entidadeVinculadaInclude,
        });
      return this.mapearEntidade(entidade, acesso);
    }

    if (!atual.npcAmeacaOrigemId) {
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
          overrideMestre: true,
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
      templateId: entidade.templateId,
      precisaRecalculo: entidade.precisaRecalculo,
      calculoAutomatico: entidade.calculoAutomatico,
      overrideMestre: entidade.overrideMestre,
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
      template: entidade.template,
      pontaria: lerPontariaVinculado(entidade.periciasEspeciais),
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
    db: Prisma.TransactionClient = this.prisma,
  ) {
    const entidade = await db.personagemCampanhaEntidadeVinculada.findFirst({
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
    ehMestre: boolean,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput> {
    if (dto.tipo === TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA) {
      if (!dto.npcAmeacaOrigemId) {
        throw new BusinessException(
          'Maldicao controlada exige uma ameaca de origem',
          'ENTIDADE_MALDICAO_ORIGEM_OBRIGATORIA',
        );
      }
      const origem = await db.npcAmeaca.findFirst({
        where: {
          id: dto.npcAmeacaOrigemId,
          ...(ehMestre ? {} : { donoId: usuarioId }),
        },
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
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<DadosEntidadeVinculada> {
    if (
      (dto.tipo ?? atual.tipo) ===
        TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA &&
      dto.npcAmeacaOrigemId &&
      dto.npcAmeacaOrigemId !== atual.npcAmeacaOrigemId
    ) {
      const origem = await db.npcAmeaca.findUnique({
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
    assign('overrideMestre', dto.overrideMestre ?? undefined);
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
    assign(
      'periciasEspeciais',
      this.jsonInput(
        this.mesclarPontariaPericiasEspeciais(
          dto.periciasEspeciais,
          dto.pontaria,
        ),
      ),
    );
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
      templateId: entidade.templateId,
      precisaRecalculo: entidade.precisaRecalculo,
      calculoAutomatico: this.jsonInput(entidade.calculoAutomatico),
      overrideMestre: entidade.overrideMestre,
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
      | 'tipo'
      | 'overrideMestre'
      | 'npcAmeacaOrigemId'
      | 'tecnicaOrigemId'
      | 'vagasOcupadas'
    > & { nome?: string },
    opcoes: OpcoesValidacaoCriacao = {},
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<ResolucaoCriacaoVinculado> {
    const overrideMestre = dto.overrideMestre === true;
    if (overrideMestre && !acesso.ehMestre) {
      throw new BusinessException(
        'Apenas o mestre pode ignorar limites de vinculados',
        'ENTIDADE_OVERRIDE_NEGADO',
      );
    }
    if (overrideMestre) {
      return { contexto: null, config: null, overrideMestre: true };
    }

    const contexto = await this.carregarContextoAutomacao(
      personagemCampanhaId,
      db,
    );
    const configsTipo = contexto.configs.filter(
      (config) => config.tipoVinculado === dto.tipo,
    );
    const configInformada = dto.tecnicaOrigemId
      ? configsTipo.find((config) => config.tecnicaId === dto.tecnicaOrigemId)
      : null;
    if (dto.tecnicaOrigemId && !configInformada) {
      throw new BusinessException(
        'A tecnica informada nao habilita este tipo de vinculado',
        'ENTIDADE_TECNICA_ORIGEM_INVALIDA',
        { tecnicaOrigemId: dto.tecnicaOrigemId, tipo: dto.tipo },
      );
    }
    const config =
      configInformada ??
      configsTipo.find((item) => item.permiteCriarNovos) ??
      configsTipo[0] ??
      null;

    if (!config) {
      throw new BusinessException(
        'Personagem nao possui tecnica compativel para este vinculado',
        'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
        { personagemCampanhaId, tipo: dto.tipo, usuarioId },
      );
    }
    if (opcoes.validarModoCriacao !== false && !config.permiteCriarNovos) {
      throw new BusinessException(
        'Esta tecnica permite apenas associar vinculados predefinidos',
        'ENTIDADE_CRIACAO_MANUAL_BLOQUEADA',
        { tecnicaCodigo: config.tecnicaCodigo, modo: config.modo },
      );
    }
    if (opcoes.validarLimiteCadastro !== false) {
      await this.validarLimiteCadastroConfigurado(
        personagemCampanhaId,
        config,
        dto.vagasOcupadas ?? 1,
        undefined,
        db,
      );
    }
    return { contexto, config, overrideMestre: false };
  }

  private async validarLimiteCadastroConfigurado(
    personagemCampanhaId: number,
    config: ConfigVinculadoNormalizada,
    consumoNovo = 1,
    ignorarVinculadoId?: number,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    if (config.limiteCadastro === null) return;
    const entidades = await db.personagemCampanhaEntidadeVinculada.findMany({
      where: {
        personagemCampanhaId,
        ...(ignorarVinculadoId ? { id: { not: ignorarVinculadoId } } : {}),
        tipo: config.tipoVinculado,
        estado: { not: EstadoEntidadeVinculadaPersonagem.ARQUIVADO },
        ...(config.tipoVinculado === TipoEntidadeVinculadaPersonagem.SHIKIGAMI
          ? {
              OR: [
                { tecnicaOrigemId: config.tecnicaId },
                { tecnicaOrigemId: null },
              ],
            }
          : {}),
      },
      select: { vagasOcupadas: true },
    });
    const usado =
      config.unidadeCadastro === 'VAGAS'
        ? entidades.reduce(
            (total, entidade) => total + Math.max(1, entidade.vagasOcupadas),
            0,
          )
        : entidades.length;
    const consumo =
      config.unidadeCadastro === 'VAGAS' ? Math.max(1, consumoNovo) : 1;
    if (usado + consumo > config.limiteCadastro) {
      throw new BusinessException(
        config.tipoVinculado ===
          TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO
          ? 'Limite de vagas para corpos amaldicoados atingido'
          : 'Limite de vinculados cadastrados atingido',
        config.tipoVinculado === TipoEntidadeVinculadaPersonagem.SHIKIGAMI
          ? 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO'
          : 'ENTIDADE_LIMITE_CADASTRO',
        {
          personagemCampanhaId,
          tecnicaCodigo: config.tecnicaCodigo,
          limiteCadastro: config.limiteCadastro,
          usado,
          unidade: config.unidadeCadastro,
        },
      );
    }
  }

  private async carregarContextoAutomacao(
    personagemCampanhaId: number,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<ContextoAutomacaoVinculados> {
    const personagem = await db.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: {
        id: true,
        donoId: true,
        nivel: true,
        limitePeEaPorTurno: true,
        tecnicaInata: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            tecnicaBase: { select: { id: true, codigo: true, nome: true } },
          },
        },
        tecnicaInataPropria: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            tecnicaBase: { select: { id: true, codigo: true, nome: true } },
          },
        },
        tecnicasAprendidas: {
          select: {
            tecnica: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                tecnicaBase: {
                  select: { id: true, codigo: true, nome: true },
                },
              },
            },
          },
        },
        grausAprimoramento: {
          select: {
            valor: true,
            tipoGrau: { select: { codigo: true, nome: true } },
          },
        },
        modificadores: {
          where: { ativo: true },
          select: {
            campo: true,
            valor: true,
            periciaCodigo: true,
            tipoGrauCodigo: true,
          },
        },
        personagemBase: {
          select: {
            agilidade: true,
            forca: true,
            intelecto: true,
            presenca: true,
            vigor: true,
            tecnicaInata: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                tecnicaBase: {
                  select: { id: true, codigo: true, nome: true },
                },
              },
            },
            tecnicaInataPropria: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                tecnicaBase: {
                  select: { id: true, codigo: true, nome: true },
                },
              },
            },
            tecnicasAprendidas: {
              select: {
                tecnica: {
                  select: {
                    id: true,
                    codigo: true,
                    nome: true,
                    tecnicaBase: {
                      select: { id: true, codigo: true, nome: true },
                    },
                  },
                },
              },
            },
            grausAprimoramento: {
              select: {
                valor: true,
                tipoGrau: { select: { codigo: true, nome: true } },
              },
            },
            pericias: {
              select: {
                grauTreinamento: true,
                bonusExtra: true,
                pericia: {
                  select: { codigo: true, nome: true, atributoBase: true },
                },
              },
            },
          },
        },
      },
    });
    if (!personagem) {
      throw new BusinessException(
        'Personagem da campanha nao encontrado',
        'ENTIDADE_PERSONAGEM_NAO_ENCONTRADO',
        { personagemCampanhaId },
      );
    }

    type TecnicaResumo = {
      id: number;
      codigo: string;
      nome: string;
      tecnicaBase: { id: number; codigo: string; nome: string } | null;
    };
    const tecnicas = new Map<
      number,
      { id: number; codigo: string; nome: string }
    >();
    const adicionarTecnica = (tecnica: TecnicaResumo | null | undefined) => {
      if (!tecnica) return;
      tecnicas.set(tecnica.id, {
        id: tecnica.id,
        codigo: tecnica.codigo,
        nome: tecnica.nome,
      });
      if (tecnica.tecnicaBase) {
        tecnicas.set(tecnica.tecnicaBase.id, tecnica.tecnicaBase);
      }
    };
    adicionarTecnica(personagem.tecnicaInata);
    adicionarTecnica(personagem.tecnicaInataPropria);
    adicionarTecnica(personagem.personagemBase.tecnicaInata);
    adicionarTecnica(personagem.personagemBase.tecnicaInataPropria);
    personagem.tecnicasAprendidas.forEach((item) =>
      adicionarTecnica(item.tecnica),
    );
    personagem.personagemBase.tecnicasAprendidas.forEach((item) =>
      adicionarTecnica(item.tecnica),
    );

    const configsDb = tecnicas.size
      ? await db.tecnicaVinculadoConfig.findMany({
          where: { tecnicaId: { in: [...tecnicas.keys()] }, ativo: true },
          include: { tecnica: { select: { codigo: true, nome: true } } },
        })
      : [];
    const configs = configsDb.map((config) =>
      normalizarConfigVinculado(config, personagem.nivel),
    );
    const grausPreferenciais = personagem.grausAprimoramento.length
      ? personagem.grausAprimoramento
      : personagem.personagemBase.grausAprimoramento;
    const grausEfetivos = resolverGrausAprimoramentoEfetivosCampanha(
      grausPreferenciais,
      personagem.modificadores,
    );
    const periciasEfetivas = resolverPericiasEfetivasCampanha(
      personagem.personagemBase.pericias,
      personagem.modificadores,
    );
    const atributos = [
      personagem.personagemBase.agilidade,
      personagem.personagemBase.forca,
      personagem.personagemBase.intelecto,
      personagem.personagemBase.presenca,
      personagem.personagemBase.vigor,
    ];

    return {
      personagem: {
        id: personagem.id,
        donoId: personagem.donoId,
        nivel: personagem.nivel,
        limitePeEaPorTurno: personagem.limitePeEaPorTurno,
        maiorAtributo: Math.max(0, ...atributos),
        testeJujutsu:
          periciasEfetivas.find((pericia) => pericia.codigo === 'JUJUTSU')
            ?.bonusTotal ?? 0,
      },
      configs,
      graus: new Map(
        grausEfetivos.map((grau) => [grau.tipoGrauCodigo, grau.valor]),
      ),
    };
  }

  private aplicarAutomacaoCriacao(
    data: Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput,
    dto: CriarEntidadeVinculadaPersonagemDto,
    resolucao: ResolucaoCriacaoVinculado,
  ): Prisma.PersonagemCampanhaEntidadeVinculadaUncheckedCreateInput {
    if (resolucao.overrideMestre) {
      return { ...data, overrideMestre: true };
    }
    if (!resolucao.config || !resolucao.contexto) return data;
    if (dto.tipo === TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA) {
      return {
        ...data,
        tecnicaOrigemId: resolucao.config.tecnicaId,
        overrideMestre: false,
      };
    }

    const papel = dto.papel ?? PapelCalculoEntidadeVinculada.FLEXIVEL;
    const calculo = this.calcularAutomaticoDados(
      data,
      resolucao.contexto,
      resolucao.config,
      'Criacao inicial',
      papel,
    );
    this.validarDistribuicaoAutomatica(calculo, data);
    return {
      ...data,
      tecnicaOrigemId: resolucao.config.tecnicaId,
      tipoGrauCodigo: resolucao.config.tipoGrauCodigo,
      nivelReferencia: resolucao.contexto.personagem.nivel,
      grauReferencia: this.resolverGrauConfig(
        resolucao.config,
        resolucao.contexto,
      ),
      precisaRecalculo: false,
      calculoAutomatico: this.jsonInput(calculo),
      overrideMestre: false,
      pontosVidaMax: calculo.derivados.pontosVidaMax,
      pontosVidaAtual: calculo.derivados.pontosVidaMax,
      defesa: calculo.derivados.defesa,
      rd: calculo.derivados.rd,
      cargasMax: data.cargasMax ?? calculo.cargasSugeridas ?? undefined,
      cargasAtual: data.cargasAtual ?? calculo.cargasSugeridas ?? undefined,
      config: this.jsonInput(this.mesclarRegistros(data.config, { papel })),
    };
  }

  private marcarRecalculoSeNecessario(
    data: DadosEntidadeVinculada,
    dto: AtualizarEntidadeVinculadaPersonagemDto,
    atual: EntidadeVinculadaMapeavel,
    resolucao: ResolucaoCriacaoVinculado,
  ) {
    if (resolucao.overrideMestre) {
      data.overrideMestre = true;
      return;
    }
    if (!atual.calculoAutomatico) return;
    const camposMecanicos: Array<
      keyof AtualizarEntidadeVinculadaPersonagemDto
    > = [
      'agilidade',
      'forca',
      'intelecto',
      'presenca',
      'vigor',
      'luta',
      'pontaria',
      'jujutsu',
      'fortitude',
      'reflexos',
      'vontade',
      'papel',
      'vagasOcupadas',
    ];
    if (camposMecanicos.some((campo) => dto[campo] !== undefined)) {
      data.precisaRecalculo = true;
      if (dto.papel) {
        data.config = this.jsonInput(
          this.mesclarRegistros(atual.config, { papel: dto.papel }),
        );
      }
    }
  }

  private calcularAutomaticoAtual(
    atual: EntidadeVinculadaMapeavel,
    contexto: ContextoAutomacaoVinculados,
    config: ConfigVinculadoNormalizada,
  ) {
    return this.calcularAutomaticoDados(
      atual,
      contexto,
      config,
      'Dados do personagem alterados',
      this.lerPapelEntidade(atual),
    );
  }

  private calcularAutomaticoDados(
    dados: Record<string, unknown>,
    contexto: ContextoAutomacaoVinculados,
    config: ConfigVinculadoNormalizada,
    motivo: string,
    papel: PapelCalculoVinculado = 'FLEXIVEL',
  ) {
    const calculo = calcularFichaAutomaticaVinculado({
      tipo: config.tipoVinculado,
      nivel: contexto.personagem.nivel,
      grau: this.resolverGrauConfig(config, contexto),
      maiorAtributoDono: contexto.personagem.maiorAtributo,
      testeJujutsuDono: contexto.personagem.testeJujutsu,
      limitePeEaPorTurno: contexto.personagem.limitePeEaPorTurno,
      papel,
      distribuicao: {
        agilidade: this.numeroPersistencia(dados.agilidade, 0),
        forca: this.numeroPersistencia(dados.forca, 0),
        intelecto: this.numeroPersistencia(dados.intelecto, 0),
        presenca: this.numeroPersistencia(dados.presenca, 0),
        vigor: this.numeroPersistencia(dados.vigor, 0),
        luta: this.numeroPersistencia(dados.luta, 0),
        pontaria:
          typeof dados.pontaria === 'number'
            ? dados.pontaria
            : lerPontariaVinculado(dados.periciasEspeciais),
        jujutsu: this.numeroPersistencia(dados.jujutsu, 0),
        fortitude: this.numeroPersistencia(dados.fortitude, 0),
        reflexos: this.numeroPersistencia(dados.reflexos, 0),
        vontade: this.numeroPersistencia(dados.vontade, 0),
      },
      motivoRecalculo: motivo,
    });
    return {
      ...calculo,
      regraCalculo: config.regraCalculo,
      versaoRegra: config.versaoRegra,
    };
  }

  private validarDistribuicaoAutomatica(
    calculo: ReturnType<typeof calcularFichaAutomaticaVinculado>,
    dados: Record<string, unknown>,
  ) {
    const excedentes = Object.values(calculo.excedentes).some(
      (valor) => valor > 0,
    );
    const atributos = ['agilidade', 'forca', 'intelecto', 'presenca', 'vigor'];
    const atributoAcimaTeto = atributos.some(
      (campo) =>
        this.numeroPersistencia(dados[campo], 0) > calculo.pools.tetoAtributo,
    );
    const ataqueAcimaTeto =
      calculo.pools.tetoAtaque !== null &&
      [
        this.numeroPersistencia(dados.luta, 0),
        typeof dados.pontaria === 'number'
          ? dados.pontaria
          : lerPontariaVinculado(dados.periciasEspeciais),
        this.numeroPersistencia(dados.jujutsu, 0),
      ].some((valor) => valor > (calculo.pools.tetoAtaque ?? 0));
    const resistenciaAcimaTeto = ['fortitude', 'reflexos', 'vontade'].some(
      (campo) =>
        this.numeroPersistencia(dados[campo], 0) >
        calculo.pools.tetoResistencia,
    );
    if (
      excedentes ||
      atributoAcimaTeto ||
      ataqueAcimaTeto ||
      resistenciaAcimaTeto
    ) {
      throw new BusinessException(
        'Distribuicao excede os pools ou tetos permitidos pela tecnica',
        'ENTIDADE_DISTRIBUICAO_INVALIDA',
        { pools: calculo.pools, excedentes: calculo.excedentes },
      );
    }
  }

  private resolverGrauConfig(
    config: ConfigVinculadoNormalizada,
    contexto: ContextoAutomacaoVinculados,
  ): number {
    return config.tipoGrauCodigo
      ? (contexto.graus.get(config.tipoGrauCodigo) ?? 0)
      : 0;
  }

  private localizarConfigEntidade(
    entidade: Pick<EntidadeVinculadaMapeavel, 'tecnicaOrigemId' | 'tipo'>,
    configs: ConfigVinculadoNormalizada[],
  ) {
    return (
      configs.find(
        (config) =>
          config.tecnicaId === entidade.tecnicaOrigemId &&
          config.tipoVinculado === entidade.tipo,
      ) ?? null
    );
  }

  private montarCapacidadeTipo(
    tipo: TipoEntidadeVinculadaPersonagem,
    contexto: ContextoAutomacaoVinculados,
    configs: ConfigVinculadoNormalizada[],
    entidades: Array<{
      tecnicaOrigemId: number | null;
      vagasOcupadas: number;
    }>,
    instancias: Array<{
      entidadeVinculada: {
        tecnicaOrigemId: number | null;
        vagasOcupadas: number;
      } | null;
    }>,
  ) {
    const usarVagas =
      tipo === TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO;
    const cadastroUsado = usarVagas
      ? entidades.reduce(
          (total, item) => total + Math.max(1, item.vagasOcupadas),
          0,
        )
      : entidades.length;
    const ativoUsado = usarVagas
      ? instancias.reduce(
          (total, item) =>
            total + Math.max(1, item.entidadeVinculada?.vagasOcupadas ?? 1),
          0,
        )
      : instancias.length;
    const limitesCadastro = configs.map((config) => config.limiteCadastro);
    const limitesAtivo = configs.map((config) => config.limiteAtivo);
    const combinar = (limites: Array<number | null>) => {
      if (limites.length === 0) return 0;
      if (limites.some((limite) => limite === null)) return null;
      const numeros = limites as number[];
      return tipo === TipoEntidadeVinculadaPersonagem.SHIKIGAMI
        ? numeros.reduce((total, valor) => total + valor, 0)
        : Math.max(...numeros);
    };
    const limiteCadastro = combinar(limitesCadastro);
    const limiteAtivo = combinar(limitesAtivo);
    const modos = new Set(configs.map((config) => config.modo));
    const modo =
      modos.size > 1 || modos.has(ModoVinculadoTecnica.HIBRIDO)
        ? ModoVinculadoTecnica.HIBRIDO
        : (configs[0]?.modo ?? null);

    return {
      tipo,
      habilitado: configs.length > 0,
      modo,
      permiteCriarNovos: configs.some((config) => config.permiteCriarNovos),
      usaTemplates: configs.some((config) => config.usaTemplates),
      cadastro: {
        unidade: usarVagas ? 'VAGAS' : 'QUANTIDADE',
        usado: cadastroUsado,
        maximo: limiteCadastro,
        disponivel:
          limiteCadastro === null
            ? null
            : Math.max(0, limiteCadastro - cadastroUsado),
        excedente:
          limiteCadastro === null
            ? 0
            : Math.max(0, cadastroUsado - limiteCadastro),
      },
      ativo: {
        unidade: usarVagas ? 'VAGAS' : 'QUANTIDADE',
        usado: ativoUsado,
        maximo: limiteAtivo,
        disponivel:
          limiteAtivo === null ? null : Math.max(0, limiteAtivo - ativoUsado),
        excedente:
          limiteAtivo === null ? 0 : Math.max(0, ativoUsado - limiteAtivo),
      },
      configuracoes: configs.map((config) => ({
        ...config,
        previewCalculo:
          tipo === TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA
            ? null
            : calcularFichaAutomaticaVinculado({
                tipo,
                nivel: contexto.personagem.nivel,
                grau: this.resolverGrauConfig(config, contexto),
                maiorAtributoDono: contexto.personagem.maiorAtributo,
                testeJujutsuDono: contexto.personagem.testeJujutsu,
                limitePeEaPorTurno: contexto.personagem.limitePeEaPorTurno,
                papel: 'FLEXIVEL',
                distribuicao: {
                  agilidade: 0,
                  forca: 0,
                  intelecto: 0,
                  presenca: 0,
                  vigor: 0,
                  luta: 0,
                  pontaria: 0,
                  jujutsu: 0,
                  fortitude: 0,
                  reflexos: 0,
                  vontade: 0,
                },
              }),
      })),
    };
  }

  private normalizarSnapshotTemplate(
    snapshotJson: Prisma.JsonValue | null,
  ): DadosEntidadeVinculada {
    if (
      !snapshotJson ||
      typeof snapshotJson !== 'object' ||
      Array.isArray(snapshotJson)
    ) {
      return {};
    }
    const snapshot = snapshotJson as Record<string, unknown>;
    const permitidos = [
      'fichaTipo',
      'tipoNpc',
      'tamanho',
      'vd',
      'agilidade',
      'forca',
      'intelecto',
      'presenca',
      'vigor',
      'percepcao',
      'iniciativa',
      'fortitude',
      'reflexos',
      'vontade',
      'luta',
      'jujutsu',
      'defesa',
      'pontosVidaMax',
      'pontosVidaAtual',
      'rd',
      'deslocamentoMetros',
      'vagasOcupadas',
      'cargasMax',
      'cargasAtual',
      'periciasEspeciais',
      'resistencias',
      'vulnerabilidades',
      'passivas',
      'acoes',
      'habilidades',
      'custos',
      'limites',
      'config',
    ];
    return Object.fromEntries(
      permitidos
        .filter((campo) => snapshot[campo] !== undefined)
        .map((campo) => [campo, snapshot[campo]]),
    ) as DadosEntidadeVinculada;
  }

  private lerPapelEntidade(
    entidade: Pick<EntidadeVinculadaMapeavel, 'config' | 'calculoAutomatico'>,
  ): PapelCalculoVinculado {
    const papel =
      this.lerTextoJson(entidade.config, ['papel']) ??
      this.lerTextoJson(entidade.calculoAutomatico, ['papel']);
    return papel === 'AGIL' || papel === 'TANQUE' ? papel : 'FLEXIVEL';
  }

  private mesclarPontariaPericiasEspeciais(
    periciasEspeciais: Record<string, unknown> | null | undefined,
    pontaria: number | undefined,
  ) {
    if (pontaria === undefined) return periciasEspeciais;
    return { ...(periciasEspeciais ?? {}), pontaria };
  }

  private mesclarRegistros(
    atual: unknown,
    novos: Record<string, unknown>,
  ): Record<string, unknown> {
    const base =
      atual && typeof atual === 'object' && !Array.isArray(atual)
        ? (atual as Record<string, unknown>)
        : {};
    return { ...base, ...novos };
  }

  private lerNumeroJson(valor: unknown, caminho: string[]): number | null {
    let atual: unknown = valor;
    for (const chave of caminho) {
      if (!atual || typeof atual !== 'object' || Array.isArray(atual)) {
        return null;
      }
      atual = (atual as Record<string, unknown>)[chave];
    }
    return typeof atual === 'number' && Number.isFinite(atual) ? atual : null;
  }

  private lerTextoJson(valor: unknown, caminho: string[]): string | null {
    let atual: unknown = valor;
    for (const chave of caminho) {
      if (!atual || typeof atual !== 'object' || Array.isArray(atual)) {
        return null;
      }
      atual = (atual as Record<string, unknown>)[chave];
    }
    return typeof atual === 'string' ? atual : null;
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
