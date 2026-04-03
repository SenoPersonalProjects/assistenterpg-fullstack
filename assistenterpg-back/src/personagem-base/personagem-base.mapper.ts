// src/personagem-base/personagem-base.mapper.ts
import { Injectable } from '@nestjs/common';
import {
  CategoriaEquipamento,
  Prisma,
  TipoEquipamento,
  TipoModificacao,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GrauTreinamentoDto } from './dto/create-personagem-base.dto';
import {
  atendeRequisitoBaseTecnicaNaoInata,
  atendeRequisitosGraus,
  montarMapaGraus,
} from './regras-criacao/regras-tecnicas-nao-inatas';
import {
  calcularAtributoBaseInventario,
  calcularEspacosInventarioBase,
} from '../inventario/utils/inventario-capacidade';
import {
  extrairAtributoChaveEaDeHabilidades,
  extrairPericiasAtributoBaseOverride,
  extrairResistenciasDeHabilidades,
} from './regras-criacao/regras-poderes-efeitos';

type PrismaLike = PrismaService | Prisma.TransactionClient;

export const personagemBaseDetalhadoInclude =
  Prisma.validator<Prisma.PersonagemBaseInclude>()({
    cla: true,
    origem: true,
    classe: true,
    trilha: true,
    caminho: true,
    tecnicaInata: {
      include: {
        habilidades: {
          include: {
            variacoes: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
    },
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
    tecnicasAprendidas: {
      include: {
        tecnica: {
          include: {
            habilidades: {
              include: {
                variacoes: {
                  orderBy: { ordem: 'asc' },
                },
              },
              orderBy: { ordem: 'asc' },
            },
          },
        },
      },
    },
    resistencias: {
      include: {
        resistenciaTipo: true,
      },
    },
  });

const inventarioItemDetalhadoInclude =
  Prisma.validator<Prisma.InventarioItemBaseInclude>()({
    equipamento: true,
    modificacoes: {
      include: {
        modificacao: true,
      },
    },
  });

const ORDEM_CATEGORIAS: CategoriaEquipamento[] = [
  CategoriaEquipamento.CATEGORIA_0,
  CategoriaEquipamento.CATEGORIA_4,
  CategoriaEquipamento.CATEGORIA_3,
  CategoriaEquipamento.CATEGORIA_2,
  CategoriaEquipamento.CATEGORIA_1,
  CategoriaEquipamento.ESPECIAL,
];

function isCategoriaEquipamento(value: unknown): value is CategoriaEquipamento {
  return (
    typeof value === 'string' &&
    ORDEM_CATEGORIAS.includes(value as CategoriaEquipamento)
  );
}

function calcularCategoriaFinal(
  categoriaOriginal: CategoriaEquipamento,
  quantidadeModificacoes: number,
): CategoriaEquipamento {
  if (!isCategoriaEquipamento(categoriaOriginal)) {
    return CategoriaEquipamento.CATEGORIA_0;
  }

  const indexOriginal = ORDEM_CATEGORIAS.indexOf(categoriaOriginal);
  if (indexOriginal === -1) return CategoriaEquipamento.CATEGORIA_0;

  const indexFinal = Math.min(
    indexOriginal + quantidadeModificacoes,
    ORDEM_CATEGORIAS.length - 1,
  );

  return ORDEM_CATEGORIAS[indexFinal];
}

export type PersonagemBaseResumoEntity = Prisma.PersonagemBaseGetPayload<{
  include: { cla: true; classe: true };
}>;

export type PersonagemBaseDetalhadoEntity = Prisma.PersonagemBaseGetPayload<{
  include: typeof personagemBaseDetalhadoInclude;
}>;

type InventarioItemDetalhadoEntity = Prisma.InventarioItemBaseGetPayload<{
  include: typeof inventarioItemDetalhadoInclude;
}>;

type GrauAprimoramentoAjustado = {
  tipoGrauCodigo: string;
  tipoGrauNome: string;
  valorTotal: number;
  valorLivre: number;
  bonus: number;
};

type InventarioModificacaoMapeada = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: TipoModificacao;
  incrementoEspacos: number;
  apenasAmaldicoadas: boolean;
  requerComplexidade: string | null;
  efeitosMecanicos: Prisma.JsonValue | null;
};

type InventarioItemMapeado = {
  id: number;
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;
  espacosCalculados: number;
  categoriaCalculada: string;
  nomeCustomizado: string | null;
  notas: string | null;
  equipamento: {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: TipoEquipamento;
    categoria: CategoriaEquipamento;
    espacos: number;
    complexidadeMaldicao: string;
  };
  modificacoes: InventarioModificacaoMapeada[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extrairNumeroJson(
  value: Prisma.JsonValue | null | undefined,
  key: string,
): number | null {
  if (!isRecord(value)) return null;
  const raw = value[key];
  return typeof raw === 'number' ? raw : null;
}

function getInventarioSomarIntelectoFromMecanicas(
  mecanicas: Prisma.JsonValue | null,
): boolean {
  if (!isRecord(mecanicas)) return false;
  const inventario = mecanicas.inventario;
  if (!isRecord(inventario)) return false;
  return inventario.somarIntelecto === true;
}

function getInventarioReduzirItensLevesFromMecanicas(
  mecanicas: Prisma.JsonValue | null,
): boolean {
  if (!isRecord(mecanicas)) return false;
  const inventario = mecanicas.inventario;
  if (!isRecord(inventario)) return false;
  return inventario.reduzirItensLeves === true;
}

function getCreditoCategoriaBonusFromMecanicas(
  mecanicas: Prisma.JsonValue | null,
): number {
  if (!isRecord(mecanicas)) return 0;
  const economia = mecanicas.economia;
  if (!isRecord(economia)) return 0;
  const bonus = economia.creditoCategoriaBonus;
  return typeof bonus === 'number' ? bonus : 0;
}

type ResistenciasMapeadas = Array<{
  codigo: string;
  nome: string;
  descricao: string | null;
  valor: number;
}>;

type TecnicaDetalhadaMapeada = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  hereditaria: boolean;
  linkExterno: string | null;
  requisitos: Prisma.JsonValue | null;
  fonte: string;
  suplementoId: number | null;
  habilidades: Array<{
    id: number;
    tecnicaId: number;
    codigo: string;
    nome: string;
    descricao: string;
    requisitos: Prisma.JsonValue | null;
    execucao: string;
    area: string | null;
    alcance: string | null;
    alvo: string | null;
    duracao: string | null;
    custoPE: number;
    custoEA: number;
    danoFlat: number | null;
    danoFlatTipo: string | null;
    efeito: string;
    ordem: number;
    variacoes: Array<{
      id: number;
      habilidadeTecnicaId: number;
      nome: string;
      descricao: string;
      substituiCustos: boolean;
      custoPE: number | null;
      custoEA: number | null;
      execucao: string | null;
      area: string | null;
      alcance: string | null;
      alvo: string | null;
      duracao: string | null;
      resistencia: string | null;
      dtResistencia: string | null;
      criticoValor: number | null;
      criticoMultiplicador: number | null;
      danoFlat: number | null;
      danoFlatTipo: string | null;
      dadosDano: Prisma.JsonValue | null;
      escalonaPorGrau: boolean | null;
      escalonamentoCustoEA: number | null;
      escalonamentoDano: Prisma.JsonValue | null;
      efeitoAdicional: string | null;
      requisitos: Prisma.JsonValue | null;
      ordem: number;
    }>;
  }>;
};

export type PersonagemDetalhadoMapeado = {
  id: number;
  nome: string;
  nivel: number;
  claId: number;
  origemId: number;
  classeId: number;
  trilhaId: number | null;
  caminhoId: number | null;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  estudouEscolaTecnica: boolean;
  tecnicaInataId: number | null;
  idade: number | null;
  prestigioBase: number | null;
  prestigioClaBase: number | null;
  creditoCategoriaBonus?: number;
  alinhamentoId: number | null;
  background: string | null;
  atributoChaveEa: PersonagemBaseDetalhadoEntity['atributoChaveEa'];
  proficienciasExtrasCodigos: string[];
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];
  cla: PersonagemBaseDetalhadoEntity['cla'];
  origem: PersonagemBaseDetalhadoEntity['origem'];
  classe: PersonagemBaseDetalhadoEntity['classe'];
  trilha: PersonagemBaseDetalhadoEntity['trilha'];
  caminho: PersonagemBaseDetalhadoEntity['caminho'];
  alinhamento: PersonagemBaseDetalhadoEntity['alinhamento'];
  tecnicaInata: TecnicaDetalhadaMapeada | null;
  proficiencias: Array<{
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    categoria: string | null;
    subtipo: string | null;
  }>;
  grausAprimoramento: GrauAprimoramentoAjustado[];
  pericias: Array<{
    id: number;
    codigo: string;
    nome: string;
    atributoBase: string;
    somenteTreinada: boolean;
    penalizaPorCarga: boolean;
    precisaKit: boolean;
    grauTreinamento: number;
    bonusExtra: number;
    bonusTotal: number;
  }>;
  grausTreinamento: GrauTreinamentoDto[];
  habilidades: Array<{
    id: number;
    nome: string;
    tipo: string;
    descricao: string | null;
  }>;
  poderesGenericos: Array<{
    id: number;
    habilidadeId: number;
    nome: string;
    config: Prisma.JsonValue;
  }>;
  habilidadesConfig?: Prisma.JsonValue | null;
  poderesGenericosSelecionadosIds: number[];
  passivasAtributosAtivos: string[];
  passivasAtributosConfig: Prisma.JsonValue | null;
  passivasAtributoIds: number[];
  passivas: Array<{
    id: number;
    codigo: string;
    nome: string;
    atributo: string;
    nivel: number;
    descricao: string | null;
    efeitos: Prisma.JsonValue | null;
  }>;
  atributosDerivados: {
    pvMaximo: number;
    peMaximo: number;
    eaMaximo: number;
    sanMaximo: number;
    pvBarrasTotal?: number;
    defesaBase: number;
    defesaEquipamento: number;
    defesaTotal: number;
    deslocamento: number;
    limitePeEaPorTurno: number;
    reacoesBasePorTurno: number;
    turnosMorrendo: number;
    turnosEnlouquecendo: number;
    bloqueio: number;
    esquiva: number;
  };
  resistencias: ResistenciasMapeadas;
  tecnicasNaoInatas: TecnicaDetalhadaMapeada[];
  espacosInventarioBase: number;
  espacosInventarioExtra: number;
  espacosOcupados: number;
  sobrecarregado: boolean;
  itensInventario: InventarioItemMapeado[];
};

@Injectable()
export class PersonagemBaseMapper {
  private isJsonObject(
    value: Prisma.JsonValue | null | undefined,
  ): value is Prisma.JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private hasTipoGrauChoice(
    value: Prisma.JsonValue | null | undefined,
  ): boolean {
    if (!this.isJsonObject(value)) return false;
    const escolha = value.escolha;
    if (!this.isJsonObject(escolha)) return false;
    return escolha.tipo === 'TIPO_GRAU';
  }

  private getTipoGrauCodigoConfig(
    value: Prisma.JsonValue | null | undefined,
  ): string | null {
    if (!this.isJsonObject(value)) return null;
    const codigo = value.tipoGrauCodigo;
    if (typeof codigo !== 'string' || codigo.trim().length === 0) return null;
    return codigo;
  }

  private jsonToStringArray(
    value: Prisma.JsonValue | null | undefined,
  ): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v) => typeof v === 'string');
  }

  mapResumo(personagem: PersonagemBaseResumoEntity) {
    return {
      id: personagem.id,
      nome: personagem.nome,
      nivel: personagem.nivel,
      cla: personagem.cla.nome,
      classe: personagem.classe.nome,
    };
  }

  async mapDetalhado(
    personagem: PersonagemBaseDetalhadoEntity,
    prisma: PrismaLike,
  ): Promise<PersonagemDetalhadoMapeado> {
    const bonusDeHabilidades = await this.calcularBonusGrausDeHabilidades(
      personagem,
      prisma,
    );

    const grausAprimoramentoAjustados: GrauAprimoramentoAjustado[] = (
      personagem.grausAprimoramento ?? []
    )
      .map((g) => {
        const valorDB = g.valor;
        const codigo = g.tipoGrau?.codigo;

        if (!codigo) {
          console.warn('[MAPPER] Grau sem tipoGrau.codigo:', g);
          return null;
        }

        const bonus = bonusDeHabilidades.get(codigo) ?? 0;
        const valorLivre = Math.max(0, valorDB - bonus);

        return {
          tipoGrauCodigo: codigo,
          tipoGrauNome: g.tipoGrau?.nome ?? '',
          valorTotal: valorDB,
          valorLivre,
          bonus,
        };
      })
      .filter((g): g is GrauAprimoramentoAjustado => g !== null);

    const inventarioSomarIntelecto =
      (personagem.habilidadesBase ?? []).some((h) =>
        getInventarioSomarIntelectoFromMecanicas(
          h.habilidade.mecanicasEspeciais,
        ),
      ) ||
      (personagem.poderesGenericos ?? []).some((p) =>
        getInventarioSomarIntelectoFromMecanicas(
          p.habilidade.mecanicasEspeciais,
        ),
      );
    const inventarioReduzirItensLeves =
      (personagem.habilidadesBase ?? []).some((h) =>
        getInventarioReduzirItensLevesFromMecanicas(
          h.habilidade.mecanicasEspeciais,
        ),
      ) ||
      (personagem.poderesGenericos ?? []).some((p) =>
        getInventarioReduzirItensLevesFromMecanicas(
          p.habilidade.mecanicasEspeciais,
        ),
      );
    const atributoInventarioBase = calcularAtributoBaseInventario({
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      somarIntelecto: inventarioSomarIntelecto,
    });
    const espacosInventarioBaseFallback = calcularEspacosInventarioBase(
      atributoInventarioBase,
    );
    const espacosBase =
      personagem.espacosInventarioBase ?? espacosInventarioBaseFallback;
    const espacosExtra = personagem.espacosInventarioExtra ?? 0;
    const espacosInventario = {
      base: espacosBase,
      extra: espacosExtra,
      total: espacosBase + espacosExtra,
    };

    const itensInventario = await this.mapItensInventario(
      personagem.id,
      prisma,
      inventarioReduzirItensLeves,
    );
    const espacosOcupados = itensInventario.reduce((total, item) => {
      return total + item.espacosCalculados * item.quantidade;
    }, 0);
    const sobrecarregado = espacosOcupados > espacosInventario.total;

    const habilidadesResistencias = [
      ...(personagem.habilidadesBase ?? []).map((h) => ({
        habilidade: h.habilidade,
      })),
      ...(personagem.poderesGenericos ?? []).map((p) => ({
        habilidade: p.habilidade,
      })),
    ];

    const resistenciasDeHabilidades = extrairResistenciasDeHabilidades(
      habilidadesResistencias,
      {
        agilidade: personagem.agilidade,
        forca: personagem.forca,
        intelecto: personagem.intelecto,
        presenca: personagem.presenca,
        vigor: personagem.vigor,
      },
    );

    const resistenciasDeEquipamentos =
      await this.calcularResistenciasEquipamentos(personagem.id, prisma);

    const resistenciasMap = new Map<string, number>();
    for (const [codigo, valor] of resistenciasDeHabilidades.entries()) {
      resistenciasMap.set(codigo, (resistenciasMap.get(codigo) ?? 0) + valor);
    }
    for (const [codigo, valor] of resistenciasDeEquipamentos.entries()) {
      resistenciasMap.set(codigo, (resistenciasMap.get(codigo) ?? 0) + valor);
    }

    const resistenciasCodigos = Array.from(resistenciasMap.entries())
      .filter(([, valor]) => typeof valor === 'number' && valor > 0)
      .map(([codigo]) => codigo);

    const resistenciasTipos = resistenciasCodigos.length
      ? await prisma.resistenciaTipo.findMany({
          where: { codigo: { in: resistenciasCodigos } },
          select: { codigo: true, nome: true, descricao: true },
        })
      : [];
    const resistenciaTipoMap = new Map(
      resistenciasTipos.map((r) => [r.codigo, r] as const),
    );

    const resistencias: ResistenciasMapeadas = resistenciasCodigos
      .map((codigo) => {
        const info = resistenciaTipoMap.get(codigo);
        return {
          codigo,
          nome: info?.nome ?? codigo,
          descricao: info?.descricao ?? null,
          valor: resistenciasMap.get(codigo) ?? 0,
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    const grausMap = montarMapaGraus(
      grausAprimoramentoAjustados.map((g) => ({
        tipoGrauCodigo: g.tipoGrauCodigo,
        valor: g.valorTotal,
      })),
    );

    const mapTecnicaDetalhada = (tecnica: {
      id: number;
      codigo: string;
      nome: string;
      descricao: string | null;
      tipo: string;
      hereditaria: boolean;
      linkExterno: string | null;
      requisitos: Prisma.JsonValue | null;
      fonte: string;
      suplementoId: number | null;
      habilidades: Array<{
        id: number;
        tecnicaId: number;
        codigo: string;
        nome: string;
        descricao: string;
        requisitos: Prisma.JsonValue | null;
        execucao: string;
        area: string | null;
        alcance: string | null;
        alvo: string | null;
        duracao: string | null;
        custoPE: number;
        custoEA: number;
        danoFlat: number | null;
        danoFlatTipo: string | null;
        efeito: string;
        ordem: number;
        variacoes: Array<{
          id: number;
          habilidadeTecnicaId: number;
          nome: string;
          descricao: string;
          substituiCustos: boolean;
          custoPE: number | null;
          custoEA: number | null;
          execucao: string | null;
          area: string | null;
          alcance: string | null;
          alvo: string | null;
          duracao: string | null;
          resistencia: string | null;
          dtResistencia: string | null;
          criticoValor: number | null;
          criticoMultiplicador: number | null;
          danoFlat: number | null;
          danoFlatTipo: string | null;
          dadosDano: Prisma.JsonValue | null;
          escalonaPorGrau: boolean | null;
          escalonamentoCustoEA: number | null;
          escalonamentoDano: Prisma.JsonValue | null;
          efeitoAdicional: string | null;
          requisitos: Prisma.JsonValue | null;
          ordem: number;
        }>;
      }>;
    }): TecnicaDetalhadaMapeada => ({
      id: tecnica.id,
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao,
      tipo: tecnica.tipo,
      hereditaria: tecnica.hereditaria,
      linkExterno: tecnica.linkExterno,
      requisitos: tecnica.requisitos,
      fonte: tecnica.fonte,
      suplementoId: tecnica.suplementoId,
      habilidades: (tecnica.habilidades ?? [])
        .filter((habilidade) =>
          atendeRequisitosGraus(habilidade.requisitos, grausMap),
        )
        .map((habilidade) => ({
          id: habilidade.id,
          tecnicaId: habilidade.tecnicaId,
          codigo: habilidade.codigo,
          nome: habilidade.nome,
          descricao: habilidade.descricao,
          requisitos: habilidade.requisitos,
          execucao: habilidade.execucao,
          area: habilidade.area,
          alcance: habilidade.alcance,
          alvo: habilidade.alvo,
          duracao: habilidade.duracao,
          custoPE: habilidade.custoPE,
          custoEA: habilidade.custoEA,
          danoFlat: habilidade.danoFlat,
          danoFlatTipo: habilidade.danoFlatTipo,
          efeito: habilidade.efeito,
          ordem: habilidade.ordem,
          variacoes: (habilidade.variacoes ?? [])
            .filter((variacao) =>
              atendeRequisitosGraus(variacao.requisitos, grausMap),
            )
            .map((variacao) => ({
              id: variacao.id,
              habilidadeTecnicaId: variacao.habilidadeTecnicaId,
              nome: variacao.nome,
              descricao: variacao.descricao,
              substituiCustos: variacao.substituiCustos,
              custoPE: variacao.custoPE,
              custoEA: variacao.custoEA,
              execucao: variacao.execucao,
              area: variacao.area,
              alcance: variacao.alcance,
              alvo: variacao.alvo,
              duracao: variacao.duracao,
              resistencia: variacao.resistencia,
              dtResistencia: variacao.dtResistencia,
              criticoValor: variacao.criticoValor,
              criticoMultiplicador: variacao.criticoMultiplicador,
              danoFlat: variacao.danoFlat,
              danoFlatTipo: variacao.danoFlatTipo,
              dadosDano: variacao.dadosDano,
              escalonaPorGrau: variacao.escalonaPorGrau,
              escalonamentoCustoEA: variacao.escalonamentoCustoEA,
              escalonamentoDano: variacao.escalonamentoDano,
              efeitoAdicional: variacao.efeitoAdicional,
              requisitos: variacao.requisitos,
              ordem: variacao.ordem,
            })),
        })),
    });

    const tecnicasNaoInatasCatalogo = await prisma.tecnicaAmaldicoada.findMany({
      where: {
        tipo: 'NAO_INATA',
      },
      include: {
        habilidades: {
          include: {
            variacoes: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const tecnicasNaoInatas: TecnicaDetalhadaMapeada[] =
      tecnicasNaoInatasCatalogo
        .filter(
          (tecnica) =>
            atendeRequisitoBaseTecnicaNaoInata(tecnica.codigo, grausMap) &&
            atendeRequisitosGraus(tecnica.requisitos, grausMap),
        )
        .map(mapTecnicaDetalhada);

    const tecnicaInataDetalhada: TecnicaDetalhadaMapeada | null =
      personagem.tecnicaInata
        ? mapTecnicaDetalhada(personagem.tecnicaInata)
        : null;

    const creditoCategoriaBonus = [
      ...(personagem.habilidadesBase ?? []).map((h) => h.habilidade),
      ...(personagem.poderesGenericos ?? []).map((p) => p.habilidade),
    ].reduce(
      (acc, hab) =>
        acc + getCreditoCategoriaBonusFromMecanicas(hab.mecanicasEspeciais),
      0,
    );

    const habilidadesParaOverride = [
      ...(personagem.habilidadesBase ?? []).map((h) => ({
        habilidade: h.habilidade,
      })),
      ...(personagem.poderesGenericos ?? []).map((p) => ({
        habilidade: p.habilidade,
      })),
    ];
    const periciasAtributoBaseOverride = extrairPericiasAtributoBaseOverride(
      habilidadesParaOverride,
    );
    const atributoChaveEaOverride = extrairAtributoChaveEaDeHabilidades(
      habilidadesParaOverride,
    );

    return {
      id: personagem.id,
      nome: personagem.nome,
      nivel: personagem.nivel,

      claId: personagem.claId,
      origemId: personagem.origemId,
      classeId: personagem.classeId,
      trilhaId: personagem.trilhaId,
      caminhoId: personagem.caminhoId,

      agilidade: personagem.agilidade,
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      presenca: personagem.presenca,
      vigor: personagem.vigor,

      estudouEscolaTecnica: personagem.estudouEscolaTecnica,
      tecnicaInataId: personagem.tecnicaInataId,

      idade: personagem.idade,
      prestigioBase: personagem.prestigioBase,
      prestigioClaBase: personagem.prestigioClaBase,
      creditoCategoriaBonus,
      alinhamentoId: personagem.alinhamentoId,
      background: personagem.background,
      atributoChaveEa: atributoChaveEaOverride ?? personagem.atributoChaveEa,

      proficienciasExtrasCodigos: this.jsonToStringArray(
        personagem.proficienciasExtrasCodigos,
      ),

      periciasClasseEscolhidasCodigos: this.jsonToStringArray(
        personagem.periciasClasseEscolhidasCodigos,
      ),
      periciasOrigemEscolhidasCodigos: this.jsonToStringArray(
        personagem.periciasOrigemEscolhidasCodigos,
      ),
      periciasLivresCodigos: this.jsonToStringArray(
        personagem.periciasLivresCodigos,
      ),

      cla: personagem.cla,
      origem: personagem.origem,
      classe: personagem.classe,
      trilha: personagem.trilha,
      caminho: personagem.caminho,
      alinhamento: personagem.alinhamento,

      tecnicaInata: tecnicaInataDetalhada,

      proficiencias: (personagem.proficiencias ?? []).map((pp) => ({
        id: pp.proficiencia.id,
        codigo: pp.proficiencia.codigo,
        nome: pp.proficiencia.nome,
        tipo: pp.proficiencia.tipo,
        categoria: pp.proficiencia.categoria,
        subtipo: pp.proficiencia.subtipo,
      })),

      grausAprimoramento: grausAprimoramentoAjustados,

      pericias: (personagem.pericias ?? []).map((p) => ({
        id: p.pericia.id,
        codigo: p.pericia.codigo,
        nome: p.pericia.nome,
        atributoBase:
          periciasAtributoBaseOverride[p.pericia.codigo] ??
          p.pericia.atributoBase,
        somenteTreinada: p.pericia.somenteTreinada,
        penalizaPorCarga: p.pericia.penalizaPorCarga,
        precisaKit: p.pericia.precisaKit,
        grauTreinamento: p.grauTreinamento,
        bonusExtra: p.bonusExtra,
        bonusTotal: p.grauTreinamento * 5 + p.bonusExtra,
      })),

      grausTreinamento: (personagem.grausTreinamento ?? []).reduce(
        (acc: GrauTreinamentoDto[], gt) => {
          const nivelExistente = acc.find((g) => g.nivel === gt.nivel);
          const melhoria = {
            periciaCodigo: gt.periciaCodigo,
            grauAnterior: gt.grauAnterior,
            grauNovo: gt.grauNovo,
          };

          if (nivelExistente) {
            nivelExistente.melhorias.push(melhoria);
          } else {
            acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
          }
          return acc;
        },
        [] as GrauTreinamentoDto[],
      ),

      habilidades: (personagem.habilidadesBase ?? []).map((hab) => ({
        id: hab.habilidade.id,
        nome: hab.habilidade.nome,
        tipo: hab.habilidade.tipo,
        descricao: hab.habilidade.descricao,
      })),

      poderesGenericos: (personagem.poderesGenericos ?? []).map((p) => ({
        id: p.id,
        habilidadeId: p.habilidadeId,
        nome: p.habilidade.nome,
        config: p.config ?? {},
      })),

      habilidadesConfig: personagem.habilidadesConfig ?? null,

      poderesGenericosSelecionadosIds: (personagem.poderesGenericos ?? []).map(
        (p) => p.habilidadeId,
      ),

      passivasAtributosAtivos: this.jsonToStringArray(
        personagem.passivasAtributosAtivos,
      ),

      passivasAtributosConfig: personagem.passivasAtributosConfig ?? null,

      passivasAtributoIds: (personagem.passivas ?? []).map((p) => p.passiva.id),

      passivas: (personagem.passivas ?? []).map((p) => ({
        id: p.passiva.id,
        codigo: p.passiva.codigo,
        nome: p.passiva.nome,
        atributo: p.passiva.atributo,
        nivel: p.passiva.nivel,
        descricao: p.passiva.descricao,
        efeitos: p.passiva.efeitos,
      })),

      atributosDerivados: {
        pvMaximo: personagem.pvMaximo,
        pvBarrasTotal: personagem.pvBarrasTotal ?? 1,
        peMaximo: personagem.peMaximo,
        eaMaximo: personagem.eaMaximo,
        sanMaximo: personagem.sanMaximo,
        defesaBase: personagem.defesaBase ?? 10,
        defesaEquipamento: personagem.defesaEquipamento ?? 0,
        defesaTotal:
          (personagem.defesaBase ?? 10) + (personagem.defesaEquipamento ?? 0),
        deslocamento: personagem.deslocamento,
        limitePeEaPorTurno: personagem.limitePeEaPorTurno,
        reacoesBasePorTurno: personagem.reacoesBasePorTurno,
        turnosMorrendo: personagem.turnosMorrendo,
        turnosEnlouquecendo: personagem.turnosEnlouquecendo,
        bloqueio: personagem.bloqueio ?? 0,
        esquiva: personagem.esquiva ?? 0,
      },

      resistencias,
      tecnicasNaoInatas,

      espacosInventarioBase: espacosInventario.base,
      espacosInventarioExtra: espacosInventario.extra,
      espacosOcupados,
      sobrecarregado,
      itensInventario,
    };
  }

  private async calcularResistenciasEquipamentos(
    personagemBaseId: number,
    prisma: PrismaLike,
  ): Promise<Map<string, number>> {
    const itens = await prisma.inventarioItemBase.findMany({
      where: { personagemBaseId, equipado: true },
      include: {
        equipamento: {
          include: {
            reducesDano: true,
          },
        },
        modificacoes: {
          include: {
            modificacao: true,
          },
        },
      },
    });

    const resistencias = new Map<string, number>();

    for (const item of itens) {
      const reducoes = item.equipamento?.reducesDano ?? [];
      if (reducoes.length === 0) continue;

      for (const rd of reducoes) {
        const atual = resistencias.get(rd.tipoReducao) ?? 0;
        resistencias.set(
          rd.tipoReducao,
          atual + rd.valor * item.quantidade,
        );
      }

      for (const modJunction of item.modificacoes ?? []) {
        const rdAdicional = extrairNumeroJson(
          modJunction.modificacao?.efeitosMecanicos ?? null,
          'rdAdicional',
        );
        if (typeof rdAdicional !== 'number') continue;

        for (const rd of reducoes) {
          const atual = resistencias.get(rd.tipoReducao) ?? 0;
          resistencias.set(
            rd.tipoReducao,
            atual + rdAdicional * item.quantidade,
          );
        }
      }
    }

    return resistencias;
  }

  private async mapItensInventario(
    personagemBaseId: number,
    prisma: PrismaLike,
    reduzirItensLeves = false,
  ): Promise<InventarioItemMapeado[]> {
    try {
      const itens: InventarioItemDetalhadoEntity[] =
        await prisma.inventarioItemBase.findMany({
          where: { personagemBaseId },
          include: inventarioItemDetalhadoInclude,
          orderBy: { id: 'asc' },
        });

      const itensMapeados: InventarioItemMapeado[] = [];

      for (const item of itens) {
        const equipamento = item.equipamento;
        if (!equipamento) continue;

        let espacosPorUnidade =
          reduzirItensLeves &&
          equipamento.espacos > 0 &&
          equipamento.espacos <= 0.5
            ? equipamento.espacos / 2
            : equipamento.espacos;

        const modsAplicadas: InventarioModificacaoMapeada[] = (
          item.modificacoes ?? []
        ).flatMap((junction) => {
          const mod = junction.modificacao;
          if (!mod) return [];

          espacosPorUnidade += mod.incrementoEspacos;
          const restricoes = this.isJsonObject(mod.restricoes)
            ? mod.restricoes
            : null;

          const apenasAmaldicoadas =
            restricoes && typeof restricoes.apenasAmaldicoadas === 'boolean'
              ? restricoes.apenasAmaldicoadas
              : false;

          const requerComplexidade =
            restricoes && typeof restricoes.requerComplexidade === 'string'
              ? restricoes.requerComplexidade
              : null;

          return [
            {
              id: mod.id,
              codigo: mod.codigo,
              nome: mod.nome,
              descricao: mod.descricao,
              tipo: mod.tipo,
              incrementoEspacos: mod.incrementoEspacos,
              apenasAmaldicoadas,
              requerComplexidade,
              efeitosMecanicos: mod.efeitosMecanicos,
            },
          ];
        });

        itensMapeados.push({
          id: item.id,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          espacosCalculados: espacosPorUnidade,
          categoriaCalculada: (
            item.categoriaCalculada ??
            calcularCategoriaFinal(equipamento.categoria, modsAplicadas.length)
          ).toString(),
          nomeCustomizado: item.nomeCustomizado,
          notas: item.notas,
          equipamento: {
            id: equipamento.id,
            codigo: equipamento.codigo,
            nome: equipamento.nome,
            descricao: equipamento.descricao,
            tipo: equipamento.tipo,
            categoria: equipamento.categoria,
            espacos: equipamento.espacos,
            complexidadeMaldicao: equipamento.complexidadeMaldicao || 'NENHUMA',
          },
          modificacoes: modsAplicadas,
        });
      }

      return itensMapeados;
    } catch (error) {
      console.error('[MAPPER] Erro ao mapear itens de inventario:', error);
      return [];
    }
  }

  private async calcularBonusGrausDeHabilidades(
    personagem: PersonagemBaseDetalhadoEntity,
    prisma: PrismaLike,
  ): Promise<Map<string, number>> {
    const bonusMap = new Map<string, number>();

    try {
      const habilidadesBase = await prisma.habilidadePersonagemBase.findMany({
        where: { personagemBaseId: personagem.id },
        include: {
          habilidade: {
            include: {
              efeitosGrau: true,
            },
          },
        },
      });

      const poderesGenericos =
        await prisma.poderGenericoPersonagemBase.findMany({
          where: { personagemBaseId: personagem.id },
          include: {
            habilidade: {
              include: {
                efeitosGrau: true,
              },
            },
          },
        });

      const todasHabilidades = [
        ...habilidadesBase.map((h) => h.habilidade),
        ...poderesGenericos.map((p) => p.habilidade),
      ];

      for (const hab of todasHabilidades) {
        if (!hab.efeitosGrau || hab.efeitosGrau.length === 0) continue;

        for (const efeito of hab.efeitosGrau) {
          const codigo = efeito.tipoGrauCodigo;
          const atual = bonusMap.get(codigo) ?? 0;
          bonusMap.set(codigo, atual + (efeito.valor ?? 0));
        }
      }

      for (const poder of poderesGenericos) {
        const mec = poder.habilidade.mecanicasEspeciais;
        if (!this.hasTipoGrauChoice(mec)) continue;

        const codigo = this.getTipoGrauCodigoConfig(poder.config);
        if (!codigo) continue;

        const atual = bonusMap.get(codigo) ?? 0;
        bonusMap.set(codigo, atual + 1);
      }

      if (bonusMap.size > 0) {
        console.log(
          '[MAPPER] Bonus de graus calculados:',
          Object.fromEntries(bonusMap),
        );
      }
    } catch (err) {
      console.error('[MAPPER] Erro ao calcular bonus de graus:', err);
    }

    return bonusMap;
  }
}
