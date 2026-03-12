// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AreaEfeito,
  Prisma,
  TipoDano,
  TipoEscalonamentoHabilidade,
  TipoExecucao,
  TipoFonte,
  TipoTecnicaAmaldicoada,
} from '@prisma/client';

// DTOs - Técnicas
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';
import { ExportarTecnicasJsonDto } from './dto/exportar-tecnicas-json.dto';
import { ImportarTecnicasJsonDto } from './dto/importar-tecnicas-json.dto';

// DTOs - Habilidades
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';

// DTOs - Variações
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  TecnicaNaoEncontradaException,
  TecnicaCodigoOuNomeDuplicadoException,
  TecnicaNaoInataHereditariaException,
  TecnicaHereditariaSemClaException,
  TecnicaSuplementoNaoEncontradoException,
  TecnicaEmUsoException,
  TecnicaClaNaoEncontradoException,
  HabilidadeTecnicaNaoEncontradaException,
  HabilidadeCodigoDuplicadoException,
  VariacaoHabilidadeNaoEncontradaException,
} from 'src/common/exceptions/tecnica-amaldicoada.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

const tecnicaDetalhadaInclude = {
  clas: {
    include: {
      cla: {
        select: {
          id: true,
          nome: true,
          grandeCla: true,
        },
      },
    },
  },
  habilidades: {
    include: {
      variacoes: {
        orderBy: { ordem: 'asc' as const },
      },
    },
    orderBy: { ordem: 'asc' as const },
  },
  suplemento: true,
} satisfies Prisma.TecnicaAmaldicoadaInclude;

type TecnicaDetalhadaPayload = Prisma.TecnicaAmaldicoadaGetPayload<{
  include: typeof tecnicaDetalhadaInclude;
}>;

type RegistroJson = Record<string, unknown>;

type VariacaoImportNormalizada = Omit<
  CreateVariacaoHabilidadeDto,
  'habilidadeTecnicaId'
> & {
  id?: number;
};

type HabilidadeImportNormalizada = Omit<
  CreateHabilidadeTecnicaDto,
  'tecnicaId'
> & {
  id?: number;
  variacoes: VariacaoImportNormalizada[];
};

type TecnicaImportNormalizada = CreateTecnicaDto & {
  id?: number;
  habilidades: HabilidadeImportNormalizada[];
};

type ImportacaoTecnicasResumo = {
  schema: string;
  schemaVersion: number;
  modo: 'UPSERT';
  totalRecebido: number;
  tecnicas: {
    criadas: number;
    atualizadas: number;
  };
  habilidades: {
    criadas: number;
    atualizadas: number;
    removidas: number;
  };
  variacoes: {
    criadas: number;
    atualizadas: number;
    removidas: number;
  };
  avisos: string[];
};

const TECNICAS_JSON_SCHEMA = 'tecnicas-amaldicoadas.import-export';
const TECNICAS_JSON_SCHEMA_VERSION = 1;

const tecnicaUsoInclude = {
  _count: {
    select: {
      personagensBaseComInata: true,
      personagensCampanhaComInata: true,
      personagensBaseAprendeu: true,
      personagensCampanhaAprendeu: true,
    },
  },
} satisfies Prisma.TecnicaAmaldicoadaInclude;

@Injectable()
export class TecnicasAmaldicoadasService {
  constructor(private prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private normalizarJsonOuNull(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === undefined || value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private normalizarJsonOpcional(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private async validarFonteSuplemento(
    fonte: TipoFonte,
    suplementoId: number | null,
  ) {
    if (suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new TecnicaSuplementoNaoEncontradoException(suplementoId);
      }

      if (fonte !== TipoFonte.SUPLEMENTO) {
        throw new BadRequestException({
          code: 'FONTE_SUPLEMENTO_OBRIGATORIA',
          message:
            'Quando suplementoId for informado, fonte deve ser SUPLEMENTO',
          field: 'fonte',
        });
      }
      return;
    }

    if (fonte === TipoFonte.SUPLEMENTO) {
      throw new BadRequestException({
        code: 'SUPLEMENTO_ID_OBRIGATORIO',
        message: 'fonte SUPLEMENTO exige suplementoId',
        field: 'suplementoId',
      });
    }
  }

  private garantirObjeto(value: unknown, path: string): RegistroJson {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_INVALIDO',
        message: `${path} deve ser um objeto JSON.`,
      });
    }

