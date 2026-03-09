'use client';

import { useMemo, useState } from 'react';

import type { HomebrewResumo } from '@/lib/api/homebrews';
import type { SuplementoCatalogo } from '@/lib/api/suplementos';
import {
  type FontesConteudoSelecionadas,
  normalizarFontesConteudoSelecionadas,
} from '@/lib/utils/fontes-conteudo';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type FontesConteudoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selecao: FontesConteudoSelecionadas) => void;
  suplementos: SuplementoCatalogo[];
  homebrews: HomebrewResumo[];
  selecaoAtual: FontesConteudoSelecionadas;
};

function ordenarPorNome<T extends { nome: string }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function FontesConteudoModal({
  isOpen,
  onClose,
  onConfirm,
  suplementos,
  homebrews,
  selecaoAtual,
}: FontesConteudoModalProps) {
  const selecaoInicial = normalizarFontesConteudoSelecionadas(selecaoAtual);

  const [busca, setBusca] = useState('');
  const [suplementoIdsSelecionados, setSuplementoIdsSelecionados] = useState<number[]>(
    selecaoInicial.suplementoIds,
  );
  const [homebrewIdsSelecionados, setHomebrewIdsSelecionados] = useState<number[]>(
    selecaoInicial.homebrewIds,
  );

  const buscaNormalizada = busca.trim().toLowerCase();

  const suplementosFiltrados = useMemo(() => {
    const ordenados = ordenarPorNome(suplementos);
    if (!buscaNormalizada) return ordenados;

    return ordenados.filter((suplemento) => {
      return (
        suplemento.nome.toLowerCase().includes(buscaNormalizada) ||
        suplemento.codigo.toLowerCase().includes(buscaNormalizada)
      );
    });
  }, [suplementos, buscaNormalizada]);

  const homebrewsFiltrados = useMemo(() => {
    const ordenados = ordenarPorNome(homebrews);
    if (!buscaNormalizada) return ordenados;

    return ordenados.filter((homebrew) => {
      return (
        homebrew.nome.toLowerCase().includes(buscaNormalizada) ||
        homebrew.codigo.toLowerCase().includes(buscaNormalizada) ||
        homebrew.tipo.toLowerCase().includes(buscaNormalizada)
      );
    });
  }, [homebrews, buscaNormalizada]);

  function toggleSuplemento(suplementoId: number, checked: boolean) {
    setSuplementoIdsSelecionados((atual) => {
      if (checked) return [...new Set([...atual, suplementoId])];
      return atual.filter((id) => id !== suplementoId);
    });
  }

  function toggleHomebrew(homebrewId: number, checked: boolean) {
    setHomebrewIdsSelecionados((atual) => {
      if (checked) return [...new Set([...atual, homebrewId])];
      return atual.filter((id) => id !== homebrewId);
    });
  }

  function handleConfirmar() {
    onConfirm(
      normalizarFontesConteudoSelecionadas({
        suplementoIds: suplementoIdsSelecionados,
        homebrewIds: homebrewIdsSelecionados,
      }),
    );
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fontes de conteudo para criacao"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            <Icon name="check" className="w-4 h-4 mr-2" />
            Aplicar fontes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-app-border bg-app-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-app-fg">Sistema base</p>
              <p className="text-xs text-app-muted">
                Sempre habilitado para todos os personagens.
              </p>
            </div>
            <Badge color="green" size="sm">
              Ativo fixo
            </Badge>
          </div>
        </div>

        <Input
          icon="search"
          placeholder="Buscar por nome, codigo ou tipo..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-app-border bg-app-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-fg">Suplementos oficiais</h3>
              <Badge color="blue" size="sm">
                {suplementoIdsSelecionados.length} selecionado(s)
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {suplementosFiltrados.length === 0 ? (
                <p className="text-xs text-app-muted">
                  Nenhum suplemento ativo disponivel para selecao.
                </p>
              ) : (
                suplementosFiltrados.map((suplemento) => {
                  const checked = suplementoIdsSelecionados.includes(suplemento.id);
                  return (
                    <div
                      key={suplemento.id}
                      className={`rounded-md border p-2 transition-colors ${
                        checked
                          ? 'border-app-primary/40 bg-app-primary/5'
                          : 'border-app-border bg-app-surface'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => toggleSuplemento(suplemento.id, event.target.checked)}
                        label={
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-app-fg">{suplemento.nome}</p>
                            <p className="text-xs text-app-muted">
                              {suplemento.codigo} - v{suplemento.versao}
                            </p>
                          </div>
                        }
                        className="w-full items-start"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-app-border bg-app-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-fg">Homebrews acessiveis</h3>
              <Badge color="purple" size="sm">
                {homebrewIdsSelecionados.length} selecionado(s)
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {homebrewsFiltrados.length === 0 ? (
                <p className="text-xs text-app-muted">
                  Nenhuma homebrew disponivel para selecao.
                </p>
              ) : (
                homebrewsFiltrados.map((homebrew) => {
                  const checked = homebrewIdsSelecionados.includes(homebrew.id);
                  return (
                    <div
                      key={homebrew.id}
                      className={`rounded-md border p-2 transition-colors ${
                        checked
                          ? 'border-app-secondary/40 bg-app-secondary/10'
                          : 'border-app-border bg-app-surface'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => toggleHomebrew(homebrew.id, event.target.checked)}
                        label={
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-app-fg">{homebrew.nome}</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge color="purple" size="sm">
                                {homebrew.tipo}
                              </Badge>
                              <span className="text-xs text-app-muted">{homebrew.codigo}</span>
                            </div>
                          </div>
                        }
                        className="w-full items-start"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="rounded-lg border border-app-border bg-app-surface p-3 text-xs text-app-muted">
          O sistema base permanece ativo sempre. Selecione suplementos e homebrews para filtrar as
          opcoes exibidas durante a criacao do personagem.
        </div>
      </div>
    </Modal>
  );
}

