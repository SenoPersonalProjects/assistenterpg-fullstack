import type { WorldLocation } from './world.types';

export const WORLD_LOCATIONS: WorldLocation[] = [
  {
    id: 'escola-tecnica-tokyo',
    kind: 'location',
    tipo: 'ESCOLA',
    nome: 'Escola Técnica Jujutsu de Tokyo',
    lat: 35.6895,
    lng: 139.6917,
    resumo: 'Arquivo central de formação, missão e contenção de incidentes.',
    descricaoCurta:
      'A unidade de Tokyo concentra estudantes, instrutores e operações de resposta rápida contra ameaças amaldiçoadas no leste do Japão.',
    tags: ['escola', 'operações', 'tokyo'],
    status: 'ATIVA',
    nivelDeSigilo: 'RESTRITO',
  },
  {
    id: 'escola-tecnica-kyoto',
    kind: 'location',
    tipo: 'ESCOLA',
    nome: 'Escola Técnica Jujutsu de Kyoto',
    lat: 35.0116,
    lng: 135.7681,
    resumo: 'Polo tradicional de treinamento e custódia de registros antigos.',
    descricaoCurta:
      'A unidade de Kyoto preserva linhagens, técnicas e protocolos antigos, servindo como contraponto político e acadêmico a Tokyo.',
    tags: ['escola', 'tradição', 'kyoto'],
    status: 'ATIVA',
    nivelDeSigilo: 'RESTRITO',
  },
  {
    id: 'cidadela',
    kind: 'location',
    tipo: 'ORGANIZACAO',
    nome: 'A Cidadela',
    lat: 34.6937,
    lng: 135.5023,
    resumo: 'Centro fortificado de arquivo, tribunal e logística jujutsu.',
    descricaoCurta:
      'A Cidadela funciona como um nó político de alta segurança, onde arquivos sensíveis, acordos e ordens de campo são preservados.',
    tags: ['organização', 'arquivo', 'alto conselho'],
    status: 'RESTRITA',
    nivelDeSigilo: 'CONFIDENCIAL',
  },
  {
    id: 'imperio-kakyn',
    kind: 'location',
    tipo: 'REGIAO_OCULTA',
    nome: 'Império de Kakyn',
    lat: 31.4,
    lng: 128.7,
    resumo: 'Região sobrenatural oculta, sem equivalência geográfica comum.',
    descricaoCurta:
      'Kakyn é tratado como um território fictício do cenário, projetado temporariamente no atlas como uma sombra política fora do mapa comum.',
    tags: ['kakyn', 'região oculta', 'sobrenatural'],
    status: 'OCULTA',
    nivelDeSigilo: 'OCULTO',
    ficticio: true,
    notaCartografica:
      'Coordenada temporária de projeção narrativa; não representa geografia real.',
  },
];
