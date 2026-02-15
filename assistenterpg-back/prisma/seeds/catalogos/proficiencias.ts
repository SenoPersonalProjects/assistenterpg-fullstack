import type { PrismaClient } from '@prisma/client';
import type { SeedProficiencia } from '../_types';

export const proficienciasSeed: SeedProficiencia[] = [
  {
    codigo: 'ARMAS_SIMPLES',
    nome: 'Armas simples',
    tipo: 'ARMA',
    categoria: 'SIMPLES',
    subtipo: null,
    descricao:
      'Armas de fácil manejo, como facas, bastões e revólveres; todos os personagens sabem usar sem penalidade.',
  },
  {
    codigo: 'ARMAS_TATICAS',
    nome: 'Armas táticas',
    tipo: 'ARMA',
    categoria: 'TATICA',
    subtipo: null,
    descricao:
      'Espadas, fuzis e armas mais complexas; apenas Combatentes e Sentinelas começam proficientes.',
  },
  {
    codigo: 'ARMAS_PESADAS',
    nome: 'Armas pesadas',
    tipo: 'ARMA',
    categoria: 'PESADA',
    subtipo: null,
    descricao:
      'Metralhadoras, lança-chamas e outras armas de alto impacto; nenhuma classe inicia proficiente.',
  },

  // Subproficiencias (para poderes parciais)
  {
    codigo: 'ARMAS_TATICAS_CORPO_A_CORPO',
    nome: 'Armas táticas corpo a corpo',
    tipo: 'ARMA',
    categoria: 'TATICA',
    subtipo: 'CORPO_A_CORPO',
    descricao:
      'Versão limitada de armas táticas, válida apenas para armas de combate corpo a corpo.',
  },
  {
    codigo: 'ARMAS_TATICAS_DISPARO',
    nome: 'Armas táticas de disparo',
    tipo: 'ARMA',
    categoria: 'TATICA',
    subtipo: 'DISPARO',
    descricao:
      'Versão limitada de armas táticas, válida apenas para armas de disparo.',
  },
  {
    codigo: 'ARMAS_TATICAS_FOGO',
    nome: 'Armas táticas de fogo',
    tipo: 'ARMA',
    categoria: 'TATICA',
    subtipo: 'FOGO',
    descricao:
      'Subconjunto de armas táticas, válido apenas para armas de fogo táticas (fuzis, submetralhadoras, rifles de precisão etc.).',
  },

  // Proteções
  {
    codigo: 'PROTECOES_LEVES',
    nome: 'Proteções leves',
    tipo: 'PROTECAO',
    categoria: 'LEVE',
    subtipo: null,
    descricao:
      'Jaquetas de couro pesadas ou coletes leves de kevlar, usados por seguranças e policiais.',
  },
  {
    codigo: 'PROTECOES_PESADAS',
    nome: 'Proteções pesadas',
    tipo: 'PROTECAO',
    categoria: 'PESADA',
    subtipo: null,
    descricao:
      'Equipamentos completos de forças especiais e exército (capacete, ombreiras, joelheiras e colete reforçado).',
  },
  {
    codigo: 'PROTECOES_PESADAS_ESCUDO',
    nome: 'Escudos pesados',
    tipo: 'PROTECAO',
    categoria: 'PESADA',
    subtipo: 'ESCUDO',
    descricao:
      'Subconjunto de proteções pesadas voltado a escudos modernos ou medievais usados por tropas de choque.',
  },

  // Ferramentas amaldiçoadas
  {
    codigo: 'FERRAMENTAS_AMALDICOADAS',
    nome: 'Ferramentas amaldiçoadas',
    tipo: 'FERRAMENTA',
    categoria: 'AMALDICOADA',
    subtipo: null,
    descricao:
      'Proficência específica para armas, proteções ou artefatos com maldições complexas.',
  },
];

export async function seedProficiencias(prisma: PrismaClient) {
  console.log('Cadastrando proficiências...');
  for (const data of proficienciasSeed) {
    await prisma.proficiencia.upsert({
      where: { codigo: data.codigo },
      update: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        tipo: data.tipo,
        categoria: data.categoria,
        subtipo: data.subtipo ?? null,
      },
      create: {
        ...data,
        descricao: data.descricao ?? null,
        subtipo: data.subtipo ?? null,
      },
    });
  }
}
