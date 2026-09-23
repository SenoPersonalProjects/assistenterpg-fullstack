"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SessionPanel } from "@/components/campanha/sessao/SessionPanel";
import {
  apiExecutarAcaoDominioSessaoCampanha,
  apiTentarEpifaniaDominioSessaoCampanha,
} from "@/lib/api/campanhas";
import type { SessaoCampanhaDetalhe } from "@/lib/types";

type Props = {
  campanhaId: number;
  sessaoId: number;
  dominios: NonNullable<SessaoCampanhaDetalhe["dominios"]>;
  sessaoEncerrada: boolean;
  ehMestre: boolean;
  personagens?: Array<{
    id: number;
    nome: string;
    perfilEpifaniaDominio?: unknown;
    expansoes?: Array<{
      id: number;
      nome: string;
      descricao: string;
      custoEA: number;
      custoPE: number;
    }>;
  }>;
  onAtualizar: (detalhe: SessaoCampanhaDetalhe) => void;
};

const estadoBarreiraLabel: Record<string, string> = {
  SELADA: "Selada",
  FISSURA: "Fissura",
  BRECHA: "Brecha",
  COLAPSADA: "Colapsada",
  ABERTO: "Sem casca",
};

export function SessionDomainsPanel({
  campanhaId,
  sessaoId,
  dominios,
  sessaoEncerrada,
  ehMestre,
  personagens = [],
  onAtualizar,
}: Props) {
  const [pendente, setPendente] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [epifaniaAberta, setEpifaniaAberta] = useState(false);
  const [personagemEpifaniaId, setPersonagemEpifaniaId] = useState("");
  const [expansaoEpifaniaId, setExpansaoEpifaniaId] = useState("");
  const [editarPerfilNarrativo, setEditarPerfilNarrativo] = useState(false);
  const [nomeEpifania, setNomeEpifania] = useState("");
  const [atributoEpifania, setAtributoEpifania] = useState<
    "FOR" | "AGI" | "VIG" | "INT" | "PRE"
  >("PRE");
  const [tipoEpifania, setTipoEpifania] = useState<"FECHADO" | "ABERTO">(
    "FECHADO",
  );
  const [grauBarreiraEpifania, setGrauBarreiraEpifania] = useState("2");
  const [custoEaEpifania, setCustoEaEpifania] = useState("0");
  const [custoPeEpifania, setCustoPeEpifania] = useState("0");
  const personagemSelecionado = personagens.find(
    (personagem) => personagem.id === Number(personagemEpifaniaId),
  );
  const expansaoSelecionada = personagemSelecionado?.expansoes?.find(
    (expansao) => expansao.id === Number(expansaoEpifaniaId),
  );
  const possuiPerfilNarrativo = Boolean(
    personagemSelecionado?.perfilEpifaniaDominio &&
    typeof personagemSelecionado.perfilEpifaniaDominio === "object",
  );
  const usarPerfilNarrativo =
    possuiPerfilNarrativo && !editarPerfilNarrativo && !expansaoSelecionada;
  async function executar(
    dominioId: number,
    acao: Parameters<typeof apiExecutarAcaoDominioSessaoCampanha>[3]["acao"],
  ) {
    setErro(null);
    setPendente(dominioId);
    try {
      onAtualizar(
        await apiExecutarAcaoDominioSessaoCampanha(
          campanhaId,
          sessaoId,
          dominioId,
          { clientRequestId: crypto.randomUUID(), acao },
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o Domínio.",
      );
    } finally {
      setPendente(null);
    }
  }
  async function tentarEpifania() {
    const personagemSessaoId = Number(personagemEpifaniaId);
    const grauBarreira = Number(grauBarreiraEpifania);
    const custoEA = Number(custoEaEpifania);
    const custoPE = Number(custoPeEpifania);
    if (
      !personagemSessaoId ||
      (!expansaoSelecionada && !usarPerfilNarrativo && !nomeEpifania.trim())
    ) {
      setErro("Escolha o personagem e informe o nome do Domínio Incompleto.");
      return;
    }
    if (
      !Number.isInteger(grauBarreira) ||
      grauBarreira < 2 ||
      grauBarreira > 5 ||
      !Number.isInteger(custoEA) ||
      custoEA < 0 ||
      !Number.isInteger(custoPE) ||
      custoPE < 0
    ) {
      setErro(
        "Informe grau de barreira entre 2 e 5 e custos inteiros validos.",
      );
      return;
    }
    setErro(null);
    setPendente(-1);
    try {
      onAtualizar(
        await apiTentarEpifaniaDominioSessaoCampanha(campanhaId, sessaoId, {
          clientRequestId: crypto.randomUUID(),
          personagemSessaoId,
          habilidadeTecnicaId: expansaoSelecionada?.id,
          nomeDominio:
            expansaoSelecionada || usarPerfilNarrativo
              ? undefined
              : nomeEpifania.trim(),
          atributo: atributoEpifania,
          tipo:
            expansaoSelecionada || usarPerfilNarrativo
              ? undefined
              : tipoEpifania,
          grauBarreira:
            expansaoSelecionada || usarPerfilNarrativo
              ? undefined
              : grauBarreira,
          custoEA:
            expansaoSelecionada || usarPerfilNarrativo ? undefined : custoEA,
          custoPE:
            expansaoSelecionada || usarPerfilNarrativo ? undefined : custoPE,
          salvarPerfilNarrativo: !expansaoSelecionada,
        }),
      );
      setEpifaniaAberta(false);
      setNomeEpifania("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível resolver a Epifania.",
      );
    } finally {
      setPendente(null);
    }
  }
  return (
    <SessionPanel
      title="Domínios e barreiras"
      subtitle="Abertura, integridade, disputa e Acerto Garantido auditável."
      tone="control"
      collapsible
      collapseLabel="Domínios e barreiras"
    >
      {erro ? <ErrorAlert message={erro} /> : null}
      {ehMestre ? (
        <div className="mb-3 rounded-xl border border-app-border bg-app-base/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-app-fg">Epifania</p>
              <p className="text-xs text-app-muted">
                O mestre autoriza a rolagem crua e manifesta um Domínio
                Incompleto sem Acerto Garantido.
              </p>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setEpifaniaAberta((aberta) => !aberta)}
            >
              {epifaniaAberta ? "Cancelar" : "Resolver Epifania"}
            </Button>
          </div>
          {epifaniaAberta ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="text-xs text-app-muted">
                Personagem
                <select
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  value={personagemEpifaniaId}
                  onChange={(event) => {
                    setPersonagemEpifaniaId(event.target.value);
                    setExpansaoEpifaniaId("");
                  }}
                >
                  <option value="">Selecione</option>
                  {personagens.map((personagem) => (
                    <option key={personagem.id} value={personagem.id}>
                      {personagem.nome}
                    </option>
                  ))}
                </select>
              </label>
              {personagemSelecionado?.expansoes?.length ? (
                <label className="text-xs text-app-muted md:col-span-2">
                  Expansao completa cadastrada
                  <select
                    className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                    value={expansaoEpifaniaId}
                    onChange={(event) =>
                      setExpansaoEpifaniaId(event.target.value)
                    }
                  >
                    <option value="">
                      Usar perfil narrativo salvo/configurar outro
                    </option>
                    {personagemSelecionado.expansoes.map((expansao) => (
                      <option key={expansao.id} value={expansao.id}>
                        {expansao.nome} (EA {expansao.custoEA}, PE{" "}
                        {expansao.custoPE})
                      </option>
                    ))}
                  </select>
                  {expansaoSelecionada ? (
                    <span className="mt-1 block text-app-fg">
                      {expansaoSelecionada.descricao}
                    </span>
                  ) : null}
                </label>
              ) : null}
              {possuiPerfilNarrativo && !expansaoSelecionada ? (
                <div className="flex items-end">
                  <Button
                    size="xs"
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setEditarPerfilNarrativo((editar) => !editar)
                    }
                  >
                    {editarPerfilNarrativo
                      ? "Usar perfil salvo"
                      : "Editar perfil narrativo"}
                  </Button>
                </div>
              ) : null}
              <label className="text-xs text-app-muted">
                Nome do Domínio Incompleto
                <input
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  value={nomeEpifania}
                  onChange={(event) => setNomeEpifania(event.target.value)}
                  placeholder="Ex.: Jardim das Sombras"
                />
              </label>
              <label className="text-xs text-app-muted">
                Atributo favorecido
                <select
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  value={atributoEpifania}
                  onChange={(event) =>
                    setAtributoEpifania(
                      event.target.value as typeof atributoEpifania,
                    )
                  }
                >
                  <option value="FOR">Força</option>
                  <option value="AGI">Agilidade</option>
                  <option value="VIG">Vigor</option>
                  <option value="INT">Intelecto</option>
                  <option value="PRE">Presença</option>
                </select>
              </label>
              <label className="text-xs text-app-muted">
                Estrutura
                <select
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  value={tipoEpifania}
                  onChange={(event) =>
                    setTipoEpifania(event.target.value as typeof tipoEpifania)
                  }
                >
                  <option value="FECHADO">Dominio fechado</option>
                  <option value="ABERTO">Dominio aberto</option>
                </select>
              </label>
              <label className="text-xs text-app-muted">
                Grau de barreira (2 a 5)
                <input
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  type="number"
                  min="2"
                  max="5"
                  step="1"
                  value={grauBarreiraEpifania}
                  onChange={(event) =>
                    setGrauBarreiraEpifania(event.target.value)
                  }
                />
              </label>
              <label className="text-xs text-app-muted">
                Custo de EA
                <input
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  type="number"
                  min="0"
                  step="1"
                  value={custoEaEpifania}
                  onChange={(event) => setCustoEaEpifania(event.target.value)}
                />
              </label>
              <label className="text-xs text-app-muted">
                Custo de PE
                <input
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  type="number"
                  min="0"
                  step="1"
                  value={custoPeEpifania}
                  onChange={(event) => setCustoPeEpifania(event.target.value)}
                />
              </label>
              <p className="text-xs text-app-muted md:col-span-2">
                A Epifania nao possui Acerto Garantido. O mestre define custos e
                estrutura coerentes com a manifestacao narrada.
              </p>
              <div className="flex items-end">
                <Button
                  size="sm"
                  onClick={() => void tentarEpifania()}
                  disabled={pendente !== null}
                >
                  Rolar Epifania
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {dominios.length === 0 ? (
        <p className="text-sm text-app-muted">
          Nenhum Domínio ativo ou em abertura nesta cena.
        </p>
      ) : (
        <div className="space-y-3">
          {dominios.map((dominio) => (
            <article
              key={dominio.id}
              className="rounded-xl border border-app-border bg-app-surface/50 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-app-fg">{dominio.nome}</p>
                  <p className="text-xs text-app-muted">
                    {dominio.participante.nome} ·{" "}
                    {dominio.tipo === "ABERTO"
                      ? "Domínio aberto"
                      : "Domínio fechado"}{" "}
                    · {dominio.incompleto ? "Incompleto" : dominio.estado}
                  </p>
                </div>
                <span className="rounded-full bg-app-secondary/15 px-2 py-1 text-xs font-semibold text-app-secondary">
                  {estadoBarreiraLabel[dominio.estadoBarreira] ??
                    dominio.estadoBarreira}
                </span>
              </div>
              {dominio.integridadeMax !== null ? (
                <p className="mt-2 text-xs text-app-muted">
                  Integridade {dominio.integridadeAtual}/
                  {dominio.integridadeMax} · Rupturas {dominio.rupturas} · DT
                  estrutural {15 + 3 * dominio.grauBarreira}
                </p>
              ) : null}
              {dominio.disputas.map((disputa) => (
                <p key={disputa.id} className="mt-1 text-xs text-app-muted">
                  Disputa #{disputa.id}: Dominância {disputa.dominancia},
                  resolução {disputa.resolucoesConcluidas + 1}.
                </p>
              ))}
              {dominio.acertoGarantido ? (
                <p className="mt-2 text-xs text-app-muted">
                  Acerto garantido: {dominio.acertoGarantido}
                </p>
              ) : null}
              {dominio.incompleto ? (
                <p className="mt-2 text-xs text-app-muted">
                  Epifania: +5 Jujutsu, +5 Luta, +1d20 em{" "}
                  {dominio.atributoEpifania}; +{dominio.bonusDadosEfeito ?? 1}{" "}
                  dado(s) de efeito. Não possui Acerto Garantido.
                </p>
              ) : null}
              {(dominio.podeControlar || ehMestre) && !sessaoEncerrada ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ehMestre && dominio.estado === "ABRINDO" ? (
                    <>
                      <Button
                        size="xs"
                        onClick={() => void executar(dominio.id, "FORMAR")}
                        disabled={pendente === dominio.id}
                      >
                        Formar
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void executar(dominio.id, "INTERROMPER")}
                        disabled={pendente === dominio.id}
                      >
                        Interromper
                      </Button>
                    </>
                  ) : null}
                  {dominio.estado === "ATIVO" ? (
                    <>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void executar(dominio.id, "REFINAR")}
                        disabled={pendente === dominio.id}
                      >
                        Refinar
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void executar(dominio.id, "FORCAR")}
                        disabled={pendente === dominio.id}
                      >
                        Forçar
                      </Button>
                      {dominio.tipo === "FECHADO" ? (
                        <>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              void executar(dominio.id, "REFORCAR")
                            }
                            disabled={pendente === dominio.id}
                          >
                            Reforçar
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              void executar(dominio.id, "RECONFIGURAR")
                            }
                            disabled={pendente === dominio.id}
                          >
                            Reconfigurar
                          </Button>
                        </>
                      ) : null}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => void executar(dominio.id, "DESFAZER")}
                        disabled={pendente === dominio.id}
                      >
                        Desfazer
                      </Button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SessionPanel>
  );
}
