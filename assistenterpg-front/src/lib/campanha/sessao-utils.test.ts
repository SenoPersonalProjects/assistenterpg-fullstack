import { describe, expect, it } from 'vitest';
import type { SessaoCampanhaDetalhe } from '../types/campanha.types';
import {
  calcularIndiceProximoTurno,
  calcularIntervaloPolling,
  calcularRestanteCooldown,
  montarPayloadOrdemIniciativa,
  validarAplicacaoCondicao,
} from './sessao-utils';

const ordemBase: SessaoCampanhaDetalhe['iniciativa']['ordem'] = [
  {
    tipoParticipante: 'NPC',
    personagemSessaoId: null,
    npcSessaoId: 5,
    personagemCampanhaId: null,
    donoId: null,
    nomeJogador: null,
    nomePersonagem: 'Goblin',
    podeEditar: false,
    valorIniciativa: 12,
  },
  {
    tipoParticipante: 'PERSONAGEM',
    personagemSessaoId: 9,
    npcSessaoId: null,
    personagemCampanhaId: 3,
    donoId: 99,
    nomeJogador: 'Alice',
    nomePersonagem: 'Hero',
    podeEditar: true,
    valorIniciativa: 18,
  },
];

describe('sessao-utils', () => {
  it('calcula intervalo de polling baseado no socket', () => {
    expect(calcularIntervaloPolling(true)).toBe(15000);
    expect(calcularIntervaloPolling(false)).toBe(3000);
  });

  it('calcula restante de cooldown', () => {
    expect(calcularRestanteCooldown(10000, 8000, 2500)).toBe(500);
    expect(calcularRestanteCooldown(5000, 0, 2500)).toBe(-2500);
  });

  it('calcula indice do proximo turno', () => {
    expect(calcularIndiceProximoTurno(1, 3)).toBe(2);
    expect(calcularIndiceProximoTurno(2, 3)).toBe(0);
    expect(calcularIndiceProximoTurno(null, 3)).toBe(0);
    expect(calcularIndiceProximoTurno(0, 0)).toBeNull();
  });

  it('monta payload de iniciativa valido', () => {
    const { payload, erro } = montarPayloadOrdemIniciativa(ordemBase, 1);

    expect(erro).toBeNull();
    expect(payload).toEqual({
      ordem: [
        { tipoParticipante: 'NPC', id: 5 },
        { tipoParticipante: 'PERSONAGEM', id: 9 },
      ],
      indiceTurnoAtual: 1,
    });
  });

  it('retorna erro quando a ordem possui participante invalido', () => {
    const ordemInvalida: SessaoCampanhaDetalhe['iniciativa']['ordem'] = [
      {
        ...ordemBase[0],
        npcSessaoId: null,
      },
    ];

    const { payload, erro } = montarPayloadOrdemIniciativa(ordemInvalida, null);

    expect(payload).toBeNull();
    expect(erro).toBe('Nao foi possivel reordenar iniciativa: participante invalido.');
  });

  it('valida condicao com id invalido', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '',
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: '1',
    });

    expect(resultado.erro).toBe('Selecione uma condicao valida para aplicar.');
    expect(resultado.condicaoId).toBeNull();
    expect(resultado.duracaoValor).toBeNull();
  });

  it('valida condicao com duracao numerica invalida', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '10',
      duracaoModo: 'RODADAS',
      duracaoValor: '0',
    });

    expect(resultado.erro).toBe('Informe uma duracao numerica maior que zero.');
    expect(resultado.condicaoId).toBe(10);
    expect(resultado.duracaoValor).toBeNull();
  });

  it('valida condicao com duracao valida', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '8',
      duracaoModo: 'TURNOS_ALVO',
      duracaoValor: '3',
    });

    expect(resultado.erro).toBeNull();
    expect(resultado.condicaoId).toBe(8);
    expect(resultado.duracaoValor).toBe(3);
  });

  it('ignora duracao numerica quando modo for ate remover', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '7',
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: '0',
    });

    expect(resultado.erro).toBeNull();
    expect(resultado.condicaoId).toBe(7);
    expect(resultado.duracaoValor).toBeNull();
  });
});
