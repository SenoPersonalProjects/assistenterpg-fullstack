import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  calcularResultadoDiceServidor,
  construirMensagemDiceServidor,
  expressaoDiceContemD20,
  formatarExpressaoDiceServidor,
  parseDiceFontePersistidaServidor,
  parseDiceInputServidor,
  rolarDadosServidor,
} from './sessao-dice-autoritativo';

type FixturesFormulaDice = {
  validas: string[];
  invalidas: string[];
};

const fixtures = JSON.parse(
  readFileSync(
    resolve(process.cwd(), '..', 'test-contracts', 'sessao-dice-formulas.json'),
    'utf8',
  ),
) as FixturesFormulaDice;

describe('sessao-dice-autoritativo', () => {
  const gerarSequencia = (valores: number[]) => {
    let indice = 0;
    return () => valores[indice++] ?? 1;
  };

  it.each(fixtures.validas)(
    'aceita a fixture compartilhada de formula valida: %s',
    (formula) => {
      const resultado = parseDiceInputServidor(formula);
      expect(resultado.erro).toBeNull();
      expect(resultado.expressions).not.toBeNull();
    },
  );

  it.each(fixtures.invalidas)(
    'rejeita a fixture compartilhada de formula invalida: %s',
    (formula) => {
      expect(parseDiceInputServidor(formula).erro).not.toBeNull();
    },
  );

  it('rola todos os termos com gerador injetavel', () => {
    const resultado = parseDiceInputServidor('4#d20+2d6+3#d8+5');
    const payload = rolarDadosServidor(
      resultado.expressions![0],
      gerarSequencia([2, 19, 8, 11, 3, 6, 1, 7, 4]),
    );

    expect(payload.termos?.map((termo) => termo.rolagens)).toEqual([
      [2, 19, 8, 11],
      [3, 6],
      [1, 7, 4],
    ]);
    expect(expressaoDiceContemD20(resultado.expressions!)).toBe(true);
    expect(calcularResultadoDiceServidor(payload)).toEqual({
      totalBase: 35,
      bonusTotal: 0,
      total: 40,
      termos: [
        { subtotal: 19, indiceEscolhido: 1 },
        { subtotal: 9, indiceEscolhido: null },
        { subtotal: 7, indiceEscolhido: 1 },
      ],
    });
  });

  it('soma dado bonus autoritativo e usa marcador v5', () => {
    const expression = parseDiceInputServidor('2#d20+5').expressions![0];
    const payload = rolarDadosServidor(expression, gerarSequencia([4, 17]));
    payload.bonusDados = [
      {
        origem: 'PERITO',
        label: 'Perito +1d8',
        quantidade: 1,
        faces: 8,
        rolagens: [6],
        efeitoPendenteId: 'perito:10',
      },
    ];

    expect(calcularResultadoDiceServidor(payload)).toMatchObject({
      totalBase: 17,
      bonusTotal: 6,
      total: 28,
    });
    expect(construirMensagemDiceServidor([payload]).mensagem).toContain(
      '[[dice:v5|',
    );
  });

  it('serializa simples em v3 e composto em v5', () => {
    const simples = parseDiceInputServidor('2d6+3').expressions![0];
    const composto = parseDiceInputServidor('2#d20+2d6').expressions![0];

    expect(
      construirMensagemDiceServidor([
        rolarDadosServidor(simples, gerarSequencia([2, 5])),
      ]).mensagem,
    ).toContain('[[dice:v3|');
    expect(
      construirMensagemDiceServidor([
        rolarDadosServidor(composto, gerarSequencia([4, 18, 2, 6])),
      ]).mensagem,
    ).toContain('[[dice:v5|');
  });

  it('preserva expressoes multiplas no marcador', () => {
    const resultado = parseDiceInputServidor('ataque:2d20 dano:2d6');
    const payloads = resultado.expressions!.map((expressao) =>
      rolarDadosServidor(expressao, (faces) => Math.min(faces, 4)),
    );
    const mensagem = construirMensagemDiceServidor(payloads).mensagem;

    expect(mensagem).toContain('ataque: 2d20');
    expect(mensagem).toContain('dano: 2d6');
    expect(mensagem).toContain('~');
  });

  it.each([
    ['31d6', 'Limite de 30 dados'],
    ['d1001', 'Limite de 1000 faces'],
    ['d20/0', 'Divisor nao pode ser zero'],
    ['d20-2d6', 'Sintaxe invalida'],
  ])('rejeita formula fora dos limites: %s', (formula, erro) => {
    expect(parseDiceInputServidor(formula).erro).toContain(erro);
  });

  it.each([
    ['3d10', '3d10'],
    ['3+2d8', '2d8+3'],
    ['1d8+4 corte + amaldicoado', '1d8+4'],
  ])('normaliza dano persistido %s', (fonte, esperado) => {
    const expressao = parseDiceFontePersistidaServidor(fonte);

    expect(expressao).not.toBeNull();
    const payload = rolarDadosServidor(expressao!, () => 1);
    expect(formatarExpressaoDiceServidor(payload)).toBe(esperado);
  });

  it.each([
    '',
    'sem dano',
    '2d6 e depois 1d8',
    '1d8 + 3 + 2d8 amaldicoado',
    '31d6',
  ])('rejeita dano persistido invalido: %s', (fonte) => {
    expect(parseDiceFontePersistidaServidor(fonte)).toBeNull();
  });
});
