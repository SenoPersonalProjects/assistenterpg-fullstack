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
  | 'PRESTIGIO_CLA'
  | 'ATRIBUTO'
  | 'PERICIA_TREINAMENTO'
  | 'PERICIA_BONUS'
  | 'GRAU_APRIMORAMENTO';

export type NucleoAmaldicoadoCodigo = 'EQUILIBRIO' | 'PODER' | 'IMPULSO';

export type ModificadorPersonagemCampanha = {
  id: number;
  campanhaId: number;
  personagemCampanhaId: number;
  sessaoId: number | null;
  cenaId: number | null;
  campo: CampoModificadorPersonagemCampanha;
  periciaCodigo: string | null;
  atributoCodigo?: string | null;
  tipoGrauCodigo: string | null;
  pericia?: { codigo: string; nome: string } | null;
  tipoGrau?: { codigo: string; nome: string } | null;
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
    periciaCodigo: string | null;
    tipoGrauCodigo: string | null;
    pericia?: { codigo: string; nome: string } | null;
    tipoGrau?: { codigo: string; nome: string } | null;
    valor: number;
    nome: string;
    descricao: string | null;
    criadoEm: string;
    criadoPorId: number;
  }>;
  pericias: Array<{
    codigo: string;
    nome: string;
    atributoBase: string;
    grauTreinamento: number;
    bonusTreinamento: number;
    bonusOutros: number;
    bonusTotal: number;
  }>;
  grausAprimoramento: Array<{
    tipoGrauCodigo: string;
    tipoGrauNome: string;
    valor: number;
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
  | 'SOCIAL'
  | 'PERSEGUICAO'
  | 'BASE'
  | 'OUTRA';

export type RegraOpcionalSessaoChave =
  | 'INSPIRACAO'
  | 'ENCONTROS_SOCIAIS'
  | 'ESCALADA_DADOS'
  | 'INICIATIVA_ALTERNADA'
  | 'CONSUMIR_COM_CALMA';

export type EstadoInspiracaoSessao = {
  pontosPorPersonagem: Record<string, number>;
};

export type AlvoEncontroSocialSessao = {
  id?: string;
  npcSessaoId: number | null;
  nome: string;
  interesseAtual: number;
  interesseAlvo: number;
  pacienciaAtual: number;
  motivacoes: Array<{
    texto: string;
    revelada: boolean;
  }>;
};

export type EstadoEncontroSocialSessao = {
  alvos: AlvoEncontroSocialSessao[];
};

export type EstadoEscaladaDadosSessao = {
  ativaNesteCombate: boolean;
  rodadaInicio: number;
  bonusAtual: number;
};

export type ParticipanteIniciativaAlternadaSessao = {
  id: number;
  participanteToken: string;
  tipoParticipante: 'PERSONAGEM' | 'NPC';
  personagemSessaoId: number | null;
  npcSessaoId: number | null;
  nome: string;
  jaAgiu: boolean;
  ordem: number;
};

export type LadoIniciativaAlternadaSessao = {
  id: number;
  nome: string;
  ordem: number;
  ativo: boolean;
  participantes: ParticipanteIniciativaAlternadaSessao[];
};

export type EstadoIniciativaAlternadaSessao = {
  ativo: boolean;
  ladoAtualId: number | null;
  lados: LadoIniciativaAlternadaSessao[];
};

export type RegraOpcionalSessao<TEstado = unknown> = {
  chave: RegraOpcionalSessaoChave;
  ativo: boolean;
  config: unknown;
  estado: TEstado;
};

export type RegrasOpcionaisSessao = {
  INSPIRACAO: RegraOpcionalSessao<EstadoInspiracaoSessao>;
  ENCONTROS_SOCIAIS: RegraOpcionalSessao<EstadoEncontroSocialSessao>;
  ESCALADA_DADOS: RegraOpcionalSessao<EstadoEscaladaDadosSessao>;
  INICIATIVA_ALTERNADA: RegraOpcionalSessao<EstadoIniciativaAlternadaSessao>;
  CONSUMIR_COM_CALMA: RegraOpcionalSessao<Record<string, never>>;
};

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
  grauTreinamento?: number;
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

export type TipoEntidadeVinculadaPersonagem =
  | 'SHIKIGAMI'
  | 'CORPO_AMALDICOADO'
  | 'MALDICAO_CONTROLADA';

export type EstadoEntidadeVinculadaPersonagem =
  | 'DISPONIVEL'
  | 'ATIVO'
  | 'DESTRUIDO'
  | 'SELADO'
  | 'DESCARREGADO'
  | 'ARQUIVADO';

export type ModoVinculadoTecnica = 'CRIAVEL' | 'PREDEFINIDOS' | 'HIBRIDO';
export type PapelCalculoEntidadeVinculada = 'AGIL' | 'FLEXIVEL' | 'TANQUE';

export type ConfigVinculadoTecnica = {
  id: number;
  tecnicaId: number;
  tecnicaCodigo: string;
  tecnicaNome: string;
  tipoVinculado: TipoEntidadeVinculadaPersonagem;
  modo: ModoVinculadoTecnica;
  limiteCadastro: number | null;
  limiteAtivo: number | null;
  unidadeCadastro: 'QUANTIDADE' | 'VAGAS';
  unidadeAtivo: 'QUANTIDADE' | 'VAGAS';
  permiteCriarNovos: boolean;
  usaTemplates: boolean;
  tipoGrauCodigo: string | null;
  regraCalculo: string | null;
  versaoRegra: string;
  previewCalculo?: CalculoAutomaticoEntidadeVinculada | null;
};

export type CapacidadeEntidadeVinculada = {
  tipo: TipoEntidadeVinculadaPersonagem;
  habilitado: boolean;
  modo: ModoVinculadoTecnica | null;
  permiteCriarNovos: boolean;
  usaTemplates: boolean;
  cadastro: {
    unidade: 'QUANTIDADE' | 'VAGAS';
    usado: number;
    maximo: number | null;
    disponivel: number | null;
    excedente: number;
  };
  ativo: {
    unidade: 'QUANTIDADE' | 'VAGAS';
    usado: number;
    maximo: number | null;
    disponivel: number | null;
    excedente: number;
  };
  configuracoes: ConfigVinculadoTecnica[];
};

export type CapacidadesEntidadesVinculadas = {
  personagemCampanhaId: number;
  nivel: number;
  permissoes: {
    podeIgnorarLimites: boolean;
    podeEditar: boolean;
  };
  tipos: CapacidadeEntidadeVinculada[];
};

export type TemplateEntidadeVinculada = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  conceito: string | null;
  aparencia: string | null;
  tipoVinculado: TipoEntidadeVinculadaPersonagem;
  bloqueadoPorPadrao: boolean;
  ordem: number;
  tecnica: { id: number; codigo: string; nome: string };
  associado: boolean;
  entidadeAssociadaId: number | null;
};

