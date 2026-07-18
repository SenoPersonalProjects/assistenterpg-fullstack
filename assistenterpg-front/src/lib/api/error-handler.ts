// src/lib/api/error-handler.ts
import {
  extractRetryAfterSeconds,
  formatRateLimitMessage,
} from "./rate-limit";
import type {
  ApiErrorBody,
  ErrorSupportInfo,
  UserFacingError,
} from "@/lib/types"; // ✅ ATUALIZADO

/**
 * ✅ Mapeamento de códigos de erro para mensagens amigáveis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // AUTH
  CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  AUTH_CREDENCIAIS_INVALIDAS: "Email ou senha incorretos",
  TOKEN_INVALIDO: "Sua sessão expirou. Faça login novamente.",
  AUTH_TOKEN_INVALIDO_OU_EXPIRADO:
    "Link inválido ou expirado. Solicite um novo link.",
  AUTH_EMAIL_NAO_VERIFICADO:
    "Email ainda não verificado. Verifique sua caixa de entrada.",
  AUTH_RATE_LIMIT_EXCEEDED:
    "Muitas tentativas. Aguarde um momento antes de tentar novamente.",
  AUTH_AUSENTE: "Autenticação ausente. Entre novamente na sessão.",
  AUTH_INVALIDA: "Autenticação inválida. Entre novamente na sessão.",
  USUARIO_TOKEN_NAO_ENCONTRADO:
    "Sua conta não foi encontrada. Faça login novamente.",
  USUARIO_NAO_AUTENTICADO:
    "Você precisa fazer login para acessar esta página",
  ACESSO_NEGADO: "Você não tem permissão para acessar este recurso",

  // GOOGLE
  GOOGLE_CALENDAR_NOT_CONNECTED:
    "Conecte sua conta Google Calendar para continuar.",
  GOOGLE_OAUTH_CONFIG_MISSING:
    "A integração com Google não está disponível no momento.",
  GOOGLE_OAUTH_CALLBACK_INVALID:
    "O retorno da autenticação Google é inválido. Tente novamente.",
  GOOGLE_ID_TOKEN_MISSING:
    "O Google não retornou os dados de identidade necessários.",
  GOOGLE_PROFILE_INVALID: "O perfil retornado pelo Google é inválido.",
  GOOGLE_EMAIL_NOT_VERIFIED:
    "O email da conta Google ainda não foi verificado.",
  GOOGLE_OAUTH_STATE_USER_MISSING:
    "A autenticação Google não está vinculada a um usuário válido.",
  GOOGLE_UNLINK_USER_NOT_FOUND:
    "Usuário não encontrado para desconectar a conta Google.",
  GOOGLE_UNLINK_PASSWORD_REQUIRED:
    "Defina uma senha local antes de desconectar sua conta Google.",
  GOOGLE_OAUTH_STATE_INVALID:
    "A solicitação de autenticação Google é inválida ou expirou.",
  GOOGLE_OAUTH_STATE_REUSED:
    "Esta solicitação de autenticação Google já foi utilizada.",
  GOOGLE_LINK_ACCOUNT_INACTIVE:
    "A conta local está inativa e não pode ser vinculada ao Google.",
  GOOGLE_ACCOUNT_ALREADY_LINKED:
    "Esta conta Google já está vinculada a outro usuário.",
  GOOGLE_EMAIL_BELONGS_TO_ANOTHER_USER:
    "O email da conta Google pertence a outro usuário.",
  GOOGLE_ACCOUNT_INACTIVE:
    "A conta vinculada ao Google está inativa.",
  GOOGLE_OAUTH_DISABLED:
    "A autenticação com Google está desabilitada no momento.",

  // USUÁRIO
  USUARIO_NOT_FOUND: "Usuário não encontrado",
  USUARIO_JA_MEMBRO: "Este usuário já é membro da campanha.",
  USUARIO_EMAIL_DUPLICADO: "Este email já está em uso",
  USUARIO_EMAIL_NOT_FOUND: "Email não encontrado",
  USUARIO_APELIDO_NOT_FOUND: "Usuário não encontrado",
  USUARIO_APELIDO_DUPLICADO:
    "Mais de um usuário usa esse apelido. Use o email para convidar.",
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
  ENTIDADE_PV_INVALIDO:
    "PV atual não pode ser maior que o PV máximo do vinculado.",
  ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA:
    'O personagem não possui uma técnica compatível com este vinculado.',
  ENTIDADE_TECNICA_ORIGEM_INVALIDA:
    'A técnica selecionada não habilita este tipo de vinculado.',
  ENTIDADE_CRIACAO_MANUAL_BLOQUEADA:
    'Esta técnica permite associar apenas vinculados predefinidos.',
  ENTIDADE_DISTRIBUICAO_INVALIDA:
    'A distribuição excede os pools ou tetos permitidos pela técnica.',
  ENTIDADE_TEMPLATE_JA_ASSOCIADO:
    'Este vinculado predefinido já está associado ao personagem.',
  ENTIDADE_OVERRIDE_NEGADO:
    'Apenas o mestre pode ignorar limites de vinculados.',
  ENTIDADE_ACESSO_NEGADO:
    "Você não tem permissão para acessar esta entidade vinculada.",
  ENTIDADE_APENAS_MESTRE:
    "Apenas o mestre pode executar esta ação com a entidade vinculada.",
  ENTIDADE_CONFIGURACAO_NAO_ENCONTRADA:
    "A configuração de vinculados da técnica não foi encontrada.",
  ENTIDADE_CORPO_LIMITE_VAGAS:
    "O limite de vagas para Corpos Amaldiçoados foi atingido.",
  ENTIDADE_DONO_FORA_DA_SESSAO:
    "O personagem dono desta entidade não participa da sessão.",
  ENTIDADE_ESTADO_INDISPONIVEL:
    "A entidade vinculada não está disponível neste estado.",
  ENTIDADE_JA_ATIVA: "Esta entidade vinculada já está ativa na sessão.",
  ENTIDADE_MALDICAO_ORIGEM_DUPLICADA:
    "Esta maldição já foi associada ao personagem.",
  ENTIDADE_MALDICAO_ORIGEM_INVALIDA:
    "A origem informada não é uma Maldição válida.",
  ENTIDADE_MALDICAO_ORIGEM_OBRIGATORIA:
    "Selecione uma Maldição de origem para continuar.",
  ENTIDADE_NPC_ORIGEM_NAO_ENCONTRADA:
    "O NPC/Ameaça de origem desta entidade não foi encontrado.",
  ENTIDADE_NPC_SESSAO_NAO_VINCULADO:
    "O NPC/Ameaça da sessão não está ligado a esta entidade.",
  ENTIDADE_PERSONAGEM_NAO_ENCONTRADO:
    "O personagem dono da entidade vinculada não foi encontrado.",
  ENTIDADE_SHIKIGAMI_LIMITE_ATIVO:
    "O limite de Shikigamis ativos foi atingido.",
  ENTIDADE_TEMPLATE_NAO_ENCONTRADO:
    "O template de entidade vinculada não foi encontrado.",
  ENTIDADE_VINCULADA_NAO_ENCONTRADA:
    "A entidade vinculada não foi encontrada.",

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

  // ANOTACOES
  ANOTACAO_NOT_FOUND: "Anotação não encontrada",
  ANOTACAO_SEM_PERMISSAO: "Você não tem permissão para esta anotação",
  ANOTACAO_CAMPANHA_SESSAO_INVALIDA:
    "Campanha e sessão informadas não correspondem",
  // ALIASES LEGADOS (mantidos por compatibilidade)
  ITEM_INVENTARIO_NOT_FOUND: "Item do inventário não encontrado",
  ESPACOS_INSUFICIENTES: "Espaço insuficiente no inventário",
  GRAU_XAMA_LIMITE_EXCEDIDO:
    "Limite do Grau Xamã excedido para esta categoria",

  // CAMPANHAS
  CAMPANHA_NOT_FOUND: "Campanha não encontrada",
  CAMP_NOT_FOUND: "Campanha não encontrada",
  CAMPANHA_ACESSO_NEGADO: "Você não tem acesso a esta campanha",
  CAMPANHA_ACCESS_DENIED: "Você não participa desta campanha.",
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
  CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA:
    "Você não tem permissão para remover este personagem da campanha.",
  CAMPANHA_NUCLEO_INVALIDO: "Núcleo amaldiçoado inválido.",
  CAMPANHA_NUCLEO_INDISPONIVEL:
    "Este núcleo amaldiçoado não está disponível nesta campanha.",
  CAMPANHA_NUCLEO_SACRIFICIO_INVALIDO:
    "Sacrifício inválido para este núcleo amaldiçoado.",
  CAMPANHA_NUCLEO_PE_INSUFICIENTE:
    "PE insuficiente para ativar este núcleo amaldiçoado.",
  PERSONAGEM_CAMPANHA_NOT_FOUND: "Personagem da campanha não encontrado",
  PERSONAGEM_SESSAO_NOT_FOUND: "Personagem da sessão não encontrado.",
  CAMPANHA_MODIFICADOR_NOT_FOUND:
    "Modificador da ficha de campanha não encontrado",
  CAMPANHA_MODIFICADOR_JA_DESFEITO: "Este modificador já foi desfeito",
  CAMPANHA_MODIFICADOR_INVALIDO: "Modificador narrativo inválido.",
  SESSAO_CAMPANHA_NOT_FOUND: "Sessão da campanha não encontrada.",
  CENA_SESSAO_NOT_FOUND: "Cena da sessão não encontrada.",
  NPC_SESSAO_NOT_FOUND: "NPC/Ameaça da sessão não encontrado.",
  SESSAO_TURNO_INDISPONIVEL:
    "Cena livre não possui contagem de rodada/turno.",
  SESSAO_ENCERRADA: "Sessão encerrada. Não é possível executar esta ação.",
  SESSAO_INVALIDA:
    "A sessão informada é inválida. Atualize a página e tente novamente.",
  SESSAO_AGENDADA_NOT_FOUND: "Sessão agendada não encontrada.",
  SESSAO_AGENDADA_DATA_INVALIDA:
    "A data informada para a sessão agendada é inválida.",
  SESSAO_AGENDADA_DURACAO_INVALIDA:
    "A duração informada para a sessão agendada é inválida.",
  SESSAO_AGENDADA_INTERVALO_INVALIDO:
    "O intervalo informado para a sessão agendada é inválido.",
  SESSAO_AGENDADA_TIMEZONE_INVALIDO:
    "O fuso horário informado para a sessão agendada é inválido.",
  SESSAO_AGENDADA_INICIO_PASSADO:
    "A sessão agendada não pode começar em uma data passada.",
  SESSAO_AGENDADA_MEET_REQUER_CALENDAR:
    "Conecte o Google Calendar para criar uma reunião do Meet.",
  SESSAO_AGENDADA_CANCELADA: "Esta sessão agendada foi cancelada.",
  SESSAO_AGENDADA_JA_ABERTA: "Esta sessão agendada já foi aberta.",
  SESSAO_AGENDADA_NAO_ABERTA: "Esta sessão agendada ainda não foi aberta.",
  SESSAO_ROLAGEM_INVALIDA: "A fórmula de rolagem informada é inválida.",
  SESSAO_ROLAGEM_MENSAGEM_MUITO_GRANDE:
    "Rolagem grande demais para o chat. Reduza a quantidade de dados.",
  SESSAO_ROLAGEM_REQUER_FLUXO_MECANICO:
    "Esta rolagem possui um efeito mecânico pendente.",
  SESSAO_ROLAGEM_IDEMPOTENCIA_CONFLITO:
    "Esta tentativa de rolagem já foi usada com outros dados. Tente novamente.",
  MACRO_PERSONAGEM_CONFIG_INVALIDA: "A configuração da macro personalizada é inválida.",
  MACRO_PERSONAGEM_LIMITE_EXCEDIDO: "O personagem atingiu o limite de macros personalizadas.",
  MACRO_PERSONAGEM_NAO_ENCONTRADA: "Macro personalizada não encontrada.",
  MACRO_PERSONAGEM_PERICIA_INVALIDA: "A perícia configurada na macro não existe.",
  MACRO_PERSONAGEM_REVISAO_CONFLITO: "A macro foi alterada em outro lugar. Atualize e tente novamente.",
  MACRO_PERSONAGEM_VISIBILIDADE_NEGADA: "Apenas o mestre pode usar macros secretas.",
  CAMPAIGN_ROULETTE_FORBIDDEN: "Você não tem permissão para realizar esta ação na roleta.",
  CAMPAIGN_ROULETTE_INVALID_CONFIG: "A configuração da roleta é inválida.",
  CAMPAIGN_ROULETTE_INVALID_DRAW: "Esta ação não é válida no estado atual do sorteio.",
  CAMPAIGN_ROULETTE_DRAW_NOT_FOUND: "Sorteio da roleta não encontrado.",
  CAMPAIGN_ROULETTE_CONFLICT: "A roleta mudou em outro dispositivo. Atualize e tente novamente.",
  CAMPAIGN_ROULETTE_IDEMPOTENCY_CONFLICT: "Esta solicitação já foi usada com outra intenção.",
  CAMPAIGN_ROULETTE_INVALID_PERMISSION: "A permissão da roleta é inválida.",
  OPERACAO_CONCORRENTE_REPETIR:
    "O estado foi alterado por outra operação. Atualize e tente novamente.",
  SESSAO_PERICIA_NAO_ENCONTRADA:
    "A perícia informada não foi encontrada para este personagem.",
  SESSAO_PERICIA_ATAQUE_INVALIDA:
    "Esta perícia não pode ser usada como ataque de personagem.",
  SESSAO_NPC_PERICIA_NAO_ENCONTRADA:
    "A perícia informada não foi encontrada para este NPC/Ameaça.",
  SESSAO_NPC_PERICIA_ATAQUE_INVALIDA:
    "Esta perícia não pode ser usada como ataque de NPC/Ameaça.",
  SESSAO_NPC_ACAO_ROLAGEM_INVALIDA:
    "A ação selecionada não possui um teste válido para rolagem no servidor.",
  SESSAO_NPC_ACAO_NAO_ENCONTRADA:
    "A ação selecionada não foi encontrada neste NPC/Ameaça.",
  SESSAO_NPC_ACAO_SEM_DANO:
    "A ação selecionada não possui dano para rolagem no servidor.",
  SESSAO_NPC_ACAO_DANO_INVALIDO:
    "O dano persistido nesta ação não possui uma fórmula válida para rolagem no servidor.",
  SESSAO_EFEITOS_TURNO_PENDENTES:
    "Existem efeitos automáticos de turno pendentes. Reprocesse-os antes de continuar.",
  SESSAO_EFEITOS_TURNO_FALHARAM:
    "Não foi possível concluir os efeitos automáticos do turno.",
  SESSAO_TURNO_DESATUALIZADO:
    "O turno foi alterado em outra tela. Sincronize a sessão e tente novamente.",
  SESSAO_ORDEM_INICIATIVA_INVALIDA:
    "Ordem de iniciativa inválida para esta sessão.",
  SESSAO_EVENTO_NOT_FOUND: "Evento da sessão não encontrado.",
  SESSAO_EVENTO_DESFAZER_NAO_PERMITIDO:
    "Este evento da sessão não pode ser desfeito.",
  SESSAO_PERSONAGEM_NOT_FOUND: "Personagem da sessão não encontrado.",
  SESSAO_CENA_ATUAL_NOT_FOUND: "A cena atual da sessão não foi encontrada.",
  SESSAO_CENA_INVALIDA: "A cena informada não pertence a esta sessão.",
  SESSAO_CONDICAO_NOT_FOUND: "Condição não encontrada.",
  SESSAO_CONDICAO_ATIVA_NOT_FOUND: "Condição ativa não encontrada.",
  SESSAO_CONDICAO_ALVO_NPC_NOT_FOUND:
    "NPC/Ameaça da sessão não encontrado para aplicar a condição.",
  SESSAO_CONDICAO_ALVO_PERSONAGEM_NOT_FOUND:
    "Personagem da sessão não encontrado para aplicar a condição.",
  SESSAO_CONDICAO_DURACAO_INVALIDA:
    "A duração informada para a condição é inválida.",
  SESSAO_CONDICAO_DURACAO_VALOR_REQUIRED:
    "Informe o valor da duração desta condição.",
  SESSAO_CONDICAO_SNAPSHOT_INVALIDO:
    "Os dados persistidos desta condição são inválidos.",
  SESSAO_HABILIDADE_NAO_DISPONIVEL:
    "Habilidade não está disponível para este personagem.",
  SESSAO_VARIACAO_HABILIDADE_NOT_FOUND:
    "Variação da habilidade não encontrada.",
  SESSAO_HABILIDADE_SEM_ESCALONAMENTO:
    "Essa habilidade não permite acúmulos.",
  SESSAO_ACUMULO_EXCEDE_GRAU:
    "Quantidade de acúmulos excede o grau permitido.",
  SESSAO_APRIMORADO_DISTRIBUICAO_OBRIGATORIA:
    "Distribua os graus temporários do Aprimorado antes de continuar.",
  SESSAO_APRIMORADO_GRAU_INVALIDO:
    "O grau temporário informado para Aprimorado é inválido.",
  SESSAO_APRIMORADO_LIMITE_TECNICA:
    "A distribuição de Aprimorado excede o limite da técnica.",
  SESSAO_APRIMORADO_TECNICA_INVALIDA:
    "A técnica informada não pode receber este Aprimorado.",
  SESSAO_APRIMORADO_TOTAL_INVALIDO:
    "O total distribuído para Aprimorado é inválido.",
  SESSAO_SUSTENTACAO_SEM_CUSTO:
    "Habilidade sustentada sem custo não pode ser encerrada.",
  SESSAO_SUSTENTACAO_NOT_FOUND: "Sustentação ativa não encontrada.",
  SESSAO_RECURSO_INSUFICIENTE:
    "Recursos insuficientes para usar a habilidade.",
  SESSAO_RECURSOS_DESATUALIZADOS:
    "Os recursos mudaram em outra tela. Sincronize a sessão e tente novamente.",
  SESSAO_LIMITE_PEEA_EXCEDIDO:
    "Limite de PE/EA por turno excedido.",
  SESSAO_RECURSO_CLASSE_NAO_DISPONIVEL:
    "Recurso de classe não disponível para este personagem.",
  SESSAO_RECURSO_CLASSE_VERSAO_INDISPONIVEL:
    "A versão selecionada deste recurso de classe não está disponível.",
  SESSAO_RELATORIO_INDISPONIVEL:
    "O relatório fica disponível somente após o encerramento da sessão.",
  SESSAO_SOCIAL_INATIVO:
    "Encontros sociais alternativos não estão ativos nesta sessão.",
  SESSAO_ESCALADA_INATIVA:
    "A Escalada de Dados não está ativa nesta sessão.",
  SESSAO_INICIATIVA_ALTERNADA_LADOS_INVALIDOS:
    "A iniciativa alternada precisa ter exatamente dois lados.",
  SESSAO_INICIATIVA_ALTERNADA_NAO_CONFIGURADA:
    "A iniciativa alternada ainda não foi configurada.",
  SESSAO_INSPIRACAO_INATIVA:
    "Pontos de Inspiração não estão ativos nesta sessão.",
  SESSAO_INSPIRACAO_SALDO_INSUFICIENTE:
    "Saldo de Inspiração insuficiente para esta ação.",
  SESSAO_ITEM_INVENTARIO_NAO_ENCONTRADO:
    "Item de inventário não encontrado nesta campanha.",
  SESSAO_ITEM_NAO_CONSUMIVEL: "O item selecionado não é consumível.",
  SESSAO_CONSUMIVEL_SEM_AUTOMACAO:
    "Este consumível ainda não possui automação e deve ser resolvido manualmente.",
  SESSAO_CONSUMO_ALVO_OBRIGATORIO:
    "Selecione um alvo válido para consumir este item.",
  SESSAO_CONSUMO_COM_CALMA_INDISPONIVEL:
    "Este item não pode ser consumido com calma neste momento.",
  SESSAO_CONSUMO_FORMULA_INVALIDA:
    "A fórmula persistida para este consumível é inválida.",
  SESSAO_CONSUMO_RECURSO_NPC_INDISPONIVEL:
    "O recurso do NPC/Ameaça não pode receber este consumível.",
  SESSAO_PERITO_PENDENTE_EXISTENTE:
    "Este personagem já possui um efeito de Perito pendente.",
  NPC_AMEACA_NOT_FOUND: "Aliado/Ameaça não encontrado",
  CONVITE_NOT_FOUND: "Convite não encontrado",
  CONVITE_INVALIDO: "Convite inválido ou já utilizado",
  JOIN_INVALIDO: "Não foi possível entrar nesta sessão.",
  CONVITE_NAO_PERTENCE_USUARIO: "Este convite não pertence ao usuário logado",
  CONVITE_DUPLICADO_PENDENTE: "Já existe convite pendente para este email nesta campanha",
  CONVITE_CODIGO_INDISPONIVEL: "Não foi possível gerar um código de convite. Tente novamente",
  AMIZADE_NOT_FOUND: "Amizade não encontrada",
  AMIZADE_SOLICITACAO_NOT_FOUND: "Solicitação de amizade não encontrada",
  AMIZADE_SELF: "Você não pode adicionar a si mesmo",
  AMIZADE_JA_EXISTE: "Este usuário já está na sua lista de amigos",
  AMIZADE_SOLICITACAO_DUPLICADA:
    "Já existe uma solicitação de amizade pendente com este usuário",
  AMIZADE_ACAO_NEGADA:
    "Você não pode realizar esta ação nesta solicitação de amizade",
  AMIZADE_DESTINO_INVALIDO:
    "Informe um email, apelido ou usuário válido para enviar a solicitação.",
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
  COMPENDIO_LIVRO_NOT_FOUND: "Livro do compêndio não encontrado.",
  COMPENDIO_LIVRO_DUPLICADO:
    "Já existe um livro do compêndio com este identificador.",
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
  HABILIDADE_CONFIG_INVALID: "Configuração de habilidade inválida.",
  HABILIDADE_REQUIRES_CHOICE: "Esta habilidade exige uma escolha.",
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
  JSON_IMPORT_INVALIDO: "Arquivo JSON de importação inválido.",
  JSON_IMPORT_CAMPO_OBRIGATORIO:
    "O arquivo importado possui campo obrigatório ausente.",
  JSON_IMPORT_CAMPO_INVALIDO:
    "O arquivo importado possui campo inválido.",
  JSON_IMPORT_ENUM_INVALIDO:
    "O arquivo importado possui valor inválido para uma opção.",
  JSON_IMPORT_HABILIDADE_INVALIDA:
    "O arquivo importado possui habilidade inválida.",
  JSON_IMPORT_HABILIDADE_OUTRA_TECNICA:
    "O arquivo importado referencia habilidade de outra técnica.",
  JSON_IMPORT_TECNICA_INVALIDA:
    "O arquivo importado possui técnica inválida.",
  JSON_IMPORT_VAZIO: "O arquivo JSON de importação está vazio.",
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

  if (status === 429) {
    return formatRateLimitMessage(extractRetryAfterSeconds(error));
  }

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
  retryAfterSeconds?: number;
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
      : typeof body?.traceId === "string"
        ? body.traceId
      : typeof details?.requestId === "string"
        ? details.requestId
        : undefined;

  return {
    status,
    code,
    method,
    endpoint,
    requestId: requestIdFromHeaders ?? requestIdFromBody,
    retryAfterSeconds: extractRetryAfterSeconds(error) ?? undefined,
  };
}

export function extrairSuporteErro(error: unknown): ErrorSupportInfo {
  const contexto = extrairContextoErro(error);

  return {
    code: contexto.code,
    referenceId: contexto.requestId,
    status: contexto.status,
  };
}

export function criarErroUsuario(
  error: unknown,
  fallbackMessage?: string,
): UserFacingError {
  const contexto = extrairContextoErro(error);

  return {
    message: fallbackMessage ?? extrairMensagemErro(error),
    code: contexto.code,
    referenceId: contexto.requestId,
    status: contexto.status,
    retryAfterSeconds: contexto.retryAfterSeconds,
  };
}

export function criarErroLocalUsuario(message: string): UserFacingError {
  return { message };
}

export function formatarSuporteErro(
  suporte?: ErrorSupportInfo | null,
): string | null {
  if (!suporte?.code && !suporte?.referenceId) {
    return null;
  }

  const partes: string[] = [];
  if (suporte.code) partes.push(`Código: ${suporte.code}`);
  if (suporte.referenceId) partes.push(`Ref: ${suporte.referenceId}`);

  return partes.join(" | ");
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
