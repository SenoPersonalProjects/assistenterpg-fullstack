// src/personagem-base/personagem-base.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AtributoBaseEA } from '@prisma/client';

// âœ… IMPORTAR InventarioService
import { InventarioService } from '../inventario/inventario.service';

// âœ… IMPORTAR EXCEÃ‡Ã•ES CUSTOMIZADAS
import {
  PersonagemBaseNaoEncontradoException,
  ErroAtualizacaoPersonagemException,
  AtributoChaveEaInvalidoException,
} from 'src/common/exceptions/personagem.exception';
import {
  HABILIDADE_ESCOLA_TECNICA_CODIGO,
  HABILIDADE_ESCOLA_TECNICA_NOME,
} from 'src/common/constants/habilidades';

import {
  CreatePersonagemBaseDto,
  ItemInventarioDto,
} from './dto/create-personagem-base.dto';
import { UpdatePersonagemBaseDto } from './dto/update-personagem-base.dto';
import { ImportarPersonagemBaseDto } from './dto/importar-personagem-base.dto';

import { validarTrilhaECaminho } from './regras-criacao/regras-trilha';
import { validarOrigemClaTecnica } from './regras-criacao/regras-origem-cla';
import {
  atendeRequisitoBaseTecnicaNaoInata,
  atendeRequisitosGraus,
  montarMapaGraus,
} from './regras-criacao/regras-tecnicas-nao-inatas';

// Engine
import { calcularEstadoFinalPersonagemBase } from './engine/personagem-base.engine';
import { HabilidadeComEfeitos } from './engine/personagem-base.engine.types';

// NOVOS
import {
  PersonagemBaseMapper,
  PersonagemBaseDetalhadoEntity,
  PersonagemDetalhadoMapeado,
  personagemBaseDetalhadoInclude,
} from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';

type PrismaLike = PrismaService | Prisma.TransactionClient;
type PoderGenericoComConfig = {
  habilidadeId: number;
  config?: Prisma.JsonValue;
};

type ModDerivados = {
  pvPorNivelExtra: number;
  peBaseExtra: number;
  limitePeEaExtra: number;
  defesaExtra: number;
  espacosInventarioExtra: number;
};

type ResumoInventario = {
  espacosBase: number;
  espacosExtra: number;
  espacosTotal: number;
  espacosOcupados: number;
  espacosDisponiveis: number;
  sobrecarregado: boolean;
  quantidadeItens: number;
};

type PersonagemDetalhadoComInventario = PersonagemDetalhadoMapeado & {
  inventario?: ResumoInventario;
};

type ErroItemPreview = {
  equipamentoId: number;
  erro: string;
};