export type CalculoAutomaticoEntidadeVinculada = {
  ativo: boolean;
  regraCalculo?: string | null;
  versaoRegra: string;
  motivoRecalculo: string | null;
  nivelReferencia: number;
  grauReferencia: number;
  papel: PapelCalculoEntidadeVinculada;
  pools: {
    atributosMax: number;
    atributosDistribuidos: number;
    ataquesMax: number;
    ataquesDistribuidos: number;
    resistenciasMax: number;
    resistenciasDistribuidas: number;
    tetoAtributo: number;
    tetoAtaque: number | null;
    tetoResistencia: number;
  };
  pendencias: Record<string, number>;
  excedentes: Record<string, number>;
  derivados: { pontosVidaMax: number; defesa: number; rd: number };
  cargasSugeridas: number | null;
};

export type EntidadeVinculadaPersonagem = {
  id: number;
  campanhaId: number;
  personagemCampanhaId: number;
  tipo: TipoEntidadeVinculadaPersonagem;
  estado: EstadoEntidadeVinculadaPersonagem;
  nome: string;
  descricao: string | null;
  conceito: string | null;
  aparencia: string | null;
  nivelReferencia: number | null;
  grauReferencia: number | null;
  tecnicaOrigemId: number | null;
  tipoGrauCodigo: string | null;
  npcAmeacaOrigemId: number | null;
  templateId: number | null;
  precisaRecalculo: boolean;
  calculoAutomatico: CalculoAutomaticoEntidadeVinculada | null;
  overrideMestre: boolean;
  fichaTipo: TipoFichaNpcAmeaca;
  tipoNpc: TipoNpcAmeaca;
  tamanho: string;
  vd: number;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  percepcao: number;
  iniciativa: number;
  fortitude: number;
  reflexos: number;
  vontade: number;
  luta: number;
  jujutsu: number;
  pontaria: number;
  defesa: number;
  pontosVidaMax: number;
  pontosVidaAtual: number;
  rd: number;
  deslocamentoMetros: number;
  vagasOcupadas: number;
  cargasMax: number | null;
  cargasAtual: number | null;
  periciasEspeciais: unknown;
  resistencias: unknown;
  vulnerabilidades: unknown;
  passivas: unknown;
  acoes: unknown;
  habilidades: unknown;
  custos: unknown;
  limites: unknown;
  config: unknown;
  personagem?: {
    id: number;
    nome: string;
    nivel: number;
    donoId: number;
    personagemBase?: { nome: string } | null;
  };
  tecnicaOrigem?: { id: number; codigo: string; nome: string } | null;
  tipoGrau?: { codigo: string; nome: string } | null;
  npcAmeacaOrigem?: {
    id: number;
    nome: string;
    tipo: TipoNpcAmeaca;
    fichaTipo: TipoFichaNpcAmeaca;
  } | null;
  template?: {
    id: number;
    codigo: string;
    nome: string;
    tecnicaId: number;
    bloqueadoPorPadrao: boolean;
  } | null;
  permissoes?: {
    podeEditar: boolean;
    podeIgnorarLimites: boolean;
  };
  instanciasAtivas?: Array<{
    id: number;
    sessaoId: number;
    cenaId: number | null;
    pontosVidaAtual: number;
    ocultoJogadores: boolean;
  }>;
  ativoNestaSessao?: boolean;
};

