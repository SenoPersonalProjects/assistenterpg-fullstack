'use client';

import type { ReactNode } from 'react';
import type {
  CondicaoAtivaSessaoCampanha,
  NucleoAmaldicoadoCodigo,
  SessaoCampanhaDetalhe,
} from '@/lib/types';
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
import type {
  PreferenciaMacroArmaSessao,
  PreferenciaMacroPersonalizadaSessao,
} from '@/lib/campanha/sessao-preferencias';
import type { SolicitacaoMacroArma, SolicitacaoMacroPersonalizada } from '@/components/campanha/sessao/SessionCharacterMacrosTab';
import type {
  RolagemDanoHabilidadeSessaoPayload,
  RolagemPericiaSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';

export type CampoAjusteRecursoCard = 'pv' | 'pe' | 'ea' | 'san';

type GastoInspiracaoCard = {
  custo: 1 | 2 | 3;
  efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO';
  label: string;
};

type CharacterSessionCardProps = {
  campanhaId: number;
  sessaoId: number;
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
  onSelecionarNucleo: (
    personagemCampanhaId: number,
    nucleo: NucleoAmaldicoadoCodigo,
  ) => void;
  onSacrificarNucleo: (
    personagemCampanhaId: number,
    payload: { modo: 'ATUAL' | 'OUTRO'; nucleo?: NucleoAmaldicoadoCodigo },
  ) => void;
  onAbrirEdicaoPersonagem: () => void;
  onAbrirFichaCompleta: () => void;
  onInvocarVinculado?: (vinculadoId: number) => void;
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
  onEncerrarSustentacao: (
    personagemSessaoId: number,
    sustentacaoId: number,
  ) => void;
  formatarCustos: (custoEA: number, custoPE: number) => string;
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
  recursosCompactosObrigatorios?: boolean;
  inspiracaoAtiva?: boolean;
  pontosInspiracao?: number;
  podeControlarInspiracao?: boolean;
  atualizandoInspiracao?: boolean;
  onAjustarInspiracao?: (personagemCampanhaId: number, delta: number) => void;
  onGastarInspiracao?: (
    personagemCampanhaId: number,
    gasto: GastoInspiracaoCard,
  ) => void;
};

export function CharacterSessionCard({
  campanhaId,
  sessaoId,
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
  onSelecionarNucleo,
  onSacrificarNucleo,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  onInvocarVinculado,
  onSolicitarRemover,
  renderPainelCondicoes,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onUsarHabilidadeClasse,
  onEncerrarSustentacao,
  formatarCustos,
  limitesCategoriaAtivo,
  consumirComCalmaAtivo,
  alvosPersonagens,
  alvosNpcs,
  onConsumirItem,
  onRolarPericia,
  onRolarTesteHabilidade,
  onRolarDanoHabilidade,
  preferenciasMacrosArmas,
  onAtualizarPreferenciasMacrosArmas,
  onRolarMacroArma,
  preferenciasMacrosPersonalizadas,
  onAtualizarPreferenciasMacrosPersonalizadas,
  onRolarMacroPersonalizada,
  recursosCompactosObrigatorios = false,
  inspiracaoAtiva = false,
  pontosInspiracao = 0,
  podeControlarInspiracao = false,
  atualizandoInspiracao = false,
  onAjustarInspiracao,
  onGastarInspiracao,
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
        ? 'Encerrando sustentação...'
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
  const pontosInspiracaoNormalizados = Math.max(
    0,
    Math.min(3, pontosInspiracao),
  );

  return (
    <Card className="session-panel space-y-3">
      {recursos ? (
        <SessionCharacterResourceCard
          nomePersonagem={card.nomePersonagem}
          nomeJogador={card.nomeJogador}
          iniciativaValor={iniciativaValor ?? null}
          expandido={cardRecursosExpandido}
          compactoObrigatorio={recursosCompactosObrigatorios}
          inspiracaoAtiva={inspiracaoAtiva}
          pontosInspiracao={pontosInspiracaoNormalizados}
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
            pvBarrasTotal: recursos.pvBarrasTotal,
            pvBarrasRestantes: recursos.pvBarrasRestantes,
            pvBarraMaxAtual: recursos.pvBarraMaxAtual,
            nucleoAtivo: recursos.nucleoAtivo,
            nucleosDisponiveis: recursos.nucleosDisponiveis,
            sanAtual: recursos.sanAtual,
            sanMax: recursos.sanMax,
            eaAtual: recursos.eaAtual,
            eaMax: recursos.eaMax,
            peAtual: recursos.peAtual,
            peMax: recursos.peMax,
          }}
          onSelecionarNucleo={(nucleo) =>
            onSelecionarNucleo(card.personagemCampanhaId, nucleo)
          }
          onSacrificarNucleo={(payload) =>
            onSacrificarNucleo(card.personagemCampanhaId, payload)
          }
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
            title="Recursos completos indisponíveis. Acompanhe iniciativa e informações básicas."
          >
            Somente leitura
          </Badge>
          <p className="session-text-xxs text-app-muted">
            Dados completos indisponíveis no momento.
          </p>
        </div>
      ) : null}

      {recursos ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" color={condicoesColor}>
            Condições {totalCondicoesAtivasCard}
          </Badge>
          <Badge size="sm" color={sustentacoesColor}>
            Sustentações {totalSustentacoesAtivasCard}
          </Badge>
          {statusFisico ? (
            <Badge size="sm" color={statusFisicoColor}>
              Físico: {statusFisico}
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
          campanhaId={campanhaId}
          sessaoId={sessaoId}
          iniciativaValor={iniciativaValor ?? null}
          abaDetalheCard={abaDetalheCard}
          totalCondicoesAtivasCard={totalCondicoesAtivasCard}
          totalTecnicasCard={totalTecnicasCard}
          totalSustentacoesAtivasCard={totalSustentacoesAtivasCard}
          inspiracaoAtiva={inspiracaoAtiva}
          pontosInspiracao={pontosInspiracaoNormalizados}
          podeControlarInspiracao={podeControlarInspiracao}
          atualizandoInspiracao={atualizandoInspiracao}
          onAjustarInspiracao={(delta) =>
            onAjustarInspiracao?.(card.personagemCampanhaId, delta)
          }
          onGastarInspiracao={(gasto) =>
            onGastarInspiracao?.(card.personagemCampanhaId, gasto)
          }
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
          onUsarHabilidadeClasse={onUsarHabilidadeClasse}
          acaoHabilidadePendente={acaoHabilidadePendente}
          sessaoEncerrada={sessaoEncerrada}
          onAbrirEdicaoPersonagem={onAbrirEdicaoPersonagem}
          onAbrirFichaCompleta={onAbrirFichaCompleta}
          onInvocarVinculado={onInvocarVinculado}
          onEncerrarSustentacao={onEncerrarSustentacao}
          formatarCustos={formatarCustos}
          renderPainelCondicoes={renderPainelCondicoes}
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
        />
      ) : null}

    </Card>
  );
}
