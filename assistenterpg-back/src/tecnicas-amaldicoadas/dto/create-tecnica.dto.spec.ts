import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TipoTecnicaAmaldicoada } from '@prisma/client';
import { CreateTecnicaDto } from './create-tecnica.dto';

describe('CreateTecnicaDto', () => {
  const basePayload = {
    codigo: 'TEC001',
    nome: 'Tecnica de Teste',
    descricao: 'Descricao valida para a tecnica',
    tipo: TipoTecnicaAmaldicoada.INATA,
  };

  it('deve aceitar e normalizar nomes de clas sem espacos nas pontas', () => {
    const dto = plainToInstance(CreateTecnicaDto, {
      ...basePayload,
      hereditaria: true,
      clasHereditarios: [' Uchiha ', 'Senju'],
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.clasHereditarios).toEqual(['Uchiha', 'Senju']);
  });

  it('deve falhar quando clasHereditarios contiver string vazia', () => {
    const dto = plainToInstance(CreateTecnicaDto, {
      ...basePayload,
      clasHereditarios: [''],
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('clasHereditarios');
  });

  it('deve falhar quando clasHereditarios contiver apenas espacos', () => {
    const dto = plainToInstance(CreateTecnicaDto, {
      ...basePayload,
      clasHereditarios: ['   '],
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('clasHereditarios');
  });
});
