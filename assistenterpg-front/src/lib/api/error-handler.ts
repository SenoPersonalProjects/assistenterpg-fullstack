// src/lib/api/error-handler.ts
import type { ApiErrorBody } from "@/lib/types"; // âœ… ATUALIZADO

/**
 * âœ… Mapeamento de cÃ³digos de erro para mensagens amigÃ¡veis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // AUTH
  CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  AUTH_CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  TOKEN_INVALIDO: "Sua sessÃ£o expirou. FaÃ§a login novamente.",
  USUARIO_TOKEN_NAO_ENCONTRADO:
    "Sua conta nÃ£o foi encontrada. FaÃ§a login novamente.",
  USUARIO_NAO_AUTENTICADO:
    "VocÃª precisa fazer login para acessar esta pÃ¡gina",
  ACESSO_NEGADO: "VocÃª nÃ£o tem permissÃ£o para acessar este recurso",

  // USUÃRIO
  USUARIO_NOT_FOUND: "UsuÃ¡rio nÃ£o encontrado",
  USUARIO_JA_MEMBRO: "Este usuÃ¡rio jÃ¡ Ã© membro da campanha.",
  USUARIO_EMAIL_DUPLICADO: "Este email jÃ¡ estÃ¡ em uso",
  USUARIO_EMAIL_NOT_FOUND: "Email nÃ£o encontrado",
  USUARIO_APELIDO_NOT_FOUND: "UsuÃ¡rio nÃ£o encontrado",
  USUARIO_SENHA_INCORRETA: "Senha incorreta",

  // PERSONAGEM BASE
  PERSONAGEM_BASE_NOT_FOUND: "Personagem nÃ£o encontrado",
  UPDATE_PERSONAGEM_FAILED: "Falha ao atualizar personagem",
  ATTRIBUTE_NOT_INTEGER: "Valor de atributo invÃ¡lido (deve ser inteiro)",
  ATTRIBUTE_OUT_OF_RANGE:
    "Valor de atributo invÃ¡lido (deve estar entre 0 e 7)",
  INVALID_ATTRIBUTE_SUM: "Soma de atributos invÃ¡lida para este nÃ­vel",
  INVALID_EA_KEY_ATTRIBUTE:
    "Atributo-chave de Energia AmaldiÃ§oada deve ser INT ou PRE",

  TOO_MANY_PASSIVES:
    "VocÃª pode selecionar no mÃ¡ximo 2 atributos para passivas",
  INELIGIBLE_PASSIVES: "Um ou mais atributos selecionados nÃ£o sÃ£o elegÃ­veis",
  PASSIVES_CHOICE_REQUIRED:
    "VocÃª deve escolher exatamente 2 atributos dentre os elegÃ­veis",
  PASSIVE_REQUIREMENT_NOT_MET: "Passiva nÃ£o atende aos requisitos de atributo",
  DUPLICATE_PASSIVES: "VocÃª selecionou passivas duplicadas",
  TOO_MANY_PASSIVE_ATTRIBUTES:
    "VocÃª sÃ³ pode ter passivas em 2 atributos diferentes",
  PASSIVE_NOT_FOUND: "Passiva nÃ£o encontrada",
  PASSIVES_CATALOG_INCONSISTENT:
    "CatÃ¡logo de passivas inconsistente; tente novamente mais tarde",
  INTELLECT_PASSIVE_CONFIG_INVALID:
    "ConfiguraÃ§Ã£o de passiva de intelecto invÃ¡lida",
  INTELLECT_PASSIVE_SKILL_NOT_FOUND:
    "PerÃ­cia de passiva de intelecto nÃ£o encontrada",
  INTELLECT_PASSIVE_TRAINING_REQUIRED:
    "Passiva de intelecto requer escolha de perÃ­cia",
  INTELLECT_PASSIVE_GRADE_EXCEEDS_MAX:
    "Passiva de intelecto ultrapassou o grau mÃ¡ximo permitido",

  PERICIAS_LIVRES_EXCEDEM_LIMITE: "VocÃª selecionou perÃ­cias livres demais",
  GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL:
    "VocÃª distribuiu graus de aprimoramento alÃ©m do permitido",

  GRADE_NOT_INTEGER: "Valor de grau de aprimoramento invÃ¡lido (inteiro)",
  GRADE_OUT_OF_RANGE: "Valor de grau de aprimoramento invÃ¡lido (0-5)",
  GRADE_EXCEEDS_MAX_WITH_BONUS:
    "Grau excede o mÃ¡ximo com os bÃ´nus de habilidades",
  GRADE_EXCEEDS_MAX_WITH_POWERS:
    "Grau excede o mÃ¡ximo com os bÃ´nus de poderes",
  TRAINING_LEVEL_INVALID: "NÃ­vel invÃ¡lido para melhoria de treinamento",
  TRAINING_EXCEEDS_IMPROVEMENTS:
    "Quantidade de melhorias de treinamento excede o permitido",
  TRAINING_LEVEL_REQUIREMENT:
    "Requisito de nÃ­vel para treinamento nÃ£o atendido",
  TRAINING_SKILL_NOT_FOUND: "PerÃ­cia de treinamento nÃ£o encontrada",

  CLASS_NOT_FOUND: "Classe nÃ£o encontrada",
  CLAN_NOT_FOUND: "ClÃ£ nÃ£o encontrado",
  ORIGEM_NOT_FOUND: "Origem nÃ£o encontrada",
  ORIGIN_NOT_FOUND: "Origem nÃ£o encontrada",
  ORIGIN_REQUIRES_GREAT_CLAN: "Esta origem requer um dos trÃªs grandes clÃ£s",
  ORIGIN_REQUIRES_HEREDITARY_TECHNIQUE:
    "Esta origem exige uma tÃ©cnica hereditÃ¡ria",
  ORIGIN_BLOCKS_HEREDITARY_TECHNIQUE:
    "Esta origem bloqueia tÃ©cnica hereditÃ¡ria",
  INNATE_TECHNIQUE_NOT_FOUND: "TÃ©cnica inata nÃ£o encontrada",
  INNATE_TECHNIQUE_INVALID_TYPE: "TÃ©cnica deve ser do tipo INATA",
  HEREDITARY_TECHNIQUE_INCOMPATIBLE:
    "TÃ©cnica hereditÃ¡ria incompatÃ­vel com o clÃ£ escolhido",

  SKILL_NOT_FOUND: "PerÃ­cia nÃ£o encontrada",
  PERICIA_NOT_FOUND: "PerÃ­cia nÃ£o encontrada",
  ORIGIN_SKILL_MISSING_GROUP:
    "Grupo de escolha de perÃ­cia da origem invÃ¡lido",
  ORIGIN_SKILL_GROUP_INVALID:
    "Escolha de grupo de perÃ­cia da origem invÃ¡lida",
  ORIGIN_SKILL_CHOICE_INVALID: "PerÃ­cia escolhida nÃ£o pertence Ã  origem",
  CLASS_SKILL_MISSING_GROUP: "Grupo de escolha de perÃ­cia da classe invÃ¡lido",
  CLASS_SKILL_GROUP_INVALID: "Escolha de grupo de perÃ­cia da classe invÃ¡lida",
  CLASS_SKILL_CHOICE_INVALID: "PerÃ­cia escolhida nÃ£o pertence Ã  classe",
  CLASS_VALUES_NOT_DEFINED: "ConfiguraÃ§Ã£o de valores da classe incompleta",
  JUJUTSU_SKILL_NOT_FOUND: "PerÃ­cia Jujutsu nÃ£o encontrada no catÃ¡logo",
  TRAINING_SKILL_UNTRAINED:
    "PerÃ­cia precisa estar treinada para receber melhoria",
  TRAINING_INVALID_PROGRESSION: "Melhoria de grau de treinamento invÃ¡lida",

  POWER_LEVEL_REQUIREMENT: "Poder genÃ©rico requer nÃ­vel mÃ­nimo",
  POWER_NOT_REPEATABLE: "Este poder nÃ£o pode ser escolhido mÃºltiplas vezes",
  POWERS_EXCEED_SLOTS: "VocÃª selecionou poderes demais para este nÃ­vel",
  POWERS_NOT_FOUND: "Um ou mais poderes genÃ©ricos nÃ£o foram encontrados",
  POWER_REQUIRES_CHOICE: "Este poder exige uma escolha/configuraÃ§Ã£o",
  POWER_CONFIG_INVALID: "ConfiguraÃ§Ã£o de poder invÃ¡lida",
  POWER_SKILL_REQUIREMENT: "Requisito de perÃ­cia para poder nÃ£o atendido",
  POWER_ATTRIBUTE_REQUIREMENT: "Requisito de atributo para poder nÃ£o atendido",
  POWER_GRADE_REQUIREMENT: "Requisito de grau para poder nÃ£o atendido",
  POWER_POWER_REQUIREMENT:
    "Este poder exige outro poder previamente selecionado",
  POWER_SKILL_MAX_REACHED: "PerÃ­cia jÃ¡ estÃ¡ no limite mÃ¡ximo",
  POWER_SKILL_LEVEL_LIMIT:
    "NÃ­vel atual nÃ£o permite elevar mais essa perÃ­cia",
  PROFICIENCY_NOT_FOUND: "ProficiÃªncia nÃ£o encontrada",

  PATH_NOT_FOUND: "Trilha nÃ£o encontrada",
  PATH_REQUIREMENT_NOT_MET: "Requisito de trilha nÃ£o atendido",
  WAY_NOT_FOUND: "Caminho nÃ£o encontrado",
  WAY_REQUIRES_PATH: "Selecione uma trilha antes de escolher um caminho",
  PATH_INCOMPATIBLE_WITH_CLASS: "Trilha incompatÃ­vel com a classe",
  WAY_INCOMPATIBLE_WITH_PATH: "Caminho incompatÃ­vel com a trilha",

  // TÃ‰CNICAS AMALDIÃ‡OADAS
  TECNICA_NOT_FOUND: "TÃ©cnica amaldiÃ§oada nÃ£o encontrada",
  TECNICA_EM_USO: "TÃ©cnica estÃ¡ sendo usada e nÃ£o pode ser deletada",
  TECNICA_NOME_DUPLICADO: "JÃ¡ existe uma tÃ©cnica com este nome",
  TECNICA_CODIGO_OU_NOME_DUPLICADO:
    "JÃ¡ existe uma tÃ©cnica com este cÃ³digo ou nome",
  TECNICA_HEREDITARIA_SEM_CLA:
    "TÃ©cnicas hereditÃ¡rias precisam de pelo menos um clÃ£",
  TECNICA_NAO_INATA_HEREDITARIA:
    "Apenas tÃ©cnicas INATAS podem ser hereditÃ¡rias",
  TECNICA_SUPLEMENTO_NOT_FOUND:
    "Suplemento informado para tÃ©cnica nÃ£o existe",
  TECNICA_CLA_NOT_FOUND: "ClÃ£ informado para tÃ©cnica nÃ£o existe",
  HABILIDADE_TECNICA_NOT_FOUND: "Habilidade de tÃ©cnica nÃ£o encontrada",
  HABILIDADE_CODIGO_DUPLICADO:
    "JÃ¡ existe uma habilidade de tÃ©cnica com este cÃ³digo",
  VARIACAO_HABILIDADE_NOT_FOUND: "VariaÃ§Ã£o de habilidade nÃ£o encontrada",

  // EQUIPAMENTOS/INVENTÃRIO
  EQUIPAMENTO_NOT_FOUND: "Equipamento nÃ£o encontrado",
  EQUIP_NOT_FOUND: "Equipamento nÃ£o encontrado",
  EQUIPAMENTO_CODIGO_DUPLICADO: "JÃ¡ existe um equipamento com este cÃ³digo",
  EQUIPAMENTO_EM_USO: "Este equipamento estÃ¡ em uso e nÃ£o pode ser removido",
  INVENTARIO_PERSONAGEM_NOT_FOUND: "Personagem do inventÃ¡rio nÃ£o encontrado",
  INVENTARIO_SEM_PERMISSAO: "VocÃª nÃ£o tem permissÃ£o para este inventÃ¡rio",
  INVENTARIO_ITEM_NOT_FOUND: "Item do inventÃ¡rio nÃ£o encontrado",
  INVENTARIO_EQUIPAMENTO_NOT_FOUND:
    "Equipamento nÃ£o encontrado no inventÃ¡rio",
  INVENTARIO_CAPACIDADE_EXCEDIDA:
    "Limite mÃ¡ximo de capacidade do inventÃ¡rio excedido",
  INVENTARIO_ESPACOS_INSUFICIENTES: "EspaÃ§o insuficiente no inventÃ¡rio",
  INV_INSUFFICIENT_SPACE: "EspaÃ§o insuficiente no inventÃ¡rio",
  INVENTARIO_GRAU_XAMA_EXCEDIDO: "Limites do Grau XamÃ£ foram excedidos",
  INVENTARIO_LIMITE_VESTIR_EXCEDIDO:
    "Limites de itens vestidos foram excedidos",
  INVENTARIO_MODIFICACAO_NOT_FOUND: "ModificaÃ§Ã£o nÃ£o encontrada",
  INVENTARIO_MODIFICACAO_INVALIDA: "Uma ou mais modificaÃ§Ãµes sÃ£o invÃ¡lidas",
  INVENTARIO_MODIFICACAO_INCOMPATIVEL:
    "ModificaÃ§Ã£o incompatÃ­vel com o equipamento",
  INVENTARIO_MODIFICACAO_DUPLICADA: "Este item jÃ¡ possui essa modificaÃ§Ã£o",
  INVENTARIO_MODIFICACAO_NAO_APLICADA:
    "Essa modificaÃ§Ã£o nÃ£o estÃ¡ aplicada no item",

  // ALIASES LEGADOS (mantidos por compatibilidade)
  ITEM_INVENTARIO_NOT_FOUND: "Item do inventÃ¡rio nÃ£o encontrado",
  ESPACOS_INSUFICIENTES: "EspaÃ§o insuficiente no inventÃ¡rio",
  GRAU_XAMA_LIMITE_EXCEDIDO:
    "Limite do Grau XamÃ£ excedido para esta categoria",

  // CAMPANHAS
  CAMPANHA_NOT_FOUND: "Campanha nÃ£o encontrada",
  CAMP_NOT_FOUND: "Campanha nÃ£o encontrada",
  CAMPANHA_ACESSO_NEGADO: "VocÃª nÃ£o tem acesso a esta campanha",
  CAMP_USER_ALREADY_MEMBER: "UsuÃ¡rio jÃ¡ Ã© membro desta campanha",
  CAMPANHA_APENAS_DONO: "Apenas o dono da campanha pode executar esta aÃ§Ã£o",
  CONVITE_NOT_FOUND: "Convite nÃ£o encontrado",
  CONVITE_INVALIDO: "Convite invÃ¡lido ou jÃ¡ utilizado",
  CONVITE_NAO_PERTENCE_USUARIO: "Este convite nÃ£o pertence ao usuÃ¡rio logado",

  // MODIFICAÃ‡Ã•ES
  MODIFICACAO_NOT_FOUND: "ModificaÃ§Ã£o nÃ£o encontrada",
  MODIFICACAO_CODIGO_DUPLICADO: "JÃ¡ existe uma modificaÃ§Ã£o com este cÃ³digo",
  MODIFICACAO_SUPLEMENTO_NOT_FOUND:
    "Suplemento informado para modificaÃ§Ã£o nÃ£o existe",
  MODIFICACAO_FONTE_INVALIDA:
    "Ao informar suplementoId, a fonte deve ser SUPLEMENTO",
  MODIFICACAO_EQUIPAMENTOS_INVALIDOS:
    "Um ou mais equipamentos vinculados Ã  modificaÃ§Ã£o nÃ£o existem",
  MODIFICACAO_EM_USO:
    "Esta modificaÃ§Ã£o estÃ¡ em uso e nÃ£o pode ser removida",
  MODIFICACAO_EQUIPAMENTO_NOT_FOUND:
    "Equipamento informado para validar modificaÃ§Ãµes nÃ£o existe",

  // SUPLEMENTOS / HOMEBREWS / COMPENDIO
  SUPLEMENTO_NOT_FOUND: "Suplemento nÃ£o encontrado",
  SUPLEMENTO_CODIGO_DUPLICADO: "JÃ¡ existe um suplemento com este cÃ³digo",
  SUPLEMENTO_COM_CONTEUDO_VINCULADO:
    "Suplemento possui conteÃºdo vinculado e nÃ£o pode ser removido",
  SUPLEMENTO_NAO_PUBLICADO: "Apenas suplementos publicados podem ser ativados",
  SUPLEMENTO_JA_ATIVO: "Este suplemento jÃ¡ estÃ¡ ativo para o usuÃ¡rio",
  SUPLEMENTO_NAO_ATIVO: "Este suplemento nÃ£o estÃ¡ ativo para o usuÃ¡rio",
  HOMEBREW_NOT_FOUND: "Homebrew nÃ£o encontrado",
  HB_NOT_FOUND: "Homebrew nÃ£o encontrado",
  HB_ALREADY_PUBLISHED: "Homebrew jÃ¡ estÃ¡ publicado",
  HB_INVALID_DATA: "Dados do homebrew sÃ£o invÃ¡lidos",
  HB_UNSUPPORTED_TYPE: "Tipo de homebrew nÃ£o suportado",
  HOMEBREW_JA_PUBLICADO: "Homebrew jÃ¡ estÃ¡ publicado",
  HOMEBREW_DADOS_INVALIDOS: "Dados do homebrew sÃ£o invÃ¡lidos",
  HOMEBREW_SEM_PERMISSAO:
    "VocÃª nÃ£o tem permissÃ£o para executar esta aÃ§Ã£o no homebrew",
  COMPENDIO_CATEGORIA_NOT_FOUND: "Categoria do compÃªndio nÃ£o encontrada",
  COMPENDIO_CATEGORIA_DUPLICADA:
    "JÃ¡ existe categoria com este cÃ³digo no compÃªndio",
  COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS:
    "NÃ£o Ã© possÃ­vel remover categoria com subcategorias",
  COMPENDIO_SUBCATEGORIA_NOT_FOUND:
    "Subcategoria do compÃªndio nÃ£o encontrada",
  COMPENDIO_SUBCATEGORIA_DUPLICADA:
    "JÃ¡ existe subcategoria com este cÃ³digo no compÃªndio",
  COMPENDIO_SUBCATEGORIA_COM_ARTIGOS:
    "NÃ£o Ã© possÃ­vel remover subcategoria com artigos",
  COMPENDIO_ARTIGO_NOT_FOUND: "Artigo do compÃªndio nÃ£o encontrado",
  COMPENDIO_ARTIGO_DUPLICADO:
    "JÃ¡ existe artigo com este cÃ³digo no compÃªndio",
  COMPENDIO_BUSCA_INVALIDA: "A busca no compÃªndio Ã© invÃ¡lida",

  // CATALOGOS MENORES / PROGRESSAO
  CLASSE_NOT_FOUND: "Classe nÃ£o encontrada",
  CLASSE_NOME_DUPLICADO: "JÃ¡ existe uma classe com este nome",
  CLASSE_EM_USO: "Classe em uso e nÃ£o pode ser removida",
  CLA_NOT_FOUND: "ClÃ£ nÃ£o encontrado",
  CLA_NOME_DUPLICADO: "JÃ¡ existe um clÃ£ com este nome",
  CLA_TECNICAS_INVALIDAS:
    "Uma ou mais tÃ©cnicas herdadas informadas para o clÃ£ sÃ£o invÃ¡lidas",
  CLA_EM_USO: "ClÃ£ em uso e nÃ£o pode ser removido",
  ORIGEM_NOME_DUPLICADO: "JÃ¡ existe uma origem com este nome",
  ORIGEM_PERICIAS_INVALIDAS:
    "Uma ou mais perÃ­cias vinculadas Ã  origem nÃ£o existem",
  ORIGEM_HABILIDADES_INVALIDAS:
    "Uma ou mais habilidades vinculadas Ã  origem nÃ£o existem",
  ORIGEM_EM_USO: "Origem em uso e nÃ£o pode ser removida",
  TRILHA_NOT_FOUND: "Trilha nÃ£o encontrada",
  TRILHA_CLASSE_NOT_FOUND: "Classe vinculada Ã  trilha nÃ£o encontrada",
  TRILHA_NOME_DUPLICADO: "JÃ¡ existe uma trilha com este nome",
  TRILHA_EM_USO: "Trilha em uso e nÃ£o pode ser removida",
  CAMINHO_NOT_FOUND: "Caminho nÃ£o encontrado",
  CAMINHO_NOME_DUPLICADO: "JÃ¡ existe um caminho com este nome",
  CAMINHO_EM_USO: "Caminho em uso e nÃ£o pode ser removido",
  HABILIDADE_NOT_FOUND: "Habilidade nÃ£o encontrada",
  HABILIDADE_NOME_DUPLICADO: "JÃ¡ existe uma habilidade com este nome",
  HABILIDADE_EM_USO: "Habilidade em uso e nÃ£o pode ser removida",
  TIPO_GRAU_NOT_FOUND: "Tipo de grau nÃ£o encontrado",
  TIPO_GRAU_CODIGO_DUPLICADO: "JÃ¡ existe tipo de grau com este cÃ³digo",
  TIPO_GRAU_EM_USO: "Tipo de grau em uso e nÃ£o pode ser removido",
  PROFICIENCIA_NOT_FOUND: "ProficiÃªncia nÃ£o encontrada",
  PROFICIENCIA_NOME_DUPLICADO: "JÃ¡ existe proficiÃªncia com este nome",
  PROFICIENCIA_EM_USO: "ProficiÃªncia em uso e nÃ£o pode ser removida",
  CONDICAO_NOT_FOUND: "CondiÃ§Ã£o nÃ£o encontrada",
  CONDICAO_NOME_DUPLICADO: "JÃ¡ existe condiÃ§Ã£o com este nome",
  CONDICAO_EM_USO: "CondiÃ§Ã£o em uso e nÃ£o pode ser removida",

  // GENÃ‰RICOS
  VALIDATION_ERROR: "Erro de validaÃ§Ã£o",
  FIELD_REQUIRED: "Existe campo obrigatÃ³rio faltando",
  INVALID_FORMAT: "Existe campo com formato invÃ¡lido",
  OUT_OF_RANGE: "Existe campo fora do intervalo permitido",
  DUPLICATE_VALUES: "Existem valores duplicados onde nÃ£o deveria",
  UNKNOWN_ERROR: "Erro desconhecido",
  CHAR_NOT_FOUND: "Personagem nÃ£o encontrado",
  CHAR_INSUFFICIENT_POINTS: "Pontos insuficientes para executar a aÃ§Ã£o",
  DB_UNIQUE_VIOLATION: "Conflito de dados (valor Ãºnico duplicado)",
  DB_FOREIGN_KEY_VIOLATION: "ReferÃªncia invÃ¡lida para registro relacionado",
  DB_RECORD_NOT_FOUND: "Registro referenciado nÃ£o encontrado",
  DB_REQUIRED_RELATION: "RelaÃ§Ã£o obrigatÃ³ria foi violada",
  DB_VALIDATION_ERROR: "ValidaÃ§Ã£o de banco de dados falhou",
  DB_INTERNAL_ERROR: "Erro interno de banco de dados",
  FONTE_SUPLEMENTO_OBRIGATORIA:
    "A fonte deve ser SUPLEMENTO quando suplementoId for informado.",
  SUPLEMENTO_ID_OBRIGATORIO:
    "suplementoId Ã© obrigatÃ³rio quando a fonte for SUPLEMENTO.",
  REFERENCIA_IMPORTACAO_INVALIDA:
    "NÃ£o foi possÃ­vel resolver uma referÃªncia do arquivo importado.",
  INTERNAL_ERROR: "Erro interno do servidor. Tente novamente.",
  NOT_FOUND: "Recurso nÃ£o encontrado",
  NETWORK_ERROR: "Erro de conexÃ£o. Verifique sua internet.",
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  401: "Sua sessÃ£o expirou. FaÃ§a login novamente.",
  403: "VocÃª nÃ£o tem permissÃ£o para executar esta aÃ§Ã£o.",
  404: "Recurso nÃ£o encontrado.",
  409: "Conflito de dados. Revise as informaÃ§Ãµes e tente novamente.",
  422: "Dados invÃ¡lidos. Revise os campos informados.",
  500: "Erro interno do servidor. Tente novamente em instantes.",
};

/**
 * âœ… Traduz cÃ³digo de erro do backend para mensagem amigÃ¡vel
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
 * âœ… Extrai mensagem de erro estruturada do backend
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
