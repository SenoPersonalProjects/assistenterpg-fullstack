import { BadRequestException, Injectable } from '@nestjs/common';
import { AtributoBase, Prisma, TipoFichaNpcAmeaca } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/common/exceptions/database.exception';
import { NpcAmeacaNaoEncontradaException } from 'src/common/exceptions/npc-ameaca.exception';
import { CreateNpcAmeacaDto } from './dto/create-npc-ameaca.dto';
import { ListarNpcsAmeacasDto } from './dto/listar-npcs-ameacas.dto';
import { UpdateNpcAmeacaDto } from './dto/update-npc-ameaca.dto';

type NpcAmeacaModel = Prisma.NpcAmeacaGetPayload<Record<string, never>>;

type PericiaCatalogo = {
  codigo: string;
  nome: string;
  atributoBase: AtributoBase;
};

type AtributosNpc = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
};

type PericiaEspecialEntrada = {
  codigo: string;
  dados?: number;
  bonus?: number;
  descricao?: string;
};

type PericiaPrincipalCodigo =
  | 'PERCEPCAO'
  | 'INICIATIVA'
  | 'FORTITUDE'
  | 'REFLEXOS'
  | 'VONTADE'
  | 'LUTA'
  | 'JUJUTSU';

type CampoDadosPericiaPrincipal =
  | 'percepcaoDados'
  | 'iniciativaDados'
  | 'fortitudeDados'
  | 'reflexosDados'
  | 'vontadeDados'
  | 'lutaDados'
  | 'jujutsuDados';

const PERICIA_PRINCIPAL_META: Record<
  PericiaPrincipalCodigo,
  { campoDados: CampoDadosPericiaPrincipal; atributoBase: AtributoBase }
