import {
  extrairPericiasTesteHabilidadePersistido,
  normalizarChavePericiaHabilidade,
  resolverFonteDanoHabilidadePersistida,
} from './sessao-habilidade-rolagem';

describe('sessao-habilidade-rolagem', () => {
  it('extrai testes compostos preservando a semantica atual', () => {
    expect(
      extrairPericiasTesteHabilidadePersistido([
        'Luta com Jujutsu (durante a tecnica)',
      ]),
    ).toEqual(['Luta', 'Jujutsu']);
    expect(normalizarChavePericiaHabilidade('Percepção')).toBe('percepcao');
  });

  it('agrupa dano por tipo e aplica escalonamento sem custo', () => {
    const resultado = resolverFonteDanoHabilidadePersistida({
      dadosDano: [
        { quantidade: 1, dado: 'd8', tipo: 'IMPACTO' },
        { quantidade: 2, dado: 'd8', tipo: 'IMPACTO' },
        { quantidade: 1, dado: 'd6', tipo: 'ENERGIA' },
      ],
      danoFlat: 3,
      danoFlatTipo: 'IMPACTO',
      escalonamentoDano: { quantidade: 1, dado: 'd8', tipo: 'IMPACTO' },
      acumulosAplicados: 3,
    });

    expect(resultado.erro).toBeNull();
    expect(resultado.expressoes).toEqual([
      expect.objectContaining({
        quantidade: 5,
        faces: 8,
        modificador: 3,
        label: 'IMPACTO',
      }),
      expect.objectContaining({ quantidade: 1, faces: 6, label: 'ENERGIA' }),
    ]);
  });

  it('aceita dano apenas flat sem inventar formula enviada pelo cliente', () => {
    const resultado = resolverFonteDanoHabilidadePersistida({
      dadosDano: null,
      danoFlat: 5,
      danoFlatTipo: 'ALMA',
      escalonamentoDano: null,
      acumulosAplicados: 0,
    });

    expect(resultado.expressoes).toEqual([
      expect.objectContaining({
        quantidade: 1,
        faces: 1,
        modificador: 4,
        label: 'ALMA',
      }),
    ]);
  });

  it.each([
    [{ quantidade: 0, dado: 'd8', tipo: 'IMPACTO' }],
    [{ quantidade: 1, dado: 'oitavo', tipo: 'IMPACTO' }],
    [{ quantidade: 1, dado: 'd1001', tipo: 'IMPACTO' }],
  ])('rejeita dano persistido invalido %#', (entrada) => {
    expect(
      resolverFonteDanoHabilidadePersistida({
        dadosDano: entrada,
        danoFlat: 0,
        danoFlatTipo: null,
        escalonamentoDano: null,
        acumulosAplicados: 0,
      }),
    ).toMatchObject({ expressoes: null, erro: expect.any(String) });
  });
});
