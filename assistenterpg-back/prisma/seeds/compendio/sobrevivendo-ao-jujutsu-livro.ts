import {
  CategoriaEquipamento,
  TipoModificacao,
  type Prisma,
} from '@prisma/client';
import {
  acessoriosSuplemento,
  armasSuplemento,
  artefatosAmaldicoadosSuplemento,
  DESCRICAO_SUPLEMENTO,
  modificacoesSuplemento,
  origensSuplemento,
  poderesSuplemento,
  SUPLEMENTO_CODIGO,
  SUPLEMENTO_NOME,
  trilhasSuplemento,
  type EquipamentoAcessorioSeed,
  type EquipamentoArmaSeed,
  type EquipamentoArtefatoAmaldicoadoSeed,
  type ModificacaoSuplemento,
  type OrigemSuplemento,
  type PoderSuplemento,
  type TrilhaSuplemento,
} from '../suplementos/sobrevivendo-ao-jujutsu';
import {
  slugifyCompendio,
  type ArtigoSeed,
  type CategoriaSeed,
  type LivroSeed,
  type NivelDificuldadeSeed,
  type SubcategoriaSeed,
} from '../../../src/compendio/compendio-livro-markdown.parser';

const TAGS_BASE = ['sobrevivendo', 'jujutsu', 'suplemento'];

function stripPrefix(texto: string | null | undefined): string {
  return (texto ?? '')
    .replace(/^\[Suplemento: Sobrevivendo ao Jujutsu\]\s*/i, '')
    .trim();
}

