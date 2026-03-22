import { PrismaClient, Prisma } from '@prisma/client';
import {
  calcularAtributoBaseInventario,
  calcularEspacosInventarioBase,
} from '../src/inventario/utils/inventario-capacidade';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getInventarioSomarIntelectoFromMecanicas(
  mecanicas: Prisma.JsonValue | null,
): boolean {
  if (!isRecord(mecanicas)) return false;
  const inventario = mecanicas.inventario;
  if (!isRecord(inventario)) return false;
  return inventario.somarIntelecto === true;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const personagens = await prisma.personagemBase.findMany({
      select: {
        id: true,
        nome: true,
        forca: true,
        intelecto: true,
        espacosInventarioBase: true,
        espacosInventarioExtra: true,
        espacosOcupados: true,
        habilidadesBase: {
          include: { habilidade: true },
        },
        poderesGenericos: {
          include: { habilidade: true },
        },
      },
    });

    let atualizados = 0;

    for (const personagem of personagens) {
      const somarIntelecto =
        personagem.habilidadesBase.some((h) =>
          getInventarioSomarIntelectoFromMecanicas(
            h.habilidade.mecanicasEspeciais,
          ),
        ) ||
        personagem.poderesGenericos.some((p) =>
          getInventarioSomarIntelectoFromMecanicas(
            p.habilidade.mecanicasEspeciais,
          ),
        );

      const atributoInventarioBase = calcularAtributoBaseInventario({
        forca: personagem.forca,
        intelecto: personagem.intelecto,
        somarIntelecto,
      });
      const novoEspacosBase = calcularEspacosInventarioBase(
        atributoInventarioBase,
      );

      const espacosBaseAtual = personagem.espacosInventarioBase ?? null;
      const espacosExtra = personagem.espacosInventarioExtra ?? 0;
      const espacosOcupados = personagem.espacosOcupados ?? 0;
      const novoTotal = novoEspacosBase + espacosExtra;
      const novoSobrecarregado = espacosOcupados > novoTotal;

      if (espacosBaseAtual !== novoEspacosBase) {
        await prisma.personagemBase.update({
          where: { id: personagem.id },
          data: {
            espacosInventarioBase: novoEspacosBase,
            sobrecarregado: novoSobrecarregado,
          },
        });
        atualizados += 1;
        console.log(
          `[OK] ${personagem.nome} (#${personagem.id}) espacosInventarioBase: ${espacosBaseAtual ?? 'null'} -> ${novoEspacosBase}`,
        );
      }
    }

    console.log(`\nConcluido. Personagens atualizados: ${atualizados}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro ao recalcular espacos de inventario:', error);
  process.exit(1);
});
