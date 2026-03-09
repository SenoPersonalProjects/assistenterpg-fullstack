// src/components/suplemento/forms/equipamentos/FerramentaAmaldicoadaFields.tsx

"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import {
  TipoAmaldicoado,
  TIPO_AMALDICOADO_LABELS,
} from "@/lib/types/homebrew-enums";
import { ArmaFields } from "./ArmaFields";
import { ProtecaoFields } from "./ProtecaoFields";
import type { HomebrewFormDados } from "../../hooks/useHomebrewForm";

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function FerramentaAmaldicoadaFields({ dados, onChange }: Props) {
  const tipoAmaldicoado = dados.tipoAmaldicoado as TipoAmaldicoado | undefined;
  const tiposFerramentaAmaldicoada: TipoAmaldicoado[] = [
    TipoAmaldicoado.ARMA,
    TipoAmaldicoado.PROTECAO,
    TipoAmaldicoado.ARTEFATO,
  ];

  function updateSubDados(
    campo: "armaAmaldicoada" | "protecaoAmaldicoada" | "artefatoAmaldicoado",
    subDados: Record<string, unknown>,
  ) {
    onChange({ [campo]: { ...dados[campo], ...subDados } });
  }

  function updateDadosArma(dadosArma: Record<string, unknown>) {
    const armaAmaldicoada = dados.armaAmaldicoada || {};
    onChange({
      armaAmaldicoada: {
        ...armaAmaldicoada,
        dadosArma: { ...armaAmaldicoada.dadosArma, ...dadosArma },
      },
    });
  }

  function updateDadosProtecao(dadosProtecao: Record<string, unknown>) {
    const protecaoAmaldicoada = dados.protecaoAmaldicoada || {};
    onChange({
      protecaoAmaldicoada: {
        ...protecaoAmaldicoada,
        dadosProtecao: {
          ...protecaoAmaldicoada.dadosProtecao,
          ...dadosProtecao,
        },
      },
    });
  }

  return (
    <div className="space-y-4">
      <Select
        label="Tipo amaldiçoado *"
        value={tipoAmaldicoado ?? ""}
        onChange={(e) => {
          const novoTipo = e.target.value as TipoAmaldicoado;
          onChange({
            tipoAmaldicoado: novoTipo,
            armaAmaldicoada: undefined,
            protecaoAmaldicoada: undefined,
            artefatoAmaldicoado: undefined,
          });
        }}
        required
      >
        <option value="">Selecione...</option>
        {tiposFerramentaAmaldicoada.map((value) => (
          <option key={value} value={value}>
            {TIPO_AMALDICOADO_LABELS[value]}
          </option>
        ))}
      </Select>

      {/* ARMA AMALDIÇOADA */}
      {tipoAmaldicoado === TipoAmaldicoado.ARMA && (
        <div className="space-y-4 pt-3 border-t border-app-border">
          <div className="flex items-center gap-2">
            <Icon name="sword" className="w-5 h-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">
              Arma Amaldiçoada
            </h4>
          </div>

          <Input
            label="Tipo base *"
            value={dados.armaAmaldicoada?.tipoBase ?? ""}
            onChange={(e) =>
              updateSubDados("armaAmaldicoada", { tipoBase: e.target.value })
            }
            placeholder="Ex: FACA, ESPADA, KATANA"
            required
          />

          <Checkbox
            label="Proficiência requerida"
            checked={dados.armaAmaldicoada?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados("armaAmaldicoada", {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito amaldiçoado *"
            value={dados.armaAmaldicoada?.efeito ?? ""}
            onChange={(e) =>
              updateSubDados("armaAmaldicoada", { efeito: e.target.value })
            }
            placeholder="Efeito especial da maldição..."
            rows={3}
            maxLength={1000}
            required
          />

          <div className="pt-3 border-t border-app-border">
            <p className="text-xs font-medium text-app-fg mb-3">
              Dados da arma base:
            </p>
            <ArmaFields
              dados={dados.armaAmaldicoada?.dadosArma ?? {}}
              onChange={updateDadosArma}
            />
          </div>
        </div>
      )}

      {/* PROTEÇÃO AMALDIÇOADA */}
      {tipoAmaldicoado === TipoAmaldicoado.PROTECAO && (
        <div className="space-y-4 pt-3 border-t border-app-border">
          <div className="flex items-center gap-2">
            <Icon name="shield-defense" className="w-5 h-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">
              Proteção Amaldiçoada
            </h4>
          </div>

          <Input
            label="Tipo base *"
            value={dados.protecaoAmaldicoada?.tipoBase ?? ""}
            onChange={(e) =>
              updateSubDados("protecaoAmaldicoada", {
                tipoBase: e.target.value,
              })
            }
            placeholder="Ex: COLETE, ESCUDO"
            required
          />

          <Checkbox
            label="Proficiência requerida"
            checked={dados.protecaoAmaldicoada?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados("protecaoAmaldicoada", {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito amaldiçoado *"
            value={dados.protecaoAmaldicoada?.efeito ?? ""}
            onChange={(e) =>
              updateSubDados("protecaoAmaldicoada", { efeito: e.target.value })
            }
            placeholder="Efeito especial da maldição..."
            rows={3}
            maxLength={1000}
            required
          />

          <div className="pt-3 border-t border-app-border">
            <p className="text-xs font-medium text-app-fg mb-3">
              Dados da proteção base:
            </p>
            <ProtecaoFields
              dados={dados.protecaoAmaldicoada?.dadosProtecao ?? {}}
              onChange={updateDadosProtecao}
            />
          </div>
        </div>
      )}

      {/* ARTEFATO AMALDIÇOADO */}
      {tipoAmaldicoado === TipoAmaldicoado.ARTEFATO && (
        <div className="space-y-4 pt-3 border-t border-app-border">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">
              Artefato Amaldiçoado
            </h4>
          </div>

          <Input
            label="Tipo base *"
            value={dados.artefatoAmaldicoado?.tipoBase ?? ""}
            onChange={(e) =>
              updateSubDados("artefatoAmaldicoado", {
                tipoBase: e.target.value,
              })
            }
            placeholder="Ex: Amuleto, Anel, Talismã"
            required
          />

          <Checkbox
            label="Proficiência requerida"
            checked={dados.artefatoAmaldicoado?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados("artefatoAmaldicoado", {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito *"
            value={dados.artefatoAmaldicoado?.efeito ?? ""}
            onChange={(e) =>
              updateSubDados("artefatoAmaldicoado", { efeito: e.target.value })
            }
            placeholder="Efeito do artefato..."
            rows={3}
            maxLength={1000}
            required
          />

          <Input
            label="Custo de uso *"
            value={dados.artefatoAmaldicoado?.custoUso ?? ""}
            onChange={(e) =>
              updateSubDados("artefatoAmaldicoado", {
                custoUso: e.target.value,
              })
            }
            placeholder="Ex: 1 PE por uso, 5 EA por ativação"
            required
          />

          <Input
            label="Manutenção *"
            value={dados.artefatoAmaldicoado?.manutencao ?? ""}
            onChange={(e) =>
              updateSubDados("artefatoAmaldicoado", {
                manutencao: e.target.value,
              })
            }
            placeholder="Ex: Requer recarga semanal, usa energia amaldiçoada"
            required
          />
        </div>
      )}
    </div>
  );
}
