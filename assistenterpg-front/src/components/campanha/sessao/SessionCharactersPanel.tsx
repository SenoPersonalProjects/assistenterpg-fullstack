'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { CharacterSessionCard } from '@/components/campanha/sessao/CharacterSessionCard';
import type {
  NucleoAmaldicoadoCodigo,
  SessaoCampanhaDetalhe,
  UserErrorState,
} from '@/lib/types';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import type { PreferenciaMacroArmaSessao, PreferenciaMacroPersonalizadaSessao } from '@/lib/campanha/sessao-preferencias';
import type { SolicitacaoMacroArma, SolicitacaoMacroPersonalizada } from '@/components/campanha/sessao/SessionCharacterMacrosTab';
import type {
  AjustesRecursos,
  CampoAjusteRecurso,
} from '@/hooks/useSessaoRecursos';
import { formatarCustos } from '@/lib/campanha/sessao-habilidades';
import type {
  RolagemDanoHabilidadeSessaoPayload,
  RolagemPericiaSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';

type SessionCharactersPanelProps = {
  campanhaId: number;
  sessaoId: number;
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
  onUsarHabilidadeClasse: (
    personagemSessaoId: number,
    payload: {
      habilidadeId: number;
      versaoNivel: number;
      aprimoramentos?: Array<{
        tecnicaId: number;
        tipoGrauCodigo: string;
        graus: number;
      }>;
    },
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
  onRolarTesteHabilidade: (payload: RolagemTesteHabilidadeSessaoPayload) => void;
  onRolarDanoHabilidade: (payload: RolagemDanoHabilidadeSessaoPayload) => void;
  preferenciasMacrosArmas: Record<string, PreferenciaMacroArmaSessao>;
  onAtualizarPreferenciasMacrosArmas: (
    atualizacao:
      | Record<string, PreferenciaMacroArmaSessao>
      | ((
          estado: Record<string, PreferenciaMacroArmaSessao>,
        ) => Record<string, PreferenciaMacroArmaSessao>),
  ) => void;
  onRolarMacroArma: (solicitacao: SolicitacaoMacroArma) => Promise<void>;
  preferenciasMacrosPersonalizadas: Record<string, PreferenciaMacroPersonalizadaSessao>;
  onAtualizarPreferenciasMacrosPersonalizadas: (
    atualizacao: Record<string, PreferenciaMacroPersonalizadaSessao> | ((estado: Record<string, PreferenciaMacroPersonalizadaSessao>) => Record<string, PreferenciaMacroPersonalizadaSessao>),
  ) => void;
  onRolarMacroPersonalizada: (solicitacao: SolicitacaoMacroPersonalizada) => Promise<void>;
  onAbrirEdicaoPersonagem: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  onAbrirFichaCompleta: (card: SessaoCampanhaDetalhe['cards'][number]) => void;
  onInvocarVinculado?: (vinculadoId: number) => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: SessaoCampanhaDetalhe['cards'][number]['condicoesAtivas'],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  limitesCategoriaAtivo?: boolean;
  consumirComCalmaAtivo?: boolean;
  alvosPersonagens?: Array<{
    personagemSessaoId: number;
    personagemCampanhaId: number;
    nomePersonagem: string;
  }>;
  alvosNpcs?: Array<{
    npcSessaoId: number;
    nome: string;
  }>;
  onConsumirItem?: (payload: {
    itemInventarioCampanhaId: number;
    modo: 'NORMAL' | 'COM_CALMA' | 'MANUAL';
    alvoTipo?: 'PERSONAGEM' | 'NPC';
    alvoId?: number;
    observacao?: string;
  }) => Promise<void>;
  recursosCompactosObrigatorios?: boolean;
  inspiracaoAtiva?: boolean;
  pontosInspiracaoPorPersonagem?: Record<string, number>;
  podeControlarInspiracao?: boolean;
  atualizandoInspiracaoChave?: string | null;
  onAjustarInspiracao?: (personagemCampanhaId: number, delta: number) => void;
  onGastarInspiracao?: (
    personagemCampanhaId: number,
    gasto: { custo: 1 | 2 | 3; efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO'; label: string },
  ) => void;
  erro?: UserErrorState | null;
};

export function SessionCharactersPanel({
  campanhaId,
  sessaoId,
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
  onUsarHabilidadeClasse,
  onEncerrarSustentacao,
  onAplicarDeltaRecursoCard,
  onAplicarAjustePersonalizadoRecursoCard,
  onSelecionarNucleo,
  onSacrificarNucleo,
  onRolarPericia,
  onRolarTesteHabilidade,
  onRolarDanoHabilidade,
  preferenciasMacrosArmas,
  onAtualizarPreferenciasMacrosArmas,
  onRolarMacroArma,
  preferenciasMacrosPersonalizadas,
  onAtualizarPreferenciasMacrosPersonalizadas,
  onRolarMacroPersonalizada,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  onInvocarVinculado,
  renderPainelCondicoes,
  limitesCategoriaAtivo,
  consumirComCalmaAtivo,
  alvosPersonagens,
  alvosNpcs,
  onConsumirItem,
  recursosCompactosObrigatorios = false,
  inspiracaoAtiva = false,
  pontosInspiracaoPorPersonagem = {},
  podeControlarInspiracao = false,
  atualizandoInspiracaoChave = null,
  onAjustarInspiracao,
  onGastarInspiracao,
  erro,
}: SessionCharactersPanelProps) {
  return (
    <SessionPanel
      title="Personagens da sessão"
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
          icon="character-gojo"
          title="Sem personagens na sessão"
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
          const pontosInspiracao =
            pontosInspiracaoPorPersonagem[String(card.personagemCampanhaId)] ?? 0;

          return (
            <CharacterSessionCard
              key={card.personagemSessaoId}
              campanhaId={campanhaId}
              sessaoId={sessaoId}
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
              onInvocarVinculado={onInvocarVinculado}
              onSolicitarRemover={() => onSolicitarRemoverPersonagem(card)}
              renderPainelCondicoes={renderPainelCondicoes}
              acumulosHabilidade={acumulosHabilidade}
              onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
              onUsarHabilidade={onUsarHabilidade}
              onUsarHabilidadeClasse={onUsarHabilidadeClasse}
              onEncerrarSustentacao={(personagemSessaoId, sustentacaoId) =>
                void onEncerrarSustentacao(personagemSessaoId, sustentacaoId)
              }
              formatarCustos={formatarCustos}
              limitesCategoriaAtivo={limitesCategoriaAtivo}
              consumirComCalmaAtivo={consumirComCalmaAtivo}
              alvosPersonagens={alvosPersonagens}
              alvosNpcs={alvosNpcs}
              onConsumirItem={onConsumirItem}
              onRolarPericia={onRolarPericia}
              onRolarTesteHabilidade={onRolarTesteHabilidade}
              onRolarDanoHabilidade={onRolarDanoHabilidade}
              preferenciasMacrosArmas={preferenciasMacrosArmas}
              onAtualizarPreferenciasMacrosArmas={onAtualizarPreferenciasMacrosArmas}
              onRolarMacroArma={onRolarMacroArma}
              preferenciasMacrosPersonalizadas={preferenciasMacrosPersonalizadas}
              onAtualizarPreferenciasMacrosPersonalizadas={onAtualizarPreferenciasMacrosPersonalizadas}
              onRolarMacroPersonalizada={onRolarMacroPersonalizada}
              recursosCompactosObrigatorios={recursosCompactosObrigatorios}
              inspiracaoAtiva={inspiracaoAtiva}
              pontosInspiracao={pontosInspiracao}
              podeControlarInspiracao={podeControlarInspiracao}
              atualizandoInspiracao={
                atualizandoInspiracaoChave ===
                `INSPIRACAO:${card.personagemCampanhaId}`
              }
              onAjustarInspiracao={onAjustarInspiracao}
              onGastarInspiracao={onGastarInspiracao}
            />
          );
        })
      )}
    </SessionPanel>
  );
}
