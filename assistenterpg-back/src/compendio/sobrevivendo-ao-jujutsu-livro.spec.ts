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
    throw new Error(`Trilha nao encontrada no seed: ${nome}`);
  }
  return trilha;
}

function findHabilidade(trilhaNome: string, codigo: string) {
  const habilidade = findTrilha(trilhaNome).habilidades.find(
    (item) => item.codigo === codigo,
  );
  if (!habilidade) {
    throw new Error(`Habilidade nao encontrada no seed: ${codigo}`);
  }
  return habilidade;
}

describe('buildSobrevivendoAoJujutsuLivro', () => {
  it('gera o livro publico do suplemento sem placeholders', () => {
    const livro = buildSobrevivendoAoJujutsuLivro();
    const artigos = getAllArticles();

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
    expect(artigos.map((artigo) => artigo.conteudo).join('\n')).not.toContain(
      'O texto completo sera preenchido',
    );
  });

  it('inclui os textos integrais das tres trilhas novas no compendio', () => {
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
    expect(corpo?.conteudo).toContain('Nucleo do Equilibrio');
    expect(corpo?.conteudo).toContain('Ainda Bem que Eu Nao Sou Humano');
    expect(receptaculo?.conteudo).toContain('Livrando-se da entidade');
    expect(receptaculo?.conteudo).toContain('Manifestacao Completa');
    expect(receptaculo?.conteudo).toContain('Favor');
    expect(amaldicoado?.conteudo).toContain('Maldicao Vinculada');
    expect(amaldicoado?.conteudo).toContain('Enigma Amaldicoado');
    expect(amaldicoado?.conteudo).toContain('Espirito Amaldicoado Manifesto');
  });

  it('mantem os artigos gerados dentro do limite do campo Text', () => {
    for (const artigo of getAllArticles()) {
      expect(Buffer.byteLength(artigo.conteudo, 'utf8')).toBeLessThanOrEqual(
        MAX_ARTICLE_BYTES,
      );
    }
  });
});

describe('trilhas novas de Sobrevivendo ao Jujutsu', () => {
  it('mantem classes e requisito sem tecnica inata', () => {
    expect(findTrilha('Corpo Amaldicoado Independente')).toMatchObject({
      classe: 'Combatente',
      requisitos: { semTecnicaInata: true },
    });
    expect(findTrilha('Receptaculo')).toMatchObject({
      classe: 'Especialista',
      requisitos: { semTecnicaInata: true },
    });
    expect(findTrilha('Amaldicoado')).toMatchObject({
      classe: 'Sentinela',
      requisitos: { semTecnicaInata: true },
    });
  });

  it('mantem mecanicas estruturais do Corpo Amaldicoado Independente', () => {
    expect(
      findHabilidade(
        'Corpo Amaldicoado Independente',
        'SUP_CORPO_AMALDICOADO_BLEFE_MORTAL',
      ).mecanicasEspeciais,
    ).toEqual({ recursos: { pvBarrasTotal: 3 } });
    expect(
      findHabilidade(
        'Corpo Amaldicoado Independente',
        'SUP_CORPO_AMALDICOADO_NUCLEOS',
      ).mecanicasEspeciais,
    ).toEqual({ pvPorNivel: 2 });
    expect(
      findHabilidade(
        'Corpo Amaldicoado Independente',
        'SUP_CORPO_AMALDICOADO_ESTABILIDADE',
      ).mecanicasEspeciais,
    ).toEqual({ pvExtra: 30 });
  });

  it('mantem caminhos e mecanicas estruturais do Receptaculo', () => {
    expect(
      findTrilha('Receptaculo').caminhos?.map((caminho) => caminho.nome),
    ).toEqual(['Supressao', 'Convergencia']);
    expect(
      findHabilidade('Receptaculo', 'SUP_RECEPTACULO_DESTINO')
        .mecanicasEspeciais,
    ).toEqual({ periciasBonus: { INTIMIDACAO: 5, DIPLOMACIA: -5 } });
    expect(
      findHabilidade('Receptaculo', 'SUP_RECEPTACULO_CONVERGENCIA_20')
        .mecanicasEspeciais,
    ).toEqual({ resistencias: { ENERGIA_AMALDICOADA: 5 } });
  });
});
