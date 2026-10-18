import { Prisma } from '@prisma/client';
import { isDeepStrictEqual } from 'node:util';
import { bloquearPersonagemCampanhaTx } from '../campanha/campanha-concorrencia';
import {
  configSombras,
  lerEstadoSombras,
  registrarDanoSombra,
  falhaSombras,
} from './dez-sombras.engine';
import { obterSombra } from './dez-sombras.catalogo';
import { snapshotSombra } from './dez-sombras.service';

const json = (v: unknown) =>
  JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
type MemoriaDano = {
  personagemCampanhaId: number;
  estadoAntes: Prisma.JsonValue;
  estadoDepois: Prisma.JsonValue;
  entidadeAntes: {
    id: number;
    nome: string;
    tamanho: string;
    pontosVidaMax: number;
    pontosVidaAtual: number;
    estado: string;
    acoes: Prisma.JsonValue;
    config: Prisma.JsonValue;
  };
};

/** A edição de PV usa a mesma transação da ficha e registra dados para desfazer. */
export async function sincronizarVitalidadeSombrasTx(
  tx: Prisma.TransactionClient,
  npc: {
    id: number;
    entidadeVinculadaId: number | null;
    pontosVidaAtual: number;
  },
) {
  if (!npc.entidadeVinculadaId) return null;
  const entidade = await tx.personagemCampanhaEntidadeVinculada.findUnique({
    where: { id: npc.entidadeVinculadaId },
    include: { personagemCampanha: true },
  });
  const codigo = (entidade?.config as { dezSombras?: string } | null)
    ?.dezSombras;
  if (!entidade || !codigo) return null;
  const pc = entidade.personagemCampanha,
    cfg = configSombras(pc.configuracaoDezSombras);
  if (!cfg) return null;
  await bloquearPersonagemCampanhaTx(tx, pc.campanhaId, pc.id);
  const estado = lerEstadoSombras(pc.estadoDezSombras, cfg);
  if (estado.sombras[codigo]?.npcSessaoId !== npc.id) return null;
  const destino = registrarDanoSombra(estado, codigo, npc.pontosVidaAtual);
  const sombra = obterSombra(destino);
  const memoria: MemoriaDano = {
    personagemCampanhaId: pc.id,
    estadoAntes: pc.estadoDezSombras,
    estadoDepois: json(estado) as Prisma.JsonValue,
    entidadeAntes: {
      id: entidade.id,
      nome: entidade.nome,
      tamanho: entidade.tamanho,
      pontosVidaMax: entidade.pontosVidaMax,
      pontosVidaAtual: entidade.pontosVidaAtual,
      estado: entidade.estado,
      acoes: entidade.acoes,
      config: entidade.config,
    },
  };
  if (destino !== codigo) {
    await tx.npcAmeacaSessao.update({
      where: { id: npc.id },
      data: {
        nomeExibicao: sombra.nome,
        tamanho: sombra.tamanho,
        pontosVidaMax: sombra.pv,
        acoesGuia: snapshotSombra(sombra).acoes,
      },
    });
    await tx.personagemCampanhaEntidadeVinculada.update({
      where: { id: entidade.id },
      data: {
        nome: sombra.nome,
        tamanho: sombra.tamanho,
        pontosVidaMax: sombra.pv,
        pontosVidaAtual: npc.pontosVidaAtual,
        acoes: snapshotSombra(sombra).acoes,
        config: snapshotSombra(sombra).config,
      },
    });
  } else
    await tx.personagemCampanhaEntidadeVinculada.update({
      where: { id: entidade.id },
      data: {
        pontosVidaAtual: npc.pontosVidaAtual,
        ...(npc.pontosVidaAtual <= 0
          ? { estado: sombra.componentes ? 'DISPONIVEL' : 'DESTRUIDO' }
          : {}),
      },
    });
  await tx.personagemCampanha.update({
    where: { id: pc.id },
    data: { estadoDezSombras: json(estado) },
  });
  return json(memoria);
}

export async function desfazerVitalidadeSombrasTx(
  tx: Prisma.TransactionClient,
  memoria: unknown,
) {
  if (!memoria || typeof memoria !== 'object') return;
  const m = memoria as MemoriaDano;
  if (
    !Number.isInteger(m.personagemCampanhaId) ||
    !Number.isInteger(m.entidadeAntes?.id)
  )
    falhaSombras('Registro de vitalidade incompleto.');
  const pc = await tx.personagemCampanha.findUniqueOrThrow({
    where: { id: m.personagemCampanhaId },
  });
  await bloquearPersonagemCampanhaTx(tx, pc.campanhaId, pc.id);
  if (!isDeepStrictEqual(pc.estadoDezSombras, m.estadoDepois))
    falhaSombras(
      'Há ações posteriores desta técnica. Desfaça-as antes de reverter este dano.',
    );
  const e = m.entidadeAntes;
  await tx.personagemCampanhaEntidadeVinculada.update({
    where: { id: e.id },
    data: {
      nome: e.nome,
      tamanho:
        e.tamanho as Prisma.EnumTamanhoNpcAmeacaFieldUpdateOperationsInput['set'],
      pontosVidaMax: e.pontosVidaMax,
      pontosVidaAtual: e.pontosVidaAtual,
      estado:
        e.estado as Prisma.EnumEstadoEntidadeVinculadaPersonagemFieldUpdateOperationsInput['set'],
      acoes: e.acoes === null ? Prisma.JsonNull : json(e.acoes),
      config: e.config === null ? Prisma.JsonNull : json(e.config),
    },
  });
  await tx.personagemCampanha.update({
    where: { id: pc.id },
    data: {
      estadoDezSombras:
        m.estadoAntes === null ? Prisma.JsonNull : json(m.estadoAntes),
    },
  });
}
