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
  apiAtualizarCenaSessaoCampanha,
  apiAtualizarNpcSessaoCampanha,
  apiAvancarTurnoSessaoCampanha,
  apiAdicionarNpcSessaoCampanha,
  apiCriarSessaoCampanha,
  apiDesassociarPersonagemCampanha,
  apiDeleteCampanha,
  apiEncerrarSessaoCampanha,
  apiGetCampanhaById,
  apiGetSessaoCampanha,
  apiInvalidateCampanhaDetalheCache,
  apiListarChatSessaoCampanha,
  apiListarPersonagensBaseDisponiveisCampanha,
  apiListarPersonagensCampanha,
  apiListarSessoesCampanha,
  apiListarConvitesPendentes,
  apiRemoverNpcSessaoCampanha,
  apiRecusarConvite,
  apiEnviarMensagemChatSessaoCampanha,
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
      data: [{ id: 1, titulo: 'Sessao 1' }],
    });

    const sessoes = await apiListarSessoesCampanha(44);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/44/sessoes');
    expect(sessoes).toEqual([{ id: 1, titulo: 'Sessao 1' }]);
  });

  it('creates campaign session', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 13, titulo: 'Sessao teste' },
    });

    const sessao = await apiCriarSessaoCampanha(44, { titulo: 'Sessao teste' });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/campanhas/44/sessoes', {
      titulo: 'Sessao teste',
    });
    expect(sessao).toEqual({ id: 13, titulo: 'Sessao teste' });
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
      data: { id: 13, titulo: 'Sessao teste' },
    });

    const sessao = await apiGetSessaoCampanha(44, 13);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/campanhas/44/sessoes/13');
    expect(sessao).toEqual({ id: 13, titulo: 'Sessao teste' });
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

    const sessao = await apiAvancarTurnoSessaoCampanha(44, 13);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/campanhas/44/sessoes/13/turno/avancar',
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
});
