'use client';

import { ModalConfirmacaoConta } from './ModalConfirmacaoConta';

type ModalExcluirContaProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string) => Promise<void>;
};

const DELETION_CONSEQUENCES = [
  'A conta fica inacessivel imediatamente e voce sera desconectado de todos os dispositivos.',
  'Voce pode reativar a conta em ate 90 dias usando email e senha.',
  'Depois de 90 dias, email, apelido e credenciais sao anonimizados permanentemente.',
  'Conteudos e relacoes existentes sao preservados sem identificar a conta.',
];

export function ModalExcluirConta(props: ModalExcluirContaProps) {
  return (
    <ModalConfirmacaoConta
      {...props}
      title="Agendar exclusao da conta"
      description="A exclusao permanente acontece apos 90 dias. Ate la, voce pode reativar a conta pelo login."
      consequences={DELETION_CONSEQUENCES}
      confirmationWord="EXCLUIR"
      confirmLabel="Agendar exclusao"
      loadingLabel="Agendando..."
    />
  );
}
