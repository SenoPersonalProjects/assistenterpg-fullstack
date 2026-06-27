import {
  StatusContaUsuario,
  StatusSessaoAgendada,
  StatusSyncCalendar,
} from '@prisma/client';
import { GoogleCalendarService } from 'src/google/google-calendar.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessaoActivationService } from './sessao-activation.service';
import { SessaoAgendadaService } from './sessao-agendada.service';

type PrismaMock = {
  campanha: {
    findUnique: jest.Mock;
  };
  sessaoAgendada: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

const acessoCampanha = {
  id: 1,
  donoId: 10,
  dono: {
    id: 10,
    email: 'mestre@example.com',
    emailVerificadoEm: new Date(),
    status: StatusContaUsuario.ATIVA,
  },
  membros: [],
};

describe('SessaoAgendadaService', () => {
  let prisma: PrismaMock;
  let calendarService: {
    possuiAutorizacaoCalendar: jest.Mock;
    listarConflitos: jest.Mock;
  };
  let service: SessaoAgendadaService;

  beforeEach(() => {
    prisma = {
      campanha: {
        findUnique: jest.fn().mockResolvedValue(acessoCampanha),
      },
      sessaoAgendada: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    calendarService = {
      possuiAutorizacaoCalendar: jest.fn().mockResolvedValue(false),
      listarConflitos: jest.fn().mockResolvedValue([]),
    };
    service = new SessaoAgendadaService(
      prisma as unknown as PrismaService,
      calendarService as unknown as GoogleCalendarService,
      {
        processarVencidasComFallbackLazy: jest.fn(),
      } as unknown as SessaoActivationService,
    );
  });

  it('aplica duração padrão de 120 minutos quando não informada', async () => {
    let criado: Record<string, unknown> | null = null;
    prisma.sessaoAgendada.create.mockImplementation(({ data }) => {
      criado = {
        id: 1,
        ...data,
        sessaoId: null,
        status: StatusSessaoAgendada.AGENDADA,
        canceladaEm: null,
        abertaEm: null,
        falhaAbertura: null,
        googleCalendarHtmlLink: null,
        googleMeetLink: null,
        calendarSyncStatus: StatusSyncCalendar.NAO_SOLICITADO,
        calendarSyncError: null,
        calendarSyncAttempts: 0,
        lastCalendarSyncAt: null,
        criador: { id: 10, apelido: 'Mestre', email: 'mestre@example.com' },
        sessao: null,
      };
      return Promise.resolve(criado);
    });
    prisma.sessaoAgendada.findMany.mockImplementation(() =>
      Promise.resolve(criado ? [criado] : []),
    );

    await service.criar(1, 10, {
      titulo: 'Próxima missão',
      inicioEm: '2030-01-01T20:00:00.000Z',
      timezone: 'America/Fortaleza',
    });

    const createData = prisma.sessaoAgendada.create.mock.calls[0][0].data;
    expect(
      (createData.fimEm as Date).getTime() -
        (createData.inicioEm as Date).getTime(),
    ).toBe(120 * 60_000);
  });

  it('bloqueia Google Meet quando Calendar não foi solicitado', async () => {
    await expect(
      service.criar(1, 10, {
        titulo: 'Missão remota',
        inicioEm: '2030-01-01T20:00:00.000Z',
        timezone: 'America/Fortaleza',
        adicionarGoogleMeet: true,
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'SESSAO_AGENDADA_MEET_REQUER_CALENDAR',
      }),
    });

    expect(prisma.sessaoAgendada.create).not.toHaveBeenCalled();
  });

  it('retorna conflitos locais e do Google sem vazar outras campanhas', async () => {
    calendarService.possuiAutorizacaoCalendar.mockResolvedValue(true);
    prisma.sessaoAgendada.findMany.mockResolvedValue([
      {
        id: 5,
        titulo: 'Sessão existente',
        inicioEm: new Date('2030-01-01T20:00:00.000Z'),
        fimEm: new Date('2030-01-01T22:00:00.000Z'),
        status: StatusSessaoAgendada.AGENDADA,
        calendarSyncStatus: StatusSyncCalendar.SINCRONIZADO,
      },
    ]);
    calendarService.listarConflitos.mockResolvedValue([
      {
        id: 'google-1',
        titulo: 'Evento Google',
        inicioEm: '2030-01-01T21:00:00.000Z',
        fimEm: '2030-01-01T22:00:00.000Z',
        htmlLink: 'https://calendar.google.com/event',
      },
    ]);

    const conflitos = await service.listarConflitos(1, 10, {
      inicioEm: '2030-01-01T19:00:00.000Z',
      fimEm: '2030-01-01T23:00:00.000Z',
      incluirGoogle: 'true',
    });

    expect(prisma.sessaoAgendada.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ campanhaId: 1 }),
      }),
    );
    expect(conflitos.assistenteRpg).toHaveLength(1);
    expect(conflitos.googleCalendar).toHaveLength(1);
  });

  it('nao consulta conflitos Google sem autorizacao Calendar', async () => {
    prisma.sessaoAgendada.findMany.mockResolvedValue([]);
    calendarService.possuiAutorizacaoCalendar.mockResolvedValue(false);

    const conflitos = await service.listarConflitos(1, 10, {
      inicioEm: '2030-01-01T19:00:00.000Z',
      fimEm: '2030-01-01T23:00:00.000Z',
      incluirGoogle: 'true',
    });

    expect(calendarService.listarConflitos).not.toHaveBeenCalled();
    expect(conflitos.googleCalendar).toEqual([]);
    expect(conflitos.googleCalendarErro).toBeNull();
  });

  it('permite atualizar titulo de agendamento com inicio passado sem revalidar horario', async () => {
    const atual = criarAgendamentoTeste({
      inicioEm: new Date('2020-01-01T20:00:00.000Z'),
      fimEm: new Date('2020-01-01T22:00:00.000Z'),
    });
    const atualizado = { ...atual, titulo: 'Missao revisada' };
    prisma.sessaoAgendada.findFirst.mockResolvedValue(atual);
    prisma.sessaoAgendada.update.mockResolvedValue(atualizado);
    prisma.sessaoAgendada.findMany.mockResolvedValue([comResumo(atualizado)]);

    const resultado = await service.atualizar(1, 5, 10, {
      titulo: 'Missao revisada',
      descricao: 'Notas ajustadas',
    });

    expect(resultado.titulo).toBe('Missao revisada');
    expect(prisma.sessaoAgendada.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inicioEm: atual.inicioEm,
          fimEm: atual.fimEm,
        }),
      }),
    );
  });

  it('bloqueia reagendamento para inicio passado', async () => {
    prisma.sessaoAgendada.findFirst.mockResolvedValue(criarAgendamentoTeste());

    await expect(
      service.atualizar(1, 5, 10, {
        inicioEm: '2020-01-01T20:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'SESSAO_AGENDADA_INICIO_PASSADO',
      }),
    });

    expect(prisma.sessaoAgendada.update).not.toHaveBeenCalled();
  });

  it('bloqueia atualizacao com fim anterior ao inicio', async () => {
    prisma.sessaoAgendada.findFirst.mockResolvedValue(criarAgendamentoTeste());

    await expect(
      service.atualizar(1, 5, 10, {
        fimEm: '2030-01-01T19:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'SESSAO_AGENDADA_DURACAO_INVALIDA',
      }),
    });

    expect(prisma.sessaoAgendada.update).not.toHaveBeenCalled();
  });

  it('permite reagendar para data futura', async () => {
    const atual = criarAgendamentoTeste();
    const novoInicio = new Date('2030-02-01T20:00:00.000Z');
    const novoFim = new Date('2030-02-01T22:00:00.000Z');
    const atualizado = {
      ...atual,
      inicioEm: novoInicio,
      fimEm: novoFim,
    };
    prisma.sessaoAgendada.findFirst.mockResolvedValue(atual);
    prisma.sessaoAgendada.update.mockResolvedValue(atualizado);
    prisma.sessaoAgendada.findMany.mockResolvedValue([comResumo(atualizado)]);

    const resultado = await service.atualizar(1, 5, 10, {
      inicioEm: novoInicio.toISOString(),
      duracaoMinutos: 120,
    });

    expect(resultado.inicioEm).toBe(novoInicio.toISOString());
    expect(prisma.sessaoAgendada.update).toHaveBeenCalled();
  });
});

