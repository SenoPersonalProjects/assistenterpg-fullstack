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

type JsonRecord = Record<string, unknown>;

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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asJsonRecord(value: unknown): JsonRecord | null {
  return isRecord(value) ? (value as JsonRecord) : null;
}

function isJsonRecord(value: JsonRecord | null): value is JsonRecord {
  return value !== null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function sentenceCase(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function labelFromCode(value: unknown, options?: { lower?: boolean }): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const labels: Record<string, string> = {
    ACROBACIA: 'Acrobacia',
    ADESTRAMENTO: 'Adestramento',
    AGI: 'Agilidade',
    AGILIDADE: 'Agilidade',
    ARTES: 'Artes',
    ATLETISMO: 'Atletismo',
    ATUALIDADES: 'Atualidades',
    CIENCIAS: 'Ciências',
    CORPO_A_CORPO: 'Corpo a corpo',
    CRIME: 'Crime',
    DIPLOMACIA: 'Diplomacia',
    ENERGIA_AMALDICOADA: 'energia amaldiçoada',
    ENGANACAO: 'Enganação',
    FORTITUDE: 'Fortitude',
    FOR: 'Força',
    FURTIVIDADE: 'Furtividade',
    INICIATIVA: 'Iniciativa',
    INT: 'Intelecto',
    INTIMIDACAO: 'Intimidação',
    INTUICAO: 'Intuição',
    INVESTIGACAO: 'Investigação',
    JUJUTSU: 'Jujutsu',
    LEVE: 'Leve',
    LUTA: 'Luta',
    MEDICINA: 'Medicina',
    PERFURANTE: 'Perfurante',
    PERCEPCAO: 'Percepção',
    PILOTAGEM: 'Pilotagem',
    PONTARIA: 'Pontaria',
    PRE: 'Presença',
    PROFISSAO: 'Profissão',
    REFLEXOS: 'Reflexos',
    RELIGIAO: 'Religião',
    SIMPLES: 'Simples',
    SOBREVIVENCIA: 'Sobrevivência',
    TATICA: 'Tática',
    TECNOLOGIA: 'Tecnologia',
    VIG: 'Vigor',
    VONTADE: 'Vontade',
  };

  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  const label =
    labels[normalized] ??
    normalized
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return options?.lower ? label.toLowerCase() : label;
}

function attributeLabel(value: string): string {
  const labels: Record<string, string> = {
    agilidade: 'Agilidade',
    força: 'Força',
    intelecto: 'Intelecto',
    presença: 'Presença',
    vigor: 'Vigor',
  };
  return labels[value] ?? labelFromCode(value);
}

function treinamentoLabel(grauMinimo: unknown): string {
  switch (asNumber(grauMinimo) ?? 1) {
    case 1:
      return 'treinada';
    case 2:
      return 'graduada';
    case 3:
      return 'veterana';
    case 4:
      return 'expert';
    default:
      return `grau ${grauMinimo}+`;
  }
}

function formatPericiaRequisito(pericia: JsonRecord): string | null {
  const codigo = asString(pericia.codigo);
  if (!codigo) return null;

  const detalhe = asString(pericia.detalhe);
  const grau = pericia.treinada === true ? 1 : (pericia.grauMinimo ?? 1);
  const detalheTexto = detalhe ? ` (${detalhe})` : '';
  return `${labelFromCode(codigo)} ${treinamentoLabel(grau)}${detalheTexto}`;
}

function formatInlineValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'sim' : 'não';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return labelFromCode(value);
  if (Array.isArray(value)) {
    return value.map(formatInlineValue).filter(Boolean).join(', ');
  }
  const record = asJsonRecord(value);
  if (record) {
    return Object.entries(record)
      .map(
        ([key, nested]) =>
          `${labelFromCode(key)}: ${formatInlineValue(nested)}`,
      )
      .filter((item) => !item.endsWith(': '))
      .join('; ');
  }
  return String(value);
}

function formatGenericEntries(
  value: JsonRecord,
  ignoredKeys: Set<string>,
): string[] {
  return Object.entries(value)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(([key, nested]) => {
      const formatted = formatInlineValue(nested);
      return formatted ? `${labelFromCode(key)}: ${formatted}.` : null;
    })
    .filter((item): item is string => Boolean(item));
}

