import { criarContextoEfeitosTurno } from './sessao-efeitos-turno-contexto';

describe('criarContextoEfeitosTurno', () => {
  const base = {
    acao: 'AVANCAR' as const,
    cenaId: 12,
    rodadaAnterior: 2,
    rodadaNova: 3,
    atualizadoEm: '2026-09-13T00:00:00.000Z',
  };

  it('ordena sustentação, condições da rodada e participantes válidos', () => {
    const contexto = criarContextoEfeitosTurno({
      ...base,
      cobrarSustentacoes: true,
      processarCondicoes: true,
      participantesTurnoNovos: [
        {
          tipoParticipante: 'PERSONAGEM',
          personagemSessaoId: 4,
          npcSessaoId: null,
        },
        {
          tipoParticipante: 'NPC',
          personagemSessaoId: null,
          npcSessaoId: 8,
        },
      ],
    });

    expect(contexto).toMatchObject({
      status: 'PENDENTE',
      tentativas: 0,
      atualizadoEm: base.atualizadoEm,
    });
    expect(contexto.passos.map((passo) => passo.chave)).toEqual([
      'SUSTENTACOES_RODADA',
      'CONDICOES_RODADA',
      'CONDICOES_PARTICIPANTE:PERSONAGEM:4',
      'CONDICOES_PARTICIPANTE:NPC:8',
    ]);
  });

  it('não cria passos para efeitos desabilitados ou participantes sem id', () => {
    const contexto = criarContextoEfeitosTurno({
      ...base,
      acao: 'VOLTAR',
      cobrarSustentacoes: false,
      processarCondicoes: false,
      participantesTurnoNovos: [
        {
          tipoParticipante: 'PERSONAGEM',
          personagemSessaoId: null,
          npcSessaoId: null,
        },
      ],
    });

    expect(contexto.status).toBe('CONCLUIDO');
    expect(contexto.passos).toEqual([]);
  });
});
