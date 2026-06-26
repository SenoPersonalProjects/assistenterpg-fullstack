import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  StatusContaUsuario,
  StatusSessaoAgendada,
  StatusSyncCalendar,
} from '@prisma/client';
import {
  GoogleCalendarService,
  type GoogleCalendarEventInput,
} from 'src/google/google-calendar.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AtualizarSessaoAgendadaDto,
  CriarSessaoAgendadaDto,
} from './dto/sessao-agendada.dto';
import { SessaoActivationService } from './sessao-activation.service';

const DEFAULT_DURATION_MINUTES = 180;

type AcessoCampanha = {
  campanha: {
    id: number;
    donoId: number;
    dono: {
      id: number;
      email: string;
      emailVerificadoEm: Date | null;
      status: StatusContaUsuario;
    };
    membros: Array<{
      usuarioId: number;
      papel: string;
      usuario: {
        id: number;
        email: string;
        emailVerificadoEm: Date | null;
        status: StatusContaUsuario;
      };
    }>;
  };
  ehMestre: boolean;
};

@Injectable()
export class SessaoAgendadaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarService: GoogleCalendarService,
    private readonly activationService: SessaoActivationService,
  ) {}

  async listar(campanhaId: number, usuarioId: number) {
    await this.processarLazy(campanhaId);
    await this.obterAcessoCampanha(campanhaId, usuarioId);

    const agendamentos = await this.prisma.sessaoAgendada.findMany({
      where: { campanhaId },
      orderBy: [{ inicioEm: 'asc' }, { id: 'asc' }],
      include: {
        criador: { select: { id: true, apelido: true, email: true } },
        sessao: { select: { id: true, status: true } },
      },
    });

    return agendamentos.map((agendamento) => ({
      id: agendamento.id,
      campanhaId: agendamento.campanhaId,
      sessaoId: agendamento.sessaoId,
      titulo: agendamento.titulo,
      descricao: agendamento.descricao,
      inicioEm: agendamento.inicioEm.toISOString(),
      fimEm: agendamento.fimEm.toISOString(),
      timezone: agendamento.timezone,
      status: agendamento.status,
      canceladaEm: agendamento.canceladaEm?.toISOString() ?? null,
      abertaEm: agendamento.abertaEm?.toISOString() ?? null,
      falhaAbertura: agendamento.falhaAbertura,
      adicionarAoGoogleCalendar: agendamento.adicionarAoGoogleCalendar,
      adicionarGoogleMeet: agendamento.adicionarGoogleMeet,
      googleCalendarHtmlLink: agendamento.googleCalendarHtmlLink,
      googleMeetLink: agendamento.googleMeetLink,
      calendarSyncStatus: agendamento.calendarSyncStatus,
      calendarSyncError: agendamento.calendarSyncError,
      calendarSyncAttempts: agendamento.calendarSyncAttempts,
      lastCalendarSyncAt: agendamento.lastCalendarSyncAt?.toISOString() ?? null,
      criador: agendamento.criador,
      sessao: agendamento.sessao,
    }));
  }

  async criar(
    campanhaId: number,
    usuarioId: number,
    dto: CriarSessaoAgendadaDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso);
    const datas = this.resolverDatas(dto);
    this.validarFutura(datas.inicioEm);

    const agendamento = await this.prisma.sessaoAgendada.create({
      data: {
        campanhaId,
        criadorId: usuarioId,
        titulo: dto.titulo.trim(),
        descricao: dto.descricao?.trim() || null,
        inicioEm: datas.inicioEm,
        fimEm: datas.fimEm,
        timezone: dto.timezone,
        adicionarAoGoogleCalendar: Boolean(dto.adicionarAoGoogleCalendar),
        adicionarGoogleMeet: Boolean(dto.adicionarGoogleMeet),
        calendarSyncStatus: dto.adicionarAoGoogleCalendar
          ? StatusSyncCalendar.PENDENTE
          : StatusSyncCalendar.NAO_SOLICITADO,
      },
    });

    if (agendamento.adicionarAoGoogleCalendar) {
      await this.sincronizarCalendar(agendamento.id);
    }

    return this.buscarPorIdParaUsuario(campanhaId, agendamento.id, usuarioId);
  }

  async atualizar(
    campanhaId: number,
    agendamentoId: number,
    usuarioId: number,
    dto: AtualizarSessaoAgendadaDto,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso);
    const atual = await this.obterAgendamento(campanhaId, agendamentoId);
    this.assertEditavel(atual.status);

    const datas = this.resolverDatas({
      inicioEm: dto.inicioEm ?? atual.inicioEm.toISOString(),
      fimEm:
        dto.duracaoMinutos === undefined
          ? (dto.fimEm ?? atual.fimEm.toISOString())
          : dto.fimEm,
      duracaoMinutos: dto.duracaoMinutos,
      timezone: dto.timezone ?? atual.timezone,
    });
    this.validarFutura(datas.inicioEm);

    const adicionarAoGoogleCalendar =
      dto.adicionarAoGoogleCalendar ?? atual.adicionarAoGoogleCalendar;

    await this.prisma.sessaoAgendada.update({
      where: { id: agendamentoId },
      data: {
        titulo: dto.titulo?.trim() ?? atual.titulo,
        descricao:
          dto.descricao === undefined
            ? atual.descricao
            : dto.descricao?.trim() || null,
        inicioEm: datas.inicioEm,
        fimEm: datas.fimEm,
        timezone: dto.timezone ?? atual.timezone,
        adicionarAoGoogleCalendar,
        adicionarGoogleMeet:
          dto.adicionarGoogleMeet ?? atual.adicionarGoogleMeet,
        calendarSyncStatus: adicionarAoGoogleCalendar
          ? StatusSyncCalendar.PENDENTE
          : StatusSyncCalendar.NAO_SOLICITADO,
        calendarSyncError: null,
      },
    });

    if (adicionarAoGoogleCalendar) {
      await this.sincronizarCalendar(agendamentoId);
    }

    return this.buscarPorIdParaUsuario(campanhaId, agendamentoId, usuarioId);
  }

  async cancelar(campanhaId: number, agendamentoId: number, usuarioId: number) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso);
    const agendamento = await this.obterAgendamento(campanhaId, agendamentoId);
    if (agendamento.status === StatusSessaoAgendada.ABERTA) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_JA_ABERTA',
        message: 'Sessão agendada já foi aberta.',
      });
    }

    let calendarStatus: StatusSyncCalendar = StatusSyncCalendar.CANCELADO;
    let calendarError: string | null = null;
    if (agendamento.googleCalendarEventId) {
      try {
        await this.calendarService.cancelarEvento(
          agendamento.criadorId,
          agendamento.googleCalendarEventId,
        );
      } catch (error) {
        calendarStatus = StatusSyncCalendar.FALHOU;
        calendarError = this.formatarErro(error);
      }
    }

    await this.prisma.sessaoAgendada.update({
      where: { id: agendamentoId },
      data: {
        status: StatusSessaoAgendada.CANCELADA,
        canceladaEm: new Date(),
        calendarSyncStatus: calendarStatus,
        calendarSyncError: calendarError,
      },
    });

    return this.buscarPorIdParaUsuario(campanhaId, agendamentoId, usuarioId);
  }

  async abrirAgora(
    campanhaId: number,
    agendamentoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso);
    const resultado = await this.activationService.abrirAgendamento(
      agendamentoId,
      { permitirFuturo: true },
    );
    if (!resultado) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_NAO_ABERTA',
        message: 'Não foi possível abrir a sessão agendada.',
      });
    }
    return this.buscarPorIdParaUsuario(campanhaId, agendamentoId, usuarioId);
  }

  async retryCalendar(
    campanhaId: number,
    agendamentoId: number,
    usuarioId: number,
  ) {
    const acesso = await this.obterAcessoCampanha(campanhaId, usuarioId);
    this.assertMestre(acesso);
    await this.sincronizarCalendar(agendamentoId);
    return this.buscarPorIdParaUsuario(campanhaId, agendamentoId, usuarioId);
  }

  private async buscarPorIdParaUsuario(
    campanhaId: number,
    agendamentoId: number,
    usuarioId: number,
  ) {
    const todos = await this.listar(campanhaId, usuarioId);
    const encontrado = todos.find((item) => item.id === agendamentoId);
    if (!encontrado) {
      throw new NotFoundException({
        code: 'SESSAO_AGENDADA_NOT_FOUND',
        message: 'Sessão agendada não encontrada.',
      });
    }
    return encontrado;
  }

  private async sincronizarCalendar(agendamentoId: number): Promise<void> {
    const agendamento = await this.prisma.sessaoAgendada.findUnique({
      where: { id: agendamentoId },
      include: {
        campanha: {
          include: {
            dono: {
              select: {
                id: true,
                email: true,
                emailVerificadoEm: true,
                status: true,
              },
            },
            membros: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    email: true,
                    emailVerificadoEm: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!agendamento || !agendamento.adicionarAoGoogleCalendar) return;

    const input: GoogleCalendarEventInput = {
      usuarioId: agendamento.criadorId,
      agendamentoId: agendamento.id,
      titulo: agendamento.titulo,
      descricao: agendamento.descricao,
      inicioEm: agendamento.inicioEm,
      fimEm: agendamento.fimEm,
      timezone: agendamento.timezone,
      adicionarGoogleMeet: agendamento.adicionarGoogleMeet,
      attendees: this.obterAttendees(
        agendamento.campanha,
        agendamento.criadorId,
      ),
    };

    try {
      const resultado = agendamento.googleCalendarEventId
        ? await this.calendarService.atualizarEvento(
            agendamento.googleCalendarEventId,
            input,
          )
        : await this.calendarService.criarEvento(input);

      await this.prisma.sessaoAgendada.update({
        where: { id: agendamento.id },
        data: {
          googleCalendarEventId:
            resultado.eventId ?? agendamento.googleCalendarEventId,
          googleCalendarHtmlLink: resultado.htmlLink,
          googleCalendarICalUID: resultado.iCalUID,
          googleMeetLink: resultado.meetLink,
          calendarSyncStatus: StatusSyncCalendar.SINCRONIZADO,
          calendarSyncError: null,
          calendarSyncAttempts: { increment: 1 },
          lastCalendarSyncAt: new Date(),
          nextCalendarSyncAt: null,
        },
      });
    } catch (error) {
      await this.prisma.sessaoAgendada.update({
        where: { id: agendamento.id },
        data: {
          calendarSyncStatus: StatusSyncCalendar.FALHOU,
          calendarSyncError: this.formatarErro(error),
          calendarSyncAttempts: { increment: 1 },
          lastCalendarSyncAt: new Date(),
          nextCalendarSyncAt: this.calcularProximoRetry(),
        },
      });
    }
  }

  private obterAttendees(
    campanha: AcessoCampanha['campanha'],
    criadorId: number,
  ): string[] {
    const participantes = [
      campanha.dono,
      ...campanha.membros.map((m) => m.usuario),
    ];
    return [
      ...new Set(
        participantes
          .filter(
            (usuario) =>
              usuario.id !== criadorId &&
              usuario.status === StatusContaUsuario.ATIVA &&
              Boolean(usuario.emailVerificadoEm),
          )
          .map((usuario) => usuario.email.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  }

  private resolverDatas(input: {
    inicioEm: string;
    fimEm?: string;
    duracaoMinutos?: number;
    timezone: string;
  }) {
    this.validarTimezone(input.timezone);
    const inicioEm = new Date(input.inicioEm);
    if (!Number.isFinite(inicioEm.getTime())) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_DATA_INVALIDA',
        message: 'Data de início inválida.',
      });
    }

    const fimEm = input.fimEm
      ? new Date(input.fimEm)
      : new Date(
          inicioEm.getTime() +
            (input.duracaoMinutos ?? DEFAULT_DURATION_MINUTES) * 60_000,
        );
    if (!Number.isFinite(fimEm.getTime()) || fimEm <= inicioEm) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_DURACAO_INVALIDA',
        message: 'A sessão agendada precisa terminar depois do início.',
      });
    }

    return { inicioEm, fimEm };
  }

  private validarFutura(inicioEm: Date) {
    if (inicioEm <= new Date()) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_INICIO_PASSADO',
        message: 'Agende a sessão para uma data futura.',
      });
    }
  }

  private validarTimezone(timezone: string) {
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: timezone }).format();
    } catch {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_TIMEZONE_INVALIDO',
        message: 'Fuso horário inválido.',
      });
    }
  }

  private async obterAcessoCampanha(
    campanhaId: number,
    usuarioId: number,
  ): Promise<AcessoCampanha> {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        id: true,
        donoId: true,
        dono: {
          select: {
            id: true,
            email: true,
            emailVerificadoEm: true,
            status: true,
          },
        },
        membros: {
          select: {
            usuarioId: true,
            papel: true,
            usuario: {
              select: {
                id: true,
                email: true,
                emailVerificadoEm: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!campanha) {
      throw new NotFoundException({
        code: 'CAMPANHA_NOT_FOUND',
        message: 'Campanha não encontrada.',
      });
    }

    const membroAtual = campanha.membros.find((m) => m.usuarioId === usuarioId);
    const ehDono = campanha.donoId === usuarioId;
    if (!ehDono && !membroAtual) {
      throw new ForbiddenException({
        code: 'CAMPANHA_ACCESS_DENIED',
        message: 'Você não participa desta campanha.',
      });
    }

    return {
      campanha,
      ehMestre: ehDono || membroAtual?.papel === 'MESTRE',
    };
  }

  private async obterAgendamento(campanhaId: number, agendamentoId: number) {
    const agendamento = await this.prisma.sessaoAgendada.findFirst({
      where: { id: agendamentoId, campanhaId },
    });
    if (!agendamento) {
      throw new NotFoundException({
        code: 'SESSAO_AGENDADA_NOT_FOUND',
        message: 'Sessão agendada não encontrada.',
      });
    }
    return agendamento;
  }

  private assertMestre(acesso: AcessoCampanha) {
    if (!acesso.ehMestre) {
      throw new ForbiddenException({
        code: 'CAMPANHA_APENAS_MESTRE',
        message: 'Apenas mestres podem agendar sessões.',
      });
    }
  }

  private assertEditavel(status: StatusSessaoAgendada) {
    if (status === StatusSessaoAgendada.ABERTA) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_JA_ABERTA',
        message: 'Sessão agendada já foi aberta.',
      });
    }
    if (status === StatusSessaoAgendada.CANCELADA) {
      throw new BadRequestException({
        code: 'SESSAO_AGENDADA_CANCELADA',
        message: 'Sessão agendada já foi cancelada.',
      });
    }
  }

  private async processarLazy(campanhaId: number) {
    await this.activationService.processarVencidasComFallbackLazy(campanhaId);
  }

  private calcularProximoRetry(): Date {
    return new Date(Date.now() + 15 * 60_000);
  }

  private formatarErro(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response
    ) {
      return 'Falha ao sincronizar com Google Calendar.';
    }
    return error instanceof Error
      ? error.message.slice(0, 1000)
      : 'Falha ao sincronizar com Google Calendar.';
  }
}
