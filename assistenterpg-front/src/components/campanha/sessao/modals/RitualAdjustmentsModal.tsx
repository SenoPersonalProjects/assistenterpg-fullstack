'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { AjusteRitualisticoSessaoPayload } from '@/lib/api/campanhas';

const EFEITOS_POR_TIPO = {
  SUBTRACAO: [
    ['REDUZIR_EFEITO', 'Reduzir efeito'],
    ['REDUZIR_ALCANCE', 'Reduzir alcance'],
    ['REDUZIR_AREA', 'Reduzir área'],
    ['REDUZIR_DT', 'Reduzir DT'],
    ['PENALIDADE_TESTE', 'Aplicar penalidade no teste'],
    ['CUSTO_EA', 'Aumentar custo de EA'],
    ['PERDER_EFEITO_SECUNDARIO', 'Perder efeito secundário'],
    ['MELHORAR_ACAO', 'Melhorar ação'],
  ],
  ADICAO: [
    ['AUMENTAR_ALCANCE', 'Aumentar alcance'],
    ['AUMENTAR_DT', 'Aumentar DT'],
    ['BONUS_TESTE', 'Conceder bônus no teste'],
    ['AUMENTAR_EFEITO', 'Aumentar efeito'],
    ['MELHORAR_ACAO', 'Melhorar ação'],
  ],
} as const satisfies Record<
  AjusteRitualisticoSessaoPayload['tipo'],
  ReadonlyArray<readonly [AjusteRitualisticoSessaoPayload['efeito'], string]>
>;

type Props = {
  isOpen: boolean;
  nomeHabilidade: string;
  ajustes: AjusteRitualisticoSessaoPayload[];
  limite: number;
  onClose: () => void;
  onConfirmar: (ajustes: AjusteRitualisticoSessaoPayload[]) => void;
};

function criarAjuste(tipo: AjusteRitualisticoSessaoPayload['tipo']): AjusteRitualisticoSessaoPayload {
  return { tipo, efeito: EFEITOS_POR_TIPO[tipo][0][0], pontos: 1, descricao: '' };
}

function descricaoEfeito(ajuste: AjusteRitualisticoSessaoPayload): string {
  return EFEITOS_POR_TIPO[ajuste.tipo].find(([codigo]) => codigo === ajuste.efeito)?.[1] ?? ajuste.efeito;
}

