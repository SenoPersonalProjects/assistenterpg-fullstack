'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useToast } from '@/context/ToastContext';
import {
  apiImportarPersonagemBase,
  extrairMensagemErro,
  traduzirErro,
  type PersonagemBaseImportRequest,
} from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImported: (personagemId: number) => void;
};

type ImportPreviewInfo = {
  arquivoNome: string;
  nome: string;
  nivel: number;
  classeNome: string | null;
  trilhaNome: string | null;
  schema: string;
  schemaVersion: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function readReferenceName(value: unknown): string | null {
  if (!isRecord(value)) return null;
  return asString(value.nome) ?? asString(value.codigo);
}

function parseImportPayload(rawContent: string): PersonagemBaseImportRequest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Formato inválido: o JSON precisa ser um objeto.');
  }

  const schema = asString(parsed.schema);
  const schemaVersion = Number(parsed.schemaVersion);
  const personagem = parsed.personagem;

  if (!schema) {
    throw new Error('Arquivo sem campo "schema".');
  }

  if (!Number.isFinite(schemaVersion)) {
    throw new Error('Arquivo sem "schemaVersion" válido.');
  }

  if (!isRecord(personagem)) {
    throw new Error('Arquivo sem objeto "personagem" para importação.');
  }

  const nome = asString(personagem.nome);
  const nivel = Number(personagem.nivel);

  if (!nome) {
    throw new Error('O personagem exportado está sem nome.');
  }

  if (!Number.isFinite(nivel)) {
    throw new Error('O personagem exportado está sem nível válido.');
  }

  return {
    schema,
    schemaVersion,
    exportadoEm: asString(parsed.exportadoEm) ?? undefined,
    personagem: personagem as PersonagemBaseImportRequest['personagem'],
    referencias: isRecord(parsed.referencias)
      ? (parsed.referencias as PersonagemBaseImportRequest['referencias'])
      : undefined,
  };
}

function collectDetailMessages(value: unknown, acc: string[]) {
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized) acc.push(normalized);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectDetailMessages(item, acc);
    }
    return;
  }

  if (!isRecord(value)) return;
  for (const nested of Object.values(value)) {
    collectDetailMessages(nested, acc);
  }
}

function extractDetailsMessages(details: unknown): string[] {
  if (!details) return [];
  const messages: string[] = [];
  collectDetailMessages(details, messages);
  return Array.from(new Set(messages));
}

function buildImportErrorMessage(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const bodyCode = (error as { body?: { code?: string } })?.body?.code;
  const defaultMessage = traduzirErro(
    bodyCode,
    extrairMensagemErro(error),
    Number.isFinite(status) ? status : undefined,
  );
  const detailMessages = extractDetailsMessages(
    (error as { body?: { details?: unknown } })?.body?.details,
  );

  if (status === 400) {
    return detailMessages[0] ?? `JSON inválido para importação. ${defaultMessage}`;
  }

  if (status === 404) {
    return (
      detailMessages[0] ??
      'Não foi possível resolver uma referência da ficha no servidor. Revise o JSON ou os catálogos disponíveis.'
    );
  }

  if (status === 422) {
    return detailMessages[0] ?? `A ficha importada violou uma regra de criação. ${defaultMessage}`;
  }

  return defaultMessage;
}

export function ImportarPersonagemJsonModal({ isOpen, onClose, onImported }: Props) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [payload, setPayload] = useState<PersonagemBaseImportRequest | null>(null);
  const [arquivoNome, setArquivoNome] = useState<string>('');
  const [nomeSobrescrito, setNomeSobrescrito] = useState<string>('');
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPayload(null);
      setArquivoNome('');
      setNomeSobrescrito('');
      setErroArquivo(null);
      setErroImportacao(null);
      setImportando(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const previewInfo = useMemo<ImportPreviewInfo | null>(() => {
    if (!payload) return null;

    return {
      arquivoNome,
      nome: payload.personagem.nome,
      nivel: payload.personagem.nivel,
      classeNome: readReferenceName(payload.referencias?.classe),
      trilhaNome: readReferenceName(payload.referencias?.trilha),
      schema: payload.schema,
      schemaVersion: payload.schemaVersion,
    };
  }, [arquivoNome, payload]);

  async function handleArquivoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErroArquivo(null);
    setErroImportacao(null);

    if (!file.name.toLowerCase().endsWith('.json')) {
      setPayload(null);
      setArquivoNome(file.name);
      setErroArquivo('Selecione um arquivo com extensão .json.');
      return;
    }

    try {
      const rawContent = await file.text();
      const parsedPayload = parseImportPayload(rawContent);
      setArquivoNome(file.name);
      setPayload(parsedPayload);
      setNomeSobrescrito('');
    } catch (error) {
      setPayload(null);
      setArquivoNome(file.name);
      setErroArquivo(error instanceof Error ? error.message : 'Falha ao ler o arquivo JSON.');
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
      const created = await apiImportarPersonagemBase({
        ...payload,
        nomeSobrescrito: nomeSobrescrito.trim() || undefined,
      });

      showToast(`Personagem "${created.nome}" importado com sucesso.`, 'success');
      onImported(created.id);
      onClose();
    } catch (error) {
      const message = buildImportErrorMessage(error);
      setErroImportacao(message);
    } finally {
      setImportando(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar personagem via JSON"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={importando}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleImportar}
            disabled={importando || !payload}
          >
            {importando ? 'Importando...' : 'Confirmar importação'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-app-border bg-app-bg p-3">
          <p className="text-sm font-medium text-app-fg mb-2">Arquivo JSON</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleArquivoChange}
            className="block w-full text-sm text-app-muted file:mr-3 file:rounded file:border file:border-app-border file:bg-app-surface file:px-3 file:py-1 file:text-app-fg hover:file:bg-app-secondary-hover"
            disabled={importando}
          />
          {arquivoNome && (
            <p className="mt-2 text-xs text-app-muted flex items-center gap-1.5">
              <Icon name="document" className="w-3 h-3" />
              {arquivoNome}
            </p>
          )}
        </div>

        {previewInfo && (
          <div className="rounded-lg border border-app-border bg-app-surface p-3">
            <p className="text-sm font-medium text-app-fg mb-2">Pré-visualização</p>
            <div className="grid gap-2 text-xs text-app-muted sm:grid-cols-2">
              <p>
                <span className="text-app-fg font-medium">Nome:</span> {previewInfo.nome}
              </p>
              <p>
                <span className="text-app-fg font-medium">Nível:</span> {previewInfo.nivel}
              </p>
              <p>
                <span className="text-app-fg font-medium">Classe:</span>{' '}
                {previewInfo.classeNome ?? 'Não informada'}
              </p>
              <p>
                <span className="text-app-fg font-medium">Trilha:</span>{' '}
                {previewInfo.trilhaNome ?? 'Não informada'}
              </p>
              <p>
                <span className="text-app-fg font-medium">Schema:</span> {previewInfo.schema}
              </p>
              <p>
                <span className="text-app-fg font-medium">Versão:</span>{' '}
                {previewInfo.schemaVersion}
              </p>
            </div>
          </div>
        )}

        <Input
          label="Nome sobrescrito (opcional)"
          placeholder="Ex.: Megumi (Importado)"
          value={nomeSobrescrito}
          onChange={(e) => setNomeSobrescrito(e.target.value)}
          disabled={importando || !payload}
          helperText="Se preenchido, substitui o nome da ficha no momento da importação."
        />

        {erroArquivo && <ErrorAlert message={erroArquivo} />}
        {erroImportacao && <ErrorAlert message={erroImportacao} />}
      </div>
    </Modal>
  );
}
