import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axios-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from './axios-client';
import {
  apiAceitarConvite,
  apiAtualizarOrdemIniciativaSessaoCampanha,
  apiAtualizarCenaSessaoCampanha,
  apiAtualizarEncontroSocialSessaoCampanha,
  apiAtualizarEscaladaDadosSessaoCampanha,
  apiAtualizarIniciativaAlternadaSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiAtualizarEstadoEntidadeVinculadaPersonagem,
  apiAssociarTemplateEntidadeVinculada,
  apiAvancarTurnoSessaoCampanha,
  apiAvancarLadoIniciativaAlternadaSessaoCampanha,
  apiAdicionarNpcSessaoCampanha,
  apiConcederMaldicaoControladaSessaoCampanha,
  apiCriarSessaoCampanha,
  apiCriarEntidadeVinculadaPersonagem,
  apiAplicarModificadorPersonagemCampanha,
  apiCriarConvite,
  apiListarModificadoresPersonagemCampanha,
  apiDesassociarPersonagemCampanha,
  apiDeleteCampanha,
  apiDesinvocarEntidadeVinculadaSessaoCampanha,
  apiEncerrarSessaoCampanha,
  apiGetCampanhaById,
  apiGetSessaoCampanha,
  apiInvalidateCampanhaDetalheCache,
  apiListarChatSessaoCampanha,
  apiListarConflitosSessaoAgendadaCampanha,
  apiListarPersonagensBaseDisponiveisCampanha,
  apiListarPersonagensCampanha,
  apiListarSessoesCampanha,
  apiListarConvitesPendentes,
  apiListarEntidadesVinculadasPersonagem,
  apiListarCapacidadesEntidadesVinculadas,
  apiListarTemplatesEntidadesVinculadas,
  apiListarAmigosConvidaveisCampanha,
  apiMarcarParticipanteIniciativaAlternadaSessaoCampanha,
  apiInvocarEntidadeVinculadaSessaoCampanha,
  apiRemoverNpcSessaoCampanha,
  apiReprocessarEfeitosTurnoSessaoCampanha,
  apiRecusarConvite,
  apiCriarRolagemAtaquePersonagemSessaoCampanha,
  apiCriarRolagemFormulaSessaoCampanha,
  apiCriarRolagemPericiaPersonagemSessaoCampanha,
  apiEnviarMensagemChatSessaoCampanha,
  apiPularTurnoSessaoCampanha,
  apiVoltarTurnoSessaoCampanha,
  apiVincularPersonagemCampanha,
} from './campanhas';

type AxiosLike = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const mockedApiClient = apiClient as unknown as AxiosLike;

