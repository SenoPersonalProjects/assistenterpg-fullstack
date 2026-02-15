'use client';

import { Loading } from './Loading';

export function LoadingOverlay({ 
  loading, 
  message, 
  className = '' 
}: { 
  loading: boolean; 
  message: string; 
  className?: string; 
}) {
  if (!loading) return null;

  return (
    <div className={`p-3 rounded-lg border border-app-border/50 bg-app-surface/80 backdrop-blur-sm ${className}`}>
      <Loading size="sm" message={message} className="text-app-muted" />
    </div>
  );
}
