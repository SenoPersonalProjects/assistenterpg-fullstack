import { useCallback, useEffect, useRef, useState } from 'react';
import { apiPreviewItensInventario, criarErroUsuario } from '@/lib/api';
import type { ItemInventarioPayload } from '@/lib/api';
import type { PreviewItensInventarioResponse, UserErrorState } from '@/lib/types';

type UseInventarioPreviewParams = {
  personagemBaseId?: number;
  forca?: number;
  intelecto?: number;
  somarIntelecto?: boolean;
  reduzirItensLeves?: boolean;
  reduzirCategoriaEm?: number;
  reduzirCategoriaExcetoTipos?: string[];
  prestigioBase?: number;
  previewInicial?: PreviewItensInventarioResponse | null;
  resolverPreviewInventario?: (
    itens: ItemInventarioPayload[],
  ) => Promise<PreviewItensInventarioResponse>;
};

type UseInventarioPreviewReturn = {
  sincronizarInventario: (
    itens: ItemInventarioPayload[],
  ) => Promise<{
    itens: ItemInventarioPayload[];
    preview: PreviewItensInventarioResponse;
  }>;
  carregando: boolean;
  erro: UserErrorState | null;
  preview: PreviewItensInventarioResponse | null;
};

type PreviewPayload = {
  personagemBaseId?: number;
  forca?: number;
  intelecto?: number;
  somarIntelecto?: boolean;
  reduzirItensLeves?: boolean;
  reduzirCategoriaEm?: number;
  reduzirCategoriaExcetoTipos?: string[];
  prestigioBase?: number;
  itens: Array<{
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    modificacoes?: number[];
    nomeCustomizado?: string;
    estado?: {
      periciaCodigo?: string | null;
      funcoesAdicionaisPericias?: string[];
    };
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
    estado: item.estado
      ? {
          periciaCodigo: item.estado.periciaCodigo ?? null,
          funcoesAdicionaisPericias:
            item.estado.funcoesAdicionaisPericias?.map((codigo) =>
              codigo.trim().toUpperCase(),
            ) ?? [],
        }
      : undefined,
  }));
}

function construirPayloadPreview(
  itens: ItemInventarioPayload[],
  personagemBaseId: number | undefined,
  forca: number | undefined,
  intelecto: number | undefined,
  somarIntelecto: boolean | undefined,
  reduzirItensLeves: boolean | undefined,
  reduzirCategoriaEm: number | undefined,
  reduzirCategoriaExcetoTipos: string[] | undefined,
  prestigioBase: number | undefined,
): PreviewPayload {
  return {
    personagemBaseId,
    forca:
      personagemBaseId === undefined && typeof forca === 'number'
        ? Number(forca)
        : undefined,
    intelecto: typeof intelecto === 'number' ? Number(intelecto) : undefined,
    somarIntelecto: personagemBaseId === undefined ? somarIntelecto : undefined,
    reduzirItensLeves:
      personagemBaseId === undefined ? reduzirItensLeves : undefined,
    reduzirCategoriaEm:
      personagemBaseId === undefined ? reduzirCategoriaEm : undefined,
    reduzirCategoriaExcetoTipos:
      personagemBaseId === undefined
        ? reduzirCategoriaExcetoTipos
        : undefined,
    prestigioBase:
      personagemBaseId === undefined && typeof prestigioBase === 'number'
        ? Number(prestigioBase)
        : undefined,
    itens: itens.map((item) => ({
      equipamentoId: Number(item.equipamentoId),
      quantidade: Number(item.quantidade),
      equipado: Boolean(item.equipado),
      modificacoes: item.modificacoesIds ?? [],
      nomeCustomizado: item.nomeCustomizado || undefined,
      estado: item.estado ?? undefined,
    })),
  };
}

