'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { CompendioAdminExportButton } from '@/components/compendio/CompendioAdminExportButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiAdminAtualizarArtigo,
  apiAdminAtualizarCategoria,
  apiAdminAtualizarLivro,
  apiAdminAtualizarSubcategoria,
  apiAdminCriarArtigo,
  apiAdminCriarCategoria,
  apiAdminCriarLivro,
  apiAdminCriarSubcategoria,
  apiAdminListarLivros,
  apiAdminReordenarCompendio,
  type CompendioArtigoCompleto,
  type CompendioArtigoResumido,
  type CompendioCategoria,
  type CompendioLivro,
  type CompendioStatusPublicacao,
  type CompendioSubcategoriaComArtigo,
} from '@/lib/utils/compendio';

type Selection =
  | { type: 'book'; mode: 'create' }
  | { type: 'book'; mode: 'edit'; id: number }
  | { type: 'category'; mode: 'create'; livroId: number }
  | { type: 'category'; mode: 'edit'; id: number }
  | { type: 'subcategory'; mode: 'create'; categoriaId: number }
  | { type: 'subcategory'; mode: 'edit'; id: number }
  | { type: 'article'; mode: 'create'; subcategoriaId: number }
  | { type: 'article'; mode: 'edit'; id: number };

type LivroForm = {
  codigo: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: string;
  status: CompendioStatusPublicacao;
  suplementoId: string;
};

type CategoriaForm = {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: string;
  ativo: boolean;
};

type SubcategoriaForm = {
  codigo: string;
  nome: string;
  descricao: string;
  ordem: string;
  ativo: boolean;
};

type ArtigoForm = {
  codigo: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  ordem: string;
  tags: string;
  palavrasChave: string;
  nivelDificuldade: '' | 'iniciante' | 'intermediario' | 'avancado';
  artigosRelacionados: string;
  ativo: boolean;
  destaque: boolean;
};

const SAFE_TEXT_BYTES = 50_000;

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function statusColor(
  status: CompendioStatusPublicacao,
): 'green' | 'gray' | 'yellow' {
  if (status === 'PUBLICADO') return 'green';
  if (status === 'ARQUIVADO') return 'gray';
  return 'yellow';
}

function createLivroForm(livro?: CompendioLivro): LivroForm {
  return {
    codigo: livro?.codigo ?? '',
    titulo: livro?.titulo ?? '',
    descricao: livro?.descricao ?? '',
    icone: livro?.icone ?? 'book',
    cor: livro?.cor ?? '#7c5cfc',
    ordem: String(livro?.ordem ?? 0),
    status: livro?.status ?? 'RASCUNHO',
    suplementoId: livro?.suplementoId ? String(livro.suplementoId) : '',
  };
}

function createCategoriaForm(categoria?: CompendioCategoria): CategoriaForm {
  return {
    codigo: categoria?.codigo ?? '',
    nome: categoria?.nome ?? '',
    descricao: categoria?.descricao ?? '',
    icone: categoria?.icone ?? 'book',
    cor: categoria?.cor ?? '',
    ordem: String(categoria?.ordem ?? 0),
    ativo: categoria?.ativo ?? true,
  };
}

function createSubcategoriaForm(
  subcategoria?: CompendioSubcategoriaComArtigo,
): SubcategoriaForm {
  return {
    codigo: subcategoria?.codigo ?? '',
    nome: subcategoria?.nome ?? '',
    descricao: subcategoria?.descricao ?? '',
    ordem: String(subcategoria?.ordem ?? 0),
    ativo: subcategoria?.ativo ?? true,
  };
}

function createArtigoForm(
  artigo?: CompendioArtigoResumido | CompendioArtigoCompleto,
): ArtigoForm {
  const completo = artigo as Partial<CompendioArtigoCompleto> | undefined;

  return {
    codigo: artigo?.codigo ?? '',
    titulo: artigo?.titulo ?? '',
    resumo: artigo?.resumo ?? '',
    conteudo: completo?.conteudo ?? '# Novo artigo\n\n',
    ordem: String(artigo?.ordem ?? 0),
    tags: Array.isArray(completo?.tags) ? completo.tags.join(', ') : '',
    palavrasChave: completo?.palavrasChave ?? '',
    nivelDificuldade:
      completo?.nivelDificuldade === 'iniciante' ||
      completo?.nivelDificuldade === 'intermediario' ||
      completo?.nivelDificuldade === 'avancado'
        ? completo.nivelDificuldade
        : '',
    artigosRelacionados: Array.isArray(completo?.artigosRelacionados)
      ? completo.artigosRelacionados.join(', ')
      : '',
    ativo: artigo?.ativo ?? true,
    destaque: artigo?.destaque ?? false,
  };
}

