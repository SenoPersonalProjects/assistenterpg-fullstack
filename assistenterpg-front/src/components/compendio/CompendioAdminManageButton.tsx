'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export function CompendioAdminManageButton() {
  const { usuario } = useAuth();

  if (usuario?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Link href="/compendio/admin">
      <Button type="button" variant="primary" size="sm" className="font-bold">
        <Icon name="settings" className="mr-2 h-4 w-4" />
        Gerenciar compêndio
      </Button>
    </Link>
  );
}
