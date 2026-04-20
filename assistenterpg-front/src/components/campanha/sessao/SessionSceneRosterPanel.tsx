'use client';

import { useMemo } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { Badge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { labelTipoNpc } from '@/lib/npc-ameaca/labels';
import type {
  CondicaoAtivaSessaoCampanha,
  NpcSessaoCampanha,
  ParticipanteIniciativaSessaoCampanha,
  SessaoCampanhaDetalhe,
} from '@/lib/types';
import {
  resolverStatusFisico,
  resolverStatusMental,
} from '@/lib/campanha/sessao-status';
import { formatarNomeCondicaoComAcumulos } from '@/lib/campanha/sessao-formatters';

type RosterItem = {
  id: string;
  nome: string;
  tipo: 'PERSONAGEM' | 'NPC';
  tipoLabel: string;
  jogador: string | null;
  iniciativaValor: number | null;
  statusFisico: string | null;
  statusMental: string | null;
  condicoes: CondicaoAtivaSessaoCampanha[];
};

type SessionSceneRosterPanelProps = {
  cards: SessaoCampanhaDetalhe['cards'];
  npcs: NpcSessaoCampanha[];
  iniciativaOrdem: ParticipanteIniciativaSessaoCampanha[];
};

function corStatusFisico(status: string): 'green' | 'yellow' | 'orange' | 'red' | 'gray' {
  if (status === 'Morto') return 'red';
  if (status === 'Morrendo') return 'orange';
  if (status === 'Machucado') return 'yellow';
  if (status === 'Indisponivel') return 'gray';
  return 'green';
}

function corStatusMental(status: string): 'green' | 'yellow' | 'orange' | 'red' | 'gray' {
  if (status === 'Louco') return 'red';
  if (status === 'Enlouquecendo') return 'orange';
  if (status === 'Ruim') return 'yellow';
  if (status === 'Indisponivel') return 'gray';
  return 'green';
}

export function SessionSceneRosterPanel({
  cards,
  npcs,
  iniciativaOrdem,
}: SessionSceneRosterPanelProps) {
  const itens = useMemo(() => {
    const cardsPorSessaoId = new Map(
      cards.map((card) => [card.personagemSessaoId, card]),
    );
    const npcsPorSessaoId = new Map(
      npcs.map((npc) => [npc.npcSessaoId, npc]),
    );
    const idsEmOrdem = new Set<string>();

    const construirItemPersonagem = (
      card: SessaoCampanhaDetalhe['cards'][number],
      iniciativaValor: number | null,
    ): RosterItem => {
      const recursos = card.recursos
        ? {
            pvAtual: card.recursos.pvAtual,
            pvMax: card.recursos.pvMax,
            sanAtual: card.recursos.sanAtual,
            sanMax: card.recursos.sanMax,
          }
        : null;
      const statusFisico = resolverStatusFisico(
        recursos,
        card.condicoesAtivas,
        card.turnosMorrendo ?? null,
        { indisponivelQuandoSemRecurso: true },
      );
      const statusMental = resolverStatusMental(
        recursos,
        card.condicoesAtivas,
        card.turnosEnlouquecendo ?? null,
        { indisponivelQuandoSemRecurso: true },
      );

      return {
        id: `personagem-${card.personagemSessaoId}`,
        nome: card.nomePersonagem,
        tipo: 'PERSONAGEM',
        tipoLabel: 'Personagem',
        jogador: card.nomeJogador ?? null,
        iniciativaValor,
        statusFisico,
        statusMental,
        condicoes: card.condicoesAtivas,
      };
    };

    const construirItemNpc = (
      npc: NpcSessaoCampanha,
      iniciativaValor: number | null,
    ): RosterItem => {
      const recursos = {
        pvAtual: npc.pontosVidaAtual,
        pvMax: npc.pontosVidaMax,
        sanAtual: npc.sanAtual ?? 0,
        sanMax: npc.sanMax ?? 0,
      };
      const statusFisico = resolverStatusFisico(
        recursos,
        npc.condicoesAtivas,
        null,
        { indisponivelQuandoSemRecurso: true },
      );
      const statusMental =
        typeof npc.sanAtual === 'number' && typeof npc.sanMax === 'number'
          ? resolverStatusMental(
              recursos,
              npc.condicoesAtivas,
              null,
              { indisponivelQuandoSemRecurso: true },
            )
          : null;

      return {
        id: `npc-${npc.npcSessaoId}`,
        nome: npc.nome,
        tipo: 'NPC',
        tipoLabel: labelTipoNpc(npc.tipo),
        jogador: null,
        iniciativaValor,
        statusFisico,
        statusMental,
        condicoes: npc.condicoesAtivas,
      };
    };

    const itensOrdenados: RosterItem[] = [];

    if (iniciativaOrdem.length > 0) {
      for (const participante of iniciativaOrdem) {
        if (
          participante.tipoParticipante === 'PERSONAGEM' &&
          typeof participante.personagemSessaoId === 'number'
        ) {
          const card = cardsPorSessaoId.get(participante.personagemSessaoId);
          if (card) {
            itensOrdenados.push(
              construirItemPersonagem(card, participante.valorIniciativa ?? null),
            );
            idsEmOrdem.add(`personagem-${card.personagemSessaoId}`);
            continue;
          }
        }

        if (
          participante.tipoParticipante === 'NPC' &&
          typeof participante.npcSessaoId === 'number'
        ) {
          const npc = npcsPorSessaoId.get(participante.npcSessaoId);
          if (npc) {
            itensOrdenados.push(
              construirItemNpc(npc, participante.valorIniciativa ?? null),
            );
            idsEmOrdem.add(`npc-${npc.npcSessaoId}`);
            continue;
          }
        }

        itensOrdenados.push({
          id: `${participante.tipoParticipante}-${participante.personagemSessaoId ?? participante.npcSessaoId ?? participante.nomePersonagem}`,
          nome: participante.nomePersonagem,
          tipo: participante.tipoParticipante,
          tipoLabel: participante.tipoParticipante === 'NPC' ? 'NPC' : 'Personagem',
          jogador: participante.nomeJogador ?? null,
          iniciativaValor: participante.valorIniciativa ?? null,
          statusFisico: 'Indisponivel',
          statusMental: null,
          condicoes: [],
        });
      }
    }

    const extrasPersonagens = cards
      .filter((card) => !idsEmOrdem.has(`personagem-${card.personagemSessaoId}`))
      .map((card) => construirItemPersonagem(card, null));
    const extrasNpcs = npcs
      .filter((npc) => !idsEmOrdem.has(`npc-${npc.npcSessaoId}`))
      .map((npc) => construirItemNpc(npc, null));

    if (iniciativaOrdem.length === 0) {
      return [...extrasPersonagens, ...extrasNpcs].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR'),
      );
    }

    return [...itensOrdenados, ...extrasPersonagens, ...extrasNpcs];
  }, [cards, iniciativaOrdem, npcs]);

  return (
    <SessionPanel
      title="Participantes na cena"
      subtitle="Visao rapida de iniciativa, estados e condicoes."
      tone="aside"
    >
      {itens.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="characters"
          title="Sem participantes"
          description="Nao ha personagens ou NPCs visiveis nesta cena."
        />
      ) : (
        <div className="session-roster">
          {itens.map((item) => (
            <div key={item.id} className="session-roster-item">
              <div className="session-roster-item__head">
                <div className="min-w-0 space-y-1">
                  <p className="session-roster-item__name">{item.nome}</p>
                  <div className="session-roster-item__meta">
                    <Badge size="sm" color="gray">
                      {item.tipoLabel}
                    </Badge>
                    {item.jogador ? (
                      <span className="session-roster-item__player">
                        Jogador: {item.jogador}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="session-initiative-badge">
                  INI {typeof item.iniciativaValor === 'number' ? item.iniciativaValor : '--'}
                </span>
              </div>

              <div className="session-roster-item__status">
                {item.statusFisico ? (
                  <Badge size="sm" color={corStatusFisico(item.statusFisico)}>
                    Fisico: {item.statusFisico}
                  </Badge>
                ) : null}
                {item.statusMental ? (
                  <Badge size="sm" color={corStatusMental(item.statusMental)}>
                    Mental: {item.statusMental}
                  </Badge>
                ) : null}
              </div>

              {item.condicoes.length > 0 ? (
                <div className="session-roster-item__condicoes">
                  {item.condicoes.map((condicao) => (
                    <Badge key={condicao.id} size="sm" color="yellow">
                      <span className="inline-flex items-center gap-1">
                        <Icon
                          name={(condicao.icone || 'status') as IconName}
                          className="h-3 w-3"
                        />
                        {formatarNomeCondicaoComAcumulos(condicao)}
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SessionPanel>
  );
}
