// components/layout/ThemeToggle.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const temaAtual =
    theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Jujutsu';
  const proximoTema =
    theme === 'light' ? 'escuro' : theme === 'dark' ? 'jujutsu' : 'claro';

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="text-xs px-2 py-1"
      title={`Alternar para tema ${proximoTema}`}
    >
      {`Tema: ${temaAtual}`}
    </Button>
  );
}
