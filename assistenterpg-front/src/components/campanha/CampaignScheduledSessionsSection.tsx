'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  apiAbrirSessaoAgendadaCampanha,
  apiAtualizarSessaoAgendadaCampanha,
  apiCancelarSessaoAgendadaCampanha,
  apiCriarSessaoAgendadaCampanha,
  apiIniciarGoogleCalendar,
  apiListarConflitosSessaoAgendadaCampanha,
  apiListarSessoesAgendadasCampanha,
  apiObterIntegracaoGoogle,
  apiRetryCalendarSessaoAgendadaCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type {
  ConflitosSessaoAgendadaResponse,
  SessaoAgendadaResumo,
  StatusSessaoAgendada,
  StatusSyncCalendar,
  UserErrorState,
} from '@/lib/types';
import {
  CUSTOM_DURATION_VALUE,
  SESSION_DURATION_OPTIONS,
  chaveRascunhoAgendamento,
  criarConsultaConflitosAgendamento,
  criarFormAgendamentoEdicao,
  criarFormAgendamentoPadrao,
  criarPayloadAgendamento,
  dateToDateTimeLocal,
  duracaoCustomizadaValida,
  isScheduleSessionValidationError,
  restaurarRascunhoAgendamento,
  serializarRascunhoAgendamento,
  type ScheduleSessionFormState,
} from '@/lib/campanhas/schedule-session.helpers';
import { formatarDataHora } from '@/lib/utils/formatters';
import { useToast } from '@/context/ToastContext';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

type Props = {
  campanhaId: number;
  usuarioEhMestre: boolean;
  onSessaoAberta?: () => void;
  onAgendaChange?: () => void;
};

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

type SetScheduleForm = Dispatch<SetStateAction<ScheduleSessionFormState>>;

function DurationSelect({
  form,
  setForm,
}: {
  form: ScheduleSessionFormState;
  setForm: SetScheduleForm;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="schedule-duration"
        className="ml-1 text-sm font-semibold text-app-fg/90"
      >
        Duração estimada
      </label>
      <select
        id="schedule-duration"
        value={form.duracaoPreset}
        onChange={(event) => {
          const value = event.target.value;
          setForm((atual) => ({
            ...atual,
            duracaoPreset: value,
            duracaoMinutos:
              value === CUSTOM_DURATION_VALUE
                ? atual.duracaoMinutos
                : Number(value),
          }));
        }}
        className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-fg transition-all duration-200 hover:border-app-primary/30 focus-visible:border-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40"
      >
        {SESSION_DURATION_OPTIONS.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM_DURATION_VALUE}>Personalizada</option>
      </select>
      {form.duracaoPreset === CUSTOM_DURATION_VALUE ? (
        <Input
          label="Duração personalizada em minutos"
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
          error={
            duracaoCustomizadaValida(form.duracaoMinutos)
              ? undefined
              : 'Use um valor entre 15 e 1440 minutos.'
          }
        />
      ) : null}
    </div>
  );
}

