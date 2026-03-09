import { Injectable } from '@nestjs/common';
import { Prisma, TipoFichaNpcAmeaca } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/common/exceptions/database.exception';
import { NpcAmeacaNaoEncontradaException } from 'src/common/exceptions/npc-ameaca.exception';
import { CreateNpcAmeacaDto } from './dto/create-npc-ameaca.dto';
import { ListarNpcsAmeacasDto } from './dto/listar-npcs-ameacas.dto';
import { UpdateNpcAmeacaDto } from './dto/update-npc-ameaca.dto';

type NpcAmeacaModel = Prisma.NpcAmeacaGetPayload<Record<string, never>>;

@Injectable()
export class NpcsAmeacasService {
  constructor(private readonly prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private normalizarTexto(
    valor: string | null | undefined,
  ): string | null | undefined {
    if (valor === undefined) return undefined;
    if (valor === null) return null;
    const limpo = valor.trim();
    return limpo.length > 0 ? limpo : null;
  }

  private normalizarJsonParaPersistir(
    valor: unknown,
  ): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (valor === null) {
      return Prisma.JsonNull;
    }

    return valor as Prisma.InputJsonValue;
  }

  private mapearListaString(valor: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter((item): item is string => typeof item === 'string');
  }

  private mapearListaObjeto(
    valor: Prisma.JsonValue | null,
  ): Prisma.JsonObject[] {
    if (!Array.isArray(valor)) return [];
    return valor.filter(
      (item): item is Prisma.JsonObject =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  private mapearResumo(npcAmeaca: NpcAmeacaModel) {
    return {
      id: npcAmeaca.id,
      nome: npcAmeaca.nome,
      descricao: npcAmeaca.descricao,
      fichaTipo: npcAmeaca.fichaTipo,
      tipo: npcAmeaca.tipo,
      tamanho: npcAmeaca.tamanho,
      vd: npcAmeaca.vd,
      defesa: npcAmeaca.defesa,
      pontosVida: npcAmeaca.pontosVida,
      criadoEm: npcAmeaca.criadoEm,
      atualizadoEm: npcAmeaca.atualizadoEm,
    };
  }

  private mapearDetalhe(npcAmeaca: NpcAmeacaModel) {
    return {
      ...this.mapearResumo(npcAmeaca),
      donoId: npcAmeaca.donoId,
      agilidade: npcAmeaca.agilidade,
      forca: npcAmeaca.forca,
      intelecto: npcAmeaca.intelecto,
      presenca: npcAmeaca.presenca,
      vigor: npcAmeaca.vigor,
      percepcao: npcAmeaca.percepcao,
      iniciativa: npcAmeaca.iniciativa,
      fortitude: npcAmeaca.fortitude,
      reflexos: npcAmeaca.reflexos,
      vontade: npcAmeaca.vontade,
      luta: npcAmeaca.luta,
      jujutsu: npcAmeaca.jujutsu,
      machucado: npcAmeaca.machucado,
      deslocamentoMetros: npcAmeaca.deslocamentoMetros,
      periciasEspeciais: this.mapearListaObjeto(npcAmeaca.periciasEspeciais),
      resistencias: this.mapearListaString(npcAmeaca.resistencias),
      vulnerabilidades: this.mapearListaString(npcAmeaca.vulnerabilidades),
      passivas: this.mapearListaObjeto(npcAmeaca.passivas),
      acoes: this.mapearListaObjeto(npcAmeaca.acoes),
      usoTatico: npcAmeaca.usoTatico,
    };
  }

  private async buscarDoUsuarioOuFalhar(usuarioId: number, id: number) {
    const npcAmeaca = await this.prisma.npcAmeaca.findFirst({
      where: {
        id,
        donoId: usuarioId,
      },
    });

    if (!npcAmeaca) {
      throw new NpcAmeacaNaoEncontradaException(id);
    }

    return npcAmeaca;
  }

  async listarDoUsuario(usuarioId: number, filtros: ListarNpcsAmeacasDto) {
    try {
      const page = Math.max(1, filtros.page ?? 1);
      const limit = Math.max(1, Math.min(100, filtros.limit ?? 20));
      const nome = filtros.nome?.trim();

      const where: Prisma.NpcAmeacaWhereInput = {
        donoId: usuarioId,
      };

      if (nome) {
        where.nome = {
          contains: nome,
        };
      }

      if (filtros.fichaTipo) {
        where.fichaTipo = filtros.fichaTipo;
      }

      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }

      if (filtros.tamanho) {
        where.tamanho = filtros.tamanho;
      }

      const [total, items] = await Promise.all([
        this.prisma.npcAmeaca.count({ where }),
        this.prisma.npcAmeaca.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ atualizadoEm: 'desc' }, { id: 'desc' }],
        }),
      ]);

      return {
        items: items.map((item) => this.mapearResumo(item)),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async criar(usuarioId: number, dto: CreateNpcAmeacaDto) {
    try {
      const npcAmeaca = await this.prisma.npcAmeaca.create({
        data: {
          dono: {
            connect: {
              id: usuarioId,
            },
          },
          nome: dto.nome.trim(),
          descricao: this.normalizarTexto(dto.descricao) ?? null,
          fichaTipo: dto.fichaTipo ?? TipoFichaNpcAmeaca.AMEACA,
          tipo: dto.tipo,
          tamanho: dto.tamanho,
          vd: dto.vd,
          agilidade: dto.agilidade,
          forca: dto.forca,
          intelecto: dto.intelecto,
          presenca: dto.presenca,
          vigor: dto.vigor,
          percepcao: dto.percepcao,
          iniciativa: dto.iniciativa,
          fortitude: dto.fortitude,
          reflexos: dto.reflexos,
          vontade: dto.vontade,
          luta: dto.luta,
          jujutsu: dto.jujutsu,
          defesa: dto.defesa,
          pontosVida: dto.pontosVida,
          machucado: dto.machucado ?? undefined,
          deslocamentoMetros: dto.deslocamentoMetros,
          periciasEspeciais: this.normalizarJsonParaPersistir(
            dto.periciasEspeciais ?? [],
          ),
          resistencias: this.normalizarJsonParaPersistir(dto.resistencias ?? []),
          vulnerabilidades: this.normalizarJsonParaPersistir(
            dto.vulnerabilidades ?? [],
          ),
          passivas: this.normalizarJsonParaPersistir(dto.passivas ?? []),
          acoes: this.normalizarJsonParaPersistir(dto.acoes ?? []),
          usoTatico: this.normalizarTexto(dto.usoTatico) ?? null,
        },
      });

      return this.mapearDetalhe(npcAmeaca);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorId(usuarioId: number, id: number) {
    try {
      const npcAmeaca = await this.buscarDoUsuarioOuFalhar(usuarioId, id);
      return this.mapearDetalhe(npcAmeaca);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizar(usuarioId: number, id: number, dto: UpdateNpcAmeacaDto) {
    try {
      await this.buscarDoUsuarioOuFalhar(usuarioId, id);

      const data: Prisma.NpcAmeacaUpdateInput = {};

      if (dto.nome !== undefined) data.nome = dto.nome.trim();

      const descricaoNormalizada = this.normalizarTexto(dto.descricao);
      if (descricaoNormalizada !== undefined) {
        data.descricao = descricaoNormalizada;
      }

      const usoTaticoNormalizado = this.normalizarTexto(dto.usoTatico);
      if (usoTaticoNormalizado !== undefined) {
        data.usoTatico = usoTaticoNormalizado;
      }

      if (dto.fichaTipo !== undefined) data.fichaTipo = dto.fichaTipo;
      if (dto.tipo !== undefined) data.tipo = dto.tipo;
      if (dto.tamanho !== undefined) data.tamanho = dto.tamanho;
      if (dto.vd !== undefined) data.vd = dto.vd;
      if (dto.agilidade !== undefined) data.agilidade = dto.agilidade;
      if (dto.forca !== undefined) data.forca = dto.forca;
      if (dto.intelecto !== undefined) data.intelecto = dto.intelecto;
      if (dto.presenca !== undefined) data.presenca = dto.presenca;
      if (dto.vigor !== undefined) data.vigor = dto.vigor;
      if (dto.percepcao !== undefined) data.percepcao = dto.percepcao;
      if (dto.iniciativa !== undefined) data.iniciativa = dto.iniciativa;
      if (dto.fortitude !== undefined) data.fortitude = dto.fortitude;
      if (dto.reflexos !== undefined) data.reflexos = dto.reflexos;
      if (dto.vontade !== undefined) data.vontade = dto.vontade;
      if (dto.luta !== undefined) data.luta = dto.luta;
      if (dto.jujutsu !== undefined) data.jujutsu = dto.jujutsu;
      if (dto.defesa !== undefined) data.defesa = dto.defesa;
      if (dto.pontosVida !== undefined) data.pontosVida = dto.pontosVida;
      if (dto.machucado !== undefined) data.machucado = dto.machucado;
      if (dto.deslocamentoMetros !== undefined) {
        data.deslocamentoMetros = dto.deslocamentoMetros;
      }

      if (dto.periciasEspeciais !== undefined) {
        data.periciasEspeciais = this.normalizarJsonParaPersistir(
          dto.periciasEspeciais,
        );
      }

      if (dto.resistencias !== undefined) {
        data.resistencias = this.normalizarJsonParaPersistir(dto.resistencias);
      }

      if (dto.vulnerabilidades !== undefined) {
        data.vulnerabilidades = this.normalizarJsonParaPersistir(
          dto.vulnerabilidades,
        );
      }

      if (dto.passivas !== undefined) {
        data.passivas = this.normalizarJsonParaPersistir(dto.passivas);
      }

      if (dto.acoes !== undefined) {
        data.acoes = this.normalizarJsonParaPersistir(dto.acoes);
      }

      const npcAmeaca = await this.prisma.npcAmeaca.update({
        where: { id },
        data,
      });

      return this.mapearDetalhe(npcAmeaca);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async remover(usuarioId: number, id: number) {
    try {
      await this.buscarDoUsuarioOuFalhar(usuarioId, id);

      await this.prisma.npcAmeaca.delete({
        where: { id },
      });

      return {
        message: 'NPC/Ameaca removido com sucesso',
        id,
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
