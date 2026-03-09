import { useCallback, useRef, useState } from 'react';
import { apiPreviewItensInventario, extrairMensagemErro } from '@/lib/api';
import type { ItemInventarioPayload } from '@/lib/api';

type UseInventarioPreviewParams = {
  forca: number;
  prestigioBase: number;
};

type UseInventarioPreviewReturn = {
  sincronizarInventario: (itens: ItemInventarioPayload[]) => Promise<ItemInventarioPayload[]>;
  carregando: boolean;
  erro: string | null;
};

type PreviewPayload = {
  forca: number;
  prestigioBase: number;
  itens: Array<{
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    nomeCustomizado?: string;
  }>;
};

function sanitizarItensInventario(itens: ItemInventarioPayload[]): ItemInventarioPayload[] {
  return itens.map((item) => ({
    equipamentoId: Number(item.equipamentoId),
    quantidade: Number(item.quantidade),
    equipado: Boolean(item.equipado),
    modificacoesIds: item.modificacoesIds || [],
    nomeCustomizado: item.nomeCustomizado || null,
    notas: item.notas || null,
  }));
}

function construirPayloadPreview(
  itens: ItemInventarioPayload[],
  forca: number,
  prestigioBase: number,
): PreviewPayload {
  return {
    forca: Number(forca),
    prestigioBase: Number(prestigioBase),
    itens: itens.map((item) => ({
      equipamentoId: Number(item.equipamentoId),
      quantidade: Number(item.quantidade),
      equipado: Boolean(item.equipado),
      nomeCustomizado: item.nomeCustomizado || undefined,
    })),
  };
}

export function useInventarioPreview({
  forca,
  prestigioBase,
}: UseInventarioPreviewParams): UseInventarioPreviewReturn {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ultimoPayloadHashRef = useRef<string | null>(null);
  const ultimoResultadoRef = useRef<ItemInventarioPayload[] | null>(null);
  const requisicaoEmVooRef = useRef<{
    hash: string;
    requestId: symbol;
    promise: Promise<ItemInventarioPayload[]>;
  } | null>(null);

  const sincronizarInventario = useCallback(
    async (itens: ItemInventarioPayload[]): Promise<ItemInventarioPayload[]> => {
      if (itens.length === 0) {
        setErro(null);
        setCarregando(false);
        ultimoPayloadHashRef.current = '[]';
        ultimoResultadoRef.current = [];
        requisicaoEmVooRef.current = null;
        return [];
      }

      const itensSanitizados = sanitizarItensInventario(itens);
      const payload = construirPayloadPreview(itensSanitizados, forca, prestigioBase);
      const payloadHash = JSON.stringify(payload);

      if (
        ultimoPayloadHashRef.current === payloadHash &&
        Array.isArray(ultimoResultadoRef.current)
      ) {
        return ultimoResultadoRef.current;
      }

      if (requisicaoEmVooRef.current?.hash === payloadHash) {
        return requisicaoEmVooRef.current.promise;
      }

      setCarregando(true);
      setErro(null);

      const requestId = Symbol('inventario-preview-request');
      const request = (async (): Promise<ItemInventarioPayload[]> => {
        try {
          const preview = await apiPreviewItensInventario(payload);

          const itensAtualizados: ItemInventarioPayload[] = itensSanitizados.map(
            (itemLocal, index) => {
              const itemBackend = preview.itens[index];
              return {
                ...itemLocal,
                nomeCustomizado: itemBackend?.nomeCustomizado ?? itemLocal.nomeCustomizado,
              };
            },
          );

          ultimoPayloadHashRef.current = payloadHash;
          ultimoResultadoRef.current = itensAtualizados;
          return itensAtualizados;
        } catch (err) {
          setErro(extrairMensagemErro(err));
          return itensSanitizados;
        } finally {
          if (
            requisicaoEmVooRef.current?.hash === payloadHash &&
            requisicaoEmVooRef.current.requestId === requestId
          ) {
            requisicaoEmVooRef.current = null;
          }
          setCarregando(false);
        }
      })();

      requisicaoEmVooRef.current = {
        hash: payloadHash,
        requestId,
        promise: request,
      };

      return request;
    },
    [forca, prestigioBase],
  );

  return {
    sincronizarInventario,
    carregando,
    erro,
  };
}