function criarAgendamentoTeste(
  overrides: Partial<ReturnType<typeof criarAgendamentoBase>> = {},
) {
  return {
    ...criarAgendamentoBase(),
    ...overrides,
  };
}

function criarAgendamentoBase() {
  return {
    id: 5,
    campanhaId: 1,
    criadorId: 10,
    sessaoId: null,
    titulo: 'Missao agendada',
    descricao: null,
    inicioEm: new Date('2030-01-01T20:00:00.000Z'),
    fimEm: new Date('2030-01-01T22:00:00.000Z'),
    timezone: 'America/Fortaleza',
    status: StatusSessaoAgendada.AGENDADA,
    canceladaEm: null,
    abertaEm: null,
    falhaAbertura: null,
    adicionarAoGoogleCalendar: false,
    adicionarGoogleMeet: false,
    googleCalendarEventId: null,
    googleCalendarHtmlLink: null,
    googleCalendarICalUID: null,
    googleMeetLink: null,
    calendarSyncStatus: StatusSyncCalendar.NAO_SOLICITADO,
    calendarSyncError: null,
    calendarSyncAttempts: 0,
    lastCalendarSyncAt: null,
    nextCalendarSyncAt: null,
  };
}

function comResumo(agendamento: ReturnType<typeof criarAgendamentoBase>) {
  return {
    ...agendamento,
    criador: { id: 10, apelido: 'Mestre', email: 'mestre@example.com' },
    sessao: null,
  };
}
