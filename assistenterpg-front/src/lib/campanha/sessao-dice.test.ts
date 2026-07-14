import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  criarClientRequestIdRolagem,
  expressoesDiceContemD20,
  extrairDadosRolagemServidor,
  aplicarPeritoPendenteChatLivre,
  calcularResultadoDice,
  construirMensagemDice,
  construirMensagemDiceMultipla,
  formatarExpressaoDice,
  obterAvisoPeritoPendenteChat,
  parseDiceInput,
  parseDiceExpression,
  parseDiceMessageGroup,
  type DicePeritoPendenteChat,
  type DiceRollPayload,
} from './sessao-dice';

type FixturesFormulaDice = {
  validas: string[];
  invalidas: string[];
};

const fixturesFormulaDice = JSON.parse(
  readFileSync(
    resolve(process.cwd(), '..', 'test-contracts', 'sessao-dice-formulas.json'),
    'utf8',
  ),
) as FixturesFormulaDice;

function criarPayloadComRolagens(
  expressao: string,
  rolagensPorTermo: number[][],
): DiceRollPayload {
  const expression = parseDiceExpression(expressao).expression;
  expect(expression).not.toBeNull();
  const termos = expression?.termos?.map((termo, index) => ({
    ...termo,
    rolagens: rolagensPorTermo[index] ?? [],
  }));
  return {
    ...expression!,
    rolagens: rolagensPorTermo[0] ?? [],
    termos,
  };
}

describe('sessão-dice parser', () => {
  it.each(fixturesFormulaDice.validas)(
    'aceita a fixture compartilhada de formula valida: %s',
    (formula) => {
      expect(parseDiceInput(formula).erro).toBeNull();
    },
  );

  it.each(fixturesFormulaDice.invalidas)(
    'rejeita a fixture compartilhada de formula invalida: %s',
    (formula) => {
      expect(parseDiceInput(formula).erro).not.toBeNull();
    },
  );
  it('aceita espacos em operadores matematicos', () => {
    expect(parseDiceExpression('1d6 + 3').expression).toMatchObject({
      quantidade: 1,
      faces: 6,
      operador: '+',
      modificador: 3,
    });
    expect(parseDiceExpression('2d6 - 1').expression).toMatchObject({
      quantidade: 2,
      faces: 6,
      operador: '-',
      modificador: 1,
    });
    expect(parseDiceExpression('1d20 * 2').expression).toMatchObject({
      quantidade: 1,
      faces: 20,
      operador: '*',
      modificador: 2,
    });
    expect(parseDiceExpression('1d20 / 2').expression).toMatchObject({
      quantidade: 1,
      faces: 20,
      operador: '/',
      modificador: 2,
    });
  });

  it('aceita multiplas rolagens com espacos e separadores', () => {
    expect(parseDiceInput('d20 + 5 2d6 - 1').expressions).toEqual([
      expect.objectContaining({ quantidade: 1, faces: 20, operador: '+', modificador: 5 }),
      expect.objectContaining({ quantidade: 2, faces: 6, operador: '-', modificador: 1 }),
    ]);

    expect(parseDiceInput('d20 + 5, 2d6 - 1').expressions).toEqual([
      expect.objectContaining({ quantidade: 1, faces: 20, operador: '+', modificador: 5 }),
      expect.objectContaining({ quantidade: 2, faces: 6, operador: '-', modificador: 1 }),
    ]);

    expect(parseDiceInput('Ataque: d20 + 5 Defesa: d20 + 2').expressions).toEqual([
      expect.objectContaining({
        label: 'Ataque',
        quantidade: 1,
        faces: 20,
        modificador: 5,
      }),
      expect.objectContaining({
        label: 'Defesa',
        quantidade: 1,
        faces: 20,
        modificador: 2,
      }),
    ]);
  });

  it('aceita grupos de dados somados na mesma expressao', () => {
    expect(parseDiceExpression('4#d20+2d6').expression).toMatchObject({
      quantidade: 4,
      faces: 20,
      modificador: 0,
      termos: [
        expect.objectContaining({
          quantidade: 4,
          faces: 20,
          aplicarModificadorPorDado: true,
        }),
        expect.objectContaining({
          quantidade: 2,
          faces: 6,
          aplicarModificadorPorDado: false,
        }),
      ],
    });

    expect(parseDiceExpression('4d20+2d6').expression?.termos).toEqual([
      expect.objectContaining({ quantidade: 4, faces: 20, aplicarModificadorPorDado: false }),
      expect.objectContaining({ quantidade: 2, faces: 6, aplicarModificadorPorDado: false }),
    ]);

    expect(parseDiceExpression('4#d20+2#d6').expression?.termos).toEqual([
      expect.objectContaining({ quantidade: 4, faces: 20, aplicarModificadorPorDado: true }),
      expect.objectContaining({ quantidade: 2, faces: 6, aplicarModificadorPorDado: true }),
    ]);
  });

  it('aceita tres ou mais grupos de dados somados na mesma expressao', () => {
    expect(parseDiceExpression('4#d20+2d6+3#d8').expression).toMatchObject({
      modificador: 0,
      termos: [
        expect.objectContaining({ quantidade: 4, faces: 20, aplicarModificadorPorDado: true }),
        expect.objectContaining({ quantidade: 2, faces: 6, aplicarModificadorPorDado: false }),
        expect.objectContaining({ quantidade: 3, faces: 8, aplicarModificadorPorDado: true }),
      ],
    });

    expect(parseDiceExpression('4d20+2d6+3d8').expression?.termos).toEqual([
      expect.objectContaining({ quantidade: 4, faces: 20, aplicarModificadorPorDado: false }),
      expect.objectContaining({ quantidade: 2, faces: 6, aplicarModificadorPorDado: false }),
      expect.objectContaining({ quantidade: 3, faces: 8, aplicarModificadorPorDado: false }),
    ]);

    expect(parseDiceExpression('4#d20+2#d6+3#d8').expression?.termos).toEqual([
      expect.objectContaining({ quantidade: 4, faces: 20, aplicarModificadorPorDado: true }),
      expect.objectContaining({ quantidade: 2, faces: 6, aplicarModificadorPorDado: true }),
      expect.objectContaining({ quantidade: 3, faces: 8, aplicarModificadorPorDado: true }),
    ]);

    expect(parseDiceExpression('4#d20+2d6+3#d8+5').expression).toMatchObject({
      operador: '+',
      modificador: 5,
      termos: [
        expect.objectContaining({ quantidade: 4, faces: 20 }),
        expect.objectContaining({ quantidade: 2, faces: 6 }),
        expect.objectContaining({ quantidade: 3, faces: 8 }),
      ],
    });
  });
});

