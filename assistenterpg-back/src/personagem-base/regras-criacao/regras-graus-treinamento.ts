// src/personagem-base/regras-criacao/regras-graus-treinamento.ts

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GrauTreinamentoDto } from '../dto/create-personagem-base.dto';
import {
  GrauTreinamentoNivelInvalidoException,
  GrauTreinamentoExcedeMelhoriasException,
  GrauTreinamentoPericiaInexistenteException,
  GrauTreinamentoPericiaDestreinadaException,
  GrauTreinamentoProgressaoInvalidaException,
  GrauTreinamentoNivelMinimoException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;

/**
 * ✅ Valida graus de treinamento do personagem
 */
export async function validarGrausTreinamento(
  nivel: number,
  intelecto: number,
  grausTreinamento: GrauTreinamentoDto[] | undefined,
  periciasMap: Map<string, { grauTreinamento: number }>,
  prisma: PrismaLike,
): Promise<void> {
  if (!grausTreinamento || grausTreinamento.length === 0) return;

  // Níveis que concedem grau de treinamento
  const niveisValidos = [3, 7, 11, 16];
  const niveisDisponiveis = niveisValidos.filter((n) => nivel >= n);

  // Validar que todos os níveis informados são válidos
  for (const gt of grausTreinamento) {
    if (!niveisDisponiveis.includes(gt.nivel)) {
      throw new GrauTreinamentoNivelInvalidoException(
        gt.nivel,
        niveisDisponiveis,
      );
    }

    // Validar quantidade de melhorias (2 + INT)
    const maxMelhorias = 2 + intelecto;
    if (gt.melhorias.length > maxMelhorias) {
      throw new GrauTreinamentoExcedeMelhoriasException(
        gt.nivel,
        gt.melhorias.length,
        maxMelhorias,
        intelecto,
      );
    }

    // Buscar códigos das perícias para validação
    const codigosUnicos = Array.from(
      new Set(gt.melhorias.map((m) => m.periciaCodigo)),
    );
    const pericias = await prisma.pericia.findMany({
      where: { codigo: { in: codigosUnicos } },
    });
    const mapaCodigos = new Map(pericias.map((p) => [p.codigo, p.id]));

    // Validar cada melhoria
    for (const melhoria of gt.melhorias) {
      // Verificar se perícia existe
      if (!mapaCodigos.has(melhoria.periciaCodigo)) {
        throw new GrauTreinamentoPericiaInexistenteException(
          melhoria.periciaCodigo,
        );
      }

      const pericia = periciasMap.get(melhoria.periciaCodigo);
      if (!pericia) {
        throw new GrauTreinamentoPericiaDestreinadaException(
          melhoria.periciaCodigo,
        );
      }

      // Verificar se perícia está treinada (grau > 0)
      if (pericia.grauTreinamento === 0) {
        throw new GrauTreinamentoPericiaDestreinadaException(
          melhoria.periciaCodigo,
        );
      }

      // Verificar progressão (não pode pular etapas: 0 → 5 → 10 → 15 → 20)
      if (melhoria.grauNovo !== melhoria.grauAnterior + 5) {
        throw new GrauTreinamentoProgressaoInvalidaException(
          melhoria.periciaCodigo,
          melhoria.grauAnterior,
          melhoria.grauNovo,
        );
      }

      // Verificar limites por nível
      if (melhoria.grauNovo === 10 && nivel < 3) {
        throw new GrauTreinamentoNivelMinimoException('Graduado', 10, 3);
      }
      if (melhoria.grauNovo === 15 && nivel < 9) {
        throw new GrauTreinamentoNivelMinimoException('Veterano', 15, 9);
      }
      if (melhoria.grauNovo === 20 && nivel < 16) {
        throw new GrauTreinamentoNivelMinimoException('Expert', 20, 16);
      }
    }
  }
}

/**
 * ✅ Aplica graus de treinamento nas perícias do personagem
 */
export function aplicarGrausTreinamento(
  grausTreinamento: GrauTreinamentoDto[] | undefined,
  periciasMap: Map<
    string,
    { periciaId: number; grauTreinamento: number; bonusExtra: number }
  >,
): void {
  if (!grausTreinamento) return;

  // Agrupar melhorias por perícia (soma total de melhorias)
  const melhoriasPorPericia = new Map<string, number>();

  for (const gt of grausTreinamento) {
    for (const melhoria of gt.melhorias) {
      const atual = melhoriasPorPericia.get(melhoria.periciaCodigo) || 0;
      melhoriasPorPericia.set(melhoria.periciaCodigo, atual + 1); // ✅ +1 ao invés de +5
    }
  }

  // Aplicar melhorias no mapa de perícias
  for (const [codigo, niveis] of melhoriasPorPericia) {
    const pericia = periciasMap.get(codigo);
    if (pericia) {
      pericia.grauTreinamento += niveis; // ✅ Soma níveis (0-4), não valores absolutos
    }
  }
}