function formatBulletSection(titulo: string, bullets: string[]): string {
  if (bullets.length === 0) return '';
  return `## ${titulo}\n\n${bullets.map((bullet) => `- ${bullet}`).join('\n')}\n`;
}

function formatRequisitos(
  value: Prisma.InputJsonValue | null | undefined,
): string[] {
  const data = asJsonRecord(value);
  if (!data) return [];

  const bullets: string[] = [];
  const handled = new Set<string>([
    'semTecnicaInata',
    'atributos',
    'pericias',
    'nivelMinimo',
    'graus',
  ]);

  if (data.semTecnicaInata === true) {
    bullets.push('Requer personagem sem técnica amaldiçoada.');
  }

  const atributos = asJsonRecord(data.atributos);
  if (atributos) {
    for (const [atributo, minimo] of Object.entries(atributos)) {
      bullets.push(
        `Requer ${attributeLabel(atributo)} ${formatInlineValue(minimo)}+.`,
      );
    }
  }

  const nivelMinimo = asNumber(data.nivelMinimo);
  if (nivelMinimo !== null) {
    bullets.push(`Requer nível ${nivelMinimo}+.`);
  }

  const pericias = toArray(data.pericias)
    .map(asJsonRecord)
    .filter(isJsonRecord);
  const alternativas = pericias.filter(
    (pericia) => pericia.alternativa === true,
  );
  const obrigatorias = pericias.filter(
    (pericia) => pericia.alternativa !== true,
  );

  if (alternativas.length > 1) {
    const nomes = alternativas
      .map((pericia) => asString(pericia.codigo))
      .filter((codigo): codigo is string => Boolean(codigo))
      .map((codigo) => labelFromCode(codigo));
    const grau =
      alternativas[0]?.treinada === true
        ? 1
        : (alternativas[0]?.grauMinimo ?? 1);
    if (nomes.length > 0) {
      bullets.push(`Requer ${nomes.join(' ou ')} ${treinamentoLabel(grau)}.`);
    }
  } else {
    for (const pericia of alternativas) {
      const texto = formatPericiaRequisito(pericia);
      if (texto) bullets.push(`Requer ${texto}.`);
    }
  }

  for (const pericia of obrigatorias) {
    const texto = formatPericiaRequisito(pericia);
    if (texto) bullets.push(`Requer ${texto}.`);
  }

  for (const grau of toArray(data.graus)
    .map(asJsonRecord)
    .filter(isJsonRecord)) {
    const codigo = asString(grau.tipoGrauCodigo);
    const minimo = asNumber(grau.valorMinimo);
    if (codigo && minimo !== null) {
      bullets.push(`Requer ${labelFromCode(codigo)} ${minimo}+.`);
    }
  }

  return [...bullets, ...formatGenericEntries(data, handled)];
}

function formatChoice(value: unknown): string | null {
  const data = asJsonRecord(value);
  if (!data) return null;
  const quantidade = asNumber(data.quantidade) ?? 1;
  const tipo = asString(data.tipo);
  const partes = [
    `Escolha ${quantidade} ${tipo === 'PERICIAS' ? 'perícia' : 'opção'}${quantidade > 1 ? 's' : ''}`,
  ];

  const periciasPermitidas = toArray(data.periciasPermitidas)
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
    .map((item) => labelFromCode(item));
  if (periciasPermitidas.length > 0) {
    partes.push(`permitidas: ${periciasPermitidas.join(', ')}`);
  }

  const atributosPermitidos = toArray(data.atributosBasePermitidos)
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
    .map((item) => labelFromCode(item));
  if (atributosPermitidos.length > 0) {
    partes.push(`atributos permitidos: ${atributosPermitidos.join(', ')}`);
  }

  return `${partes.join('; ')}.`;
}

