import { BadRequestException } from '@nestjs/common';
import {
  CategoriaEquipamento,
  DestinoTransferenciaItemSessao,
  StatusTransferenciaItemSessao,
  TipoItemSessaoCampanha,
} from '@prisma/client';
import { CampanhaItensSessaoService } from './campanha.itens-sessao.service';

type CampanhaItensSessaoPrivado = {
  normalizarDadosItem(entrada: Record<string, unknown>): {
    nome: string;
    descricao: string | null;
    tipo: TipoItemSessaoCampanha;
    categoria: CategoriaEquipamento;
    peso: number;
    descricaoRevelada?: boolean;
  };
  mapearItem(
    item: Record<string, unknown>,
    acesso: { ehMestre: boolean },
    usuarioId: number,
  ): Record<string, unknown>;
};

function criarServico() {
  return new CampanhaItensSessaoService(
    {} as never,
    {} as never,
  ) as unknown as CampanhaItensSessaoPrivado;
}

describe('CampanhaItensSessaoService', () => {
  it('forca documentos para categoria 0 e peso 0', () => {
    const servico = criarServico();

    const resultado = servico.normalizarDadosItem({
      nome: '  Diario rasgado  ',
      descricao: '  paginas marcadas  ',
      tipo: TipoItemSessaoCampanha.DOCUMENTO,
      categoria: CategoriaEquipamento.CATEGORIA_2,
      peso: 9,
    });

    expect(resultado).toMatchObject({
      nome: 'Diario rasgado',
      descricao: 'paginas marcadas',
      tipo: TipoItemSessaoCampanha.DOCUMENTO,
      categoria: CategoriaEquipamento.CATEGORIA_0,
      peso: 0,
    });
  });

  it('forca pistas para categoria 0 sem zerar peso', () => {
    const servico = criarServico();

    const resultado = servico.normalizarDadosItem({
      nome: 'Marca de sangue',
      tipo: TipoItemSessaoCampanha.PISTA,
      categoria: CategoriaEquipamento.CATEGORIA_1,
      peso: 1.5,
    });

    expect(resultado.categoria).toBe(CategoriaEquipamento.CATEGORIA_0);
    expect(resultado.peso).toBe(1.5);
  });

  it('exige categoria para item geral', () => {
    const servico = criarServico();

    expect(() =>
      servico.normalizarDadosItem({
        nome: 'Caixa trancada',
        tipo: TipoItemSessaoCampanha.GERAL,
        peso: 2,
      }),
    ).toThrow(BadRequestException);
  });

  it('oculta descricao, sessao e cena para jogador quando item nao foi revelado', () => {
    const servico = criarServico();

    const item = {
      id: 1,
      campanhaId: 10,
      sessaoId: 20,
      cenaId: 30,
      personagemCampanhaId: null,
      nome: 'Relicario',
      descricao: 'Amaldicoado por dentro',
      descricaoRevelada: false,
      tipo: TipoItemSessaoCampanha.GERAL,
      categoria: CategoriaEquipamento.CATEGORIA_4,
      peso: 1,
      criadoEm: new Date('2026-04-10T00:00:00.000Z'),
      atualizadoEm: new Date('2026-04-10T00:00:00.000Z'),
      criadoPorId: 99,
      criadoPor: { id: 99, apelido: 'Mestre' },
      personagemCampanha: null,
    };

    const resultado = servico.mapearItem(item, { ehMestre: false }, 42);

    expect(resultado.descricao).toBeNull();
    expect(resultado.descricaoOculta).toBe(true);
    expect(resultado.sessaoId).toBeNull();
    expect(resultado.cenaId).toBeNull();
    expect(resultado.permissoes).toMatchObject({
      podeAtribuir: false,
      podeRevelar: false,
    });
  });

  it('mantem descricao, sessao e cena visiveis para o mestre', () => {
    const servico = criarServico();

    const item = {
      id: 1,
      campanhaId: 10,
      sessaoId: 20,
      cenaId: 30,
      personagemCampanhaId: null,
      nome: 'Relicario',
      descricao: 'Amaldicoado por dentro',
      descricaoRevelada: false,
      tipo: TipoItemSessaoCampanha.GERAL,
      categoria: CategoriaEquipamento.CATEGORIA_4,
      peso: 1,
      criadoEm: new Date('2026-04-10T00:00:00.000Z'),
      atualizadoEm: new Date('2026-04-10T00:00:00.000Z'),
      criadoPorId: 99,
      criadoPor: { id: 99, apelido: 'Mestre' },
      personagemCampanha: null,
    };

    const resultado = servico.mapearItem(item, { ehMestre: true }, 42);

    expect(resultado.descricao).toBe('Amaldicoado por dentro');
    expect(resultado.descricaoOculta).toBe(false);
    expect(resultado.sessaoId).toBe(20);
    expect(resultado.cenaId).toBe(30);
    expect(resultado.permissoes).toMatchObject({
      podeAtribuir: true,
      podeRevelar: true,
    });
  });

  it('marca item proprio como transferivel quando nao ha pendencia', () => {
    const servico = criarServico();

    const resultado = servico.mapearItem(
      {
        id: 2,
        campanhaId: 10,
        sessaoId: null,
        cenaId: null,
        personagemCampanhaId: 77,
        nome: 'Chave antiga',
        descricao: 'Ferrugem demais.',
        descricaoRevelada: true,
        tipo: TipoItemSessaoCampanha.GERAL,
        categoria: CategoriaEquipamento.CATEGORIA_0,
        peso: 1,
        criadoEm: new Date('2026-04-10T00:00:00.000Z'),
        atualizadoEm: new Date('2026-04-10T00:00:00.000Z'),
        criadoPorId: 42,
        criadoPor: { id: 42, apelido: 'Jogador' },
        personagemCampanha: {
          id: 77,
          nome: 'Iori',
          donoId: 42,
          personagemBase: { nome: 'Iori base' },
        },
        transferencias: [],
      },
      { ehMestre: false },
      42,
    );

    expect(resultado.permissoes).toMatchObject({
      podeTransferir: true,
    });
  });

  it('bloqueia nova transferencia quando item ja tem pendencia', () => {
    const servico = criarServico();

    const resultado = servico.mapearItem(
      {
        id: 2,
        campanhaId: 10,
        sessaoId: null,
        cenaId: null,
        personagemCampanhaId: 77,
        nome: 'Chave antiga',
        descricao: 'Ferrugem demais.',
        descricaoRevelada: true,
        tipo: TipoItemSessaoCampanha.GERAL,
        categoria: CategoriaEquipamento.CATEGORIA_0,
        peso: 1,
        criadoEm: new Date('2026-04-10T00:00:00.000Z'),
        atualizadoEm: new Date('2026-04-10T00:00:00.000Z'),
        criadoPorId: 42,
        criadoPor: { id: 42, apelido: 'Jogador' },
        personagemCampanha: {
          id: 77,
          nome: 'Iori',
          donoId: 42,
          personagemBase: { nome: 'Iori base' },
        },
        transferencias: [
          {
            id: 9,
            campanhaId: 10,
            itemId: 2,
            solicitanteId: 42,
            portadorAnteriorId: 77,
            destinoTipo: DestinoTransferenciaItemSessao.PERSONAGEM,
            destinoPersonagemCampanhaId: 88,
            destinoNpcSessaoId: null,
            status: StatusTransferenciaItemSessao.PENDENTE,
            criadaEm: new Date('2026-04-10T00:00:00.000Z'),
            respondidaEm: null,
            item: {
              id: 2,
              nome: 'Chave antiga',
              peso: 1,
              personagemCampanhaId: 77,
            },
            solicitante: { id: 42, apelido: 'Jogador' },
            portadorAnterior: {
              id: 77,
              nome: 'Iori',
              donoId: 42,
              personagemBase: { nome: 'Iori base' },
            },
            destinoPersonagemCampanha: {
              id: 88,
              nome: 'Maki',
              donoId: 43,
              personagemBase: { nome: 'Maki base' },
            },
            destinoNpcSessao: null,
          },
        ],
      },
      { ehMestre: false },
      42,
    );

    expect(resultado.transferenciaPendente).toMatchObject({ id: 9 });
    expect(resultado.permissoes).toMatchObject({
      podeTransferir: false,
    });
  });
});
