'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type {
  CondicaoAtivaSessaoCampanha,
  CondicaoCatalogo,
  DuracaoCondicaoSessaoModo,
} from '@/lib/types';
import {
  descreverDuracaoCondicao,
  textoSeguro,
} from '@/lib/campanha/sessao-formatters';
import type { AlvoCondicoesModal, FormCondicaoSessao } from '@/components/campanha/sessao/types';

type CondicoesModalProps = {
  modalCondicoes: AlvoCondicoesModal | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
  condicoesFiltradas: CondicaoCatalogo[];
  formCondicao: FormCondicaoSessao;
  campoDuracaoDesabilitado: boolean;
  condicoesAtivas: CondicaoAtivaSessaoCampanha[];
  sessaoEncerrada: boolean;
  acaoCondicaoPendente: string | null;
  erro?: string | null;
  onClose: () => void;
  onSelecionarCondicao: (condicaoId: string) => void;
  onAtualizarCampo: (campo: keyof FormCondicaoSessao, valor: string) => void;
  onAplicarCondicao: () => void;
  onRemoverCondicao: (condicao: CondicaoAtivaSessaoCampanha) => void;
  opcoesDuracao: Array<{ value: DuracaoCondicaoSessaoModo; label: string }>;
  chaveAcaoAplicar: string | null;
  chaveAcaoRemover: (condicaoSessaoId: number) => string;
};

export function CondicoesModal({
  modalCondicoes,
  busca,
  onBuscaChange,
  condicoesFiltradas,
  formCondicao,
  campoDuracaoDesabilitado,
  condicoesAtivas,
  sessaoEncerrada,
  acaoCondicaoPendente,
  erro,
  onClose,
  onSelecionarCondicao,
  onAtualizarCampo,
  onAplicarCondicao,
  onRemoverCondicao,
  opcoesDuracao,
  chaveAcaoAplicar,
  chaveAcaoRemover,
}: CondicoesModalProps) {
  return (
    <Modal
      isOpen={Boolean(modalCondicoes)}
      onClose={onClose}
      title={
        modalCondicoes
          ? `Gerenciar condicoes | ${textoSeguro(modalCondicoes.nomeAlvo)}`
          : 'Gerenciar condicoes'
      }
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button
            onClick={modalCondicoes ? onAplicarCondicao : undefined}
            disabled={
              !modalCondicoes ||
              sessaoEncerrada ||
              !formCondicao.condicaoId ||
              (chaveAcaoAplicar ? acaoCondicaoPendente === chaveAcaoAplicar : false)
            }
          >
            {modalCondicoes && chaveAcaoAplicar && acaoCondicaoPendente === chaveAcaoAplicar
              ? 'Aplicando...'
              : 'Aplicar condicao'}
          </Button>
        </>
      }
    >
      {modalCondicoes ? (
        <div className="grid gap-3 md:grid-cols-[1.25fr_1fr]">
          {erro ? <ErrorAlert message={erro} className="md:col-span-2" /> : null}
          <div className="space-y-3">
            <Input
              label="Buscar condicao"
              value={busca}
              onChange={(event) => onBuscaChange(event.target.value)}
              placeholder="Ex.: Sangrando, Enredado..."
              icon="search"
            />
            <div className="max-h-[340px] overflow-y-auto rounded border border-app-border bg-app-bg p-2 space-y-1.5">
              {condicoesFiltradas.length === 0 ? (
                <p className="text-xs text-app-muted">
                  Nenhuma condicao encontrada para essa busca.
                </p>
              ) : (
                condicoesFiltradas.map((condicao) => {
                  const selecionada = formCondicao.condicaoId === String(condicao.id);
                  return (
                    <button
                      key={condicao.id}
                      type="button"
                      onClick={() => onSelecionarCondicao(String(condicao.id))}
                      className={
                        selecionada
                          ? 'w-full rounded border border-cyan-400 bg-cyan-500/10 px-2 py-1.5 text-left'
                          : 'w-full rounded border border-app-border bg-app-surface px-2 py-1.5 text-left hover:border-cyan-400/50'
                      }
                    >
                      <p className="text-xs font-semibold text-app-fg">
                        {textoSeguro(condicao.nome)}
                      </p>
                      <p className="text-[11px] text-app-muted line-clamp-2">
                        {textoSeguro(condicao.descricao)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
              <p className="text-xs font-semibold text-app-fg">Parametros de aplicacao</p>
              <Select
                label="Modo de duracao"
                value={formCondicao.duracaoModo}
                onChange={(event) => onAtualizarCampo('duracaoModo', event.target.value)}
                options={opcoesDuracao}
              />
              <Input
                label="Duracao (numero)"
                type="number"
                min={1}
                value={formCondicao.duracaoValor}
                onChange={(event) => onAtualizarCampo('duracaoValor', event.target.value)}
                disabled={campoDuracaoDesabilitado}
              />
              <Input
                label="Origem (opcional)"
                value={formCondicao.origemDescricao}
                onChange={(event) => onAtualizarCampo('origemDescricao', event.target.value)}
                placeholder="Ex.: Tecnica inata, armadilha..."
              />
              <Input
                label="Observacao (opcional)"
                value={formCondicao.observacao}
                onChange={(event) => onAtualizarCampo('observacao', event.target.value)}
                placeholder="Detalhe livre para lembrar contexto"
              />
            </div>

            <div className="rounded border border-app-border bg-app-bg p-2 space-y-2">
              <Input
                label="Motivo para remocao (opcional)"
                value={formCondicao.motivoRemocao}
                onChange={(event) => onAtualizarCampo('motivoRemocao', event.target.value)}
                placeholder="Ex.: Curado, efeito encerrado..."
              />
              <p className="text-[11px] text-app-muted">
                Condicoes ativas neste alvo ({condicoesAtivas.length})
              </p>
              <div className="max-h-[220px] overflow-y-auto space-y-1.5">
                {condicoesAtivas.length === 0 ? (
                  <p className="text-xs text-app-muted">
                    Nenhuma condicao ativa no momento.
                  </p>
                ) : (
                  condicoesAtivas.map((condicao) => {
                    const chaveRemover = chaveAcaoRemover(condicao.id);
                    return (
                      <div
                        key={`modal-condicao-ativa-${condicao.id}`}
                        className="rounded border border-app-border bg-app-surface px-2 py-1.5 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-app-fg">
                            {textoSeguro(condicao.nome)}
                          </p>
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => onRemoverCondicao(condicao)}
                            disabled={
                              sessaoEncerrada || acaoCondicaoPendente === chaveRemover
                            }
                          >
                            {acaoCondicaoPendente === chaveRemover ? 'Removendo...' : 'Remover'}
                          </Button>
                        </div>
                        <p className="text-[11px] text-app-muted">
                          {descreverDuracaoCondicao(
                            condicao.duracaoModo,
                            condicao.duracaoValor,
                            condicao.restanteDuracao,
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
