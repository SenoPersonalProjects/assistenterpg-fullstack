'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { SolicitacaoAmizadeResumo } from '@/lib/types';

type Props = {
  solicitacao: SolicitacaoAmizadeResumo;
  tipo: 'recebida' | 'enviada';
  loading?: boolean;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
};

export function FriendRequestCard({
  solicitacao,
  tipo,
  loading = false,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const data = new Date(solicitacao.criadoEm).toLocaleDateString('pt-BR');

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-app-surface/60 border-app-border/50 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-secondary/10 text-app-secondary">
          <Icon name="user" className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-app-fg">
            {solicitacao.usuario.apelido}
          </p>
          <p className="text-xs text-app-muted">
            {tipo === 'recebida' ? 'Solicitou amizade' : 'Solicitação enviada'} em {data}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {tipo === 'recebida' ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={() => onAccept?.(solicitacao.id)}
            >
              Aceitar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => onReject?.(solicitacao.id)}
            >
              Recusar
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => onCancel?.(solicitacao.id)}
          >
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );
}
