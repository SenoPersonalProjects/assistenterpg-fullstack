import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { StatusPublicacao } from '@prisma/client';
import {
  parseLivroPrincipalMarkdown,
  type ArtigoSeed,
  type CategoriaSeed,
  type LivroSeed,
  type SubcategoriaSeed,
} from '../../../src/compendio/compendio-livro-markdown.parser';
import { buildSobrevivendoAoJujutsuLivro } from './sobrevivendo-ao-jujutsu-livro';

const LIVRO_PRINCIPAL_MARKDOWN_PATH = join(
  __dirname,
  'assets',
  'Maledicencia_RPG_1_1.docx.md',
);

function carregarLivroPrincipal(): LivroSeed {
  const markdown = readFileSync(LIVRO_PRINCIPAL_MARKDOWN_PATH, 'utf8');
  return parseLivroPrincipalMarkdown(markdown);
}

function getLivros(): LivroSeed[] {
  return [carregarLivroPrincipal(), buildSobrevivendoAoJujutsuLivro()];
}

async function upsertCategoria(
  prisma: PrismaClient,
  livroId: number,
  categoria: CategoriaSeed,
) {
  const existente = await prisma.compendioCategoria.findFirst({
    where: { livroId, codigo: categoria.codigo },
    select: { id: true },
  });

  if (existente) {
    return prisma.compendioCategoria.update({
      where: { id: existente.id },
      data: {
        nome: categoria.nome,
        descricao: categoria.descricao ?? null,
        icone: categoria.icone ?? null,
        cor: categoria.cor ?? null,
        ordem: categoria.ordem,
        ativo: true,
      },
    });
  }

  return prisma.compendioCategoria.create({
    data: {
      codigo: categoria.codigo,
      nome: categoria.nome,
      descricao: categoria.descricao ?? null,
      icone: categoria.icone ?? null,
      cor: categoria.cor ?? null,
      ordem: categoria.ordem,
      ativo: true,
      livroId,
    },
  });
}

async function upsertSubcategoria(
  prisma: PrismaClient,
  categoriaId: number,
  subcategoria: SubcategoriaSeed,
) {
  const existente = await prisma.compendioSubcategoria.findFirst({
    where: { categoriaId, codigo: subcategoria.codigo },
    select: { id: true },
  });

  if (existente) {
    return prisma.compendioSubcategoria.update({
      where: { id: existente.id },
      data: {
        nome: subcategoria.nome,
        descricao: subcategoria.descricao ?? null,
        ordem: subcategoria.ordem,
        ativo: true,
      },
    });
  }

  return prisma.compendioSubcategoria.create({
    data: {
      codigo: subcategoria.codigo,
      nome: subcategoria.nome,
      descricao: subcategoria.descricao ?? null,
      ordem: subcategoria.ordem,
      ativo: true,
      categoriaId,
    },
  });
}

async function upsertArtigo(
  prisma: PrismaClient,
  subcategoriaId: number,
  artigo: ArtigoSeed,
) {
  const existente = await prisma.compendioArtigo.findFirst({
    where: { subcategoriaId, codigo: artigo.codigo },
    select: { id: true },
  });

  const data = {
    titulo: artigo.titulo,
    resumo: artigo.resumo,
    conteudo: artigo.conteudo,
    ordem: artigo.ordem,
    tags: artigo.tags ?? [],
    palavrasChave: artigo.palavrasChave ?? null,
    nivelDificuldade: artigo.nivelDificuldade ?? 'iniciante',
    destaque: artigo.destaque ?? false,
    ativo: true,
  };

  if (existente) {
    return prisma.compendioArtigo.update({
      where: { id: existente.id },
      data,
    });
  }

  return prisma.compendioArtigo.create({
    data: {
      codigo: artigo.codigo,
      subcategoriaId,
      ...data,
    },
  });
}

