export type TipoFichaNpcAmeaca = 'NPC' | 'AMEACA';

export type TipoNpcAmeaca =
  | 'HUMANO'
  | 'FEITICEIRO'
  | 'MALDICAO'
  | 'ANIMAL'
  | 'HIBRIDO'
  | 'OUTRO';

export type TamanhoNpcAmeaca =
  | 'MINUSCULO'
  | 'PEQUENO'
  | 'MEDIO'
  | 'GRANDE'
  | 'ENORME'
  | 'COLOSSAL';

export type NpcAmeacaPericiaEspecial = {
  codigo: string;
  nome: string;
  atributoBase: 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';
  dados: number;
  bonus?: number;
  descricao?: string;
};

export type NpcAmeacaPericiaEspecialPayload = {
  codigo: string;
  dados?: number;
  bonus?: number;
  descricao?: string;
};

export type NpcAmeacaPassiva = {
  nome: string;
  descricao: string;
  gatilho?: string;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  requisitos?: string;
  efeitoGuia?: string;
};

export type NpcAmeacaAcao = {
  nome: string;
  tipoExecucao?: string;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  custoPE?: number;
  custoEA?: number;
  teste?: string;
  dano?: string;
  critico?: string;
  efeito?: string;
  requisitos?: string;
  descricao?: string;
};

export type NpcAmeacaResumo = {
  id: number;
  nome: string;
  descricao: string | null;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  tamanho: TamanhoNpcAmeaca;
  vd: number;
  defesa: number;
  pontosVida: number;
  criadoEm: string;
  atualizadoEm: string;
};

export type NpcAmeacaDetalhe = NpcAmeacaResumo & {
  donoId: number;
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
  percepcaoDados: number;
  iniciativaDados: number;
  fortitudeDados: number;
  reflexosDados: number;
  vontadeDados: number;
  lutaDados: number;
  jujutsuDados: number;
  machucado: number | null;
  deslocamentoMetros: number;
  periciasEspeciais: NpcAmeacaPericiaEspecial[];
  resistencias: string[];
  vulnerabilidades: string[];
  passivas: NpcAmeacaPassiva[];
  acoes: NpcAmeacaAcao[];
  usoTatico: string | null;
};

export type CreateNpcAmeacaPayload = {
  nome: string;
  descricao?: string;
  fichaTipo?: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  tamanho?: TamanhoNpcAmeaca;
  vd?: number;
  agilidade?: number;
  forca?: number;
  intelecto?: number;
  presenca?: number;
  vigor?: number;
  percepcao?: number;
  iniciativa?: number;
  fortitude?: number;
  reflexos?: number;
  vontade?: number;
  luta?: number;
  jujutsu?: number;
  percepcaoDados?: number;
  iniciativaDados?: number;
  fortitudeDados?: number;
  reflexosDados?: number;
  vontadeDados?: number;
  lutaDados?: number;
  jujutsuDados?: number;
  defesa?: number;
  pontosVida?: number;
  machucado?: number | null;
  deslocamentoMetros?: number;
  periciasEspeciais?: NpcAmeacaPericiaEspecialPayload[];
  resistencias?: string[];
  vulnerabilidades?: string[];
  passivas?: NpcAmeacaPassiva[];
  acoes?: NpcAmeacaAcao[];
  usoTatico?: string;
};

export type UpdateNpcAmeacaPayload = Partial<CreateNpcAmeacaPayload>;