    return value as RegistroJson;
  }

  private lerStringObrigatoria(
    source: RegistroJson,
    campo: string,
    path: string,
  ): string {
    const raw = source[campo];
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_OBRIGATORIO',
        message: `${path}.${campo} e obrigatorio e deve ser string nao vazia.`,
      });
    }

    return raw.trim();
  }

  private lerStringOpcional(source: RegistroJson, campo: string): string | undefined {
    const raw = source[campo];
    if (raw === undefined || raw === null) {
      return undefined;
    }

    if (typeof raw !== 'string') {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_INVALIDO',
        message: `${campo} deve ser string quando informado.`,
      });
    }

    const normalized = raw.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private lerNumeroOpcional(
    source: RegistroJson,
    campo: string,
    path: string,
  ): number | undefined {
    const raw = source[campo];
    if (raw === undefined || raw === null || raw === '') {
      return undefined;
    }

    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_INVALIDO',
        message: `${path}.${campo} deve ser numero valido.`,
      });
    }

    return raw;
  }

  private lerInteiroOpcional(
    source: RegistroJson,
    campo: string,
    path: string,
  ): number | undefined {
    const value = this.lerNumeroOpcional(source, campo, path);
    if (value === undefined) {
      return undefined;
    }

    if (!Number.isInteger(value)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_INVALIDO',
        message: `${path}.${campo} deve ser numero inteiro.`,
      });
    }

    return value;
  }

  private lerBooleanOpcional(
    source: RegistroJson,
    campo: string,
    path: string,
  ): boolean | undefined {
    const raw = source[campo];
    if (raw === undefined || raw === null || raw === '') {
      return undefined;
    }

    if (typeof raw === 'boolean') {
      return raw;
    }

    if (typeof raw === 'number') {
      if (raw === 1) return true;
      if (raw === 0) return false;
    }

    if (typeof raw === 'string') {
      const normalized = raw.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    }

    throw new BadRequestException({
      code: 'JSON_IMPORT_CAMPO_INVALIDO',
      message: `${path}.${campo} deve ser booleano.`,
    });
  }

  private lerArrayStringsOpcional(
    source: RegistroJson,
    campo: string,
    path: string,
  ): string[] | undefined {
    const raw = source[campo];
    if (raw === undefined || raw === null) {
      return undefined;
    }

    if (!Array.isArray(raw)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_INVALIDO',
        message: `${path}.${campo} deve ser array de strings.`,
      });
    }

    const normalized = raw
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item): item is string => typeof item === 'string' && item.length > 0);

    return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
  }

  private lerEnumObrigatorio<TEnum extends Record<string, string>>(
    source: RegistroJson,
    campo: string,
    enumRef: TEnum,
    path: string,
  ): TEnum[keyof TEnum] {
    const raw = source[campo];
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_OBRIGATORIO',
        message: `${path}.${campo} e obrigatorio.`,
      });
    }

    const value = raw.trim() as TEnum[keyof TEnum];
    if (!Object.values(enumRef).includes(value)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_ENUM_INVALIDO',
        message: `${path}.${campo} invalido. Valores aceitos: ${Object.values(enumRef).join(', ')}.`,
      });
    }

    return value;
  }

  private lerEnumOpcional<TEnum extends Record<string, string>>(
    source: RegistroJson,
    campo: string,
    enumRef: TEnum,
    path: string,
  ): TEnum[keyof TEnum] | undefined {
    const raw = source[campo];
    if (raw === undefined || raw === null || raw === '') {
      return undefined;
    }

    if (typeof raw !== 'string') {
      throw new BadRequestException({
        code: 'JSON_IMPORT_CAMPO_INVALIDO',
        message: `${path}.${campo} deve ser string.`,
      });
    }

    const value = raw.trim() as TEnum[keyof TEnum];
    if (!Object.values(enumRef).includes(value)) {
      throw new BadRequestException({
        code: 'JSON_IMPORT_ENUM_INVALIDO',
        message: `${path}.${campo} invalido. Valores aceitos: ${Object.values(enumRef).join(', ')}.`,
      });
    }

    return value;
  }

  private parseVariacaoImport(
    raw: unknown,
    habilidadePath: string,
    index: number,
  ): VariacaoImportNormalizada {
    const path = `${habilidadePath}.variacoes[${index}]`;
    const source = this.garantirObjeto(raw, path);

    return {
      id: this.lerInteiroOpcional(source, 'id', path),
      nome: this.lerStringObrigatoria(source, 'nome', path),
      descricao: this.lerStringObrigatoria(source, 'descricao', path),
      substituiCustos:
        this.lerBooleanOpcional(source, 'substituiCustos', path) ?? false,
      custoPE: this.lerInteiroOpcional(source, 'custoPE', path),
      custoEA: this.lerInteiroOpcional(source, 'custoEA', path),
      custoSustentacaoEA: this.lerInteiroOpcional(
        source,
        'custoSustentacaoEA',
        path,
      ),
      custoSustentacaoPE: this.lerInteiroOpcional(
        source,
        'custoSustentacaoPE',
        path,
      ),
      execucao: this.lerEnumOpcional(source, 'execucao', TipoExecucao, path),
      area: this.lerEnumOpcional(source, 'area', AreaEfeito, path),
      alcance: this.lerStringOpcional(source, 'alcance'),
      alvo: this.lerStringOpcional(source, 'alvo'),
      duracao: this.lerStringOpcional(source, 'duracao'),
      resistencia: this.lerStringOpcional(source, 'resistencia'),
      dtResistencia: this.lerStringOpcional(source, 'dtResistencia'),
      criticoValor: this.lerInteiroOpcional(source, 'criticoValor', path),
      criticoMultiplicador: this.lerInteiroOpcional(
        source,
        'criticoMultiplicador',
        path,
      ),
      danoFlat: this.lerInteiroOpcional(source, 'danoFlat', path),
      danoFlatTipo: this.lerEnumOpcional(source, 'danoFlatTipo', TipoDano, path),
      dadosDano: source.dadosDano,
      escalonaPorGrau: this.lerBooleanOpcional(source, 'escalonaPorGrau', path),
      escalonamentoCustoEA: this.lerInteiroOpcional(
        source,
        'escalonamentoCustoEA',
        path,
      ),
      escalonamentoCustoPE: this.lerInteiroOpcional(
        source,
        'escalonamentoCustoPE',
        path,
      ),
      escalonamentoTipo: this.lerEnumOpcional(
        source,
        'escalonamentoTipo',
        TipoEscalonamentoHabilidade,
        path,
      ),
      escalonamentoEfeito: source.escalonamentoEfeito,
      escalonamentoDano: source.escalonamentoDano,
      efeitoAdicional: this.lerStringOpcional(source, 'efeitoAdicional'),
      requisitos: source.requisitos,
      ordem: this.lerInteiroOpcional(source, 'ordem', path),
    };
  }

  private parseHabilidadeImport(
    raw: unknown,
    tecnicaPath: string,
    index: number,
  ): HabilidadeImportNormalizada {
    const path = `${tecnicaPath}.habilidades[${index}]`;
    const source = this.garantirObjeto(raw, path);
    const variacoesRaw = source.variacoes;

    return {
      id: this.lerInteiroOpcional(source, 'id', path),
      codigo: this.lerStringObrigatoria(source, 'codigo', path),
      nome: this.lerStringObrigatoria(source, 'nome', path),
      descricao: this.lerStringObrigatoria(source, 'descricao', path),
      requisitos: source.requisitos,
      execucao: this.lerEnumObrigatorio(source, 'execucao', TipoExecucao, path),
      area: this.lerEnumOpcional(source, 'area', AreaEfeito, path),
      alcance: this.lerStringOpcional(source, 'alcance'),
      alvo: this.lerStringOpcional(source, 'alvo'),
      duracao: this.lerStringOpcional(source, 'duracao'),
      resistencia: this.lerStringOpcional(source, 'resistencia'),
      dtResistencia: this.lerStringOpcional(source, 'dtResistencia'),
      custoPE: this.lerInteiroOpcional(source, 'custoPE', path),
      custoEA: this.lerInteiroOpcional(source, 'custoEA', path),
      custoSustentacaoEA: this.lerInteiroOpcional(
        source,
        'custoSustentacaoEA',
        path,
      ),
      custoSustentacaoPE: this.lerInteiroOpcional(
        source,
        'custoSustentacaoPE',
        path,
      ),
      testesExigidos: source.testesExigidos,
      criticoValor: this.lerInteiroOpcional(source, 'criticoValor', path),
      criticoMultiplicador: this.lerInteiroOpcional(
        source,
        'criticoMultiplicador',
        path,
      ),
      danoFlat: this.lerInteiroOpcional(source, 'danoFlat', path),
      danoFlatTipo: this.lerEnumOpcional(source, 'danoFlatTipo', TipoDano, path),
      dadosDano: source.dadosDano,
      escalonaPorGrau:
        this.lerBooleanOpcional(source, 'escalonaPorGrau', path) ?? false,
      grauTipoGrauCodigo: this.lerStringOpcional(source, 'grauTipoGrauCodigo'),
      escalonamentoCustoEA:
        this.lerInteiroOpcional(source, 'escalonamentoCustoEA', path) ?? 0,
      escalonamentoCustoPE:
        this.lerInteiroOpcional(source, 'escalonamentoCustoPE', path) ?? 0,
      escalonamentoTipo:
        this.lerEnumOpcional(
          source,
          'escalonamentoTipo',
          TipoEscalonamentoHabilidade,
          path,
        ) ?? TipoEscalonamentoHabilidade.OUTRO,
      escalonamentoEfeito: source.escalonamentoEfeito,
      escalonamentoDano: source.escalonamentoDano,
      efeito: this.lerStringObrigatoria(source, 'efeito', path),
      ordem: this.lerInteiroOpcional(source, 'ordem', path),
      variacoes: Array.isArray(variacoesRaw)
        ? variacoesRaw.map((variacao, variacaoIndex) =>
            this.parseVariacaoImport(variacao, path, variacaoIndex),
          )
        : [],
    };
  }

  private parseTecnicaImport(
    raw: unknown,
    index: number,
  ): TecnicaImportNormalizada {
    const path = `tecnicas[${index}]`;
    const source = this.garantirObjeto(raw, path);
    const habilidadesRaw = source.habilidades;

    return {
      id: this.lerInteiroOpcional(source, 'id', path),
      codigo: this.lerStringObrigatoria(source, 'codigo', path).toUpperCase(),
      nome: this.lerStringObrigatoria(source, 'nome', path),
      descricao: this.lerStringObrigatoria(source, 'descricao', path),
      tipo: this.lerEnumObrigatorio(
        source,
        'tipo',
        TipoTecnicaAmaldicoada,
        path,
      ),
      hereditaria: this.lerBooleanOpcional(source, 'hereditaria', path),
      clasHereditarios: this.lerArrayStringsOpcional(
        source,
        'clasHereditarios',
        path,
      ),
      linkExterno: this.lerStringOpcional(source, 'linkExterno'),
      fonte:
        this.lerEnumOpcional(source, 'fonte', TipoFonte, path) ??
        TipoFonte.SISTEMA_BASE,
      suplementoId: this.lerInteiroOpcional(source, 'suplementoId', path),
      requisitos: source.requisitos,
      habilidades: Array.isArray(habilidadesRaw)
        ? habilidadesRaw.map((habilidade, habilidadeIndex) =>
            this.parseHabilidadeImport(habilidade, path, habilidadeIndex),
          )
        : [],
    };
  }

  private mapTecnicaExportJson(
    tecnica: TecnicaDetalhadaPayload,
    incluirIds: boolean,
  ): RegistroJson {
    return {
      ...(incluirIds ? { id: tecnica.id } : {}),
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao,
      tipo: tecnica.tipo,
      hereditaria: tecnica.hereditaria,
      clasHereditarios: tecnica.clas.map((rel) => rel.cla.nome),
      linkExterno: tecnica.linkExterno,
      fonte: tecnica.fonte,
      suplementoId: tecnica.suplementoId,
      requisitos: tecnica.requisitos,
      habilidades: tecnica.habilidades.map((habilidade) => ({
        ...(incluirIds ? { id: habilidade.id } : {}),
        codigo: habilidade.codigo,
        nome: habilidade.nome,
        descricao: habilidade.descricao,
        requisitos: habilidade.requisitos,
        execucao: habilidade.execucao,
        area: habilidade.area,
        alcance: habilidade.alcance,
        alvo: habilidade.alvo,
        duracao: habilidade.duracao,
        resistencia: habilidade.resistencia,
        dtResistencia: habilidade.dtResistencia,
        custoPE: habilidade.custoPE,
        custoEA: habilidade.custoEA,
        custoSustentacaoEA: habilidade.custoSustentacaoEA,
        custoSustentacaoPE: habilidade.custoSustentacaoPE,
        testesExigidos: habilidade.testesExigidos,
        criticoValor: habilidade.criticoValor,
        criticoMultiplicador: habilidade.criticoMultiplicador,
        danoFlat: habilidade.danoFlat,
        danoFlatTipo: habilidade.danoFlatTipo,
        dadosDano: habilidade.dadosDano,
        escalonaPorGrau: habilidade.escalonaPorGrau,
        grauTipoGrauCodigo: habilidade.grauTipoGrauCodigo,
        escalonamentoCustoEA: habilidade.escalonamentoCustoEA,
        escalonamentoCustoPE: habilidade.escalonamentoCustoPE,
        escalonamentoTipo: habilidade.escalonamentoTipo,
        escalonamentoEfeito: habilidade.escalonamentoEfeito,
        escalonamentoDano: habilidade.escalonamentoDano,
        efeito: habilidade.efeito,
        ordem: habilidade.ordem,
        variacoes: habilidade.variacoes.map((variacao) => ({
          ...(incluirIds ? { id: variacao.id } : {}),
          nome: variacao.nome,
          descricao: variacao.descricao,
          substituiCustos: variacao.substituiCustos,
          custoPE: variacao.custoPE,
          custoEA: variacao.custoEA,
          custoSustentacaoEA: variacao.custoSustentacaoEA,
          custoSustentacaoPE: variacao.custoSustentacaoPE,
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
          escalonamentoCustoPE: variacao.escalonamentoCustoPE,
          escalonamentoTipo: variacao.escalonamentoTipo,
          escalonamentoEfeito: variacao.escalonamentoEfeito,
          escalonamentoDano: variacao.escalonamentoDano,
          efeitoAdicional: variacao.efeitoAdicional,
          requisitos: variacao.requisitos,
          ordem: variacao.ordem,
        })),
      })),
    };
  }

  async getGuiaImportacaoJson(): Promise<RegistroJson> {
    const exemploMinimo = {
      schema: TECNICAS_JSON_SCHEMA,
      schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
      modo: 'UPSERT',
      tecnicas: [
        {
          codigo: 'TEC_EXEMPLO',
          nome: 'Tecnica Exemplo',
          descricao: 'Descricao resumida da tecnica.',
          tipo: 'INATA',
          hereditaria: false,
          fonte: 'SISTEMA_BASE',
          habilidades: [],
        },
      ],
    };

    const exemploCompleto = {
      schema: TECNICAS_JSON_SCHEMA,
      schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
      modo: 'UPSERT',
      substituirHabilidadesAusentes: false,
      substituirVariacoesAusentes: false,
      tecnicas: [
        {
          codigo: 'TEC_EXEMPLO_COMPLETO',
          nome: 'Tecnica Exemplo Completo',
          descricao: 'Tecnica com habilidade e variacao.',
          tipo: 'NAO_INATA',
          hereditaria: false,
          clasHereditarios: [],
          linkExterno: null,
          fonte: 'SISTEMA_BASE',
          suplementoId: null,
          requisitos: { observacao: 'Campo JSON livre' },
          habilidades: [
            {
              codigo: 'HAB_EXEMPLO_01',
              nome: 'Habilidade Exemplo',
              descricao: 'Descricao da habilidade.',
              execucao: 'ACAO_PADRAO',
              alcance: 'CURTO (9m)',
              alvo: '1 ser',
              duracao: 'INSTANTANEA',
              custoPE: 1,
              custoEA: 2,
              escalonaPorGrau: true,
              escalonamentoCustoEA: 1,
              escalonamentoCustoPE: 0,
              escalonamentoTipo: 'DANO_DADOS',
              escalonamentoDano: {
                quantidade: 1,
                dado: 'd6',
                tipo: 'AMALDICOADO_JUJUTSU',
              },
              efeito: 'Descricao do efeito principal.',
              ordem: 0,
              variacoes: [
                {
                  nome: 'Variacao Superior',
                  descricao: 'Sobrescreve parte do custo.',
                  substituiCustos: false,
                  custoEA: 1,
                  custoPE: 1,
                  efeitoAdicional: 'Texto adicional da variacao.',
                  ordem: 0,
                },
              ],
            },
          ],
        },
      ],
    };

    return {
      schema: TECNICAS_JSON_SCHEMA,
      schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
      descricao:
        'Formato oficial para importar/exportar tecnicas amaldicoadas com habilidades e variacoes.',
      regras: [
        'A importacao usa modo UPSERT por codigo de tecnica e codigo de habilidade.',
        'Variacoes usam id (quando informado) ou nome dentro da habilidade para atualizar.',
        'CRUD manual continua disponivel no painel admin (tecnica -> habilidades -> variacoes).',
        'substituirHabilidadesAusentes=true remove habilidades nao presentes no arquivo para cada tecnica importada.',
        'substituirVariacoesAusentes=true remove variacoes nao presentes no arquivo para cada habilidade importada.',
      ],
      exemplos: {
        minimo: exemploMinimo,
        completo: exemploCompleto,
      },
      camposObrigatorios: {
        tecnica: ['codigo', 'nome', 'descricao', 'tipo'],
        habilidade: ['codigo', 'nome', 'descricao', 'execucao', 'efeito'],
        variacao: ['nome', 'descricao'],
      },
    };
  }

  async exportarTecnicasJson(query: ExportarTecnicasJsonDto): Promise<RegistroJson> {
    try {
      const incluirIds = query.incluirIds !== false;
      let tecnicas: TecnicaDetalhadaPayload[] = [];

      if (query.id) {
        const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { id: query.id },
          include: tecnicaDetalhadaInclude,
        });
        if (!tecnica) {
          throw new TecnicaNaoEncontradaException(query.id);
        }
        tecnicas = [tecnica];
      } else if (query.codigo) {
        const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { codigo: query.codigo },
          include: tecnicaDetalhadaInclude,
        });
        if (!tecnica) {
          throw new TecnicaNaoEncontradaException(query.codigo);
        }
        tecnicas = [tecnica];
      } else {
        const where: Prisma.TecnicaAmaldicoadaWhereInput = {};

        if (query.nome) where.nome = { contains: query.nome };
        if (query.tipo) where.tipo = query.tipo;
        if (query.hereditaria !== undefined) where.hereditaria = query.hereditaria;
        if (query.fonte) where.fonte = query.fonte;
        if (query.suplementoId) where.suplementoId = query.suplementoId;
        if (query.claId || query.claNome) {
          where.clas = {
            some: query.claId
              ? { claId: query.claId }
              : { cla: { nome: query.claNome } },
          };
        }

        tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
          where,
          include: tecnicaDetalhadaInclude,
          orderBy: { nome: 'asc' },
        });
      }

      return {
        schema: TECNICAS_JSON_SCHEMA,
        schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
        exportadoEm: new Date().toISOString(),
        totalTecnicas: tecnicas.length,
        tecnicas: tecnicas.map((tecnica) =>
          this.mapTecnicaExportJson(tecnica, incluirIds),
        ),
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async importarTecnicasJson(
    dto: ImportarTecnicasJsonDto,
  ): Promise<ImportacaoTecnicasResumo> {
    try {
      const tecnicas = Array.isArray(dto.tecnicas)
        ? dto.tecnicas.map((item, index) => this.parseTecnicaImport(item, index))
        : [];

      if (tecnicas.length === 0) {
        throw new BadRequestException({
          code: 'JSON_IMPORT_VAZIO',
          message: 'Arquivo sem tecnicas para importar.',
        });
      }

      const resumo: ImportacaoTecnicasResumo = {
        schema: TECNICAS_JSON_SCHEMA,
        schemaVersion: TECNICAS_JSON_SCHEMA_VERSION,
        modo: 'UPSERT',
        totalRecebido: tecnicas.length,
        tecnicas: { criadas: 0, atualizadas: 0 },
        habilidades: { criadas: 0, atualizadas: 0, removidas: 0 },
        variacoes: { criadas: 0, atualizadas: 0, removidas: 0 },
        avisos: [],
      };

      for (const tecnicaImport of tecnicas) {
        const tecnicaExistente = await this.prisma.tecnicaAmaldicoada.findUnique({
          where: { codigo: tecnicaImport.codigo },
          select: { id: true },
        });

        let tecnicaId = tecnicaExistente?.id;
        if (tecnicaExistente) {
          await this.updateTecnica(tecnicaExistente.id, {
            nome: tecnicaImport.nome,
            descricao: tecnicaImport.descricao,
            tipo: tecnicaImport.tipo,
            hereditaria: tecnicaImport.hereditaria,
            clasHereditarios: tecnicaImport.clasHereditarios,
            linkExterno: tecnicaImport.linkExterno,
            fonte: tecnicaImport.fonte,
            suplementoId: tecnicaImport.suplementoId,
            requisitos: tecnicaImport.requisitos,
          });
          resumo.tecnicas.atualizadas += 1;
        } else {
          const created = await this.createTecnica({
            codigo: tecnicaImport.codigo,
            nome: tecnicaImport.nome,
            descricao: tecnicaImport.descricao,
            tipo: tecnicaImport.tipo,
            hereditaria: tecnicaImport.hereditaria ?? false,
            clasHereditarios: tecnicaImport.clasHereditarios,
            linkExterno: tecnicaImport.linkExterno,
            fonte: tecnicaImport.fonte,
            suplementoId: tecnicaImport.suplementoId,
            requisitos: tecnicaImport.requisitos,
          });
          tecnicaId = created.id;
          resumo.tecnicas.criadas += 1;
        }

        if (!tecnicaId) {
          throw new BadRequestException({
            code: 'JSON_IMPORT_TECNICA_INVALIDA',
            message: `Nao foi possivel resolver tecnica ${tecnicaImport.codigo}.`,
          });
        }

        const habilidadeIdsImportadas = new Set<number>();
        for (const habilidadeImport of tecnicaImport.habilidades) {
          const habilidadeExistente = await this.prisma.habilidadeTecnica.findUnique({
            where: { codigo: habilidadeImport.codigo },
            select: { id: true, tecnicaId: true },
          });

          let habilidadeId = habilidadeExistente?.id;
          if (habilidadeExistente) {
            if (habilidadeExistente.tecnicaId !== tecnicaId) {
              throw new BadRequestException({
                code: 'JSON_IMPORT_HABILIDADE_OUTRA_TECNICA',
                message: `Habilidade ${habilidadeImport.codigo} ja pertence a outra tecnica.`,
              });
            }

            await this.updateHabilidade(habilidadeExistente.id, {
              nome: habilidadeImport.nome,
              descricao: habilidadeImport.descricao,
              requisitos: habilidadeImport.requisitos,
              execucao: habilidadeImport.execucao,
              area: habilidadeImport.area,
              alcance: habilidadeImport.alcance,
              alvo: habilidadeImport.alvo,
              duracao: habilidadeImport.duracao,
              resistencia: habilidadeImport.resistencia,
              dtResistencia: habilidadeImport.dtResistencia,
              custoPE: habilidadeImport.custoPE,
              custoEA: habilidadeImport.custoEA,
              custoSustentacaoEA: habilidadeImport.custoSustentacaoEA,
              custoSustentacaoPE: habilidadeImport.custoSustentacaoPE,
              testesExigidos: habilidadeImport.testesExigidos,
              criticoValor: habilidadeImport.criticoValor,
              criticoMultiplicador: habilidadeImport.criticoMultiplicador,
              danoFlat: habilidadeImport.danoFlat,
              danoFlatTipo: habilidadeImport.danoFlatTipo,
              dadosDano: habilidadeImport.dadosDano,
              escalonaPorGrau: habilidadeImport.escalonaPorGrau,
              grauTipoGrauCodigo: habilidadeImport.grauTipoGrauCodigo,
              escalonamentoCustoEA: habilidadeImport.escalonamentoCustoEA,
              escalonamentoCustoPE: habilidadeImport.escalonamentoCustoPE,
              escalonamentoTipo: habilidadeImport.escalonamentoTipo,
              escalonamentoEfeito: habilidadeImport.escalonamentoEfeito,
              escalonamentoDano: habilidadeImport.escalonamentoDano,
              efeito: habilidadeImport.efeito,
              ordem: habilidadeImport.ordem,
            });
            resumo.habilidades.atualizadas += 1;
          } else {
            const created = await this.createHabilidade({
              tecnicaId,
              codigo: habilidadeImport.codigo,
              nome: habilidadeImport.nome,
              descricao: habilidadeImport.descricao,
              requisitos: habilidadeImport.requisitos,
              execucao: habilidadeImport.execucao,
              area: habilidadeImport.area,
              alcance: habilidadeImport.alcance,
              alvo: habilidadeImport.alvo,
              duracao: habilidadeImport.duracao,
              resistencia: habilidadeImport.resistencia,
              dtResistencia: habilidadeImport.dtResistencia,
              custoPE: habilidadeImport.custoPE,
              custoEA: habilidadeImport.custoEA,
              custoSustentacaoEA: habilidadeImport.custoSustentacaoEA,
              custoSustentacaoPE: habilidadeImport.custoSustentacaoPE,
              testesExigidos: habilidadeImport.testesExigidos,
              criticoValor: habilidadeImport.criticoValor,
              criticoMultiplicador: habilidadeImport.criticoMultiplicador,
              danoFlat: habilidadeImport.danoFlat,
              danoFlatTipo: habilidadeImport.danoFlatTipo,
              dadosDano: habilidadeImport.dadosDano,
              escalonaPorGrau: habilidadeImport.escalonaPorGrau,
              grauTipoGrauCodigo: habilidadeImport.grauTipoGrauCodigo,
              escalonamentoCustoEA: habilidadeImport.escalonamentoCustoEA,
              escalonamentoCustoPE: habilidadeImport.escalonamentoCustoPE,
              escalonamentoTipo: habilidadeImport.escalonamentoTipo,
              escalonamentoEfeito: habilidadeImport.escalonamentoEfeito,
              escalonamentoDano: habilidadeImport.escalonamentoDano,
              efeito: habilidadeImport.efeito,
              ordem: habilidadeImport.ordem,
            });
            habilidadeId = created.id;
            resumo.habilidades.criadas += 1;
          }

          if (!habilidadeId) {
            throw new BadRequestException({
              code: 'JSON_IMPORT_HABILIDADE_INVALIDA',
              message: `Nao foi possivel resolver habilidade ${habilidadeImport.codigo}.`,
            });
          }

          habilidadeIdsImportadas.add(habilidadeId);

          const variacoesAtuais = await this.prisma.variacaoHabilidade.findMany({
            where: { habilidadeTecnicaId: habilidadeId },
            select: { id: true, nome: true },
          });

          const variacaoIdsImportadas = new Set<number>();
          for (const variacaoImport of habilidadeImport.variacoes) {
            let variacaoId: number | undefined = variacaoImport.id;

            if (variacaoId) {
              const variacaoPorId = variacoesAtuais.find(
                (variacao) => variacao.id === variacaoId,
              );
              if (!variacaoPorId) {
                resumo.avisos.push(
                  `Variacao id=${variacaoId} nao encontrada em ${habilidadeImport.codigo}; usando match por nome.`,
                );
                variacaoId = undefined;
              }
            }

            if (!variacaoId) {
              variacaoId = variacoesAtuais.find(
                (variacao) => variacao.nome === variacaoImport.nome,
              )?.id;
            }

            if (variacaoId) {
              await this.updateVariacao(variacaoId, {
                nome: variacaoImport.nome,
                descricao: variacaoImport.descricao,
                substituiCustos: variacaoImport.substituiCustos,
                custoPE: variacaoImport.custoPE,
                custoEA: variacaoImport.custoEA,
                custoSustentacaoEA: variacaoImport.custoSustentacaoEA,
                custoSustentacaoPE: variacaoImport.custoSustentacaoPE,
                execucao: variacaoImport.execucao,
                area: variacaoImport.area,
                alcance: variacaoImport.alcance,
                alvo: variacaoImport.alvo,
                duracao: variacaoImport.duracao,
                resistencia: variacaoImport.resistencia,
                dtResistencia: variacaoImport.dtResistencia,
                criticoValor: variacaoImport.criticoValor,
                criticoMultiplicador: variacaoImport.criticoMultiplicador,
                danoFlat: variacaoImport.danoFlat,
                danoFlatTipo: variacaoImport.danoFlatTipo,
                dadosDano: variacaoImport.dadosDano,
                escalonaPorGrau: variacaoImport.escalonaPorGrau,
                escalonamentoCustoEA: variacaoImport.escalonamentoCustoEA,
                escalonamentoCustoPE: variacaoImport.escalonamentoCustoPE,
                escalonamentoTipo: variacaoImport.escalonamentoTipo,
                escalonamentoEfeito: variacaoImport.escalonamentoEfeito,
                escalonamentoDano: variacaoImport.escalonamentoDano,
                efeitoAdicional: variacaoImport.efeitoAdicional,
                requisitos: variacaoImport.requisitos,
                ordem: variacaoImport.ordem,
              });
              variacaoIdsImportadas.add(variacaoId);
              resumo.variacoes.atualizadas += 1;
            } else {
              const created = await this.createVariacao({
                habilidadeTecnicaId: habilidadeId,
                nome: variacaoImport.nome,
                descricao: variacaoImport.descricao,
                substituiCustos: variacaoImport.substituiCustos,
                custoPE: variacaoImport.custoPE,
                custoEA: variacaoImport.custoEA,
                custoSustentacaoEA: variacaoImport.custoSustentacaoEA,
                custoSustentacaoPE: variacaoImport.custoSustentacaoPE,
                execucao: variacaoImport.execucao,
                area: variacaoImport.area,
                alcance: variacaoImport.alcance,
                alvo: variacaoImport.alvo,
                duracao: variacaoImport.duracao,
                resistencia: variacaoImport.resistencia,
                dtResistencia: variacaoImport.dtResistencia,
                criticoValor: variacaoImport.criticoValor,
                criticoMultiplicador: variacaoImport.criticoMultiplicador,
                danoFlat: variacaoImport.danoFlat,
                danoFlatTipo: variacaoImport.danoFlatTipo,
                dadosDano: variacaoImport.dadosDano,
                escalonaPorGrau: variacaoImport.escalonaPorGrau,
                escalonamentoCustoEA: variacaoImport.escalonamentoCustoEA,
                escalonamentoCustoPE: variacaoImport.escalonamentoCustoPE,
                escalonamentoTipo: variacaoImport.escalonamentoTipo,
                escalonamentoEfeito: variacaoImport.escalonamentoEfeito,
                escalonamentoDano: variacaoImport.escalonamentoDano,
                efeitoAdicional: variacaoImport.efeitoAdicional,
                requisitos: variacaoImport.requisitos,
                ordem: variacaoImport.ordem,
              });
              variacaoIdsImportadas.add(created.id);
              resumo.variacoes.criadas += 1;
            }
          }

          if (dto.substituirVariacoesAusentes) {
            for (const variacaoAtual of variacoesAtuais) {
              if (!variacaoIdsImportadas.has(variacaoAtual.id)) {
                await this.removeVariacao(variacaoAtual.id);
                resumo.variacoes.removidas += 1;
              }
            }
          }
        }

        if (dto.substituirHabilidadesAusentes) {
          const habilidadesAtuais = await this.prisma.habilidadeTecnica.findMany({
            where: { tecnicaId },
            select: { id: true },
          });

          for (const habilidadeAtual of habilidadesAtuais) {
            if (!habilidadeIdsImportadas.has(habilidadeAtual.id)) {
              await this.removeHabilidade(habilidadeAtual.id);
              resumo.habilidades.removidas += 1;
            }
          }
        }
      }

      return resumo;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 📚 TÉCNICAS AMALDIÇOADAS - CRUD
  // ==========================================

  /**
   * Buscar todas as técnicas com filtros opcionais
   */
  async findAllTecnicas(
    filtros: FiltrarTecnicasDto,
  ): Promise<TecnicaDetalhadaDto[]> {
    try {
      const where: Prisma.TecnicaAmaldicoadaWhereInput = {};

      if (filtros.nome) {
        // ✅ MySQL já é case-insensitive por padrão - sem 'mode'
        where.nome = { contains: filtros.nome };
      }

      if (filtros.codigo) {
        where.codigo = filtros.codigo;
      }

      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }

      if (filtros.hereditaria !== undefined) {
        where.hereditaria = filtros.hereditaria;
      }

      // ✅ CORRIGIDO: origem → fonte
      if (filtros.fonte) {
        where.fonte = filtros.fonte;
      }

      // ✅ NOVO: Filtro por suplemento
      if (filtros.suplementoId) {
        where.suplementoId = filtros.suplementoId;
      }

      // Filtro por clã
      if (filtros.claId || filtros.claNome) {
        where.clas = {
          some: filtros.claId
            ? { claId: filtros.claId }
            : { cla: { nome: filtros.claNome } },
        };
      }

      const incluirClas = filtros.incluirClas !== false;
      const incluirHabilidades = filtros.incluirHabilidades === true;

      const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
        where,
        include: tecnicaDetalhadaInclude,
        orderBy: { nome: 'asc' },
      });

      return tecnicas.map((tecnica) =>
        this.mapTecnicaToDto(tecnica, {
          incluirClas,
          incluirHabilidades,
        }),
      );
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnica por ID
   */
  async findOneTecnica(id: number): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
        include: tecnicaDetalhadaInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      return this.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnica por código
   */
  async findTecnicaByCodigo(codigo: string): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { codigo },
        include: tecnicaDetalhadaInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(codigo);
      }

      return this.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova técnica
   */
  async createTecnica(dto: CreateTecnicaDto): Promise<TecnicaDetalhadaDto> {
    try {
      // Validações
      const existe = await this.prisma.tecnicaAmaldicoada.findFirst({
        where: {
          OR: [{ codigo: dto.codigo }, { nome: dto.nome }],
        },
      });

      if (existe) {
        throw new TecnicaCodigoOuNomeDuplicadoException(dto.codigo, dto.nome);
      }

      // Validar hereditária
      if (dto.hereditaria && dto.tipo !== TipoTecnicaAmaldicoada.INATA) {
        throw new TecnicaNaoInataHereditariaException(dto.tipo);
      }

      if (
        dto.hereditaria &&
        (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
      ) {
        throw new TecnicaHereditariaSemClaException();
      }

      const suplementoIdFinal = dto.suplementoId ?? null;
      const fonteFinal =
        dto.fonte ??
        (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Criar técnica
      const tecnica = await this.prisma.tecnicaAmaldicoada.create({
        data: {
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria ?? false,
          linkExterno: dto.linkExterno ?? null,

          // ✅ CORRIGIDO: origem → fonte
          fonte: fonteFinal,
          suplementoId: suplementoIdFinal,

          requisitos: this.normalizarJsonOuNull(dto.requisitos),
        },
      });

      // Vincular clãs (se hereditária)
      if (
        dto.hereditaria &&
        dto.clasHereditarios &&
        dto.clasHereditarios.length > 0
      ) {
        await this.vincularClas(tecnica.id, dto.clasHereditarios);
      }

      return this.findOneTecnica(tecnica.id);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar técnica
   */
  async updateTecnica(
    id: number,
    dto: UpdateTecnicaDto,
  ): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      if (dto.nome) {
        const tecnicaComMesmoNome =
          await this.prisma.tecnicaAmaldicoada.findFirst({
            where: {
              nome: dto.nome,
              NOT: { id },
            },
          });

        if (tecnicaComMesmoNome) {
          throw new TecnicaCodigoOuNomeDuplicadoException(
            tecnica.codigo,
            dto.nome,
          );
        }
      }

      // Determinar tipo final (atual ou atualizado)
      const tipoFinal = dto.tipo ?? tecnica.tipo;
      const hereditariaFinal = dto.hereditaria ?? tecnica.hereditaria;

      // Validar hereditária com tipo final
      if (hereditariaFinal && tipoFinal === TipoTecnicaAmaldicoada.NAO_INATA) {
        throw new TecnicaNaoInataHereditariaException(tipoFinal);
      }

      const suplementoIdFinal =
        dto.suplementoId !== undefined
          ? dto.suplementoId
          : tecnica.suplementoId;
      const fonteFinal =
        dto.fonte ?? (suplementoIdFinal ? TipoFonte.SUPLEMENTO : tecnica.fonte);
      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Atualiza vínculos com clãs quando:
      // - lista de clãs foi explicitamente enviada
      // - técnica foi marcada como não hereditária
      const shouldUpdateClas =
        dto.clasHereditarios !== undefined || dto.hereditaria === false;

      if (dto.hereditaria === true && dto.clasHereditarios === undefined) {
        const totalClasVinculados = await this.prisma.tecnicaCla.count({
          where: { tecnicaId: id },
        });

        if (totalClasVinculados === 0) {
          throw new TecnicaHereditariaSemClaException(id);
        }
      }

      if (shouldUpdateClas) {
        // Validar se técnica hereditária tem clãs
        if (
          hereditariaFinal &&
          (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
        ) {
          throw new TecnicaHereditariaSemClaException(id);
        }

        // Atualizar vínculos com clãs
        await this.prisma.tecnicaCla.deleteMany({ where: { tecnicaId: id } });

        if (
          hereditariaFinal &&
          dto.clasHereditarios &&
          dto.clasHereditarios.length > 0
        ) {
          await this.vincularClas(id, dto.clasHereditarios);
        }
      }

      // Atualizar técnica
      await this.prisma.tecnicaAmaldicoada.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria,
          linkExterno: dto.linkExterno,

          // ✅ CORRIGIDO: origem → fonte
          fonte: fonteFinal,
          ...(dto.suplementoId !== undefined && {
            suplementoId: dto.suplementoId,
          }),

          requisitos: this.normalizarJsonOpcional(dto.requisitos),
        },
      });

      return this.findOneTecnica(id);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar técnica
   */
  async removeTecnica(id: number): Promise<void> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
        include: tecnicaUsoInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      // Verificar se está em uso
      const detalhesUso = {
        personagensBaseComInata: tecnica._count.personagensBaseComInata,
        personagensCampanhaComInata: tecnica._count.personagensCampanhaComInata,
        personagensBaseAprendeu: tecnica._count.personagensBaseAprendeu,
        personagensCampanhaAprendeu: tecnica._count.personagensCampanhaAprendeu,
      };

      const totalUso = Object.values(detalhesUso).reduce(
        (acc, val) => acc + val,
        0,
      );

      if (totalUso > 0) {
        throw new TecnicaEmUsoException(id, totalUso, detalhesUso);
      }

      await this.prisma.tecnicaAmaldicoada.delete({ where: { id } });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnicas de um clã específico
   */
  async findTecnicasByCla(claId: number): Promise<TecnicaDetalhadaDto[]> {
    try {
      const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
        where: {
          hereditaria: true,
          clas: {
            some: { claId },
          },
        },
        include: tecnicaDetalhadaInclude,
        orderBy: { nome: 'asc' },
      });

      return tecnicas.map((tecnica) => this.mapTecnicaToDto(tecnica));
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🎯 HABILIDADES DE TÉCNICA - CRUD
  // ==========================================

  /**
   * Buscar todas as habilidades de uma técnica
   */
  async findAllHabilidades(tecnicaId: number) {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id: tecnicaId },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(tecnicaId);
      }

      return this.prisma.habilidadeTecnica.findMany({
        where: { tecnicaId },
        include: {
          variacoes: {
            orderBy: { ordem: 'asc' },
          },
        },
        orderBy: { ordem: 'asc' },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar habilidade por ID
   */
  async findOneHabilidade(id: number) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
        include: {
          tecnica: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
          variacoes: {
            orderBy: { ordem: 'asc' },
          },
        },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      return habilidade;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova habilidade
   */
  async createHabilidade(dto: CreateHabilidadeTecnicaDto) {
    try {
      // Verificar se a técnica existe
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id: dto.tecnicaId },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(dto.tecnicaId);
      }

      // Verificar se já existe habilidade com o mesmo código
      const existe = await this.prisma.habilidadeTecnica.findUnique({
        where: { codigo: dto.codigo },
      });

      if (existe) {
        throw new HabilidadeCodigoDuplicadoException(dto.codigo);
      }

      return this.prisma.habilidadeTecnica.create({
        data: {
          tecnicaId: dto.tecnicaId,
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao,
          requisitos: this.normalizarJsonOuNull(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area ?? null,
          alcance: dto.alcance ?? null,
          alvo: dto.alvo ?? null,
          duracao: dto.duracao ?? null,
          resistencia: dto.resistencia ?? null,
          dtResistencia: dto.dtResistencia ?? null,
          custoPE: dto.custoPE ?? 0,
          custoEA: dto.custoEA ?? 0,
          custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
          custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
          testesExigidos: this.normalizarJsonOuNull(dto.testesExigidos),
          criticoValor: dto.criticoValor ?? null,
          criticoMultiplicador: dto.criticoMultiplicador ?? null,
          danoFlat: dto.danoFlat ?? null,
          danoFlatTipo: dto.danoFlatTipo ?? null,
          dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? false,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
          escalonamentoCustoPE: dto.escalonamentoCustoPE ?? 0,
          escalonamentoTipo: dto.escalonamentoTipo ?? 'OUTRO',
          escalonamentoEfeito: this.normalizarJsonOuNull(dto.escalonamentoEfeito),
          escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem ?? 0,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar habilidade
   */
  async updateHabilidade(id: number, dto: UpdateHabilidadeTecnicaDto) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      return this.prisma.habilidadeTecnica.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          requisitos: this.normalizarJsonOpcional(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area,
          alcance: dto.alcance,
          alvo: dto.alvo,
          duracao: dto.duracao,
          resistencia: dto.resistencia,
          dtResistencia: dto.dtResistencia,
          custoPE: dto.custoPE,
          custoEA: dto.custoEA,
          custoSustentacaoEA: dto.custoSustentacaoEA,
          custoSustentacaoPE: dto.custoSustentacaoPE,
          testesExigidos: this.normalizarJsonOpcional(dto.testesExigidos),
          criticoValor: dto.criticoValor,
          criticoMultiplicador: dto.criticoMultiplicador,
          danoFlat: dto.danoFlat,
          danoFlatTipo: dto.danoFlatTipo,
          dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoCustoPE: dto.escalonamentoCustoPE,
          escalonamentoTipo: dto.escalonamentoTipo,
          escalonamentoEfeito: this.normalizarJsonOpcional(dto.escalonamentoEfeito),
          escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar habilidade
   */
  async removeHabilidade(id: number): Promise<void> {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      await this.prisma.habilidadeTecnica.delete({ where: { id } });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🔄 VARIAÇÕES DE HABILIDADE - CRUD
  // ==========================================

  /**
   * Buscar todas as variações de uma habilidade
   */
  async findAllVariacoes(habilidadeTecnicaId: number) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id: habilidadeTecnicaId },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(habilidadeTecnicaId);
      }

      return this.prisma.variacaoHabilidade.findMany({
        where: { habilidadeTecnicaId },
        orderBy: { ordem: 'asc' },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar variação por ID
   */
  async findOneVariacao(id: number) {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
        include: {
          habilidadeTecnica: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              tecnica: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                },
              },
            },
          },
        },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      return variacao;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova variação
   */
  async createVariacao(dto: CreateVariacaoHabilidadeDto) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id: dto.habilidadeTecnicaId },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(
          dto.habilidadeTecnicaId,
        );
      }

      return this.prisma.variacaoHabilidade.create({
        data: {
          habilidadeTecnicaId: dto.habilidadeTecnicaId,
          nome: dto.nome,
          descricao: dto.descricao,
          substituiCustos: dto.substituiCustos ?? false,
          custoPE: dto.custoPE ?? null,
          custoEA: dto.custoEA ?? null,
          custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
          custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
          execucao: dto.execucao ?? null,
          area: dto.area ?? null,
          alcance: dto.alcance ?? null,
          alvo: dto.alvo ?? null,
          duracao: dto.duracao ?? null,
          resistencia: dto.resistencia ?? null,
          dtResistencia: dto.dtResistencia ?? null,
          criticoValor: dto.criticoValor ?? null,
          criticoMultiplicador: dto.criticoMultiplicador ?? null,
          danoFlat: dto.danoFlat ?? null,
          danoFlatTipo: dto.danoFlatTipo ?? null,
          dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
          escalonamentoCustoPE: dto.escalonamentoCustoPE ?? null,
          escalonamentoTipo: dto.escalonamentoTipo ?? null,
          escalonamentoEfeito: this.normalizarJsonOuNull(dto.escalonamentoEfeito),
          escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional ?? null,
          requisitos: this.normalizarJsonOuNull(dto.requisitos),
          ordem: dto.ordem ?? 0,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar variação
   */
  async updateVariacao(id: number, dto: UpdateVariacaoHabilidadeDto) {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      return this.prisma.variacaoHabilidade.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          substituiCustos: dto.substituiCustos,
          custoPE: dto.custoPE,
          custoEA: dto.custoEA,
          custoSustentacaoEA: dto.custoSustentacaoEA,
          custoSustentacaoPE: dto.custoSustentacaoPE,
          execucao: dto.execucao,
          area: dto.area,
          alcance: dto.alcance,
          alvo: dto.alvo,
          duracao: dto.duracao,
          resistencia: dto.resistencia,
          dtResistencia: dto.dtResistencia,
          criticoValor: dto.criticoValor,
          criticoMultiplicador: dto.criticoMultiplicador,
          danoFlat: dto.danoFlat,
          danoFlatTipo: dto.danoFlatTipo,
          dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoCustoPE: dto.escalonamentoCustoPE,
          escalonamentoTipo: dto.escalonamentoTipo,
          escalonamentoEfeito: this.normalizarJsonOpcional(dto.escalonamentoEfeito),
          escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional,
          requisitos: this.normalizarJsonOpcional(dto.requisitos),
          ordem: dto.ordem,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar variação
   */
  async removeVariacao(id: number): Promise<void> {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      await this.prisma.variacaoHabilidade.delete({ where: { id } });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  private async vincularClas(
    tecnicaId: number,
    claNomes: string[],
  ): Promise<void> {
    for (const nome of claNomes) {
      const cla = await this.prisma.cla.findUnique({ where: { nome } });

      if (!cla) {
        throw new TecnicaClaNaoEncontradoException(nome);
      }

      await this.prisma.tecnicaCla.create({
        data: {
          tecnicaId,
          claId: cla.id,
        },
      });
    }
  }

  // ✅ CORRIGIDO: Mapper atualizado
  private mapTecnicaToDto(
    tecnica: TecnicaDetalhadaPayload,
    options?: {
      incluirClas?: boolean;
      incluirHabilidades?: boolean;
    },
  ): TecnicaDetalhadaDto {
    const incluirClas = options?.incluirClas !== false;
    const incluirHabilidades = options?.incluirHabilidades !== false;

    return {
      id: tecnica.id,
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao,
      tipo: tecnica.tipo,
      hereditaria: tecnica.hereditaria,
      linkExterno: tecnica.linkExterno ?? undefined,
      fonte: tecnica.fonte,
      suplementoId: tecnica.suplementoId ?? undefined,
      requisitos: tecnica.requisitos ?? undefined,
      clasHereditarios: incluirClas
        ? tecnica.clas.map((tecnicaCla) => tecnicaCla.cla)
        : [],
      habilidades: incluirHabilidades
        ? (tecnica.habilidades as unknown as TecnicaDetalhadaDto['habilidades'])
        : [],
      criadoEm: tecnica.criadoEm,
      atualizadoEm: tecnica.atualizadoEm,
    };
  }
}
