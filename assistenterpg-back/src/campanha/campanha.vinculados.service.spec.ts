import {
  EstadoEntidadeVinculadaPersonagem,
  TamanhoNpcAmeaca,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';
import { CampanhaVinculadosService } from './campanha.vinculados.service';

type PrismaMock = {
  personagemCampanhaEntidadeVinculada: {
    count: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  personagemCampanha: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
  };
  npcAmeaca: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
  };
  npcAmeacaSessao: {
    findFirst: jest.Mock;
  };
};

type AccessMock = {
  obterPersonagemCampanhaComPermissao: jest.Mock;
  garantirAcesso: jest.Mock;
};

const acessoMestre = { ehMestre: true };
const acessoDono = { ehMestre: false };

function criarPrismaMock(): PrismaMock {
  return {
    personagemCampanhaEntidadeVinculada: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    personagemCampanha: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    npcAmeaca: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    npcAmeacaSessao: {
      findFirst: jest.fn(),
    },
  };
}

function criarServico() {
  const prisma = criarPrismaMock();
  const access: AccessMock = {
    obterPersonagemCampanhaComPermissao: jest.fn(),
    garantirAcesso: jest.fn(),
  };
  const service = new CampanhaVinculadosService(
    prisma as never,
    access as never,
  );
  return { service, prisma, access };
}

function criarOrigemMaldicao(overrides: Record<string, unknown> = {}) {
  return {
    id: 99,
    nome: 'Maldicao de teste',
    descricao: 'Descricao original',
    fichaTipo: TipoFichaNpcAmeaca.AMEACA,
    tipo: TipoNpcAmeaca.MALDICAO,
    tamanho: TamanhoNpcAmeaca.MEDIO,
    vd: 4,
    agilidade: 1,
    forca: 2,
    intelecto: 0,
    presenca: 1,
    vigor: 3,
    percepcao: 5,
    iniciativa: 6,
    fortitude: 7,
    reflexos: 8,
    vontade: 9,
    luta: 10,
    jujutsu: 11,
    defesa: 18,
    pontosVida: 61,
    deslocamentoMetros: 9,
    periciasEspeciais: [{ nome: 'Faro', bonus: 5 }],
    resistencias: [{ tipo: 'fisico', valor: 5 }],
    vulnerabilidades: null,
    passivas: [{ nome: 'Presenca hostil' }],
    acoes: [{ nome: 'Garras' }],
    usoTatico: 'Usa emboscadas.',
    ...overrides,
  };
}

function criarEntidadeMapeavel(data: Record<string, unknown> = {}) {
  const agora = new Date('2026-07-12T00:00:00.000Z');
  return {
    id: 500,
    campanhaId: 10,
    personagemCampanhaId: 20,
    tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
    estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
    nome: 'Vinculado',
    descricao: null,
    conceito: null,
    aparencia: null,
    nivelReferencia: null,
    grauReferencia: null,
    tecnicaOrigemId: null,
    tipoGrauCodigo: null,
    npcAmeacaOrigemId: null,
    fichaTipo: TipoFichaNpcAmeaca.NPC,
    tipoNpc: TipoNpcAmeaca.OUTRO,
    tamanho: TamanhoNpcAmeaca.MEDIO,
    vd: 0,
    agilidade: 0,
    forca: 0,
    intelecto: 0,
    presenca: 0,
    vigor: 0,
    percepcao: 0,
    iniciativa: 0,
    fortitude: 0,
    reflexos: 0,
    vontade: 0,
    luta: 0,
    jujutsu: 0,
    defesa: 10,
    pontosVidaMax: 1,
    pontosVidaAtual: 1,
    rd: 0,
    deslocamentoMetros: 6,
    vagasOcupadas: 1,
    cargasMax: null,
    cargasAtual: null,
    periciasEspeciais: null,
    resistencias: null,
    vulnerabilidades: null,
    passivas: null,
    acoes: null,
    habilidades: null,
    custos: null,
    limites: null,
    config: null,
    criadoPorId: 1,
    criadoEm: agora,
    atualizadoEm: agora,
    personagemCampanha: {
      id: 20,
      nome: 'Personagem',
      nivel: 5,
      donoId: 2,
      personagemBase: { nome: 'Personagem Base' },
    },
    tecnicaOrigem: null,
    tipoGrau: null,
    npcAmeacaOrigem: null,
    criadoPor: { id: 1, apelido: 'Mestre' },
    instanciasSessao: [],
    ...data,
  };
}

function mockCreateRetornandoDados(prisma: PrismaMock) {
  prisma.personagemCampanhaEntidadeVinculada.create.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(criarEntidadeMapeavel(data)),
  );
}

