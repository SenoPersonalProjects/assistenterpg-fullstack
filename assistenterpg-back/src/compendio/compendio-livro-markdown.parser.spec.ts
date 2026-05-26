import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MAX_ARTICLE_BYTES,
  parseLivroPrincipalMarkdown,
  splitMarkdownByByteLimit,
  type LivroSeed,
} from './compendio-livro-markdown.parser';

const markdownPath = join(
  process.cwd(),
  'prisma',
  'seeds',
  'compendio',
  'assets',
  'Maledicencia_RPG_1_1.docx.md',
);

function parseLivro(): LivroSeed {
  return parseLivroPrincipalMarkdown(readFileSync(markdownPath, 'utf8'));
}

function getAllArticles(livro: LivroSeed) {
  return livro.categorias.flatMap((categoria) =>
    categoria.subcategorias.flatMap((subcategoria) => subcategoria.artigos),
  );
}

describe('parseLivroPrincipalMarkdown', () => {
  it('generates the intro section plus the 14 numbered chapters', () => {
    const livro = parseLivro();
    const capitulos = livro.categorias.filter(
      (categoria) => categoria.codigo !== 'apresentacao-e-sumario',
    );

    expect(capitulos).toHaveLength(14);
    expect(capitulos.map((categoria) => categoria.codigo)).toEqual([
      'introducao-ao-sistema-jujutsu-kaisen-rpg',
      'introducao-as-regras-basicas-na-criacao-do-personagem',
      'criacao-de-personagem',
      'classes-e-trilhas',
      'origens-e-clas',
      'hierarquia-de-feiticeiros',
      'tecnicas-amaldicoadas',
      'equipamentos',
      'shikigamis-e-corpos-amaldicoados',
      'regras-gerais',
      'ameacas-e-npcs',
      'aspectos-congenitos',
      'mecanicas-interessantes',
      'condicoes',
    ]);
    expect(capitulos.map((categoria) => categoria.codigo)).not.toContain(
      'ataques-e-habilidades',
    );
    expect(capitulos.map((categoria) => categoria.codigo)).not.toContain(
      'defina-custo-de-invocacao-e-utilizacao',
    );
  });

  it('creates a v1.1 summary intro and preserves markdown tables from the source', () => {
    const livro = parseLivro();
    const artigos = getAllArticles(livro);
    const apresentacao = artigos.find(
      (artigo) => artigo.codigo === 'apresentacao-e-sumario',
    );
    const pericias = artigos.find((artigo) => artigo.codigo === 'pericias');

    expect(apresentacao?.titulo).toBe('Livro Principal v1.1');
    expect(apresentacao?.conteudo).toContain('# Livro Principal v1.1');
    expect(apresentacao?.conteudo).toContain('## Sumário');
    expect(apresentacao?.conteudo).toContain(
      '/compendio/livros/livro-principal/introducao-ao-sistema-jujutsu-kaisen-rpg',
    );
    expect(apresentacao?.conteudo.match(/^\* \[\d+\./gm)).toHaveLength(14);
    expect(apresentacao?.conteudo).not.toContain('Capa ainda');
    expect(apresentacao?.conteudo).not.toContain('Maledic');
    expect(pericias?.conteudo).toContain('| Per');
    expect(pericias?.conteudo).toContain('| Acrobacia |');
  });

  it('generates all 47 second-level sections and preserves the new optional rules content', () => {
    const livro = parseLivro();
    const secoes = livro.categorias
      .filter((categoria) => categoria.codigo !== 'apresentacao-e-sumario')
      .flatMap((categoria) => categoria.subcategorias)
      .filter((subcategoria) => subcategoria.descricao?.startsWith('Seção '));
    const regrasOpcionais = getAllArticles(livro).find(
      (artigo) => artigo.codigo === 'regras-opcionais',
    );

    expect(secoes).toHaveLength(47);
    expect(regrasOpcionais?.conteudo).toContain(
      '## **13.2. REGRAS OPCIONAIS**',
    );
    expect(regrasOpcionais?.conteudo).toContain(
      '### **13.2.1. PONTOS DE INSPIRA',
    );
    expect(regrasOpcionais?.conteudo).toContain(
      '### **13.2.2. ENCONTROS SOCIAIS ALTERNATIVOS**',
    );
    expect(regrasOpcionais?.conteudo).toContain(
      '### **13.2.3. ROLAGENS OCULTAS**',
    );
  });

  it('keeps generated article contents within the database text limit threshold', () => {
    const livro = parseLivro();

    for (const artigo of getAllArticles(livro)) {
      expect(Buffer.byteLength(artigo.conteudo, 'utf8')).toBeLessThanOrEqual(
        MAX_ARTICLE_BYTES,
      );
    }
  });

  it('splits long markdown without dropping text', () => {
    const markdown = `## **1.1. Texto longo**\n\n${'a'.repeat(2_500)}`;
    const chunks = splitMarkdownByByteLimit(markdown, 1_000);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe(markdown);
    for (const chunk of chunks) {
      expect(Buffer.byteLength(chunk, 'utf8')).toBeLessThanOrEqual(1_000);
    }
  });
});
