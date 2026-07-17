'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiAtualizarMacroPersonagemCampanha,
  apiCriarMacroPersonagemCampanha,
  apiRemoverMacroPersonagemCampanha,
  criarErroUsuario,
  type MacroAtaqueConfigV1,
  type MacroDanoConfigV1,
  type MacroFormulaLivreConfigV1,
  type MacroPersonalizadaSessao,
  type SalvarMacroPersonagemCampanhaPayload,
} from '@/lib/api';
import {
  montarChavePreferenciaMacroPersonalizada,
  type PreferenciaMacroPersonalizadaSessao,
} from '@/lib/campanha/sessao-preferencias';
import type { TipoAcaoMacroPersonalizada } from '@/lib/campanha/sessao-rolagem-macro';
import { SessionCharacterMacroEditorModal } from './SessionCharacterMacroEditorModal';

export type SolicitacaoMacroPersonalizada = {
  acao: TipoAcaoMacroPersonalizada;
  personagemSessaoId: number;
  macroId: number;
  ajusteFlatSessao: number;
  ajusteDadosSessao: number;
  visibilidadePadrao: 'PUBLICA' | 'SECRETA_MESTRE';
  nomeMacro: string;
  subtitulo: string;
  expressionsPreview: string[];
  facesPreview: number[];
};

type Props = {
  campanhaId: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  macros: MacroPersonalizadaSessao[];
  sessaoEncerrada: boolean;
  preferencias: Record<string, PreferenciaMacroPersonalizadaSessao>;
  onAtualizarPreferencias: (
    atualizacao: Record<string, PreferenciaMacroPersonalizadaSessao> | ((estado: Record<string, PreferenciaMacroPersonalizadaSessao>) => Record<string, PreferenciaMacroPersonalizadaSessao>),
  ) => void;
  onRecarregar: () => Promise<void>;
  onRolar: (solicitacao: SolicitacaoMacroPersonalizada) => Promise<void>;
  onErro: (mensagem: string) => void;
};

function formatarBonus(valor: number) {
  return valor >= 0 ? `+${valor}` : String(valor);
}

function facesFormula(formula: string): number[] {
  return Array.from(formula.matchAll(/d(\d+)/gi))
    .map((match) => Number(match[1]))
    .filter((faces) => Number.isFinite(faces) && faces > 0);
}

