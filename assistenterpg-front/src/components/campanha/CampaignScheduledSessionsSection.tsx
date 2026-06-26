'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiAbrirSessaoAgendadaCampanha,
  apiAtualizarSessaoAgendadaCampanha,
  apiCancelarSessaoAgendadaCampanha,
  apiCriarSessaoAgendadaCampanha,
  apiIniciarGoogleCalendar,
  apiListarSessoesAgendadasCampanha,
  apiObterIntegracaoGoogle,
  apiRetryCalendarSessaoAgendadaCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type {
  SessaoAgendadaResumo,
  StatusSessaoAgendada,
  StatusSyncCalendar,
  UserErrorState,
} from '@/lib/types';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Props = {
  campanhaId: number;
  usuarioEhMestre: boolean;
  onSessaoAberta?: () => void;
};

type FormState = {
  titulo: string;
  descricao: string;
  inicioLocal: string;
  duracaoMinutos: number;
  timezone: string;
  adicionarAoGoogleCalendar: boolean;
  adicionarGoogleMeet: boolean;
};

const DEFAULT_DURATION_MINUTES = 180;

function timezoneLocal(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Fortaleza';
}

function agoraLocalInput(): string {
  const date = new Date(Date.now() + 60 * 60_000);
  date.setMinutes(0, 0, 0);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function criarFormPadrao(): FormState {
  return {
    titulo: '',
    descricao: '',
    inicioLocal: agoraLocalInput(),
    duracaoMinutos: DEFAULT_DURATION_MINUTES,
    timezone: timezoneLocal(),
    adicionarAoGoogleCalendar: false,
    adicionarGoogleMeet: false,
  };
}

function corStatus(status: StatusSessaoAgendada): 'green' | 'yellow' | 'red' | 'gray' {
  if (status === 'ABERTA') return 'green';
  if (status === 'AGENDADA' || status === 'PROCESSANDO_ABERTURA') return 'yellow';
  if (status === 'FALHA_ABERTURA') return 'red';
  return 'gray';
}

function corCalendar(status: StatusSyncCalendar): 'green' | 'yellow' | 'red' | 'gray' {
  if (status === 'SINCRONIZADO') return 'green';
  if (status === 'PENDENTE') return 'yellow';
  if (status === 'FALHOU') return 'red';
  return 'gray';
}

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function CampaignScheduledSessionsSection({
  campanhaId,
  usuarioEhMestre,
  onSessaoAberta,
}: Props) {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<SessaoAgendadaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(() => criarFormPadrao());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const [calendarAutorizado, setCalendarAutorizado] = useState(false);

  const agendadasAtivas = useMemo(
    () => agendamentos.filter((item) => item.status === 'AGENDADA'),
    [agendamentos],
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [lista, googleStatus] = await Promise.all([
        apiListarSessoesAgendadasCampanha(campanhaId),
        apiObterIntegracaoGoogle().catch(() => null),
      ]);
      setAgendamentos(lista);
      setCalendarAutorizado(Boolean(googleStatus?.calendarAutorizado));
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function resetForm() {
    setForm(criarFormPadrao());
    setEditandoId(null);
    setFormAberto(false);
  }

  function editarAgendamento(agendamento: SessaoAgendadaResumo) {
    setEditandoId(agendamento.id);
    setForm({
      titulo: agendamento.titulo,
      descricao: agendamento.descricao ?? '',
      inicioLocal: toDateTimeLocal(agendamento.inicioEm),
      duracaoMinutos: Math.max(
        15,
        Math.round(
          (new Date(agendamento.fimEm).getTime() -
            new Date(agendamento.inicioEm).getTime()) /
            60_000,
        ),
      ),
      timezone: agendamento.timezone,
      adicionarAoGoogleCalendar: agendamento.adicionarAoGoogleCalendar,
      adicionarGoogleMeet: agendamento.adicionarGoogleMeet,
    });
    setFormAberto(true);
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErro(null);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || undefined,
        inicioEm: new Date(form.inicioLocal).toISOString(),
        duracaoMinutos: form.duracaoMinutos,
        timezone: form.timezone,
        adicionarAoGoogleCalendar: form.adicionarAoGoogleCalendar,
        adicionarGoogleMeet:
          form.adicionarAoGoogleCalendar && form.adicionarGoogleMeet,
      };

      if (editandoId) {
        await apiAtualizarSessaoAgendadaCampanha(
          campanhaId,
          editandoId,
          payload,
        );
      } else {
        await apiCriarSessaoAgendadaCampanha(campanhaId, payload);
      }
      resetForm();
      await carregar();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelar(agendamentoId: number) {
    setAcaoId(agendamentoId);
    setErro(null);
    try {
      await apiCancelarSessaoAgendadaCampanha(campanhaId, agendamentoId);
      await carregar();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setAcaoId(null);
    }
  }

  async function abrir(agendamento: SessaoAgendadaResumo) {
    setAcaoId(agendamento.id);
    setErro(null);
    try {
      const atualizado = await apiAbrirSessaoAgendadaCampanha(
        campanhaId,
        agendamento.id,
      );
      await carregar();
      onSessaoAberta?.();
      if (atualizado.sessaoId) {
        router.push(`/campanhas/${campanhaId}/sessoes/${atualizado.sessaoId}`);
      }
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setAcaoId(null);
    }
  }

  async function retryCalendar(agendamentoId: number) {
    setAcaoId(agendamentoId);
    setErro(null);
    try {
      await apiRetryCalendarSessaoAgendadaCampanha(campanhaId, agendamentoId);
      await carregar();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setAcaoId(null);
    }
  }

  async function conectarCalendar() {
    setErro(null);
    try {
      const response = await apiIniciarGoogleCalendar();
      window.location.href = response.url;
    } catch (error) {
      setErro(criarErroUsuario(error));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-app-fg">
            Sessões agendadas
          </h3>
          <p className="text-xs text-app-muted">
            Prepare a próxima missão e, se quiser, envie convite pelo Google Calendar.
          </p>
        </div>
        {usuarioEhMestre ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFormAberto((valor) => !valor)}
          >
            <Icon name="scroll" className="mr-2 h-4 w-4" />
            {formAberto ? 'Fechar agenda' : 'Agendar sessão'}
          </Button>
        ) : null}
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      {formAberto && usuarioEhMestre ? (
        <Card className="space-y-4">
          <form onSubmit={submitForm} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Título"
                value={form.titulo}
                onChange={(event) =>
                  setForm((atual) => ({ ...atual, titulo: event.target.value }))
                }
                required
                maxLength={120}
              />
              <Input
                label="Início"
                type="datetime-local"
                value={form.inicioLocal}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    inicioLocal: event.target.value,
                  }))
                }
                required
              />
              <Input
                label="Duração (minutos)"
                type="number"
                min={15}
                max={24 * 60}
                value={form.duracaoMinutos}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    duracaoMinutos: Number(event.target.value),
                  }))
                }
                required
              />
              <Input
                label="Fuso horário"
                value={form.timezone}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    timezone: event.target.value,
                  }))
                }
                required
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Descrição opcional"
                  value={form.descricao}
                  onChange={(event) =>
                    setForm((atual) => ({
                      ...atual,
                      descricao: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-app-border bg-app-bg/40 p-3">
              <Checkbox
                label="Adicionar ao Google Calendar"
                checked={form.adicionarAoGoogleCalendar}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    adicionarAoGoogleCalendar: event.target.checked,
                    adicionarGoogleMeet: event.target.checked
                      ? atual.adicionarGoogleMeet
                      : false,
                  }))
                }
              />
              <Checkbox
                label="Adicionar Google Meet"
                checked={form.adicionarGoogleMeet}
                disabled={!form.adicionarAoGoogleCalendar}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    adicionarGoogleMeet: event.target.checked,
                  }))
                }
              />
              {form.adicionarAoGoogleCalendar && !calendarAutorizado ? (
                <Alert variant="warning">
                  Sua conta ainda não autorizou o Google Calendar. O agendamento
                  local será salvo, mas a sincronização pode falhar até autorizar.
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="ml-2"
                    onClick={conectarCalendar}
                  >
                    Autorizar agora
                  </Button>
                </Alert>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Salvando...'
                  : editandoId
                    ? 'Salvar reagendamento'
                    : 'Agendar sessão'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <p className="text-sm text-app-muted">
          <Icon name="spinner" className="mr-2 inline h-4 w-4" />
          Carregando agenda...
        </p>
      ) : agendamentos.length === 0 ? (
        <EmptyState
          variant="card"
          icon="scroll"
          title="Nenhuma sessão agendada"
          description="Agende uma missão futura para manter a mesa alinhada."
          size="sm"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {agendamentos.map((agendamento) => (
            <Card key={agendamento.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-app-fg">
                    {agendamento.titulo}
                  </h4>
                  <p className="text-xs text-app-muted">
                    {formatarDataHora(agendamento.inicioEm)} até{' '}
                    {formatarDataHora(agendamento.fimEm)}
                  </p>
                </div>
                <Badge color={corStatus(agendamento.status)} size="sm">
                  {agendamento.status}
                </Badge>
              </div>

              {agendamento.descricao ? (
                <p className="text-sm text-app-muted line-clamp-3">
                  {agendamento.descricao}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Badge color={corCalendar(agendamento.calendarSyncStatus)} size="sm">
                  Calendar: {agendamento.calendarSyncStatus}
                </Badge>
                {agendamento.googleMeetLink ? (
                  <a
                    href={agendamento.googleMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-app-primary hover:underline"
                  >
                    Abrir Meet
                  </a>
                ) : null}
                {agendamento.googleCalendarHtmlLink ? (
                  <a
                    href={agendamento.googleCalendarHtmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-app-primary hover:underline"
                  >
                    Abrir Calendar
                  </a>
                ) : null}
              </div>

              {agendamento.calendarSyncError ? (
                <Alert variant="warning">{agendamento.calendarSyncError}</Alert>
              ) : null}

              {usuarioEhMestre ? (
                <div className="flex flex-wrap gap-2">
                  {agendamento.status === 'AGENDADA' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void abrir(agendamento)}
                        disabled={acaoId === agendamento.id}
                      >
                        Abrir agora
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => editarAgendamento(agendamento)}
                      >
                        Reagendar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void cancelar(agendamento.id)}
                        disabled={acaoId === agendamento.id}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : null}
                  {agendamento.calendarSyncStatus === 'FALHOU' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void retryCalendar(agendamento.id)}
                      disabled={acaoId === agendamento.id}
                    >
                      Tentar Calendar novamente
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {!loading && agendadasAtivas.length > 0 ? (
        <p className="text-xs text-app-muted">
          {agendadasAtivas.length} sessão(ões) aguardando o horário marcado.
        </p>
      ) : null}
    </section>
  );
}
