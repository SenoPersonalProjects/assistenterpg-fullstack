// prisma/seed/tecnicas/tecnicas-inatas.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedTecnicaInata } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

export const tecnicasInatasSeed: SeedTecnicaInata[] = [
  // ========================================
  // ✅ TÉCNICAS HEREDITÁRIAS
  // ========================================
  {
    codigo: 'CHAMAS_DESASTRE',
    nome: 'Chamas do Desastre',
    descricao: 'Permite criar e controlar chamas intensas.',
    hereditaria: true,
    clasHereditarios: ['Ryomen'],
  },
  {
    codigo: 'COPIAR',
    nome: 'Copiar',
    descricao: 'Permite copiar técnicas de outros feiticeiros.',
    hereditaria: true,
    clasHereditarios: ['Okkotsu', 'Gojo'],
  },
  {
    codigo: 'DEZ_SOMBRAS',
    nome: 'Dez Sombras',
    descricao: 'Invoca shikigami das sombras.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'FABRICACAO_AMALDICOADA',
    nome: 'Fabricação Amaldiçoada',
    descricao: 'Cria ferramentas amaldiçoadas.',
    hereditaria: true,
    clasHereditarios: ['Haganezuka'],
  },
  {
    codigo: 'FALA_AMALDICOADA',
    nome: 'Fala Amaldiçoada',
    descricao: 'Comandos verbais que afetam a realidade.',
    hereditaria: true,
    clasHereditarios: ['Inumaki'],
  },
  {
    codigo: 'FURIA_AGNI',
    nome: 'Fúria de Agni',
    descricao: 'Controle sobre chamas divinas.',
    hereditaria: true,
    clasHereditarios: ['Ram'],
  },
  {
    codigo: 'GRAVIDADE_ZERO',
    nome: 'Gravidade Zero',
    descricao: 'Manipula a gravidade ao redor.',
    hereditaria: true,
    clasHereditarios: ['Itadori'],
  },
  {
    codigo: 'INFINITO',
    nome: 'Infinito',
    descricao: 'Manipulação do espaço através do conceito de infinito.',
    hereditaria: true,
    clasHereditarios: ['Gojo', 'Okkotsu'],
  },
  {
    codigo: 'MANIPULACAO_SANGUE',
    nome: 'Manipulação de Sangue',
    descricao: 'Controle total sobre o próprio sangue e sangue alheio.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'MANIPULACAO_CEU',
    nome: 'Manipulação do Céu',
    descricao: 'Controle sobre fenômenos celestiais.',
    hereditaria: true,
    clasHereditarios: ['Fujiwara'],
  },
  {
    codigo: 'OCEANO_DESASTROSO',
    nome: 'Oceano Desastroso',
    descricao: 'Cria e controla massas de água destrutivas.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'PLANTAS_DESASTRE',
    nome: 'Plantas do Desastre',
    descricao: 'Controle sobre plantas amaldiçoadas.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'SANTUARIO',
    nome: 'Santuário',
    descricao: 'Expansão de Domínio destrutiva.',
    hereditaria: true,
    clasHereditarios: ['Ryomen', 'Itadori'],
  },
  {
    codigo: 'BONECA_PALHA',
    nome: 'Técnica da Boneca de Palha',
    descricao: 'Transfere dano através de bonecos de palha.',
    hereditaria: true,
    clasHereditarios: ['Kugisaki'],
  },
  {
    codigo: 'PROJECAO',
    nome: 'Técnica de Projeção',
    descricao: 'Manipula o movimento através de projeções.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'TRANSFIGURACAO_OCIOSA',
    nome: 'Transfiguração Ociosa',
    descricao: 'Altera a forma da alma e corpo.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },

  // ========================================
  // ✅ TÉCNICAS NÃO HEREDITÁRIAS
  // ========================================
  {
    codigo: 'AMPLIFICACAO_SOM',
    nome: 'Amplificação Sonora',
    descricao: 'Usa o corpo do usuário como um dispositivo de amplificação de som, amplificando as melodias que ele toca com algum instrumento e lançando-as em ondas de energia amaldiçoada.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ARMAMENTO_DIVINO',
    nome: 'Armamento Divino',
    descricao: 'Cria armas de energia divina.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'CARNE_EXPLOSIVA',
    nome: 'Carne Explosiva',
    descricao: 'Transforma partes do corpo em explosivos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'DADIVA_LAVOISIER',
    nome: 'Dádiva de Lavoisier',
    descricao: 'Manipulação de matéria através de reações químicas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'DESCARGA_EA',
    nome: 'Descarga de Energia Amaldiçoada',
    descricao: 'Libera rajadas de energia amaldiçoada.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENCANTAMENTO_INVERSO',
    nome: 'Encantamento do Inverso',
    descricao: 'Inverte propriedades de técnicas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'EA_ELETRIFICADA',
    nome: 'Energia Amaldiçoada Eletrificada',
    descricao: 'Energia amaldiçoada com propriedades elétricas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENVENENAMENTO',
    nome: 'Envenenamento',
    descricao: 'Cria e controla venenos amaldiçoados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FORMACAO_GELO',
    nome: 'Formação de Gelo',
    descricao: 'Cria e manipula gelo.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FURIA_ESTELAR',
    nome: 'Fúria Estelar',
    descricao: 'Energia cósmica destrutiva.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'IMORTALIDADE',
    nome: 'Imortalidade',
    descricao: 'Regeneração e ressurreição.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_FANTOCHES',
    nome: 'Manipulação de Fantoches',
    descricao: 'Controla fantoches amaldiçoados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_IMAGENS',
    nome: 'Manipulação de Imagens',
    descricao: 'Afeta a realidade através de imagens e representadas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_MALDICAO',
    nome: 'Manipulação de Maldição',
    descricao: 'Controle direto sobre maldições.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_TERRA',
    nome: 'Manipulação de Terra',
    descricao: 'Controle sobre terra e rochas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MILAGRES',
    nome: 'Milagres',
    descricao: 'Efeitos miraculosos imprevisíveis.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'NULIFICACAO_ESCADA_JACO',
    nome: 'Nulificação: Escada de Jacó',
    descricao: 'Anula técnicas inimigas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'OLHAR_PARALISANTE',
    nome: 'Olhar Paralisante',
    descricao: 'Paralisa alvos através do olhar.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ORQUIDEA_SARKICA',
    nome: 'Orquídea Sárkica',
    descricao: 'Manipulação de carne e ossos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'PUNHOS_MISSEIS',
    nome: 'Punhos de Mísseis',
    descricao: 'Ataques perfurantes explosivos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SEM_TECNICA',
    nome: 'Sem Técnica Amaldiçoada',
    descricao: 'Não possui técnica amaldiçoada inata.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SETE_CAMINHOS_MUNDANOS',
    nome: 'Sete Caminhos Mundanos',
    descricao: 'Sete modos de combate diferentes.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SURTO_TEMPORAL',
    nome: 'Surto Temporal',
    descricao: 'Manipulação limitada do tempo.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'NEVOA_LILAS',
    nome: 'Técnica da Névoa Lilás',
    descricao: 'Névoa que causa confusão e dano.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'CLONAGEM',
    nome: 'Técnica de Clonagem',
    descricao: 'Cria clones temporários.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'RAZAO_7_3',
    nome: 'Técnica de Razão 7:3',
    descricao: 'Ataques que acertam pontos fracos críticos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'APOSTADOR_NATO',
    nome: 'Técnica do Apostador Nato',
    descricao: 'Habilidades baseadas em sorte e apostas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRANSFERENCIA_ESPACIAL',
    nome: 'Transferência Espacial',
    descricao: 'Teletransporte de curta distância.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRIBUNAL_JULGAMENTO',
    nome: 'Tribunal de Julgamento',
    descricao: 'Julga e pune alvos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'BOOGIE_WOOGIE',
    nome: 'Troca: Boogie Woogie',
    descricao: 'Troca posições de dois alvos.',
    hereditaria: false,
    clasHereditarios: [],
  },
];

export async function seedTecnicasInatas(prisma: PrismaClient) {
  console.log('🔥 Cadastrando técnicas amaldiçoadas inatas...');

  const get = createLookupCache(prisma);

  for (const tec of tecnicasInatasSeed) {
    // 1) Cria/atualiza a técnica
    const tecnica = await prisma.tecnicaAmaldicoada.upsert({
      where: { codigo: tec.codigo },
      update: {
        nome: tec.nome,
        descricao: tec.descricao ?? 'Técnica Amaldiçoada Inata',
        tipo: 'INATA',
        hereditaria: tec.hereditaria,
        linkExterno: tec.linkExterno ?? null,
        requisitos: jsonOrNull(tec.requisitos ?? null),
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        codigo: tec.codigo,
        nome: tec.nome,
        descricao: tec.descricao ?? 'Técnica Amaldiçoada Inata',
        tipo: 'INATA',
        hereditaria: tec.hereditaria,
        linkExterno: tec.linkExterno ?? null,
        requisitos: jsonOrNull(tec.requisitos ?? null),
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      select: { id: true, hereditaria: true, nome: true },
    });

    console.log(
      `  ✅ ${tecnica.nome} (${tec.hereditaria ? 'Hereditária' : 'Não Hereditária'})`,
    );

    // 2) Vínculo com clãs (somente se for hereditária)
    if (!tecnica.hereditaria || tec.clasHereditarios.length === 0) continue;

    for (const claNome of tec.clasHereditarios) {
      const claId = await get.claId(claNome);

      await prisma.tecnicaCla.upsert({
        where: {
          tecnicaId_claId: { tecnicaId: tecnica.id, claId },
        },
        update: {},
        create: { tecnicaId: tecnica.id, claId },
      });

      console.log(`    🔗 Vinculada ao clã: ${claNome}`);
    }
  }

  console.log(`✅ ${tecnicasInatasSeed.length} técnicas inatas cadastradas!\n`);
}
