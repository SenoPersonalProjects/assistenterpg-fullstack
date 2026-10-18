"use client";
import { useEffect, useState } from "react";
import { SessionPanel } from "./SessionPanel";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  obterDezSombras,
  executarDezSombras,
  type PainelDezSombras,
  type ComandoSombra,
} from "@/lib/api/dez-sombras";

type Alvo = { tipo: "PERSONAGEM" | "NPC"; id: number; nome: string };
type Props = {
  campanhaId: number;
  sessaoId: number;
  personagemSessaoId: number;
  revisao: unknown;
  alvos: Alvo[];
  onAtualizar: () => Promise<void>;
};
const LABEL_ACAO: Record<string, string> = {
  PADRAO: "Padrão",
  MOVIMENTO: "Movimento",
  COMPLETA: "Completa",
  REACAO: "Reação das Sombras",
  LIVRE: "Livre",
  PASSIVA: "Passiva",
};
const ATRIBUTOS_SOMBRA = ["AGI", "FOR", "INT", "PRE", "VIG"];
const DANOS_SOMBRA: Record<string, string> = {
  TODOS: "Dano",
  CORTANTE: "Corte",
  IMPACTO: "Impacto",
  PERFURANTE: "Perfuração",
  ELETRICIDADE: "Eletricidade",
  ENERGIA_AMALDICOADA: "Energia Amaldiçoada",
};
function mensagemErro(error: unknown): string {
  const response = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return Array.isArray(response)
    ? response.join(" ")
    : (response ??
        "Não foi possível executar a ação. Atualize a sessão e tente novamente.");
}
export function SessionTenShadowsPanel({
  campanhaId,
  sessaoId,
  personagemSessaoId,
  revisao,
  alvos,
  onAtualizar,
}: Props) {
  const [painel, setPainel] = useState<PainelDezSombras | null>(null);
  const [erro, setErro] = useState("");
  const [pendente, setPendente] = useState(false);
  const [selecionada, setSelecionada] = useState("");
  const [habilidade, setHabilidade] = useState("");
  const [alvo, setAlvo] = useState("");
  const [destino, setDestino] = useState("");
  const [observacao, setObservacao] = useState("");
  const [complexidade, setComplexidade] = useState("1");
  const [sustentado, setSustentado] = useState(false);
  const [gastoFlor, setGastoFlor] = useState("1");
  const [aspectosPreparados, setAspectosPreparados] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    obterDezSombras(campanhaId, sessaoId, personagemSessaoId, controller.signal)
      .then(setPainel)
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setErro(mensagemErro(e));
      });
    return () => controller.abort();
  }, [campanhaId, sessaoId, personagemSessaoId, revisao]);
  const codigoSelecionado = selecionada.startsWith("COELHO_")
    ? (painel?.catalogo.find(
        (s) =>
          s.familia === "COELHO" &&
          painel.estado.sombras[s.codigo]?.npcSessaoId,
      )?.codigo ?? selecionada)
    : selecionada;
  const sombra = painel?.catalogo.find((s) => s.codigo === codigoSelecionado);
  const registro = painel?.estado.sombras[codigoSelecionado];
  const acao = sombra?.acoes.find((a) => a.codigo === habilidade);
  const indisponivel = pendente || painel?.encerrada;
  async function executar(tipo: string) {
    if (
      (!sombra &&
        !["FLOR_DEFESA", "MOVIMENTO_USUARIO", "PREPARAR_ASPECTOS"].includes(
          tipo,
        )) ||
      !painel ||
      pendente
    )
      return;
    setPendente(true);
    setErro("");
    const [tipoAlvo, id] = alvo.split(":");
    const comando: ComandoSombra = {
      acao: tipo,
      sombra: sombra?.codigo ?? painel.catalogo[0].codigo,
      ...(tipo === "FLOR_DEFESA" ? { gastoEA: Number(gastoFlor) } : {}),
      ...(tipo === "PREPARAR_ASPECTOS" ? { aspectos: aspectosPreparados } : {}),
      habilidade: acao?.codigo,
      ...(destino ? { destino } : {}),
      ...(alvo
        ? tipoAlvo === "NPC"
          ? { alvoNpcSessaoId: Number(id) }
          : { alvoPersonagemSessaoId: Number(id) }
        : {}),
      ...(sustentado ? { sustentado: true } : {}),
      ...(tipo === "CONCLUIR_RITUAL" ? { ritualSemAjuda: true } : {}),
      ...(observacao ? { observacao } : {}),
      ...(tipo === "ADAPTACAO" ? { complexidade: Number(complexidade) } : {}),
    };
    try {
      setPainel(
        await executarDezSombras(
          campanhaId,
          sessaoId,
          personagemSessaoId,
          comando,
          crypto.randomUUID(),
        ),
      );
      await onAtualizar();
    } catch (e: unknown) {
      setErro(mensagemErro(e));
    } finally {
      setPendente(false);
    }
  }
  return (
    <SessionPanel
      title="Dez Sombras"
      subtitle={
        painel
          ? `${painel.nome} · Grau ${painel.config.grauEfetivo}`
          : "Carregando manifestações…"
      }
      tone="control"
      collapsible
    >
      <div className="space-y-3">
        {erro ? (
          <p role="alert" className="text-sm text-red-400">
            {erro}
          </p>
        ) : null}
        {painel ? (
          <>
            <div className="flex flex-wrap gap-3 text-sm" aria-live="polite">
              <span>
                Carga {painel.recursos.carga}/{painel.recursos.limite}
              </span>
              <span>EA {painel.recursos.ea}</span>
              <span>PE {painel.recursos.pe}</span>
              <span>
                Comando: {painel.estado.comandoUsado ? "usado" : "disponível"}
              </span>
              <span>
                Reação das Sombras:{" "}
                {painel.estado.reacaoSombrasUsada ? "usada" : "disponível"}
              </span>
            </div>
            {painel.dominioAtivo ? (
              <p className="text-sm">
                Potencial 120%: +1d20 nos ataques dos shikigamis e Jujutsu da
                técnica; DTs exibidas com +2.
              </p>
            ) : null}
            {painel.config.melhorAmigo ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={painel.estado.melhorAmigoEmCurto ?? false}
                  disabled={indisponivel}
                  onChange={async (e) => {
                    setPendente(true);
                    setErro("");
                    try {
                      setPainel(
                        await executarDezSombras(
                          campanhaId,
                          sessaoId,
                          personagemSessaoId,
                          {
                            acao: "VINCULO_OROCHI",
                            sombra: "SERPENTE_OROCHI",
                            sustentado: e.target.checked,
                          },
                          crypto.randomUUID(),
                        ),
                      );
                      await onAtualizar();
                    } catch (error: unknown) {
                      setErro(mensagemErro(error));
                    } finally {
                      setPendente(false);
                    }
                  }}
                />
                Orochi ou sua quimera está em alcance curto (confirmar posição)
              </label>
            ) : null}
            <div className="flex flex-wrap items-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={indisponivel}
                onClick={() => void executar("MOVIMENTO_USUARIO")}
              >
                Registrar deslocamento voluntário
              </Button>
              {painel.flor.ativa ? (
                <>
                  <Select
                    label="EA para esta defesa da Flor Caída"
                    value={gastoFlor}
                    onChange={(e) => setGastoFlor(e.target.value)}
                  >
                    {Array.from(
                      { length: painel.flor.gastoMaximoEA },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} EA · RD {(i + 1) * painel.flor.rdPorEA}
                        </option>
                      ),
                    )}
                  </Select>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel}
                    onClick={() => void executar("FLOR_DEFESA")}
                  >
                    Defender ocorrência de Acerto Garantido
                  </Button>
                </>
              ) : null}
            </div>
            {painel.estado.podePrepararAspectos &&
            painel.config.grauEfetivo >= 4 ? (
              <details className="rounded border border-app-border p-3">
                <summary className="cursor-pointer text-sm">
                  Preparar Aspectos do dia · até {painel.config.grauEfetivo}
                </summary>
                <div className="mt-2 space-y-1">
                  {painel.catalogo
                    .filter(
                      (s) =>
                        !s.componentes &&
                        !(
                          s.familia === "CAES_DIVINOS" &&
                          s.codigo !== "CAO_TOTALIDADE" &&
                          painel.config.dominadas.includes("CAO_TOTALIDADE")
                        ) &&
                        painel.config.dominadas.includes(s.familia) &&
                        !painel.estado.sombras[s.codigo]?.destruido,
                    )
                    .flatMap((s) =>
                      s.acoes
                        .filter((a) => a.extraivel && a.execucao !== "PASSIVA")
                        .map((a) => {
                          const key = `${s.codigo}:${a.codigo}`;
                          return (
                            <label
                              key={key}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={aspectosPreparados.includes(key)}
                                disabled={indisponivel}
                                onChange={(e) =>
                                  setAspectosPreparados((prev) =>
                                    e.target.checked
                                      ? [...prev, key]
                                      : prev.filter((v) => v !== key),
                                  )
                                }
                              />
                              {s.nome} · {a.nome}
                            </label>
                          );
                        }),
                    )}
                  <Button
                    size="sm"
                    disabled={
                      indisponivel ||
                      aspectosPreparados.length > painel.config.grauEfetivo
                    }
                    onClick={() => void executar("PREPARAR_ASPECTOS")}
                  >
                    Confirmar Aspectos do dia ({aspectosPreparados.length})
                  </Button>
                </div>
              </details>
            ) : null}
            <Select
              label="Shikigami ou fusão"
              value={codigoSelecionado}
              onChange={(e) => {
                setSelecionada(e.target.value);
                setHabilidade("");
                setDestino("");
              }}
            >
              <option value="">Selecione uma sombra</option>
              {painel.catalogo.map((s) => (
                <option key={s.codigo} value={s.codigo}>
                  {s.nome}
                  {painel.estado.sombras[s.codigo]?.npcSessaoId
                    ? " · manifestado"
                    : ""}
                </option>
              ))}
            </Select>
            {sombra ? (
              <>
                <p className="text-sm text-app-muted">
                  {sombra.atributos
                    .map((valor, i) => `${ATRIBUTOS_SOMBRA[i]} ${valor}`)
                    .join(" · ")}
                  <br />
                  RD{" "}
                  {Object.entries(sombra.rd)
                    .map(
                      ([tipo, valor]) =>
                        `${valor} ${DANOS_SOMBRA[tipo] ?? tipo}`,
                    )
                    .join(", ") || "0"}{" "}
                  · Movimento {sombra.movimento}m
                  {sombra.voo ? ` · Voo ${sombra.voo}m` : ""} · {sombra.tamanho}
                  {sombra.enxame
                    ? " — Enxame: ocupa outros espaços; imune a manobras e efeitos sem dano contra uma criatura; metade do dano de armas e +50% em área."
                    : ""}
                </p>
                <p className="text-sm text-app-muted">
                  Invocar: {sombra.invocacao.ea} EA + {sombra.invocacao.pe} PE ·{" "}
                  {LABEL_ACAO[sombra.invocacao.execucao]} · Carga {sombra.carga}{" "}
                  · Sustentação {sombra.sustentacao} EA · PV{" "}
                  {registro?.pv ?? sombra.pv}/{sombra.pv} · Defesa{" "}
                  {sombra.defesa}
                </p>
                {registro?.destruido ? (
                  <p className="text-sm">
                    Destruído permanentemente. Herança exige compatibilidade
                    cadastrada e confirmação do mestre.
                  </p>
                ) : registro?.indisponivelAteDormir ? (
                  <p className="text-sm">
                    Indisponível até Dormir em Interlúdio.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={
                      indisponivel ||
                      !!registro?.npcSessaoId ||
                      registro?.destruido ||
                      registro?.indisponivelAteDormir
                    }
                    onClick={() => void executar("INVOCAR")}
                  >
                    Invocar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel || !registro?.npcSessaoId}
                    onClick={() => void executar("LIBERAR")}
                  >
                    Liberar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={
                      indisponivel ||
                      !registro?.npcSessaoId ||
                      painel.estado.comandoUsado
                    }
                    onClick={() => void executar("COMANDAR")}
                  >
                    Comandar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel || !registro?.npcSessaoId}
                    onClick={() => void executar("MOVER")}
                  >
                    Usar Movimento
                  </Button>
                </div>
                <Select
                  label="Habilidade"
                  value={habilidade}
                  onChange={(e) => setHabilidade(e.target.value)}
                >
                  <option value="">Selecione uma habilidade</option>
                  {sombra.acoes.map((a) => (
                    <option key={a.codigo} value={a.codigo}>
                      {a.nome} · {LABEL_ACAO[a.execucao]}
                    </option>
                  ))}
                </Select>
                {acao ? (
                  <div className="space-y-2 rounded border border-app-border p-3">
                    <p className="text-sm">
                      {acao.teste ? `Teste ${acao.teste}. ` : ""}
                      {acao.dano ? `Dano ${acao.dano}. ` : ""}
                      {acao.efeito}
                    </p>
                    <p className="text-xs text-app-muted">
                      Custos próprios: {acao.custoEA ?? 0} EA +{" "}
                      {acao.custoPE ?? 0} PE. Rolagens e decisões de alcance
                      permanecem nos controles da ficha e com o mestre.
                    </p>
                    <Select
                      label="Alvo (cura ou efeito dirigido)"
                      value={alvo}
                      onChange={(e) => setAlvo(e.target.value)}
                    >
                      <option value="">Sem alvo selecionado</option>
                      {alvos.map((a) => (
                        <option
                          key={`${a.tipo}:${a.id}`}
                          value={`${a.tipo}:${a.id}`}
                        >
                          {a.nome}
                        </option>
                      ))}
                    </Select>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={
                          indisponivel ||
                          acao.execucao === "PASSIVA" ||
                          !registro?.npcSessaoId
                        }
                        onClick={() => void executar("USAR")}
                      >
                        Usar habilidade
                      </Button>
                      {painel.config.combo && acao.basica ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={indisponivel}
                          onClick={() => void executar("COMBO")}
                        >
                          Combo · 2 PE
                        </Button>
                      ) : null}
                      {painel.config.aspectos.includes(
                        `${sombra.codigo}:${acao.codigo}`,
                      ) ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={indisponivel}
                          onClick={() => void executar("ASPECTO")}
                        >
                          Extrair Aspecto
                        </Button>
                      ) : null}
                      {acao.ofensiva ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={indisponivel || painel.dominioAtivo}
                            onClick={() => void executar("DEFINIR_ASPECTO")}
                          >
                            Definir Aspecto antes de abrir o Domínio
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={indisponivel || !painel.dominioAtivo}
                            onClick={() => void executar("ACERTO")}
                          >
                            Ativar Acerto Garantido
                          </Button>
                        </>
                      ) : null}
                      {sombra.carga <= 5 && acao.execucao === "PADRAO" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={indisponivel}
                          onClick={() => void executar("ECO")}
                        >
                          Eco · 1 EA
                        </Button>
                      ) : null}
                      {acao.condicao || acao.codigo === "VENENO" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={indisponivel || !alvo}
                          onClick={() => void executar("APLICAR_CONDICAO")}
                        >
                          Confirmar falha na resistência e aplicar condição
                        </Button>
                      ) : null}
                      {acao.codigo === "VENENO" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={indisponivel || !alvo}
                          onClick={() => void executar("ENCERRAR_VENENO")}
                        >
                          Fortitude DT30 no fim do turno: sucesso, encerrar
                          veneno
                        </Button>
                      ) : null}
                    </div>
                    {acao.extraivel ? (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={sustentado}
                          onChange={(e) => setSustentado(e.target.checked)}
                        />
                        Manter Aspecto por mais de uma rodada
                      </label>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {painel.config.sinergia ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={indisponivel}
                      onClick={() => void executar("SINERGIA")}
                    >
                      Confirmar acerto e usar Sinergia
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel}
                    onClick={() => void executar("CLONE")}
                  >
                    Clone no Domínio · 2 EA
                  </Button>
                </div>
                {sombra.familia === "COELHO" ||
                (painel.mestre && registro?.herancaPendente) ? (
                  <>
                    <Select
                      label="Nova forma"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                    >
                      <option value="">Selecione a forma</option>
                      {painel.catalogo
                        .filter((s) =>
                          sombra.familia === "COELHO"
                            ? s.familia === "COELHO" && s.pv > sombra.pv
                            : painel.herancas.some(
                                (h) =>
                                  h.origem === sombra.familia &&
                                  h.destino === s.codigo,
                              ),
                        )
                        .map((s) => (
                          <option key={s.codigo} value={s.codigo}>
                            {s.nome}
                          </option>
                        ))}
                    </Select>
                    <Button
                      size="sm"
                      disabled={indisponivel || !destino}
                      onClick={() =>
                        void executar(
                          sombra.familia === "COELHO" ? "AMPLIAR" : "HERANCA",
                        )
                      }
                    >
                      {sombra.familia === "COELHO"
                        ? "Ampliar enxame"
                        : "Confirmar herança"}
                    </Button>
                  </>
                ) : null}
                {!painel.config.dominadas.includes(sombra.familia) &&
                !sombra.componentes ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel}
                    onClick={() => void executar("RITUAL")}
                  >
                    Iniciar Ritual de Exorcismo · criatura hostil
                  </Button>
                ) : null}
                {painel.mestre &&
                !painel.config.dominadas.includes(sombra.familia) &&
                !sombra.componentes ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={indisponivel}
                    onClick={() => void executar("CONCLUIR_RITUAL")}
                  >
                    Confirmar vitória sem ajuda externa
                  </Button>
                ) : null}
                {painel.mestre && sombra.codigo === "MAHORAGA" ? (
                  <>
                    <Input
                      label="Fenômeno e consequência definidos pelo mestre"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                    />
                    <Select
                      label="Complexidade em giros"
                      value={complexidade}
                      onChange={(e) => setComplexidade(e.target.value)}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      disabled={indisponivel || !observacao}
                      onClick={() => void executar("ADAPTACAO")}
                    >
                      Registrar adaptação
                    </Button>
                  </>
                ) : null}
              </>
            ) : null}
            {painel.estado.aspectosSustentados.map((a) => {
              const [codigo, habilidadeCodigo] = a.split(":");
              return (
                <Button
                  key={a}
                  size="sm"
                  variant="secondary"
                  disabled={indisponivel}
                  onClick={async () => {
                    setPendente(true);
                    setErro("");
                    try {
                      setPainel(
                        await executarDezSombras(
                          campanhaId,
                          sessaoId,
                          personagemSessaoId,
                          {
                            acao: "ENCERRAR_ASPECTO",
                            sombra: codigo,
                            habilidade: habilidadeCodigo,
                          },
                          crypto.randomUUID(),
                        ),
                      );
                      await onAtualizar();
                    } catch (e: unknown) {
                      setErro(mensagemErro(e));
                    } finally {
                      setPendente(false);
                    }
                  }}
                >
                  Encerrar Aspecto: {a}
                </Button>
              );
            })}
          </>
        ) : null}
      </div>
    </SessionPanel>
  );
}
