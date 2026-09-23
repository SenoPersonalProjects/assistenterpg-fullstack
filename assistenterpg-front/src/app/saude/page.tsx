'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsStrip } from '@/components/ui/StatsStrip';
import { apiObterSaudeSistema, type SaudeSistemaAdministrativa } from '@/lib/api/saude';

function formatarData(valor: string | null) {
  return valor ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(valor)) : '—';
}

function formatarBytes(valor: number) {
  if (!Number.isFinite(valor)) return '—';
  return `${(valor / 1024 / 1024).toFixed(2)} MB`;
}

export default function SaudeSistemaPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();
  const [dados, setDados] = useState<SaudeSistemaAdministrativa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await apiObterSaudeSistema());
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível consultar a saúde do sistema.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !usuario) router.replace('/auth/login');
    if (!loading && usuario && usuario.role !== 'ADMIN') router.replace('/');
  }, [loading, router, usuario]);

  useEffect(() => {
    if (usuario?.role === 'ADMIN') void carregar();
  }, [carregar, usuario?.role]);

  if (loading || !usuario || usuario.role !== 'ADMIN') {
    return <div className="min-h-screen bg-app-bg p-6"><Loading message="Carregando painel de saúde..." className="text-app-fg" /></div>;
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          icon="settings"
          eyebrow="Administração"
          title="Saúde do sistema"
          description="Estado de publicação, banco, migrations e último backup registrado."
          actions={<Button type="button" variant="secondary" onClick={() => void carregar()} disabled={carregando}>Atualizar</Button>}
        />
        {erro ? <ErrorAlert message={erro} /> : null}
        {carregando && !dados ? <Loading message="Consultando serviços..." className="text-app-fg" /> : null}
        {dados ? <>
          <StatsStrip items={[
            { id: 'backend', label: 'Backend', value: dados.backend.status === 'ok' ? 'Online' : 'Indisponível', tone: dados.backend.status === 'ok' ? 'success' : 'danger', helper: dados.backend.version },
            { id: 'frontend', label: 'Frontend', value: dados.frontend.status === 'ok' ? 'Online' : dados.frontend.status === 'NAO_CONFIGURADO' ? 'Sem URL' : 'Indisponível', tone: dados.frontend.status === 'ok' ? 'success' : 'warning', helper: dados.frontend.httpStatus ? `HTTP ${dados.frontend.httpStatus}` : 'verificação remota' },
            { id: 'backup', label: 'Backup', value: dados.ultimoBackup ? 'Registrado' : 'Pendente', tone: dados.ultimoBackup ? 'success' : 'warning', helper: dados.ultimoBackup ? formatarData(dados.ultimoBackup.executadoEm) : 'configure a rotina' },
          ]} />
          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-app-fg">Banco e migration</h2><Badge color="green">Pronto</Badge></div>
              <dl className="mt-3 space-y-2 text-sm"><div><dt className="text-app-muted">Última migration</dt><dd className="break-all text-app-fg">{dados.migrationMaisRecente?.nome ?? 'Nenhuma registrada'}</dd></div><div><dt className="text-app-muted">Aplicada em</dt><dd className="text-app-fg">{formatarData(dados.migrationMaisRecente?.aplicadaEm ?? null)}</dd></div></dl>
            </article>
            <article className="rounded-xl border border-app-border bg-app-surface p-4">
              <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-app-fg">Último backup</h2><Badge color={dados.ultimoBackup ? 'green' : 'yellow'}>{dados.ultimoBackup ? 'Registrado' : 'Pendente'}</Badge></div>
              {dados.ultimoBackup ? <dl className="mt-3 space-y-2 text-sm"><div><dt className="text-app-muted">Arquivo</dt><dd className="break-all text-app-fg">{dados.ultimoBackup.arquivo}</dd></div><div><dt className="text-app-muted">Tamanho · retenção</dt><dd className="text-app-fg">{formatarBytes(dados.ultimoBackup.tamanhoBytes)} · {dados.ultimoBackup.retencao} cópia</dd></div><div><dt className="text-app-muted">Hash SHA-256</dt><dd className="break-all font-mono text-xs text-app-fg">{dados.ultimoBackup.sha256}</dd></div></dl> : <p className="mt-3 text-sm text-app-muted">A rotina ainda não registrou nenhum backup. Consulte o guia de operação.</p>}
            </article>
          </section>
        </> : null}
      </div>
    </main>
  );
}
