"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SessionPanel } from "@/components/campanha/sessao/SessionPanel";
import { apiExecutarAcaoDominioSessaoCampanha } from "@/lib/api/campanhas";
import type { SessaoCampanhaDetalhe } from "@/lib/types";

type Props = {
  campanhaId: number;
  sessaoId: number;
  dominios: NonNullable<SessaoCampanhaDetalhe["dominios"]>;
  sessaoEncerrada: boolean;
  ehMestre: boolean;
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
  onAtualizar,
}: Props) {
  const [pendente, setPendente] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
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
  return (
    <SessionPanel
      title="Domínios e barreiras"
      subtitle="Abertura, integridade, disputa e Acerto Garantido auditável."
      tone="control"
    >
      {erro ? <ErrorAlert message={erro} /> : null}
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
                    · {dominio.estado}
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
