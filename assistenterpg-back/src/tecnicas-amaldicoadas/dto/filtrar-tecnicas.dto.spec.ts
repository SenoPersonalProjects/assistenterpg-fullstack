import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FiltrarTecnicasDto } from './filtrar-tecnicas.dto';

describe('FiltrarTecnicasDto', () => {
  it('deve converter herditaria e flags de include a partir de query string', () => {
    const dto = plainToInstance(FiltrarTecnicasDto, {
      hereditaria: 'false',
      incluirHabilidades: 'true',
      incluirClas: '0',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.hereditaria).toBe(false);
    expect(dto.incluirHabilidades).toBe(true);
    expect(dto.incluirClas).toBe(false);
  });

  it('deve falhar quando booleano recebe valor invalido', () => {
    const dto = plainToInstance(
      FiltrarTecnicasDto,
      {
        hereditaria: 'talvez',
      },
      { enableImplicitConversion: true },
    );

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('hereditaria');
  });

  it('deve exigir claId e suplementoId maiores ou iguais a 1 quando informados', () => {
    const dto = plainToInstance(FiltrarTecnicasDto, {
      claId: '0',
      suplementoId: '0',
    });

    const errors = validateSync(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toContain('claId');
    expect(properties).toContain('suplementoId');
  });
});
