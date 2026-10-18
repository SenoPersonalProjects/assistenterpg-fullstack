"use client";
import { useState } from "react";
import { SessionPanel } from "./SessionPanel";
import { SessionNpcActionEditor } from "./SessionNpcActionEditor";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api/axios-client";
import type {
  NpcSessaoCampanhaCompleto,
  SessaoCampanhaDetalhe,
} from "@/lib/types";
type Props = {
  campanhaId: number;
  sessaoId: number;
  npc: NpcSessaoCampanhaCompleto;
  alvos: Array<{ tipo: "PERSONAGEM" | "NPC"; id: number; nome: string }>;
  encerrada: boolean;
  ehMestre: boolean;
  onAtualizar: (detalhe: SessaoCampanhaDetalhe) => void;
};
type MetaAcao = {
  execucao?: string;
  estado?: string;
  sustentacaoEA?: number;
  frequencia?: string;
};
export function SessionNpcActionsPanel({
  campanhaId,
  sessaoId,
  npc,
  alvos,
  encerrada,
  ehMestre,
  onAtualizar,
}: Props) {
  const [indice, setIndice] = useState("");
  const [modo, setModo] = useState("FORA");
  const [alvo, setAlvo] = useState("");
  const [naZona, setNaZona] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [pendente, setPendente] = useState(false);
  const [dano, setDano] = useState("0");
  const acao = indice !== "" ? npc.acoes[Number(indice)] : undefined;
  const meta = acao as typeof acao & MetaAcao;
  const st = npc.estadoAcoes;
  async function usar(operacao = "USAR", extras: Record<string, unknown> = {}) {
    if (pendente || indice === "") return;
    setPendente(true);
    setErro("");
    try {
      const { data } = await apiClient.post<SessaoCampanhaDetalhe>(
        `/campanhas/${campanhaId}/sessoes/${sessaoId}/npcs/${npc.npcSessaoId}/acoes`,
        {
          clientRequestId: crypto.randomUUID(),
          acaoIndice: Number(indice),
          operacao,
          modo,
          ...(alvo ? { alvo } : {}),
          personagensNaZona: naZona
            .filter((k) => k.startsWith("PERSONAGEM:"))
            .map((k) => Number(k.split(":")[1])),
          npcsNaZona: naZona
            .filter((k) => k.startsWith("NPC:"))
            .map((k) => Number(k.split(":")[1])),
          ...extras,
        },
      );
      onAtualizar(data);
    } catch (e: unknown) {
      const message = (
        e as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      setErro(
        Array.isArray(message)
          ? message.join(" ")
          : (message ?? "Não foi possível usar a ação."),
      );
    } finally {
      setPendente(false);
    }
  }
  return (
    <SessionPanel
      title={`Ações e efeitos — ${npc.nome}`}
      subtitle="Custos, sustentação e estados da ficha"
      tone="control"
      collapsible
    >
      <div className="space-y-3">
        {erro ? (
          <p role="alert" className="text-sm text-red-400">
            {erro}
          </p>
        ) : null}
        {st?.perdeuTecnica ? (
          <p className="text-sm">Voto permanente: Ato Cego perdido.</p>
        ) : st?.votoPessoal ? (
          <p className="text-sm">
            Voto permanente: Ato Cego não pode afetar Tobari.
          </p>
        ) : null}
        <Select
          label="Ação da ficha"
          value={indice}
          onChange={(e) => setIndice(e.target.value)}
        >
          <option value="">Selecione uma ação</option>
          {npc.acoes.map((a, i) => (
            <option key={`${i}:${a.nome}`} value={i}>
              {a.nome}
            </option>
          ))}
        </Select>
        {acao ? (
          <>
            <p className="text-sm text-app-muted">
              {meta.execucao ?? acao.tipoExecucao} · {acao.custoEA ?? 0} EA ·{" "}
              {acao.custoPE ?? 0} PE
              {meta.sustentacaoEA
                ? ` · Sustentação ${meta.sustentacaoEA} EA/rodada`
                : ""}
              {meta.frequencia === "RODADA" ? " · 1/rodada" : ""}
            </p>
            <p className="text-sm">{acao.efeito ?? acao.descricao}</p>
            {npc.npcAmeacaId ? (
              <SessionNpcActionEditor
                key={`${indice}:${acao.nome}`}
                acao={acao}
                disabled={pendente || encerrada}
                salvar={(campos) => usar("EDITAR", campos)}
              />
            ) : null}
            {meta.estado === "RECINTO" || meta.estado === "TROCAR_MODO" ? (
              <Select
                label="Modo de som"
                value={modo}
                onChange={(e) => setModo(e.target.value)}
                options={[
                  { value: "FORA", label: "Silêncio para fora" },
                  { value: "DENTRO", label: "Silêncio para dentro" },
                ]}
              />
            ) : null}
            {meta.estado === "MARCA" ? (
              <Input
                label="Cúmplice voluntário tocado"
                value={alvo}
                onChange={(e) => setAlvo(e.target.value)}
              />
            ) : null}
            {meta.estado === "DOMINIO_SIMPLES" ? (
              <fieldset className="space-y-1 rounded border border-app-border p-3">
                <legend className="text-sm">
                  Criaturas dentro de 3m — confirme as posições com o mestre
                </legend>
                <p className="text-xs text-app-muted">
                  A zona acompanha Seo e protege todos os ocupantes, inclusive
                  inimigos. Atualize a lista quando alguém entrar ou sair.
                </p>
                {alvos.map((a) => {
                  const key = `${a.tipo}:${a.id}`;
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          naZona.includes(key) ||
                          (a.tipo === "NPC" && a.id === npc.npcSessaoId)
                        }
                        disabled={a.tipo === "NPC" && a.id === npc.npcSessaoId}
                        onChange={(e) =>
                          setNaZona((prev) =>
                            e.target.checked
                              ? [...prev, key]
                              : prev.filter((k) => k !== key),
                          )
                        }
                      />
                      {a.nome}
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={pendente || encerrada}
                onClick={() => void usar()}
              >
                Usar ação
              </Button>
              {st?.sustentacoes?.[acao.nome] ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pendente || encerrada}
                  onClick={() => void usar("ENCERRAR")}
                >
                  Encerrar sustentação
                </Button>
              ) : null}
              {meta.estado === "DOMINIO_SIMPLES" &&
              st?.sustentacoes?.[acao.nome] ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pendente || encerrada}
                  onClick={() => void usar("ZONA")}
                >
                  Atualizar ocupantes da zona
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
        {st?.recinto ? (
          <p className="text-sm" aria-live="polite">
            Recinto: silêncio para{" "}
            {st.recinto.modo === "FORA" ? "fora" : "dentro"} · DT{" "}
            {(st.recinto.dobrado ? 35 : 30) - (st.recinto.danificado ? 5 : 0)}
            {st.recinto.danificado ? " · Camada danificada" : ""}
          </p>
        ) : null}
        {st?.biombos?.length ? (
          <div className="space-y-2">
            <p className="text-sm">Biombos {st.biombos.length}/3</p>
            {ehMestre ? (
              <Input
                label="Dano bruto confirmado no biombo"
                type="number"
                min={0}
                value={dano}
                onChange={(e) => setDano(e.target.value)}
              />
            ) : null}
            {st.biombos.map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  Biombo {i + 1}: {b.pv}/30 PV · DEF {b.defesa} · RD {b.rd}
                </span>
                {ehMestre ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pendente || encerrada || indice === ""}
                    onClick={() =>
                      void usar("DANIFICAR_BIOMBO", {
                        biomboId: b.id,
                        dano: Number(dano),
                      })
                    }
                  >
                    Aplicar dano
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {st?.marcas?.length ? (
          <div className="space-y-1">
            <p className="text-sm">Cúmplices: {st.marcas.join(", ")}</p>
            {st.marcas.map((m) => (
              <Button
                key={m}
                size="sm"
                variant="secondary"
                disabled={pendente || encerrada || indice === ""}
                onClick={() => void usar("REMOVER_MARCA", { alvo: m })}
              >
                Confirmar remoção após Padrão + 3 PE ou 3 EA: {m}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </SessionPanel>
  );
}
