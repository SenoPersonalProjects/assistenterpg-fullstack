import { Injectable } from '@nestjs/common';
import { isDeepStrictEqual } from 'node:util';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { bloquearNpcSessaoTx, bloquearSessaoTx } from './sessao-concorrencia';
import { executarComRetryConcorrencia } from '../campanha/campanha-concorrencia';
import { BusinessException } from '../common/exceptions/business.exception';
import { controleTurnosAtivo } from './sessao-cena-atual';

type AcaoNpc = {
  nome: string;
  execucao?: string;
  custoEA?: number;
  custoPE?: number;
  sustentacaoEA?: number;
  frequencia?: string;
  estado?: string;
  quantidade?: number;
  efeito?: string;
  descricao?: string;
  dano?: string;
};
type EstadoNpc = {
  cenaId?: number | null;
  sustentacaoTipos?: Record<string, string>;
  penalidadeDefesa?: number;
  rodada?: number;
  usos: string[];
  sustentacoes: Record<string, number>;
  ultimaSustentacao?: number;
  biombos: Array<{ id: string; pv: number; defesa: number; rd: number }>;
  recinto?: { modo: 'FORA' | 'DENTRO'; danificado: boolean; dobrado: boolean };
  marcas: string[];
  votoPessoal?: boolean;
  perdeuTecnica?: boolean;
  reacaoEspecial?: boolean;
  padrao?: boolean;
  movimento?: boolean;
};
export class UsarAcaoNpcDto {
  @IsUUID('4') clientRequestId!: string;
  @IsInt() @Min(0) acaoIndice!: number;
  @IsOptional()
  @IsIn([
    'USAR',
    'REGISTRAR_USO',
    'ENCERRAR',
    'ZONA',
    'DANIFICAR_BIOMBO',
    'REMOVER_MARCA',
    'EDITAR',
  ])
  operacao?: string;
  @IsOptional() @IsString() @MaxLength(120) nome?: string;
  @IsOptional() @IsString() @MaxLength(2000) efeito?: string;
  @IsOptional() @IsString() @MaxLength(120) teste?: string;
  @IsOptional() @IsString() @MaxLength(120) danoAcao?: string;
  @IsOptional() @IsInt() @Min(0) @Max(999) custoEA?: number;
  @IsOptional() @IsInt() @Min(0) @Max(999) custoPE?: number;
  @IsOptional() @IsIn(['FORA', 'DENTRO']) modo?: 'FORA' | 'DENTRO';
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  personagensNaZona?: number[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  npcsNaZona?: number[];
  @IsOptional() @IsString() alvo?: string;
  @IsOptional() @IsString() biomboId?: string;
  @IsOptional() @IsInt() @Min(0) @Max(9999) dano?: number;
}
const json = (v: unknown) =>
  JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
function estadoNpc(value: unknown): EstadoNpc {
  return {
    usos: [],
    sustentacoes: {},
    biombos: [],
    marcas: [],
    ...(value && typeof value === 'object' ? value : {}),
  };
}
function falha(mensagem: string): never {
  throw new BusinessException(mensagem, 'SESSAO_NPC_ACAO_INVALIDA');
}
@Injectable()
export class NpcAcoesService {
  constructor(private readonly prisma: PrismaService) {}
  async usar(
    campanhaId: number,
    sessaoId: number,
    npcSessaoId: number,
    usuarioId: number,
    dto: UsarAcaoNpcDto,
  ) {
    await executarComRetryConcorrencia('usar ação de NPC', () =>
      this.prisma.$transaction(async (tx) => {
        await bloquearSessaoTx(tx, campanhaId, sessaoId);
        await bloquearNpcSessaoTx(tx, campanhaId, sessaoId, npcSessaoId);
        const npc = await tx.npcAmeacaSessao.findFirst({
          where: { id: npcSessaoId, sessaoId, sessao: { campanhaId } },
          include: {
            sessao: { include: { campanha: { include: { membros: true } } } },
            personagemControladorSessao: true,
            personagemDono: true,
          },
        });
        if (!npc || npc.sessao.status === 'ENCERRADA')
          falha('NPC indisponível nesta sessão.');
        const campanha = npc.sessao.campanha;
        const membro = campanha.membros.find((m) => m.usuarioId === usuarioId);
        const mestre =
          campanha.donoId === usuarioId || membro?.papel === 'MESTRE';
        if (
          !mestre &&
          (!membro ||
            (npc.controladorUsuarioId !== usuarioId &&
              npc.personagemControladorSessao?.controladorUsuarioId !==
                usuarioId &&
              npc.personagemDono?.donoId !== usuarioId))
        )
          falha('Você não controla este NPC.');
        if (npc.entidadeVinculadaId)
          falha('Use o painel da técnica para ações do shikigami.');
        const repetido = await tx.eventoSessao.findUnique({
          where: {
            sessaoId_solicitanteUsuarioId_clientRequestId: {
              sessaoId,
              solicitanteUsuarioId: usuarioId,
              clientRequestId: dto.clientRequestId,
            },
          },
        });
        if (repetido) {
          if (
            !isDeepStrictEqual(
              (repetido.dados as { intencao?: unknown })?.intencao,
              json(dto),
            )
          )
            falha('Identificador utilizado por outra ação.');
          return;
        }
        const acoes = npc.acoesGuia as AcaoNpc[] | null;
        const acao = Array.isArray(acoes) ? acoes[dto.acaoIndice] : undefined;
        if (!acao) falha('Ação não encontrada.');
        const st = estadoNpc(npc.estadoAcoes);
        if (st.rodada !== npc.sessao.rodadaAtual || st.cenaId !== npc.cenaId) {
          st.cenaId = npc.cenaId;
          st.rodada = npc.sessao.rodadaAtual;
          st.usos = [];
          st.reacaoEspecial = false;
          st.padrao = false;
          st.movimento = false;
        }
        let custoEA = 0,
          custoPE = 0;
        const operacao = dto.operacao ?? 'USAR';
        if (operacao === 'EDITAR') {
          if (!npc.npcAmeacaId)
            falha('Edição de habilidades exige uma ficha de NPC do catálogo.');
          if (dto.nome !== undefined && !dto.nome.trim())
            falha('A habilidade precisa de um nome.');
          if (dto.nome && dto.nome !== acao.nome && st.sustentacoes[acao.nome])
            falha('Encerre a sustentação antes de renomear a habilidade.');
          const editada = {
            ...acao,
            ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
            ...(dto.efeito !== undefined ? { efeito: dto.efeito } : {}),
            ...(dto.teste !== undefined ? { teste: dto.teste } : {}),
            ...(dto.danoAcao !== undefined ? { dano: dto.danoAcao } : {}),
            ...(dto.custoEA !== undefined ? { custoEA: dto.custoEA } : {}),
            ...(dto.custoPE !== undefined ? { custoPE: dto.custoPE } : {}),
          };
          const novas = [...acoes!];
          novas[dto.acaoIndice] = editada;
          await tx.npcAmeacaSessao.update({
            where: { id: npcSessaoId },
            data: { acoesGuia: json(novas) },
          });
          const anterior = await tx.npcAmeacaCampanha.findUnique({
            where: {
              campanhaId_npcAmeacaId: {
                campanhaId,
                npcAmeacaId: npc.npcAmeacaId,
              },
            },
          });
          const ficha = {
            ...((anterior?.ficha as object) ?? {}),
            acoes: novas,
          };
          await tx.npcAmeacaCampanha.upsert({
            where: {
              campanhaId_npcAmeacaId: {
                campanhaId,
                npcAmeacaId: npc.npcAmeacaId,
              },
            },
            create: {
              campanhaId,
              npcAmeacaId: npc.npcAmeacaId,
              ficha: json(ficha),
            },
            update: { ficha: json(ficha) },
          });
        } else if (operacao === 'ENCERRAR') {
          delete st.sustentacoes[acao.nome];
          if (st.sustentacaoTipos) delete st.sustentacaoTipos[acao.nome];
          if (acao.estado === 'RECINTO') delete st.recinto;
          if (acao.estado === 'DOMINIO_SIMPLES')
            await tx.defesaAntiDominioSessao.updateMany({
              where: {
                npcSessaoId,
                sessaoId,
                ativa: true,
                tipo: 'DOMINIO_SIMPLES',
              },
              data: {
                ativa: false,
                encerradaEm: new Date(),
                motivoEncerramento: 'Encerrado pelo controlador',
              },
            });
        } else if (operacao === 'DANIFICAR_BIOMBO') {
          if (!mestre)
            falha('Somente o mestre aplica o dano confirmado ao biombo.');
          const biombo = st.biombos.find((b) => b.id === dto.biomboId);
          if (!biombo) falha('Biombo não encontrado.');
          biombo.pv = Math.max(
            0,
            biombo.pv - Math.max(0, (dto.dano ?? 0) - biombo.rd),
          );
          st.biombos = st.biombos.filter((b) => b.pv > 0);
        } else if (operacao === 'ZONA') {
          if (acao.estado !== 'DOMINIO_SIMPLES')
            falha('Esta ação não possui zona antidomínio.');
          await this.atualizarZona(tx, sessaoId, npcSessaoId, dto);
        } else if (operacao === 'REMOVER_MARCA') {
          st.marcas = st.marcas.filter((m) => m !== dto.alvo);
        } else {
          if (st.perdeuTecnica && !acao.dano)
            falha('Tobari perdeu Ato Cego permanentemente por voto.');
          const turnosAtivos = controleTurnosAtivo(npc.sessao.cenaAtualTipo);
          if (
            turnosAtivos &&
            acao.frequencia === 'RODADA' &&
            st.usos.includes(acao.nome)
          )
            falha('Ação já utilizada nesta rodada.');
          if (
            st.votoPessoal &&
            [
              'Desaparecer',
              'Mudança de Palco',
              'Agora Você Não Vê',
              'Prestidigitação Defensiva',
            ].includes(acao.nome)
          )
            falha('O voto permanente impede Ato Cego sobre Tobari.');
          if (turnosAtivos && acao.frequencia === 'RODADA')
            st.usos.push(acao.nome);
          custoEA = acao.custoEA ?? 0;
          custoPE = acao.custoPE ?? 0;
          if (custoPE && !npc.peMax)
            falha('Este NPC simplificado não possui PE.');
          if (acao.sustentacaoEA) {
            if (st.sustentacoes[acao.nome])
              falha('Habilidade já está sustentada.');
            st.sustentacoes[acao.nome] = acao.sustentacaoEA;
            (st.sustentacaoTipos ??= {})[acao.nome] =
              operacao === 'REGISTRAR_USO' ? 'RECURSO' : (acao.estado ?? '');
            st.ultimaSustentacao = npc.sessao.rodadaAtual;
          }
          switch (operacao === 'REGISTRAR_USO' ? undefined : acao.estado) {
            case 'DEFESA_MENOS_5':
              if (!st.penalidadeDefesa) {
                st.penalidadeDefesa = 5;
                await tx.npcAmeacaSessao.update({
                  where: { id: npcSessaoId },
                  data: { defesa: { decrement: st.penalidadeDefesa } },
                });
              }
              break;
            case 'BIOMBO':
              for (let i = 0; i < (acao.quantidade ?? 1); i++)
                st.biombos.push({
                  id: `${dto.clientRequestId}:${i}`,
                  pv: 30,
                  defesa: 18,
                  rd: 5,
                });
              st.biombos = st.biombos.slice(-3);
              break;
            case 'RECINTO':
              st.recinto = {
                modo: dto.modo ?? 'FORA',
                danificado: false,
                dobrado: false,
              };
              break;
            case 'TROCAR_MODO':
              if (!st.recinto) falha('Recinto não está ativo.');
              st.recinto.modo =
                dto.modo ?? (st.recinto.modo === 'FORA' ? 'DENTRO' : 'FORA');
              break;
            case 'DANIFICAR':
              if (!st.recinto) falha('Recinto não está ativo.');
              st.recinto.danificado = true;
              break;
            case 'REPARAR':
              if (!st.recinto) falha('Recinto não está ativo.');
              st.recinto.danificado = false;
              break;
            case 'DOBRAR':
              if (!st.recinto) falha('Recinto não está ativo.');
              st.recinto.dobrado = true;
              break;
            case 'MARCA':
              if (!dto.alvo) falha('Identifique o cúmplice voluntário tocado.');
              if (
                st.marcas.includes(dto.alvo) ||
                st.marcas.length >= (npc.presenca ?? 4)
              )
                falha('Marca repetida ou limite de cúmplices atingido.');
              st.marcas.push(dto.alvo);
              break;
            case 'VOTO_PESSOAL':
              st.votoPessoal = true;
              break;
            case 'VOTO_TECNICA':
              st.perdeuTecnica = true;
              st.sustentacoes = {};
              st.marcas = [];
              break;
            case 'DOMINIO_SIMPLES':
              await tx.defesaAntiDominioSessao.create({
                data: {
                  sessaoId,
                  cenaId: npc.cenaId!,
                  npcSessaoId,
                  tipo: 'DOMINIO_SIMPLES',
                  integridadeMax: 4,
                  integridadeAtual: 4,
                  criadoPorUsuarioId: usuarioId,
                  zona: {
                    raioMetros: 3,
                    movel: true,
                    personagens: dto.personagensNaZona ?? [],
                    npcs: [
                      ...new Set([npcSessaoId, ...(dto.npcsNaZona ?? [])]),
                    ],
                  },
                },
              });
              await this.atualizarZona(tx, sessaoId, npcSessaoId, dto);
              break;
          }
        }
        if ((npc.eaAtual ?? 0) < custoEA || (npc.peAtual ?? 0) < custoPE)
          falha('EA ou PE insuficientes.');
        await tx.npcAmeacaSessao.update({
          where: { id: npcSessaoId },
          data: {
            estadoAcoes: json(st),
            ...(custoEA ? { eaAtual: { decrement: custoEA } } : {}),
            ...(custoPE ? { peAtual: { decrement: custoPE } } : {}),
          },
        });
        if (npc.npcAmeacaId && (st.votoPessoal || st.perdeuTecnica)) {
          const where = {
            campanhaId_npcAmeacaId: {
              campanhaId,
              npcAmeacaId: npc.npcAmeacaId,
            },
          };
          const anterior = await tx.npcAmeacaCampanha.findUnique({ where });
          const ficha = json({
            ...((anterior?.ficha as Record<string, unknown>) ?? {}),
            estadoAcoes: {
              votoPessoal: st.votoPessoal ?? false,
              perdeuTecnica: st.perdeuTecnica ?? false,
            },
          });
          await tx.npcAmeacaCampanha.upsert({
            where,
            create: { campanhaId, npcAmeacaId: npc.npcAmeacaId, ficha },
            update: { ficha },
          });
        }
        await tx.eventoSessao.create({
          data: {
            sessaoId,
            cenaId: npc.cenaId,
            solicitanteUsuarioId: usuarioId,
            clientRequestId: dto.clientRequestId,
            tipoEvento: 'NPC_ACAO_USADA',
            dados: json({
              intencao: dto,
              npcSessaoId,
              nome: npc.nomeExibicao,
              acao: acao.nome,
              operacao,
              custoEA,
              custoPE,
              efeito: acao.efeito ?? acao.descricao,
            }),
          },
        });
      }),
    );
  }
  private async atualizarZona(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    npcSessaoId: number,
    dto: UsarAcaoNpcDto,
  ) {
    const personagens = dto.personagensNaZona ?? [],
      npcs = [...new Set([npcSessaoId, ...(dto.npcsNaZona ?? [])])];
    const [ps, ns] = await Promise.all([
      tx.personagemSessao.count({
        where: { sessaoId, id: { in: personagens } },
      }),
      tx.npcAmeacaSessao.count({ where: { sessaoId, id: { in: npcs } } }),
    ]);
    if (ps !== new Set(personagens).size || ns !== npcs.length)
      falha('A zona contém participantes fora da sessão.');
    const alteradas = await tx.defesaAntiDominioSessao.updateMany({
      where: { sessaoId, npcSessaoId, tipo: 'DOMINIO_SIMPLES', ativa: true },
      data: { zona: { raioMetros: 3, movel: true, personagens, npcs } },
    });
    if (!alteradas.count) falha('Domínio Simples não está ativo.');
  }
}
export async function iniciarTurnoNpcTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  npcSessaoId: number,
) {
  const npc = await tx.npcAmeacaSessao.findFirst({
    where: { id: npcSessaoId, sessaoId },
  });
  if (!npc?.estadoAcoes) return;
  const st = estadoNpc(npc.estadoAcoes);
  const restaurarDefesa = st.penalidadeDefesa ?? 0;
  delete st.penalidadeDefesa;
  st.padrao = false;
  st.movimento = false;
  if (st.recinto) st.recinto.dobrado = false;
  await tx.npcAmeacaSessao.update({
    where: { id: npc.id },
    data: {
      estadoAcoes: json(st),
      ...(restaurarDefesa ? { defesa: { increment: restaurarDefesa } } : {}),
    },
  });
}

