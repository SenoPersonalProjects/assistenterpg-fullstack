"use client";
import { useEffect, useState } from "react";
import { SessionLinkedEntitiesControl } from "./SessionLinkedEntitiesControl";
import { useSessaoAcaoVinculado } from "@/hooks/useSessaoAcaoVinculado";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { criarErroUsuario } from "@/lib/api/error-handler";
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
const mensagemErro = criarErroUsuario;
export function SessionTenShadowsExtension({
  campanhaId,
  sessaoId,
  personagemSessaoId,
  revisao,
  alvos,
  onAtualizar,
}: Props) {
  const [painel, setPainel] = useState<PainelDezSombras | null>(null);
  const { erro, setErro, pendente, executarAcao } = useSessaoAcaoVinculado();
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
      .then((atualizado) => {
        if (!controller.signal.aborted) {
          setPainel(atualizado);
          setErro(null);
        }
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setErro(mensagemErro(e));
      });
    return () => controller.abort();
  }, [campanhaId, sessaoId, personagemSessaoId, revisao, setErro]);
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
    await executarAcao(async () => {
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
    });
  }
  return (
    <div className="space-y-3">
      {erro ? <ErrorAlert error={erro} /> : null}
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
            <Checkbox
              label="Orochi ou sua quimera está em alcance curto (confirmar posição)"
              checked={painel.estado.melhorAmigoEmCurto ?? false}
              disabled={indisponivel}
              onChange={async (e) => {
                await executarAcao(async () => {
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
                });
              }}
            />
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
                  {Array.from({ length: painel.flor.gastoMaximoEA }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} EA · RD {(i + 1) * painel.flor.rdPorEA}
                    </option>
                  ))}
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
                          <Checkbox
                            key={key}
                            label={`${s.nome} · ${a.nome}`}
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
          <SessionLinkedEntitiesControl
            entidades={painel.catalogo.map((item) => {
              const estado = painel.estado.sombras[item.codigo];
              return {
                id: item.codigo,
                nome: item.nome,
                tipo: "Shikigami",
                estado: estado?.destruido
                  ? "Destruído"
                  : estado?.indisponivelAteDormir
                    ? "Indisponível até Dormir"
                    : estado?.npcSessaoId
                      ? "ATIVO"
                      : "DISPONIVEL",
                ativa: !!estado?.npcSessaoId,
                podeInvocar:
                  !estado?.npcSessaoId &&
                  !estado?.destruido &&
                  !estado?.indisponivelAteDormir,
                pvAtual: estado?.pv ?? item.pv,
                pvMax: item.pv,
                defesa: item.defesa,
                movimento: item.movimento,
                custo: `Invocar: ${item.invocacao.ea} EA + ${item.invocacao.pe} PE · ${LABEL_ACAO[item.invocacao.execucao]} · Carga ${item.carga} · Sustentação ${item.sustentacao} EA/rodada`,
              };
            })}
            selecionada={codigoSelecionado}
            onSelecionar={(codigo) => {
              setSelecionada(codigo);
              setHabilidade("");
              setDestino("");
            }}
            indisponivel={!!indisponivel}
            podeControlar
            onInvocar={() => void executar("INVOCAR")}
            onLiberar={() => void executar("LIBERAR")}
          >
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
                      <Checkbox
                        label="Manter Aspecto por mais de uma rodada"
                        checked={sustentado}
                        onChange={(e) => setSustentado(e.target.checked)}
                      />
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
          </SessionLinkedEntitiesControl>
          {painel.estado.aspectosSustentados.map((a) => {
            const [codigo, habilidadeCodigo] = a.split(":");
            return (
              <Button
                key={a}
                size="sm"
                variant="secondary"
                disabled={indisponivel}
                onClick={async () => {
                  await executarAcao(async () => {
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
                  });
                }}
              >
                Encerrar Aspecto: {a}
              </Button>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
