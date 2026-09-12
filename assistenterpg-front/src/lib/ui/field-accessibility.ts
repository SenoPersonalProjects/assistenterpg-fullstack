type CampoAcessivelInput = {
  id: string;
  ariaDescribedBy?: string;
  possuiAjuda: boolean;
  possuiErro: boolean;
};

export type CampoAcessivel = {
  helperId: string;
  errorId: string;
  describedBy?: string;
  errorMessage?: string;
};

export function criarAcessibilidadeCampo({
  id,
  ariaDescribedBy,
  possuiAjuda,
  possuiErro,
}: CampoAcessivelInput): CampoAcessivel {
  const helperId = id + '-helper';
  const errorId = id + '-error';
  const ids = [
    ariaDescribedBy?.trim(),
    possuiAjuda ? helperId : undefined,
    possuiErro ? errorId : undefined,
  ].filter((value): value is string => Boolean(value));

  return {
    helperId,
    errorId,
    describedBy: ids.length > 0 ? ids.join(' ') : undefined,
    errorMessage: possuiErro ? errorId : undefined,
  };
}
