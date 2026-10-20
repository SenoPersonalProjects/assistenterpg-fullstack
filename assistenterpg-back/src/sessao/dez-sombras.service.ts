import { criarManifestacaoVinculadaTx } from './entidades-vinculadas-manifestacao';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Prisma, TipoNpcAmeaca, TamanhoNpcAmeaca } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  bloquearPersonagemCampanhaTx,
  executarComRetryConcorrencia,
} from '../campanha/campanha-concorrencia';
import { bloquearSessaoTx } from './sessao-concorrencia';
import {
  buscarCenaAtualSessao,
  controleTurnosAtivo,
} from './sessao-cena-atual';
import {
  CATALOGO_DEZ_SOMBRAS,
  REGRAS_FLOR_CAIDA,
  HERANCAS_DEZ_SOMBRAS,
  obterSombra,
  SombraCatalogo,
} from './dez-sombras.catalogo';
import {
  cargaSombras,
  comandarSombra,
  configSombras,
  resolverConfigSombrasPersonagem,
  consumirAcaoSombra,
  consumirAcaoUsuario,
  custoInvocacao,
  descansarSombras,
  estadoSombra,
  falhaSombras,
  iniciarTurnoSombras,
  lerEstadoSombras,
  liberarSombra,
  liberarAcoesSombrasModoLivre,
  podeManifestar,
  prepararAspectosSombras,
  registrarDanoSombra,
  sombrasAtivas,
} from './dez-sombras.engine';
import { AcaoDezSombrasDto } from './dto/dez-sombras.dto';
import {
  FONTE_CONDICOES_SOMBRAS,
  lerRelogioSombras,
} from './dez-sombras.condicoes';

const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const dados = (quantidade: number, faces: number) =>
  Array.from({ length: quantidade }, () => randomInt(1, faces + 1)).reduce(
    (a, b) => a + b,
    0,
  );
export function snapshotSombra(s: SombraCatalogo) {
  const [agilidade, forca, intelecto, presenca, vigor] = s.atributos;
  return {
    nome: s.nome,
    fichaTipo: 'NPC' as const,
    tipoNpc: TipoNpcAmeaca.OUTRO,
    tamanho: s.tamanho as TamanhoNpcAmeaca,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    defesa: s.defesa,
    pontosVidaMax: s.pv,
    pontosVidaAtual: s.pv,
    deslocamentoMetros: s.movimento,
    percepcao: s.pericias.PERCEPCAO ?? 0,
    iniciativa: s.pericias.INICIATIVA ?? 0,
    fortitude: s.pericias.FORTITUDE ?? 0,
    reflexos: s.pericias.REFLEXOS ?? 0,
    vontade: s.pericias.VONTADE ?? 0,
    luta: s.pericias.LUTA ?? 0,
    jujutsu: s.pericias.JUJUTSU ?? 0,
    rd: s.rd.TODOS ?? 0,
    resistencias: json(s.rd),
    periciasEspeciais: json(
      Object.entries(s.pericias).map(([codigo, bonus]) => ({
        codigo,
        nome: codigo,
        bonus,
      })),
    ),
    passivas: json(s.acoes.filter((a) => a.execucao === 'PASSIVA')),
    acoes: json(s.acoes.filter((a) => a.execucao !== 'PASSIVA')),
    custos: json({
      ea: s.ea,
      pe: s.pe,
      carga: s.carga,
      sustentacao: s.sustentacao,
    }),
    config: json({
      dezSombras: s.codigo,
      familia: s.familia,
      enxame: s.enxame ?? false,
      voo: s.voo ?? null,
    }),
    precisaRecalculo: false,
  };
}

@Injectable()
export class DezSombrasService {
  constructor(private readonly prisma: PrismaService) {}

  private async acesso(
    campanhaId: number,
    sessaoId: number,
    personagemSessaoId: number,
    usuarioId: number,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    const personagem = await db.personagemSessao.findFirst({
      where: { id: personagemSessaoId, sessaoId, sessao: { campanhaId } },
      include: {
        sessao: { include: { campanha: { include: { membros: true } } } },
        personagemCampanha: {
          include: {
            personagemBase: true,
            tecnicaInata: true,
            tecnicaInataPropria: true,
          },
        },
      },
    });
    if (!personagem) falhaSombras('Personagem não está nesta sessão.');
    const campanha = personagem.sessao.campanha;
    const membro = campanha.membros.find((m) => m.usuarioId === usuarioId);
    const mestre = campanha.donoId === usuarioId || membro?.papel === 'MESTRE';
    if (
      !mestre &&
      (!membro ||
        (personagem.controladorUsuarioId !== usuarioId &&
          personagem.personagemCampanha.donoId !== usuarioId))
    ) {
      falhaSombras('Você não controla esta ficha.');
    }
    const pc = personagem.personagemCampanha;
    const config = resolverConfigSombrasPersonagem(pc);
    if (!config)
      falhaSombras('Esta ficha não possui a Técnica das Dez Sombras.');
    return { personagem, pc, config, mestre };
  }

