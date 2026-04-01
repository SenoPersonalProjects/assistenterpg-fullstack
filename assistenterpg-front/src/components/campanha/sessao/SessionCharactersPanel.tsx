'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { CharacterSessionCard } from '@/components/campanha/sessao/CharacterSessionCard';
import type { NucleoAmaldicoadoCodigo, SessaoCampanhaDetalhe } from '@/lib/types';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import type {
  AjustesRecursos,
  CampoAjusteRecurso,
} from '@/hooks/useSessaoRecursos';
import { formatarCustos } from '@/lib/campanha/sessao-habilidades';
import type { RolagemPericiaSessaoPayload } from '@/components/campanha/sessao/types';

type SessionCharactersPanelProps = {
  campanhaId: number;
  cards: SessaoCampanhaDetalhe['cards'];
  iniciativaPorPersonagemSessao: Map<number, number>;
  cardsRecursosExpandidos: Record<number, boolean>;
  onAlternarExpandido: (personagemSessaoId: number) => void;
  obterAjustesRecursosCard: (personagemCampanhaId: number) => AjustesRecursos;
  onAtualizarAjusteRecursoCard: (
    personagemCampanhaId: number,
    campo: CampoAjusteRecurso,
    valor: string,
  ) => void;
  campoRecursoPendente: `${number}:${CampoAjusteRecurso}` | null;
  salvandoCardId: number | null;
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  removendoPersonagemSessaoId: number | null;
  onSolicitarRemoverPersonagem: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  onAbrirAdicionarPersonagem: () => void;
  acaoHabilidadePendente: string | null;
  mostrarSomenteSustentadas: Record<number, boolean>;
  onToggleMostrarSomenteSustentadas: (personagemSessaoId: number, checked: boolean) => void;
  abasDetalheCard: Record<number, AbaDetalheCard>;
  onAtualizarAbaDetalheCard: (personagemSessaoId: number, aba: AbaDetalheCard) => void;
  tecnicasInatasAbertas: Record<number, boolean>;
  onToggleTecnicaInata: (personagemSessaoId: number, aberto: boolean) => void;
  tecnicasNaoInatasAbertas: Record<number, boolean>;
  onToggleTecnicasNaoInatas: (personagemSessaoId: number, aberto: boolean) => void;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
  onEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => void;
  onAplicarDeltaRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
    delta: number,
  ) => void;
  onAplicarAjustePersonalizadoRecursoCard: (
    card: SessaoCampanhaDetalhe['cards'][number],
    campo: CampoAjusteRecurso,
  ) => void;
  onSelecionarNucleo: (
    personagemCampanhaId: number,
    nucleo: NucleoAmaldicoadoCodigo,
  ) => void;
  onSacrificarNucleo: (
    personagemCampanhaId: number,
    payload: { modo: 'ATUAL' | 'OUTRO'; nucleo?: NucleoAmaldicoadoCodigo },
  ) => void;
  onRolarPericia: (payload: RolagemPericiaSessaoPayload) => void;
  onAbrirEdicaoPersonagem: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  onAbrirFichaCompleta: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  limitesCategoriaAtivo?: boolean;
  erro?: string | null;
};

