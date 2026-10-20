import { Prisma } from '@prisma/client';

type Entidade = Pick<
  Prisma.PersonagemCampanhaEntidadeVinculadaGetPayload<object>,
  | 'id'
  | 'personagemCampanhaId'
  | 'nome'
  | 'tipo'
  | 'fichaTipo'
  | 'tipoNpc'
  | 'tamanho'
  | 'vd'
  | 'defesa'
  | 'pontosVidaAtual'
  | 'pontosVidaMax'
  | 'cargasAtual'
  | 'cargasMax'
  | 'deslocamentoMetros'
  | 'agilidade'
  | 'forca'
  | 'intelecto'
  | 'presenca'
  | 'vigor'
  | 'percepcao'
  | 'iniciativa'
  | 'fortitude'
  | 'reflexos'
  | 'vontade'
  | 'luta'
  | 'jujutsu'
  | 'passivas'
  | 'acoes'
  | 'descricao'
  | 'conceito'
>;
const json = (value: unknown) =>
  value == null
    ? Prisma.JsonNull
    : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

/** Snapshot e vínculo de controle comuns; custos e restrições pertencem à estratégia da técnica. */
export async function criarManifestacaoVinculadaTx(
  tx: Prisma.TransactionClient,
  entidade: Entidade,
  contexto: {
    sessaoId: number;
    cenaId: number;
    personagemSessaoId: number;
    hostil?: boolean;
    nomeExibicao?: string;
    pontosVidaAtual?: number;
    notasCena?: string | null;
    ocultoJogadores?: boolean;
  },
) {
  const npc = await tx.npcAmeacaSessao.create({
    data: {
      sessaoId: contexto.sessaoId,
      cenaId: contexto.cenaId,
      entidadeVinculadaId: entidade.id,
      personagemDonoId: contexto.hostil ? null : entidade.personagemCampanhaId,
      personagemControladorSessaoId: contexto.hostil
        ? null
        : contexto.personagemSessaoId,
      tipoVinculo: entidade.tipo,
      nomeExibicao: contexto.nomeExibicao ?? entidade.nome,
      fichaTipo: entidade.fichaTipo,
      tipo: entidade.tipoNpc,
      tamanho: entidade.tamanho,
      vd: entidade.vd,
      defesa: entidade.defesa,
      pontosVidaAtual: Math.min(
        entidade.pontosVidaMax,
        Math.max(0, contexto.pontosVidaAtual ?? entidade.pontosVidaAtual),
      ),
      pontosVidaMax: entidade.pontosVidaMax,
      eaAtual: entidade.cargasAtual,
      eaMax: entidade.cargasMax,
      deslocamentoMetros: entidade.deslocamentoMetros,
      agilidade: entidade.agilidade,
      forca: entidade.forca,
      intelecto: entidade.intelecto,
      presenca: entidade.presenca,
      vigor: entidade.vigor,
      percepcao: entidade.percepcao,
      iniciativa: entidade.iniciativa,
      fortitude: entidade.fortitude,
      reflexos: entidade.reflexos,
      vontade: entidade.vontade,
      luta: entidade.luta,
      jujutsu: entidade.jujutsu,
      passivasGuia: json(entidade.passivas),
      acoesGuia: json(entidade.acoes),
      notasCena:
        contexto.notasCena === undefined
          ? (entidade.descricao ?? entidade.conceito)
          : contexto.notasCena,
      ocultoJogadores: contexto.ocultoJogadores === true,
    },
  });
  await tx.personagemCampanhaEntidadeVinculada.update({
    where: { id: entidade.id },
    data: { estado: 'ATIVO', pontosVidaAtual: npc.pontosVidaAtual },
  });
  return npc;
}