export type EntidadeVinculadaPersonagemPayload = Partial<
  Omit<
    EntidadeVinculadaPersonagem,
    | 'id'
    | 'campanhaId'
    | 'personagemCampanhaId'
    | 'estado'
    | 'personagem'
    | 'tecnicaOrigem'
    | 'tipoGrau'
    | 'npcAmeacaOrigem'
    | 'template'
    | 'templateId'
    | 'precisaRecalculo'
    | 'calculoAutomatico'
    | 'overrideMestre'
    | 'permissoes'
    | 'instanciasAtivas'
    | 'ativoNestaSessao'
  >
> & {
  tipo: TipoEntidadeVinculadaPersonagem;
  nome: string;
  estado?: EstadoEntidadeVinculadaPersonagem;
  overrideMestre?: boolean;
  papel?: PapelCalculoEntidadeVinculada;
};

export type NpcSessaoCampanha = {
  npcSessaoId: number;
  npcAmeacaId: number | null;
  entidadeVinculadaId?: number | null;
  personagemDonoId?: number | null;
  personagemControladorSessaoId?: number | null;
  tipoVinculo?: TipoEntidadeVinculadaPersonagem | null;
  vinculo?: {
    id: number;
    tipo: TipoEntidadeVinculadaPersonagem;
    estado: EstadoEntidadeVinculadaPersonagem;
    nome: string;
    personagemCampanhaId: number;
    personagemDono: {
      id: number;
      nome: string;
      donoId: number;
    } | null;
  } | null;
  nome: string;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  tamanho?: string | null;
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
  ocultoJogadores: boolean;
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

export type CampoRecursoSessaoCampanha =
  | 'pvAtual'
  | 'peAtual'
  | 'eaAtual'
  | 'sanAtual';

export type AtualizacaoRecursosSessaoCampanha = {
  tipo: 'RECURSO_AJUSTADO';
  mutacaoId: string;
  eventoId: number | null;
  campanhaId: number;
  sessaoId: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  valores: Partial<Record<CampoRecursoSessaoCampanha, number>>;
  condicoesAtivas?: CondicaoAtivaSessaoCampanha[];
  em: string;
};

export type AtualizacaoInspiracaoSessaoCampanha = {
  tipo: 'INSPIRACAO_AJUSTADA' | 'INSPIRACAO_GASTA';
  mutacaoId: string;
  eventoId: number | null;
  campanhaId: number;
  sessaoId: number;
  personagemCampanhaId: number;
  pontosInspiracao: number;
  em: string;
};

export type AtualizacaoIncrementalSessaoCampanha =
  | AtualizacaoRecursosSessaoCampanha
  | AtualizacaoInspiracaoSessaoCampanha;

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
  ocultoJogadores?: boolean;
};

export type AdicionarNpcSimplesSessaoCampanhaPayload = {
  nome: string;
  fichaTipo?: TipoFichaNpcAmeaca;
  tipo?: TipoNpcAmeaca;
  tamanho?: string;
  vd?: number;
  iniciativaValor?: number | null;
  defesa: number;
  pontosVidaMax: number;
  pontosVidaAtual?: number;
  sanMax?: number | null;
  sanAtual?: number | null;
  eaMax?: number | null;
  eaAtual?: number | null;
  machucado?: number | null;
  deslocamentoMetros?: number;
  agilidade?: number | null;
  forca?: number | null;
  intelecto?: number | null;
  presenca?: number | null;
  vigor?: number | null;
  percepcao?: number | null;
  iniciativa?: number | null;
  fortitude?: number | null;
  reflexos?: number | null;
  vontade?: number | null;
  luta?: number | null;
  jujutsu?: number | null;
  notasCena?: string;
  ocultoJogadores?: boolean;
};

