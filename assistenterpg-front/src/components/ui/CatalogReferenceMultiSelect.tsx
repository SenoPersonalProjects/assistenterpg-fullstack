'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ClickableCard } from '@/components/ui/ClickableCard';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { filtrarItensCatalogo } from '@/lib/ui/catalog-search';

export type CatalogReferenceOption = {
  value: string;
  label: string;
  description?: string | null;
  badges?: Array<{ text: string; color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' }>;
  searchTerms?: string[];
};

type CatalogReferenceMultiSelectProps = {
  label: string;
  helperText?: string;
  value: readonly string[];
  options: readonly CatalogReferenceOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

const TEXTO_SEM_REFERENCIAS = 'Nenhuma referência selecionada';
const TEXTO_REFERENCIA_INDISPONIVEL = 'Referência indisponível';

export function CatalogReferenceMultiSelect({
  label,
  helperText,
  value,
  options,
  onChange,
  placeholder = 'Selecionar referências',
  disabled = false,
}: CatalogReferenceMultiSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [rascunho, setRascunho] = useState<string[]>([]);

  const opcoesPorValor = useMemo(
    () => new Map(options.map((opcao) => [opcao.value, opcao])),
    [options],
  );
  const opcoesFiltradas = useMemo(
    () => filtrarItensCatalogo(options, busca),
    [busca, options],
  );
  const referenciasSelecionadas = value.map((referencia) =>
    opcoesPorValor.get(referencia),
  );

  const abrir = () => {
    if (disabled) return;
    setRascunho([...value]);
    setBusca('');
    setAberto(true);
  };

  const fechar = () => {
    setAberto(false);
    setBusca('');
  };

  const alternar = (referencia: string) => {
    setRascunho((atual) =>
      atual.includes(referencia)
        ? atual.filter((item) => item !== referencia)
        : [...atual, referencia],
    );
  };

  const remover = (referencia: string) => {
    onChange(value.filter((item) => item !== referencia));
  };

  const confirmar = () => {
    onChange(rascunho);
    fechar();
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-semibold text-app-fg">{label}</span>
      <ClickableCard onClick={abrir} disabled={disabled} filled={value.length > 0} padding="sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-2">
            {referenciasSelecionadas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {referenciasSelecionadas.map((referencia, indice) => {
                  const valor = value[indice];
                  return (
                    <span
                      key={valor}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-app-primary/30 bg-app-primary/10 px-2.5 py-1 text-xs text-app-fg"
                    >
                      <span className="truncate">
                        {referencia?.label ?? TEXTO_REFERENCIA_INDISPONIVEL}
                      </span>
                      {!disabled ? (
                        <button
                          type="button"
                          aria-label={`Remover ${referencia?.label ?? TEXTO_REFERENCIA_INDISPONIVEL}`}
                          className="rounded-full text-app-muted transition-colors hover:text-app-danger focus:outline-none focus:ring-2 focus:ring-app-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            remover(valor);
                          }}
                        >
                          <Icon name="close" className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-app-muted">{TEXTO_SEM_REFERENCIAS}</p>
            )}
            <p className="text-xs text-app-muted">{placeholder}</p>
          </div>
          <Icon name="add" className="h-5 w-5 shrink-0 text-app-primary" />
        </div>
      </ClickableCard>
      {helperText ? <p className="text-xs text-app-muted">{helperText}</p> : null}

      <Modal isOpen={aberto} onClose={fechar} title={label} size="lg">
        <div className="space-y-4">
          <Input
            placeholder="Buscar por título, resumo ou tópico..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            icon="search"
            autoFocus
          />
          <p className="text-sm text-app-muted">
            Escolha os artigos que ajudam a aprofundar este assunto. Os leitores verão os títulos relacionados na consulta do compêndio.
          </p>

          <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
            {opcoesFiltradas.length === 0 ? (
              <p className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm text-app-muted">
                Nenhum artigo encontrado.
              </p>
            ) : (
              opcoesFiltradas.map((opcao) => {
                const selecionado = rascunho.includes(opcao.value);
                return (
                  <button
                    key={opcao.value}
                    type="button"
                    onClick={() => alternar(opcao.value)}
                    aria-pressed={selecionado}
                    className={`w-full rounded-xl border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-app-primary ${
                      selecionado
                        ? 'border-app-primary bg-app-primary/10'
                        : 'border-app-border bg-app-card hover:border-app-primary/60 hover:bg-app-surface'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selecionado
                            ? 'border-app-primary bg-app-primary text-app-on-primary'
                            : 'border-app-border bg-app-surface'
                        }`}
                      >
                        {selecionado ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="block text-sm font-semibold text-app-fg">{opcao.label}</span>
                        {opcao.description ? (
                          <span className="block text-xs leading-relaxed text-app-muted">{opcao.description}</span>
                        ) : null}
                        {opcao.badges?.length ? (
                          <span className="flex flex-wrap gap-1.5 pt-1">
                            {opcao.badges.map((badge) => (
                              <Badge key={`${opcao.value}-${badge.text}`} color={badge.color ?? 'blue'} size="sm">
                                {badge.text}
                              </Badge>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
            <Button type="button" variant="secondary" onClick={fechar}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={confirmar}>
              Aplicar seleção ({rascunho.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
