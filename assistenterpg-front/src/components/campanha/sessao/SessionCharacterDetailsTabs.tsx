'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionTabs, type SessionTabItem } from '@/components/campanha/sessao/SessionTabs';
import { SessionTechniqueBlock } from '@/components/campanha/sessao/SessionTechniqueBlock';
import { SessionCharacterInventoryTab } from '@/components/campanha/sessao/SessionCharacterInventoryTab';
import { Icon } from '@/components/ui/Icon';
import type { CondicaoAtivaSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import {
  formatarBuffsAprimoradoAtivos,
  formatarTipoGrauAprimorado,
} from '@/lib/campanha/sessao-aprimoramentos';
import type { AbaDetalheCard } from '@/lib/campanha/sessao-preferencias';
import type {
  RolagemDanoHabilidadeSessaoPayload,
  RolagemPericiaSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';
import {
  calcularDadosPericiaPorAtributo,
  resolverValorAtributoBase,
  type AtributoBaseCodigo,
} from '@/lib/utils/pericias';
import {
  entidadeVinculadaAtivaNestaSessao,
  podeInvocarEntidadeVinculada,
} from '@/lib/campanha/entidades-vinculadas';
import { periciaPermiteAtaquePersonagem } from '@/lib/campanha/sessao-rolagem-pericia';

type AprimoradoModalState = {
  habilidadeId: number;
  habilidadeNome: string;
  versaoNivel: number;
  grausTotal: number;
  custoPE: number;
  distribuicao: Record<string, string>;
};

type SessionCharacterDetailsTabsProps = {
  card: SessaoCampanhaDetalhe['cards'][number];
  campanhaId: number;
  iniciativaValor: number | null;
  abaDetalheCard: AbaDetalheCard;
  totalCondicoesAtivasCard: number;
  totalTecnicasCard: number;
  totalSustentacoesAtivasCard: number;
  inspiracaoAtiva?: boolean;
  pontosInspiracao?: number;
  podeControlarInspiracao?: boolean;
  atualizandoInspiracao?: boolean;
  onAjustarInspiracao?: (delta: number) => void;
  onGastarInspiracao?: (gasto: {
    custo: 1 | 2 | 3;
    efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO';
    label: string;
  }) => void;
  mostrarSomenteSustentadasAtivas: boolean;
  onToggleMostrarSomenteSustentadas: (checked: boolean) => void;
  onAtualizarAbaDetalheCard: (aba: AbaDetalheCard) => void;
  tecnicaInataAberta: boolean;
  onToggleTecnicaInata: (aberto: boolean) => void;
  tecnicasNaoInatasAbertas: boolean;
  onToggleTecnicasNaoInatas: (aberto: boolean) => void;
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
  acaoHabilidadePendente: string | null;
  sessaoEncerrada: boolean;
  onAbrirEdicaoPersonagem?: () => void;
  onAbrirFichaCompleta?: () => void;
  onInvocarVinculado?: (vinculadoId: number) => void;
  onEncerrarSustentacao: (personagemSessaoId: number, sustentacaoId: number) => void;
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
  renderPainelCondicoes: (
    alvoTipo: 'PERSONAGEM' | 'NPC',
    alvoId: number,
    nomeAlvo: string,
    condicoesAtivas: CondicaoAtivaSessaoCampanha[],
    modo?: 'inline' | 'accordion',
  ) => ReactNode;
  mostrarAcoesResumo?: boolean;
};

function montarChaveEncerrarSustentacao(
  personagemSessaoId: number,
  sustentacaoId: number,
): string {
  return `encerrar:${personagemSessaoId}:${sustentacaoId}`;
}

function montarChaveSustentacaoAtiva(
  habilidadeTecnicaId: number,
  variacaoHabilidadeId?: number | null,
): string {
  return `${habilidadeTecnicaId}:${variacaoHabilidadeId ?? 'base'}`;
}

function formatarBonus(valor: number): string {
  if (!valor) return '--';
  return valor > 0 ? `+${valor}` : String(valor);
}

function formatarNumeroSessao(valor?: number | null): string {
  return typeof valor === 'number' && Number.isFinite(valor)
    ? String(Math.trunc(valor))
    : '--';
}

function formatarTextoFicha(valor?: string | null): string {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || '--';
}

function formatarVersaoHabilidadeClasse(
  tipo: SessaoCampanhaDetalhe['cards'][number]['habilidadesClasse'][number]['tipo'],
  versao: SessaoCampanhaDetalhe['cards'][number]['habilidadesClasse'][number]['versoesDisponiveis'][number],
): string {
  if (tipo === 'PERITO') {
    return `${versao.custoPE} PE | +1d${versao.dadoFaces ?? 6}`;
  }
  if (tipo === 'ATAQUE_ESPECIAL') {
    return `${versao.custoPE} PE | +${versao.bonus ?? 0}`;
  }
  return `${versao.custoPE} PE | +${versao.graus ?? 0} grau(s)`;
}

function formatarTipoVinculado(tipo: string): string {
  const labels: Record<string, string> = {
    SHIKIGAMI: 'Shikigami',
    CORPO_AMALDICOADO: 'Corpo',
    MALDICAO_CONTROLADA: 'Maldicao',
  };
  return labels[tipo] ?? tipo;
}

export function SessionCharacterDetailsTabs({
  card,
  campanhaId,
  iniciativaValor,
  abaDetalheCard,
  totalCondicoesAtivasCard,
  totalTecnicasCard,
  totalSustentacoesAtivasCard,
  inspiracaoAtiva = false,
  pontosInspiracao = 0,
  podeControlarInspiracao = false,
  atualizandoInspiracao = false,
  onAjustarInspiracao,
  onGastarInspiracao,
  mostrarSomenteSustentadasAtivas,
  onToggleMostrarSomenteSustentadas,
  onAtualizarAbaDetalheCard,
  tecnicaInataAberta,
  onToggleTecnicaInata,
  tecnicasNaoInatasAbertas,
  onToggleTecnicasNaoInatas,
  acumulosHabilidade,
  onAtualizarAcumulosHabilidade,
  onUsarHabilidade,
  onUsarHabilidadeClasse,
  acaoHabilidadePendente,
  sessaoEncerrada,
  onAbrirEdicaoPersonagem,
  onAbrirFichaCompleta,
  onInvocarVinculado,
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
  renderPainelCondicoes,
  mostrarAcoesResumo = true,
}: SessionCharacterDetailsTabsProps) {
  const [mostrarSomentePericiasBonificadas, setMostrarSomentePericiasBonificadas] =
    useState(false);
  const [aprimoradoModal, setAprimoradoModal] =
    useState<AprimoradoModalState | null>(null);
  const recursos = card.recursos;
  if (!recursos) return null;
  const ficha = card.ficha;

  const resumoTecnica = card.tecnicaInata?.nome
    ? textoSeguro(card.tecnicaInata.nome)
    : 'Sem técnica inata';
  const mapaSustentacoes = new Map<string, number>();
  for (const sustentacao of card.sustentacoesAtivas) {
    const chave = montarChaveSustentacaoAtiva(
      sustentacao.habilidadeTecnicaId,
      sustentacao.variacaoHabilidadeId,
    );
    mapaSustentacoes.set(chave, (mapaSustentacoes.get(chave) ?? 0) + 1);
  }
  const tecnicasDisponiveis = [
    card.tecnicaInata,
    ...card.tecnicasNaoInatas,
  ].filter(Boolean) as Array<
    NonNullable<SessaoCampanhaDetalhe['cards'][number]['tecnicaInata']>
  >;
  let totalHabilidades = 0;
  let totalHabilidadesSustentadas = 0;
  let totalHabilidadesInata = 0;
  let totalHabilidadesNaoInatas = 0;
  for (const tecnica of tecnicasDisponiveis) {
    for (const habilidade of tecnica.habilidades) {
      totalHabilidades += 1;
      if (tecnica.id === card.tecnicaInata?.id) {
        totalHabilidadesInata += 1;
      } else {
        totalHabilidadesNaoInatas += 1;
      }
      const baseAtiva = mapaSustentacoes.has(
        montarChaveSustentacaoAtiva(habilidade.id),
      );
      const variacaoAtiva = habilidade.variacoes.some((variacao) =>
        mapaSustentacoes.has(
          montarChaveSustentacaoAtiva(habilidade.id, variacao.id),
        ),
      );
      if (baseAtiva || variacaoAtiva) {
        totalHabilidadesSustentadas += 1;
      }
    }
  }

  const obterQtdSustentacaoAtiva = (
    habilidadeTecnicaId: number,
    variacaoHabilidadeId?: number | null,
  ) =>
    mapaSustentacoes.get(
      montarChaveSustentacaoAtiva(habilidadeTecnicaId, variacaoHabilidadeId),
    ) ?? 0;

  const habilidadesClasseCard = card.habilidadesClasse ?? [];
  const outrasHabilidadesCard = card.outrasHabilidades ?? [];
  const aprimoramentosTemporariosCard = card.aprimoramentosTemporarios ?? [];
  const buffsAprimoradoAtivos = formatarBuffsAprimoradoAtivos(
    aprimoramentosTemporariosCard,
  );
  const opcoesAprimoramentoTecnicasCard =
    card.opcoesAprimoramentoTecnicasNaoInatas ?? [];
  const totalHabilidadesClasse = habilidadesClasseCard.length;
  const totalOutrasHabilidades = outrasHabilidadesCard.length;
  const totalHabilidadesAba =
    totalTecnicasCard + totalHabilidadesClasse + totalOutrasHabilidades;
  const totalGrausAprimorado = aprimoradoModal
    ? Object.values(aprimoradoModal.distribuicao).reduce((acc, valor) => {
        const numero = Number(valor);
        return acc + (Number.isFinite(numero) ? Math.max(0, Math.trunc(numero)) : 0);
      }, 0)
    : 0;

  const periciasOrdenadas = [...(card.pericias ?? [])].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );
  const periciasFiltradas = mostrarSomentePericiasBonificadas
    ? periciasOrdenadas.filter((pericia) => pericia.bonusTotal > 0)
    : periciasOrdenadas;
  const atributos = card.atributos;
  const listaAtributos = [
    { codigo: 'AGI', label: 'Agilidade', valor: atributos?.agilidade },
    { codigo: 'FOR', label: 'Forca', valor: atributos?.forca },
    { codigo: 'INT', label: 'Intelecto', valor: atributos?.intelecto },
    { codigo: 'PRE', label: 'Presenca', valor: atributos?.presenca },
    { codigo: 'VIG', label: 'Vigor', valor: atributos?.vigor },
  ];

  const handleRolarPericia = (
    pericia: (typeof periciasOrdenadas)[number],
    tipoRolagem: 'PERICIA' | 'ATAQUE' = 'PERICIA',
  ) => {
    if (!card.atributos) return;
    const atributoCodigo = pericia.atributoBase as AtributoBaseCodigo;
    const valorAtributo =
      resolverValorAtributoBase(card.atributos, atributoCodigo) ?? 0;
    const { dados, keepMode } = calcularDadosPericiaPorAtributo(valorAtributo);
    onRolarPericia({
      alvoTipo: 'PERSONAGEM',
      tipoRolagem,
      alvoNome: card.nomePersonagem,
      personagemSessaoId: card.personagemSessaoId,
      personagemCampanhaId: card.personagemCampanhaId,
      periciaCodigo: pericia.codigo,
      periciaNome: pericia.nome,
      atributoBase: pericia.atributoBase,
      dados,
      bonus: pericia.bonusTotal,
      keepMode,
    });
  };

  const usarHabilidadeClasseSimples = (
    habilidadeId: number,
    versaoNivel: number,
  ) => {
    onUsarHabilidadeClasse(card.personagemSessaoId, {
      habilidadeId,
      versaoNivel,
    });
  };

  const abrirModalAprimorado = (
    habilidade: SessaoCampanhaDetalhe['cards'][number]['habilidadesClasse'][number],
    versao: SessaoCampanhaDetalhe['cards'][number]['habilidadesClasse'][number]['versoesDisponiveis'][number],
  ) => {
    setAprimoradoModal({
      habilidadeId: habilidade.id,
      habilidadeNome: habilidade.nome,
      versaoNivel: versao.nivel,
      grausTotal: versao.graus ?? 0,
      custoPE: versao.custoPE,
      distribuicao: {},
    });
  };

  const atualizarDistribuicaoAprimorado = (chave: string, valor: string) => {
    setAprimoradoModal((estado) =>
      estado
        ? {
            ...estado,
            distribuicao: {
              ...estado.distribuicao,
              [chave]: valor,
            },
          }
        : estado,
    );
  };

  const confirmarAprimorado = () => {
    if (!aprimoradoModal) return;
    const aprimoramentos = opcoesAprimoramentoTecnicasCard
      .map((opcao) => {
        const chave = `${opcao.tecnicaId}:${opcao.tipoGrauCodigo}`;
        const valor = Number(aprimoradoModal.distribuicao[chave] ?? 0);
        const graus = Number.isFinite(valor) ? Math.max(0, Math.trunc(valor)) : 0;
        return graus > 0
          ? {
              tecnicaId: opcao.tecnicaId,
              tipoGrauCodigo: opcao.tipoGrauCodigo,
              graus,
            }
          : null;
      })
      .filter(
        (
          item,
        ): item is {
          tecnicaId: number;
          tipoGrauCodigo: string;
          graus: number;
        } => item !== null,
      );
    onUsarHabilidadeClasse(card.personagemSessaoId, {
      habilidadeId: aprimoradoModal.habilidadeId,
      versaoNivel: aprimoradoModal.versaoNivel,
      aprimoramentos,
    });
    setAprimoradoModal(null);
  };

  const tabs: SessionTabItem[] = [
    { id: 'RESUMO', label: 'Resumo', icon: 'chart' },
    { id: 'FICHA', label: 'Ficha', icon: 'id' },
    { id: 'ATRIBUTOS', label: 'Atributos', icon: 'strength' },
    {
      id: 'PERICIAS',
      label: 'Perícias',
      icon: 'skills',
      count: periciasOrdenadas.length,
    },
  ];
  if (card.podeEditar) {
    tabs.push({ id: 'INVENTARIO', label: 'Inventário', icon: 'inventory' });
  }
  tabs.push(
    {
      id: 'TECNICAS',
      label: 'Habilidades',
      icon: 'technique',
      count: totalHabilidadesAba,
    },
    {
      id: 'SUSTENTACOES',
      label: 'Sustentações',
      icon: 'energy',
      count: totalSustentacoesAtivasCard,
    },
    {
      id: 'CONDICOES',
      label: 'Condições',
      icon: 'status',
      count: totalCondicoesAtivasCard,
    },
  );
  if (inspiracaoAtiva) {
    tabs.push({
      id: 'INSPIRACAO',
      label: 'Inspiração',
      icon: 'sparkles',
      count: Math.max(0, Math.min(3, pontosInspiracao)),
    });
  }

  return (
    <div className="space-y-2">
      <SessionTabs
        tabs={tabs}
        activeId={abaDetalheCard}
        onChange={(tabId) => onAtualizarAbaDetalheCard(tabId as AbaDetalheCard)}
        variant="compact"
      />

      {abaDetalheCard === 'RESUMO' ? (
        <div className="space-y-2 rounded border border-app-border p-2">
          <p className="text-xs text-app-muted">
            Resumo rápido do personagem na sessão.
          </p>
          <div className="space-y-2">
            <div>
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Defesa e cena
              </p>
              <div className="session-chip-row">
                <span className="session-chip">
                  INI {typeof iniciativaValor === 'number' ? iniciativaValor : '--'}
                </span>
                <span className="session-chip">
                  DEF {formatarNumeroSessao(ficha?.defesaTotal)}
                </span>
                <span className="session-chip">
                  Esquiva {formatarNumeroSessao(ficha?.esquiva)}
                </span>
                <span className="session-chip">
                  Bloqueio {formatarNumeroSessao(ficha?.bloqueio)}
                </span>
                <span className="session-chip">
                  Condições {totalCondicoesAtivasCard}
                </span>
                <span className="session-chip">
                  Sustentações {totalSustentacoesAtivasCard}
                </span>
              </div>
            </div>
            <div>
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Mobilidade e limites
              </p>
              <div className="session-chip-row">
                <span className="session-chip">
                  Nível {formatarNumeroSessao(ficha?.nivel)}
                </span>
                <span className="session-chip">
                  Desloc. {formatarNumeroSessao(ficha?.deslocamento)}m
                </span>
                <span className="session-chip">
                  Limite PE/EA {formatarNumeroSessao(ficha?.limitePeEaPorTurno)}
                </span>
                <span className="session-chip">
                  Técnicas {totalTecnicasCard}
                </span>
              </div>
              <p className="session-text-xxs text-app-muted">
                Técnica principal: {resumoTecnica}
              </p>
            </div>
          </div>
          {card.vinculados.length > 0 ? (
            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Vinculados
              </p>
              <div className="space-y-1.5">
                {card.vinculados.map((vinculado) => {
                  const ativoNestaSessao =
                    entidadeVinculadaAtivaNestaSessao(vinculado);
                  const podeInvocar = podeInvocarEntidadeVinculada(
                    vinculado,
                    sessaoEncerrada,
                  );
                  return (
                    <div
                      key={vinculado.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-app-border/70 px-2 py-1.5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-app-fg">
                          {vinculado.nome}
                        </p>
                        <p className="session-text-xxs text-app-muted">
                          {formatarTipoVinculado(vinculado.tipo)} -{' '}
                          {ativoNestaSessao ? 'ATIVO' : vinculado.estado} - PV{' '}
                          {vinculado.pontosVidaAtual}/{vinculado.pontosVidaMax}
                        </p>
                      </div>
                      {card.podeEditar &&
                      vinculado.estado !== 'ARQUIVADO' &&
                      onInvocarVinculado ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={!podeInvocar}
                          onClick={() => onInvocarVinculado(vinculado.id)}
                        >
                          {ativoNestaSessao ? 'Ativo' : 'Invocar'}
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {mostrarAcoesResumo && card.podeEditar ? (
            <div className="flex items-center gap-2 flex-wrap">
              {onAbrirEdicaoPersonagem ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onAbrirEdicaoPersonagem}
                  disabled={sessaoEncerrada || !card.recursos}
                >
                  Ajustes narrativos
                </Button>
              ) : null}
              {onAbrirFichaCompleta ? (
                <Button variant="ghost" size="sm" onClick={onAbrirFichaCompleta}>
                  Abrir ficha completa
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {abaDetalheCard === 'FICHA' ? (
        ficha ? (
          <div className="space-y-3 rounded border border-app-border p-2">
            <p className="text-xs text-app-muted">
              Referências principais da ficha usadas durante a sessão.
            </p>

            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Identidade
              </p>
              <div className="session-chip-row">
                <span className="session-chip">
                  Classe {formatarTextoFicha(ficha.classe?.nome)}
                </span>
                {ficha.trilha ? (
                  <span className="session-chip">
                    Trilha {formatarTextoFicha(ficha.trilha.nome)}
                  </span>
                ) : null}
                {ficha.caminho ? (
                  <span className="session-chip">
                    Caminho {formatarTextoFicha(ficha.caminho.nome)}
                  </span>
                ) : null}
                <span className="session-chip">
                  Origem {formatarTextoFicha(ficha.origem?.nome)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Defesa
              </p>
              <div className="session-chip-row">
                <span className="session-chip">Total {ficha.defesaTotal}</span>
                <span className="session-chip">Base {ficha.defesaBase}</span>
                {ficha.defesaEquipamento !== 0 ? (
                  <span className="session-chip">
                    Equip. {formatarBonus(ficha.defesaEquipamento)}
                  </span>
                ) : null}
                {ficha.defesaOutros !== 0 ? (
                  <span className="session-chip">
                    Outros {formatarBonus(ficha.defesaOutros)}
                  </span>
                ) : null}
                <span className="session-chip">Esquiva {ficha.esquiva}</span>
                <span className="session-chip">Bloqueio {ficha.bloqueio}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Progressão
              </p>
              <div className="session-chip-row">
                <span className="session-chip">Nível {ficha.nivel}</span>
                <span className="session-chip">
                  Deslocamento {ficha.deslocamento}m
                </span>
                <span className="session-chip">
                  Limite PE/EA {ficha.limitePeEaPorTurno}
                </span>
                {ficha.prestigioGeral > 0 ? (
                  <span className="session-chip">
                    Prestígio geral {ficha.prestigioGeral}
                  </span>
                ) : null}
                {ficha.prestigioCla !== null ? (
                  <span className="session-chip">
                    Prestígio no clã {ficha.prestigioCla}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Graus de aprimoramento
              </p>
              {ficha.grausAprimoramento.length > 0 ? (
                <div className="session-chip-row">
                  {ficha.grausAprimoramento.map((grau) => (
                    <span key={grau.tipoGrauCodigo} className="session-chip">
                      {grau.tipoGrauNome ||
                        formatarTipoGrauAprimorado(grau.tipoGrauCodigo)}{' '}
                      {grau.valor}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhum grau de aprimoramento registrado.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="session-text-xxs font-semibold text-app-muted uppercase">
                Proficiências
              </p>
              {ficha.proficiencias.length > 0 ? (
                <div className="session-chip-row">
                  {ficha.proficiencias.map((proficiencia) => (
                    <span key={proficiencia.codigo} className="session-chip">
                      {proficiencia.nome}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhuma proficiência registrada.
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            variant="session"
            size="sm"
            icon="id"
            title="Ficha indisponível"
            description="As informações de ficha deste personagem não estão disponíveis."
          />
        )
      ) : null}

      {abaDetalheCard === 'ATRIBUTOS' ? (
        atributos ? (
          <div className="session-atributos-grid">
            {listaAtributos.map((atributo) => (
              <div key={atributo.codigo} className="session-atributo-card">
                <div className="session-atributo-card__meta">
                  <span className="session-atributo-card__code">{atributo.codigo}</span>
                  <span className="session-atributo-card__label">{atributo.label}</span>
                </div>
                <span className="session-atributo-card__value">
                  {atributo.valor ?? '--'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="session"
            size="sm"
            icon="strength"
            title="Atributos indisponíveis"
            description="Os atributos deste personagem não estao disponíveis."
          />
        )
      ) : null}

      {abaDetalheCard === 'PERICIAS' ? (
        periciasOrdenadas.length === 0 ? (
          <EmptyState
            variant="session"
            size="sm"
            icon="skills"
            title="Sem perícias"
            description="Nenhuma perícia disponível para este personagem."
          />
        ) : (
          <div className="space-y-2">
            <div className="session-pericias-header">
              <div className="session-pericias-header__meta">
                <p className="session-pericias-header__title">Perícias</p>
                <p className="session-pericias-header__subtitle">
                  {mostrarSomentePericiasBonificadas
                    ? 'Exibindo somente perícias com bônus positivo.'
                    : 'Resumo dos bônus aplicados por treino, equipamento e outros.'}
                </p>
              </div>
              <div className="session-pericias-header__actions">
                <Badge size="sm" color="gray">
                  {periciasFiltradas.length} de {periciasOrdenadas.length}
                </Badge>
                <Button
                  size="xs"
                  variant={
                    mostrarSomentePericiasBonificadas ? 'secondary' : 'ghost'
                  }
                  onClick={() =>
                    setMostrarSomentePericiasBonificadas((estado) => !estado)
                  }
                  disabled={periciasOrdenadas.length === 0}
                >
                  {mostrarSomentePericiasBonificadas
                    ? 'Mostrar todas'
                    : 'Somente com bônus'}
                </Button>
              </div>
            </div>

            {periciasFiltradas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="skills"
                title="Nenhuma perícia com bônus"
                description="Nenhuma perícia com bônus positivo foi encontrada."
              />
            ) : (
              <div className="session-pericias-list">
                {periciasFiltradas.map((pericia) => {
                  const total = pericia.bonusTotal;
                  const totalLabel = total > 0 ? `+${total}` : String(total);
                  return (
                    <div key={pericia.codigo} className="session-pericia-card">
                      <div className="session-pericia-card__head">
                        <div className="session-pericia-card__meta">
                          <p className="session-pericia-card__name">
                            {pericia.nome}
                          </p>
                          <span className="session-pericia-card__attr">
                            {pericia.atributoBase}
                          </span>
                        </div>
                        <div className="session-pericia-card__actions">
                          <span className="session-pericia-card__total">
                            {totalLabel}
                          </span>
                          {card.podeEditar ? (
                            <>
                              <Button
                                size="xs"
                                variant="ghost"
                                className="session-pericia-card__roll"
                                onClick={() => handleRolarPericia(pericia)}
                                title={`Rolar ${pericia.nome} como perícia`}
                                aria-label={`Rolar ${pericia.nome} como perícia`}
                              >
                                <Icon name="dice" className="h-3.5 w-3.5" />
                              </Button>
                              {periciaPermiteAtaquePersonagem(pericia.codigo) ? (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="session-pericia-card__roll"
                                  onClick={() =>
                                    handleRolarPericia(pericia, 'ATAQUE')
                                  }
                                  title={`Rolar ataque com ${pericia.nome}`}
                                  aria-label={`Rolar ataque com ${pericia.nome}`}
                                >
                                  <Icon name="sword" className="h-3.5 w-3.5" />
                                </Button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="session-pericia-card__breakdown">
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Treino
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusTreinamento)}
                          </span>
                        </span>
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Equip
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusEquipamento)}
                          </span>
                        </span>
                        <span className="session-pericia-breakdown__item">
                          <span className="session-pericia-breakdown__label">
                            Outros
                          </span>
                          <span className="session-pericia-breakdown__value">
                            {formatarBonus(pericia.bonusOutros)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : null}

      {abaDetalheCard === 'INVENTARIO' && card.podeEditar ? (
        <SessionCharacterInventoryTab
          campanhaId={campanhaId}
          personagemCampanhaId={card.personagemCampanhaId}
          personagemSessaoId={card.personagemSessaoId}
          podeEditar={card.podeEditar}
          ativo={abaDetalheCard === 'INVENTARIO'}
          limitesCategoriaAtivo={limitesCategoriaAtivo}
          sessaoEncerrada={sessaoEncerrada}
          consumirComCalmaAtivo={consumirComCalmaAtivo}
          alvosPersonagens={alvosPersonagens}
          alvosNpcs={alvosNpcs}
          onConsumirItem={onConsumirItem}
        />
      ) : null}

      {abaDetalheCard === 'INSPIRACAO' && inspiracaoAtiva ? (
        <div className="session-inspiration-panel">
          <div className="session-inspiration-panel__head">
            <div>
              <p className="session-inspiration-panel__title">Inspiração</p>
              <p className="session-inspiration-panel__hint">
                Pontos disponíveis até o fim da sessão.
              </p>
            </div>
            <span className="session-inspiration-badge">
              {Math.max(0, Math.min(3, pontosInspiracao))}/3
            </span>
          </div>
          <div className="session-inspiration-panel__actions">
            {[
              { custo: 1 as const, efeito: 'BONUS_5' as const, label: '+5' },
              { custo: 2 as const, efeito: 'MAXIMIZAR' as const, label: 'Maximizar' },
              { custo: 3 as const, efeito: 'CRITICO' as const, label: 'Crítico' },
            ].map((gasto) => (
              <Button
                key={gasto.efeito}
                size="xs"
                variant="secondary"
                disabled={
                  sessaoEncerrada ||
                  atualizandoInspiracao ||
                  pontosInspiracao < gasto.custo ||
                  !onGastarInspiracao
                }
                onClick={() => onGastarInspiracao?.(gasto)}
              >
                {gasto.label} ({gasto.custo})
              </Button>
            ))}
          </div>
          {podeControlarInspiracao ? (
            <div className="session-inspiration-panel__master">
              <Button
                size="xs"
                variant="ghost"
                disabled={sessaoEncerrada || atualizandoInspiracao || pontosInspiracao <= 0}
                onClick={() => onAjustarInspiracao?.(-1)}
              >
                -1
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={sessaoEncerrada || atualizandoInspiracao || pontosInspiracao >= 3}
                onClick={() => onAjustarInspiracao?.(1)}
              >
                +1
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={sessaoEncerrada || atualizandoInspiracao || pontosInspiracao <= 0}
                onClick={() => onAjustarInspiracao?.(-pontosInspiracao)}
              >
                Zerar
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {abaDetalheCard === 'CONDICOES'
        ? renderPainelCondicoes(
            'PERSONAGEM',
            card.personagemSessaoId,
            card.nomePersonagem,
            card.condicoesAtivas,
            'inline',
          )
        : null}

      {abaDetalheCard === 'TECNICAS' ? (
        <div className="space-y-2">
          <details className="rounded border border-app-border p-2" open>
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Classe ({totalHabilidadesClasse} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {habilidadesClasseCard.length > 0 ? (
                habilidadesClasseCard.map((habilidade) => {
                  const chaveAcaoClasse = `usar-classe:${card.personagemSessaoId}:${habilidade.id}`;
                  const usando = acaoHabilidadePendente === chaveAcaoClasse;
                  return (
                    <div
                      key={`classe-${habilidade.id}`}
                      className="rounded border border-app-border bg-app-surface px-2 py-2 space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-app-fg">
                            {habilidade.nome}
                          </p>
                          <p className="session-text-xxs text-app-muted">
                            {habilidade.fonte}
                          </p>
                        </div>
                        {habilidade.efeitoPendente ? (
                          <Badge size="sm" color="cyan">
                            Próxima perícia: +{habilidade.efeitoPendente.dado}
                          </Badge>
                        ) : null}
                      </div>
                      {habilidade.descricao ? (
                        <p className="session-text-xxs text-app-muted">
                          {habilidade.descricao}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {habilidade.versoesDisponiveis.map((versao) => {
                          const semPE = recursos.peAtual < versao.custoPE;
                          const disabled =
                            sessaoEncerrada ||
                            !card.podeEditar ||
                            usando ||
                            semPE ||
                            Boolean(
                              habilidade.tipo === 'PERITO' &&
                                habilidade.efeitoPendente,
                            );
                          return (
                            <Button
                              key={`${habilidade.id}-${versao.nivel}`}
                              size="xs"
                              variant="secondary"
                              disabled={disabled}
                              onClick={() =>
                                habilidade.tipo === 'APRIMORADO'
                                  ? abrirModalAprimorado(habilidade, versao)
                                  : usarHabilidadeClasseSimples(
                                      habilidade.id,
                                      versao.nivel,
                                    )
                              }
                            >
                              {usando
                                ? 'Aplicando...'
                                : formatarVersaoHabilidadeClasse(
                                    habilidade.tipo,
                                    versao,
                                  )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhuma habilidade de classe disponível.
                </p>
              )}
              {buffsAprimoradoAtivos.length > 0 ? (
                <div className="rounded border border-app-border bg-app-elevated px-2 py-2">
                  <p className="session-text-xxs font-semibold text-app-muted uppercase">
                    Aprimoramentos ativos
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {buffsAprimoradoAtivos.map((buff) => (
                      <div
                        key={buff.id}
                        className="rounded border border-app-border/70 bg-app-surface px-2 py-1.5 session-text-xxs text-app-muted"
                      >
                        <span className="font-semibold text-app-fg">
                          {buff.fonte}:
                        </span>{' '}
                        <span>{buff.tecnicaNome}</span>
                        <span> · {buff.grauLabel}</span>{' '}
                        <Badge size="sm" color="purple">
                          {buff.bonusLabel}
                        </Badge>{' '}
                        <span>· {buff.duracao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 session-text-xxs text-app-muted">
              <input
                type="checkbox"
                checked={mostrarSomenteSustentadasAtivas}
                onChange={(event) =>
                  onToggleMostrarSomenteSustentadas(event.target.checked)
                }
                disabled={card.sustentacoesAtivas.length === 0}
                className="h-3.5 w-3.5 rounded border border-app-border bg-app-surface"
              />
              Somente sustentadas ({card.sustentacoesAtivas.length})
            </label>
            <div className="flex items-center gap-2">
              {mostrarSomenteSustentadasAtivas ? (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onToggleMostrarSomenteSustentadas(false)}
                >
                  Limpar filtro
                </Button>
              ) : null}
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  const proximo = !(tecnicaInataAberta && tecnicasNaoInatasAbertas);
                  onToggleTecnicaInata(proximo);
                  onToggleTecnicasNaoInatas(proximo);
                }}
              >
                {tecnicaInataAberta && tecnicasNaoInatasAbertas
                  ? 'Recolher tudo'
                  : 'Expandir tudo'}
              </Button>
            </div>
          </div>
          <p className="session-text-xxs text-app-muted">
            {mostrarSomenteSustentadasAtivas
              ? `Mostrando ${totalHabilidadesSustentadas} de ${totalHabilidades} habilidades`
              : `Total de habilidades: ${totalHabilidades}`}
          </p>
          <details
            className="rounded border border-app-border p-2"
            open={tecnicaInataAberta}
            onToggle={(event) => onToggleTecnicaInata(event.currentTarget.open)}
          >
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Tecnica inata ({totalHabilidadesInata} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {card.tecnicaInata ? (
                <SessionTechniqueBlock
                  card={card}
                  tecnica={card.tecnicaInata}
                  mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasAtivas}
                  obterQtdSustentacaoAtiva={obterQtdSustentacaoAtiva}
                  acumulosHabilidade={acumulosHabilidade}
                  onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
                  sessaoEncerrada={sessaoEncerrada}
                  acaoHabilidadePendente={acaoHabilidadePendente}
                  onUsarHabilidade={onUsarHabilidade}
                  onRolarTesteHabilidade={onRolarTesteHabilidade}
                  onRolarDanoHabilidade={onRolarDanoHabilidade}
                />
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Personagem sem técnica inata cadastrada.
                </p>
              )}
            </div>
          </details>

          <details
            className="rounded border border-app-border p-2"
            open={tecnicasNaoInatasAbertas}
            onToggle={(event) =>
              onToggleTecnicasNaoInatas(event.currentTarget.open)
            }
          >
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Técnicas não inatas ({card.tecnicasNaoInatas.length} técnica(s) |{' '}
              {totalHabilidadesNaoInatas} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {card.tecnicasNaoInatas.length > 0 ? (
                card.tecnicasNaoInatas.map((tecnica) => (
                    <SessionTechniqueBlock
                      key={`tecnica-${tecnica.id}`}
                      card={card}
                      tecnica={tecnica}
                      mostrarSomenteSustentadasAtivas={mostrarSomenteSustentadasAtivas}
                      obterQtdSustentacaoAtiva={obterQtdSustentacaoAtiva}
                      acumulosHabilidade={acumulosHabilidade}
                      onAtualizarAcumulosHabilidade={onAtualizarAcumulosHabilidade}
                      sessaoEncerrada={sessaoEncerrada}
                      acaoHabilidadePendente={acaoHabilidadePendente}
                      onUsarHabilidade={onUsarHabilidade}
                      onRolarTesteHabilidade={onRolarTesteHabilidade}
                      onRolarDanoHabilidade={onRolarDanoHabilidade}
                    />
                ))
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhuma técnica não inata disponível no momento.
                </p>
              )}
            </div>
          </details>

          <details className="rounded border border-app-border p-2">
            <summary className="cursor-pointer text-xs font-semibold text-app-fg">
              Outras ({totalOutrasHabilidades} habilidade(s))
            </summary>
            <div className="mt-2 space-y-2">
              {outrasHabilidadesCard.length > 0 ? (
                outrasHabilidadesCard.map((habilidade) => (
                  <div
                    key={`outra-${habilidade.id}`}
                    className="rounded border border-app-border bg-app-surface px-2 py-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-app-fg">
                        {habilidade.nome}
                      </p>
                      <Badge size="sm" color="gray">
                        {habilidade.fonte}
                      </Badge>
                    </div>
                    {habilidade.descricao ? (
                      <p className="mt-1 session-text-xxs text-app-muted">
                        {habilidade.descricao}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="session-text-xxs text-app-muted">
                  Nenhuma outra habilidade cadastrada.
                </p>
              )}
            </div>
          </details>
        </div>
      ) : null}

      {abaDetalheCard === 'SUSTENTACOES' ? (
        <div className="rounded border border-app-border p-2 space-y-1.5">
          <p className="text-xs font-semibold text-app-fg">
            Sustentacoes ativas ({card.sustentacoesAtivas.length})
          </p>
          {card.sustentacoesAtivas.length === 0 ? (
            <p className="session-text-xxs text-app-muted">
              Nenhuma habilidade sustentada ativa.
            </p>
          ) : (
            card.sustentacoesAtivas.map((sustentacao) => {
              const chaveEncerrar = montarChaveEncerrarSustentacao(
                card.personagemSessaoId,
                sustentacao.id,
              );
              const custoTotal =
                sustentacao.custoSustentacaoEA + sustentacao.custoSustentacaoPE;
              const custoBadgeColor =
                custoTotal >= 4 || sustentacao.custoSustentacaoPE > 0
                  ? 'orange'
                  : custoTotal >= 2
                    ? 'yellow'
                    : 'blue';
              return (
                <div
                  key={`sustentacao-${sustentacao.id}`}
                  className="rounded border border-app-border bg-app-surface px-2 py-2 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-app-fg">
                        {sustentacao.nomeHabilidade}
                        {sustentacao.acumulos &&
                        (sustentacao.acumulos > 1 || sustentacao.permiteAcumulos)
                          ? ` ${sustentacao.acumulos}`
                          : ''}
                        {sustentacao.nomeVariacao
                          ? ` (${sustentacao.nomeVariacao})`
                          : ''}
                      </p>
                      <p className="session-text-xxs text-app-muted">
                        Ativa desde rodada {sustentacao.ativadaNaRodada}
                      </p>
                    </div>
                    <Badge
                      color={custoBadgeColor}
                      size="sm"
                      title={
                        custoBadgeColor === 'orange'
                          ? 'Custo alto por rodada'
                          : custoBadgeColor === 'yellow'
                            ? 'Custo moderado por rodada'
                            : 'Custo por rodada'
                      }
                    >
                      {formatarCustos(
                        sustentacao.custoSustentacaoEA,
                        sustentacao.custoSustentacaoPE,
                      )}
                      /rodada
                    </Badge>
                  </div>
                  {card.podeEditar ? (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onEncerrarSustentacao(
                            card.personagemSessaoId,
                            sustentacao.id,
                          )
                        }
                        disabled={
                          sessaoEncerrada ||
                          acaoHabilidadePendente === chaveEncerrar
                        }
                      >
                        {acaoHabilidadePendente === chaveEncerrar
                          ? 'Encerrando...'
                          : 'Encerrar'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {aprimoradoModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded border border-app-border bg-app-surface p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-app-fg">
                  {aprimoradoModal.habilidadeNome}
                </p>
                <p className="session-text-xxs text-app-muted">
                  Distribua {aprimoradoModal.grausTotal} grau(s) temporário(s)
                  até o fim da cena. Custo: {aprimoradoModal.custoPE} PE.
                </p>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setAprimoradoModal(null)}
              >
                Fechar
              </Button>
            </div>

            <div className="mt-3 max-h-[55vh] space-y-2 overflow-auto pr-1">
              {opcoesAprimoramentoTecnicasCard.map((opcao) => {
                const chave = `${opcao.tecnicaId}:${opcao.tipoGrauCodigo}`;
                const valor = aprimoradoModal.distribuicao[chave] ?? '';
                return (
                  <label
                    key={chave}
                    className="flex items-center justify-between gap-3 rounded border border-app-border px-2 py-2"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-app-fg">
                        {opcao.tecnicaNome}
                      </span>
                      <span className="session-text-xxs text-app-muted">
                        Base {opcao.grauBase} | temp +{opcao.grauTemporario} |
                        total {opcao.grauEfetivo}
                      </span>
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={opcao.limiteTemporarioRestante}
                      value={valor}
                      disabled={opcao.limiteTemporarioRestante <= 0}
                      onChange={(event) =>
                        atualizarDistribuicaoAprimorado(chave, event.target.value)
                      }
                      className="w-20 rounded border border-app-border bg-app-bg px-2 py-1 text-sm text-app-fg"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <Badge
                size="sm"
                color={
                  totalGrausAprimorado === aprimoradoModal.grausTotal
                    ? 'green'
                    : 'yellow'
                }
              >
                {totalGrausAprimorado}/{aprimoradoModal.grausTotal} graus
              </Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAprimoradoModal(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={
                    totalGrausAprimorado !== aprimoradoModal.grausTotal ||
                    sessaoEncerrada
                  }
                  onClick={confirmarAprimorado}
                >
                  Usar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