export function SessionCharactersPanel({
  campanhaId,
  cards,
  iniciativaPorPersonagemSessao,
  cardsRecursosExpandidos,
  onAlternarExpandido,
  obterAjustesRecursosCard,
  onAtualizarAjusteRecursoCard,
  campoRecursoPendente,
  salvandoCardId,
  sessaoEncerrada,
  podeControlarSessao,
  removendoPersonagemSessaoId,
  onSolicitarRemoverPersonagem,
  onAbrirAdicionarPersonagem,
  acaoHabilidadePendente,
  mostrarSomenteSustentadas,
  onToggleMostrarSomenteSustentadas,
  abasDetalheCard,
  onAtualizarAbaDetalheCard,
  tecnicasInatasAbertas,
  onToggleTecnicaInata,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onEncerrarSustentacao,
  onAplicarDeltaRecursoCard,
  onAplicarAjustePersonalizadoRecursoCard,
  onSelecionarNucleo,
  onSacrificarNucleo,
  onRolarPericia,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  renderPainelCondicoes,
  limitesCategoriaAtivo,
  erro,
}: SessionCharactersPanelProps) {
  return (
    <SessionPanel
      title="Personagens da sessao"
      subtitle="Jogadores editam apenas sua ficha. O mestre pode editar todas."
      tone="main"
      right={
        podeControlarSessao ? (
          <Button
            size="sm"
            onClick={onAbrirAdicionarPersonagem}
            disabled={sessaoEncerrada}
          >
            <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
            Adicionar personagem
          </Button>
        ) : undefined
      }
    >
      {erro ? <ErrorAlert message={erro} /> : null}

      {cards.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="characters"
          title="Sem personagens na sessao"
          description="Associe personagens na campanha para aparecerem no lobby."
        />
      ) : (
        cards.map((card) => {
          const ajustesRecursos = obterAjustesRecursosCard(card.personagemCampanhaId);
          const cardRecursosExpandido = Boolean(
            cardsRecursosExpandidos[card.personagemSessaoId],
          );
          const campoRecursoPendenteCard =
            campoRecursoPendente?.startsWith(`${card.personagemCampanhaId}:`)
              ? (campoRecursoPendente.split(':')[1] as CampoAjusteRecurso)
              : null;
          const iniciativaValor = iniciativaPorPersonagemSessao.get(
            card.personagemSessaoId,
          );
          const abaDetalheCard = abasDetalheCard[card.personagemSessaoId] ?? 'RESUMO';
          const totalTecnicasCard =
            (card.tecnicaInata ? 1 : 0) + card.tecnicasNaoInatas.length;
          const totalCondicoesAtivasCard = card.condicoesAtivas.length;
          const totalSustentacoesAtivasCard = card.sustentacoesAtivas.length;

          return (
            <CharacterSessionCard
              key={card.personagemSessaoId}
              campanhaId={campanhaId}
              card={card}
              iniciativaValor={iniciativaValor ?? null}
              cardRecursosExpandido={cardRecursosExpandido}
              abaDetalheCard={abaDetalheCard}
              totalCondicoesAtivasCard={totalCondicoesAtivasCard}
              totalTecnicasCard={totalTecnicasCard}
              totalSustentacoesAtivasCard={totalSustentacoesAtivasCard}
              mostrarSomenteSustentadasAtivas={Boolean(
                mostrarSomenteSustentadas[card.personagemSessaoId],
              )}
              onToggleMostrarSomenteSustentadas={(checked) =>
                onToggleMostrarSomenteSustentadas(card.personagemSessaoId, checked)
              }
              onAtualizarAbaDetalheCard={(aba) =>
                onAtualizarAbaDetalheCard(card.personagemSessaoId, aba)
              }
              tecnicaInataAberta={
                tecnicasInatasAbertas[card.personagemSessaoId] ?? true
              }
              onToggleTecnicaInata={(aberto) =>
                onToggleTecnicaInata(card.personagemSessaoId, aberto)
              }
              tecnicasNaoInatasAbertas={Boolean(
                tecnicasNaoInatasAbertas[card.personagemSessaoId],
              )}
              onToggleTecnicasNaoInatas={(aberto) =>
                onToggleTecnicasNaoInatas(card.personagemSessaoId, aberto)
              }
              ajustesRecursos={ajustesRecursos}
              campoRecursoPendenteCard={campoRecursoPendenteCard}
              sessaoEncerrada={sessaoEncerrada}
              salvandoCardId={salvandoCardId}
              removendo={removendoPersonagemSessaoId === card.personagemSessaoId}
              acaoHabilidadePendente={acaoHabilidadePendente}
              onAlternarExpandido={() => onAlternarExpandido(card.personagemSessaoId)}
              onAtualizarAjusteRecursoPersonalizado={(campo, valor) =>
                onAtualizarAjusteRecursoCard(card.personagemCampanhaId, campo, valor)
              }
              onAplicarDeltaRecurso={(campo, delta) =>
                void onAplicarDeltaRecursoCard(card, campo, delta)
              }
              onAplicarAjustePersonalizado={(campo) =>
                void onAplicarAjustePersonalizadoRecursoCard(card, campo)
              }
              onSelecionarNucleo={(personagemCampanhaId, nucleo) =>
                onSelecionarNucleo(personagemCampanhaId, nucleo)
              }
              onSacrificarNucleo={(personagemCampanhaId, payload) =>
                onSacrificarNucleo(personagemCampanhaId, payload)
              }
              onAbrirEdicaoPersonagem={() => onAbrirEdicaoPersonagem(card)}
              onAbrirFichaCompleta={() => onAbrirFichaCompleta(card)}
              onSolicitarRemover={() => onSolicitarRemoverPersonagem(card)}
              renderPainelCondicoes={renderPainelCondicoes}
              acumulosHabilidade={acumulosHabilidade}
              onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
              onUsarHabilidade={onUsarHabilidade}
              onEncerrarSustentacao={(personagemSessaoId, sustentacaoId) =>
                void onEncerrarSustentacao(personagemSessaoId, sustentacaoId)
              }
              formatarCustos={formatarCustos}
              limitesCategoriaAtivo={limitesCategoriaAtivo}
              onRolarPericia={onRolarPericia}
            />
          );
        })
      )}
    </SessionPanel>
  );
}

