'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePalette = 'padrao' | 'roxo' | 'vermelho';
export type ThemeMode = 'light' | 'dark';
export type Theme = `${ThemePalette}-${ThemeMode}`;
export type LegacyTheme = 'light' | 'dark' | 'jujutsu' | 'padrao';
export type ThemeInput = Theme | LegacyTheme;

type ThemeOption = {
  palette: ThemePalette;
  mode: ThemeMode;
  label: string;
};

type ThemeContextType = {
  theme: Theme;
  palette: ThemePalette;
  mode: ThemeMode;
  themeLabel: string;
  setTheme: (theme: ThemeInput) => void;
  setPalette: (palette: ThemePalette) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'assistenterpg_theme';
const DEFAULT_THEME: Theme = 'padrao-dark';
const THEME_CLASS_NAMES = [
  'theme-padrao',
  'theme-roxo',
  'theme-vermelho',
  'theme-light',
  'theme-dark',
  'theme-jujutsu',
] as const;

const THEME_LABELS: Record<Theme, string> = {
  'padrao-light': 'Padrão claro',
  'padrao-dark': 'Padrão escuro',
  'roxo-light': 'Roxo claro',
  'roxo-dark': 'Roxo escuro',
  'vermelho-light': 'Vermelho claro',
  'vermelho-dark': 'Vermelho escuro',
};

function isTheme(value: string | null): value is Theme {
  return Boolean(value && value in THEME_LABELS);
}

function normalizeTheme(value: string | null): Theme {
  if (isTheme(value)) return value;
  if (value === 'light') return 'padrao-light';
  if (value === 'dark') return 'padrao-dark';
  if (value === 'jujutsu' || value === 'padrao') return 'roxo-dark';
  return DEFAULT_THEME;
}

function splitTheme(theme: Theme): ThemeOption {
  const [palette, mode] = theme.split('-') as [ThemePalette, ThemeMode];
  return {
    palette,
    mode,
    label: THEME_LABELS[theme],
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return normalizeTheme(localStorage.getItem(THEME_KEY));
  });
  const { palette, mode, label } = splitTheme(theme);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASS_NAMES);
    root.classList.toggle('dark', mode === 'dark');
    root.classList.add(`theme-${palette}`, `theme-${mode}`);
    root.dataset.theme = theme;
    root.dataset.themePalette = palette;
    root.dataset.themeMode = mode;
    localStorage.setItem(THEME_KEY, theme);
  }, [mode, palette, theme]);

  const setTheme = (nextTheme: ThemeInput) => {
    setThemeState(normalizeTheme(nextTheme));
  };

  const setPalette = (nextPalette: ThemePalette) => {
    setThemeState((currentTheme) => {
      const current = splitTheme(currentTheme);
      return `${nextPalette}-${current.mode}`;
    });
  };

  const setMode = (nextMode: ThemeMode) => {
    setThemeState((currentTheme) => {
      const current = splitTheme(currentTheme);
      return `${current.palette}-${nextMode}`;
    });
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) => {
      const current = splitTheme(currentTheme);
      return `${current.palette}-${current.mode === 'dark' ? 'light' : 'dark'}`;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        mode,
        themeLabel: label,
        setTheme,
        setPalette,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return ctx;
}
