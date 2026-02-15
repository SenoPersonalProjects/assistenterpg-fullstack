// src/lib/types/homebrew-enums.ts

/**
 * ✅ Enums para Homebrews - SINCRONIZADO COM PRISMA SCHEMA
 * Fonte da verdade: prisma/schema.prisma
 */

// ============================================================================
// ATRIBUTOS
// ============================================================================

export enum AtributoBase {
  AGI = 'AGI',
  FOR = 'FOR',
  INT = 'INT',
  PRE = 'PRE',
  VIG = 'VIG',
}

export enum AtributoBaseEA {
  INT = 'INT',
  PRE = 'PRE',
}

export enum AtributoPassiva {
  AGILIDADE = 'AGILIDADE',
  FORCA = 'FORCA',
  INTELECTO = 'INTELECTO',
  PRESENCA = 'PRESENCA',
  VIGOR = 'VIGOR',
}

// ============================================================================
// EQUIPAMENTOS
// ============================================================================

export enum TipoEquipamento {
  ARMA = 'ARMA',
  MUNICAO = 'MUNICAO',
  PROTECAO = 'PROTECAO',
  ACESSORIO = 'ACESSORIO',
  EXPLOSIVO = 'EXPLOSIVO',
  ITEM_OPERACIONAL = 'ITEM_OPERACIONAL',
  ITEM_AMALDICOADO = 'ITEM_AMALDICOADO',
  FERRAMENTA_AMALDICOADA = 'FERRAMENTA_AMALDICOADA',
  GENERICO = 'GENERICO',
}

export enum CategoriaEquipamento {
  CATEGORIA_0 = 'CATEGORIA_0',
  CATEGORIA_4 = 'CATEGORIA_4',
  CATEGORIA_3 = 'CATEGORIA_3',
  CATEGORIA_2 = 'CATEGORIA_2',
  CATEGORIA_1 = 'CATEGORIA_1',
  ESPECIAL = 'ESPECIAL',
}

export enum TipoUsoEquipamento {
  CONSUMIVEL = 'CONSUMIVEL',
  VESTIVEL = 'VESTIVEL',
  GERAL = 'GERAL',
}

export enum ProficienciaArma {
  SIMPLES = 'SIMPLES',
  TATICA = 'TATICA',
  PESADA = 'PESADA',
}

export enum EmpunhaduraArma {
  LEVE = 'LEVE',
  UMA_MAO = 'UMA_MAO',
  DUAS_MAOS = 'DUAS_MAOS',
}

export enum TipoArma {
  CORPO_A_CORPO = 'CORPO_A_CORPO',
  A_DISTANCIA = 'A_DISTANCIA',
}

export enum SubtipoArmaDistancia {
  ARREMESSO = 'ARREMESSO',
  DISPARO = 'DISPARO',
  FOGO = 'FOGO',
}

export enum AlcanceArma {
  ADJACENTE = 'ADJACENTE',
  CURTO = 'CURTO',
  MEDIO = 'MEDIO',
  LONGO = 'LONGO',
  EXTREMO = 'EXTREMO',
}

export enum TipoDano {
  CORTANTE = 'CORTANTE',
  PERFURANTE = 'PERFURANTE',
  IMPACTO = 'IMPACTO',
  BALISTICO = 'BALISTICO',
  FOGO = 'FOGO',
  ELETRICO = 'ELETRICO',
  ACIDO = 'ACIDO',
  FRIO = 'FRIO',
  ENERGIA_AMALDICOADA = 'ENERGIA_AMALDICOADA',
  MENTAL = 'MENTAL',
}

export enum ProficienciaProtecao {
  LEVE = 'LEVE',
  PESADA = 'PESADA',
  ESCUDO = 'ESCUDO',
}

export enum TipoProtecao {
  VESTIVEL = 'VESTIVEL',
  EMPUNHAVEL = 'EMPUNHAVEL',
}

export enum TipoReducaoDano {
  DANO = 'DANO',
  BALISTICO = 'BALISTICO',
  IMPACTO = 'IMPACTO',
  CORTE = 'CORTE',
  PERFURACAO = 'PERFURACAO',
  FOGO = 'FOGO',
  ELETRICIDADE = 'ELETRICIDADE',
  FRIO = 'FRIO',
  ENERGIA_AMALDICOADA = 'ENERGIA_AMALDICOADA',
  ENERGIA_POSITIVA = 'ENERGIA_POSITIVA',
  MENTAL = 'MENTAL',
  FISICO = 'FISICO',
  SOBRENATURAL = 'SOBRENATURAL',
  MUNDANO = 'MUNDANO',
}

