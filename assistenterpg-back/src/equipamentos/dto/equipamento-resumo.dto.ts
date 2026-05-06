// src/equipamentos/dto/equipamento-resumo.dto.ts

export class EquipamentoResumoDto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  fonte: string;
  suplementoId: number | null;
  categoria: number;
  espacos: number;
  complexidadeMaldicao: string;
  proficienciaArma?: string | null;
  proficienciaProtecao?: string | null;
  tipoProtecao?: string | null;
  alcance?: string | null;
  tipoAcessorio?: string | null;
  periciaBonificada?: string | null;
  bonusPericia?: number | null;

  // ✅ Campos para diferenciar tipo de arma
  tipoArma?: string | null;
  subtipoDistancia?: string | null;

  // ✅ NOVO: Campos essenciais que faltavam
  tipoUso?: string | null; // ← VESTIVEL, CONSUMIVEL, GERAL
  tipoAmaldicoado?: string | null; // ← ARMA, PROTECAO, ITEM, ARTEFATO
  efeito?: string | null; // ← Para mochilas e utilitários

  // Relações amaldiçoadas
  armaAmaldicoada?: {
    id: number;
    tipoBase: string;
  } | null;

  protecaoAmaldicoada?: {
    id: number;
    tipoBase: string;
    bonusDefesa: number;
  } | null;

  artefatoAmaldicoado?: {
    id: number;
    tipoBase: string;
  } | null;

  homebrewId?: number | null;
  homebrewOrigemStatus?: string | null;
}
