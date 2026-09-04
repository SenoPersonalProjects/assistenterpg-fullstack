import {
  calcularStatusPersonagemCampanhaResumo,
  CampanhaMapper,
} from './campanha.mapper';

describe('CampanhaMapper', () => {
  const resumo = (overrides: Record<string, unknown> = {}) => ({
    id: 10,
    campanhaId: 20,
    personagemBaseId: 30,
    donoId: 40,
    nome: 'Personagem',
    pvAtual: 40,
    pvMax: 100,
    pvBarrasTotal: 1,
    pvBarrasRestantes: 1,
    sanAtual: 60,
    sanMax: 100,
    personagemBase: { id: 30, nome: 'Base' },
    dono: { id: 40, apelido: 'Jogador' },
    ...overrides,
  });

  it('mapeia terceiros apenas com identidade e status', () => {
    const resposta = new CampanhaMapper().mapearPersonagemCampanhaResumo(
      resumo(),
    );

    expect(resposta).toEqual({
      id: 10,
      campanhaId: 20,
      personagemBaseId: 30,
      donoId: 40,
      nome: 'Personagem',
      personagemBase: { id: 30, nome: 'Base' },
      dono: { id: 40, apelido: 'Jogador' },
      visibilidade: 'resumida',
      status: { fisico: 'Machucado', mental: 'Bom' },
    });
    expect(resposta).not.toHaveProperty('recursos');
    expect(resposta).not.toHaveProperty('modificadoresAtivos');
    expect(resposta).not.toHaveProperty('nivel');
  });

  it.each([
    [{ pvAtual: 0, sanAtual: 0 }, { fisico: 'Morrendo', mental: 'Enlouquecendo' }],
    [{ pvAtual: 50, sanAtual: 50 }, { fisico: 'Machucado', mental: 'Ruim' }],
    [{ pvAtual: 100, sanAtual: 100 }, { fisico: 'Vivo', mental: 'Bom' }],
  ])('calcula os limites de status: %o', (entrada, esperado) => {
    expect(calcularStatusPersonagemCampanhaResumo({
      ...resumo(),
      ...entrada,
    })).toEqual(esperado);
  });
});
