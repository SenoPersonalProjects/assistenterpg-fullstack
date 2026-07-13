import { SessaoEncerradaException } from 'src/common/exceptions/campanha.exception';

export type SessaoComStatus = {
  status: string;
};

export function assertSessaoMutavel(
  sessao: SessaoComStatus,
  campanhaId: number,
  sessaoId: number,
  acao?: string,
): void {
  if (sessao.status === 'ENCERRADA') {
    throw new SessaoEncerradaException(campanhaId, sessaoId, acao);
  }
}
