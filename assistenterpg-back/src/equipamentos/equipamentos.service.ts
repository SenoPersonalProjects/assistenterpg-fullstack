// src/equipamentos/equipamentos.service.ts - REFATORADO COM EXCECOES CUSTOMIZADAS

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  Prisma,
  TipoEquipamento,
  TipoFonte,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarEquipamentosDto } from './dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';
import { EquipamentoDetalhadoDto } from './dto/equipamento-detalhado.dto';
import { EquipamentoResumoDto } from './dto/equipamento-resumo.dto';

import {
  EquipamentoNaoEncontradoException,
  EquipamentoCodigoDuplicadoException,
  EquipamentoEmUsoException,
} from 'src/common/exceptions/equipamento.exception';
import { SuplementoNaoEncontradoException } from 'src/common/exceptions/suplemento.exception';

const equipamentoResumoSelect =
  Prisma.validator<Prisma.EquipamentoCatalogoSelect>()({
    id: true,
    codigo: true,
    nome: true,
    descricao: true,
    tipo: true,
    fonte: true,
    suplementoId: true,
    categoria: true,
    espacos: true,
    complexidadeMaldicao: true,
    proficienciaArma: true,
    proficienciaProtecao: true,
    alcance: true,
    tipoAcessorio: true,
    tipoArma: true,
    subtipoDistancia: true,
    tipoUso: true,
    tipoAmaldicoado: true,
    efeito: true,
    armaAmaldicoada: {
      select: {
        id: true,
        tipoBase: true,
      },
    },
    protecaoAmaldicoada: {
      select: {
        id: true,
        tipoBase: true,
        bonusDefesa: true,
      },
    },
    artefatoAmaldicoado: {
      select: {
        id: true,
        tipoBase: true,
      },
    },
  });

const equipamentoDetalhadoInclude =
  Prisma.validator<Prisma.EquipamentoCatalogoInclude>()({
    danos: {
      orderBy: { ordem: 'asc' },
    },
    reducesDano: true,
    armaAmaldicoada: true,
    protecaoAmaldicoada: true,
    artefatoAmaldicoado: true,
    modificacoesAplicaveis: {
      include: {
        modificacao: true,
      },
    },
  });

type EquipamentoResumoEntity = Prisma.EquipamentoCatalogoGetPayload<{
  select: typeof equipamentoResumoSelect;
}>;

