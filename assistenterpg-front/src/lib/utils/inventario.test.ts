import { describe, expect, it } from 'vitest';
import { filtrarModificacoesCompativeis } from './inventario';
import type { EquipamentoCatalogo, ModificacaoCatalogo } from '@/lib/types';

function criarProtecao(
  overrides: Partial<EquipamentoCatalogo>,
): EquipamentoCatalogo {
  return {
    id: 1,
    codigo: 'PROTECAO_LEVE',
    nome: 'Protecao Leve',
    descricao: null,
    tipo: 'PROTECAO',
    categoria: '0',
    espacos: 2,
    complexidadeMaldicao: 'NENHUMA',
    proficienciaProtecao: 'LEVE',
    tipoProtecao: 'VESTIVEL',
    ...overrides,
  } as EquipamentoCatalogo;
}

function criarModificacao(
  codigo: string,
  restricoes: ModificacaoCatalogo['restricoes'],
): ModificacaoCatalogo {
  return {
    id: Math.abs(codigo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
    codigo,
    nome: codigo,
    tipo: 'PROTECAO',
    descricao: null,
    incrementoEspacos: 0,
    apenasAmaldicoadas: false,
    requerComplexidade: null,
    restricoes,
  };
}

const modificacoesProtecao = [
  criarModificacao('MOD_ANTIBOMBAS', {
    tiposEquipamento: ['PROTECAO'],
    tiposProtecao: ['VESTIVEL'],
    excluiEscudos: true,
    proficienciasProtecao: ['PESADA'],
  }),
  criarModificacao('MOD_BLINDADA', {
    tiposEquipamento: ['PROTECAO'],
    tiposProtecao: ['VESTIVEL'],
    excluiEscudos: true,
    proficienciasProtecao: ['PESADA'],
  }),
  criarModificacao('MOD_DISCRETA_PROTECAO', {
    tiposEquipamento: ['PROTECAO'],
    tiposProtecao: ['VESTIVEL'],
    excluiEscudos: true,
    proficienciasProtecao: ['LEVE'],
  }),
  criarModificacao('MOD_REFORCADA', {
    tiposEquipamento: ['PROTECAO'],
    tiposProtecao: ['VESTIVEL'],
    excluiEscudos: true,
  }),
];

describe('filtrarModificacoesCompativeis', () => {
  it('libera modificacoes de protecao leve vestivel', () => {
    const resultado = filtrarModificacoesCompativeis(
      modificacoesProtecao,
      criarProtecao({
        codigo: 'PROTECAO_LEVE',
        proficienciaProtecao: 'LEVE',
        tipoProtecao: 'VESTIVEL',
      }),
    );

    expect(resultado.map((mod) => mod.codigo).sort()).toEqual([
      'MOD_DISCRETA_PROTECAO',
      'MOD_REFORCADA',
    ]);
  });

  it('libera modificacoes de protecao pesada vestivel', () => {
    const resultado = filtrarModificacoesCompativeis(
      modificacoesProtecao,
      criarProtecao({
        codigo: 'PROTECAO_PESADA',
        proficienciaProtecao: 'PESADA',
        tipoProtecao: 'VESTIVEL',
      }),
    );

    expect(resultado.map((mod) => mod.codigo).sort()).toEqual([
      'MOD_ANTIBOMBAS',
      'MOD_BLINDADA',
      'MOD_REFORCADA',
    ]);
  });

  it('nao libera modificacoes de protecao para escudo ou protecao sem tipoProtecao', () => {
    const escudo = filtrarModificacoesCompativeis(
      modificacoesProtecao,
      criarProtecao({
        codigo: 'ESCUDO',
        proficienciaProtecao: 'ESCUDO',
        tipoProtecao: 'EMPUNHAVEL',
      }),
    );

    const semTipoProtecao = filtrarModificacoesCompativeis(
      modificacoesProtecao,
      criarProtecao({ tipoProtecao: null }),
    );

    expect(escudo).toEqual([]);
    expect(semTipoProtecao).toEqual([]);
  });
});
