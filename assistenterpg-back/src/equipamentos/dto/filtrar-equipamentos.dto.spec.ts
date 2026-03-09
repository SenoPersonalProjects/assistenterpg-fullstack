import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FiltrarEquipamentosDto } from './filtrar-equipamentos.dto';

describe('FiltrarEquipamentosDto', () => {
  it('deve converter apenasAmaldicoados para boolean corretamente', () => {
    const dto = plainToInstance(FiltrarEquipamentosDto, {
      apenasAmaldicoados: 'false',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.apenasAmaldicoados).toBe(false);
  });

  it('deve rejeitar valor booleano invalido', () => {
    const dto = plainToInstance(
      FiltrarEquipamentosDto,
      {
        apenasAmaldicoados: 'invalid',
      },
      { enableImplicitConversion: true },
    );

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('apenasAmaldicoados');
  });
});
