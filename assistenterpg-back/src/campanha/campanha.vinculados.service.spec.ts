import {
  EstadoEntidadeVinculadaPersonagem,
  ModoVinculadoTecnica,
  TamanhoNpcAmeaca,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';
import { CampanhaVinculadosService } from './campanha.vinculados.service';

type PrismaMock = {
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
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
    findMany: jest.Mock;
  };
  tecnicaVinculadoConfig: {
    findMany: jest.Mock;
  };
  tecnicaVinculadoTemplate: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
  };
};

type AccessMock = {
  obterPersonagemCampanhaComPermissao: jest.Mock;
  garantirAcesso: jest.Mock;
};

const acessoMestre = { ehMestre: true };
const acessoDono = { ehMestre: false };

function criarTecnica(codigo = 'NAOINATA_TECNICA_SHIKIGAMI', id = 101) {
  return { id, codigo, nome: codigo, tecnicaBase: null };
}

function criarPersonagemAutomacao(
  tecnica: ReturnType<typeof criarTecnica> | null = criarTecnica(),
) {
  return {
    id: 20,
    donoId: 2,
    nivel: 5,
    limitePeEaPorTurno: 3,
    tecnicaInata: tecnica,
    tecnicaInataPropria: null,
    tecnicasAprendidas: [],
    grausAprimoramento: [
      {
        valor: 1,
        tipoGrau: { codigo: 'TECNICA_SHIKIGAMI', nome: 'Shikigami' },
      },
    ],
    modificadores: [],
    personagemBase: {
      agilidade: 3,
      forca: 2,
      intelecto: 2,
      presenca: 1,
      vigor: 2,
      tecnicaInata: null,
      tecnicaInataPropria: null,
      tecnicasAprendidas: [],
      grausAprimoramento: [],
      pericias: [
        {
          grauTreinamento: 1,
          bonusExtra: 0,
          pericia: {
            codigo: 'JUJUTSU',
            nome: 'Jujutsu',
            atributoBase: 'INTELECTO',
          },
        },
      ],
    },
  };
}

function criarConfigTecnica(
  tecnica = criarTecnica(),
  opcoes: {
    tipo?: TipoEntidadeVinculadaPersonagem;
    modo?: ModoVinculadoTecnica;
    limiteCadastro?: number | null;
    limiteAtivo?: number | null;
    permiteCriarNovos?: boolean;
    usaTemplates?: boolean;
    tipoGrauCodigo?: string | null;
    usaVagasPorNivel?: boolean;
  } = {},
) {
  const limite = (valor: number | null) =>
    valor === null ? { tipo: 'ILIMITADO' } : { tipo: 'QUANTIDADE', valor };
  return {
    id: tecnica.id + 1000,
    tecnicaId: tecnica.id,
    tipoVinculado: opcoes.tipo ?? TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
    modo: opcoes.modo ?? ModoVinculadoTecnica.CRIAVEL,
    limitesJson: opcoes.usaVagasPorNivel
      ? {
          cadastro: { tipo: 'VAGAS_POR_NIVEL' },
          ativo: { tipo: 'VAGAS_POR_NIVEL' },
        }
      : {
          cadastro: limite(
            opcoes.limiteCadastro === undefined ? 1 : opcoes.limiteCadastro,
          ),
          ativo: limite(
            opcoes.limiteAtivo === undefined ? 1 : opcoes.limiteAtivo,
          ),
        },
    regrasJson: {
      permiteCriarNovos: opcoes.permiteCriarNovos ?? true,
      usaTemplates: opcoes.usaTemplates ?? false,
      tipoGrauCodigo:
        opcoes.tipoGrauCodigo === undefined
          ? 'TECNICA_SHIKIGAMI'
          : opcoes.tipoGrauCodigo,
    },
    calculoJson: { regra: 'SHIKIGAMI_V1', versao: '1.0.0' },
    tecnica: { codigo: tecnica.codigo, nome: tecnica.nome },
  };
}

function criarPrismaMock(): PrismaMock {
  const tecnica = criarTecnica();
  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 20 }]),
    $transaction: jest.fn(),
    personagemCampanhaEntidadeVinculada: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    personagemCampanha: {
      findFirst: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(criarPersonagemAutomacao()),
    },
    npcAmeaca: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    npcAmeacaSessao: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    tecnicaVinculadoConfig: {
      findMany: jest.fn().mockResolvedValue([criarConfigTecnica(tecnica)]),
    },
    tecnicaVinculadoTemplate: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  prisma.$transaction.mockImplementation(
    (callback: (tx: PrismaMock) => unknown) => callback(prisma),
  );
  return prisma;
}

