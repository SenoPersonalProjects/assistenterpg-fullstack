// lib/types/campanha.types.ts
import type {
  NpcAmeacaAcao,
  NpcAmeacaPassiva,
  NpcAmeacaPericiaEspecial,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from './npc-ameaca.types';

/**
 * Types relacionados a campanhas e convites
 */

export type CampanhaResumo = {
  id: number;
  nome: string;
  descricao: string | null;
  status: string;
  criadoEm: string;
  dono: { id: number; apelido: string };
  _count: { membros: number; personagens: number; sessoes: number };
};

export type ConviteCampanha = {
  id: number;
  campanhaId: number;
  email: string;
  papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' | string;
  codigo: string;
  status: string;
  criadoEm: string;
  respondidoEm: string | null;
  campanha?: {
    id: number;
    nome: string;
    dono?: { apelido: string };
  };
};

export type CampoModificadorPersonagemCampanha =
  | 'PV_MAX'
  | 'PE_MAX'
  | 'EA_MAX'
  | 'SAN_MAX'
  | 'DEFESA_BASE'
  | 'DEFESA_EQUIPAMENTO'
  | 'DEFESA_OUTROS'
  | 'ESQUIVA'
  | 'BLOQUEIO'
  | 'DESLOCAMENTO'
  | 'LIMITE_PE_EA_POR_TURNO'
  | 'PRESTIGIO_GERAL'
  | 'PRESTIGIO_CLA';

export type NucleoAmaldicoadoCodigo = 'EQUILIBRIO' | 'PODER' | 'IMPULSO';

export type ModificadorPersonagemCampanha = {
  id: number;
  campanhaId: number;
  personagemCampanhaId: number;
  sessaoId: number | null;
  cenaId: number | null;
  campo: CampoModificadorPersonagemCampanha;
  valor: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  criadoPorId: number;
  criadoPor?: { id: number; apelido: string };
  desfeitoEm: string | null;
  desfeitoPorId: number | null;
  desfeitoPor?: { id: number; apelido: string } | null;
  motivoDesfazer: string | null;
};

export type HistoricoPersonagemCampanha = {
  id: number;
  personagemCampanhaId: number;
  campanhaId: number;
  criadoPorId: number | null;
  tipo: string;
  descricao: string | null;
  dados: unknown;
  criadoEm: string;
  criadoPor?: { id: number; apelido: string } | null;
};

export type PersonagemCampanhaResumo = {
  id: number;
  campanhaId: number;
  personagemBaseId: number;
  donoId: number;
  nome: string;
  nivel: number;
  recursos: {
    pvAtual: number;
    pvMax: number;
    pvBarrasTotal?: number;
    pvBarrasRestantes?: number;
    pvBarraMaxAtual?: number;
    nucleoAtivo?: NucleoAmaldicoadoCodigo | null;
    nucleosDisponiveis?: NucleoAmaldicoadoCodigo[];
    peAtual: number;
    peMax: number;
    eaAtual: number;
    eaMax: number;
    sanAtual: number;
    sanMax: number;
  };
  defesa: {
    base: number;
    equipamento: number;
    outros: number;
    total: number;
  };
  atributos: {
    limitePeEaPorTurno: number;
    prestigioGeral: number;
    prestigioCla: number | null;
    deslocamento: number;
    esquiva: number;
    bloqueio: number;
    turnosMorrendo: number;
    turnosEnlouquecendo: number;
  };
  personagemBase: {
    id: number;
    nome: string;
  };
  dono: {
    id: number;
    apelido: string;
  };
  modificadoresAtivos: Array<{
    id: number;
    campo: CampoModificadorPersonagemCampanha;
    valor: number;
    nome: string;
    descricao: string | null;
    criadoEm: string;
    criadoPorId: number;
  }>;
};

export type PersonagemBaseDisponivelCampanha = {
  id: number;
  nome: string;
  nivel: number;
  donoId: number;
  dono: {
    id: number;
    apelido: string;
  };
};

export type TipoCenaSessaoCampanha =
  | 'LIVRE'
  | 'INVESTIGACAO'
  | 'FURTIVIDADE'
  | 'COMBATE'
  | 'PERSEGUICAO'
  | 'BASE'
  | 'OUTRA';

export type AtributosSessaoCampanha = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
};

export type PericiaSessaoCampanha = {
  codigo: string;
  nome: string;
  atributoBase: string;
  bonusTreinamento: number;
  bonusEquipamento: number;
  bonusOutros: number;
  bonusTotal: number;
};

