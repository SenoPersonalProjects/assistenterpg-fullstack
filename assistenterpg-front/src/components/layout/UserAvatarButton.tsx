// components/layout/UserAvatarButton.tsx
'use client';

import { Button } from '@/components/ui/Button';

type Props = {
  apelido: string;
  isAdmin?: boolean;
  onClick: () => void;
};

export function UserAvatarButton({ apelido, isAdmin = false, onClick }: Props) {
  const initial = apelido.charAt(0).toUpperCase();

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className="flex items-center gap-2 relative"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-app-primary text-app-fg text-sm">
        {initial}

        {isAdmin && (
          <span
            className="
              absolute -bottom-1.5 -right-2
              rounded bg-red-500 px-1.5 py-0.5
              border border-app-surface
              text-[8px] font-bold leading-none text-white
            "
            title="Administrador"
          >
            ADMIN
          </span>
        )}
      </span>
      <span className="hidden sm:inline text-sm">{apelido}</span>
    </Button>
  );
}
