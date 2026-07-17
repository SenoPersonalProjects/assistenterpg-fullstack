'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import {
  apiListarMacrosPersonagemSessaoCampanha,
  criarErroUsuario,
  type MacroArmaSessao,
  type MacroPersonalizadaSessao,
} from '@/lib/api';
import {
  montarChavePreferenciaMacroArma,
  type PreferenciaMacroArmaSessao,
  type PreferenciaMacroPersonalizadaSessao,
} from '@/lib/campanha/sessao-preferencias';
import type { TipoAcaoMacroArma } from '@/lib/campanha/sessao-rolagem-item';
import {
  SessionCharacterCustomMacrosSection,
  type SolicitacaoMacroPersonalizada,
} from './SessionCharacterCustomMacrosSection';

export type { SolicitacaoMacroPersonalizada } from './SessionCharacterCustomMacrosSection';

export type SolicitacaoMacroArma = {
  acao: TipoAcaoMacroArma;
  personagemSessaoId: number;
  itemInventarioCampanhaId: number;
  atributoEscolhido?: 'FOR' | 'AGI';
  empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';
  ajusteFlatManual: number;
  ajusteDadosManual: number;
  nomeArma: string;
  periciaNome: string;
  dadosPreview: number;
  bonusPreview: number;
  expressionsPreview: string[];
  facesPreview: number[];
};

type SessionCharacterMacrosTabProps = {
  campanhaId: number;
  sessaoId: number;
  personagemSessaoId: number;
  ativo: boolean;
  sessaoEncerrada: boolean;
  preferencias: Record<string, PreferenciaMacroArmaSessao>;
  preferenciasPersonalizadas: Record<string, PreferenciaMacroPersonalizadaSessao>;
  onAtualizarPreferencias: (
    atualizacao:
      | Record<string, PreferenciaMacroArmaSessao>
      | ((
          estado: Record<string, PreferenciaMacroArmaSessao>,
        ) => Record<string, PreferenciaMacroArmaSessao>),
  ) => void;
  onRolarMacro: (solicitacao: SolicitacaoMacroArma) => Promise<void>;
  onAtualizarPreferenciasPersonalizadas: (
    atualizacao: Record<string, PreferenciaMacroPersonalizadaSessao> | ((estado: Record<string, PreferenciaMacroPersonalizadaSessao>) => Record<string, PreferenciaMacroPersonalizadaSessao>),
  ) => void;
  onRolarMacroPersonalizada: (solicitacao: SolicitacaoMacroPersonalizada) => Promise<void>;
};

function formatarBonus(valor: number): string {
  return valor >= 0 ? `+${valor}` : String(valor);
}

function formatarEmpunhadura(empunhadura: string): string {
  if (empunhadura === 'UMA_MAO') return 'Uma mão';
  if (empunhadura === 'DUAS_MAOS') return 'Duas mãos';
  return 'Leve';
}

function calcularDadosExibidos(dadosLogicos: number): {
  quantidade: number;
  keepMode: 'HIGHEST' | 'LOWEST';
} {
  return dadosLogicos > 0
    ? { quantidade: dadosLogicos, keepMode: 'HIGHEST' }
    : { quantidade: 2 + Math.abs(dadosLogicos), keepMode: 'LOWEST' };
}

function obterPreferencia(
  macro: MacroArmaSessao,
  personagemSessaoId: number,
  preferencias: Record<string, PreferenciaMacroArmaSessao>,
): PreferenciaMacroArmaSessao {
  const chave = montarChavePreferenciaMacroArma(
    personagemSessaoId,
    macro.itemInventarioCampanhaId,
  );
  const salva = preferencias[chave];
  return {
    ajusteFlatManual: salva?.ajusteFlatManual ?? 0,
    ajusteDadosManual: salva?.ajusteDadosManual ?? 0,
    atributoEscolhido: macro.atributosPermitidos.includes(
      salva?.atributoEscolhido ?? macro.atributoPadrao,
    )
      ? (salva?.atributoEscolhido ?? macro.atributoPadrao)
      : macro.atributoPadrao,
    empunhadura: macro.empunhaduras.includes(
      salva?.empunhadura ?? macro.empunhaduras[0],
    )
      ? (salva?.empunhadura ?? macro.empunhaduras[0])
      : macro.empunhaduras[0],
  };
}