export type NpcPericiaSessaoCampanha = {
  codigo: string;
  nome: string;
  atributoBase?: string;
  dados: number;
  bonus?: number | null;
};

export type NpcSessaoCampanha = {
  npcSessaoId: number;
  npcAmeacaId: number | null;
  nome: string;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  vd: number;
  defesa: number;
  pontosVidaAtual: number;
  pontosVidaMax: number;
  sanAtual: number | null;
  sanMax: number | null;
  eaAtual: number | null;
  eaMax: number | null;
  machucado: number | null;
  deslocamentoMetros: number;
  notasCena: string | null;
  atributos: AtributosSessaoCampanha | null;
  pericias: NpcPericiaSessaoCampanha[];
  periciasEspeciais: NpcAmeacaPericiaEspecial[];
  passivas: NpcAmeacaPassiva[];
  acoes: NpcAmeacaAcao[];
  condicoesAtivas: CondicaoAtivaSessaoCampanha[];
  podeEditar: boolean;
};

export type DuracaoCondicaoSessaoModo =
  | 'ATE_REMOVER'
  | 'RODADAS'
  | 'TURNOS_ALVO';

export type CondicaoAtivaSessaoCampanha = {
  id: number;
  condicaoId: number;
  nome: string;
  descricao: string;
  icone?: string | null;
  automatica: boolean;
  chaveAutomacao: string | null;
  duracaoModo: DuracaoCondicaoSessaoModo | string;
  duracaoValor: number | null;
  restanteDuracao: number | null;
  contadorTurnos: number;
  acumulos: number;
  fonteCodigo: string | null;
  limiteFonte: number | null;
  origemDescricao: string | null;
  observacao: string | null;
  turnoAplicacao: number;
};

export type AdicionarNpcSessaoCampanhaPayload = {
  npcAmeacaId: number;
  nomeExibicao?: string;
  vd?: number;
  iniciativaValor?: number | null;
  defesa?: number;
  pontosVidaMax?: number;
  pontosVidaAtual?: number;
  sanMax?: number | null;
  sanAtual?: number | null;
  eaMax?: number | null;
  eaAtual?: number | null;
  machucado?: number | null;
  deslocamentoMetros?: number;
  notasCena?: string;
};

export type AtualizarNpcSessaoCampanhaPayload = Partial<
  Omit<AdicionarNpcSessaoCampanhaPayload, 'npcAmeacaId'>
>;

export type AplicarCondicaoSessaoCampanhaPayload = {
  condicaoId: number;
  alvoTipo: 'PERSONAGEM' | 'NPC';
  personagemSessaoId?: number;
  npcSessaoId?: number;
  duracaoModo?: DuracaoCondicaoSessaoModo;
  duracaoValor?: number;
  origemDescricao?: string;
  observacao?: string;
  acumulos?: number;
  fonteCodigo?: string;
  limiteFonte?: number;
};

export type SessaoCampanhaResumo = {
  id: number;
  campanhaId: number;
  titulo: string;
  status: string;
  rodadaAtual: number | null;
  indiceTurnoAtual: number | null;
  cenaAtualTipo: TipoCenaSessaoCampanha | string;
  cenaAtualNome: string | null;
  controleTurnosAtivo: boolean;
  iniciadoEm: string;
  encerradoEm: string | null;
  totalPersonagens: number;
  totalEventos: number;
};

export type TipoParticipanteIniciativaSessao = 'PERSONAGEM' | 'NPC';

export type TurnoAtualSessaoCampanha = {
  tipoParticipante: TipoParticipanteIniciativaSessao;
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  personagemCampanhaId: number | null;
  donoId: number | null;
  nomeJogador: string | null;
  nomePersonagem: string;
  valorIniciativa: number | null;
};

export type ParticipanteIniciativaSessaoCampanha = {
  tipoParticipante: TipoParticipanteIniciativaSessao;
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  personagemCampanhaId: number | null;
  donoId: number | null;
  nomeJogador: string | null;
  nomePersonagem: string;
  podeEditar: boolean;
  valorIniciativa: number;
};