function CalendarConflictPreview({
  conflitos,
  loading,
  erro,
}: {
  conflitos: ConflitosSessaoAgendadaResponse | null;
  loading: boolean;
  erro: string | null;
}) {
  const locais = conflitos?.assistenteRpg ?? [];
  const google = conflitos?.googleCalendar ?? [];

  return (
    <aside className="rounded-xl border border-app-border bg-app-bg/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-app-fg">Agenda do dia</h4>
          <p className="text-xs text-app-muted">
            Abaixo só aparecem compromissos marcados no site do Assistente RPG, leve em consideração outros compromissos na sua agenda.
          </p>
        </div>
        {loading ? <Icon name="spinner" className="h-4 w-4 text-app-muted" /> : null}
      </div>

      {erro ? <Alert variant="warning">{erro}</Alert> : null}

      {!loading && !erro && locais.length === 0 && google.length === 0 ? (
        <p className="mt-4 rounded-lg border border-app-border/70 bg-app-surface/40 p-3 text-xs text-app-muted">
          Nenhum agendamento encontrado nesse período.
        </p>
      ) : null}

      {locais.length > 0 ? (
        <div className="mt-4 space-y-2">
          <Badge color="blue" size="sm">
            AssistenteRPG
          </Badge>
          {locais.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-app-warning/30 bg-app-warning/10 p-3"
            >
              <p className="text-sm font-semibold text-app-fg">{item.titulo}</p>
              <p className="text-xs text-app-muted">
                {formatarDataHora(item.inicioEm)} até {formatarDataHora(item.fimEm)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {google.length > 0 ? (
        <div className="mt-4 space-y-2">
          <Badge color="green" size="sm">
            Google Calendar
          </Badge>
          {google.map((item, index) => (
            <div
              key={item.id ?? `${item.titulo}-${index}`}
              className="rounded-lg border border-app-border/70 bg-app-surface/40 p-3"
            >
              <p className="text-sm font-semibold text-app-fg">{item.titulo}</p>
              <p className="text-xs text-app-muted">
                {item.inicioEm ? formatarDataHora(item.inicioEm) : 'Início indefinido'}
                {item.fimEm ? ` até ${formatarDataHora(item.fimEm)}` : ''}
              </p>
              {item.htmlLink ? (
                <a
                  href={item.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-semibold text-app-primary hover:underline"
                >
                  Abrir no Google
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {conflitos?.googleCalendarErro ? (
        <Alert variant="warning">{conflitos.googleCalendarErro}</Alert>
      ) : null}
    </aside>
  );
}

export function CampaignScheduledSessionsSection({
  campanhaId,
  usuarioEhMestre,
  onSessaoAberta,
  onAgendaChange,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [agendamentos, setAgendamentos] = useState<SessaoAgendadaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<ScheduleSessionFormState>(() =>
    criarFormAgendamentoPadrao(),
  );
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const [calendarAutorizado, setCalendarAutorizado] = useState(false);
  const [conflitos, setConflitos] =
    useState<ConflitosSessaoAgendadaResponse | null>(null);
  const [conflitosLoading, setConflitosLoading] = useState(false);
  const [erroConflitos, setErroConflitos] = useState<string | null>(null);
  const [minInicioLocal, setMinInicioLocal] = useState('');

  const agendadasAtivas = useMemo(
    () => agendamentos.filter((item) => item.status === 'AGENDADA'),
    [agendamentos],
  );
  const rascunhoKey = useMemo(
    () => chaveRascunhoAgendamento(campanhaId),
    [campanhaId],
  );
  const consultaConflitos = useMemo(
    () => ({
      inicioLocal: form.inicioLocal,
      duracaoMinutos: form.duracaoMinutos,
      timezone: form.timezone,
      incluirGoogle: calendarAutorizado && form.adicionarAoGoogleCalendar,
    }),
    [
      calendarAutorizado,
      form.adicionarAoGoogleCalendar,
      form.duracaoMinutos,
      form.inicioLocal,
      form.timezone,
    ],
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

  useEffect(() => {
    setMinInicioLocal(dateToDateTimeLocal(new Date()));
  }, []);

  useEffect(() => {
    if (
      !formAberto ||
      !consultaConflitos.inicioLocal ||
      !duracaoCustomizadaValida(consultaConflitos.duracaoMinutos)
    ) {
      setConflitos(null);
      setConflitosLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      let intervalo: ReturnType<typeof criarConsultaConflitosAgendamento>;
      try {
        intervalo = criarConsultaConflitosAgendamento(consultaConflitos);
      } catch {
        if (cancelled) return;
        setConflitos(null);
        setErroConflitos('Informe data, hora e dura\u00e7\u00e3o v\u00e1lidas.');
        return;
      }
      setConflitosLoading(true);
      setErroConflitos(null);
      apiListarConflitosSessaoAgendadaCampanha(campanhaId, {
        inicioEm: intervalo.inicioEm,
        fimEm: intervalo.fimEm,
        incluirGoogle: intervalo.incluirGoogle,
      })
        .then((data) => {
          if (!cancelled) setConflitos(data);
        })
        .catch(() => {
          if (cancelled) return;
          setConflitos(null);
          setErroConflitos('N\u00e3o foi poss\u00edvel carregar a agenda do dia.');
        })
        .finally(() => {
          if (!cancelled) setConflitosLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    campanhaId,
    consultaConflitos,
    formAberto,
  ]);

  useEffect(() => {
    if (
      !usuarioEhMestre ||
      !calendarAutorizado ||
      formAberto ||
      typeof window === 'undefined'
    ) {
      return;
    }
    const rascunho = restaurarRascunhoAgendamento(
      window.sessionStorage.getItem(rascunhoKey),
    );
    if (!rascunho) return;
    window.sessionStorage.removeItem(rascunhoKey);
    setEditandoId(null);
    setForm(rascunho);
    setConflitos(null);
    setErroConflitos(null);
    setFormAberto(true);
  }, [calendarAutorizado, formAberto, rascunhoKey, usuarioEhMestre]);

  function resetForm() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(rascunhoKey);
    }
    setForm(criarFormAgendamentoPadrao());
    setEditandoId(null);
    setFormAberto(false);
    setConflitos(null);
    setErroConflitos(null);
  }

  function abrirModalCriacao() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(rascunhoKey);
    }
    setEditandoId(null);
    setForm(criarFormAgendamentoPadrao());
    setConflitos(null);
    setErroConflitos(null);
    setFormAberto(true);
  }

  function editarAgendamento(agendamento: SessaoAgendadaResumo) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(rascunhoKey);
    }
    setEditandoId(agendamento.id);
    setForm(criarFormAgendamentoEdicao(agendamento));
    setConflitos(null);
    setErroConflitos(null);
    setFormAberto(true);
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    if (!duracaoCustomizadaValida(form.duracaoMinutos)) {
      setErro({
        message: 'Informe uma dura\u00e7\u00e3o estimada entre 15 minutos e 24 horas.',
      });
      return;
    }
    if (form.adicionarAoGoogleCalendar && !calendarAutorizado) {
      setErro({
        message: 'Autorize o Google Calendar antes de enviar convites.',
      });
      return;
    }
    let payload: ReturnType<typeof criarPayloadAgendamento>;
    try {
      payload = criarPayloadAgendamento(form);
    } catch (error) {
      setErro(
        isScheduleSessionValidationError(error)
          ? { message: error.message }
          : criarErroUsuario(error),
      );
      return;
    }
    setSubmitting(true);
    setErro(null);
    try {
      const estavaEditando = Boolean(editandoId);
      let salvo: SessaoAgendadaResumo;

      if (editandoId) {
        salvo = await apiAtualizarSessaoAgendadaCampanha(
          campanhaId,
          editandoId,
          payload,
        );
      } else {
        salvo = await apiCriarSessaoAgendadaCampanha(campanhaId, payload);
      }
      resetForm();
      await carregar();
      onAgendaChange?.();
      showToast(
        estavaEditando ? 'Sess\u00e3o reagendada.' : 'Sess\u00e3o agendada.',
        'success',
      );
      if (
        salvo.adicionarAoGoogleCalendar &&
        salvo.calendarSyncStatus === 'FALHOU'
      ) {
        showToast(
          'Agendamento local salvo, mas o Google Calendar n\u00e3o sincronizou.',
          'warning',
        );
      }
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
      onAgendaChange?.();
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
      onAgendaChange?.();
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
      onAgendaChange?.();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setAcaoId(null);
    }
  }

  async function conectarCalendar() {
    setErro(null);
    try {
      const redirect =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : `/campanhas/${campanhaId}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          rascunhoKey,
          serializarRascunhoAgendamento(form),
        );
      }
      const response = await apiIniciarGoogleCalendar(redirect);
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
            onClick={abrirModalCriacao}
          >
            <Icon name="calendar" className="mr-2 h-4 w-4" />
            Agendar sessão
          </Button>
        ) : null}
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      <Modal
        isOpen={formAberto && usuarioEhMestre}
        onClose={resetForm}
        title={editandoId ? 'Reagendar sessão' : 'Agendar sessão'}
        size="xl"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="schedule-session-form"
              disabled={submitting}
            >
              {submitting
                ? 'Salvando...'
                : editandoId
                  ? 'Salvar reagendamento'
                  : 'Agendar sessão'}
            </Button>
          </div>
        }
      >
        <form
          id="schedule-session-form"
          onSubmit={submitForm}
          className="space-y-5"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Título *"
                    value={form.titulo}
                    onChange={(event) =>
                      setForm((atual) => ({
                        ...atual,
                        titulo: event.target.value,
                      }))
                    }
                    required
                    maxLength={120}
                  />
                </div>
                <DateTimePicker
                  label="Data e hora de início *"
                  value={form.inicioLocal}
                  onChange={(value) =>
                    setForm((atual) => ({
                      ...atual,
                      inicioLocal: value,
                    }))
                  }
                  minDateTime={minInicioLocal || undefined}
                  required
                />
                <DurationSelect form={form} setForm={setForm} />
              </div>

              <div className="rounded-xl border border-app-border bg-app-bg/40 p-3 text-xs text-app-muted">
                <div className="flex items-center gap-2 text-app-fg">
                  <Icon name="clock" className="h-4 w-4 text-app-primary" />
                  <span className="font-semibold">
                    Fuso horário detectado: {form.timezone}
                  </span>
                </div>
                {form.timezoneFallback ? (
                  <p className="mt-1">
                    Não foi possível detectar o fuso do navegador. Usando
                    America/Fortaleza como fallback; confira o horario antes
                    de enviar.
                  </p>
                ) : null}
              </div>

              <details className="rounded-xl border border-app-border bg-app-bg/40 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-app-fg">
                  Notas internas da sessão
                </summary>
                <div className="mt-3">
                  <Textarea
                    label="Notas opcionais"
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
              </details>

              <div className="space-y-4 rounded-xl border border-app-border bg-app-bg/40 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-app-fg">
                    Google Calendar
                  </h4>
                  <p className="text-xs text-app-muted">
                    Envie o evento para os membros da campanha quando o Calendar
                    estiver autorizado.
                  </p>
                </div>
                <div className="grid gap-3">
                  <Checkbox
                    className="rounded-lg border border-app-border/70 bg-app-surface/40 p-3"
                    label="Adicionar ao Google Calendar"
                    checked={form.adicionarAoGoogleCalendar}
                    disabled={!calendarAutorizado}
                    onChange={(event) =>
                      setForm((atual) => ({
                        ...atual,
                        adicionarAoGoogleCalendar: event.target.checked,
                        adicionarGoogleMeet: false,
                      }))
                    }
                  />
                </div>
                {!calendarAutorizado ? (
                  <Alert variant="warning">
                    Autorize o Google Calendar para enviar convites.
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
            </div>

            <CalendarConflictPreview
              conflitos={conflitos}
              loading={conflitosLoading}
              erro={erroConflitos}
            />
          </div>
        </form>
      </Modal>

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
