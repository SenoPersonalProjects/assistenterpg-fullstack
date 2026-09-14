import {
  calcularDadosPadraoPericia,
  montarAtributosNpc,
  montarAtributosNpcSessao,
  normalizarTipoFichaNpcAmeaca,
  normalizarTipoNpcAmeaca,
  obterAtributoNpcPorBase,
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
});
