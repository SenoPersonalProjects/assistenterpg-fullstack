import { Injectable } from '@nestjs/common';
import { StatusPublicacao } from '@prisma/client';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { ReorderCompendioDto } from './dto/reorder-compendio.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { UpdateArtigoDto } from './dto/update-artigo.dto';
import {
  CompendioArtigoDuplicadoException,
  CompendioArtigoException,
  CompendioBuscaInvalidaException,
  CompendioCategoriaComSubcategoriasException,
  CompendioCategoriaDuplicadaException,
  CompendioCategoriaException,
  CompendioLivroDuplicadoException,
  CompendioLivroException,
  CompendioSubcategoriaComArtigosException,
  CompendioSubcategoriaDuplicadaException,
  CompendioSubcategoriaException,
} from 'src/common/exceptions/compendio.exception';

const LIVRO_PRINCIPAL_CODIGO = 'livro-principal';
const COMPENDIO_SEED_EXPORT_VERSION = 1;
const ESCUDO_MESTRE_RESUMO_MAX_CHARS = 900;
const ESCUDO_MESTRE_DETALHE_MAX_CHARS = 2_400;

type EscudoMestreFonte = 'BASE' | 'SUPLEMENTO';

type EscudoMestreReferenciaArtigo = {
  livroCodigo: string;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
  artigoCodigo: string;
  obrigatorio?: boolean;
  extrairSecao?: string;
};

type EscudoMestreSecaoConfig = {
  id: string;
  titulo: string;
  fonte: EscudoMestreFonte;
  referenciaCompendio: string;
  artigos: EscudoMestreReferenciaArtigo[];
};

type EscudoMestreOrigem = {
  livroCodigo: string;
  livroTitulo: string;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
  artigoCodigo: string;
  artigoTitulo: string;
  href: string;
};

type EscudoMestreSecao = {
  id: string;
  titulo: string;
  fonte: EscudoMestreFonte;
  referenciaCompendio: string;
  resumoMarkdown: string;
  detalhadoMarkdown: string;
  origens: EscudoMestreOrigem[];
  avisos: string[];
};

type EscudoMestreArtigo = {
  codigo: string;
  titulo: string;
  resumo: string | null;
  conteudo: string;
  subcategoria: {
    codigo: string;
    nome: string;
    categoria: {
      codigo: string;
      nome: string;
      livro: {
        codigo: string;
        titulo: string;
      };
    };
  };
};

type EscudoMestreLivro = {
  codigo: string;
  titulo: string;
  descricao: string | null;
  suplementoId: number | null;
  categorias: Array<{
    codigo: string;
    nome: string;
    descricao: string | null;
    subcategorias: Array<{
      codigo: string;
      nome: string;
      artigos: Array<{
        codigo: string;
        titulo: string;
        resumo: string | null;
      }>;
    }>;
  }>;
};

const ESCUDO_MESTRE_SECOES_ARTIGOS: EscudoMestreSecaoConfig[] = [
  {
    id: 'regras-principais',
    titulo: 'Regras principais',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'introducao-ao-sistema-jujutsu-kaisen-rpg',
        subcategoriaCodigo: 'basico',
        artigoCodigo: 'basico',
        obrigatorio: true,
      },
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'testes-e-habilidades',
        artigoCodigo: 'testes-e-habilidades',
        obrigatorio: true,
      },
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        artigoCodigo: 'cenas-rodadas-e-turnos-parte-1',
        obrigatorio: true,
      },
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        artigoCodigo: 'cenas-rodadas-e-turnos-parte-2',
        obrigatorio: true,
      },
    ],
  },
  {
    id: 'pericias',
    titulo: 'Perícias',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo:
          'introducao-as-regras-basicas-na-criacao-do-personagem',
        subcategoriaCodigo: 'pericias',
        artigoCodigo: 'pericias',
        obrigatorio: true,
      },
    ],
  },
  {
    id: 'condicoes',
    titulo: 'Condições',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'condicoes',
        subcategoriaCodigo: 'conteudo',
        artigoCodigo: 'conteudo',
        obrigatorio: true,
      },
    ],
  },
  {
    id: 'dominios',
    titulo: 'Domínios',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'tecnicas-amaldicoadas',
        subcategoriaCodigo: 'mecanica-de-expansao-de-dominio',
        artigoCodigo: 'mecanica-de-expansao-de-dominio',
        obrigatorio: true,
      },
    ],
  },
  {
    id: 'ferimentos-morte',
    titulo: 'Ferimentos e Morte',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        artigoCodigo: 'cenas-rodadas-e-turnos-parte-1',
        obrigatorio: true,
        extrairSecao: 'Ferimentos e Morte',
      },
    ],
  },
  {
    id: 'tipos-dano',
    titulo: 'Tipos de dano',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'equipamentos',
        subcategoriaCodigo: 'armas',
        artigoCodigo: 'armas',
        obrigatorio: true,
      },
    ],
  },
  {
    id: 'tipos-acoes',
    titulo: 'Tipos de ações',
    fonte: 'BASE',
    referenciaCompendio: 'Livro Principal',
    artigos: [
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'testes-e-habilidades',
        artigoCodigo: 'testes-e-habilidades',
        obrigatorio: true,
      },
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        artigoCodigo: 'cenas-rodadas-e-turnos-parte-1',
        obrigatorio: true,
      },
      {
        livroCodigo: LIVRO_PRINCIPAL_CODIGO,
        categoriaCodigo: 'regras-gerais',
        subcategoriaCodigo: 'cenas-rodadas-e-turnos',
        artigoCodigo: 'cenas-rodadas-e-turnos-parte-2',
        obrigatorio: true,
      },
    ],
  },
];

