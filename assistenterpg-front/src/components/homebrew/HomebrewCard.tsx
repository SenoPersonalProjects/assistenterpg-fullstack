// src/components/homebrew/HomebrewCard.tsx
'use client';

import { HomebrewResumo } from '@/lib/api/homebrews';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import { getHomebrewStatusColor, getHomebrewTipoConfig } from './homebrewUi';

type HomebrewCardProps = {
  homebrew: HomebrewResumo;
  onView: () => void;
  onEdit: () => void;
  onPublicar: () => void;
  onArquivar: () => void;
  onDelete: () => void;
  onExport?: () => void;
  processando?: boolean;
  isOwner?: boolean;
};

export function HomebrewCard({
  homebrew,
  onView,
  onEdit,
  onPublicar,
  onArquivar,
  onDelete,
  onExport,
  processando = false,
  isOwner = true,
}: HomebrewCardProps) {
  const tipoConfig = getHomebrewTipoConfig(homebrew.tipo);
  const podePublicar = homebrew.status === 'RASCUNHO';
  const podeArquivar = homebrew.status === 'PUBLICADO';
  const podeEditar = homebrew.status !== 'ARQUIVADO';
  const atualizadoEm = new Date(homebrew.atualizadoEm).toLocaleDateString('pt-BR');

  return (
    <Card
      variant="flat"
      className="flex h-full flex-col border border-white/5 bg-app-surface/45 p-4 transition-colors hover:border-app-secondary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-app-muted-surface/70"
            style={{
              color: `var(--color-${tipoConfig.color}, #c4b5fd)`,
            }}
          >
            <Icon name={tipoConfig.icon} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-black leading-snug text-app-fg">
              {homebrew.nome}
            </h3>
            <p className="mt-1 truncate font-mono text-[11px] text-app-muted">{homebrew.codigo}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge color={getHomebrewStatusColor(homebrew.status)} size="sm">
            {homebrew.status}
          </Badge>
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
            v{homebrew.versao}
          </span>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge color={tipoConfig.color} size="sm">
            {tipoConfig.label}
          </Badge>
          {homebrew.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} color="gray" size="sm">
              {tag}
            </Badge>
          ))}
          {homebrew.tags && homebrew.tags.length > 2 ? (
            <Badge color="gray" size="sm">
              +{homebrew.tags.length - 2}
            </Badge>
          ) : null}
        </div>

        {homebrew.descricao ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-app-muted">
            {homebrew.descricao}
          </p>
        ) : (
          <p className="line-clamp-2 text-sm leading-relaxed text-app-muted">
            Sem descrição.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs text-app-muted">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted/70">
              Autor
            </p>
            <p className="truncate font-semibold text-app-fg/85">
              {homebrew.usuarioApelido ?? 'Desconhecido'}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted/70">
              Atualização
            </p>
            <p className="truncate font-semibold text-app-fg/85">{atualizadoEm}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
        <Button
          variant={isOwner ? 'secondary' : 'primary'}
          size="sm"
          className="flex-1 gap-2"
          onClick={onView}
        >
          <Icon name="eye" className="h-4 w-4" />
          Abrir
        </Button>

        {isOwner ? (
          <EntityActionsMenu
            ariaLabel={`Ações do homebrew ${homebrew.nome}`}
            items={[
              {
                id: 'edit',
                label: 'Editar',
                icon: 'edit',
                hidden: !podeEditar,
                disabled: processando,
                onSelect: onEdit,
              },
              {
                id: 'publish',
                label: 'Publicar',
                icon: 'check',
                hidden: !podePublicar,
                disabled: processando,
                onSelect: onPublicar,
              },
              {
                id: 'archive',
                label: 'Arquivar',
                icon: 'archive',
                hidden: !podeArquivar,
                disabled: processando,
                onSelect: onArquivar,
              },
              {
                id: 'export',
                label: 'Exportar JSON',
                icon: 'download',
                hidden: !onExport,
                disabled: processando,
                onSelect: onExport,
              },
              {
                id: 'delete',
                label: 'Excluir',
                icon: 'delete',
                destructive: true,
                disabled: processando,
                onSelect: onDelete,
              },
            ]}
          />
        ) : null}
      </div>
    </Card>
  );
}
