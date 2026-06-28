import type { WorldBarrier } from './world.types';

export const WORLD_BARRIERS: WorldBarrier[] = [
  {
    id: 'barreira-palacio-imperial',
    kind: 'BARREIRA',
    parentId: 'japao',
    barrierType: 'BARREIRA_PURA',
    nome: 'Barreira Pura do Palácio Imperial',
    lat: 35.6852,
    lng: 139.7528,
    resumo: 'Selo puro ligado ao eixo político e espiritual de Tokyo.',
    descricaoCurta:
      'Uma barreira de referência para protocolos de observação, cerimônia e ocultação de movimentos de alto nível.',
    tags: ['barreira pura', 'tokyo', 'política'],
    status: 'ATIVA',
    nivelDeSigilo: 'CONFIDENCIAL',
    subtipo: 'Barreira pura',
    displayPriority: 30,
    raioKmAproximado: 6,
    notaCartografica:
      'A área exibida no globo é uma projeção aproximada do campo ritual.',
  },
  {
    id: 'barreira-tumbas-estrela',
    kind: 'BARREIRA',
    parentId: 'japao',
    barrierType: 'BARREIRA_PURA',
    nome: 'Barreira Pura das Tumbas da Estrela',
    lat: 35.6586,
    lng: 139.7454,
    resumo: 'Camada ritual vinculada a registros e sepulturas sob proteção.',
    descricaoCurta:
      'A localização é mantida em classificação alta; no atlas, o ponto representa apenas uma projeção operacional aproximada.',
    tags: ['barreira pura', 'ritual', 'arquivo selado'],
    status: 'RESTRITA',
    nivelDeSigilo: 'OCULTO',
    subtipo: 'Barreira pura',
    displayPriority: 31,
    raioKmAproximado: 4,
    notaCartografica:
      'A área exibida no globo é uma projeção aproximada do campo ritual.',
  },
  {
    id: 'barreira-mausoleu-yamakuni',
    kind: 'BARREIRA',
    parentId: 'japao',
    barrierType: 'BARREIRA_PURA',
    nome: 'Barreira Pura do Mausoléu Yamakuni',
    lat: 35.1802,
    lng: 136.9066,
    resumo: 'Selo memorial usado para conter ecos de energia antiga.',
    descricaoCurta:
      'O Mausoléu Yamakuni é registrado como uma zona de contenção discreta, preservada por pactos e vigilância especializada.',
    tags: ['barreira pura', 'mausoléu', 'contenção'],
    status: 'ATIVA',
    nivelDeSigilo: 'CONFIDENCIAL',
    subtipo: 'Barreira pura',
    displayPriority: 32,
    raioKmAproximado: 3,
    notaCartografica:
      'A área exibida no globo é uma projeção aproximada do campo ritual.',
  },
  {
    id: 'barreira-hida',
    kind: 'BARREIRA',
    parentId: 'japao',
    barrierType: 'GRANDE_BARREIRA',
    nome: 'Grande Barreira da Montanha Sagrada de Hida',
    lat: 36.1428,
    lng: 137.2524,
    resumo: 'Fenômeno defensivo de larga escala sobre uma zona montanhosa.',
    descricaoCurta:
      'A barreira de Hida é descrita como uma muralha ritual extensa, usada para isolar anomalias e rotas espirituais instáveis.',
    tags: ['grande barreira', 'hida', 'montanha sagrada'],
    status: 'INSTAVEL',
    nivelDeSigilo: 'OCULTO',
    subtipo: 'Grande barreira',
    displayPriority: 33,
    raioKmAproximado: 18,
    notaCartografica:
      'O anel de Hida está ampliado para leitura tática; a projeção não é uma medição geodésica exata.',
  },
];
