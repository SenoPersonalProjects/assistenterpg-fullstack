import {
  agruparListaManual,
  criarPresetsPadraoRoleta,
  montarPoolRoleta,
  normalizarConfigRoleta,
  sortearItemRoleta,
  type CampanhaRoletaCatalogoItem,
} from './campanha-roleta';

const configBase = normalizarConfigRoleta({
  fontes: { sistemaBase: true, suplementoIds: [], homebrewIds: [] },
  exclusoes: [],
  inclusoesCatalogo: [],
  listaManualTexto: '',
  compatibilidadesHereditarias: [],
});

const catalogo: CampanhaRoletaCatalogoItem[] = [
  {
    chave: 'CLA:1',
    nome: 'Zenin',
    categoria: 'CLA',
    fonte: 'SISTEMA_BASE',
  },
  {
    chave: 'CLA:2',
    nome: 'Kamo',
    categoria: 'CLA',
    fonte: 'SISTEMA_BASE',
  },
  {
    chave: 'TECNICA:1',
    nome: 'Barreira Simples',
    categoria: 'TECNICA',
    fonte: 'SISTEMA_BASE',
    hereditaria: false,
  },
  {
    chave: 'TECNICA:2',
    nome: 'Dez Sombras',
    categoria: 'TECNICA',
    fonte: 'SISTEMA_BASE',
    hereditaria: true,
    claCompativeisChaves: ['CLA:1'],
  },
  {
    chave: 'TECNICA:3',
    nome: 'Manipulacao de Sangue',
    categoria: 'TECNICA',
    fonte: 'SISTEMA_BASE',
    hereditaria: true,
    claCompativeisChaves: ['CLA:2'],
  },
];

describe('campanha-roleta', () => {
  it('cria exatamente os tres slots fixos', () => {
    expect(criarPresetsPadraoRoleta(9).map((item) => item.slot)).toEqual([
      'CLA',
      'TECNICA',
      'CUSTOMIZADO',
    ]);
  });

  it('preserva repeticoes manuais como ocorrencias e peso visivel', () => {
    expect(agruparListaManual('A; B; A; A')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'A', ocorrencias: 3, pesoTotal: 3 }),
        expect.objectContaining({ nome: 'B', ocorrencias: 1, pesoTotal: 1 }),
      ]),
    );
  });

  it('duplica exatamente uma ocorrencia do cla escolhido', () => {
    const pool = montarPoolRoleta({
      modo: 'CLA',
      config: configBase,
      catalogo,
      claDuplicadoChave: 'CLA:1',
    });
    expect(pool.itens.find((item) => item.chave === 'CLA:1')).toEqual(
      expect.objectContaining({ ocorrencias: 2, pesoTotal: 2 }),
    );
    expect(pool.itens.find((item) => item.chave === 'CLA:2')).toEqual(
      expect.objectContaining({ ocorrencias: 1, pesoTotal: 1 }),
    );
  });

  it('aplica 2x a hereditaria compativel e exclui a incompativel', () => {
    const pool = montarPoolRoleta({
      modo: 'TECNICA',
      config: configBase,
      catalogo,
      claSelecionadoChave: 'CLA:1',
    });
    expect(pool.itens.find((item) => item.chave === 'TECNICA:1')).toEqual(
      expect.objectContaining({ pesoUnitario: 1 }),
    );
    expect(pool.itens.find((item) => item.chave === 'TECNICA:2')).toEqual(
      expect.objectContaining({ pesoUnitario: 2, pesoTotal: 2 }),
    );
    expect(pool.itens.some((item) => item.chave === 'TECNICA:3')).toBe(false);
  });

  it('mantem hereditaria incompativel incluida manualmente com peso 1x', () => {
    const pool = montarPoolRoleta({
      modo: 'TECNICA',
      config: { ...configBase, inclusoesCatalogo: ['TECNICA:3'] },
      catalogo,
      claSelecionadoChave: 'CLA:1',
    });
    expect(pool.itens.find((item) => item.chave === 'TECNICA:3')).toEqual(
      expect.objectContaining({ pesoUnitario: 1, incluidoManualmente: true }),
    );
  });

  it('exclui o primeiro resultado no segundo giro e permite repeti-lo no terceiro', () => {
    const pool = montarPoolRoleta({
      modo: 'CLA',
      config: configBase,
      catalogo,
    });
    const primeiro = sortearItemRoleta(pool, undefined, () => 0);
    const segundo = sortearItemRoleta(pool, primeiro.chave, () => 0);
    const terceiro = sortearItemRoleta(pool, undefined, () => 0);
    expect(segundo.chave).not.toBe(primeiro.chave);
    expect(terceiro.chave).toBe(primeiro.chave);
  });

  it('rejeita mais de 200 ocorrencias manuais', () => {
    expect(() => agruparListaManual(Array(201).fill('A').join(';'))).toThrow(
      '200 ocorrencias',
    );
  });
});
