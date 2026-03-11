type RouteLoadingVariant = 'grid' | 'detail' | 'form' | 'session';

type RouteLoadingSkeletonProps = {
  message?: string;
  variant?: RouteLoadingVariant;
  cards?: number;
};

export function RouteLoadingSkeleton({
  message = 'Carregando página...',
  variant = 'grid',
  cards = 6,
}: RouteLoadingSkeletonProps) {
  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="skeleton h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-56 rounded-md" />
            <div className="skeleton h-4 w-80 max-w-[70vw] rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-app-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-app-border border-t-app-primary" />
          <span>{message}</span>
        </div>

        {variant === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <div key={index} className="rounded-xl border border-app-border bg-app-surface p-4">
                <div className="space-y-3">
                  <div className="skeleton h-5 w-2/3 rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-5/6 rounded-md" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="skeleton h-10 rounded-lg" />
                  <div className="skeleton h-10 rounded-lg" />
                  <div className="skeleton h-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {variant === 'detail' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="space-y-3">
                <div className="skeleton h-5 w-1/3 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-11/12 rounded-md" />
                <div className="skeleton h-4 w-2/3 rounded-md" />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-app-border bg-app-surface p-4">
                <div className="space-y-3">
                  <div className="skeleton h-5 w-1/2 rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-4/5 rounded-md" />
                </div>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surface p-4">
                <div className="space-y-3">
                  <div className="skeleton h-5 w-1/2 rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-5/6 rounded-md" />
                  <div className="skeleton h-4 w-2/3 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {variant === 'form' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-3 w-24 rounded-md" />
                    <div className="skeleton h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="space-y-3">
                <div className="skeleton h-3 w-28 rounded-md" />
                <div className="skeleton h-24 w-full rounded-md" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="skeleton h-10 w-28 rounded-lg" />
              <div className="skeleton h-10 w-36 rounded-lg" />
            </div>
          </div>
        ) : null}

        {variant === 'session' ? (
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="space-y-3">
                <div className="skeleton h-5 w-1/2 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-5/6 rounded-md" />
                <div className="skeleton h-20 w-full rounded-md" />
              </div>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="space-y-3">
                <div className="skeleton h-5 w-1/3 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-32 w-full rounded-md" />
                <div className="skeleton h-32 w-full rounded-md" />
              </div>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="space-y-3">
                <div className="skeleton h-5 w-2/3 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-4/5 rounded-md" />
                <div className="skeleton h-28 w-full rounded-md" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
