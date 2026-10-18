"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { NpcAmeacaAcao } from "@/lib/types/npc-ameaca.types";

type Props = {
  acao: NpcAmeacaAcao;
  disabled: boolean;
  salvar: (campos: Record<string, unknown>) => Promise<void>;
};
export function SessionNpcActionEditor({ acao, disabled, salvar }: Props) {
  const [nome, setNome] = useState(acao.nome);
  const [efeito, setEfeito] = useState(acao.efeito ?? acao.descricao ?? "");
  const [teste, setTeste] = useState(acao.teste ?? "");
  const [dano, setDano] = useState(acao.dano ?? "");
  const [ea, setEa] = useState(String(acao.custoEA ?? 0));
  const [pe, setPe] = useState(String(acao.custoPE ?? 0));
  return (
    <details className="rounded border border-app-border p-3">
      <summary className="cursor-pointer text-sm">
        Editar habilidade nesta campanha
      </summary>
      <div className="mt-3 space-y-2">
        <Input
          label="Nome da habilidade"
          value={nome}
          maxLength={120}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          label="Efeito da habilidade"
          value={efeito}
          maxLength={2000}
          onChange={(e) => setEfeito(e.target.value)}
        />
        <Input
          label="Teste da habilidade"
          value={teste}
          maxLength={120}
          onChange={(e) => setTeste(e.target.value)}
        />
        <Input
          label="Dano da habilidade"
          value={dano}
          maxLength={120}
          onChange={(e) => setDano(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Custo de EA"
            type="number"
            min={0}
            max={999}
            value={ea}
            onChange={(e) => setEa(e.target.value)}
          />
          <Input
            label="Custo de PE"
            type="number"
            min={0}
            max={999}
            value={pe}
            onChange={(e) => setPe(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={disabled || !nome.trim()}
          onClick={() =>
            void salvar({
              nome,
              efeito,
              teste,
              danoAcao: dano,
              custoEA: Number(ea),
              custoPE: Number(pe),
            })
          }
        >
          Salvar habilidade na campanha
        </Button>
      </div>
    </details>
  );
}
