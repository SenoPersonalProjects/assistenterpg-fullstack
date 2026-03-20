'use client';

import type { ReactNode } from 'react';
import type { CondicaoAtivaSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionCharacterResourceCard } from '@/components/campanha/sessao/SessionCharacterResourceCard';
import { SessionCharacterDetailsTabs } from '@/components/campanha/sessao/SessionCharacterDetailsTabs';
import {
  resolverStatusFisico,
  resolverStatusMental,
} from '@/lib/campanha/sessao-status';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';

export type CampoAjusteRecursoCard = 'pv' | 'pe' | 'ea' | 'san';

type CharacterSessionCardProps = {
  card: SessaoCampanhaDetalhe['cards'][number];
  iniciativaValor: number | null;
  cardRecursosExpandido: boolean;
  abaDetalheCard: AbaDetalheCard;
  totalCondicoesAtivasCard: number;
  totalTecnicasCard: number;
  totalSustentacoesAtivasCard: number;
  mostrarSomenteSustentadasAtivas: boolean;
  onToggleMostrarSomenteSustentadas: (checked: boolean) => void;
  onAtualizarAbaDetalheCard: (aba: AbaDetalheCard) => void;
  tecnicaInataAberta: boolean;
  onToggleTecnicaInata: (aberto: boolean) => void;
  tecnicasNaoInatasAbertas: boolean;
  onToggleTecnicasNaoInatas: (aberto: boolean) => void;
  ajustesRecursos: Record<CampoAjusteRecursoCard, string>;
  campoRecursoPendenteCard: CampoAjusteRecursoCard | null;
  sessaoEncerrada: boolean;
  salvandoCardId: number | null;
  removendo: boolean;
  acaoHabilidadePendente: string | null;
  onAlternarExpandido: () => void;
  onAtualizarAjusteRecursoPersonalizado: (
    campo: CampoAjusteRecursoCard,
    valor: string,
  ) => void;
  onAplicarDeltaRecurso: (campo: CampoAjusteRecursoCard, delta: number) => void;
  onAplicarAjustePersonalizado: (campo: CampoAjusteRecursoCard) => void;
  onAbrirEdicaoPersonagem: () => void;
  onAbrirFichaCompleta: () => void;
  onSolicitarRemover: () => void;
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  acumulosHabilidade: Record<string, string>;
  onAtualizarAcumulosHabilidade: (chave: string, valor: string) => void;
  onUsarHabilidade: (
    personagemSessaoId: number,
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number,
    acumulos?: number,
  ) => void;
  onEncerrarSustentacao: (
    personagemSessaoId: number,
    sustentacaoId: number,
  ) => void;
  formatarCustos: (custoEA: number, custoPE: number) => string;
};

