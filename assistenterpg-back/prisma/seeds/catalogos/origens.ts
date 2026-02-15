// prisma/seeds/catalogos/origens.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedOrigem } from '../_types';

export const origensSeed: SeedOrigem[] = [
  {
    nome: 'Mestre de Maldições',
    descricao:
      'Ex-mestre de maldições que cometia terrorismo ou outros crimes contra a sociedade Jujutsu, mas abandonou essa vida.',
  },
  {
    nome: 'Prodígio do Clã',
    descricao:
      'Herda talento e status desde o nascimento em um dos três grandes clãs, respeitado dentro e fora da família.',
    requerGrandeCla: true,
    requerTecnicaHeriditaria: true,
    bloqueiaTecnicaHeriditaria: false,
  },
  {
    nome: 'Renegado',
    descricao:
      'Membro de grande clã que rejeitou as tradições injustas da própria família e rompeu com o clã.',
    requerGrandeCla: true,
    requerTecnicaHeriditaria: false,
    bloqueiaTecnicaHeriditaria: true,
  },
  {
    nome: 'Acadêmico',
    descricao:
      'Pesquisador ou professor universitário cujos estudos tocaram em assuntos misteriosos ligados a maldições.',
  },
  {
    nome: 'Agente de Saúde',
    descricao:
      'Profissional da saúde treinado em atendimento e cuidado de pessoas, agora lidando também com maldições.',
  },
  {
    nome: 'Artista',
    descricao:
      'Ator, músico, escritor, dançarino ou influenciador cuja arte foi marcada por experiências com maldições.',
  },
  {
    nome: 'Atleta',
    descricao: 'Competidor de esporte individual ou em equipe, com desempenho acima da média.',
  },
  {
    nome: 'Chef',
    descricao:
      'Cozinheiro amador ou profissional com talento culinário excepcional, capaz de apoiar aliados através da comida.',
  },
  {
    nome: 'Criminoso',
    descricao: 'Vivendo fora da lei até ser recrutado pela Escola Técnica Jujutsu.',
  },
  {
    nome: 'Cultista Arrependido',
    descricao:
      'Ex-membro de culto ligado a maldições que agora luta ao lado da sociedade Jujutsu.',
  },
  {
    nome: 'Desgarrado',
    descricao:
      'Pessoa que vivia à margem das normas sociais, endurecida por uma vida sem confortos.',
  },
  {
    nome: 'Engenheiro',
    descricao:
      'Engenheiro profissional ou inventor de garagem que aplica conhecimento técnico em situações com maldições.',
  },
  {
    nome: 'Executivo',
    descricao:
      'Trabalhador de escritório que descobriu algo amaldiçoado em meio a relatórios e processos.',
  },
  {
    nome: 'Magnata',
    descricao:
      'Indivíduo com muito dinheiro ou patrimônio, herdeiro ou sortudo, que financia operações ligadas à Escola Técnica.',
  },
  {
    nome: 'Mercenário',
    descricao: 'Soldado de aluguel acostumado a missões pagas de escolta, ataque e proteção.',
  },
  {
    nome: 'Militar',
    descricao: 'Veterano de força militar formal, perito no uso de armas de fogo.',
  },
  {
    nome: 'Operário',
    descricao:
      'Trabalhador braçal que desenvolveu força, resistência e visão pragmática do mundo.',
  },
  {
    nome: 'Policial',
    descricao: 'Membro de força de segurança que se deparou com maldições em serviço.',
  },
  {
    nome: 'Religioso',
    descricao:
      'Devoto ou sacerdote dedicado a auxiliar pessoas com problemas espirituais e influências amaldiçoadas.',
  },
  {
    nome: 'Servidor Público',
    descricao:
      'Funcionário de órgão governamental que descobriu corrupção envolvendo maldições.',
  },
  {
    nome: 'Teórico da Conspiração',
    descricao:
      'Investigador de teorias da conspiração que acabou esbarrando em maldições reais.',
  },
  {
    nome: 'T.I.',
    descricao:
      'Profissional de tecnologia, programador ou engenheiro de software especializado em sistemas informatizados.',
  },
  {
    nome: 'Trabalhador Rural',
    descricao:
      'Pessoa acostumada ao campo, natureza e animais, vinda de áreas isoladas.',
  },
  {
    nome: 'Trambiqueiro',
    descricao:
      'Vivia de golpes, jogatina ilegal e falcatruas antes de entrar em contato com o mundo Jujutsu.',
  },
  {
    nome: 'Universitário',
    descricao:
      'Aluno de faculdade que encontrou algo amaldiçoado em pesquisas ou na biblioteca do campus.',
  },
  {
    nome: 'Vítima',
    descricao:
      'Sobrevivente de encontro traumático com maldições que decidiu reagir em vez de fugir.',
  },
];

export async function seedOrigens(prisma: PrismaClient) {
  console.log('Cadastrando origens...');
  
  for (const data of origensSeed) {
    await prisma.origem.upsert({
      where: { nome: data.nome },
      update: {
        descricao: data.descricao,
        requerGrandeCla: data.requerGrandeCla ?? false,
        requerTecnicaHeriditaria: data.requerTecnicaHeriditaria ?? false,
        bloqueiaTecnicaHeriditaria: data.bloqueiaTecnicaHeriditaria ?? false,
        requisitosTexto: data.requisitosTexto ?? null,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome: data.nome,
        descricao: data.descricao,
        requerGrandeCla: data.requerGrandeCla ?? false,
        requerTecnicaHeriditaria: data.requerTecnicaHeriditaria ?? false,
        bloqueiaTecnicaHeriditaria: data.bloqueiaTecnicaHeriditaria ?? false,
        requisitosTexto: data.requisitosTexto ?? null,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  
  console.log(`✅ ${origensSeed.length} origens cadastradas!\n`);
}
