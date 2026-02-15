// src/components/suplemento/SuplementoCard.tsx
'use client';

import { SuplementoCatalogo } from '@/lib/api/suplementos';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

type SuplementoCardProps = {
  suplemento: SuplementoCatalogo;
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
  onAtivar,
  onDesativar,
  onEdit,
  onDelete,
  processando = false,
  isAdmin = false,
}: SuplementoCardProps) {
  // ✅ DEBUG 1: Verificar props
  console.log('🔍 [CARD] Props recebidas:', {
    suplemento: suplemento.nome,
    isAdmin,
    onEdit: !!onEdit,
    onDelete: !!onDelete,
  });

  const podeAtivar = suplemento.status === 'PUBLICADO' && !suplemento.ativo;
  const podeDesativar = suplemento.ativo;

  return (
    <Card className="flex flex-col h-full hover:border-app-primary/50 transition-colors">
      {/* Banner ou placeholder */}
      <div className="relative h-32 -m-4 mb-4 rounded-t overflow-hidden bg-gradient-to-br from-app-primary/10 to-app-secondary/10">
        {suplemento.banner ? (
          <img
            src={suplemento.banner}
            alt={suplemento.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon name="library" className="w-12 h-12 text-app-primary/40" />
          </div>
        )}

        {/* Badge de status ativo/inativo */}
        {suplemento.ativo && (
          <div className="absolute top-2 right-2">
            <Badge color="green" size="sm">
              <Icon name="check" className="w-3 h-3 mr-1" />
              Ativo
            </Badge>
          </div>
        )}

        {/* ✅ DEBUG 2: Badge admin */}
        {(() => {
          console.log('🔍 [CARD] Renderizando badge admin, isAdmin:', isAdmin);
          return isAdmin && (
            <div className="absolute top-2 left-2">
              <Badge color={STATUS_COLOR[suplemento.status]} size="sm">
                {suplemento.status}
              </Badge>
            </div>
          );
        })()}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-3">
        {/* Título e versão */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-semibold text-app-fg line-clamp-1">
              {suplemento.nome}
            </h3>
            <Badge color="gray" size="sm">
              v{suplemento.versao}
            </Badge>
          </div>

          {/* Código */}
          <p className="text-xs text-app-muted font-mono">{suplemento.codigo}</p>
        </div>

        {/* Descrição */}
        {suplemento.descricao && (
          <p className="text-sm text-app-muted line-clamp-2 leading-relaxed">
            {suplemento.descricao}
          </p>
        )}

        {/* Tags */}
        {suplemento.tags && suplemento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suplemento.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
            {suplemento.tags.length > 3 && (
              <Badge color="gray" size="sm">
                +{suplemento.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Autor e status (apenas não-admin vê autor) */}
        {!isAdmin && (
          <div className="flex items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border">
            <span>{suplemento.autor ? `Por ${suplemento.autor}` : 'Oficial'}</span>
            <Badge color={STATUS_COLOR[suplemento.status]} size="sm">
              {suplemento.status}
            </Badge>
          </div>
        )}
      </div>

      {/* ✅ DEBUG 3: Ações */}
      {(() => {
        console.log('🔍 [CARD] Renderizando ações, isAdmin:', isAdmin);
        return (
          <div className="mt-4 pt-4 border-t border-app-border space-y-2">
            {isAdmin ? (
              <>
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

                <div className="flex gap-2">
                  {suplemento.status === 'PUBLICADO' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={onDesativar}
                      disabled={processando}
                    >
                      <Icon name="archive" className="w-4 h-4 mr-2" />
                      Arquivar
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-app-danger hover:bg-app-danger/10"
                    onClick={onDelete}
                    disabled={processando}
                  >
                    {processando ? (
                      <Icon name="loading" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon name="delete" className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {podeAtivar && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={onAtivar}
                    disabled={processando}
                  >
                    {processando ? (
                      <>
                        <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      <>
                        <Icon name="check" className="w-4 h-4 mr-2" />
                        Ativar Suplemento
                      </>
                    )}
                  </Button>
                )}

                {podeDesativar && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={onDesativar}
                    disabled={processando}
                  >
                    {processando ? (
                      <>
                        <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                        Desativando...
                      </>
                    ) : (
                      <>
                        <Icon name="close" className="w-4 h-4 mr-2" />
                        Desativar
                      </>
                    )}
                  </Button>
                )}

                {!podeAtivar && !podeDesativar && (
                  <div className="text-center text-sm text-app-muted py-2">
                    {suplemento.status === 'RASCUNHO' && 'Em desenvolvimento'}
                    {suplemento.status === 'ARQUIVADO' && 'Arquivado'}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}
    </Card>
  );
}
