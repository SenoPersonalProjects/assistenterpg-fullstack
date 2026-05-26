import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { SessaoGateway } from './sessao.gateway';
import { SessaoService } from './sessao.service';

describe('SessaoGateway', () => {
  it('emite ACESSO_NEGADO quando o usuário tenta entrar em sessão sem permissão', async () => {
    const validarAcessoSessao = jest
      .fn()
      .mockRejectedValue(new Error('negado'));
    const emit = jest.fn();
    const join = jest.fn();
    const sessaoService = {
      validarAcessoSessao,
    } as unknown as SessaoService;
    const jwtService = {} as JwtService;
    const gateway = new SessaoGateway(sessaoService, jwtService);
    const client = {
      id: 'socket-1',
      data: { usuarioId: 7 },
      emit,
      join,
    } as unknown as Socket & { data: { usuarioId?: number } };

    const resultado = await gateway.handleJoinSala(client, {
      campanhaId: 1,
      sessaoId: 2,
    });

    expect(resultado).toEqual({ ok: false });
    expect(validarAcessoSessao).toHaveBeenCalledWith(1, 2, 7);
    expect(join).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith('sessao:erro', {
      code: 'ACESSO_NEGADO',
    });
  });
});
