'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiDesvincularGoogle,
  apiIniciarGoogleCalendar,
  apiIniciarVinculoGoogle,
  apiObterIntegracaoGoogle,
  criarErroUsuario,
  type GoogleIntegrationStatus,
} from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import type { UserErrorState } from '@/lib/types';

export function GoogleAccountSection() {
  const [status, setStatus] = useState<GoogleIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);
  const [erro, setErro] = useState<UserErrorState | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setStatus(await apiObterIntegracaoGoogle());
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function iniciarVinculo() {
    setAcao('link');
    setErro(null);
    try {
      const response = await apiIniciarVinculoGoogle();
      window.location.href = response.url;
    } catch (error) {
      setErro(criarErroUsuario(error));
      setAcao(null);
    }
  }

  async function autorizarCalendar() {
    setAcao('calendar');
    setErro(null);
    try {
      const response = await apiIniciarGoogleCalendar();
      window.location.href = response.url;
    } catch (error) {
      setErro(criarErroUsuario(error));
      setAcao(null);
    }
  }

  async function desvincular() {
    setAcao('unlink');
    setErro(null);
    try {
      await apiDesvincularGoogle();
      await carregar();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setAcao(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-app-border bg-app-surface/40 p-4 text-sm text-app-muted">
        <Icon name="spinner" className="mr-2 inline h-4 w-4" />
        Carregando integração Google...
      </div>
    );
  }

  if (!status?.googleOAuthEnabled) {
    return (
      <Alert variant="info">
        Login com Google está desabilitado neste ambiente. Configure as variáveis
        Google OAuth no backend para ativar.
      </Alert>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-app-border bg-app-surface/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-app-fg">Conta Google</h4>
          <p className="text-xs text-app-muted">
            Use Google para entrar e autorize Calendar quando quiser agendar
            sessões com convite.
          </p>
        </div>
        <Badge color={status.conectado ? 'green' : 'gray'} size="sm">
          {status.conectado ? 'Conectada' : 'Desconectada'}
        </Badge>
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      {status.conectado ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-app-border/70 bg-app-bg/40 p-3 text-sm">
            <p className="font-semibold text-app-fg">
              {status.nome ?? status.email}
            </p>
            <p className="text-xs text-app-muted">{status.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color="green" size="sm">
                Email verificado
              </Badge>
              <Badge color={status.calendarAutorizado ? 'blue' : 'gray'} size="sm">
                {status.calendarAutorizado
                  ? 'Calendar autorizado'
                  : 'Calendar pendente'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={autorizarCalendar}
              disabled={acao !== null}
            >
              {acao === 'calendar' ? 'Redirecionando...' : 'Autorizar Calendar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={desvincular}
              disabled={acao !== null}
            >
              {acao === 'unlink' ? 'Desvinculando...' : 'Desvincular Google'}
            </Button>
          </div>
          {status.ultimoErro ? (
            <Alert variant="warning">{status.ultimoErro}</Alert>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={iniciarVinculo}
          disabled={acao !== null}
        >
          {acao === 'link' ? 'Redirecionando...' : 'Vincular Google'}
        </Button>
      )}
    </div>
  );
}
