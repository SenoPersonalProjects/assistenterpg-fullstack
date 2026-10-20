import {
  buscarCenaAtualSessao,
  controleTurnosAtivo,
} from './sessao-cena-atual';
import { Prisma } from '@prisma/client';

describe('cena atual efetiva', () => {
  it('restaura a cena do ultimo evento em vez de selecionar a cena cancelada mais recente', async () => {
    const tx = {
      eventoSessao: { findFirst: jest.fn().mockResolvedValue({ cenaId: 7 }) },
      cena: { findFirst: jest.fn().mockResolvedValue({ id: 7 }) },
    };
    expect(
      await buscarCenaAtualSessao(tx as unknown as Prisma.TransactionClient, 1),
    ).toEqual({ id: 7 });
    expect(tx.cena.findFirst).toHaveBeenCalledWith({
      where: { sessaoId: 1, id: 7 },
      select: { id: true },
    });
  });
  it('mantem sessoes antigas sem historico de transicao', async () => {
    const tx = {
      eventoSessao: { findFirst: jest.fn().mockResolvedValue(null) },
      cena: { findFirst: jest.fn().mockResolvedValue({ id: 9 }) },
    };
    expect(
      await buscarCenaAtualSessao(tx as unknown as Prisma.TransactionClient, 1),
    ).toEqual({ id: 9 });
  });
  it('nao confunde modo livre ou base com combate', () => {
    expect(controleTurnosAtivo('LIVRE')).toBe(false);
    expect(controleTurnosAtivo('BASE')).toBe(false);
    expect(controleTurnosAtivo('COMBATE')).toBe(true);
  });
});