describe('calcularResultadoDice', () => {
  it('mantem rolagem normal somando dados e modificador uma vez', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: false,
      rolagens: [2, 6],
    });

    expect(resultado.totalBase).toBe(8);
    expect(resultado.rolagensFinais).toEqual([2, 6]);
    expect(resultado.total).toBe(13);
    expect(resultado.indiceEscolhido).toBeNull();
  });

  it('usa o maior valor individual como total principal para #', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: true,
      rolagens: [2, 6],
    });

    expect(resultado.keepMode).toBe('HIGHEST');
    expect(resultado.rolagensFinais).toEqual([7, 11]);
    expect(resultado.total).toBe(11);
    expect(resultado.indiceEscolhido).toBe(1);
  });

  it('usa o menor valor individual para # com keepMode LOWEST', () => {
    const resultado = calcularResultadoDice({
      quantidade: 2,
      faces: 6,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: true,
      keepMode: 'LOWEST',
      rolagens: [2, 6],
    });

    expect(resultado.keepMode).toBe('LOWEST');
    expect(resultado.rolagensFinais).toEqual([7, 11]);
    expect(resultado.total).toBe(7);
    expect(resultado.indiceEscolhido).toBe(0);
  });

  it('soma dados bonus ao total sem alterar o total base', () => {
    const resultado = calcularResultadoDice({
      quantidade: 1,
      faces: 20,
      operador: '+',
      modificador: 5,
      aplicarModificadorPorDado: false,
      rolagens: [12],
      bonusDados: [
        {
          origem: 'PERITO',
          label: 'Perito +1d6',
          quantidade: 1,
          faces: 6,
          rolagens: [4],
          efeitoPendenteId: 'perito:1',
        },
      ],
    });

    expect(resultado.totalBase).toBe(12);
    expect(resultado.bonusTotal).toBe(4);
    expect(resultado.total).toBe(21);
  });

  it('soma melhor d20 com soma de d6 em expressao composta com # apenas no d20', () => {
    const resultado = calcularResultadoDice({
      quantidade: 4,
      faces: 20,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: true,
      rolagens: [3, 19, 7, 12],
      termos: [
        {
          quantidade: 4,
          faces: 20,
          aplicarModificadorPorDado: true,
          keepMode: 'HIGHEST',
          rolagens: [3, 19, 7, 12],
        },
        {
          quantidade: 2,
          faces: 6,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [2, 5],
        },
      ],
    });

    expect(resultado.totalBase).toBe(26);
    expect(resultado.total).toBe(26);
    expect(resultado.termos?.map((termo) => termo.subtotal)).toEqual([19, 7]);
  });

  it('soma todos os grupos quando nao ha # na expressao composta', () => {
    const resultado = calcularResultadoDice({
      quantidade: 4,
      faces: 20,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: false,
      rolagens: [3, 19, 7, 12],
      termos: [
        {
          quantidade: 4,
          faces: 20,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [3, 19, 7, 12],
        },
        {
          quantidade: 2,
          faces: 6,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [2, 5],
        },
      ],
    });

    expect(resultado.totalBase).toBe(48);
    expect(resultado.total).toBe(48);
  });

  it('soma os melhores resultados de cada grupo com #', () => {
    const resultado = calcularResultadoDice({
      quantidade: 4,
      faces: 20,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: true,
      rolagens: [3, 19, 7, 12],
      termos: [
        {
          quantidade: 4,
          faces: 20,
          aplicarModificadorPorDado: true,
          keepMode: 'HIGHEST',
          rolagens: [3, 19, 7, 12],
        },
        {
          quantidade: 2,
          faces: 6,
          aplicarModificadorPorDado: true,
          keepMode: 'HIGHEST',
          rolagens: [2, 5],
        },
      ],
    });

    expect(resultado.totalBase).toBe(24);
    expect(resultado.total).toBe(24);
    expect(resultado.termos?.map((termo) => termo.indiceEscolhido)).toEqual([1, 1]);
  });

  it('soma tres grupos usando # apenas nos grupos marcados', () => {
    const payload = criarPayloadComRolagens('4#d20+2d6+3#d8', [
      [3, 19, 7, 12],
      [2, 5],
      [1, 8, 4],
    ]);
    const resultado = calcularResultadoDice(payload);

    expect(formatarExpressaoDice(payload)).toBe('4#d20+2d6+3#d8');
    expect(resultado.totalBase).toBe(34);
    expect(resultado.total).toBe(34);
    expect(resultado.termos?.map((termo) => termo.subtotal)).toEqual([19, 7, 8]);
  });

  it('soma todos os dados em tres grupos sem #', () => {
    const resultado = calcularResultadoDice(
      criarPayloadComRolagens('4d20+2d6+3d8', [
        [3, 19, 7, 12],
        [2, 5],
        [1, 8, 4],
      ]),
    );

    expect(resultado.totalBase).toBe(61);
    expect(resultado.total).toBe(61);
    expect(resultado.termos?.map((termo) => termo.subtotal)).toEqual([41, 7, 13]);
  });

  it('soma os melhores resultados de tres grupos com #', () => {
    const resultado = calcularResultadoDice(
      criarPayloadComRolagens('4#d20+2#d6+3#d8', [
        [3, 19, 7, 12],
        [2, 5],
        [1, 8, 4],
      ]),
    );

    expect(resultado.totalBase).toBe(32);
    expect(resultado.total).toBe(32);
    expect(resultado.termos?.map((termo) => termo.indiceEscolhido)).toEqual([
      1,
      1,
      1,
    ]);
  });

  it('aplica modificador final uma vez em tres grupos compostos', () => {
    const resultado = calcularResultadoDice(
      criarPayloadComRolagens('4#d20+2d6+3#d8+5', [
        [3, 19, 7, 12],
        [2, 5],
        [1, 8, 4],
      ]),
    );

    expect(resultado.totalBase).toBe(34);
    expect(resultado.total).toBe(39);
  });

  it('serializa e le marcador v5 quando existe dado bonus', () => {
    const payload = {
      quantidade: 1,
      faces: 20,
      operador: '+' as const,
      modificador: 5,
      aplicarModificadorPorDado: false,
      rolagens: [12],
      bonusDados: [
        {
          origem: 'PERITO',
          label: 'Perito +1d6',
          quantidade: 1,
          faces: 6,
          rolagens: [4],
          efeitoPendenteId: 'perito:1',
        },
      ],
    };

    const mensagem = construirMensagemDice(payload).mensagem;
    expect(mensagem).toContain('[[dice:v5|');
    expect(parseDiceMessageGroup(mensagem)?.payloads).toEqual([
      expect.objectContaining({
        quantidade: payload.quantidade,
        faces: payload.faces,
        operador: payload.operador,
        modificador: payload.modificador,
        aplicarModificadorPorDado: payload.aplicarModificadorPorDado,
        rolagens: payload.rolagens,
        bonusDados: payload.bonusDados,
      }),
    ]);
  });

  it('mantem marcador v3 para rolagem sem bonus', () => {
    const payload = {
      quantidade: 1,
      faces: 20,
      operador: '+' as const,
      modificador: 2,
      aplicarModificadorPorDado: false,
      rolagens: [15],
    };

    const mensagem = construirMensagemDice(payload).mensagem;

    expect(mensagem).toContain('[[dice:v3|');
    expect(mensagem).not.toContain('[[dice:v5|');
    expect(parseDiceMessageGroup(mensagem)?.payloads[0]).toMatchObject({
      quantidade: payload.quantidade,
      faces: payload.faces,
      operador: payload.operador,
      modificador: payload.modificador,
      aplicarModificadorPorDado: payload.aplicarModificadorPorDado,
      rolagens: payload.rolagens,
    });
  });

  it('usa marcador v5 para rolagem composta mesmo sem bonus', () => {
    const payload: DiceRollPayload = {
      quantidade: 4,
      faces: 20,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: true,
      rolagens: [3, 19, 7, 12],
      termos: [
        {
          quantidade: 4,
          faces: 20,
          aplicarModificadorPorDado: true,
          keepMode: 'HIGHEST',
          rolagens: [3, 19, 7, 12],
        },
        {
          quantidade: 2,
          faces: 6,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [2, 5],
        },
      ],
    };

    const mensagem = construirMensagemDice(payload).mensagem;

    expect(mensagem).toContain('[[dice:v5|');
    expect(parseDiceMessageGroup(mensagem)?.payloads[0]).toMatchObject({
      quantidade: 4,
      faces: 20,
      termos: [
        expect.objectContaining({ quantidade: 4, faces: 20, rolagens: [3, 19, 7, 12] }),
        expect.objectContaining({ quantidade: 2, faces: 6, rolagens: [2, 5] }),
      ],
    });
  });

  it('preserva tres ou mais termos no marcador v5', () => {
    const payload = criarPayloadComRolagens('4#d20+2d6+3#d8+5', [
      [3, 19, 7, 12],
      [2, 5],
      [1, 8, 4],
    ]);

    const mensagem = construirMensagemDice(payload).mensagem;
    const decodificado = parseDiceMessageGroup(mensagem)?.payloads[0];

    expect(mensagem).toContain('[[dice:v5|');
    expect(decodificado?.termos).toEqual([
      expect.objectContaining({
        quantidade: 4,
        faces: 20,
        aplicarModificadorPorDado: true,
        rolagens: [3, 19, 7, 12],
      }),
      expect.objectContaining({
        quantidade: 2,
        faces: 6,
        aplicarModificadorPorDado: false,
        rolagens: [2, 5],
      }),
      expect.objectContaining({
        quantidade: 3,
        faces: 8,
        aplicarModificadorPorDado: true,
        rolagens: [1, 8, 4],
      }),
    ]);
    expect(formatarExpressaoDice(decodificado!)).toBe('4#d20+2d6+3#d8+5');
  });

  it('mantem mensagens antigas e mensagens v5 multiplas compativeis', () => {
    const payloadSimples: DiceRollPayload = {
      quantidade: 1,
      faces: 6,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: false,
      rolagens: [4],
    };
    const payloadComposto: DiceRollPayload = {
      quantidade: 1,
      faces: 20,
      operador: '+',
      modificador: 0,
      aplicarModificadorPorDado: false,
      rolagens: [15],
      termos: [
        {
          quantidade: 1,
          faces: 20,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [15],
        },
        {
          quantidade: 1,
          faces: 6,
          aplicarModificadorPorDado: false,
          keepMode: 'SUM',
          rolagens: [4],
        },
      ],
    };

    const antiga = construirMensagemDice(payloadSimples).mensagem;
    const multipla = construirMensagemDiceMultipla([payloadSimples, payloadComposto]).mensagem;

    expect(parseDiceMessageGroup(antiga)?.payloads[0]).toMatchObject(payloadSimples);
    expect(parseDiceMessageGroup(multipla)?.payloads).toHaveLength(2);
    expect(parseDiceMessageGroup(multipla)?.payloads[1]).toMatchObject({
      termos: expect.any(Array),
    });
  });
});

