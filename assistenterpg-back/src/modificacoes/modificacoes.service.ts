// src/modificacoes/modificacoes.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarModificacoesDto } from './dto/filtrar-modificacoes.dto';
import { ModificacaoDetalhadaDto } from './dto/modificacao-detalhada.dto';
import { CreateModificacaoDto } from './dto/create-modificacao.dto';
import { UpdateModificacaoDto } from './dto/update-modificacao.dto';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  Prisma,
  ProficienciaProtecao,
  TipoFonte,
} from '@prisma/client';
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

const equipamentoCompativelSelect =
  Prisma.validator<Prisma.EquipamentoCatalogoSelect>()({
    id: true,
    codigo: true,
    nome: true,
    tipo: true,
  });

const equipamentoRestricoesSelect =
  Prisma.validator<Prisma.EquipamentoCatalogoSelect>()({
    id: true,
    tipo: true,
    categoria: true,
    complexidadeMaldicao: true,
    proficienciaProtecao: true,
    tipoProtecao: true,
    tipoArma: true,
    proficienciaArma: true,
    alcance: true,
  });

const modificacaoComEquipamentosInclude =
  Prisma.validator<Prisma.ModificacaoEquipamentoInclude>()({
    equipamentosApplicaveis: {
      include: {
        equipamento: {
          select: equipamentoCompativelSelect,
        },
      },
    },
  });

const modificacaoDetalhadaInclude =
  Prisma.validator<Prisma.ModificacaoEquipamentoInclude>()({
    suplemento: {
      select: {
        id: true,
        codigo: true,
        nome: true,
      },
    },
    equipamentosApplicaveis: {
      include: {
        equipamento: {
          select: equipamentoCompativelSelect,
        },
      },
    },
    _count: {
      select: {
        itensBase: true,
        itensCampanha: true,
      },
    },
  });

const complexidadeHierarquia: Record<ComplexidadeMaldicao, number> = {
  NENHUMA: 0,
  SIMPLES: 1,
  COMPLEXA: 2,
};

type EquipamentoCompativelEntity = Prisma.EquipamentoCatalogoGetPayload<{
  select: typeof equipamentoCompativelSelect;
}>;

type EquipamentoRestricoesEntity = Prisma.EquipamentoCatalogoGetPayload<{
  select: typeof equipamentoRestricoesSelect;
}>;

type ModificacaoBaseEntity =
  Prisma.ModificacaoEquipamentoGetPayload<Prisma.ModificacaoEquipamentoDefaultArgs>;

type ModificacaoMapEntity = ModificacaoBaseEntity & {
  equipamentosApplicaveis?: Array<{ equipamento: EquipamentoCompativelEntity }>;
  _count?: {
    itensBase: number;
    itensCampanha: number;
  };
};

type ModificacaoComRestricoesEntity = Pick<
  ModificacaoBaseEntity,
  'codigo' | 'nome' | 'restricoes'
>;

@Injectable()
export class ModificacoesService {
  constructor(private prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private normalizarJsonParaPersistir(
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
  ): Promise<void> {
    if (suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new ModificacaoSuplementoNaoEncontradoException(suplementoId);
      }

      if (fonte !== TipoFonte.SUPLEMENTO) {
        throw new ModificacaoFonteInvalidaException();
      }

      return;
    }

    if (fonte === TipoFonte.SUPLEMENTO) {
      throw new ModificacaoFonteInvalidaException();
    }
  }

