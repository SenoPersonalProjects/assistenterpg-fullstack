// src/personagem-base/personagem-base.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AtributoBaseEA } from '@prisma/client';

// ✅ IMPORTAR InventarioService
import { InventarioService } from '../inventario/inventario.service';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  PersonagemBaseNaoEncontradoException,
  ErroAtualizacaoPersonagemException,
  AtributoChaveEaInvalidoException,
} from 'src/common/exceptions/personagem.exception';

import {
  CreatePersonagemBaseDto,
  GrauTreinamentoDto,
  ItemInventarioDto,
} from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';

import { validarTrilhaECaminho } from './regras-criacao/regras-trilha';
import { validarOrigemClaTecnica } from './regras-criacao/regras-origem-cla';

// Engine
import { calcularEstadoFinalPersonagemBase } from './engine/personagem-base.engine';

// NOVOS
import { PersonagemBaseMapper } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';

type PrismaLike = PrismaService | Prisma.TransactionClient;

type ModDerivados = {
  pvPorNivelExtra: number;
  peBaseExtra: number;
  limitePeEaExtra: number;
  defesaExtra: number;
  espacosInventarioExtra: number;
};

@Injectable()
export class PersonagemBaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PersonagemBaseMapper,
    private readonly persistence: PersonagemBasePersistence,
    // ✅ INJETAR InventarioService
    private readonly inventarioService: InventarioService,
  ) {}

  // ==================== HELPERS GERAIS ====================
  private limparUndefined<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    for (const k of Object.keys(out)) {
      if (out[k] === undefined) delete out[k];
    }
    return out;
  }

  private jsonToStringArray(value: Prisma.JsonValue | null | undefined): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v) => typeof v === 'string') as string[];
  }

  private validarAtributoChaveEa(valor: unknown): asserts valor is AtributoBaseEA {
    const valoresValidos = Object.values(AtributoBaseEA) as string[];
    if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
      throw new AtributoChaveEaInvalidoException(valor, valoresValidos);
    }
  }

  private getPassivasIdsFromRelacao(passivas: Array<{ passivaId: number }>): number[] {
    return (passivas ?? []).map((p) => p.passivaId);
  }

  private getPoderesFromRelacao(
    poderes: Array<{ habilidadeId: number; config: any }> | undefined,
  ): Array<{ habilidadeId: number; config?: any }> {
    return (poderes ?? []).map((p) => ({
      habilidadeId: p.habilidadeId,
      config: p.config ?? undefined,
    }));
  }

  private limparUndefinedDeepJson<T>(value: T | undefined): T | undefined {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  // ==================== HOOKS DO ENGINE ====================

  /** ✅ Busca habilidades do personagem */
  private async buscarHabilidadesPersonagem(
    params: {
      nivel: number;
      origemId: number;
      classeId: number;
      trilhaId?: number | null;
      caminhoId?: number | null;
      tecnicaInataId?: number | null;
      estudouEscolaTecnica: boolean;
      poderesGenericos?: Array<{ habilidadeId: number; config?: any }>;
    },
    prisma: PrismaLike = this.prisma,
  ) {
    const {
      nivel,
      origemId,
      classeId,
      trilhaId,
      caminhoId,
      tecnicaInataId,
      estudouEscolaTecnica,
      poderesGenericos,
    } = params;

    const habilidades: Array<{
      habilidadeId: number;
      habilidade: {
        nome: string;
        tipo?: string;
        mecanicasEspeciais?: any;
        efeitosGrau: Array<{
          tipoGrauCodigo: string;
          valor: number;
          escalonamentoPorNivel: any;
        }>;
      };
    }> = [];

    // Habilidades da origem
    const habilidadesOrigem = await prisma.habilidadeOrigem.findMany({
      where: { origemId },
      include: {
        habilidade: {
          include: { efeitosGrau: true },
        },
      },
    });

    habilidades.push(
      ...habilidadesOrigem.map((ho) => ({
        habilidadeId: ho.habilidadeId,
        habilidade: ho.habilidade as any,
      })),
    );

    // Recurso de classe (nível 1)
    const recursoClasse = await prisma.habilidadeClasse.findFirst({
      where: {
        classeId,
        nivelConcedido: 1,
        habilidade: { tipo: 'RECURSO_CLASSE' },
      },
      include: {
        habilidade: {
          include: { efeitosGrau: true },
        },
      },
    });

    if (recursoClasse) {
      habilidades.push({
        habilidadeId: recursoClasse.habilidadeId,
        habilidade: recursoClasse.habilidade as any,
      });
    }

    // Habilidades da classe (por nível, excluindo recurso já adicionado)
    const habilidadesClasse = await prisma.habilidadeClasse.findMany({
      where: {
        classeId,
        nivelConcedido: { lte: nivel },
        habilidade: { tipo: { not: 'RECURSO_CLASSE' } },
      },
      include: {
        habilidade: {
          include: { efeitosGrau: true },
        },
      },
    });

    habilidades.push(
      ...habilidadesClasse.map((hc) => ({
        habilidadeId: hc.habilidadeId,
        habilidade: hc.habilidade as any,
      })),
    );

    // Habilidades da trilha (por nível, sem caminho específico)
    if (trilhaId) {
      const habilidadesTrilha = await prisma.habilidadeTrilha.findMany({
        where: {
          trilhaId,
          caminhoId: null,
          nivelConcedido: { lte: nivel },
        },
        include: {
          habilidade: {
            include: { efeitosGrau: true },
          },
        },
      });

      habilidades.push(
        ...habilidadesTrilha.map((ht) => ({
          habilidadeId: ht.habilidadeId,
          habilidade: ht.habilidade as any,
        })),
      );
    }

    // Habilidades do caminho (por nível)
    if (caminhoId) {
      const habilidadesCaminho = await prisma.habilidadeTrilha.findMany({
        where: {
          caminhoId,
          nivelConcedido: { lte: nivel },
        },
        include: {
          habilidade: {
            include: { efeitosGrau: true },
          },
        },
      });

      habilidades.push(
        ...habilidadesCaminho.map((ht) => ({
          habilidadeId: ht.habilidadeId,
          habilidade: ht.habilidade as any,
        })),
      );
    }

    // Técnica inata
    if (tecnicaInataId) {
      const tecnicaInata = await prisma.tecnicaAmaldicoada.findUnique({
        where: { id: tecnicaInataId },
        select: {
          id: true,
          nome: true,
          tipo: true,
        },
      });

      if (tecnicaInata) {
        habilidades.push({
          habilidadeId: tecnicaInata.id,
          habilidade: {
            nome: tecnicaInata.nome,
            tipo: tecnicaInata.tipo,
            mecanicasEspeciais: null,
            efeitosGrau: [],
          },
        });
      }
    }

    // Escola Técnica como habilidade (se estudou)
    if (estudouEscolaTecnica) {
      const escolaTecnica = await prisma.habilidade.findUnique({
        where: { nome: 'Escola Técnica' },
        include: { efeitosGrau: true },
      });

      if (escolaTecnica) {
        habilidades.push({
          habilidadeId: escolaTecnica.id,
          habilidade: escolaTecnica as any,
        });
      }
    }

    // Poderes genéricos selecionados (via instâncias) - permite repetição
    if (poderesGenericos && poderesGenericos.length > 0) {
      const idsUnicos = Array.from(new Set(poderesGenericos.map((p) => p.habilidadeId)));

      const poderesDb = await prisma.habilidade.findMany({
        where: {
          id: { in: idsUnicos },
          tipo: 'PODER_GENERICO',
        },
        include: { efeitosGrau: true },
      });

      const mapPoder = new Map(poderesDb.map((p) => [p.id, p] as const));

      for (const inst of poderesGenericos) {
        const poder = mapPoder.get(inst.habilidadeId);
        if (!poder) continue;

        habilidades.push({
          habilidadeId: poder.id,
          habilidade: poder as any,
        });
      }
    }

    return habilidades;
  }

  /** ✅ Calcula modificadores de derivados por habilidades */
  private calcularModificadoresDerivadosPorHabilidades(
    habilidades: Array<{ habilidade: { nome: string; mecanicasEspeciais?: any } }>,
    nivel: number,
  ): ModDerivados {
    const mods: ModDerivados = {
      pvPorNivelExtra: 0,
      peBaseExtra: 0,
      limitePeEaExtra: 0,
      defesaExtra: 0,
      espacosInventarioExtra: 0,
    };

    for (const h of habilidades) {
      const m = h.habilidade.mecanicasEspeciais as any;

      if (m?.pvPorNivel && typeof m.pvPorNivel === 'number') {
        mods.pvPorNivelExtra += m.pvPorNivel;
      }

      if (m?.recursos) {
        if (typeof m.recursos.peBase === 'number') {
          mods.peBaseExtra += m.recursos.peBase;
        }

        if (typeof m.recursos.pePorNivelImpar === 'number') {
          const niveisImpares = Math.ceil(nivel / 2);
          mods.peBaseExtra += m.recursos.pePorNivelImpar * niveisImpares;
        }

        if (typeof m.recursos.limitePePorTurnoBonus === 'number') {
          mods.limitePeEaExtra += m.recursos.limitePePorTurnoBonus;
        }
      }

      if (m?.defesa?.bonus && typeof m.defesa.bonus === 'number') {
        mods.defesaExtra += m.defesa.bonus;
      }

      if (m?.inventario?.espacosExtra && typeof m.inventario.espacosExtra === 'number') {
        mods.espacosInventarioExtra += m.inventario.espacosExtra;
      }
    }

    return mods;
  }

  private async executarEngine(
    dto: CreatePersonagemBaseDto,
    opts: { strictPassivas: boolean; prisma: PrismaLike; personagemBaseId?: number },
  ) {
    return calcularEstadoFinalPersonagemBase({
      dto,
      strictPassivas: opts.strictPassivas,
      prisma: opts.prisma,
      personagemBaseId: opts.personagemBaseId,
      buscarHabilidadesPersonagem: this.buscarHabilidadesPersonagem.bind(this),
      calcularModsDerivadosPorHabilidades:
        this.calcularModificadoresDerivadosPorHabilidades.bind(this),
    });
  }

  private montarDtoCompletoParaUpdate(
    existe: any,
    dto: UpdatePersonagemBaseDto,
  ): CreatePersonagemBaseDto {
    const patch: any = dto as any;

    const periciasClasseEscolhidasFinal =
      patch.periciasClasseEscolhidasCodigos ??
      this.jsonToStringArray(existe.periciasClasseEscolhidasCodigos as any);

    const periciasOrigemEscolhidasFinal =
      patch.periciasOrigemEscolhidasCodigos ??
      this.jsonToStringArray(existe.periciasOrigemEscolhidasCodigos as any);

    const periciasLivresFinal =
      patch.periciasLivresCodigos ?? this.jsonToStringArray(existe.periciasLivresCodigos as any);

    const passivasAtributosAtivosFinal =
      patch.passivasAtributosAtivos ??
      this.jsonToStringArray((existe as any).passivasAtributosAtivos);

    const passivasAtributosConfigRaw =
      patch.passivasAtributosConfig !== undefined
        ? patch.passivasAtributosConfig
        : ((existe as any).passivasAtributosConfig ?? null);

    const passivasAtributosConfigFinal = this.limparUndefinedDeepJson(
      passivasAtributosConfigRaw ?? undefined,
    );

    const poderesBancoNormalizados = this.getPoderesFromRelacao(
      existe.poderesGenericos as any,
    ).map((inst) => ({ ...inst, config: inst.config ?? {} }));

    const poderesFinal =
      patch.poderesGenericos !== undefined
        ? (patch.poderesGenericos as any[]).map((inst) => ({
            ...inst,
            config: inst.config ?? {},
          }))
        : poderesBancoNormalizados;

    const profsExtrasFinal =
      patch.proficienciasCodigos !== undefined
        ? patch.proficienciasCodigos
        : this.jsonToStringArray((existe as any).proficienciasExtrasCodigos);

    const grausAprimoramentoFinal =
      patch.grausAprimoramento !== undefined
        ? patch.grausAprimoramento
        : (existe.grausAprimoramento ?? []).map((g: any) => ({
            tipoGrauCodigo: g.tipoGrau.codigo,
            valor: g.valor,
          }));

    const grausTreinamentoFinal =
      patch.grausTreinamento !== undefined
        ? patch.grausTreinamento
        : (existe.grausTreinamento ?? []).reduce((acc: any[], gt: any) => {
            const nivelExistente = acc.find((x) => x.nivel === gt.nivel);
            const melhoria = {
              periciaCodigo: gt.periciaCodigo,
              grauAnterior: gt.grauAnterior,
              grauNovo: gt.grauNovo,
            };
            if (nivelExistente) nivelExistente.melhorias.push(melhoria);
            else acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
            return acc;
          }, [] as any[]);

    const dtoCompleto: CreatePersonagemBaseDto = {
      nome: patch.nome ?? existe.nome,
      nivel: patch.nivel ?? existe.nivel,

      claId: patch.claId ?? existe.claId,
      origemId: patch.origemId ?? existe.origemId,
      classeId: patch.classeId ?? existe.classeId,

      trilhaId: patch.trilhaId !== undefined ? patch.trilhaId : existe.trilhaId,
      caminhoId: patch.caminhoId !== undefined ? patch.caminhoId : existe.caminhoId,

      agilidade: patch.agilidade ?? existe.agilidade,
      forca: patch.forca ?? existe.forca,
      intelecto: patch.intelecto ?? existe.intelecto,
      presenca: patch.presenca ?? existe.presenca,
      vigor: patch.vigor ?? existe.vigor,

      estudouEscolaTecnica: patch.estudouEscolaTecnica ?? existe.estudouEscolaTecnica,

      idade: patch.idade !== undefined ? patch.idade : existe.idade,
      prestigioBase: patch.prestigioBase ?? existe.prestigioBase,
      prestigioClaBase:
        patch.prestigioClaBase !== undefined ? patch.prestigioClaBase : existe.prestigioClaBase,
      alinhamentoId:
        patch.alinhamentoId !== undefined ? patch.alinhamentoId : existe.alinhamentoId,
      background: patch.background !== undefined ? patch.background : existe.background,

      atributoChaveEa: (patch.atributoChaveEa ?? existe.atributoChaveEa) as any,

      tecnicaInataId:
        patch.tecnicaInataId !== undefined ? patch.tecnicaInataId : existe.tecnicaInataId,

      proficienciasCodigos: profsExtrasFinal ?? [],
      grausAprimoramento: grausAprimoramentoFinal ?? [],
      grausTreinamento: grausTreinamentoFinal ?? [],

      poderesGenericos: poderesFinal ?? [],

      passivasAtributoIds:
        patch.passivasAtributoIds ?? this.getPassivasIdsFromRelacao(existe.passivas ?? []),

      passivasAtributosAtivos: passivasAtributosAtivosFinal ?? [],
      passivasAtributosConfig: (passivasAtributosConfigFinal ?? {}) as any,

      periciasClasseEscolhidasCodigos: periciasClasseEscolhidasFinal ?? [],
      periciasOrigemEscolhidasCodigos: periciasOrigemEscolhidasFinal ?? [],
      periciasLivresCodigos: periciasLivresFinal ?? [],

      periciasLivresExtras: 0,
    } as any;

    return dtoCompleto;
  }

  // ==================== INVENTÁRIO (SIMPLIFICADO) ====================
  private async calcularResumoInventario(personagemBaseId: number) {
    try {
      const personagem = await this.prisma.personagemBase.findUnique({
        where: { id: personagemBaseId },
        select: {
          forca: true,
          espacosInventarioBase: true,
          espacosInventarioExtra: true,
          espacosOcupados: true,
          sobrecarregado: true,
        },
      });

      if (!personagem) return null;

      const itens = await this.prisma.inventarioItemBase.findMany({
        where: { personagemBaseId },
        select: { id: true },
      });

      const espacosTotal =
        personagem.espacosInventarioBase + (personagem.espacosInventarioExtra || 0);
      const espacosDisponiveis = espacosTotal - (personagem.espacosOcupados || 0);

      return {
        espacosBase: personagem.espacosInventarioBase,
        espacosExtra: personagem.espacosInventarioExtra || 0,
        espacosTotal,
        espacosOcupados: personagem.espacosOcupados || 0,
        espacosDisponiveis,
        sobrecarregado: personagem.sobrecarregado || false,
        quantidadeItens: itens.length,
      };
    } catch (error) {
      console.error('[SERVICE] Erro ao calcular resumo de inventário:', error);
      return null;
    }
  }

  // ==================== PREVIEW / CRUD ====================

  async preview(donoId: number, dto: CreatePersonagemBaseDto) {
    const patch: any = dto as any;
    const dtoPreview: any = { ...dto };

    if (patch.periciasLivresExtras !== undefined) {
      dtoPreview.periciasLivresExtras = patch.periciasLivresExtras;
    }

    const estado = await this.executarEngine(dtoPreview, {
      strictPassivas: false,
      prisma: this.prisma,
    });

    const todasPericias = await this.prisma.pericia.findMany();
    const mapaPericiasPorCodigo = new Map(todasPericias.map((p) => [p.codigo, p] as const));

    const periciasDetalhadas = Array.from(estado.periciasMapCodigo.entries()).map(
      ([codigo, p]) => {
        const pericia = mapaPericiasPorCodigo.get(codigo);
        return {
          codigo,
          nome: pericia?.nome ?? '',
          atributoBase: pericia?.atributoBase ?? 'INT',
          grauTreinamento: p.grauTreinamento,
          bonusExtra: p.bonusExtra,
          bonusTotal: p.grauTreinamento * 5 + p.bonusExtra,
        };
      },
    );

    const proficienciasDetalhadas = await this.prisma.proficiencia.findMany({
      where: { codigo: { in: estado.profsFinais } },
    });

    const tiposGrau = await this.prisma.tipoGrau.findMany({
      where: { codigo: { in: estado.grausFinais.map((g) => g.tipoGrauCodigo) } },
    });

    const mapaTiposGrau = new Map(tiposGrau.map((t) => [t.codigo, t.nome] as const));
    const habilidadesNomes = estado.habilidades.map((h) => h.habilidade.nome);

    const resistenciasArray = Array.from(estado.resistenciasFinais.entries()).map(
      ([codigo, valor]) => ({ codigo, valor }),
    );

    const resistenciasComNomes =
      resistenciasArray.length > 0
        ? await Promise.all(
            resistenciasArray.map(async (r) => {
              const tipo = await this.prisma.resistenciaTipo.findUnique({
                where: { codigo: r.codigo },
                select: { nome: true, descricao: true },
              });

              return {
                codigo: r.codigo,
                nome: tipo?.nome ?? r.codigo,
                descricao: tipo?.descricao ?? null,
                valor: r.valor,
              };
            }),
          )
        : [];

    // ✅ VALIDAR ITENS (se houver) usando preview do InventarioService
    let itensValidados: any[] = [];
    let errosItens: any[] = [];

    if (dto.itensInventario && dto.itensInventario.length > 0) {
      for (const item of dto.itensInventario) {
        try {
          // ✅ Validar cada item individualmente (simula personagemBaseId temporário)
          const previewItem = await this.inventarioService.previewItensInventario({
            forca: dto.forca,
            prestigioBase: dto.prestigioBase ?? 0,
            itens: [
              {
                equipamentoId: item.equipamentoId,
                quantidade: item.quantidade,
                equipado: item.equipado ?? false,
                modificacoes: item.modificacoesIds ?? [],
                nomeCustomizado: item.nomeCustomizado,
              },
            ],
          });

          itensValidados.push(previewItem.itens[0]);
        } catch (error: any) {
          errosItens.push({
            equipamentoId: item.equipamentoId,
            erro: error.message,
          });
        }
      }
    }

    return {
      ...estado.dtoNormalizado,

      proficienciasExtrasCodigos: (estado.dtoNormalizado as any).proficienciasCodigos ?? [],

      passivasNeedsChoice: (estado.passivasResolvidas as any).needsChoice,
      passivasElegiveis: (estado.passivasResolvidas as any).elegiveis,

      passivasAtributosAtivos: estado.passivasResolvidas.ativos,
      passivasAtributoIds: estado.passivasResolvidas.passivaIds,

      passivasAtributosConfig: (estado.dtoNormalizado as any).passivasAtributosConfig ?? {},

      poderesGenericos: estado.poderesGenericosNormalizados ?? [],

      pericias: periciasDetalhadas.filter((p) => p.grauTreinamento > 0),

      grausAprimoramento: estado.grausFinais.map((g) => ({
        tipoGrauCodigo: g.tipoGrauCodigo,
        tipoGrauNome: mapaTiposGrau.get(g.tipoGrauCodigo) ?? g.tipoGrauCodigo,
        valor: g.valor,
      })),

      proficiencias: proficienciasDetalhadas.map((p) => ({
        codigo: p.codigo,
        nome: p.nome,
        tipo: p.tipo,
        categoria: p.categoria,
        subtipo: p.subtipo,
      })),

      habilidadesAtivas: habilidadesNomes,
      bonusHabilidades: estado.bonusHabilidades,

      atributosDerivados: estado.derivadosFinais,

      grausLivresInfo: estado.grausLivresInfo,
      periciasLivresInfo: estado.periciasLivresInfo,

      espacosInventario: estado.espacosInventario,

      resistencias: resistenciasComNomes,

      // ✅ Itens validados
      itensInventario: itensValidados,
      errosItens: errosItens.length > 0 ? errosItens : undefined,
    };
  }

  async criar(donoId: number, dto: CreatePersonagemBaseDto) {
    const estado = await this.executarEngine(dto, {
      strictPassivas: true,
      prisma: this.prisma,
    });

    const dataBase = this.limparUndefined({
      ...estado.dtoNormalizado,
      proficienciasExtrasCodigos: dto.proficienciasCodigos ?? [],
      ...estado.derivadosFinais,
      espacosInventarioBase: estado.espacosInventario.base,
      espacosInventarioExtra: estado.espacosInventario.extra,
      // ✅ Inicializar campos de inventário
      espacosOcupados: 0,
      sobrecarregado: false,
    } as any);

    const personagem = await this.prisma.$transaction(async (tx) => {
      const personagemCriado = await this.persistence.criarComEstado(
        {
          donoId,
          dataBase,
          estado: {
            ...estado,
            resistenciasFinais: estado.resistenciasFinais,
          },
        },
        tx,
      );

      // ✅ ADICIONAR itens via InventarioService (COM validação de Grau Xamã)
      if (dto.itensInventario && dto.itensInventario.length > 0) {
        for (const item of dto.itensInventario) {
          await this.inventarioService.adicionarItem(
            donoId,
            {
              personagemBaseId: personagemCriado.id,
              equipamentoId: item.equipamentoId,
              quantidade: item.quantidade,
              equipado: item.equipado ?? false,
              modificacoes: item.modificacoesIds ?? [],
              nomeCustomizado: item.nomeCustomizado,
              notas: item.notas,
              // ✅ NÃO ignorar limites (preview já validou se o usuário permitiu)
            },
            {
              tx, // ✅ PASSAR TRANSAÇÃO
              skipOwnershipCheck: true, // ✅ SKIP VALIDAÇÃO DE OWNERSHIP (personagem sendo criado)
            },
          );
        }
      }

      return personagemCriado;
    });

    return {
      id: personagem.id,
      nome: personagem.nome,
      nivel: personagem.nivel,
      cla: personagem.cla.nome,
      origem: personagem.origem.nome,
      classe: personagem.classe.nome,
      trilha: personagem.trilha?.nome ?? null,
      caminho: personagem.caminho?.nome ?? null,
    };
  }

  async listarDoUsuario(donoId: number) {
    const lista = await this.prisma.personagemBase.findMany({
      where: { donoId },
      include: { cla: true, classe: true },
      orderBy: { nome: 'asc' },
    });

    return lista.map((p) => this.mapper.mapResumo(p));
  }

  async buscarPorId(donoId: number, id: number, incluirInventario = false) {
    const personagem = await this.prisma.personagemBase.findFirst({
      where: { id, donoId },
      include: {
        cla: true,
        origem: true,
        classe: true,
        trilha: true,
        caminho: true,
        tecnicaInata: true,
        alinhamento: true,
        proficiencias: { include: { proficiencia: true } },
        grausAprimoramento: {
          include: {
            tipoGrau: true,
          },
        },
        pericias: { include: { pericia: true } },
        grausTreinamento: true,
        habilidadesBase: { include: { habilidade: true } },
        passivas: { include: { passiva: true } },
        poderesGenericos: { include: { habilidade: true } },
        resistencias: {
          include: {
            resistenciaTipo: true,
          },
        },
      },
    });

    if (!personagem) throw new PersonagemBaseNaoEncontradoException(id);

    const personagemDetalhado: any = await this.mapper.mapDetalhado(personagem, this.prisma);

    if (incluirInventario) {
      const resumoInventario = await this.calcularResumoInventario(id);
      if (resumoInventario) {
        personagemDetalhado.inventario = resumoInventario;
      }
    }

    return personagemDetalhado;
  }

  async atualizar(donoId: number, id: number, dto: UpdatePersonagemBaseDto) {
    const existe = await this.prisma.personagemBase.findFirst({
      where: { id, donoId },
      include: {
        proficiencias: { include: { proficiencia: true } },
        grausAprimoramento: { include: { tipoGrau: true } },
        pericias: { include: { pericia: true } },
        grausTreinamento: true,
        habilidadesBase: {
          include: {
            habilidade: {
              include: { efeitosGrau: true },
            },
          },
        },
        passivas: { include: { passiva: true } },
        poderesGenericos: {
          include: {
            habilidade: {
              include: { efeitosGrau: true },
            },
          },
        },
        cla: true,
        classe: true,
        origem: true,
        trilha: true,
        caminho: true,
      },
    });

    if (!existe) throw new PersonagemBaseNaoEncontradoException(id);

    const dtoCompleto = this.montarDtoCompletoParaUpdate(existe, dto);

    await validarTrilhaECaminho(
      dtoCompleto.classeId,
      dtoCompleto.trilhaId,
      dtoCompleto.caminhoId,
      undefined,
      this.prisma,
    );

    await validarOrigemClaTecnica(
      dtoCompleto.claId,
      dtoCompleto.origemId,
      dtoCompleto.tecnicaInataId,
      this.prisma,
    );

    const atualizado = await this.prisma.$transaction(async (tx) => {
      const estado = await this.executarEngine(dtoCompleto, {
        strictPassivas: true,
        prisma: tx,
        personagemBaseId: id,
      });

      const dataUpdateBase = this.limparUndefined({
        nome: estado.dtoNormalizado.nome,
        nivel: estado.dtoNormalizado.nivel,

        claId: estado.dtoNormalizado.claId,
        origemId: estado.dtoNormalizado.origemId,
        classeId: estado.dtoNormalizado.classeId,

        trilhaId: (estado.dtoNormalizado as any).trilhaId ?? null,
        caminhoId: (estado.dtoNormalizado as any).caminhoId ?? null,

        agilidade: estado.dtoNormalizado.agilidade,
        forca: estado.dtoNormalizado.forca,
        intelecto: estado.dtoNormalizado.intelecto,
        presenca: estado.dtoNormalizado.presenca,
        vigor: estado.dtoNormalizado.vigor,

        estudouEscolaTecnica: estado.dtoNormalizado.estudouEscolaTecnica,
        tecnicaInataId: (estado.dtoNormalizado as any).tecnicaInataId ?? null,

        idade: (estado.dtoNormalizado as any).idade ?? null,
        prestigioBase: (estado.dtoNormalizado as any).prestigioBase ?? null,
        prestigioClaBase: (estado.dtoNormalizado as any).prestigioClaBase ?? null,
        alinhamentoId: (estado.dtoNormalizado as any).alinhamentoId ?? null,
        background: (estado.dtoNormalizado as any).background ?? null,

        atributoChaveEa: (estado.dtoNormalizado as any).atributoChaveEa,

        pvMaximo: estado.derivadosFinais.pvMaximo,
        peMaximo: estado.derivadosFinais.peMaximo,
        eaMaximo: estado.derivadosFinais.eaMaximo,
        sanMaximo: estado.derivadosFinais.sanMaximo,
        defesaBase: estado.derivadosFinais.defesaBase,
        defesaEquipamento: estado.derivadosFinais.defesaEquipamento,
        defesa: estado.derivadosFinais.defesaTotal,
        deslocamento: estado.derivadosFinais.deslocamento,
        limitePeEaPorTurno: estado.derivadosFinais.limitePeEaPorTurno,
        reacoesBasePorTurno: estado.derivadosFinais.reacoesBasePorTurno,
        turnosMorrendo: estado.derivadosFinais.turnosMorrendo,
        turnosEnlouquecendo: estado.derivadosFinais.turnosEnlouquecendo,
        bloqueio: estado.derivadosFinais.bloqueio,
        esquiva: estado.derivadosFinais.esquiva,

        espacosInventarioBase: estado.espacosInventario.base,
        espacosInventarioExtra: estado.espacosInventario.extra,

        passivasAtributosAtivos: estado.passivasResolvidas.ativos,
        passivasAtributosConfig: estado.passivasAtributosConfigLimpo ?? undefined,

        proficienciasExtrasCodigos: dtoCompleto.proficienciasCodigos ?? [],

        periciasClasseEscolhidasCodigos:
          (estado.dtoNormalizado as any).periciasClasseEscolhidasCodigos ?? [],
        periciasOrigemEscolhidasCodigos:
          (estado.dtoNormalizado as any).periciasOrigemEscolhidasCodigos ?? [],
        periciasLivresCodigos: (estado.dtoNormalizado as any).periciasLivresCodigos ?? [],
      });

      const resultado = await this.persistence.atualizarRebuildComEstado(
        {
          id,
          dataUpdateBase,
          estado: {
            ...estado,
            resistenciasFinais: estado.resistenciasFinais,
          },
        },
        tx,
      );

      // ✅ INVENTÁRIO: Delegar COMPLETAMENTE para InventarioService
      // O service já possui atualizarEstadoInventario() que recalcula tudo
      // Apenas atualizamos espacosInventarioBase/Extra aqui (força mudou?)

      return resultado;
    });

    if (!atualizado) {
      throw new ErroAtualizacaoPersonagemException();
    }

    return this.mapper.mapResumo(atualizado);
  }

  async remover(donoId: number, id: number) {
    const existe = await this.prisma.personagemBase.findFirst({
      where: { id, donoId },
    });

    if (!existe) throw new PersonagemBaseNaoEncontradoException(id);

    await this.prisma.inventarioItemBaseModificacao.deleteMany({
      where: {
        item: {
          personagemBaseId: id,
        },
      },
    });

    await this.prisma.inventarioItemBase.deleteMany({
      where: { personagemBaseId: id },
    });

    await this.prisma.personagemCampanha.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.habilidadePersonagemBase.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.poderGenericoPersonagemBase.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.personagemBaseProficiencia.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.personagemBasePericia.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.grauPersonagemBase.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.grauTreinamentoPersonagemBase.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.personagemBasePassiva.deleteMany({ where: { personagemBaseId: id } });
    await this.prisma.personagemBaseResistencia.deleteMany({ where: { personagemBaseId: id } });

    await this.prisma.personagemBase.delete({ where: { id } });

    return { sucesso: true };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  async consultarInfoGrausTreinamento(
    nivel: number,
    intelecto: number,
  ): Promise<{
    niveisDisponiveis: Array<{ nivel: number; maxMelhorias: number }>;
    limitesGrau: { graduado: number; veterano: number; expert: number };
  }> {
    const niveisValidos = [3, 7, 11, 16];
    const niveisDisponiveis = niveisValidos
      .filter((n) => nivel >= n)
      .map((n) => ({ nivel: n, maxMelhorias: 2 + intelecto }));

    return {
      niveisDisponiveis,
      limitesGrau: { graduado: 3, veterano: 9, expert: 16 },
    };
  }

  async consultarPericiasElegiveis(
    periciasComGrauInicial: string[],
  ): Promise<Array<{ codigo: string; nome: string; atributoBase: string; grauAtual: number }>> {
    if (!periciasComGrauInicial || periciasComGrauInicial.length === 0) return [];

    const pericias = await this.prisma.pericia.findMany({
      where: { codigo: { in: periciasComGrauInicial } },
    });

    return pericias.map((p) => ({
      codigo: p.codigo,
      nome: p.nome,
      atributoBase: p.atributoBase,
      grauAtual: 5,
    }));
  }

  async listarTecnicasDisponveis(claId: number, origemId?: number) {
    const origem = origemId
      ? await this.prisma.origem.findUnique({
          where: { id: origemId },
          select: {
            bloqueiaTecnicaHeriditaria: true,
          },
        })
      : null;

    const tecnicasHereditarias = await this.prisma.tecnicaAmaldicoada.findMany({
      where: {
        tipo: 'INATA',
        hereditaria: true,
        clas: {
          some: { claId },
        },
      },
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        hereditaria: true,
        linkExterno: true,
      },
      orderBy: { nome: 'asc' },
    });

    const tecnicasNaoHereditarias = await this.prisma.tecnicaAmaldicoada.findMany({
      where: {
        tipo: 'INATA',
        hereditaria: false,
      },
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        hereditaria: true,
        linkExterno: true,
      },
      orderBy: { nome: 'asc' },
    });

    let tecnicasDisponiveis = [...tecnicasHereditarias, ...tecnicasNaoHereditarias];

    if (origem?.bloqueiaTecnicaHeriditaria) {
      tecnicasDisponiveis = tecnicasDisponiveis.filter((t) => !t.hereditaria);
    }

    return {
      hereditarias: tecnicasDisponiveis.filter((t) => t.hereditaria),
      naoHereditarias: tecnicasDisponiveis.filter((t) => !t.hereditaria),
      todas: tecnicasDisponiveis,
    };
  }

  async listarPassivasDisponiveis() {
    const passivas = await this.prisma.passivaAtributo.findMany({
      orderBy: [{ atributo: 'asc' }, { nivel: 'asc' }],
    });

    const porAtributo = passivas.reduce((acc, p) => {
      if (!acc[p.atributo]) acc[p.atributo] = [];
      acc[p.atributo].push({
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        nivel: p.nivel,
        requisito: p.requisito,
        descricao: p.descricao,
        efeitos: p.efeitos,
      });
      return acc;
    }, {} as Record<string, any>);

    return porAtributo;
  }
}
