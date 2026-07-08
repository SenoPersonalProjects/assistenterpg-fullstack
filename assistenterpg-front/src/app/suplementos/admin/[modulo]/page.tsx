'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SUPLEMENTO_ADMIN_MODULES } from '@/lib/constants/suplemento-admin';

function ModuloLoading() {
  return (
    <Card className="border-white/5 bg-app-surface/55">
      <Loading message="Carregando módulo..." className="py-6 text-app-fg" />
    </Card>
  );
}

const ClassesAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/ClassesAdminPanel').then((mod) => mod.ClassesAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const ClasAdminPanel = dynamic(
  () => import('@/components/suplemento-admin/panels/ClasAdminPanel').then((mod) => mod.ClasAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const TrilhasAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/TrilhasAdminPanel').then((mod) => mod.TrilhasAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const CaminhosAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/CaminhosAdminPanel').then((mod) => mod.CaminhosAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const OrigensAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/OrigensAdminPanel').then((mod) => mod.OrigensAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const ProficienciasAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/ProficienciasAdminPanel').then(
      (mod) => mod.ProficienciasAdminPanel,
    ),
  {
    loading: ModuloLoading,
  },
);

const TiposGrauAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/TiposGrauAdminPanel').then((mod) => mod.TiposGrauAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const CondicoesAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/CondicoesAdminPanel').then((mod) => mod.CondicoesAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const HabilidadesAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/habilidades/HabilidadesAdminPanel').then(
      (mod) => mod.HabilidadesAdminPanel,
    ),
  {
    loading: ModuloLoading,
  },
);

const EquipamentosAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/EquipamentosAdminPanel').then(
      (mod) => mod.EquipamentosAdminPanel,
    ),
  {
    loading: ModuloLoading,
  },
);

const TecnicasAdminPanel = dynamic(
  () =>
    import('@/components/suplemento-admin/panels/TecnicasAdminPanel').then((mod) => mod.TecnicasAdminPanel),
  {
    loading: ModuloLoading,
  },
);

const ADMIN_PANEL_BY_MODULE = {
  classes: ClassesAdminPanel,
  clas: ClasAdminPanel,
  trilhas: TrilhasAdminPanel,
  caminhos: CaminhosAdminPanel,
  origens: OrigensAdminPanel,
  proficiencias: ProficienciasAdminPanel,
  'tipos-grau': TiposGrauAdminPanel,
  condicoes: CondicoesAdminPanel,
  habilidades: HabilidadesAdminPanel,
  equipamentos: EquipamentosAdminPanel,
  'tecnicas-amaldicoadas': TecnicasAdminPanel,
} as const;

export default function SuplementosAdminModuloPage() {
  const params = useParams<{ modulo: string }>();
  const router = useRouter();
  const { usuario, loading } = useAuth();

  const modulo = useMemo(
    () => SUPLEMENTO_ADMIN_MODULES.find((item) => item.slug === params.modulo),
    [params.modulo],
  );
  const PainelModulo = modulo ? ADMIN_PANEL_BY_MODULE[modulo.id] : null;

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!loading && usuario?.role !== 'ADMIN') {
      router.push('/suplementos');
    }
  }, [loading, usuario, router]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando módulo admin..." className="text-app-fg" />
      </div>
    );
  }

  if (usuario.role !== 'ADMIN') return null;

  if (!modulo) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            variant="card"
            icon="search"
            title="Módulo não encontrado"
            description="O módulo solicitado não existe na configuração de CRUD admin."
            action={
              <Button variant="secondary" onClick={() => router.push('/suplementos/admin')}>
                Voltar para Admin Conteúdo
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          icon={modulo.icon}
          eyebrow="Admin Conteúdo"
          title={modulo.label}
          description={modulo.description}
          backHref="/suplementos/admin"
          backLabel="Admin Conteúdo"
          actions={
            <Link href="/suplementos/admin">
              <Button variant="secondary" className="w-full sm:w-auto">
                Voltar
              </Button>
            </Link>
          }
        />

        {PainelModulo ? <PainelModulo /> : null}
      </div>
    </main>
  );
}
