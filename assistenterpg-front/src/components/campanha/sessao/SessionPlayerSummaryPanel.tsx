'use client';

import type { ReactNode } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { SessionCharacterResourceCard } from '@/components/campanha/sessao/SessionCharacterResourceCard';
import { SessionCharacterDetailsTabs } from '@/components/campanha/sessao/SessionCharacterDetailsTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type {
  CondicaoAtivaSessaoCampanha,
  NucleoAmaldicoadoCodigo,
  SessaoCampanhaDetalhe,
} from '@/lib/types';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import type {
  AjustesRecursos,
  CampoAjusteRecurso,
} from '@/hooks/useSessaoRecursos';
import type {
  RolagemDanoHabilidadeSessaoPayload,
  RolagemPericiaSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';

type SessionPlayerSummaryPanelProps = {
  campanhaId: number;
  card: SessaoCampanhaDetalhe['cards'][number] | null;
  iniciativaValor: number | null;
  cardRecursosExpandido: boolean;
  abaDetalheCard: AbaDetalheCard;
  totalCondicoesAtivasCard: number;
  totalTecnicasCard: number;
  totalSustentacoesAtivasCard: number;
  mostrarSomenteSustentadasAtivas: boolean;
  tecnicaInataAberta: boolean;
  tecnicasNaoInatasAbertas: boolean;
  sessaoEncerrada: boolean;
  ajustesRecursos: AjustesRecursos;
  campoRecursoPendente: CampoAjusteRecurso | null;
  salvandoCardId: number | null;
  podeAdicionar: boolean;
  onAbrirAdicionar: () => void;
  onAlternarExpandido: () => void;
  onAtualizarAbaDetalheCard: (aba: AbaDetalheCard) => void;
  onToggleMostrarSomenteSustentadas: (checked: boolean) => void;
  onToggleTecnicaInata: (aberto: boolean) => void;
  onToggleTecnicasNaoInatas: (aberto: boolean) => void;
  acaoHabilidadePendente: string | null;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
  onEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => void;
  formatarCustos: (custoEA: number, custoPE: number) => string;
  limitesCategoriaAtivo?: boolean;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  onAbrirFichaCompleta: () => void;
  onSolicitarRemover: () => void;
  onAtualizarAjusteRecurso: (campo: CampoAjusteRecurso, valor: string) => void;
  onAplicarDeltaRecurso: (campo: CampoAjusteRecurso, delta: number) => void;
  onAplicarAjustePersonalizado: (campo: CampoAjusteRecurso) => void;
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
};

export function SessionPlayerSummaryPanel({
  campanhaId,
  card,
  iniciativaValor,
  cardRecursosExpandido,
  abaDetalheCard,
  totalCondicoesAtivasCard,
  totalTecnicasCard,
  totalSustentacoesAtivasCard,
  mostrarSomenteSustentadasAtivas,
  tecnicaInataAberta,
  tecnicasNaoInatasAbertas,
  sessaoEncerrada,
  ajustesRecursos,
  campoRecursoPendente,
  salvandoCardId,
  podeAdicionar,
  onAbrirAdicionar,
  onAlternarExpandido,
  onAtualizarAbaDetalheCard,
  onToggleMostrarSomenteSustentadas,
  onToggleTecnicaInata,
  onToggleTecnicasNaoInatas,
  acaoHabilidadePendente,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onEncerrarSustentacao,
  formatarCustos,
  limitesCategoriaAtivo,
  renderPainelCondicoes,
  onAbrirFichaCompleta,
  onSolicitarRemover,
  onAtualizarAjusteRecurso,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onSelecionarNucleo,
  onSacrificarNucleo,
  onRolarPericia,
  onRolarTesteHabilidade,
  onRolarDanoHabilidade,
}: SessionPlayerSummaryPanelProps) {
  return (
    <SessionPanel
      title="Meu personagem"
      subtitle="Resumo rapido da sua ficha na cena."
      tone="control"
      right={
        !card && podeAdicionar ? (
          <Button size="sm" onClick={onAbrirAdicionar} disabled={sessaoEncerrada}>
            <Icon name="add" className="mr-1.5 h-3.5 w-3.5" />
            Adicionar meu personagem
          </Button>
        ) : undefined
      }
    >
      {!card ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="characters"
          title="Personagem nao encontrado"
          description="Adicione seu personagem para acompanhar a cena."
          actionLabel={podeAdicionar ? 'Adicionar meu personagem' : undefined}
          onAction={podeAdicionar ? onAbrirAdicionar : undefined}
        />
      ) : card.recursos ? (
        <div className="space-y-3">
          <SessionCharacterResourceCard
            nomePersonagem={card.nomePersonagem}
            nomeJogador={card.nomeJogador}
            iniciativaValor={iniciativaValor}
            recursos={card.recursos}
            expandido={cardRecursosExpandido}
            onAlternarExpandido={onAlternarExpandido}
            podeAjustar={card.podeEditar}
            ajustePersonalizado={ajustesRecursos}
            onAtualizarAjustePersonalizado={onAtualizarAjusteRecurso}
            onAplicarAjustePersonalizado={onAplicarAjustePersonalizado}
            onAplicarAjusteRapido={onAplicarDeltaRecurso}
            onSelecionarNucleo={(nucleo) =>
              onSelecionarNucleo(card.personagemCampanhaId, nucleo)
            }
            onSacrificarNucleo={(payload) =>
              onSacrificarNucleo(card.personagemCampanhaId, payload)
            }
            acaoPendenteCampo={campoRecursoPendente}
            desabilitado={sessaoEncerrada || salvandoCardId === card.personagemCampanhaId}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onAbrirFichaCompleta}>
              <Icon name="externalLink" className="mr-1.5 h-3.5 w-3.5" />
              Abrir ficha completa
            </Button>
            {card.podeEditar ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSolicitarRemover}
                disabled={sessaoEncerrada}
              >
                Remover da cena
              </Button>
            ) : null}
          </div>

          {cardRecursosExpandido ? (
            <SessionCharacterDetailsTabs
              card={card}
              campanhaId={campanhaId}
              iniciativaValor={iniciativaValor}
              abaDetalheCard={abaDetalheCard}
              totalCondicoesAtivasCard={totalCondicoesAtivasCard}
              totalTecnicasCard={totalTecnicasCard}
              totalSustentacoesAtivasCard={totalSustentacoesAtivasCard}
              mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasAtivas}
              onToggleMostrarSomenteSustentadas={onToggleMostrarSomenteSustentadas}
              onAtualizarAbaDetalheCard={onAtualizarAbaDetalheCard}
              tecnicaInataAberta={tecnicaInataAberta}
              onToggleTecnicaInata={onToggleTecnicaInata}
              tecnicasNaoInatasAbertas={tecnicasNaoInatasAbertas}
              onToggleTecnicasNaoInatas={onToggleTecnicasNaoInatas}
              acumulosHabilidade={acumulosHabilidade}
              onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
              onUsarHabilidade={onUsarHabilidade}
              acaoHabilidadePendente={acaoHabilidadePendente}
              sessaoEncerrada={sessaoEncerrada}
              onEncerrarSustentacao={onEncerrarSustentacao}
              formatarCustos={formatarCustos}
              renderPainelCondicoes={renderPainelCondicoes}
                mostrarAcoesResumo={false}
                limitesCategoriaAtivo={limitesCategoriaAtivo}
                onRolarPericia={onRolarPericia}
                onRolarTesteHabilidade={onRolarTesteHabilidade}
                onRolarDanoHabilidade={onRolarDanoHabilidade}
              />
          ) : null}
        </div>
      ) : (
        <EmptyState
          variant="session"
          size="sm"
          icon="info"
          title="Dados indisponiveis"
          description="Os dados completos do personagem nao estao disponiveis no momento."
        />
      )}
    </SessionPanel>
  );
}
