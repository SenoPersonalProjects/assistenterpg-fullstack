// lib/api/index.ts

export { API_BASE_URL, apiClient, ApiError } from './axios-client';
export {
  extrairMensagemErro,
  traduzirErro,
  ERROR_MESSAGES,
  extrairContextoErro,
  formatarErroComContexto,
} from './error-handler';

export * from '@/lib/types';

export * from './auth';
export * from './usuarios';
export * from './campanhas';
export * from './personagens-base';
export * from './catalogos';
export * from './suplementos';
export * from './equipamentos';
export * from './modificacoes';
export * from './inventario';
export * from './pagination';
export * from './suplemento-conteudos';
export * from './npcs-ameacas';
