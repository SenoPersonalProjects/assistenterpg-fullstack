'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { StatusPublicacao, TipoHomebrewConteudo } from '@/lib/types/homebrew-enums';
import type { HomebrewResumo } from '@/lib/api/homebrews';
import type { FontesConteudoSelecionadas } from '@/lib/utils/fontes-conteudo';

type Props = {
  homebrews: HomebrewResumo[];
  selecaoAtual: FontesConteudoSelecionadas;
  onHabilitarHomebrew: (homebrewId: number) => void;
};

export function FontesInventarioHomebrewPanel({
  homebrews,
  selecaoAtual,
  onHabilitarHomebrew,
}: Props) {
  const homebrewsEquipamento = useMemo(
    () =>
      homebrews
        .filter(
          (homebrew) =>
            homebrew.tipo === TipoHomebrewConteudo.EQUIPAMENTO &&
            homebrew.status === StatusPublicacao.PUBLICADO,
        )
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [homebrews],
  );

  const idsHabilitados = useMemo(
    () => new Set(selecaoAtual.homebrewIds),
    [selecaoAtual.homebrewIds],
  );

  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-app-fg">Fontes de itens homebrew</p>
          <p className="text-xs text-app-muted">
            Habilite equipamentos homebrew publicados para usar nesta edição de inventário.
          </p>
        </div>
        <Badge color="blue" size="sm">
          Apenas adicionar
        </Badge>
      </div>

      {homebrewsEquipamento.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="item"
            title="Nenhum equipamento homebrew publicado"
            description="Crie ou publique um equipamento homebrew para habilitar aqui."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {homebrewsEquipamento.map((homebrew) => {
            const habilitado = idsHabilitados.has(homebrew.id);

            return (
              <div
                key={homebrew.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-app-border bg-app-bg p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-app-fg">{homebrew.nome}</p>
                  <p className="truncate text-xs text-app-muted">
                    {homebrew.descricao || 'Equipamento homebrew publicado'}
                  </p>
                </div>

                {habilitado ? (
                  <Badge color="green" size="sm">
                    <Icon name="check" className="mr-1 h-3 w-3" />
                    Habilitado
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onHabilitarHomebrew(homebrew.id)}
                  >
                    Habilitar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-app-muted">
        Para remover fontes ou habilitar outros tipos de homebrew, use a edição completa da ficha.
      </p>
    </section>
  );
}
