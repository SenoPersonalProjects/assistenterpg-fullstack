import {
  calcularDadosPadraoPericia,
  criarSnapshotNpcSessao,
  filtrarNpcsVisiveisCenaAtual,
  filtrarEventosVisiveisParaJogador,
  montarAtributosNpc,
  montarAtributosNpcSessao,
  normalizarTipoFichaNpcAmeaca,
  normalizarTipoNpcAmeaca,
  obterAtributoNpcPorBase,
  montarResumoNpcSessao,
  montarAtualizacaoNpcPorSnapshot,
  podeControlarNpcSessao,
} from './sessao-npc.utils';

describe('utilitários de NPC da sessão', () => {
  it('normaliza atributos e mantém NPC persistido fora da cópia local', () => {
    const atributos = montarAtributosNpc({ agilidade: 3, vigor: null });

    expect(atributos).toEqual({
      agilidade: 3,
      forca: 0,
      intelecto: 0,
      presenca: 0,
      vigor: 0,
    });
    expect(
      montarAtributosNpcSessao({ npcAmeacaId: 1, agilidade: 4 }),
    ).toBeNull();
    expect(
      montarAtributosNpcSessao({ npcAmeacaId: null, agilidade: 4 }),
    ).toMatchObject({ agilidade: 4 });
  });

  it('resolve atributo, dados de perícia e tipos aceitos', () => {
    const atributos = montarAtributosNpc({ presenca: -2 });

    expect(obterAtributoNpcPorBase(atributos, 'PRE')).toBe(-2);
    expect(calcularDadosPadraoPericia(-2)).toBe(4);
    expect(calcularDadosPadraoPericia(3)).toBe(3);
    expect(normalizarTipoFichaNpcAmeaca('NPC')).toBe('NPC');
    expect(normalizarTipoFichaNpcAmeaca('OUTRO')).toBeNull();
    expect(normalizarTipoNpcAmeaca('MALDICAO')).toBe('MALDICAO');
    expect(normalizarTipoNpcAmeaca('INVALIDO')).toBeNull();
  });

  it('preserva a privacidade e o controle operacional de NPCs', () => {
    const npc = {
      controladorUsuarioId: 8,
      personagemDono: { donoId: 7 },
      personagemControladorSessao: { controladorUsuarioId: 9 },
    };

    expect(podeControlarNpcSessao(false, 8, npc)).toBe(true);
    expect(podeControlarNpcSessao(false, 9, npc)).toBe(true);
    expect(podeControlarNpcSessao(false, 10, npc)).toBe(false);
    expect(
      filtrarNpcsVisiveisCenaAtual(
        [
          { id: 1, ocultoJogadores: false },
          { id: 2, ocultoJogadores: true },
        ],
        false,
      ),
    ).toEqual([{ id: 1, ocultoJogadores: false }]);
    expect(
      montarResumoNpcSessao({
        id: 1,
        nomeExibicao: 'Aliado',
        fichaTipo: 'NPC',
        tipo: 'HUMANO',
        ocultoJogadores: false,
      }),
    ).toMatchObject({
      visibilidade: 'resumida',
      condicoesAtivas: [],
    });
  });

  it('oculta eventos que referenciam NPCs ocultos, inclusive aninhados', () => {
    const eventos = [
      { dados: { npcSessaoId: 2 } },
      { dados: { contexto: { alvoNpcId: '2' } } },
      { dados: { npcSessaoId: 3 } },
    ];
    expect(filtrarEventosVisiveisParaJogador(eventos, new Set([2]))).toEqual([
      { dados: { npcSessaoId: 3 } },
    ]);
  });

  it('preserva o snapshot completo do NPC para reversão', () => {
    const snapshot = criarSnapshotNpcSessao({
      npcAmeacaId: 4,
      nomeExibicao: 'Aliado',
      fichaTipo: 'NPC',
      tipo: 'HUMANO',
      vd: 1,
      iniciativaValor: null,
      defesa: 12,
      pontosVidaAtual: 8,
      pontosVidaMax: 10,
      peAtual: null,
      peMax: null,
      sanAtual: null,
      sanMax: null,
      eaAtual: 2,
      eaMax: 3,
      machucado: null,
      deslocamentoMetros: 9,
      passivasGuia: null,
      acoesGuia: null,
      notasCena: null,
      ocultoJogadores: false,
      cenaId: 2,
    });
    expect(snapshot).toMatchObject({ npcAmeacaId: 4, eaAtual: 2, cenaId: 2 });
    expect(montarAtualizacaoNpcPorSnapshot(snapshot)).toMatchObject({
      pontosVidaAtual: 8,
      pontosVidaMax: 10,
      eaAtual: 2,
      eaMax: 3,
      ocultoJogadores: false,
    });
  });
});
