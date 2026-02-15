// src/modificacoes/modificacoes.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { ModificacaoDetalhadaDto } from './dto/modificacao-detalhada.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
import { TipoFonte, ComplexidadeMaldicao } from '@prisma/client';
import {
  RestricoesModificacao,
  ResultadoValidacaoRestricoes,
} from './types/restricoes.types';

import {
  ModificacaoNaoEncontradaException,
  ModificacaoCodigoDuplicadoException,
  ModificacaoSuplementoNaoEncontradoException, // ✅ SEM ESPAÇO
  ModificacaoFonteInvalidaException,
  ModificacaoEquipamentosInvalidosException,
  ModificacaoEmUsoException,
  ModificacaoEquipamentoNaoEncontradoException,
} from 'src/common/exceptions/modificacao.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class ModificacoesService {
  constructor(private prisma: PrismaService) { }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * CREATE - Criar nova modificação
   */
  async create(createDto: CreateModificacaoDto) {
    try {
      // Verificar se código já existe
      const existenteCodigo = await this.prisma.modificacaoEquipamento.findUnique({
        where: { codigo: createDto.codigo },
      });

      if (existenteCodigo) {
        throw new ModificacaoCodigoDuplicadoException(createDto.codigo);
      }

      // Validar suplemento (se fornecido)
      if (createDto.suplementoId) {
        const suplemento = await this.prisma.suplemento.findUnique({
          where: { id: createDto.suplementoId },
        });

        if (!suplemento) {
          throw new ModificacaoSuplementoNaoEncontradoException(createDto.suplementoId);
        }

        // Se forneceu suplementoId, fonte deve ser SUPLEMENTO
        if (createDto.fonte && createDto.fonte !== TipoFonte.SUPLEMENTO) {
          throw new ModificacaoFonteInvalidaException();
        }
      }

      // Validar equipamentos compatíveis (se fornecidos)
      if (createDto.equipamentosCompatíveisIds?.length) {
        const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
          where: { id: { in: createDto.equipamentosCompatíveisIds } },
          select: { id: true },
        });

        if (
          equipamentosExistentes.length !== createDto.equipamentosCompatíveisIds.length
        ) {
          const idsEncontrados = equipamentosExistentes.map((e) => e.id);
          const idsInvalidos = createDto.equipamentosCompatíveisIds.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new ModificacaoEquipamentosInvalidosException(idsInvalidos);
        }
      }

      // Criar modificação com relações
      const modificacao = await this.prisma.modificacaoEquipamento.create({
        data: {
          codigo: createDto.codigo,
          nome: createDto.nome,
          descricao: createDto.descricao,
          tipo: createDto.tipo,
          incrementoEspacos: createDto.incrementoEspacos,
          restricoes: createDto.restricoes as any,
          efeitosMecanicos: createDto.efeitosMecanicos as any,
          fonte: createDto.fonte ?? TipoFonte.SISTEMA_BASE,
          suplementoId: createDto.suplementoId,

          // ✅ Criar relações com equipamentos compatíveis
          ...(createDto.equipamentosCompatíveisIds?.length && {
            equipamentosApplicaveis: {
              create: createDto.equipamentosCompatíveisIds.map((equipamentoId) => ({
                equipamentoId,
              })),
            },
          }),
        },
        include: {
          equipamentosApplicaveis: {
            include: {
              equipamento: {
                select: { id: true, codigo: true, nome: true, tipo: true },
              },
            },
          },
        },
      });

      return this.mapDetalhado(modificacao);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * UPDATE - Atualizar modificação
   */
  async update(id: number, updateDto: UpdateModificacaoDto) {
    try {
      // Verificar se existe
      await this.buscarPorId(id);

      // Verificar código duplicado (se mudou)
      if (updateDto.codigo) {
        const duplicado = await this.prisma.modificacaoEquipamento.findFirst({
          where: {
            codigo: updateDto.codigo,
            NOT: { id },
          },
        });

        if (duplicado) {
          throw new ModificacaoCodigoDuplicadoException(updateDto.codigo);
        }
      }

      // Validar suplemento (se fornecido)
      if (updateDto.suplementoId) {
        const suplemento = await this.prisma.suplemento.findUnique({
          where: { id: updateDto.suplementoId },
        });

        if (!suplemento) {
          throw new ModificacaoSuplementoNaoEncontradoException(updateDto.suplementoId);
        }
      }

      // Validar equipamentos compatíveis (se fornecidos)
      if (updateDto.equipamentosCompatíveisIds?.length) {
        const equipamentosExistentes = await this.prisma.equipamentoCatalogo.findMany({
          where: { id: { in: updateDto.equipamentosCompatíveisIds } },
          select: { id: true },
        });

        if (
          equipamentosExistentes.length !== updateDto.equipamentosCompatíveisIds.length
        ) {
          const idsEncontrados = equipamentosExistentes.map((e) => e.id);
          const idsInvalidos = updateDto.equipamentosCompatíveisIds.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new ModificacaoEquipamentosInvalidosException(idsInvalidos);
        }
      }

      // Atualizar modificação
      const modificacao = await this.prisma.modificacaoEquipamento.update({
        where: { id },
        data: {
          ...(updateDto.codigo && { codigo: updateDto.codigo }),
          ...(updateDto.nome && { nome: updateDto.nome }),
          ...(updateDto.descricao !== undefined && {
            descricao: updateDto.descricao,
          }),
          ...(updateDto.tipo && { tipo: updateDto.tipo }),
          ...(updateDto.incrementoEspacos !== undefined && {
            incrementoEspacos: updateDto.incrementoEspacos,
          }),
          ...(updateDto.restricoes !== undefined && {
            restricoes: updateDto.restricoes as any,
          }),
          ...(updateDto.efeitosMecanicos !== undefined && {
            efeitosMecanicos: updateDto.efeitosMecanicos as any,
          }),
          ...(updateDto.fonte && { fonte: updateDto.fonte }),
          ...(updateDto.suplementoId !== undefined && {
            suplementoId: updateDto.suplementoId,
          }),

          // ✅ Atualizar equipamentos compatíveis (deletar e recriar)
          ...(updateDto.equipamentosCompatíveisIds !== undefined && {
            equipamentosApplicaveis: {
              deleteMany: {},
              ...(updateDto.equipamentosCompatíveisIds.length > 0 && {
                create: updateDto.equipamentosCompatíveisIds.map((equipamentoId) => ({
                  equipamentoId,
                })),
              }),
            },
          }),
        },
        include: {
          equipamentosApplicaveis: {
            include: {
              equipamento: {
                select: { id: true, codigo: true, nome: true, tipo: true },
              },
            },
          },
        },
      });

      return this.mapDetalhado(modificacao);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * DELETE - Remover modificação
   */
  async remove(id: number) {
    try {
      // Verificar se existe
      await this.buscarPorId(id);

      // Verificar se está sendo usada
      const [usadaEmItensBase, usadaEmItensCampanha] = await Promise.all([
        this.prisma.inventarioItemBaseModificacao.count({
          where: { modificacaoId: id },
        }),
        this.prisma.inventarioItemCampanhaModificacao.count({
          where: { modificacaoId: id },
        }),
      ]);

      const totalUsos = usadaEmItensBase + usadaEmItensCampanha;

      if (totalUsos > 0) {
        throw new ModificacaoEmUsoException(id, totalUsos, {
          itensBase: usadaEmItensBase,
          itensCampanha: usadaEmItensCampanha,
        });
      }

      // Deletar (cascade vai limpar relações de equipamentosApplicaveis)
      await this.prisma.modificacaoEquipamento.delete({
        where: { id },
      });

      return { message: 'Modificação removida com sucesso' };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ========================================
  // ✅ CONSULTAS
  // ========================================

  /**
   * Lista modificações com filtros
   */
  async listar(filtros: FiltrarModificacoesDto) {
    try {
      const { tipo, fontes, suplementoId, busca, pagina = 1, limite = 50 } = filtros;

      const where: any = {};

      if (tipo) where.tipo = tipo;

      // ✅ NOVO: Filtrar por fontes múltiplas
      if (fontes?.length) {
        where.fonte = { in: fontes };
      }

      if (suplementoId) where.suplementoId = suplementoId;

      if (busca) {
        where.OR = [
          { nome: { contains: busca, mode: 'insensitive' } },
          { descricao: { contains: busca, mode: 'insensitive' } },
          { codigo: { contains: busca, mode: 'insensitive' } },
        ];
      }

      const [total, modificacoes] = await Promise.all([
        this.prisma.modificacaoEquipamento.count({ where }),
        this.prisma.modificacaoEquipamento.findMany({
          where,
          skip: (pagina - 1) * limite,
          take: limite,
          orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
          include: {
            suplemento: {
              select: { id: true, codigo: true, nome: true },
            },
            _count: {
              select: {
                equipamentosApplicaveis: true,
                itensBase: true,
                itensCampanha: true,
              },
            },
          },
        }),
      ]);

      return {
        dados: modificacoes.map(this.mapDetalhado),
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Busca modificação por ID
   */
  async buscarPorId(id: number): Promise<ModificacaoDetalhadaDto> {
    try {
      const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
        where: { id },
        include: {
          suplemento: {
            select: { id: true, codigo: true, nome: true },
          },
          equipamentosApplicaveis: {
            include: {
              equipamento: {
                select: { id: true, codigo: true, nome: true, tipo: true },
              },
            },
          },
          _count: {
            select: {
              itensBase: true,
              itensCampanha: true,
            },
          },
        },
      });

      if (!modificacao) {
        throw new ModificacaoNaoEncontradaException(id);
      }

      return this.mapDetalhado(modificacao);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Busca modificações compatíveis com um equipamento
   */
  async buscarCompatíveisComEquipamento(equipamentoId: number) {
    try {
      const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
        where: { id: equipamentoId },
      });

      if (!equipamento) {
        throw new ModificacaoEquipamentoNaoEncontradoException(equipamentoId);
      }

      // Buscar todas as modificações do mesmo tipo base
      const modificacoes = await this.prisma.modificacaoEquipamento.findMany({
        where: {
          // Filtrar por tipo compatível (implementar lógica de compatibilidade)
        },
        include: {
          suplemento: {
            select: { id: true, codigo: true, nome: true },
          },
        },
      });

      // ✅ Validar restrições para cada modificação
      const compatíveis: ModificacaoDetalhadaDto[] = [];

      for (const mod of modificacoes) {
        const validacao = await this.validarRestricoes(equipamento as any, mod);

        if (validacao.valido) {
          compatíveis.push(this.mapDetalhado(mod));
        }
      }

      return compatíveis;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ========================================
  // ✅ VALIDAÇÃO DE RESTRIÇÕES
  // ========================================

  /**
   * Valida se uma modificação pode ser aplicada a um equipamento
   */
  async validarRestricoes(
    equipamento: any,
    modificacao: any,
  ): Promise<ResultadoValidacaoRestricoes> {
    const erros: string[] = [];
    const restricoes = modificacao.restricoes as RestricoesModificacao;

    if (!restricoes) {
      return { valido: true, erros: [] };
    }

    // ✅ 1. Validar tipo de equipamento
    if (restricoes.tiposEquipamento?.length) {
      if (!restricoes.tiposEquipamento.includes(equipamento.tipo)) {
        erros.push(
          `Modificação só aplicável a: ${restricoes.tiposEquipamento.join(', ')}`,
        );
      }
    }

    // ✅ 2. Validar exclusão de escudos
    if (restricoes.excluiEscudos && equipamento.proficienciaProtecao === 'ESCUDO') {
      erros.push('Modificação não aplicável a escudos');
    }

    // ✅ 3. Validar tipo de proteção
    if (restricoes.tiposProtecao?.length && equipamento.tipoProtecao) {
      if (!restricoes.tiposProtecao.includes(equipamento.tipoProtecao)) {
        erros.push(
          `Modificação só aplicável a proteções: ${restricoes.tiposProtecao.join(', ')}`,
        );
      }
    }

    // ✅ 4. Validar tipo de arma
    if (restricoes.tiposArma?.length && equipamento.tipoArma) {
      if (!restricoes.tiposArma.includes(equipamento.tipoArma)) {
        erros.push(
          `Modificação só aplicável a armas: ${restricoes.tiposArma.join(', ')}`,
        );
      }
    }

    // ✅ 5. Validar amaldiçoados
    if (restricoes.apenasAmaldicoados) {
      const complexidade = equipamento.complexidadeMaldicao;
      if (complexidade === ComplexidadeMaldicao.NENHUMA || !complexidade) {
        erros.push('Modificação só aplicável a equipamentos amaldiçoados');
      }
    }

    // ✅ 6. Validar mundanos (não-amaldiçoados)
    if (restricoes.apenasMundanos) {
      const complexidade = equipamento.complexidadeMaldicao;
      if (complexidade && complexidade !== ComplexidadeMaldicao.NENHUMA) {
        erros.push('Modificação só aplicável a equipamentos não-amaldiçoados');
      }
    }

    // ✅ 7. Validar complexidade mínima
    if (restricoes.complexidadeMinima) {
      const hierarquia = {
        NENHUMA: 0,
        SIMPLES: 1,
        COMPLEXA: 2,
      };
      const minima = hierarquia[restricoes.complexidadeMinima] || 0;
      const atual = hierarquia[equipamento.complexidadeMaldicao || 'NENHUMA'] || 0;

      if (atual < minima) {
        erros.push(`Requer complexidade mínima: ${restricoes.complexidadeMinima}`);
      }
    }

    // ✅ 8. Validar categoria mínima
    if (restricoes.categoriaMinima !== undefined) {
      if (equipamento.categoria > restricoes.categoriaMinima) {
        erros.push(`Requer categoria mínima: ${restricoes.categoriaMinima}`);
      }
    }

    // ✅ 9. Validar categoria máxima
    if (restricoes.categoriaMaxima !== undefined) {
      if (equipamento.categoria < restricoes.categoriaMaxima) {
        erros.push(`Requer categoria máxima: ${restricoes.categoriaMaxima}`);
      }
    }

    // ✅ 10. Validar proficiências de arma
    if (restricoes.proficienciasArma?.length && equipamento.proficienciaArma) {
      if (!restricoes.proficienciasArma.includes(equipamento.proficienciaArma)) {
        erros.push(`Requer proficiência: ${restricoes.proficienciasArma.join(', ')}`);
      }
    }

    // ✅ 11. Validar alcances
    if (restricoes.alcancesPermitidos?.length && equipamento.alcance) {
      if (!restricoes.alcancesPermitidos.includes(equipamento.alcance)) {
        erros.push(`Requer alcance: ${restricoes.alcancesPermitidos.join(', ')}`);
      }
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  /**
   * Valida conflitos entre modificações em um item
   */
  async validarConflitosModificacoes(
    modificacaoNova: any,
    modificacoesExistentes: any[],
  ): Promise<ResultadoValidacaoRestricoes> {
    const erros: string[] = [];
    const restricoes = modificacaoNova.restricoes as RestricoesModificacao;

    if (!restricoes) {
      return { valido: true, erros: [] };
    }

    // ✅ Validar códigos incompatíveis
    if (restricoes.codigosIncompativeis?.length) {
      const codigosExistentes = modificacoesExistentes.map((m) => m.codigo);

      for (const codigoIncompativel of restricoes.codigosIncompativeis) {
        if (codigosExistentes.includes(codigoIncompativel)) {
          const incompativel = modificacoesExistentes.find(
            (m) => m.codigo === codigoIncompativel,
          );
          erros.push(
            `Incompatível com modificação: ${incompativel?.nome || codigoIncompativel}`,
          );
        }
      }
    }

    // ✅ Validar códigos requeridos
    if (restricoes.codigosRequeridos?.length) {
      const codigosExistentes = modificacoesExistentes.map((m) => m.codigo);

      for (const codigoRequerido of restricoes.codigosRequeridos) {
        if (!codigosExistentes.includes(codigoRequerido)) {
          erros.push(`Requer modificação: ${codigoRequerido}`);
        }
      }
    }

    // ✅ Validar limite máximo global
    if (restricoes.limiteMaximoGlobal !== undefined) {
      const quantidadeAtual = modificacoesExistentes.filter(
        (m) => m.codigo === modificacaoNova.codigo,
      ).length;

      if (quantidadeAtual >= restricoes.limiteMaximoGlobal) {
        erros.push(
          `Modificação já atingiu o limite máximo de ${restricoes.limiteMaximoGlobal}`,
        );
      }
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  // ========================================
  // ✅ HELPER PRIVADO
  // ========================================

  /**
   * Mapeia para DTO
   */
  private mapDetalhado(modificacao: any): ModificacaoDetalhadaDto {
    return {
      id: modificacao.id,
      codigo: modificacao.codigo,
      nome: modificacao.nome,
      descricao: modificacao.descricao,
      tipo: modificacao.tipo,
      incrementoEspacos: modificacao.incrementoEspacos,
      restricoes: modificacao.restricoes as RestricoesModificacao,
      efeitosMecanicos: modificacao.efeitosMecanicos,
      fonte: modificacao.fonte,
      suplementoId: modificacao.suplementoId,

      // ✅ Opcional: equipamentos compatíveis
      ...(modificacao.equipamentosApplicaveis && {
        equipamentosCompatíveis: modificacao.equipamentosApplicaveis.map((ea: any) => ({
          id: ea.equipamento.id,
          codigo: ea.equipamento.codigo,
          nome: ea.equipamento.nome,
          tipo: ea.equipamento.tipo,
        })),
      }),

      // ✅ Opcional: quantidade de usos
      ...(modificacao._count && {
        quantidadeUsos: {
          itensBase: modificacao._count.itensBase || 0,
          itensCampanha: modificacao._count.itensCampanha || 0,
          total:
            (modificacao._count.itensBase || 0) +
            (modificacao._count.itensCampanha || 0),
        },
      }),
    };
  }
}