export function CharacterSessionCard({
  card,
  iniciativaValor,
  cardRecursosExpandido,
  abaDetalheCard,
  totalCondicoesAtivasCard,
  totalTecnicasCard,
  totalSustentacoesAtivasCard,
  mostrarSomenteSustentadasAtivas,
  onToggleMostrarSomenteSustentadas,
  onAtualizarAbaDetalheCard,
  tecnicaInataAberta,
  onToggleTecnicaInata,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  ajustesRecursos,
  campoRecursoPendenteCard,
  sessaoEncerrada,
  salvandoCardId,
  removendo,
  acaoHabilidadePendente,
  onAlternarExpandido,
  onAtualizarAjusteRecursoPersonalizado,
  onAplicarDeltaRecurso,
  onAplicarAjustePersonalizado,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  onSolicitarRemover,
  renderPainelCondicoes,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onEncerrarSustentacao,
  formatarCustos,
}: CharacterSessionCardProps) {
  const recursos = card.recursos;
  const acaoHabilidadeCard =
    acaoHabilidadePendente &&
    new RegExp(`^(usar|encerrar):${card.personagemSessaoId}:`).test(
      acaoHabilidadePendente,
    )
      ? acaoHabilidadePendente
      : null;
  const mensagensStatus: string[] = [];
  if (
    campoRecursoPendenteCard ||
    salvandoCardId === card.personagemCampanhaId
  ) {
    mensagensStatus.push('Atualizando recurso...');
  }
  if (acaoHabilidadeCard) {
    mensagensStatus.push(
      acaoHabilidadeCard.startsWith('encerrar:')
        ? 'Encerrando sustentacao...'
        : 'Aplicando habilidade...',
    );
  }
  const limiteMorrendo =
    typeof card.turnosMorrendo === 'number' ? card.turnosMorrendo : null;
  const limiteEnlouquecendo =
    typeof card.turnosEnlouquecendo === 'number' ? card.turnosEnlouquecendo : null;
  const statusFisico = recursos
    ? resolverStatusFisico(recursos, card.condicoesAtivas, limiteMorrendo)
    : null;
  const statusMental = recursos
    ? resolverStatusMental(recursos, card.condicoesAtivas, limiteEnlouquecendo)
    : null;
  const statusFisicoColor =
    statusFisico === 'Morto'
      ? 'red'
      : statusFisico === 'Morrendo'
        ? 'orange'
        : statusFisico === 'Machucado'
          ? 'yellow'
          : 'green';
  const statusMentalColor =
    statusMental === 'Louco'
      ? 'red'
      : statusMental === 'Enlouquecendo'
        ? 'orange'
        : statusMental === 'Ruim'
          ? 'yellow'
          : 'green';
  const condicoesColor = totalCondicoesAtivasCard > 0 ? 'yellow' : 'gray';
  const sustentacoesColor = totalSustentacoesAtivasCard > 0 ? 'blue' : 'gray';

  return (
    <Card className="session-panel space-y-3">
      {recursos ? (
        <SessionCharacterResourceCard
          nomePersonagem={card.nomePersonagem}
          nomeJogador={card.nomeJogador}
          iniciativaValor={iniciativaValor ?? null}
          expandido={cardRecursosExpandido}
          onAlternarExpandido={onAlternarExpandido}
          podeAjustar={card.podeEditar}
          ajustePersonalizado={ajustesRecursos}
          onAtualizarAjustePersonalizado={onAtualizarAjusteRecursoPersonalizado}
          onAplicarAjusteRapido={onAplicarDeltaRecurso}
          onAplicarAjustePersonalizado={onAplicarAjustePersonalizado}
          acaoPendenteCampo={campoRecursoPendenteCard}
          desabilitado={
            sessaoEncerrada || salvandoCardId === card.personagemCampanhaId
          }
          recursos={{
            pvAtual: recursos.pvAtual,
            pvMax: recursos.pvMax,
            sanAtual: recursos.sanAtual,
            sanMax: recursos.sanMax,
            eaAtual: recursos.eaAtual,
            eaMax: recursos.eaMax,
            peAtual: recursos.peAtual,
            peMax: recursos.peMax,
          }}
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-app-fg">{card.nomePersonagem}</h3>
          <p className="text-xs text-app-muted">Jogador: {card.nomeJogador}</p>
        </div>
      )}

      {!recursos ? (
        <div className="space-y-2">
          <Badge
            size="sm"
            color="gray"
            title="Recursos completos indisponiveis. Acompanhe iniciativa e informacoes basicas."
          >
            Somente leitura
          </Badge>
          <p className="session-text-xxs text-app-muted">
            Dados completos indisponiveis no momento.
          </p>
        </div>
      ) : null}

      {recursos ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" color={condicoesColor}>
            Condicoes {totalCondicoesAtivasCard}
          </Badge>
          <Badge size="sm" color={sustentacoesColor}>
            Sustentacoes {totalSustentacoesAtivasCard}
          </Badge>
          {statusFisico ? (
            <Badge size="sm" color={statusFisicoColor}>
              Fisico: {statusFisico}
            </Badge>
          ) : null}
          {statusMental ? (
            <Badge size="sm" color={statusMentalColor}>
              Mental: {statusMental}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {recursos && card.podeEditar ? (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSolicitarRemover}
            disabled={sessaoEncerrada || removendo}
          >
            {removendo ? 'Removendo...' : 'Remover da cena'}
          </Button>
        </div>
      ) : null}

      {mensagensStatus.length > 0 ? (
        <div className="rounded border border-app-border bg-app-surface px-2 py-1.5 session-text-xxs text-app-muted space-y-1">
          {mensagensStatus.map((mensagem) => (
            <p key={mensagem}>{mensagem}</p>
          ))}
        </div>
      ) : null}

      {recursos && cardRecursosExpandido ? (
        <SessionCharacterDetailsTabs
          card={card}
          iniciativaValor={iniciativaValor ?? null}
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
          onAbrirEdicaoPersonagem={onAbrirEdicaoPersonagem}
          onAbrirFichaCompleta={onAbrirFichaCompleta}
          onEncerrarSustentacao={onEncerrarSustentacao}
          formatarCustos={formatarCustos}
          renderPainelCondicoes={renderPainelCondicoes}
        />
      ) : null}

    </Card>
  );
}
