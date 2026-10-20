"use client";

import { useState } from "react";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useSessaoAcaoVinculado } from "@/hooks/useSessaoAcaoVinculado";
import { SessionLinkedEntitiesControl } from "./SessionLinkedEntitiesControl";
import { SessionTenShadowsExtension } from "./SessionTenShadowsExtension";
import {
  entidadeVinculadaAtivaNestaSessao,
  podeInvocarEntidadeVinculada,
} from "@/lib/campanha/entidades-vinculadas";
import {
  apiGetSessaoCampanha,
  apiInvocarEntidadeVinculadaSessaoCampanha,
  apiDesinvocarEntidadeVinculadaSessaoCampanha,
} from "@/lib/api/campanhas";
import type { SessaoCampanhaDetalhe } from "@/lib/types";

type Props = {
  card: SessaoCampanhaDetalhe["cards"][number];
  campanhaId: number;
  sessaoId: number;
  sessaoEncerrada: boolean;
  alvosPersonagens?: Array<{
    personagemSessaoId: number;
    nomePersonagem: string;
  }>;
  alvosNpcs?: Array<{ npcSessaoId: number; nome: string }>;
  onAtualizarSessao?: (detalhe: SessaoCampanhaDetalhe) => void;
};
const TIPOS_VINCULADOS: Record<string, string> = {
  SHIKIGAMI: "Shikigami",
  CORPO_AMALDICOADO: "Corpo",
  MALDICAO_CONTROLADA: "Maldição",
};

export function SessionCharacterLinkedEntities(props: Props) {
  const { card, campanhaId, sessaoId, sessaoEncerrada, onAtualizarSessao } =
    props;
  const [selecionada, setSelecionada] = useState("");
  const { pendente, erro, executarAcao } = useSessaoAcaoVinculado();
  const possuiSombras =
    card.possuiDezSombras || card.tecnicaInata?.codigo === "DEZ_SOMBRAS";
  const entidadesGerais = card.vinculados.filter(
    (item) => !possuiSombras || item.regraInvocacao?.tipo !== "DEZ_SOMBRAS",
  );
  async function atualizar() {
    onAtualizarSessao?.(await apiGetSessaoCampanha(campanhaId, sessaoId));
  }
  async function manifestar(liberar: boolean) {
    const entidade = card.vinculados.find(
      (item) => String(item.id) === selecionada,
    );
    if (!entidade || !card.podeEditar || sessaoEncerrada) return;
    await executarAcao(async () => {
      const instancia = entidade.instanciasAtivas?.find(
        (item) => item.sessaoId === sessaoId,
      );
      if (liberar && !instancia) return;
      const atualizado = liberar
        ? await apiDesinvocarEntidadeVinculadaSessaoCampanha(
            campanhaId,
            sessaoId,
            instancia!.id,
          )
        : await apiInvocarEntidadeVinculadaSessaoCampanha(
            campanhaId,
            sessaoId,
            entidade.id,
          );
      onAtualizarSessao?.(atualizado);
    });
  }
  if (!card.vinculados.length && !possuiSombras) return null;
  return (
    <section
      className="space-y-2 rounded border border-app-border p-2"
      aria-label="Shikigamis e vinculados"
    >
      <p className="text-xs font-semibold text-app-fg">
        Shikigamis e vinculados
      </p>
      {erro ? <ErrorAlert error={erro} /> : null}
      {possuiSombras && card.podeEditar ? (
        <SessionTenShadowsExtension
          campanhaId={campanhaId}
          sessaoId={sessaoId}
          personagemSessaoId={card.personagemSessaoId}
          revisao={card}
          onAtualizar={atualizar}
          alvos={[
            ...(props.alvosPersonagens ?? []).map((item) => ({
              tipo: "PERSONAGEM" as const,
              id: item.personagemSessaoId,
              nome: item.nomePersonagem,
            })),
            ...(props.alvosNpcs ?? []).map((item) => ({
              tipo: "NPC" as const,
              id: item.npcSessaoId,
              nome: item.nome,
            })),
          ]}
        />
      ) : null}
      {entidadesGerais.length ? (
        <>
          <SessionLinkedEntitiesControl
            entidades={entidadesGerais.map((item) => ({
              id: String(item.id),
              nome: item.nome,
              tipo: TIPOS_VINCULADOS[item.tipo] ?? item.tipo,
              estado: item.estado,
              ativa: entidadeVinculadaAtivaNestaSessao(item),
              podeInvocar: podeInvocarEntidadeVinculada(item, sessaoEncerrada),
              pvAtual:
                item.instanciasAtivas?.find(
                  (instancia) => instancia.sessaoId === sessaoId,
                )?.pontosVidaAtual ?? item.pontosVidaAtual,
              pvMax: item.pontosVidaMax,
              defesa: item.defesa,
              movimento: item.deslocamentoMetros,
            }))}
            selecionada={selecionada}
            onSelecionar={setSelecionada}
            indisponivel={pendente || sessaoEncerrada}
            podeControlar={card.podeEditar}
            onInvocar={() => void manifestar(false)}
            onLiberar={() => void manifestar(true)}
          />
        </>
      ) : null}
    </section>
  );
}
