// src/personagem-base/regras-criacao/regras-pericias.ts

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePersonagemBaseDto } from '../dto/create-personagem-base.dto';
import {
  PericiaNaoEncontradaException,
  OrigemPericiaSemGrupoException,
  OrigemPericiaGrupoInvalidoException,
  OrigemPericiaEscolhaInvalidaException,
  ClassePericiaSemGrupoException,
  ClassePericiaGrupoInvalidoException,
  ClassePericiaEscolhaInvalidaException,
  PericiaJujutsuNaoEncontradaException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;

type FontePericia =
  | 'ORIGEM_FIXA'
  | 'ORIGEM_ESCOLHA'
  | 'CLASSE_FIXA'
  | 'CLASSE_ESCOLHA'
  | 'ESCOLA_TECNICA' // ✅ NOVO
  | 'LIVRE';

/**
 * ✅ Aplica uma fonte de perícia ao mapa
 */
function aplicarFontePericia(
  mapa: Map<string, { periciaId: number; grauTreinamento: number; bonusExtra: number }>,
  codigo: string,
  fonte: FontePericia,
): void {
  const entry = mapa.get(codigo);
  if (!entry) {
    throw new PericiaNaoEncontradaException(codigo);
  }

  if (entry.grauTreinamento === 0) {
    entry.grauTreinamento = 1;
  } else {
    // ✅ ATUALIZADO: Escola Técnica também é fonte fixa
    const fonteFixa =
      fonte === 'ORIGEM_FIXA' || fonte === 'CLASSE_FIXA' || fonte === 'ESCOLA_TECNICA';

    if (fonteFixa) entry.bonusExtra += 2;
  }
}

/**
 * ✅ Valida e processa perícias da origem
 */
function validarEProcessarPericiasOrigem(
  origemPericias: Array<{
    id: number;
    tipo: string;
    grupoEscolha: number | null;
    pericia: { codigo: string };
  }>,
  periciasOrigemEscolhidasCodigos: string[],
  mapa: Map<string, { periciaId: number; grauTreinamento: number; bonusExtra: number }>,
): void {
  const periciasOrigemEscolhidas = periciasOrigemEscolhidasCodigos ?? [];

  // Aplicar perícias fixas
  for (const op of origemPericias) {
    if (op.tipo === 'FIXA') {
      aplicarFontePericia(mapa, op.pericia.codigo, 'ORIGEM_FIXA');
    }
  }

  // Agrupar perícias de escolha por grupo
  const periciasEscolhaOrigemPorGrupo = new Map<number, string[]>();
  for (const op of origemPericias) {
    if (op.tipo === 'ESCOLHA') {
      if (op.grupoEscolha == null) {
        throw new OrigemPericiaSemGrupoException(op.id);
      }
      const lista = periciasEscolhaOrigemPorGrupo.get(op.grupoEscolha) || [];
      lista.push(op.pericia.codigo);
      periciasEscolhaOrigemPorGrupo.set(op.grupoEscolha, lista);
    }
  }

  const escolhidasSet = new Set(periciasOrigemEscolhidas);

  // Validar que cada grupo tem exatamente 1 escolha
  for (const [grupo, codigosPossiveis] of periciasEscolhaOrigemPorGrupo) {
    const intersecao = codigosPossiveis.filter((c) => escolhidasSet.has(c));
    if (intersecao.length !== 1) {
      throw new OrigemPericiaGrupoInvalidoException(grupo, codigosPossiveis);
    }
  }

  // Validar que todas as escolhidas pertencem aos grupos
  const todosCodigosEscolhaOrigem = new Set(
    Array.from(periciasEscolhaOrigemPorGrupo.values()).flat(),
  );
  for (const c of escolhidasSet) {
    if (!todosCodigosEscolhaOrigem.has(c)) {
      throw new OrigemPericiaEscolhaInvalidaException(c);
    }
  }

  // Aplicar perícias escolhidas
  for (const codigo of escolhidasSet) {
    aplicarFontePericia(mapa, codigo, 'ORIGEM_ESCOLHA');
  }
}

/**
 * ✅ Valida e processa perícias da classe
 */
function validarEProcessarPericiasClasse(
  classePericias: Array<{
    id: number;
    tipo: string;
    grupoEscolha: number | null;
    pericia: { codigo: string };
  }>,
  periciasClasseEscolhidasCodigos: string[],
  mapa: Map<string, { periciaId: number; grauTreinamento: number; bonusExtra: number }>,
): void {
  const periciasClasseEscolhidas = periciasClasseEscolhidasCodigos ?? [];

  // Aplicar perícias fixas
  for (const cp of classePericias) {
    if (cp.tipo === 'FIXA') {
      aplicarFontePericia(mapa, cp.pericia.codigo, 'CLASSE_FIXA');
    }
  }

  // Agrupar perícias de escolha por grupo
  const periciasEscolhaClassePorGrupo = new Map<number, string[]>();
  for (const cp of classePericias) {
    if (cp.tipo === 'ESCOLHA') {
      if (cp.grupoEscolha == null) {
        throw new ClassePericiaSemGrupoException(cp.id);
      }
      const lista = periciasEscolhaClassePorGrupo.get(cp.grupoEscolha) || [];
      lista.push(cp.pericia.codigo);
      periciasEscolhaClassePorGrupo.set(cp.grupoEscolha, lista);
    }
  }

  const escolhidasSet = new Set(periciasClasseEscolhidas);

  // Validar que cada grupo tem exatamente 1 escolha
  for (const [grupo, codigosPossiveis] of periciasEscolhaClassePorGrupo) {
    const intersecao = codigosPossiveis.filter((c) => escolhidasSet.has(c));
    if (intersecao.length !== 1) {
      throw new ClassePericiaGrupoInvalidoException(grupo, codigosPossiveis);
    }
  }

  // Validar que todas as escolhidas pertencem aos grupos
  const todosCodigosEscolhaClasse = new Set(
    Array.from(periciasEscolhaClassePorGrupo.values()).flat(),
  );
  for (const c of escolhidasSet) {
    if (!todosCodigosEscolhaClasse.has(c)) {
      throw new ClassePericiaEscolhaInvalidaException(c);
    }
  }

  // Aplicar perícias escolhidas
  for (const codigo of escolhidasSet) {
    aplicarFontePericia(mapa, codigo, 'CLASSE_ESCOLHA');
  }
}

/**
 * ✅ NOVO: Aplica perícias da Escola Técnica de Jujutsu
 */
function aplicarPericiasEscolaTecnica(
  estudouEscolaTecnica: boolean,
  mapa: Map<string, { periciaId: number; grauTreinamento: number; bonusExtra: number }>,
): void {
  if (!estudouEscolaTecnica) return;

  const jujutsuEntry = mapa.get('JUJUTSU');
  if (!jujutsuEntry) {
    throw new PericiaJujutsuNaoEncontradaException();
  }

  // Escola Técnica é fonte fixa
  aplicarFontePericia(mapa, 'JUJUTSU', 'ESCOLA_TECNICA');
}

/**
 * ✅ Monta as perícias do personagem com base nas escolhas e fontes
 *
 * ⚠️ IMPORTANTE: Esta função NÃO valida o limite de perícias livres.
 * A validação acontece no service (preview/criar/atualizar) APÓS calcular
 * os extras de Intelecto I/II, para evitar erro de ordem de execução.
 */
export async function montarPericiasPersonagem(
  dto: CreatePersonagemBaseDto,
  prisma: PrismaLike,
): Promise<{ periciaId: number; grauTreinamento: number; bonusExtra: number }[]> {
  const {
    classeId,
    origemId,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    estudouEscolaTecnica,
  } = dto as CreatePersonagemBaseDto;

  const periciasClasseEscolhidas = periciasClasseEscolhidasCodigos ?? [];
  const periciasOrigemEscolhidas = periciasOrigemEscolhidasCodigos ?? [];
  const periciasLivres = periciasLivresCodigos ?? [];

  // Buscar dados necessários
  const [todasPericias, classePericias, origemPericias] = await Promise.all([
    prisma.pericia.findMany(),
    prisma.classePericia.findMany({
      where: { classeId },
      include: { pericia: true },
    }),
    prisma.origemPericia.findMany({
      where: { origemId },
      include: { pericia: true },
    }),
  ]);

  // Criar mapa com todas as perícias zeradas
  const mapa = new Map<
    string,
    { periciaId: number; grauTreinamento: number; bonusExtra: number }
  >();
  for (const p of todasPericias) {
    mapa.set(p.codigo, {
      periciaId: p.id,
      grauTreinamento: 0,
      bonusExtra: 0,
    });
  }

  // Processar perícias da origem
  validarEProcessarPericiasOrigem(origemPericias, periciasOrigemEscolhidas, mapa);

  // Processar perícias da classe
  validarEProcessarPericiasClasse(classePericias, periciasClasseEscolhidas, mapa);

  // ✅ NOVO: Processar Escola Técnica (fonte fixa)
  aplicarPericiasEscolaTecnica(estudouEscolaTecnica, mapa);

  // ✅ CORRIGIDO: Apenas aplicar perícias livres, SEM validar limite
  // A validação acontece no service após calcular extras de Intelecto
  const livresUnicos = Array.from(new Set(periciasLivres));
  for (const codigo of livresUnicos) {
    aplicarFontePericia(mapa, codigo, 'LIVRE');
  }

  return Array.from(mapa.values());
}
