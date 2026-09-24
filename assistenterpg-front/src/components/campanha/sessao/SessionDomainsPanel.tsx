"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SessionPanel } from "@/components/campanha/sessao/SessionPanel";
import { CriarDisputaDominioModal } from "@/components/campanha/sessao/modals/CriarDisputaDominioModal";
import {
  apiCriarDisputaDominioSessaoCampanha,
  apiCriarBarreiraNarrativaSessaoCampanha,
  apiEncerrarBarreiraNarrativaSessaoCampanha,
  apiExecutarAcaoDominioSessaoCampanha,
  apiResolverDisputaDominioSessaoCampanha,
  apiTentarEpifaniaDominioSessaoCampanha,
  type ResultadoAcaoDominioSessao,
  type ResultadoEpifaniaDominioSessao,
} from "@/lib/api/campanhas";
import type { SessaoCampanhaDetalhe } from "@/lib/types";

type Props = {
  campanhaId: number;
  sessaoId: number;
  dominios: NonNullable<SessaoCampanhaDetalhe["dominios"]>;
  barreirasNarrativas?: NonNullable<
    SessaoCampanhaDetalhe["barreirasNarrativas"]
  >;
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
  alvos?: Array<{
    id: number;
    nome: string;
    tipo: "PERSONAGEM" | "NPC";
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
  barreirasNarrativas = [],
  sessaoEncerrada,
  ehMestre,
  personagens = [],
  alvos = [],
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
  const [grauBarreiraEpifania, setGrauBarreiraEpifania] = useState("1");
  const [custoEaEpifania, setCustoEaEpifania] = useState("0");
  const [custoPeEpifania, setCustoPeEpifania] = useState("0");
  const [disputaAberta, setDisputaAberta] = useState(false);
  const [disputaInstancia, setDisputaInstancia] = useState(0);
  const [criandoDisputa, setCriandoDisputa] = useState(false);
  const [dominioPressaoId, setDominioPressaoId] = useState<number | null>(null);
  const [dominioRupturaId, setDominioRupturaId] = useState<number | null>(null);
  const [resultadoRuptura, setResultadoRuptura] = useState("");
  const [potenciaRuptura, setPotenciaRuptura] = useState<
    "NORMAL" | "POTENCIALIZADO" | "EXCEPCIONAL"
  >("NORMAL");
  const [golpeConcentrado, setGolpeConcentrado] = useState(false);
  const [barreiraAberta, setBarreiraAberta] = useState(false);
  const [nomeBarreira, setNomeBarreira] = useState("");
  const [descricaoBarreira, setDescricaoBarreira] = useState("");
  const [escalaBarreira, setEscalaBarreira] = useState<
    "PEQUENA" | "MEDIA" | "GRANDE" | "MASSIVA"
  >("PEQUENA");
  const [complexidadeBarreira, setComplexidadeBarreira] = useState("1");
  const [regrasBarreira, setRegrasBarreira] = useState("");
  const [ancoradaBarreira, setAncoradaBarreira] = useState(false);
  const [concentracaoBarreira, setConcentracaoBarreira] = useState(false);
  const [responsavelBarreira, setResponsavelBarreira] = useState("");
  const [resultadoEpifania, setResultadoEpifania] = useState<
    ResultadoEpifaniaDominioSessao["epifania"] | null
  >(null);
  const [feedbackDominio, setFeedbackDominio] = useState<
    ResultadoAcaoDominioSessao["feedback"] | null
  >(null);
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
  const dominiosAtivos = useMemo(
    () => dominios.filter((dominio) => dominio.estado === "ATIVO"),
    [dominios],
  );
  const dominiosDisponiveisParaDisputa = useMemo(
    () =>
      dominiosAtivos.filter(
        (dominio) =>
          !dominio.disputas.some((disputa) => disputa.estado === "ATIVA"),
      ),
    [dominiosAtivos],
  );
  const disputasAtivas = useMemo(() => {
    const porId = new Map<
      number,
      {
        id: number;
        resolucoesConcluidas: number;
        rodadaProximaResolucao: number;
        dominios: string[];
      }
    >();
    dominios.forEach((dominio) =>
      dominio.disputas
        .filter((disputa) => disputa.estado === "ATIVA")
        .forEach((disputa) => {
          const atual = porId.get(disputa.id);
          if (atual) {
            atual.dominios.push(dominio.nome);
            return;
          }
          porId.set(disputa.id, {
            id: disputa.id,
            resolucoesConcluidas: disputa.resolucoesConcluidas,
            rodadaProximaResolucao: disputa.rodadaProximaResolucao,
            dominios: [dominio.nome],
          });
        }),
    );
    return [...porId.values()];
  }, [dominios]);

  async function executar(
    dominioId: number,
    acao: Parameters<typeof apiExecutarAcaoDominioSessaoCampanha>[3]["acao"],
    detalhes: Partial<
      Parameters<typeof apiExecutarAcaoDominioSessaoCampanha>[3]
    > = {},
  ) {
    setErro(null);
    setPendente(dominioId);
    try {
      const resposta = await apiExecutarAcaoDominioSessaoCampanha(
        campanhaId,
        sessaoId,
        dominioId,
        { clientRequestId: crypto.randomUUID(), acao, ...detalhes },
      );
      onAtualizar(resposta.detalhe);
      setFeedbackDominio(resposta.feedback);
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

  async function criarDisputa(dados: {
    dominioIds: number[];
    alvosPersonagemSessaoIds: number[];
    alvosNpcSessaoIds: number[];
  }) {
    setErro(null);
    setCriandoDisputa(true);
    try {
      onAtualizar(
        await apiCriarDisputaDominioSessaoCampanha(campanhaId, sessaoId, {
          clientRequestId: crypto.randomUUID(),
          ...dados,
        }),
      );
      setDisputaAberta(false);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a disputa de Domínios.",
      );
    } finally {
      setCriandoDisputa(false);
    }
  }

  async function resolverDisputa(disputaId: number) {
    setErro(null);
    setPendente(-disputaId);
    try {
      onAtualizar(
        await apiResolverDisputaDominioSessaoCampanha(
          campanhaId,
          sessaoId,
          disputaId,
          { clientRequestId: crypto.randomUUID() },
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível resolver o Refinamento da disputa.",
      );
    } finally {
      setPendente(null);
    }
  }

  async function registrarRuptura() {
    const resultadoAtaque = Number(resultadoRuptura);
    if (
      !dominioRupturaId ||
      !Number.isInteger(resultadoAtaque) ||
      resultadoAtaque < 1
    ) {
      setErro(
        "Informe o resultado inteiro do ataque que superou a DT estrutural.",
      );
      return;
    }
    await executar(dominioRupturaId, "REGISTRAR_RUPTURA", {
      resultadoAtaque,
      potenciaRuptura,
      golpeConcentrado,
    });
    setDominioRupturaId(null);
    setResultadoRuptura("");
    setPotenciaRuptura("NORMAL");
    setGolpeConcentrado(false);
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
      grauBarreira < 1 ||
      grauBarreira > 5 ||
      !Number.isInteger(custoEA) ||
      custoEA < 0 ||
      !Number.isInteger(custoPE) ||
      custoPE < 0
    ) {
      setErro(
        "Informe grau de barreira entre 1 e 5 e custos inteiros validos.",
      );
      return;
    }
    setErro(null);
    setPendente(-1);
    try {
      const resposta = await apiTentarEpifaniaDominioSessaoCampanha(
        campanhaId,
        sessaoId,
        {
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
        },
      );
      onAtualizar(resposta.detalhe);
      setResultadoEpifania(resposta.epifania);
      if (resposta.epifania.sucesso) {
        setEpifaniaAberta(false);
        setNomeEpifania("");
      }
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

  async function criarBarreiraNarrativa() {
    const pontosComplexidade = Number(complexidadeBarreira);
    if (
      !nomeBarreira.trim() ||
      !Number.isInteger(pontosComplexidade) ||
      pontosComplexidade < 1
    ) {
      setErro(
        "Informe nome e uma complexidade inteira positiva para a barreira.",
      );
      return;
    }
    const [tipoResponsavel, idResponsavel] = responsavelBarreira.split(":");
    const responsavelId = Number(idResponsavel);
    setErro(null);
    setPendente(-2);
    try {
      onAtualizar(
        await apiCriarBarreiraNarrativaSessaoCampanha(campanhaId, sessaoId, {
          clientRequestId: crypto.randomUUID(),
          nome: nomeBarreira.trim(),
          descricao: descricaoBarreira.trim() || undefined,
          escala: escalaBarreira,
          pontosComplexidade,
          regras: regrasBarreira
            .split("\n")
            .map((regra) => regra.trim())
            .filter(Boolean),
          ancorada: ancoradaBarreira,
          requerConcentracao: concentracaoBarreira,
          personagemSessaoId:
            tipoResponsavel === "PERSONAGEM" && Number.isInteger(responsavelId)
              ? responsavelId
              : undefined,
          npcSessaoId:
            tipoResponsavel === "NPC" && Number.isInteger(responsavelId)
              ? responsavelId
              : undefined,
        }),
      );
      setBarreiraAberta(false);
      setNomeBarreira("");
      setDescricaoBarreira("");
      setRegrasBarreira("");
      setComplexidadeBarreira("1");
      setAncoradaBarreira(false);
      setConcentracaoBarreira(false);
      setResponsavelBarreira("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a barreira narrativa.",
      );
    } finally {
      setPendente(null);
    }
  }

  async function encerrarBarreiraNarrativa(barreiraId: number) {
    setErro(null);
    setPendente(-barreiraId - 10_000);
    try {
      onAtualizar(
        await apiEncerrarBarreiraNarrativaSessaoCampanha(
          campanhaId,
          sessaoId,
          barreiraId,
          { clientRequestId: crypto.randomUUID() },
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível encerrar a barreira narrativa.",
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
      {feedbackDominio ? (
        <div
          className={`mb-3 rounded-xl border p-3 text-sm ${
            feedbackDominio.severidade === "WARNING"
              ? "border-app-warning/40 bg-app-warning/10 text-app-fg"
              : feedbackDominio.severidade === "INFO"
                ? "border-app-info/40 bg-app-info/10 text-app-fg"
                : "border-app-success/40 bg-app-success/10 text-app-fg"
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="font-semibold">
            {feedbackDominio.titulo}: {feedbackDominio.dominioNome}
          </p>
          <p className="mt-1 text-xs text-app-muted">
            {feedbackDominio.mensagem}
          </p>
        </div>
      ) : null}
      {ehMestre ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-secondary/30 bg-app-secondary/10 p-3">
          <div>
            <p className="text-sm font-semibold text-app-fg">
              Disputa de Domínios
            </p>
            <p className="text-xs text-app-muted">
              Selecione Domínios e os alvos na região de colisão sem precisar
              informar IDs.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setDisputaInstancia((atual) => atual + 1);
              setDisputaAberta(true);
            }}
            disabled={
              sessaoEncerrada || dominiosDisponiveisParaDisputa.length < 2
            }
          >
            Criar disputa
          </Button>
        </div>
      ) : null}
      <div className="mb-3 rounded-xl border border-app-border bg-app-base/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-app-fg">
              Barreiras narrativas
            </p>
            <p className="text-xs text-app-muted">
              Cortinas e barreiras permanentes da cena, sem mapa tático ou
              efeitos inventados pelo sistema.
            </p>
          </div>
          {ehMestre ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setBarreiraAberta(true)}
              disabled={sessaoEncerrada}
            >
              Nova barreira
            </Button>
          ) : null}
        </div>
        {barreirasNarrativas.length ? (
          <div className="mt-3 space-y-2">
            {barreirasNarrativas.map((barreira) => (
              <article
                key={barreira.id}
                className="rounded-lg border border-app-border bg-app-surface/50 p-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-app-fg">
                      {barreira.nome}
                    </p>
                    <p className="text-xs text-app-muted">
                      {barreira.escala.toLowerCase()} · Complexidade{" "}
                      {barreira.pontosComplexidade}
                      {barreira.ancorada ? " · ancorada" : ""}
                      {barreira.requerConcentracao
                        ? " · requer Concentração"
                        : ""}
                    </p>
                  </div>
                  {ehMestre ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        void encerrarBarreiraNarrativa(barreira.id)
                      }
                      disabled={sessaoEncerrada || pendente !== null}
                    >
                      Encerrar
                    </Button>
                  ) : null}
                </div>
                {barreira.descricao ? (
                  <p className="mt-2 text-xs text-app-muted">
                    {barreira.descricao}
                  </p>
                ) : null}
                {barreira.regras.length ? (
                  <ul className="mt-2 list-inside list-disc text-xs text-app-muted">
                    {barreira.regras.map((regra, index) => (
                      <li key={`${barreira.id}-${index}`}>{String(regra)}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-app-muted">
            Nenhuma barreira narrativa está ativa nesta cena.
          </p>
        )}
      </div>
      {ehMestre && disputasAtivas.length ? (
        <div className="mb-3 space-y-2 rounded-xl border border-app-secondary/30 bg-app-secondary/10 p-3">
          <p className="text-sm font-semibold text-app-fg">Disputas ativas</p>
          {disputasAtivas.map((disputa) => (
            <div
              key={disputa.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-app-border bg-app-base/40 p-2"
            >
              <p className="text-xs text-app-muted">
                {disputa.dominios.join(" × ")} · resolução{" "}
                {disputa.resolucoesConcluidas + 1} · próxima na rodada{" "}
                {disputa.rodadaProximaResolucao}
              </p>
              <Button
                type="button"
                size="xs"
                onClick={() => void resolverDisputa(disputa.id)}
                disabled={sessaoEncerrada || pendente !== null}
              >
                {pendente === -disputa.id
                  ? "Resolvendo..."
                  : "Resolver Refinamento"}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
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
              onClick={() => {
                setEpifaniaAberta((aberta) => !aberta);
                setResultadoEpifania(null);
              }}
            >
              {epifaniaAberta ? "Cancelar" : "Resolver Epifania"}
            </Button>
          </div>
          {resultadoEpifania ? (
            <div
              className={`mt-3 rounded-lg border p-3 text-xs ${
                resultadoEpifania.sucesso
                  ? "border-app-success/50 bg-app-success/10 text-app-fg"
                  : "border-app-warning/50 bg-app-warning/10 text-app-fg"
              }`}
              role="status"
              aria-live="polite"
            >
              {resultadoEpifania.sucesso ? (
                <>
                  <p className="font-semibold">
                    Epifania bem-sucedida: {resultadoEpifania.resultado} / DT{" "}
                    {resultadoEpifania.dt}.
                  </p>
                  <p className="mt-1 text-app-muted">
                    O Domínio Incompleto está abrindo. Use{" "}
                    <strong>Formar</strong> no cartão do Domínio para ativar
                    seus bônus; <strong>Interromper</strong> encerra a abertura
                    com o esgotamento antecipado previsto.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">
                    A Epifania falhou: {resultadoEpifania.resultado} / DT{" "}
                    {resultadoEpifania.dt}.
                  </p>
                  <p className="mt-1 text-app-muted">
                    Nenhum recurso foi gasto. Uma nova tentativa nesta cena terá
                    DT {resultadoEpifania.proximaDt}.
                  </p>
                </>
              )}
            </div>
          ) : null}
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
                Grau de barreira (1 a 5)
                <input
                  className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                  type="number"
                  min="1"
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
                A Epifania não possui Acerto Garantido. Com grau 1, um Domínio
                fechado tem Integridade 3 e DT estrutural 18; nos graus maiores,
                a Integridade sobe normalmente. Ela também sofre as limitações
                próprias de Domínio Incompleto, inclusive -2d20 no Refinamento.
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
                <div className="flex flex-wrap justify-end gap-1">
                  <Badge color="purple" size="sm">
                    {estadoBarreiraLabel[dominio.estadoBarreira] ??
                      dominio.estadoBarreira}
                  </Badge>
                  {dominio.estado === "ABRINDO" ? (
                    <Badge
                      color="yellow"
                      size="sm"
                      title="O mestre pode formar ou interromper a abertura."
                    >
                      Abrindo · interrompível
                    </Badge>
                  ) : null}
                  {dominio.instavel ? (
                    <Badge color="red" size="sm">
                      Instável
                    </Badge>
                  ) : null}
                  {dominio.acertoGarantidoNeutralizado ? (
                    <Badge color="cyan" size="sm">
                      Acerto Garantido neutralizado
                    </Badge>
                  ) : null}
                </div>
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
              {dominio.acertoGarantidoNeutralizado ? (
                <p className="mt-2 text-xs text-app-info">
                  Acerto Garantido neutralizado:{" "}
                  {(dominio.motivosNeutralizacaoAcertoGarantido ?? []).join(
                    " · ",
                  ) || "há uma proteção ou disputa ativa para o alvo."}
                </p>
              ) : null}
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
                      {dominio.disputas.some(
                        (disputa) => disputa.estado === "ATIVA",
                      ) ? (
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
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setDominioPressaoId(dominio.id)}
                            disabled={pendente === dominio.id}
                          >
                            Pressionar
                          </Button>
                        </>
                      ) : null}
                      {dominio.instavel ? (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() =>
                            void executar(dominio.id, "ESTABILIZAR")
                          }
                          disabled={pendente === dominio.id}
                        >
                          Estabilizar
                        </Button>
                      ) : null}
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
                          {ehMestre ? (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setDominioRupturaId(dominio.id)}
                              disabled={pendente === dominio.id}
                            >
                              Registrar Ruptura
                            </Button>
                          ) : null}
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
      <CriarDisputaDominioModal
        key={disputaInstancia}
        isOpen={disputaAberta}
        dominios={dominiosAtivos}
        alvos={alvos}
        enviando={criandoDisputa}
        erro={erro}
        onClose={() => setDisputaAberta(false)}
        onConfirmar={(dados) => void criarDisputa(dados)}
      />
      <Modal
        isOpen={dominioRupturaId !== null}
        onClose={() => setDominioRupturaId(null)}
        title="Registrar Ruptura na barreira"
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDominioRupturaId(null)}
              disabled={pendente !== null}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void registrarRuptura()}
              disabled={pendente !== null}
            >
              Registrar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-app-muted">
            Informe apenas um ataque já resolvido que superou a DT estrutural
            exibida no cartão. O servidor confirma a DT e calcula as Rupturas.
          </p>
          <Input
            label="Resultado do ataque"
            type="number"
            min="1"
            step="1"
            value={resultadoRuptura}
            onChange={(event) => setResultadoRuptura(event.target.value)}
          />
          <label className="block text-sm text-app-fg">
            Potência do ataque
            <select
              className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
              value={potenciaRuptura}
              onChange={(event) =>
                setPotenciaRuptura(event.target.value as typeof potenciaRuptura)
              }
            >
              <option value="NORMAL">Normal (1 Ruptura)</option>
              <option value="POTENCIALIZADO">
                Potencializado (2 Rupturas)
              </option>
              <option value="EXCEPCIONAL">Excepcional (3 Rupturas)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-app-fg">
            <input
              type="checkbox"
              checked={golpeConcentrado}
              onChange={(event) => setGolpeConcentrado(event.target.checked)}
            />
            Golpe Concentrado (+1 Ruptura, máximo 3)
          </label>
        </div>
      </Modal>
      <Modal
        isOpen={dominioPressaoId !== null}
        onClose={() => setDominioPressaoId(null)}
        title="Pressionar Domínio"
        size="md"
        footer={
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDominioPressaoId(null)}
          >
            Cancelar
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-app-muted">
            Escolha o Domínio adversário. A pressão só reduz a Dominância se seu
            Refinamento superar o alvo na próxima resolução.
          </p>
          <div className="grid gap-2">
            {dominiosAtivos
              .filter((dominio) => dominio.id !== dominioPressaoId)
              .map((dominio) => (
                <Button
                  key={dominio.id}
                  type="button"
                  variant="secondary"
                  className="justify-start"
                  disabled={pendente !== null}
                  onClick={() => {
                    if (dominioPressaoId !== null) {
                      void executar(dominioPressaoId, "PRESSIONAR", {
                        dominioAlvoId: dominio.id,
                      });
                    }
                    setDominioPressaoId(null);
                  }}
                >
                  {dominio.nome} · {dominio.participante.nome}
                </Button>
              ))}
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={barreiraAberta}
        onClose={() => setBarreiraAberta(false)}
        title="Nova barreira narrativa"
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setBarreiraAberta(false)}
              disabled={pendente !== null}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void criarBarreiraNarrativa()}
              disabled={pendente !== null}
            >
              {pendente === -2 ? "Criando..." : "Criar barreira"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-app-muted">
            Registre Cortinas e Barreiras Simples permanentes como contexto da
            cena. Sem mapa, as regras continuam narrativas e não aplicam dano,
            posição ou bloqueios automaticamente.
          </p>
          <Input
            label="Nome"
            value={nomeBarreira}
            onChange={(event) => setNomeBarreira(event.target.value)}
            placeholder="Ex.: Cortina da escola"
          />
          <label className="block text-sm text-app-fg">
            Descrição
            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
              value={descricaoBarreira}
              onChange={(event) => setDescricaoBarreira(event.target.value)}
              placeholder="Escopo e condição narrativa da barreira."
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-app-fg">
              Escala
              <select
                className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
                value={escalaBarreira}
                onChange={(event) =>
                  setEscalaBarreira(event.target.value as typeof escalaBarreira)
                }
              >
                <option value="PEQUENA">Pequena</option>
                <option value="MEDIA">Média</option>
                <option value="GRANDE">Grande</option>
                <option value="MASSIVA">Massiva</option>
              </select>
            </label>
            <Input
              label="Pontos de Complexidade"
              type="number"
              min="1"
              max="20"
              step="1"
              value={complexidadeBarreira}
              onChange={(event) => setComplexidadeBarreira(event.target.value)}
              helperText="Compare com o grau de Técnicas de Barreira do responsável."
            />
          </div>
          <label className="block text-sm text-app-fg">
            Responsável (opcional)
            <select
              className="mt-1 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
              value={responsavelBarreira}
              onChange={(event) => setResponsavelBarreira(event.target.value)}
            >
              <option value="">Barreira ambiental ou sem responsável</option>
              {alvos.map((alvo) => (
                <option
                  key={`${alvo.tipo}-${alvo.id}`}
                  value={`${alvo.tipo}:${alvo.id}`}
                >
                  {alvo.tipo === "NPC" ? "NPC" : "Personagem"}: {alvo.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-app-fg">
            Regras da barreira
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm text-app-fg"
              value={regrasBarreira}
              onChange={(event) => setRegrasBarreira(event.target.value)}
              placeholder="Uma regra por linha. Ex.: Impede a entrada de não-feiticeiros."
            />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-app-fg">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ancoradaBarreira}
                onChange={(event) => setAncoradaBarreira(event.target.checked)}
              />{" "}
              Possui âncora ou preparação
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={concentracaoBarreira}
                onChange={(event) =>
                  setConcentracaoBarreira(event.target.checked)
                }
              />{" "}
              Requer Concentração
            </label>
          </div>
        </div>
      </Modal>
    </SessionPanel>
  );
}
