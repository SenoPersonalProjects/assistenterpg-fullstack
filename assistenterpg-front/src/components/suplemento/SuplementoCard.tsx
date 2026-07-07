'use client';

import { SuplementoCatalogo } from '@/lib/api/suplementos';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';

type SuplementoCardProps = {
  suplemento: SuplementoCatalogo;
  onOpen?: () => void;
  onAtivar: () => void;
  onDesativar: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  processando?: boolean;
  isAdmin?: boolean;
};

const STATUS_COLOR: Record<'PUBLICADO' | 'RASCUNHO' | 'ARQUIVADO', 'green' | 'yellow' | 'gray'> = {
  PUBLICADO: 'green',
  RASCUNHO: 'yellow',
  ARQUIVADO: 'gray',
};

export function SuplementoCard({
  suplemento,
  onOpen,
  onAtivar,
  onDesativar,
  onEdit,
  onDelete,
  processando = false,
  isAdmin = false,
}: SuplementoCardProps) {
  const podeAtivar = suplemento.status === 'PUBLICADO' && !suplemento.ativo;
  const podeDesativar = suplemento.ativo;
  const podeArquivarAdmin = isAdmin && suplemento.status === 'PUBLICADO';

  return (
    <Card
      variant="flat"
      className="flex h-full flex-col overflow-hidden border border-white/5 bg-app-surface/45 p-0 transition-colors hover:border-app-primary/30"
    >
      <div className="relative h-20 overflow-hidden border-b border-white/5 bg-app-muted-surface">
        {suplemento.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={suplemento.banner}
            alt={suplemento.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="library" className="h-8 w-8 text-app-primary/45" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <Badge color={STATUS_COLOR[suplemento.status]} size="sm">
            {suplemento.status}
          </Badge>
          {suplemento.ativo ? (
            <Badge color="green" size="sm">
              <Icon name="check" className="mr-1 h-3 w-3" />
              Ativo
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-black leading-snug text-app-fg">
              {suplemento.nome}
            </h3>
            <p className="mt-1 truncate font-mono text-[11px] text-app-muted">{suplemento.codigo}</p>
          </div>
          <Badge color="gray" size="sm">
            v{suplemento.versao}
          </Badge>
        </div>

        {suplemento.descricao ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-app-muted">
            {suplemento.descricao}
          </p>
        ) : (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-app-muted">
            Sem descrição.
          </p>
        )}

        {suplemento.tags && suplemento.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suplemento.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
            {suplemento.tags.length > 3 ? (
              <Badge color="gray" size="sm">
                +{suplemento.tags.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs text-app-muted">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted/70">
              Fonte
            </p>
            <p className="truncate font-semibold text-app-fg/85">
              {suplemento.autor || 'Oficial'}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted/70">
              Estado
            </p>
            <p className="truncate font-semibold text-app-fg/85">
              {suplemento.ativo ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-white/5 pt-3">
          {onOpen ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-2"
              onClick={onOpen}
            >
              <Icon name="book" className="h-4 w-4" />
              Ver conteúdo
            </Button>
          ) : null}

          {isAdmin ? (
            <EntityActionsMenu
              ariaLabel={`Ações do suplemento ${suplemento.nome}`}
              items={[
                {
                  id: 'edit',
                  label: 'Editar',
                  icon: 'edit',
                  hidden: !onEdit,
                  disabled: processando,
                  onSelect: onEdit,
                },
                {
                  id: 'archive',
                  label: 'Arquivar',
                  icon: 'archive',
                  hidden: !podeArquivarAdmin,
                  disabled: processando,
                  onSelect: onDesativar,
                },
                {
                  id: 'delete',
                  label: 'Excluir',
                  icon: 'delete',
                  hidden: !onDelete,
                  destructive: true,
                  disabled: processando,
                  onSelect: onDelete,
                },
              ]}
            />
          ) : null}

          {!isAdmin && podeAtivar ? (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 gap-2"
              onClick={onAtivar}
              disabled={processando}
            >
              {processando ? (
                <Icon name="loading" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon name="check" className="h-4 w-4" />
              )}
              Ativar
            </Button>
          ) : null}

          {!isAdmin && podeDesativar ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-2"
              onClick={onDesativar}
              disabled={processando}
            >
              {processando ? (
                <Icon name="loading" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon name="close" className="h-4 w-4" />
              )}
              Desativar
            </Button>
          ) : null}
        </div>

        {!isAdmin && !podeAtivar && !podeDesativar ? (
          <p className="mt-2 text-center text-xs font-semibold text-app-muted">
            {suplemento.status === 'RASCUNHO' && 'Em desenvolvimento'}
            {suplemento.status === 'ARQUIVADO' && 'Arquivado'}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
