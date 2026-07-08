'use client';

import { useState } from 'react';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { apiAdminExportarSeedCompendio } from '@/lib/utils/compendio';

function timestampForFile(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function CompendioAdminActionsMenu() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (usuario?.role !== 'ADMIN') {
    return null;
  }

  async function exportSeed() {
    setLoading(true);
    try {
      const seed = await apiAdminExportarSeedCompendio();
      const filename = `compendio-seed-${timestampForFile()}.json`;
      downloadJson(filename, seed);
      showToast('Seed do compêndio exportado.', 'success');
    } catch (error) {
      showToast(criarErroUsuario(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <EntityActionsMenu
      ariaLabel="Ações administrativas do compêndio"
      items={[
        {
          id: 'manage',
          label: 'Gerenciar compêndio',
          icon: 'settings',
          href: '/compendio/admin',
        },
        {
          id: 'export',
          label: loading ? 'Exportando seed...' : 'Exportar seed',
          icon: loading ? 'spinner' : 'download',
          disabled: loading,
          onSelect: () => void exportSeed(),
        },
      ]}
    />
  );
}