export enum TipoAcessorio {
  KIT_PERICIA = 'KIT_PERICIA',
  UTENSILIO = 'UTENSILIO',
  VESTIMENTA = 'VESTIMENTA',
}

export enum TipoExplosivo {
  GRANADA_ATORDOAMENTO = 'GRANADA_ATORDOAMENTO',
  GRANADA_FRAGMENTACAO = 'GRANADA_FRAGMENTACAO',
  GRANADA_FUMACA = 'GRANADA_FUMACA',
  GRANADA_INCENDIARIA = 'GRANADA_INCENDIARIA',
  MINA_ANTIPESSOAL = 'MINA_ANTIPESSOAL',
}

export enum TipoAmaldicoado {
  ARMA = 'ARMA',
  PROTECAO = 'PROTECAO',
  ITEM = 'ITEM',
  ARTEFATO = 'ARTEFATO',
}

export enum ComplexidadeMaldicao {
  NENHUMA = 'NENHUMA',
  SIMPLES = 'SIMPLES',
  COMPLEXA = 'COMPLEXA',
}

export enum TipoModificacao {
  CORPO_A_CORPO_E_DISPARO = 'CORPO_A_CORPO_E_DISPARO',
  ARMA_FOGO = 'ARMA_FOGO',
  MUNICAO = 'MUNICAO',
  PROTECAO = 'PROTECAO',
  ACESSORIO = 'ACESSORIO',
}

// ============================================================================
// TÉCNICAS AMALDIÇOADAS
// ============================================================================

export enum TipoTecnicaAmaldicoada {
  INATA = 'INATA',
  NAO_INATA = 'NAO_INATA',
}

export enum TipoExecucao {
  ACAO_MOVIMENTO = 'ACAO_MOVIMENTO',
  ACAO_LIVRE = 'ACAO_LIVRE',
  ACAO_PADRAO = 'ACAO_PADRAO',
  ACAO_COMPLETA = 'ACAO_COMPLETA',
  AO_ATACAR = 'AO_ATACAR',
  REACAO_ESPECIAL = 'REACAO_ESPECIAL',
  REACAO_BLOQUEIO = 'REACAO_BLOQUEIO',
  REACAO_ESQUIVA = 'REACAO_ESQUIVA',
  REACAO = 'REACAO',
  SUSTENTADA = 'SUSTENTADA',
}

export enum AlcanceHabilidade {
  PESSOAL = 'PESSOAL',
  TOQUE = 'TOQUE',
  CORPO_A_CORPO = 'CORPO_A_CORPO',
  CURTO = 'CURTO',
  MEDIO = 'MEDIO',
  LONGO = 'LONGO',
  EXTREMO = 'EXTREMO',
  ILIMITADO = 'ILIMITADO',
}

export enum AreaEfeito {
  CONE = 'CONE',
  LINHA = 'LINHA',
  CUBO = 'CUBO',
  ESFERA = 'ESFERA',
  OUTROS = 'OUTROS',
}

// ============================================================================
// SISTEMA
// ============================================================================

export enum GrauFeiticeiro {
  GRAU_4 = 'GRAU_4',
  GRAU_3 = 'GRAU_3',
  GRAU_2 = 'GRAU_2',
  SEMI_1 = 'SEMI_1',
  GRAU_1 = 'GRAU_1',
  ESPECIAL = 'ESPECIAL',
}

export enum TipoFonte {
  SISTEMA_BASE = 'SISTEMA_BASE',
  SUPLEMENTO = 'SUPLEMENTO',
  HOMEBREW = 'HOMEBREW',
}

export enum RoleUsuario {
  USUARIO = 'USUARIO',
  ADMIN = 'ADMIN',
}

export enum StatusPublicacao {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
  ARQUIVADO = 'ARQUIVADO',
}

export enum TipoHomebrewConteudo {
  CLA = 'CLA',
  TRILHA = 'TRILHA',
  CAMINHO = 'CAMINHO',
  ORIGEM = 'ORIGEM',
  EQUIPAMENTO = 'EQUIPAMENTO',
  PODER_GENERICO = 'PODER_GENERICO',
  TECNICA_AMALDICOADA = 'TECNICA_AMALDICOADA',
}

// ============================================================================
// LABELS TRADUZIDOS
// ============================================================================

export const TIPO_EQUIPAMENTO_LABELS: Record<TipoEquipamento, string> = {
  [TipoEquipamento.ARMA]: 'Arma',
  [TipoEquipamento.MUNICAO]: 'Munição',
  [TipoEquipamento.PROTECAO]: 'Proteção',
  [TipoEquipamento.ACESSORIO]: 'Acessório',
  [TipoEquipamento.EXPLOSIVO]: 'Explosivo',
  [TipoEquipamento.ITEM_OPERACIONAL]: 'Item Operacional',
  [TipoEquipamento.ITEM_AMALDICOADO]: 'Item Amaldiçoado',
  [TipoEquipamento.FERRAMENTA_AMALDICOADA]: 'Ferramenta Amaldiçoada',
  [TipoEquipamento.GENERICO]: 'Genérico',
};

