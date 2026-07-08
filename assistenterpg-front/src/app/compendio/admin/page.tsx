import { Suspense } from 'react';
import { CompendioAdminManager } from '@/components/compendio/CompendioAdminManager';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CompendioAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              variant="card"
              icon="spinner"
              title="Carregando compêndio"
              description="Preparando área administrativa."
            />
          </div>
        </main>
      }
    >
      <CompendioAdminManager />
    </Suspense>
  );
}
