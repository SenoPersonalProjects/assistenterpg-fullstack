import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  carregarPreferenciasSessao,
  montarChavePreferenciaMacroPersonalizada,
  salvarPreferenciasSessao,
} from './sessao-preferencias';

describe('preferencias efemeras de macros personalizadas', () => {
  const dados = new Map<string, string>();

  beforeEach(() => {
    dados.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (chave: string) => dados.get(chave) ?? null,
        setItem: (chave: string, valor: string) => dados.set(chave, valor),
        removeItem: (chave: string) => dados.delete(chave),
      },
    });
  });

  it('persiste por usuario, campanha, sessao, personagem e macro', () => {
    const chave = montarChavePreferenciaMacroPersonalizada(4, 9);
    salvarPreferenciasSessao(1, 2, 3, {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
      macrosPersonalizadas: {
        [chave]: { ajusteFlatSessao: 5, ajusteDadosSessao: -2 },
      },
    });
    expect(carregarPreferenciasSessao(1, 2, 3).macrosPersonalizadas[chave]).toEqual({
      ajusteFlatSessao: 5,
      ajusteDadosSessao: -2,
    });
    expect(carregarPreferenciasSessao(1, 2, 99).macrosPersonalizadas).toEqual({});
  });

  it('normaliza limites e ignora chaves invalidas', () => {
    const chave = montarChavePreferenciaMacroPersonalizada(4, 9);
    salvarPreferenciasSessao(1, 2, 3, {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
      macrosPersonalizadas: {
        [chave]: { ajusteFlatSessao: 999, ajusteDadosSessao: -99 },
        invalida: { ajusteFlatSessao: 1, ajusteDadosSessao: 1 },
      },
    });
    expect(carregarPreferenciasSessao(1, 2, 3).macrosPersonalizadas).toEqual({
      [chave]: { ajusteFlatSessao: 100, ajusteDadosSessao: -10 },
    });
  });
});
