import { CategoriaEquipamento, TipoEquipamento } from '@prisma/client';
import {
  aplicarReducaoCategoriaDeterministica,
  calcularCapacidadeInventario,
  calcularCategoriaInventario,
  calcularEspacoUnitarioInventario,
  resolverModificadoresInventario,
} from './inventario-calculo';

describe('inventario-calculo', () => {
  it('calcula 20 espaços para a Jiwa com Inventário Otimizado', () => {
    const modificadores = resolverModificadoresInventario([
      { inventario: { somarIntelecto: true } },
    ]);

    expect(
      calcularCapacidadeInventario({
        forca: 0,
        intelecto: 4,
        modificadores,
      }),
    ).toMatchObject({
      base: 20,
      total: 20,
      formula: {
        forca: 0,
        intelectoAplicado: 4,
        atributoTotal: 4,
        multiplicador: 5,
        minimoAplicado: false,
      },
    });
  });

  it('aplica o mínimo de 2 quando o atributo total é zero', () => {
    expect(
      calcularCapacidadeInventario({ forca: 0, intelecto: 4 }),
    ).toMatchObject({
      base: 2,
      total: 2,
      formula: { minimoAplicado: true, intelectoAplicado: 0 },
    });
  });

  it('mantém separados extras de habilidades e itens', () => {
    const modificadores = resolverModificadoresInventario([
      { inventario: { espacosExtra: 3 } },
      { inventario: { espacosExtra: 2 } },
    ]);

    expect(
      calcularCapacidadeInventario({
        forca: 2,
        modificadores,
        espacosExtraItens: 2,
        espacosOcupados: 15,
      }),
    ).toMatchObject({
      base: 10,
      extraHabilidades: 5,
      extraItens: 2,
      extra: 7,
      total: 17,
      ocupados: 15,
      restantes: 2,
      sobrecarregado: false,
    });
  });

  it('resolve Inventário Organizado, Ferramentas Favoritas e crédito', () => {
    expect(
      resolverModificadoresInventario([
        {
          inventario: {
            somarIntelecto: true,
            reduzirItensLeves: true,
          },
        },
        {
          itens: { reduzCategoriaEm: 1, excetoTipos: ['arma'] },
          economia: { creditoCategoriaBonus: 1 },
        },
      ]),
    ).toEqual({
      somarIntelecto: true,
      espacosExtraHabilidades: 0,
      reduzirItensLeves: true,
      reduzirCategoriaEm: 1,
      reduzirCategoriaExcetoTipos: ['ARMA'],
      creditoCategoriaBonus: 1,
    });
  });

  it('reduz item leve uma única vez antes de somar modificações', () => {
    expect(
      calcularEspacoUnitarioInventario({
        espacosBase: 0.5,
        reduzirItensLeves: true,
        incrementosModificacoes: [1],
      }),
    ).toBe(1.25);
  });

  it('preserva a escolha determinística e não reduz armas', () => {
    const itens = [
      {
        categoriaCalculada: CategoriaEquipamento.CATEGORIA_2,
        espacosCalculados: 2,
        quantidade: 1,
        equipamento: {
          tipo: TipoEquipamento.ARMA,
          categoria: CategoriaEquipamento.CATEGORIA_2,
          tipoArma: 'CORPO_A_CORPO',
        },
      },
      {
        categoriaCalculada: CategoriaEquipamento.CATEGORIA_2,
        espacosCalculados: 1,
        quantidade: 2,
        equipamento: {
          tipo: TipoEquipamento.ACESSORIO,
          categoria: CategoriaEquipamento.CATEGORIA_2,
        },
      },
    ];

    const resultado = aplicarReducaoCategoriaDeterministica(itens, 1, ['ARMA']);

    expect(resultado[0].categoriaCalculada).toBe(
      CategoriaEquipamento.CATEGORIA_2,
    );
    expect(resultado[1].categoriaCalculada).toBe(
      CategoriaEquipamento.CATEGORIA_3,
    );
    expect(itens[1].categoriaCalculada).toBe(CategoriaEquipamento.CATEGORIA_2);
    expect(aplicarReducaoCategoriaDeterministica(itens, 1, ['ARMA'])).toEqual(
      resultado,
    );
  });

  it('calcula categoria bruta somente a partir do equipamento e modificações', () => {
    expect(
      calcularCategoriaInventario(CategoriaEquipamento.CATEGORIA_4, 2),
    ).toBe(CategoriaEquipamento.CATEGORIA_2);
  });
});
