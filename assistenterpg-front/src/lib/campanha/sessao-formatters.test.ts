import { describe, expect, it } from 'vitest';
import { formatarNomeCondicaoComAcumulos } from './sessao-formatters';

describe('formatarNomeCondicaoComAcumulos', () => {
  it('exibe acúmulo 1 para condicoes aceleradas', () => {
    expect(
      formatarNomeCondicaoComAcumulos({
        nome: 'Produção Acelerada',
        acumulos: 1,
      }),
    ).toBe('Produção Acelerada 1');

    expect(
      formatarNomeCondicaoComAcumulos({
        nome: 'Cura Acelerada',
        acumulos: 1,
      }),
    ).toBe('Cura Acelerada 1');
  });

  it('mantem acúmulo 1 oculto para condicoes comuns', () => {
    expect(
      formatarNomeCondicaoComAcumulos({
        nome: 'Fraco',
        acumulos: 1,
      }),
    ).toBe('Fraco');
  });

  it('exibe acúmulos maiores que 1 para qualquer condição', () => {
    expect(
      formatarNomeCondicaoComAcumulos({
        nome: 'Fraco',
        acumulos: 2,
      }),
    ).toBe('Fraco 2');
  });
});
