import { BusinessException } from '../common/exceptions/business.exception';
import {
  CATALOGO_DEZ_SOMBRAS,
  AcaoSombra,
  obterSombra,
  SombraCatalogo,
  TAMANHOS_COELHO,
} from './dez-sombras.catalogo';

export type ConfigDezSombras = {
  dominadas: string[];
  destruidas?: string[];
  aspectos: string[];
  favorito?: string;
  melhorAmigo?: string;
  chamariz?: boolean;
  combo?: boolean;
  sinergia?: boolean;
  grauEfetivo: number;
  origemGraus?: Record<string, number>;
  votoRessuscitacao?: boolean;
};
export type CondicaoSombra = {
  codigo: string;
  restante: number | null;
  persistente: boolean;
  modo?: string;
  fonte?: string | null;
  observacao?: string | null;
};
export type EstadoSombra = {
  pv: number;
  destruido?: boolean;
  indisponivelAteDormir?: boolean;
  npcSessaoId?: number;
  sessaoId?: number;
  condicoes: CondicaoSombra[];
  movimentoUsado?: boolean;
  padraoDisponivel?: boolean;
  usouBoop?: boolean;
  herancaPendente?: boolean;
  invocado?: boolean;
};
export type EstadoDezSombras = {
  cenaId?: number;
  versao: 1;
  turno: string;
  rodada: string;
  gasto: number;
  comandoUsado: boolean;
  comboUsado: boolean;
  sinergiaUsada: boolean;
  favoritaUsada: boolean;
  reacaoSombrasUsada: boolean;
  reacaoEspecialUsuarioUsada?: boolean;
  movimentosUsuario: number;
  padroesUsuario: number;
  ecos: number;
  cloneUsado: boolean;
  ultimoAtaque?: string;
  comandada?: string;
  melhorAmigoEmCurto?: boolean;
  ultimaHabilidade?: { sombra: string; habilidade: string; alvos: string[] };
  sombras: Record<string, EstadoSombra>;
  aspectosSustentados: string[];
  podePrepararAspectos?: boolean;
  rituais?: Record<string, { npcSessaoId: number }>;
  adaptacoes?: Record<
    string,
    { giros: number; complexidade: number; concluida: boolean }
  >;
  rodaUsadaRodada?: string;
  dominio?: {
    habilidade: string;
    ativo: boolean;
    acertoUsado: boolean;
    esgotamento: number;
  };
};
export function falhaSombras(mensagem: string): never {
  throw new BusinessException(mensagem, 'DEZ_SOMBRAS_REGRA_INVALIDA');
}
export function configSombras(valor: unknown): ConfigDezSombras | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
  const config = valor as ConfigDezSombras;
  return Array.isArray(config.dominadas) && Array.isArray(config.aspectos)
    ? config
    : null;
}
export function iniciarEstadoSombras(
  config: ConfigDezSombras,
): EstadoDezSombras {
  return {
    versao: 1,
    turno: '',
    rodada: '',
    gasto: 0,
    comandoUsado: false,
    comboUsado: false,
    sinergiaUsada: false,
    favoritaUsada: false,
    reacaoSombrasUsada: false,
    movimentosUsuario: 1,
    padroesUsuario: 1,
    ecos: 0,
    cloneUsado: false,
    sombras: Object.fromEntries(
      (config.destruidas ?? []).map((codigo) => [
        codigo,
        { pv: 0, destruido: true, condicoes: [], herancaPendente: true },
      ]),
    ),
    aspectosSustentados: [],
    podePrepararAspectos: config.aspectos.length === 0,
  };
}
export function lerEstadoSombras(
  valor: unknown,
  config: ConfigDezSombras,
): EstadoDezSombras {
  const estado = valor as EstadoDezSombras | null;
  return estado?.versao === 1 && estado.sombras
    ? structuredClone(estado)
    : iniciarEstadoSombras(config);
}
export function estadoSombra(
  estado: EstadoDezSombras,
  codigo: string,
): EstadoSombra {
  return (estado.sombras[codigo] ??= {
    pv: obterSombra(codigo).pv,
    condicoes: [],
  });
}
export function sombrasAtivas(estado: EstadoDezSombras): string[] {
  return Object.keys(estado.sombras).filter(
    (codigo) => estado.sombras[codigo].npcSessaoId !== undefined,
  );
}
export function cargaSombras(estado: EstadoDezSombras): number {
  return sombrasAtivas(estado).reduce(
    (total, codigo) => total + obterSombra(codigo).carga,
    0,
  );
}
export function podeManifestar(
  config: ConfigDezSombras,
  estado: EstadoDezSombras,
  sombra: SombraCatalogo,
  limite: number,
) {
  const registro = estadoSombra(estado, sombra.codigo);
  const outraForma = Object.entries(estado.sombras).find(
    ([codigo, st]) =>
      codigo !== sombra.codigo &&
      (st.invocado || st.destruido) &&
      codigo.startsWith('COELHO_'),
  );
  if (sombra.familia === 'COELHO' && outraForma)
    falhaSombras(
      'Use a forma preservada do Coelho; tamanho só muda por dano ou Ampliar.',
    );
  if (registro.destruido || registro.indisponivelAteDormir || registro.pv <= 0)
    falhaSombras('Sombra indisponível.');
  if (registro.npcSessaoId) falhaSombras('Sombra já manifestada.');
  const dominadas = new Set(config.dominadas);
  if (
    sombra.codigo !== 'CAO_TOTALIDADE' &&
    sombra.familia === 'CAES_DIVINOS' &&
    dominadas.has('CAO_TOTALIDADE')
  )
    falhaSombras(
      'Os Cães originais foram substituídos pela Totalidade registrada.',
    );
  if (!(sombra.componentes ?? [sombra.familia]).every((c) => dominadas.has(c)))
    falhaSombras('Sombra ou componente não dominado.');
  if (
    sombra.componentes?.some((familia) =>
      Object.entries(estado.sombras).some(
        ([codigo, st]) =>
          st.destruido &&
          CATALOGO_DEZ_SOMBRAS.find((s) => s.codigo === codigo)?.familia ===
            familia,
      ),
    )
  ) {
    falhaSombras(
      'Uma sombra-base destruída não pode compor uma fusão sem herança compatível cadastrada.',
    );
  }
  if (sombra.herancaDe && !dominadas.has(sombra.codigo))
    falhaSombras('Totalidade ainda não desbloqueada por herança.');
  for (const codigo of sombrasAtivas(estado)) {
    const ativa = obterSombra(codigo);
    const usadas = ativa.componentes ?? [ativa.familia];
    if (
      (sombra.componentes ?? [sombra.familia]).some((c) => usadas.includes(c))
    ) {
      falhaSombras('Um componente desta manifestação já está em uso.');
    }
  }
  for (const aspecto of estado.aspectosSustentados) {
    if (
      (sombra.componentes ?? [sombra.familia]).includes(
        obterSombra(aspecto.split(':')[0]).familia,
      )
    ) {
      falhaSombras(
        'Encerre o aspecto sustentado deste componente antes de manifestá-lo.',
      );
    }
  }
  if (cargaSombras(estado) + sombra.carga > limite)
    falhaSombras('Carga das Sombras excedida; libere outras sombras.');
}
export function custoInvocacao(
  config: ConfigDezSombras,
  sombra: SombraCatalogo,
) {
  let ea = sombra.ea;
  const familias = sombra.componentes ?? [sombra.familia];
  if (config.melhorAmigo && familias.includes(config.melhorAmigo)) {
    const componente = sombra.componentes
      ? obterSombra('SERPENTE_OROCHI').ea
      : sombra.ea;
    ea -= componente - Math.ceil(componente / 2);
  }
  if (config.favorito && familias.includes(config.favorito))
    ea = Math.max(0, ea - 1);
  const execucao = config.chamariz ? 'MOVIMENTO' : 'COMPLETA';
  return {
    ea,
    pe: sombra.pe,
    execucao:
      config.favorito === sombra.familia &&
      !sombra.componentes &&
      config.chamariz
        ? 'LIVRE'
        : execucao,
  };
}
export function consumirAcaoUsuario(
  estado: EstadoDezSombras,
  execucao: string,
) {
  if (execucao === 'REACAO_ESPECIAL') {
    if (estado.reacaoEspecialUsuarioUsada)
      falhaSombras('Reação Especial já usada nesta rodada.');
    estado.reacaoEspecialUsuarioUsada = true;
    return;
  }
  if (execucao === 'LIVRE' || execucao === 'REACAO') return;
  if (execucao === 'MOVIMENTO') {
    if (estado.movimentosUsuario > 0) estado.movimentosUsuario--;
    else if (estado.padroesUsuario > 0) estado.padroesUsuario--;
    else falhaSombras('Sem Ação de Movimento disponível.');
    return;
  }
  if (
    estado.padroesUsuario <= 0 ||
    (execucao === 'COMPLETA' && estado.movimentosUsuario <= 0)
  )
    falhaSombras('Sem ações suficientes.');
  estado.padroesUsuario--;
  if (execucao === 'COMPLETA') estado.movimentosUsuario--;
}
export function consumirAcaoSombra(
  estado: EstadoDezSombras,
  codigo: string,
  acao: AcaoSombra,
) {
  const sombra = estadoSombra(estado, codigo);
  if (!sombra.npcSessaoId) falhaSombras('A sombra precisa estar manifestada.');
  if (acao.execucao === 'PASSIVA')
    falhaSombras('Uma passiva não é uma ação ativável.');
  if (acao.execucao === 'REACAO') {
    if (estado.reacaoSombrasUsada)
      falhaSombras('Reação das Sombras já utilizada nesta rodada.');
    estado.reacaoSombrasUsada = true;
  } else if (acao.execucao === 'MOVIMENTO') {
    if (!sombra.movimentoUsado) sombra.movimentoUsado = true;
    else if (sombra.padraoDisponivel) sombra.padraoDisponivel = false;
    else falhaSombras('Movimento da sombra já utilizado.');
  } else if (acao.execucao !== 'LIVRE') {
    if (!sombra.padraoDisponivel)
      falhaSombras('Use Comandar Shikigami para conceder Ação Padrão.');
    if (acao.execucao === 'COMPLETA' && sombra.movimentoUsado)
      falhaSombras('Ação Completa exige também o Movimento da sombra.');
    sombra.padraoDisponivel = false;
    if (acao.execucao === 'COMPLETA') sombra.movimentoUsado = true;
  }
  if (
    acao.ofensiva &&
    estado.comandada === codigo &&
    (acao.teste || acao.basica)
  )
    estado.ultimoAtaque = codigo;
  if (acao.codigo === 'BOOP') sombra.usouBoop = true;
}
export function comandarSombra(estado: EstadoDezSombras, codigo: string) {
  if (estado.comandoUsado)
    falhaSombras('Comandar Shikigami já utilizado neste turno.');
  const sombra = estadoSombra(estado, codigo);
  if (!sombra.npcSessaoId) falhaSombras('A sombra precisa estar manifestada.');
  estado.comandoUsado = true;
  estado.comandada = codigo;
  sombra.padraoDisponivel = true;
}
export function liberarSombra(estado: EstadoDezSombras, codigo: string) {
  const sombra = estadoSombra(estado, codigo);
  delete sombra.npcSessaoId;
  delete sombra.sessaoId;
  sombra.movimentoUsado = false;
  sombra.padraoDisponivel = false;
}
export function registrarDanoSombra(
  estado: EstadoDezSombras,
  codigo: string,
  pv: number,
) {
  const sombra = estadoSombra(estado, codigo);
  sombra.pv = Math.max(0, pv);
  if (pv <= 0) {
    if (!obterSombra(codigo).componentes) {
      sombra.destruido = true;
      sombra.herancaPendente = true;
    }
    liberarSombra(estado, codigo);
  }
  if (codigo.startsWith('COELHO_') && pv > 0) {
    const atual = obterSombra(codigo);
    const tamanho = TAMANHOS_COELHO.find((t) => pv <= t.pv)!;
    if (tamanho.pv < atual.pv) {
      const destino = `COELHO_${tamanho.codigo}`;
      estado.sombras[destino] = { ...sombra };
      delete estado.sombras[codigo];
      return destino;
    }
  }
  return codigo;
}
export function descansarSombras(estado: EstadoDezSombras) {
  for (const [codigo, sombra] of Object.entries(estado.sombras)) {
    if (sombra.destruido) continue;
    sombra.pv = obterSombra(codigo).pv;
    sombra.condicoes = sombra.condicoes.filter((c) => c.persistente);
    sombra.indisponivelAteDormir = false;
  }
  estado.aspectosSustentados = [];
  estado.podePrepararAspectos = true;
}

