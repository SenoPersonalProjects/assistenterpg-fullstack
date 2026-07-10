import { describe, expect, it } from 'vitest';
import {
  formatarBuffsAprimoradoAtivos,
  formatarTipoGrauAprimorado,
} from './sessao-aprimoramentos';

describe('sessao-aprimoramentos', () => {
  it('retorna lista vazia quando nao ha aprimoramentos ativos', () => {
    expect(formatarBuffsAprimoradoAtivos()).toEqual([]);
    expect(formatarBuffsAprimoradoAtivos([])).toEqual([]);
  });

  it('formata um buff ativo de Aprimorado com fonte, tecnica, grau e duracao', () => {
    const buffs = formatarBuffsAprimoradoAtivos([
      {
        id: 'aprimorado:1',
        tecnicaNome: 'Tecnica Amaldicoada Reversa',
        tipoGrauCodigo: 'TECNICA_REVERSA',
        graus: 1,
      },
    ]);

    expect(buffs).toEqual([
      expect.objectContaining({
        fonte: 'Aprimorado',
        tecnicaNome: 'Tecnica Amaldicoada Reversa',
        grauLabel: 'Técnica Reversa',
        bonusLabel: '+1 grau',
        duracao: 'até o fim da cena',
        texto:
          'Aprimorado: Tecnica Amaldicoada Reversa · Técnica Reversa +1 grau · até o fim da cena',
      }),
    ]);
  });

  it('formata multiplos buffs ativos de Aprimorado', () => {
    const buffs = formatarBuffsAprimoradoAtivos([
      {
        id: 'aprimorado:1',
        tecnicaNome: 'Tecnica Reversa',
        tipoGrauCodigo: 'TECNICA_REVERSA',
        graus: 1,
      },
      {
        id: 'aprimorado:2',
        tecnicaNome: 'Barreira',
        tipoGrauCodigo: 'BARREIRA',
        graus: 2,
      },
    ]);

    expect(buffs).toHaveLength(2);
    expect(buffs[0]?.bonusLabel).toBe('+1 grau');
    expect(buffs[1]?.bonusLabel).toBe('+2 graus');
  });

  it('usa fallback seguro quando campos opcionais estao ausentes', () => {
    const buffs = formatarBuffsAprimoradoAtivos([
      {
        personagemCampanhaId: 51,
        tecnicaId: 10,
      },
    ]);

    expect(buffs[0]).toEqual(
      expect.objectContaining({
        id: 'aprimorado:51:10:0',
        tecnicaNome: 'Técnica',
        grauLabel: 'Grau',
        bonusLabel: '+0 graus',
      }),
    );
  });

  it('gera label legivel para tipoGrauCodigo desconhecido', () => {
    expect(formatarTipoGrauAprimorado('TECNICA_REVERSA')).toBe(
      'Técnica Reversa',
    );
    expect(formatarTipoGrauAprimorado('GRAU_SECRETO')).toBe('Grau Secreto');
  });
});
