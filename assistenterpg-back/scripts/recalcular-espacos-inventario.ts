import { Prisma } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { InventarioEngine } from '../src/inventario/engine/inventario.engine';
import { InventarioMapper } from '../src/inventario/inventario.mapper';
import { CampanhaInventarioService } from '../src/campanha/campanha.inventario.service';
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
  const prisma = new PrismaService();

  try {
    await prisma.onModuleInit();

    const engine = new InventarioEngine();
    const mapper = new InventarioMapper(engine);
    const campanhaInventario = new CampanhaInventarioService(
      prisma,
      {} as any,
      engine,
      mapper,
    );

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
    const mapaEspacosBase = new Map<number, number>();

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

      mapaEspacosBase.set(personagem.id, novoEspacosBase);

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

    console.log(`\nConcluido (base). Personagens atualizados: ${atualizados}`);

    const personagensCampanha = await prisma.personagemCampanha.findMany({
      select: {
        id: true,
        nome: true,
        personagemBaseId: true,
        espacosInventarioBase: true,
      },
    });

    let atualizadosCampanha = 0;

    for (const personagem of personagensCampanha) {
      const novoEspacosBase = mapaEspacosBase.get(
        personagem.personagemBaseId,
      );
      if (novoEspacosBase === undefined) continue;

      if (personagem.espacosInventarioBase !== novoEspacosBase) {
        await prisma.personagemCampanha.update({
          where: { id: personagem.id },
          data: { espacosInventarioBase: novoEspacosBase },
        });
        atualizadosCampanha += 1;
        console.log(
          `[OK] ${personagem.nome} (#${personagem.id}) espacosInventarioBase (campanha): ${personagem.espacosInventarioBase ?? 'null'} -> ${novoEspacosBase}`,
        );
      }

      await campanhaInventario.recalcularEstadoInventarioCampanha(
        personagem.id,
      );
    }

    console.log(
      `\nConcluido (campanha). Personagens atualizados: ${atualizadosCampanha}`,
    );
  } finally {
    await prisma.onModuleDestroy();
  }
}

main().catch((error) => {
  console.error('Erro ao recalcular espacos de inventario:', error);
  process.exit(1);
});
