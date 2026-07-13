import { describe, expect, it } from 'vitest';
import type { SessaoCampanhaDetalhe } from '../types/campanha.types';
import {
  calcularIndiceProximoTurno,
  calcularIntervaloPolling,
  calcularRestanteCooldown,
  montarPayloadOrdemIniciativa,
  podeMutarItensSessao,
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

  it('mantem itens somente leitura quando a sessao esta encerrada', () => {
    expect(podeMutarItensSessao(false)).toBe(true);
    expect(podeMutarItensSessao(true)).toBe(false);
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

  it('retorna erro quando a ordem possui participante inválido', () => {
    const ordemInvalida: SessaoCampanhaDetalhe['iniciativa']['ordem'] = [
      {
        ...ordemBase[0],
        npcSessaoId: null,
      },
    ];

    const { payload, erro } = montarPayloadOrdemIniciativa(ordemInvalida, null);

    expect(payload).toBeNull();
    expect(erro).toBe('Não foi possível reordenar iniciativa: participante inválido.');
  });

  it('valida condicao com id inválido', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '',
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: '1',
      acumulos: '1',
      limiteFonte: '',
    });

    expect(resultado.erro).toBe('Selecione uma condição válida para aplicar.');
    expect(resultado.condicaoId).toBeNull();
    expect(resultado.duracaoValor).toBeNull();
  });

  it('valida condição com duração numérica inválida', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '10',
      duracaoModo: 'RODADAS',
      duracaoValor: '0',
      acumulos: '1',
      limiteFonte: '',
    });

    expect(resultado.erro).toBe('Informe uma duração numérica maior que zero.');
    expect(resultado.condicaoId).toBe(10);
    expect(resultado.duracaoValor).toBeNull();
  });

  it('valida condição com duração válida', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '8',
      duracaoModo: 'TURNOS_ALVO',
      duracaoValor: '3',
      acumulos: '2',
      limiteFonte: '5',
    });

    expect(resultado.erro).toBeNull();
    expect(resultado.condicaoId).toBe(8);
    expect(resultado.duracaoValor).toBe(3);
  });

  it('ignora duração numérica quando modo for até remover', () => {
    const resultado = validarAplicacaoCondicao({
      condicaoId: '7',
      duracaoModo: 'ATE_REMOVER',
      duracaoValor: '0',
      acumulos: '1',
      limiteFonte: '',
    });

    expect(resultado.erro).toBeNull();
    expect(resultado.condicaoId).toBe(7);
    expect(resultado.duracaoValor).toBeNull();
  });
});
