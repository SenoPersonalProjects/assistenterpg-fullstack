// src/tipos-grau/tipos-grau.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoGrauDto } from './dto/create-tipo-grau.dto';
import { UpdateTipoGrauDto } from './dto/update-tipo-grau.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  TipoGrauNaoEncontradoException,
  // TipoGrauCodigoDuplicadoException, // ✅ Descomente se implementar validação de código único
  // TipoGrauEmUsoException,             // ✅ Descomente se implementar verificação de uso
} from 'src/common/exceptions/tipo-grau.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class TiposGrauService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTipoGrauDto) {
    try {
      // ✅ OPCIONAL: Validar código único (se houver campo codigo)
      // if (dto.codigo) {
      //   const existente = await this.prisma.tipoGrau.findFirst({
      //     where: { codigo: dto.codigo },
      //   });
      //   if (existente) {
      //     throw new TipoGrauCodigoDuplicadoException(dto.codigo);
      //   }
      // }

      return this.prisma.tipoGrau.create({ data: dto });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return this.prisma.tipoGrau.findMany({
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
      const tipo = await this.prisma.tipoGrau.findUnique({ where: { id } });

      if (!tipo) {
        throw new TipoGrauNaoEncontradoException(id);
      }

      return tipo;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateTipoGrauDto) {
    try {
      await this.findOne(id);

      // ✅ OPCIONAL: Validar código único ao atualizar (se mudou)
      // if (dto.codigo) {
      //   const duplicado = await this.prisma.tipoGrau.findFirst({
      //     where: {
      //       codigo: dto.codigo,
      //       NOT: { id },
      //     },
      //   });
      //   if (duplicado) {
      //     throw new TipoGrauCodigoDuplicadoException(dto.codigo);
      //   }
      // }

      return this.prisma.tipoGrau.update({
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

      // ✅ OPCIONAL: Verificar se está sendo usado (exemplo genérico)
      // const usos = await this.contarUsos(id);
      // if (usos.total > 0) {
      //   throw new TipoGrauEmUsoException(id, usos.total, usos.detalhes);
      // }

      await this.prisma.tipoGrau.delete({ where: { id } });

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
  //   // Exemplo: verificar se TipoGrau está sendo referenciado em HabilidadeTecnica
  //   const [usosHabilidades, usosTecnicas] = await Promise.all([
  //     this.prisma.habilidadeTecnica.count({
  //       where: { grauTipoGrauCodigo: id.toString() }, // Adapte conforme seu schema
  //     }),
  //     this.prisma.tecnicaAmaldicoada.count({
  //       where: { tipoGrauId: id }, // Adapte conforme seu schema
  //     }),
  //   ]);
  //
  //   const total = usosHabilidades + usosTecnicas;
  //
  //   return {
  //     total,
  //     detalhes: {
  //       habilidades: usosHabilidades,
  //       tecnicas: usosTecnicas,
  //     },
  //   };
  // }
}