export const CATEGORIA_EQUIPAMENTO_LABELS: Record<CategoriaEquipamento, string> = {
  [CategoriaEquipamento.CATEGORIA_0]: 'Categoria 0',
  [CategoriaEquipamento.CATEGORIA_4]: 'Categoria 4',
  [CategoriaEquipamento.CATEGORIA_3]: 'Categoria 3',
  [CategoriaEquipamento.CATEGORIA_2]: 'Categoria 2',
  [CategoriaEquipamento.CATEGORIA_1]: 'Categoria 1',
  [CategoriaEquipamento.ESPECIAL]: 'Especial',
};

export const TIPO_USO_LABELS: Record<TipoUsoEquipamento, string> = {
  [TipoUsoEquipamento.CONSUMIVEL]: 'Consumível',
  [TipoUsoEquipamento.VESTIVEL]: 'Vestível',
  [TipoUsoEquipamento.GERAL]: 'Geral',
};

export const PROFICIENCIA_ARMA_LABELS: Record<ProficienciaArma, string> = {
  [ProficienciaArma.SIMPLES]: 'Simples',
  [ProficienciaArma.TATICA]: 'Tática',
  [ProficienciaArma.PESADA]: 'Pesada',
};

export const EMPUNHADURA_LABELS: Record<EmpunhaduraArma, string> = {
  [EmpunhaduraArma.LEVE]: 'Leve',
  [EmpunhaduraArma.UMA_MAO]: 'Uma Mão',
  [EmpunhaduraArma.DUAS_MAOS]: 'Duas Mãos',
};

export const TIPO_ARMA_LABELS: Record<TipoArma, string> = {
  [TipoArma.CORPO_A_CORPO]: 'Corpo a Corpo',
  [TipoArma.A_DISTANCIA]: 'À Distância',
};

export const SUBTIPO_ARMA_DISTANCIA_LABELS: Record<SubtipoArmaDistancia, string> = {
  [SubtipoArmaDistancia.ARREMESSO]: 'Arremesso',
  [SubtipoArmaDistancia.DISPARO]: 'Disparo',
  [SubtipoArmaDistancia.FOGO]: 'Arma de Fogo',
};

export const ALCANCE_ARMA_LABELS: Record<AlcanceArma, string> = {
  [AlcanceArma.ADJACENTE]: 'Adjacente',
  [AlcanceArma.CURTO]: 'Curto',
  [AlcanceArma.MEDIO]: 'Médio',
  [AlcanceArma.LONGO]: 'Longo',
  [AlcanceArma.EXTREMO]: 'Extremo',
};

export const TIPO_DANO_LABELS: Record<TipoDano, string> = {
  [TipoDano.CORTANTE]: 'Cortante',
  [TipoDano.PERFURANTE]: 'Perfurante',
  [TipoDano.IMPACTO]: 'Impacto',
  [TipoDano.BALISTICO]: 'Balístico',
  [TipoDano.FOGO]: 'Fogo',
  [TipoDano.ELETRICO]: 'Elétrico',
  [TipoDano.ACIDO]: 'Ácido',
  [TipoDano.FRIO]: 'Frio',
  [TipoDano.ENERGIA_AMALDICOADA]: 'Energia Amaldiçoada',
  [TipoDano.MENTAL]: 'Mental',
};

export const PROFICIENCIA_PROTECAO_LABELS: Record<ProficienciaProtecao, string> = {
  [ProficienciaProtecao.LEVE]: 'Leve',
  [ProficienciaProtecao.PESADA]: 'Pesada',
  [ProficienciaProtecao.ESCUDO]: 'Escudo',
};

export const TIPO_PROTECAO_LABELS: Record<TipoProtecao, string> = {
  [TipoProtecao.VESTIVEL]: 'Vestível',
  [TipoProtecao.EMPUNHAVEL]: 'Empunhável',
};

