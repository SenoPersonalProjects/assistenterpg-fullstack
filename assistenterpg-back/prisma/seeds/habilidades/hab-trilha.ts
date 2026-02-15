// prisma/seeds/habilidades/hab-trilha.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedHabilidadeTrilha } from '../_types';

export const habilidadesTrilhaSeed: SeedHabilidadeTrilha[] = [
  // Combatente - Aniquilador
  { trilhaNome: 'Aniquilador', caminhoNome: null, habilidadeNome: 'A Favorita (Aniquilador)', nivelConcedido: 2 },
  { trilhaNome: 'Aniquilador', caminhoNome: null, habilidadeNome: 'Técnica Secreta (Aniquilador)', nivelConcedido: 8 },
  { trilhaNome: 'Aniquilador', caminhoNome: null, habilidadeNome: 'Técnica Sublime (Aniquilador)', nivelConcedido: 13 },
  { trilhaNome: 'Aniquilador', caminhoNome: null, habilidadeNome: 'Máquina de Matar (Aniquilador)', nivelConcedido: 20 },

  // Combatente - Guerreiro
  { trilhaNome: 'Guerreiro', caminhoNome: null, habilidadeNome: 'Técnica Letal', nivelConcedido: 2 },
  { trilhaNome: 'Guerreiro', caminhoNome: null, habilidadeNome: 'Revidar', nivelConcedido: 8 },
  { trilhaNome: 'Guerreiro', caminhoNome: null, habilidadeNome: 'Força Opressora', nivelConcedido: 13 },
  { trilhaNome: 'Guerreiro', caminhoNome: null, habilidadeNome: 'Potência Máxima', nivelConcedido: 20 },

  // Combatente - Operações Especiais
  { trilhaNome: 'Operações Especiais', caminhoNome: null, habilidadeNome: 'Iniciativa Aprimorada', nivelConcedido: 2 },
  { trilhaNome: 'Operações Especiais', caminhoNome: null, habilidadeNome: 'Ataque Extra', nivelConcedido: 8 },
  { trilhaNome: 'Operações Especiais', caminhoNome: null, habilidadeNome: 'Surto de Adrenalina', nivelConcedido: 13 },
  { trilhaNome: 'Operações Especiais', caminhoNome: null, habilidadeNome: 'Sempre Alerta', nivelConcedido: 20 },

  // Combatente - Tropa de Choque
  { trilhaNome: 'Tropa de Choque', caminhoNome: null, habilidadeNome: 'Casca Grossa', nivelConcedido: 2 },
  { trilhaNome: 'Tropa de Choque', caminhoNome: null, habilidadeNome: 'Cai Dentro', nivelConcedido: 8 },
  { trilhaNome: 'Tropa de Choque', caminhoNome: null, habilidadeNome: 'Duro de Matar', nivelConcedido: 13 },
  { trilhaNome: 'Tropa de Choque', caminhoNome: null, habilidadeNome: 'Inquebrável', nivelConcedido: 20 },

  // Combatente - Arma Maldita
  { trilhaNome: 'Arma Maldita', caminhoNome: null, habilidadeNome: 'Arma Amaldiçoada', nivelConcedido: 2 },
  { trilhaNome: 'Arma Maldita', caminhoNome: null, habilidadeNome: 'Gladiador Amaldiçoado', nivelConcedido: 8 },
  { trilhaNome: 'Arma Maldita', caminhoNome: null, habilidadeNome: 'Conjuração Marcial', nivelConcedido: 13 },
  { trilhaNome: 'Arma Maldita', caminhoNome: null, habilidadeNome: 'Maldição Permanente', nivelConcedido: 20 },

  // Sentinela - Brigadeiro
  { trilhaNome: 'Brigadeiro', caminhoNome: null, habilidadeNome: 'A Favorita (Brigadeiro)', nivelConcedido: 2 },
  { trilhaNome: 'Brigadeiro', caminhoNome: null, habilidadeNome: 'Técnica Secreta (Brigadeiro)', nivelConcedido: 8 },
  { trilhaNome: 'Brigadeiro', caminhoNome: null, habilidadeNome: 'Técnica Sublime (Brigadeiro)', nivelConcedido: 13 },
  { trilhaNome: 'Brigadeiro', caminhoNome: null, habilidadeNome: 'Máquina de Matar (Brigadeiro)', nivelConcedido: 20 },

  // Sentinela - Atirador de Elite
  { trilhaNome: 'Atirador de Elite', caminhoNome: null, habilidadeNome: 'Mira de Elite', nivelConcedido: 2 },
  { trilhaNome: 'Atirador de Elite', caminhoNome: null, habilidadeNome: 'Disparo Letal', nivelConcedido: 8 },
  { trilhaNome: 'Atirador de Elite', caminhoNome: null, habilidadeNome: 'Disparo Impactante', nivelConcedido: 13 },
  { trilhaNome: 'Atirador de Elite', caminhoNome: null, habilidadeNome: 'Atirar para Matar', nivelConcedido: 20 },

  // Sentinela - Conduíte
  { trilhaNome: 'Conduíte', caminhoNome: null, habilidadeNome: 'Ampliar Feitiço', nivelConcedido: 2 },
  { trilhaNome: 'Conduíte', caminhoNome: null, habilidadeNome: 'Acelerar Feitiço', nivelConcedido: 8 },
  { trilhaNome: 'Conduíte', caminhoNome: null, habilidadeNome: 'Anular Feitiço', nivelConcedido: 13 },
  { trilhaNome: 'Conduíte', caminhoNome: null, habilidadeNome: 'Canalizar o Jujutsu', nivelConcedido: 20 },

  // Sentinela - Comandante de Campo
  { trilhaNome: 'Comandante de Campo', caminhoNome: null, habilidadeNome: 'Inspirar Confiança', nivelConcedido: 2 },
  { trilhaNome: 'Comandante de Campo', caminhoNome: null, habilidadeNome: 'Estrategista', nivelConcedido: 8 },
  { trilhaNome: 'Comandante de Campo', caminhoNome: null, habilidadeNome: 'Brecha na Guarda', nivelConcedido: 13 },
  { trilhaNome: 'Comandante de Campo', caminhoNome: null, habilidadeNome: 'Oficial Comandante', nivelConcedido: 20 },

  // Sentinela - Especialista em Shikigami
  { trilhaNome: 'Especialista em Shikigami', caminhoNome: null, habilidadeNome: 'Chamariz', nivelConcedido: 2 },
  { trilhaNome: 'Especialista em Shikigami', caminhoNome: null, habilidadeNome: 'O Melhor Amigo do Homem', nivelConcedido: 8 },
  { trilhaNome: 'Especialista em Shikigami', caminhoNome: null, habilidadeNome: 'Sinergia', nivelConcedido: 13 },
  { trilhaNome: 'Especialista em Shikigami', caminhoNome: null, habilidadeNome: 'Antes Ele do que Eu', nivelConcedido: 20 },

  // Especialista - Infiltrador
  { trilhaNome: 'Infiltrador', caminhoNome: null, habilidadeNome: 'Ataque Furtivo', nivelConcedido: 2 },
  { trilhaNome: 'Infiltrador', caminhoNome: null, habilidadeNome: 'Gatuno', nivelConcedido: 8 },
  { trilhaNome: 'Infiltrador', caminhoNome: null, habilidadeNome: 'Assassinar', nivelConcedido: 13 },
  { trilhaNome: 'Infiltrador', caminhoNome: null, habilidadeNome: 'Sombra Fugaz', nivelConcedido: 20 },

  // Especialista - Médico de Campo
  { trilhaNome: 'Médico de Campo', caminhoNome: null, habilidadeNome: 'Paramédico', nivelConcedido: 2 },
  { trilhaNome: 'Médico de Campo', caminhoNome: null, habilidadeNome: 'Equipe de Trauma', nivelConcedido: 8 },
  { trilhaNome: 'Médico de Campo', caminhoNome: null, habilidadeNome: 'Resgate', nivelConcedido: 13 },
  { trilhaNome: 'Médico de Campo', caminhoNome: null, habilidadeNome: 'Reanimação', nivelConcedido: 20 },

  // Especialista - Técnico
  { trilhaNome: 'Técnico', caminhoNome: null, habilidadeNome: 'Inventário Otimizado', nivelConcedido: 2 },
  { trilhaNome: 'Técnico', caminhoNome: null, habilidadeNome: 'Remendão', nivelConcedido: 8 },
  { trilhaNome: 'Técnico', caminhoNome: null, habilidadeNome: 'Improvisar', nivelConcedido: 13 },
  { trilhaNome: 'Técnico', caminhoNome: null, habilidadeNome: 'Preparado para Tudo', nivelConcedido: 20 },

  // Especialista - Graduado
  { trilhaNome: 'Graduado', caminhoNome: null, habilidadeNome: 'Saber Ampliado', nivelConcedido: 2 },
  { trilhaNome: 'Graduado', caminhoNome: null, habilidadeNome: 'Grimório e Marca-páginas', nivelConcedido: 8 },
  { trilhaNome: 'Graduado', caminhoNome: null, habilidadeNome: 'Feitiços Eficientes', nivelConcedido: 13 },
  { trilhaNome: 'Graduado', caminhoNome: null, habilidadeNome: 'Feitiçaria Clássica', nivelConcedido: 20 },

  // Especialista - Flagelador
  { trilhaNome: 'Flagelador', caminhoNome: null, habilidadeNome: 'Poder do Flagelo', nivelConcedido: 2 },
  { trilhaNome: 'Flagelador', caminhoNome: null, habilidadeNome: 'Abraçar a Dor', nivelConcedido: 8 },
  { trilhaNome: 'Flagelador', caminhoNome: null, habilidadeNome: 'Absorver Agonia', nivelConcedido: 13 },
  { trilhaNome: 'Flagelador', caminhoNome: null, habilidadeNome: 'Sentimento Tangível', nivelConcedido: 20 },

  // Especialista - Mestre de Barreiras (habilidade de nível 2 comum a todos os caminhos)
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: null, habilidadeNome: 'Escolha do Mestre de Barreiras', nivelConcedido: 2 },

  // Caminhos específicos (níveis 8, 13, 20)
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Domínio Perfeito', habilidadeNome: 'Cabo de Guerra', nivelConcedido: 8 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Domínio Perfeito', habilidadeNome: 'Isso Acaba Aqui', nivelConcedido: 13 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Domínio Perfeito', habilidadeNome: 'Chega de Limitações', nivelConcedido: 20 },

  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Anulador de Barreiras', habilidadeNome: 'A Tesoura', nivelConcedido: 8 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Anulador de Barreiras', habilidadeNome: 'Eu Posso Fazer Isso o Dia Inteiro', nivelConcedido: 13 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Anulador de Barreiras', habilidadeNome: 'É Você Quem Está Preso Comigo', nivelConcedido: 20 },

  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Apoio de Campo', habilidadeNome: 'Ajudinha', nivelConcedido: 8 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Apoio de Campo', habilidadeNome: 'Suporte de Campo', nivelConcedido: 13 },
  { trilhaNome: 'Mestre de Barreiras', caminhoNome: 'Apoio de Campo', habilidadeNome: 'Versátil', nivelConcedido: 20 },
];

