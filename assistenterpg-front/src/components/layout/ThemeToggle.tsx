// components/layout/ThemeToggle.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { mode, themeLabel, toggleTheme } = useTheme();
  const proximoModo =
    mode === 'light' ? 'escuro' : mode === 'dark' ? 'superescuro' : 'claro';
  const iconName = mode === 'light' ? 'sun' : 'moon';

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="px-2 py-1 text-xs"
      title={`Alternar para modo ${proximoModo}`}
    >
      <Icon name={iconName} className="mr-1 h-3.5 w-3.5" />
      {themeLabel}
    </Button>
  );
}