export type VariacaoHabilidadeSessaoCampanha = {
  id: number;
  habilidadeTecnicaId: number;
  nome: string;
  descricao: string;
  substituiCustos: boolean;
  custoPE: number | null;
  custoEA: number | null;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  execucao: string | null;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  resistencia: string | null;
  dtResistencia: string | null;
  criticoValor: number | null;
  criticoMultiplicador: number | null;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  dadosDano: unknown;
  efeitoAdicional: string | null;
  escalonaPorGrau: boolean | null;
  grauTipoGrauCodigo: string | null;
  acumulosMaximos: number;
  escalonamentoCustoEA: number | null;
  escalonamentoCustoPE: number | null;
  escalonamentoTipo: string | null;
  escalonamentoEfeito: unknown;
  escalonamentoDano: unknown;
  requisitos: unknown;
  ordem: number;
};

export type HabilidadeTecnicaSessaoCampanha = {
  id: number;
  tecnicaId: number;
  codigo: string;
  nome: string;
  descricao: string;
  requisitos: unknown;
  execucao: string;
  area: string | null;
  alcance: string | null;
  alvo: string | null;
  duracao: string | null;
  testesExigidos: unknown;
  criticoValor: number | null;
  criticoMultiplicador: number | null;
  dadosDano: unknown;
  custoPE: number;
  custoEA: number;
  custoSustentacaoEA: number | null;
  custoSustentacaoPE: number | null;
  escalonaPorGrau: boolean;
  grauTipoGrauCodigo: string | null;
  acumulosMaximos: number;
  escalonamentoCustoEA: number;
  escalonamentoCustoPE: number;
  escalonamentoTipo: string;
  escalonamentoEfeito: unknown;
  escalonamentoDano: unknown;
  danoFlat: number | null;
  danoFlatTipo: string | null;
  efeito: string;
  ordem: number;
  variacoes: VariacaoHabilidadeSessaoCampanha[];
};

export type TecnicaSessaoCampanha = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  habilidades: HabilidadeTecnicaSessaoCampanha[];
};

export type SustentacaoAtivaSessaoCampanha = {
  id: number;
  habilidadeTecnicaId: number;
  variacaoHabilidadeId: number | null;
  nomeHabilidade: string;
  nomeVariacao: string | null;
  custoSustentacaoEA: number;
  custoSustentacaoPE: number;
  acumulos: number;
  permiteAcumulos?: boolean;
  ativadaNaRodada: number;
  ultimaCobrancaRodada: number;
  criadaEm: string;
};

export type SessaoCampanhaDetalhe = {
  id: number;
  campanhaId: number;
  titulo: string;
  status: string;
  rodadaAtual: number | null;
  indiceTurnoAtual: number | null;
  controleTurnosAtivo: boolean;
  cenaAtual: {
    id: number | null;
    tipo: TipoCenaSessaoCampanha | string;
    nome: string | null;
    controleTurnosAtivo: boolean;
    limitesCategoriaAtivo?: boolean;
  };
  turnoAtual: TurnoAtualSessaoCampanha | null;
  iniciativa: {
    indiceAtual: number | null;
    ordem: ParticipanteIniciativaSessaoCampanha[];
  };
  permissoes: {
    ehMestre: boolean;
    podeEditarTodos: boolean;
  };
  participantes: Array<{
    usuarioId: number;
    apelido: string;
    papel: string;
    ehDono: boolean;
  }>;
  cards: Array<{
    personagemSessaoId: number;
    personagemCampanhaId: number;
    personagemBaseId: number;
    donoId: number;
    nomeJogador: string;
    nomePersonagem: string;
    podeEditar: boolean;
    visibilidade: 'completa' | 'resumida';
    turnosMorrendo?: number;
    turnosEnlouquecendo?: number;
    recursos: {
      pvAtual: number;
      pvMax: number;
      pvBarrasTotal?: number;
      pvBarrasRestantes?: number;
      pvBarraMaxAtual?: number;
      nucleoAtivo?: NucleoAmaldicoadoCodigo | null;
      nucleosDisponiveis?: NucleoAmaldicoadoCodigo[];
      peAtual: number;
      peMax: number;
      eaAtual: number;
      eaMax: number;
      sanAtual: number;
      sanMax: number;
    } | null;
    tecnicaInata: TecnicaSessaoCampanha | null;
    tecnicasNaoInatas: TecnicaSessaoCampanha[];
    sustentacoesAtivas: SustentacaoAtivaSessaoCampanha[];
    atributos: AtributosSessaoCampanha | null;
    pericias: PericiaSessaoCampanha[];
    condicoesAtivas: CondicaoAtivaSessaoCampanha[];
  }>;
  npcs: NpcSessaoCampanha[];
  iniciadoEm: string;
  encerradoEm: string | null;
};