export type AtualizarNpcSessaoCampanhaPayload = Partial<
  Omit<AdicionarNpcSessaoCampanhaPayload, 'npcAmeacaId'> &
    AdicionarNpcSimplesSessaoCampanhaPayload & {
      pontosVidaAtualEsperado: number;
      sanAtualEsperado: number;
      eaAtualEsperado: number;
    }
>;

export type InvocarEntidadeVinculadaSessaoPayload = {
  ocultoJogadores?: boolean;
  cenaId?: number | null;
  ignorarLimite?: boolean;
};

export type ConcederMaldicaoControladaSessaoPayload = {
  personagemCampanhaId: number;
  npcAmeacaId?: number;
  npcSessaoId?: number;
  nome?: string;
  descricao?: string | null;
};

export type AplicarCondicaoSessaoCampanhaPayload = {
  clientRequestId?: string;
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

export type StatusSessaoAgendada =
  | 'AGENDADA'
  | 'PROCESSANDO_ABERTURA'
  | 'ABERTA'
  | 'CANCELADA'
  | 'FALHA_ABERTURA';

export type StatusSyncCalendar =
  | 'NAO_SOLICITADO'
  | 'PENDENTE'
  | 'SINCRONIZADO'
  | 'FALHOU'
  | 'CANCELADO';

export type SessaoAgendadaResumo = {
  id: number;
  campanhaId: number;
  sessaoId: number | null;
  titulo: string;
  descricao: string | null;
  inicioEm: string;
  fimEm: string;
  timezone: string;
  status: StatusSessaoAgendada;
  canceladaEm: string | null;
  abertaEm: string | null;
  falhaAbertura: string | null;
  adicionarAoGoogleCalendar: boolean;
  adicionarGoogleMeet: boolean;
  googleCalendarHtmlLink: string | null;
  googleMeetLink: string | null;
  calendarSyncStatus: StatusSyncCalendar;
  calendarSyncError: string | null;
  calendarSyncAttempts: number;
  lastCalendarSyncAt: string | null;
  criador: {
    id: number;
    apelido: string;
    email: string;
  };
  sessao: {
    id: number;
    status: string;
  } | null;
};

export type CriarSessaoAgendadaPayload = {
  titulo: string;
  descricao?: string;
  inicioEm: string;
  fimEm?: string;
  duracaoMinutos?: number;
  timezone: string;
  adicionarAoGoogleCalendar?: boolean;
  adicionarGoogleMeet?: boolean;
};

export type AtualizarSessaoAgendadaPayload =
  Partial<CriarSessaoAgendadaPayload>;

export type ConflitoSessaoAgendadaLocal = {
  id: number;
  titulo: string;
  inicioEm: string;
  fimEm: string;
  status: StatusSessaoAgendada;
  calendarSyncStatus: StatusSyncCalendar;
};

export type ConflitoSessaoAgendadaGoogle = {
  id: string | null;
  titulo: string;
  inicioEm: string | null;
  fimEm: string | null;
  htmlLink: string | null;
};

export type ConflitosSessaoAgendadaResponse = {
  inicioEm: string;
  fimEm: string;
  assistenteRpg: ConflitoSessaoAgendadaLocal[];
  googleCalendar: ConflitoSessaoAgendadaGoogle[];
  googleCalendarErro: string | null;
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

export type VersaoHabilidadeClasseSessaoCampanha = {
  nivel: number;
  custoPE: number;
  dadoFaces?: number;
  bonus?: number;
  graus?: number;
};

export type EfeitoPeritoPendenteSessaoCampanha = {
  id: string;
  eventoId: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  habilidadeId: number;
  habilidadeNome: string;
  dado: string;
  faces: number;
  criadoEm: string;
};

export type HabilidadeClasseSessaoCampanha = {
  id: number;
  nome: string;
  codigo: string | null;
  descricao: string | null;
  tipo: 'PERITO' | 'ATAQUE_ESPECIAL' | 'APRIMORADO';
  fonte: string;
  versoes: VersaoHabilidadeClasseSessaoCampanha[];
  versoesDisponiveis: VersaoHabilidadeClasseSessaoCampanha[];
  efeitoPendente?: EfeitoPeritoPendenteSessaoCampanha | null;
};

export type OutraHabilidadeSessaoCampanha = {
  id: number;
  nome: string;
  codigo: string | null;
  descricao: string | null;
  tipo: string;
  fonte: string;
};

export type AprimoramentoTemporarioSessaoCampanha = {
  id: string;
  eventoId: number;
  personagemSessaoId: number;
  personagemCampanhaId: number;
  tecnicaId: number;
  tecnicaNome: string;
  tipoGrauCodigo: string;
  graus: number;
  cenaId: number | null;
  criadoEm: string;
};

export type OpcaoAprimoramentoTecnicaSessaoCampanha = {
  tecnicaId: number;
  tecnicaNome: string;
  tipoGrauCodigo: string;
  grauBase: number;
  grauTemporario: number;
  grauEfetivo: number;
  limiteTemporarioRestante: number;
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
  iniciativaAlternada?: EstadoIniciativaAlternadaSessao;
  efeitosTurnoPendentes?: {
    eventoId: number;
    status: 'PENDENTE' | 'ERRO';
    acao: 'AVANCAR' | 'VOLTAR' | 'PULAR';
    rodadaAnterior: number;
    rodadaNova: number;
    tentativas: number;
  } | null;
  permissoes: {
    ehMestre: boolean;
    podeEditarTodos: boolean;
  };
  regrasOpcionais?: RegrasOpcionaisSessao;
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
    ficha?: {
      nivel: number;
      classe: { id: number; nome: string } | null;
      origem: { id: number; nome: string } | null;
      trilha: { id: number; nome: string } | null;
      caminho: { id: number; nome: string } | null;
      defesaBase: number;
      defesaEquipamento: number;
      defesaOutros: number;
      defesaTotal: number;
      esquiva: number;
      bloqueio: number;
      deslocamento: number;
      limitePeEaPorTurno: number;
      prestigioGeral: number;
      prestigioCla: number | null;
      grausAprimoramento: Array<{
        tipoGrauCodigo: string;
        tipoGrauNome: string;
        valor: number;
      }>;
      proficiencias: Array<{
        codigo: string;
        nome: string;
        tipo: string;
        categoria: string;
        subtipo: string | null;
      }>;
    } | null;
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
    habilidadesClasse: HabilidadeClasseSessaoCampanha[];
    outrasHabilidades: OutraHabilidadeSessaoCampanha[];
    vinculados: Array<
      Pick<
        EntidadeVinculadaPersonagem,
        | 'id'
        | 'tipo'
        | 'estado'
        | 'nome'
        | 'descricao'
        | 'conceito'
        | 'aparencia'
        | 'defesa'
        | 'pontosVidaAtual'
        | 'pontosVidaMax'
        | 'rd'
        | 'deslocamentoMetros'
        | 'vagasOcupadas'
        | 'cargasAtual'
        | 'cargasMax'
        | 'tipoNpc'
        | 'fichaTipo'
        | 'tamanho'
        | 'npcAmeacaOrigemId'
        | 'instanciasAtivas'
        | 'ativoNestaSessao'
      >
    >;
    aprimoramentosTemporarios: AprimoramentoTemporarioSessaoCampanha[];
    opcoesAprimoramentoTecnicasNaoInatas: OpcaoAprimoramentoTecnicaSessaoCampanha[];
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
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';
  ocultaParaUsuario?: boolean;
  dadosRolagem?: unknown;
  contextoRolagem?: unknown;
  ajustesAplicados?: unknown;
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

export type SessaoRelatorioContadores = {
  danoRecebido: number;
  rolagensFeitas: number;
  habilidadesUsadas: number;
  entradasMachucado: number;
  entradasPerturbado: number;
  entradasMorrendo: number;
  entradasEnlouquecendo: number;
};

export type SessaoRelatorioPersonagem = {
  personagemSessaoId: number;
  personagemCampanhaId: number;
  donoId: number;
  nomePersonagem: string;
  nomeJogador: string;
  totaisSessao: SessaoRelatorioContadores;
  totaisCombate: SessaoRelatorioContadores;
  statusFinal: {
    terminouVivo: boolean;
    pvAtual: number;
    pvMax: number;
    sanAtual: number;
    sanMax: number;
    morto: boolean;
  };
};

export type SessaoCampanhaRelatorio = {
  sessaoId: number;
  campanhaId: number;
  tituloSessao: string;
  geradoEm: string;
  iniciadoEm: string;
  encerradoEm: string | null;
  personagens: SessaoRelatorioPersonagem[];
  permissoes: {
    ehMestre: boolean;
  };
};