export async function sustentarAcoesNpcTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  rodada: number,
) {
  const npcs = await tx.npcAmeacaSessao.findMany({
    where: { sessaoId, estadoAcoes: { not: Prisma.DbNull } },
  });
  for (const npc of npcs) {
    const st = estadoNpc(npc.estadoAcoes);
    if ((st.ultimaSustentacao ?? 0) >= rodada) continue;
    let ea = npc.eaAtual ?? 0;
    for (const [nome, custo] of Object.entries(st.sustentacoes)) {
      const tipo =
        st.sustentacaoTipos?.[nome] ??
        (nome === 'Domínio Simples'
          ? 'DOMINIO_SIMPLES'
          : nome === 'Recinto Velado'
            ? 'RECINTO'
            : '');
      if (
        tipo === 'DOMINIO_SIMPLES' &&
        !(await tx.defesaAntiDominioSessao.findFirst({
          where: {
            sessaoId,
            npcSessaoId: npc.id,
            ativa: true,
            integridadeAtual: { gt: 0 },
            tipo: 'DOMINIO_SIMPLES',
          },
          select: { id: true },
        }))
      ) {
        delete st.sustentacoes[nome];
        if (st.sustentacaoTipos) delete st.sustentacaoTipos[nome];
        continue;
      }
      if (ea >= custo) ea -= custo;
      else {
        delete st.sustentacoes[nome];
        if (st.sustentacaoTipos) delete st.sustentacaoTipos[nome];
        if (tipo === 'RECINTO') delete st.recinto;
        if (tipo === 'DOMINIO_SIMPLES')
          await tx.defesaAntiDominioSessao.updateMany({
            where: {
              sessaoId,
              npcSessaoId: npc.id,
              ativa: true,
              tipo: 'DOMINIO_SIMPLES',
            },
            data: {
              ativa: false,
              encerradaEm: new Date(),
              motivoEncerramento: 'EA insuficiente para sustentar',
            },
          });
      }
    }
    st.ultimaSustentacao = rodada;
    await tx.npcAmeacaSessao.update({
      where: { id: npc.id },
      data: { eaAtual: ea, estadoAcoes: json(st) },
    });
    if (ea !== npc.eaAtual)
      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: npc.cenaId,
          tipoEvento: 'NPC_SUSTENTACAO_COBRADA',
          dados: json({
            npcSessaoId: npc.id,
            custoEA: (npc.eaAtual ?? 0) - ea,
            rodada,
          }),
        },
      });
  }
}
