import { BadRequestException } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CampanhaInventarioService } from '../campanha/campanha.inventario.service';

type ValidadorItemPersonalizado = {
  validarEstadoItemPersonalizado(
    db: { pericia: { findUnique: jest.Mock } },
    equipamento: { codigo: string },
    estado: unknown,
  ): Promise<void>;
};

function criarDb(periciaExiste = true) {
  return {
    pericia: {
      findUnique: jest.fn().mockResolvedValue(
        periciaExiste ? { codigo: 'PERCEPCAO' } : null,
      ),
    },
  };
}

describe('itens personalizados de inventario', () => {
  const casos = [
    {
      nome: 'inventario base',
      criarServico: () =>
        new InventarioService(
          {} as never,
          {} as never,
          {} as never,
        ) as unknown as ValidadorItemPersonalizado,
    },
    {
      nome: 'inventario de campanha',
      criarServico: () =>
        new CampanhaInventarioService(
          {} as never,
          {} as never,
          {} as never,
          {} as never,
        ) as unknown as ValidadorItemPersonalizado,
    },
  ];

  it.each(casos)(
    '$nome exige pericia escolhida para utensilio/vestimenta personalizados',
    async ({ criarServico }) => {
      const servico = criarServico();
      const db = criarDb();

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'UTENSILIO_PERSONALIZADO' },
          {},
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(db.pericia.findUnique).not.toHaveBeenCalled();
    },
  );

  it.each(casos)(
    '$nome rejeita Luta e Pontaria como pericia de item personalizado',
    async ({ criarServico }) => {
      const servico = criarServico();
      const db = criarDb();

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'VESTIMENTA_PERSONALIZADA' },
          { periciaCodigo: 'luta' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'UTENSILIO_PERSONALIZADO' },
          { periciaCodigo: 'PONTARIA' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(db.pericia.findUnique).not.toHaveBeenCalled();
    },
  );

  it.each(casos)(
    '$nome aceita pericia valida e normaliza codigo para maiusculas',
    async ({ criarServico }) => {
      const servico = criarServico();
      const db = criarDb();

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'UTENSILIO_PERSONALIZADO' },
          { periciaCodigo: 'percepcao' },
        ),
      ).resolves.toBeUndefined();

      expect(db.pericia.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'PERCEPCAO' },
        select: { codigo: true },
      });
    },
  );

  it.each(casos)(
    '$nome rejeita pericia inexistente em item personalizado',
    async ({ criarServico }) => {
      const servico = criarServico();
      const db = criarDb(false);

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'VESTIMENTA_PERSONALIZADA' },
          { periciaCodigo: 'INEXISTENTE' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});
