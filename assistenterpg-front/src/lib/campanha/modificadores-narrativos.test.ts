import { describe, expect, it } from 'vitest';
import {
  calcularPreviewGrauNarrativo,
  calcularPreviewTreinamentoNarrativo,
  formatarValorModificadorNarrativo,
  obterAlvoModificadorNarrativo,
} from './modificadores-narrativos';

describe('modificadores-narrativos', () => {
  it('calcula preview de treinamento com limite entre 0 e 4', () => {
    expect(calcularPreviewTreinamentoNarrativo(0, 1)).toEqual({
      atual: 0,
      proximo: 1,
    });
    expect(calcularPreviewTreinamentoNarrativo(1, -5)).toEqual({
      atual: 1,
      proximo: 0,
    });
    expect(calcularPreviewTreinamentoNarrativo(3, 5)).toEqual({
      atual: 3,
      proximo: 4,
    });
  });

  it('calcula preview de grau sem permitir valor negativo', () => {
    expect(calcularPreviewGrauNarrativo(2, 1)).toEqual({
      atual: 2,
      proximo: 3,
    });
    expect(calcularPreviewGrauNarrativo(1, -5)).toEqual({
      atual: 1,
      proximo: 0,
    });
  });

  it('formata valor com unidade correta para perícias e graus', () => {
    expect(formatarValorModificadorNarrativo('PERICIA_TREINAMENTO', 1)).toBe(
      '+1 nível',
    );
    expect(formatarValorModificadorNarrativo('PERICIA_TREINAMENTO', -2)).toBe(
      '-2 níveis',
    );
    expect(formatarValorModificadorNarrativo('GRAU_APRIMORAMENTO', 1)).toBe(
      '+1 grau',
    );
    expect(formatarValorModificadorNarrativo('GRAU_APRIMORAMENTO', -2)).toBe(
      '-2 graus',
    );
    expect(formatarValorModificadorNarrativo('EA_MAX', -5)).toBe('-5');
  });

  it('resolve alvo estruturado do modificador', () => {
    expect(
      obterAlvoModificadorNarrativo({
        id: 1,
        campanhaId: 44,
        personagemCampanhaId: 13,
        sessaoId: null,
        cenaId: null,
        campo: 'PERICIA_TREINAMENTO',
        periciaCodigo: 'OCULTISMO',
        tipoGrauCodigo: null,
        valor: 1,
        nome: 'Treino',
        descricao: null,
        ativo: true,
        criadoEm: '2026-07-11T00:00:00.000Z',
        criadoPorId: 1,
        desfeitoEm: null,
        desfeitoPorId: null,
        motivoDesfazer: null,
        pericia: { codigo: 'OCULTISMO', nome: 'Ocultismo' },
      }),
    ).toBe('Ocultismo');
    expect(
      obterAlvoModificadorNarrativo({
        id: 2,
        campanhaId: 44,
        personagemCampanhaId: 13,
        sessaoId: null,
        cenaId: null,
        campo: 'GRAU_APRIMORAMENTO',
        periciaCodigo: null,
        tipoGrauCodigo: 'TECNICA_REVERSA',
        valor: 1,
        nome: 'Grau',
        descricao: null,
        ativo: true,
        criadoEm: '2026-07-11T00:00:00.000Z',
        criadoPorId: 1,
        desfeitoEm: null,
        desfeitoPorId: null,
        motivoDesfazer: null,
      }),
    ).toBe('TECNICA_REVERSA');
  });
});
