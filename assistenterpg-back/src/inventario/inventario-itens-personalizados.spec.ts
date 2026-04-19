import { BadRequestException } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CampanhaInventarioService } from '../campanha/campanha.inventario.service';
import { isModificacaoCompativel } from '../../prisma/seeds/relacoes/equipamentos-modificacoes-aplicaveis';

type ValidadorItemPersonalizado = {
  validarEstadoItemPersonalizado(
    db: { pericia: { findUnique: jest.Mock } },
    equipamento: { codigo: string },
    estado: unknown,
  ): Promise<unknown>;
};

function criarDb(periciaExiste = true) {
  return {
    pericia: {
      findUnique: jest
        .fn()
        .mockResolvedValue(periciaExiste ? { codigo: 'PERCEPCAO' } : null),
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
    '$nome exige pericia escolhida para item personalizado',
    async ({ criarServico }) => {
      const servico = criarServico();
      const db = criarDb();

      for (const codigo of [
        'KIT_PERICIA_PERSONALIZADO',
        'UTENSILIO_PERSONALIZADO',
        'VESTIMENTA_PERSONALIZADA',
      ]) {
        await expect(
          servico.validarEstadoItemPersonalizado(db, { codigo }, {}),
        ).rejects.toBeInstanceOf(BadRequestException);
      }

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
          { codigo: 'KIT_PERICIA_PERSONALIZADO' },
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

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'VESTIMENTA_PERSONALIZADA' },
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

      const estadoNormalizado = await servico.validarEstadoItemPersonalizado(
        db,
        { codigo: 'KIT_PERICIA_PERSONALIZADO' },
        { periciaCodigo: 'percepcao' },
      );

      expect(estadoNormalizado).toEqual({ periciaCodigo: 'PERCEPCAO' });

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'UTENSILIO_PERSONALIZADO' },
          { periciaCodigo: '  reflexos ', origem: 'teste' },
        ),
      ).resolves.toEqual({ periciaCodigo: 'REFLEXOS', origem: 'teste' });

      await expect(
        servico.validarEstadoItemPersonalizado(
          db,
          { codigo: 'VESTIMENTA_PERSONALIZADA' },
          { periciaCodigo: 'medicina' },
        ),
      ).resolves.toEqual({ periciaCodigo: 'MEDICINA' });

      expect(db.pericia.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'PERCEPCAO' },
        select: { codigo: true },
      });
      expect(db.pericia.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'REFLEXOS' },
        select: { codigo: true },
      });
      expect(db.pericia.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'MEDICINA' },
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
          { codigo: 'KIT_PERICIA_PERSONALIZADO' },
          { periciaCodigo: 'INEXISTENTE' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('mantem kits, utensilios e vestimentas personalizados compativeis com modificacoes de acessorio', () => {
    const modificacaoAcessorio = {
      id: 10,
      tipo: 'ACESSORIO',
      restricoes: null,
    };

    expect(
      isModificacaoCompativel(modificacaoAcessorio, {
        id: 19,
        tipo: 'ACESSORIO',
        tipoAcessorio: 'KIT_PERICIA',
        tipoArma: null,
        subtipoDistancia: null,
        proficienciaArma: null,
        proficienciaProtecao: null,
        tipoProtecao: null,
        alcance: null,
        complexidadeMaldicao: 'NENHUMA',
      }),
    ).toBe(true);

    expect(
      isModificacaoCompativel(modificacaoAcessorio, {
        id: 20,
        tipo: 'ACESSORIO',
        tipoAcessorio: 'UTENSILIO',
        tipoArma: null,
        subtipoDistancia: null,
        proficienciaArma: null,
        proficienciaProtecao: null,
        tipoProtecao: null,
        alcance: null,
        complexidadeMaldicao: 'NENHUMA',
      }),
    ).toBe(true);

    expect(
      isModificacaoCompativel(modificacaoAcessorio, {
        id: 21,
        tipo: 'ACESSORIO',
        tipoAcessorio: 'VESTIMENTA',
        tipoArma: null,
        subtipoDistancia: null,
        proficienciaArma: null,
        proficienciaProtecao: null,
        tipoProtecao: null,
        alcance: null,
        complexidadeMaldicao: 'NENHUMA',
      }),
    ).toBe(true);
  });

  it('respeita restricoes especificas de tipo de acessorio nas modificacoes', () => {
    const modificacaoVestimenta = {
      id: 11,
      tipo: 'ACESSORIO',
      restricoes: { tiposAcessorio: ['VESTIMENTA'] },
    };

    expect(
      isModificacaoCompativel(modificacaoVestimenta, {
        id: 22,
        tipo: 'ACESSORIO',
        tipoAcessorio: 'VESTIMENTA',
        tipoArma: null,
        subtipoDistancia: null,
        proficienciaArma: null,
        proficienciaProtecao: null,
        tipoProtecao: null,
        alcance: null,
        complexidadeMaldicao: 'NENHUMA',
      }),
    ).toBe(true);

    expect(
      isModificacaoCompativel(modificacaoVestimenta, {
        id: 23,
        tipo: 'ACESSORIO',
        tipoAcessorio: 'UTENSILIO',
        tipoArma: null,
        subtipoDistancia: null,
        proficienciaArma: null,
        proficienciaProtecao: null,
        tipoProtecao: null,
        alcance: null,
        complexidadeMaldicao: 'NENHUMA',
      }),
    ).toBe(false);
  });
});
