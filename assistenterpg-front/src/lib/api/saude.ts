import { apiClient } from './axios-client';

export type SaudeSistemaAdministrativa = {
  backend: {
    status: 'ok';
    service: string;
    version: string;
    timestamp: string;
  };
  banco: { status: 'ok' };
  migrationMaisRecente: { nome: string; aplicadaEm: string | null } | null;
  ultimoBackup: {
    banco: string;
    arquivo: string;
    tamanhoBytes: number;
    sha256: string;
    executadoEm: string;
    retencao: number;
    origem: string;
  } | null;
  frontend: {
    status: 'ok' | 'INDISPONIVEL' | 'NAO_CONFIGURADO';
    url: string | null;
    httpStatus: number | null;
  };
};

export async function apiObterSaudeSistema(): Promise<SaudeSistemaAdministrativa> {
  const { data } = await apiClient.get('/health/admin');
  return data;
}
