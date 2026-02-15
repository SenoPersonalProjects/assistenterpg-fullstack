import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidadeMecanicasEspeciais } from '../_types';
import { jsonOrNull } from '../_helpers';

export const habilidadesMecanicasEspeciaisSeed: SeedHabilidadeMecanicasEspeciais[] = [
  {
    habilidadeNome: 'Chamariz',
    mecanicasEspeciais: {
      acoes: {
        invocarShikigami: {
          tipo: 'MOVIMENTO',
          descricao: 'Invocar shikigami passa de ação completa para ação de movimento',
        },
      },
    },
  },
  {
    habilidadeNome: 'Saber Ampliado',
    mecanicasEspeciais: {
      grausLivres: {
        quantidade: 1,
        escalonamentoPorNivel: { niveis: [2, 6, 9, 12, 15, 18] },
        escolhasPermitidas: [
          'TECNICA_AMALDICOADA',
          'TECNICA_REVERSA',
          'TECNICA_BARREIRA',
          'TECNICA_ANTI_BARREIRA',
          'TECNICA_SHIKIGAMI',
          'TECNICA_CADAVERES',
        ],
      },
    },
  },
  {
    habilidadeNome: 'Escolha do Mestre de Barreiras',
    mecanicasEspeciais: {
      itens: { ancoraBarreiraReducaoCategoria: -1 },
      escolhas: { caminhoObrigatorio: true },
    },
  },
  {
    habilidadeNome: 'Mira de Elite',
    mecanicasEspeciais: {
      proficiencias: ['ARMAS_TATICAS_FOGO'],
      modificadores: {
        danoArmasFogo: { tipo: 'INTELECTO', descricao: 'Soma Intelecto no dano' },
      },
    },
  },
];

export async function seedHabilidadesMecanicasEspeciais(prisma: PrismaClient) {
  console.log('Aplicando mecânicas especiais em habilidades (updateMany por nome)...');

  for (const item of habilidadesMecanicasEspeciaisSeed) {
    await prisma.habilidade.updateMany({
      where: { nome: item.habilidadeNome },
      data: { mecanicasEspeciais: jsonOrNull(item.mecanicasEspeciais) },
    });
  }
}
