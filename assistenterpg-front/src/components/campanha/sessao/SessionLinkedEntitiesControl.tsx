"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export type SessionLinkedEntityOption = {
  id: string;
  nome: string;
  tipo: string;
  estado: string;
  ativa: boolean;
  podeInvocar: boolean;
  pvAtual: number;
  pvMax: number;
  defesa: number;
  movimento: number;
  custo?: string;
};

/** Seleção, estado e ciclo de manifestação compartilhados por todos os vinculados. */
export function SessionLinkedEntitiesControl({
  entidades,
  selecionada,
  onSelecionar,
  indisponivel,
  podeControlar,
  onInvocar,
  onLiberar,
  children,
}: {
  entidades: SessionLinkedEntityOption[];
  selecionada: string;
  onSelecionar: (id: string) => void;
  indisponivel: boolean;
  podeControlar: boolean;
  onInvocar: () => void;
  onLiberar?: () => void;
  children?: ReactNode;
}) {
  const entidade = entidades.find((item) => item.id === selecionada);
  return (
    <div className="space-y-2">
      <Select
        label="Shikigami ou entidade vinculada"
        disabled={indisponivel}
        value={selecionada}
        onChange={(event) => onSelecionar(event.target.value)}
      >
        <option value="">Selecione um vinculado</option>
        {entidades.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}
            {item.ativa ? " · manifestado" : ""}
          </option>
        ))}
      </Select>
      {entidade ? (
        <>
          <p className="text-xs text-app-muted">
            {entidade.tipo} · {entidade.estado} · PV {entidade.pvAtual}/
            {entidade.pvMax} · Defesa {entidade.defesa} · Movimento{" "}
            {entidade.movimento}m
          </p>
          {entidade.custo ? (
            <p className="text-xs text-app-muted">{entidade.custo}</p>
          ) : null}
          {podeControlar ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                disabled={indisponivel || !entidade.podeInvocar}
                onClick={onInvocar}
              >
                Invocar
              </Button>
              {onLiberar ? (
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={indisponivel || !entidade.ativa}
                  onClick={onLiberar}
                >
                  Liberar
                </Button>
              ) : null}
            </div>
          ) : null}
          {children}
        </>
      ) : null}
    </div>
  );
}
