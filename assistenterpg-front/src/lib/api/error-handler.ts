// src/lib/api/error-handler.ts
import type { ApiErrorBody } from '@/lib/types'; // ✅ ATUALIZADO

/**
 * ✅ Mapeamento de códigos de erro para mensagens amigáveis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // AUTH
  CREDENCIAIS_INVALIDAS: 'Email ou senha incorretos',
  AUTH_CREDENCIAIS_INVALIDAS: 'Email ou senha incorretos',
  TOKEN_INVALIDO: 'Sua sessão expirou. Faça login novamente.',
  USUARIO_TOKEN_NAO_ENCONTRADO: 'Sua conta não foi encontrada. Faça login novamente.',
  USUARIO_NAO_AUTENTICADO: 'Você precisa fazer login para acessar esta página',
  ACESSO_NEGADO: 'Você não tem permissão para acessar este recurso',

  // USUÁRIO
  USUARIO_NOT_FOUND: 'Usuário não encontrado',
  USUARIO_EMAIL_DUPLICADO: 'Este email já está em uso',
  USUARIO_EMAIL_NOT_FOUND: 'Email não encontrado',
  USUARIO_APELIDO_NOT_FOUND: 'Usuário não encontrado',
  USUARIO_SENHA_INCORRETA: 'Senha incorreta',

  // PERSONAGEM BASE
  PERSONAGEM_BASE_NOT_FOUND: 'Personagem não encontrado',
  ATTRIBUTE_OUT_OF_RANGE: 'Valor de atributo inválido (deve estar entre 0 e 7)',
  INVALID_ATTRIBUTE_SUM: 'Soma de atributos inválida para este nível',
  INVALID_EA_KEY_ATTRIBUTE: 'Atributo-chave de Energia Amaldiçoada deve ser INT ou PRE',

  TOO_MANY_PASSIVES: 'Você pode selecionar no máximo 2 atributos para passivas',
  INELIGIBLE_PASSIVES: 'Um ou mais atributos selecionados não são elegíveis',
  PASSIVES_CHOICE_REQUIRED: 'Você deve escolher exatamente 2 atributos dentre os elegíveis',
  PASSIVE_REQUIREMENT_NOT_MET: 'Passiva não atende aos requisitos de atributo',
  DUPLICATE_PASSIVES: 'Você selecionou passivas duplicadas',
  TOO_MANY_PASSIVE_ATTRIBUTES: 'Você só pode ter passivas em 2 atributos diferentes',
  PASSIVE_NOT_FOUND: 'Passiva não encontrada',

  PERICIAS_LIVRES_EXCEDEM_LIMITE: 'Você selecionou perícias livres demais',
  GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL: 'Você distribuiu graus de aprimoramento além do permitido',

  GRADE_OUT_OF_RANGE: 'Valor de grau de aprimoramento inválido (0-5)',
  GRADE_EXCEEDS_MAX_WITH_BONUS: 'Grau excede o máximo com os bônus de habilidades',

  CLASS_NOT_FOUND: 'Classe não encontrada',
  CLAN_NOT_FOUND: 'Clã não encontrado',
  ORIGIN_NOT_FOUND: 'Origem não encontrada',
  ORIGIN_REQUIRES_GREAT_CLAN: 'Esta origem requer um dos três grandes clãs',
  INNATE_TECHNIQUE_NOT_FOUND: 'Técnica inata não encontrada',
  INNATE_TECHNIQUE_INVALID_TYPE: 'Técnica deve ser do tipo INATA',
  HEREDITARY_TECHNIQUE_INCOMPATIBLE: 'Técnica hereditária incompatível com o clã escolhido',

  SKILL_NOT_FOUND: 'Perícia não encontrada',
  TRAINING_SKILL_UNTRAINED: 'Perícia precisa estar treinada para receber melhoria',
  TRAINING_INVALID_PROGRESSION: 'Melhoria de grau de treinamento inválida',

  POWER_LEVEL_REQUIREMENT: 'Poder genérico requer nível mínimo',
  POWER_NOT_REPEATABLE: 'Este poder não pode ser escolhido múltiplas vezes',
  POWERS_EXCEED_SLOTS: 'Você selecionou poderes demais para este nível',

  PATH_NOT_FOUND: 'Trilha não encontrada',
  WAY_NOT_FOUND: 'Caminho não encontrado',
  PATH_INCOMPATIBLE_WITH_CLASS: 'Trilha incompatível com a classe',
  WAY_INCOMPATIBLE_WITH_PATH: 'Caminho incompatível com a trilha',

  // TÉCNICAS AMALDIÇOADAS
  TECNICA_NOT_FOUND: 'Técnica amaldiçoada não encontrada',
  TECNICA_EM_USO: 'Técnica está sendo usada e não pode ser deletada',
  TECNICA_NOME_DUPLICADO: 'Já existe uma técnica com este nome',

  // EQUIPAMENTOS/INVENTÁRIO
  EQUIPAMENTO_NOT_FOUND: 'Equipamento não encontrado',
  ITEM_INVENTARIO_NOT_FOUND: 'Item do inventário não encontrado',
  ESPACOS_INSUFICIENTES: 'Espaço insuficiente no inventário',
  GRAU_XAMA_LIMITE_EXCEDIDO: 'Limite do Grau Xamã excedido para esta categoria',

  // CAMPANHAS
  CAMPANHA_NOT_FOUND: 'Campanha não encontrada',
  CAMPANHA_ACESSO_NEGADO: 'Você não tem acesso a esta campanha',

  // GENÉRICOS
  VALIDATION_ERROR: 'Erro de validação',
  INTERNAL_ERROR: 'Erro interno do servidor. Tente novamente.',
  NOT_FOUND: 'Recurso não encontrado',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para executar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito de dados. Revise as informações e tente novamente.',
  422: 'Dados inválidos. Revise os campos informados.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
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
export function extrairMensagemErro(error: any): string {
  const status = Number(error?.status || error?.response?.status || error?.body?.statusCode || 0);

  // 1️⃣ Se é ApiError com body
  if (error?.body && typeof error.body === 'object') {
    const body = error.body as ApiErrorBody;

    // 2️⃣ Tentar traduzir pelo código
    if (body.code) {
      const mensagemTraduzida = traduzirErro(body.code, '', status);
      if (mensagemTraduzida) return mensagemTraduzida;
    }

    // 3️⃣ Usar mensagem do backend
    if (body.message) {
      if (Array.isArray(body.message)) {
        return body.message.join(', ');
      }
      return traduzirErro(body.code, String(body.message), status);
    }

    return traduzirErro(body.code, 'Ocorreu um erro. Tente novamente.', status);
  }

  // 4️⃣ Se é erro de rede
  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // 5️⃣ Se tem mensagem direta
  if (error?.message && typeof error.message === 'string') {
    return traduzirErro(error?.code, error.message, status);
  }

  // 6️⃣ Fallback genérico
  return traduzirErro(error?.code, 'Ocorreu um erro. Tente novamente.', status);
}
