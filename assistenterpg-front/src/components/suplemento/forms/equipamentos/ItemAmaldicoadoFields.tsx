// src/components/suplemento/forms/equipamentos/ItemAmaldicoadoFields.tsx

"use client";

import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  TipoAmaldicoado,
  TIPO_AMALDICOADO_LABELS,
} from "@/lib/types/homebrew-enums";
import type { HomebrewFormDados } from "../../hooks/useHomebrewForm";

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function ItemAmaldicoadoFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Select
        label="Tipo amaldiçoado *"
        value={dados.tipoAmaldicoado ?? ""}
        onChange={(e) =>
          onChange({ tipoAmaldicoado: e.target.value as TipoAmaldicoado })
        }
        required
      >
        <option value="">Selecione...</option>
        <option value={TipoAmaldicoado.ITEM}>
          {TIPO_AMALDICOADO_LABELS[TipoAmaldicoado.ITEM]}
        </option>
      </Select>

      <Textarea
        label="Efeito *"
        value={dados.efeito ?? ""}
        onChange={(e) => onChange({ efeito: e.target.value })}
        placeholder="Descreva o efeito amaldiçoado completo do item..."
        rows={5}
        maxLength={1500}
        required
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-alert">
        <p className="text-xs text-app-fg">
          <strong>Diferença de Ferramenta Amaldiçoada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>
            • <strong>Ferramenta:</strong> Arma/Proteção/Artefato amaldiçoado
            com estrutura complexa
          </li>
          <li>
            • <strong>Item:</strong> Item genérico com efeito amaldiçoado
            (estrutura simples)
          </li>
        </ul>
        <p className="text-xs text-app-muted mt-2">
          <strong>Exemplos:</strong> Anátema Amaldiçoada, Âncora de Barreira,
          Guia de Maldições.
        </p>
      </div>
    </div>
  );
}