describe('campanhas api cache and dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiInvalidateCampanhaDetalheCache();
  });

  it('dedupes in-flight request and serves from cache', async () => {
    type CampanhaGetResponse = { data: { id: number; nome: string } };
    let resolver!: (value: CampanhaGetResponse) => void;
    mockedApiClient.get.mockReturnValueOnce(
      new Promise<CampanhaGetResponse>((resolve) => {
        resolver = resolve;
      }),
    );

    const p1 = apiGetCampanhaById<{ id: number; nome: string }>(123);
    const p2 = apiGetCampanhaById<{ id: number; nome: string }>(123);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/123');

    resolver({ data: { id: 123, nome: 'Campanha Alpha' } });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ id: 123, nome: 'Campanha Alpha' });
    expect(r2).toEqual({ id: 123, nome: 'Campanha Alpha' });

    const r3 = await apiGetCampanhaById<{ id: number; nome: string }>(123);
    expect(r3).toEqual({ id: 123, nome: 'Campanha Alpha' });
    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
  });

  it('forces refresh when requested', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 10, nome: 'Versao 1' } })
      .mockResolvedValueOnce({ data: { id: 10, nome: 'Versao 2' } });

    const primeiro = await apiGetCampanhaById<{ id: number; nome: string }>(10);
    const segundo = await apiGetCampanhaById<{ id: number; nome: string }>(10, {
      forceRefresh: true,
    });

    expect(primeiro.nome).toBe('Versao 1');
    expect(segundo.nome).toBe('Versao 2');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
  });

  it('invalidates cached detail after delete', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { id: 5, nome: 'Antes' } })
      .mockResolvedValueOnce({ data: { id: 5, nome: 'Depois' } });
    mockedApiClient.delete.mockResolvedValue(undefined);

    const antes = await apiGetCampanhaById<{ id: number; nome: string }>(5);
    expect(antes.nome).toBe('Antes');

    await apiDeleteCampanha(5);
    const depois = await apiGetCampanhaById<{ id: number; nome: string }>(5);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/campanhas/5');
    expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
    expect(depois.nome).toBe('Depois');
  });

  it('lists pending invites', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 1, codigo: 'ABC123' }],
    });

    const convites = await apiListarConvitesPendentes();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/convites/pendentes');
    expect(convites).toEqual([{ id: 1, codigo: 'ABC123' }]);
  });

  it('accepts invite by code', async () => {
    mockedApiClient.post.mockResolvedValueOnce(undefined);

    await apiAceitarConvite('CODIGO1');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/convites/CODIGO1/aceitar');
  });

  it('rejects invite by code', async () => {
    mockedApiClient.post.mockResolvedValueOnce(undefined);

    await apiRecusarConvite('CODIGO2');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/convites/CODIGO2/recusar');
  });

  it('creates invite by friend user id', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 10, usuarioId: 44 },
    });

    const convite = await apiCriarConvite(7, {
      usuarioId: 44,
      papel: 'JOGADOR',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/7/convites', {
      usuarioId: 44,
      papel: 'JOGADOR',
    });
    expect(convite).toEqual({ id: 10, usuarioId: 44 });
  });

  it('lists inviteable friends for campaign', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 44, apelido: 'Maki', online: true }],
    });

    const amigos = await apiListarAmigosConvidaveisCampanha(7);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/7/amigos-convidaveis',
    );
    expect(amigos).toEqual([{ id: 44, apelido: 'Maki', online: true }]);
  });

  it('lists campaign characters', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 1, nome: 'Yuta' }],
    });

    const personagens = await apiListarPersonagensCampanha(15);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/15/personagens');
    expect(personagens).toEqual([{ id: 1, nome: 'Yuta' }]);
  });

  it('lists available base characters for campaign association', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 2, nome: 'Megumi', dono: { id: 3, apelido: 'Jogador' } }],
    });

    const personagens = await apiListarPersonagensBaseDisponiveisCampanha(15);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/15/personagens-base-disponiveis',
    );
    expect(personagens).toEqual([
      { id: 2, nome: 'Megumi', dono: { id: 3, apelido: 'Jogador' } },
    ]);
  });

  it('links base character to campaign', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 9, personagemBaseId: 42 },
    });

    const personagem = await apiVincularPersonagemCampanha(12, {
      personagemBaseId: 42,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/12/personagens', {
      personagemBaseId: 42,
    });
    expect(personagem).toEqual({ id: 9, personagemBaseId: 42 });
  });

  it('lists linked entities for campaign character', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 50, nome: 'Cao Divino' }],
    });

    const vinculados = await apiListarEntidadesVinculadasPersonagem(12, 9);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/12/personagens/9/vinculados',
    );
    expect(vinculados).toEqual([{ id: 50, nome: 'Cao Divino' }]);
  });

  it('lists linked entity capacities and templates', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ data: { personagemCampanhaId: 9, tipos: [] } })
      .mockResolvedValueOnce({ data: [{ id: 70, nome: 'Nue' }] });

    const capacidades = await apiListarCapacidadesEntidadesVinculadas(12, 9);
    const templates = await apiListarTemplatesEntidadesVinculadas(12, 9);

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/campanhas/12/personagens/9/vinculados/capacidades',
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      '/campanhas/12/personagens/9/vinculados/templates',
    );
    expect(capacidades).toEqual({ personagemCampanhaId: 9, tipos: [] });
    expect(templates).toEqual([{ id: 70, nome: 'Nue' }]);
  });

  it('associates a predefined linked entity template', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 51, templateId: 70, nome: 'Nue' },
    });

    const vinculado = await apiAssociarTemplateEntidadeVinculada(
      12,
      9,
      70,
      { overrideMestre: false },
    );

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/12/personagens/9/vinculados/templates/70/associar',
      { overrideMestre: false },
    );
    expect(vinculado).toEqual({ id: 51, templateId: 70, nome: 'Nue' });
  });

  it('creates linked entity for campaign character', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 51, tipo: 'SHIKIGAMI', nome: 'Cao Divino' },
    });

    const vinculado = await apiCriarEntidadeVinculadaPersonagem(12, 9, {
      tipo: 'SHIKIGAMI',
      nome: 'Cao Divino',
      pontosVidaMax: 18,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/12/personagens/9/vinculados',
      {
        tipo: 'SHIKIGAMI',
        nome: 'Cao Divino',
        pontosVidaMax: 18,
      },
    );
    expect(vinculado).toEqual({ id: 51, tipo: 'SHIKIGAMI', nome: 'Cao Divino' });
  });

  it('updates linked entity state', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 51, estado: 'SELADO' },
    });

    const vinculado = await apiAtualizarEstadoEntidadeVinculadaPersonagem(
      12,
      9,
      51,
      'SELADO',
    );

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/12/personagens/9/vinculados/51/estado',
      { estado: 'SELADO' },
    );
    expect(vinculado).toEqual({ id: 51, estado: 'SELADO' });
  });

  it('unlinks campaign character association', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({
      data: { id: 9, campanhaId: 12, personagemBaseId: 42, message: 'ok' },
    });

    const resposta = await apiDesassociarPersonagemCampanha(12, 9);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/campanhas/12/personagens/9');
    expect(resposta).toEqual({
      id: 9,
      campanhaId: 12,
      personagemBaseId: 42,
      message: 'ok',
    });
  });

  it('lists campaign sessions', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 1, titulo: 'Sessão 1' }],
    });

    const sessoes = await apiListarSessoesCampanha(44);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/44/sessoes');
    expect(sessoes).toEqual([{ id: 1, titulo: 'Sessão 1' }]);
  });

  it('lists scheduled session conflicts with Google flag', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        assistenteRpg: [],
        googleCalendar: [],
        googleCalendarErro: null,
      },
    });

    const conflitos = await apiListarConflitosSessaoAgendadaCampanha(44, {
      inicioEm: '2030-01-01T20:00:00.000Z',
      fimEm: '2030-01-01T22:00:00.000Z',
      incluirGoogle: true,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/44/sessoes-agendadas/conflitos?inicioEm=2030-01-01T20%3A00%3A00.000Z&fimEm=2030-01-01T22%3A00%3A00.000Z&incluirGoogle=true',
    );
    expect(conflitos.googleCalendarErro).toBeNull();
  });

  it('creates campaign session', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 13, titulo: 'Sessão teste' },
    });

    const sessao = await apiCriarSessaoCampanha(44, { titulo: 'Sessão teste' });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/44/sessoes', {
      titulo: 'Sessão teste',
    });
    expect(sessao).toEqual({ id: 13, titulo: 'Sessão teste' });
  });

  it('closes campaign session', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 13, status: 'ENCERRADA' },
    });

    const sessao = await apiEncerrarSessaoCampanha(44, 13);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/encerrar',
    );
    expect(sessao).toEqual({ id: 13, status: 'ENCERRADA' });
  });

  it('gets campaign session details', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { id: 13, titulo: 'Sessão teste' },
    });

    const sessao = await apiGetSessaoCampanha(44, 13);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/44/sessoes/13');
    expect(sessao).toEqual({ id: 13, titulo: 'Sessão teste' });
  });

  it('updates session scene', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({
      data: { id: 13, cenaAtual: { tipo: 'COMBATE' } },
    });

    const sessao = await apiAtualizarCenaSessaoCampanha(44, 13, {
      tipo: 'COMBATE',
      nome: 'Confronto',
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/cena',
      {
        tipo: 'COMBATE',
        nome: 'Confronto',
      },
    );
    expect(sessao).toEqual({ id: 13, cenaAtual: { tipo: 'COMBATE' } });
  });

  it('advances session turn', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13 } });
    const precondicao = { rodadaEsperada: 3, indiceTurnoEsperado: 1 };

    const sessao = await apiAvancarTurnoSessaoCampanha(44, 13, precondicao);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/turno/avancar',
      precondicao,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('moves session turn back', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13 } });
    const precondicao = { rodadaEsperada: 3, indiceTurnoEsperado: 1 };

    const sessao = await apiVoltarTurnoSessaoCampanha(44, 13, precondicao);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/turno/voltar',
      precondicao,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('skips current session turn', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13 } });
    const precondicao = { rodadaEsperada: 3, indiceTurnoEsperado: 1 };

    const sessao = await apiPularTurnoSessaoCampanha(44, 13, precondicao);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/turno/pular',
      precondicao,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('updates social encounter mechanics through the session route', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { id: 13 } });

    const payload = {
      alvos: [
        {
          npcSessaoId: 8,
          nome: 'Geto',
          interesseAtual: 2,
          interesseAlvo: 4,
          pacienciaAtual: 5,
        },
      ],
    };
    const sessao = await apiAtualizarEncontroSocialSessaoCampanha(
      44,
      13,
      payload,
    );

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/mecanicas/social/encontros',
      payload,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('updates data escalation mechanics through the final PATCH route', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { id: 13 } });

    const payload = {
      ativaNesteCombate: true,
      rodadaInicio: 3,
      bonusAtual: 2,
    };
    const sessao = await apiAtualizarEscaladaDadosSessaoCampanha(
      44,
      13,
      payload,
    );

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/mecanicas/escalada',
      payload,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('updates alternating initiative sides through the session route', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { id: 13 } });

    const payload = {
      ladoAtualId: 1,
      lados: [
        {
          id: 1,
          nome: 'Jogadores',
          ordem: 0,
          participantes: [{ participanteToken: 'PERSONAGEM:2' }],
        },
        {
          id: 2,
          nome: 'Oposição',
          ordem: 1,
          participantes: [{ participanteToken: 'NPC:8' }],
        },
      ],
    };
    const sessao = await apiAtualizarIniciativaAlternadaSessaoCampanha(
      44,
      13,
      payload,
    );

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/iniciativa-alternada',
      payload,
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('marks and advances alternating initiative through persisted routes', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({ data: { id: 13, marcado: true } })
      .mockResolvedValueOnce({ data: { id: 13, ladoAtualId: 2 } });

    const marcado =
      await apiMarcarParticipanteIniciativaAlternadaSessaoCampanha(44, 13, {
        participanteToken: 'PERSONAGEM:2',
        jaAgiu: true,
      });
    const avancado = await apiAvancarLadoIniciativaAlternadaSessaoCampanha(
      44,
      13,
      { rodadaEsperada: 2, ladoAtualIdEsperado: 1 },
    );

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      1,
      '/campanhas/44/sessoes/13/iniciativa-alternada/marcar',
      {
        participanteToken: 'PERSONAGEM:2',
        jaAgiu: true,
      },
    );
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      2,
      '/campanhas/44/sessoes/13/iniciativa-alternada/avancar-lado',
      { rodadaEsperada: 2, ladoAtualIdEsperado: 1 },
    );
    expect(marcado).toEqual({ id: 13, marcado: true });
    expect(avancado).toEqual({ id: 13, ladoAtualId: 2 });
  });

  it('reprocesses pending automatic turn effects', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13 } });

    const sessao = await apiReprocessarEfeitosTurnoSessaoCampanha(
      44,
      13,
      901,
    );

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/turno/efeitos/901/reprocessar',
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('updates session initiative order', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { id: 13 } });

    const sessao = await apiAtualizarOrdemIniciativaSessaoCampanha(44, 13, {
      ordem: [
        { tipoParticipante: 'PERSONAGEM', id: 2 },
        { tipoParticipante: 'NPC', id: 8 },
      ],
      indiceTurnoAtual: 1,
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/iniciativa/ordem',
      {
        ordem: [
          { tipoParticipante: 'PERSONAGEM', id: 2 },
          { tipoParticipante: 'NPC', id: 8 },
        ],
        indiceTurnoAtual: 1,
      },
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('adds npc/ameaca to session scene', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13, npcs: [{ npcSessaoId: 3 }] } });

    const sessao = await apiAdicionarNpcSessaoCampanha(44, 13, {
      npcAmeacaId: 99,
      nomeExibicao: 'Taro Ishikawa',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/npcs',
      {
        npcAmeacaId: 99,
        nomeExibicao: 'Taro Ishikawa',
      },
    );
    expect(sessao).toEqual({ id: 13, npcs: [{ npcSessaoId: 3 }] });
  });

  it('updates npc/ameaca in session scene', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { id: 13, npcs: [{ npcSessaoId: 3, defesa: 18 }] } });

    const sessao = await apiAtualizarNpcSessaoCampanha(44, 13, 3, {
      defesa: 18,
      pontosVidaAtual: 31,
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/npcs/3',
      {
        defesa: 18,
        pontosVidaAtual: 31,
      },
    );
    expect(sessao).toEqual({ id: 13, npcs: [{ npcSessaoId: 3, defesa: 18 }] });
  });

  it('removes npc/ameaca from session scene', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({ data: { id: 13, npcs: [] } });

    const sessao = await apiRemoverNpcSessaoCampanha(44, 13, 3);

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/npcs/3',
    );
    expect(sessao).toEqual({ id: 13, npcs: [] });
  });

  it('invokes linked entity into session scene', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 13, npcs: [{ npcSessaoId: 8, entidadeVinculadaId: 51 }] },
    });

    const sessao = await apiInvocarEntidadeVinculadaSessaoCampanha(44, 13, 51, {
      ocultoJogadores: true,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/vinculados/51/invocar',
      { ocultoJogadores: true },
    );
    expect(sessao).toEqual({
      id: 13,
      npcs: [{ npcSessaoId: 8, entidadeVinculadaId: 51 }],
    });
  });

  it('desinvokes linked entity from session scene', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13, npcs: [] } });

    const sessao = await apiDesinvocarEntidadeVinculadaSessaoCampanha(44, 13, 8);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/npcs/8/desinvocar',
    );
    expect(sessao).toEqual({ id: 13, npcs: [] });
  });

  it('grants controlled curse from session', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 13 } });

    const sessao = await apiConcederMaldicaoControladaSessaoCampanha(44, 13, {
      personagemCampanhaId: 9,
      npcSessaoId: 8,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/maldicoes/conceder',
      {
        personagemCampanhaId: 9,
        npcSessaoId: 8,
      },
    );
    expect(sessao).toEqual({ id: 13 });
  });

  it('lists session chat with afterId', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 90, mensagem: 'oi' }],
    });

    const mensagens = await apiListarChatSessaoCampanha(44, 13, 80);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/chat?afterId=80',
    );
    expect(mensagens).toEqual([{ id: 90, mensagem: 'oi' }]);
  });

  it('sends session chat message', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 91, mensagem: 'teste' },
    });

    const mensagem = await apiEnviarMensagemChatSessaoCampanha(44, 13, {
      mensagem: 'teste',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/chat',
      { mensagem: 'teste' },
    );
    expect(mensagem).toEqual({ id: 91, mensagem: 'teste' });
  });

  it('sends only the authoritative roll intent', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 93, mensagem: '2d6 [[dice:v3|test]]' },
    });
    const payload = {
      tipo: 'FORMULA' as const,
      expressao: '2d6',
      contexto: { tipo: 'OUTRO' as const },
      clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
    };

    const mensagem = await apiCriarRolagemFormulaSessaoCampanha(
      44,
      13,
      payload,
    );

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/rolagens',
      payload,
    );
    expect(mensagem).toEqual({ id: 93, mensagem: '2d6 [[dice:v3|test]]' });
  });

  it('envia somente a intencao autoritativa da pericia do personagem', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 94, mensagem: 'Ocultismo [[dice:v4|test]]' },
    });
    const payload = {
      tipo: 'PERICIA_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'OCULTISMO',
      visibilidade: 'PUBLICA' as const,
      clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
    };

    await apiCriarRolagemPericiaPersonagemSessaoCampanha(44, 13, payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/rolagens',
      payload,
    );
  });

  it('envia somente a intencao autoritativa do ataque do personagem', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 95, mensagem: 'Luta [[dice:v4|test]]' },
    });
    const payload = {
      tipo: 'ATAQUE_PERSONAGEM' as const,
      personagemSessaoId: 31,
      periciaCodigo: 'LUTA',
      visibilidade: 'PUBLICA' as const,
      clientRequestId: '6ff62ec2-a60e-4de8-99cf-6018cf83a68d',
    };

    await apiCriarRolagemAtaquePersonagemSessaoCampanha(44, 13, payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/rolagens',
      payload,
    );
    expect(payload).not.toHaveProperty('bonus');
    expect(payload).not.toHaveProperty('dadosRolagem');
    expect(payload).not.toHaveProperty('total');
  });

  it('sends secret master roll visibility through session chat', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 92, mensagem: 'Rolagem secreta do Mestre' },
    });

    const mensagem = await apiEnviarMensagemChatSessaoCampanha(44, 13, {
      mensagem: '[[DICE:v4:test]]',
      visibilidade: 'SECRETA_MESTRE',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/chat',
      {
        mensagem: '[[DICE:v4:test]]',
        visibilidade: 'SECRETA_MESTRE',
      },
    );
    expect(mensagem).toEqual({ id: 92, mensagem: 'Rolagem secreta do Mestre' });
  });

  it('lists campaign character modifiers with session/cena filters', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [{ id: 10, campo: 'EA_MAX', valor: -5 }],
    });

    const modificadores = await apiListarModificadoresPersonagemCampanha(44, 13, true, {
      sessaoId: 7,
      cenaId: 22,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/campanhas/44/personagens/13/modificadores?incluirInativos=true&sessaoId=7&cenaId=22',
    );
    expect(modificadores).toEqual([{ id: 10, campo: 'EA_MAX', valor: -5 }]);
  });

  it('applies campaign character modifier with session/cena context', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { modificador: { id: 2 }, personagem: { id: 13 } },
    });

    const resposta = await apiAplicarModificadorPersonagemCampanha(44, 13, {
      campo: 'EA_MAX',
      valor: -5,
      nome: 'Fadiga da cena',
      sessaoId: 7,
      cenaId: 22,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/personagens/13/modificadores',
      {
        campo: 'EA_MAX',
        valor: -5,
        nome: 'Fadiga da cena',
        sessaoId: 7,
        cenaId: 22,
      },
    );
    expect(resposta).toEqual({ modificador: { id: 2 }, personagem: { id: 13 } });
  });

  it('applies skill training and grade narrative modifiers with structured target', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({
        data: { modificador: { id: 3 }, personagem: { id: 13 } },
      })
      .mockResolvedValueOnce({
        data: { modificador: { id: 4 }, personagem: { id: 13 } },
      });

    await apiAplicarModificadorPersonagemCampanha(44, 13, {
      campo: 'PERICIA_TREINAMENTO',
      periciaCodigo: 'OCULTISMO',
      valor: 1,
      nome: 'Treino narrativo',
    });
    await apiAplicarModificadorPersonagemCampanha(44, 13, {
      campo: 'GRAU_APRIMORAMENTO',
      tipoGrauCodigo: 'TECNICA_REVERSA',
      valor: 1,
      nome: 'Treinamento de grau',
    });

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      1,
      '/campanhas/44/personagens/13/modificadores',
      {
        campo: 'PERICIA_TREINAMENTO',
        periciaCodigo: 'OCULTISMO',
        valor: 1,
        nome: 'Treino narrativo',
      },
    );
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      2,
      '/campanhas/44/personagens/13/modificadores',
      {
        campo: 'GRAU_APRIMORAMENTO',
        tipoGrauCodigo: 'TECNICA_REVERSA',
        valor: 1,
        nome: 'Treinamento de grau',
      },
    );
  });
});