export type TipoItemSessao = 'DOCUMENTO' | 'PISTA' | 'GERAL';
export type StatusTransferenciaItemSessao =
  | 'PENDENTE'
  | 'ACEITA'
  | 'RECUSADA'
  | 'CANCELADA';
export type DestinoTransferenciaItemSessao = 'PERSONAGEM' | 'NPC';

export type CategoriaEquipamentoCodigo =
  | 'CATEGORIA_0'
  | 'CATEGORIA_4'
  | 'CATEGORIA_3'
  | 'CATEGORIA_2'
  | 'CATEGORIA_1'
  | 'ESPECIAL';

export type ItemSessaoCampanhaDto = {
  id: number;
  campanhaId: number;
  sessaoId: number | null;
  cenaId: number | null;
  personagemCampanhaId: number | null;
  nome: string;
  descricao: string | null;
  descricaoOculta?: boolean;
  tipo: TipoItemSessao;
  categoria: CategoriaEquipamentoCodigo;
  peso: number;
  descricaoRevelada: boolean;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: { id: number; apelido: string | null };
  transferenciaPendente?: TransferenciaItemSessaoCampanhaDto | null;
  portador: {
    id: number;
    nome: string;
    donoId: number | null;
    ehMeu: boolean;
  } | null;
  permissoes?: {
    podeEditar: boolean;
    podeAtribuir: boolean;
    podeRevelar: boolean;
    podeTransferir?: boolean;
  };
};

export type TransferenciaItemSessaoCampanhaDto = {
  id: number;
  campanhaId: number;
  itemId: number;
  solicitanteId: number;
  portadorAnteriorId: number | null;
  destinoTipo: DestinoTransferenciaItemSessao;
  destinoPersonagemCampanhaId: number | null;
  destinoNpcSessaoId: number | null;
  status: StatusTransferenciaItemSessao;
  criadaEm: string;
  respondidaEm: string | null;
  item: {
    id: number;
    nome: string;
    peso: number;
    personagemCampanhaId: number | null;
  };
  solicitante: { id: number; apelido: string | null };
  portadorAnterior: {
    id: number;
    nome: string;
    donoId: number | null;
  } | null;
  destinoPersonagem: {
    id: number;
    nome: string;
    donoId: number | null;
    ehMeu: boolean;
  } | null;
  destinoNpc: {
    id: number;
    nome: string;
  } | null;
  permissoes?: {
    podeResponder: boolean;
    podeResponderComoMestre: boolean;
  };
};

export type TemplateItemSessaoCampanhaDto = {
  id: number;
  campanhaId: number;
  nome: string;
  descricao: string | null;
  tipo: TipoItemSessao;
  categoria: CategoriaEquipamentoCodigo;
  peso: number;
  descricaoRevelada: boolean;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: { id: number; apelido: string | null };
};

export type ItensSessaoCampanhaResponse = {
  permissoes: {
    ehMestre: boolean;
    podeGerenciarTemplates: boolean;
    podeCriarItem: boolean;
  };
  itens: ItemSessaoCampanhaDto[];
  transferenciasPendentes?: TransferenciaItemSessaoCampanhaDto[];
};

export type CriarItemSessaoCampanhaPayload = {
  nome: string;
  descricao?: string | null;
  tipo: TipoItemSessao;
  categoria?: CategoriaEquipamentoCodigo;
  peso?: number;
  descricaoRevelada?: boolean;
  sessaoId?: number | null;
  cenaId?: number | null;
  personagemCampanhaId?: number | null;
};

export type CriarTemplateItemSessaoCampanhaPayload = Omit<
  CriarItemSessaoCampanhaPayload,
  'sessaoId' | 'cenaId' | 'personagemCampanhaId'
>;

export type MensagemChatSessao = {
  id: number;
  criadoEm: string;
  mensagem: string;
  autor: {
    usuarioId: number | null;
    apelido: string;
    personagemNome: string | null;
  };
};

export type EventoSessaoTimeline = {
  id: number;
  sessaoId: number;
  cenaId: number | null;
  criadoEm: string;
  tipoEvento: string;
  descricao: string;
  desfeito: boolean;
  podeDesfazer: boolean;
  dados: unknown;
  autor: {
    usuarioId: number | null;
    apelido: string;
    personagemNome: string | null;
  } | null;
};