  async obter(
    campanhaId: number,
    sessaoId: number,
    personagemSessaoId: number,
    usuarioId: number,
  ) {
    const { personagem, pc, config, mestre } = await this.acesso(
      campanhaId,
      sessaoId,
      personagemSessaoId,
      usuarioId,
    );
    const estado = lerEstadoSombras(pc.estadoDezSombras, config);
    if (!controleTurnosAtivo(personagem.sessao.cenaAtualTipo))
      liberarAcoesSombrasModoLivre(estado);
    const dominioAtivo = !!(await this.prisma.dominioSessao.findFirst({
      where: {
        sessaoId,
        personagemSessaoId,
        estado: 'ATIVO',
        habilidadeTecnica: { codigo: 'INATA_DEZ_SOMBRAS_JARDIM' },
      },
      select: { id: true },
    }));
    const florAtiva =
      !!(await this.prisma.personagemSessaoHabilidadeSustentada.findFirst({
        where: {
          sessaoId,
          personagemSessaoId,
          ativa: true,
          habilidadeTecnica: { codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR' },
        },
        select: { id: true },
      }));
    const instancias = await this.prisma.npcAmeacaSessao.findMany({
      where: { sessaoId, personagemControladorSessaoId: personagemSessaoId },
      include: { entidadeVinculada: true },
    });
    for (const npc of instancias) {
      const codigo = (
        npc.entidadeVinculada?.config as { dezSombras?: string } | null
      )?.dezSombras;
      if (codigo && estado.sombras[codigo])
        estado.sombras[codigo].pv = npc.pontosVidaAtual;
    }
    return {
      personagemSessaoId,
      nome: pc.nome,
      mestre,
      dominioAtivo,
      flor: { ativa: florAtiva, ...REGRAS_FLOR_CAIDA },
      encerrada: personagem.sessao.status === 'ENCERRADA',
      config,
      estado,
      recursos: {
        ea: pc.eaAtual,
        pe: pc.peAtual,
        limite: pc.limitePeEaPorTurno,
        carga: cargaSombras(estado),
      },
      catalogo: CATALOGO_DEZ_SOMBRAS.map((s) => ({
        ...s,
        acoes: s.acoes.map((a) => ({
          ...a,
          efeito: dominioAtivo
            ? a.efeito?.replace(
                /DT\s?(\d+)/g,
                (_, dt: string) => `DT${Number(dt) + 2}`,
              )
            : a.efeito,
        })),
        invocacao: custoInvocacao(config, s),
      })),
      herancas: HERANCAS_DEZ_SOMBRAS,
    };
  }

  async executar(
    campanhaId: number,
    sessaoId: number,
    personagemSessaoId: number,
    usuarioId: number,
    dto: AcaoDezSombrasDto,
  ) {
    await executarComRetryConcorrencia('usar Dez Sombras', () =>
      this.prisma.$transaction(
        async (tx) => {
          await bloquearSessaoTx(tx, campanhaId, sessaoId);
          const { personagem, pc, config, mestre } = await this.acesso(
            campanhaId,
            sessaoId,
            personagemSessaoId,
            usuarioId,
            tx,
          );
          if (personagem.sessao.status === 'ENCERRADA')
            falhaSombras('Sessão encerrada.');
          await bloquearPersonagemCampanhaTx(tx, campanhaId, pc.id);
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
              falhaSombras('Identificador já utilizado por outra ação.');
            return;
          }
          const atual = await tx.personagemCampanha.findUniqueOrThrow({
            where: { id: pc.id },
          });
          const estado = lerEstadoSombras(atual.estadoDezSombras, config);
          const turnosAtivos = controleTurnosAtivo(
            personagem.sessao.cenaAtualTipo,
          );
          const cenaAtual = await buscarCenaAtualSessao(tx, sessaoId);
          const rodada = `${sessaoId}:${personagem.sessao.rodadaAtual}`;
          // Sem relógio de turnos não há orçamento esgotável de ações.
          if (estado.cenaId !== cenaAtual?.id) {
            liberarAcoesSombrasModoLivre(estado);
            estado.cenaId = cenaAtual?.id;
          }
          if (!turnosAtivos) liberarAcoesSombrasModoLivre(estado);
          if (!estado.turno)
            iniciarTurnoSombras(estado, `${rodada}:inicial`, rodada);
          if (estado.rodada !== rodada) {
            estado.rodada = rodada;
            estado.reacaoSombrasUsada = false;
            estado.comboUsado = false;
            estado.sinergiaUsada = false;
            estado.cloneUsado = false;
            estado.reacaoEspecialUsuarioUsada = false;
          }
          let sombra = obterSombra(dto.sombra);
          if (sombra.familia === 'COELHO') {
            const atualCoelho = sombrasAtivas(estado).find(
              (codigo) => obterSombra(codigo).familia === 'COELHO',
            );
            if (atualCoelho) sombra = obterSombra(atualCoelho);
          }
          let registro = estadoSombra(estado, sombra.codigo);
          let custoEA = 0,
            custoPE = 0;
          const cena = cenaAtual;
          if (!cena) falhaSombras('Sessão sem cena.');
          const efeitos: Record<string, unknown> = {};
          if (
            ![
              'LIBERAR',
              'ENCERRAR_ASPECTO',
              'ADAPTACAO',
              'HERANCA',
              'CONCLUIR_RITUAL',
              'APLICAR_CONDICAO',
              'ENCERRAR_VENENO',
              'FLOR_DEFESA',
              'MOVIMENTO_USUARIO',
              'VINCULO_OROCHI',
            ].includes(dto.acao)
          ) {
            const esgotamento = await tx.condicaoPersonagemSessao.findFirst({
              where: {
                personagemSessaoId,
                sessaoId,
                ativo: true,
                condicao: { codigo: 'ESGOTAMENTO_TECNICA' },
              },
              select: { id: true },
            });
            if (esgotamento)
              falhaSombras(
                'Técnica Inata esgotada; aguarde as duas rodadas previstas.',
              );
          }
          // Releitura de PV/condições evita reviver uma criatura por snapshot antigo.
          const ativas = sombrasAtivas(estado);
          const instancias = await tx.npcAmeacaSessao.findMany({
            where: {
              id: {
                in: ativas.map((c) => estadoSombra(estado, c).npcSessaoId!),
              },
            },
            include: { condicoes: true },
          });
          const mortes: Array<{
            id: number;
            entidadeId: number | null;
            permanente: boolean;
          }> = [];
          let mudanca:
            | {
                id: number;
                entidadeId: number | null;
                sombra: SombraCatalogo;
                pv: number;
              }
            | undefined;
          for (const codigo of ativas) {
            const st = estadoSombra(estado, codigo);
            const npc = instancias.find((n) => n.id === st.npcSessaoId);
            if (npc) {
              st.pv = npc.pontosVidaAtual;
              const novaForma = registrarDanoSombra(estado, codigo, st.pv);
              if (novaForma !== codigo && st.pv > 0) {
                const nova = obterSombra(novaForma);
                mudanca = {
                  id: npc.id,
                  entidadeId: npc.entidadeVinculadaId,
                  sombra: nova,
                  pv: st.pv,
                };
                if (sombra.codigo === codigo) sombra = nova;
              }
              if (st.pv <= 0) {
                registrarDanoSombra(estado, codigo, 0);
                mortes.push({
                  id: npc.id,
                  entidadeId: npc.entidadeVinculadaId,
                  permanente: !obterSombra(codigo).componentes,
                });
              }
            } else liberarSombra(estado, codigo);
          }
          if (mudanca) {
            const { id, entidadeId, sombra: nova, pv } = mudanca;
            await tx.npcAmeacaSessao.update({
              where: { id },
              data: {
                nomeExibicao: nova.nome,
                tamanho: nova.tamanho,
                pontosVidaMax: nova.pv,
                acoesGuia: snapshotSombra(nova).acoes,
              },
            });
            if (entidadeId)
              await tx.personagemCampanhaEntidadeVinculada.update({
                where: { id: entidadeId },
                data: { ...snapshotSombra(nova), pontosVidaAtual: pv },
              });
          }
          if (mortes.length) {
            await tx.npcAmeacaSessao.deleteMany({
              where: { id: { in: mortes.map((m) => m.id) } },
            });
            await tx.personagemCampanhaEntidadeVinculada.updateMany({
              where: {
                id: {
                  in: mortes
                    .filter((m) => m.permanente && m.entidadeId)
                    .map((m) => m.entidadeId!),
                },
              },
              data: { pontosVidaAtual: 0, estado: 'DESTRUIDO' },
            });
            await tx.personagemCampanhaEntidadeVinculada.updateMany({
              where: {
                id: {
                  in: mortes
                    .filter((m) => !m.permanente && m.entidadeId)
                    .map((m) => m.entidadeId!),
                },
              },
              data: { pontosVidaAtual: 0, estado: 'DISPONIVEL' },
            });
          }
          registro = estadoSombra(estado, sombra.codigo);
          const criarManifestacao = async (ritual = false) => {
            const tecnica = await tx.tecnicaAmaldicoada.findUniqueOrThrow({
              where: { codigo: 'DEZ_SOMBRAS' },
            });
            let entidade =
              await tx.personagemCampanhaEntidadeVinculada.findFirst({
                where: {
                  personagemCampanhaId: pc.id,
                  tecnicaOrigemId: tecnica.id,
                  config: { path: '$.dezSombras', equals: sombra.codigo },
                },
              });
            if (!entidade)
              entidade = await tx.personagemCampanhaEntidadeVinculada.create({
                data: {
                  ...snapshotSombra(sombra),
                  campanhaId,
                  personagemCampanhaId: pc.id,
                  tipo: 'SHIKIGAMI',
                  tecnicaOrigemId: tecnica.id,
                  criadoPorId: usuarioId,
                },
              });
            const snap = snapshotSombra(sombra);
            const npc = await criarManifestacaoVinculadaTx(
              tx,
              {
                ...entidade,
                ...snap,
                passivas: snap.passivas as Prisma.JsonValue,
                acoes: snap.acoes as Prisma.JsonValue,
              },
              {
                sessaoId,
                cenaId: cena.id,
                personagemSessaoId,
                hostil: ritual,
                nomeExibicao: ritual
                  ? `${sombra.nome} — Ritual hostil`
                  : sombra.nome,
                pontosVidaAtual: ritual ? sombra.pv : registro.pv,
                notasCena: ritual
                  ? 'Ritual de Exorcismo: hostil, independente; ajuda externa invalida dominação.'
                  : null,
              },
            );
            if (!ritual) {
              registro.npcSessaoId = npc.id;
              registro.sessaoId = sessaoId;
              registro.invocado = true;
              const condicoes = registro.condicoes.filter(
                (c) =>
                  Number.isInteger(Number(c.codigo)) && Number(c.codigo) > 0,
              );
              if (condicoes.length)
                await tx.condicaoPersonagemSessao.createMany({
                  data: condicoes.map((condicao) => ({
                    sessaoId,
                    cenaId: cena.id,
                    npcSessaoId: npc.id,
                    condicaoId: Number(condicao.codigo),
                    turnoAplicacao: personagem.sessao.rodadaAtual,
                    duracaoModo:
                      condicao.modo ??
                      (condicao.persistente ? 'ATE_REMOVER' : 'TURNOS_ALVO'),
                    fonteCodigo: condicao.fonte,
                    observacao: condicao.observacao,
                    duracaoValor: condicao.restante,
                    restanteDuracao: condicao.restante,
                  })),
                });
            } else {
              (estado.rituais ??= {})[sombra.codigo] = { npcSessaoId: npc.id };
            }
            efeitos.npcSessaoId = npc.id;
          };
          const removerManifestacao = async (codigo: string) => {
            const st = estadoSombra(estado, codigo);
            if (st.npcSessaoId) {
              const npc = await tx.npcAmeacaSessao.findUnique({
                where: { id: st.npcSessaoId },
                include: { condicoes: true },
              });
              if (npc) {
                st.pv = npc.pontosVidaAtual;
                st.condicoes = npc.condicoes
                  .filter((c) => c.ativo)
                  .map((c) => ({
                    codigo: String(c.condicaoId),
                    restante: c.restanteDuracao,
                    persistente: c.duracaoModo === 'ATE_REMOVER',
                    modo: c.duracaoModo,
                    fonte: c.fonteCodigo,
                    observacao: c.observacao,
                  }));
                if (npc.entidadeVinculadaId)
                  await tx.personagemCampanhaEntidadeVinculada.update({
                    where: { id: npc.entidadeVinculadaId },
                    data: {
                      pontosVidaAtual: st.pv,
                      estado: st.destruido
                        ? 'DESTRUIDO'
                        : st.indisponivelAteDormir
                          ? 'DESCARREGADO'
                          : 'DISPONIVEL',
                    },
                  });
                await tx.npcAmeacaSessao.delete({ where: { id: npc.id } });
              }
            }
            liberarSombra(estado, codigo);
          };
          if (
            [
              'INVOCAR',
              'USAR',
              'ASPECTO',
              'ECO',
              'ACERTO',
              'RITUAL',
              'CLONE',
            ].includes(dto.acao)
          )
            estado.podePrepararAspectos = false;
          switch (dto.acao) {
            case 'PREPARAR_ASPECTOS':
              prepararAspectosSombras(config, estado, dto.aspectos ?? []);
              break;
            case 'MOVIMENTO_USUARIO': {
              consumirAcaoUsuario(estado, 'MOVIMENTO');
              await tx.personagemSessaoHabilidadeSustentada.updateMany({
                where: {
                  sessaoId,
                  personagemSessaoId,
                  ativa: true,
                  habilidadeTecnica: {
                    codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR',
                  },
                },
                data: { ativa: false, desativadaEm: new Date() },
              });
              efeitos.efeito =
                'Deslocamento voluntário: Emoção da Flor Caída encerrada.';
              break;
            }
            case 'FLOR_DEFESA': {
              if (
                !dto.gastoEA ||
                dto.gastoEA < 1 ||
                dto.gastoEA > REGRAS_FLOR_CAIDA.gastoMaximoEA
              )
                falhaSombras(
                  'Escolha de 1 a 3 EA por ocorrência de dano direto do Acerto Garantido.',
                );
              const flor =
                await tx.personagemSessaoHabilidadeSustentada.findFirst({
                  where: {
                    sessaoId,
                    personagemSessaoId,
                    ativa: true,
                    habilidadeTecnica: {
                      codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR',
                    },
                  },
                  select: { id: true },
                });
              if (!flor)
                falhaSombras(
                  'Ative a Emoção da Flor Caída antes de reduzir o dano.',
                );
              custoEA = dto.gastoEA;
              efeitos.rd = dto.gastoEA * REGRAS_FLOR_CAIDA.rdPorEA;
              efeitos.efeito =
                'RD apenas para esta ocorrência de dano direto do Acerto Garantido.';
              break;
            }
            case 'ENCERRAR_VENENO': {
              if (!dto.alvoNpcSessaoId && !dto.alvoPersonagemSessaoId)
                falhaSombras('Selecione o alvo que passou em Fortitude DT30.');
              await this.alvo(tx, sessaoId, dto);
              const venenos = await tx.condicaoPersonagemSessao.findMany({
                where: {
                  sessaoId,
                  ativo: true,
                  fonteCodigo: FONTE_CONDICOES_SOMBRAS,
                  personagemSessaoId: dto.alvoPersonagemSessaoId,
                  npcSessaoId: dto.alvoNpcSessaoId,
                },
              });
              const ids = venenos
                .filter((c) => {
                  const relogio = lerRelogioSombras(c.observacao);
                  return (
                    relogio?.tipo === 'VENENO' &&
                    relogio.origemId === personagemSessaoId &&
                    relogio.testePendente
                  );
                })
                .map((c) => c.id);
              if (!ids.length)
                falhaSombras(
                  'Não há teste de fim de turno pendente para este veneno.',
                );
              await tx.condicaoPersonagemSessao.updateMany({
                where: { id: { in: ids } },
                data: {
                  ativo: false,
                  removidaEm: new Date(),
                  motivoRemocao:
                    'Sucesso confirmado em Fortitude DT30 ao fim do turno.',
                },
              });
              break;
            }
            case 'APLICAR_CONDICAO': {
              const ultima = estado.ultimaHabilidade;
              const acao = sombra.acoes.find(
                (a) => a.codigo === dto.habilidade,
              );
              if (
                !acao ||
                (!acao.condicao && acao.codigo !== 'VENENO') ||
                ultima?.sombra !== sombra.codigo ||
                ultima.habilidade !== acao.codigo
              )
                falhaSombras(
                  'Use a habilidade antes de confirmar a falha na resistência.',
                );
              if (!dto.alvoNpcSessaoId && !dto.alvoPersonagemSessaoId)
                falhaSombras('Selecione o alvo que falhou na resistência.');
              await this.alvo(tx, sessaoId, dto);
              const chave = `${dto.alvoNpcSessaoId ? 'NPC' : 'PERSONAGEM'}:${dto.alvoNpcSessaoId ?? dto.alvoPersonagemSessaoId}`;
              if (ultima.alvos.includes(chave))
                falhaSombras(
                  'Condição desta ativação já aplicada a este alvo.',
                );
              const codigo =
                acao.codigo === 'VENENO' ? 'ENVENENADO' : acao.condicao!.codigo;
              const nomes: Record<string, string> = {
                VULNERAVEL: 'Vulnerável',
                ATORDOADO: 'Atordoado',
                ENVENENADO: 'Envenenado',
              };
              const condicao = await tx.condicao.findFirst({
                where: { OR: [{ codigo }, { nome: nomes[codigo] }] },
              });
              if (!condicao)
                falhaSombras(
                  'Condição ausente no catálogo; revise o cadastro antes de aplicar.',
                );
              await tx.condicaoPersonagemSessao.create({
                data: {
                  sessaoId,
                  cenaId: cena.id,
                  personagemSessaoId: dto.alvoPersonagemSessaoId,
                  npcSessaoId: dto.alvoNpcSessaoId,
                  condicaoId: condicao.id,
                  turnoAplicacao: personagem.sessao.rodadaAtual,
                  duracaoModo:
                    codigo === 'ENVENENADO'
                      ? 'VENENO_OROCHI'
                      : 'FIM_PROXIMO_TURNO',
                  fonteCodigo: FONTE_CONDICOES_SOMBRAS,
                  origemDescricao: `${sombra.nome}: ${acao.nome}`,
                  observacao: JSON.stringify({
                    tipo: codigo === 'ENVENENADO' ? 'VENENO' : 'TEMPORARIA',
                    origemId: personagemSessaoId,
                  }),
                },
              });
              ultima.alvos.push(chave);
              break;
            }
            case 'VINCULO_OROCHI':
              estado.melhorAmigoEmCurto = dto.sustentado === true;
              break;
            case 'DEFINIR_ASPECTO': {
              const acao = sombra.acoes.find(
                (a) => a.codigo === dto.habilidade,
              );
              if (
                !acao?.ofensiva ||
                !config.dominadas.includes(sombra.familia) ||
                registro.destruido
              )
                falhaSombras(
                  'Escolha uma habilidade ofensiva de sombra dominada disponível.',
                );
              const dominio = await tx.dominioSessao.findFirst({
                where: {
                  sessaoId,
                  personagemSessaoId,
                  estado: { in: ['ABRINDO', 'ATIVO'] },
                },
                select: { id: true },
              });
              if (dominio)
                falhaSombras(
                  'A habilidade vinculada não pode mudar durante o Domínio.',
                );
              estado.dominio = {
                habilidade: `${sombra.codigo}:${acao.codigo}`,
                ativo: false,
                acertoUsado: false,
                esgotamento: 0,
              };
              break;
            }
            case 'INVOCAR': {
              if (estado.dominio?.esgotamento)
                falhaSombras('Técnica Inata esgotada.');
              podeManifestar(config, estado, sombra, pc.limitePeEaPorTurno);
              const custo = custoInvocacao(config, sombra);
              if (custo.execucao === 'LIVRE') {
                if (estado.favoritaUsada)
                  falhaSombras(
                    'Invocação Livre de Nue já utilizada neste turno.',
                  );
                estado.favoritaUsada = true;
              }
              consumirAcaoUsuario(estado, custo.execucao);
              custoEA = custo.ea;
              custoPE = custo.pe;
              await criarManifestacao();
              break;
            }
            case 'LIBERAR':
              await removerManifestacao(sombra.codigo);
              break;
            case 'COMANDAR':
              comandarSombra(estado, sombra.codigo);
              break;
            case 'MOVER':
              consumirAcaoSombra(estado, sombra.codigo, {
                codigo: 'MOVER',
                nome: 'Mover',
                execucao: 'MOVIMENTO',
              });
              break;
            case 'USAR':
            case 'COMBO':
            case 'ASPECTO':
            case 'ECO':
            case 'ACERTO':
            case 'RESSUSCITAR': {
              const acao = sombra.acoes.find(
                (a) =>
                  a.codigo ===
                  (dto.acao === 'RESSUSCITAR'
                    ? 'RESSUSCITACAO'
                    : dto.habilidade),
              );
              if (!acao) falhaSombras('Habilidade inexistente.');
              custoEA = acao.custoEA ?? 0;
              custoPE = acao.custoPE ?? 0;
              if (dto.acao === 'ASPECTO') {
                if (estado.dominio?.esgotamento)
                  falhaSombras('Técnica Inata esgotada.');
                if (
                  config.grauEfetivo < 4 ||
                  !config.aspectos.includes(
                    `${sombra.codigo}:${acao.codigo}`,
                  ) ||
                  !acao.extraivel ||
                  acao.execucao === 'PASSIVA' ||
                  sombra.componentes ||
                  registro.destruido
                )
                  falhaSombras('Aspecto não preparado ou indisponível.');
                if (
                  sombrasAtivas(estado).some((c) =>
                    (
                      obterSombra(c).componentes ?? [obterSombra(c).familia]
                    ).includes(sombra.familia),
                  )
                )
                  falhaSombras(
                    'Origem do aspecto está plenamente manifestada.',
                  );
                custoEA += sombra.sustentacao;
                consumirAcaoUsuario(estado, acao.execucao);
                if (
                  dto.sustentado &&
                  !estado.aspectosSustentados.includes(
                    `${sombra.codigo}:${acao.codigo}`,
                  )
                )
                  estado.aspectosSustentados.push(
                    `${sombra.codigo}:${acao.codigo}`,
                  );
                efeitos.teste = 'Jujutsu do usuário';
              } else if (dto.acao === 'COMBO') {
                if (
                  !config.combo ||
                  estado.comboUsado ||
                  !estado.ultimoAtaque ||
                  estado.ultimoAtaque === sombra.codigo ||
                  !registro.npcSessaoId ||
                  !acao.basica
                )
                  falhaSombras(
                    'Combo exige segundo shikigami manifestado e ataque básico após ataque da sombra comandada.',
                  );
                estado.comboUsado = true;
                custoPE += 2;
              } else if (dto.acao === 'ECO') {
                const dominio = await tx.dominioSessao.findFirst({
                  where: { sessaoId, personagemSessaoId, estado: 'ATIVO' },
                });
                if (
                  !dominio ||
                  sombra.carga > 5 ||
                  !config.dominadas.includes(sombra.familia) ||
                  estado.ecos >= 3 ||
                  !['PADRAO', 'LIVRE'].includes(acao.execucao) ||
                  (acao.execucao === 'LIVRE' && !acao.basica)
                )
                  falhaSombras(
                    'Eco indisponível: exige domínio ativo, sombra dominada de Carga ≤5 e no máximo três Ecos/turno.',
                  );
                estado.ecos++;
                custoEA += 1;
              } else if (dto.acao === 'ACERTO') {
                const dominio = await tx.dominioSessao.findFirst({
                  where: {
                    sessaoId,
                    personagemSessaoId,
                    estado: 'ATIVO',
                    acertoGarantidoAtivo: true,
                  },
                });
                if (
                  !dominio ||
                  !acao.ofensiva ||
                  !config.dominadas.includes(sombra.familia) ||
                  estado.dominio?.acertoUsado
                )
                  falhaSombras('Acerto Garantido indisponível.');
                const habilidade = `${sombra.codigo}:${acao.codigo}`;
                if (estado.dominio?.habilidade !== habilidade)
                  falhaSombras(
                    'Use a habilidade vinculada definida antes de abrir o Domínio.',
                  );
                if (!dto.alvoNpcSessaoId && !dto.alvoPersonagemSessaoId)
                  falhaSombras(
                    'Escolha o único alvo do Acerto Garantido desta rodada.',
                  );
                await this.alvo(tx, sessaoId, dto);
                const protegido = await tx.defesaAntiDominioSessao.findFirst({
                  where: {
                    sessaoId,
                    ativa: true,
                    integridadeAtual: { gt: 0 },
                    tipo: 'DOMINIO_SIMPLES',
                    OR: [
                      {
                        personagemSessaoId: dto.alvoPersonagemSessaoId ?? -1,
                        npcSessaoId: dto.alvoNpcSessaoId ?? -1,
                      },
                      {
                        zona: {
                          path: dto.alvoNpcSessaoId
                            ? '$.npcs'
                            : '$.personagens',
                          array_contains:
                            dto.alvoNpcSessaoId ?? dto.alvoPersonagemSessaoId!,
                        },
                      },
                    ],
                  },
                  select: { id: true },
                });
                if (protegido)
                  falhaSombras(
                    'Alvo protegido por Domínio Simples; resolva a habilidade normalmente, sem Acerto Garantido.',
                  );
                estado.dominio = {
                  habilidade,
                  ativo: true,
                  acertoUsado: true,
                  esgotamento: 0,
                };
                efeitos.acertoGarantido =
                  'Um alvo escolhido; área original preservada. Resistências secundárias permanecem.';
              } else consumirAcaoSombra(estado, sombra.codigo, acao);
              efeitos.habilidade = acao;
              estado.ultimaHabilidade = {
                sombra: sombra.codigo,
                habilidade: acao.codigo,
                alvos: [],
              };
              if (acao.codigo === 'RESSUSCITACAO') {
                if (dto.acao === 'ASPECTO' || !registro.npcSessaoId)
                  falhaSombras('Ressuscitação exige Madoka manifestado.');
                if (!dto.alvoPersonagemSessaoId && !dto.alvoNpcSessaoId)
                  falhaSombras('Escolha um alvo Morrendo.');
                const alvo = await this.alvo(tx, sessaoId, dto);
                const morrendo = await tx.condicaoPersonagemSessao.findFirst({
                  where: {
                    sessaoId,
                    ...(dto.alvoNpcSessaoId
                      ? { npcSessaoId: dto.alvoNpcSessaoId }
                      : { personagemSessaoId: dto.alvoPersonagemSessaoId }),
                    ativo: true,
                    condicao: { codigo: 'MORRENDO' },
                  },
                });
                if (!morrendo) falhaSombras('O alvo não está Morrendo.');
                const cura = dados(10, 12);
                await alvo.curar(cura);
                await tx.condicaoPersonagemSessao.updateMany({
                  where: { id: morrendo.id },
                  data: {
                    ativo: false,
                    removidaEm: new Date(),
                    motivoRemocao: 'Ressuscitação de Madoka',
                  },
                });
                registro.indisponivelAteDormir = true;
                await tx.npcAmeacaSessao.update({
                  where: { id: registro.npcSessaoId },
                  data: { pontosVidaAtual: 0 },
                });
                await removerManifestacao(sombra.codigo);
                registro.pv = 0;
                efeitos.cura = cura;
              } else if (acao.codigo === 'BOOP') {
                if (!dto.alvoPersonagemSessaoId && !dto.alvoNpcSessaoId)
                  falhaSombras('Selecione o alvo tocado por Boop.');
                const cura = dados(4, 12) + 10;
                await (await this.alvo(tx, sessaoId, dto)).curar(cura);
                efeitos.cura = cura;
              }
              break;
            }
            case 'ENCERRAR_ASPECTO':
              estado.aspectosSustentados = estado.aspectosSustentados.filter(
                (a) => a !== `${sombra.codigo}:${dto.habilidade}`,
              );
              break;
            case 'SINERGIA':
              if (
                !config.sinergia ||
                estado.sinergiaUsada ||
                !estado.ultimoAtaque
              )
                falhaSombras(
                  'Sinergia indisponível. Confirme o acerto do shikigami.',
                );
              estado.sinergiaUsada = true;
              efeitos.efeito =
                'Aliado em alcance válido faz ataque de oportunidade com +1d20; mestre confirma o acerto que disparou Sinergia.';
              break;
            case 'AMPLIAR': {
              const destino = obterSombra(dto.destino ?? '');
              if (
                sombra.familia !== 'COELHO' ||
                destino.familia !== 'COELHO' ||
                destino.pv <= sombra.pv ||
                !registro.npcSessaoId
              )
                falhaSombras(
                  'Escolha tamanho maior de Fuga do Coelho manifestado.',
                );
              if (
                cargaSombras(estado) - sombra.carga + destino.carga >
                pc.limitePeEaPorTurno
              )
                falhaSombras('Carga insuficiente.');
              consumirAcaoUsuario(estado, 'MOVIMENTO');
              custoEA = destino.ea - sombra.ea;
              custoPE = destino.pe - sombra.pe;
              registro.pv += destino.pv - sombra.pv;
              const npcId = registro.npcSessaoId;
              estado.sombras[destino.codigo] = { ...registro };
              delete estado.sombras[sombra.codigo];
              await tx.npcAmeacaSessao.update({
                where: { id: npcId },
                data: {
                  nomeExibicao: destino.nome,
                  tamanho: destino.tamanho,
                  pontosVidaMax: destino.pv,
                  pontosVidaAtual: registro.pv,
                  acoesGuia: snapshotSombra(destino).acoes,
                },
              });
              const instancia = await tx.npcAmeacaSessao.findUniqueOrThrow({
                where: { id: npcId },
              });
              if (instancia.entidadeVinculadaId)
                await tx.personagemCampanhaEntidadeVinculada.update({
                  where: { id: instancia.entidadeVinculadaId },
                  data: {
                    ...snapshotSombra(destino),
                    pontosVidaAtual: registro.pv,
                  },
                });
              break;
            }
            case 'CLONE': {
              const dominio = await tx.dominioSessao.findFirst({
                where: { sessaoId, personagemSessaoId, estado: 'ATIVO' },
              });
              if (!dominio || estado.cloneUsado || estado.ecos >= 3)
                falhaSombras('Clone indisponível.');
              estado.cloneUsado = true;
              estado.ecos++;
              custoEA = 2;
              efeitos.efeito =
                'Clone move e faz um ataque básico/manobra; sem técnicas, itens, reações ou persistência.';
              break;
            }
            case 'RITUAL':
              if (estado.rituais?.[sombra.codigo])
                falhaSombras(
                  'Já existe um ritual em andamento para esta sombra.',
                );
              if (
                config.dominadas.includes(sombra.familia) ||
                sombra.componentes ||
                registro.destruido
              )
                falhaSombras(
                  'Ritual exige sombra-base não dominada e não destruída.',
                );
              consumirAcaoUsuario(estado, 'COMPLETA');
              custoEA = sombra.ea;
              custoPE = sombra.pe;
              await criarManifestacao(true);
              break;
            case 'CONCLUIR_RITUAL': {
              if (!mestre)
                falhaSombras(
                  'Somente o mestre confirma o resultado do ritual.',
                );
              if (dto.ritualSemAjuda !== true)
                falhaSombras('Ajuda externa invalida a dominação.');
              const ritual = estado.rituais?.[sombra.codigo];
              if (!ritual)
                falhaSombras('Não há ritual registrado para esta sombra.');
              const hostil = await tx.npcAmeacaSessao.findUnique({
                where: { id: ritual.npcSessaoId },
              });
              if (!hostil || hostil.pontosVidaAtual > 0)
                falhaSombras(
                  'Registre a derrota da criatura antes de confirmar a dominação.',
                );
              await tx.npcAmeacaSessao.delete({ where: { id: hostil.id } });
              if (hostil.entidadeVinculadaId)
                await tx.personagemCampanhaEntidadeVinculada.update({
                  where: { id: hostil.entidadeVinculadaId },
                  data: { estado: 'DISPONIVEL', pontosVidaAtual: sombra.pv },
                });
              delete estado.rituais![sombra.codigo];
              if (!config.dominadas.includes(sombra.familia))
                config.dominadas.push(sombra.familia);
              break;
            }
            case 'HERANCA': {
              if (
                !mestre ||
                !registro.destruido ||
                !HERANCAS_DEZ_SOMBRAS.some(
                  (h) =>
                    h.origem === sombra.familia && h.destino === dto.destino,
                )
              )
                falhaSombras(
                  'Herança exige destruição e compatibilidade explícita de catálogo, confirmada pelo mestre.',
                );
              registro.herancaPendente = false;
              if (!config.dominadas.includes(dto.destino!))
                config.dominadas.push(dto.destino!);
              break;
            }
            case 'ADAPTACAO': {
              if (
                !mestre ||
                sombra.codigo !== 'MAHORAGA' ||
                !dto.observacao ||
                !dto.complexidade
              )
                falhaSombras(
                  'Mestre informa fenômeno, complexidade (1–4) e consequência da adaptação.',
                );
              const adaptacoes = (estado.adaptacoes ??= {});
              const existente = adaptacoes[dto.observacao];
              if (!existente)
                adaptacoes[dto.observacao] = {
                  giros: 0,
                  complexidade: dto.complexidade,
                  concluida: false,
                };
              else {
                if (existente.concluida || estado.rodaUsadaRodada === rodada)
                  falhaSombras(
                    'Adaptação concluída ou giro da rodada já utilizado.',
                  );
                existente.giros++;
                estado.rodaUsadaRodada = rodada;
                existente.concluida = existente.giros >= existente.complexidade;
                if (existente.concluida) {
                  registro.pv = Math.min(sombra.pv, registro.pv + dados(8, 8));
                  if (registro.npcSessaoId)
                    await tx.npcAmeacaSessao.update({
                      where: { id: registro.npcSessaoId },
                      data: { pontosVidaAtual: registro.pv },
                    });
                }
              }
              efeitos.adaptacao = {
                fenomeno: dto.observacao,
                ...adaptacoes[dto.observacao],
                manual: true,
              };
              break;
            }
          }
          if (atual.eaAtual < custoEA || atual.peAtual < custoPE)
            falhaSombras('EA ou PE insuficientes.');
          const turnoReferencia = turnosAtivos
            ? `${personagem.sessao.rodadaAtual}:${personagem.sessao.indiceTurnoAtual}`
            : null;
          const outrosGastos = await tx.eventoSessao.findMany({
            where: {
              sessaoId,
              personagemAtorId: personagemSessaoId,
              tipoEvento: {
                in: [
                  'HABILIDADE_USADA',
                  'DEZ_SOMBRAS_ACAO',
                  'DEZ_SOMBRAS_SUSTENTACAO',
                ],
              },
            },
            select: { dados: true },
            orderBy: { id: 'desc' },
            take: 400,
          });
          estado.gasto = outrosGastos.reduce((total, evento) => {
            const e = evento.dados as {
              turnoReferencia?: string;
              custoEA?: number;
              custoPE?: number;
              desfeito?: boolean;
            } | null;
            return turnoReferencia &&
              e?.turnoReferencia === turnoReferencia &&
              !e.desfeito
              ? total +
                  Math.max(0, e.custoEA ?? 0) +
                  Math.max(0, e.custoPE ?? 0)
              : total;
          }, 0);
          const custoTotal = custoEA + custoPE;
          // Mantém a exceção universal existente para o primeiro uso-base do turno.
          if (
            turnosAtivos &&
            estado.gasto > 0 &&
            estado.gasto + custoTotal > pc.limitePeEaPorTurno
          )
            falhaSombras('Limite de PE/EA por turno excedido.');
          estado.gasto += custoTotal;
          await tx.personagemCampanha.update({
            where: { id: pc.id },
            data: {
              estadoDezSombras: json(estado),
              configuracaoDezSombras: json(config),
              eaAtual: { decrement: custoEA },
              peAtual: { decrement: custoPE },
            },
          });
          await tx.eventoSessao.create({
            data: {
              sessaoId,
              cenaId: cena.id,
              personagemAtorId: personagemSessaoId,
              solicitanteUsuarioId: usuarioId,
              clientRequestId: dto.clientRequestId,
              tipoEvento: 'DEZ_SOMBRAS_ACAO',
              dados: json({
                intencao: dto,
                acao: dto.acao,
                sombra: sombra.nome,
                custoEA,
                custoPE,
                turnoReferencia,
                carga: cargaSombras(estado),
                efeitos,
              }),
            },
          });
        },
        { timeout: 30_000 },
      ),
    );
    return this.obter(campanhaId, sessaoId, personagemSessaoId, usuarioId);
  }

