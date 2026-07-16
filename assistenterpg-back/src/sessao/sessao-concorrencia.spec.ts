import { Prisma } from '@prisma/client';
import {
  bloquearCondicaoSessaoTx,
  bloquearEventoSessaoTx,
  bloquearItemInventarioCampanhaTx,
  bloquearNpcSessaoTx,
  bloquearSessaoTx,
  bloquearSustentacaoSessaoTx,
} from './sessao-concorrencia';

describe('sessao-concorrencia', () => {
  it('bloqueia a sessao por id e campanha com SELECT FOR UPDATE', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 21 }]);

    await bloquearSessaoTx({ $queryRaw: queryRaw } as never, 7, 21);

    const consulta = queryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(consulta.sql).toContain('FROM Sessao');
    expect(consulta.sql).toContain('FOR UPDATE');
    expect(consulta.values).toEqual([21, 7]);
  });

  it('falha quando a sessao nao pertence a campanha', async () => {
    await expect(
      bloquearSessaoTx(
        { $queryRaw: jest.fn().mockResolvedValue([]) } as never,
        7,
        21,
      ),
    ).rejects.toMatchObject({ code: 'SESSAO_CAMPANHA_NOT_FOUND' });
  });

  it('bloqueia o evento dentro da sessao e campanha corretas', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 123 }]);

    await bloquearEventoSessaoTx({ $queryRaw: queryRaw } as never, 7, 21, 123);

    const consulta = queryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(consulta.sql).toContain('FROM EventoSessao');
    expect(consulta.sql).toContain('FOR UPDATE');
    expect(consulta.values).toEqual([123, 21, 7]);
  });

  it('falha quando o evento nao pertence a sessao', async () => {
    await expect(
      bloquearEventoSessaoTx(
        { $queryRaw: jest.fn().mockResolvedValue([]) } as never,
        7,
        21,
        123,
      ),
    ).rejects.toMatchObject({ code: 'SESSAO_EVENTO_NOT_FOUND' });
  });

  it('bloqueia o NPC dentro da sessao e campanha corretas', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 71 }]);

    await bloquearNpcSessaoTx({ $queryRaw: queryRaw } as never, 7, 21, 71);

    const consulta = queryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(consulta.sql).toContain('FROM NpcAmeacaSessao');
    expect(consulta.sql).toContain('FOR UPDATE');
    expect(consulta.values).toEqual([71, 21, 7]);
  });

  it('falha quando o NPC nao pertence a sessao', async () => {
    await expect(
      bloquearNpcSessaoTx(
        { $queryRaw: jest.fn().mockResolvedValue([]) } as never,
        7,
        21,
        71,
      ),
    ).rejects.toMatchObject({ code: 'NPC_SESSAO_NOT_FOUND' });
  });

  it.each([
    [
      'item de inventario',
      bloquearItemInventarioCampanhaTx,
      [7, 45],
      'FROM InventarioItemCampanha',
      [45, 7],
    ],
    [
      'condicao ativa',
      bloquearCondicaoSessaoTx,
      [21, 81],
      'FROM CondicaoPersonagemSessao',
      [81, 21],
    ],
    [
      'sustentacao ativa',
      bloquearSustentacaoSessaoTx,
      [21, 91],
      'FROM PersonagemSessaoHabilidadeSustentada',
      [91, 21],
    ],
  ])(
    'bloqueia %s com SELECT FOR UPDATE',
    async (_nome, bloquear, args, tabela, valores) => {
      const queryRaw = jest.fn().mockResolvedValue([{ id: valores[0] }]);

      await (bloquear as (...params: never[]) => Promise<void>)(
        { $queryRaw: queryRaw } as never,
        ...(args as never[]),
      );

      const consulta = queryRaw.mock.calls[0][0] as Prisma.Sql;
      expect(consulta.sql).toContain(tabela);
      expect(consulta.sql).toContain('FOR UPDATE');
      expect(consulta.values).toEqual(valores);
    },
  );
});