export function SessionCharacterMacrosTab({
  campanhaId,
  sessaoId,
  personagemSessaoId,
  ativo,
  sessaoEncerrada,
  preferencias,
  preferenciasPersonalizadas,
  onAtualizarPreferencias,
  onAtualizarPreferenciasPersonalizadas,
  onRolarMacro,
  onRolarMacroPersonalizada,
}: SessionCharacterMacrosTabProps) {
  const [armas, setArmas] = useState<MacroArmaSessao[] | null>(null);
  const [personalizadas, setPersonalizadas] = useState<MacroPersonalizadaSessao[]>([]);
  const [personagemCampanhaId, setPersonagemCampanhaId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let ativoNaTela = true;
    setCarregando(true);
    setErro(null);
    void apiListarMacrosPersonagemSessaoCampanha(
      campanhaId,
      sessaoId,
      personagemSessaoId,
    )
      .then((resposta) => {
        if (ativoNaTela) {
          setArmas(resposta.armas);
          setPersonalizadas(resposta.personalizadas);
          setPersonagemCampanhaId(resposta.personagemCampanhaId);
        }
      })
      .catch((error) => {
        if (ativoNaTela) setErro(criarErroUsuario(error).message);
      })
      .finally(() => {
        if (ativoNaTela) setCarregando(false);
      });
    return () => {
      ativoNaTela = false;
    };
  }, [ativo, campanhaId, personagemSessaoId, sessaoId]);

  const recarregarMacros = async () => {
    const resposta = await apiListarMacrosPersonagemSessaoCampanha(
      campanhaId,
      sessaoId,
      personagemSessaoId,
    );
    setArmas(resposta.armas);
    setPersonalizadas(resposta.personalizadas);
    setPersonagemCampanhaId(resposta.personagemCampanhaId);
  };

  const preferenciasPorArma = useMemo(
    () =>
      new Map(
        (armas ?? []).map((macro) => [
          macro.itemInventarioCampanhaId,
          obterPreferencia(macro, personagemSessaoId, preferencias),
        ]),
      ),
    [armas, personagemSessaoId, preferencias],
  );

  const atualizarPreferencia = (
    macro: MacroArmaSessao,
    patch: Partial<PreferenciaMacroArmaSessao>,
  ) => {
    const chave = montarChavePreferenciaMacroArma(
      personagemSessaoId,
      macro.itemInventarioCampanhaId,
    );
    const atual = obterPreferencia(macro, personagemSessaoId, preferencias);
    onAtualizarPreferencias((estado) => ({
      ...estado,
      [chave]: { ...atual, ...patch },
    }));
  };

  const rolar = async (macro: MacroArmaSessao, acao: TipoAcaoMacroArma) => {
    const preferencia = preferenciasPorArma.get(macro.itemInventarioCampanhaId);
    if (!preferencia) return;
    const chave = `${acao}:${macro.itemInventarioCampanhaId}`;
    if (acaoPendente) return;
    const dadosPreview = macro.preview.dadosLogicos + preferencia.ajusteDadosManual;
    const dadosAtaque = calcularDadosExibidos(dadosPreview);
    const danosAtivos = macro.danos.filter(
      (dano) =>
        dano.empunhadura === null || dano.empunhadura === preferencia.empunhadura,
    );
    const expressionsPreview =
      acao === 'ATAQUE'
        ? [
            `${dadosAtaque.quantidade}d20 ${dadosAtaque.keepMode === 'LOWEST' ? 'pior' : 'melhor'} ${formatarBonus(macro.preview.bonus + preferencia.ajusteFlatManual)}`,
          ]
        : danosAtivos.map((dano) => `${dano.tipoDano}: ${dano.rolagem}`);
    const facesPreview =
      acao === 'ATAQUE'
        ? [20]
        : danosAtivos
            .map((dano) => Number(dano.rolagem.match(/d(\d+)/i)?.[1]))
            .filter((faces) => Number.isFinite(faces) && faces > 0);
    try {
      setAcaoPendente(chave);
      await onRolarMacro({
        acao,
        personagemSessaoId,
        itemInventarioCampanhaId: macro.itemInventarioCampanhaId,
        atributoEscolhido: macro.agil ? preferencia.atributoEscolhido : undefined,
        empunhadura: preferencia.empunhadura,
        ajusteFlatManual: preferencia.ajusteFlatManual,
        ajusteDadosManual: preferencia.ajusteDadosManual,
        nomeArma: macro.nome,
        periciaNome: macro.pericia.nome,
        dadosPreview,
        bonusPreview: macro.preview.bonus + preferencia.ajusteFlatManual,
        expressionsPreview,
        facesPreview,
      });
    } finally {
      setAcaoPendente(null);
    }
  };

  if (carregando && armas === null) {
    return <p className="session-text-xxs text-app-muted">Carregando macros...</p>;
  }
  if (erro) return <ErrorAlert message={erro} />;
  return (
    <div className="space-y-2">
      <p className="session-text-xxs text-app-muted">
        A prévia é informativa. Dados, condições e resultado são recalculados pelo servidor ao rolar.
      </p>
      {personagemCampanhaId ? (
        <SessionCharacterCustomMacrosSection
          campanhaId={campanhaId}
          personagemSessaoId={personagemSessaoId}
          personagemCampanhaId={personagemCampanhaId}
          macros={personalizadas}
          sessaoEncerrada={sessaoEncerrada}
          preferencias={preferenciasPersonalizadas}
          onAtualizarPreferencias={onAtualizarPreferenciasPersonalizadas}
          onRecarregar={recarregarMacros}
          onRolar={onRolarMacroPersonalizada}
          onErro={setErro}
        />
      ) : null}
      <h3 className="pt-2 text-xs font-semibold text-app-fg">Armas equipadas</h3>
      {!armas?.length ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="dice"
          title="Nenhuma arma equipada"
          description="Equipe uma arma normal no inventário para criar uma macro de ataque, dano e crítico."
        />
      ) : null}
      {(armas ?? []).map((macro) => {
        const preferencia = preferenciasPorArma.get(macro.itemInventarioCampanhaId);
        if (!preferencia) return null;
        const dadosLogicos = macro.preview.dadosLogicos + preferencia.ajusteDadosManual;
        const dados = calcularDadosExibidos(dadosLogicos);
        const bonus = macro.preview.bonus + preferencia.ajusteFlatManual;
        const danosAtivos = macro.danos.filter(
          (dano) =>
            dano.empunhadura === null || dano.empunhadura === preferencia.empunhadura,
        );
        return (
          <section
            key={macro.itemInventarioCampanhaId}
            className="space-y-2 rounded border border-app-border bg-app-surface/40 p-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-app-fg">{macro.nome}</p>
                <p className="session-text-xxs text-app-muted">
                  {macro.tipoArma === 'CORPO_A_CORPO' ? 'Corpo a corpo' : 'À distância'} · {macro.pericia.nome}
                </p>
              </div>
              <Badge size="sm" color="gray">
                Crítico {macro.critico.valor ?? '--'}×{macro.critico.multiplicador ?? '--'}
              </Badge>
            </div>

            {macro.agil ? (
              <div className="flex flex-wrap items-center gap-1" aria-label={`Atributo de ${macro.nome}`}>
                <span className="session-text-xxs text-app-muted">Atributo:</span>
                {macro.atributosPermitidos.map((atributo) => (
                  <Button
                    key={atributo}
                    type="button"
                    size="xs"
                    variant={preferencia.atributoEscolhido === atributo ? 'secondary' : 'ghost'}
                    disabled={Boolean(acaoPendente)}
                    onClick={() => atualizarPreferencia(macro, { atributoEscolhido: atributo })}
                    aria-label={`Usar ${atributo === 'FOR' ? 'Força' : 'Agilidade'} em ${macro.nome}`}
                  >
                    {atributo === 'FOR' ? 'Força' : 'Agilidade'}
                  </Button>
                ))}
              </div>
            ) : null}

            {macro.empunhaduras.length > 1 ? (
              <div className="flex flex-wrap items-center gap-1" aria-label={`Empunhadura de ${macro.nome}`}>
                <span className="session-text-xxs text-app-muted">Empunhadura:</span>
                {macro.empunhaduras.map((empunhadura) => (
                  <Button
                    key={empunhadura}
                    type="button"
                    size="xs"
                    variant={preferencia.empunhadura === empunhadura ? 'secondary' : 'ghost'}
                    disabled={Boolean(acaoPendente)}
                    onClick={() => atualizarPreferencia(macro, { empunhadura })}
                    aria-label={`Usar ${formatarEmpunhadura(empunhadura)} em ${macro.nome}`}
                  >
                    {formatarEmpunhadura(empunhadura)}
                  </Button>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="session-text-xxs text-app-muted">Flat manual</span>
                <input
                  className="w-full rounded border border-app-border bg-app-surface px-2 py-1 text-xs text-app-fg"
                  type="number"
                  min={-100}
                  max={100}
                  value={preferencia.ajusteFlatManual}
                  disabled={Boolean(acaoPendente)}
                  onChange={(event) =>
                    atualizarPreferencia(macro, {
                      ajusteFlatManual: Math.max(-100, Math.min(100, Math.trunc(Number(event.target.value) || 0))),
                    })
                  }
                  aria-label={`Ajuste flat manual de ${macro.nome}`}
                />
              </label>
              <div className="space-y-1">
                <span className="session-text-xxs text-app-muted">Dados manuais</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    disabled={Boolean(acaoPendente) || preferencia.ajusteDadosManual <= -10}
                    onClick={() => atualizarPreferencia(macro, { ajusteDadosManual: preferencia.ajusteDadosManual - 1 })}
                    aria-label={`Reduzir dado manual de ${macro.nome}`}
                  >
                    −
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    disabled={Boolean(acaoPendente) || preferencia.ajusteDadosManual === 0}
                    onClick={() => atualizarPreferencia(macro, { ajusteDadosManual: 0 })}
                    aria-label={`Zerar ajuste de dados de ${macro.nome}`}
                  >
                    {formatarBonus(preferencia.ajusteDadosManual)}d20
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    disabled={Boolean(acaoPendente) || preferencia.ajusteDadosManual >= 10}
                    onClick={() => atualizarPreferencia(macro, { ajusteDadosManual: preferencia.ajusteDadosManual + 1 })}
                    aria-label={`Aumentar dado manual de ${macro.nome}`}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="session-chip-row">
              <span className="session-chip">
                Ataque: {dados.quantidade}d20 {dados.keepMode === 'LOWEST' ? 'pior' : 'melhor'} {formatarBonus(bonus)}
              </span>
              {preferencia.ajusteDadosManual || preferencia.ajusteFlatManual ? (
                <span className="session-chip">
                  Manual: {formatarBonus(preferencia.ajusteDadosManual)}d20 {formatarBonus(preferencia.ajusteFlatManual)}
                </span>
              ) : null}
              {macro.preview.ajustesAutomaticos.map((ajuste) => (
                <span key={ajuste.condicao} className="session-chip" title={ajuste.motivo}>
                  {ajuste.condicao} {formatarBonus(ajuste.dados)}d20
                </span>
              ))}
            </div>
            <p className="session-text-xxs text-app-muted">
              Dano: {danosAtivos.map((dano) => `${dano.rolagem}${dano.valorFlat ? formatarBonus(dano.valorFlat) : ''} ${dano.tipoDano}`).join(' + ') || '--'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="xs"
                disabled={sessaoEncerrada || Boolean(acaoPendente)}
                onClick={() => void rolar(macro, 'ATAQUE')}
                aria-label={`Rolar ataque com ${macro.nome}`}
              >
                Ataque
              </Button>
              <Button
                type="button"
                size="xs"
                variant="secondary"
                disabled={sessaoEncerrada || Boolean(acaoPendente)}
                onClick={() => void rolar(macro, 'DANO')}
                aria-label={`Rolar dano de ${macro.nome}`}
              >
                Dano
              </Button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={sessaoEncerrada || Boolean(acaoPendente)}
                onClick={() => void rolar(macro, 'CRITICO')}
                aria-label={`Rolar crítico de ${macro.nome}`}
              >
                Crítico
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
