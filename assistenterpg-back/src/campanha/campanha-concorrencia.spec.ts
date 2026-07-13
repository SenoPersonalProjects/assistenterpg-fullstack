import { Prisma } from '@prisma/client';
import {
  bloquearPersonagemCampanhaTx,
  executarComRetryConcorrencia,
} from './campanha-concorrencia';

function erroP2034() {
  return new Prisma.PrismaClientKnownRequestError('Conflito de escrita', {
    code: 'P2034',
    clientVersion: '6.19.0',
  });
}

describe('campanha-concorrencia', () => {
  it('bloqueia o personagem por id e campanha com SELECT FOR UPDATE', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 20 }]);

    await bloquearPersonagemCampanhaTx(
      { $queryRaw: queryRaw } as never,
      10,
      20,
    );

    const consulta = queryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(consulta.sql).toContain('FROM PersonagemCampanha');
    expect(consulta.sql).toContain('FOR UPDATE');
    expect(consulta.values).toEqual([20, 10]);
  });

  it('falha quando o personagem nao pertence a campanha', async () => {
    await expect(
      bloquearPersonagemCampanhaTx(
        { $queryRaw: jest.fn().mockResolvedValue([]) } as never,
        10,
        20,
      ),
    ).rejects.toMatchObject({ code: 'PERSONAGEM_CAMPANHA_NOT_FOUND' });
  });

  it('repete somente conflitos P2034 e retorna o resultado seguinte', async () => {
    const operacao = jest
      .fn()
      .mockRejectedValueOnce(erroP2034())
      .mockResolvedValueOnce('ok');

    await expect(executarComRetryConcorrencia('teste', operacao)).resolves.toBe(
      'ok',
    );
    expect(operacao).toHaveBeenCalledTimes(2);
  });

  it('converte conflito persistente em erro estavel', async () => {
    const operacao = jest.fn().mockRejectedValue(erroP2034());

    await expect(
      executarComRetryConcorrencia('teste', operacao),
    ).rejects.toMatchObject({
      status: 409,
      code: 'OPERACAO_CONCORRENTE_REPETIR',
    });
    expect(operacao).toHaveBeenCalledTimes(3);
  });

  it('nao repete erros que nao sejam conflitos do Prisma', async () => {
    const erro = new Error('falha');
    const operacao = jest.fn().mockRejectedValue(erro);

    await expect(executarComRetryConcorrencia('teste', operacao)).rejects.toBe(
      erro,
    );
    expect(operacao).toHaveBeenCalledTimes(1);
  });
});