  private async alvo(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    dto: AcaoDezSombrasDto,
  ) {
    if (dto.alvoNpcSessaoId && dto.alvoPersonagemSessaoId)
      falhaSombras('Escolha apenas um alvo.');
    if (dto.alvoNpcSessaoId) {
      const npc = await tx.npcAmeacaSessao.findFirst({
        where: { id: dto.alvoNpcSessaoId, sessaoId },
      });
      if (!npc) falhaSombras('Alvo fora da sessão.');
      return {
        curar: async (cura: number) =>
          tx.npcAmeacaSessao.update({
            where: { id: npc.id },
            data: {
              pontosVidaAtual: Math.min(
                npc.pontosVidaMax,
                npc.pontosVidaAtual + cura,
              ),
            },
          }),
      };
    }
    const alvo = await tx.personagemSessao.findFirst({
      where: { id: dto.alvoPersonagemSessaoId, sessaoId },
      include: { personagemCampanha: true },
    });
    if (!alvo) falhaSombras('Alvo fora da sessão.');
    return {
      curar: async (cura: number) =>
        tx.personagemCampanha.update({
          where: { id: alvo.personagemCampanhaId },
          data: {
            pvAtual: Math.min(
              alvo.personagemCampanha.pvMax,
              alvo.personagemCampanha.pvAtual + cura,
            ),
          },
        }),
    };
  }
}

