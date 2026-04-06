// src/condicoes/condicoes.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondicaoDto } from './dto/create-condicao.dto';
import { UpdateCondicaoDto } from './dto/update-condicao.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  CondicaoNaoEncontradaException,
  CondicaoNomeDuplicadoException,
  CondicaoEmUsoException,
} from 'src/common/exceptions/condicao.exception';

@Injectable()
export class CondicoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * CREATE - Criar nova condição
   */
  async create(createDto: CreateCondicaoDto) {
    // Verificar nome duplicado
    const existente = await this.prisma.condicao.findUnique({
      where: { nome: createDto.nome },
    });

    if (existente) {
      throw new CondicaoNomeDuplicadoException(createDto.nome);
    }

    return this.prisma.condicao.create({
      data: {
        nome: createDto.nome,
        descricao: createDto.descricao,
        icone: createDto.icone ?? null,
      },
    });
  }

  /**
   * FIND ALL - Listar todas as condições
   */
  async findAll() {
    return this.prisma.condicao.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: {
            condicoesPersonagemSessao: true, // ✅ CORRIGIDO: Nome correto do relacionamento
          },
        },
      },
    });
  }

  /**
   * FIND ONE - Buscar condição por ID
   */
  async findOne(id: number) {
    const condicao = await this.prisma.condicao.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            condicoesPersonagemSessao: true, // ✅ CORRIGIDO
          },
        },
      },
    });

    if (!condicao) {
      throw new CondicaoNaoEncontradaException(id);
    }

    return condicao;
  }

  /**
   * UPDATE - Atualizar condição
   */
  async update(id: number, updateDto: UpdateCondicaoDto) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar nome duplicado (se mudou)
    if (updateDto.nome) {
      const duplicado = await this.prisma.condicao.findFirst({
        where: {
          nome: updateDto.nome,
          NOT: { id },
        },
      });

      if (duplicado) {
        throw new CondicaoNomeDuplicadoException(updateDto.nome);
      }
    }

    return this.prisma.condicao.update({
      where: { id },
      data: {
        ...(updateDto.nome && { nome: updateDto.nome }),
        ...(updateDto.descricao !== undefined && {
          descricao: updateDto.descricao,
        }),
        ...(updateDto.icone !== undefined && { icone: updateDto.icone }),
      },
    });
  }

  /**
   * DELETE - Remover condição
   */
  async remove(id: number) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar se está sendo usada em sessões
    const usadaEmSessoes = await this.prisma.condicaoPersonagemSessao.count({
      where: { condicaoId: id },
    });

    if (usadaEmSessoes > 0) {
      throw new CondicaoEmUsoException(id, usadaEmSessoes);
    }

    await this.prisma.condicao.delete({
      where: { id },
    });

    return { message: 'Condição removida com sucesso' };
  }
}
