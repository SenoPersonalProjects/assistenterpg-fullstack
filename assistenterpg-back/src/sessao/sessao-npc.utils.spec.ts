import {
  calcularDadosPadraoPericia,
  filtrarNpcsVisiveisCenaAtual,
  montarAtributosNpc,
  montarAtributosNpcSessao,
  normalizarTipoFichaNpcAmeaca,
  normalizarTipoNpcAmeaca,
  obterAtributoNpcPorBase,
  montarResumoNpcSessao,
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
});
