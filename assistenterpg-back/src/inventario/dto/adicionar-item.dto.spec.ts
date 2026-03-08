import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AdicionarItemDto } from './adicionar-item.dto';

describe('AdicionarItemDto', () => {
  it('deve aplicar fallback padrao para quantidade e equipado quando ausentes', () => {
    const dto = plainToInstance(AdicionarItemDto, {
      personagemBaseId: 1,
      equipamentoId: 2,
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.quantidade).toBe(1);
    expect(dto.equipado).toBe(false);
    expect(dto.ignorarLimitesGrauXama).toBe(false);
  });

  it('deve converter strings booleanas validas para boolean', () => {
    const dto = plainToInstance(AdicionarItemDto, {
      personagemBaseId: 1,
      equipamentoId: 2,
      equipado: '1',
      ignorarLimitesGrauXama: 'false',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.equipado).toBe(true);
    expect(dto.ignorarLimitesGrauXama).toBe(false);
  });

  it('deve rejeitar string booleana invalida', () => {
    const dto = plainToInstance(AdicionarItemDto, {
      personagemBaseId: 1,
      equipamentoId: 2,
      equipado: 'talvez',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('equipado');
  });

  it('deve rejeitar quantidade com numero parcial em string', () => {
    const dto = plainToInstance(AdicionarItemDto, {
      personagemBaseId: 1,
      equipamentoId: 2,
      quantidade: '2abc',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantidade');
  });
});
