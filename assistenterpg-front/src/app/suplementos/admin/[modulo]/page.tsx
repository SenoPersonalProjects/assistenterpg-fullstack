'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { SUPLEMENTO_ADMIN_MODULES } from '@/lib/constants/suplemento-admin';
import { HabilidadesAdminPanel } from '@/components/suplemento-admin/habilidades/HabilidadesAdminPanel';
import { ClassesAdminPanel } from '@/components/suplemento-admin/panels/ClassesAdminPanel';
import { ClasAdminPanel } from '@/components/suplemento-admin/panels/ClasAdminPanel';
import { TrilhasAdminPanel } from '@/components/suplemento-admin/panels/TrilhasAdminPanel';
import { CaminhosAdminPanel } from '@/components/suplemento-admin/panels/CaminhosAdminPanel';
import { OrigensAdminPanel } from '@/components/suplemento-admin/panels/OrigensAdminPanel';
import { ProficienciasAdminPanel } from '@/components/suplemento-admin/panels/ProficienciasAdminPanel';
import { TiposGrauAdminPanel } from '@/components/suplemento-admin/panels/TiposGrauAdminPanel';
import { CondicoesAdminPanel } from '@/components/suplemento-admin/panels/CondicoesAdminPanel';
import { EquipamentosAdminPanel } from '@/components/suplemento-admin/panels/EquipamentosAdminPanel';
import { TecnicasAdminPanel } from '@/components/suplemento-admin/panels/TecnicasAdminPanel';

export default function SuplementosAdminModuloPage() {
  const params = useParams<{ modulo: string }>();
  const router = useRouter();
  const { usuario, loading } = useAuth();

  const modulo = useMemo(
    () => SUPLEMENTO_ADMIN_MODULES.find((item) => item.slug === params.modulo),
    [params.modulo],
  );

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
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name={modulo.icon} className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-app-fg">{modulo.label}</h1>
              <p className="text-sm text-app-muted">{modulo.description}</p>
            </div>
          </div>
          <Link href="/suplementos/admin">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </header>

        {modulo.id === 'classes' && <ClassesAdminPanel />}
        {modulo.id === 'clas' && <ClasAdminPanel />}
        {modulo.id === 'trilhas' && <TrilhasAdminPanel />}
        {modulo.id === 'caminhos' && <CaminhosAdminPanel />}
        {modulo.id === 'origens' && <OrigensAdminPanel />}
        {modulo.id === 'proficiencias' && <ProficienciasAdminPanel />}
        {modulo.id === 'tipos-grau' && <TiposGrauAdminPanel />}
        {modulo.id === 'condicoes' && <CondicoesAdminPanel />}
        {modulo.id === 'habilidades' && <HabilidadesAdminPanel />}
        {modulo.id === 'equipamentos' && <EquipamentosAdminPanel />}
        {modulo.id === 'tecnicas-amaldicoadas' && <TecnicasAdminPanel />}
      </div>
    </main>
  );
}
