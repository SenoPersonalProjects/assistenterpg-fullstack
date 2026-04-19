import { Test, TestingModule } from '@nestjs/testing';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  ProficienciaProtecao,
  TipoEquipamento,
  TipoFonte,
  TipoProtecao,
} from '@prisma/client';
import { EquipamentosService } from './equipamentos.service';

describe('EquipamentosService', () => {
  let service: EquipamentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipamentosService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<EquipamentosService>(EquipamentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve expor tipoProtecao no resumo de equipamentos', () => {
    const resumo = (service as unknown as { mapResumo: (e: unknown) => unknown }).mapResumo({
      id: 1,
      codigo: 'PROTECAO_LEVE',
      nome: 'Protecao Leve',
      descricao: null,
      tipo: TipoEquipamento.PROTECAO,
      fonte: TipoFonte.SISTEMA_BASE,
      suplementoId: null,
      categoria: CategoriaEquipamento.CATEGORIA_0,
      espacos: 2,
      complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
      proficienciaArma: null,
      proficienciaProtecao: ProficienciaProtecao.LEVE,
      tipoProtecao: TipoProtecao.VESTIVEL,
      alcance: null,
      tipoAcessorio: null,
      tipoArma: null,
      subtipoDistancia: null,
      tipoUso: null,
      tipoAmaldicoado: null,
      efeito: null,
      armaAmaldicoada: null,
      protecaoAmaldicoada: null,
      artefatoAmaldicoado: null,
    });

    expect(resumo).toMatchObject({
      codigo: 'PROTECAO_LEVE',
      tipoProtecao: TipoProtecao.VESTIVEL,
      proficienciaProtecao: ProficienciaProtecao.LEVE,
    });
  });
});
