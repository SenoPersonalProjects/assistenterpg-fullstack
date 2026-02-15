// prisma/seeds/relacoes/trilhas.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedTrilha } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

export const trilhasSeed: SeedTrilha[] = [
  { classeNome: 'Combatente', nome: 'Aniquilador', descricao: 'Combatente focado em armas de curto alcance.' },
  { classeNome: 'Combatente', nome: 'Guerreiro', descricao: 'Corpo como arma principal.' },
  { classeNome: 'Combatente', nome: 'Operações Especiais', descricao: 'Mobilidade, ações extras e iniciativa.' },
  { classeNome: 'Combatente', nome: 'Tropa de Choque', descricao: 'Tanque e protetor da equipe.' },
  { classeNome: 'Combatente', nome: 'Arma Maldita', descricao: 'Combate integrado a Jujutsu em armas.' },

  { classeNome: 'Sentinela', nome: 'Brigadeiro', descricao: 'Atirador de médio alcance.' },
  { classeNome: 'Sentinela', nome: 'Atirador de Elite', descricao: 'Sniper e dano longa distância.' },
  { classeNome: 'Sentinela', nome: 'Conduíte', descricao: 'Canalizador e manipulador de feitiços.' },
  { classeNome: 'Sentinela', nome: 'Comandante de Campo', descricao: 'Buffs táticos e coordenação.' },
  { classeNome: 'Sentinela', nome: 'Especialista em Shikigami', descricao: 'Focado em Shikigamis.' },

  { classeNome: 'Especialista', nome: 'Infiltrador', descricao: 'Furtividade e assassinato preciso.' },
  { classeNome: 'Especialista', nome: 'Médico de Campo', descricao: 'Suporte médico e cura.' },
  { classeNome: 'Especialista', nome: 'Técnico', descricao: 'Tecnologia e itens.' },
  { classeNome: 'Especialista', nome: 'Graduado', descricao: 'Feiticeiro focado em feitiços.' },
  { classeNome: 'Especialista', nome: 'Flagelador', descricao: 'Usa dor e sentimentos negativos.' },
  { classeNome: 'Especialista', nome: 'Mestre de Barreiras', descricao: 'Barreiras e anti-domínio.' },
];

export async function seedTrilhas(prisma: PrismaClient) {
  console.log('Cadastrando trilhas...');

  const get = createLookupCache(prisma);

  for (const data of trilhasSeed) {
    const classeId = await get.classeId(data.classeNome);

    await prisma.trilha.upsert({
      where: { nome: data.nome },
      update: {
        descricao: data.descricao ?? null,
        classeId,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        classeId,
        requisitos: jsonOrNull(null),
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  
  console.log(`✅ ${trilhasSeed.length} trilhas cadastradas!\n`);
}
