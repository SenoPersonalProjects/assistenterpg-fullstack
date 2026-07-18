// lib/api/index.ts

export { API_BASE_URL, apiClient, ApiError } from './axios-client';
export {
  extrairMensagemErro,
  traduzirErro,
  ERROR_MESSAGES,
  extrairContextoErro,
  extrairSuporteErro,
  criarErroUsuario,
  criarErroLocalUsuario,
  formatarSuporteErro,
  formatarErroComContexto,
} from './error-handler';

export * from '@/lib/types';

export * from './auth';
export * from './usuarios';
export * from './campanhas';
export * from './campanha-roleta';
export * from './personagens-base';
export * from './catalogos';
export * from './suplementos';
export * from './equipamentos';
export * from './modificacoes';
export * from './inventario';
export * from './inventario-campanha';
export * from './pagination';
export * from './suplemento-conteudos';
export * from './npcs-ameacas';
export * from './anotacoes';
export * from './homebrews';
export * from './amizades';
export * from './chat-amigos';