function mockTecnica(
  prisma: PrismaMock,
  tecnica: ReturnType<typeof criarTecnica> | null,
  config?: ReturnType<typeof criarConfigTecnica>,
) {
  prisma.personagemCampanha.findUnique.mockResolvedValue(
    criarPersonagemAutomacao(tecnica),
  );
  prisma.tecnicaVinculadoConfig.findMany.mockResolvedValue(
    config ? [config] : [],
  );
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
    templateId: null,
    precisaRecalculo: false,
    calculoAutomatico: null,
    overrideMestre: false,
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
    template: null,
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

function serializarTransacoesNoMock(prisma: PrismaMock) {
  let fila = Promise.resolve<unknown>(undefined);
  prisma.$transaction.mockImplementation(
    (callback: (tx: PrismaMock) => Promise<unknown>) => {
      const resultado = fila.then(() => callback(prisma));
      fila = resultado.then(
        () => undefined,
        () => undefined,
      );
      return resultado;
    },
  );
}

describe('CampanhaVinculadosService', () => {
  it('copia maldicao controlada e aplica reducao de PV no snapshot', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoMestre,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.npcAmeaca.findFirst.mockResolvedValue(criarOrigemMaldicao());
    mockCreateRetornandoDados(prisma);

    const resultado = await service.criar(10, 20, 1, {
      tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
      nome: 'Maldicao capturada',
      npcAmeacaOrigemId: 99,
      overrideMestre: true,
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

  it('bloqueia maldicao controlada sem tecnica compativel', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    mockTecnica(prisma, null);

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
        nome: 'Maldicao',
        npcAmeacaOrigemId: 99,
      }),
    ).rejects.toMatchObject({
      code: 'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
    });
  });

  it('bloqueia shikigami de personagem sem tecnica compativel', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    mockTecnica(prisma, null);

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

  it('bloqueia criacao manual de shikigami com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('DEZ_SOMBRAS', 102);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        modo: ModoVinculadoTecnica.PREDEFINIDOS,
        limiteCadastro: 10,
        permiteCriarNovos: false,
        usaTemplates: true,
      }),
    );

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Cao Divino',
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_CRIACAO_MANUAL_BLOQUEADA' });
  });

  it('preserva conceito no snapshot manual', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
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
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockResolvedValue([
      { vagasOcupadas: 1 },
    ]);

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Segundo',
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO' });
  });

  it('permite associar ate dez templates com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('DEZ_SOMBRAS', 102);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        modo: ModoVinculadoTecnica.PREDEFINIDOS,
        limiteCadastro: 10,
        permiteCriarNovos: false,
        usaTemplates: true,
      }),
    );
    prisma.tecnicaVinculadoTemplate.findFirst.mockResolvedValue({
      id: 301,
      tecnicaId: tecnica.id,
      tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Mahoraga',
      descricao: null,
      conceito: null,
      aparencia: null,
      snapshotJson: {},
      tecnica: { id: tecnica.id, codigo: tecnica.codigo, nome: tecnica.nome },
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      null,
    );
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockResolvedValue(
      Array.from({ length: 9 }, () => ({ vagasOcupadas: 1 })),
    );
    mockCreateRetornandoDados(prisma);

    await service.associarTemplate(10, 20, 2, 301, {});

    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalled();
  });

  it('bloqueia decimo primeiro template com Dez Sombras', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('DEZ_SOMBRAS', 102);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        modo: ModoVinculadoTecnica.PREDEFINIDOS,
        limiteCadastro: 10,
        permiteCriarNovos: false,
        usaTemplates: true,
      }),
    );
    prisma.tecnicaVinculadoTemplate.findFirst.mockResolvedValue({
      id: 302,
      tecnicaId: tecnica.id,
      tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Nue',
      descricao: null,
      conceito: null,
      aparencia: null,
      snapshotJson: {},
      tecnica: { id: tecnica.id, codigo: tecnica.codigo, nome: tecnica.nome },
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      null,
    );
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockResolvedValue(
      Array.from({ length: 10 }, () => ({ vagasOcupadas: 1 })),
    );

    await expect(
      service.associarTemplate(10, 20, 2, 302, {}),
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

  it('nega override de limites para jogador comum', async () => {
    const { service, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Extra',
        overrideMestre: true,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_OVERRIDE_NEGADO' });
  });

  it('respeita vagas de cadastro de corpo pesado pelo nivel', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('MANIPULACAO_FANTOCHES', 103);
    const personagemNivel1 = criarPersonagemAutomacao(tecnica);
    personagemNivel1.nivel = 1;
    prisma.personagemCampanha.findUnique.mockResolvedValue(personagemNivel1);
    prisma.tecnicaVinculadoConfig.findMany.mockResolvedValue([
      criarConfigTecnica(tecnica, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        tipoGrauCodigo: 'TECNICA_CADAVERES',
        usaVagasPorNivel: true,
      }),
    ]);

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        nome: 'Corpo pesado',
        vagasOcupadas: 2,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_LIMITE_CADASTRO' });

    const personagemNivel5 = criarPersonagemAutomacao(tecnica);
    prisma.personagemCampanha.findUnique.mockResolvedValue(personagemNivel5);
    mockCreateRetornandoDados(prisma);
    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        nome: 'Corpo pesado',
        vagasOcupadas: 2,
      }),
    ).resolves.toBeDefined();
  });

  it('nao permite aumentar vagas por edicao acima da capacidade', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('MANIPULACAO_FANTOCHES', 103);
    const personagem = criarPersonagemAutomacao(tecnica);
    personagem.nivel = 1;
    prisma.personagemCampanha.findUnique.mockResolvedValue(personagem);
    prisma.tecnicaVinculadoConfig.findMany.mockResolvedValue([
      criarConfigTecnica(tecnica, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        tipoGrauCodigo: 'TECNICA_CADAVERES',
        usaVagasPorNivel: true,
      }),
    ]);
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      criarEntidadeMapeavel({
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        tecnicaOrigemId: tecnica.id,
        vagasOcupadas: 1,
      }),
    );

    await expect(
      service.atualizar(10, 20, 2, 500, { vagasOcupadas: 2 }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_LIMITE_CADASTRO' });
  });

  it('nao permite duplicar para contornar limite de cadastro', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      criarEntidadeMapeavel({ tecnicaOrigemId: 101 }),
    );
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockResolvedValue([
      { vagasOcupadas: 1 },
    ]);

    await expect(service.duplicar(10, 20, 2, 500)).rejects.toMatchObject({
      code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO',
    });
  });

  it('rejeita tecnica de origem que nao habilita o tipo escolhido', async () => {
    const { service, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });

    await expect(
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Origem invalida',
        tecnicaOrigemId: 999,
      }),
    ).rejects.toMatchObject({ code: 'ENTIDADE_TECNICA_ORIGEM_INVALIDA' });
  });

  it('lista capacidades de cadastro e atividade resolvidas pela tecnica', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });

    const resultado = await service.listarCapacidades(10, 20, 2);

    expect(resultado.tipos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
          habilitado: true,
          cadastro: expect.objectContaining({ usado: 0, maximo: 1 }),
          ativo: expect.objectContaining({ usado: 0, maximo: 1 }),
        }),
      ]),
    );
    expect(prisma.npcAmeacaSessao.findMany).toHaveBeenCalled();
  });

  it('recalcula vinculado automatico preservando distribuicao', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      criarEntidadeMapeavel({
        tecnicaOrigemId: 101,
        precisaRecalculo: true,
        calculoAutomatico: {
          derivados: { pontosVidaMax: 30 },
          papel: 'FLEXIVEL',
        },
        agilidade: 2,
        forca: 1,
        intelecto: 1,
        presenca: 1,
        vigor: 1,
      }),
    );
    prisma.personagemCampanhaEntidadeVinculada.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve(criarEntidadeMapeavel(data)),
    );

    const resultado = await service.recalcular(10, 20, 2, 500);

    expect(resultado.precisaRecalculo).toBe(false);
    expect(resultado.calculoAutomatico).toMatchObject({
      versaoRegra: '1.0.0',
      pools: { atributosDistribuidos: 6, atributosMax: 8 },
      pendencias: { atributos: 2 },
    });
    expect(
      prisma.personagemCampanhaEntidadeVinculada.update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ precisaRecalculo: false }),
      }),
    );
  });

  it('permite jogador importar maldicao quando possui tecnica compativel', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('MANIPULACAO_MALDICAO', 104);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
        limiteCadastro: null,
        limiteAtivo: null,
        tipoGrauCodigo: null,
      }),
    );
    prisma.npcAmeaca.findFirst.mockResolvedValue(criarOrigemMaldicao());
    mockCreateRetornandoDados(prisma);

    const resultado = await service.criar(10, 20, 2, {
      tipo: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
      nome: 'Maldicao capturada',
      npcAmeacaOrigemId: 99,
    });

    expect(resultado.pontosVidaMax).toBe(40);
    expect(prisma.npcAmeaca.findFirst).toHaveBeenCalledWith({
      where: { id: 99, donoId: 2 },
    });
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

  it('serializa criacoes concorrentes e nao excede limite de shikigami', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const cadastrados: Array<{ vagasOcupadas: number }> = [];
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockImplementation(() =>
      Promise.resolve([...cadastrados]),
    );
    prisma.personagemCampanhaEntidadeVinculada.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => {
        cadastrados.push({ vagasOcupadas: Number(data.vagasOcupadas ?? 1) });
        return Promise.resolve(
          criarEntidadeMapeavel({
            ...data,
            id: 500 + cadastrados.length,
          }),
        );
      },
    );
    serializarTransacoesNoMock(prisma);

    const resultados = await Promise.allSettled([
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Primeiro',
      }),
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        nome: 'Segundo',
      }),
    ]);

    expect(
      resultados.filter((item) => item.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(resultados.filter((item) => item.status === 'rejected')).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({
          code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO',
        }),
      }),
    ]);
    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalledTimes(1);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });

  it('serializa associacao concorrente e impede template duplicado', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('DEZ_SOMBRAS', 102);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        modo: ModoVinculadoTecnica.PREDEFINIDOS,
        limiteCadastro: 10,
        permiteCriarNovos: false,
        usaTemplates: true,
      }),
    );
    prisma.tecnicaVinculadoTemplate.findFirst.mockResolvedValue({
      id: 301,
      tecnicaId: tecnica.id,
      tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
      nome: 'Cao Divino',
      descricao: null,
      conceito: null,
      aparencia: null,
      snapshotJson: null,
      tecnica,
    });
    let associadoId: number | null = null;
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockImplementation(
      () => Promise.resolve(associadoId ? { id: associadoId } : null),
    );
    prisma.personagemCampanhaEntidadeVinculada.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => {
        associadoId = 501;
        return Promise.resolve(criarEntidadeMapeavel({ ...data, id: 501 }));
      },
    );
    serializarTransacoesNoMock(prisma);

    const resultados = await Promise.allSettled([
      service.associarTemplate(10, 20, 2, 301, {}),
      service.associarTemplate(10, 20, 2, 301, {}),
    ]);

    expect(
      resultados.filter((item) => item.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(resultados.filter((item) => item.status === 'rejected')).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({
          code: 'ENTIDADE_TEMPLATE_JA_ASSOCIADO',
        }),
      }),
    ]);
    expect(
      prisma.personagemCampanhaEntidadeVinculada.create,
    ).toHaveBeenCalledTimes(1);
  });

  it('serializa corpos pesados concorrentes e respeita vagas de cadastro', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    const tecnica = criarTecnica('NAOINATA_TECNICA_CORPOS_AMALDICOADOS', 103);
    mockTecnica(
      prisma,
      tecnica,
      criarConfigTecnica(tecnica, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        tipoGrauCodigo: 'TECNICA_CADAVERES',
        usaVagasPorNivel: true,
      }),
    );
    const cadastrados: Array<{ vagasOcupadas: number }> = [];
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockImplementation(() =>
      Promise.resolve([...cadastrados]),
    );
    prisma.personagemCampanhaEntidadeVinculada.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => {
        cadastrados.push({ vagasOcupadas: Number(data.vagasOcupadas ?? 1) });
        return Promise.resolve(criarEntidadeMapeavel(data));
      },
    );
    serializarTransacoesNoMock(prisma);

    const resultados = await Promise.allSettled([
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        nome: 'Pesado A',
        vagasOcupadas: 2,
      }),
      service.criar(10, 20, 2, {
        tipo: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
        nome: 'Pesado B',
        vagasOcupadas: 2,
      }),
    ]);

    expect(
      resultados.filter((item) => item.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(resultados.filter((item) => item.status === 'rejected')).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({ code: 'ENTIDADE_LIMITE_CADASTRO' }),
      }),
    ]);
  });

  it('revalida capacidade ao reativar entidade arquivada', async () => {
    const { service, prisma, access } = criarServico();
    access.obterPersonagemCampanhaComPermissao.mockResolvedValue({
      acesso: acessoDono,
      personagem: { id: 20, donoId: 2 },
    });
    prisma.personagemCampanhaEntidadeVinculada.findFirst.mockResolvedValue(
      criarEntidadeMapeavel({
        estado: EstadoEntidadeVinculadaPersonagem.ARQUIVADO,
        tecnicaOrigemId: 101,
      }),
    );
    prisma.personagemCampanhaEntidadeVinculada.findMany.mockResolvedValue([
      { vagasOcupadas: 1 },
    ]);

    await expect(
      service.atualizarEstado(10, 20, 2, 500, {
        estado: EstadoEntidadeVinculadaPersonagem.DISPONIVEL,
      }),
    ).rejects.toMatchObject({
      code: 'ENTIDADE_SHIKIGAMI_LIMITE_CADASTRO',
    });
    expect(
      prisma.personagemCampanhaEntidadeVinculada.update,
    ).not.toHaveBeenCalled();
  });
});
