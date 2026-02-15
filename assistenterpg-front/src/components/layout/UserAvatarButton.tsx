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
        
        {/* ✅ Mini badge "A" vermelho no avatar */}
        {isAdmin && (
          <span
            className="
              absolute -top-1 -right-1
              flex h-4 w-4 items-center justify-center
              rounded-full bg-red-500 text-white
              text-[8px] font-bold
              border border-app-surface
            "
            title="Administrador"
          >
            A
          </span>
        )}
      </span>
      <span className="hidden sm:inline text-sm">{apelido}</span>
    </Button>
  );
}