@Injectable()
export class CompendioService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== INCLUDES ====================

  private gerarCodigo(input: string, fallback: string): string {
    const codigo = input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);

    return codigo || fallback;
  }

  private artigoInclude() {
    return {
      subcategoria: {
        include: {
          categoria: {
            include: {
              livro: true,
            },
          },
        },
      },
    };
  }

  private subcategoriaInclude(apenasAtivos = true) {
    return {
      categoria: {
        include: {
          livro: true,
        },
      },
      artigos: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.artigoInclude(),
      },
    };
  }

  private categoriaInclude(apenasAtivos = true) {
    return {
      livro: true,
      subcategorias: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.subcategoriaInclude(apenasAtivos),
      },
    };
  }

  private livroInclude(apenasAtivos = true) {
    return {
      suplemento: true,
      categorias: {
        where: apenasAtivos ? { ativo: true } : undefined,
        orderBy: { ordem: 'asc' as const },
        include: this.categoriaInclude(apenasAtivos),
      },
    };
  }

  private async livroPrincipalId(): Promise<number> {
    const livro = await this.prisma.compendioLivro.upsert({
      where: { codigo: LIVRO_PRINCIPAL_CODIGO },
      update: {},
      create: {
        codigo: LIVRO_PRINCIPAL_CODIGO,
        titulo: 'Livro Principal',
        descricao: 'Regras principais do sistema Jujutsu Kaisen RPG.',
        icone: 'rules',
        cor: '#7c5cfc',
        ordem: 1,
        status: StatusPublicacao.PUBLICADO,
      },
      select: { id: true },
    });

    return livro.id;
  }

  private chaveReferenciaEscudo(ref: EscudoMestreReferenciaArtigo): string {
    return [
      ref.livroCodigo,
      ref.categoriaCodigo,
      ref.subcategoriaCodigo,
      ref.artigoCodigo,
    ].join('/');
  }

  private hrefArtigoEscudo(origem: {
    livroCodigo: string;
    categoriaCodigo: string;
    subcategoriaCodigo: string;
    artigoCodigo: string;
  }): string {
    return `/compendio/livros/${origem.livroCodigo}/${origem.categoriaCodigo}/${origem.subcategoriaCodigo}/${origem.artigoCodigo}`;
  }

  private limitarTextoMarkdown(markdown: string, limite: number): string {
    const normalizado = this.normalizarTituloFerimentosMorte(
      markdown.replace(/\r\n?/g, '\n').trim(),
    );

    if (normalizado.length <= limite) {
      return normalizado;
    }

    const recorte = normalizado.slice(0, limite);
    const ultimaQuebra = recorte.lastIndexOf('\n\n');
    const texto =
      ultimaQuebra > Math.floor(limite * 0.55)
        ? recorte.slice(0, ultimaQuebra)
        : recorte;

    return `${texto.trimEnd()}\n\n_Continua no artigo completo do compêndio._`;
  }

  private resumoArtigoEscudo(artigo: EscudoMestreArtigo): string {
    const resumo = artigo.resumo?.trim();
    if (resumo) {
      return this.limitarTextoMarkdown(resumo, ESCUDO_MESTRE_RESUMO_MAX_CHARS);
    }

    return this.limitarTextoMarkdown(
      artigo.conteudo,
      ESCUDO_MESTRE_RESUMO_MAX_CHARS,
    );
  }

  private normalizarLabelEscudo(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/^\s*\d+(?:\s+\d+)*\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizarTituloFerimentosMorte(markdown: string): string {
    return markdown.replace(
      /Ferimentos\s+(?:E|e|é)\s+Morte/g,
      'Ferimentos e Morte',
    );
  }

  private extrairSecaoMarkdown(
    markdown: string,
    titulo: string,
  ): string | null {
    const linhas = this.normalizarTituloFerimentosMorte(markdown).split('\n');
    const alvo = this.normalizarLabelEscudo(titulo);
    let inicio = -1;
    let nivelInicio = 0;

    for (let index = 0; index < linhas.length; index++) {
      const linha = linhas[index].trim();
      const heading = linha.match(/^(#{1,6})\s+(.+)$/);
      if (!heading) continue;

      const tituloHeading = heading[2].replace(/[*_~`]/g, '');
      if (this.normalizarLabelEscudo(tituloHeading) === alvo) {
        inicio = index;
        nivelInicio = heading[1].length;
        break;
      }
    }

    if (inicio < 0) {
      return null;
    }

    let fim = linhas.length;
    for (let index = inicio + 1; index < linhas.length; index++) {
      const heading = linhas[index].trim().match(/^(#{1,6})\s+(.+)$/);
      if (heading && heading[1].length <= nivelInicio) {
        fim = index;
        break;
      }
    }

    return linhas.slice(inicio, fim).join('\n').trim();
  }

  private montarOrigemEscudo(artigo: EscudoMestreArtigo): EscudoMestreOrigem {
    const origem = {
      livroCodigo: artigo.subcategoria.categoria.livro.codigo,
      livroTitulo: artigo.subcategoria.categoria.livro.titulo,
      categoriaCodigo: artigo.subcategoria.categoria.codigo,
      subcategoriaCodigo: artigo.subcategoria.codigo,
      artigoCodigo: artigo.codigo,
      artigoTitulo: artigo.titulo,
    };

    return {
      ...origem,
      href: this.hrefArtigoEscudo(origem),
    };
  }

  private montarSecaoArtigosEscudo(
    config: EscudoMestreSecaoConfig,
    artigosPorChave: Map<string, EscudoMestreArtigo>,
  ): EscudoMestreSecao {
    const avisos: string[] = [];
    const blocosResumo: string[] = [];
    const blocosDetalhe: string[] = [];
    const origens: EscudoMestreOrigem[] = [];

    for (const ref of config.artigos) {
      const artigo = artigosPorChave.get(this.chaveReferenciaEscudo(ref));

      if (!artigo) {
        const aviso = `Referência do compêndio não encontrada: ${this.chaveReferenciaEscudo(ref)}`;
        if (ref.obrigatorio) avisos.push(aviso);
        continue;
      }

      const origem = this.montarOrigemEscudo(artigo);
      const markdownFonte = ref.extrairSecao
        ? this.extrairSecaoMarkdown(artigo.conteudo, ref.extrairSecao)
        : artigo.conteudo;
      const markdownDetalhe = markdownFonte ?? artigo.conteudo;

      origens.push(origem);
      blocosResumo.push(
        `### ${artigo.titulo}\n\n${this.resumoArtigoEscudo(artigo)}`,
      );
      blocosDetalhe.push(
        `## ${artigo.titulo}\n\n${this.limitarTextoMarkdown(
          markdownDetalhe,
          ESCUDO_MESTRE_DETALHE_MAX_CHARS,
        )}\n\n[Ver no compêndio](${origem.href})`,
      );

      if (ref.extrairSecao && !markdownFonte) {
        avisos.push(
          `Trecho "${ref.extrairSecao}" não encontrado em ${this.chaveReferenciaEscudo(ref)}; usando o artigo completo resumido.`,
        );
      }
    }

    return {
      id: config.id,
      titulo: config.titulo,
      fonte: config.fonte,
      referenciaCompendio: config.referenciaCompendio,
      resumoMarkdown:
        blocosResumo.join('\n\n') ||
        '_Nenhum conteúdo publicado encontrado para esta seção._',
      detalhadoMarkdown:
        blocosDetalhe.join('\n\n') ||
        '_Nenhum conteúdo publicado encontrado para esta seção._',
      origens,
      avisos,
    };
  }

  private primeiraOrigemLivroEscudo(
    livro: EscudoMestreLivro,
  ): EscudoMestreOrigem | null {
    for (const categoria of livro.categorias) {
      for (const subcategoria of categoria.subcategorias) {
        const artigo = subcategoria.artigos[0];
        if (!artigo) continue;

        const origem = {
          livroCodigo: livro.codigo,
          livroTitulo: livro.titulo,
          categoriaCodigo: categoria.codigo,
          subcategoriaCodigo: subcategoria.codigo,
          artigoCodigo: artigo.codigo,
          artigoTitulo: artigo.titulo,
        };

        return {
          ...origem,
          href: this.hrefArtigoEscudo(origem),
        };
      }
    }

    return null;
  }

  private montarSecaoSuplementosOficiaisEscudo(
    livros: EscudoMestreLivro[],
  ): EscudoMestreSecao {
    const publicados = livros.filter((livro) => livro.suplementoId !== null);
    const origens = publicados
      .map((livro) => this.primeiraOrigemLivroEscudo(livro))
      .filter((origem): origem is EscudoMestreOrigem => Boolean(origem));

    const lista =
      publicados
        .map((livro) => {
          const descricao = livro.descricao ? `: ${livro.descricao}` : '';
          return `- [${livro.titulo}](/compendio/livros/${livro.codigo})${descricao}`;
        })
        .join('\n') || '- Nenhum suplemento oficial publicado encontrado.';

    return {
      id: 'suplementos-oficiais',
      titulo: 'Suplementos oficiais',
      fonte: 'SUPLEMENTO',
      referenciaCompendio: 'Compêndio oficial',
      resumoMarkdown: lista,
      detalhadoMarkdown: `## Suplementos oficiais publicados\n\n${lista}`,
      origens,
      avisos: [],
    };
  }

  private montarSecaoSobrevivendoEscudo(
    livro: EscudoMestreLivro | undefined,
  ): EscudoMestreSecao {
    if (!livro) {
      const aviso =
        'Livro do suplemento "Sobrevivendo ao Jujutsu" não encontrado no compêndio publicado.';
      return {
        id: 'sobrevivendo-ao-jujutsu',
        titulo: 'Sobrevivendo ao Jujutsu',
        fonte: 'SUPLEMENTO',
        referenciaCompendio: 'Sobrevivendo ao Jujutsu',
        resumoMarkdown: `_${aviso}_`,
        detalhadoMarkdown: `_${aviso}_`,
        origens: [],
        avisos: [aviso],
      };
    }

    const categorias = livro.categorias
      .map((categoria) => {
        const descricao = categoria.descricao ? `: ${categoria.descricao}` : '';
        return `- **${categoria.nome}**${descricao}`;
      })
      .join('\n');
    const origem = this.primeiraOrigemLivroEscudo(livro);
    const resumo =
      livro.descricao ?? 'Suplemento oficial publicado no compêndio.';

    return {
      id: 'sobrevivendo-ao-jujutsu',
      titulo: 'Sobrevivendo ao Jujutsu',
      fonte: 'SUPLEMENTO',
      referenciaCompendio: livro.titulo,
      resumoMarkdown: `${resumo}\n\n[Ver suplemento no compêndio](/compendio/livros/${livro.codigo})`,
      detalhadoMarkdown: `## ${livro.titulo}\n\n${resumo}\n\n### Conteúdos\n\n${
        categorias || '- Nenhuma categoria publicada encontrada.'
      }\n\n[Ver suplemento no compêndio](/compendio/livros/${livro.codigo})`,
      origens: origem ? [origem] : [],
      avisos: [],
    };
  }

  // ==================== LIVROS ====================

  async listarLivros() {
    return this.prisma.compendioLivro.findMany({
      where: { status: StatusPublicacao.PUBLICADO },
      orderBy: { ordem: 'asc' },
      include: this.livroInclude(true),
    });
  }

  async buscarLivroPorCodigo(codigo: string) {
    const livro = await this.prisma.compendioLivro.findFirst({
      where: {
        codigo,
        status: StatusPublicacao.PUBLICADO,
      },
      include: this.livroInclude(true),
    });

    if (!livro) {
      throw new CompendioLivroException(codigo);
    }

    return livro;
  }

  async buscarEscudoMestre(): Promise<{
    secoes: EscudoMestreSecao[];
    avisos: string[];
  }> {
    const referencias = ESCUDO_MESTRE_SECOES_ARTIGOS.flatMap(
      (secao) => secao.artigos,
    );

    const [artigos, livrosSuplementos] = await Promise.all([
      this.prisma.compendioArtigo.findMany({
        where: {
          ativo: true,
          OR: referencias.map((ref) => ({
            codigo: ref.artigoCodigo,
            subcategoria: {
              codigo: ref.subcategoriaCodigo,
              ativo: true,
              categoria: {
                codigo: ref.categoriaCodigo,
                ativo: true,
                livro: {
                  codigo: ref.livroCodigo,
                  status: StatusPublicacao.PUBLICADO,
                },
              },
            },
          })),
        },
        include: this.artigoInclude(),
      }),
      this.prisma.compendioLivro.findMany({
        where: {
          status: StatusPublicacao.PUBLICADO,
          suplementoId: { not: null },
        },
        orderBy: { ordem: 'asc' },
        include: this.livroInclude(true),
      }),
    ]);

    const artigosPorChave = new Map<string, EscudoMestreArtigo>();
    for (const artigo of artigos as EscudoMestreArtigo[]) {
      artigosPorChave.set(
        this.chaveReferenciaEscudo({
          livroCodigo: artigo.subcategoria.categoria.livro.codigo,
          categoriaCodigo: artigo.subcategoria.categoria.codigo,
          subcategoriaCodigo: artigo.subcategoria.codigo,
          artigoCodigo: artigo.codigo,
        }),
        artigo,
      );
    }

    const secoes = ESCUDO_MESTRE_SECOES_ARTIGOS.map((config) =>
      this.montarSecaoArtigosEscudo(config, artigosPorChave),
    );
    const livros = livrosSuplementos as EscudoMestreLivro[];

    secoes.push(this.montarSecaoSuplementosOficiaisEscudo(livros));
    secoes.push(
      this.montarSecaoSobrevivendoEscudo(
        livros.find((livro) => livro.codigo === 'sobrevivendo-ao-jujutsu'),
      ),
    );

    return {
      secoes,
      avisos: secoes.flatMap((secao) => secao.avisos),
    };
  }

  async listarLivrosAdmin() {
    return this.prisma.compendioLivro.findMany({
      orderBy: { ordem: 'asc' },
      include: this.livroInclude(false),
    });
  }

  async criarLivro(dto: CreateLivroDto) {
    const codigo = this.gerarCodigo(dto.codigo || dto.titulo, 'livro');
    const existe = await this.prisma.compendioLivro.findUnique({
      where: { codigo },
    });

    if (existe) {
      throw new CompendioLivroDuplicadoException(codigo);
    }

    if (dto.suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: dto.suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new CompendioLivroException(dto.suplementoId);
      }
    }

    return this.prisma.compendioLivro.create({
      data: {
        codigo,
        titulo: dto.titulo,
        descricao: dto.descricao,
        icone: dto.icone,
        cor: dto.cor,
        ordem: dto.ordem ?? 0,
        status: dto.status ?? StatusPublicacao.RASCUNHO,
        suplementoId: dto.suplementoId,
      },
      include: this.livroInclude(false),
    });
  }

  async atualizarLivro(id: number, dto: UpdateLivroDto) {
    const existe = await this.prisma.compendioLivro.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioLivroException(id);
    }

    const codigo = dto.codigo
      ? this.gerarCodigo(dto.codigo, existe.codigo)
      : undefined;

    if (codigo && codigo !== existe.codigo) {
      const outroComCodigo = await this.prisma.compendioLivro.findUnique({
        where: { codigo },
      });

      if (outroComCodigo) {
        throw new CompendioLivroDuplicadoException(codigo);
      }
    }

    if (dto.suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: dto.suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new CompendioLivroException(dto.suplementoId);
      }
    }

    return this.prisma.compendioLivro.update({
      where: { id },
      data: {
        ...(codigo ? { codigo } : {}),
        ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.icone !== undefined ? { icone: dto.icone } : {}),
        ...(dto.cor !== undefined ? { cor: dto.cor } : {}),
        ...(dto.ordem !== undefined ? { ordem: dto.ordem } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.suplementoId !== undefined
          ? { suplementoId: dto.suplementoId }
          : {}),
      },
      include: this.livroInclude(false),
    });
  }

  async reordenar(dto: ReorderCompendioDto) {
    if (dto.tipo === 'livro') {
      await this.prisma.$transaction(
        dto.ids.map((id, index) =>
          this.prisma.compendioLivro.update({
            where: { id },
            data: { ordem: index + 1 },
          }),
        ),
      );
      return { sucesso: true };
    }

    if (dto.tipo === 'categoria') {
      await this.prisma.$transaction(
        dto.ids.map((id, index) =>
          this.prisma.compendioCategoria.update({
            where: { id },
            data: { ordem: index + 1 },
          }),
        ),
      );
      return { sucesso: true };
    }

    if (dto.tipo === 'subcategoria') {
      await this.prisma.$transaction(
        dto.ids.map((id, index) =>
          this.prisma.compendioSubcategoria.update({
            where: { id },
            data: { ordem: index + 1 },
          }),
        ),
      );
      return { sucesso: true };
    }

    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.compendioArtigo.update({
          where: { id },
          data: { ordem: index + 1 },
        }),
      ),
    );

    return { sucesso: true };
  }

  async exportarSeedCompendio() {
    const livros = await this.prisma.compendioLivro.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        suplemento: {
          select: {
            codigo: true,
          },
        },
        categorias: {
          orderBy: { ordem: 'asc' },
          include: {
            subcategorias: {
              orderBy: { ordem: 'asc' },
              include: {
                artigos: {
                  orderBy: { ordem: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    return {
      version: COMPENDIO_SEED_EXPORT_VERSION,
      source: 'database' as const,
      exportedAt: new Date().toISOString(),
      livros: livros.map((livro) => ({
        codigo: livro.codigo,
        titulo: livro.titulo,
        descricao: livro.descricao ?? '',
        icone: livro.icone ?? 'book',
        cor: livro.cor ?? '#7c5cfc',
        ordem: livro.ordem,
        status: livro.status,
        suplementoCodigo: livro.suplemento?.codigo,
        categorias: livro.categorias.map((categoria) => ({
          codigo: categoria.codigo,
          nome: categoria.nome,
          descricao: categoria.descricao ?? undefined,
          icone: categoria.icone ?? undefined,
          cor: categoria.cor ?? undefined,
          ordem: categoria.ordem,
          ativo: categoria.ativo,
          subcategorias: categoria.subcategorias.map((subcategoria) => ({
            codigo: subcategoria.codigo,
            nome: subcategoria.nome,
            descricao: subcategoria.descricao ?? undefined,
            ordem: subcategoria.ordem,
            ativo: subcategoria.ativo,
            artigos: subcategoria.artigos.map((artigo) => ({
              codigo: artigo.codigo,
              titulo: artigo.titulo,
              resumo: artigo.resumo ?? '',
              conteudo: artigo.conteudo,
              ordem: artigo.ordem,
              tags: Array.isArray(artigo.tags) ? artigo.tags : [],
              palavrasChave: artigo.palavrasChave ?? undefined,
              nivelDificuldade:
                (artigo.nivelDificuldade as
                  | 'iniciante'
                  | 'intermediario'
                  | 'avancado'
                  | null) ?? 'iniciante',
              artigosRelacionados: Array.isArray(artigo.artigosRelacionados)
                ? artigo.artigosRelacionados
                : [],
              ativo: artigo.ativo,
              destaque: artigo.destaque,
            })),
          })),
        })),
      })),
    };
  }

  // ==================== CATEGORIAS ====================

  async listarCategorias(
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    return this.listarCategoriasDoLivro(
      LIVRO_PRINCIPAL_CODIGO,
      apenasAtivas,
      page,
      limit,
    );
  }

  async listarCategoriasDoLivro(
    livroCodigo: string,
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      livro: { codigo: livroCodigo, status: StatusPublicacao.PUBLICADO },
      ...(apenasAtivas && { ativo: true }),
    };

    if (!page || !limit) {
      return this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.categoriaInclude(apenasAtivas),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioCategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.categoriaInclude(apenasAtivas),
        skip,
        take: limit,
      }),
      this.prisma.compendioCategoria.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarCategoriaPorCodigo(codigo: string) {
    return this.buscarCategoriaDoLivroPorCodigo(LIVRO_PRINCIPAL_CODIGO, codigo);
  }

  async buscarCategoriaDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
  ) {
    const categoria = await this.prisma.compendioCategoria.findFirst({
      where: {
        codigo: categoriaCodigo,
        ativo: true,
        livro: {
          codigo: livroCodigo,
          status: StatusPublicacao.PUBLICADO,
        },
      },
      include: this.categoriaInclude(true),
    });

    if (!categoria) {
      throw new CompendioCategoriaException(categoriaCodigo);
    }

    return categoria;
  }

  async criarCategoria(dto: CreateCategoriaDto) {
    const livroId = dto.livroId ?? (await this.livroPrincipalId());
    const codigo = this.gerarCodigo(dto.codigo || dto.nome, 'categoria');
    const livro = await this.prisma.compendioLivro.findUnique({
      where: { id: livroId },
    });

    if (!livro) {
      throw new CompendioCategoriaException(livroId);
    }

    const existe = await this.prisma.compendioCategoria.findFirst({
      where: { codigo, livroId },
    });

    if (existe) {
      throw new CompendioCategoriaDuplicadaException(codigo);
    }

    return this.prisma.compendioCategoria.create({
      data: {
        ...dto,
        codigo,
        livroId,
      },
      include: this.categoriaInclude(false),
    });
  }

  async atualizarCategoria(id: number, dto: UpdateCategoriaDto) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioCategoriaException(id);
    }

    const livroId = dto.livroId ?? existe.livroId;
    if (dto.livroId) {
      const livro = await this.prisma.compendioLivro.findUnique({
        where: { id: dto.livroId },
      });

      if (!livro) {
        throw new CompendioCategoriaException(dto.livroId);
      }
    }

    const codigo = dto.codigo
      ? this.gerarCodigo(dto.codigo, existe.codigo)
      : undefined;

    if (codigo && (codigo !== existe.codigo || livroId !== existe.livroId)) {
      const outraComCodigo = await this.prisma.compendioCategoria.findFirst({
        where: { codigo, livroId },
      });

      if (outraComCodigo) {
        throw new CompendioCategoriaDuplicadaException(codigo);
      }
    }

    return this.prisma.compendioCategoria.update({
      where: { id },
      data: {
        ...dto,
        ...(codigo ? { codigo } : {}),
      },
      include: this.categoriaInclude(false),
    });
  }

  async removerCategoria(id: number) {
    const existe = await this.prisma.compendioCategoria.findUnique({
      where: { id },
      include: { subcategorias: true },
    });

    if (!existe) {
      throw new CompendioCategoriaException(id);
    }

    if (existe.subcategorias.length > 0) {
      throw new CompendioCategoriaComSubcategoriasException(
        id,
        existe.subcategorias.length,
      );
    }

    await this.prisma.compendioCategoria.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== SUBCATEGORIAS ====================

  async listarSubcategorias(
    categoriaId: number,
    apenasAtivas = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      categoriaId,
      ...(apenasAtivas && { ativo: true }),
    };

    if (!page || !limit) {
      return this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.subcategoriaInclude(apenasAtivas),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioSubcategoria.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.subcategoriaInclude(apenasAtivas),
        skip,
        take: limit,
      }),
      this.prisma.compendioSubcategoria.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarSubcategoriaPorCodigo(codigo: string) {
    const subcategoria = await this.prisma.compendioSubcategoria.findFirst({
      where: {
        codigo,
        ativo: true,
        categoria: {
          ativo: true,
          livro: {
            codigo: LIVRO_PRINCIPAL_CODIGO,
            status: StatusPublicacao.PUBLICADO,
          },
        },
      },
      include: this.subcategoriaInclude(true),
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(codigo);
    }

    return subcategoria;
  }

  async buscarSubcategoriaDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
    subcategoriaCodigo: string,
  ) {
    const subcategoria = await this.prisma.compendioSubcategoria.findFirst({
      where: {
        codigo: subcategoriaCodigo,
        ativo: true,
        categoria: {
          codigo: categoriaCodigo,
          ativo: true,
          livro: {
            codigo: livroCodigo,
            status: StatusPublicacao.PUBLICADO,
          },
        },
      },
      include: this.subcategoriaInclude(true),
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(subcategoriaCodigo);
    }

    return subcategoria;
  }

  async criarSubcategoria(dto: CreateSubcategoriaDto) {
    const codigo = this.gerarCodigo(dto.codigo || dto.nome, 'subcategoria');
    const categoria = await this.prisma.compendioCategoria.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new CompendioCategoriaException(dto.categoriaId);
    }

    const existe = await this.prisma.compendioSubcategoria.findFirst({
      where: { codigo, categoriaId: dto.categoriaId },
    });

    if (existe) {
      throw new CompendioSubcategoriaDuplicadaException(codigo);
    }

    return this.prisma.compendioSubcategoria.create({
      data: { ...dto, codigo },
      include: this.subcategoriaInclude(false),
    });
  }

  async atualizarSubcategoria(id: number, dto: UpdateSubcategoriaDto) {
    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioSubcategoriaException(id);
    }

    const categoriaId = dto.categoriaId ?? existe.categoriaId;
    if (dto.categoriaId) {
      const categoria = await this.prisma.compendioCategoria.findUnique({
        where: { id: dto.categoriaId },
      });

      if (!categoria) {
        throw new CompendioCategoriaException(dto.categoriaId);
      }
    }

    const codigo = dto.codigo
      ? this.gerarCodigo(dto.codigo, existe.codigo)
      : undefined;

    if (
      codigo &&
      (codigo !== existe.codigo || categoriaId !== existe.categoriaId)
    ) {
      const outraComCodigo = await this.prisma.compendioSubcategoria.findFirst({
        where: { codigo, categoriaId },
      });

      if (outraComCodigo) {
        throw new CompendioSubcategoriaDuplicadaException(codigo);
      }
    }

    return this.prisma.compendioSubcategoria.update({
      where: { id },
      data: {
        ...dto,
        ...(codigo ? { codigo } : {}),
      },
      include: this.subcategoriaInclude(false),
    });
  }

  async removerSubcategoria(id: number) {
    const existe = await this.prisma.compendioSubcategoria.findUnique({
      where: { id },
      include: { artigos: true },
    });

    if (!existe) {
      throw new CompendioSubcategoriaException(id);
    }

    if (existe.artigos.length > 0) {
      throw new CompendioSubcategoriaComArtigosException(
        id,
        existe.artigos.length,
      );
    }

    await this.prisma.compendioSubcategoria.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== ARTIGOS ====================

  async listarArtigos(
    subcategoriaId?: number,
    apenasAtivos = true,
    page?: number,
    limit?: number,
  ): Promise<any[] | PaginatedResult<any>> {
    const where = {
      ...(subcategoriaId && { subcategoriaId }),
      ...(apenasAtivos && { ativo: true }),
      subcategoria: {
        ...(apenasAtivos && { ativo: true }),
        categoria: {
          ...(apenasAtivos && { ativo: true }),
          livro: { status: StatusPublicacao.PUBLICADO },
        },
      },
    };

    if (!page || !limit) {
      return this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.artigoInclude(),
      });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.compendioArtigo.findMany({
        where,
        orderBy: { ordem: 'asc' },
        include: this.artigoInclude(),
        skip,
        take: limit,
      }),
      this.prisma.compendioArtigo.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarArtigoPorCodigo(codigo: string) {
    const artigo = await this.prisma.compendioArtigo.findFirst({
      where: {
        codigo,
        ativo: true,
        subcategoria: {
          ativo: true,
          categoria: {
            ativo: true,
            livro: {
              codigo: LIVRO_PRINCIPAL_CODIGO,
              status: StatusPublicacao.PUBLICADO,
            },
          },
        },
      },
      include: this.artigoInclude(),
    });

    if (!artigo) {
      throw new CompendioArtigoException(codigo);
    }

    return artigo;
  }

  async buscarArtigoDoLivroPorCodigo(
    livroCodigo: string,
    categoriaCodigo: string,
    subcategoriaCodigo: string,
    artigoCodigo: string,
  ) {
    const artigo = await this.prisma.compendioArtigo.findFirst({
      where: {
        codigo: artigoCodigo,
        ativo: true,
        subcategoria: {
          codigo: subcategoriaCodigo,
          ativo: true,
          categoria: {
            codigo: categoriaCodigo,
            ativo: true,
            livro: {
              codigo: livroCodigo,
              status: StatusPublicacao.PUBLICADO,
            },
          },
        },
      },
      include: this.artigoInclude(),
    });

    if (!artigo) {
      throw new CompendioArtigoException(artigoCodigo);
    }

    return artigo;
  }

  async criarArtigo(dto: CreateArtigoDto) {
    const codigo = this.gerarCodigo(dto.codigo || dto.titulo, 'artigo');
    const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
      where: { id: dto.subcategoriaId },
    });

    if (!subcategoria) {
      throw new CompendioSubcategoriaException(dto.subcategoriaId);
    }

    const existe = await this.prisma.compendioArtigo.findFirst({
      where: { codigo, subcategoriaId: dto.subcategoriaId },
    });

    if (existe) {
      throw new CompendioArtigoDuplicadoException(codigo);
    }

    return this.prisma.compendioArtigo.create({
      data: { ...dto, codigo },
      include: this.artigoInclude(),
    });
  }

  async atualizarArtigo(id: number, dto: UpdateArtigoDto) {
    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioArtigoException(id);
    }

    const subcategoriaId = dto.subcategoriaId ?? existe.subcategoriaId;
    if (dto.subcategoriaId) {
      const subcategoria = await this.prisma.compendioSubcategoria.findUnique({
        where: { id: dto.subcategoriaId },
      });

      if (!subcategoria) {
        throw new CompendioSubcategoriaException(dto.subcategoriaId);
      }
    }

    const codigo = dto.codigo
      ? this.gerarCodigo(dto.codigo, existe.codigo)
      : undefined;

    if (
      codigo &&
      (codigo !== existe.codigo || subcategoriaId !== existe.subcategoriaId)
    ) {
      const outroComCodigo = await this.prisma.compendioArtigo.findFirst({
        where: { codigo, subcategoriaId },
      });

      if (outroComCodigo) {
        throw new CompendioArtigoDuplicadoException(codigo);
      }
    }

    return this.prisma.compendioArtigo.update({
      where: { id },
      data: {
        ...dto,
        ...(codigo ? { codigo } : {}),
      },
      include: this.artigoInclude(),
    });
  }

  async removerArtigo(id: number) {
    const existe = await this.prisma.compendioArtigo.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new CompendioArtigoException(id);
    }

    await this.prisma.compendioArtigo.delete({ where: { id } });
    return { sucesso: true };
  }

  // ==================== BUSCA & DESTAQUES ====================

  async buscar(query: string, livroCodigo?: string) {
    const queryTrimmed = query?.trim() || '';

    if (queryTrimmed.length < 3) {
      throw new CompendioBuscaInvalidaException(3, queryTrimmed.length);
    }

    const q = queryTrimmed.toLowerCase();

    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        subcategoria: {
          ativo: true,
          categoria: {
            ativo: true,
            livro: {
              status: StatusPublicacao.PUBLICADO,
              ...(livroCodigo ? { codigo: livroCodigo } : {}),
            },
          },
        },
        OR: [
          { titulo: { contains: q } },
          { resumo: { contains: q } },
          { palavrasChave: { contains: q } },
          { conteudo: { contains: q } },
        ],
      },
      include: this.artigoInclude(),
      orderBy: { ordem: 'asc' },
      take: 20,
    });
  }

  async listarDestaques(livroCodigo?: string) {
    return this.prisma.compendioArtigo.findMany({
      where: {
        ativo: true,
        destaque: true,
        subcategoria: {
          ativo: true,
          categoria: {
            ativo: true,
            livro: {
              status: StatusPublicacao.PUBLICADO,
              ...(livroCodigo ? { codigo: livroCodigo } : {}),
            },
          },
        },
      },
      orderBy: { ordem: 'asc' },
      include: this.artigoInclude(),
      take: 6,
    });
  }
}
