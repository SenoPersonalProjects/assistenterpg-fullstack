// src/classes/classes.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClasseDto } from './dto/create-classe.dto';
import { UpdateClasseDto } from './dto/update-classe.dto';
import {
  ClasseCatalogoDto,
  ClassePericiaCatalogoDto,
  ClasseProficienciaCatalogoDto,
} from './dto/catalogo-classe.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  ClasseNaoEncontradaException,
  ClasseNomeDuplicadoException,
  ClasseEmUsoException,
} from 'src/common/exceptions/classe.exception';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClasseDto) {
    // ✅ VALIDAR: Verificar nome duplicado
    const existente = await this.prisma.classe.findUnique({
      where: { nome: dto.nome },
    });

    if (existente) {
      throw new ClasseNomeDuplicadoException(dto.nome);
    }

    return this.prisma.classe.create({ data: dto });
  }

  private mapToCatalogo(classe: any): ClasseCatalogoDto {
    return {
      id: classe.id,
      nome: classe.nome,
      descricao: classe.descricao,
      periciasLivresBase: classe.periciasLivresBase,
      pericias:
        classe.pericias?.map(
          (rel): ClassePericiaCatalogoDto => ({
            id: rel.id,
            tipo: rel.tipo,
            grupoEscolha: rel.grupoEscolha,
            pericia: {
              id: rel.pericia.id,
              codigo: rel.pericia.codigo,
              nome: rel.pericia.nome,
              descricao: rel.pericia.descricao,
            },
          }),
        ) ?? [],
      proficiencias:
        classe.proficiencias?.map(
          (rel): ClasseProficienciaCatalogoDto => ({
            id: rel.proficiencia.id,
            codigo: rel.proficiencia.codigo,
            nome: rel.proficiencia.nome,
            descricao: rel.proficiencia.descricao,
            tipo: rel.proficiencia.tipo,
            categoria: rel.proficiencia.categoria,
            subtipo: rel.proficiencia.subtipo,
          }),
        ) ?? [],

      // ✅ NOVO: habilidades iniciais (nível 1)
      // Conservador: vem o objeto completo da Habilidade (include: true)
      habilidadesIniciais: classe.habilidadesClasse?.map((hc: any) => hc.habilidade) ?? [],
    };
  }

  async findAll(): Promise<ClasseCatalogoDto[]> {
    const classes = await this.prisma.classe.findMany({
      orderBy: { nome: 'asc' },
      include: {
        pericias: { include: { pericia: true } },
        proficiencias: { include: { proficiencia: true } },

        // ✅ NOVO: habilidades da classe no nível 1 (conservador)
        habilidadesClasse: {
          where: { nivelConcedido: 1 },
          include: {
            habilidade: true, // <- todos os campos
          },
        },
      },
    });

    return classes.map((c) => this.mapToCatalogo(c));
  }

  async findOne(id: number): Promise<ClasseCatalogoDto> {
    const classe = await this.prisma.classe.findUnique({
      where: { id },
      include: {
        pericias: { include: { pericia: true } },
        proficiencias: { include: { proficiencia: true } },

        // ✅ NOVO: habilidades da classe no nível 1 (conservador)
        habilidadesClasse: {
          where: { nivelConcedido: 1 },
          include: {
            habilidade: true, // <- todos os campos
          },
        },
      },
    });

    if (!classe) {
      throw new ClasseNaoEncontradaException(id);
    }

    return this.mapToCatalogo(classe);
  }

  async findTrilhas(id: number) {
    const classe = await this.prisma.classe.findUnique({ where: { id } });
    
    if (!classe) {
      throw new ClasseNaoEncontradaException(id);
    }

    const trilhas = await this.prisma.trilha.findMany({
      where: { classeId: id },
      orderBy: { nome: 'asc' },
    });

    return trilhas.map((t) => ({
      id: t.id,
      nome: t.nome,
      descricao: t.descricao,
      classeId: t.classeId,
    }));
  }

  async update(id: number, dto: UpdateClasseDto) {
    // Verificar se existe
    await this.findOne(id);

    // ✅ VALIDAR: Verificar nome duplicado (se mudou)
    if (dto.nome) {
      const duplicado = await this.prisma.classe.findFirst({
        where: {
          nome: dto.nome,
          NOT: { id },
        },
      });

      if (duplicado) {
        throw new ClasseNomeDuplicadoException(dto.nome);
      }
    }

    return this.prisma.classe.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    // Verificar se existe
    await this.findOne(id);

    // ✅ VALIDAR: Verificar se está sendo usada
    const [usosBase, usosCampanha] = await Promise.all([
      this.prisma.personagemBase.count({ where: { classeId: id } }),
      this.prisma.personagemCampanha.count({ where: { classeId: id } }),
    ]);

    const totalUsos = usosBase + usosCampanha;

    if (totalUsos > 0) {
      throw new ClasseEmUsoException(totalUsos, usosBase, usosCampanha);
    }

    await this.prisma.classe.delete({ where: { id } });
    
    return { sucesso: true };
  }
}