  private parseRestricoes(
    value: Prisma.JsonValue | null,
  ): RestricoesModificacao | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as unknown as RestricoesModificacao;
  }

  private categoriaParaNumero(categoria: CategoriaEquipamento): number {
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
        return 0;
      default:
        return 0;
    }
  }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * CREATE - Criar nova modificação
   */
  async create(createDto: CreateModificacaoDto) {
    try {
      // Verificar se código já existe
      const existenteCodigo =
        await this.prisma.modificacaoEquipamento.findUnique({
          where: { codigo: createDto.codigo },
        });

      if (existenteCodigo) {
        throw new ModificacaoCodigoDuplicadoException(createDto.codigo);
      }

      const suplementoIdFinal = createDto.suplementoId ?? null;
      const fonteFinal =
        createDto.fonte ??
        (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Validar equipamentos compatíveis (se fornecidos)
      if (createDto.equipamentosCompatíveisIds?.length) {
        const equipamentosExistentes =
          await this.prisma.equipamentoCatalogo.findMany({
            where: { id: { in: createDto.equipamentosCompatíveisIds } },
            select: { id: true },
          });

        if (
          equipamentosExistentes.length !==
          createDto.equipamentosCompatíveisIds.length
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
          restricoes: this.normalizarJsonParaPersistir(createDto.restricoes),
          efeitosMecanicos: this.normalizarJsonParaPersistir(
            createDto.efeitosMecanicos,
          ),
          fonte: fonteFinal,
          suplementoId: suplementoIdFinal,

          // ✅ Criar relações com equipamentos compatíveis
          ...(createDto.equipamentosCompatíveisIds?.length && {
            equipamentosApplicaveis: {
              create: createDto.equipamentosCompatíveisIds.map(
                (equipamentoId) => ({
                  equipamentoId,
                }),
              ),
            },
          }),
        },
        include: modificacaoComEquipamentosInclude,
      });

      return this.mapDetalhado(modificacao);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * UPDATE - Atualizar modificação
   */
  async update(id: number, updateDto: UpdateModificacaoDto) {
    try {
      // Verificar se existe
      const modificacaoAtual =
        await this.prisma.modificacaoEquipamento.findUnique({
          where: { id },
          select: {
            id: true,
            fonte: true,
            suplementoId: true,
          },
        });

      if (!modificacaoAtual) {
        throw new ModificacaoNaoEncontradaException(id);
      }

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

      const suplementoIdFinal =
        updateDto.suplementoId !== undefined
          ? updateDto.suplementoId
          : modificacaoAtual.suplementoId;
      const fonteFinal =
        updateDto.fonte ??
        (suplementoIdFinal ? TipoFonte.SUPLEMENTO : modificacaoAtual.fonte);

      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Validar equipamentos compatíveis (se fornecidos)
      if (updateDto.equipamentosCompatíveisIds?.length) {
        const equipamentosExistentes =
          await this.prisma.equipamentoCatalogo.findMany({
            where: { id: { in: updateDto.equipamentosCompatíveisIds } },
            select: { id: true },
          });

        if (
          equipamentosExistentes.length !==
          updateDto.equipamentosCompatíveisIds.length
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
            restricoes: this.normalizarJsonParaPersistir(updateDto.restricoes),
          }),
          ...(updateDto.efeitosMecanicos !== undefined && {
            efeitosMecanicos: this.normalizarJsonParaPersistir(
              updateDto.efeitosMecanicos,
            ),
          }),
          ...(fonteFinal !== modificacaoAtual.fonte && { fonte: fonteFinal }),
          ...(updateDto.suplementoId !== undefined && {
            suplementoId: updateDto.suplementoId,
          }),

          // ✅ Atualizar equipamentos compatíveis (deletar e recriar)
          ...(updateDto.equipamentosCompatíveisIds !== undefined && {
            equipamentosApplicaveis: {
              deleteMany: {},
              ...(updateDto.equipamentosCompatíveisIds.length > 0 && {
                create: updateDto.equipamentosCompatíveisIds.map(
                  (equipamentoId) => ({
                    equipamentoId,
                  }),
                ),
              }),
            },
          }),
        },
        include: modificacaoComEquipamentosInclude,
      });

      return this.mapDetalhado(modificacao);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
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
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
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
      const {
        tipo,
        fontes,
        suplementoId,
        busca,
        pagina = 1,
        limite = 50,
      } = filtros;

      const where: Prisma.ModificacaoEquipamentoWhereInput = {};

      if (tipo) where.tipo = tipo;

      // ✅ NOVO: Filtrar por fontes múltiplas
      if (fontes?.length) {
        where.fonte = { in: fontes };
      }

      if (suplementoId) where.suplementoId = suplementoId;

      if (busca) {
        where.OR = [
          { nome: { contains: busca } },
          { descricao: { contains: busca } },
          { codigo: { contains: busca } },
        ];
      }

      const [total, modificacoes] = await Promise.all([
        this.prisma.modificacaoEquipamento.count({ where }),
        this.prisma.modificacaoEquipamento.findMany({
          where,
          skip: (pagina - 1) * limite,
          take: limite,
          orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
          include: modificacaoDetalhadaInclude,
        }),
      ]);

      return {
        dados: modificacoes.map((modificacao) =>
          this.mapDetalhado(modificacao),
        ),
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
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
        include: modificacaoDetalhadaInclude,
      });

      if (!modificacao) {
        throw new ModificacaoNaoEncontradaException(id);
      }

      return this.mapDetalhado(modificacao);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
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
        select: equipamentoRestricoesSelect,
      });

      if (!equipamento) {
        throw new ModificacaoEquipamentoNaoEncontradoException(equipamentoId);
      }

      // Buscar todas as modificações do mesmo tipo base
      const modificacoes = await this.prisma.modificacaoEquipamento.findMany({
        where: {
          OR: [
            {
              equipamentosApplicaveis: {
                some: { equipamentoId },
              },
            },
            {
              equipamentosApplicaveis: {
                none: {},
              },
            },
          ],
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
        const validacao = this.validarRestricoes(equipamento, mod);

        if (validacao.valido) {
          compatíveis.push(this.mapDetalhado(mod));
        }
      }

      return compatíveis;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ========================================
  // ✅ VALIDAÇÃO DE RESTRIÇÕES
  // ========================================

  /**
   * Valida se uma modificação pode ser aplicada a um equipamento
   */
  validarRestricoes(
    equipamento: EquipamentoRestricoesEntity,
    modificacao: ModificacaoComRestricoesEntity,
  ): ResultadoValidacaoRestricoes {
    const erros: string[] = [];
    const restricoes = this.parseRestricoes(modificacao.restricoes);

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
    if (
      restricoes.excluiEscudos &&
      equipamento.proficienciaProtecao === ProficienciaProtecao.ESCUDO
    ) {
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
      const minima = complexidadeHierarquia[restricoes.complexidadeMinima];
      const atual = complexidadeHierarquia[equipamento.complexidadeMaldicao];

      if (atual < minima) {
        erros.push(
          `Requer complexidade mínima: ${restricoes.complexidadeMinima}`,
        );
      }
    }

    // ✅ 8. Validar categoria mínima
    if (restricoes.categoriaMinima !== undefined) {
      const categoriaEquipamento = this.categoriaParaNumero(
        equipamento.categoria,
      );
      if (categoriaEquipamento > restricoes.categoriaMinima) {
        erros.push(`Requer categoria mínima: ${restricoes.categoriaMinima}`);
      }
    }

    // ✅ 9. Validar categoria máxima
    if (restricoes.categoriaMaxima !== undefined) {
      const categoriaEquipamento = this.categoriaParaNumero(
        equipamento.categoria,
      );
      if (categoriaEquipamento < restricoes.categoriaMaxima) {
        erros.push(`Requer categoria máxima: ${restricoes.categoriaMaxima}`);
      }
    }

    // ✅ 10. Validar proficiências de arma
    if (restricoes.proficienciasArma?.length && equipamento.proficienciaArma) {
      if (
        !restricoes.proficienciasArma.includes(equipamento.proficienciaArma)
      ) {
        erros.push(
          `Requer proficiência: ${restricoes.proficienciasArma.join(', ')}`,
        );
      }
    }

    // ✅ 11. Validar alcances
    if (restricoes.alcancesPermitidos?.length && equipamento.alcance) {
      if (!restricoes.alcancesPermitidos.includes(equipamento.alcance)) {
        erros.push(
          `Requer alcance: ${restricoes.alcancesPermitidos.join(', ')}`,
        );
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
  validarConflitosModificacoes(
    modificacaoNova: ModificacaoComRestricoesEntity,
    modificacoesExistentes: ModificacaoComRestricoesEntity[],
  ): ResultadoValidacaoRestricoes {
    const erros: string[] = [];
    const restricoes = this.parseRestricoes(modificacaoNova.restricoes);

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
  private mapDetalhado(
    modificacao: ModificacaoMapEntity,
  ): ModificacaoDetalhadaDto {
    const restricoes = this.parseRestricoes(modificacao.restricoes);

    return {
      id: modificacao.id,
      codigo: modificacao.codigo,
      nome: modificacao.nome,
      descricao: modificacao.descricao,
      tipo: modificacao.tipo,
      incrementoEspacos: modificacao.incrementoEspacos,
      restricoes,
      efeitosMecanicos: modificacao.efeitosMecanicos,
      fonte: modificacao.fonte,
      suplementoId: modificacao.suplementoId,

      // ✅ Opcional: equipamentos compatíveis
      ...(modificacao.equipamentosApplicaveis && {
        equipamentosCompatíveis: modificacao.equipamentosApplicaveis.map(
          (ea) => ({
            id: ea.equipamento.id,
            codigo: ea.equipamento.codigo,
            nome: ea.equipamento.nome,
            tipo: ea.equipamento.tipo,
          }),
        ),
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
