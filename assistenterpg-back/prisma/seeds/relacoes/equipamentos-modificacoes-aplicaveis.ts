import type { PrismaClient } from '@prisma/client';

type EquipamentoLite = {
  id: number;
  tipo: string;
  tipoArma: string | null;
  subtipoDistancia: string | null;
  proficienciaArma: string | null;
  proficienciaProtecao: string | null;
  tipoProtecao: string | null;
  alcance: string | null;
  complexidadeMaldicao: string | null;
  armaAmaldicoada?: { id: number } | null;
  protecaoAmaldicoada?: { id: number } | null;
};

type ModificacaoLite = {
  id: number;
  tipo: string;
  restricoes: unknown;
};

type RestricoesModificacao = {
  apenasAmaldicoadas?: boolean;
  requerComplexidade?: string;
};

const ordemComplexidade: Record<string, number> = {
  NENHUMA: 0,
  SIMPLES: 1,
  COMPLEXA: 2,
};

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extrairRestricoes(mod: ModificacaoLite): RestricoesModificacao {
  if (!isJsonObject(mod.restricoes)) return {};
  const apenasAmaldicoadas =
    typeof mod.restricoes.apenasAmaldicoadas === 'boolean'
      ? mod.restricoes.apenasAmaldicoadas
      : undefined;
  const requerComplexidade =
    typeof mod.restricoes.requerComplexidade === 'string'
      ? mod.restricoes.requerComplexidade
      : undefined;

  return { apenasAmaldicoadas, requerComplexidade };
}

function detectarTipoBase(equipamento: EquipamentoLite): string | null {
  const tipo = equipamento.tipo;

  if (tipo === 'ARMA') return 'ARMA';
  if (tipo === 'MUNICAO') return 'MUNICAO';
  if (tipo === 'PROTECAO') return 'PROTECAO';
  if (tipo === 'ACESSORIO') return 'ACESSORIO';

  if (tipo === 'FERRAMENTA_AMALDICOADA') {
    if (
      equipamento.armaAmaldicoada ||
      equipamento.proficienciaArma ||
      equipamento.alcance ||
      equipamento.tipoArma
    ) {
      return 'ARMA';
    }
    if (
      equipamento.protecaoAmaldicoada ||
      equipamento.proficienciaProtecao ||
      equipamento.tipoProtecao
    ) {
      return 'PROTECAO';
    }
    return 'FERRAMENTA_AMALDICOADA';
  }

  if (
    tipo === 'ITEM_OPERACIONAL' &&
    (equipamento.tipoArma || equipamento.proficienciaArma || equipamento.alcance)
  ) {
    return 'ARMA';
  }

  return null;
}

function verificarTipoCompativel(
  tipoMod: string,
  equipamento: EquipamentoLite,
): boolean {
  const tipoEquip = equipamento.tipo;
  const tipoArma = equipamento.tipoArma;
  const subtipoDistancia = equipamento.subtipoDistancia;

  const tipoBase = detectarTipoBase(equipamento);

  switch (tipoMod) {
    case 'CORPO_A_CORPO_E_DISPARO':
      if (tipoBase === 'ARMA') {
        if (tipoArma === 'CORPO_A_CORPO') return true;
        if (tipoArma === 'A_DISTANCIA' && subtipoDistancia !== 'FOGO') return true;
      }
      return false;
    case 'ARMA_FOGO':
      return tipoBase === 'ARMA' && subtipoDistancia === 'FOGO';
    case 'MUNICAO':
      return tipoEquip === 'MUNICAO';
    case 'PROTECAO':
      return tipoBase === 'PROTECAO';
    case 'ACESSORIO':
      return tipoEquip === 'ACESSORIO';
    default:
      return false;
  }
}

function isModificacaoCompativel(
  modificacao: ModificacaoLite,
  equipamento: EquipamentoLite,
): boolean {
  if (!verificarTipoCompativel(modificacao.tipo, equipamento)) return false;

  const { apenasAmaldicoadas, requerComplexidade } = extrairRestricoes(
    modificacao,
  );

  const complexidadeEquip =
    ordemComplexidade[equipamento.complexidadeMaldicao ?? 'NENHUMA'] ?? 0;

  if (apenasAmaldicoadas && complexidadeEquip <= 0) return false;

  if (requerComplexidade) {
    const complexidadeRequerida =
      ordemComplexidade[requerComplexidade] ?? 0;
    if (complexidadeEquip < complexidadeRequerida) return false;
  }

  return true;
}

export async function seedEquipamentosModificacoesAplicaveis(
  prisma: PrismaClient,
) {
  console.log('Vinculando equipamentos -> modificacoes aplicaveis...');

  await prisma.equipamentoModificacaoAplicavel.deleteMany();

  const equipamentos = await prisma.equipamentoCatalogo.findMany({
    select: {
      id: true,
      tipo: true,
      tipoArma: true,
      subtipoDistancia: true,
      proficienciaArma: true,
      proficienciaProtecao: true,
      tipoProtecao: true,
      alcance: true,
      complexidadeMaldicao: true,
      armaAmaldicoada: { select: { id: true } },
      protecaoAmaldicoada: { select: { id: true } },
    },
  });

  const modificacoes = await prisma.modificacaoEquipamento.findMany({
    select: {
      id: true,
      tipo: true,
      restricoes: true,
    },
  });

  const data: { equipamentoId: number; modificacaoId: number }[] = [];

  for (const equipamento of equipamentos) {
    for (const modificacao of modificacoes) {
      if (isModificacaoCompativel(modificacao, equipamento)) {
        data.push({
          equipamentoId: equipamento.id,
          modificacaoId: modificacao.id,
        });
      }
    }
  }

  if (data.length > 0) {
    await prisma.equipamentoModificacaoAplicavel.createMany({
      data,
      skipDuplicates: true,
    });
  }

  console.log(
    `OK: Modificacoes aplicaveis vinculadas: ${data.length} vinculos.`,
  );
}
