import type { PrismaClient } from '@prisma/client';
import type { SeedTipoGrau } from '../_types';

export const tiposGrauSeed: SeedTipoGrau[] = [
  {
    codigo: 'TECNICA_AMALDICOADA',
    nome: 'Técnica Amaldiçoada',
    descricao:
      'Feitiços básicos e avançados que usam energia amaldiçoada de forma direta.',
  },
  {
    codigo: 'TECNICA_REVERSA',
    nome: 'Técnica Reversa',
    descricao:
      'Uso invertido da energia amaldiçoada para cura e efeitos positivos.',
  },
  {
    codigo: 'TECNICA_BARREIRA',
    nome: 'Técnica de Barreira',
    descricao:
      'Técnicas voltadas a domínios, cortinas e efeitos de controle de área.',
  },
  {
    codigo: 'TECNICA_ANTI_BARREIRA',
    nome: 'Técnica AntiBarreira',
    descricao:
      'Efeitos especializados em romper ou enfraquecer barreiras e domínios.',
  },
  {
    codigo: 'TECNICA_SHIKIGAMI',
    nome: 'Técnica de Shikigami',
    descricao:
      'Conjuração e controle de shikigamis e enxames vinculados ao usuário.',
  },
  {
    codigo: 'TECNICA_CADAVERES',
    nome: 'Técnica de Cadáveres',
    descricao:
      'Controle de corpos, bonecos e entidades animadas por energia amaldiçoada.',
  },
];

export async function seedTiposGrau(prisma: PrismaClient) {
  console.log('Cadastrando tipos de grau...');
  for (const data of tiposGrauSeed) {
    await prisma.tipoGrau.upsert({
      where: { codigo: data.codigo },
      update: { nome: data.nome, descricao: data.descricao ?? null },
      create: { ...data, descricao: data.descricao ?? null },
    });
  }
}
