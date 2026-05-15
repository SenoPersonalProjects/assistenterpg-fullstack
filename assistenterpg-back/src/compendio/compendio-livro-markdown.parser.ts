export type NivelDificuldadeSeed = 'iniciante' | 'intermediario' | 'avancado';

export type ArtigoSeed = {
  codigo: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  ordem: number;
  tags?: string[];
  palavrasChave?: string;
  nivelDificuldade?: NivelDificuldadeSeed;
  destaque?: boolean;
};

export type SubcategoriaSeed = {
  codigo: string;
  nome: string;
  descricao?: string;
  ordem: number;
  artigos: ArtigoSeed[];
};

export type CategoriaSeed = {
  codigo: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  ordem: number;
  subcategorias: SubcategoriaSeed[];
};

export type LivroSeed = {
  codigo: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: number;
  suplementoCodigo?: string;
  categorias: CategoriaSeed[];
};

type ChapterHeading = {
  lineIndex: number;
  numero: number;
  titulo: string;
};

type SectionHeading = {
  lineIndex: number;
  numero?: string;
  titulo: string;
};

const MAX_ARTICLE_BYTES = 50_000;

const CHAPTER_META: Record<number, { icone: string; cor: string }> = {
  1: { icone: 'rules', cor: '#7c5cfc' },
  2: { icone: 'dice', cor: '#22d3ee' },
  3: { icone: 'character', cor: '#38bdf8' },
  4: { icone: 'school', cor: '#a78bfa' },
  5: { icone: 'story', cor: '#ec4899' },
  6: { icone: 'ranking', cor: '#f59e0b' },
  7: { icone: 'technique', cor: '#fb923c' },
  8: { icone: 'inventory', cor: '#10b981' },
  9: { icone: 'summon', cor: '#8b5cf6' },
  10: { icone: 'rules', cor: '#64748b' },
  11: { icone: 'campaign', cor: '#ef4444' },
  12: { icone: 'sparkles', cor: '#eab308' },
  13: { icone: 'search', cor: '#06b6d4' },
  14: { icone: 'condition', cor: '#f43f5e' },
};

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, '$1');
}

