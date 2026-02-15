// src/proficiencias/proficiencias.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProficienciaDto } from './dto/create-proficiencia.dto';
import { UpdateProficienciaDto } from './dto/update-proficiencia.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  ProficienciaNaoEncontradaException,
  // ProficienciaNomeDuplicadoException, // ✅ Descomente se implementar validação de nome único
  // ProficienciaEmUsoException,          // ✅ Descomente se implementar verificação de uso
} from 'src/common/exceptions/proficiencia.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class ProficienciasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProficienciaDto) {
    try {
      // ✅ OPCIONAL: Validar nome único (se necessário)
      // const existente = await this.prisma.proficiencia.findFirst({
      //   where: { nome: dto.nome },
      // });
      // if (existente) {
      //   throw new ProficienciaNomeDuplicadoException(dto.nome);
      // }

      return this.prisma.proficiencia.create({ data: dto });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return this.prisma.proficiencia.findMany({
        orderBy: { nome: 'asc' },
      });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const prof = await this.prisma.proficiencia.findUnique({ where: { id } });

      if (!prof) {
        throw new ProficienciaNaoEncontradaException(id);
      }

      return prof;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateProficienciaDto) {
    try {
      await this.findOne(id);

      // ✅ OPCIONAL: Validar nome único ao atualizar (se mudou)
      // if (dto.nome) {
      //   const duplicado = await this.prisma.proficiencia.findFirst({
      //     where: {
      //       nome: dto.nome,
      //       NOT: { id },
      //     },
      //   });
      //   if (duplicado) {
      //     throw new ProficienciaNomeDuplicadoException(dto.nome);
      //   }
      // }

      return this.prisma.proficiencia.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      // ✅ OPCIONAL: Verificar se está sendo usada (exemplo genérico)
      // const usos = await this.contarUsos(id);
      // if (usos.total > 0) {
      //   throw new ProficienciaEmUsoException(id, usos.total, usos.detalhes);
      // }

      await this.prisma.proficiencia.delete({ where: { id } });

      return { sucesso: true };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ✅ OPCIONAL: Método auxiliar para contar usos
  // private async contarUsos(id: number) {
  //   // Adapte conforme suas relações no schema.prisma
  //   const [usosClasses, usosTrilhas, usosOrigens] = await Promise.all([
  //     this.prisma.classe.count({ where: { proficienciaId: id } }),
  //     this.prisma.trilha.count({ where: { proficienciaId: id } }),
  //     this.prisma.origem.count({ where: { proficienciaId: id } }),
  //   ]);
  //
  //   const total = usosClasses + usosTrilhas + usosOrigens;
  //
  //   return {
  //     total,
  //     detalhes: {
  //       classes: usosClasses,
  //       trilhas: usosTrilhas,
  //       origens: usosOrigens,
  //     },
  //   };
  // }
}
