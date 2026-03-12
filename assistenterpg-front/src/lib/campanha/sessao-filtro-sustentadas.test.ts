import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  carregarFiltroSustentadasLobby,
  salvarFiltroSustentadasLobby,
} from './sessao-filtro-sustentadas';

type LocalStorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

function storageKey(usuarioId: number, campanhaId: number, sessaoId: number): string {
  return `assistenterpg:sessao:lobby:sustentadas:v1:${usuarioId}:${campanhaId}:${sessaoId}`;
}

describe('sessao-filtro-sustentadas', () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    const store = new Map<string, string>();
    localStorageMock = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    };

    (globalThis as { window?: { localStorage: LocalStorageMock } }).window = {
      localStorage: localStorageMock,
    };
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as { window?: { localStorage: LocalStorageMock } }).window;
  });

  it('salva e carrega apenas flags validas/ativas', () => {
    salvarFiltroSustentadasLobby(10, 20, 30, {
      1: true,
      2: false,
      3: true,
    });

    const carregado = carregarFiltroSustentadasLobby(10, 20, 30);
    expect(carregado).toEqual({ 1: true, 3: true });
  });

  it('retorna vazio quando storage esta corrompido', () => {
    localStorageMock.setItem(storageKey(10, 20, 30), '{nao-json');
    expect(carregarFiltroSustentadasLobby(10, 20, 30)).toEqual({});
  });

  it('ignora persistencia quando localStorage falha', () => {
    const spy = vi
      .spyOn(localStorageMock, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });

    expect(() =>
      salvarFiltroSustentadasLobby(10, 20, 30, { 1: true }),
    ).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
