'use client';

import type { NpcAmeacaDetalhe, NpcAmeacaResumo } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import {
  corBadgeFichaTipo,
  labelFichaTipo,
  labelTamanhoNpc,
  labelTipoNpc,
} from './npcAmeacaUi';

type NpcAmeacaPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resumo: NpcAmeacaResumo | null;
  detalhe: NpcAmeacaDetalhe | null;
  loading: boolean;
  error?: string | null;
  onOpenFull: () => void;
  onEdit: () => void;
};

export function NpcAmeacaPreviewModal({
  isOpen,
  onClose,
  resumo,
  detalhe,
  loading,
  error,
  onOpenFull,
  onEdit,
}: NpcAmeacaPreviewModalProps) {
  const fonte = detalhe ?? resumo;
  const titulo = fonte?.nome ?? 'Pré-visualização';

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
            Abrir ficha
          </Button>
          <Button onClick={onEdit} disabled={!resumo}>
            Editar
          </Button>
        </>
      }
    >
      {loading ? (
        <Loading message="Carregando ficha..." className="py-8 text-app-fg" />
      ) : null}

      {!loading && error ? <ErrorAlert message={error} /> : null}

      {!loading && !error && fonte ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={corBadgeFichaTipo(fonte.fichaTipo)}>{labelFichaTipo(fonte.fichaTipo)}</Badge>
            <span className="text-xs text-app-muted">
              {labelTipoNpc(fonte.tipo)} | Tamanho {labelTamanhoNpc(fonte.tamanho)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">VD</p>
              <p className="text-lg font-semibold text-app-fg">{fonte.vd}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">Defesa</p>
              <p className="text-lg font-semibold text-app-fg">{fonte.defesa}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">PV</p>
              <p className="text-lg font-semibold text-app-fg">{fonte.pontosVida}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">Deslocamento</p>
              <p className="text-lg font-semibold text-app-fg">
                {detalhe ? `${detalhe.deslocamentoMetros}m` : '-'}
              </p>
            </div>
          </div>

          {fonte.descricao ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                Descrição
              </p>
              <p className="text-sm text-app-fg">{fonte.descricao}</p>
            </div>
          ) : null}

          {detalhe ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="npc-stat-tile p-3">
                <p className="text-xs text-app-muted">Perícias especiais</p>
                <p className="text-lg font-semibold text-app-fg">{detalhe.periciasEspeciais.length}</p>
              </div>
              <div className="npc-stat-tile p-3">
                <p className="text-xs text-app-muted">Passivas</p>
                <p className="text-lg font-semibold text-app-fg">{detalhe.passivas.length}</p>
              </div>
              <div className="npc-stat-tile p-3">
                <p className="text-xs text-app-muted">Ações</p>
                <p className="text-lg font-semibold text-app-fg">{detalhe.acoes.length}</p>
              </div>
            </div>
          ) : null}

          {detalhe?.usoTatico ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                Uso tático
              </p>
              <p className="text-sm text-app-fg">{detalhe.usoTatico}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
