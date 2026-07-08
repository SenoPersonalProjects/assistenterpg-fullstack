'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { SUPLEMENTO_ADMIN_MODULES } from '@/lib/constants/suplemento-admin';

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function SuplementosAdminPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!loading && usuario?.role !== 'ADMIN') {
      router.push('/suplementos');
    }
  }, [loading, usuario, router]);

  const visibleModules = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return SUPLEMENTO_ADMIN_MODULES;

    return SUPLEMENTO_ADMIN_MODULES.filter((module) => {
      const searchable = normalizeSearch(
        [module.label, module.description, module.slug, module.id].join(' '),
      );
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  const statsItems: StatsStripItem[] = [
    {
      id: 'modules',
      label: 'Módulos',
      value: SUPLEMENTO_ADMIN_MODULES.length,
      icon: 'tools',
      helper: 'bases CRUD',
    },
    {
      id: 'visible',
      label: 'Visíveis',
      value: visibleModules.length,
      icon: 'search',
      tone: query.trim() ? 'primary' : 'default',
      helper: query.trim() ? 'com filtro' : 'sem filtro',
    },
    {
      id: 'routes',
      label: 'Rotas admin',
      value: SUPLEMENTO_ADMIN_MODULES.length,
      icon: 'settings',
      helper: 'sem nova API',
    },
  ];

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando painel admin..." className="text-app-fg" />
      </div>
    );
  }

  if (usuario.role !== 'ADMIN') {
    return null;
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          icon="settings"
          eyebrow="Administração"
          title="Admin Conteúdo"
          description="Gerencie as bases de conteúdo usadas por suplementos, personagens e regras."
          actions={
            <EntityActionsMenu
              ariaLabel="Ações do admin de conteúdo"
              buttonTitle="Mais ações"
              items={[
                {
                  id: 'suplementos',
                  label: 'Ver suplementos',
                  icon: 'book',
                  href: '/suplementos',
                },
              ]}
            />
          }
        />

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-0 flex-1">
            <Input
              icon="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar módulo, descrição ou rota..."
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setQuery('')}
            disabled={!query.trim()}
            className="w-full sm:w-auto"
          >
            Limpar
          </Button>
        </PageToolbar>

        <section className="space-y-3">
          <SectionHeader
            icon="tools"
            title="Bases administrativas"
            description="Acesse os módulos de CRUD sem mudar o escopo dos painéis internos."
            count={visibleModules.length}
          />

          {visibleModules.length === 0 ? (
            <EmptyState
              variant="card"
              icon="search"
              title="Nenhum módulo encontrado"
              description="A busca atual não encontrou bases administrativas."
              action={
                <Button type="button" variant="secondary" onClick={() => setQuery('')}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/5 bg-app-surface/45">
              {visibleModules.map((module) => (
                <Link
                  key={module.id}
                  href={module.route}
                  className="group flex min-w-0 flex-col gap-3 border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-app-muted-surface/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
                      <Icon name={module.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-app-fg">
                        {module.label}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm font-medium leading-relaxed text-app-muted">
                        {module.description}
                      </span>
                    </span>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-app-primary">
                    Abrir base
                    <Icon
                      name="chevron-right"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
