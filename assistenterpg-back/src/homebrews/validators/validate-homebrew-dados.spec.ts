import {
  AlcanceArma,
  CategoriaEquipamento,
  ProficienciaArma,
  TipoDano,
  TipoEquipamento,
  TipoHomebrewConteudo,
  TipoArma,
} from '@prisma/client';
import { HomebrewDadosInvalidosException } from 'src/common/exceptions/homebrew.exception';
import { HomebrewTipoNaoSuportadoException } from 'src/common/exceptions/business.exception';
import { CampoObrigatorioException } from 'src/common/exceptions/validation.exception';
import { validateHomebrewDados } from './validate-homebrew-dados';

describe('validateHomebrewDados', () => {
  it('aceita payload valido para EQUIPAMENTO ARMA', async () => {
    const payloadArma = {
      tipo: TipoEquipamento.ARMA,
      categoria: CategoriaEquipamento.CATEGORIA_1,
      espacos: 2,
      proficienciaArma: ProficienciaArma.SIMPLES,
      empunhaduras: ['UMA_MAO'],
      tipoArma: TipoArma.CORPO_A_CORPO,
      agil: false,
      danos: [
        {
          tipoDano: TipoDano.CORTANTE,
          rolagem: '1d6',
        },
      ],
      criticoValor: 20,
      criticoMultiplicador: 2,
      alcance: AlcanceArma.ADJACENTE,
    };

    await expect(
      validateHomebrewDados(TipoHomebrewConteudo.EQUIPAMENTO, payloadArma),
    ).resolves.toBeUndefined();
  });

  it('aceita payload valido para EQUIPAMENTO GENERICO', async () => {
    const payloadGenerico = {
      tipo: TipoEquipamento.GENERICO,
      categoria: CategoriaEquipamento.CATEGORIA_0,
      espacos: 1,
      efeito: 'Item sem subtipo especifico',
    };

    await expect(
      validateHomebrewDados(TipoHomebrewConteudo.EQUIPAMENTO, payloadGenerico),
    ).resolves.toBeUndefined();
  });

  it('falha quando EQUIPAMENTO nao envia dados.tipo', async () => {
    const payloadSemTipo = {
      categoria: CategoriaEquipamento.CATEGORIA_1,
      espacos: 1,
    };

    await expect(
      validateHomebrewDados(TipoHomebrewConteudo.EQUIPAMENTO, payloadSemTipo),
    ).rejects.toBeInstanceOf(CampoObrigatorioException);
  });

  it('retorna erro detalhado para campo aninhado invalido', async () => {
    const payloadComDanoInvalido = {
      tipo: TipoEquipamento.ARMA,
      categoria: CategoriaEquipamento.CATEGORIA_1,
      espacos: 2,
      proficienciaArma: ProficienciaArma.SIMPLES,
      empunhaduras: ['UMA_MAO'],
      tipoArma: TipoArma.CORPO_A_CORPO,
      agil: true,
      danos: [
        {
          rolagem: '1d8',
        },
      ],
      criticoValor: 20,
      criticoMultiplicador: 2,
      alcance: AlcanceArma.ADJACENTE,
    };

    await expect(
      validateHomebrewDados(
        TipoHomebrewConteudo.EQUIPAMENTO,
        payloadComDanoInvalido,
      ),
    ).rejects.toBeInstanceOf(HomebrewDadosInvalidosException);
  });

  it('falha para subtipo de EQUIPAMENTO nao suportado', async () => {
    const payloadTipoInvalido = {
      tipo: 'TIPO_QUE_NAO_EXISTE',
      categoria: CategoriaEquipamento.CATEGORIA_1,
      espacos: 1,
    };

    await expect(
      validateHomebrewDados(
        TipoHomebrewConteudo.EQUIPAMENTO,
        payloadTipoInvalido,
      ),
    ).rejects.toBeInstanceOf(HomebrewTipoNaoSuportadoException);
  });
});
