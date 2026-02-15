// components/personagem-base/create/InventarioValidacaoFeedback.tsx - CORRIGIDO

import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

type ValidacaoFeedbackProps = {
  tipo: 'erro' | 'aviso' | 'info' | 'sucesso';
  titulo: string;
  mensagens: string[];
  className?: string;
};

export function InventarioValidacaoFeedback({
  tipo,
  titulo,
  mensagens,
  className = '',
}: ValidacaoFeedbackProps) {
  const configs: Record<
    'erro' | 'aviso' | 'info' | 'sucesso',
    { bgColor: string; borderColor: string; textColor: string; icon: IconName }
  > = {
    erro: {
      bgColor: 'bg-app-danger/5',
      borderColor: 'border-app-danger/20',
      textColor: 'text-app-danger',
      icon: 'fail', // ✅ XCircleIcon
    },
    aviso: {
      bgColor: 'bg-app-warning/5',
      borderColor: 'border-app-warning/20',
      textColor: 'text-app-warning',
      icon: 'warning', // ✅ ExclamationTriangleIcon
    },
    info: {
      bgColor: 'bg-app-info/5',
      borderColor: 'border-app-info/20',
      textColor: 'text-app-info',
      icon: 'info', // ✅ InformationCircleIcon
    },
    sucesso: {
      bgColor: 'bg-app-success/5',
      borderColor: 'border-app-success/20',
      textColor: 'text-app-success',
      icon: 'success', // ✅ CheckCircleIcon
    },
  };

  const config = configs[tipo];

  return (
    <div
      className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      {/* Título */}
      <div className="flex items-center gap-2 mb-2">
        <Icon name={config.icon} className={`w-4 h-4 ${config.textColor}`} />
        <p className={`text-sm font-semibold ${config.textColor}`}>{titulo}</p>
      </div>

      {/* Mensagens */}
      <div className="space-y-1">
        {mensagens.map((msg, index) => (
          <p key={index} className="text-xs text-app-muted leading-relaxed whitespace-pre-line">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