function isSameSelection(a: Selection | null, b: Selection): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getSelectionFromSearchParams(
  livros: CompendioLivro[],
  params: { get(name: string): string | null },
): Selection | null {
  const livroId = Number(params.get('livro'));
  const categoriaId = Number(params.get('categoria'));
  const subcategoriaId = Number(params.get('subcategoria'));
  const artigoId = Number(params.get('artigo'));

  if (Number.isFinite(artigoId) && artigoId > 0) {
    for (const livro of livros) {
      for (const categoria of livro.categorias) {
        for (const subcategoria of categoria.subcategorias) {
          if (subcategoria.artigos.some((artigo) => artigo.id === artigoId)) {
            return { type: 'article', mode: 'edit', id: artigoId };
          }
        }
      }
    }
  }

  if (Number.isFinite(subcategoriaId) && subcategoriaId > 0) {
    return { type: 'subcategory', mode: 'edit', id: subcategoriaId };
  }

  if (Number.isFinite(categoriaId) && categoriaId > 0) {
    return { type: 'category', mode: 'edit', id: categoriaId };
  }

  if (Number.isFinite(livroId) && livroId > 0) {
    return { type: 'book', mode: 'edit', id: livroId };
  }

  return null;
}

export function CompendioAdminManager() {
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [livros, setLivros] = useState<CompendioLivro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'todos' | CompendioStatusPublicacao>('todos');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [preview, setPreview] = useState(false);

  const [livroForm, setLivroForm] = useState<LivroForm>(() => createLivroForm());
  const [categoriaForm, setCategoriaForm] = useState<CategoriaForm>(() =>
    createCategoriaForm(),
  );
  const [subcategoriaForm, setSubcategoriaForm] = useState<SubcategoriaForm>(() =>
    createSubcategoriaForm(),
  );
  const [artigoForm, setArtigoForm] = useState<ArtigoForm>(() =>
    createArtigoForm(),
  );
  const initialSnapshot = useRef('');

  const isAdmin = usuario?.role === 'ADMIN';

  const loadLivros = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiAdminListarLivros();
      setLivros(data);
      const requested = getSelectionFromSearchParams(data, searchParams);
      setSelection((current) =>
        current ??
        requested ??
        (data[0] ? { type: 'book', mode: 'edit', id: data[0].id } : null),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar o compêndio.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    if (isAdmin) {
      void loadLivros();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAdmin, loadLivros]);

  const lookup = useMemo(() => {
    const categorias = new Map<number, CompendioCategoria>();
    const subcategorias = new Map<number, CompendioSubcategoriaComArtigo>();
    const artigos = new Map<number, CompendioArtigoResumido>();

    for (const livro of livros) {
      for (const categoria of livro.categorias ?? []) {
        categorias.set(categoria.id, categoria);
        for (const subcategoria of categoria.subcategorias ?? []) {
          subcategorias.set(subcategoria.id, subcategoria);
          for (const artigo of subcategoria.artigos ?? []) {
            artigos.set(artigo.id, artigo);
          }
        }
      }
    }

    return { categorias, subcategorias, artigos };
  }, [livros]);

  const statsItems: StatsStripItem[] = [
    {
      id: 'livros',
      label: 'Livros',
      value: livros.length,
      icon: 'book',
    },
    {
      id: 'categorias',
      label: 'Capítulos',
      value: lookup.categorias.size,
      icon: 'folder',
    },
    {
      id: 'topicos',
      label: 'Tópicos',
      value: lookup.subcategorias.size,
      icon: 'layers',
    },
    {
      id: 'artigos',
      label: 'Artigos',
      value: lookup.artigos.size,
      icon: 'document',
      tone: 'primary',
    },
  ];

  const currentFormSnapshot = useMemo(() => {
    if (!selection) return '';
    if (selection.type === 'book') return JSON.stringify(livroForm);
    if (selection.type === 'category') return JSON.stringify(categoriaForm);
    if (selection.type === 'subcategory') return JSON.stringify(subcategoriaForm);
    return JSON.stringify(artigoForm);
  }, [artigoForm, categoriaForm, livroForm, selection, subcategoriaForm]);

  const dirty = Boolean(selection && initialSnapshot.current !== currentFormSnapshot);

  useEffect(() => {
    if (!selection) return;

    if (selection.type === 'book') {
      const item =
        selection.mode === 'edit'
          ? livros.find((livro) => livro.id === selection.id)
          : undefined;
      const next = createLivroForm(item);
      setLivroForm(next);
      initialSnapshot.current = JSON.stringify(next);
      return;
    }

    if (selection.type === 'category') {
      const item =
        selection.mode === 'edit' ? lookup.categorias.get(selection.id) : undefined;
      const next = createCategoriaForm(item);
      setCategoriaForm(next);
      initialSnapshot.current = JSON.stringify(next);
      return;
    }

    if (selection.type === 'subcategory') {
      const item =
        selection.mode === 'edit'
          ? lookup.subcategorias.get(selection.id)
          : undefined;
      const next = createSubcategoriaForm(item);
      setSubcategoriaForm(next);
      initialSnapshot.current = JSON.stringify(next);
      return;
    }

    const item =
      selection.mode === 'edit' ? lookup.artigos.get(selection.id) : undefined;
    const next = createArtigoForm(item);
    setArtigoForm(next);
    initialSnapshot.current = JSON.stringify(next);
  }, [livros, lookup, selection]);

  const selectItem = (next: Selection) => {
    if (isSameSelection(selection, next)) return;
    if (dirty && !window.confirm('Existem alterações não salvas. Descartar?')) {
      return;
    }
    setPreview(false);
    setSelection(next);
  };

  const filteredLivros = useMemo(() => {
    const q = query.trim().toLowerCase();

    return livros.filter((livro) => {
      if (statusFilter !== 'todos' && livro.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [
        livro.titulo,
        livro.codigo,
        livro.descricao,
        ...livro.categorias.flatMap((categoria) => [
          categoria.nome,
          categoria.codigo,
          ...categoria.subcategorias.flatMap((subcategoria) => [
            subcategoria.nome,
            subcategoria.codigo,
            ...subcategoria.artigos.flatMap((artigo) => [
              artigo.titulo,
              artigo.codigo,
              artigo.resumo,
            ]),
          ]),
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [livros, query, statusFilter]);

  const getSiblingIds = (): { tipo: 'livro' | 'categoria' | 'subcategoria' | 'artigo'; ids: number[] } | null => {
    if (!selection || selection.mode === 'create') return null;
    if (selection.type === 'book') {
      return { tipo: 'livro', ids: livros.map((livro) => livro.id) };
    }

    for (const livro of livros) {
      if (selection.type === 'category') {
        const ids = livro.categorias.map((categoria) => categoria.id);
        if (ids.includes(selection.id)) return { tipo: 'categoria', ids };
      }

      for (const categoria of livro.categorias) {
        if (selection.type === 'subcategory') {
          const ids = categoria.subcategorias.map((subcategoria) => subcategoria.id);
          if (ids.includes(selection.id)) return { tipo: 'subcategoria', ids };
        }

        for (const subcategoria of categoria.subcategorias) {
          if (selection.type === 'article') {
            const ids = subcategoria.artigos.map((artigo) => artigo.id);
            if (ids.includes(selection.id)) return { tipo: 'artigo', ids };
          }
        }
      }
    }

    return null;
  };

  const moveSelected = async (direction: -1 | 1) => {
    const siblings = getSiblingIds();
    if (!selection || selection.mode === 'create' || !siblings) return;

    const currentIndex = siblings.ids.indexOf(selection.id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= siblings.ids.length) return;

    const ids = [...siblings.ids];
    const [current] = ids.splice(currentIndex, 1);
    ids.splice(nextIndex, 0, current);

    setSaving(true);
    try {
      await apiAdminReordenarCompendio({ tipo: siblings.tipo, ids });
      showToast('Ordem atualizada.', 'success');
      await loadLivros();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível reordenar.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!selection) return;
    setSaving(true);

    try {
      if (selection.type === 'book') {
        if (!livroForm.titulo.trim()) {
          showToast('Título do livro é obrigatório.', 'warning');
          return;
        }

        const payload = {
          codigo: optionalString(livroForm.codigo),
          titulo: livroForm.titulo.trim(),
          descricao: optionalString(livroForm.descricao),
          icone: optionalString(livroForm.icone),
          cor: optionalString(livroForm.cor),
          ordem: optionalNumber(livroForm.ordem),
          status: livroForm.status,
          suplementoId: optionalNumber(livroForm.suplementoId),
        };

        const saved =
          selection.mode === 'create'
            ? await apiAdminCriarLivro(payload)
            : await apiAdminAtualizarLivro(selection.id, payload);
        showToast('Livro salvo.', 'success');
        await loadLivros();
        setSelection({ type: 'book', mode: 'edit', id: saved.id });
        return;
      }

      if (selection.type === 'category') {
        if (!categoriaForm.nome.trim()) {
          showToast('Nome do capítulo é obrigatório.', 'warning');
          return;
        }

        const payload = {
          codigo: optionalString(categoriaForm.codigo),
          nome: categoriaForm.nome.trim(),
          descricao: optionalString(categoriaForm.descricao),
          icone: optionalString(categoriaForm.icone),
          cor: optionalString(categoriaForm.cor),
          ordem: optionalNumber(categoriaForm.ordem),
          ativo: categoriaForm.ativo,
        };

        const saved =
          selection.mode === 'create'
            ? await apiAdminCriarCategoria({
                ...payload,
                livroId: selection.livroId,
              })
            : await apiAdminAtualizarCategoria(selection.id, payload);
        showToast('Capitulo salvo.', 'success');
        await loadLivros();
        setSelection({ type: 'category', mode: 'edit', id: saved.id });
        return;
      }

      if (selection.type === 'subcategory') {
        if (!subcategoriaForm.nome.trim()) {
          showToast('Nome do tópico é obrigatório.', 'warning');
          return;
        }

        const payload = {
          codigo: optionalString(subcategoriaForm.codigo),
          nome: subcategoriaForm.nome.trim(),
          descricao: optionalString(subcategoriaForm.descricao),
          ordem: optionalNumber(subcategoriaForm.ordem),
          ativo: subcategoriaForm.ativo,
        };

        const saved =
          selection.mode === 'create'
            ? await apiAdminCriarSubcategoria({
                ...payload,
                categoriaId: selection.categoriaId,
              })
            : await apiAdminAtualizarSubcategoria(selection.id, payload);
        showToast('Topico salvo.', 'success');
        await loadLivros();
        setSelection({ type: 'subcategory', mode: 'edit', id: saved.id });
        return;
      }

      if (!artigoForm.titulo.trim() || !artigoForm.conteudo.trim()) {
        showToast('Título e conteúdo do artigo são obrigatórios.', 'warning');
        return;
      }

      const bytes = new TextEncoder().encode(artigoForm.conteudo).length;
      if (bytes > SAFE_TEXT_BYTES) {
        showToast('Conteúdo acima do limite seguro do campo Text.', 'warning');
        return;
      }

      const subcategoriaId =
        selection.mode === 'create'
          ? selection.subcategoriaId
          : findArticleParent(livros, selection.id)?.subcategoriaId;

      if (!subcategoriaId) {
        showToast('Topico do artigo não encontrado.', 'warning');
        return;
      }

      const payload = {
        codigo: optionalString(artigoForm.codigo),
        titulo: artigoForm.titulo.trim(),
        resumo: optionalString(artigoForm.resumo),
        conteudo: artigoForm.conteudo,
        subcategoriaId,
        ordem: optionalNumber(artigoForm.ordem),
        tags: splitCsv(artigoForm.tags),
        palavrasChave: optionalString(artigoForm.palavrasChave),
        nivelDificuldade: artigoForm.nivelDificuldade || undefined,
        artigosRelacionados: splitCsv(artigoForm.artigosRelacionados),
        ativo: artigoForm.ativo,
        destaque: artigoForm.destaque,
      };

      const saved =
        selection.mode === 'create'
          ? await apiAdminCriarArtigo(payload)
          : await apiAdminAtualizarArtigo(selection.id, {
              ...payload,
            });
      showToast('Artigo salvo.', 'success');
      await loadLivros();
      setSelection({ type: 'article', mode: 'edit', id: saved.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível salvar.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            variant="card"
            icon="spinner"
            title="Carregando compêndio"
            description="Buscando livros e seções para edição."
          />
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            variant="card"
            icon="lock"
            title="Acesso restrito"
            description="A administração do compêndio está disponível apenas para administradores."
          >
            <Link href="/compendio">
              <Button type="button" variant="secondary" className="mt-4">
                Voltar ao compêndio
              </Button>
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          icon="rules"
          eyebrow="Admin"
          title="Gerenciar compêndio"
          description="Edite livros, capítulos, tópicos e artigos publicados no banco."
          backHref="/compendio"
          backLabel="Compêndio"
          actions={
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => selectItem({ type: 'book', mode: 'create' })}
              >
                <Icon name="add" className="mr-2 h-4 w-4" />
                Novo livro
              </Button>
              <CompendioAdminExportButton />
            </>
          }
        />

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-0 flex-1">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar livro, tópico ou artigo..."
              icon="search"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3 text-sm font-medium text-app-fg focus:border-app-primary focus:outline-none sm:w-48"
          >
            <option value="todos">Todos os status</option>
            <option value="PUBLICADO">Publicados</option>
            <option value="RASCUNHO">Rascunhos</option>
            <option value="ARQUIVADO">Arquivados</option>
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQuery('');
              setStatusFilter('todos');
            }}
            disabled={!query.trim() && statusFilter === 'todos'}
            className="w-full sm:w-auto"
          >
            Limpar
          </Button>
        </PageToolbar>

        <header className="hidden">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
              <Icon name="rules" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-primary">
                Admin
              </p>
              <h1 className="text-3xl font-black tracking-tight text-app-fg">
                Gerenciar compêndio
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-app-muted">
                Edite livros, capítulos, tópicos e artigos publicados no banco.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => selectItem({ type: 'book', mode: 'create' })}
            >
              <Icon name="add" className="mr-2 h-4 w-4" />
              Novo livro
            </Button>
            <CompendioAdminExportButton />
            <Link href="/compendio">
              <Button type="button" variant="secondary" size="sm">
                <Icon name="back" className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-3 rounded-xl border border-white/5 bg-app-surface/45 p-4">
            <SectionHeader
              icon="book"
              title="Estrutura"
              description="Livros, capítulos, tópicos e artigos."
              count={filteredLivros.length}
            />

            <div className="hidden">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar livro, tópico ou artigo..."
                icon="search"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-fg focus:border-app-primary focus:outline-none"
              >
                <option value="todos">Todos os status</option>
                <option value="PUBLICADO">Publicados</option>
                <option value="RASCUNHO">Rascunhos</option>
                <option value="ARQUIVADO">Arquivados</option>
              </select>
            </div>

            <div className="max-h-[calc(100vh-22rem)] space-y-3 overflow-y-auto pr-1">
              {filteredLivros.length === 0 ? (
                <EmptyState
                  variant="card"
                  icon="search"
                  title="Nenhum item encontrado"
                  description="A busca ou filtro atual não encontrou livros no compêndio."
                />
              ) : (
                filteredLivros.map((livro) => (
                  <BookTreeItem
                    key={livro.id}
                    livro={livro}
                    selection={selection}
                    onSelect={selectItem}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="min-w-0 rounded-xl border border-white/5 bg-app-surface/55 p-4 lg:p-6">
            {!selection ? (
              <EmptyState
                variant="card"
                icon="edit"
                title="Selecione um item"
                description="Escolha um livro, capítulo, tópico ou artigo para editar."
              />
            ) : (
              <div className="space-y-5">
                <EditorHeader
                  selection={selection}
                  dirty={dirty}
                  saving={saving}
                  onSave={save}
                  onMoveUp={() => void moveSelected(-1)}
                  onMoveDown={() => void moveSelected(1)}
                />

                {selection.type === 'book' ? (
                  <BookEditor form={livroForm} setForm={setLivroForm} />
                ) : null}

                {selection.type === 'category' ? (
                  <CategoryEditor
                    form={categoriaForm}
                    setForm={setCategoriaForm}
                    selection={selection}
                    onAddSubcategory={(categoriaId) =>
                      selectItem({
                        type: 'subcategory',
                        mode: 'create',
                        categoriaId,
                      })
                    }
                  />
                ) : null}

                {selection.type === 'subcategory' ? (
                  <SubcategoryEditor
                    form={subcategoriaForm}
                    setForm={setSubcategoriaForm}
                    selection={selection}
                    onAddArticle={(subcategoriaId) =>
                      selectItem({
                        type: 'article',
                        mode: 'create',
                        subcategoriaId,
                      })
                    }
                  />
                ) : null}

                {selection.type === 'article' ? (
                  <ArticleEditor
                    form={artigoForm}
                    setForm={setArtigoForm}
                    preview={preview}
                    setPreview={setPreview}
                  />
                ) : null}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function findArticleParent(livros: CompendioLivro[], artigoId: number) {
  for (const livro of livros) {
    for (const categoria of livro.categorias) {
      for (const subcategoria of categoria.subcategorias) {
        if (subcategoria.artigos.some((artigo) => artigo.id === artigoId)) {
          return { livro, categoria, subcategoria, subcategoriaId: subcategoria.id };
        }
      }
    }
  }

  return null;
}

function isSelected(selection: Selection | null, type: Selection['type'], id: number) {
  return selection?.type === type && selection.mode === 'edit' && selection.id === id;
}

function BookTreeItem({
  livro,
  selection,
  onSelect,
}: {
  livro: CompendioLivro;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
}) {
  return (
    <div className="rounded-xl border border-app-border bg-app-bg/60 p-2">
      <button
        type="button"
        onClick={() => onSelect({ type: 'book', mode: 'edit', id: livro.id })}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
          isSelected(selection, 'book', livro.id)
            ? 'bg-app-primary/10 text-app-primary'
            : 'text-app-fg hover:bg-app-surface'
        }`}
      >
        <Icon name="book" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {livro.titulo}
        </span>
        <Badge color={statusColor(livro.status)} size="xs">
          {livro.status}
        </Badge>
      </button>

      <div className="mt-2 space-y-1 pl-4">
        <button
          type="button"
          onClick={() =>
            onSelect({ type: 'category', mode: 'create', livroId: livro.id })
          }
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-app-primary hover:bg-app-primary/10"
        >
          <Icon name="add" className="h-3.5 w-3.5" />
          Adicionar capítulo
        </button>

        {livro.categorias.map((categoria) => (
          <div key={categoria.id} className="space-y-1 border-l border-app-border pl-2">
            <button
              type="button"
              onClick={() =>
                onSelect({ type: 'category', mode: 'edit', id: categoria.id })
              }
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                isSelected(selection, 'category', categoria.id)
                  ? 'bg-app-primary/10 text-app-primary'
                  : 'text-app-muted hover:bg-app-surface hover:text-app-fg'
              }`}
            >
              <Icon name="folder" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{categoria.nome}</span>
              {!categoria.ativo ? <Badge size="xs">inativo</Badge> : null}
            </button>

            <button
              type="button"
              onClick={() =>
                onSelect({
                  type: 'subcategory',
                  mode: 'create',
                  categoriaId: categoria.id,
                })
              }
              className="ml-2 flex items-center gap-2 rounded-md px-2 py-1 text-xs text-app-primary hover:bg-app-primary/10"
            >
              <Icon name="add" className="h-3 w-3" />
              Novo tópico
            </button>

            {categoria.subcategorias.map((subcategoria) => (
              <div
                key={subcategoria.id}
                className="space-y-1 border-l border-app-border/70 pl-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelect({
                      type: 'subcategory',
                      mode: 'edit',
                      id: subcategoria.id,
                    })
                  }
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                    isSelected(selection, 'subcategory', subcategoria.id)
                      ? 'bg-app-primary/10 text-app-primary'
                      : 'text-app-muted hover:bg-app-surface hover:text-app-fg'
                  }`}
                >
                  <Icon name="layers" className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {subcategoria.nome}
                  </span>
                  {!subcategoria.ativo ? <Badge size="xs">inativo</Badge> : null}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelect({
                      type: 'article',
                      mode: 'create',
                      subcategoriaId: subcategoria.id,
                    })
                  }
                  className="ml-2 flex items-center gap-2 rounded-md px-2 py-1 text-xs text-app-primary hover:bg-app-primary/10"
                >
                  <Icon name="add" className="h-3 w-3" />
                  Novo artigo
                </button>

                {subcategoria.artigos.map((artigo) => (
                  <button
                    type="button"
                    key={artigo.id}
                    onClick={() =>
                      onSelect({ type: 'article', mode: 'edit', id: artigo.id })
                    }
                    className={`ml-2 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      isSelected(selection, 'article', artigo.id)
                        ? 'bg-app-primary/10 text-app-primary'
                        : 'text-app-muted hover:bg-app-surface hover:text-app-fg'
                    }`}
                  >
                    <Icon name="document" className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{artigo.titulo}</span>
                    {artigo.destaque ? <Icon name="star" className="h-3 w-3" /> : null}
                    {!artigo.ativo ? <Badge size="xs">inativo</Badge> : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorHeader({
  selection,
  dirty,
  saving,
  onSave,
  onMoveUp,
  onMoveDown,
}: {
  selection: Selection;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const labels = {
    book: 'Livro',
    category: 'Capítulo',
    subcategory: 'Tópico',
    article: 'Artigo',
  };

  return (
    <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-primary">
          {selection.mode === 'create' ? 'Criar' : 'Editar'} {labels[selection.type]}
        </p>
        {dirty ? (
            <p className="mt-1 text-xs text-app-warning">Alterações não salvas.</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {selection.mode === 'edit' ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onMoveUp}
              disabled={saving}
            >
              <Icon name="chevron-up" className="mr-2 h-4 w-4" />
              Subir
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onMoveDown}
              disabled={saving}
            >
              <Icon name="chevron-down" className="mr-2 h-4 w-4" />
              Descer
            </Button>
          </>
        ) : null}
        <Button type="button" onClick={onSave} disabled={saving}>
          <Icon name={saving ? 'spinner' : 'save'} className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

function BookEditor({
  form,
  setForm,
}: {
  form: LivroForm;
  setForm: Dispatch<SetStateAction<LivroForm>>;
}) {
  const patch = <K extends keyof LivroForm>(field: K, value: LivroForm[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Título" value={form.titulo} onChange={(e) => patch('titulo', e.target.value)} />
      <Input label="Código" value={form.codigo} onChange={(e) => patch('codigo', e.target.value)} helperText="Opcional. Se ficar vazio, será gerado pelo título." />
      <Textarea className="md:col-span-2" label="Descrição" rows={4} value={form.descricao} onChange={(e) => patch('descricao', e.target.value)} />
      <Input label="Ícone" value={form.icone} onChange={(e) => patch('icone', e.target.value)} />
      <Input label="Cor" value={form.cor} onChange={(e) => patch('cor', e.target.value)} />
      <Input label="Ordem" type="number" value={form.ordem} onChange={(e) => patch('ordem', e.target.value)} />
      <Input label="Suplemento ID" type="number" value={form.suplementoId} onChange={(e) => patch('suplementoId', e.target.value)} helperText="Opcional." />
      <label className="space-y-1">
        <span className="block text-sm font-semibold text-app-fg">Status</span>
        <select value={form.status} onChange={(e) => patch('status', e.target.value as LivroForm['status'])} className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-app-fg focus:border-app-primary focus:outline-none">
          <option value="RASCUNHO">Rascunho</option>
          <option value="PUBLICADO">Publicado</option>
          <option value="ARQUIVADO">Arquivado</option>
        </select>
      </label>
    </div>
  );
}

function CategoryEditor({
  form,
  setForm,
  selection,
  onAddSubcategory,
}: {
  form: CategoriaForm;
  setForm: Dispatch<SetStateAction<CategoriaForm>>;
  selection: Selection;
  onAddSubcategory: (categoriaId: number) => void;
}) {
  const patch = <K extends keyof CategoriaForm>(field: K, value: CategoriaForm[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome" value={form.nome} onChange={(e) => patch('nome', e.target.value)} />
        <Input label="Código" value={form.codigo} onChange={(e) => patch('codigo', e.target.value)} helperText="Opcional. Se ficar vazio, será gerado pelo nome." />
        <Textarea className="md:col-span-2" label="Descrição" rows={4} value={form.descricao} onChange={(e) => patch('descricao', e.target.value)} />
        <Input label="Ícone" value={form.icone} onChange={(e) => patch('icone', e.target.value)} />
        <Input label="Cor" value={form.cor} onChange={(e) => patch('cor', e.target.value)} />
        <Input label="Ordem" type="number" value={form.ordem} onChange={(e) => patch('ordem', e.target.value)} />
        <div className="flex items-end">
          <Checkbox checked={form.ativo} onChange={(e) => patch('ativo', e.target.checked)} label="Ativo no leitor público" />
        </div>
      </div>
      {selection.mode === 'edit' ? (
        <Button type="button" variant="secondary" onClick={() => onAddSubcategory(selection.id)}>
          <Icon name="add" className="mr-2 h-4 w-4" />
          Adicionar tópico
        </Button>
      ) : null}
    </div>
  );
}

function SubcategoryEditor({
  form,
  setForm,
  selection,
  onAddArticle,
}: {
  form: SubcategoriaForm;
  setForm: Dispatch<SetStateAction<SubcategoriaForm>>;
  selection: Selection;
  onAddArticle: (subcategoriaId: number) => void;
}) {
  const patch = <K extends keyof SubcategoriaForm>(
    field: K,
    value: SubcategoriaForm[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome" value={form.nome} onChange={(e) => patch('nome', e.target.value)} />
        <Input label="Código" value={form.codigo} onChange={(e) => patch('codigo', e.target.value)} helperText="Opcional. Se ficar vazio, será gerado pelo nome." />
        <Textarea className="md:col-span-2" label="Descrição" rows={4} value={form.descricao} onChange={(e) => patch('descricao', e.target.value)} />
        <Input label="Ordem" type="number" value={form.ordem} onChange={(e) => patch('ordem', e.target.value)} />
        <div className="flex items-end">
          <Checkbox checked={form.ativo} onChange={(e) => patch('ativo', e.target.checked)} label="Ativo no leitor público" />
        </div>
      </div>
      {selection.mode === 'edit' ? (
        <Button type="button" variant="secondary" onClick={() => onAddArticle(selection.id)}>
          <Icon name="add" className="mr-2 h-4 w-4" />
          Adicionar artigo
        </Button>
      ) : null}
    </div>
  );
}

function ArticleEditor({
  form,
  setForm,
  preview,
  setPreview,
}: {
  form: ArtigoForm;
  setForm: Dispatch<SetStateAction<ArtigoForm>>;
  preview: boolean;
  setPreview: (value: boolean) => void;
}) {
  const bytes = new TextEncoder().encode(form.conteudo).length;
  const patch = <K extends keyof ArtigoForm>(field: K, value: ArtigoForm[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="button" size="sm" variant={!preview ? 'primary' : 'secondary'} onClick={() => setPreview(false)}>
            Editor
          </Button>
          <Button type="button" size="sm" variant={preview ? 'primary' : 'secondary'} onClick={() => setPreview(true)}>
            Preview
          </Button>
        </div>
        <span className={`text-xs ${bytes > SAFE_TEXT_BYTES ? 'text-app-danger' : 'text-app-muted'}`}>
          {bytes.toLocaleString('pt-BR')} / {SAFE_TEXT_BYTES.toLocaleString('pt-BR')} bytes
        </span>
      </div>

      {preview ? (
        <section className="min-h-[28rem] rounded-xl border border-app-border bg-app-bg p-4">
          <ArtigoContent conteudo={form.conteudo} titulo={form.titulo} />
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Input label="Título" value={form.titulo} onChange={(e) => patch('titulo', e.target.value)} />
          <Input label="Código" value={form.codigo} onChange={(e) => patch('codigo', e.target.value)} helperText="Opcional. Se ficar vazio, será gerado pelo título." />
          <Textarea className="xl:col-span-2" label="Resumo" rows={3} value={form.resumo} onChange={(e) => patch('resumo', e.target.value)} />
          <Textarea className="font-mono xl:col-span-2" label="Conteúdo Markdown" rows={18} value={form.conteudo} onChange={(e) => patch('conteudo', e.target.value)} error={bytes > SAFE_TEXT_BYTES ? 'Conteúdo acima do limite seguro.' : undefined} />
          <Input label="Tags" value={form.tags} onChange={(e) => patch('tags', e.target.value)} helperText="Separe por vírgulas." />
          <Input label="Palavras-chave" value={form.palavrasChave} onChange={(e) => patch('palavrasChave', e.target.value)} />
          <Input label="Artigos relacionados" value={form.artigosRelacionados} onChange={(e) => patch('artigosRelacionados', e.target.value)} helperText="Códigos separados por vírgula." />
          <Input label="Ordem" type="number" value={form.ordem} onChange={(e) => patch('ordem', e.target.value)} />
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-app-fg">Dificuldade</span>
            <select value={form.nivelDificuldade} onChange={(e) => patch('nivelDificuldade', e.target.value as ArtigoForm['nivelDificuldade'])} className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-app-fg focus:border-app-primary focus:outline-none">
              <option value="">Sem nível</option>
              <option value="iniciante">iniciante</option>
              <option value="intermediario">intermediario</option>
              <option value="avancado">avançado</option>
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <Checkbox checked={form.ativo} onChange={(e) => patch('ativo', e.target.checked)} label="Ativo" />
            <Checkbox checked={form.destaque} onChange={(e) => patch('destaque', e.target.checked)} label="Destaque" />
          </div>
        </div>
      )}
    </div>
  );
}
