import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClasseDto } from './dto/create-classe.dto';
import { UpdateClasseDto } from './dto/update-classe.dto';
import {
  ClasseCatalogoDto,
  ClassePericiaCatalogoDto,
  ClasseProficienciaCatalogoDto,
} from './dto/catalogo-classe.dto';
import {
  ClasseEmUsoException,
  ClasseNaoEncontradaException,
  ClasseNomeDuplicadoException,
} from 'src/common/exceptions/classe.exception';
import { SuplementoNaoEncontradoException } from 'src/common/exceptions/suplemento.exception';

const classeCatalogoInclude = {
  pericias: { include: { pericia: true } },
  proficiencias: { include: { proficiencia: true } },
  habilidadesClasse: {
    where: { nivelConcedido: 1 },
    include: { habilidade: true },
  },
} satisfies Prisma.ClasseInclude;

type ClasseCatalogoPayload = Prisma.ClasseGetPayload<{
  include: typeof classeCatalogoInclude;
}>;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateClasseDto) {
    const existente = await this.prisma.classe.findUnique({
      where: { nome: dto.nome },
    });

    if (existente) {
      throw new ClasseNomeDuplicadoException(dto.nome);
    }

    const suplementoIdFinal = dto.suplementoId ?? null;
    const fonteFinal =
      dto.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);

    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    return this.prisma.classe.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        fonte: fonteFinal,
        suplementoId: suplementoIdFinal,
      },
    });
  }

  private mapToCatalogo(classe: ClasseCatalogoPayload): ClasseCatalogoDto {
    return {
      id: classe.id,
      nome: classe.nome,
      descricao: classe.descricao,
      fonte: classe.fonte,
      suplementoId: classe.suplementoId,
      periciasLivresBase: classe.periciasLivresBase,
      pericias: classe.pericias.map(
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
      ),
      proficiencias: classe.proficiencias.map(
        (rel): ClasseProficienciaCatalogoDto => ({
          id: rel.proficiencia.id,
          codigo: rel.proficiencia.codigo,
          nome: rel.proficiencia.nome,
          descricao: rel.proficiencia.descricao,
          tipo: rel.proficiencia.tipo,
          categoria: rel.proficiencia.categoria,
          subtipo: rel.proficiencia.subtipo,
        }),
      ),
      habilidadesIniciais: classe.habilidadesClasse.map((hc) => hc.habilidade),
    };
  }

  async findAll(): Promise<ClasseCatalogoDto[]> {
    const classes = await this.prisma.classe.findMany({
      orderBy: { nome: 'asc' },
      include: classeCatalogoInclude,
    });

    return classes.map((classe) => this.mapToCatalogo(classe));
  }

  async findOne(id: number): Promise<ClasseCatalogoDto> {
    const classe = await this.prisma.classe.findUnique({
      where: { id },
      include: classeCatalogoInclude,
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

    return trilhas.map((trilha) => ({
      id: trilha.id,
      nome: trilha.nome,
      descricao: trilha.descricao,
      classeId: trilha.classeId,
      requisitos: trilha.requisitos,
      fonte: trilha.fonte,
      suplementoId: trilha.suplementoId,
    }));
  }

  async update(id: number, dto: UpdateClasseDto) {
    const classeAtual = await this.prisma.classe.findUnique({ where: { id } });
    if (!classeAtual) {
      throw new ClasseNaoEncontradaException(id);
    }

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

    const suplementoIdFinal =
      dto.suplementoId !== undefined
        ? dto.suplementoId
        : classeAtual.suplementoId;
    const fonteFinal =
      dto.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : classeAtual.fonte);

    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    return this.prisma.classe.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(fonteFinal !== classeAtual.fonte && { fonte: fonteFinal }),
        ...(dto.suplementoId !== undefined && {
          suplementoId: dto.suplementoId,
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

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
