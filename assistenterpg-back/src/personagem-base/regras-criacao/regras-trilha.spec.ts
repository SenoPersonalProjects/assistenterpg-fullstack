import { validarRequisitosTrilha } from './regras-trilha';

describe('validarRequisitosTrilha', () => {
  it('aceita trilha semTecnicaInata quando personagem nao tem tecnica inata', () => {
    const resultado = validarRequisitosTrilha(
      { semTecnicaInata: true },
      [],
      null,
    );

    expect(resultado).toEqual({ valido: true });
  });

  it('bloqueia trilha semTecnicaInata quando personagem tem tecnica inata', () => {
    const resultado = validarRequisitosTrilha(
      { semTecnicaInata: true },
      [],
      21,
    );

    expect(resultado.valido).toBe(false);
    expect(resultado.mensagemErro).toContain('sem tecnica');
  });

  it('mantem validacao de pericia treinada', () => {
    const resultado = validarRequisitosTrilha(
      { pericias: [{ codigo: 'MEDICINA', treinada: true }] },
      [{ codigo: 'MEDICINA', grauTreinamento: 1 }],
      null,
    );

    expect(resultado).toEqual({ valido: true });
  });
});
