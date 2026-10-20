"use client";
import { useRef, useState } from "react";
import { registrarAcaoNpc } from "@/lib/api/npc-acoes";
import { criarErroUsuario } from "@/lib/api/error-handler";
import type { SessaoCampanhaDetalhe, UserFacingError } from "@/lib/types";

export function useSessaoAcoesNpc(
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
  onAtualizar: (detalhe: SessaoCampanhaDetalhe) => void,
) {
  const bloqueio = useRef(false);
  const [pendente, setPendente] = useState<number | null>(null);
  const [erro, setErro] = useState<UserFacingError | null>(null);
  const [feedback, setFeedback] = useState("");
  async function usar(indice: number, encerrar = false) {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setPendente(indice);
    setErro(null);
    setFeedback("");
    try {
      const atualizado = await registrarAcaoNpc(
        campanhaId,
        sessaoId,
        npcSessaoId,
        indice,
        encerrar ? "ENCERRAR" : "REGISTRAR_USO",
        crypto.randomUUID(),
      );
      onAtualizar(atualizado);
      setFeedback(
        encerrar
          ? "Sustentação encerrada."
          : "Uso registrado. Recursos atualizados.",
      );
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      bloqueio.current = false;
      setPendente(null);
    }
  }
  return { pendente, erro, feedback, usar };
}
