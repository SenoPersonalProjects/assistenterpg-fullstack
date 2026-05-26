import { MAX_ARTICLE_BYTES } from './compendio-livro-markdown.parser';
import { buildSobrevivendoAoJujutsuLivro } from '../../prisma/seeds/compendio/sobrevivendo-ao-jujutsu-livro';
import { trilhasSuplemento } from '../../prisma/seeds/suplementos/sobrevivendo-ao-jujutsu';

function getAllArticles() {
  return buildSobrevivendoAoJujutsuLivro().categorias.flatMap((categoria) =>
    categoria.subcategorias.flatMap((subcategoria) => subcategoria.artigos),
  );
}

function findTrilha(nome: string) {
  const trilha = trilhasSuplemento.find((item) => item.nome === nome);
  if (!trilha) {
    throw new Error(`Trilha não encontrada no seed: ${nome}`);
  }
  return trilha;
}

function findHabilidade(trilhaNome: string, codigo: string) {
  const habilidade = findTrilha(trilhaNome).habilidades.find(
    (item) => item.codigo === codigo,
  );
  if (!habilidade) {
    throw new Error(`Habilidade não encontrada no seed: ${codigo}`);
  }
  return habilidade;
}

describe('buildSobrevivendoAoJujutsuLivro', () => {
  it('gera o livro público do suplemento sem placeholders', () => {
    const livro = buildSobrevivendoAoJujutsuLivro();
    const artigos = getAllArticles();
    const conteudoCompleto = artigos
      .map((artigo) => artigo.conteudo)
      .join('\n');

    expect(livro.codigo).toBe('sobrevivendo-ao-jujutsu');
    expect(livro.titulo).toBe('Sobrevivendo ao Jujutsu');
    expect(livro.suplementoCodigo).toBe('SOBREVIVENDO_AO_JUJUTSU');
    expect(livro.categorias.map((categoria) => categoria.codigo)).toEqual([
      'apresentacao',
      'origens',
      'poderes',
      'trilhas',
      'equipamentos',
      'artefatos-amaldicoados',
      'modificacoes',
    ]);
    expect(conteudoCompleto).not.toContain('O texto completo sera preenchido');
    expect(conteudoCompleto).not.toContain('```json');
  });

  it('inclui os textos integrais das três trilhas novas no compêndio', () => {
    const artigos = getAllArticles();
    const corpo = artigos.find(
      (artigo) => artigo.codigo === 'corpo-amaldicoado-independente',
    );
    const receptaculo = artigos.find(
      (artigo) => artigo.codigo === 'receptaculo',
    );
    const amaldicoado = artigos.find(
      (artigo) => artigo.codigo === 'amaldicoado',
    );

    expect(corpo?.conteudo).toContain('Blefe Mortal');
    expect(corpo?.conteudo).toContain('Núcleo do Equilíbrio');
    expect(corpo?.conteudo).toContain('Ainda Bem que Eu Não Sou Humano');
    expect(receptaculo?.conteudo).toContain('Livrando-se da entidade');
    expect(receptaculo?.conteudo).toContain('Manifestação Completa');
    expect(receptaculo?.conteudo).toContain('Favor');
    expect(amaldicoado?.conteudo).toContain('Maldição Vinculada');
    expect(amaldicoado?.conteudo).toContain('Enigma Amaldiçoado');
    expect(amaldicoado?.conteudo).toContain('Espírito Amaldiçoado Manifesto');
  });

  it('renderiza requisitos e mecânicas estruturadas como texto legível', () => {
    const artigos = getAllArticles();
    const parapsicologo = artigos.find(
      (artigo) => artigo.codigo === 'parapsicologo',
    );
    const corpo = artigos.find(
      (artigo) => artigo.codigo === 'corpo-amaldicoado-independente',
    );
    const parceiro = artigos.find((artigo) => artigo.codigo === 'parceiro');
    const baioneta = artigos.find((artigo) => artigo.codigo === 'baioneta');

    expect(parapsicologo?.conteudo).toContain(
      'Requer Profissão treinada (psicólogo).',
    );
    expect(corpo?.conteudo).toContain(
      'Requer personagem sem técnica amaldiçoada.',
    );
    expect(corpo?.conteudo).toContain('PV dividido em 3 núcleos/barras.');
    expect(corpo?.conteudo).toContain('Recebe +2 PV por nível.');
    expect(parceiro?.conteudo).toContain('Requer Diplomacia treinada.');
    expect(parceiro?.conteudo).toContain('Requer nível 6+.');
    expect(baioneta?.conteudo).toContain('Proficiência: Simples');
    expect(baioneta?.conteudo).toContain('Tipo: Corpo a corpo');
    expect(baioneta?.conteudo).toContain('1d4 Perfurante (Leve)');
  });

  it('mantém os artigos gerados dentro do limite do campo Text', () => {
    for (const artigo of getAllArticles()) {
      expect(Buffer.byteLength(artigo.conteudo, 'utf8')).toBeLessThanOrEqual(
        MAX_ARTICLE_BYTES,
      );
    }
  });
});

describe('trilhas novas de Sobrevivendo ao Jujutsu', () => {
  it('mantém classes e requisito sem técnica inata', () => {
    expect(findTrilha('Corpo Amaldiçoado Independente')).toMatchObject({
      classe: 'Combatente',
      requisitos: { semTecnicaInata: true },
    });
    expect(findTrilha('Receptáculo')).toMatchObject({
      classe: 'Especialista',
      requisitos: { semTecnicaInata: true },
    });
    expect(findTrilha('Amaldiçoado')).toMatchObject({
      classe: 'Sentinela',
      requisitos: { semTecnicaInata: true },
    });
  });

  it('mantém mecânicas estruturais do Corpo Amaldiçoado Independente', () => {
    expect(
      findHabilidade(
        'Corpo Amaldiçoado Independente',
        'SUP_CORPO_AMALDICOADO_BLEFE_MORTAL',
      ).mecanicasEspeciais,
    ).toEqual({ recursos: { pvBarrasTotal: 3 } });
    expect(
      findHabilidade(
        'Corpo Amaldiçoado Independente',
        'SUP_CORPO_AMALDICOADO_NUCLEOS',
      ).mecanicasEspeciais,
    ).toEqual({ pvPorNivel: 2 });
    expect(
      findHabilidade(
        'Corpo Amaldiçoado Independente',
        'SUP_CORPO_AMALDICOADO_ESTABILIDADE',
      ).mecanicasEspeciais,
    ).toEqual({ pvExtra: 30 });
  });

  it('mantém caminhos e mecânicas estruturais do Receptáculo', () => {
    expect(
      findTrilha('Receptáculo').caminhos?.map((caminho) => caminho.nome),
    ).toEqual(['Supressão', 'Convergência']);
    expect(
      findHabilidade('Receptáculo', 'SUP_RECEPTACULO_DESTINO')
        .mecanicasEspeciais,
    ).toEqual({ periciasBonus: { INTIMIDACAO: 5, DIPLOMACIA: -5 } });
    expect(
      findHabilidade('Receptáculo', 'SUP_RECEPTACULO_CONVERGENCIA_20')
        .mecanicasEspeciais,
    ).toEqual({ resistencias: { ENERGIA_AMALDICOADA: 5 } });
  });
});
