'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Icon, ICON_NAMES, type IconName } from './Icon';
import { Modal } from './Modal';

type IconPickerProps = {
  label: string;
  value: string;
  onChange: (value: IconName) => void;
  helperText?: string;
};

function isIconName(value: string): value is IconName {
  return ICON_NAMES.some((iconName) => iconName === value);
}

function formatIconName(iconName: IconName): string {
  return iconName.replaceAll('-', ' ');
}

export function IconPicker({ label, value, onChange, helperText }: IconPickerProps) {
  const iconName = isIconName(value) ? value : 'book';
  const [aberto, setAberto] = useState(false);

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-app-fg">{label}</span>
      <Button type="button" variant="secondary" className="w-full justify-start gap-2" onClick={() => setAberto(true)}>
        <Icon name={iconName} className="h-4 w-4 text-app-primary" />
        <span>{formatIconName(iconName)}</span>
      </Button>
      {helperText ? <p className="text-xs text-app-muted">{helperText}</p> : null}
      {!isIconName(value) && value ? <p className="text-xs text-app-warning">O ícone legado será substituído ao escolher uma opção.</p> : null}

      <Modal isOpen={aberto} onClose={() => setAberto(false)} title={`Selecionar ${label.toLocaleLowerCase('pt-BR')}`} size="lg">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {ICON_NAMES.map((opcao) => {
            const selecionado = opcao === iconName;
            return (
              <button
                key={opcao}
                type="button"
                aria-pressed={selecionado}
                className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs capitalize transition ${
                  selecionado
                    ? 'border-app-primary bg-app-primary/10 text-app-primary'
                    : 'border-app-border bg-app-surface text-app-muted hover:border-app-primary/60 hover:text-app-fg'
                }`}
                onClick={() => {
                  onChange(opcao);
                  setAberto(false);
                }}
              >
                <Icon name={opcao} className="h-5 w-5" />
                <span className="text-center">{formatIconName(opcao)}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
