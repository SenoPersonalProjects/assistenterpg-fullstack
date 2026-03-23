import { PrismaService } from '../src/prisma/prisma.service';

function normalizarTextoComparacao(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function duracaoEhSustentada(duracao?: string | null): boolean {
  if (!duracao) return false;
  const normalizado = normalizarTextoComparacao(duracao);
  return (
    normalizado.includes('SUSTENTAD') ||
    normalizado.includes('SUSTENTAC') ||
    normalizado.includes('SUSTAIN') ||
    normalizado.includes('CONCENTRACAO')
  );
}

async function main() {
  const prisma = new PrismaService();

  try {
    await prisma.onModuleInit();

    const habilidades = await prisma.habilidadeTecnica.findMany({
      select: {
        id: true,
        nome: true,
        duracao: true,
        custoSustentacaoEA: true,
        custoSustentacaoPE: true,
      },
    });

    let atualizadasHabilidade = 0;
    for (const habilidade of habilidades) {
      if (!duracaoEhSustentada(habilidade.duracao)) continue;
      const ea = habilidade.custoSustentacaoEA ?? 0;
      const pe = habilidade.custoSustentacaoPE ?? 0;
      if (ea <= 0 && pe <= 0) {
        await prisma.habilidadeTecnica.update({
          where: { id: habilidade.id },
          data: { custoSustentacaoEA: 1 },
        });
        atualizadasHabilidade += 1;
        console.log(
          `[OK] Habilidade ${habilidade.nome} (#${habilidade.id}) custoSustentacaoEA: ${habilidade.custoSustentacaoEA ?? 'null'} -> 1`,
        );
      }
    }

    const variacoes = await prisma.variacaoHabilidade.findMany({
      select: {
        id: true,
        nome: true,
        duracao: true,
        custoSustentacaoEA: true,
        custoSustentacaoPE: true,
      },
    });

    let atualizadasVariacao = 0;
    for (const variacao of variacoes) {
      if (!duracaoEhSustentada(variacao.duracao)) continue;
      const ea = variacao.custoSustentacaoEA ?? 0;
      const pe = variacao.custoSustentacaoPE ?? 0;
      if (ea <= 0 && pe <= 0) {
        await prisma.variacaoHabilidade.update({
          where: { id: variacao.id },
          data: { custoSustentacaoEA: 1 },
        });
        atualizadasVariacao += 1;
        console.log(
          `[OK] Variacao ${variacao.nome} (#${variacao.id}) custoSustentacaoEA: ${variacao.custoSustentacaoEA ?? 'null'} -> 1`,
        );
      }
    }

    console.log(
      `\nConcluido. Habilidades atualizadas: ${atualizadasHabilidade}. Variacoes atualizadas: ${atualizadasVariacao}.`,
    );
  } finally {
    await prisma.onModuleDestroy();
  }
}

main().catch((error) => {
  console.error('Erro ao fixar custos de sustentacao:', error);
  process.exit(1);
});
