export type EstadoDadosRemotos<T> = {
  dados: T | undefined;
  erro: string | null;
  carregando: boolean;
};

export function criarEstadoDadosRemotos<T>(
  dados?: T,
): EstadoDadosRemotos<T> {
  return {
    dados,
    erro: null,
    carregando: false,
  };
}

export function iniciarCarregamentoRemoto<T>(
  estado: EstadoDadosRemotos<T>,
): EstadoDadosRemotos<T> {
  return {
    ...estado,
    erro: null,
    carregando: true,
  };
}

export function concluirCarregamentoRemoto<T>(
  dados: T,
): EstadoDadosRemotos<T> {
  return {
    dados,
    erro: null,
    carregando: false,
  };
}

export function falharCarregamentoRemoto<T>(
  estado: EstadoDadosRemotos<T>,
  erro: string,
): EstadoDadosRemotos<T> {
  return {
    ...estado,
    erro,
    carregando: false,
  };
}

export function temDadosRemotos<T>(estado: EstadoDadosRemotos<T>): boolean {
  return estado.dados !== undefined;
}

export function estaAtualizandoDadosRemotos<T>(
  estado: EstadoDadosRemotos<T>,
): boolean {
  return estado.carregando && temDadosRemotos(estado);
}
