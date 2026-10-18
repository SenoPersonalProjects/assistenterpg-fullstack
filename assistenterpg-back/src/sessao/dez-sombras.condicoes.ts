import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import { configSombras, lerEstadoSombras } from './dez-sombras.engine';

export const FONTE_CONDICOES_SOMBRAS = 'DEZ_SOMBRAS';
type Alvo = { personagemSessaoId?: number | null; npcSessaoId?: number | null };
type Relogio = {
  tipo: 'TEMPORARIA' | 'VENENO';
  iniciou?: boolean;
  testePendente?: boolean;
  origemId: number;
};
export function lerRelogioSombras(observacao: string | null): Relogio | null {
  try {
    const value = JSON.parse(observacao ?? 'null') as Relogio | null;
    return value?.tipo === 'TEMPORARIA' || value?.tipo === 'VENENO'
      ? value
      : null;
  } catch {
    return null;
  }
}

/** Fim do próximo turno é distinto da duração genérica, contada no início. */
export async function processarCondicoesSombrasTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  alvo: Alvo,
  fase: 'INICIO' | 'FIM',
) {
  if (alvo.personagemSessaoId) {
    const ps = await tx.personagemSessao.findFirst({
      where: { id: alvo.personagemSessaoId, sessaoId },
      include: { personagemCampanha: true },
    });
    const config = configSombras(ps?.personagemCampanha.configuracaoDezSombras);
    if (ps && config) {
      const estado = lerEstadoSombras(
        ps.personagemCampanha.estadoDezSombras,
        config,
      );
      for (const sombra of Object.values(estado.sombras)) {
        if (sombra.npcSessaoId) continue;
        sombra.condicoes = sombra.condicoes.filter((c) => {
          const relogio = lerRelogioSombras(c.observacao ?? null);
          if (relogio?.tipo !== 'TEMPORARIA') return true;
          if (fase === 'FIM' && relogio.iniciou) return false;
          if (fase === 'INICIO')
            c.observacao = JSON.stringify({ ...relogio, iniciou: true });
          return true;
        });
      }
      await tx.personagemCampanha.update({
        where: { id: ps.personagemCampanhaId },
        data: {
          estadoDezSombras: JSON.parse(
            JSON.stringify(estado),
          ) as Prisma.InputJsonValue,
        },
      });
    }
  }
  const condicoes = await tx.condicaoPersonagemSessao.findMany({
    where: {
      sessaoId,
      ativo: true,
      fonteCodigo: FONTE_CONDICOES_SOMBRAS,
      ...alvo,
    },
  });
  for (const condicao of condicoes) {
    const relogio = lerRelogioSombras(condicao.observacao);
    if (!relogio) continue;
    if (relogio.tipo === 'TEMPORARIA') {
      if (fase === 'INICIO')
        await tx.condicaoPersonagemSessao.update({
          where: { id: condicao.id },
          data: { observacao: JSON.stringify({ ...relogio, iniciou: true }) },
        });
      else if (relogio.iniciou)
        await tx.condicaoPersonagemSessao.update({
          where: { id: condicao.id },
          data: {
            ativo: false,
            removidaEm: new Date(),
            motivoRemocao: 'Fim do próximo turno do alvo.',
          },
        });
      continue;
    }
    if (fase === 'FIM') {
      await tx.condicaoPersonagemSessao.update({
        where: { id: condicao.id },
        data: {
          observacao: JSON.stringify({ ...relogio, testePendente: true }),
        },
      });
      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: condicao.cenaId,
          tipoEvento: 'DEZ_SOMBRAS_VENENO_RESISTENCIA',
          dados: {
            ...alvo,
            condicaoSessaoId: condicao.id,
            dt: 30,
            aviso:
              'Resolva Fortitude DT30 no fim do turno e registre o resultado no painel das Dez Sombras.',
          },
        },
      });
    } else {
      const dados = [randomInt(1, 9), randomInt(1, 9)];
      const dano = dados.reduce((a, b) => a + b, 0);
      // Como os demais danos de combate, a aplicação usa o controle de PV da
      // sessão, permitindo ao mestre resolver RD e outras defesas do alvo.
      await tx.eventoSessao.create({
        data: {
          sessaoId,
          cenaId: condicao.cenaId,
          tipoEvento: 'DEZ_SOMBRAS_VENENO_DANO',
          dados: {
            ...alvo,
            condicaoSessaoId: condicao.id,
            dados,
            dano,
            tipoDano: 'VENENO',
            aviso:
              'Aplique o dano após resolver as defesas do alvo pelo controle de PV.',
          },
        },
      });
    }
  }
}
