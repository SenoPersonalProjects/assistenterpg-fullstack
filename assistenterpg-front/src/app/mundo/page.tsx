'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { WorldAtlasShell } from '@/components/world/WorldAtlasShell';
import { useAuth } from '@/context/AuthContext';

export default function MundoPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/auth/login');
    }
  }, [loading, usuario, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg p-8">
        <Loading
          variant="dice"
          size="lg"
          message="Abrindo o atlas sobrenatural..."
        />
      </div>
    );
  }

  if (!usuario) return null;

  return <WorldAtlasShell />;
}
