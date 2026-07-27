import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PersonagemBasePreview } from '@/lib/types/personagem.types';
import {
  converterPreviewPersonagemParaInventario,
  normalizarCapacidadePreviewPersonagem,
} from './inventario-preview';

describe('inventario-preview', () => {
  it('preserva o cálculo autoritativo da Jiwa', () => {
    const preview = {
      prestigioBase: 30,
      espacosInventario: {
        base: 20,
        extra: 2,
        extraHabilidades: 0,
        extraItens: 2,
        total: 22,
        ocupados: 15,
        restantes: 7,
        sobrecarregado: false,
        formula: {
          forca: 0,
          intelectoAplicado: 4,
          atributoTotal: 4,
          multiplicador: 5,
          minimoAplicado: false,
        },
        limitesPorCategoria: { '0': 999 },
        itensPorCategoria: { '0': 1 },
      },
      itensInventario: [
        {
          indiceEntrada: 0,
          equipamentoId: 10,
          equipamento: {
            id: 10,
            codigo: 'ITEM_TESTE',
            nome: 'Item',
            tipo: 'ACESSORIO',
            categoria: 'CATEGORIA_0',
            espacos: 1,
          },
          quantidade: 1,
          equipado: false,
          modificacoesIds: [],
          modificacoes: [],
          espacosPorUnidade: 0.5,
          espacosTotal: 0.5,
          categoriaCalculada: 'CATEGORIA_0',
        },
      ],
    } as unknown as PersonagemBasePreview;

    expect(normalizarCapacidadePreviewPersonagem(preview)).toMatchObject({
      base: 20,
      extraItens: 2,
      total: 22,
      formula: { intelectoAplicado: 4 },
    });
    expect(converterPreviewPersonagemParaInventario(preview)).toMatchObject({
      espacosBase: 20,
      espacosTotal: 22,
      itens: [
        {
          indiceEntrada: 0,
          categoriaCalculada: 'CATEGORIA_0',
          espacosPorUnidade: 0.5,
        },
      ],
    });
  });

  it('impede fórmulas e categorias autoritativas locais nas telas de inventário', () => {
    const arquivos = [
      'src/components/personagem-base/create/wizard/PersonagemBaseStepInventario.tsx',
      'src/components/personagem-base/create/InventarioItemCard.tsx',
      'src/components/personagem-base/create/InventarioGrauXama.tsx',
      'src/components/personagem-base/create/InventarioCapacidadeCarga.tsx',
      'src/components/personagem-base/sections/SecaoInventario.tsx',
    ];

    arquivos.forEach((arquivo) => {
      const conteudo = readFileSync(resolve(process.cwd(), arquivo), 'utf8');
      expect(conteudo).not.toContain('calcularCategoriaFinal');
      expect(conteudo).not.toContain('Força × 5');
      expect(conteudo).not.toMatch(/\bforca\s*\*\s*5\b/i);
    });
  });
});
