import { apiClient } from "./axios-client";
export type AcaoSombra = {
  codigo: string;
  nome: string;
  execucao: string;
  custoEA?: number;
  custoPE?: number;
  teste?: string;
  dano?: string;
  efeito?: string;
  basica?: boolean;
  extraivel?: boolean;
  ofensiva?: boolean;
  condicao?: { codigo: string; duracao: string };
};
export type Sombra = {
  atributos: number[];
  rd: Record<string, number>;
  movimento: number;
  voo?: number;
  tamanho: string;
  enxame?: boolean;
  codigo: string;
  nome: string;
  familia: string;
  pv: number;
  defesa: number;
  carga: number;
  sustentacao: number;
  componentes?: string[];
  acoes: AcaoSombra[];
  invocacao: { ea: number; pe: number; execucao: string };
};
export type EstadoSombra = {
  pv: number;
  destruido?: boolean;
  indisponivelAteDormir?: boolean;
  npcSessaoId?: number;
  movimentoUsado?: boolean;
  padraoDisponivel?: boolean;
  herancaPendente?: boolean;
};
export type PainelDezSombras = {
  flor: { ativa: boolean; gastoMaximoEA: number; rdPorEA: number };
  personagemSessaoId: number;
  nome: string;
  mestre: boolean;
  encerrada: boolean;
  dominioAtivo: boolean;
  config: {
    dominadas: string[];
    aspectos: string[];
    grauEfetivo: number;
    combo?: boolean;
    sinergia?: boolean;
    melhorAmigo?: string;
  };
  recursos: { ea: number; pe: number; limite: number; carga: number };
  estado: {
    podePrepararAspectos?: boolean;
    comandoUsado: boolean;
    reacaoSombrasUsada: boolean;
    comboUsado: boolean;
    melhorAmigoEmCurto?: boolean;
    sombras: Record<string, EstadoSombra>;
    aspectosSustentados: string[];
  };
  catalogo: Sombra[];
  herancas: { origem: string; destino: string }[];
};
export type ComandoSombra = {
  aspectos?: string[];
  gastoEA?: number;
  acao: string;
  sombra: string;
  habilidade?: string;
  destino?: string;
  sustentado?: boolean;
  ritualSemAjuda?: boolean;
  observacao?: string;
  complexidade?: number;
  alvoPersonagemSessaoId?: number;
  alvoNpcSessaoId?: number;
};
const url = (campanha: number, sessao: number, personagem: number) =>
  `/campanhas/${campanha}/sessoes/${sessao}/personagens/${personagem}/dez-sombras`;
export async function obterDezSombras(
  campanha: number,
  sessao: number,
  personagem: number,
  signal?: AbortSignal,
): Promise<PainelDezSombras> {
  return (
    await apiClient.get<PainelDezSombras>(url(campanha, sessao, personagem), {
      signal,
    })
  ).data;
}
export async function executarDezSombras(
  campanha: number,
  sessao: number,
  personagem: number,
  comando: ComandoSombra,
  clientRequestId: string,
): Promise<PainelDezSombras> {
  return (
    await apiClient.post<PainelDezSombras>(url(campanha, sessao, personagem), {
      ...comando,
      clientRequestId,
    })
  ).data;
}
