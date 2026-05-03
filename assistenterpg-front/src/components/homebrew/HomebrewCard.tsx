// src/components/homebrew/HomebrewCard.tsx
'use client';

import { HomebrewResumo } from '@/lib/api/homebrews';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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
      className="library-item-card flex h-full cursor-pointer flex-col transition hover:-translate-y-0.5 hover:border-app-secondary/50"
      role="button"
      tabIndex={0}
      aria-label={`Abrir homebrew ${homebrew.nome}`}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onView();
        }
      }}
    >
      {/* Header com tipo e ícone */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5"
            style={{
              color: `var(--color-${tipoConfig.color}, #c4b5fd)`,
            }}
          >
            <Icon name={tipoConfig.icon} className="h-5 w-5" />
          </div>
          <div>
            <Badge color={tipoConfig.color} size="sm">
              {tipoConfig.label}
            </Badge>
          </div>
        </div>

        {/* Status badge */}
        <Badge color={getHomebrewStatusColor(homebrew.status)} size="sm">
          {homebrew.status}
        </Badge>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-3">
        {/* Título */}
        <div>
          <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-app-fg">
            {homebrew.nome}
          </h3>
          <p className="text-xs text-app-muted font-mono">{homebrew.codigo}</p>
        </div>

        {/* Descrição */}
        {homebrew.descricao && (
          <p className="text-sm text-app-muted line-clamp-3 leading-relaxed">
            {homebrew.descricao}
          </p>
        )}

        {/* Tags */}
        {homebrew.tags && homebrew.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {homebrew.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} color="gray" size="sm">
                {tag}
              </Badge>
            ))}
            {homebrew.tags.length > 3 && (
              <Badge color="gray" size="sm">
                +{homebrew.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Autor e versão */}
        <div className="space-y-1 border-t border-white/6 pt-2 text-xs text-app-muted">
          <div className="flex items-center justify-between">
            <span>Por {homebrew.usuarioApelido ?? 'Desconhecido'}</span>
            <span>Atualizado em {atualizadoEm}</span>
          </div>
          <div className="flex items-center justify-end text-[10px] uppercase tracking-wide text-app-muted/70">
            v{homebrew.versao}
          </div>
        </div>
      </div>

      {/* Ações */}
      {isOwner && (
        <div className="mt-4 space-y-2 border-t border-white/6 pt-4">
          {/* Botão de editar */}
          {podeEditar && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full library-ghost-button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              disabled={processando}
            >
                <Icon name="edit" className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}

          {/* Botões de ação (publicar/arquivar) */}
          <div className="flex gap-2">
            {onExport ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onExport();
                }}
                disabled={processando}
              >
                  <Icon name="download" className="h-4 w-4" />
                </Button>
            ) : null}
            {podePublicar && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={(event) => {
                  event.stopPropagation();
                  onPublicar();
                }}
                disabled={processando}
              >
                {processando ? (
                  <>
                    <Icon name="loading" className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="mr-2 h-4 w-4" />
                    Publicar
                  </>
                )}
              </Button>
            )}

            {podeArquivar && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={(event) => {
                  event.stopPropagation();
                  onArquivar();
                }}
                disabled={processando}
              >
                {processando ? (
                  <>
                    <Icon name="loading" className="mr-2 h-4 w-4 animate-spin" />
                    Arquivando...
                  </>
                ) : (
                  <>
                    <Icon name="archive" className="mr-2 h-4 w-4" />
                    Arquivar
                  </>
                )}
              </Button>
            )}

            {/* Botão de deletar */}
            <Button
              variant="ghost"
              size="sm"
              className="text-app-danger hover:bg-app-danger/10"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              disabled={processando}
            >
              <Icon name="delete" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Se não é dono, mostrar apenas visualizar */}
      {!isOwner && (
        <div className="mt-4 border-t border-white/6 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full library-ghost-button"
            onClick={(event) => {
              event.stopPropagation();
              onView();
            }}
          >
            <Icon name="eye" className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        </div>
      )}
    </Card>
  );
}