describe('aplicarPeritoPendenteChatLivre', () => {
  const perito: DicePeritoPendenteChat = {
    id: 'perito:123',
    dado: '1d8',
    faces: 8,
    personagemSessaoId: 41,
    personagemCampanhaId: 51,
  };
  const rolarBonus = () => ({
    origem: 'PERITO',
    label: 'Perito +1d8',
    quantidade: 1,
    faces: 8,
    rolagens: [5],
    efeitoPendenteId: 'perito:123',
  });
  const payloadD20: DiceRollPayload = {
    quantidade: 1,
    faces: 20,
    operador: '+',
    modificador: 5,
    aplicarModificadorPorDado: false,
    rolagens: [12],
  };

  it('anexa o bonus do Perito ao primeiro d20 do chat livre', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [payloadD20],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(true);
    expect(resultado.payloads[0]?.bonusDados).toEqual([
      expect.objectContaining({
        origem: 'PERITO',
        efeitoPendenteId: 'perito:123',
        faces: 8,
        rolagens: [5],
      }),
    ]);
  });

  it('nao anexa Perito quando nao existe d20', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [
        {
          ...payloadD20,
          faces: 6,
          rolagens: [4],
        },
      ],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(false);
    expect(resultado.payloads[0]?.bonusDados).toBeUndefined();
  });

  it('consome uma unica vez quando ha multiplos d20', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [payloadD20, { ...payloadD20, modificador: 2, rolagens: [15] }],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(true);
    expect(resultado.payloads[0]?.bonusDados).toHaveLength(1);
    expect(resultado.payloads[1]?.bonusDados).toBeUndefined();
  });

  it('anexa Perito quando uma rolagem composta contem d20', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [
        {
          quantidade: 2,
          faces: 6,
          operador: '+',
          modificador: 0,
          aplicarModificadorPorDado: false,
          rolagens: [2, 5],
          termos: [
            {
              quantidade: 2,
              faces: 6,
              aplicarModificadorPorDado: false,
              keepMode: 'SUM',
              rolagens: [2, 5],
            },
            {
              quantidade: 4,
              faces: 20,
              aplicarModificadorPorDado: true,
              keepMode: 'HIGHEST',
              rolagens: [3, 19, 7, 12],
            },
          ],
        },
      ],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(true);
    expect(resultado.payloads[0]?.bonusDados?.[0]).toMatchObject({
      origem: 'PERITO',
      efeitoPendenteId: 'perito:123',
    });
  });

  it('anexa Perito quando o d20 esta no terceiro grupo composto', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [
        {
          quantidade: 2,
          faces: 6,
          operador: '+',
          modificador: 0,
          aplicarModificadorPorDado: false,
          rolagens: [2, 5],
          termos: [
            {
              quantidade: 2,
              faces: 6,
              aplicarModificadorPorDado: false,
              keepMode: 'SUM',
              rolagens: [2, 5],
            },
            {
              quantidade: 3,
              faces: 8,
              aplicarModificadorPorDado: true,
              keepMode: 'HIGHEST',
              rolagens: [1, 8, 4],
            },
            {
              quantidade: 4,
              faces: 20,
              aplicarModificadorPorDado: true,
              keepMode: 'HIGHEST',
              rolagens: [3, 19, 7, 12],
            },
          ],
        },
      ],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(true);
    expect(resultado.payloads[0]?.bonusDados?.[0]).toMatchObject({
      origem: 'PERITO',
      efeitoPendenteId: 'perito:123',
    });
  });

  it('nao anexa Perito em rolagem composta sem d20', () => {
    const resultado = aplicarPeritoPendenteChatLivre(
      [
        {
          quantidade: 2,
          faces: 6,
          operador: '+',
          modificador: 0,
          aplicarModificadorPorDado: false,
          rolagens: [2, 5],
          termos: [
            {
              quantidade: 2,
              faces: 6,
              aplicarModificadorPorDado: false,
              keepMode: 'SUM',
              rolagens: [2, 5],
            },
            {
              quantidade: 2,
              faces: 8,
              aplicarModificadorPorDado: true,
              keepMode: 'HIGHEST',
              rolagens: [3, 7],
            },
          ],
        },
      ],
      perito,
      rolarBonus,
    );

    expect(resultado.consumiu).toBe(false);
    expect(resultado.payloads[0]?.bonusDados).toBeUndefined();
  });

  it('descreve o indicador do Perito pendente no chat', () => {
    expect(obterAvisoPeritoPendenteChat(perito)).toBe(
      'Perito pendente: será gasto na próxima rolagem com d20.',
    );
    expect(obterAvisoPeritoPendenteChat(null)).toBeNull();
  });
});

