// prisma/seeds/relacoes/habilidades-origem-vinculos.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidadeOrigemVinculo } from '../_types';
import { createLookupCache } from '../_helpers';

export const habilidadesOrigemVinculosSeed: SeedHabilidadeOrigemVinculo[] = [
  { origemNome: 'Mestre de Maldições', habilidadeNome: 'Vivência (Mestre de Maldições)' },
  { origemNome: 'Prodígio do Clã', habilidadeNome: 'Queridinho (Prodígio do Clã)' },
  { origemNome: 'Renegado', habilidadeNome: 'Ovelha-negra (Renegado)' },
  { origemNome: 'Acadêmico', habilidadeNome: 'Saber é Poder (Acadêmico)' },
  { origemNome: 'Agente de Saúde', habilidadeNome: 'Técnica Medicinal (Agente de Saúde)' },
  { origemNome: 'Artista', habilidadeNome: 'Magnum Opus (Artista)' },
  { origemNome: 'Atleta', habilidadeNome: '110% (Atleta)' },
  { origemNome: 'Chef', habilidadeNome: 'Ingrediente Secreto (Chef)' },
  { origemNome: 'Criminoso', habilidadeNome: 'O Crime Compensa (Criminoso)' },
  { origemNome: 'Cultista Arrependido', habilidadeNome: 'Traços do Outro Lado (Cultista Arrependido)' },
  { origemNome: 'Desgarrado', habilidadeNome: 'Calejado (Desgarrado)' },
  { origemNome: 'Engenheiro', habilidadeNome: 'Ferramentas Favoritas (Engenheiro)' },
  { origemNome: 'Executivo', habilidadeNome: 'Processo Otimizado (Executivo)' },
  { origemNome: 'Magnata', habilidadeNome: 'Patrocinador da Escola (Magnata)' },
  { origemNome: 'Mercenário', habilidadeNome: 'Posição de Combate (Mercenário)' },
  { origemNome: 'Militar', habilidadeNome: 'Para Bellum (Militar)' },
  { origemNome: 'Operário', habilidadeNome: 'Ferramenta de Trabalho (Operário)' },
  { origemNome: 'Policial', habilidadeNome: 'Patrulha (Policial)' },
  { origemNome: 'Religioso', habilidadeNome: 'Acalentar (Religioso)' },
  { origemNome: 'Servidor Público', habilidadeNome: 'Espírito Cívico (Servidor Público)' },
  { origemNome: 'Teórico da Conspiração', habilidadeNome: 'Eu Já Sabia (Teórico da Conspiração)' },
  { origemNome: 'T.I.', habilidadeNome: 'Motor de Busca (T.I.)' },
  { origemNome: 'Trabalhador Rural', habilidadeNome: 'Desbravador (Trabalhador Rural)' },
  { origemNome: 'Trambiqueiro', habilidadeNome: 'Impostor (Trambiqueiro)' },
  { origemNome: 'Universitário', habilidadeNome: 'Dedicação (Universitário)' },
  { origemNome: 'Vítima', habilidadeNome: 'Cicatrizes Psicológicas (Vítima)' },
];

export async function seedHabilidadesOrigemVinculos(prisma: PrismaClient) {
  console.log('Vinculando origem -> habilidades de origem...');

  const get = createLookupCache(prisma);

  for (const item of habilidadesOrigemVinculosSeed) {
    const origemId = await get.origemId(item.origemNome);
    const habilidadeId = await get.habilidadeId(item.habilidadeNome);

    await prisma.habilidadeOrigem.upsert({
      where: { origemId_habilidadeId: { origemId, habilidadeId } },
      update: {},
      create: { origemId, habilidadeId },
    });
  }
  
  console.log(`✅ Vínculos origem->habilidades cadastrados!\n`);
}