function formatMecanicas(
  value: Prisma.InputJsonValue | null | undefined,
): string[] {
  const data = asJsonRecord(value);
  if (!data) return [];

  const bullets: string[] = [];
  const handled = new Set<string>([
    'recursos',
    'pvPorNivel',
    'pvExtra',
    'periciasBonus',
    'periciasTreinadas',
    'bonusSeJaTreinado',
    'periciasBonusEscolha',
    'escolha',
    'inventario',
    'periciasAtributoBase',
    'resistencias',
  ]);

  const recursos = asJsonRecord(data.recursos);
  if (recursos) {
    const pvBarrasTotal = asNumber(recursos.pvBarrasTotal);
    const peBase = asNumber(recursos.peBase);
    const pePorNivelImpar = asNumber(recursos.pePorNivelImpar);

    if (pvBarrasTotal !== null) {
      bullets.push(`PV dividido em ${pvBarrasTotal} núcleos/barras.`);
    }
    if (peBase !== null) {
      bullets.push(`Recebe +${peBase} PE.`);
    }
    if (pePorNivelImpar !== null) {
      bullets.push(`Recebe +${pePorNivelImpar} PE a cada 2 níveis.`);
    }

    bullets.push(
      ...formatGenericEntries(
        recursos,
        new Set(['pvBarrasTotal', 'peBase', 'pePorNivelImpar']),
      ).map((item) => `Recurso: ${item}`),
    );
  }

  const pvPorNivel = asNumber(data.pvPorNivel);
  if (pvPorNivel !== null) {
    bullets.push(`Recebe +${pvPorNivel} PV por nível.`);
  }

  const pvExtra = asNumber(data.pvExtra);
  if (pvExtra !== null) {
    bullets.push(`Recebe +${pvExtra} PV.`);
  }

  const periciasBonus = asJsonRecord(data.periciasBonus);
  if (periciasBonus) {
    const bonuses = Object.entries(periciasBonus).map(
      ([pericia, bonus]) =>
        `${labelFromCode(pericia)} ${Number(bonus) >= 0 ? '+' : ''}${formatInlineValue(bonus)}`,
    );
    if (bonuses.length > 0) bullets.push(`${bonuses.join('; ')}.`);
  }

  const periciasTreinadas = toArray(data.periciasTreinadas)
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
    .map((item) => labelFromCode(item));
  if (periciasTreinadas.length > 0) {
    bullets.push(`Recebe treinamento em ${periciasTreinadas.join(', ')}.`);
  }

  const bonusSeJaTreinado = asNumber(data.bonusSeJaTreinado);
  if (bonusSeJaTreinado !== null) {
    bullets.push(`Se já for treinado, recebe +${bonusSeJaTreinado}.`);
  }

  const periciasBonusEscolha = asNumber(data.periciasBonusEscolha);
  if (periciasBonusEscolha !== null) {
    bullets.push(`Perícias escolhidas recebem +${periciasBonusEscolha}.`);
  }

  const escolha = formatChoice(data.escolha);
  if (escolha) bullets.push(escolha);

  const inventario = asJsonRecord(data.inventario);
  if (inventario) {
    if (inventario.somarIntelecto === true) {
      bullets.push('Soma Intelecto ao limite de espaços do inventário.');
    }
    if (inventario.reduzirItensLeves === true) {
      bullets.push('Itens muito leves ocupam menos espaço.');
    }
    bullets.push(
      ...formatGenericEntries(
        inventario,
        new Set(['somarIntelecto', 'reduzirItensLeves']),
      ).map((item) => `Inventario: ${item}`),
    );
  }

  const periciasAtributoBase = asJsonRecord(data.periciasAtributoBase);
  if (periciasAtributoBase) {
    for (const [pericia, atributo] of Object.entries(periciasAtributoBase)) {
      bullets.push(
        `${labelFromCode(pericia)} passa a usar ${labelFromCode(atributo)} como atributo-base.`,
      );
    }
  }

  const resistencias = asJsonRecord(data.resistencias);
  if (resistencias) {
    for (const [tipo, valor] of Object.entries(resistencias)) {
      bullets.push(
        `Resistência a ${labelFromCode(tipo, { lower: true })} ${formatInlineValue(valor)}.`,
      );
    }
  }

  return [...bullets, ...formatGenericEntries(data, handled)];
}

