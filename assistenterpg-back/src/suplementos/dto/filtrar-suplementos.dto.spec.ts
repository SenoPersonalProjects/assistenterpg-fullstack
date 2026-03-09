import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FiltrarSuplementosDto } from './filtrar-suplementos.dto';

describe('FiltrarSuplementosDto', () => {
  it('deve converter apenasAtivos para boolean corretamente', () => {
    const dto = plainToInstance(FiltrarSuplementosDto, {
      apenasAtivos: 'false',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.apenasAtivos).toBe(false);
  });

  it('deve rejeitar valor booleano invalido', () => {
    const dto = plainToInstance(
      FiltrarSuplementosDto,
      {
        apenasAtivos: 'invalid',
      },
      { enableImplicitConversion: true },
    );

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('apenasAtivos');
  });
});
