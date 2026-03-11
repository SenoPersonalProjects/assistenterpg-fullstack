'use client';

import type { CampanhaResumo } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';

export type CampanhaPreviewDetalhe = {
  id: number;
  nome: string;
  descricao: string | null;
  status: string;
  criadoEm: string;
  dono: { id: number; apelido: string };
  membros?: Array<{
    usuario: { id: number; apelido: string };
    papel: string;
  }>;
  _count: { membros: number; personagens: number; sessoes: number };
};

type CampaignPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resumo: CampanhaResumo | null;
  detalhe: CampanhaPreviewDetalhe | null;
  loading: boolean;
  error?: string | null;
  onOpenFull: () => void;
};

function getStatusColor(status: string): 'green' | 'yellow' | 'red' {
  if (status === 'ATIVA') return 'green';
  if (status === 'PAUSADA') return 'yellow';
  return 'red';
}

export function CampaignPreviewModal({
  isOpen,
  onClose,
  resumo,
  detalhe,
  loading,
  error,
  onOpenFull,
}: CampaignPreviewModalProps) {
  const fonte = detalhe ?? resumo;
  const titulo = fonte?.nome ?? 'Pré-visualização';
  const membros = detalhe?.membros ?? [];

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
          <Button onClick={onOpenFull} disabled={!resumo}>
            Abrir campanha
          </Button>
        </>
      }
    >
      {loading ? <Loading message="Carregando campanha..." className="py-8 text-app-fg" /> : null}
      {!loading && error ? <ErrorAlert message={error} /> : null}

      {!loading && !error && fonte ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={getStatusColor(fonte.status)}>{fonte.status}</Badge>
            <span className="text-xs text-app-muted">
              Criada em {new Date(fonte.criadoEm).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {fonte.descricao ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                Descrição
              </p>
              <p className="text-sm text-app-fg">{fonte.descricao}</p>
            </div>
          ) : (
            <p className="text-sm text-app-muted">Esta campanha ainda não possui descrição.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Dono</p>
              <p className="text-sm font-semibold text-app-fg">{fonte.dono.apelido}</p>
            </div>
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Membros</p>
              <p className="text-lg font-semibold text-app-fg">{fonte._count.membros}</p>
            </div>
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Personagens</p>
              <p className="text-lg font-semibold text-app-fg">{fonte._count.personagens}</p>
            </div>
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">Sessões</p>
              <p className="text-lg font-semibold text-app-fg">{fonte._count.sessoes}</p>
            </div>
          </div>

          {membros.length > 0 ? (
            <div className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
                Membros (prévia)
              </p>
              <div className="flex flex-wrap gap-2">
                {membros.slice(0, 8).map((membro) => (
                  <Badge
                    key={`${membro.usuario.id}-${membro.papel}`}
                    color="gray"
                    size="sm"
                  >
                    {membro.usuario.apelido} ({membro.papel})
                  </Badge>
                ))}
                {membros.length > 8 ? (
                  <Badge color="gray" size="sm">
                    +{membros.length - 8}
                  </Badge>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
