import { validate } from 'class-validator';
import { ImportarHomebrewJsonDto } from './importar-homebrew-json.dto';

describe('ImportarHomebrewJsonDto', () => {
  it('rejeita payload com itens demais', async () => {
    const dto = new ImportarHomebrewJsonDto();
    dto.exportType = 'homebrew';
    dto.schemaVersion = 1;
    dto.items = Array.from({ length: 101 }, (_, index) => ({ index }));

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'items')).toBe(true);
  });

  it('rejeita metadados textuais longos', async () => {
    const dto = new ImportarHomebrewJsonDto();
    dto.exportType = 'x'.repeat(65);
    dto.schemaVersion = 1;
    dto.exportedAt = 'x'.repeat(65);

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['exportType', 'exportedAt']),
    );
  });
});
