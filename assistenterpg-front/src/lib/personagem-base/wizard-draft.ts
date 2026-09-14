import type {
  AtributoBaseCodigo,
  GrauTreinamento,
  ItemInventarioPayload,
  PassivasAtributoConfigFront,
  PoderGenericoInstanciaPayload,
} from '@/lib/api';

export type DadosRascunhoWizardPersonagem = {
  step: number;
  nome: string;
  nivel: number;
  estudouEscolaTecnica: boolean;
  idade: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId: string;
  background: string | null;
  claId: string;
  origemId: string;
  classeId: string;
  trilhaId: string;
  caminhoId: string;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  atributoChaveEa: 'INT' | 'PRE';
  tecnicaInataId: string;
  graus: Record<string, number>;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];
  poderesGenericos: PoderGenericoInstanciaPayload[];
  habilidadesConfig: Array<{ habilidadeId: number; config?: Record<string, unknown> }>;
  passivasAtributosAtivos: AtributoBaseCodigo[];
  grausTreinamento: GrauTreinamento[];
  periciasLivresExtras: number;
  passivasAtributosConfig: PassivasAtributoConfigFront;
  itensInventario: ItemInventarioPayload[];
};

const VERSAO_RASCUNHO_WIZARD = 1;
const PREFIXO_RASCUNHO_WIZARD = 'assistenterpg:personagem-base:wizard:v1';

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function ehNumero(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function ehArray(valor: unknown): valor is unknown[] {
  return Array.isArray(valor);
}

function normalizarRascunho(valor: unknown): DadosRascunhoWizardPersonagem | null {
  if (!ehRegistro(valor)) return null;
  const texto = [
    'nome', 'alinhamentoId', 'claId', 'origemId', 'classeId', 'trilhaId',
    'caminhoId', 'tecnicaInataId',
  ];
  if (texto.some((campo) => !ehTexto(valor[campo]))) return null;
  const numeros = [
    'step', 'nivel', 'prestigioBase', 'agilidade', 'forca', 'intelecto',
    'presenca', 'vigor', 'periciasLivresExtras',
  ];
  if (numeros.some((campo) => !ehNumero(valor[campo]))) return null;
  if (typeof valor.estudouEscolaTecnica !== 'boolean') return null;
  if (valor.idade !== null && !ehNumero(valor.idade)) return null;
  if (valor.prestigioClaBase !== null && !ehNumero(valor.prestigioClaBase)) return null;
  if (valor.background !== null && !ehTexto(valor.background)) return null;
  if (valor.atributoChaveEa !== 'INT' && valor.atributoChaveEa !== 'PRE') return null;
  if (!ehRegistro(valor.graus) || !ehRegistro(valor.passivasAtributosConfig)) return null;
  const arrays = [
    'periciasClasseEscolhidasCodigos', 'periciasOrigemEscolhidasCodigos',
    'periciasLivresCodigos', 'poderesGenericos', 'habilidadesConfig',
    'passivasAtributosAtivos', 'grausTreinamento', 'itensInventario',
  ];
  if (arrays.some((campo) => !ehArray(valor[campo]))) return null;

  return valor as unknown as DadosRascunhoWizardPersonagem;
}

export function criarChaveRascunhoWizardPersonagem(usuarioId: number): string | null {
  if (!ehInteiroPositivo(usuarioId)) return null;
  return `${PREFIXO_RASCUNHO_WIZARD}:${usuarioId}`;
}

export function carregarRascunhoWizardPersonagem(
  usuarioId: number,
): DadosRascunhoWizardPersonagem | null {
  if (typeof window === 'undefined') return null;
  const chave = criarChaveRascunhoWizardPersonagem(usuarioId);
  if (!chave) return null;
  try {
    const raw = window.localStorage.getItem(chave);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as unknown;
    if (!ehRegistro(envelope) || envelope.versao !== VERSAO_RASCUNHO_WIZARD) {
      return null;
    }
    return normalizarRascunho(envelope.dados);
  } catch {
    return null;
  }
}

export function salvarRascunhoWizardPersonagem(
  usuarioId: number,
  dados: DadosRascunhoWizardPersonagem,
): void {
  if (typeof window === 'undefined') return;
  const chave = criarChaveRascunhoWizardPersonagem(usuarioId);
  if (!chave || !normalizarRascunho(dados)) return;
  try {
    window.localStorage.setItem(
      chave,
      JSON.stringify({ versao: VERSAO_RASCUNHO_WIZARD, dados }),
    );
  } catch {
    // O wizard permanece utilizável se o navegador bloquear storage.
  }
}

export function removerRascunhoWizardPersonagem(usuarioId: number): void {
  if (typeof window === 'undefined') return;
  const chave = criarChaveRascunhoWizardPersonagem(usuarioId);
  if (!chave) return;
  try {
    window.localStorage.removeItem(chave);
  } catch {
    // Falhas de storage não podem impedir a criação do personagem.
  }
}