function formatRestricoes(
  value: Prisma.InputJsonValue | null | undefined,
): string[] {
  const data = asJsonRecord(value);
  if (!data) return [];

  const bullets: string[] = [];
  const handled = new Set<string>(['tiposEquipamento']);
  const tiposEquipamento = toArray(data.tiposEquipamento)
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
    .map((item) => labelFromCode(item));

  if (tiposEquipamento.length > 0) {
    bullets.push(`Aplica-se a: ${tiposEquipamento.join(', ')}.`);
  }

  return [...bullets, ...formatGenericEntries(data, handled)];
}

function formatEfeitosMecanicos(
  value: Prisma.InputJsonValue | null | undefined,
): string[] {
  const data = asJsonRecord(value);
  if (!data) return [];
  if (typeof data.descricao === 'string') {
    return [data.descricao];
  }
  return formatGenericEntries(data, new Set());
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

${origem.requisitosTexto ? `## Requisitos\n\n${origem.requisitosTexto}\n\n` : ''}## Perícias

${pericias || '- Nenhuma perícia específica.'}

## Habilidade de origem

### ${origem.habilidade.nome}

${stripPrefix(origem.habilidade.descricao)}
${formatBulletSection('Mecânicas', formatMecanicas(origem.habilidade.mecanicasEspeciais))}`;
}

function markdownPoder(poder: PoderSuplemento): string {
  return `# ${poder.nome}

${stripPrefix(poder.descricao)}

${formatBulletSection('Requisitos', formatRequisitos(poder.requisitos))}
${formatBulletSection('Mecânicas', formatMecanicas(poder.mecanicasEspeciais))}`;
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
      (habilidade) => `## Nível ${habilidade.nivel} - ${habilidade.nome}

${habilidade.caminho ? `**Caminho:** ${habilidade.caminho}\n\n` : ''}${stripPrefix(habilidade.descricao)}
${formatBulletSection('Mecânicas', formatMecanicas(habilidade.mecanicasEspeciais))}`,
    )
    .join('\n\n');

  return `# ${trilha.nome}

**Classe:** ${trilha.classe}

${stripPrefix(trilha.descricao)}

${formatBulletSection('Requisitos', formatRequisitos(trilha.requisitos))}
${caminhos}

## Habilidades

${habilidades}`;
}

function markdownArma(equipamento: EquipamentoArmaSeed): string {
  const danos = equipamento.danos
    .map((dano) => {
      const empunhadura = dano.empunhadura
        ? ` (${labelFromCode(dano.empunhadura)})`
        : '';
      return `- ${dano.rolagem}${dano.valorFlat ? ` + ${dano.valorFlat}` : ''} ${labelFromCode(dano.tipoDano)}${empunhadura}`;
    })
    .join('\n');

  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espaços: ${equipamento.espacos}
- Proficiência: ${labelFromCode(equipamento.proficienciaArma)}
- Tipo: ${labelFromCode(equipamento.tipoArma)}
- Empunhaduras: ${equipamento.empunhaduras.map((item) => labelFromCode(item)).join(', ')}
- Alcance: ${labelFromCode(equipamento.alcance)}
- Crítico: ${equipamento.criticoValor}/x${equipamento.criticoMultiplicador}
${equipamento.tipoMunicaoCodigo ? `- Munição: ${labelFromCode(equipamento.tipoMunicaoCodigo)}` : ''}

## Dano

${danos || '- Sem dano cadastrado.'}

${equipamento.habilidadeEspecial ? `## Habilidade especial\n\n${equipamento.habilidadeEspecial}` : ''}`;
}