export function prepararAspectosSombras(
  config: ConfigDezSombras,
  estado: EstadoDezSombras,
  aspectos: string[],
) {
  if (!estado.podePrepararAspectos || config.grauEfetivo < 4)
    falhaSombras(
      'Prepare os Aspectos no início do dia, depois de Dormir e antes de usar a técnica.',
    );
  if (
    aspectos.length > config.grauEfetivo ||
    new Set(aspectos).size !== aspectos.length
  )
    falhaSombras('Quantidade de Aspectos excedida ou seleção duplicada.');
  for (const aspecto of aspectos) {
    const [codigo, habilidade] = aspecto.split(':');
    const sombra = CATALOGO_DEZ_SOMBRAS.find((s) => s.codigo === codigo);
    if (
      sombra?.familia === 'CAES_DIVINOS' &&
      codigo !== 'CAO_TOTALIDADE' &&
      config.dominadas.includes('CAO_TOTALIDADE')
    )
      falhaSombras(
        'Prepare os aspectos da Totalidade, que substituiu os cães originais.',
      );
    const acao = sombra?.acoes.find((a) => a.codigo === habilidade);
    if (
      !sombra ||
      !acao?.extraivel ||
      acao.execucao === 'PASSIVA' ||
      sombra.componentes ||
      !config.dominadas.includes(sombra.familia) ||
      estado.sombras[codigo]?.destruido
    )
      falhaSombras(
        'Aspecto inválido, passivo, não dominado ou proveniente de sombra destruída.',
      );
  }
  config.aspectos = [...aspectos];
  estado.podePrepararAspectos = false;
}
export function iniciarTurnoSombras(
  estado: EstadoDezSombras,
  turno: string,
  rodada: string,
) {
  if (estado.turno === turno) return false;
  if (estado.rodada !== rodada) {
    estado.reacaoSombrasUsada = false;
    estado.reacaoEspecialUsuarioUsada = false;
    estado.comboUsado = false;
    estado.sinergiaUsada = false;
    estado.cloneUsado = false;
    estado.rodada = rodada;
  }
  estado.turno = turno;
  estado.gasto = 0;
  estado.comandoUsado = false;
  estado.favoritaUsada = false;
  estado.movimentosUsuario = 1;
  estado.padroesUsuario = 1;
  estado.ecos = 0;
  delete estado.ultimoAtaque;
  delete estado.comandada;
  if (estado.dominio) {
    estado.dominio.acertoUsado = false;
    estado.dominio.esgotamento = Math.max(0, estado.dominio.esgotamento - 1);
  }
  for (const sombra of Object.values(estado.sombras)) {
    sombra.movimentoUsado = false;
    sombra.padraoDisponivel = false;
    sombra.condicoes = sombra.condicoes
      .map((c) => ({
        ...c,
        restante: c.restante === null ? null : c.restante - 1,
      }))
      .filter((c) => c.restante === null || c.restante > 0);
  }
  return true;
}

/** Modo livre não avança durações nem recupera PV: só libera marcadores de ações. */
export function liberarAcoesSombrasModoLivre(estado: EstadoDezSombras) {
  estado.comandoUsado = false;
  estado.favoritaUsada = false;
  estado.comboUsado = false;
  estado.sinergiaUsada = false;
  estado.cloneUsado = false;
  estado.reacaoSombrasUsada = false;
  estado.reacaoEspecialUsuarioUsada = false;
  estado.movimentosUsuario = 1;
  estado.padroesUsuario = 1;
  estado.ecos = 0;
  estado.gasto = 0;
  delete estado.rodaUsadaRodada;
  if (estado.dominio) estado.dominio.acertoUsado = false;
  for (const sombra of Object.values(estado.sombras)) {
    sombra.movimentoUsado = false;
    // A mesa resolve a concessão de ação em cenas sem turnos.
    sombra.padraoDisponivel = Boolean(sombra.npcSessaoId);
  }
}
