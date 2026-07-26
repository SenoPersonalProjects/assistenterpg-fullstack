import { calcularLimitePericiasLivres } from './personagem-base.engine';

describe('calcularLimitePericiasLivres', () => {
  it('permite 12 pericias para Especialista com INT 4 e INT_I', () => {
    expect(
      calcularLimitePericiasLivres({
        periciasLivresBaseClasse: 7,
        intelecto: 4,
        bonusPassivasIntelecto: 1,
      }),
    ).toEqual({
      baseComIntelecto: 11,
      total: 12,
    });
  });
});
