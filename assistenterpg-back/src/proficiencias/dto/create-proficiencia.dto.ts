export class CreateProficienciaDto {
  codigo: string;
  nome: string;
  descricao?: string | null;
  tipo: string;      // 'ARMA', 'PROTECAO', 'FERRAMENTA'
  categoria: string; // 'SIMPLES', 'TATICA', 'PESADA', 'LEVE', 'AMALDICOADA'
  subtipo?: string | null; // 'CORPO_A_CORPO', 'DISPARO', 'ESCUDO', etc.
}