export async function seedHabilidadesTrilha(prisma: PrismaClient) {
  console.log('Cadastrando habilidades de trilha...');

  // 1) ✅ Garantir que TODAS as habilidades citadas existem
  const nomesUnicos = Array.from(new Set(habilidadesTrilhaSeed.map((h) => h.habilidadeNome)));

  for (const nome of nomesUnicos) {
    await prisma.habilidade.upsert({
      where: { nome },
      update: {
        tipo: 'TRILHA',
        hereditaria: false,
        descricao: null,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome,
        tipo: 'TRILHA',
        hereditaria: false,
        descricao: null,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }

  // 2) ✅ Criar os vínculos trilha/caminho/nivel -> habilidade
  for (const v of habilidadesTrilhaSeed) {
    const trilha = await prisma.trilha.findUnique({
      where: { nome: v.trilhaNome },
      select: { id: true },
    });
    if (!trilha) throw new Error(`Trilha não encontrada: ${v.trilhaNome}`);

    const habilidade = await prisma.habilidade.findUnique({
      where: { nome: v.habilidadeNome },
      select: { id: true },
    });
    if (!habilidade) throw new Error(`Habilidade não encontrada (após upsert): ${v.habilidadeNome}`);

    const caminhoId =
      v.caminhoNome == null
        ? null
        : (await prisma.caminho.findUnique({ where: { nome: v.caminhoNome }, select: { id: true } }))?.id;

    if (v.caminhoNome != null && caminhoId == null) {
      throw new Error(`Caminho não encontrado: ${v.caminhoNome}`);
    }

    await prisma.habilidadeTrilha.upsert({
      where: {
        trilhaId_habilidadeId_nivelConcedido: {
          trilhaId: trilha.id,
          habilidadeId: habilidade.id,
          nivelConcedido: v.nivelConcedido,
        },
      },
      update: {
        // se caminhoNome vier null, força caminhoId=null
        caminhoId: v.caminhoNome == null ? null : caminhoId,
      },
      create: {
        trilhaId: trilha.id,
        habilidadeId: habilidade.id,
        nivelConcedido: v.nivelConcedido,
        caminhoId: v.caminhoNome == null ? null : caminhoId,
      },
    });
  }
  
  console.log(`✅ ${nomesUnicos.length} habilidades de trilha cadastradas!\n`);
}
