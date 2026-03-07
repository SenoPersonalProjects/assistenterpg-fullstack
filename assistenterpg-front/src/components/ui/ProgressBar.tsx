'use client';

export function ProgressBar({
  current,
  total,
  showPercentage = false,
  className = '',
}: {
  current: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
}) {
  const progress = Math.round((current / total) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        {showPercentage && (
          <p className="text-xs font-semibold text-app-primary">
            {progress}% concluído
          </p>
        )}
      </div>
      <div className="h-2 bg-app-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-app-primary to-app-primary-dark rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
