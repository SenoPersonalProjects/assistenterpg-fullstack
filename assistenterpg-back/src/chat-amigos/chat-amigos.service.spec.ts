import { ForbiddenException } from '@nestjs/common';
import { StatusAmizade } from '@prisma/client';
import { PresencaService } from 'src/amizades/presenca.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatAmigosService } from './chat-amigos.service';

describe('ChatAmigosService', () => {
  let service: ChatAmigosService;
  let prisma: {
    amizade: { findUnique: jest.Mock; findMany: jest.Mock };
    conversaAmizade: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    mensagemAmizade: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
    };
    leituraConversaAmizade: { upsert: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      amizade: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      conversaAmizade: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      mensagemAmizade: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      leituraConversaAmizade: {
        upsert: jest.fn(),
      },
    };

    const presenca = new PresencaService();
    service = new ChatAmigosService(
      prisma as unknown as PrismaService,
      presenca,
    );
  });

  it('bloqueia envio quando usuarios não sao amigos aceitos', async () => {
    prisma.amizade.findUnique.mockResolvedValue(null);

    await expect(service.enviarMensagem(1, 2, 'oi')).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(prisma.mensagemAmizade.create).not.toHaveBeenCalled();
  });

  it('salva mensagem e marca remetente como lido entre amigos aceitos', async () => {
    prisma.amizade.findUnique.mockResolvedValue({
      status: StatusAmizade.ACEITA,
    });
    prisma.conversaAmizade.upsert.mockResolvedValue({
      id: 5,
      usuarioAId: 1,
      usuarioBId: 2,
      atualizadoEm: new Date('2026-05-24T12:00:00.000Z'),
    });
    prisma.mensagemAmizade.create.mockResolvedValue({
      id: 9,
      conversaId: 5,
      autorId: 1,
      conteudo: 'oi',
      removidoEm: null,
      criadoEm: new Date('2026-05-24T12:01:00.000Z'),
    });

    const resultado = await service.enviarMensagem(1, 2, ' oi ');

    expect(prisma.conversaAmizade.upsert).toHaveBeenCalledWith({
      where: { usuarioAId_usuarioBId: { usuarioAId: 1, usuarioBId: 2 } },
      update: {},
      create: { usuarioAId: 1, usuarioBId: 2 },
    });
    expect(prisma.mensagemAmizade.create).toHaveBeenCalledWith({
      data: { conversaId: 5, autorId: 1, conteudo: 'oi' },
    });
    expect(prisma.leituraConversaAmizade.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversaId_usuarioId: { conversaId: 5, usuarioId: 1 } },
      }),
    );
    expect(resultado.mensagem).toEqual(
      expect.objectContaining({
        id: 9,
        autorId: 1,
        destinatarioId: 2,
        conteudo: 'oi',
      }),
    );
  });

  it('lista conversas com contador de não lidas', async () => {
    prisma.amizade.findMany.mockResolvedValue([
      {
        usuarioAId: 1,
        usuarioBId: 2,
        respondidoEm: new Date('2026-05-20T00:00:00.000Z'),
        criadoEm: new Date('2026-05-19T00:00:00.000Z'),
        usuarioA: { id: 1, apelido: 'seno' },
        usuarioB: { id: 2, apelido: 'iaze' },
      },
    ]);
    prisma.conversaAmizade.findMany.mockResolvedValue([
      {
        id: 5,
        usuarioAId: 1,
        usuarioBId: 2,
        atualizadoEm: new Date('2026-05-24T12:00:00.000Z'),
        mensagens: [
          {
            id: 10,
            conversaId: 5,
            autorId: 2,
            conteudo: 'salve',
            removidoEm: null,
            criadoEm: new Date('2026-05-24T12:00:00.000Z'),
          },
        ],
        leituras: [{ lidaAteMensagemId: 8 }],
      },
    ]);
    prisma.mensagemAmizade.count.mockResolvedValue(2);

    const conversas = await service.listarConversas(1);

    expect(conversas).toHaveLength(1);
    expect(conversas[0]).toEqual(
      expect.objectContaining({
        amigo: { id: 2, apelido: 'iaze' },
        naoLidas: 2,
      }),
    );
  });
});
