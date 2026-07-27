import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { calcularPvBarraMaximos } from 'src/common/utils/pv-barras';
import type { CondicaoAtivaSessaoResumo } from 'src/sessao/sessao-atualizacao.types';

const DURACAO_ATE_REMOVER = 'ATE_REMOVER';
const MOTIVO_REMOCAO_AUTOMATICA =
  'Condição automática removida por mudança de estado.';

type ChaveCondicaoAutomatica =
  | 'MACHUCADO'
  | 'PERTURBADO'
  | 'MORRENDO'
  | 'CAIDO'
  | 'ENLOUQUECENDO';

const REGRAS_AUTOMATICAS: ReadonlyArray<{
  chave: ChaveCondicaoAutomatica;
  aliases: readonly string[];
  origem: string;
}> = [
  {
    chave: 'MACHUCADO',
    aliases: ['MACHUCADO'],
    origem: 'Automática por PV <= metade.',
  },
  {
    chave: 'PERTURBADO',
    aliases: ['PERTURBADO'],
    origem: 'Automática por SAN <= metade.',
  },
  {
    chave: 'MORRENDO',
    aliases: ['MORRENDO'],
    origem: 'Automática por PV <= 0.',
  },
  {
    chave: 'CAIDO',
    aliases: ['CAIDO', 'CAÍDO'],
    origem: 'Automática por PV <= 0.',
  },
  {
    chave: 'ENLOUQUECENDO',
    aliases: ['ENLOUQUECENDO'],
    origem: 'Automática por SAN <= 0.',
  },
];

type EstadoAlvoAutomatico = {
  sessaoId: number;
  cenaId: number;
  rodadaAtual: number;
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  nome: string;
  pvAtual: number;
  pvMaxAtual: number;
  sanAtual: number | null;
  sanMax: number | null;
};

type CondicaoCatalogo = {
  id: number;
  nome: string;
  descricao: string;
  icone: string | null;
};

type CondicaoPersistida = {
  id: number;
  sessaoId: number | null;
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  condicaoId: number;
  cenaId: number;
  turnoAplicacao: number;
  duracaoModo: string;
  duracaoValor: number | null;
  restanteDuracao: number | null;
  ativo: boolean;
  automatica: boolean;
  chaveAutomacao: string | null;
  contadorTurnos: number;
  acumulos: number;
  fonteCodigo: string | null;
  limiteFonte: number | null;
  origemDescricao: string | null;
  observacao: string | null;
  condicao: CondicaoCatalogo;
};

