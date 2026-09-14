export const EVENTO_ERRO_CLIENTE = 'assistenterpg:cliente-erro';

export type ErroClienteObservavel = {
  tipo: 'ERRO_JAVASCRIPT' | 'PROMISE_REJEITADA';
  mensagem: string;
  rota: string;
  versao: string;
  em: string;
};

function sanitizarMensagem(valor: unknown): string {
  const mensagem = valor instanceof Error ? valor.message : String(valor ?? 'Erro desconhecido');
  return mensagem.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export function criarErroClienteObservavel(
  tipo: ErroClienteObservavel['tipo'],
  erro: unknown,
  contexto: Pick<ErroClienteObservavel, 'rota' | 'versao'>,
): ErroClienteObservavel {
  return {
    tipo,
    mensagem: sanitizarMensagem(erro),
    rota: contexto.rota,
    versao: contexto.versao,
    em: new Date().toISOString(),
  };
}

export function registrarErroCliente(erro: ErroClienteObservavel): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<ErroClienteObservavel>(EVENTO_ERRO_CLIENTE, {
      detail: erro,
    }),
  );
}
