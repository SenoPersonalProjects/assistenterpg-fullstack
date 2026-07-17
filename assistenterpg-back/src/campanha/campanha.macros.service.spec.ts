import { CampanhaMacrosService } from './campanha.macros.service';

const macroBase = {
  id: 7,
  campanhaId: 1,
  personagemCampanhaId: 2,
  criadoPorId: 3,
  atualizadoPorId: 3,
  removidoPorId: null,
  nome: 'Soco improvisado',
  descricao: null,
  tipo: 'ATAQUE_PERICIA' as const,
  visibilidadePadrao: 'PUBLICA' as const,
  configVersao: 1,
  config: {
    periciaCodigo: 'LUTA',
    categoriaAtaque: 'CORPO_A_CORPO',
    ajusteFlatPadrao: 5,
    ajusteDadosPadrao: 1,
  },
  ordem: 0,
  ativo: true,
  revisao: 1,
  criadoEm: new Date('2026-01-01T00:00:00Z'),
  atualizadoEm: new Date('2026-01-01T00:00:00Z'),
  removidoEm: null,
  criadoPor: { id: 3, apelido: 'Jogador' },
  atualizadoPor: { id: 3, apelido: 'Jogador' },
};

describe('CampanhaMacrosService', () => {
  const acesso = {
    obterPersonagemCampanhaComPermissao: jest.fn().mockResolvedValue({
      acesso: { ehMestre: false },
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('lista apenas macros ativas isoladas por campanha e personagem', async () => {
    const prisma = {
      personagemCampanhaMacro: {
        findMany: jest.fn().mockResolvedValue([macroBase]),
      },
    };
    const service = new CampanhaMacrosService(prisma as never, acesso as never);
    const resposta = await service.listar(1, 2, 3);
    expect(prisma.personagemCampanhaMacro.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { campanhaId: 1, personagemCampanhaId: 2, ativo: true },
      }),
    );
    expect(resposta.macros).toHaveLength(1);
  });

  it('cria com auditoria, ordem e configuracao normalizada', async () => {
    const tx = {
      personagemCampanhaMacro: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({ _max: { ordem: null } }),
        create: jest.fn().mockResolvedValue(macroBase),
      },
      pericia: { findUnique: jest.fn().mockResolvedValue({ codigo: 'LUTA' }) },
    };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) };
    const service = new CampanhaMacrosService(prisma as never, acesso as never);
    await service.criar(1, 2, 3, {
      tipo: 'ATAQUE_PERICIA',
      nome: ' Soco improvisado ',
      config: macroBase.config,
    });
    expect(tx.personagemCampanhaMacro.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          campanhaId: 1,
          personagemCampanhaId: 2,
          criadoPorId: 3,
          nome: 'Soco improvisado',
          ordem: 0,
        }),
      }),
    );
  });

  it('aplica revisao otimista ao editar', async () => {
    const prisma = {
      pericia: { findUnique: jest.fn().mockResolvedValue({ codigo: 'LUTA' }) },
      personagemCampanhaMacro: {
        findFirst: jest.fn().mockResolvedValue({ id: 7 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ ...macroBase, revisao: 2 }),
      },
    };
    const service = new CampanhaMacrosService(prisma as never, acesso as never);
    await service.atualizar(1, 2, 7, 3, {
      tipo: 'ATAQUE_PERICIA',
      nome: 'Soco',
      config: macroBase.config,
      revisaoEsperada: 1,
    });
    expect(prisma.personagemCampanhaMacro.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 7, revisao: 1, ativo: true }),
        data: expect.objectContaining({ revisao: { increment: 1 } }),
      }),
    );
  });

  it('remove logicamente e preserva a linha historica', async () => {
    const prisma = {
      personagemCampanhaMacro: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new CampanhaMacrosService(prisma as never, acesso as never);
    await expect(service.remover(1, 2, 7, 3)).resolves.toEqual({
      id: 7,
      ativo: false,
    });
    expect(prisma.personagemCampanhaMacro.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7, campanhaId: 1, personagemCampanhaId: 2, ativo: true },
        data: expect.objectContaining({ ativo: false, removidoPorId: 3 }),
      }),
    );
  });
});
