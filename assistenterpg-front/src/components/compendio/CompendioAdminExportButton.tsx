'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Não foi possível exportar o seed.';
}

export function CompendioAdminExportButton() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (usuario?.role !== 'ADMIN') {
    return null;
  }

  const exportSeed = async () => {
    setLoading(true);
    try {
      const seed = await apiAdminExportarSeedCompendio();
      const filename = `compendio-seed-${timestampForFile()}.json`;
      downloadJson(filename, seed);
      showToast('Seed do compêndio exportado.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="secondary" size="sm" onClick={exportSeed} disabled={loading}>
      <Icon name={loading ? 'spinner' : 'download'} className="mr-2 h-4 w-4" />
      Exportar seed do compêndio
    </Button>
  );
}
