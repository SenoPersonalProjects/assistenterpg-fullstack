import type {
  HabilidadeDanoConfigPayload,
  RolagemDanoHabilidadeSessaoPayload,
  RolagemTesteHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';
import { formatarExpressaoDice } from './sessao-dice';

type VisibilidadeRolagem = 'PUBLICA' | 'SECRETA_MESTRE';

export type IntencaoRolagemTesteHabilidadePersonagem = {
  tipo: 'TESTE_HABILIDADE_PERSONAGEM';
  personagemSessaoId: number;
  habilidadeTecnicaId: number;
  visibilidade: VisibilidadeRolagem;
  clientRequestId: string;
};

export type IntencaoRolagemDanoHabilidadePersonagem = {
  tipo: 'DANO_PERSONAGEM';
  origemDano: 'HABILIDADE_TECNICA';
  personagemSessaoId: number;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId?: number;
  acumulos?: number;
  visibilidade: VisibilidadeRolagem;
  clientRequestId: string;
};

export type PreviewDanoHabilidade = {
  expressions: string[];
  faces: number[];
};

function validarFonteHabilidade(
  personagemSessaoId: number,
  habilidadeTecnicaId: number,
): void {
  if (
    !Number.isInteger(personagemSessaoId) ||
    personagemSessaoId <= 0 ||
    !Number.isInteger(habilidadeTecnicaId) ||
    habilidadeTecnicaId <= 0
  ) {
    throw new Error('Personagem ou habilidade invalidos para a rolagem.');
  }
}

export function deveUsarDanoHabilidadeAutoritativo(
  payload: RolagemDanoHabilidadeSessaoPayload,
): boolean {
  return payload.alvoTipo === 'PERSONAGEM' && payload.aplicarCritico !== true;
}

export function montarIntencaoRolagemTesteHabilidade(
  payload: RolagemTesteHabilidadeSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
): IntencaoRolagemTesteHabilidadePersonagem {
  const { personagemSessaoId, habilidadeTecnicaId } = payload.habilidade;
  validarFonteHabilidade(personagemSessaoId, habilidadeTecnicaId);
  if (payload.alvoTipo !== 'PERSONAGEM') {
    throw new Error('A rolagem autoritativa exige um personagem.');
  }
  return {
    tipo: 'TESTE_HABILIDADE_PERSONAGEM',
    personagemSessaoId,
    habilidadeTecnicaId,
    visibilidade,
    clientRequestId,
  };
}

export function montarIntencaoRolagemDanoHabilidade(
  payload: RolagemDanoHabilidadeSessaoPayload,
  visibilidade: VisibilidadeRolagem,
  clientRequestId: string,
): IntencaoRolagemDanoHabilidadePersonagem {
  const {
    personagemSessaoId,
    habilidadeTecnicaId,
    variacaoHabilidadeId,
    dano,
  } = payload.habilidade;
  validarFonteHabilidade(personagemSessaoId, habilidadeTecnicaId);
  if (!deveUsarDanoHabilidadeAutoritativo(payload)) {
    throw new Error('Esta rolagem de dano deve permanecer no fluxo legado.');
  }
  const acumulos = Math.max(1, Math.trunc(dano?.acumulos ?? 1));
  return {
    tipo: 'DANO_PERSONAGEM',
    origemDano: 'HABILIDADE_TECNICA',
    personagemSessaoId,
    habilidadeTecnicaId,
    ...(typeof variacaoHabilidadeId === 'number'
      ? { variacaoHabilidadeId }
      : {}),
    ...(acumulos > 1 ? { acumulos } : {}),
    visibilidade,
    clientRequestId,
  };
}

export function montarPreviewDanoHabilidade(
  dano: HabilidadeDanoConfigPayload,
): PreviewDanoHabilidade {
  const acumulos = Math.max(1, Math.trunc(dano.acumulos ?? 1));
  const grupos = new Map<
    string,
    { quantidade: number; faces: number; tipo: string }
  >();
  const adicionar = (quantidadeRaw: unknown, dadoRaw: unknown, tipoRaw: unknown) => {
    const quantidade = Math.trunc(Number(quantidadeRaw));
    const match = String(dadoRaw ?? '').trim().match(/^d(\d+)$/i);
    const faces = Number(match?.[1]);
    if (!Number.isFinite(quantidade) || quantidade <= 0 || !Number.isFinite(faces)) {
      return;
    }
    const tipo = String(tipoRaw ?? '').trim() || 'Dano';
    const chave = `${tipo}::${faces}`;
    const existente = grupos.get(chave);
    if (existente) {
      existente.quantidade += quantidade;
      return;
    }
    grupos.set(chave, { quantidade, faces, tipo });
  };

  for (const entrada of dano.dadosDano ?? []) {
    adicionar(entrada.quantidade, entrada.dado, entrada.tipo);
  }
  if (dano.escalonamentoDano && acumulos > 1) {
    adicionar(
      dano.escalonamentoDano.quantidade * (acumulos - 1),
      dano.escalonamentoDano.dado,
      dano.escalonamentoDano.tipo,
    );
  }

  const expressoes = Array.from(grupos.values()).map((grupo) => ({
    ...grupo,
    modificador: 0,
  }));
  const danoFlat = Number.isFinite(dano.danoFlat)
    ? Math.trunc(dano.danoFlat ?? 0)
    : 0;
  if (danoFlat !== 0 && expressoes[0]) {
    expressoes[0].modificador = danoFlat;
  } else if (danoFlat !== 0) {
    expressoes.push({
      quantidade: 1,
      faces: 1,
      tipo: String(dano.danoFlatTipo ?? '').trim() || 'Dano',
      modificador: danoFlat - 1,
    });
  }

  return {
    expressions: expressoes.map((expressao) =>
      `${expressao.tipo}: ${formatarExpressaoDice({
        quantidade: expressao.quantidade,
        faces: expressao.faces,
        modificador: expressao.modificador,
        aplicarModificadorPorDado: false,
      })}`,
    ),
    faces: expressoes.map((expressao) => expressao.faces),
  };
}
