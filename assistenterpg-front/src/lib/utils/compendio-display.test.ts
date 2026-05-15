import { describe, expect, it } from 'vitest';
import {
  prepareCompendioMarkdownForDisplay,
  shouldCollapseSubcategoria,
  stripCompendioDisplayNumber,
  stripFirstDuplicateHeading,
  stripHeadingNumbersFromMarkdown,
} from './compendio-display';

describe('compendio display helpers', () => {
  it('removes numeric prefixes from display labels', () => {
    expect(stripCompendioDisplayNumber('4.2. PODERES ESPECIAIS')).toBe(
      'PODERES ESPECIAIS',
    );
    expect(stripCompendioDisplayNumber('## **12. ASPECTOS CONGENITOS**')).toBe(
      'ASPECTOS CONGENITOS',
    );
  });

  it('collapses subcategory labels when the only article has the same meaning', () => {
    expect(
      shouldCollapseSubcategoria({
        codigo: 'visao-geral',
        nome: 'Visao geral',
        artigos: [
          {
            id: 1,
            codigo: 'visao-geral',
            titulo: 'Visao geral',
            resumo: null,
            ordem: 1,
            destaque: false,
            ativo: true,
          },
        ],
      }),
    ).toBe(true);
  });

  it('keeps subcategory labels when there are multiple articles', () => {
    expect(
      shouldCollapseSubcategoria({
        codigo: 'classes',
        nome: 'Classes',
        artigos: [
          {
            id: 1,
            codigo: 'visao-geral',
            titulo: 'Visao geral',
            resumo: null,
            ordem: 1,
            destaque: false,
            ativo: true,
          },
          {
            id: 2,
            codigo: 'poderes',
            titulo: 'Poderes',
            resumo: null,
            ordem: 2,
            destaque: false,
            ativo: true,
          },
        ],
      }),
    ).toBe(false);
  });

  it('removes only the first duplicate article heading', () => {
    const markdown = '# 4.2. PODERES ESPECIAIS\n\nTexto\n\n## 4.2.1. Lista';

    expect(stripFirstDuplicateHeading(markdown, 'PODERES ESPECIAIS')).toBe(
      'Texto\n\n## 4.2.1. Lista',
    );
  });

  it('strips heading numbers from markdown headings only', () => {
    const markdown = [
      '## **4.2. PODERES ESPECIAIS**',
      '',
      'Texto 4.2. continua igual.',
      '',
      '### 4.2.1. Lista',
    ].join('\n');

    expect(stripHeadingNumbersFromMarkdown(markdown)).toBe(
      [
        '## **PODERES ESPECIAIS**',
        '',
        'Texto 4.2. continua igual.',
        '',
        '### Lista',
      ].join('\n'),
    );
  });

  it('prepares article markdown for reader rendering', () => {
    const markdown = '# **4.2. PODERES ESPECIAIS**\n\n## **4.2.1. Lista**';

    expect(prepareCompendioMarkdownForDisplay(markdown, 'PODERES ESPECIAIS')).toBe(
      '## **Lista**',
    );
  });
});