export function SessionCharacterCustomMacrosSection({
  campanhaId,
  personagemSessaoId,
  personagemCampanhaId,
  macros,
  sessaoEncerrada,
  preferencias,
  onAtualizarPreferencias,
  onRecarregar,
  onRolar,
  onErro,
}: Props) {
  const [editorAberto, setEditorAberto] = useState(false);
  const [macroEmEdicao, setMacroEmEdicao] = useState<MacroPersonalizadaSessao | null>(null);
  const [pendente, setPendente] = useState<string | null>(null);
  const confirmacao = useConfirm();

  const obterPreferencia = (macroId: number) =>
    preferencias[montarChavePreferenciaMacroPersonalizada(personagemSessaoId, macroId)] ?? {
      ajusteFlatSessao: 0,
      ajusteDadosSessao: 0,
    };

  const atualizarPreferencia = (macroId: number, patch: Partial<PreferenciaMacroPersonalizadaSessao>) => {
    const chave = montarChavePreferenciaMacroPersonalizada(personagemSessaoId, macroId);
    onAtualizarPreferencias((estado) => ({
      ...estado,
      [chave]: { ...obterPreferencia(macroId), ...patch },
    }));
  };

  const salvar = async (payload: SalvarMacroPersonagemCampanhaPayload) => {
    setPendente('SALVAR');
    try {
      if (macroEmEdicao) {
        await apiAtualizarMacroPersonagemCampanha(campanhaId, personagemCampanhaId, macroEmEdicao.id, {
          ...payload,
          revisaoEsperada: macroEmEdicao.revisao,
        });
      } else {
        await apiCriarMacroPersonagemCampanha(campanhaId, personagemCampanhaId, payload);
      }
      await onRecarregar();
      setEditorAberto(false);
      setMacroEmEdicao(null);
    } finally {
      setPendente(null);
    }
  };

  const remover = (macro: MacroPersonalizadaSessao) => {
    confirmacao.confirm({
      title: 'Excluir macro personalizada?',
      description: `A macro “${macro.nome}” será removida da ficha de campanha.`,
      confirmLabel: 'Excluir macro',
      variant: 'danger',
      onConfirm: async () => {
        setPendente(`REMOVER:${macro.id}`);
        try {
          await apiRemoverMacroPersonagemCampanha(campanhaId, personagemCampanhaId, macro.id);
          await onRecarregar();
        } catch (error) {
          onErro(criarErroUsuario(error).message);
        } finally {
          setPendente(null);
        }
      },
    });
  };

  const rolar = async (macro: MacroPersonalizadaSessao, acao: TipoAcaoMacroPersonalizada) => {
    if (pendente) return;
    const preferencia = obterPreferencia(macro.id);
    const ataque = macro.tipo === 'ATAQUE_PERICIA' ? macro.preview : null;
    const dano = macro.tipo === 'DANO_FORMULA' ? (macro.config as MacroDanoConfigV1) : null;
    const livre = macro.tipo === 'FORMULA_LIVRE' ? (macro.config as MacroFormulaLivreConfigV1) : null;
    const formula = dano?.formulaBase ?? livre?.formula ?? (ataque ? `${ataque.quantidadeDados}d20${formatarBonus(ataque.bonus)}` : 'Rolagem de macro');
    setPendente(`${acao}:${macro.id}`);
    try {
      await onRolar({
        acao,
        personagemSessaoId,
        macroId: macro.id,
        ajusteFlatSessao: preferencia.ajusteFlatSessao,
        ajusteDadosSessao: preferencia.ajusteDadosSessao,
        visibilidadePadrao: macro.visibilidadePadrao,
        nomeMacro: macro.nome,
        subtitulo: ataque ? `${ataque.pericia.nome} · ${ataque.atributoBase}` : dano?.tipoDano || 'Fórmula livre',
        expressionsPreview: formula.split(';').map((item) => item.trim()).filter(Boolean),
        facesPreview: ataque ? [20] : facesFormula(formula),
      });
    } finally {
      setPendente(null);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-app-fg">Macros personalizadas</h3>
        <Button type="button" size="xs" disabled={Boolean(pendente)} onClick={() => { setMacroEmEdicao(null); setEditorAberto(true); }} aria-label="Criar macro personalizada">
          + Nova macro
        </Button>
      </div>
      {!macros.length ? (
        <EmptyState variant="session" size="sm" icon="dice" title="Nenhuma macro personalizada" description="Crie ataques, danos ou fórmulas livres que persistem na ficha de campanha." />
      ) : macros.map((macro) => {
        const ataque = macro.tipo === 'ATAQUE_PERICIA' ? (macro.config as MacroAtaqueConfigV1) : null;
        const dano = macro.tipo === 'DANO_FORMULA' ? (macro.config as MacroDanoConfigV1) : null;
        const livre = macro.tipo === 'FORMULA_LIVRE' ? (macro.config as MacroFormulaLivreConfigV1) : null;
        const preferencia = obterPreferencia(macro.id);
        return (
          <article key={macro.id} className="space-y-2 rounded border border-app-border bg-app-surface/40 p-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-app-fg">{macro.nome}</p>
                <p className="session-text-xxs text-app-muted">{ataque ? `${macro.preview?.pericia.nome ?? ataque.periciaCodigo} · ${ataque.categoriaAtaque}` : dano ? dano.formulaBase : livre?.formula}</p>
                {macro.descricao ? <p className="session-text-xxs text-app-muted line-clamp-2">{macro.descricao}</p> : null}
              </div>
              <div className="flex gap-1">
                <Button type="button" size="xs" variant="ghost" disabled={Boolean(pendente)} onClick={() => { setMacroEmEdicao(macro); setEditorAberto(true); }} aria-label={`Editar macro ${macro.nome}`}>Editar</Button>
                <Button type="button" size="xs" variant="ghost" disabled={Boolean(pendente)} onClick={() => remover(macro)} aria-label={`Excluir macro ${macro.nome}`}>Excluir</Button>
              </div>
            </div>
            {ataque || dano ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="space-y-1"><span className="session-text-xxs text-app-muted">Flat da sessão</span><input className="w-full rounded border border-app-border bg-app-surface px-2 py-1 text-xs text-app-fg" type="number" min={-100} max={100} value={preferencia.ajusteFlatSessao} onChange={(event) => atualizarPreferencia(macro.id, { ajusteFlatSessao: Math.max(-100, Math.min(100, Math.trunc(Number(event.target.value) || 0))) })} aria-label={`Ajuste flat da sessão de ${macro.nome}`} /></label>
                {ataque ? <label className="space-y-1"><span className="session-text-xxs text-app-muted">Dados da sessão</span><input className="w-full rounded border border-app-border bg-app-surface px-2 py-1 text-xs text-app-fg" type="number" min={-10} max={10} value={preferencia.ajusteDadosSessao} onChange={(event) => atualizarPreferencia(macro.id, { ajusteDadosSessao: Math.max(-10, Math.min(10, Math.trunc(Number(event.target.value) || 0))) })} aria-label={`Ajuste de dados da sessão de ${macro.nome}`} /></label> : null}
              </div>
            ) : null}
            {macro.preview?.ajustesAutomaticos.length ? <div className="session-chip-row">{macro.preview.ajustesAutomaticos.map((ajuste) => <span key={ajuste.condicao} className="session-chip" title={ajuste.motivo}>{ajuste.condicao} {formatarBonus(ajuste.dados)}d20</span>)}</div> : null}
            <div className="flex flex-wrap gap-1.5">
              {ataque ? <Button type="button" size="xs" disabled={sessaoEncerrada || Boolean(pendente)} onClick={() => void rolar(macro, 'ATAQUE')}>Ataque</Button> : null}
              {dano ? <Button type="button" size="xs" disabled={sessaoEncerrada || Boolean(pendente)} onClick={() => void rolar(macro, 'DANO')}>Dano</Button> : null}
              {dano?.criticoMultiplicador ? <Button type="button" size="xs" variant="secondary" disabled={sessaoEncerrada || Boolean(pendente)} onClick={() => void rolar(macro, 'CRITICO')}>Crítico ×{dano.criticoMultiplicador}</Button> : null}
              {livre ? <Button type="button" size="xs" disabled={sessaoEncerrada || Boolean(pendente)} onClick={() => void rolar(macro, 'FORMULA')}>Rolar</Button> : null}
            </div>
          </article>
        );
      })}
      {editorAberto ? <SessionCharacterMacroEditorModal key={macroEmEdicao?.id ?? 'nova'} isOpen macro={macroEmEdicao} salvando={pendente === 'SALVAR'} onClose={() => { setEditorAberto(false); setMacroEmEdicao(null); }} onSalvar={salvar} /> : null}
      <ConfirmDialog isOpen={confirmacao.isOpen} onClose={confirmacao.handleClose} onConfirm={() => void confirmacao.handleConfirm()} title={confirmacao.options?.title ?? 'Confirmar exclusão'} description={confirmacao.options?.description ?? ''} confirmLabel={confirmacao.options?.confirmLabel} cancelLabel={confirmacao.options?.cancelLabel} variant={confirmacao.options?.variant} />
    </section>
  );
}