@Injectable()
export class SessaoCondicoesAutomaticasService {
  async sincronizarPersonagemSessaoTx(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    personagemSessaoId: number,
  ): Promise<CondicaoAtivaSessaoResumo[]> {
    const personagem = await tx.personagemSessao.findFirst({
      where: {
        id: personagemSessaoId,
        sessaoId,
        sessao: { status: { not: 'ENCERRADA' } },
      },
      select: {
        id: true,
        cenaId: true,
        personagemCampanha: {
          select: {
            nome: true,
            pvAtual: true,
            pvMax: true,
            pvBarrasTotal: true,
            pvBarrasRestantes: true,
            sanAtual: true,
            sanMax: true,
          },
        },
        sessao: {
          select: {
            rodadaAtual: true,
            cenas: {
              select: { id: true },
              orderBy: { id: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!personagem) return [];
    const cenaId = personagem.cenaId ?? personagem.sessao.cenas[0]?.id;
    if (!cenaId) return [];

    const { pvBarraMaxAtual } = calcularPvBarraMaximos(
      personagem.personagemCampanha.pvMax,
      personagem.personagemCampanha.pvBarrasTotal,
      personagem.personagemCampanha.pvBarrasRestantes,
    );

    return this.sincronizarAlvoTx(tx, {
      sessaoId,
      cenaId,
      rodadaAtual: personagem.sessao.rodadaAtual,
      personagemSessaoId: personagem.id,
      npcSessaoId: null,
      nome: personagem.personagemCampanha.nome,
      pvAtual: personagem.personagemCampanha.pvAtual,
      pvMaxAtual: pvBarraMaxAtual,
      sanAtual: personagem.personagemCampanha.sanAtual,
      sanMax: personagem.personagemCampanha.sanMax,
    });
  }

  async sincronizarNpcSessaoTx(
    tx: Prisma.TransactionClient,
    sessaoId: number,
    npcSessaoId: number,
  ): Promise<CondicaoAtivaSessaoResumo[]> {
    const npc = await tx.npcAmeacaSessao.findFirst({
      where: {
        id: npcSessaoId,
        sessaoId,
        sessao: { status: { not: 'ENCERRADA' } },
      },
      select: {
        id: true,
        cenaId: true,
        nomeExibicao: true,
        pontosVidaAtual: true,
        pontosVidaMax: true,
        sanAtual: true,
        sanMax: true,
        sessao: {
          select: {
            rodadaAtual: true,
            cenas: {
              select: { id: true },
              orderBy: { id: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!npc) return [];
    const cenaId = npc.cenaId ?? npc.sessao.cenas[0]?.id;
    if (!cenaId) return [];

    return this.sincronizarAlvoTx(tx, {
      sessaoId,
      cenaId,
      rodadaAtual: npc.sessao.rodadaAtual,
      personagemSessaoId: null,
      npcSessaoId: npc.id,
      nome: npc.nomeExibicao,
      pvAtual: npc.pontosVidaAtual,
      pvMaxAtual: Math.max(1, npc.pontosVidaMax),
      sanAtual: npc.sanAtual,
      sanMax: npc.sanMax,
    });
  }

  async sincronizarPersonagemCampanhaTx(
    tx: Prisma.TransactionClient,
    personagemCampanhaId: number,
  ): Promise<void> {
    const personagensSessao = await tx.personagemSessao.findMany({
      where: {
        personagemCampanhaId,
        sessao: { status: { not: 'ENCERRADA' } },
      },
      select: {
        id: true,
        sessaoId: true,
        cenaId: true,
        personagemCampanha: {
          select: {
            nome: true,
            pvAtual: true,
            pvMax: true,
            pvBarrasTotal: true,
            pvBarrasRestantes: true,
            sanAtual: true,
            sanMax: true,
          },
        },
        sessao: {
          select: {
            rodadaAtual: true,
            cenas: {
              select: { id: true },
              orderBy: { id: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const alvos = personagensSessao.flatMap((personagem) => {
      const cenaId = personagem.cenaId ?? personagem.sessao.cenas[0]?.id;
      if (!cenaId) return [];
      const { pvBarraMaxAtual } = calcularPvBarraMaximos(
        personagem.personagemCampanha.pvMax,
        personagem.personagemCampanha.pvBarrasTotal,
        personagem.personagemCampanha.pvBarrasRestantes,
      );
      return [
        {
          sessaoId: personagem.sessaoId,
          cenaId,
          rodadaAtual: personagem.sessao.rodadaAtual,
          personagemSessaoId: personagem.id,
          npcSessaoId: null,
          nome: personagem.personagemCampanha.nome,
          pvAtual: personagem.personagemCampanha.pvAtual,
          pvMaxAtual: pvBarraMaxAtual,
          sanAtual: personagem.personagemCampanha.sanAtual,
          sanMax: personagem.personagemCampanha.sanMax,
        } satisfies EstadoAlvoAutomatico,
      ];
    });

    await this.sincronizarAlvosTx(tx, alvos);
  }

  private async sincronizarAlvoTx(
    tx: Prisma.TransactionClient,
    alvo: EstadoAlvoAutomatico,
  ): Promise<CondicaoAtivaSessaoResumo[]> {
    const resultados = await this.sincronizarAlvosTx(tx, [alvo]);
    return resultados.get(this.chaveAlvo(alvo)) ?? [];
  }

  private async sincronizarAlvosTx(
    tx: Prisma.TransactionClient,
    alvos: EstadoAlvoAutomatico[],
  ): Promise<Map<string, CondicaoAtivaSessaoResumo[]>> {
    const resultados = new Map<string, CondicaoAtivaSessaoResumo[]>();
    if (alvos.length === 0) return resultados;

    const [catalogo, existentes] = await Promise.all([
      tx.condicao.findMany({
        select: {
          id: true,
          nome: true,
          descricao: true,
          icone: true,
        },
      }),
      tx.condicaoPersonagemSessao.findMany({
        where: {
          OR: alvos.map((alvo) => ({
            sessaoId: alvo.sessaoId,
            personagemSessaoId: alvo.personagemSessaoId,
            npcSessaoId: alvo.npcSessaoId,
          })),
        },
        include: {
          condicao: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              icone: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      }),
    ]);

    const porNome = new Map(
      catalogo.map((condicao) => [
        this.normalizarNome(condicao.nome),
        condicao,
      ]),
    );
    const existentesPorAlvo = new Map<string, CondicaoPersistida[]>();
    for (const existente of existentes as CondicaoPersistida[]) {
      const chave = this.chaveCondicaoPersistida(existente);
      const lista = existentesPorAlvo.get(chave) ?? [];
      lista.push(existente);
      existentesPorAlvo.set(chave, lista);
    }

    const criacoes: Array<{
      alvo: EstadoAlvoAutomatico;
      regra: (typeof REGRAS_AUTOMATICAS)[number];
      condicao: CondicaoCatalogo;
    }> = [];
    const reativacoes: Array<{
      alvo: EstadoAlvoAutomatico;
      regra: (typeof REGRAS_AUTOMATICAS)[number];
      condicao: CondicaoCatalogo;
      existente: CondicaoPersistida;
    }> = [];
    const remocoes: Array<{
      alvo: EstadoAlvoAutomatico;
      regra: (typeof REGRAS_AUTOMATICAS)[number];
      condicao: CondicaoCatalogo;
      existente: CondicaoPersistida;
    }> = [];

    for (const alvo of alvos) {
      const existentesAlvo = existentesPorAlvo.get(this.chaveAlvo(alvo)) ?? [];
      const morto = existentesAlvo.some(
        (condicao) =>
          condicao.ativo &&
          ['MORTO', 'MORTA', 'MORTE'].includes(
            this.normalizarNome(condicao.condicao.nome),
          ),
      );
      const insano = existentesAlvo.some(
        (condicao) =>
          condicao.ativo &&
          ['INSANO', 'LOUCO', 'ENLOUQUECIDO'].includes(
            this.normalizarNome(condicao.condicao.nome),
          ),
      );
      const estados: Record<ChaveCondicaoAutomatica, boolean> = {
        MACHUCADO:
          alvo.pvAtual > 0 &&
          alvo.pvAtual <= Math.floor(Math.max(1, alvo.pvMaxAtual) / 2),
        PERTURBADO:
          alvo.sanAtual !== null &&
          alvo.sanMax !== null &&
          alvo.sanAtual > 0 &&
          alvo.sanAtual <= Math.floor(alvo.sanMax / 2) &&
          !insano,
        MORRENDO: alvo.pvAtual <= 0 && !morto,
        CAIDO: alvo.pvAtual <= 0,
        ENLOUQUECENDO: alvo.sanAtual !== null && alvo.sanAtual <= 0 && !insano,
      };

      for (const regra of REGRAS_AUTOMATICAS) {
        const condicao = regra.aliases
          .map((alias) => porNome.get(this.normalizarNome(alias)))
          .find((item): item is CondicaoCatalogo => item !== undefined);
        if (!condicao) continue;
        const existente = existentesAlvo.find(
          (item) =>
            item.automatica &&
            (item.chaveAutomacao === regra.chave ||
              item.condicaoId === condicao.id),
        );
        const deveEstarAtiva = estados[regra.chave];
        if (deveEstarAtiva && !existente) {
          criacoes.push({ alvo, regra, condicao });
        } else if (deveEstarAtiva && existente && !existente.ativo) {
          reativacoes.push({ alvo, regra, condicao, existente });
        } else if (!deveEstarAtiva && existente?.ativo) {
          remocoes.push({ alvo, regra, condicao, existente });
        }
      }
    }

    if (criacoes.length > 0) {
      await tx.condicaoPersonagemSessao.createMany({
        data: criacoes.map(({ alvo, regra, condicao }) => ({
          sessaoId: alvo.sessaoId,
          personagemSessaoId: alvo.personagemSessaoId,
          npcSessaoId: alvo.npcSessaoId,
          condicaoId: condicao.id,
          cenaId: alvo.cenaId,
          turnoAplicacao: alvo.rodadaAtual,
          duracaoModo: DURACAO_ATE_REMOVER,
          ativo: true,
          automatica: true,
          chaveAutomacao: regra.chave,
          contadorTurnos: 0,
          origemDescricao: regra.origem,
        })),
      });
    }

    if (reativacoes.length > 0) {
      const ids = reativacoes.map(({ existente }) => existente.id);
      const casosCena = Prisma.join(
        reativacoes.map(
          ({ existente, alvo }) =>
            Prisma.sql`WHEN ${existente.id} THEN ${alvo.cenaId}`,
        ),
        ' ',
      );
      const casosTurno = Prisma.join(
        reativacoes.map(
          ({ existente, alvo }) =>
            Prisma.sql`WHEN ${existente.id} THEN ${alvo.rodadaAtual}`,
        ),
        ' ',
      );
      await tx.$executeRaw(Prisma.sql`
        UPDATE CondicaoPersonagemSessao
        SET ativo = TRUE,
            removidaEm = NULL,
            motivoRemocao = NULL,
            cenaId = CASE id ${casosCena} ELSE cenaId END,
            turnoAplicacao = CASE id ${casosTurno} ELSE turnoAplicacao END
        WHERE id IN (${Prisma.join(ids)})
      `);
    }

    if (remocoes.length > 0) {
      await tx.condicaoPersonagemSessao.updateMany({
        where: { id: { in: remocoes.map(({ existente }) => existente.id) } },
        data: {
          ativo: false,
          removidaEm: new Date(),
          motivoRemocao: MOTIVO_REMOCAO_AUTOMATICA,
        },
      });
    }

    const ativas = await tx.condicaoPersonagemSessao.findMany({
      where: {
        ativo: true,
        OR: alvos.map((alvo) => ({
          sessaoId: alvo.sessaoId,
          personagemSessaoId: alvo.personagemSessaoId,
          npcSessaoId: alvo.npcSessaoId,
        })),
      },
      include: {
        condicao: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            icone: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const ativasTipadas = ativas as CondicaoPersistida[];
    const eventosAplicacao = [...criacoes, ...reativacoes].flatMap(
      ({ alvo, regra, condicao }, index) => {
        const persistida = ativasTipadas.find(
          (item) =>
            this.chaveCondicaoPersistida(item) === this.chaveAlvo(alvo) &&
            item.automatica &&
            (item.chaveAutomacao === regra.chave ||
              item.condicaoId === condicao.id),
        );
        if (!persistida) return [];
        return [
          {
            sessaoId: alvo.sessaoId,
            cenaId: alvo.cenaId,
            personagemAtorId: alvo.personagemSessaoId,
            tipoEvento: 'CONDICAO_APLICADA',
            dados: {
              condicaoSessaoId: persistida.id,
              condicaoId: condicao.id,
              condicaoNome: condicao.nome,
              alvoTipo: alvo.personagemSessaoId ? 'PERSONAGEM' : 'NPC',
              personagemSessaoId: alvo.personagemSessaoId,
              npcSessaoId: alvo.npcSessaoId,
              alvoNome: alvo.nome,
              duracaoModo: persistida.duracaoModo,
              duracaoValor: persistida.duracaoValor,
              restanteDuracao: persistida.restanteDuracao,
              acumulos: persistida.acumulos,
              origemDescricao: regra.origem,
              modoOperacao: index < criacoes.length ? 'CRIADA' : 'REATIVADA',
              automatica: true,
              chaveAutomacao: regra.chave,
            },
          },
        ];
      },
    );
    const eventosRemocao = remocoes.map(
      ({ alvo, regra, condicao, existente }) => ({
        sessaoId: alvo.sessaoId,
        cenaId: alvo.cenaId,
        personagemAtorId: alvo.personagemSessaoId,
        tipoEvento: 'CONDICAO_REMOVIDA',
        dados: {
          condicaoSessaoId: existente.id,
          condicaoId: condicao.id,
          condicaoNome: condicao.nome,
          personagemSessaoId: alvo.personagemSessaoId,
          npcSessaoId: alvo.npcSessaoId,
          alvoNome: alvo.nome,
          motivo: MOTIVO_REMOCAO_AUTOMATICA,
          snapshot: this.snapshotCondicao(existente),
          automatica: true,
          chaveAutomacao: regra.chave,
        },
      }),
    );
    if (eventosAplicacao.length + eventosRemocao.length > 0) {
      await tx.eventoSessao.createMany({
        data: [...eventosAplicacao, ...eventosRemocao],
      });
    }

    for (const alvo of alvos) {
      resultados.set(
        this.chaveAlvo(alvo),
        ativasTipadas
          .filter(
            (condicao) =>
              this.chaveCondicaoPersistida(condicao) === this.chaveAlvo(alvo),
          )
          .map((condicao) => this.mapearCondicao(condicao)),
      );
    }
    return resultados;
  }

  private chaveAlvo(alvo: EstadoAlvoAutomatico): string {
    return alvo.personagemSessaoId !== null
      ? `PERSONAGEM:${alvo.personagemSessaoId}`
      : `NPC:${alvo.npcSessaoId}`;
  }

  private chaveCondicaoPersistida(condicao: CondicaoPersistida): string {
    return condicao.personagemSessaoId !== null
      ? `PERSONAGEM:${condicao.personagemSessaoId}`
      : `NPC:${condicao.npcSessaoId}`;
  }

  private snapshotCondicao(condicao: CondicaoPersistida) {
    return {
      id: condicao.id,
      condicaoId: condicao.condicaoId,
      cenaId: condicao.cenaId,
      turnoAplicacao: condicao.turnoAplicacao,
      duracaoModo: condicao.duracaoModo,
      duracaoValor: condicao.duracaoValor,
      restanteDuracao: condicao.restanteDuracao,
      automatica: condicao.automatica,
      chaveAutomacao: condicao.chaveAutomacao,
      contadorTurnos: condicao.contadorTurnos,
      acumulos: condicao.acumulos,
      fonteCodigo: condicao.fonteCodigo,
      limiteFonte: condicao.limiteFonte,
      origemDescricao: condicao.origemDescricao,
      observacao: condicao.observacao,
    };
  }

  private mapearCondicao(
    condicao: CondicaoPersistida,
  ): CondicaoAtivaSessaoResumo {
    return {
      id: condicao.id,
      condicaoId: condicao.condicaoId,
      nome: condicao.condicao.nome,
      descricao: condicao.condicao.descricao,
      icone: condicao.condicao.icone,
      automatica: condicao.automatica,
      chaveAutomacao: condicao.chaveAutomacao,
      duracaoModo: condicao.duracaoModo,
      duracaoValor: condicao.duracaoValor,
      restanteDuracao: condicao.restanteDuracao,
      contadorTurnos: condicao.contadorTurnos,
      origemDescricao: condicao.origemDescricao,
      observacao: condicao.observacao,
      turnoAplicacao: condicao.turnoAplicacao,
      acumulos: condicao.acumulos,
      fonteCodigo: condicao.fonteCodigo,
      limiteFonte: condicao.limiteFonte,
    };
  }

  private normalizarNome(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }
}