describe('sessao-dice autoritativo', () => {
  it('detecta d20 em qualquer grupo da intencao', () => {
    const comD20 = parseDiceInput('2d6+3#d8+4#d20').expressions ?? [];
    const semD20 = parseDiceInput('2d6+3#d8').expressions ?? [];

    expect(expressoesDiceContemD20(comD20)).toBe(true);
    expect(expressoesDiceContemD20(semD20)).toBe(false);
  });

  it('gera clientRequestId UUID v4', () => {
    expect(criarClientRequestIdRolagem()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('aceita apenas metadados de origem gravados pelo servidor', () => {
    const dados = {
      versao: 1,
      origem: 'SERVIDOR',
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
      expressaoOriginal: 'd20',
      payloads: [criarPayloadComRolagens('d20', [[15]])],
    };

    expect(extrairDadosRolagemServidor(dados)).toEqual(dados);
    expect(
      extrairDadosRolagemServidor({ ...dados, origem: 'CLIENTE_LEGADO' }),
    ).toBeNull();
  });

  it('aceita metadados autoritativos de pericia de personagem', () => {
    const dados = {
      versao: 1,
      origem: 'SERVIDOR',
      tipo: 'PERICIA_PERSONAGEM',
      clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
      personagemSessaoId: 31,
      personagemCampanhaId: 41,
      periciaCodigo: 'OCULTISMO',
      formulaResolvida: '2#d20+10',
      payloads: [criarPayloadComRolagens('2#d20+10', [[5, 18]])],
      resultado: {
        total: 28,
        dt: null,
        sucesso: null,
        falhaCritica: false,
      },
    };

    expect(extrairDadosRolagemServidor(dados)).toEqual(dados);
  });

  it('aceita metadados autoritativos de ataque de personagem', () => {
    const dados = {
      versao: 1,
      origem: 'SERVIDOR',
      tipo: 'ATAQUE_PERSONAGEM',
      clientRequestId: '6ff62ec2-a60e-4de8-99cf-6018cf83a68d',
      personagemSessaoId: 31,
      personagemCampanhaId: 41,
      periciaCodigo: 'LUTA',
      bonusBase: 10,
      bonusEscalada: 3,
      formulaResolvida: '2#d20+13',
      payloads: [criarPayloadComRolagens('2#d20+13', [[5, 18]])],
      resultado: {
        total: 31,
        dt: null,
        sucesso: null,
        falhaCritica: false,
      },
    };

    expect(extrairDadosRolagemServidor(dados)).toEqual(dados);
    expect(
      extrairDadosRolagemServidor({ ...dados, bonusEscalada: '3' }),
    ).toBeNull();
  });

  it('aceita metadados autoritativos de ataque de NPC por acao', () => {
    const dados = {
      versao: 1,
      origem: 'SERVIDOR',
      tipo: 'ATAQUE_NPC',
      clientRequestId: '869f390e-8b10-4de7-b7db-f3b97bcb2375',
      npcSessaoId: 71,
      npcAmeacaId: 81,
      entidadeVinculadaId: null,
      periciaCodigo: null,
      origemAtaque: 'ACAO',
      acaoIndice: 0,
      acaoNome: 'Garra',
      bonusBase: null,
      formulaResolvida: '2#d20+10',
      payloads: [criarPayloadComRolagens('2#d20+10', [[5, 18]])],
      resultado: {
        total: 28,
        dt: null,
        sucesso: null,
        falhaCritica: false,
      },
    };

    expect(extrairDadosRolagemServidor(dados)).toEqual(dados);
    expect(
      extrairDadosRolagemServidor({ ...dados, npcSessaoId: '71' }),
    ).toBeNull();
  });
});
