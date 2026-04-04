// prisma/seeds/catalogos/clas.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedCla } from '../_types';
import { TipoFonte } from '@prisma/client'; // ✅ NOVO

export const clasSeed: SeedCla[] = [
  {
    nome: 'Gojo',
    descricao:
      'Um dos três grandes clãs, conhecido pela técnica hereditária Infinito e pela possibilidade da idiossincrasia dos Seis Olhos, considerado a linhagem com feiticeiros mais poderosos da era moderna.',
    grandeCla: true,
  },
  {
    nome: 'Zenin',
    descricao:
      'Um dos três grandes clãs, tradicional e conservador, famoso por técnicas de combate corpo a corpo e controle de sombras, rival em poder do Clã Gojo.',
    grandeCla: true,
  },
  {
    nome: 'Kamo',
    descricao:
      'Um dos três grandes clãs, mestres da manipulação de sangue e de maldições ligadas a desastres naturais.',
    grandeCla: true,
  },
  {
    nome: 'Okkotsu',
    descricao:
      'Descendentes de Sugawara no Michizane, com reservas excepcionais de energia amaldiçoada e grande afinidade com técnicas especiais.',
    grandeCla: false,
  },
  {
    nome: 'Inumaki',
    descricao:
      'Família de usuários da Fala Amaldiçoada, técnica hereditária que transforma palavras em comandos carregados de energia amaldiçoada.',
    grandeCla: false,
  },
  {
    nome: 'Kugisaki',
    descricao:
      'Família conhecida pela técnica da Boneca de Palha, que usa pregos, martelos e talismãs para amaldiçoar e perfurar à distância.',
    grandeCla: false,
  },
  {
    nome: 'Suguru',
    descricao:
      'Linhagem associada à manipulação e controle de espíritos amaldiçoados, ligada a usuários que dialogam com maldições em grande escala.',
    grandeCla: false,
  },
  {
    nome: 'Kasumi',
    descricao:
      'Família de espadachins tradicionais que une esgrima precisa e energia amaldiçoada, focando em cortes rápidos e técnicas de duelo.',
    grandeCla: false,
  },
  {
    nome: 'Fujiwara',
    descricao:
      'Antiga família nobre com técnicas voltadas a fenômenos atmosféricos e celestes, como ventos, nuvens e trovões.',
    grandeCla: false,
  },
  {
    nome: 'Ijichi',
    descricao:
      'Família de suporte especializada em táticas auxiliares, coordenação de campo e uso de barreiras e cortinas para logística de combate.',
    grandeCla: false,
  },
  {
    nome: 'Hasaba',
    descricao:
      'Clã menor especializado em camuflagem e ocultação de energia amaldiçoada, ideal para infiltração e suporte discreto.',
    grandeCla: false,
  },
  {
    nome: 'Kinji',
    descricao:
      'Família conectada a técnicas baseadas em probabilidade, sorte e jogos de azar, distorcendo chances e resultados em combate.',
    grandeCla: false,
  },
  {
    nome: 'Ryomen',
    descricao:
      'Linhagem lendária associada ao Rei das Maldições, ligada a técnicas extremas de destruição com fogo, cortes e rituais de sacrifício.',
    grandeCla: false,
  },
  {
    nome: 'Kento',
    descricao:
      'Família de feiticeiros metódicos, focados em análise de pontos fracos, cálculo de dano e combate preciso e eficiente.',
    grandeCla: false,
  },
  {
    nome: 'Ram',
    descricao:
      'Descendentes de um espírito amaldiçoado conhecido do país de Kakyn. A família real :).',
    grandeCla: true,
  },
  {
    nome: 'Haganezuka',
    descricao:
      'Mestres ferreiros que canalizam energia amaldiçoada na forja, criando armas amaldiçoadas únicas através de sua técnica hereditária.',
    grandeCla: false,
  },
  {
    nome: 'Itadori',
    descricao:
      'Família com resistência física fora do comum e conexão com técnicas que alteram gravidade e domínio corporal.',
    grandeCla: false,
  },
  {
    nome: 'Sem Clã',
    descricao:
      'Feiticeiros sem linhagem familiar conhecida ou sem vínculo formal a um clã jujutsu, que acessam apenas técnicas não hereditárias.',
    grandeCla: false,
  },
];

export async function seedClas(prisma: PrismaClient) {
  console.log('📌 Cadastrando clãs...');
  
  for (const data of clasSeed) {
    await prisma.cla.upsert({
      where: { nome: data.nome },
      update: {
        descricao: data.descricao,
        grandeCla: data.grandeCla,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  
  console.log(`✅ ${clasSeed.length} clãs cadastrados!\n`);
}
