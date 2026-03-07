// src/lib/api/error-handler.ts
import type { ApiErrorBody } from '@/lib/types'; // âœ… ATUALIZADO

/**
 * âœ… Mapeamento de cÃ³digos de erro para mensagens amigÃ¡veis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // AUTH
  CREDENCIAIS_INVALIDAS: 'Email ou senha incorretos',
  AUTH_CREDENCIAIS_INVALIDAS: 'Email ou senha incorretos',
  TOKEN_INVALIDO: 'Sua sessÃ£o expirou. FaÃ§a login novamente.',
  USUARIO_TOKEN_NAO_ENCONTRADO: 'Sua conta nÃ£o foi encontrada. FaÃ§a login novamente.',
  USUARIO_NAO_AUTENTICADO: 'VocÃª precisa fazer login para acessar esta pÃ¡gina',
  ACESSO_NEGADO: 'VocÃª nÃ£o tem permissÃ£o para acessar este recurso',

  // USUÃRIO
  USUARIO_NOT_FOUND: 'UsuÃ¡rio nÃ£o encontrado',
  USUARIO_EMAIL_DUPLICADO: 'Este email jÃ¡ estÃ¡ em uso',
  USUARIO_EMAIL_NOT_FOUND: 'Email nÃ£o encontrado',
  USUARIO_APELIDO_NOT_FOUND: 'UsuÃ¡rio nÃ£o encontrado',
  USUARIO_SENHA_INCORRETA: 'Senha incorreta',

  // PERSONAGEM BASE
  PERSONAGEM_BASE_NOT_FOUND: 'Personagem nÃ£o encontrado',
  ATTRIBUTE_OUT_OF_RANGE: 'Valor de atributo invÃ¡lido (deve estar entre 0 e 7)',
  INVALID_ATTRIBUTE_SUM: 'Soma de atributos invÃ¡lida para este nÃ­vel',
  INVALID_EA_KEY_ATTRIBUTE: 'Atributo-chave de Energia AmaldiÃ§oada deve ser INT ou PRE',

  TOO_MANY_PASSIVES: 'VocÃª pode selecionar no mÃ¡ximo 2 atributos para passivas',
  INELIGIBLE_PASSIVES: 'Um ou mais atributos selecionados nÃ£o sÃ£o elegÃ­veis',
  PASSIVES_CHOICE_REQUIRED: 'VocÃª deve escolher exatamente 2 atributos dentre os elegÃ­veis',
  PASSIVE_REQUIREMENT_NOT_MET: 'Passiva nÃ£o atende aos requisitos de atributo',
  DUPLICATE_PASSIVES: 'VocÃª selecionou passivas duplicadas',
  TOO_MANY_PASSIVE_ATTRIBUTES: 'VocÃª sÃ³ pode ter passivas em 2 atributos diferentes',
  PASSIVE_NOT_FOUND: 'Passiva nÃ£o encontrada',

  PERICIAS_LIVRES_EXCEDEM_LIMITE: 'VocÃª selecionou perÃ­cias livres demais',
  GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL: 'VocÃª distribuiu graus de aprimoramento alÃ©m do permitido',

  GRADE_OUT_OF_RANGE: 'Valor de grau de aprimoramento invÃ¡lido (0-5)',
  GRADE_EXCEEDS_MAX_WITH_BONUS: 'Grau excede o mÃ¡ximo com os bÃ´nus de habilidades',

  CLASS_NOT_FOUND: 'Classe nÃ£o encontrada',
  CLAN_NOT_FOUND: 'ClÃ£ nÃ£o encontrado',
  ORIGIN_NOT_FOUND: 'Origem nÃ£o encontrada',
  ORIGIN_REQUIRES_GREAT_CLAN: 'Esta origem requer um dos trÃªs grandes clÃ£s',
  INNATE_TECHNIQUE_NOT_FOUND: 'TÃ©cnica inata nÃ£o encontrada',
  INNATE_TECHNIQUE_INVALID_TYPE: 'TÃ©cnica deve ser do tipo INATA',
  HEREDITARY_TECHNIQUE_INCOMPATIBLE: 'TÃ©cnica hereditÃ¡ria incompatÃ­vel com o clÃ£ escolhido',

  SKILL_NOT_FOUND: 'PerÃ­cia nÃ£o encontrada',
  TRAINING_SKILL_UNTRAINED: 'PerÃ­cia precisa estar treinada para receber melhoria',
  TRAINING_INVALID_PROGRESSION: 'Melhoria de grau de treinamento invÃ¡lida',

  POWER_LEVEL_REQUIREMENT: 'Poder genÃ©rico requer nÃ­vel mÃ­nimo',
  POWER_NOT_REPEATABLE: 'Este poder nÃ£o pode ser escolhido mÃºltiplas vezes',
  POWERS_EXCEED_SLOTS: 'VocÃª selecionou poderes demais para este nÃ­vel',

  PATH_NOT_FOUND: 'Trilha nÃ£o encontrada',
  WAY_NOT_FOUND: 'Caminho nÃ£o encontrado',
  PATH_INCOMPATIBLE_WITH_CLASS: 'Trilha incompatÃ­vel com a classe',
  WAY_INCOMPATIBLE_WITH_PATH: 'Caminho incompatÃ­vel com a trilha',

  // TÃ‰CNICAS AMALDIÃ‡OADAS
  TECNICA_NOT_FOUND: 'TÃ©cnica amaldiÃ§oada nÃ£o encontrada',
  TECNICA_EM_USO: 'TÃ©cnica estÃ¡ sendo usada e nÃ£o pode ser deletada',
  TECNICA_NOME_DUPLICADO: 'JÃ¡ existe uma tÃ©cnica com este nome',

  // EQUIPAMENTOS/INVENTÃRIO
  EQUIPAMENTO_NOT_FOUND: 'Equipamento nÃ£o encontrado',
  ITEM_INVENTARIO_NOT_FOUND: 'Item do inventÃ¡rio nÃ£o encontrado',
  ESPACOS_INSUFICIENTES: 'EspaÃ§o insuficiente no inventÃ¡rio',
  GRAU_XAMA_LIMITE_EXCEDIDO: 'Limite do Grau XamÃ£ excedido para esta categoria',

  // CAMPANHAS
  CAMPANHA_NOT_FOUND: 'Campanha nÃ£o encontrada',
  CAMPANHA_ACESSO_NEGADO: 'VocÃª nÃ£o tem acesso a esta campanha',

  // GENÃ‰RICOS
  VALIDATION_ERROR: 'Erro de validaÃ§Ã£o',
  INTERNAL_ERROR: 'Erro interno do servidor. Tente novamente.',
  NOT_FOUND: 'Recurso nÃ£o encontrado',
  NETWORK_ERROR: 'Erro de conexÃ£o. Verifique sua internet.',
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  401: 'Sua sessÃ£o expirou. FaÃ§a login novamente.',
  403: 'VocÃª nÃ£o tem permissÃ£o para executar esta aÃ§Ã£o.',
  404: 'Recurso nÃ£o encontrado.',
  409: 'Conflito de dados. Revise as informaÃ§Ãµes e tente novamente.',
  422: 'Dados invÃ¡lidos. Revise os campos informados.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
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
  const err = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  const response =
    err.response && typeof err.response === 'object'
      ? (err.response as Record<string, unknown>)
      : null;
  const body =
    err.body && typeof err.body === 'object' ? (err.body as Record<string, unknown>) : null;
  const status = Number(err.status || response?.status || body?.statusCode || 0);
  const code = typeof err.code === 'string' ? err.code : undefined;

  if (body) {
    const apiBody = body as ApiErrorBody;

    if (apiBody.code) {
      const mensagemTraduzida = traduzirErro(apiBody.code, '', status);
      if (mensagemTraduzida) return mensagemTraduzida;
    }

    if (apiBody.message) {
      if (Array.isArray(apiBody.message)) {
        return apiBody.message.join(', ');
      }
      return traduzirErro(apiBody.code, String(apiBody.message), status);
    }

    return traduzirErro(apiBody.code, 'Ocorreu um erro. Tente novamente.', status);
  }

  if (code === 'ERR_NETWORK' || !response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (typeof err.message === 'string') {
    return traduzirErro(code, err.message, status);
  }

  return traduzirErro(code, 'Ocorreu um erro. Tente novamente.', status);
}


