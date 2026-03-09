'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { SUPLEMENTO_ADMIN_MODULES } from '@/lib/constants/suplemento-admin';

export default function SuplementosAdminPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();

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
        <Loading message="Carregando painel admin..." className="text-app-fg" />
      </div>
    );
  }

  if (usuario.role !== 'ADMIN') {
    return null;
  }

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-danger/10">
            <Icon name="settings" className="w-6 h-6 text-app-danger" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-app-fg">Admin de Conteudos de Suplemento</h1>
            <p className="text-sm text-app-muted mt-0.5">
              Base preparada para CRUD dos modulos com suporte a fonte e suplemento.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {SUPLEMENTO_ADMIN_MODULES.map((module) => (
            <Link key={module.id} href={module.route}>
              <Card className="h-full transition-colors hover:border-app-primary/60">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name={module.icon} className="w-5 h-5 text-app-primary" />
                    <h2 className="text-lg font-semibold text-app-fg">{module.label}</h2>
                  </div>
                  <p className="text-sm text-app-muted">{module.description}</p>
                  <p className="text-xs text-app-primary font-medium">Abrir base CRUD</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