describe('CampanhaVinculadosService', () => {
  it('copia maldicao controlada e aplica reducao de PV no snapshot', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoMestre,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.npcAmeaca.findUnique.mockResolvedValue(criarOrigemMaldicao());
    mockCreateRetornandoDados(prisma);

    const resultado = await service.criar(10, 20, 1, {
      tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
      nome: 'Maldicao capturada',
      npcAmeacaOrigemId: 99,
    });

    const data =
      prisma.personagemCampanhaEntidadeVinculada.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      campanhaId: 10,
      personagemCampanhaId: 20,
      tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
      nome: 'Maldicao capturada',
      tipoNpc: TipoNpcAmeaca.MALDICAO,
      pontosVidaMax: 40,
      pontosVidaAtual: 40,
      npcAmeacaOrigemId: 99,
    });
    expect(data.config).toMatchObject({
      pvOriginal: 61,
      pvControlado: 40,
      reducaoPv: 21,
    });
    expect(resultado.pontosVidaMax).toBe(40);
  });

  it('bloqueia maldicao controlada criada por jogador', async () => {
    const { service, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
        nome: 'Maldicao',
        npcAmeacaOrigemId: 99,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_APENAS_MESTRE' });
  });

  it('bloqueia shikigami de personagem sem tecnica compativel', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: null,
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Sapo',
      }),
    ).rejects.toMatchObject({
      code: 'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
    });
    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).not.toHaveBeenCalled();
  });

  it('permite shikigami para personagem com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'DEZ_SOMBRAS' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    mockCreateRetornandoDados(prisma);

    await service.criar(10, 20, 2, {
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Cao Divino',
      defesa: 14,
      pontosVidaMax: 18,
    });

    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
          nome: 'Cao Divino',
          defesa: 14,
          pontosVidaMax: 18,
          pontosVidaAtual: 18,
        }),
      }),
    );
  });

  it('preserva conceito no snapshot manual', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'TECNICA_SHIKIGAMI' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    mockCreateRetornandoDados(prisma);

    const resultado = await service.criar(10, 20, 2, {
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Sapo',
      conceito: 'sapo rastreador',
    });

    const data =
      prisma.personagemCampanhaEntidadeVinculada.create.mock.calls[0][0].data;
    expect(data.conceito).toBe('sapo rastreador');
    expect(resultado.conceito).toBe('sapo rastreador');
  });

  it('bloqueia PV atual maior que PV maximo na criacao', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'TECNICA_SHIKIGAMI' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Sapo',
        pontosVidaMax: 10,
        pontosVidaAtual: 11,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_PV_INVALIDO' });
    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).not.toHaveBeenCalled();
  });

  it('bloqueia reducao de PV maximo abaixo do PV atual efetivo', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'TECNICA_SHIKIGAMI' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      criarEntidadeMapeavel({ pontosVidaMax: 20, pontosVidaAtual: 12 }),
    );

    await expect(
      service.atualizar(10, 20, 2, 500, {
        pontosVidaMax: 10,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_PV_INVALIDO' });
    expect(
      prisma.personagemCampanhaEntidadeVinculada.update,
    ).not.toHaveBeenCalled();
  });

  it('bloqueia segundo shikigami generico cadastrado', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'TECNICA_SHIKIGAMI' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    prisma.personagemCampanhaEntidadeVinculada.count.mockResolvedValue(1);

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Segundo',
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO' });
  });

  it('permite ate dez shikigamis cadastrados com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'DEZ_SOMBRAS' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    prisma.personagemCampanhaEntidadeVinculada.count.mockResolvedValue(9);
    mockCreateRetornandoDados(prisma);

    await service.criar(10, 20, 2, {
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Decimo',
    });

    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalled();
  });

  it('bloqueia decimo primeiro shikigami com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanha.findUnique.mockResolvedValue({
      tecnicaInata: { codigo: 'DEZ_SOMBRAS' },
      tecnicaInataPropria: null,
      personagemBase: {
        tecnicaInata: null,
        tecnicaInataPropria: null,
      },
      tecnicasAprendidas: [],
    });
    prisma.personagemCampanhaEntidadeVinculada.count.mockResolvedValue(10);

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Decimo primeiro',
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO' });
  });

  it('permite mestre ultrapassar limite de cadastro com override', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoMestre,
      personagem: { id: 20, donoId: 2 },
    });
    mockCreateRetornandoDados(prisma);

    await service.criar(10, 20, 1, {
      tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Extra',
      overrideMestre: true,
    });

    expect(prisma.personagemCampanha.findUnique).not.toHaveBeenCalled();
    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalled();
  });

  it('concede maldicao controlada apenas pelo mestre', async () => {
    const { service, prisma, access } = criarServico();
    access.garantirAcesso.mockResolvedValue(acessoMestre);
    prisma.personagemCampanha.findFirst.mockResolvedValue({
      id: 20,
      donoId: 2,
    });
    prisma.npcAmeaca.findFirst.mockResolvedValue(
      criarOrigemMaldicao({ id: 77, pontosVida: 30 }),
    );
    mockCreateRetornandoDados(prisma);

    await service.concederMaldicaoControlada(10, 1, {
      personagemCampanhaId: 20,
      npcAmeacaId: 77,
    });

    const data =
      prisma.personagemCampanhaEntidadeVinculada.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      campanhaId: 10,
      personagemCampanhaId: 20,
      tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
      pontosVidaMax: 20,
      pontosVidaAtual: 20,
    });
  });
});