> = {
  PERCEPCAO: { campoDados: 'percepcaoDados', atributoBase: 'PRE' },
  INICIATIVA: { campoDados: 'iniciativaDados', atributoBase: 'AGI' },
  FORTITUDE: { campoDados: 'fortitudeDados', atributoBase: 'VIG' },
  REFLEXOS: { campoDados: 'reflexosDados', atributoBase: 'AGI' },
  VONTADE: { campoDados: 'vontadeDados', atributoBase: 'PRE' },
  LUTA: { campoDados: 'lutaDados', atributoBase: 'FOR' },
  JUJUTSU: { campoDados: 'jujutsuDados', atributoBase: 'INT' },
};

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

  private normalizarBuscaPericia(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private calcularDadosPadraoPericia(atributo: number): number {
    if (atributo > 0) return atributo;
    return 2 + Math.abs(atributo);
  }

  private obterAtributoNpcPorBase(
    atributos: AtributosNpc,
    atributoBase: AtributoBase,
  ): number {
    switch (atributoBase) {
      case 'AGI':
        return atributos.agilidade;
      case 'FOR':
        return atributos.forca;
      case 'INT':
        return atributos.intelecto;
      case 'PRE':
        return atributos.presenca;
      case 'VIG':
        return atributos.vigor;
      default:
        return 0;
    }
  }

  private montarAtributosNpc(
    origem:
      | {
          agilidade?: number | null;
          forca?: number | null;
          intelecto?: number | null;
          presenca?: number | null;
          vigor?: number | null;
        }
      | NpcAmeacaModel,
  ): AtributosNpc {
    return {
      agilidade: Number(origem.agilidade ?? 0),
      forca: Number(origem.forca ?? 0),
      intelecto: Number(origem.intelecto ?? 0),
      presenca: Number(origem.presenca ?? 0),
      vigor: Number(origem.vigor ?? 0),
    };
  }

  private async normalizarPericiasEspeciais(
    entradas: PericiaEspecialEntrada[],
    atributos: AtributosNpc,
  ): Promise<Array<Record<string, unknown>>> {
    if (!entradas.length) return [];

    const catalogo = await this.prisma.pericia.findMany({
      select: { codigo: true, nome: true, atributoBase: true },
    });

    const porCodigo = new Map<string, PericiaCatalogo>();
    for (const pericia of catalogo) {
      porCodigo.set(this.normalizarBuscaPericia(pericia.codigo), pericia);
    }

    return entradas.map((entrada, index) => {
      const codigoRaw = entrada.codigo?.trim();
      const pericia =
        codigoRaw && codigoRaw.length > 0
          ? porCodigo.get(this.normalizarBuscaPericia(codigoRaw))
          : undefined;

      if (!pericia) {
        throw new BadRequestException(
          `Pericia especial invalida na posicao ${index + 1}. Use apenas codigos oficiais de pericia.`,
        );
      }

      const atributo = this.obterAtributoNpcPorBase(
        atributos,
        pericia.atributoBase,
      );

      return {
        codigo: pericia.codigo,
        nome: pericia.nome,
        atributoBase: pericia.atributoBase,
        dados:
          typeof entrada.dados === 'number'
            ? entrada.dados
            : this.calcularDadosPadraoPericia(atributo),
        bonus: typeof entrada.bonus === 'number' ? entrada.bonus : undefined,
        descricao: this.normalizarTexto(entrada.descricao) ?? undefined,
      };
    });
  }

  private resolverDadosPericiaPrincipal(
    codigo: PericiaPrincipalCodigo,
    npcAmeaca: NpcAmeacaModel,
  ): number {
    const { campoDados, atributoBase } = PERICIA_PRINCIPAL_META[codigo];
    const valorPersistido = npcAmeaca[campoDados];
    if (typeof valorPersistido === 'number') return valorPersistido;

    const atributos = this.montarAtributosNpc(npcAmeaca);
    const atributo = this.obterAtributoNpcPorBase(atributos, atributoBase);
    return this.calcularDadosPadraoPericia(atributo);
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
      percepcaoDados: this.resolverDadosPericiaPrincipal(
        'PERCEPCAO',
        npcAmeaca,
      ),
      iniciativaDados: this.resolverDadosPericiaPrincipal(
        'INICIATIVA',
        npcAmeaca,
      ),
      fortitudeDados: this.resolverDadosPericiaPrincipal(
        'FORTITUDE',
        npcAmeaca,
      ),
      reflexosDados: this.resolverDadosPericiaPrincipal('REFLEXOS', npcAmeaca),
      vontadeDados: this.resolverDadosPericiaPrincipal('VONTADE', npcAmeaca),
      lutaDados: this.resolverDadosPericiaPrincipal('LUTA', npcAmeaca),
      jujutsuDados: this.resolverDadosPericiaPrincipal('JUJUTSU', npcAmeaca),
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
      const atributos = this.montarAtributosNpc(dto);
      const periciasEspeciais = await this.normalizarPericiasEspeciais(
        (dto.periciasEspeciais as PericiaEspecialEntrada[] | undefined) ?? [],
        atributos,
      );

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
          percepcaoDados: dto.percepcaoDados,
          iniciativaDados: dto.iniciativaDados,
          fortitudeDados: dto.fortitudeDados,
          reflexosDados: dto.reflexosDados,
          vontadeDados: dto.vontadeDados,
          lutaDados: dto.lutaDados,
          jujutsuDados: dto.jujutsuDados,
          defesa: dto.defesa,
          pontosVida: dto.pontosVida,
          machucado: dto.machucado ?? undefined,
          deslocamentoMetros: dto.deslocamentoMetros,
          periciasEspeciais:
            this.normalizarJsonParaPersistir(periciasEspeciais),
          resistencias: this.normalizarJsonParaPersistir(
            dto.resistencias ?? [],
          ),
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
      const existente = await this.buscarDoUsuarioOuFalhar(usuarioId, id);
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
      if (dto.percepcaoDados !== undefined)
        data.percepcaoDados = dto.percepcaoDados;
      if (dto.iniciativaDados !== undefined)
        data.iniciativaDados = dto.iniciativaDados;
      if (dto.fortitudeDados !== undefined)
        data.fortitudeDados = dto.fortitudeDados;
      if (dto.reflexosDados !== undefined)
        data.reflexosDados = dto.reflexosDados;
      if (dto.vontadeDados !== undefined) data.vontadeDados = dto.vontadeDados;
      if (dto.lutaDados !== undefined) data.lutaDados = dto.lutaDados;
      if (dto.jujutsuDados !== undefined) data.jujutsuDados = dto.jujutsuDados;
      if (dto.defesa !== undefined) data.defesa = dto.defesa;
      if (dto.pontosVida !== undefined) data.pontosVida = dto.pontosVida;
      if (dto.machucado !== undefined) data.machucado = dto.machucado;
      if (dto.deslocamentoMetros !== undefined) {
        data.deslocamentoMetros = dto.deslocamentoMetros;
      }

      if (dto.periciasEspeciais !== undefined) {
        const atributosAtualizados = this.montarAtributosNpc({
          agilidade: dto.agilidade ?? existente.agilidade,
          forca: dto.forca ?? existente.forca,
          intelecto: dto.intelecto ?? existente.intelecto,
          presenca: dto.presenca ?? existente.presenca,
          vigor: dto.vigor ?? existente.vigor,
        });

        const periciasEspeciais = await this.normalizarPericiasEspeciais(
          dto.periciasEspeciais as PericiaEspecialEntrada[],
          atributosAtualizados,
        );

        data.periciasEspeciais =
          this.normalizarJsonParaPersistir(periciasEspeciais);
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