export const TIPO_REDUCAO_DANO_LABELS: Record<TipoReducaoDano, string> = {
  [TipoReducaoDano.DANO]: 'Dano (Geral)',
  [TipoReducaoDano.BALISTICO]: 'Balístico',
  [TipoReducaoDano.IMPACTO]: 'Impacto',
  [TipoReducaoDano.CORTE]: 'Corte',
  [TipoReducaoDano.PERFURACAO]: 'Perfuração',
  [TipoReducaoDano.FOGO]: 'Fogo',
  [TipoReducaoDano.ELETRICIDADE]: 'Eletricidade',
  [TipoReducaoDano.FRIO]: 'Frio',
  [TipoReducaoDano.ENERGIA_AMALDICOADA]: 'Energia Amaldiçoada',
  [TipoReducaoDano.ENERGIA_POSITIVA]: 'Energia Positiva',
  [TipoReducaoDano.MENTAL]: 'Mental',
  [TipoReducaoDano.FISICO]: 'Físico',
  [TipoReducaoDano.SOBRENATURAL]: 'Sobrenatural',
  [TipoReducaoDano.MUNDANO]: 'Mundano',
};

export const TIPO_ACESSORIO_LABELS: Record<TipoAcessorio, string> = {
  [TipoAcessorio.KIT_PERICIA]: 'Kit de Perícia',
  [TipoAcessorio.UTENSILIO]: 'Utensílio',
  [TipoAcessorio.VESTIMENTA]: 'Vestimenta',
};

export const TIPO_EXPLOSIVO_LABELS: Record<TipoExplosivo, string> = {
  [TipoExplosivo.GRANADA_ATORDOAMENTO]: 'Granada de Atordoamento',
  [TipoExplosivo.GRANADA_FRAGMENTACAO]: 'Granada de Fragmentação',
  [TipoExplosivo.GRANADA_FUMACA]: 'Granada de Fumaça',
  [TipoExplosivo.GRANADA_INCENDIARIA]: 'Granada Incendiária',
  [TipoExplosivo.MINA_ANTIPESSOAL]: 'Mina Antipessoal',
};

export const TIPO_AMALDICOADO_LABELS: Record<TipoAmaldicoado, string> = {
  [TipoAmaldicoado.ARMA]: 'Arma',
  [TipoAmaldicoado.PROTECAO]: 'Proteção',
  [TipoAmaldicoado.ITEM]: 'Item',
  [TipoAmaldicoado.ARTEFATO]: 'Artefato',
};

export const TIPO_TECNICA_LABELS: Record<TipoTecnicaAmaldicoada, string> = {
  [TipoTecnicaAmaldicoada.INATA]: 'Inata',
  [TipoTecnicaAmaldicoada.NAO_INATA]: 'Não-Inata',
};

export const TIPO_EXECUCAO_LABELS: Record<TipoExecucao, string> = {
  [TipoExecucao.ACAO_LIVRE]: 'Ação Livre',
  [TipoExecucao.ACAO_MOVIMENTO]: 'Ação de Movimento',
  [TipoExecucao.ACAO_PADRAO]: 'Ação Padrão',
  [TipoExecucao.ACAO_COMPLETA]: 'Ação Completa',
  [TipoExecucao.AO_ATACAR]: 'Ao Atacar',
  [TipoExecucao.REACAO]: 'Reação',
  [TipoExecucao.REACAO_ESPECIAL]: 'Reação Especial',
  [TipoExecucao.REACAO_BLOQUEIO]: 'Reação de Bloqueio',
  [TipoExecucao.REACAO_ESQUIVA]: 'Reação de Esquiva',
  [TipoExecucao.SUSTENTADA]: 'Sustentada',
};

export const AREA_EFEITO_LABELS: Record<AreaEfeito, string> = {
  [AreaEfeito.CONE]: 'Cone',
  [AreaEfeito.LINHA]: 'Linha',
  [AreaEfeito.CUBO]: 'Cubo',
  [AreaEfeito.ESFERA]: 'Esfera',
  [AreaEfeito.OUTROS]: 'Outros',
};

export const STATUS_PUBLICACAO_LABELS: Record<StatusPublicacao, string> = {
  [StatusPublicacao.RASCUNHO]: 'Rascunho',
  [StatusPublicacao.PUBLICADO]: 'Publicado',
  [StatusPublicacao.ARQUIVADO]: 'Arquivado',
};

export const TIPO_HOMEBREW_LABELS: Record<TipoHomebrewConteudo, string> = {
  [TipoHomebrewConteudo.CLA]: 'Clã',
  [TipoHomebrewConteudo.TRILHA]: 'Trilha',
  [TipoHomebrewConteudo.CAMINHO]: 'Caminho',
  [TipoHomebrewConteudo.ORIGEM]: 'Origem',
  [TipoHomebrewConteudo.EQUIPAMENTO]: 'Equipamento',
  [TipoHomebrewConteudo.PODER_GENERICO]: 'Poder Genérico',
  [TipoHomebrewConteudo.TECNICA_AMALDICOADA]: 'Técnica Amaldiçoada',
};