function resumo(texto: string, fallback: string): string {
  const plain = texto
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/[*_`>#|[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (plain || fallback).slice(0, 220).trim();
}

function prettyJson(value: Prisma.InputJsonValue | null | undefined): string {
  if (value === null || value === undefined) return '';
  return `\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function categoriaLabel(categoria: CategoriaEquipamento): string {
  switch (categoria) {
    case CategoriaEquipamento.CATEGORIA_0:
      return 'Categoria 0';
    case CategoriaEquipamento.CATEGORIA_1:
      return 'Categoria IV';
    case CategoriaEquipamento.CATEGORIA_2:
      return 'Categoria III';
    case CategoriaEquipamento.CATEGORIA_3:
      return 'Categoria II';
    case CategoriaEquipamento.CATEGORIA_4:
      return 'Categoria I';
    case CategoriaEquipamento.ESPECIAL:
      return 'Especial';
    default:
      return String(categoria);
  }
}

function modificacaoLabel(tipo: TipoModificacao): string {
  return tipo
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function artigo(params: {
  titulo: string;
  conteudo: string;
  ordem: number;
  tags: string[];
  codigo?: string;
  destaque?: boolean;
  nivelDificuldade?: NivelDificuldadeSeed;
  palavrasChave?: string;
}): ArtigoSeed {
  const codigo = params.codigo ?? slugifyCompendio(params.titulo);
  return {
    codigo,
    titulo: params.titulo,
    resumo: resumo(params.conteudo, params.titulo),
    conteudo: params.conteudo,
    ordem: params.ordem,
    tags: [...TAGS_BASE, ...params.tags],
    palavrasChave:
      params.palavrasChave ??
      [...TAGS_BASE, params.titulo, ...params.tags].join(' ').toLowerCase(),
    nivelDificuldade: params.nivelDificuldade ?? 'iniciante',
    destaque: params.destaque ?? false,
  };
}

function subcategoria(params: {
  codigo: string;
  nome: string;
  descricao: string;
  ordem: number;
  artigos: ArtigoSeed[];
}): SubcategoriaSeed {
  return params;
}

function categoria(params: {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: number;
  subcategorias: SubcategoriaSeed[];
}): CategoriaSeed {
  return params;
}

function markdownOrigem(origem: OrigemSuplemento): string {
  const pericias = origem.pericias
    .map((pericia) =>
      pericia.tipo === 'FIXA'
        ? `- ${pericia.codigo}`
        : `- Escolha do grupo ${pericia.grupoEscolha ?? 1}: ${pericia.codigo}`,
    )
    .join('\n');

  return `# ${origem.nome}

${stripPrefix(origem.descricao)}

${origem.requisitosTexto ? `## Requisitos\n\n${origem.requisitosTexto}\n\n` : ''}## Pericias

${pericias || '- Nenhuma pericia especifica.'}

## Habilidade de origem

### ${origem.habilidade.nome}

${stripPrefix(origem.habilidade.descricao)}
${prettyJson(origem.habilidade.mecanicasEspeciais)}`;
}

function markdownPoder(poder: PoderSuplemento): string {
  return `# ${poder.nome}

${stripPrefix(poder.descricao)}

${poder.requisitos ? `## Requisitos\n${prettyJson(poder.requisitos)}\n` : ''}${poder.mecanicasEspeciais ? `## Mecanicas\n${prettyJson(poder.mecanicasEspeciais)}\n` : ''}`;
}

function markdownTrilha(trilha: TrilhaSuplemento): string {
  const caminhos =
    trilha.caminhos && trilha.caminhos.length > 0
      ? `\n\n## Caminhos\n\n${trilha.caminhos
          .map(
            (caminho) =>
              `### ${caminho.nome}\n\n${stripPrefix(caminho.descricao) || 'Caminho da trilha.'}`,
          )
          .join('\n\n')}`
      : '';
  const habilidades = trilha.habilidades
    .map(
      (habilidade) => `## Nivel ${habilidade.nivel} - ${habilidade.nome}

${habilidade.caminho ? `**Caminho:** ${habilidade.caminho}\n\n` : ''}${stripPrefix(habilidade.descricao)}
${prettyJson(habilidade.mecanicasEspeciais)}`,
    )
    .join('\n\n');

  return `# ${trilha.nome}

**Classe:** ${trilha.classe}

${stripPrefix(trilha.descricao)}

${trilha.requisitos ? `## Requisitos\n${prettyJson(trilha.requisitos)}\n` : ''}${caminhos}

## Habilidades

${habilidades}`;
}

function markdownArma(equipamento: EquipamentoArmaSeed): string {
  const danos = equipamento.danos
    .map((dano) => {
      const empunhadura = dano.empunhadura ? ` (${dano.empunhadura})` : '';
      return `- ${dano.rolagem}${dano.valorFlat ? ` + ${dano.valorFlat}` : ''} ${dano.tipoDano}${empunhadura}`;
    })
    .join('\n');

  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espacos: ${equipamento.espacos}
- Proficiencia: ${equipamento.proficienciaArma}
- Tipo: ${equipamento.tipoArma}
- Empunhaduras: ${equipamento.empunhaduras.join(', ')}
- Alcance: ${equipamento.alcance}
- Critico: ${equipamento.criticoValor}/x${equipamento.criticoMultiplicador}
${equipamento.tipoMunicaoCodigo ? `- Municao: ${equipamento.tipoMunicaoCodigo}` : ''}

## Dano

${danos || '- Sem dano cadastrado.'}

${equipamento.habilidadeEspecial ? `## Habilidade especial\n\n${equipamento.habilidadeEspecial}` : ''}`;
}

function markdownAcessorio(equipamento: EquipamentoAcessorioSeed): string {
  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espacos: ${equipamento.espacos}
- Tipo: ${equipamento.tipoAcessorio}
${equipamento.periciaBonificada ? `- Pericia bonificada: ${equipamento.periciaBonificada}` : ''}
${equipamento.bonusPericia ? `- Bonus de pericia: +${equipamento.bonusPericia}` : ''}
${equipamento.tipoUso ? `- Uso: ${equipamento.tipoUso}` : ''}

${equipamento.efeito ? `## Efeito\n\n${equipamento.efeito}` : ''}`;
}

function markdownArtefato(
  equipamento: EquipamentoArtefatoAmaldicoadoSeed,
): string {
  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espacos: ${equipamento.espacos}
${equipamento.tipoUso ? `- Uso: ${equipamento.tipoUso}` : ''}

## Efeito

${equipamento.efeito}

## Artefato

- Tipo base: ${equipamento.artefato.tipoBase}
- Proficiencia requerida: ${equipamento.artefato.proficienciaRequerida ? 'sim' : 'nao'}
${equipamento.artefato.custoUso ? `- Custo de uso: ${equipamento.artefato.custoUso}` : ''}
${equipamento.artefato.manutencao ? `- Manutencao: ${equipamento.artefato.manutencao}` : ''}
${equipamento.artefato.efeito ? `\n${equipamento.artefato.efeito}` : ''}`;
}

function markdownModificacao(modificacao: ModificacaoSuplemento): string {
  return `# ${modificacao.nome}

${stripPrefix(modificacao.descricao)}

## Dados

- Tipo: ${modificacaoLabel(modificacao.tipo)}
- Incremento de espacos: ${modificacao.incrementoEspacos}

${modificacao.restricoes ? `## Restricoes\n${prettyJson(modificacao.restricoes)}\n` : ''}${modificacao.efeitosMecanicos ? `## Efeitos mecanicos\n${prettyJson(modificacao.efeitosMecanicos)}\n` : ''}`;
}

function artigosPorItem<T>(
  items: T[],
  mapper: (item: T) => { titulo: string; conteudo: string; tags: string[] },
): ArtigoSeed[] {
  return items.map((item, index) => {
    const mapped = mapper(item);
    return artigo({
      titulo: mapped.titulo,
      conteudo: mapped.conteudo,
      ordem: index + 1,
      tags: mapped.tags,
      destaque: index < 3,
      nivelDificuldade: 'intermediario',
    });
  });
}

export function buildSobrevivendoAoJujutsuLivro(): LivroSeed {
  const intro = artigo({
    codigo: 'apresentacao',
    titulo: 'Apresentacao',
    ordem: 1,
    tags: ['apresentacao'],
    destaque: true,
    conteudo: `# ${SUPLEMENTO_NOME}

${DESCRICAO_SUPLEMENTO}

Este livro organiza em formato de leitura o conteudo oficial ja cadastrado no sistema: origens, poderes genericos, trilhas, equipamentos, artefatos amaldicoados e modificacoes.

As regras mecanicas continuam sendo aplicadas pelos cadastros estruturados do suplemento; este compendio serve como referencia textual navegavel.`,
  });

  return {
    codigo: 'sobrevivendo-ao-jujutsu',
    titulo: SUPLEMENTO_NOME,
    descricao:
      'Primeiro suplemento oficial, com origens, poderes, trilhas, equipamentos, artefatos e modificacoes.',
    icone: 'book',
    cor: '#10b981',
    ordem: 2,
    suplementoCodigo: SUPLEMENTO_CODIGO,
    categorias: [
      categoria({
        codigo: 'apresentacao',
        nome: 'Apresentacao',
        descricao: 'Resumo do suplemento e como usar este livro.',
        icone: 'book',
        cor: '#10b981',
        ordem: 1,
        subcategorias: [
          subcategoria({
            codigo: 'inicio',
            nome: 'Inicio',
            descricao: 'Apresentacao do suplemento.',
            ordem: 1,
            artigos: [intro],
          }),
        ],
      }),
      categoria({
        codigo: 'origens',
        nome: 'Origens',
        descricao: 'Novos passados e ganchos de sobrevivencia.',
        icone: 'story',
        cor: '#10b981',
        ordem: 2,
        subcategorias: [
          subcategoria({
            codigo: 'origens-do-suplemento',
            nome: 'Origens do Suplemento',
            descricao:
              'Origens oficiais adicionadas por Sobrevivendo ao Jujutsu.',
            ordem: 1,
            artigos: artigosPorItem(origensSuplemento, (origem) => ({
              titulo: origem.nome,
              conteudo: markdownOrigem(origem),
              tags: ['origens'],
            })),
          }),
        ],
      }),
      categoria({
        codigo: 'poderes',
        nome: 'Poderes',
        descricao: 'Poderes genericos e opcoes de progressao.',
        icone: 'sparkles',
        cor: '#f59e0b',
        ordem: 3,
        subcategorias: [
          subcategoria({
            codigo: 'poderes-genericos',
            nome: 'Poderes Genericos',
            descricao: 'Poderes oficiais adicionados pelo suplemento.',
            ordem: 1,
            artigos: artigosPorItem(poderesSuplemento, (poder) => ({
              titulo: poder.nome,
              conteudo: markdownPoder(poder),
              tags: ['poderes'],
            })),
          }),
        ],
      }),
      categoria({
        codigo: 'trilhas',
        nome: 'Trilhas',
        descricao: 'Novas trilhas e caminhos.',
        icone: 'training',
        cor: '#22d3ee',
        ordem: 4,
        subcategorias: [
          subcategoria({
            codigo: 'trilhas-do-suplemento',
            nome: 'Trilhas do Suplemento',
            descricao: 'Trilhas oficiais adicionadas pelo suplemento.',
            ordem: 1,
            artigos: artigosPorItem(trilhasSuplemento, (trilha) => ({
              titulo: trilha.nome,
              conteudo: markdownTrilha(trilha),
              tags: ['trilhas', trilha.classe.toLowerCase()],
            })),
          }),
        ],
      }),
      categoria({
        codigo: 'equipamentos',
        nome: 'Equipamentos',
        descricao: 'Itens, armas e ferramentas.',
        icone: 'inventory',
        cor: '#a78bfa',
        ordem: 5,
        subcategorias: [
          subcategoria({
            codigo: 'armas',
            nome: 'Armas',
            descricao: 'Armas oficiais do suplemento.',
            ordem: 1,
            artigos: artigosPorItem(armasSuplemento, (equipamento) => ({
              titulo: equipamento.nome,
              conteudo: markdownArma(equipamento),
              tags: ['equipamentos', 'armas'],
            })),
          }),
          subcategoria({
            codigo: 'acessorios',
            nome: 'Acessorios',
            descricao: 'Acessorios oficiais do suplemento.',
            ordem: 2,
            artigos: artigosPorItem(acessoriosSuplemento, (equipamento) => ({
              titulo: equipamento.nome,
              conteudo: markdownAcessorio(equipamento),
              tags: ['equipamentos', 'acessorios'],
            })),
          }),
        ],
      }),
      categoria({
        codigo: 'artefatos-amaldicoados',
        nome: 'Artefatos Amaldicoados',
        descricao: 'Artefatos e itens amaldicoados do suplemento.',
        icone: 'sparkles',
        cor: '#8b5cf6',
        ordem: 6,
        subcategorias: [
          subcategoria({
            codigo: 'artefatos',
            nome: 'Artefatos',
            descricao: 'Artefatos amaldicoados oficiais do suplemento.',
            ordem: 1,
            artigos: artigosPorItem(
              artefatosAmaldicoadosSuplemento,
              (equipamento) => ({
                titulo: equipamento.nome,
                conteudo: markdownArtefato(equipamento),
                tags: ['artefatos', 'equipamentos'],
              }),
            ),
          }),
        ],
      }),
      categoria({
        codigo: 'modificacoes',
        nome: 'Modificacoes',
        descricao: 'Melhorias e ajustes de equipamentos.',
        icone: 'tools',
        cor: '#fb923c',
        ordem: 7,
        subcategorias: [
          subcategoria({
            codigo: 'modificacoes-do-suplemento',
            nome: 'Modificacoes do Suplemento',
            descricao: 'Modificacoes oficiais adicionadas pelo suplemento.',
            ordem: 1,
            artigos: artigosPorItem(modificacoesSuplemento, (modificacao) => ({
              titulo: modificacao.nome,
              conteudo: markdownModificacao(modificacao),
              tags: ['modificacoes'],
            })),
          }),
        ],
      }),
    ],
  };
}