// Executado dentro da transação reprocessável de efeitos do turno.
export async function processarTurnoSombrasTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  personagemSessaoId: number,
  rodada: number,
) {
  const ps = await tx.personagemSessao.findFirst({
    where: { id: personagemSessaoId, sessaoId },
    include: { personagemCampanha: { include: { personagemBase: true } } },
  });
  if (!ps) return;
  const pc = ps.personagemCampanha;
  const config =
    configSombras(pc.configuracaoDezSombras) ??
    configSombras(pc.personagemBase.configuracaoDezSombras);
  if (!config) return;
  await bloquearPersonagemCampanhaTx(tx, pc.campanhaId, pc.id);
  const estado = lerEstadoSombras(pc.estadoDezSombras, config);
  if (
    !iniciarTurnoSombras(
      estado,
      `${sessaoId}:${rodada}:${personagemSessaoId}`,
      `${sessaoId}:${rodada}`,
    )
  )
    return;
  let ea = pc.eaAtual;
  const insuficientes: string[] = [];
  for (const codigo of sombrasAtivas(estado)) {
    const s = obterSombra(codigo),
      st = estadoSombra(estado, codigo);
    const npc = await tx.npcAmeacaSessao.findUnique({
      where: { id: st.npcSessaoId! },
    });
    if (!npc) {
      liberarSombra(estado, codigo);
      continue;
    }
    st.pv = npc.pontosVidaAtual;
    if (st.pv <= 0) {
      registrarDanoSombra(estado, codigo, 0);
      await tx.npcAmeacaSessao.delete({ where: { id: npc.id } });
      continue;
    }
    if (
      ea < s.sustentacao ||
      estado.gasto + s.sustentacao > pc.limitePeEaPorTurno
    ) {
      insuficientes.push(codigo);
      continue;
    }
    ea -= s.sustentacao;
    estado.gasto += s.sustentacao;
    if (codigo === 'MADOKA' && !st.usouBoop) {
      st.pv = Math.min(s.pv, st.pv + dados(2, 12));
      await tx.npcAmeacaSessao.update({
        where: { id: npc.id },
        data: { pontosVidaAtual: st.pv },
      });
    }
    if (codigo === 'AGITO') {
      st.pv = Math.min(s.pv, st.pv + dados(4, 12));
      await tx.npcAmeacaSessao.update({
        where: { id: npc.id },
        data: { pontosVidaAtual: st.pv },
      });
    }
    st.usouBoop = false;
  }
  // Não escolhe quais sombras o jogador perderá: exige uma decisão antes de agir.
  if (insuficientes.length)
    falhaSombras(
      `Sustentação insuficiente. Libere sombras antes de avançar: ${insuficientes.map((c) => obterSombra(c).nome).join(', ')}.`,
    );
  for (const aspecto of [...estado.aspectosSustentados]) {
    const custo = obterSombra(aspecto.split(':')[0]).sustentacao;
    if (ea < custo || estado.gasto + custo > pc.limitePeEaPorTurno)
      estado.aspectosSustentados = estado.aspectosSustentados.filter(
        (a) => a !== aspecto,
      );
    else {
      ea -= custo;
      estado.gasto += custo;
    }
  }
  await tx.personagemCampanha.update({
    where: { id: pc.id },
    data: { eaAtual: ea, estadoDezSombras: json(estado) },
  });
  const sessao = await tx.sessao.findUniqueOrThrow({
    where: { id: sessaoId },
    select: { indiceTurnoAtual: true },
  });
  await tx.eventoSessao.create({
    data: {
      sessaoId,
      personagemAtorId: personagemSessaoId,
      tipoEvento: 'DEZ_SOMBRAS_SUSTENTACAO',
      dados: json({
        custoEA: pc.eaAtual - ea,
        turnoReferencia: `${rodada}:${sessao.indiceTurnoAtual}`,
        carga: cargaSombras(estado),
      }),
    },
  });
}

