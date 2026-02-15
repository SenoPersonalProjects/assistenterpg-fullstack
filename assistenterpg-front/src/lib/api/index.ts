// lib/api/index.ts

// ✅ Exportar client axios e ApiError
export { API_BASE_URL, apiClient, ApiError } from './axios-client';

// ✅ Exportar error handler
export { extrairMensagemErro, traduzirErro, ERROR_MESSAGES } from './error-handler';

// ✅ Exportar todos os tipos (AGORA DA PASTA TYPES)
export * from '@/lib/types'; // ✅ ATUALIZADO

// ✅ Exportar auth (apiLogin, apiRegister, apiGetMe)
export * from './auth';

// ✅ Exportar usuários
export * from './usuarios';

// ✅ Exportar campanhas
export * from './campanhas';

// ✅ Exportar personagens-base
export * from './personagens-base';

// ✅ Exportar catálogos
export * from './catalogos';

// ✅ Exportar equipamentos
export * from './equipamentos';

// ✅ Exportar modificações
export * from './modificacoes';

// ✅ Exportar inventário
export * from './inventario';

// ✅ Exportar utilitários de paginação
export * from './pagination';
