'use client';

import { ModalConfirmacaoConta } from './ModalConfirmacaoConta';

type ModalExcluirContaProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string) => Promise<void>;
};

const DELETION_CONSEQUENCES = [
  'A conta fica inacessível imediatamente e você será desconectado de todos os dispositivos.',
  'Você pode reativar a conta em até 90 dias usando email e senha.',
  'Depois de 90 dias, email, apelido e credenciais são anonimizados permanentemente.',
  'Conteúdos e relações existentes são preservados sem identificar a conta.',
];

export function ModalExcluirConta(props: ModalExcluirContaProps) {
  return (
    <ModalConfirmacaoConta
      {...props}
      title="Agendar exclusão da conta"
      description="A exclusão permanente acontece após 90 dias. Até lá, você pode reativar a conta pelo login."
      consequences={DELETION_CONSEQUENCES}
      confirmationWord="EXCLUIR"
      confirmLabel="Agendar exclusão"
      loadingLabel="Agendando..."
    />
  );
}
