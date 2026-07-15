import { jsonSemanticamenteIgual } from './json-semantico';

describe('jsonSemanticamenteIgual', () => {
  it('ignora a ordem das chaves de objetos', () => {
    expect(
      jsonSemanticamenteIgual(
        { tipo: 'CRITICO', acumulos: null, publico: true },
        { publico: true, tipo: 'CRITICO', acumulos: null },
      ),
    ).toBe(true);
  });

  it('ignora a ordem das chaves em objetos aninhados', () => {
    expect(
      jsonSemanticamenteIgual(
        { contexto: { dt: 15, alvo: { tipo: 'NPC', id: 3 } } },
        { contexto: { alvo: { id: 3, tipo: 'NPC' }, dt: 15 } },
      ),
    ).toBe(true);
  });

  it('preserva a ordem dos arrays', () => {
    expect(jsonSemanticamenteIgual([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  it('distingue valores numericos diferentes', () => {
    expect(jsonSemanticamenteIgual({ total: 10 }, { total: 11 })).toBe(false);
  });

  it('distingue string de numero', () => {
    expect(jsonSemanticamenteIgual({ valor: '1' }, { valor: 1 })).toBe(false);
  });

  it('preserva null', () => {
    expect(jsonSemanticamenteIgual({ valor: null }, { valor: null })).toBe(
      true,
    );
    expect(jsonSemanticamenteIgual({ valor: null }, { valor: 0 })).toBe(false);
  });

  it('nao confunde campo ausente com campo undefined', () => {
    expect(jsonSemanticamenteIgual({}, { valor: undefined })).toBe(false);
  });

  it('distingue objetos com chaves extras', () => {
    expect(
      jsonSemanticamenteIgual(
        { tipo: 'FORMULA' },
        { tipo: 'FORMULA', expressao: '1d20' },
      ),
    ).toBe(false);
  });
});
