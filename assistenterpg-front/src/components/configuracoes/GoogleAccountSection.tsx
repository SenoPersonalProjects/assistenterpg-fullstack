'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiDesautorizarGoogleCalendar,
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/context/ToastContext';
import {
  obterMensagemStatusCalendar,
  resolverAcaoPrincipalGoogleCalendar,
} from '@/lib/google/google-integration.helpers';
import type { UserErrorState } from '@/lib/types';

export function GoogleAccountSection() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<GoogleIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [confirmacao, setConfirmacao] = useState<
    'desautorizar-calendar' | 'desvincular-google' | null
  >(null);

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
      const response = await apiDesvincularGoogle();
      await carregar();
      showToast(response.mensagem, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      setErro(userError);
      showToast(userError, 'error');
    } finally {
      setAcao(null);
    }
  }

  async function desautorizarCalendar() {
    setAcao('calendar-revoke');
    setErro(null);
    try {
      const response = await apiDesautorizarGoogleCalendar();
      await carregar();
      showToast(response.mensagem, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      setErro(userError);
      showToast(userError, 'error');
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

  const acaoPrincipal = resolverAcaoPrincipalGoogleCalendar(status);
  const calendarStatusLabel = obterMensagemStatusCalendar(status);
  const calendarComProblema =
    Boolean(status?.precisaReautorizarCalendar) || Boolean(status?.calendarErro);
  const calendarErro = status?.calendarErro ?? status?.ultimoErro ?? null;

  return (
    <>
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
              <Badge color={status.emailVerificado ? 'green' : 'gray'} size="sm">
                {status.emailVerificado ? 'Email verificado' : 'Email pendente'}
              </Badge>
              <Badge
                color={
                  status.calendarAutorizado
                    ? 'blue'
                    : calendarComProblema
                      ? 'yellow'
                      : 'gray'
                }
                size="sm"
              >
                {calendarStatusLabel}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {acaoPrincipal === 'authorize-calendar' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={autorizarCalendar}
                disabled={acao !== null}
              >
                {acao === 'calendar' ? 'Redirecionando...' : 'Autorizar Calendar'}
              </Button>
            ) : null}
            {acaoPrincipal === 'reauthorize-calendar' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={autorizarCalendar}
                disabled={acao !== null}
              >
                {acao === 'calendar'
                  ? 'Redirecionando...'
                  : 'Reautorizar Calendar'}
              </Button>
            ) : null}
            {acaoPrincipal === 'deauthorize-calendar' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmacao('desautorizar-calendar')}
                disabled={acao !== null}
              >
                {acao === 'calendar-revoke'
                  ? 'Desautorizando...'
                  : 'Desautorizar Calendar'}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmacao('desvincular-google')}
              disabled={acao !== null}
            >
              {acao === 'unlink' ? 'Desvinculando...' : 'Desvincular Google'}
            </Button>
          </div>
          {calendarErro ? (
            <Alert variant="warning">{calendarErro}</Alert>
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

      <ConfirmDialog
        isOpen={confirmacao === 'desautorizar-calendar'}
        onClose={() => setConfirmacao(null)}
        onConfirm={() => void desautorizarCalendar()}
        title="Desautorizar Google Calendar?"
        description="Voc\u00ea deixar\u00e1 de criar e atualizar eventos no Google Calendar. Sua conta Google continuar\u00e1 vinculada para login."
        confirmLabel="Desautorizar"
        variant="warning"
        confirmLoading={acao === 'calendar-revoke'}
      />

      <ConfirmDialog
        isOpen={confirmacao === 'desvincular-google'}
        onClose={() => setConfirmacao(null)}
        onConfirm={() => void desvincular()}
        title="Desvincular conta Google?"
        description="Voc\u00ea remover\u00e1 o login com Google desta conta. Confirme que voc\u00ea possui senha local antes de continuar."
        confirmLabel="Desvincular"
        variant="danger"
        confirmLoading={acao === 'unlink'}
      />
    </>
  );
}
