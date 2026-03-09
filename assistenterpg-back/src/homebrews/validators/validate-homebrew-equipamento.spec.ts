import { TipoAmaldicoado, TipoEquipamento } from '@prisma/client';
import { ValidationException } from 'src/common/exceptions/validation.exception';
import { validateHomebrewEquipamentoCustom } from './validate-homebrew-equipamento';

describe('validateHomebrewEquipamentoCustom', () => {
  it('aceita ITEM_AMALDICOADO quando tipoAmaldicoado=ITEM', () => {
    expect(() =>
      validateHomebrewEquipamentoCustom({
        tipo: TipoEquipamento.ITEM_AMALDICOADO,
        categoria: 'CATEGORIA_1',
        espacos: 1,
        tipoAmaldicoado: TipoAmaldicoado.ITEM,
        efeito: 'Efeito valido',
      }),
    ).not.toThrow();
  });

  it('rejeita ITEM_AMALDICOADO com tipoAmaldicoado diferente de ITEM', () => {
    expect(() =>
      validateHomebrewEquipamentoCustom({
        tipo: TipoEquipamento.ITEM_AMALDICOADO,
        categoria: 'CATEGORIA_1',
        espacos: 1,
        tipoAmaldicoado: TipoAmaldicoado.ARMA,
      }),
    ).toThrow(ValidationException);
  });

  it('rejeita FERRAMENTA_AMALDICOADA com tipoAmaldicoado=ITEM', () => {
    expect(() =>
      validateHomebrewEquipamentoCustom({
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria: 'CATEGORIA_1',
        espacos: 1,
        tipoAmaldicoado: TipoAmaldicoado.ITEM,
      }),
    ).toThrow(ValidationException);
  });

  it('rejeita FERRAMENTA_AMALDICOADA tipo ARMA sem armaAmaldicoada', () => {
    expect(() =>
      validateHomebrewEquipamentoCustom({
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria: 'CATEGORIA_1',
        espacos: 1,
        tipoAmaldicoado: TipoAmaldicoado.ARMA,
      }),
    ).toThrow(ValidationException);
  });

  it('aceita FERRAMENTA_AMALDICOADA tipo ARMA com armaAmaldicoada', () => {
    expect(() =>
      validateHomebrewEquipamentoCustom({
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria: 'CATEGORIA_1',
        espacos: 1,
        tipoAmaldicoado: TipoAmaldicoado.ARMA,
        armaAmaldicoada: {
          tipoBase: 'ESPADA',
        },
      }),
    ).not.toThrow();
  });
});
