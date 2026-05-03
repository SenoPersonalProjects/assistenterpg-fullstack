'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';

type ImportPreview = {
  exportType: string;
  schemaVersion: number;
  exportedAt?: string;
  nomePrincipal?: string;
  quantidadeItens: number;
  tipoLeitura: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  acceptedExportTypes: string[];
  typeLabels: Record<string, string>;
  onImport: (payload: Record<string, unknown>) => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function buildPreview(
  payload: Record<string, unknown>,
  typeLabels: Record<string, string>,
): ImportPreview {
  const exportType = asString(payload.exportType);
  const schemaVersion = Number(payload.schemaVersion);

  if (!exportType) {
    throw new Error('Arquivo sem campo "exportType".');
  }

  if (!Number.isFinite(schemaVersion)) {
    throw new Error('Arquivo sem "schemaVersion" válido.');
  }

  if (exportType.endsWith('-group')) {
    const group = payload.group;
    const items = payload.items;
    if (!isRecord(group)) {
      throw new Error('JSON de grupo sem objeto "group".');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('JSON de grupo sem lista "items".');
    }

    return {
      exportType,
      schemaVersion,
      exportedAt: asString(payload.exportedAt),
      nomePrincipal: asString(group.nome),
      quantidadeItens: items.length,
      tipoLeitura: typeLabels[exportType] ?? exportType,
    };
  }

  const item = payload.item;
  if (!isRecord(item)) {
    throw new Error('JSON sem objeto "item".');
  }

  return {
    exportType,
    schemaVersion,
    exportedAt: asString(payload.exportedAt),
    nomePrincipal: asString(item.nome),
    quantidadeItens: 1,
    tipoLeitura: typeLabels[exportType] ?? exportType,
  };
}

export function JsonImportModal({
  isOpen,
  onClose,
  title,
  acceptedExportTypes,
  typeLabels,
  onImport,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [arquivoNome, setArquivoNome] = useState('');
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setArquivoNome('');
      setPayload(null);
      setErroArquivo(null);
      setErroImportacao(null);
      setImportando(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const preview = useMemo(() => {
    if (!payload) return null;
    return buildPreview(payload, typeLabels);
  }, [payload, typeLabels]);

  async function handleArquivoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroArquivo(null);
    setErroImportacao(null);
    setPayload(null);

    if (!file.name.toLowerCase().endsWith('.json')) {
      setErroArquivo('Selecione um arquivo com extensão .json.');
      return;
    }

    try {
      const rawContent = await file.text();
      const parsed = JSON.parse(rawContent) as unknown;
      if (!isRecord(parsed)) {
        throw new Error('Formato inválido: o JSON precisa ser um objeto.');
      }

      const exportType = asString(parsed.exportType);
      if (!exportType || !acceptedExportTypes.includes(exportType)) {
        throw new Error(
          `Este arquivo não é compatível com esta tela. Tipos aceitos: ${acceptedExportTypes
            .map((type) => typeLabels[type] ?? type)
            .join(', ')}.`,
        );
      }

      buildPreview(parsed, typeLabels);
      setPayload(parsed);
    } catch (error) {
      setErroArquivo(
        error instanceof Error ? error.message : 'Falha ao ler o arquivo JSON.',
      );
    }
  }

  async function handleImportar() {
    if (!payload) {
      setErroImportacao('Selecione e valide um arquivo JSON antes de importar.');
      return;
    }

    setErroImportacao(null);
    setImportando(true);

    try {
      await onImport(payload);
      onClose();
    } catch (error) {
      setErroImportacao(
        error instanceof Error ? error.message : 'Falha ao importar o JSON.',
      );
    } finally {
      setImportando(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={importando}>
            Cancelar
          </Button>
          <Button onClick={() => void handleImportar()} disabled={!payload || importando}>
            {importando ? 'Importando...' : 'Importar JSON'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-app-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-app-fg">Selecionar arquivo JSON</p>
              <p className="text-xs text-app-muted">
                Aceita item individual ou grupo exportado desta biblioteca.
              </p>
            </div>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={importando}>
              <Icon name="upload" className="mr-2 h-4 w-4" />
              Escolher arquivo
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => void handleArquivoChange(event)}
          />
          {arquivoNome ? (
            <p className="mt-3 text-xs text-app-muted">Arquivo selecionado: {arquivoNome}</p>
          ) : null}
        </div>

        {erroArquivo ? <ErrorAlert message={erroArquivo} /> : null}

        {preview ? (
          <div className="space-y-3 rounded-lg border border-app-border bg-app-card/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-app-muted">
                Detectado
              </span>
              <span className="rounded-full bg-app-primary/10 px-2 py-1 text-xs font-medium text-app-primary">
                {preview.tipoLeitura}
              </span>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-app-muted">Schema</dt>
                <dd className="text-sm font-medium text-app-fg">v{preview.schemaVersion}</dd>
              </div>
              <div>
                <dt className="text-xs text-app-muted">Quantidade</dt>
                <dd className="text-sm font-medium text-app-fg">
                  {preview.quantidadeItens} item(ns)
                </dd>
              </div>
              {preview.nomePrincipal ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-app-muted">
                    {preview.exportType.endsWith('-group') ? 'Grupo' : 'Item'}
                  </dt>
                  <dd className="text-sm font-medium text-app-fg">{preview.nomePrincipal}</dd>
                </div>
              ) : null}
              {preview.exportedAt ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-app-muted">Exportado em</dt>
                  <dd className="text-sm font-medium text-app-fg">
                    {new Date(preview.exportedAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {erroImportacao ? <ErrorAlert message={erroImportacao} /> : null}
      </div>
    </Modal>
  );
}
