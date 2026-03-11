// src/lib/api/error-handler.ts
import type { ApiErrorBody } from "@/lib/types"; // ✅ ATUALIZADO

/**
 * ✅ Mapeamento de códigos de erro para mensagens amigáveis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // AUTH
  CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  AUTH_CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  TOKEN_INVALIDO: "Sua sessão expirou. Faça login novamente.",
  USUARIO_TOKEN_NAO_ENCONTRADO:
    "Sua conta não foi encontrada. Faça login novamente.",
  USUARIO_NAO_AUTENTICADO:
    "Você precisa fazer login para acessar esta página",
  ACESSO_NEGADO: "Você não tem permissão para acessar este recurso",

  // USUÁRIO
  USUARIO_NOT_FOUND: "Usuário não encontrado",
  USUARIO_JA_MEMBRO: "Este usuário já é membro da campanha.",
  USUARIO_EMAIL_DUPLICADO: "Este email já está em uso",
  USUARIO_EMAIL_NOT_FOUND: "Email não encontrado",
  USUARIO_APELIDO_NOT_FOUND: "Usuário não encontrado",
  USUARIO_SENHA_INCORRETA: "Senha incorreta",

  // PERSONAGEM BASE
  PERSONAGEM_BASE_NOT_FOUND: "Personagem não encontrado",
  UPDATE_PERSONAGEM_FAILED: "Falha ao atualizar personagem",
  ATTRIBUTE_NOT_INTEGER: "Valor de atributo inválido (deve ser inteiro)",
  ATTRIBUTE_OUT_OF_RANGE:
    "Valor de atributo inválido (deve estar entre 0 e 7)",
  INVALID_ATTRIBUTE_SUM: "Soma de atributos inválida para este nível",
  INVALID_EA_KEY_ATTRIBUTE:
    "Atributo-chave de Energia Amaldiçoada deve ser INT ou PRE",

  TOO_MANY_PASSIVES:
    "Você pode selecionar no máximo 2 atributos para passivas",
  INELIGIBLE_PASSIVES: "Um ou mais atributos selecionados não são elegíveis",
  PASSIVES_CHOICE_REQUIRED:
    "Você deve escolher exatamente 2 atributos dentre os elegíveis",
  PASSIVE_REQUIREMENT_NOT_MET: "Passiva não atende aos requisitos de atributo",
  DUPLICATE_PASSIVES: "Você selecionou passivas duplicadas",
  TOO_MANY_PASSIVE_ATTRIBUTES:
    "Você só pode ter passivas em 2 atributos diferentes",
  PASSIVE_NOT_FOUND: "Passiva não encontrada",
  PASSIVES_CATALOG_INCONSISTENT:
    "Catálogo de passivas inconsistente; tente novamente mais tarde",
  INTELLECT_PASSIVE_CONFIG_INVALID:
    "Configuração de passiva de intelecto inválida",
  INTELLECT_PASSIVE_SKILL_NOT_FOUND:
    "Perícia de passiva de intelecto não encontrada",
  INTELLECT_PASSIVE_TRAINING_REQUIRED:
    "Passiva de intelecto requer escolha de perícia",
  INTELLECT_PASSIVE_GRADE_EXCEEDS_MAX:
    "Passiva de intelecto ultrapassou o grau máximo permitido",

  PERICIAS_LIVRES_EXCEDEM_LIMITE: "Você selecionou perícias livres demais",
  GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL:
    "Você distribuiu graus de aprimoramento além do permitido",

  GRADE_NOT_INTEGER: "Valor de grau de aprimoramento inválido (inteiro)",
  GRADE_OUT_OF_RANGE: "Valor de grau de aprimoramento inválido (0-5)",
  GRADE_EXCEEDS_MAX_WITH_BONUS:
    "Grau excede o máximo com os bônus de habilidades",
  GRADE_EXCEEDS_MAX_WITH_POWERS:
    "Grau excede o máximo com os bônus de poderes",
  TRAINING_LEVEL_INVALID: "Nível inválido para melhoria de treinamento",
  TRAINING_EXCEEDS_IMPROVEMENTS:
    "Quantidade de melhorias de treinamento excede o permitido",
  TRAINING_LEVEL_REQUIREMENT:
    "Requisito de nível para treinamento não atendido",
  TRAINING_SKILL_NOT_FOUND: "Perícia de treinamento não encontrada",

  CLASS_NOT_FOUND: "Classe não encontrada",
  CLAN_NOT_FOUND: "Clã não encontrado",
  ORIGEM_NOT_FOUND: "Origem não encontrada",
  ORIGIN_NOT_FOUND: "Origem não encontrada",
  ORIGIN_REQUIRES_GREAT_CLAN: "Esta origem requer um dos três grandes clãs",
  ORIGIN_REQUIRES_HEREDITARY_TECHNIQUE:
    "Esta origem exige uma técnica hereditária",
  ORIGIN_BLOCKS_HEREDITARY_TECHNIQUE:
    "Esta origem bloqueia técnica hereditária",
  INNATE_TECHNIQUE_NOT_FOUND: "Técnica inata não encontrada",
  INNATE_TECHNIQUE_INVALID_TYPE: "Técnica deve ser do tipo INATA",
  HEREDITARY_TECHNIQUE_INCOMPATIBLE:
    "Técnica hereditária incompatível com o clã escolhido",

  SKILL_NOT_FOUND: "Perícia não encontrada",
  PERICIA_NOT_FOUND: "Perícia não encontrada",
  ORIGIN_SKILL_MISSING_GROUP:
    "Grupo de escolha de perícia da origem inválido",
  ORIGIN_SKILL_GROUP_INVALID:
    "Escolha de grupo de perícia da origem inválida",
  ORIGIN_SKILL_CHOICE_INVALID: "Perícia escolhida não pertence à origem",
  CLASS_SKILL_MISSING_GROUP: "Grupo de escolha de perícia da classe inválido",
  CLASS_SKILL_GROUP_INVALID: "Escolha de grupo de perícia da classe inválida",
  CLASS_SKILL_CHOICE_INVALID: "Perícia escolhida não pertence à classe",
  CLASS_VALUES_NOT_DEFINED: "Configuração de valores da classe incompleta",
  JUJUTSU_SKILL_NOT_FOUND: "Perícia Jujutsu não encontrada no catálogo",
  TRAINING_SKILL_UNTRAINED:
    "Perícia precisa estar treinada para receber melhoria",
  TRAINING_INVALID_PROGRESSION: "Melhoria de grau de treinamento inválida",

  POWER_LEVEL_REQUIREMENT: "Poder genérico requer nível mínimo",
  POWER_NOT_REPEATABLE: "Este poder não pode ser escolhido múltiplas vezes",
  POWERS_EXCEED_SLOTS: "Você selecionou poderes demais para este nível",
  POWERS_NOT_FOUND: "Um ou mais poderes genéricos não foram encontrados",
  POWER_REQUIRES_CHOICE: "Este poder exige uma escolha/configuração",
  POWER_CONFIG_INVALID: "Configuração de poder inválida",
  POWER_SKILL_REQUIREMENT: "Requisito de perícia para poder não atendido",
  POWER_ATTRIBUTE_REQUIREMENT: "Requisito de atributo para poder não atendido",
  POWER_GRADE_REQUIREMENT: "Requisito de grau para poder não atendido",
  POWER_POWER_REQUIREMENT:
    "Este poder exige outro poder previamente selecionado",
  POWER_SKILL_MAX_REACHED: "Perícia já está no limite máximo",
  POWER_SKILL_LEVEL_LIMIT:
    "Nível atual não permite elevar mais essa perícia",
  PROFICIENCY_NOT_FOUND: "Proficiência não encontrada",

  PATH_NOT_FOUND: "Trilha não encontrada",
  PATH_REQUIREMENT_NOT_MET: "Requisito de trilha não atendido",
  WAY_NOT_FOUND: "Caminho não encontrado",
  WAY_REQUIRES_PATH: "Selecione uma trilha antes de escolher um caminho",
  PATH_INCOMPATIBLE_WITH_CLASS: "Trilha incompatível com a classe",
  WAY_INCOMPATIBLE_WITH_PATH: "Caminho incompatível com a trilha",

  // TÉCNICAS AMALDIÇOADAS
  TECNICA_NOT_FOUND: "Técnica amaldiçoada não encontrada",
  TECNICA_EM_USO: "Técnica está sendo usada e não pode ser deletada",
  TECNICA_NOME_DUPLICADO: "Já existe uma técnica com este nome",
  TECNICA_CODIGO_OU_NOME_DUPLICADO:
    "Já existe uma técnica com este código ou nome",
  TECNICA_HEREDITARIA_SEM_CLA:
    "Técnicas hereditárias precisam de pelo menos um clã",
  TECNICA_NAO_INATA_HEREDITARIA:
    "Apenas técnicas INATAS podem ser hereditárias",
  TECNICA_SUPLEMENTO_NOT_FOUND:
    "Suplemento informado para técnica não existe",
  TECNICA_CLA_NOT_FOUND: "Clã informado para técnica não existe",
  HABILIDADE_TECNICA_NOT_FOUND: "Habilidade de técnica não encontrada",
  HABILIDADE_CODIGO_DUPLICADO:
    "Já existe uma habilidade de técnica com este código",
  VARIACAO_HABILIDADE_NOT_FOUND: "Variação de habilidade não encontrada",

  // EQUIPAMENTOS/INVENTÁRIO
  EQUIPAMENTO_NOT_FOUND: "Equipamento não encontrado",
  EQUIP_NOT_FOUND: "Equipamento não encontrado",
  EQUIPAMENTO_CODIGO_DUPLICADO: "Já existe um equipamento com este código",
  EQUIPAMENTO_EM_USO: "Este equipamento está em uso e não pode ser removido",
  INVENTARIO_PERSONAGEM_NOT_FOUND: "Personagem do inventário não encontrado",
  INVENTARIO_SEM_PERMISSAO: "Você não tem permissão para este inventário",
  INVENTARIO_ITEM_NOT_FOUND: "Item do inventário não encontrado",
  INVENTARIO_EQUIPAMENTO_NOT_FOUND:
    "Equipamento não encontrado no inventário",
  INVENTARIO_CAPACIDADE_EXCEDIDA:
    "Limite máximo de capacidade do inventário excedido",
  INVENTARIO_ESPACOS_INSUFICIENTES: "Espaço insuficiente no inventário",
  INV_INSUFFICIENT_SPACE: "Espaço insuficiente no inventário",
  INVENTARIO_GRAU_XAMA_EXCEDIDO: "Limites do Grau Xamã foram excedidos",
  INVENTARIO_LIMITE_VESTIR_EXCEDIDO:
    "Limites de itens vestidos foram excedidos",
  INVENTARIO_MODIFICACAO_NOT_FOUND: "Modificação não encontrada",
  INVENTARIO_MODIFICACAO_INVALIDA: "Uma ou mais modificações são inválidas",
  INVENTARIO_MODIFICACAO_INCOMPATIVEL:
    "Modificação incompatível com o equipamento",
  INVENTARIO_MODIFICACAO_DUPLICADA: "Este item já possui essa modificação",
  INVENTARIO_MODIFICACAO_NAO_APLICADA:
    "Essa modificação não está aplicada no item",

  // ALIASES LEGADOS (mantidos por compatibilidade)
  ITEM_INVENTARIO_NOT_FOUND: "Item do inventário não encontrado",
  ESPACOS_INSUFICIENTES: "Espaço insuficiente no inventário",
  GRAU_XAMA_LIMITE_EXCEDIDO:
    "Limite do Grau Xamã excedido para esta categoria",

  // CAMPANHAS
  CAMPANHA_NOT_FOUND: "Campanha não encontrada",
  CAMP_NOT_FOUND: "Campanha não encontrada",
  CAMPANHA_ACESSO_NEGADO: "Você não tem acesso a esta campanha",
  CAMP_USER_ALREADY_MEMBER: "Usuário já é membro desta campanha",
  CAMPANHA_APENAS_DONO: "Apenas o dono da campanha pode executar esta ação",
  CAMPANHA_APENAS_MESTRE:
    "Apenas o mestre da campanha pode executar esta ação.",
  CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA:
    "Você não pode associar este personagem-base à campanha.",
  CAMPANHA_PERSONAGEM_LIMITE_USUARIO:
    "Este usuário já possui um personagem associado nesta campanha.",
  CAMPANHA_PERSONAGEM_EDICAO_NEGADA:
    "Você não tem permissão para editar esta ficha de campanha.",
  PERSONAGEM_CAMPANHA_NOT_FOUND: "Personagem da campanha não encontrado",
  CAMPANHA_MODIFICADOR_NOT_FOUND:
    "Modificador da ficha de campanha não encontrado",
  CAMPANHA_MODIFICADOR_JA_DESFEITO: "Este modificador já foi desfeito",
  SESSAO_CAMPANHA_NOT_FOUND: "Sessão da campanha não encontrada.",
  CENA_SESSAO_NOT_FOUND: "Cena da sessao nao encontrada.",
  SESSAO_TURNO_INDISPONIVEL:
    "Cena livre não possui contagem de rodada/turno.",
  NPC_AMEACA_NOT_FOUND: "Aliado/Ameaça não encontrado",
  CONVITE_NOT_FOUND: "Convite não encontrado",
  CONVITE_INVALIDO: "Convite inválido ou já utilizado",
  CONVITE_NAO_PERTENCE_USUARIO: "Este convite não pertence ao usuário logado",
  CONVITE_DUPLICADO_PENDENTE: "Ja existe convite pendente para este email nesta campanha",
  CONVITE_CODIGO_INDISPONIVEL: "Nao foi possivel gerar um codigo de convite. Tente novamente",
  // MODIFICAÇÕES
  MODIFICACAO_NOT_FOUND: "Modificação não encontrada",
  MODIFICACAO_CODIGO_DUPLICADO: "Já existe uma modificação com este código",
  MODIFICACAO_SUPLEMENTO_NOT_FOUND:
    "Suplemento informado para modificação não existe",
  MODIFICACAO_FONTE_INVALIDA:
    "Ao informar suplementoId, a fonte deve ser SUPLEMENTO",
  MODIFICACAO_EQUIPAMENTOS_INVALIDOS:
    "Um ou mais equipamentos vinculados à modificação não existem",
  MODIFICACAO_EM_USO:
    "Esta modificação está em uso e não pode ser removida",
  MODIFICACAO_EQUIPAMENTO_NOT_FOUND:
    "Equipamento informado para validar modificações não existe",

  // SUPLEMENTOS / HOMEBREWS / COMPENDIO
  SUPLEMENTO_NOT_FOUND: "Suplemento não encontrado",
  SUPLEMENTO_CODIGO_DUPLICADO: "Já existe um suplemento com este código",
  SUPLEMENTO_COM_CONTEUDO_VINCULADO:
    "Suplemento possui conteúdo vinculado e não pode ser removido",
  SUPLEMENTO_NAO_PUBLICADO: "Apenas suplementos publicados podem ser ativados",
  SUPLEMENTO_JA_ATIVO: "Este suplemento já está ativo para o usuário",
  SUPLEMENTO_NAO_ATIVO: "Este suplemento não está ativo para o usuário",
  HOMEBREW_NOT_FOUND: "Homebrew não encontrado",
  HB_NOT_FOUND: "Homebrew não encontrado",
  HB_ALREADY_PUBLISHED: "Homebrew já está publicado",
  HB_INVALID_DATA: "Dados do homebrew são inválidos",
  HB_UNSUPPORTED_TYPE: "Tipo de homebrew não suportado",
  HOMEBREW_JA_PUBLICADO: "Homebrew já está publicado",
  HOMEBREW_DADOS_INVALIDOS: "Dados do homebrew são inválidos",
  HOMEBREW_SEM_PERMISSAO:
    "Você não tem permissão para executar esta ação no homebrew",
  COMPENDIO_CATEGORIA_NOT_FOUND: "Categoria do compêndio não encontrada",
  COMPENDIO_CATEGORIA_DUPLICADA:
    "Já existe categoria com este código no compêndio",
  COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS:
    "Não é possível remover categoria com subcategorias",
  COMPENDIO_SUBCATEGORIA_NOT_FOUND:
    "Subcategoria do compêndio não encontrada",
  COMPENDIO_SUBCATEGORIA_DUPLICADA:
    "Já existe subcategoria com este código no compêndio",
  COMPENDIO_SUBCATEGORIA_COM_ARTIGOS:
    "Não é possível remover subcategoria com artigos",
  COMPENDIO_ARTIGO_NOT_FOUND: "Artigo do compêndio não encontrado",
  COMPENDIO_ARTIGO_DUPLICADO:
    "Já existe artigo com este código no compêndio",
  COMPENDIO_BUSCA_INVALIDA: "A busca no compêndio é inválida",

  // CATALOGOS MENORES / PROGRESSAO
  CLASSE_NOT_FOUND: "Classe não encontrada",
  CLASSE_NOME_DUPLICADO: "Já existe uma classe com este nome",
  CLASSE_EM_USO: "Classe em uso e não pode ser removida",
  CLA_NOT_FOUND: "Clã não encontrado",
  CLA_NOME_DUPLICADO: "Já existe um clã com este nome",
  CLA_TECNICAS_INVALIDAS:
    "Uma ou mais técnicas herdadas informadas para o clã são inválidas",
  CLA_EM_USO: "Clã em uso e não pode ser removido",
  ORIGEM_NOME_DUPLICADO: "Já existe uma origem com este nome",
  ORIGEM_PERICIAS_INVALIDAS:
    "Uma ou mais perícias vinculadas à origem não existem",
  ORIGEM_HABILIDADES_INVALIDAS:
    "Uma ou mais habilidades vinculadas à origem não existem",
  ORIGEM_EM_USO: "Origem em uso e não pode ser removida",
  TRILHA_NOT_FOUND: "Trilha não encontrada",
  TRILHA_CLASSE_NOT_FOUND: "Classe vinculada à trilha não encontrada",
  TRILHA_NOME_DUPLICADO: "Já existe uma trilha com este nome",
  TRILHA_EM_USO: "Trilha em uso e não pode ser removida",
  CAMINHO_NOT_FOUND: "Caminho não encontrado",
  CAMINHO_NOME_DUPLICADO: "Já existe um caminho com este nome",
  CAMINHO_EM_USO: "Caminho em uso e não pode ser removido",
  HABILIDADE_NOT_FOUND: "Habilidade não encontrada",
  HABILIDADE_NOME_DUPLICADO: "Já existe uma habilidade com este nome",
  HABILIDADE_EM_USO: "Habilidade em uso e não pode ser removida",
  TIPO_GRAU_NOT_FOUND: "Tipo de grau não encontrado",
  TIPO_GRAU_CODIGO_DUPLICADO: "Já existe tipo de grau com este código",
  TIPO_GRAU_EM_USO: "Tipo de grau em uso e não pode ser removido",
  PROFICIENCIA_NOT_FOUND: "Proficiência não encontrada",
  PROFICIENCIA_NOME_DUPLICADO: "Já existe proficiência com este nome",
  PROFICIENCIA_EM_USO: "Proficiência em uso e não pode ser removida",
  CONDICAO_NOT_FOUND: "Condição não encontrada",
  CONDICAO_NOME_DUPLICADO: "Já existe condição com este nome",
  CONDICAO_EM_USO: "Condição em uso e não pode ser removida",

  // GENÉRICOS
  VALIDATION_ERROR: "Erro de validação",
  FIELD_REQUIRED: "Existe campo obrigatório faltando",
  INVALID_FORMAT: "Existe campo com formato inválido",
  OUT_OF_RANGE: "Existe campo fora do intervalo permitido",
  DUPLICATE_VALUES: "Existem valores duplicados onde não deveria",
  UNKNOWN_ERROR: "Erro desconhecido",
  CHAR_NOT_FOUND: "Personagem não encontrado",
  CHAR_INSUFFICIENT_POINTS: "Pontos insuficientes para executar a ação",
  DB_UNIQUE_VIOLATION: "Conflito de dados (valor único duplicado)",
  DB_FOREIGN_KEY_VIOLATION: "Referência inválida para registro relacionado",
  DB_RECORD_NOT_FOUND: "Registro referenciado não encontrado",
  DB_REQUIRED_RELATION: "Relação obrigatória foi violada",
  DB_VALIDATION_ERROR: "Validação de banco de dados falhou",
  DB_INTERNAL_ERROR: "Erro interno de banco de dados",
  FONTE_SUPLEMENTO_OBRIGATORIA:
    "A fonte deve ser SUPLEMENTO quando suplementoId for informado.",
  SUPLEMENTO_ID_OBRIGATORIO:
    "suplementoId é obrigatório quando a fonte for SUPLEMENTO.",
  REFERENCIA_IMPORTACAO_INVALIDA:
    "Não foi possível resolver uma referência do arquivo importado.",
  INTERNAL_ERROR: "Erro interno do servidor. Tente novamente.",
  NOT_FOUND: "Recurso não encontrado",
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  401: "Sua sessão expirou. Faça login novamente.",
  403: "Você não tem permissão para executar esta ação.",
  404: "Recurso não encontrado.",
  409: "Conflito de dados. Revise as informações e tente novamente.",
  422: "Dados inválidos. Revise os campos informados.",
  500: "Erro interno do servidor. Tente novamente em instantes.",
};

/**
 * ✅ Traduz código de erro do backend para mensagem amigável
 */