export function RitualAdjustmentsModal({
  isOpen,
  nomeHabilidade,
  ajustes,
  limite,
  onClose,
  onConfirmar,
}: Props) {
  const [rascunho, setRascunho] = useState<AjusteRitualisticoSessaoPayload[]>(ajustes);

  useEffect(() => {
    if (isOpen) setRascunho(ajustes);
  }, [ajustes, isOpen]);

  const podeAdicionar = rascunho.length < limite;
  const custoEaAdicional = useMemo(
    () => rascunho.reduce(
      (total, ajuste) => total + (ajuste.tipo === 'SUBTRACAO' && ajuste.efeito === 'CUSTO_EA' ? ajuste.pontos * 2 : 0),
      0,
    ),
    [rascunho],
  );

  function atualizar(indice: number, atualizacao: Partial<AjusteRitualisticoSessaoPayload>) {
    setRascunho((itens) => itens.map((item, itemIndice) => {
      if (itemIndice !== indice) return item;
      const proximo = { ...item, ...atualizacao };
      if (atualizacao.tipo && atualizacao.tipo !== item.tipo) {
        proximo.efeito = EFEITOS_POR_TIPO[atualizacao.tipo][0][0];
      }
      if (proximo.efeito === 'MELHORAR_ACAO') proximo.pontos = 2;
      return proximo;
    }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustes Ritualísticos"
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={() => onConfirmar(rascunho)}>
            Salvar ajustes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-app-secondary/40 bg-app-secondary/10 p-3 text-sm text-app-fg">
          <p className="font-semibold">{nomeHabilidade}</p>
          <p className="mt-1 text-xs text-app-muted">
            Adição inclui um componente ou restrição para ampliar a técnica. Subtração remove um componente em troca de uma limitação. O grau em Técnica Amaldiçoada permite até {limite} ajuste{limite === 1 ? '' : 's'} nesta ativação.
          </p>
        </div>

        {rascunho.length === 0 ? (
          <p className="rounded border border-dashed border-app-border p-3 text-sm text-app-muted">
            Nenhum ajuste selecionado. A habilidade será usada normalmente.
          </p>
        ) : (
          <div className="space-y-3">
            {rascunho.map((ajuste, indice) => (
              <fieldset key={`${ajuste.tipo}-${ajuste.efeito}-${indice}`} className="space-y-3 rounded-lg border border-app-border bg-app-base/40 p-3">
                <legend className="sr-only">Ajuste ritualístico {indice + 1}</legend>
                <div className="flex items-center justify-between gap-2">
                  <Badge color={ajuste.tipo === 'ADICAO' ? 'cyan' : 'purple'} size="sm">
                    {ajuste.tipo === 'ADICAO' ? 'Adição' : 'Subtração'}
                  </Badge>
                  <Button type="button" size="xs" variant="ghost" onClick={() => setRascunho((itens) => itens.filter((_, itemIndice) => itemIndice !== indice))}>
                    Remover
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-xs font-medium text-app-fg">
                    Tipo
                    <select
                      className="h-9 w-full rounded border border-app-border bg-app-surface px-2 text-sm text-app-fg"
                      value={ajuste.tipo}
                      onChange={(event) => atualizar(indice, { tipo: event.target.value as AjusteRitualisticoSessaoPayload['tipo'] })}
                    >
                      <option value="ADICAO">Adição</option>
                      <option value="SUBTRACAO">Subtração</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-medium text-app-fg sm:col-span-2">
                    Ajuste
                    <select
                      className="h-9 w-full rounded border border-app-border bg-app-surface px-2 text-sm text-app-fg"
                      value={ajuste.efeito}
                      onChange={(event) => atualizar(indice, { efeito: event.target.value as AjusteRitualisticoSessaoPayload['efeito'] })}
                    >
                      {EFEITOS_POR_TIPO[ajuste.tipo].map(([codigo, label]) => <option key={codigo} value={codigo}>{label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <label className="space-y-1 text-xs font-medium text-app-fg">
                    Pontos
                    <select
                      className="h-9 w-full rounded border border-app-border bg-app-surface px-2 text-sm text-app-fg"
                      value={ajuste.pontos}
                      disabled={ajuste.efeito === 'MELHORAR_ACAO'}
                      onChange={(event) => atualizar(indice, { pontos: Number(event.target.value) as 1 | 2 })}
                    >
                      <option value={1}>1 ponto</option>
                      <option value={2}>2 pontos</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-medium text-app-fg">
                    Descrição da escolha <span className="font-normal text-app-muted">(opcional)</span>
                    <input
                      className="h-9 w-full rounded border border-app-border bg-app-surface px-2 text-sm text-app-fg"
                      maxLength={280}
                      value={ajuste.descricao ?? ''}
                      onChange={(event) => atualizar(indice, { descricao: event.target.value })}
                      placeholder={`Ex.: como ${descricaoEfeito(ajuste).toLowerCase()}`}
                    />
                  </label>
                </div>
                {ajuste.efeito === 'MELHORAR_ACAO' ? <p className="text-[11px] text-app-muted">Melhorar a ação sempre exige 2 pontos.</p> : null}
              </fieldset>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={!podeAdicionar} onClick={() => setRascunho((itens) => [...itens, criarAjuste('ADICAO')])}>
            Adicionar ajuste
          </Button>
          {custoEaAdicional > 0 ? <Badge color="orange" size="sm">+{custoEaAdicional} EA nesta ativação</Badge> : null}
        </div>
        <p className="text-[11px] text-app-muted">
          O custo adicional de EA é aplicado automaticamente quando a Subtração aumenta o custo. Os demais efeitos ficam registrados no histórico para resolução da mesa; o sistema não inventa dano, alcance ou condições para técnicas personalizadas.
        </p>
      </div>
    </Modal>
  );
}
