'use client';

import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon, type IconName } from '@/components/ui/Icon';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
} from '@/lib/types';
import {
  descreverDuracaoCondicao,
  formatarNomeCondicaoComAcumulos,
  textoSeguro,
} from '@/lib/campanha/sessao-formatters';
import type { FormCondicaoSessao } from '@/components/campanha/sessao/types';

type SessionConditionsPanelProps = {
  condicoesAtivas: CondicaoAtivaSessaoCampanha[];
  catalogoCondicoes: CondicaoCatalogo[];
  formCondicao: FormCondicaoSessao;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  acaoCondicaoPendente: string | null;
  chaveAcaoAplicar: string | null;
  chaveAcaoRemover: (condicaoSessaoId: number) => string;
  onAbrirModal: () => void;
  onRemoverCondicao: (condicao: CondicaoAtivaSessaoCampanha) => void;
  modo?: 'inline' | 'accordion';
  erro?: string | null;
};

export function SessionConditionsPanel({
  condicoesAtivas,
  catalogoCondicoes,
  formCondicao,
  podeControlarSessao,
  sessaoEncerrada,
  acaoCondicaoPendente,
  chaveAcaoAplicar,
  chaveAcaoRemover,
  onAbrirModal,
  onRemoverCondicao,
  modo = 'accordion',
  erro,
}: SessionConditionsPanelProps) {
  const condicaoSelecionada = formCondicao.condicaoId
    ? textoSeguro(
        catalogoCondicoes.find((item) => String(item.id) === formCondicao.condicaoId)
          ?.nome ?? 'Condicao',
      )
    : null;
  const aplicando = Boolean(chaveAcaoAplicar && acaoCondicaoPendente === chaveAcaoAplicar);

  const conteudo = (
    <div className="mt-2 space-y-2">
      {erro ? <ErrorAlert message={erro} /> : null}
      {condicoesAtivas.length === 0 ? (
        <p className="text-[11px] text-app-muted">
          Nenhuma condicao ativa neste alvo.
        </p>
      ) : (
        condicoesAtivas.map((condicao) => {
          const chaveRemover = chaveAcaoRemover(condicao.id);
          return (
            <div
              key={`condicao-ativa-${condicao.id}`}
              className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-app-border bg-app-bg">
                    <Icon
                      name={(condicao.icone || 'status') as IconName}
                      className="h-3.5 w-3.5 text-app-muted"
                    />
                  </span>
                  <p className="text-xs font-semibold text-app-fg">
                        {formatarNomeCondicaoComAcumulos(condicao)}
                  </p>
                </div>
                <span className="text-[10px] text-app-muted">
                  {condicao.automatica ? 'Automatica' : 'Manual'}
                </span>
              </div>
              <p className="text-[11px] text-app-muted">
                {descreverDuracaoCondicao(
                  condicao.duracaoModo,
                  condicao.duracaoValor,
                  condicao.restanteDuracao,
                )}
              </p>
              {condicao.origemDescricao ? (
                <p className="text-[11px] text-app-muted">
                  Origem: {condicao.origemDescricao}
                </p>
              ) : null}
              {condicao.fonteCodigo || condicao.limiteFonte ? (
                <p className="text-[11px] text-app-muted">
                  {condicao.fonteCodigo
                    ? `Fonte: ${condicao.fonteCodigo}`
                    : 'Fonte livre'}
                  {condicao.limiteFonte ? ` | limite ${condicao.limiteFonte}` : ''}
                </p>
              ) : null}
              {condicao.observacao ? (
                <p className="text-[11px] text-app-muted">{condicao.observacao}</p>
              ) : null}
              {podeControlarSessao ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onRemoverCondicao(condicao)}
                  disabled={sessaoEncerrada || acaoCondicaoPendente === chaveRemover}
                >
                  {acaoCondicaoPendente === chaveRemover
                    ? 'Removendo...'
                    : 'Remover condicao'}
                </Button>
              ) : null}
            </div>
          );
        })
      )}

      {podeControlarSessao ? (
        <div className="rounded border border-app-border bg-app-bg p-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onAbrirModal}
              disabled={sessaoEncerrada}
            >
              Gerenciar condicoes
            </Button>
            {condicaoSelecionada ? (
              <span className="text-[11px] text-app-muted">
                Selecionada: {condicaoSelecionada}
              </span>
            ) : (
              <span className="text-[11px] text-app-muted">
                Abra o modal para aplicar/remover com busca rapida.
              </span>
            )}
            {aplicando ? (
              <span className="text-[11px] text-app-muted">Aplicando...</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (modo === 'inline') {
    return (
      <div className="rounded border border-app-border p-2">
        <p className="text-xs font-semibold text-app-fg">
          Condicoes da sessao ({condicoesAtivas.length})
        </p>
        {conteudo}
      </div>
    );
  }

  return (
    <details className="rounded border border-app-border p-2">
      <summary className="cursor-pointer text-xs font-semibold text-app-fg">
        Condicoes da sessao ({condicoesAtivas.length})
      </summary>
      {conteudo}
    </details>
  );
}
