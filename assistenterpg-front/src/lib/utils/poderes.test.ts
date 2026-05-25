import { describe, expect, it } from 'vitest';
import { validarRequisitosPoder } from './poderes';

const personagemBase = {
  nivel: 6,
  atributos: {
    agilidade: 3,
    forca: 3,
    intelecto: 1,
    presenca: 1,
    vigor: 2,
  },
  graus: {},
  poderesSelecionados: [],
  todosPoderes: [],
};

describe('validarRequisitosPoder', () => {
  it('aceita requisito alternativo de Luta ou Pontaria treinada', () => {
    const resultado = validarRequisitosPoder(
      {
        pericias: [
          { codigo: 'LUTA', grauMinimo: 1, alternativa: true },
          { codigo: 'PONTARIA', grauMinimo: 1, alternativa: true },
        ],
      },
      {
        ...personagemBase,
        pericias: [{ codigo: 'LUTA', grauTreinamento: 1 }],
      },
    );

    expect(resultado).toEqual({ atende: true });
  });

  it('aceita requisito de Jujutsu treinado', () => {
    const resultado = validarRequisitosPoder(
      { pericias: [{ codigo: 'JUJUTSU', grauMinimo: 1 }] },
      {
        ...personagemBase,
        pericias: [{ codigo: 'JUJUTSU', grauTreinamento: 1 }],
      },
    );

    expect(resultado).toEqual({ atende: true });
  });

  it('formata falha de requisito alternativo como treino de pericia', () => {
    const resultado = validarRequisitosPoder(
      {
        pericias: [
          { codigo: 'LUTA', grauMinimo: 1, alternativa: true },
          { codigo: 'PONTARIA', grauMinimo: 1, alternativa: true },
        ],
      },
      {
        ...personagemBase,
        pericias: [{ codigo: 'LUTA', grauTreinamento: 0 }],
      },
    );

    expect(resultado).toEqual({
      atende: false,
      motivoNaoAtende: 'Requer Luta ou Pontaria treinada',
    });
  });

  it('formata requisito graduado e falha quando treino for menor', () => {
    const resultado = validarRequisitosPoder(
      { pericias: [{ codigo: 'REFLEXOS', grauMinimo: 2 }] },
      {
        ...personagemBase,
        pericias: [{ codigo: 'REFLEXOS', grauTreinamento: 1 }],
      },
    );

    expect(resultado).toEqual({
      atende: false,
      motivoNaoAtende: 'Requer Reflexos graduada',
    });
  });
});
