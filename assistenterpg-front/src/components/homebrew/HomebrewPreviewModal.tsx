'use client';

import type { HomebrewDetalhado, HomebrewResumo, JsonObject } from '@/lib/api/homebrews';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { getHomebrewStatusColor, getHomebrewTipoConfig } from './homebrewUi';

type HomebrewPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resumo: HomebrewResumo | null;
  detalhe: HomebrewDetalhado | null;
  loading: boolean;
  error?: string | null;
  canEdit: boolean;
  onOpenFull: () => void;
  onEdit: () => void;
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function HomebrewPreviewModal({
  isOpen,
  onClose,
  resumo,
  detalhe,
  loading,
  error,
  canEdit,
  onOpenFull,
  onEdit,
}: HomebrewPreviewModalProps) {
  const fonte = detalhe ?? resumo;
  const titulo = fonte?.nome ?? 'Pré-visualização';
  const tipoConfig = fonte ? getHomebrewTipoConfig(fonte.tipo) : null;
  const tags = fonte?.tags ?? [];
  const dadosKeys = detalhe && isJsonObject(detalhe.dados) ? Object.keys(detalhe.dados) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="secondary" onClick={onOpenFull} disabled={!resumo}>
            Abrir conteúdo
          </Button>
          {canEdit ? <Button onClick={onEdit}>Editar</Button> : null}
        </>
      }
    >
      {loading ? <Loading message="Carregando homebrew..." className="py-8 text-app-fg" /> : null}
      {!loading && error ? <ErrorAlert message={error} /> : null}

      {!loading && !error && fonte && tipoConfig ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={tipoConfig.color}>{tipoConfig.label}</Badge>
            <Badge color={getHomebrewStatusColor(fonte.status)}>{fonte.status}</Badge>
            <span className="text-xs font-mono text-app-muted">{fonte.codigo}</span>
            <span className="text-xs text-app-muted">v{fonte.versao}</span>
          </div>

          {fonte.descricao ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                Descrição
              </p>
              <p className="text-sm text-app-fg">{fonte.descricao}</p>
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} color="gray" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Autor</p>
              <p className="text-sm font-semibold text-app-fg">{fonte.usuarioApelido ?? 'Desconhecido'}</p>
            </div>
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Criado em</p>
              <p className="text-sm font-semibold text-app-fg">
                {new Date(fonte.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Atualizado em</p>
              <p className="text-sm font-semibold text-app-fg">
                {new Date(fonte.atualizadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {detalhe ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                Estrutura de dados
              </p>
              {dadosKeys.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dadosKeys.slice(0, 8).map((key) => (
                    <Badge key={key} color="gray" size="sm">
                      {key}
                    </Badge>
                  ))}
                  {dadosKeys.length > 8 ? (
                    <Badge color="gray" size="sm">
                      +{dadosKeys.length - 8}
                    </Badge>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-app-muted">Conteúdo sem chaves de objeto no nível raiz.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
