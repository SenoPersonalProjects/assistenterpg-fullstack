import { describe, expect, it } from 'vitest';
import {
  aplicarPeritoPendenteChatLivre,
  calcularResultadoDice,
  construirMensagemDice,
  obterAvisoPeritoPendenteChat,
  parseDiceInput,
  parseDiceExpression,
  parseDiceMessageGroup,
  type DicePeritoPendenteChat,
  type DiceRollPayload,
} from './sessao-dice';

describe('sessão-dice parser', () => {
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

  it('descreve o indicador do Perito pendente no chat', () => {
    expect(obterAvisoPeritoPendenteChat(perito)).toBe(
      'Perito pendente: será gasto na próxima rolagem com d20.',
    );
    expect(obterAvisoPeritoPendenteChat(null)).toBeNull();
  });
});
