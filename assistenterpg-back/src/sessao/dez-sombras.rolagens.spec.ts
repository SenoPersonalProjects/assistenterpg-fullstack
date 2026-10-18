import { parseDanoSombras } from './dez-sombras.rolagens';

describe('danos das Dez Sombras', () => {
  it('preserva os dois grupos de dano da Colisão de Nue', () => {
    const expressao = parseDanoSombras('2d10+5 Impacto +4d6 Eletricidade')!;
    expect(expressao.termos?.map((t) => [t.quantidade, t.faces])).toEqual([
      [2, 10],
      [4, 6],
    ]);
    expect(expressao.modificador).toBe(5);
  });
  it('preserva danos simples e os grupos de Agito', () => {
    expect(parseDanoSombras('4d12+6 Perfuração')?.modificador).toBe(6);
    expect(
      parseDanoSombras('6d8+10 Impacto +4d6 Eletricidade')?.termos,
    ).toHaveLength(2);
    expect(parseDanoSombras('sem dano')).toBeNull();
  });
});
