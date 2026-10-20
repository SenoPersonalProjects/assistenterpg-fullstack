// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionCharacterLinkedEntities } from "./SessionCharacterLinkedEntities";
import type { SessaoCampanhaDetalhe } from "@/lib/types";
import type { PainelDezSombras } from "@/lib/api/dez-sombras";
import { obterDezSombras, executarDezSombras } from "@/lib/api/dez-sombras";
import {
  apiInvocarEntidadeVinculadaSessaoCampanha,
  apiDesinvocarEntidadeVinculadaSessaoCampanha,
} from "@/lib/api/campanhas";

vi.mock("@/lib/api/dez-sombras", () => ({
  obterDezSombras: vi.fn(),
  executarDezSombras: vi.fn(),
}));
vi.mock("@/lib/api/campanhas", () => ({
  apiGetSessaoCampanha: vi.fn().mockResolvedValue({ cards: [], npcs: [] }),
  apiInvocarEntidadeVinculadaSessaoCampanha: vi.fn(),
  apiDesinvocarEntidadeVinculadaSessaoCampanha: vi.fn(),
}));
type Card = SessaoCampanhaDetalhe["cards"][number];
const base = {
  personagemSessaoId: 9,
  podeEditar: true,
  vinculados: [],
  tecnicaInata: null,
} as unknown as Card;
const entidade = {
  id: 4,
  nome: "Shikigami de Sakiko",
  tipo: "SHIKIGAMI",
  estado: "DISPONIVEL",
  pontosVidaAtual: 30,
  pontosVidaMax: 40,
  defesa: 15,
  deslocamentoMetros: 9,
  instanciasAtivas: [],
  descricao: null,
  conceito: null,
  aparencia: null,
  rd: 0,
  vagasOcupadas: 1,
  cargasAtual: null,
  cargasMax: null,
  tipoNpc: 'OUTRO',
  fichaTipo: 'NPC',
  tamanho: 'MEDIO',
  npcAmeacaOrigemId: null,
} as Card["vinculados"][number];
const painel = {
  config: { grauEfetivo: 4, dominadas: ["NUE"], aspectos: [] },
  recursos: { ea: 20, pe: 10, carga: 0, limite: 18 },
  estado: {
    sombras: {},
    aspectosSustentados: [],
    comandoUsado: false,
    reacaoSombrasUsada: false,
  },
  flor: { ativa: false },
  catalogo: [
    {
      codigo: "NUE",
      nome: "Nue",
      familia: "NUE",
      pv: 100,
      defesa: 25,
      movimento: 24,
      tamanho: "MEDIO",
      atributos: [3, 2, 2, 3, 2],
      rd: {},
      carga: 2,
      sustentacao: 1,
      invocacao: { ea: 1, pe: 0, execucao: "LIVRE" },
      acoes: [],
    },
  ],
  herancas: [],
} as unknown as PainelDezSombras;
const props = { campanhaId: 1, sessaoId: 2, sessaoEncerrada: false };
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(obterDezSombras).mockResolvedValue(painel);
  vi.mocked(executarDezSombras).mockResolvedValue(painel);
  vi.mocked(apiInvocarEntidadeVinculadaSessaoCampanha).mockResolvedValue({
    cards: [],
    npcs: [],
  } as unknown as SessaoCampanhaDetalhe);
});

describe("componentes gerais de vinculados com estratégias de técnica", () => {
  it("invoca o shikigami comum pelo seletor e ciclo gerais", async () => {
    const atualizar = vi.fn();
    render(
      <SessionCharacterLinkedEntities
        {...props}
        card={{ ...base, vinculados: [entidade] }}
        onAtualizarSessao={atualizar}
      />,
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Shikigami ou entidade vinculada" }),
      { target: { value: "4" } },
    );
    expect(screen.getByText(/PV 30\/40/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Invocar" }),
    );
    await waitFor(() =>
      expect(apiInvocarEntidadeVinculadaSessaoCampanha).toHaveBeenCalledWith(
        1,
        2,
        4,
      ),
    );
    await waitFor(() => expect(atualizar).toHaveBeenCalled());
    expect(executarDezSombras).not.toHaveBeenCalled();
  });
  it("libera a manifestação comum da mesma ficha e atualiza a sessão", async () => {
    render(
      <SessionCharacterLinkedEntities
        {...props}
        card={{
          ...base,
          vinculados: [
            {
              ...entidade,
              estado: "ATIVO",
              instanciasAtivas: [
                {
                  id: 8,
                  sessaoId: 2,
                  cenaId: 3,
                  pontosVidaAtual: 12,
                  ocultoJogadores: false,
                },
              ],
            },
          ],
        }}
      />,
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Shikigami ou entidade vinculada" }),
      { target: { value: "4" } },
    );
    expect(screen.getByText(/PV 12\/40/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Liberar" }),
    );
    await waitFor(() =>
      expect(apiDesinvocarEntidadeVinculadaSessaoCampanha).toHaveBeenCalledWith(
        1,
        2,
        8,
      ),
    );
  });
  it("usa os mesmos controles para Nue e encaminha custos/regras à extensão", async () => {
    render(
      <SessionCharacterLinkedEntities
        {...props}
        card={{ ...base, possuiDezSombras: true }}
      />,
    );
    const seletor = await screen.findByRole("combobox", {
      name: "Shikigami ou entidade vinculada",
    });
    fireEvent.change(seletor, { target: { value: "NUE" } });
    expect(screen.getByText(/PV 100\/100/)).toBeTruthy();
    expect(screen.getByText(/Invocar: 1 EA/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Invocar" }),
    );
    await waitFor(() =>
      expect(executarDezSombras).toHaveBeenCalledWith(
        1,
        2,
        9,
        expect.objectContaining({ acao: "INVOCAR", sombra: "NUE" }),
        expect.any(String),
      ),
    );
    expect(apiInvocarEntidadeVinculadaSessaoCampanha).not.toHaveBeenCalled();
  });
  it("mantém vinculados comuns junto da especialização sem duplicar sombras", async () => {
    render(
      <SessionCharacterLinkedEntities
        {...props}
        card={{
          ...base,
          possuiDezSombras: true,
          vinculados: [
            entidade,
            {
              ...entidade,
              id: 5,
              nome: "Nue cadastrado",
              regraInvocacao: { tipo: "DEZ_SOMBRAS", codigo: "NUE" },
            },
          ],
        }}
      />,
    );
    await screen.findByRole("option", { name: "Nue" });
    expect(screen.getByRole("option", { name: entidade.nome })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Nue cadastrado" })).toBeNull();
  });
});
