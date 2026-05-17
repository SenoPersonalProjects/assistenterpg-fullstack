import type { CompendioSubcategoriaComArtigo } from './compendio';

const NUMBER_PREFIX_PATTERN = /^\s*\d+(?:\.\d+)*\.?\s+/;

function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*{}[\]()#+\-.!_>])/g, '$1');
}

function stripInlineMarkdown(text: string): string {
  return unescapeMarkdown(text)
    .replace(/^#{1,6}\s+/, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripCompendioDisplayNumber(text: string): string {
  return stripInlineMarkdown(text).replace(NUMBER_PREFIX_PATTERN, '').trim();
}

export function normalizeCompendioLabel(text: string): string {
  return stripCompendioDisplayNumber(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function areCompendioLabelsEquivalent(a: string, b: string): boolean {
  const normalizedA = normalizeCompendioLabel(a);
  const normalizedB = normalizeCompendioLabel(b);

  return Boolean(normalizedA && normalizedA === normalizedB);
}

export function shouldCollapseSubcategoria(
  subcategoria: Pick<CompendioSubcategoriaComArtigo, 'codigo' | 'nome' | 'artigos'>,
): boolean {
  return subcategoria.artigos?.length === 1 && Boolean(subcategoria.artigos[0]);
}

function splitHeadingLine(line: string): { hashes: string; title: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;

  return {
    hashes: match[1],
    title: stripInlineMarkdown(match[2]),
  };
}

export function stripFirstDuplicateHeading(markdown: string, title: string): string {
  const lines = markdown.replace(/^\uFEFF/, '').split('\n');
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex < 0) {
    return markdown;
  }

  const heading = splitHeadingLine(lines[firstContentIndex].trim());
  if (!heading || !areCompendioLabelsEquivalent(heading.title, title)) {
    return markdown;
  }

  lines.splice(firstContentIndex, 1);

  while (lines[0] === '') {
    lines.shift();
  }

  return lines.join('\n').trimStart();
}

export function stripHeadingNumbersFromMarkdown(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => {
      const match = line.match(/^(#{1,6}\s+)(.+)$/);
      if (!match) return line;

      const title = match[2];
      const emphasisPrefix = title.match(/^([*_~` ]*)/)?.[1] ?? '';
      const afterPrefix = title.slice(emphasisPrefix.length);
      const cleanTitle = afterPrefix.replace(NUMBER_PREFIX_PATTERN, '');

      return `${match[1]}${emphasisPrefix}${cleanTitle}`;
    })
    .join('\n');
}

export function prepareCompendioMarkdownForDisplay(
  markdown: string,
  title?: string,
): string {
  const withoutDuplicateHeading = title
    ? stripFirstDuplicateHeading(markdown, title)
    : markdown;

  return stripHeadingNumbersFromMarkdown(withoutDuplicateHeading);
}
