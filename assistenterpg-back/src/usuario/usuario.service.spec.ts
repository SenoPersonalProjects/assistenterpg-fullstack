import { StatusContaUsuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let usuario: {
    findUnique: jest.Mock;
  };

  beforeEach(() => {
    usuario = {
      findUnique: jest.fn(),
    };
    service = new UsuarioService({ usuario } as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('busca opcional inclui status e verificacao para decisoes de auth', async () => {
    usuario.findUnique.mockResolvedValue({
      id: 1,
      status: StatusContaUsuario.ATIVA,
      emailVerificadoEm: new Date(),
    });

    await service.buscarPorEmailOpcional('usuario@example.com');

    expect(usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'usuario@example.com' },
      select: expect.objectContaining({
        senhaHash: true,
        status: true,
        emailVerificadoEm: true,
      }),
    });
  });

  it('busca por id expoe status para validacao de JWT', async () => {
    usuario.findUnique.mockResolvedValue({
      id: 1,
      status: StatusContaUsuario.DESATIVADA,
    });

    await service.buscarPorId(1);

    expect(usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.objectContaining({
        status: true,
        senhaHash: true,
        emailVerificadoEm: true,
      }),
    });
  });
});
