'use client';

import { useMemo, useState } from 'react';

import type { HomebrewGrupoResumo, HomebrewResumo } from '@/lib/api/homebrews';
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
  gruposHomebrew: HomebrewGrupoResumo[];
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
  gruposHomebrew,
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
  const [homebrewGrupoIdsSelecionados, setHomebrewGrupoIdsSelecionados] = useState<number[]>(
    selecaoInicial.homebrewGrupoIds,
  );

  const buscaNormalizada = busca.trim().toLowerCase();
  const totalSelecionados =
    suplementoIdsSelecionados.length +
    homebrewIdsSelecionados.length +
    homebrewGrupoIdsSelecionados.length;
  const possuiBusca = buscaNormalizada.length > 0;

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

  const gruposFiltrados = useMemo(() => {
    const ordenados = ordenarPorNome(gruposHomebrew);
    if (!buscaNormalizada) return ordenados;

    return ordenados.filter((grupo) => {
      return (
        grupo.nome.toLowerCase().includes(buscaNormalizada) ||
        (grupo.descricao ?? '').toLowerCase().includes(buscaNormalizada)
      );
    });
  }, [gruposHomebrew, buscaNormalizada]);

  const resumoSelecao = totalSelecionados
    ? `${suplementoIdsSelecionados.length} suplemento(s) • ${homebrewGrupoIdsSelecionados.length} grupo(s) • ${homebrewIdsSelecionados.length} homebrew(s)`
    : 'Nenhuma fonte adicional selecionada';

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

  function toggleGrupoHomebrew(grupoId: number, checked: boolean) {
    setHomebrewGrupoIdsSelecionados((atual) => {
      if (checked) return [...new Set([...atual, grupoId])];
      return atual.filter((id) => id !== grupoId);
    });
  }

  function handleConfirmar() {
    onConfirm(
      normalizarFontesConteudoSelecionadas({
        suplementoIds: suplementoIdsSelecionados,
        homebrewIds: homebrewIdsSelecionados,
        homebrewGrupoIds: homebrewGrupoIdsSelecionados,
      }),
    );
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fontes de conteúdo da criação"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            <Icon name="check" className="w-4 h-4 mr-2" />
            {totalSelecionados > 0
              ? `Aplicar seleção (${totalSelecionados})`
              : 'Aplicar seleção'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-app-muted">
            Escolha quais suplementos e homebrews ficam disponíveis durante a
            criação do personagem.
          </p>
          <div className="rounded-lg border border-app-border bg-app-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
                  <Icon name="book" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-app-fg">Sistema base</p>
                  <p className="text-xs text-app-muted">
                    Sempre incluído na criação.
                  </p>
                </div>
              </div>
              <Badge color="green" size="sm">
                Sempre ativo
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              icon="search"
              placeholder="Buscar suplemento ou homebrew..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Badge color={totalSelecionados ? 'blue' : 'gray'} size="sm">
              {resumoSelecao}
            </Badge>
            {buscaNormalizada ? (
              <Button size="xs" variant="ghost" onClick={() => setBusca('')}>
                Limpar busca
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-lg border border-app-border bg-app-card p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
                  <Icon name="book" className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-app-fg">
                    Suplementos oficiais
                  </h3>
                  <p className="text-xs text-app-muted">
                    Conteúdo publicado e validado no catálogo.
                  </p>
                </div>
              </div>
              <Badge color="blue" size="sm">
                {suplementoIdsSelecionados.length} selecionado(s)
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {suplementosFiltrados.length === 0 ? (
                <p className="text-xs text-app-muted">
                  {possuiBusca
                    ? 'Nenhum suplemento corresponde à busca atual.'
                    : 'Nenhum suplemento disponível no momento.'}
                </p>
              ) : (
                suplementosFiltrados.map((suplemento) => {
                  const checked = suplementoIdsSelecionados.includes(suplemento.id);
                  return (
                    <div
                      key={suplemento.id}
                      className={`rounded-md border p-3 transition-colors ${
                        checked
                          ? 'border-app-primary/50 bg-app-primary/10 shadow-sm'
                          : 'border-app-border bg-app-surface hover:border-app-primary/30 hover:bg-app-primary/5'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => toggleSuplemento(suplemento.id, event.target.checked)}
                        label={
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-app-fg">
                              {suplemento.nome}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
                              <span>{suplemento.codigo}</span>
                              <Badge color="gray" size="sm">
                                v{suplemento.versao}
                              </Badge>
                              {checked ? (
                                <Badge color="green" size="sm">
                                  Incluído
                                </Badge>
                              ) : null}
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

          <section className="rounded-lg border border-app-border bg-app-card p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-app-primary/10 text-app-primary">
                  <Icon name="list" className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-app-fg">
                    Grupos de homebrew
                  </h3>
                  <p className="text-xs text-app-muted">
                    Pacotes privados que expandem varias homebrews publicadas.
                  </p>
                </div>
              </div>
              <Badge color="blue" size="sm">
                {homebrewGrupoIdsSelecionados.length} selecionado(s)
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {gruposFiltrados.length === 0 ? (
                <p className="text-xs text-app-muted">
                  {possuiBusca
                    ? 'Nenhum grupo corresponde a busca atual.'
                    : 'Nenhum grupo disponivel no momento.'}
                </p>
              ) : (
                gruposFiltrados.map((grupo) => {
                  const checked = homebrewGrupoIdsSelecionados.includes(grupo.id);
                  return (
                    <div
                      key={grupo.id}
                      className={`rounded-md border p-3 transition-colors ${
                        checked
                          ? 'border-app-primary/50 bg-app-primary/10 shadow-sm'
                          : 'border-app-border bg-app-surface hover:border-app-primary/30 hover:bg-app-primary/5'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          toggleGrupoHomebrew(grupo.id, event.target.checked)
                        }
                        label={
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-app-fg">
                              {grupo.nome}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
                              <Badge color="blue" size="sm">
                                {grupo.quantidadeItens} item(ns)
                              </Badge>
                              {checked ? (
                                <Badge color="green" size="sm">
                                  Ativo na criacao
                                </Badge>
                              ) : null}
                            </div>
                            {grupo.descricao ? (
                              <p className="text-xs text-app-muted">{grupo.descricao}</p>
                            ) : null}
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
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-app-secondary/15 text-app-secondary">
                  <Icon name="sparkles" className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-app-fg">
                    Homebrews disponíveis
                  </h3>
                  <p className="text-xs text-app-muted">
                    Conteúdo personalizado acessível na sua conta.
                  </p>
                </div>
              </div>
              <Badge color="purple" size="sm">
                {homebrewIdsSelecionados.length} selecionado(s)
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {homebrewsFiltrados.length === 0 ? (
                <p className="text-xs text-app-muted">
                  {possuiBusca
                    ? 'Nenhuma homebrew corresponde à busca atual.'
                    : 'Nenhuma homebrew disponível no momento.'}
                </p>
              ) : (
                homebrewsFiltrados.map((homebrew) => {
                  const checked = homebrewIdsSelecionados.includes(homebrew.id);
                  return (
                    <div
                      key={homebrew.id}
                      className={`rounded-md border p-3 transition-colors ${
                        checked
                          ? 'border-app-secondary/50 bg-app-secondary/15 shadow-sm'
                          : 'border-app-border bg-app-surface hover:border-app-secondary/40 hover:bg-app-secondary/10'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => toggleHomebrew(homebrew.id, event.target.checked)}
                        label={
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-app-fg">{homebrew.nome}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
                              <Badge color="purple" size="sm">
                                {homebrew.tipo}
                              </Badge>
                              <span>{homebrew.codigo}</span>
                              {checked ? (
                                <Badge color="green" size="sm">
                                  Ativo na criação
                                </Badge>
                              ) : null}
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
          O sistema base continua ativo. As seleções acima apenas ampliam ou filtram o conteúdo
          disponível na criação.
        </div>
      </div>
    </Modal>
  );
}
