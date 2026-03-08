// src/personagem-base/personagem-base.persistence.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EngineResult } from './engine/personagem-base.engine.types';

type PrismaLike = PrismaService | Prisma.TransactionClient;

type PericiaStatePersist = {
  periciaId: number;
  grauTreinamento: number;
  bonusExtra: number;
};

type PersistenciaEstado = Pick<
  EngineResult,
  | 'profsFinais'
  | 'grausFinais'
  | 'periciasMapCodigo'
  | 'grausTreinamento'
  | 'habilidadesParaPersistir'
  | 'poderesGenericosNormalizados'
  | 'passivasResolvidas'
  | 'passivasAtributosConfigLimpo'
  | 'dtoNormalizado'
  | 'resistenciasFinais'
>;

type DataSanitizavel = Record<string, unknown> & {
  proficienciasCodigos?: string[];
  proficienciasExtrasCodigos?: unknown;
  periciasLivresExtras?: unknown;
  itensInventario?: unknown;
  passivasAtributoIds?: unknown;
  defesa?: unknown;
  defesaTotal?: unknown;
};

const personagemCriadoInclude =
  Prisma.validator<Prisma.PersonagemBaseInclude>()({
    cla: true,
    origem: true,
    classe: true,
    trilha: true,
    caminho: true,
    resistencias: {
      include: {
        resistenciaTipo: true,
      },
    },
    inventarioItens: {
      include: {
        equipamento: true,
        modificacoes: {
          include: {
            modificacao: true,
          },
        },
      },
    },
  });

export type PersonagemCriadoEntity = Prisma.PersonagemBaseGetPayload<{
  include: typeof personagemCriadoInclude;
}>;

function sanitizarDataBase(dataBase: Record<string, unknown>): DataSanitizavel {
  const dataSanitizado: DataSanitizavel = { ...dataBase };

  if (Array.isArray(dataSanitizado.proficienciasCodigos)) {
    dataSanitizado.proficienciasExtrasCodigos =
      dataSanitizado.proficienciasCodigos;
  }

  delete dataSanitizado.proficienciasCodigos;
  delete dataSanitizado.periciasLivresExtras;
  delete dataSanitizado.itensInventario;
  delete dataSanitizado.passivasAtributoIds;
  delete dataSanitizado.defesa;
  delete dataSanitizado.defesaTotal;

  return dataSanitizado;
}

