import { CampanhaPersonagensService } from './campanha.personagens.service';

describe('CampanhaPersonagensService - privacidade', () => {
  function criarService() {
    const accessService = { garantirAcesso: jest.fn() };
    const persistence = {
      listarPersonagensCampanha: jest.fn(),
      listarPersonagensCampanhaResumo: jest.fn(),
      listarPersonagensCampanhaDetalhados: jest.fn(),
    };
    const mapper = {
      mapearPersonagemCampanhaResposta: jest.fn((personagem) => ({
        id: personagem.id,
        visibilidade: 'completa',
      })),
      mapearPersonagemCampanhaResumo: jest.fn((personagem) => ({
        id: personagem.id,
        visibilidade: 'resumida',
      })),
    };
    const service = new CampanhaPersonagensService(
      {} as never,
      accessService as never,
      {} as never,
      mapper as never,
      persistence as never,
      {} as never,
      {} as never,
    );
    return { service, accessService, persistence, mapper };
  }

  const resumo = (id: number, donoId: number) => ({
    id,
    donoId,
    campanhaId: 1,
    personagemBaseId: id + 100,
    nome: `Personagem ${id}`,
    pvAtual: 10,
    pvMax: 20,
    pvBarrasTotal: 1,
    pvBarrasRestantes: 1,
    sanAtual: 10,
    sanMax: 20,
    personagemBase: { id: id + 100, nome: 'Base' },
    dono: { id: donoId, apelido: 'Jogador' },
  });

  it('entrega detalhe próprio e resumo dos demais para jogador', async () => {
    const { service, accessService, persistence } = criarService();
    const resumos = [resumo(1, 7), resumo(2, 8)];
    accessService.garantirAcesso.mockResolvedValue({ ehMestre: false });
    persistence.listarPersonagensCampanhaResumo.mockResolvedValue(resumos);
    persistence.listarPersonagensCampanhaDetalhados.mockResolvedValue([resumos[0]]);

    await expect(service.listarPersonagensCampanha(1, 7)).resolves.toEqual([
      { id: 1, visibilidade: 'completa' },
      { id: 2, visibilidade: 'resumida' },
    ]);
    expect(persistence.listarPersonagensCampanhaDetalhados).toHaveBeenCalledWith(
      1,
      [1],
    );
  });

  it('entrega detalhe completo de todos para mestre', async () => {
    const { service, accessService, persistence } = criarService();
    const personagens = [resumo(1, 7), resumo(2, 8)];
    accessService.garantirAcesso.mockResolvedValue({ ehMestre: true });
    persistence.listarPersonagensCampanha.mockResolvedValue(personagens);

    await expect(service.listarPersonagensCampanha(1, 7)).resolves.toEqual([
      { id: 1, visibilidade: 'completa' },
      { id: 2, visibilidade: 'completa' },
    ]);
    expect(persistence.listarPersonagensCampanhaResumo).not.toHaveBeenCalled();
  });
});