export function traduzirErro(
  code: string | undefined,
  fallbackMessage: string,
  status?: number,
): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (status && HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }

  return fallbackMessage;
}

/**
 * ✅ Extrai mensagem de erro estruturada do backend
 */
export function extrairMensagemErro(error: unknown): string {
  const err =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const response =
    err.response && typeof err.response === "object"
      ? (err.response as Record<string, unknown>)
      : null;
  const body =
    err.body && typeof err.body === "object"
      ? (err.body as Record<string, unknown>)
      : null;
  const status = Number(
    err.status || response?.status || body?.statusCode || 0,
  );
  const code = typeof err.code === "string" ? err.code : undefined;

  if (body) {
    const apiBody = body as ApiErrorBody;

    if (apiBody.code) {
      const mensagemTraduzida = traduzirErro(apiBody.code, "", status);
      if (mensagemTraduzida) return mensagemTraduzida;
    }

    if (apiBody.message) {
      if (Array.isArray(apiBody.message)) {
        return apiBody.message.join(", ");
      }
      return traduzirErro(apiBody.code, String(apiBody.message), status);
    }

    return traduzirErro(
      apiBody.code,
      "Ocorreu um erro. Tente novamente.",
      status,
    );
  }

  if (code === "ERR_NETWORK" || !response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (typeof err.message === "string") {
    return traduzirErro(code, err.message, status);
  }

  return traduzirErro(code, "Ocorreu um erro. Tente novamente.", status);
}

export type ContextoErroApi = {
  status?: number;
  code?: string;
  method?: string;
  endpoint?: string;
  requestId?: string;
};

function valorHeaderComoString(
  headers: Record<string, unknown> | null,
  chaves: string[],
): string | undefined {
  if (!headers) return undefined;

  for (const chave of chaves) {
    const valor = headers[chave];
    if (typeof valor === "string" && valor.trim()) {
      return valor.trim();
    }

    if (Array.isArray(valor) && valor.length > 0 && typeof valor[0] === "string") {
      return valor[0].trim();
    }
  }

  return undefined;
}

export function extrairContextoErro(error: unknown): ContextoErroApi {
  const err =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const response =
    err.response && typeof err.response === "object"
      ? (err.response as Record<string, unknown>)
      : null;
  const body =
    err.body && typeof err.body === "object"
      ? (err.body as Record<string, unknown>)
      : null;
  const config =
    response?.config && typeof response.config === "object"
      ? (response.config as Record<string, unknown>)
      : null;
  const headers =
    response?.headers && typeof response.headers === "object"
      ? (response.headers as Record<string, unknown>)
      : null;
  const details =
    body?.details && typeof body.details === "object"
      ? (body.details as Record<string, unknown>)
      : null;

  const statusRaw = Number(err.status || response?.status || body?.statusCode || 0);
  const status = Number.isFinite(statusRaw) && statusRaw > 0 ? statusRaw : undefined;

  const code =
    typeof err.code === "string"
      ? err.code
      : typeof body?.code === "string"
        ? body.code
        : undefined;

  const methodRaw =
    typeof err.method === "string"
      ? err.method
      : typeof config?.method === "string"
        ? config.method
        : undefined;
  const method = methodRaw ? methodRaw.toUpperCase() : undefined;

  const endpoint =
    typeof err.endpoint === "string"
      ? err.endpoint
      : typeof config?.url === "string"
        ? config.url
        : undefined;

  const requestIdFromHeaders = valorHeaderComoString(headers, [
    "x-request-id",
    "x-correlation-id",
    "X-Request-Id",
    "X-Correlation-Id",
  ]);
  const requestIdFromBody =
    typeof err.requestId === "string"
      ? err.requestId
      : typeof details?.requestId === "string"
        ? details.requestId
        : undefined;

  return {
    status,
    code,
    method,
    endpoint,
    requestId: requestIdFromHeaders ?? requestIdFromBody,
  };
}

type FormatarErroComContextoOptions = {
  incluirStatus?: boolean;
  incluirCode?: boolean;
  incluirEndpoint?: boolean;
  incluirRequestId?: boolean;
};

export function formatarErroComContexto(
  mensagemBase: string,
  error: unknown,
  options: FormatarErroComContextoOptions = {},
): string {
  const contexto = extrairContextoErro(error);
  const partes: string[] = [];

  if (options.incluirStatus !== false && contexto.status) {
    partes.push(`status ${contexto.status}`);
  }

  if (options.incluirCode !== false && contexto.code) {
    partes.push(`code ${contexto.code}`);
  }

  if (options.incluirEndpoint && contexto.endpoint) {
    const endpointComMetodo = contexto.method
      ? `${contexto.method} ${contexto.endpoint}`
      : contexto.endpoint;
    partes.push(endpointComMetodo);
  }

  if (options.incluirRequestId && contexto.requestId) {
    partes.push(`requestId ${contexto.requestId}`);
  }

  if (partes.length === 0) {
    return mensagemBase;
  }

  return `${mensagemBase} (${partes.join(" | ")})`;
}