type EquipamentoDetalhadoEntity = Prisma.EquipamentoCatalogoGetPayload<{
  include: typeof equipamentoDetalhadoInclude;
}>;

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}

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
        throw new SuplementoNaoEncontradoException(suplementoId);
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

  async listar(filtros: FiltrarEquipamentosDto) {
    const {
      tipo,
      fontes,
      suplementoId,
      complexidadeMaldicao,
      proficienciaArma,
      proficienciaProtecao,
      alcance,
      tipoAcessorio,
      categoria,
      apenasAmaldicoados,
      busca,
      pagina = 1,
      limite = 20,
    } = filtros;

    const where: Prisma.EquipamentoCatalogoWhereInput = {};

    if (tipo) where.tipo = tipo;
    if (fontes?.length) where.fonte = { in: fontes };
    if (suplementoId) where.suplementoId = suplementoId;
    if (complexidadeMaldicao) where.complexidadeMaldicao = complexidadeMaldicao;
    if (proficienciaArma) where.proficienciaArma = proficienciaArma;
    if (proficienciaProtecao) where.proficienciaProtecao = proficienciaProtecao;
    if (alcance) where.alcance = alcance;
    if (tipoAcessorio) where.tipoAcessorio = tipoAcessorio;
    if (categoria !== undefined) {
      where.categoria = this.categoriaNumeroParaEnum(categoria);
    }

    const orConditions: Prisma.EquipamentoCatalogoWhereInput[] = [];

    if (apenasAmaldicoados) {
      orConditions.push(
        { tipo: TipoEquipamento.ITEM_AMALDICOADO },
        { tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA },
        { complexidadeMaldicao: { not: ComplexidadeMaldicao.NENHUMA } },
      );
    }

    if (busca) {
      orConditions.push(
        { nome: { contains: busca } },
        { descricao: { contains: busca } },
        { codigo: { contains: busca } },
      );
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const [total, equipamentos] = await Promise.all([
      this.prisma.equipamentoCatalogo.count({ where }),
      this.prisma.equipamentoCatalogo.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
        select: equipamentoResumoSelect,
      }),
    ]);

    return {
      dados: equipamentos.map((eq) => this.mapResumo(eq)),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async buscarPorId(id: number): Promise<EquipamentoDetalhadoDto> {
    const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
      include: equipamentoDetalhadoInclude,
    });

    if (!equipamento) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    return this.mapDetalhado(equipamento);
  }

  async buscarPorCodigo(codigo: string): Promise<EquipamentoDetalhadoDto> {
    const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
      where: { codigo },
      include: equipamentoDetalhadoInclude,
    });

    if (!equipamento) {
      throw new EquipamentoNaoEncontradoException(codigo);
    }

    return this.mapDetalhado(equipamento);
  }

  async criar(data: CriarEquipamentoDto): Promise<EquipamentoDetalhadoDto> {
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { codigo: data.codigo },
    });

    if (existente) {
      throw new EquipamentoCodigoDuplicadoException(data.codigo);
    }

    const suplementoIdFinal = data.suplementoId ?? null;
    const fonteFinal =
      data.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    const dadosCriacao: Prisma.EquipamentoCatalogoUncheckedCreateInput = {
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao ?? null,
      tipo: data.tipo,
      fonte: fonteFinal,
      suplementoId: suplementoIdFinal,
      categoria: data.categoria ?? CategoriaEquipamento.CATEGORIA_0,
      espacos: data.espacos ?? 1,
      complexidadeMaldicao:
        data.complexidadeMaldicao ?? ComplexidadeMaldicao.NENHUMA,
      tipoUso: data.tipoUso ?? null,
      tipoAmaldicoado: data.tipoAmaldicoado ?? null,
      efeito: data.efeito ?? null,
      efeitoMaldicao: data.efeitoMaldicao ?? null,
      requerFerramentasAmaldicoadas:
        data.requerFerramentasAmaldicoadas ?? false,
    };

    if (data.tipo === TipoEquipamento.ARMA) {
      Object.assign(dadosCriacao, {
        proficienciaArma: data.proficienciaArma ?? null,
        empunhaduras: data.empunhaduras
          ? JSON.stringify(data.empunhaduras)
          : null,
        tipoArma: data.tipoArma ?? null,
        subtipoDistancia: data.subtipoDistancia ?? null,
        agil: data.agil ?? false,
        criticoValor: data.criticoValor ?? null,
        criticoMultiplicador: data.criticoMultiplicador ?? null,
        alcance: data.alcance ?? null,
        tipoMunicaoCodigo: data.tipoMunicaoCodigo ?? null,
        habilidadeEspecial: data.habilidadeEspecial ?? null,
      });
    }

    if (data.tipo === TipoEquipamento.PROTECAO) {
      Object.assign(dadosCriacao, {
        proficienciaProtecao: data.proficienciaProtecao ?? null,
        tipoProtecao: data.tipoProtecao ?? null,
        bonusDefesa: data.bonusDefesa ?? 0,
        penalidadeCarga: data.penalidadeCarga ?? 0,
      });
    }

    if (data.tipo === TipoEquipamento.ACESSORIO) {
      Object.assign(dadosCriacao, {
        tipoAcessorio: data.tipoAcessorio ?? null,
        periciaBonificada: data.periciaBonificada ?? null,
        bonusPericia: data.bonusPericia ?? 0,
        requereEmpunhar: data.requereEmpunhar ?? false,
        maxVestimentas: data.maxVestimentas ?? 0,
      });
    }

    if (data.tipo === TipoEquipamento.MUNICAO) {
      Object.assign(dadosCriacao, {
        duracaoCenas: data.duracaoCenas ?? null,
        recuperavel: data.recuperavel ?? false,
      });
    }

    if (data.tipo === TipoEquipamento.EXPLOSIVO) {
      dadosCriacao.tipoExplosivo = data.tipoExplosivo ?? null;
    }

    const equipamento = await this.prisma.equipamentoCatalogo.create({
      data: dadosCriacao,
      include: equipamentoDetalhadoInclude,
    });

    return this.mapDetalhado(equipamento);
  }

  async atualizar(
    id: number,
    data: AtualizarEquipamentoDto,
  ): Promise<EquipamentoDetalhadoDto> {
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    if (data.codigo && data.codigo !== existente.codigo) {
      const codigoExiste = await this.prisma.equipamentoCatalogo.findUnique({
        where: { codigo: data.codigo },
      });

      if (codigoExiste) {
        throw new EquipamentoCodigoDuplicadoException(data.codigo);
      }
    }

    const suplementoIdFinal =
      data.suplementoId !== undefined
        ? data.suplementoId
        : existente.suplementoId;
    const fonteFinal =
      data.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : existente.fonte);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    const dadosAtualizacao: Prisma.EquipamentoCatalogoUncheckedUpdateInput = {};

    if (data.codigo !== undefined) dadosAtualizacao.codigo = data.codigo;
    if (data.nome !== undefined) dadosAtualizacao.nome = data.nome;
    if (data.descricao !== undefined)
      dadosAtualizacao.descricao = data.descricao;
    if (data.tipo !== undefined) dadosAtualizacao.tipo = data.tipo;
    if (fonteFinal !== existente.fonte) dadosAtualizacao.fonte = fonteFinal;
    if (data.suplementoId !== undefined)
      dadosAtualizacao.suplementoId = data.suplementoId;
    if (data.categoria !== undefined)
      dadosAtualizacao.categoria = data.categoria;
    if (data.espacos !== undefined) dadosAtualizacao.espacos = data.espacos;
    if (data.complexidadeMaldicao !== undefined)
      dadosAtualizacao.complexidadeMaldicao = data.complexidadeMaldicao;
    if (data.tipoUso !== undefined) dadosAtualizacao.tipoUso = data.tipoUso;
    if (data.tipoAmaldicoado !== undefined)
      dadosAtualizacao.tipoAmaldicoado = data.tipoAmaldicoado;
    if (data.efeito !== undefined) dadosAtualizacao.efeito = data.efeito;
    if (data.efeitoMaldicao !== undefined)
      dadosAtualizacao.efeitoMaldicao = data.efeitoMaldicao;
    if (data.requerFerramentasAmaldicoadas !== undefined)
      dadosAtualizacao.requerFerramentasAmaldicoadas =
        data.requerFerramentasAmaldicoadas;

    if (data.proficienciaArma !== undefined)
      dadosAtualizacao.proficienciaArma = data.proficienciaArma;
    if (data.empunhaduras !== undefined)
      dadosAtualizacao.empunhaduras = JSON.stringify(data.empunhaduras);
    if (data.tipoArma !== undefined) dadosAtualizacao.tipoArma = data.tipoArma;
    if (data.subtipoDistancia !== undefined)
      dadosAtualizacao.subtipoDistancia = data.subtipoDistancia;
    if (data.agil !== undefined) dadosAtualizacao.agil = data.agil;
    if (data.criticoValor !== undefined)
      dadosAtualizacao.criticoValor = data.criticoValor;
    if (data.criticoMultiplicador !== undefined)
      dadosAtualizacao.criticoMultiplicador = data.criticoMultiplicador;
    if (data.alcance !== undefined) dadosAtualizacao.alcance = data.alcance;
    if (data.tipoMunicaoCodigo !== undefined)
      dadosAtualizacao.tipoMunicaoCodigo = data.tipoMunicaoCodigo;
    if (data.habilidadeEspecial !== undefined)
      dadosAtualizacao.habilidadeEspecial = data.habilidadeEspecial;

    if (data.proficienciaProtecao !== undefined)
      dadosAtualizacao.proficienciaProtecao = data.proficienciaProtecao;
    if (data.tipoProtecao !== undefined)
      dadosAtualizacao.tipoProtecao = data.tipoProtecao;
    if (data.bonusDefesa !== undefined)
      dadosAtualizacao.bonusDefesa = data.bonusDefesa;
    if (data.penalidadeCarga !== undefined)
      dadosAtualizacao.penalidadeCarga = data.penalidadeCarga;

    if (data.tipoAcessorio !== undefined)
      dadosAtualizacao.tipoAcessorio = data.tipoAcessorio;
    if (data.periciaBonificada !== undefined)
      dadosAtualizacao.periciaBonificada = data.periciaBonificada;
    if (data.bonusPericia !== undefined)
      dadosAtualizacao.bonusPericia = data.bonusPericia;
    if (data.requereEmpunhar !== undefined)
      dadosAtualizacao.requereEmpunhar = data.requereEmpunhar;
    if (data.maxVestimentas !== undefined)
      dadosAtualizacao.maxVestimentas = data.maxVestimentas;

    if (data.duracaoCenas !== undefined)
      dadosAtualizacao.duracaoCenas = data.duracaoCenas;
    if (data.recuperavel !== undefined)
      dadosAtualizacao.recuperavel = data.recuperavel;

    if (data.tipoExplosivo !== undefined)
      dadosAtualizacao.tipoExplosivo = data.tipoExplosivo;

    const equipamento = await this.prisma.equipamentoCatalogo.update({
      where: { id },
      data: dadosAtualizacao,
      include: equipamentoDetalhadoInclude,
    });

    return this.mapDetalhado(equipamento);
  }

  async deletar(id: number): Promise<void> {
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    const [emUsoBase, emUsoCampanha] = await Promise.all([
      this.prisma.inventarioItemBase.count({ where: { equipamentoId: id } }),
      this.prisma.inventarioItemCampanha.count({
        where: { equipamentoId: id },
      }),
    ]);

    const totalUsos = emUsoBase + emUsoCampanha;

    if (totalUsos > 0) {
      throw new EquipamentoEmUsoException(
        id,
        totalUsos,
        emUsoBase,
        emUsoCampanha,
      );
    }

    await this.prisma.equipamentoCatalogo.delete({
      where: { id },
    });
  }

  private mapResumo(
    equipamento: EquipamentoResumoEntity,
  ): EquipamentoResumoDto {
    return {
      id: equipamento.id,
      codigo: equipamento.codigo,
      nome: equipamento.nome,
      descricao: equipamento.descricao,
      tipo: equipamento.tipo,
      fonte: equipamento.fonte,
      suplementoId: equipamento.suplementoId,
      categoria: this.categoriaEnumParaNumero(equipamento.categoria),
      espacos: equipamento.espacos,
      complexidadeMaldicao: equipamento.complexidadeMaldicao,
      proficienciaArma: equipamento.proficienciaArma,
      proficienciaProtecao: equipamento.proficienciaProtecao,
      alcance: equipamento.alcance,
      tipoAcessorio: equipamento.tipoAcessorio,
      tipoArma: equipamento.tipoArma,
      subtipoDistancia: equipamento.subtipoDistancia,
      tipoUso: equipamento.tipoUso,
      tipoAmaldicoado: equipamento.tipoAmaldicoado,
      efeito: equipamento.efeito,
      armaAmaldicoada: equipamento.armaAmaldicoada ?? null,
      protecaoAmaldicoada: equipamento.protecaoAmaldicoada ?? null,
      artefatoAmaldicoado: equipamento.artefatoAmaldicoado ?? null,
    };
  }

  private mapDetalhado(
    equipamento: EquipamentoDetalhadoEntity,
  ): EquipamentoDetalhadoDto {
    return {
      id: equipamento.id,
      codigo: equipamento.codigo,
      nome: equipamento.nome,
      descricao: equipamento.descricao,
      tipo: equipamento.tipo,
      fonte: equipamento.fonte,
      suplementoId: equipamento.suplementoId,
      categoria: this.categoriaEnumParaNumero(equipamento.categoria),
      espacos: equipamento.espacos,
      complexidadeMaldicao: equipamento.complexidadeMaldicao,
      proficienciaArma: equipamento.proficienciaArma,
      empunhaduras: this.parseEmpunhaduras(equipamento.empunhaduras),
      tipoArma: equipamento.tipoArma,
      subtipoDistancia: equipamento.subtipoDistancia,
      agil: equipamento.agil,
      criticoValor: equipamento.criticoValor,
      criticoMultiplicador: equipamento.criticoMultiplicador,
      alcance: equipamento.alcance,
      tipoMunicaoCodigo: equipamento.tipoMunicaoCodigo,
      habilidadeEspecial: equipamento.habilidadeEspecial,
      danos: equipamento.danos?.map((d) => ({
        empunhadura: d.empunhadura,
        tipoDano: d.tipoDano,
        rolagem: d.rolagem,
        valorFlat: d.valorFlat,
      })),
      proficienciaProtecao: equipamento.proficienciaProtecao,
      tipoProtecao: equipamento.tipoProtecao,
      bonusDefesa: equipamento.bonusDefesa,
      penalidadeCarga: equipamento.penalidadeCarga,
      reducoesDano: equipamento.reducesDano?.map((r) => ({
        tipoReducao: r.tipoReducao,
        valor: r.valor,
      })),
      duracaoCenas: equipamento.duracaoCenas,
      recuperavel: equipamento.recuperavel,
      tipoAcessorio: equipamento.tipoAcessorio,
      periciaBonificada: equipamento.periciaBonificada,
      bonusPericia: equipamento.bonusPericia,
      requereEmpunhar: equipamento.requereEmpunhar,
      maxVestimentas: equipamento.maxVestimentas,
      tipoExplosivo: equipamento.tipoExplosivo,
      efeito: equipamento.efeito,
      tipoUso: equipamento.tipoUso,
      tipoAmaldicoado: equipamento.tipoAmaldicoado,
      efeitoMaldicao: equipamento.efeitoMaldicao,
      requerFerramentasAmaldicoadas: equipamento.requerFerramentasAmaldicoadas,
      armaAmaldicoada: equipamento.armaAmaldicoada
        ? {
            tipoBase: equipamento.armaAmaldicoada.tipoBase,
            proficienciaRequerida:
              equipamento.armaAmaldicoada.proficienciaRequerida,
            efeito: equipamento.armaAmaldicoada.efeito,
          }
        : null,
      protecaoAmaldicoada: equipamento.protecaoAmaldicoada
        ? {
            tipoBase: equipamento.protecaoAmaldicoada.tipoBase,
            bonusDefesa: equipamento.protecaoAmaldicoada.bonusDefesa,
            penalidadeCarga: equipamento.protecaoAmaldicoada.penalidadeCarga,
            proficienciaRequerida:
              equipamento.protecaoAmaldicoada.proficienciaRequerida,
            efeito: equipamento.protecaoAmaldicoada.efeito,
          }
        : null,
      artefatoAmaldicoado: equipamento.artefatoAmaldicoado
        ? {
            tipoBase: equipamento.artefatoAmaldicoado.tipoBase,
            proficienciaRequerida:
              equipamento.artefatoAmaldicoado.proficienciaRequerida,
            efeito: equipamento.artefatoAmaldicoado.efeito,
            custoUso: equipamento.artefatoAmaldicoado.custoUso,
            manutencao: equipamento.artefatoAmaldicoado.manutencao,
          }
        : null,
      modificacoesDisponiveis: equipamento.modificacoesAplicaveis?.map(
        (ma) => ({
          id: ma.modificacao.id,
          codigo: ma.modificacao.codigo,
          nome: ma.modificacao.nome,
          descricao: ma.modificacao.descricao,
          tipo: ma.modificacao.tipo,
          incrementoEspacos: ma.modificacao.incrementoEspacos,
        }),
      ),
    };
  }

  private parseEmpunhaduras(
    empunhaduras: Prisma.JsonValue | null,
  ): string[] | null {
    if (!empunhaduras) return null;

    if (Array.isArray(empunhaduras)) {
      const strings = empunhaduras.filter(
        (item): item is string => typeof item === 'string',
      );
      return strings.length > 0 ? strings : null;
    }

    if (typeof empunhaduras === 'string') {
      try {
        const parsed = JSON.parse(empunhaduras) as unknown;
        if (!Array.isArray(parsed)) return null;
        const strings = parsed.filter(
          (item): item is string => typeof item === 'string',
        );
        return strings.length > 0 ? strings : null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private categoriaNumeroParaEnum(
    categoria: number,
  ): CategoriaEquipamento | undefined {
    switch (categoria) {
      case 0:
        return CategoriaEquipamento.CATEGORIA_0;
      case 1:
        return CategoriaEquipamento.CATEGORIA_1;
      case 2:
        return CategoriaEquipamento.CATEGORIA_2;
      case 3:
        return CategoriaEquipamento.CATEGORIA_3;
      case 4:
        return CategoriaEquipamento.CATEGORIA_4;
      default:
        return undefined;
    }
  }

  private categoriaEnumParaNumero(categoria: CategoriaEquipamento): number {
    switch (categoria) {
      case CategoriaEquipamento.CATEGORIA_0:
        return 0;
      case CategoriaEquipamento.CATEGORIA_1:
        return 1;
      case CategoriaEquipamento.CATEGORIA_2:
        return 2;
      case CategoriaEquipamento.CATEGORIA_3:
        return 3;
      case CategoriaEquipamento.CATEGORIA_4:
        return 4;
      case CategoriaEquipamento.ESPECIAL:
        return 5;
      default:
        return 0;
    }
  }
}
