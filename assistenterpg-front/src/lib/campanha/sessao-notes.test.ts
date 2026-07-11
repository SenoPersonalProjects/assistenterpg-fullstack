import { describe, expect, it } from 'vitest';
import type { AnotacaoResumo } from '@/lib/types';
import { filtrarAnotacoesGeraisCampanha } from './sessao-notes';

function nota(
  id: number,
  sessao: AnotacaoResumo['sessao'] = null,
): AnotacaoResumo {
  return {
    id,
    titulo: `Nota ${id}`,
    conteudo: `Conteudo ${id}`,
    criadoEm: '2026-07-10T12:00:00.000Z',
    atualizadoEm: '2026-07-10T12:00:00.000Z',
    campanha: { id: 7, nome: 'Campanha' },
    sessao,
  };
}

describe('sessao-notes', () => {
  it('mantem apenas anotacoes gerais da campanha', () => {
    expect(
      filtrarAnotacoesGeraisCampanha([
        nota(1),
        nota(2, { id: 21, titulo: 'Sessao' }),
        nota(3, undefined),
      ]),
    ).toEqual([nota(1), nota(3, undefined)]);
  });
});
