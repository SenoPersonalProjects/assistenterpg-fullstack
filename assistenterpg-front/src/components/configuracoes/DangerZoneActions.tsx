'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

type DangerZoneActionsProps = {
  className?: string;
  onLogout: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
};

export function DangerZoneActions({
  className = '',
  onLogout,
  onDeactivate,
  onDelete,
}: DangerZoneActionsProps) {
  return (
    <Card
      variant="flat"
      className={`border border-app-danger/10 bg-app-danger/5 p-4 ${className}`}
    >
      <h4 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-app-danger">
        Zona de perigo
      </h4>
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={onLogout}
          className="w-full justify-start text-app-fg hover:bg-app-danger/10"
        >
          <Icon name="back" className="mr-2 h-3.5 w-3.5" />
          Sair da conta
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={onDeactivate}
          className="w-full justify-start text-app-danger hover:bg-app-danger/10"
        >
          <Icon name="lock" className="mr-2 h-3.5 w-3.5" />
          Desativar conta
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={onDelete}
          className="w-full justify-start text-app-danger hover:bg-app-danger/10"
        >
          <Icon name="delete" className="mr-2 h-3.5 w-3.5" />
          Agendar exclusão da conta
        </Button>
      </div>
    </Card>
  );
}
