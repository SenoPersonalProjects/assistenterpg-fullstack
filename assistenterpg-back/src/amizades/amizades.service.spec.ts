import { StatusAmizade } from '@prisma/client';
import { AmizadesService } from './amizades.service';
import { PresencaService } from './presenca.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AmizadeAcaoNaoPermitidaException,
  AmizadeJaExisteException,
  AmizadeNaoEncontradaException,
  AmizadeSelfException,
  AmizadeSolicitacaoDuplicadaException,
} from 'src/common/exceptions/amizade.exception';
import { UsuarioApelidoDuplicadoException } from 'src/common/exceptions/usuario.exception';

type PrismaMock = {
  usuario: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  amizade: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe('AmizadesService', () => {
  let prisma: PrismaMock;
  let presenca: PresencaService;
  let service: AmizadesService;

  beforeEach(() => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      amizade: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    presenca = new PresencaService();
    service = new AmizadesService(prisma as unknown as PrismaService, presenca);
  });

  it('cria solicitação de amizade com par normalizado', async () => {
    prisma.usuario.findMany.mockResolvedValue([{ id: 9, apelido: 'Maki' }]);
    prisma.amizade.findUnique.mockResolvedValue(null);
    prisma.amizade.create.mockResolvedValue({ id: 1 });

    const resultado = await service.criarSolicitacao(4, 'Maki');

    expect(resultado).toEqual({ id: 1 });
    expect(prisma.amizade.create).toHaveBeenCalledWith({
      data: {
        usuarioAId: 4,
        usuarioBId: 9,
        solicitanteId: 4,
        destinatarioId: 9,
      },
      include: expect.any(Object),
    });
  });

  it('bloqueia solicitação para si mesmo', async () => {
    prisma.usuario.findMany.mockResolvedValue([{ id: 4, apelido: 'Maki' }]);

    await expect(service.criarSolicitacao(4, 'Maki')).rejects.toBeInstanceOf(
      AmizadeSelfException,
    );
  });

  it('bloqueia apelido duplicado na resolucao', async () => {
    prisma.usuario.findMany.mockResolvedValue([
      { id: 4, apelido: 'Maki' },
      { id: 9, apelido: 'Maki' },
    ]);

    await expect(service.resolverUsuario('Maki')).rejects.toBeInstanceOf(
      UsuarioApelidoDuplicadoException,
    );
  });

  it('resolve usuário sem expor email', async () => {
    prisma.usuario.findMany.mockResolvedValue([{ id: 9, apelido: 'Maki' }]);

    const usuario = await service.resolverUsuario('Maki');

    expect(usuario).toEqual({ id: 9, apelido: 'Maki' });
    expect(usuario).not.toHaveProperty('email');
    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      where: { apelido: { equals: 'Maki' } },
      select: { id: true, apelido: true },
      take: 2,
    });
  });

  it('bloqueia solicitação pendente duplicada', async () => {
    prisma.usuario.findMany.mockResolvedValue([{ id: 9, apelido: 'Maki' }]);
    prisma.amizade.findUnique.mockResolvedValue({
      id: 1,
      status: StatusAmizade.PENDENTE,
    });

    await expect(service.criarSolicitacao(4, 'Maki')).rejects.toBeInstanceOf(
      AmizadeSolicitacaoDuplicadaException,
    );
  });

  it('bloqueia amizade já aceita', async () => {
    prisma.usuario.findMany.mockResolvedValue([{ id: 9, apelido: 'Maki' }]);
    prisma.amizade.findUnique.mockResolvedValue({
      id: 1,
      status: StatusAmizade.ACEITA,
    });

    await expect(service.criarSolicitacao(4, 'Maki')).rejects.toBeInstanceOf(
      AmizadeJaExisteException,
    );
  });

  it('aceita solicitação pendente recebida', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      id: 7,
      destinatarioId: 4,
      status: StatusAmizade.PENDENTE,
    });
    prisma.amizade.update.mockResolvedValue({
      id: 7,
      status: StatusAmizade.ACEITA,
    });

    const resultado = await service.aceitarSolicitacao(4, 7);

    expect(resultado).toEqual({ id: 7, status: StatusAmizade.ACEITA });
    expect(prisma.amizade.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: StatusAmizade.ACEITA,
        respondidoEm: expect.any(Date),
      },
      include: expect.any(Object),
    });
  });

  it('bloqueia aceitar solicitação destinada a outro usuário', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      id: 7,
      destinatarioId: 99,
      status: StatusAmizade.PENDENTE,
    });

    await expect(service.aceitarSolicitacao(4, 7)).rejects.toBeInstanceOf(
      AmizadeAcaoNaoPermitidaException,
    );

    expect(prisma.amizade.update).not.toHaveBeenCalled();
  });

  it('bloqueia cancelar solicitação criada por outro usuário', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      id: 7,
      solicitanteId: 99,
      status: StatusAmizade.PENDENTE,
    });

    await expect(service.cancelarSolicitacao(4, 7)).rejects.toBeInstanceOf(
      AmizadeAcaoNaoPermitidaException,
    );

    expect(prisma.amizade.update).not.toHaveBeenCalled();
  });

  it('bloqueia remover relacao que não e amizade aceita', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      id: 7,
      status: StatusAmizade.PENDENTE,
    });

    await expect(service.removerAmizade(4, 9)).rejects.toBeInstanceOf(
      AmizadeNaoEncontradaException,
    );

    expect(prisma.amizade.update).not.toHaveBeenCalled();
  });

  it('lista amigos com status online vindo da presenca', async () => {
    presenca.registrarConexao(9, 'socket-1');
    prisma.amizade.findMany.mockResolvedValue([
      {
        id: 3,
        usuarioAId: 4,
        usuarioBId: 9,
        solicitanteId: 4,
        destinatarioId: 9,
        status: StatusAmizade.ACEITA,
        criadoEm: new Date('2026-01-01T00:00:00.000Z'),
        respondidoEm: new Date('2026-01-02T00:00:00.000Z'),
        usuarioA: { id: 4, apelido: 'Yuji' },
        usuarioB: { id: 9, apelido: 'Maki' },
        solicitante: { id: 4, apelido: 'Yuji' },
        destinatario: { id: 9, apelido: 'Maki' },
      },
    ]);

    const amigos = await service.listarAmigos(4);

    expect(amigos).toEqual([
      expect.objectContaining({
        id: 9,
        apelido: 'Maki',
        online: true,
      }),
    ]);
  });

  it('não expoe presenca de usuário que não e amigo aceito', async () => {
    presenca.registrarConexao(99, 'socket-1');
    prisma.amizade.findMany.mockResolvedValue([]);

    const amigos = await service.listarAmigos(4);

    expect(amigos).toEqual([]);
  });
});
