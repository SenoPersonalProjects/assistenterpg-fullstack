// src/equipamentos/dto/equipamento-detalhado.dto.ts

export class DanoDetalhadoDto {
  empunhadura: string | null;
  tipoDano: string;
  rolagem: string;
  valorFlat: number;
}

export class ReducaoDanoDetalhadaDto {
  tipoReducao: string;
  valor: number;
}

export class ArmaAmaldicoadaDto {
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito: string | null;
}

export class ProtecaoAmaldicoadaDto {
  tipoBase: string;
  bonusDefesa: number;
  penalidadeCarga: number;
  proficienciaRequerida: boolean;
  efeito: string | null;
}

export class ArtefatoAmaldicoadoDto {
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito: string | null;
  custoUso: string | null;
  manutencao: string | null;
}

export class ModificacaoDisponivelDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  incrementoEspacos: number;
}

// ============================================================
// DTO DETALHADO - Visão Completa de Equipamento
// ============================================================

export class EquipamentoDetalhadoDto {
  // ============================================================
  // CAMPOS BÁSICOS
  // ============================================================
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  categoria: number;
  espacos: number;
  complexidadeMaldicao: string;

  // ============================================================
  // CAMPOS DE ARMA
  // ============================================================
  proficienciaArma?: string | null;
  empunhaduras?: string[] | null;
  tipoArma?: string | null;
  subtipoDistancia?: string | null;
  agil?: boolean;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  alcance?: string | null;
  tipoMunicaoCodigo?: string | null;
  habilidadeEspecial?: string | null;
  danos?: DanoDetalhadoDto[];

  // ============================================================
  // CAMPOS DE PROTEÇÃO
  // ============================================================
  proficienciaProtecao?: string | null;
  tipoProtecao?: string | null;
  bonusDefesa?: number;
  penalidadeCarga?: number;
  reducoesDano?: ReducaoDanoDetalhadaDto[];

  // ============================================================
  // CAMPOS DE MUNIÇÃO
  // ============================================================
  duracaoCenas?: number | null;
  recuperavel?: boolean | null;

  // ============================================================
  // CAMPOS DE ACESSÓRIO
  // ============================================================
  tipoAcessorio?: string | null;
  periciaBonificada?: string | null;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  maxVestimentas?: number;

  // ============================================================
  // CAMPOS DE EXPLOSIVO E UTILITÁRIOS
  // ============================================================
  tipoExplosivo?: string | null;
  efeito?: string | null; // ✅ Já existe

  // ============================================================
  // CAMPOS DE ITEM AMALDIÇOADO (Genérico)
  // ============================================================
  tipoUso?: string | null; // ✅ NOVO: VESTIVEL, CONSUMIVEL, GERAL
  tipoAmaldicoado?: string | null; // ✅ Já existe
  efeitoMaldicao?: string | null;
  requerFerramentasAmaldicoadas?: boolean;

  // ============================================================
  // RELACIONAMENTOS ESPECIAIS AMALDIÇOADOS
  // ============================================================
  armaAmaldicoada?: ArmaAmaldicoadaDto | null;
  protecaoAmaldicoada?: ProtecaoAmaldicoadaDto | null;
  artefatoAmaldicoado?: ArtefatoAmaldicoadoDto | null;

  // ============================================================
  // MODIFICAÇÕES DISPONÍVEIS
  // ============================================================
  modificacoesDisponiveis?: ModificacaoDisponivelDto[];
}
