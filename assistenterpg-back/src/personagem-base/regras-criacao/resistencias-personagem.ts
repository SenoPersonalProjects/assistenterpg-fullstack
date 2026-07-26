import { InventarioEngine } from '../../inventario/engine/inventario.engine';
import { ItemInventarioComDados } from '../../inventario/engine/inventario.types';
import { PrismaLike } from '../engine/personagem-base.engine.types';

export type EstadoEquipamentosPersonagem = {
  defesa: number;
  resistencias: Map<string, number>;
};

export function somarMapasResistencias(
  ...mapas: ReadonlyArray<ReadonlyMap<string, number>>
): Map<string, number> {
  const resultado = new Map<string, number>();

  for (const mapa of mapas) {
    for (const [codigo, valor] of mapa.entries()) {
      resultado.set(codigo, (resultado.get(codigo) ?? 0) + valor);
    }
  }

  return resultado;
}

export async function calcularEstadoEquipamentosPersonagemBase(
  personagemBaseId: number,
  prisma: PrismaLike,
): Promise<EstadoEquipamentosPersonagem> {
  const itens = await prisma.inventarioItemBase.findMany({
    where: { personagemBaseId, equipado: true },
    include: {
      equipamento: {
        include: {
          danos: true,
          reducesDano: true,
          protecaoAmaldicoada: true,
        },
      },
      modificacoes: {
        include: {
          modificacao: true,
        },
      },
    },
  });

  const stats = new InventarioEngine().calcularStatsEquipados(
    itens.map(
      (item) =>
        ({
          ...item,
          reduzirItensLeves: false,
        }) as ItemInventarioComDados,
    ),
  );

  return {
    defesa: stats.defesaTotal,
    resistencias: new Map(
      stats.reducoesDano.map((reducao) => [reducao.tipoReducao, reducao.valor]),
    ),
  };
}
