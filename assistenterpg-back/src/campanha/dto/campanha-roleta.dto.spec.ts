import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AcaoSorteioCampanhaRoletaDto,
  IniciarSorteioCampanhaRoletaDto,
} from './campanha-roleta.dto';

const validar = (classe: new () => object, payload: unknown) =>
  validate(plainToInstance(classe, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

describe('DTOs de roleta da campanha', () => {
  it('aceita apenas intencao operacional para iniciar', async () => {
    await expect(
      validar(IniciarSorteioCampanhaRoletaDto, {
        slot: 'CLA',
        presetRevisaoEsperada: 1,
        clientRequestId: '123e4567-e89b-42d3-a456-426614174000',
      }),
    ).resolves.toHaveLength(0);
  });

  it('rejeita vencedor, pesos e snapshot enviados pelo cliente', async () => {
    const erros = await validar(IniciarSorteioCampanhaRoletaDto, {
      slot: 'CLA',
      presetRevisaoEsperada: 1,
      clientRequestId: '123e4567-e89b-42d3-a456-426614174000',
      resultado: 'Zenin',
      pesos: [99],
      snapshot: {},
    });
    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining(['resultado', 'pesos', 'snapshot']),
    );
  });

  it('exige UUID v4 e revisao positiva nas acoes', async () => {
    const erros = await validar(AcaoSorteioCampanhaRoletaDto, {
      revisaoEsperada: 0,
      clientRequestId: 'repetido',
    });
    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining(['revisaoEsperada', 'clientRequestId']),
    );
  });
});
