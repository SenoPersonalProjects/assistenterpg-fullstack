// components/layout/ThemeToggle.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="text-xs px-2 py-1"
    >
      {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
    </Button>
  );
}
