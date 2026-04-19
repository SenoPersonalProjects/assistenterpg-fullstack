import { Test, TestingModule } from '@nestjs/testing';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  ProficienciaProtecao,
  TipoEquipamento,
  TipoProtecao,
} from '@prisma/client';
import { ModificacoesService } from './modificacoes.service';

describe('ModificacoesService', () => {
  let service: ModificacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModificacoesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<ModificacoesService>(ModificacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('restricoes de protecao', () => {
    const modificacaoVestivel = {
      codigo: 'MOD_REFORCADA',
      nome: 'Reforcada',
      restricoes: {
        tiposEquipamento: [TipoEquipamento.PROTECAO],
        tiposProtecao: [TipoProtecao.VESTIVEL],
      },
    };

    it('aceita modificacoes em protecoes vestiveis', () => {
      const resultado = service.validarRestricoes(
        {
          id: 1,
          tipo: TipoEquipamento.PROTECAO,
          categoria: CategoriaEquipamento.CATEGORIA_0,
          complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
          proficienciaProtecao: ProficienciaProtecao.LEVE,
          tipoProtecao: TipoProtecao.VESTIVEL,
          tipoArma: null,
          proficienciaArma: null,
          alcance: null,
        },
        modificacaoVestivel,
      );

      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toEqual([]);
    });

    it('rejeita escudos e equipamentos sem tipoProtecao quando a modificacao exige protecao vestivel', () => {
      const escudo = service.validarRestricoes(
        {
          id: 2,
          tipo: TipoEquipamento.PROTECAO,
          categoria: CategoriaEquipamento.CATEGORIA_0,
          complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
          proficienciaProtecao: ProficienciaProtecao.ESCUDO,
          tipoProtecao: TipoProtecao.EMPUNHAVEL,
          tipoArma: null,
          proficienciaArma: null,
          alcance: null,
        },
        modificacaoVestivel,
      );

      const semTipoProtecao = service.validarRestricoes(
        {
          id: 3,
          tipo: TipoEquipamento.PROTECAO,
          categoria: CategoriaEquipamento.CATEGORIA_0,
          complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
          proficienciaProtecao: ProficienciaProtecao.LEVE,
          tipoProtecao: null,
          tipoArma: null,
          proficienciaArma: null,
          alcance: null,
        },
        modificacaoVestivel,
      );

      expect(escudo.valido).toBe(false);
      expect(semTipoProtecao.valido).toBe(false);
    });
  });
});
