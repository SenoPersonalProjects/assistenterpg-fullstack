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

const LIVRO_PRINCIPAL_MARKDOWN_PATH = join(
  __dirname,
  'assets',
  'Jujutsu_Kaisen_RPG_Standalone_REVISADO.docx.md',
);

const sobrevivendoAoJujutsu: LivroSeed = {
  codigo: 'sobrevivendo-ao-jujutsu',
  titulo: 'Sobrevivendo ao Jujutsu',
  descricao:
    'Primeiro suplemento oficial, com origens, poderes, trilhas, equipamentos e modificacoes.',
  icone: 'book',
  cor: '#10b981',
  ordem: 2,
  suplementoCodigo: 'SOBREVIVENDO_AO_JUJUTSU',
  categorias: [
    {
      codigo: 'origens',
      nome: 'Origens',
      descricao: 'Novos passados e ganchos de sobrevivencia.',
      icone: 'story',
      cor: '#10b981',
      ordem: 1,
      subcategorias: [
        {
          codigo: 'origens-do-suplemento',
          nome: 'Origens do Suplemento',
          descricao: 'Origens oficiais adicionadas por Sobrevivendo ao Jujutsu.',
          ordem: 1,
          artigos: [
            {
              codigo: 'visao-geral-das-origens',
              titulo: 'Visao Geral das Origens',
              resumo: 'Resumo das origens adicionadas pelo suplemento.',
              conteudo:
                '# Visao Geral das Origens\n\nSobrevivendo ao Jujutsu adiciona novas origens voltadas para personagens que encaram o sobrenatural a partir de profissoes, traumas, rotinas extremas e relacoes com maldicoes.\n\nO texto completo sera preenchido quando o material atualizado do suplemento for enviado.',
              ordem: 1,
              tags: ['sobrevivendo', 'origens'],
              palavrasChave: 'sobrevivendo ao jujutsu origens suplemento',
              destaque: true,
            },
          ],
        },
      ],
    },
    {
      codigo: 'poderes',
      nome: 'Poderes',
      descricao: 'Poderes genericos e opcoes de progressao.',
      icone: 'sparkles',
      cor: '#f59e0b',
      ordem: 2,
      subcategorias: [
        {
          codigo: 'poderes-genericos',
          nome: 'Poderes Genericos',
          descricao: 'Poderes oficiais adicionados pelo suplemento.',
          ordem: 1,
          artigos: [
            {
              codigo: 'visao-geral-dos-poderes',
              titulo: 'Visao Geral dos Poderes',
              resumo: 'Resumo dos poderes genericos do suplemento.',
              conteudo:
                '# Visao Geral dos Poderes\n\nEste capitulo agrupa poderes genericos associados a sobrevivencia, preparo, improviso e resistencia contra o sobrenatural.\n\nO texto completo sera preenchido quando o material atualizado do suplemento for enviado.',
              ordem: 1,
              tags: ['sobrevivendo', 'poderes'],
              palavrasChave: 'sobrevivendo poderes genericos suplemento',
            },
          ],
        },
      ],
    },
    {
      codigo: 'trilhas',
      nome: 'Trilhas',
      descricao: 'Novas trilhas e caminhos.',
      icone: 'training',
      cor: '#22d3ee',
      ordem: 3,
      subcategorias: [
        {
          codigo: 'trilhas-do-suplemento',
          nome: 'Trilhas do Suplemento',
          descricao: 'Trilhas oficiais adicionadas pelo suplemento.',
          ordem: 1,
          artigos: [
            {
              codigo: 'visao-geral-das-trilhas',
              titulo: 'Visao Geral das Trilhas',
              resumo: 'Resumo das trilhas adicionadas pelo suplemento.',
              conteudo:
                '# Visao Geral das Trilhas\n\nAs trilhas deste suplemento ampliam papeis de sobrevivencia, suporte e especializacao para personagens de Jujutsu.\n\nO texto completo sera preenchido quando o material atualizado do suplemento for enviado.',
              ordem: 1,
              tags: ['sobrevivendo', 'trilhas'],
              palavrasChave: 'sobrevivendo trilhas caminhos suplemento',
            },
          ],
        },
      ],
    },
    {
      codigo: 'equipamentos',
      nome: 'Equipamentos',
      descricao: 'Itens, armas, artefatos e ferramentas.',
      icone: 'inventory',
      cor: '#a78bfa',
      ordem: 4,
      subcategorias: [
        {
          codigo: 'equipamentos-do-suplemento',
          nome: 'Equipamentos do Suplemento',
          descricao: 'Equipamentos oficiais adicionados pelo suplemento.',
          ordem: 1,
          artigos: [
            {
              codigo: 'visao-geral-dos-equipamentos',
              titulo: 'Visao Geral dos Equipamentos',
              resumo: 'Resumo dos equipamentos adicionados pelo suplemento.',
              conteudo:
                '# Visao Geral dos Equipamentos\n\nSobrevivendo ao Jujutsu adiciona opcoes mundanas e amaldicoadas para expedicoes, investigacoes, confrontos e preparacao.\n\nO texto completo sera preenchido quando o material atualizado do suplemento for enviado.',
              ordem: 1,
              tags: ['sobrevivendo', 'equipamentos'],
              palavrasChave: 'sobrevivendo equipamentos itens armas suplemento',
              destaque: true,
            },
          ],
        },
      ],
    },
    {
      codigo: 'modificacoes',
      nome: 'Modificacoes',
      descricao: 'Melhorias e ajustes de equipamentos.',
      icone: 'tools',
      cor: '#fb923c',
      ordem: 5,
      subcategorias: [
        {
          codigo: 'modificacoes-do-suplemento',
          nome: 'Modificacoes do Suplemento',
          descricao: 'Modificacoes oficiais adicionadas pelo suplemento.',
          ordem: 1,
          artigos: [
            {
              codigo: 'visao-geral-das-modificacoes',
              titulo: 'Visao Geral das Modificacoes',
              resumo: 'Resumo das modificacoes adicionadas pelo suplemento.',
              conteudo:
                '# Visao Geral das Modificacoes\n\nEste capitulo organiza modificacoes para adaptar equipamentos a cenas de risco, investigacao e combate contra ameacas sobrenaturais.\n\nO texto completo sera preenchido quando o material atualizado do suplemento for enviado.',
              ordem: 1,
              tags: ['sobrevivendo', 'modificacoes'],
              palavrasChave: 'sobrevivendo modificacoes equipamentos suplemento',
            },
          ],
        },
      ],
    },
  ],
};

function carregarLivroPrincipal(): LivroSeed {
  const markdown = readFileSync(LIVRO_PRINCIPAL_MARKDOWN_PATH, 'utf8');
  return parseLivroPrincipalMarkdown(markdown);
}

function getLivros(): LivroSeed[] {
  return [carregarLivroPrincipal(), sobrevivendoAoJujutsu];
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
      const categoriaRow = await upsertCategoria(prisma, livroRow.id, categoria);

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
