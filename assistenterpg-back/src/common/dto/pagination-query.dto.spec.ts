import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('accepts empty query', () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBeUndefined();
    expect(dto.limit).toBeUndefined();
  });

  it('accepts valid integer limits', () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 2,
      limit: 100,
    });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(100);
  });

  it('rejects page below 1', () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 0,
      limit: 10,
    });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects limit above 100', () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 1,
      limit: 101,
    });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});
