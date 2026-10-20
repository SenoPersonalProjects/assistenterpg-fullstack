"use client";

import { useRef, useState } from "react";
import { criarErroUsuario } from "@/lib/api/error-handler";
import type { UserFacingError } from "@/lib/types";

/** Uma operação por vez, com o mesmo tratamento de falhas para todas as técnicas. */
export function useSessaoAcaoVinculado() {
  const bloqueio = useRef(false);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<UserFacingError | null>(null);
  async function executarAcao(operacao: () => Promise<void>) {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setPendente(true);
    setErro(null);
    try {
      await operacao();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      bloqueio.current = false;
      setPendente(false);
    }
  }
  return { pendente, erro, setErro, executarAcao };
}
