'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type {
  JsonImportGuide,
  JsonImportGuideReference,
  JsonImportGuideReferenceRow,
  UserFacingError,
} from '@/lib/types';

type JsonGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loadGuide: () => Promise<JsonImportGuide>;
};

type Tab = 'campos' | 'exemplos' | 'referencias';

const TAB_LABELS: Record<Tab, string> = {
  campos: 'Campos',
  exemplos: 'Exemplos',
  referencias: 'Referências',
};

function stringifyExample(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function rowValue(row: JsonImportGuideReferenceRow, column: string): string {
  if (column === 'extra') {
    return row.extra ? JSON.stringify(row.extra) : '';
  }

  const direct = row[column as keyof JsonImportGuideReferenceRow];
  if (direct !== undefined && direct !== null && typeof direct !== 'object') {
    return String(direct);
  }

  const extra = row.extra?.[column];
  if (extra === undefined || extra === null) return '';
  if (typeof extra === 'object') return JSON.stringify(extra);
  return String(extra);
}

function referenceColumns(reference: JsonImportGuideReference): string[] {
  const hasExtra = reference.rows.some(
    (row) => row.extra && Object.keys(row.extra).length > 0,
  );
  return hasExtra ? [...reference.columns, 'extra'] : reference.columns;
}

function rowMatchesSearch(
  row: JsonImportGuideReferenceRow,
  search: string,
): boolean {
  if (!search) return true;
  const normalized = search.toLowerCase();
  return JSON.stringify(row).toLowerCase().includes(normalized);
}

export function JsonGuideModal({
  isOpen,
  onClose,
  title,
  loadGuide,
}: JsonGuideModalProps) {
  const [guide, setGuide] = useState<JsonImportGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('campos');
  const [referenceKey, setReferenceKey] = useState<string>('');
  const [search, setSearch] = useState('');
  const [copiedExample, setCopiedExample] = useState<'minimo' | 'completo' | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    void Promise.resolve()
      .then(async () => {
        if (!mounted) return;
        setActiveTab('campos');
        setSearch('');
        setCopiedExample(null);
        setLoading(true);
        setError(null);

        const loadedGuide = await loadGuide();
        if (!mounted) return;
        setGuide(loadedGuide);
        setReferenceKey(loadedGuide.referencias[0]?.key ?? '');
      })
      .catch((loadError) => {
        if (!mounted) return;
        setError(criarErroUsuario(loadError, 'Falha ao carregar ajuda JSON.'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, loadGuide]);

  const activeReference = useMemo(() => {
    if (!guide) return null;
    return (
      guide.referencias.find((reference) => reference.key === referenceKey) ??
      guide.referencias[0] ??
      null
    );
  }, [guide, referenceKey]);

  const filteredRows = useMemo(() => {
    if (!activeReference) return [];
    return activeReference.rows.filter((row) => rowMatchesSearch(row, search));
  }, [activeReference, search]);

  async function copyExample(kind: 'minimo' | 'completo') {
    if (!guide) return;
    const value = stringifyExample(guide.exemplos[kind]);
    await navigator.clipboard.writeText(value);
    setCopiedExample(kind);
    setTimeout(() => setCopiedExample(null), 1800);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-sm text-app-muted">
          Carregando guia JSON...
        </div>
      ) : error ? (
        <ErrorAlert error={error} />
      ) : guide ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-app-border bg-app-card/40 p-4">
            <p className="text-sm text-app-fg">{guide.descricao}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-app-primary/10 px-2 py-1 text-app-primary">
                schema: {guide.schema}
              </span>
              <span className="rounded-full bg-app-primary/10 px-2 py-1 text-app-primary">
                versão: {guide.schemaVersion}
              </span>
              {guide.exportTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-app-surface px-2 py-1 text-app-muted"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-app-primary text-white'
                    : 'bg-app-surface text-app-muted hover:text-app-fg'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {activeTab === 'campos' ? (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-app-fg">
                  Regras
                </h3>
                <ul className="space-y-1 text-sm text-app-muted">
                  {guide.regras.map((regra) => (
                    <li key={regra} className="flex gap-2">
                      <span aria-hidden="true">-</span>
                      <span>{regra}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-x-auto rounded-lg border border-app-border">
                <table className="min-w-full divide-y divide-app-border text-sm">
                  <thead className="bg-app-surface">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-app-fg">
                        Campo
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-app-fg">
                        Tipo
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-app-fg">
                        Obrigatório
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-app-fg">
                        Referência
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-app-fg">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    {guide.campos.map((field) => (
                      <tr key={field.path}>
                        <td className="px-3 py-2 font-mono text-xs text-app-fg">
                          {field.path}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-app-muted">
                          {field.type}
                        </td>
                        <td className="px-3 py-2 text-app-muted">
                          {field.required ? 'Sim' : 'Não'}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-app-muted">
                          {field.reference ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-app-muted">
                          {field.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === 'exemplos' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {(['minimo', 'completo'] as const).map((kind) => (
                <div
                  key={kind}
                  className="rounded-lg border border-app-border bg-app-card/40"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-app-border px-3 py-2">
                    <h3 className="text-sm font-semibold capitalize text-app-fg">
                      Exemplo {kind}
                    </h3>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => void copyExample(kind)}
                    >
                      <Icon
                        name={copiedExample === kind ? 'copyDone' : 'copy'}
                        className="mr-2 h-4 w-4"
                      />
                      {copiedExample === kind ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <pre className="max-h-96 overflow-auto p-3 text-xs text-app-fg">
                    {stringifyExample(guide.exemplos[kind])}
                  </pre>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'referencias' ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[260px_1fr]">
                <div className="space-y-2">
                  {guide.referencias.map((reference) => (
                    <button
                      key={reference.key}
                      type="button"
                      onClick={() => setReferenceKey(reference.key)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeReference?.key === reference.key
                          ? 'bg-app-primary text-white'
                          : 'bg-app-surface text-app-muted hover:text-app-fg'
                      }`}
                    >
                      <span className="font-medium">{reference.title}</span>
                      <span className="block text-xs opacity-80">
                        {reference.rows.length} registro(s)
                      </span>
                    </button>
                  ))}
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-2">
                    <Icon name="search" className="h-4 w-4 text-app-muted" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar nesta referência..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-app-fg outline-none placeholder:text-app-muted"
                    />
                  </div>

                  {activeReference ? (
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-semibold text-app-fg">
                          {activeReference.title}
                        </h3>
                        {activeReference.description ? (
                          <p className="text-xs text-app-muted">
                            {activeReference.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-app-border">
                        <table className="min-w-full divide-y divide-app-border text-sm">
                          <thead className="bg-app-surface">
                            <tr>
                              {referenceColumns(activeReference).map((column) => (
                                <th
                                  key={column}
                                  className="px-3 py-2 text-left font-semibold text-app-fg"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-app-border">
                            {filteredRows.map((row, rowIndex) => (
                              <tr key={`${row.id ?? row.codigo ?? row.nome}-${rowIndex}`}>
                                {referenceColumns(activeReference).map((column) => (
                                  <td
                                    key={column}
                                    className="max-w-[24rem] px-3 py-2 text-xs text-app-muted"
                                  >
                                    <span className="break-words">
                                      {rowValue(row, column) || '-'}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-app-muted">
                      Este guia não possui referências dinâmicas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
