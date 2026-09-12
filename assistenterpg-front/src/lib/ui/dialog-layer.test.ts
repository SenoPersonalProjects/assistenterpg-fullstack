import { describe, expect, it } from 'vitest';
import {
  adicionarCamadaDialogo,
  indiceCamadaDialogo,
  removerCamadaDialogo,
  zIndexCamadaDialogo,
} from './dialog-layer';

describe('camadas de diálogo', () => {
  it('mantém a ordem de abertura sem duplicar uma camada', () => {
    const primeira = adicionarCamadaDialogo([], 'principal');
    const aninhada = adicionarCamadaDialogo(primeira, 'confirmacao');

    expect(adicionarCamadaDialogo(aninhada, 'principal')).toEqual(aninhada);
    expect(aninhada).toEqual(['principal', 'confirmacao']);
  });

  it('preserva a camada inferior e eleva a camada aberta por último', () => {
    const camadas = ['principal', 'confirmacao'];

    expect(removerCamadaDialogo(camadas, 'confirmacao')).toEqual(['principal']);
    expect(indiceCamadaDialogo(camadas, 'confirmacao')).toBe(1);
    expect(zIndexCamadaDialogo(indiceCamadaDialogo(camadas, 'confirmacao'))).toBe(60);
  });
});
