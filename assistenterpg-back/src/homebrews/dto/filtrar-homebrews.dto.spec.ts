import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FiltrarHomebrewsDto } from './filtrar-homebrews.dto';

describe('FiltrarHomebrewsDto', () => {
  it('deve converter apenasPublicados para boolean corretamente', () => {
    const dto = plainToInstance(FiltrarHomebrewsDto, {
      apenasPublicados: '0',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.apenasPublicados).toBe(false);
  });

  it('deve exigir usuarioId, pagina e limite >= 1', () => {
    const dto = plainToInstance(FiltrarHomebrewsDto, {
      usuarioId: '0',
      pagina: '0',
      limite: '0',
    });

    const errors = validateSync(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toContain('usuarioId');
    expect(properties).toContain('pagina');
    expect(properties).toContain('limite');
  });
});
