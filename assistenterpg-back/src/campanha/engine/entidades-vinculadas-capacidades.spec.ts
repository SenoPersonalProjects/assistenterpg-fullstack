import {
  ModoVinculadoTecnica,
  TipoEntidadeVinculadaPersonagem,
} from '@prisma/client';
import {
  calcularFichaAutomaticaVinculado,
  normalizarConfigVinculado,
  resolverLimiteVagasCorpos,
  resolverTetoAtributoVinculado,
} from './entidades-vinculadas-capacidades';

const distribuicaoVazia = {
  agilidade: 0,
  forca: 0,
  intelecto: 0,
  presenca: 0,
  vigor: 0,
  luta: 0,
  pontaria: 0,
  jujutsu: 0,
  fortitude: 0,
  reflexos: 0,
  vontade: 0,
};

describe('engine de capacidades de entidades vinculadas', () => {
  it('calcula pools e derivados de shikigami pelo nivel, grau e papel', () => {
    const calculo = calcularFichaAutomaticaVinculado({
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nivel: 5,
      grau: 1,
      maiorAtributoDono: 4,
      testeJujutsuDono: 10,
      limitePeEaPorTurno: 3,
      papel: 'FLEXIVEL',
      distribuicao: {
        ...distribuicaoVazia,
        agilidade: 2,
        forca: 2,
        intelecto: 1,
        presenca: 1,
        vigor: 2,
        luta: 10,
        pontaria: 10,
        jujutsu: 10,
        fortitude: 10,
        reflexos: 10,
        vontade: 10,
      },
    });

    expect(calculo.pools).toMatchObject({
      atributosMax: 8,
      atributosDistribuidos: 8,
      ataquesMax: 30,
      ataquesDistribuidos: 30,
      resistenciasMax: 30,
      resistenciasDistribuidas: 30,
      tetoAtributo: 3,
      tetoAtaque: 12,
      tetoResistencia: 13,
    });
    expect(calculo.derivados).toEqual({
      pontosVidaMax: 50,
      defesa: 12,
      rd: 6,
    });
    expect(calculo.pendencias).toEqual({
      atributos: 0,
      ataques: 0,
      resistencias: 0,
    });
  });

  it('preserva distribuicao e aponta pendencias ou excedentes no recalculo', () => {
    const distribuicao = {
      ...distribuicaoVazia,
      agilidade: 2,
      forca: 1,
      intelecto: 1,
      presenca: 1,
      vigor: 1,
    };
    const depoisDeSubirNivel = calcularFichaAutomaticaVinculado({
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nivel: 9,
      grau: 0,
      maiorAtributoDono: 3,
      testeJujutsuDono: 5,
      limitePeEaPorTurno: 3,
      papel: 'AGIL',
      distribuicao,
    });
    const depoisDePerderGrau = calcularFichaAutomaticaVinculado({
      tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
      nivel: 1,
      grau: 0,
      maiorAtributoDono: 3,
      testeJujutsuDono: 5,
      limitePeEaPorTurno: 2,
      papel: 'AGIL',
      distribuicao,
    });

    expect(depoisDeSubirNivel.pendencias.atributos).toBe(3);
    expect(depoisDeSubirNivel.pools.atributosDistribuidos).toBe(6);
    expect(depoisDePerderGrau.excedentes.atributos).toBe(3);
    expect(depoisDePerderGrau.pools.atributosDistribuidos).toBe(6);
  });

  it('compartilha o pool de pericias do shikigami com pericias nao obrigatorias', () => {
    const calculo = calcularFichaAutomaticaVinculado({
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nivel: 1,
      grau: 0,
      maiorAtributoDono: 3,
      testeJujutsuDono: 5,
      limitePeEaPorTurno: 2,
      papel: 'FLEXIVEL',
      distribuicao: {
        ...distribuicaoVazia,
        luta: 5,
        pontaria: 5,
        jujutsu: 5,
        percepcao: 5,
        periciasExtras: { INTUICAO: 5 },
      },
    });

    expect(calculo.pools.ataquesMax).toBe(20);
    expect(calculo.pools.ataquesDistribuidos).toBe(25);
    expect(calculo.excedentes.ataques).toBe(5);
  });

  it('resolve vagas e tetos por faixa de nivel', () => {
    expect([1, 5, 9, 13, 17].map(resolverLimiteVagasCorpos)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(resolverTetoAtributoVinculado(5, 7)).toBe(3);
    expect(resolverTetoAtributoVinculado(14, 4)).toBe(4);
    expect(resolverTetoAtributoVinculado(17, 6)).toBe(6);
  });

  it('normaliza configuracao de corpos com limites por vagas', () => {
    const config = normalizarConfigVinculado(
      {
        id: 1,
        tecnicaId: 2,
        tipoVinculado: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        modo: ModoVinculadoTecnica.CRIAVEL,
        limitesJson: {
          cadastro: { tipo: 'VAGAS_POR_NIVEL' },
          ativo: { tipo: 'VAGAS_POR_NIVEL' },
        },
        regrasJson: {
          permiteCriarNovos: true,
          tipoGrauCodigo: 'TECNICA_CADAVERES',
        },
        calculoJson: { regra: 'CORPO_AMALDICOADO_V1', versao: '1.0.0' },
        tecnica: { codigo: 'MANIPULACAO_FANTOCHES', nome: 'Fantoches' },
      },
      6,
    );

    expect(config).toMatchObject({
      limiteCadastro: 2,
      limiteAtivo: 2,
      unidadeCadastro: 'VAGAS',
      unidadeAtivo: 'VAGAS',
      tipoGrauCodigo: 'TECNICA_CADAVERES',
    });
  });
});
