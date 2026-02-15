// hooks/useInventarioPreview.ts - ✅ CORRIGIDO FINAL

import { useCallback, useState } from 'react';
import { apiPreviewItensInventario } from '@/lib/api';
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

/**
 * ✅ Hook para sincronizar inventário com backend (preview)
 * 
 * Encapsula toda a lógica de:
 * - Montar payload para o backend
 * - Chamar API de preview
 * - Retornar itens sanitizados (apenas campos do Payload)
 * - Gerenciar loading e erros
 * 
 * @param params - forca e prestigioBase do personagem
 * @returns Função de sincronização + estados (carregando, erro)
 */
export function useInventarioPreview({
  forca,
  prestigioBase,
}: UseInventarioPreviewParams): UseInventarioPreviewReturn {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sincronizarInventario = useCallback(
    async (itens: ItemInventarioPayload[]): Promise<ItemInventarioPayload[]> => {
      // ✅ Caso vazio: não precisa chamar backend
      if (itens.length === 0) {
        console.log('[useInventarioPreview] Lista vazia, nada a sincronizar');
        return itens;
      }

      setCarregando(true);
      setErro(null);

      try {
        // 1️⃣ Montar payload com conversão explícita de tipos
        // ❌ REMOVER modificacoesIds do preview (backend não aceita)
        const payload = {
          forca: Number(forca),
          prestigioBase: Number(prestigioBase),
          itens: itens.map((item) => {
            const itemPayload = {
              equipamentoId: Number(item.equipamentoId),
              quantidade: Number(item.quantidade),
              equipado: Boolean(item.equipado),
              nomeCustomizado: item.nomeCustomizado || undefined,
              // ❌ REMOVIDO: modificacoesIds não é aceito no preview
            };

            // ✅ LOG de validação por item
            console.log('[useInventarioPreview] Item preparado:', {
              equipamentoId: item.equipamentoId,
              nomeCustomizado: item.nomeCustomizado,
              original: {
                equipamentoId: item.equipamentoId,
                quantidade: item.quantidade,
                equipado: item.equipado,
                modificacoesIds: item.modificacoesIds?.length || 0,
              },
              convertido: itemPayload,
              tipos: {
                equipamentoId: typeof itemPayload.equipamentoId,
                quantidade: typeof itemPayload.quantidade,
                equipado: typeof itemPayload.equipado,
                nomeCustomizado: typeof itemPayload.nomeCustomizado,
              },
              valido: {
                equipamentoId: !isNaN(itemPayload.equipamentoId),
                quantidade: !isNaN(itemPayload.quantidade) && itemPayload.quantidade > 0,
                equipado: typeof itemPayload.equipado === 'boolean',
              },
            });

            return itemPayload;
          }),
        };

        // ✅ LOG do payload completo
        console.log('[useInventarioPreview] Payload final:', JSON.stringify(payload, null, 2));
        console.log('[useInventarioPreview] Resumo do envio:', {
          totalItens: payload.itens.length,
          forca: `${payload.forca} (${typeof payload.forca})`,
          prestigioBase: `${payload.prestigioBase} (${typeof payload.prestigioBase})`,
          itensValidos: payload.itens.every(
            (i) => !isNaN(i.equipamentoId) && !isNaN(i.quantidade) && i.quantidade > 0
          ),
        });

        // 2️⃣ Chamar backend
        const preview = await apiPreviewItensInventario(payload);

        console.log('[useInventarioPreview] ✅ Resposta do backend recebida:', {
          totalItens: preview.itens.length,
          espacosBase: preview.espacosBase,
          espacosExtra: preview.espacosExtra,
          espacosTotal: preview.espacosTotal,
          espacosOcupados: preview.espacosOcupados,
          sobrecarregado: preview.sobrecarregado,
          grauXama: preview.grauXama?.grau,
        });

        // 3️⃣ CRÍTICO: Retornar APENAS ItemInventarioPayload (sem campos extras do backend)
        const itensAtualizados: ItemInventarioPayload[] = itens.map((itemLocal, index) => {
          const itemBackend = preview.itens[index];

          if (!itemBackend) {
            console.warn('[useInventarioPreview] ⚠️ Item sem preview do backend:', {
              index,
              equipamentoId: itemLocal.equipamentoId,
              nomeCustomizado: itemLocal.nomeCustomizado,
            });

            // ✅ Retornar item local sanitizado (MANTER modificacoesIds)
            return {
              equipamentoId: itemLocal.equipamentoId,
              quantidade: itemLocal.quantidade,
              equipado: itemLocal.equipado,
              modificacoesIds: itemLocal.modificacoesIds || [],
              nomeCustomizado: itemLocal.nomeCustomizado || null,
              notas: itemLocal.notas || null,
            };
          }

          console.log('[useInventarioPreview] ✅ Item sincronizado:', {
            equipamentoId: itemLocal.equipamentoId,
            nomeCustomizadoLocal: itemLocal.nomeCustomizado,
            nomeCustomizadoBackend: itemBackend.nomeCustomizado,
            espacosCalculados: itemBackend.espacosCalculados,
            modificacoesIds: itemLocal.modificacoesIds?.length || 0,
          });

          // ✅ RETORNAR APENAS OS 6 CAMPOS DO ItemInventarioPayload
          // ⚠️ MANTER modificacoesIds do item local (não vem do backend)
          return {
            equipamentoId: itemLocal.equipamentoId,
            quantidade: itemLocal.quantidade,
            equipado: itemLocal.equipado,
            modificacoesIds: itemLocal.modificacoesIds || [],
            nomeCustomizado: itemBackend.nomeCustomizado ?? itemLocal.nomeCustomizado,
            notas: itemLocal.notas || null,
          };
        });

        console.log('[useInventarioPreview] ✅ Sincronização concluída com sucesso!');
        return itensAtualizados;
      } catch (err) {
        const mensagemErro = err instanceof Error ? err.message : 'Erro ao sincronizar inventário com backend';

        // ✅ LOG detalhado do erro
        console.error('[useInventarioPreview] ❌ Erro na sincronização:', {
          message: err instanceof Error ? err.message : String(err),
          status: (err as { status?: number })?.status,
          body: (err as { body?: unknown })?.body,
          name: err instanceof Error ? err.name : 'UnknownError',
          stack: err instanceof Error ? err.stack : undefined,
        });

        setErro(mensagemErro);

        // ✅ Fallback: Retornar itens sanitizados (sem quebrar a UX)
        console.warn('[useInventarioPreview] ⚠️ Retornando itens sem cálculo (fallback)');
        return itens.map((item) => ({
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          modificacoesIds: item.modificacoesIds || [],
          nomeCustomizado: item.nomeCustomizado || null,
          notas: item.notas || null,
        }));
      } finally {
        setCarregando(false);
      }
    },
    [forca, prestigioBase],
  );

  return {
    sincronizarInventario,
    carregando,
    erro,
  };
}
