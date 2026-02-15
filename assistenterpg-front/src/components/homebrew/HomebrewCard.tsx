// src/components/homebrew/HomebrewCard.tsx
'use client';

import { HomebrewResumo, TipoHomebrewConteudo, StatusPublicacao } from '@/lib/api/homebrews';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Icon, IconName } from '@/components/ui/Icon';

type HomebrewCardProps = {
  homebrew: HomebrewResumo;
  onEdit: () => void;
  onPublicar: () => void;
  onArquivar: () => void;
  onDelete: () => void;
  processando?: boolean;
  isOwner?: boolean;
};

// Mapeamento de tipos para ícones e cores
const TIPO_CONFIG: Record<
  TipoHomebrewConteudo,
  { icon: IconName; label: string; color: 'blue' | 'purple' | 'cyan' | 'orange' | 'green' | 'yellow' }
> = {
  CLA: { icon: 'clan', label: 'Clã', color: 'blue' },
  TRILHA: { icon: 'school', label: 'Trilha', color: 'purple' },
  CAMINHO: { icon: 'map', label: 'Caminho', color: 'cyan' },
  ORIGEM: { icon: 'story', label: 'Origem', color: 'orange' },
  EQUIPAMENTO: { icon: 'item', label: 'Equipamento', color: 'green' },
  PODER_GENERICO: { icon: 'sparkles', label: 'Poder', color: 'yellow' },
  TECNICA_AMALDICOADA: { icon: 'technique', label: 'Técnica', color: 'purple' },
};

// Mapeamento de status para cores
const STATUS_COLOR: Record<StatusPublicacao, 'green' | 'yellow' | 'gray'> = {
  PUBLICADO: 'green',
  RASCUNHO: 'yellow',
  ARQUIVADO: 'gray',
};

export function HomebrewCard({
  homebrew,
  onEdit,
  onPublicar,
  onArquivar,
  onDelete,
  processando = false,
  isOwner = true,
}: HomebrewCardProps) {
  const tipoConfig = TIPO_CONFIG[homebrew.tipo];
  const podePublicar = homebrew.status === 'RASCUNHO';
  const podeArquivar = homebrew.status === 'PUBLICADO';
  const podeEditar = homebrew.status !== 'ARQUIVADO';

  return (
    <Card className="flex flex-col h-full hover:border-app-primary/50 transition-colors">
      {/* Header com tipo e ícone */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg`}
            style={{
              backgroundColor: `var(--color-${tipoConfig.color}-bg, rgba(59, 130, 246, 0.1))`,
            }}
          >
            <Icon
              name={tipoConfig.icon}
              className="w-5 h-5"
              style={{ color: `var(--color-${tipoConfig.color}, #3b82f6)` }}
            />
          </div>
          <div>
            <Badge color={tipoConfig.color} size="sm">
              {tipoConfig.label}
            </Badge>
          </div>
        </div>

        {/* Status badge */}
        <Badge color={STATUS_COLOR[homebrew.status]} size="sm">
          {homebrew.status}
        </Badge>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-3">
        {/* Título */}
        <div>
          <h3 className="text-lg font-semibold text-app-fg line-clamp-2 mb-1">
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
        <div className="flex items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border">
          <span>Por {homebrew.usuarioApelido ?? 'Desconhecido'}</span>
          <span>v{homebrew.versao}</span>
        </div>
      </div>

      {/* Ações */}
      {isOwner && (
        <div className="mt-4 pt-4 border-t border-app-border space-y-2">
          {/* Botão de editar */}
          {podeEditar && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onEdit}
              disabled={processando}
            >
              <Icon name="edit" className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}

          {/* Botões de ação (publicar/arquivar) */}
          <div className="flex gap-2">
            {podePublicar && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={onPublicar}
                disabled={processando}
              >
                {processando ? (
                  <>
                    <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="w-4 h-4 mr-2" />
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
                onClick={onArquivar}
                disabled={processando}
              >
                {processando ? (
                  <>
                    <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                    Arquivando...
                  </>
                ) : (
                  <>
                    <Icon name="archive" className="w-4 h-4 mr-2" />
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
              onClick={onDelete}
              disabled={processando}
            >
              <Icon name="delete" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Se não é dono, mostrar apenas visualizar */}
      {!isOwner && (
        <div className="mt-4 pt-4 border-t border-app-border">
          <Button variant="ghost" size="sm" className="w-full" onClick={onEdit}>
            <Icon name="eye" className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
        </div>
      )}
    </Card>
  );
}
