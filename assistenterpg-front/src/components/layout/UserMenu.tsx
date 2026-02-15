// components/layout/UserMenu.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserAvatarButton } from './UserAvatarButton';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsButton } from './NotificationsButton';

export function UserMenu() {
  const { usuario, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!usuario) return null;

  const isAdmin = usuario.role === 'ADMIN';

  return (
    <div className="relative">
      <UserAvatarButton
        apelido={usuario.apelido}
        isAdmin={isAdmin}
        onClick={() => setOpen((o) => !o)}
      />

      {open && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 z-20">
            <Card className="space-y-3">
              {/* Info do usuário */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-app-fg">{usuario.apelido}</p>
                  {isAdmin && (
                    <Badge color="red" size="sm" title="Administrador">
                      ADMIN
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-app-muted">{usuario.email}</p>
              </div>

              {/* Tema */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-muted">Tema</span>
                <ThemeToggle />
              </div>

              {/* Notificações (movido pra cá) */}
              <NotificationsButton pendingNotifications={0} className="w-full justify-start" />

              {/* Versão */}
              <div className="flex gap-2 items-center">
                <Badge color="blue">Beta</Badge>
                <span className="text-xs text-app-muted">Assistente RPG</span>
              </div>

              {/* Botão Sair */}
              <Button variant="secondary" onClick={logout} className="w-full">
                Sair
              </Button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