function toNullableInputJson(
  value: Prisma.JsonValue,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

@Injectable()
export class PersonagemBasePersistence {
  constructor(private readonly prisma: PrismaService) {}

  async criarComEstado(
    params: {
      donoId: number;
      dataBase: Record<string, unknown>;
      estado: {
        profsFinais: string[];
        grausFinais: Array<{ tipoGrauCodigo: string; valor: number }>;
        periciasMapCodigo: Map<string, PericiaStatePersist>;
        grausTreinamento?: Array<{
          nivel: number;
          melhorias: Array<{
            periciaCodigo: string;
            grauAnterior: number;
            grauNovo: number;
          }>;
        }>;
        habilidadesParaPersistir: Array<{ habilidadeId: number }>;
        poderesGenericosNormalizados: Array<{
          habilidadeId: number;
          config: Prisma.JsonValue;
        }>;
        passivasResolvidas: PersistenciaEstado['passivasResolvidas'];
        passivasAtributosConfigLimpo?: PersistenciaEstado['passivasAtributosConfigLimpo'];
        dtoNormalizado: PersistenciaEstado['dtoNormalizado'];
        resistenciasFinais: Map<string, number>;
      };
    },
    prisma: PrismaLike = this.prisma,
  ): Promise<PersonagemCriadoEntity> {
    const { donoId, dataBase, estado } = params;

    // âœ… SANITIZAR dataBase: mapear nomes DTO â†’ model e remover campos invÃ¡lidos
    const dataSanitizado = sanitizarDataBase(dataBase);
    // âœ… NOVO: Buscar cÃ³digos de resistÃªncias para criar relaÃ§Ãµes
    const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(
      estado.resistenciasFinais,
      prisma,
    );

    // âœ… NOVO: Preparar itens do inventÃ¡rio
    const itensInventarioParaCriar = this.prepararItensInventarioParaCriacao(
      estado.dtoNormalizado.itensInventario ?? [],
    );

    return prisma.personagemBase.create({
      data: {
        ...dataSanitizado,
        donoId,

        passivasAtributosAtivos: estado.passivasResolvidas.ativos,
        passivasAtributosConfig:
          (estado.passivasAtributosConfigLimpo as Prisma.InputJsonValue) ??
          undefined,

        periciasClasseEscolhidasCodigos:
          estado.dtoNormalizado.periciasClasseEscolhidasCodigos ?? [],
        periciasOrigemEscolhidasCodigos:
          estado.dtoNormalizado.periciasOrigemEscolhidasCodigos ?? [],
        periciasLivresCodigos:
          estado.dtoNormalizado.periciasLivresCodigos ?? [],

        proficiencias: {
          create: estado.profsFinais.map((codigo) => ({
            proficiencia: { connect: { codigo } },
          })),
        },

        grausAprimoramento: {
          create: estado.grausFinais.map((g) => ({
            tipoGrau: { connect: { codigo: g.tipoGrauCodigo } },
            valor: g.valor,
          })),
        },

        pericias: {
          create: Array.from(estado.periciasMapCodigo.values()).map((p) => ({
            pericia: { connect: { id: p.periciaId } },
            grauTreinamento: p.grauTreinamento,
            bonusExtra: p.bonusExtra,
          })),
        },

        grausTreinamento: estado.grausTreinamento?.length
          ? {
              create: estado.grausTreinamento.flatMap((gt) =>
                gt.melhorias.map((m) => ({
                  nivel: gt.nivel,
                  periciaCodigo: m.periciaCodigo,
                  grauAnterior: m.grauAnterior,
                  grauNovo: m.grauNovo,
                })),
              ),
            }
          : undefined,

        habilidadesBase: {
          create: estado.habilidadesParaPersistir.map((h) => ({
            habilidade: { connect: { id: h.habilidadeId } },
          })),
        },

        poderesGenericos: estado.poderesGenericosNormalizados.length
          ? {
              create: estado.poderesGenericosNormalizados.map((p) => ({
                habilidade: { connect: { id: p.habilidadeId } },
                config: toNullableInputJson(p.config),
              })),
            }
          : undefined,

        passivas: estado.passivasResolvidas.passivaIds.length
          ? {
              create: estado.passivasResolvidas.passivaIds.map((passivaId) => ({
                passiva: { connect: { id: passivaId } },
              })),
            }
          : undefined,

        // âœ… NOVO: Criar resistÃªncias
        resistencias: resistenciasParaCriar.length
          ? {
              create: resistenciasParaCriar,
            }
          : undefined,

        // âœ… CORRIGIDO: Criar itens do inventÃ¡rio com nome correto
        inventarioItens: itensInventarioParaCriar.length
          ? {
              create: itensInventarioParaCriar,
            }
          : undefined,
      } as unknown as Prisma.PersonagemBaseCreateInput,
      include: personagemCriadoInclude,
    }) as unknown as Promise<PersonagemCriadoEntity>;
  }

  async atualizarRebuildComEstado(
    params: {
      id: number;
      dataUpdateBase: Record<string, unknown>;
      estado: {
        profsFinais: string[];
        grausFinais: Array<{ tipoGrauCodigo: string; valor: number }>;
        periciasMapCodigo: Map<string, PericiaStatePersist>;
        grausTreinamento?: Array<{
          nivel: number;
          melhorias: Array<{
            periciaCodigo: string;
            grauAnterior: number;
            grauNovo: number;
          }>;
        }>;
        habilidadesParaPersistir: Array<{ habilidadeId: number }>;
        poderesGenericosNormalizados: Array<{
          habilidadeId: number;
          config: Prisma.JsonValue;
        }>;
        passivasResolvidas: { passivaIds: number[] };
        resistenciasFinais: Map<string, number>;
        dtoNormalizado: PersistenciaEstado['dtoNormalizado'];
      };
    },
    prisma: PrismaLike = this.prisma,
  ) {
    const { id, dataUpdateBase, estado } = params;

    // âœ… CORRIGIDO: Usar dataUpdateBase (nÃ£o dataBase)
    const dataUpdateSanitizado = sanitizarDataBase(dataUpdateBase);
    // âœ… NOVO: Preparar resistÃªncias
    const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(
      estado.resistenciasFinais,
      prisma,
    );

    // âœ… NOVO: Preparar itens do inventÃ¡rio
    const itensInventarioParaCriar = this.prepararItensInventarioParaCriacao(
      estado.dtoNormalizado.itensInventario ?? [],
    );

    // 1) update base (inclui proficienciasExtrasCodigos se vier no dataUpdateBase)
    await prisma.personagemBase.update({
      where: { id },
      data: dataUpdateSanitizado as Prisma.PersonagemBaseUpdateInput,
    });

    // 2) rebuild relaÃ§Ãµes
    await prisma.personagemBase.update({
      where: { id },
      data: {
        proficiencias: {
          deleteMany: {},
          create: estado.profsFinais.map((codigo) => ({
            proficiencia: { connect: { codigo } },
          })),
        },

        grausAprimoramento: {
          deleteMany: {},
          create: estado.grausFinais.map((g) => ({
            tipoGrau: { connect: { codigo: g.tipoGrauCodigo } },
            valor: g.valor,
          })),
        },

        pericias: {
          deleteMany: {},
          create: Array.from(estado.periciasMapCodigo.values()).map((p) => ({
            pericia: { connect: { id: p.periciaId } },
            grauTreinamento: p.grauTreinamento,
            bonusExtra: p.bonusExtra,
          })),
        },

        grausTreinamento: {
          deleteMany: {},
          create: (estado.grausTreinamento ?? []).flatMap((gt) =>
            gt.melhorias.map((m) => ({
              nivel: gt.nivel,
              periciaCodigo: m.periciaCodigo,
              grauAnterior: m.grauAnterior,
              grauNovo: m.grauNovo,
            })),
          ),
        },

        habilidadesBase: {
          deleteMany: {},
          create: estado.habilidadesParaPersistir.map((h) => ({
            habilidade: { connect: { id: h.habilidadeId } },
          })),
        },

        poderesGenericos: {
          deleteMany: {},
          create: estado.poderesGenericosNormalizados.map((p) => ({
            habilidade: { connect: { id: p.habilidadeId } },
            config: toNullableInputJson(p.config),
          })),
        },

        passivas: {
          deleteMany: {},
          ...(estado.passivasResolvidas.passivaIds.length
            ? {
                create: estado.passivasResolvidas.passivaIds.map(
                  (passivaId) => ({
                    passiva: { connect: { id: passivaId } },
                  }),
                ),
              }
            : {}),
        },

        // âœ… NOVO: Rebuild resistÃªncias
        resistencias: {
          deleteMany: {},
          ...(resistenciasParaCriar.length
            ? {
                create: resistenciasParaCriar,
              }
            : {}),
        },

        // âœ… CORRIGIDO: Rebuild inventÃ¡rio
        inventarioItens: {
          deleteMany: {},
          ...(itensInventarioParaCriar.length
            ? {
                create: itensInventarioParaCriar,
              }
            : {}),
        },
      },
      include: {
        cla: true,
        classe: true,
        resistencias: {
          include: {
            resistenciaTipo: true,
          },
        },
        inventarioItens: {
          include: {
            equipamento: true,
            modificacoes: {
              include: {
                modificacao: true,
              },
            },
          },
        },
      },
    });

    return prisma.personagemBase.findUnique({
      where: { id },
      include: {
        cla: true,
        classe: true,
        resistencias: {
          include: {
            resistenciaTipo: true,
          },
        },
        inventarioItens: {
          include: {
            equipamento: true,
            modificacoes: {
              include: {
                modificacao: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * âœ… CORRIGIDO: Prepara resistÃªncias para criaÃ§Ã£o no banco
   * Converte Map<codigo, valor> â†’ Array de objetos no formato correto para nested create
   */
  private async prepararResistenciasParaCriacao(
    resistenciasFinais: Map<string, number>,
    prisma: PrismaLike,
  ): Promise<
    Array<{
      valor: number;
      resistenciaTipo: { connect: { codigo: string } };
    }>
  > {
    if (!resistenciasFinais || resistenciasFinais.size === 0) {
      return [];
    }

    // Filtrar apenas resistÃªncias com valor > 0
    const resistenciasValidas = Array.from(resistenciasFinais.entries()).filter(
      ([, valor]) => valor > 0,
    );

    if (resistenciasValidas.length === 0) {
      return [];
    }

    // Validar que todos os cÃ³digos existem no banco
    const codigos = resistenciasValidas.map(([codigo]) => codigo);
    const resistenciasTipo = await prisma.resistenciaTipo.findMany({
      where: { codigo: { in: codigos } },
      select: { codigo: true },
    });

    const codigosValidos = new Set(resistenciasTipo.map((r) => r.codigo));

    // âœ… FORMATO CORRETO: { valor, resistenciaTipo: { connect: { codigo } } }
    return resistenciasValidas
      .filter(([codigo]) => codigosValidos.has(codigo))
      .map(([codigo, valor]) => ({
        valor,
        resistenciaTipo: { connect: { codigo } },
      }));
  }

  /**
   * âœ… NOVA FUNÃ‡ÃƒO: Prepara itens do inventÃ¡rio para criaÃ§Ã£o no Prisma
   * Converte array de ItemInventarioPayload â†’ formato correto para nested create
   */
  private prepararItensInventarioParaCriacao(
    itensInventario: Array<{
      equipamentoId: number;
      quantidade: number;
      equipado?: boolean;
      modificacoesIds?: number[];
      nomeCustomizado?: string | null;
      notas?: string | null;
    }>,
  ): Array<{
    equipamento: { connect: { id: number } };
    quantidade: number;
    equipado: boolean;
    nomeCustomizado?: string | null;
    notas?: string | null;
    modificacoes?: {
      create: Array<{
        modificacao: { connect: { id: number } };
      }>;
    };
  }> {
    if (!itensInventario || itensInventario.length === 0) {
      return [];
    }

    return itensInventario.map((item) => ({
      equipamento: { connect: { id: item.equipamentoId } },
      quantidade: item.quantidade,
      equipado: item.equipado ?? false,
      nomeCustomizado: item.nomeCustomizado || null,
      notas: item.notas || null,
      modificacoes:
        item.modificacoesIds && item.modificacoesIds.length > 0
          ? {
              create: item.modificacoesIds.map((modId) => ({
                modificacao: { connect: { id: modId } },
              })),
            }
          : undefined,
    }));
  }
}