export function useInventarioPreview({
  personagemBaseId,
  forca,
  intelecto,
  somarIntelecto,
  reduzirItensLeves,
  reduzirCategoriaEm,
  reduzirCategoriaExcetoTipos,
  prestigioBase,
  previewInicial,
  resolverPreviewInventario,
}: UseInventarioPreviewParams): UseInventarioPreviewReturn {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [preview, setPreview] =
    useState<PreviewItensInventarioResponse | null>(previewInicial ?? null);
  const ultimoPreviewRef = useRef<PreviewItensInventarioResponse | null>(
    previewInicial ?? null,
  );

  const ultimoPayloadHashRef = useRef<string | null>(null);
  const ultimoResultadoRef = useRef<ItemInventarioPayload[] | null>(null);
  const requisicaoEmVooRef = useRef<{
    hash: string;
    requestId: symbol;
    promise: Promise<{
      itens: ItemInventarioPayload[];
      preview: PreviewItensInventarioResponse;
    }>;
  } | null>(null);

  useEffect(() => {
    if (previewInicial) {
      ultimoPreviewRef.current = previewInicial;
      setPreview(previewInicial);
      ultimoPayloadHashRef.current = null;
    }
  }, [previewInicial]);

  useEffect(() => {
    ultimoPayloadHashRef.current = null;
    ultimoResultadoRef.current = null;
  }, [personagemBaseId, resolverPreviewInventario]);

  const sincronizarInventario = useCallback(
    async (
      itens: ItemInventarioPayload[],
    ): Promise<{
      itens: ItemInventarioPayload[];
      preview: PreviewItensInventarioResponse;
    }> => {
      const itensSanitizados = sanitizarItensInventario(itens);
      const payload = construirPayloadPreview(
        itensSanitizados,
        personagemBaseId,
        forca,
        intelecto,
        somarIntelecto,
        reduzirItensLeves,
        reduzirCategoriaEm,
        reduzirCategoriaExcetoTipos,
        prestigioBase,
      );
      const payloadHash = JSON.stringify(payload);

      if (
        ultimoPayloadHashRef.current === payloadHash &&
        Array.isArray(ultimoResultadoRef.current)
      ) {
        if (!ultimoPreviewRef.current) {
          ultimoPayloadHashRef.current = null;
        } else {
          return {
            itens: ultimoResultadoRef.current,
            preview: ultimoPreviewRef.current,
          };
        }
      }

      if (requisicaoEmVooRef.current?.hash === payloadHash) {
        return requisicaoEmVooRef.current.promise;
      }

      setCarregando(true);
      setErro(null);

      const requestId = Symbol('inventario-preview-request');
      const request = (async (): Promise<{
        itens: ItemInventarioPayload[];
        preview: PreviewItensInventarioResponse;
      }> => {
        try {
          const resultadoPreview = resolverPreviewInventario
            ? await resolverPreviewInventario(itensSanitizados)
            : await apiPreviewItensInventario(payload);

          const itensAtualizados: ItemInventarioPayload[] = itensSanitizados.map(
            (itemLocal, index) => {
              const itemBackend =
                resultadoPreview.itens.find(
                  (item) => item.indiceEntrada === index,
                ) ?? resultadoPreview.itens[index];
              return {
                ...itemLocal,
                nomeCustomizado: itemBackend?.nomeCustomizado ?? itemLocal.nomeCustomizado,
              };
            },
          );

          ultimoPayloadHashRef.current = payloadHash;
          ultimoResultadoRef.current = itensAtualizados;
          ultimoPreviewRef.current = resultadoPreview;
          setPreview(resultadoPreview);
          return { itens: itensAtualizados, preview: resultadoPreview };
        } catch (err) {
          setErro(criarErroUsuario(err));
          throw err;
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
    [
      forca,
      intelecto,
      somarIntelecto,
      reduzirItensLeves,
      reduzirCategoriaEm,
      reduzirCategoriaExcetoTipos,
      prestigioBase,
      personagemBaseId,
      resolverPreviewInventario,
    ],
  );

  return {
    sincronizarInventario,
    carregando,
    erro,
    preview,
  };
}
