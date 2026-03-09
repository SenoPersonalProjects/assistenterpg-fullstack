'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { SUPLEMENTO_ADMIN_MODULES } from '@/lib/constants/suplemento-admin';

function ModuloLoading() {
  return (
    <Card>
      <Loading message="Carregando modulo..." className="text-app-fg py-6" />
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
        <Loading message="Carregando modulo admin..." className="text-app-fg" />
      </div>
    );
  }

  if (usuario.role !== 'ADMIN') return null;

  if (!modulo) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="space-y-3">
              <h1 className="text-xl font-semibold text-app-fg">Modulo nao encontrado</h1>
              <p className="text-sm text-app-muted">
                O modulo solicitado nao existe na configuracao de CRUD admin.
              </p>
              <Button variant="secondary" onClick={() => router.push('/suplementos/admin')}>
                Voltar para painel admin
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name={modulo.icon} className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-app-fg">{modulo.label}</h1>
              <p className="text-sm text-app-muted">{modulo.description}</p>
            </div>
          </div>
          <Link href="/suplementos/admin" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Voltar
            </Button>
          </Link>
        </header>

        {PainelModulo ? <PainelModulo /> : null}
      </div>
    </main>
  );
}