export async function dormirSombrasTx(
  tx: Prisma.TransactionClient,
  personagemCampanhaId: number,
) {
  const pc = await tx.personagemCampanha.findUnique({
    where: { id: personagemCampanhaId },
    include: { personagemBase: true },
  });
  if (!pc) return;
  const config =
    configSombras(pc.configuracaoDezSombras) ??
    configSombras(pc.personagemBase.configuracaoDezSombras);
  if (!config) return;
  const estado = lerEstadoSombras(pc.estadoDezSombras, config);
  for (const codigo of sombrasAtivas(estado)) {
    const st = estadoSombra(estado, codigo);
    const npc = await tx.npcAmeacaSessao.findUnique({
      where: { id: st.npcSessaoId! },
    });
    if (npc && npc.pontosVidaAtual <= 0) {
      registrarDanoSombra(estado, codigo, 0);
      if (npc.entidadeVinculadaId)
        await tx.personagemCampanhaEntidadeVinculada.update({
          where: { id: npc.entidadeVinculadaId },
          data: {
            pontosVidaAtual: 0,
            estado: obterSombra(codigo).componentes
              ? 'DISPONIVEL'
              : 'DESTRUIDO',
          },
        });
      await tx.npcAmeacaSessao.delete({ where: { id: npc.id } });
    }
  }
  descansarSombras(estado);
  for (const codigo of sombrasAtivas(estado)) {
    const st = estadoSombra(estado, codigo);
    await tx.npcAmeacaSessao.update({
      where: { id: st.npcSessaoId! },
      data: { pontosVidaAtual: st.pv },
    });
    await tx.condicaoPersonagemSessao.updateMany({
      where: {
        npcSessaoId: st.npcSessaoId,
        ativo: true,
        duracaoModo: { not: 'ATE_REMOVER' },
      },
      data: {
        ativo: false,
        removidaEm: new Date(),
        motivoRemocao: 'DORMIR_INTERLUDIO',
      },
    });
  }
  await tx.personagemCampanha.update({
    where: { id: pc.id },
    data: { estadoDezSombras: json(estado) },
  });
  await tx.personagemCampanhaEntidadeVinculada.updateMany({
    where: {
      personagemCampanhaId,
      tecnicaOrigem: { codigo: 'DEZ_SOMBRAS' },
      estado: 'DESCARREGADO',
    },
    data: { estado: 'DISPONIVEL' },
  });
}