function buildExpectedCodes(livro: LivroSeed) {
  const categorias = new Map<string, Map<string, Set<string>>>();

  for (const categoria of livro.categorias) {
    const subcategorias = new Map<string, Set<string>>();

    for (const subcategoria of categoria.subcategorias) {
      subcategorias.set(
        subcategoria.codigo,
        new Set(subcategoria.artigos.map((artigo) => artigo.codigo)),
      );
    }

    categorias.set(categoria.codigo, subcategorias);
  }

  return categorias;
}

async function inativarItensRemovidos(
  prisma: PrismaClient,
  livroId: number,
  livro: LivroSeed,
) {
  const expected = buildExpectedCodes(livro);
  const categoriasExistentes = await prisma.compendioCategoria.findMany({
    where: { livroId },
    select: {
      id: true,
      codigo: true,
      subcategorias: {
        select: {
          id: true,
          codigo: true,
          artigos: {
            select: {
              id: true,
              codigo: true,
            },
          },
        },
      },
    },
  });

  for (const categoria of categoriasExistentes) {
    const subcategoriasEsperadas = expected.get(categoria.codigo);

    if (!subcategoriasEsperadas) {
      const subcategoriaIds = categoria.subcategorias.map((item) => item.id);

      if (subcategoriaIds.length > 0) {
        await prisma.compendioArtigo.updateMany({
          where: { subcategoriaId: { in: subcategoriaIds }, ativo: true },
          data: { ativo: false },
        });
        await prisma.compendioSubcategoria.updateMany({
          where: { id: { in: subcategoriaIds }, ativo: true },
          data: { ativo: false },
        });
      }

      await prisma.compendioCategoria.update({
        where: { id: categoria.id },
        data: { ativo: false },
      });
      continue;
    }

    for (const subcategoria of categoria.subcategorias) {
      const artigosEsperados = subcategoriasEsperadas.get(subcategoria.codigo);

      if (!artigosEsperados) {
        await prisma.compendioArtigo.updateMany({
          where: { subcategoriaId: subcategoria.id, ativo: true },
          data: { ativo: false },
        });
        await prisma.compendioSubcategoria.update({
          where: { id: subcategoria.id },
          data: { ativo: false },
        });
        continue;
      }

      const artigosRemovidos = subcategoria.artigos
        .filter((artigo) => !artigosEsperados.has(artigo.codigo))
        .map((artigo) => artigo.id);

      if (artigosRemovidos.length > 0) {
        await prisma.compendioArtigo.updateMany({
          where: { id: { in: artigosRemovidos }, ativo: true },
          data: { ativo: false },
        });
      }
    }
  }
}

export async function seedCompendioLivros(prisma: PrismaClient) {
  console.log('Cadastrando livros do compendio...');

  for (const livro of getLivros()) {
    const suplemento = livro.suplementoCodigo
      ? await prisma.suplemento.findUnique({
          where: { codigo: livro.suplementoCodigo },
          select: { id: true },
        })
      : null;

    const livroRow = await prisma.compendioLivro.upsert({
      where: { codigo: livro.codigo },
      update: {
        titulo: livro.titulo,
        descricao: livro.descricao,
        icone: livro.icone,
        cor: livro.cor,
        ordem: livro.ordem,
        status: StatusPublicacao.PUBLICADO,
        suplementoId: suplemento?.id ?? null,
      },
      create: {
        codigo: livro.codigo,
        titulo: livro.titulo,
        descricao: livro.descricao,
        icone: livro.icone,
        cor: livro.cor,
        ordem: livro.ordem,
        status: StatusPublicacao.PUBLICADO,
        suplementoId: suplemento?.id ?? null,
      },
    });

    for (const categoria of livro.categorias) {
      const categoriaRow = await upsertCategoria(
        prisma,
        livroRow.id,
        categoria,
      );

      for (const subcategoria of categoria.subcategorias) {
        const subcategoriaRow = await upsertSubcategoria(
          prisma,
          categoriaRow.id,
          subcategoria,
        );

        for (const artigo of subcategoria.artigos) {
          await upsertArtigo(prisma, subcategoriaRow.id, artigo);
        }
      }
    }

    await inativarItensRemovidos(prisma, livroRow.id, livro);
  }

  console.log('OK: livros do compendio cadastrados.');
}