function cleanHeadingTitle(line: string): string {
  return unescapeMarkdown(line)
    .replace(/^#{1,6}\s*/, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumberedHeading(line: string): {
  numero: number;
  titulo: string;
  numeroCompleto?: string;
} | null {
  const clean = cleanHeadingTitle(line);
  const match = clean.match(/^(\d+(?:\.\d+)*)\.\s*(.+)$/);

  if (!match) {
    return null;
  }

  return {
    numero: Number(match[1].split('.')[0]),
    numeroCompleto: match[1],
    titulo: match[2].trim(),
  };
}

export function slugifyCompendio(input: string, fallback = 'conteudo'): string {
  const slug = unescapeMarkdown(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return slug || fallback;
}

function collectChapterHeadings(lines: string[]): ChapterHeading[] {
  const headings: ChapterHeading[] = [];
  let expected = 1;

  for (let index = 0; index < lines.length; index++) {
    if (!/^#\s/.test(lines[index])) {
      continue;
    }

    const parsed = parseNumberedHeading(lines[index]);

    if (!parsed || parsed.numero !== expected) {
      continue;
    }

    headings.push({
      lineIndex: index,
      numero: parsed.numero,
      titulo: parsed.titulo,
    });
    expected += 1;
  }

  return headings;
}

function collectSectionHeadings(lines: string[]): SectionHeading[] {
  return lines.reduce<SectionHeading[]>((headings, line, index) => {
    if (!/^##\s/.test(line)) {
      return headings;
    }

    const clean = cleanHeadingTitle(line);
    const match = clean.match(/^(\d+(?:\.\d+)*)\.\s*(.+)$/);

    headings.push({
      lineIndex: index,
      numero: match?.[1],
      titulo: match?.[2]?.trim() || clean,
    });

    return headings;
  }, []);
}

function hasNonHeadingContent(markdown: string): boolean {
  return markdown
    .split('\n')
    .some((line) => line.trim() && !/^#{1,6}\s/.test(line.trim()));
}

function byteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

export function splitMarkdownByByteLimit(
  markdown: string,
  maxBytes = MAX_ARTICLE_BYTES,
): string[] {
  if (byteLength(markdown) <= maxBytes) {
    return [markdown];
  }

  const chunks: string[] = [];
  const blocks = markdown.split(/(\n\s*\n)/);
  let current = '';

  for (const block of blocks) {
    const candidate = current + block;

    if (byteLength(candidate) <= maxBytes) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (byteLength(block) <= maxBytes) {
      current = block;
      continue;
    }

    let rest = block;
    while (byteLength(rest) > maxBytes) {
      let cut = Math.min(rest.length, maxBytes);

      while (cut > 0 && byteLength(rest.slice(0, cut)) > maxBytes) {
        cut -= 1;
      }

      chunks.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }

    current = rest;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

function stripMarkdownForSummary(markdown: string): string {
  return unescapeMarkdown(markdown)
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~>`#[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(text: string, max = 180): string {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function createResumo(markdown: string, fallback: string): string {
  const summary = stripMarkdownForSummary(markdown);
  return clamp(summary || fallback);
}

function createPalavrasChave(...parts: string[]): string {
  return parts
    .map((part) => stripMarkdownForSummary(part).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getNivelDificuldade(chapterNumber: number): NivelDificuldadeSeed {
  if (chapterNumber >= 11 || chapterNumber === 7) {
    return 'avancado';
  }

  if (chapterNumber >= 4) {
    return 'intermediario';
  }

  return 'iniciante';
}

function createArticleChunks(params: {
  codigoBase: string;
  titulo: string;
  markdown: string;
  ordemBase: number;
  tags: string[];
  palavrasChave: string;
  nivelDificuldade: NivelDificuldadeSeed;
  destaque: boolean;
}): ArtigoSeed[] {
  const chunks = splitMarkdownByByteLimit(params.markdown);

  return chunks.map((chunk, index) => {
    const hasParts = chunks.length > 1;
    const parte = index + 1;
    const titulo = hasParts
      ? `${params.titulo} - Parte ${parte}/${chunks.length}`
      : params.titulo;

    return {
      codigo: hasParts ? `${params.codigoBase}-parte-${parte}` : params.codigoBase,
      titulo,
      resumo: createResumo(chunk, titulo),
      conteudo: chunk,
      ordem: params.ordemBase + index,
      tags: params.tags,
      palavrasChave: params.palavrasChave,
      nivelDificuldade: params.nivelDificuldade,
      destaque: params.destaque && index === 0,
    };
  });
}

function createSubcategoria(params: {
  codigo: string;
  nome: string;
  descricao?: string;
  ordem: number;
  markdown: string;
  categoriaCodigo: string;
  categoriaNome: string;
  chapterNumber: number;
  destaque: boolean;
}): SubcategoriaSeed {
  const tags = ['livro-principal', params.categoriaCodigo, params.codigo];
  const palavrasChave = createPalavrasChave(
    params.nome,
    params.categoriaNome,
    'Jujutsu Kaisen RPG',
  );

  return {
    codigo: params.codigo,
    nome: params.nome,
    descricao: params.descricao,
    ordem: params.ordem,
    artigos: createArticleChunks({
      codigoBase: params.codigo,
      titulo: params.nome,
      markdown: params.markdown,
      ordemBase: 1,
      tags,
      palavrasChave,
      nivelDificuldade: getNivelDificuldade(params.chapterNumber),
      destaque: params.destaque,
    }),
  };
}

function parseCategory(
  categoryLines: string[],
  chapter: ChapterHeading,
  ordem: number,
): CategoriaSeed {
  const meta = CHAPTER_META[chapter.numero] ?? CHAPTER_META[1];
  const codigo = slugifyCompendio(chapter.titulo, `capitulo-${chapter.numero}`);
  const sections = collectSectionHeadings(categoryLines);
  const subcategorias: SubcategoriaSeed[] = [];

  if (sections.length === 0) {
    const markdown = categoryLines.join('\n').trim();
    subcategorias.push(
      createSubcategoria({
        codigo: 'conteudo',
        nome: chapter.titulo,
        descricao: `Conteudo do capitulo ${chapter.numero}.`,
        ordem: 1,
        markdown,
        categoriaCodigo: codigo,
        categoriaNome: chapter.titulo,
        chapterNumber: chapter.numero,
        destaque: ordem <= 4,
      }),
    );
  } else {
    const preface = categoryLines.slice(0, sections[0].lineIndex).join('\n').trim();
    let subcategoryOrder = 1;

    if (hasNonHeadingContent(preface)) {
      subcategorias.push(
        createSubcategoria({
          codigo: 'visao-geral',
          nome: 'Visao geral',
          descricao: `Abertura do capitulo ${chapter.numero}.`,
          ordem: subcategoryOrder,
          markdown: preface,
          categoriaCodigo: codigo,
          categoriaNome: chapter.titulo,
          chapterNumber: chapter.numero,
          destaque: ordem <= 4,
        }),
      );
      subcategoryOrder += 1;
    }

    for (let index = 0; index < sections.length; index++) {
      const section = sections[index];
      const nextSection = sections[index + 1];
      const markdown = categoryLines
        .slice(section.lineIndex, nextSection?.lineIndex ?? categoryLines.length)
        .join('\n')
        .trim();
      const sectionCodigo = slugifyCompendio(section.titulo, `secao-${index + 1}`);

      subcategorias.push(
        createSubcategoria({
          codigo: sectionCodigo,
          nome: section.titulo,
          descricao: section.numero
            ? `Secao ${section.numero} do capitulo ${chapter.numero}.`
            : `Secao do capitulo ${chapter.numero}.`,
          ordem: subcategoryOrder,
          markdown,
          categoriaCodigo: codigo,
          categoriaNome: chapter.titulo,
          chapterNumber: chapter.numero,
          destaque: ordem <= 4 && index === 0,
        }),
      );
      subcategoryOrder += 1;
    }
  }

  return {
    codigo,
    nome: chapter.titulo,
    descricao: `Capitulo ${chapter.numero} do livro principal revisado.`,
    icone: meta.icone,
    cor: meta.cor,
    ordem,
    subcategorias,
  };
}

function createIntroCategory(markdown: string): CategoriaSeed {
  const codigo = 'apresentacao-e-sumario';

  return {
    codigo,
    nome: 'Apresentacao e Sumario',
    descricao: 'Capa, apresentacao e sumario resumido do livro revisado.',
    icone: 'book',
    cor: '#7c5cfc',
    ordem: 1,
    subcategorias: [
      createSubcategoria({
        codigo,
        nome: 'Apresentacao e Sumario',
        descricao: 'Informacoes iniciais do documento revisado.',
        ordem: 1,
        markdown: markdown.trim(),
        categoriaCodigo: codigo,
        categoriaNome: 'Apresentacao e Sumario',
        chapterNumber: 1,
        destaque: true,
      }),
    ],
  };
}

export function parseLivroPrincipalMarkdown(markdown: string): LivroSeed {
  const normalizedMarkdown = normalizeMarkdown(markdown);
  const lines = normalizedMarkdown.split('\n');
  const chapterHeadings = collectChapterHeadings(lines);

  if (chapterHeadings.length !== 14) {
    throw new Error(
      `Esperados 14 capitulos numerados no Markdown do livro principal, encontrados ${chapterHeadings.length}.`,
    );
  }

  const categorias: CategoriaSeed[] = [];
  const introMarkdown = lines.slice(0, chapterHeadings[0].lineIndex).join('\n').trim();

  if (introMarkdown) {
    categorias.push(createIntroCategory(introMarkdown));
  }

  for (let index = 0; index < chapterHeadings.length; index++) {
    const chapter = chapterHeadings[index];
    const nextChapter = chapterHeadings[index + 1];
    const categoryLines = lines.slice(
      chapter.lineIndex,
      nextChapter?.lineIndex ?? lines.length,
    );

    categorias.push(
      parseCategory(categoryLines, chapter, categorias.length + 1),
    );
  }

  return {
    codigo: 'livro-principal',
    titulo: 'Livro Principal',
    descricao: 'Regras principais revisadas do sistema Jujutsu Kaisen RPG.',
    icone: 'rules',
    cor: '#7c5cfc',
    ordem: 1,
    categorias,
  };
}

export { MAX_ARTICLE_BYTES };
