'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { CompendioSearch } from './CompendioSearch';
import type { CompendioLivro } from '@/lib/utils/compendio';
import {
  getCompendioArticleHref,
  getCompendioBookHref,
} from '@/lib/utils/compendio-books';
import {
  shouldCollapseSubcategoria,
  stripCompendioDisplayNumber,
} from '@/lib/utils/compendio-display';

type ReaderSidebarProps = {
  livro: CompendioLivro;
  activeCategoriaCodigo?: string;
  activeSubcategoriaCodigo?: string;
  activeArtigoCodigo?: string;
};

function iconName(icon: string | null): IconName {
  const allowed: IconName[] = [
    'rules',
    'book',
    'dice',
    'technique',
    'swords',
    'story',
    'sparkles',
    'training',
    'inventory',
    'tools',
  ];

  return allowed.includes(icon as IconName) ? (icon as IconName) : 'book';
}

export function ReaderSidebar({
  livro,
  activeCategoriaCodigo,
  activeSubcategoriaCodigo,
  activeArtigoCodigo,
}: ReaderSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategorias, setExpandedCategorias] = useState<string[]>(
    activeCategoriaCodigo ? [activeCategoriaCodigo] : [livro.categorias?.[0]?.codigo ?? ''],
  );

  const categorias = livro.categorias ?? [];
  const expandedCategoriaSet = useMemo(() => {
    return new Set(
      [activeCategoriaCodigo, ...expandedCategorias].filter(Boolean) as string[],
    );
  }, [activeCategoriaCodigo, expandedCategorias]);

  const toggleCategoria = (codigo: string) => {
    setExpandedCategorias((prev) =>
      prev.includes(codigo)
        ? prev.filter((item) => item !== codigo)
        : [...prev, codigo],
    );
  };

  const content = (
    <div className="flex h-full flex-col bg-app-surface">
      <div className="border-b border-app-border p-5">
        <Link
          href={getCompendioBookHref(livro.codigo)}
          className="inline-flex items-center gap-3 text-app-fg"
          onClick={() => setMobileOpen(false)}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-app-border bg-app-primary/10 text-app-primary"
            style={livro.cor ? { color: livro.cor } : undefined}
          >
            <Icon name={iconName(livro.icone)} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{livro.titulo}</span>
            <span className="block text-xs text-app-muted">Compêndio de regras</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-app-border p-4">
        <CompendioSearch
          livroCodigo={livro.codigo}
          showSubmit={false}
          inputLabel="Buscar no conteúdo deste livro"
          placeholder="Termos, siglas e regras..."
        />
        <p className="mt-2 text-xs text-app-muted">
          A busca encontra também trechos dentro dos artigos.
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {categorias.map((categoria) => {
            const expanded = expandedCategoriaSet.has(categoria.codigo);
            const activeCategoria = activeCategoriaCodigo === categoria.codigo;

            return (
              <div key={categoria.id}>
                <button
                  type="button"
                  onClick={() => toggleCategoria(categoria.codigo)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeCategoria
                      ? 'bg-app-primary/10 text-app-primary'
                      : 'text-app-fg hover:bg-app-bg'
                  }`}
                >
                  <Icon name={iconName(categoria.icone)} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {stripCompendioDisplayNumber(categoria.nome)}
                  </span>
                  <Icon
                    name="chevron-right"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      expanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expanded ? (
                  <div className="ml-5 mt-1 space-y-1 border-l border-app-border pl-3">
                    {(categoria.subcategorias ?? []).map((subcategoria) => {
                      const collapsed = shouldCollapseSubcategoria(subcategoria);

                      if (collapsed) {
                        const artigo = subcategoria.artigos[0];
                        const href = getCompendioArticleHref(
                          livro.codigo,
                          categoria.codigo,
                          subcategoria.codigo,
                          artigo.codigo,
                        );
                        const active = activeArtigoCodigo === artigo.codigo;

                        return (
                          <Link
                            key={subcategoria.id}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={active ? 'page' : undefined}
                            className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                              active
                                ? 'bg-app-primary/10 font-medium text-app-primary'
                                : 'text-app-muted hover:bg-app-bg hover:text-app-fg'
                            }`}
                          >
                            {stripCompendioDisplayNumber(artigo.titulo)}
                          </Link>
                        );
                      }

                      return (
                        <div key={subcategoria.id} className="space-y-0.5">
                          <p
                            className={`px-2 py-1 text-xs font-semibold ${
                              activeSubcategoriaCodigo === subcategoria.codigo
                                ? 'text-app-primary'
                                : 'text-app-muted'
                            }`}
                          >
                            {stripCompendioDisplayNumber(subcategoria.nome)}
                          </p>

                          {(subcategoria.artigos ?? []).map((artigo) => {
                            const href = getCompendioArticleHref(
                              livro.codigo,
                              categoria.codigo,
                              subcategoria.codigo,
                              artigo.codigo,
                            );
                            const active = activeArtigoCodigo === artigo.codigo;

                            return (
                              <Link
                                key={artigo.id}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                aria-current={active ? 'page' : undefined}
                                className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                                  active
                                    ? 'bg-app-primary/10 font-medium text-app-primary'
                                    : 'text-app-muted hover:bg-app-bg hover:text-app-fg'
                                }`}
                              >
                                {stripCompendioDisplayNumber(artigo.titulo)}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-20 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-app-border bg-app-surface text-app-fg shadow-lg lg:hidden"
        aria-label="Abrir índice do compêndio"
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-80 border-r border-app-border bg-app-surface lg:block">
        {content}
      </aside>

      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ariaLabel="Índice do compêndio"
      >
        <aside className="relative h-full w-[min(20rem,86vw)] border-r border-app-border bg-app-surface shadow-xl">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-app-muted hover:bg-app-bg hover:text-app-fg"
            aria-label="Fechar índice"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
          {content}
        </aside>
      </MobileDrawer>
    </>
  );
}
