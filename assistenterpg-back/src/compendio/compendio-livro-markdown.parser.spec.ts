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
  'Jujutsu_Kaisen_RPG_Standalone_REVISADO.docx.md',
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
    expect(capitulos.map((categoria) => categoria.nome)).toEqual([
      'INTRODUÇÃO AO SISTEMA JUJUTSU KAISEN RPG',
      'INTRODUÇÃO ÀS REGRAS BÁSICAS NA CRIAÇÃO DO PERSONAGEM',
      'CRIAÇÃO DE PERSONAGEM',
      'CLASSES E TRILHAS',
      'ORIGENS E CLÃS',
      'HIERARQUIA DE FEITICEIROS',
      'TÉCNICAS AMALDIÇOADAS',
      'EQUIPAMENTOS',
      'SHIKIGAMIS E CORPOS AMALDIÇOADOS',
      'REGRAS GERAIS',
      'AMEAÇAS E NPCs',
      'ASPECTOS CONGÊNITOS',
      'MECÂNICAS INTERESSANTES',
      'CONDIÇÕES',
    ]);
    expect(capitulos.map((categoria) => categoria.codigo)).not.toContain(
      'ataques-e-habilidades',
    );
    expect(capitulos.map((categoria) => categoria.codigo)).not.toContain(
      'defina-custo-de-invocacao-e-utilizacao',
    );
  });

  it('preserves presentation text and markdown tables from the source', () => {
    const livro = parseLivro();
    const artigos = getAllArticles(livro);
    const apresentacao = artigos.find(
      (artigo) => artigo.codigo === 'apresentacao-e-sumario',
    );
    const pericias = artigos.find((artigo) => artigo.codigo === 'pericias');

    expect(apresentacao?.conteudo).toContain(
      '**Jujutsu Kaisen RPG \\- Standalone**',
    );
    expect(apresentacao?.conteudo).toContain('# **Sumário resumido**');
    expect(pericias?.conteudo).toContain(
      '| Perícia | Atributo Base | Somente Treinada? |',
    );
    expect(pericias?.conteudo).toContain(
      '#### ***ACROBACIA (AGI) \\- Carga***',
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