function markdownAcessorio(equipamento: EquipamentoAcessorioSeed): string {
  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espaços: ${equipamento.espacos}
- Tipo: ${labelFromCode(equipamento.tipoAcessorio)}
${equipamento.periciaBonificada ? `- Perícia bonificada: ${labelFromCode(equipamento.periciaBonificada)}` : ''}
${equipamento.bonusPericia ? `- Bônus de perícia: +${equipamento.bonusPericia}` : ''}
${equipamento.tipoUso ? `- Uso: ${labelFromCode(equipamento.tipoUso)}` : ''}

${equipamento.efeito ? `## Efeito\n\n${equipamento.efeito}` : ''}`;
}

function markdownArtefato(
  equipamento: EquipamentoArtefatoAmaldicoadoSeed,
): string {
  return `# ${equipamento.nome}

${stripPrefix(equipamento.descricao)}

## Dados

- Categoria: ${categoriaLabel(equipamento.categoria)}
- Espaços: ${equipamento.espacos}
${equipamento.tipoUso ? `- Uso: ${labelFromCode(equipamento.tipoUso)}` : ''}

## Efeito

${equipamento.efeito}

## Artefato

- Tipo base: ${labelFromCode(equipamento.artefato.tipoBase)}
- Proficiência requerida: ${equipamento.artefato.proficienciaRequerida ? 'sim' : 'não'}
${equipamento.artefato.custoUso ? `- Custo de uso: ${equipamento.artefato.custoUso}` : ''}
${equipamento.artefato.manutencao ? `- Manutenção: ${equipamento.artefato.manutencao}` : ''}
${equipamento.artefato.efeito ? `\n${equipamento.artefato.efeito}` : ''}`;
}

function markdownModificacao(modificacao: ModificacaoSuplemento): string {
  return `# ${modificacao.nome}

${stripPrefix(modificacao.descricao)}

## Dados

- Tipo: ${modificacaoLabel(modificacao.tipo)}
- Incremento de espaços: ${modificacao.incrementoEspacos}

${formatBulletSection('Restrições', formatRestricoes(modificacao.restricoes))}
${formatBulletSection('Efeitos mecânicos', formatEfeitosMecanicos(modificacao.efeitosMecanicos))}`;
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
    titulo: 'Apresentação',
    ordem: 1,
    tags: ['apresentacao'],
    destaque: true,
    conteudo: `# ${SUPLEMENTO_NOME}

${DESCRICAO_SUPLEMENTO}

Este livro organiza em formato de leitura o conteúdo oficial já cadastrado no sistema: origens, poderes genéricos, trilhas, equipamentos, artefatos amaldiçoados e modificações.

As regras mecânicas continuam sendo aplicadas pelos cadastros estruturados do suplemento; este compêndio serve como referência textual navegável.`,
  });

  return {
    codigo: 'sobrevivendo-ao-jujutsu',
    titulo: SUPLEMENTO_NOME,
    descricao:
      'Primeiro suplemento oficial, com origens, poderes, trilhas, equipamentos, artefatos e modificações.',
    icone: 'book',
    cor: '#10b981',
    ordem: 2,
    suplementoCodigo: SUPLEMENTO_CODIGO,
    categorias: [
      categoria({
        codigo: 'apresentacao',
        nome: 'Apresentação',
        descricao: 'Resumo do suplemento e como usar este livro.',
        icone: 'book',
        cor: '#10b981',
        ordem: 1,
        subcategorias: [
          subcategoria({
            codigo: 'início',
            nome: 'Início',
            descricao: 'Apresentação do suplemento.',
            ordem: 1,
            artigos: [intro],
          }),
        ],
      }),
      categoria({
        codigo: 'origens',
        nome: 'Origens',
        descricao: 'Novos passados e ganchos de sobrevivência.',
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
        descricao: 'Poderes genéricos e opções de progressão.',
        icone: 'sparkles',
        cor: '#f59e0b',
        ordem: 3,
        subcategorias: [
          subcategoria({
            codigo: 'poderes-genericos',
            nome: 'Poderes Genéricos',
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
            nome: 'Acessórios',
            descricao: 'Acessórios oficiais do suplemento.',
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
        nome: 'Artefatos Amaldiçoados',
        descricao: 'Artefatos e itens amaldiçoados do suplemento.',
        icone: 'sparkles',
        cor: '#8b5cf6',
        ordem: 6,
        subcategorias: [
          subcategoria({
            codigo: 'artefatos',
            nome: 'Artefatos',
            descricao: 'Artefatos amaldiçoados oficiais do suplemento.',
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
        nome: 'Modificações',
        descricao: 'Melhorias e ajustes de equipamentos.',
        icone: 'tools',
        cor: '#fb923c',
        ordem: 7,
        subcategorias: [
          subcategoria({
            codigo: 'modificacoes-do-suplemento',
            nome: 'Modificações do Suplemento',
            descricao: 'Modificações oficiais adicionadas pelo suplemento.',
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
