'use client';

import { ModalConfirmacaoConta } from './ModalConfirmacaoConta';

type ModalDesativarContaProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string) => Promise<void>;
};

const DEACTIVATION_CONSEQUENCES = [
  'Você será desconectado de todos os dispositivos.',
  'Seu perfil deixará de aparecer em buscas e convites.',
  'A conta poderá ser reativada depois com email e senha.',
];

export function ModalDesativarConta(props: ModalDesativarContaProps) {
  return (
    <ModalConfirmacaoConta
      {...props}
      title="Desativar conta"
      description="A conta ficará indisponível até que você faça a reativação."
      consequences={DEACTIVATION_CONSEQUENCES}
      confirmationWord="DESATIVAR"
      confirmLabel="Desativar conta"
      loadingLabel="Desativando..."
    />
  );
}
