// src/equipamentos/equipamentos.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarEquipamentosDto } from './dto/filtrar-equipamentos.dto';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';
import { EquipamentoDetalhadoDto } from './dto/equipamento-detalhado.dto';
import { EquipamentoResumoDto } from './dto/equipamento-resumo.dto';
import { TipoEquipamento } from '@prisma/client';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  EquipamentoNaoEncontradoException,
  EquipamentoCodigoDuplicadoException,
  EquipamentoEmUsoException,
} from 'src/common/exceptions/equipamento.exception';

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // ✅ MÉTODOS EXISTENTES (MANTIDOS)
  // ========================================

  /**
   * Lista equipamentos com filtros e paginação
   */
  async listar(filtros: FiltrarEquipamentosDto) {
    const {
      tipo,
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

    const where: any = {};

    // Filtros simples
    if (tipo) where.tipo = tipo;
    if (complexidadeMaldicao) where.complexidadeMaldicao = complexidadeMaldicao;
    if (proficienciaArma) where.proficienciaArma = proficienciaArma;
    if (proficienciaProtecao) where.proficienciaProtecao = proficienciaProtecao;
    if (alcance) where.alcance = alcance;
    if (tipoAcessorio) where.tipoAcessorio = tipoAcessorio;
    if (categoria !== undefined) where.categoria = categoria;

    const orConditions: any[] = [];

    // Filtro de amaldiçoados
    if (apenasAmaldicoados) {
      orConditions.push(
        { tipo: TipoEquipamento.ITEM_AMALDICOADO },
        { tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA },
        { complexidadeMaldicao: { not: 'NENHUMA' } },
      );
    }

    // Busca textual
    if (busca) {
      orConditions.push(
        { nome: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
        { codigo: { contains: busca, mode: 'insensitive' } },
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
        select: {
          id: true,
          codigo: true,
          nome: true,
          descricao: true,
          tipo: true,
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
        },
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

  /**
   * Busca equipamento detalhado por ID
   */
  async buscarPorId(id: number): Promise<EquipamentoDetalhadoDto> {
    const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
      include: {
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
      },
    });

    if (!equipamento) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    return this.mapDetalhado(equipamento);
  }

  /**
   * Busca equipamento detalhado por código
   */
  async buscarPorCodigo(codigo: string): Promise<EquipamentoDetalhadoDto> {
    const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
      where: { codigo },
      include: {
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
      },
    });

    if (!equipamento) {
      throw new EquipamentoNaoEncontradoException(codigo);
    }

    return this.mapDetalhado(equipamento);
  }

  // ========================================
  // ✅ CRUD COMPLETO COM RELAÇÕES
  // ========================================

  /**
   * CREATE - Criar equipamento com todas as relações
   */
  async criar(data: CriarEquipamentoDto): Promise<EquipamentoDetalhadoDto> {
    // Validar código único
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { codigo: data.codigo },
    });

    if (existente) {
      throw new EquipamentoCodigoDuplicadoException(data.codigo);
    }

    // Preparar dados base
    const dadosCriacao: any = {
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao || null,
      tipo: data.tipo,
      categoria: data.categoria || 'CATEGORIA_0',
      espacos: data.espacos || 1,
      complexidadeMaldicao: data.complexidadeMaldicao || 'NENHUMA',
      tipoUso: data.tipoUso || null,
      tipoAmaldicoado: data.tipoAmaldicoado || null,
      efeito: data.efeito || null,
      efeitoMaldicao: data.efeitoMaldicao || null, // ✅ CORRIGIDO
      requerFerramentasAmaldicoadas: data.requerFerramentasAmaldicoadas || false, // ✅ CORRIGIDO
    };

    // ✅ Campos de arma
    if (data.tipo === 'ARMA') {
      Object.assign(dadosCriacao, {
        proficienciaArma: data.proficienciaArma || null,
        empunhaduras: data.empunhaduras ? JSON.stringify(data.empunhaduras) : null,
        tipoArma: data.tipoArma || null,
        subtipoDistancia: data.subtipoDistancia || null,
        agil: data.agil || false,
        criticoValor: data.criticoValor || null,
        criticoMultiplicador: data.criticoMultiplicador || null,
        alcance: data.alcance || null,
        tipoMunicaoCodigo: data.tipoMunicaoCodigo || null,
        habilidadeEspecial: data.habilidadeEspecial || null,
      });
    }

    // ✅ Campos de proteção
    if (data.tipo === 'PROTECAO') {
      Object.assign(dadosCriacao, {
        proficienciaProtecao: data.proficienciaProtecao || null,
        tipoProtecao: data.tipoProtecao || null,
        bonusDefesa: data.bonusDefesa || 0,
        penalidadeCarga: data.penalidadeCarga || 0,
      });
    }

    // ✅ Campos de acessório
    if (data.tipo === 'ACESSORIO') {
      Object.assign(dadosCriacao, {
        tipoAcessorio: data.tipoAcessorio || null,
        periciaBonificada: data.periciaBonificada || null,
        bonusPericia: data.bonusPericia || 0,
        requereEmpunhar: data.requereEmpunhar || false,
        maxVestimentas: data.maxVestimentas || 0,
      });
    }

    // ✅ Campos de munição
    if (data.tipo === 'MUNICAO') {
      Object.assign(dadosCriacao, {
        duracaoCenas: data.duracaoCenas || null,
        recuperavel: data.recuperavel || false,
      });
    }

    // ✅ Campos de explosivo
    if (data.tipo === 'EXPLOSIVO') {
      dadosCriacao.tipoExplosivo = data.tipoExplosivo || null;
    }

    // Criar equipamento
    const equipamento = await this.prisma.equipamentoCatalogo.create({
      data: dadosCriacao,
      include: {
        danos: true,
        reducesDano: true,
        armaAmaldicoada: true,
        protecaoAmaldicoada: true,
        artefatoAmaldicoado: true,
        modificacoesAplicaveis: {
          include: {
            modificacao: true,
          },
        },
      },
    });

    return this.mapDetalhado(equipamento);
  }

  /**
   * UPDATE - Atualizar equipamento
   */
  async atualizar(
    id: number,
    data: AtualizarEquipamentoDto,
  ): Promise<EquipamentoDetalhadoDto> {
    // Verificar se existe
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    // Validar código único (se mudou)
    if (data.codigo && data.codigo !== existente.codigo) {
      const codigoExiste = await this.prisma.equipamentoCatalogo.findUnique({
        where: { codigo: data.codigo },
      });

      if (codigoExiste) {
        throw new EquipamentoCodigoDuplicadoException(data.codigo);
      }
    }

    // Preparar dados de atualização
    const dadosAtualizacao: any = {};

    // Campos básicos
    if (data.codigo !== undefined) dadosAtualizacao.codigo = data.codigo;
    if (data.nome !== undefined) dadosAtualizacao.nome = data.nome;
    if (data.descricao !== undefined) dadosAtualizacao.descricao = data.descricao;
    if (data.tipo !== undefined) dadosAtualizacao.tipo = data.tipo;
    if (data.categoria !== undefined) dadosAtualizacao.categoria = data.categoria;
    if (data.espacos !== undefined) dadosAtualizacao.espacos = data.espacos;
    if (data.complexidadeMaldicao !== undefined)
      dadosAtualizacao.complexidadeMaldicao = data.complexidadeMaldicao;
    if (data.tipoUso !== undefined) dadosAtualizacao.tipoUso = data.tipoUso;
    if (data.tipoAmaldicoado !== undefined)
      dadosAtualizacao.tipoAmaldicoado = data.tipoAmaldicoado;
    if (data.efeito !== undefined) dadosAtualizacao.efeito = data.efeito;
    if (data.efeitoMaldicao !== undefined) // ✅ CORRIGIDO
      dadosAtualizacao.efeitoMaldicao = data.efeitoMaldicao;
    if (data.requerFerramentasAmaldicoadas !== undefined) // ✅ CORRIGIDO
      dadosAtualizacao.requerFerramentasAmaldicoadas = data.requerFerramentasAmaldicoadas;

    // Campos de arma
    if (data.proficienciaArma !== undefined)
      dadosAtualizacao.proficienciaArma = data.proficienciaArma;
    if (data.empunhaduras !== undefined)
      dadosAtualizacao.empunhaduras = JSON.stringify(data.empunhaduras);
    if (data.tipoArma !== undefined) dadosAtualizacao.tipoArma = data.tipoArma;
    if (data.subtipoDistancia !== undefined)
      dadosAtualizacao.subtipoDistancia = data.subtipoDistancia;
    if (data.agil !== undefined) dadosAtualizacao.agil = data.agil;
    if (data.criticoValor !== undefined) dadosAtualizacao.criticoValor = data.criticoValor;
    if (data.criticoMultiplicador !== undefined)
      dadosAtualizacao.criticoMultiplicador = data.criticoMultiplicador;
    if (data.alcance !== undefined) dadosAtualizacao.alcance = data.alcance;
    if (data.tipoMunicaoCodigo !== undefined)
      dadosAtualizacao.tipoMunicaoCodigo = data.tipoMunicaoCodigo;
    if (data.habilidadeEspecial !== undefined)
      dadosAtualizacao.habilidadeEspecial = data.habilidadeEspecial;

    // Campos de proteção
    if (data.proficienciaProtecao !== undefined)
      dadosAtualizacao.proficienciaProtecao = data.proficienciaProtecao;
    if (data.tipoProtecao !== undefined) dadosAtualizacao.tipoProtecao = data.tipoProtecao;
    if (data.bonusDefesa !== undefined) dadosAtualizacao.bonusDefesa = data.bonusDefesa;
    if (data.penalidadeCarga !== undefined)
      dadosAtualizacao.penalidadeCarga = data.penalidadeCarga;

    // Campos de acessório
    if (data.tipoAcessorio !== undefined) dadosAtualizacao.tipoAcessorio = data.tipoAcessorio;
    if (data.periciaBonificada !== undefined)
      dadosAtualizacao.periciaBonificada = data.periciaBonificada;
    if (data.bonusPericia !== undefined) dadosAtualizacao.bonusPericia = data.bonusPericia;
    if (data.requereEmpunhar !== undefined)
      dadosAtualizacao.requereEmpunhar = data.requereEmpunhar;
    if (data.maxVestimentas !== undefined)
      dadosAtualizacao.maxVestimentas = data.maxVestimentas;

    // Campos de munição
    if (data.duracaoCenas !== undefined) dadosAtualizacao.duracaoCenas = data.duracaoCenas;
    if (data.recuperavel !== undefined) dadosAtualizacao.recuperavel = data.recuperavel;

    // Campos de explosivo
    if (data.tipoExplosivo !== undefined) dadosAtualizacao.tipoExplosivo = data.tipoExplosivo;

    // Atualizar equipamento
    const equipamento = await this.prisma.equipamentoCatalogo.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        danos: true,
        reducesDano: true,
        armaAmaldicoada: true,
        protecaoAmaldicoada: true,
        artefatoAmaldicoado: true,
        modificacoesAplicaveis: {
          include: {
            modificacao: true,
          },
        },
      },
    });

    return this.mapDetalhado(equipamento);
  }

  /**
   * DELETE - Remover equipamento
   */
  async deletar(id: number): Promise<void> {
    const existente = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new EquipamentoNaoEncontradoException(id);
    }

    // Verificar uso em inventários
    const [emUsoBase, emUsoCampanha] = await Promise.all([
      this.prisma.inventarioItemBase.count({ where: { equipamentoId: id } }),
      this.prisma.inventarioItemCampanha.count({ where: { equipamentoId: id } }),
    ]);

    const totalUsos = emUsoBase + emUsoCampanha;

    if (totalUsos > 0) {
      throw new EquipamentoEmUsoException(id, totalUsos, emUsoBase, emUsoCampanha);
    }

    // Deletar (cascade vai limpar danos, reduções, amaldiçoados)
    await this.prisma.equipamentoCatalogo.delete({
      where: { id },
    });
  }

  // ========================================
  // ✅ HELPERS PRIVADOS
  // ========================================

  private mapResumo(equipamento: any): EquipamentoResumoDto {
    return {
      id: equipamento.id,
      codigo: equipamento.codigo,
      nome: equipamento.nome,
      descricao: equipamento.descricao,
      tipo: equipamento.tipo,
      categoria: equipamento.categoria,
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
      armaAmaldicoada: equipamento.armaAmaldicoada || null,
      protecaoAmaldicoada: equipamento.protecaoAmaldicoada || null,
      artefatoAmaldicoado: equipamento.artefatoAmaldicoado || null,
    };
  }

  private mapDetalhado(equipamento: any): EquipamentoDetalhadoDto {
    let empunhaduras: string[] | null = null;
    if (equipamento.empunhaduras) {
      try {
        empunhaduras = JSON.parse(equipamento.empunhaduras as string);
      } catch {
        empunhaduras = null;
      }
    }

    return {
      id: equipamento.id,
      codigo: equipamento.codigo,
      nome: equipamento.nome,
      descricao: equipamento.descricao,
      tipo: equipamento.tipo,
      categoria: equipamento.categoria,
      espacos: equipamento.espacos,
      complexidadeMaldicao: equipamento.complexidadeMaldicao,
      proficienciaArma: equipamento.proficienciaArma,
      empunhaduras,
      tipoArma: equipamento.tipoArma,
      subtipoDistancia: equipamento.subtipoDistancia,
      agil: equipamento.agil,
      criticoValor: equipamento.criticoValor,
      criticoMultiplicador: equipamento.criticoMultiplicador,
      alcance: equipamento.alcance,
      tipoMunicaoCodigo: equipamento.tipoMunicaoCodigo,
      habilidadeEspecial: equipamento.habilidadeEspecial,
      danos: equipamento.danos?.map((d: any) => ({
        empunhadura: d.empunhadura,
        tipoDano: d.tipoDano,
        rolagem: d.rolagem,
        valorFlat: d.valorFlat,
      })),
      proficienciaProtecao: equipamento.proficienciaProtecao,
      tipoProtecao: equipamento.tipoProtecao,
      bonusDefesa: equipamento.bonusDefesa,
      penalidadeCarga: equipamento.penalidadeCarga,
      reducoesDano: equipamento.reducesDano?.map((r: any) => ({
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
            proficienciaRequerida: equipamento.armaAmaldicoada.proficienciaRequerida,
            efeito: equipamento.armaAmaldicoada.efeito,
          }
        : null,
      protecaoAmaldicoada: equipamento.protecaoAmaldicoada
        ? {
            tipoBase: equipamento.protecaoAmaldicoada.tipoBase,
            bonusDefesa: equipamento.protecaoAmaldicoada.bonusDefesa,
            penalidadeCarga: equipamento.protecaoAmaldicoada.penalidadeCarga,
            proficienciaRequerida: equipamento.protecaoAmaldicoada.proficienciaRequerida,
            efeito: equipamento.protecaoAmaldicoada.efeito,
          }
        : null,
      artefatoAmaldicoado: equipamento.artefatoAmaldicoado
        ? {
            tipoBase: equipamento.artefatoAmaldicoado.tipoBase,
            proficienciaRequerida: equipamento.artefatoAmaldicoado.proficienciaRequerida,
            efeito: equipamento.artefatoAmaldicoado.efeito,
            custoUso: equipamento.artefatoAmaldicoado.custoUso,
            manutencao: equipamento.artefatoAmaldicoado.manutencao,
          }
        : null,
      modificacoesDisponiveis: equipamento.modificacoesAplicaveis?.map((ma: any) => ({
        id: ma.modificacao.id,
        codigo: ma.modificacao.codigo,
        nome: ma.modificacao.nome,
        descricao: ma.modificacao.descricao,
        tipo: ma.modificacao.tipo,
        incrementoEspacos: ma.modificacao.incrementoEspacos,
      })),
    };
  }
}
