import { describe, expect, it } from 'vitest';
import type {
  HabilidadeRollContext,
  RolagemDanoHabilidadeSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';
import {
  deveUsarCriticoHabilidadeAutoritativo,
  deveUsarDanoHabilidadeAutoritativo,
  montarIntencaoRolagemCriticoHabilidade,
  montarIntencaoRolagemDanoHabilidade,
  montarIntencaoRolagemTesteHabilidade,
  montarPreviewDanoHabilidade,
} from './sessao-rolagem-habilidade';

const habilidade: HabilidadeRollContext = {
  personagemSessaoId: 31,
  habilidadeTecnicaId: 501,
  variacaoHabilidadeId: 601,
  habilidadeNome: 'Punho Divergente',
  variacaoNome: 'Liberacao Superior',
  criticoMultiplicador: 3,
  dano: {
    dadosDano: [{ quantidade: 3, dado: 'd10', tipo: 'ENERGIA' }],
    danoFlat: 5,
    danoFlatTipo: 'ENERGIA',
    escalonamentoDano: { quantidade: 1, dado: 'd10', tipo: 'ENERGIA' },
    acumulos: 3,
  },
};

const teste: RolagemTesteHabilidadeSessaoPayload = {
  alvoTipo: 'PERSONAGEM',
  alvoNome: 'Yuji',
  periciaNome: 'Luta com Jujutsu',
  dados: 2,
  bonus: 8,
  keepMode: 'HIGHEST',
  habilidade,
};

const dano: RolagemDanoHabilidadeSessaoPayload = {
  alvoTipo: 'PERSONAGEM',
  alvoNome: 'Yuji',
  habilidade,
};

describe('rolagens autoritativas de habilidade', () => {
  it('monta intencao de teste somente com ids e metadados de transporte', () => {
    const intencao = montarIntencaoRolagemTesteHabilidade(
      teste,
      'PUBLICA',
      '524ad211-f941-48b1-a382-c331ed74c683',
    );

    expect(intencao).toEqual({
      tipo: 'TESTE_HABILIDADE_PERSONAGEM',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      visibilidade: 'PUBLICA',
      clientRequestId: '524ad211-f941-48b1-a382-c331ed74c683',
    });
    expect(intencao).not.toHaveProperty('formula');
    expect(intencao).not.toHaveProperty('bonus');
    expect(intencao).not.toHaveProperty('total');
  });

  it('monta dano com fonte, variacao e acumulos sem formula calculada', () => {
    const intencao = montarIntencaoRolagemDanoHabilidade(
      dano,
      'SECRETA_MESTRE',
      '06a375c1-fb84-4d98-99cc-ec00e0a5bef4',
    );

    expect(intencao).toEqual({
      tipo: 'DANO_PERSONAGEM',
      origemDano: 'HABILIDADE_TECNICA',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      variacaoHabilidadeId: 601,
      acumulos: 3,
      visibilidade: 'SECRETA_MESTRE',
      clientRequestId: '06a375c1-fb84-4d98-99cc-ec00e0a5bef4',
    });
    expect(intencao).not.toHaveProperty('formula');
    expect(intencao).not.toHaveProperty('dados');
    expect(intencao).not.toHaveProperty('custo');
  });

  it('omite acumulo base para habilidade sem escalonamento explicito', () => {
    const intencao = montarIntencaoRolagemDanoHabilidade(
      {
        ...dano,
        habilidade: {
          ...habilidade,
          dano: {
            dadosDano: [{ quantidade: 2, dado: 'd8', tipo: 'IMPACTO' }],
            acumulos: 1,
          },
        },
      },
      'PUBLICA',
      '51942ba0-d29b-4661-936d-7f7ad1a09430',
    );

    expect(intencao).not.toHaveProperty('acumulos');
  });

  it('separa dano e critico estruturados dos alvos que permanecem legados', () => {
    expect(deveUsarDanoHabilidadeAutoritativo(dano)).toBe(true);
    expect(
      deveUsarDanoHabilidadeAutoritativo({ ...dano, aplicarCritico: true }),
    ).toBe(false);
    expect(
      deveUsarCriticoHabilidadeAutoritativo({ ...dano, aplicarCritico: true }),
    ).toBe(true);
    expect(
      deveUsarDanoHabilidadeAutoritativo({ ...dano, alvoTipo: 'NPC' }),
    ).toBe(false);
    expect(
      deveUsarCriticoHabilidadeAutoritativo({
        ...dano,
        alvoTipo: 'NPC',
        aplicarCritico: true,
      }),
    ).toBe(false);
  });

  it('monta critico somente com ids, variacao e acumulos', () => {
    const intencao = montarIntencaoRolagemCriticoHabilidade(
      { ...dano, aplicarCritico: true },
      'PUBLICA',
      '87e9188e-74fd-465c-91c4-c18ca855cad8',
    );

    expect(intencao).toEqual({
      tipo: 'CRITICO_PERSONAGEM',
      origemCritico: 'HABILIDADE_TECNICA',
      personagemSessaoId: 31,
      habilidadeTecnicaId: 501,
      variacaoHabilidadeId: 601,
      acumulos: 3,
      visibilidade: 'PUBLICA',
      clientRequestId: '87e9188e-74fd-465c-91c4-c18ca855cad8',
    });
    expect(intencao).not.toHaveProperty('formula');
    expect(intencao).not.toHaveProperty('dados');
    expect(intencao).not.toHaveProperty('total');
  });

  it('omite acumulo unitario no critico', () => {
    const intencao = montarIntencaoRolagemCriticoHabilidade(
      {
        ...dano,
        aplicarCritico: true,
        habilidade: {
          ...habilidade,
          dano: { ...habilidade.dano!, acumulos: 1 },
        },
      },
      'PUBLICA',
      'cc5ea349-0cba-4010-ac18-b83d3436f942',
    );

    expect(intencao).not.toHaveProperty('acumulos');
  });

  it('gera apenas preview visual do dano estruturado sem resultados', () => {
    expect(montarPreviewDanoHabilidade(habilidade.dano!)).toEqual({
      expressions: ['ENERGIA: 5d10+5'],
      faces: [10],
    });
  });

  it('gera preview critico sem sortear resultados e preserva flat', () => {
    expect(montarPreviewDanoHabilidade(habilidade.dano!, 3)).toEqual({
      expressions: ['ENERGIA (Critico x3): 15d10+5'],
      faces: [10],
    });
  });
});
