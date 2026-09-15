import { PrismaClient, Prisma } from '@prisma/client';
import { seedCondicoes } from './catalogos/condicoes';
import { seedHabilidadesOrigem } from './habilidades/hab-origem';
import { seedHabilidadesPoderesGenericos } from './habilidades/hab-poderes-genericos';
import { seedHabilidadesTrilha } from './habilidades/hab-trilha';
import { seedTecnicasNaoInatas } from './tecnicas/tecnicas-nao-inatas';
import { seedConfiguracoesVinculadosTecnicas } from './tecnicas/vinculados-tecnicas';

const MAX_TENTATIVAS_CONEXAO = 3;

function ehFalhaConexao(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P1017'
  );
}

async function executarEtapa(
  nome: string,
  executar: (prisma: PrismaClient) => Promise<void>,
): Promise<void> {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_CONEXAO; tentativa += 1) {
    const prisma = new PrismaClient();
    try {
      await executar(prisma);
      return;
    } catch (error) {
      if (!ehFalhaConexao(error) || tentativa === MAX_TENTATIVAS_CONEXAO) {
        throw error;
      }
      console.warn(
        `Conexão encerrada ao executar ${nome}; repetindo etapa idempotente (${tentativa + 1}/${MAX_TENTATIVAS_CONEXAO}).`,
      );
    } finally {
      await prisma.$disconnect();
    }
  }
}

async function main() {
  console.log('Aplicando catálogo mecânico do Maledicência RPG 1.4...');
  await executarEtapa('condições', seedCondicoes);
  await executarEtapa('habilidades de origem', seedHabilidadesOrigem);
  await executarEtapa('poderes genéricos', seedHabilidadesPoderesGenericos);
  await executarEtapa('habilidades de trilha', seedHabilidadesTrilha);
  await executarEtapa('técnicas não inatas', seedTecnicasNaoInatas);
  await executarEtapa('configurações de vinculados', seedConfiguracoesVinculadosTecnicas);
  console.log('Catálogo mecânico do Maledicência RPG 1.4 atualizado.');
}

main().catch((error) => {
  console.error('Erro ao atualizar o catálogo mecânico do Maledicência RPG 1.4.');
  console.error(error);
  process.exit(1);
});
