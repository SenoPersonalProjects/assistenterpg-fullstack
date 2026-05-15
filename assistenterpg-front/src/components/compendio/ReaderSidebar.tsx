'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { CompendioCategoria, CompendioLivro } from '@/lib/utils/compendio';
import {
  getCompendioArticleHref,
  getCompendioBookHref,
} from '@/lib/utils/compendio-books';

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

function categoriaMatches(categoria: CompendioCategoria, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();

  if (categoria.nome.toLowerCase().includes(q)) return true;
  if (categoria.descricao?.toLowerCase().includes(q)) return true;

  return (categoria.subcategorias ?? []).some((subcategoria) => {
    if (subcategoria.nome.toLowerCase().includes(q)) return true;
    if (subcategoria.descricao?.toLowerCase().includes(q)) return true;

    return (subcategoria.artigos ?? []).some((artigo) => {
      return (
        artigo.titulo.toLowerCase().includes(q) ||
        artigo.resumo?.toLowerCase().includes(q)
      );
    });
  });
}

export function ReaderSidebar({
  livro,
  activeCategoriaCodigo,
  activeSubcategoriaCodigo,
  activeArtigoCodigo,
}: ReaderSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expandedCategorias, setExpandedCategorias] = useState<string[]>(
    activeCategoriaCodigo ? [activeCategoriaCodigo] : [livro.categorias?.[0]?.codigo ?? ''],
  );

  useEffect(() => {
    if (!activeCategoriaCodigo) return;
    setExpandedCategorias((prev) =>
      prev.includes(activeCategoriaCodigo) ? prev : [...prev, activeCategoriaCodigo],
    );
  }, [activeCategoriaCodigo]);

  const categorias = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (livro.categorias ?? []).filter((categoria) =>
      categoriaMatches(categoria, normalizedQuery),
    );
  }, [livro.categorias, query]);

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
            <span className="block text-xs text-app-muted">Compendio de regras</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-app-border p-4">
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar neste livro..."
            className="w-full rounded-lg border border-app-border bg-app-bg py-2 pl-9 pr-3 text-sm text-app-fg placeholder:text-app-muted focus:border-app-primary focus:outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {categorias.map((categoria) => {
            const expanded = query.trim() || expandedCategorias.includes(categoria.codigo);
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
                  <span className="min-w-0 flex-1 truncate">{categoria.nome}</span>
                  <Icon
                    name="chevron-right"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      expanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expanded ? (
                  <div className="ml-5 mt-1 space-y-1 border-l border-app-border pl-3">
                    {(categoria.subcategorias ?? []).map((subcategoria) => (
                      <div key={subcategoria.id} className="space-y-0.5">
                        <p
                          className={`px-2 py-1 text-xs font-semibold ${
                            activeSubcategoriaCodigo === subcategoria.codigo
                              ? 'text-app-primary'
                              : 'text-app-muted'
                          }`}
                        >
                          {subcategoria.nome}
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
                              {artigo.titulo}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
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
        aria-label="Abrir indice do compendio"
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-80 border-r border-app-border bg-app-surface lg:block">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar indice"
          />
          <aside className="absolute inset-y-0 left-0 w-[min(20rem,86vw)] border-r border-app-border bg-app-surface shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-app-muted hover:bg-app-bg hover:text-app-fg"
              aria-label="Fechar indice"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
