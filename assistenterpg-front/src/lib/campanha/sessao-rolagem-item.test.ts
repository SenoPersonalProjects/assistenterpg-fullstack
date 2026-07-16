import { describe, expect, it } from 'vitest';
import { montarIntencaoRolagemMacroArma } from './sessao-rolagem-item';

describe('montarIntencaoRolagemMacroArma', () => {
  it('envia somente intencao manual para o ataque', () => {
    expect(
      montarIntencaoRolagemMacroArma(
        {
          acao: 'ATAQUE',
          personagemSessaoId: 12,
          itemInventarioCampanhaId: 34,
          atributoEscolhido: 'AGI',
          ajusteFlatManual: 5,
          ajusteDadosManual: -1,
        },
        'PUBLICA',
        '6f2e71ca-3715-4c5c-b756-c7b6c1bb4c47',
      ),
    ).toEqual({
      tipo: 'ATAQUE_ITEM_PERSONAGEM',
      personagemSessaoId: 12,
      itemInventarioCampanhaId: 34,
      atributoEscolhido: 'AGI',
      ajusteFlatManual: 5,
      ajusteDadosManual: -1,
      visibilidade: 'PUBLICA',
      clientRequestId: '6f2e71ca-3715-4c5c-b756-c7b6c1bb4c47',
    });
  });

  it('nao aceita total, faces ou resultado no contrato de dano', () => {
    const intencao = montarIntencaoRolagemMacroArma(
      {
        acao: 'DANO',
        personagemSessaoId: 12,
        itemInventarioCampanhaId: 34,
        empunhadura: 'UMA_MAO',
        ajusteFlatManual: 0,
        ajusteDadosManual: 0,
      },
      'PUBLICA',
      '5b054884-b3d9-4519-b2ef-c05b3bb1a548',
    );
    expect(intencao).toEqual({
      tipo: 'DANO_ITEM_PERSONAGEM',
      personagemSessaoId: 12,
      itemInventarioCampanhaId: 34,
      empunhadura: 'UMA_MAO',
      visibilidade: 'PUBLICA',
      clientRequestId: '5b054884-b3d9-4519-b2ef-c05b3bb1a548',
    });
  });
});