const tecnicaComHabilidadesInclude =
  Prisma.validator<Prisma.TecnicaAmaldicoadaInclude>()({
    habilidades: {
      include: {
        variacoes: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { ordem: 'asc' },
    },
  });

type TecnicaComHabilidades = Prisma.TecnicaAmaldicoadaGetPayload<{
  include: typeof tecnicaComHabilidadesInclude;
}>;

@Injectable()
export class PersonagemBaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PersonagemBaseMapper,
    private readonly persistence: PersonagemBasePersistence,
    // âœ… INJETAR InventarioService
    private readonly inventarioService: InventarioService,
  ) {}

  // ==================== HELPERS GERAIS ====================
  private limparUndefined<T extends Record<string, unknown>>(obj: T): T {
    const out: Record<string, unknown> = { ...obj };
    for (const k of Object.keys(out)) {
      if (out[k] === undefined) delete out[k];
    }
    return out as T;
  }

  private jsonToStringArray(
    value: Prisma.JsonValue | null | undefined,
  ): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v) => typeof v === 'string');
  }

  private validarAtributoChaveEa(
    valor: unknown,
  ): asserts valor is AtributoBaseEA {
    const valoresValidos = Object.values(AtributoBaseEA) as string[];
    if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
      throw new AtributoChaveEaInvalidoException(valor, valoresValidos);
    }
  }

  private getPassivasIdsFromRelacao(
    passivas: Array<{ passivaId: number }>,
  ): number[] {
    return (passivas ?? []).map((p) => p.passivaId);
  }

  private getPoderesFromRelacao(
    poderes: PoderGenericoComConfig[] | undefined,
  ): PoderGenericoComConfig[] {
    return (poderes ?? []).map((p) => ({
      habilidadeId: p.habilidadeId,
      config: p.config ?? undefined,
    }));
  }

  private limparUndefinedDeepJson<T>(value: T | undefined): T | undefined {
    if (value === undefined) return undefined;
    const normalized: unknown = JSON.parse(JSON.stringify(value));
    return normalized as T;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getNestedRecord(
    value: Record<string, unknown> | null | undefined,
    key: string,
  ): Record<string, unknown> | null {
    if (!value) return null;
    const nested = value[key];
    return this.isRecord(nested) ? nested : null;
  }

  private getNumberField(
    value: Record<string, unknown> | null | undefined,
    key: string,
  ): number | null {
    if (!value) return null;
    const current = value[key];
    return typeof current === 'number' ? current : null;
  }

  private extrairItensPreviewInventario(value: unknown): unknown[] {
    if (!this.isRecord(value)) return [];
    const itens = value.itens;
    return Array.isArray(itens) ? itens : [];
  }

  private removerItensInventarioDoDto(
    dto: CreatePersonagemBaseDto,
  ): CreatePersonagemBaseDto {
    const clone = { ...dto };
    delete (clone as Partial<CreatePersonagemBaseDto>).itensInventario;
    return clone;
  }

  private async sincronizarItensInventarioNoUpdate(
    donoId: number,
    personagemBaseId: number,
    itensInventario: ItemInventarioDto[] | undefined,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (itensInventario === undefined) {
      return;
    }

    await tx.inventarioItemBaseModificacao.deleteMany({
      where: {
        item: {
          personagemBaseId,
        },
      },
    });

    await tx.inventarioItemBase.deleteMany({
      where: { personagemBaseId },
    });

    if (itensInventario.length === 0) {
      await tx.personagemBase.update({
        where: { id: personagemBaseId },
        data: {
          espacosOcupados: 0,
          sobrecarregado: false,
        },
      });
      return;
    }

    for (const item of itensInventario) {
      await this.inventarioService.adicionarItem(
        donoId,
        {
          personagemBaseId,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado ?? false,
          modificacoes: item.modificacoesIds ?? [],
          nomeCustomizado: item.nomeCustomizado,
          notas: item.notas,
        },
        {
          tx,
          skipOwnershipCheck: true,
        },
      );
    }
  }

  private async resolverIdComReferencia(params: {
    label: string;
    idAtual?: number | null;
    referencia?: { id?: number; nome?: string; codigo?: string };
    obrigatorio: boolean;
    buscarPorId: (id: number) => Promise<number | null>;
    buscarPorNome?: (nome: string) => Promise<number | null>;
    buscarPorCodigo?: (codigo: string) => Promise<number | null>;
  }): Promise<number | null> {
    const idsCandidatos = Array.from(
      new Set(
        [params.idAtual, params.referencia?.id].filter(
          (id): id is number => typeof id === 'number' && Number.isInteger(id),
        ),
      ),
    );
    const codigo = params.referencia?.codigo?.trim();
    const nome = params.referencia?.nome?.trim();
    const houveTentativaResolucao =
      idsCandidatos.length > 0 || !!codigo || !!nome;

    for (const id of idsCandidatos) {
      const encontrado = await params.buscarPorId(id);
      if (encontrado !== null) return encontrado;
    }

    if (codigo && params.buscarPorCodigo) {
      const encontrado = await params.buscarPorCodigo(codigo);
      if (encontrado !== null) return encontrado;
    }

    if (nome && params.buscarPorNome) {
      const encontrado = await params.buscarPorNome(nome);
      if (encontrado !== null) return encontrado;
    }

    if (params.obrigatorio || houveTentativaResolucao) {
      throw new BadRequestException({
        code: 'REFERENCIA_IMPORTACAO_INVALIDA',
        message: `Nao foi possivel resolver a referencia de ${params.label} na importacao.`,
        details: { label: params.label },
      });
    }

    return null;
  }

  private async resolverPoderesGenericosImportacao(
    poderes: CreatePersonagemBaseDto['poderesGenericos'],
    referencias: ImportarPersonagemBaseDto['referencias'],
  ): Promise<CreatePersonagemBaseDto['poderesGenericos']> {
    if (!poderes?.length) return poderes;

    const refsPorIndex = new Map(
      (referencias?.poderesGenericos ?? []).map((ref) => [ref.index, ref]),
    );

    const resolvidos: PoderGenericoComConfig[] = [];

    for (let index = 0; index < poderes.length; index++) {
      const poder = poderes[index];
      const ref = refsPorIndex.get(index);

      const habilidadeId = await this.resolverIdComReferencia({
        label: `poderGenerico[${index}]`,
        idAtual: poder.habilidadeId,
        referencia: {
          id: ref?.habilidadeId,
          nome: ref?.habilidadeNome,
        },
        obrigatorio: true,
        buscarPorId: async (id) => {
          const found = await this.prisma.habilidade.findFirst({
            where: { id, tipo: 'PODER_GENERICO' },
            select: { id: true },
          });
          return found?.id ?? null;
        },
        buscarPorNome: async (nome) => {
          const found = await this.prisma.habilidade.findFirst({
            where: { nome, tipo: 'PODER_GENERICO' },
            select: { id: true },
          });
          return found?.id ?? null;
        },
      });

      resolvidos.push({
        ...poder,
        habilidadeId: habilidadeId as number,
      });
    }

    return resolvidos;
  }

  private async resolverPassivasImportacao(
    passivasAtributoIds: number[] | undefined,
    referencias: ImportarPersonagemBaseDto['referencias'],
  ): Promise<number[] | undefined> {
    if (!passivasAtributoIds?.length) return passivasAtributoIds;

    const refsPorIndex = new Map(
      (referencias?.passivas ?? []).map((ref) => [ref.index, ref]),
    );

    const resolvidas: number[] = [];

    for (let index = 0; index < passivasAtributoIds.length; index++) {
      const idAtual = passivasAtributoIds[index];
      const ref = refsPorIndex.get(index);

      const passivaId = await this.resolverIdComReferencia({
        label: `passiva[${index}]`,
        idAtual,
        referencia: {
          id: ref?.passivaId,
          codigo: ref?.codigo,
          nome: ref?.nome,
        },
        obrigatorio: true,
        buscarPorId: async (id) => {
          const found = await this.prisma.passivaAtributo.findUnique({
            where: { id },
            select: { id: true },
          });
          return found?.id ?? null;
        },
        buscarPorCodigo: async (codigo) => {
          const found = await this.prisma.passivaAtributo.findUnique({
            where: { codigo },
            select: { id: true },
          });
          return found?.id ?? null;
        },
        buscarPorNome: async (nome) => {
          const found = await this.prisma.passivaAtributo.findFirst({
            where: { nome },
            select: { id: true },
          });
          return found?.id ?? null;
        },
      });

      resolvidas.push(passivaId as number);
    }

    return resolvidas;
  }

  private async resolverItensInventarioImportacao(
    itensInventario: ItemInventarioDto[] | undefined,
    referencias: ImportarPersonagemBaseDto['referencias'],
  ): Promise<ItemInventarioDto[] | undefined> {
    if (!itensInventario?.length) return itensInventario;

    const refsItensPorIndex = new Map(
      (referencias?.itensInventario ?? []).map((ref) => [ref.index, ref]),
    );

    const itensResolvidos: ItemInventarioDto[] = [];

    for (let itemIndex = 0; itemIndex < itensInventario.length; itemIndex++) {
      const item = itensInventario[itemIndex];
      const refItem = refsItensPorIndex.get(itemIndex);

      const equipamentoId = await this.resolverIdComReferencia({
        label: `itensInventario[${itemIndex}].equipamento`,
        idAtual: item.equipamentoId,
        referencia: {
          id: refItem?.equipamentoId,
          codigo: refItem?.equipamentoCodigo,
          nome: refItem?.equipamentoNome,
        },
        obrigatorio: true,
        buscarPorId: async (id) => {
          const found = await this.prisma.equipamentoCatalogo.findUnique({
            where: { id },
            select: { id: true },
          });
          return found?.id ?? null;
        },
        buscarPorCodigo: async (codigo) => {
          const found = await this.prisma.equipamentoCatalogo.findUnique({
            where: { codigo },
            select: { id: true },
          });
          return found?.id ?? null;
        },
        buscarPorNome: async (nome) => {
          const found = await this.prisma.equipamentoCatalogo.findFirst({
            where: { nome },
            select: { id: true },
          });
          return found?.id ?? null;
        },
      });

      const refsModsPorIndex = new Map(
        (refItem?.modificacoes ?? []).map((refMod) => [refMod.index, refMod]),
      );

      const modificacoesResolvidas: number[] = [];
      if (item.modificacoesIds?.length) {
        for (
          let modIndex = 0;
          modIndex < item.modificacoesIds.length;
          modIndex++
        ) {
          const modIdAtual = item.modificacoesIds[modIndex];
          const refMod = refsModsPorIndex.get(modIndex);

          const modId = await this.resolverIdComReferencia({
            label: `itensInventario[${itemIndex}].modificacoes[${modIndex}]`,
            idAtual: modIdAtual,
            referencia: {
              id: refMod?.modificacaoId,
              codigo: refMod?.codigo,
              nome: refMod?.nome,
            },
            obrigatorio: true,
            buscarPorId: async (id) => {
              const found = await this.prisma.modificacaoEquipamento.findUnique(
                {
                  where: { id },
                  select: { id: true },
                },
              );
              return found?.id ?? null;
            },
            buscarPorCodigo: async (codigo) => {
              const found = await this.prisma.modificacaoEquipamento.findUnique(
                {
                  where: { codigo },
                  select: { id: true },
                },
              );
              return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
              const found = await this.prisma.modificacaoEquipamento.findFirst({
                where: { nome },
                select: { id: true },
              });
              return found?.id ?? null;
            },
          });

          modificacoesResolvidas.push(modId as number);
        }
      }

      itensResolvidos.push({
        ...item,
        equipamentoId: equipamentoId as number,
        modificacoesIds:
          modificacoesResolvidas.length > 0
            ? modificacoesResolvidas
            : undefined,
      });
    }

    return itensResolvidos;
  }

  private async montarDtoParaImportacao(
    dtoImportacao: ImportarPersonagemBaseDto,
  ): Promise<CreatePersonagemBaseDto> {
    const payload =
      this.limparUndefinedDeepJson(dtoImportacao.personagem) ??
      dtoImportacao.personagem;

    const referencias = dtoImportacao.referencias;
    const nomeSobrescrito = dtoImportacao.nomeSobrescrito?.trim();

    const claId = await this.resolverIdComReferencia({
      label: 'cla',
      idAtual: payload.claId,
      referencia: referencias?.cla,
      obrigatorio: true,
      buscarPorId: async (id) => {
        const found = await this.prisma.cla.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.cla.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const origemId = await this.resolverIdComReferencia({
      label: 'origem',
      idAtual: payload.origemId,
      referencia: referencias?.origem,
      obrigatorio: true,
      buscarPorId: async (id) => {
        const found = await this.prisma.origem.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.origem.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const classeId = await this.resolverIdComReferencia({
      label: 'classe',
      idAtual: payload.classeId,
      referencia: referencias?.classe,
      obrigatorio: true,
      buscarPorId: async (id) => {
        const found = await this.prisma.classe.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.classe.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const trilhaId = await this.resolverIdComReferencia({
      label: 'trilha',
      idAtual: payload.trilhaId,
      referencia: referencias?.trilha,
      obrigatorio: false,
      buscarPorId: async (id) => {
        const found = await this.prisma.trilha.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.trilha.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const caminhoId = await this.resolverIdComReferencia({
      label: 'caminho',
      idAtual: payload.caminhoId,
      referencia: referencias?.caminho,
      obrigatorio: false,
      buscarPorId: async (id) => {
        const found = await this.prisma.caminho.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.caminho.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const alinhamentoId = await this.resolverIdComReferencia({
      label: 'alinhamento',
      idAtual: payload.alinhamentoId,
      referencia: referencias?.alinhamento,
      obrigatorio: false,
      buscarPorId: async (id) => {
        const found = await this.prisma.alinhamento.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.alinhamento.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const tecnicaInataId = await this.resolverIdComReferencia({
      label: 'tecnicaInata',
      idAtual: payload.tecnicaInataId,
      referencia: referencias?.tecnicaInata,
      obrigatorio: false,
      buscarPorId: async (id) => {
        const found = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { id },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorCodigo: async (codigo) => {
        const found = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { codigo },
          select: { id: true },
        });
        return found?.id ?? null;
      },
      buscarPorNome: async (nome) => {
        const found = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { nome },
          select: { id: true },
        });
        return found?.id ?? null;
      },
    });

    const poderesGenericos = await this.resolverPoderesGenericosImportacao(
      payload.poderesGenericos,
      referencias,
    );

    const passivasAtributoIds = await this.resolverPassivasImportacao(
      payload.passivasAtributoIds,
      referencias,
    );

    const itensInventario = await this.resolverItensInventarioImportacao(
      payload.itensInventario,
      referencias,
    );

    return {
      ...payload,
      nome:
        nomeSobrescrito && nomeSobrescrito.length > 0
          ? nomeSobrescrito
          : payload.nome,
      claId: claId as number,
      origemId: origemId as number,
      classeId: classeId as number,
      trilhaId,
      caminhoId,
      alinhamentoId,
      tecnicaInataId,
      poderesGenericos,
      passivasAtributoIds,
      itensInventario,
    };
  }

  private async validarItensInventarioNoPreview(
    dto: CreatePersonagemBaseDto,
  ): Promise<{
    itensValidados: unknown[];
    errosItens: ErroItemPreview[];
  }> {
    if (!dto.itensInventario?.length) {
      return { itensValidados: [], errosItens: [] };
    }

    const itensPreview = dto.itensInventario.map((item) => ({
      equipamentoId: item.equipamentoId,
      quantidade: item.quantidade,
      equipado: item.equipado ?? false,
      modificacoes: item.modificacoesIds ?? [],
      nomeCustomizado: item.nomeCustomizado,
    }));

    try {
      const previewInventario =
        (await this.inventarioService.previewItensInventario({
          forca: dto.forca,
          prestigioBase: dto.prestigioBase ?? 0,
          itens: itensPreview,
        })) as unknown;
      const itensValidados =
        this.extrairItensPreviewInventario(previewInventario);

      return {
        itensValidados,
        errosItens: [],
      };
    } catch {
      const itensValidados: unknown[] = [];
      const errosItens: ErroItemPreview[] = [];

      for (const item of dto.itensInventario) {
        try {
          const previewItem =
            (await this.inventarioService.previewItensInventario({
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
            })) as unknown;

          const itensPreviewItem =
            this.extrairItensPreviewInventario(previewItem);
          if (itensPreviewItem[0]) {
            itensValidados.push(itensPreviewItem[0]);
          }
        } catch (error: unknown) {
          const erro =
            error instanceof Error
              ? error.message
              : 'Erro desconhecido ao validar item';
          errosItens.push({
            equipamentoId: item.equipamentoId,
            erro,
          });
        }
      }

      return { itensValidados, errosItens };
    }
  }

  private filtrarTecnicaPorGraus(
    tecnica: TecnicaComHabilidades,
    grausMap: Map<string, number>,
  ): TecnicaComHabilidades {
    return {
      ...tecnica,
      habilidades: (tecnica.habilidades ?? [])
        .filter((habilidade) =>
          atendeRequisitosGraus(habilidade.requisitos, grausMap),
        )
        .map((habilidade) => ({
          ...habilidade,
          variacoes: (habilidade.variacoes ?? []).filter((variacao) =>
            atendeRequisitosGraus(variacao.requisitos, grausMap),
          ),
        })),
    };
  }

  private async listarTecnicasNaoInatasAtivasPorGraus(
    graus: Array<{ tipoGrauCodigo: string; valor: number }>,
    prisma: PrismaLike,
  ): Promise<TecnicaComHabilidades[]> {
    const grausMap = montarMapaGraus(graus);

    const tecnicas = await prisma.tecnicaAmaldicoada.findMany({
      where: { tipo: 'NAO_INATA' },
      include: tecnicaComHabilidadesInclude,
      orderBy: { nome: 'asc' },
    });

    return tecnicas
      .filter(
        (tecnica) =>
          atendeRequisitoBaseTecnicaNaoInata(tecnica.codigo, grausMap) &&
          atendeRequisitosGraus(tecnica.requisitos, grausMap),
      )
      .map((tecnica) => this.filtrarTecnicaPorGraus(tecnica, grausMap));
  }

  private async buscarTecnicaInataAtivaPorGraus(
    tecnicaInataId: number | null | undefined,
    graus: Array<{ tipoGrauCodigo: string; valor: number }>,
    prisma: PrismaLike,
  ): Promise<TecnicaComHabilidades | null> {
    if (!tecnicaInataId) return null;

    const grausMap = montarMapaGraus(graus);
    const tecnica = await prisma.tecnicaAmaldicoada.findFirst({
      where: { id: tecnicaInataId, tipo: 'INATA' },
      include: tecnicaComHabilidadesInclude,
    });

    if (!tecnica) return null;
    if (!atendeRequisitosGraus(tecnica.requisitos, grausMap)) return null;

    return this.filtrarTecnicaPorGraus(tecnica, grausMap);
  }

  // ==================== HOOKS DO ENGINE ====================

  /** âœ… Busca habilidades do personagem */
  private async buscarHabilidadesPersonagem(
    params: {
      nivel: number;
      origemId: number;
      classeId: number;
      trilhaId?: number | null;
      caminhoId?: number | null;
      tecnicaInataId?: number | null;
      estudouEscolaTecnica: boolean;
      poderesGenericos?: PoderGenericoComConfig[];
    },
    prisma: PrismaLike = this.prisma,
  ): Promise<HabilidadeComEfeitos> {
    const {
      nivel,
      origemId,
      classeId,
      trilhaId,
      caminhoId,
      estudouEscolaTecnica,
      poderesGenericos,
    } = params;

    const habilidades: HabilidadeComEfeitos = [];
    const mapHabilidade = (habilidade: {
      nome: string;
      tipo: string;
      mecanicasEspeciais: Prisma.JsonValue | null;
      efeitosGrau: Array<{
        tipoGrauCodigo: string;
        valor: number;
        escalonamentoPorNivel: Prisma.JsonValue | null;
      }>;
    }): HabilidadeComEfeitos[number]['habilidade'] => ({
      nome: habilidade.nome,
      tipo: habilidade.tipo,
      mecanicasEspeciais: habilidade.mecanicasEspeciais,
      efeitosGrau: habilidade.efeitosGrau.map((efeito) => ({
        tipoGrauCodigo: efeito.tipoGrauCodigo,
        valor: efeito.valor,
        escalonamentoPorNivel: efeito.escalonamentoPorNivel,
      })),
    });

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
        habilidade: mapHabilidade(ho.habilidade),
      })),
    );

    // Recurso de classe (nÃ­vel 1)
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
        habilidade: mapHabilidade(recursoClasse.habilidade),
      });
    }

    // Habilidades da classe (por nÃ­vel, excluindo recurso jÃ¡ adicionado)
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
        habilidade: mapHabilidade(hc.habilidade),
      })),
    );

    // Habilidades da trilha (por nÃ­vel, sem caminho especÃ­fico)
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
          habilidade: mapHabilidade(ht.habilidade),
        })),
      );
    }

    // Habilidades do caminho (por nÃ­vel)
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
          habilidade: mapHabilidade(ht.habilidade),
        })),
      );
    }

    // Tecnica inata (persistida separadamente)
    // Tecnica inata e tratada separadamente do catalogo de habilidades.
    // Nao deve entrar em habilidadesBase para evitar colisao de ID entre tabelas.

    // Escola TÃ©cnica como habilidade (se estudou)
    if (estudouEscolaTecnica) {
      const escolaTecnica = await prisma.habilidade.findFirst({
        where: {
          OR: [
            { codigo: HABILIDADE_ESCOLA_TECNICA_CODIGO },
            { nome: HABILIDADE_ESCOLA_TECNICA_NOME },
            { nome: 'Escola T\u00c3\u00a9cnica' },
          ],
        },
        include: { efeitosGrau: true },
      });

      if (escolaTecnica) {
        const possuiEfeitoTecnica =
          escolaTecnica.efeitosGrau?.some(
            (efeito) => efeito.tipoGrauCodigo === 'TECNICA_AMALDICOADA',
          ) ?? false;
        const escolaComEfeito = possuiEfeitoTecnica
          ? escolaTecnica
          : {
              ...escolaTecnica,
              efeitosGrau: [
                ...(escolaTecnica.efeitosGrau ?? []),
                {
                  tipoGrauCodigo: 'TECNICA_AMALDICOADA',
                  valor: 1,
                  escalonamentoPorNivel: null,
                },
              ],
            };

        habilidades.push({
          habilidadeId: escolaTecnica.id,
          habilidade: mapHabilidade(escolaComEfeito as typeof escolaTecnica),
        });
      }
    }
    // Poderes genÃ©ricos selecionados (via instÃ¢ncias) - permite repetiÃ§Ã£o
    if (poderesGenericos && poderesGenericos.length > 0) {
      const idsUnicos = Array.from(
        new Set(poderesGenericos.map((p) => p.habilidadeId)),
      );

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
          habilidade: mapHabilidade(poder),
        });
      }
    }

    return habilidades;
  }

  /** âœ… Calcula modificadores de derivados por habilidades */
  private calcularModificadoresDerivadosPorHabilidades(
    habilidades: HabilidadeComEfeitos,
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
      const mecanicas = this.isRecord(h.habilidade.mecanicasEspeciais)
        ? h.habilidade.mecanicasEspeciais
        : null;
      const recursos = this.getNestedRecord(mecanicas, 'recursos');
      const defesa = this.getNestedRecord(mecanicas, 'defesa');
      const inventario = this.getNestedRecord(mecanicas, 'inventario');
      const pvPorNivel = this.getNumberField(mecanicas, 'pvPorNivel');
      const peBase = this.getNumberField(recursos, 'peBase');
      const pePorNivelImpar = this.getNumberField(recursos, 'pePorNivelImpar');
      const limitePePorTurnoBonus = this.getNumberField(
        recursos,
        'limitePePorTurnoBonus',
      );
      const defesaBonus = this.getNumberField(defesa, 'bonus');
      const espacosExtra = this.getNumberField(inventario, 'espacosExtra');

      if (pvPorNivel !== null) {
        mods.pvPorNivelExtra += pvPorNivel;
      }

      if (peBase !== null) {
        mods.peBaseExtra += peBase;
      }

      if (pePorNivelImpar !== null) {
        const niveisImpares = Math.ceil(nivel / 2);
        mods.peBaseExtra += pePorNivelImpar * niveisImpares;
      }

      if (limitePePorTurnoBonus !== null) {
        mods.limitePeEaExtra += limitePePorTurnoBonus;
      }

      if (defesaBonus !== null) {
        mods.defesaExtra += defesaBonus;
      }

      if (espacosExtra !== null) {
        mods.espacosInventarioExtra += espacosExtra;
      }
    }

    return mods;
  }

  private async executarEngine(
    dto: CreatePersonagemBaseDto,
    opts: {
      strictPassivas: boolean;
      prisma: PrismaLike;
      personagemBaseId?: number;
    },
  ) {
    return calcularEstadoFinalPersonagemBase({
      dto,
      strictPassivas: opts.strictPassivas,
      prisma: opts.prisma,
      personagemBaseId: opts.personagemBaseId,
      buscarHabilidadesPersonagem: (engineParams, prisma) =>
        this.buscarHabilidadesPersonagem(engineParams, prisma),
      calcularModsDerivadosPorHabilidades: (habilidades, nivel) =>
        this.calcularModificadoresDerivadosPorHabilidades(habilidades, nivel),
    });
  }

  private montarDtoCompletoParaUpdate(
    existe: PersonagemBaseDetalhadoEntity,
    dto: UpdatePersonagemBaseDto,
  ): CreatePersonagemBaseDto {
    const patch = dto;

    const periciasClasseEscolhidasFinal =
      patch.periciasClasseEscolhidasCodigos ??
      this.jsonToStringArray(existe.periciasClasseEscolhidasCodigos);

    const periciasOrigemEscolhidasFinal =
      patch.periciasOrigemEscolhidasCodigos ??
      this.jsonToStringArray(existe.periciasOrigemEscolhidasCodigos);

    const periciasLivresFinal =
      patch.periciasLivresCodigos ??
      this.jsonToStringArray(existe.periciasLivresCodigos);

    const passivasAtributosAtivosFinal = (patch.passivasAtributosAtivos ??
      this.jsonToStringArray(
        existe.passivasAtributosAtivos,
      )) as CreatePersonagemBaseDto['passivasAtributosAtivos'];

    const passivasAtributosConfigRaw =
      patch.passivasAtributosConfig !== undefined
        ? patch.passivasAtributosConfig
        : (existe.passivasAtributosConfig ?? null);

    const passivasAtributosConfigFinal = this.limparUndefinedDeepJson(
      passivasAtributosConfigRaw ?? undefined,
    ) as CreatePersonagemBaseDto['passivasAtributosConfig'] | undefined;

    const poderesBancoNormalizados = this.getPoderesFromRelacao(
      existe.poderesGenericos,
    ).map((inst) => ({ ...inst, config: inst.config ?? {} }));

    const poderesPayloadNormalizados = this.getPoderesFromRelacao(
      patch.poderesGenericos,
    ).map((inst) => ({ ...inst, config: inst.config ?? {} }));

    const poderesFinal =
      patch.poderesGenericos !== undefined
        ? poderesPayloadNormalizados
        : poderesBancoNormalizados;

    const profsExtrasFinal =
      patch.proficienciasCodigos !== undefined
        ? patch.proficienciasCodigos
        : this.jsonToStringArray(existe.proficienciasExtrasCodigos);

    const grausAprimoramentoFinal =
      patch.grausAprimoramento !== undefined
        ? patch.grausAprimoramento
        : (existe.grausAprimoramento ?? []).map((g) => ({
            tipoGrauCodigo: g.tipoGrau.codigo,
            valor: g.valor,
          }));

    const grausTreinamentoFinal =
      patch.grausTreinamento !== undefined
        ? patch.grausTreinamento
        : (existe.grausTreinamento ?? []).reduce(
            (
              acc: NonNullable<CreatePersonagemBaseDto['grausTreinamento']>,
              gt,
            ) => {
              const nivelExistente = acc.find((x) => x.nivel === gt.nivel);
              const melhoria = {
                periciaCodigo: gt.periciaCodigo,
                grauAnterior: gt.grauAnterior,
                grauNovo: gt.grauNovo,
              };
              if (nivelExistente) nivelExistente.melhorias.push(melhoria);
              else acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
              return acc;
            },
            [] as NonNullable<CreatePersonagemBaseDto['grausTreinamento']>,
          );

    const dtoCompleto: CreatePersonagemBaseDto = {
      nome: patch.nome ?? existe.nome,
      nivel: patch.nivel ?? existe.nivel,

      claId: patch.claId ?? existe.claId,
      origemId: patch.origemId ?? existe.origemId,
      classeId: patch.classeId ?? existe.classeId,

      trilhaId: patch.trilhaId !== undefined ? patch.trilhaId : existe.trilhaId,
      caminhoId:
        patch.caminhoId !== undefined ? patch.caminhoId : existe.caminhoId,

      agilidade: patch.agilidade ?? existe.agilidade,
      forca: patch.forca ?? existe.forca,
      intelecto: patch.intelecto ?? existe.intelecto,
      presenca: patch.presenca ?? existe.presenca,
      vigor: patch.vigor ?? existe.vigor,

      estudouEscolaTecnica:
        patch.estudouEscolaTecnica ?? existe.estudouEscolaTecnica,

      idade: patch.idade !== undefined ? patch.idade : existe.idade,
      prestigioBase: patch.prestigioBase ?? existe.prestigioBase,
      prestigioClaBase:
        patch.prestigioClaBase !== undefined
          ? patch.prestigioClaBase
          : existe.prestigioClaBase,
      alinhamentoId:
        patch.alinhamentoId !== undefined
          ? patch.alinhamentoId
          : existe.alinhamentoId,
      background:
        patch.background !== undefined ? patch.background : existe.background,

      atributoChaveEa: patch.atributoChaveEa ?? existe.atributoChaveEa,

      tecnicaInataId:
        patch.tecnicaInataId !== undefined
          ? patch.tecnicaInataId
          : existe.tecnicaInataId,

      proficienciasCodigos: profsExtrasFinal ?? [],
      grausAprimoramento: grausAprimoramentoFinal ?? [],
      grausTreinamento: grausTreinamentoFinal ?? [],

      poderesGenericos: poderesFinal ?? [],

      passivasAtributoIds:
        patch.passivasAtributoIds ??
        this.getPassivasIdsFromRelacao(existe.passivas ?? []),

      passivasAtributosAtivos: passivasAtributosAtivosFinal ?? [],
      passivasAtributosConfig: passivasAtributosConfigFinal ?? undefined,

      periciasClasseEscolhidasCodigos: periciasClasseEscolhidasFinal ?? [],
      periciasOrigemEscolhidasCodigos: periciasOrigemEscolhidasFinal ?? [],
      periciasLivresCodigos: periciasLivresFinal ?? [],

      periciasLivresExtras: 0,
    };

    return dtoCompleto;
  }

  // ==================== INVENTÃRIO (SIMPLIFICADO) ====================
  private async calcularResumoInventario(
    personagemBaseId: number,
  ): Promise<ResumoInventario | null> {
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

      const quantidadeItens = await this.prisma.inventarioItemBase.count({
        where: { personagemBaseId },
      });

      const espacosTotal =
        personagem.espacosInventarioBase +
        (personagem.espacosInventarioExtra || 0);
      const espacosDisponiveis =
        espacosTotal - (personagem.espacosOcupados || 0);

      return {
        espacosBase: personagem.espacosInventarioBase,
        espacosExtra: personagem.espacosInventarioExtra || 0,
        espacosTotal,
        espacosOcupados: personagem.espacosOcupados || 0,
        espacosDisponiveis,
        sobrecarregado: personagem.sobrecarregado || false,
        quantidadeItens,
      };
    } catch (error) {
      console.error('[SERVICE] Erro ao calcular resumo de inventÃ¡rio:', error);
      return null;
    }
  }

  // ==================== PREVIEW / CRUD ====================

  async preview(donoId: number, dto: CreatePersonagemBaseDto) {
    const dtoPreview: CreatePersonagemBaseDto = { ...dto };

    if (dto.periciasLivresExtras !== undefined) {
      dtoPreview.periciasLivresExtras = dto.periciasLivresExtras;
    }

    const estado = await this.executarEngine(dtoPreview, {
      strictPassivas: false,
      prisma: this.prisma,
    });

    const resistenciasArray = Array.from(
      estado.resistenciasFinais.entries(),
    ).map(([codigo, valor]) => ({ codigo, valor }));
    const codigosResistencia = resistenciasArray.map((r) => r.codigo);

    const [
      todasPericias,
      proficienciasDetalhadas,
      tiposGrau,
      tecnicasNaoInatas,
      tecnicaInata,
    ] = await Promise.all([
      this.prisma.pericia.findMany(),
      this.prisma.proficiencia.findMany({
        where: { codigo: { in: estado.profsFinais } },
      }),
      this.prisma.tipoGrau.findMany({
        where: {
          codigo: { in: estado.grausFinais.map((g) => g.tipoGrauCodigo) },
        },
      }),
      this.listarTecnicasNaoInatasAtivasPorGraus(
        estado.grausFinais,
        this.prisma,
      ),
      this.buscarTecnicaInataAtivaPorGraus(
        estado.dtoNormalizado.tecnicaInataId,
        estado.grausFinais,
        this.prisma,
      ),
    ]);

    const resistenciasTipos =
      codigosResistencia.length > 0
        ? await this.prisma.resistenciaTipo.findMany({
            where: { codigo: { in: codigosResistencia } },
            select: { codigo: true, nome: true, descricao: true },
          })
        : [];

    const mapaPericiasPorCodigo = new Map(
      todasPericias.map((p) => [p.codigo, p] as const),
    );

    const periciasDetalhadas = Array.from(
      estado.periciasMapCodigo.entries(),
    ).map(([codigo, p]) => {
      const pericia = mapaPericiasPorCodigo.get(codigo);
      return {
        codigo,
        nome: pericia?.nome ?? '',
        atributoBase: pericia?.atributoBase ?? 'INT',
        grauTreinamento: p.grauTreinamento,
        bonusExtra: p.bonusExtra,
        bonusTotal: p.grauTreinamento * 5 + p.bonusExtra,
      };
    });

    const mapaTiposGrau = new Map(
      tiposGrau.map((t) => [t.codigo, t.nome] as const),
    );
    const habilidadesNomes = estado.habilidades.map((h) => h.habilidade.nome);
    const mapaResistenciasTipo = new Map(
      resistenciasTipos.map((tipo) => [tipo.codigo, tipo] as const),
    );
    const resistenciasComNomes = resistenciasArray.map((r) => {
      const tipo = mapaResistenciasTipo.get(r.codigo);
      return {
        codigo: r.codigo,
        nome: tipo?.nome ?? r.codigo,
        descricao: tipo?.descricao ?? null,
        valor: r.valor,
      };
    });

    // âœ… VALIDAR ITENS (se houver) usando preview do InventarioService
    const { itensValidados, errosItens } =
      await this.validarItensInventarioNoPreview(dto);

    return {
      ...estado.dtoNormalizado,

      proficienciasExtrasCodigos:
        estado.dtoNormalizado.proficienciasCodigos ?? [],

      passivasNeedsChoice: estado.passivasResolvidas.needsChoice,
      passivasElegiveis: estado.passivasResolvidas.elegiveis,

      passivasAtributosAtivos: estado.passivasResolvidas.ativos,
      passivasAtributoIds: estado.passivasResolvidas.passivaIds,

      passivasAtributosConfig:
        estado.dtoNormalizado.passivasAtributosConfig ?? {},

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
      tecnicasNaoInatas,
      tecnicaInata,

      grausLivresInfo: estado.grausLivresInfo,
      periciasLivresInfo: estado.periciasLivresInfo,

      espacosInventario: estado.espacosInventario,

      resistencias: resistenciasComNomes,

      // âœ… Itens validados
      itensInventario: itensValidados,
      errosItens: errosItens.length > 0 ? errosItens : undefined,
    };
  }

  async criar(donoId: number, dto: CreatePersonagemBaseDto) {
    const dtoSemItensInventario = this.removerItensInventarioDoDto(dto);

    const estado = await this.executarEngine(dtoSemItensInventario, {
      strictPassivas: true,
      prisma: this.prisma,
    });

    const dataBase = this.limparUndefined({
      ...estado.dtoNormalizado,
      proficienciasExtrasCodigos:
        dtoSemItensInventario.proficienciasCodigos ?? [],
      ...estado.derivadosFinais,
      espacosInventarioBase: estado.espacosInventario.base,
      espacosInventarioExtra: estado.espacosInventario.extra,
      // âœ… Inicializar campos de inventÃ¡rio
      espacosOcupados: 0,
      sobrecarregado: false,
    });

    const personagem = await this.prisma.$transaction(async (tx) => {
      const tecnicasNaoInatasAtivas =
        await this.listarTecnicasNaoInatasAtivasPorGraus(
          estado.grausFinais,
          tx,
        );

      const personagemCriado = await this.persistence.criarComEstado(
        {
          donoId,
          dataBase,
          estado: {
            ...estado,
            resistenciasFinais: estado.resistenciasFinais,
            tecnicasNaoInatasIds: tecnicasNaoInatasAtivas.map((t) => t.id),
          },
        },
        tx,
      );

      // âœ… ADICIONAR itens via InventarioService (COM validaÃ§Ã£o de Grau XamÃ£)
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
              // âœ… NÃƒO ignorar limites (preview jÃ¡ validou se o usuÃ¡rio permitiu)
            },
            {
              tx, // âœ… PASSAR TRANSAÃ‡ÃƒO
              skipOwnershipCheck: true, // âœ… SKIP VALIDAÃ‡ÃƒO DE OWNERSHIP (personagem sendo criado)
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

  async listarDoUsuario(
    donoId: number,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = { donoId };
    const include = { cla: true, classe: true };
    const orderBy = { nome: 'asc' as const };

    if (!page || !limit) {
      const lista = await this.prisma.personagemBase.findMany({
        where,
        include,
        orderBy,
      });

      return lista.map((p) => this.mapper.mapResumo(p));
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.personagemBase.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.personagemBase.count({ where }),
    ]);

    return {
      items: items.map((p) => this.mapper.mapResumo(p)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async buscarPorId(
    donoId: number,
    id: number,
    incluirInventario = false,
  ): Promise<PersonagemDetalhadoComInventario> {
    const personagem = await this.prisma.personagemBase.findFirst({
      where: { id, donoId },
      include: personagemBaseDetalhadoInclude,
    });

    if (!personagem) throw new PersonagemBaseNaoEncontradoException(id);

    const personagemDetalhado: PersonagemDetalhadoComInventario =
      await this.mapper.mapDetalhado(personagem, this.prisma);

    if (incluirInventario) {
      const resumoInventario = await this.calcularResumoInventario(id);
      if (resumoInventario) {
        personagemDetalhado.inventario = resumoInventario;
      }
    }

    return personagemDetalhado;
  }

  async exportar(donoId: number, id: number) {
    const personagem = await this.buscarPorId(donoId, id, true);

    const personagemParaExportar: CreatePersonagemBaseDto = {
      nome: personagem.nome,
      nivel: personagem.nivel,

      claId: personagem.claId,
      origemId: personagem.origemId,
      classeId: personagem.classeId,
      trilhaId: personagem.trilhaId ?? null,
      caminhoId: personagem.caminhoId ?? null,

      agilidade: personagem.agilidade,
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      presenca: personagem.presenca,
      vigor: personagem.vigor,

      estudouEscolaTecnica: personagem.estudouEscolaTecnica,
      tecnicaInataId: personagem.tecnicaInataId ?? null,

      idade: personagem.idade ?? null,
      prestigioBase: personagem.prestigioBase ?? 0,
      prestigioClaBase: personagem.prestigioClaBase ?? null,
      alinhamentoId: personagem.alinhamentoId ?? null,
      background: personagem.background ?? null,

      atributoChaveEa: personagem.atributoChaveEa,

      proficienciasCodigos: personagem.proficienciasExtrasCodigos ?? [],

      grausAprimoramento: (personagem.grausAprimoramento ?? []).map((g) => {
        const valorLivre =
          typeof g.valorLivre === 'number'
            ? g.valorLivre
            : Math.max(0, (g.valorTotal ?? 0) - (g.bonus ?? 0));

        return {
          tipoGrauCodigo: g.tipoGrauCodigo,
          valor: valorLivre,
        };
      }),

      grausTreinamento: personagem.grausTreinamento ?? [],

      poderesGenericos: (personagem.poderesGenericos ?? []).map((p) => ({
        habilidadeId: p.habilidadeId,
        config: p.config ?? {},
      })),

      passivasAtributoIds: personagem.passivasAtributoIds ?? [],
      passivasAtributosAtivos: (personagem.passivasAtributosAtivos ??
        []) as CreatePersonagemBaseDto['passivasAtributosAtivos'],
      passivasAtributosConfig: (personagem.passivasAtributosConfig ??
        {}) as CreatePersonagemBaseDto['passivasAtributosConfig'],

      periciasClasseEscolhidasCodigos:
        personagem.periciasClasseEscolhidasCodigos ?? [],
      periciasOrigemEscolhidasCodigos:
        personagem.periciasOrigemEscolhidasCodigos ?? [],
      periciasLivresCodigos: personagem.periciasLivresCodigos ?? [],
      periciasLivresExtras: 0,

      itensInventario: (personagem.itensInventario ?? []).map((item) => ({
        equipamentoId: item.equipamentoId,
        quantidade: item.quantidade,
        equipado: item.equipado ?? false,
        modificacoesIds: (item.modificacoes ?? []).map((mod) => mod.id),
        nomeCustomizado: item.nomeCustomizado ?? null,
        notas: item.notas ?? null,
      })),
    };

    return {
      schema: 'assistenterpg.personagem-base.v1',
      schemaVersion: 1,
      exportadoEm: new Date().toISOString(),
      personagem: personagemParaExportar,
      referencias: {
        personagemIdOriginal: personagem.id,
        cla: personagem.cla
          ? { id: personagem.cla.id, nome: personagem.cla.nome }
          : null,
        origem: personagem.origem
          ? { id: personagem.origem.id, nome: personagem.origem.nome }
          : null,
        classe: personagem.classe
          ? { id: personagem.classe.id, nome: personagem.classe.nome }
          : null,
        trilha: personagem.trilha
          ? { id: personagem.trilha.id, nome: personagem.trilha.nome }
          : null,
        caminho: personagem.caminho
          ? { id: personagem.caminho.id, nome: personagem.caminho.nome }
          : null,
        alinhamento: personagem.alinhamento
          ? { id: personagem.alinhamento.id, nome: personagem.alinhamento.nome }
          : null,
        tecnicaInata: personagem.tecnicaInata
          ? {
              id: personagem.tecnicaInata.id,
              codigo: personagem.tecnicaInata.codigo,
              nome: personagem.tecnicaInata.nome,
            }
          : null,
        poderesGenericos: (personagem.poderesGenericos ?? []).map(
          (p, index: number) => ({
            index,
            habilidadeId: p.habilidadeId,
            habilidadeNome: p.nome,
          }),
        ),
        passivas: (personagem.passivas ?? []).map((p, index: number) => ({
          index,
          passivaId: p.id,
          codigo: p.codigo,
          nome: p.nome,
        })),
        itensInventario: (personagem.itensInventario ?? []).map(
          (item, index: number) => ({
            index,
            equipamentoId: item.equipamento?.id ?? item.equipamentoId,
            equipamentoCodigo: item.equipamento?.codigo,
            equipamentoNome: item.equipamento?.nome,
            modificacoes: (item.modificacoes ?? []).map(
              (mod, modIndex: number) => ({
                index: modIndex,
                modificacaoId: mod.id,
                codigo: mod.codigo,
                nome: mod.nome,
              }),
            ),
          }),
        ),
      },
    };
  }

  async importar(donoId: number, dtoImportacao: ImportarPersonagemBaseDto) {
    const dtoResolvido = await this.montarDtoParaImportacao(dtoImportacao);
    const criado = await this.criar(donoId, dtoResolvido);

    return {
      ...criado,
      importado: true,
      schema: dtoImportacao.schema ?? 'assistenterpg.personagem-base.v1',
      schemaVersion: dtoImportacao.schemaVersion ?? 1,
      importadoEm: new Date().toISOString(),
    };
  }

  async atualizar(donoId: number, id: number, dto: UpdatePersonagemBaseDto) {
    const existe = await this.prisma.personagemBase.findFirst({
      where: { id, donoId },
      include: personagemBaseDetalhadoInclude,
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

      const tecnicasNaoInatasAtivas =
        await this.listarTecnicasNaoInatasAtivasPorGraus(
          estado.grausFinais,
          tx,
        );

      const dataUpdateBase = this.limparUndefined({
        nome: estado.dtoNormalizado.nome,
        nivel: estado.dtoNormalizado.nivel,

        claId: estado.dtoNormalizado.claId,
        origemId: estado.dtoNormalizado.origemId,
        classeId: estado.dtoNormalizado.classeId,

        trilhaId: estado.dtoNormalizado.trilhaId ?? null,
        caminhoId: estado.dtoNormalizado.caminhoId ?? null,

        agilidade: estado.dtoNormalizado.agilidade,
        forca: estado.dtoNormalizado.forca,
        intelecto: estado.dtoNormalizado.intelecto,
        presenca: estado.dtoNormalizado.presenca,
        vigor: estado.dtoNormalizado.vigor,

        estudouEscolaTecnica: estado.dtoNormalizado.estudouEscolaTecnica,
        tecnicaInataId: estado.dtoNormalizado.tecnicaInataId ?? null,

        idade: estado.dtoNormalizado.idade ?? null,
        prestigioBase: estado.dtoNormalizado.prestigioBase ?? null,
        prestigioClaBase: estado.dtoNormalizado.prestigioClaBase ?? null,
        alinhamentoId: estado.dtoNormalizado.alinhamentoId ?? null,
        background: estado.dtoNormalizado.background ?? null,

        atributoChaveEa: estado.dtoNormalizado.atributoChaveEa,

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
        passivasAtributosConfig:
          estado.passivasAtributosConfigLimpo ?? undefined,

        proficienciasExtrasCodigos: dtoCompleto.proficienciasCodigos ?? [],

        periciasClasseEscolhidasCodigos:
          estado.dtoNormalizado.periciasClasseEscolhidasCodigos ?? [],
        periciasOrigemEscolhidasCodigos:
          estado.dtoNormalizado.periciasOrigemEscolhidasCodigos ?? [],
        periciasLivresCodigos:
          estado.dtoNormalizado.periciasLivresCodigos ?? [],
      });

      const resultado = await this.persistence.atualizarRebuildComEstado(
        {
          id,
          dataUpdateBase,
          estado: {
            ...estado,
            resistenciasFinais: estado.resistenciasFinais,
            tecnicasNaoInatasIds: tecnicasNaoInatasAtivas.map((t) => t.id),
          },
        },
        tx,
      );

      // âœ… INVENTÃRIO: Delegar COMPLETAMENTE para InventarioService
      // O service jÃ¡ possui atualizarEstadoInventario() que recalcula tudo
      // Apenas atualizamos espacosInventarioBase/Extra aqui (forÃ§a mudou?)

      await this.sincronizarItensInventarioNoUpdate(
        donoId,
        id,
        dto.itensInventario,
        tx,
      );

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

    await this.prisma.personagemCampanha.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.habilidadePersonagemBase.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.poderGenericoPersonagemBase.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.personagemBaseProficiencia.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.personagemBasePericia.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.grauPersonagemBase.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.grauTreinamentoPersonagemBase.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.personagemBasePassiva.deleteMany({
      where: { personagemBaseId: id },
    });
    await this.prisma.personagemBaseResistencia.deleteMany({
      where: { personagemBaseId: id },
    });

    await this.prisma.personagemBase.delete({ where: { id } });

    return { sucesso: true };
  }

  // ==================== MÃ‰TODOS AUXILIARES ====================

  consultarInfoGrausTreinamento(
    nivel: number,
    intelecto: number,
  ): {
    niveisDisponiveis: Array<{ nivel: number; maxMelhorias: number }>;
    limitesGrau: { graduado: number; veterano: number; expert: number };
  } {
    const niveisValidos = [3, 7, 11, 16];
    const niveisDisponiveis = niveisValidos
      .filter((n) => nivel >= n)
      .map((n) => ({ nivel: n, maxMelhorias: 2 + intelecto }));

    return {
      niveisDisponiveis,
      limitesGrau: { graduado: 3, veterano: 9, expert: 16 },
    };
  }

  async consultarPericiasElegiveis(periciasComGrauInicial: string[]): Promise<
    Array<{
      codigo: string;
      nome: string;
      atributoBase: string;
      grauAtual: number;
    }>
  > {
    if (!periciasComGrauInicial || periciasComGrauInicial.length === 0)
      return [];

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

    const tecnicasNaoHereditarias =
      await this.prisma.tecnicaAmaldicoada.findMany({
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

    let tecnicasDisponiveis = [
      ...tecnicasHereditarias,
      ...tecnicasNaoHereditarias,
    ];

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

    type PassivaDisponivel = {
      id: number;
      codigo: string;
      nome: string;
      nivel: number;
      requisito: number | null;
      descricao: string | null;
      efeitos: Prisma.JsonValue | null;
    };

    const porAtributo = passivas.reduce(
      (acc, p) => {
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
      },
      {} as Record<string, PassivaDisponivel[]>,
    );

    return porAtributo;
  }
}
