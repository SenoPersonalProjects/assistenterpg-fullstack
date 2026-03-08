import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AtualizarItemDto } from './atualizar-item.dto';

describe('AtualizarItemDto', () => {
  it('deve converter entradas booleanas e inteiras validas', () => {
    const dto = plainToInstance(AtualizarItemDto, {
      quantidade: '3',
      equipado: '0',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.quantidade).toBe(3);
    expect(dto.equipado).toBe(false);
  });

  it('deve ignorar campo ausente sem falhar validacao', () => {
    const dto = plainToInstance(AtualizarItemDto, {});

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.quantidade).toBeUndefined();
    expect(dto.equipado).toBeUndefined();
  });

  it('deve rejeitar valor booleano invalido', () => {
    const dto = plainToInstance(AtualizarItemDto, {
      equipado: 'ligado',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('equipado');
  });

  it('deve rejeitar quantidade com numero parcial em string', () => {
    const dto = plainToInstance(AtualizarItemDto, {
      quantidade: '9x',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantidade');
  });
});
