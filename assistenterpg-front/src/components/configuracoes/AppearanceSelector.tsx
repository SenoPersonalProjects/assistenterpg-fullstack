'use client';

import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { type ThemeMode, type ThemePalette } from '@/context/ThemeContext';

type PaletteOption = {
  value: ThemePalette;
  label: string;
  description: string;
  icon: IconName;
  swatches: string[];
};

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    value: 'padrao',
    label: 'Padrão',
    description: 'Azul e neutro, bom para uso diário.',
    icon: 'settings',
    swatches: ['#2563eb', '#7c3aed', '#f9fafb', '#0b1020'],
  },
  {
    value: 'roxo',
    label: 'Roxo',
    description: 'Roxo com contraste mais marcado.',
    icon: 'sparkles',
    swatches: ['#7c5cfc', '#9b4de0', '#f8f5ff', '#151126'],
  },
  {
    value: 'vermelho',
    label: 'Vermelho',
    description: 'Vermelho como cor principal, com apoio azul.',
    icon: 'fire',
    swatches: ['#780000', '#c1121f', '#fdf0d5', '#003049', '#669bbc'],
  },
];

const MODE_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: IconName;
  description: string;
}> = [
  {
    value: 'light',
    label: 'Claro',
    icon: 'sun',
    description: 'Fundos claros e contraste suave.',
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: 'moon',
    description: 'Fundos escuros e menos brilho.',
  },
];

type AppearanceSelectorProps = {
  palette: ThemePalette;
  mode: ThemeMode;
  onPaletteChange: (palette: ThemePalette) => void;
  onModeChange: (mode: ThemeMode) => void;
};

export function AppearanceSelector({
  palette,
  mode,
  onPaletteChange,
  onModeChange,
}: AppearanceSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Palette Selection */}
      <div>
        <div className="mb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-app-primary">Paleta de Cores</h4>
          <p className="text-xs text-app-muted">Escolha as cores principais do site.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PALETTE_OPTIONS.map((option) => {
            const isActive = palette === option.value;

            return (
              <motion.button
                key={option.value}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPaletteChange(option.value)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all ${
                  isActive
                    ? 'border-app-primary bg-app-primary/5 ring-2 ring-app-primary/20'
                    : 'border-app-border bg-app-surface/40 hover:border-app-primary/40 hover:bg-app-surface/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="palette-active"
                    className="absolute inset-0 bg-app-primary/5"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className={`rounded-xl p-2 transition-colors ${isActive ? 'bg-app-primary text-white' : 'bg-app-muted-surface text-app-muted group-hover:text-app-primary'}`}>
                    <Icon name={option.icon} className="h-5 w-5" />
                  </div>
                  {isActive && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-app-primary text-white shadow-lg">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-4">
                  <span className={`font-black tracking-tight ${isActive ? 'text-app-fg' : 'text-app-muted'}`}>
                    {option.label}
                  </span>
                  <p className="mt-1 text-[11px] leading-relaxed text-app-muted">
                    {option.description}
                  </p>
                </div>

                <div className="relative z-10 mt-5 flex gap-1.5">
                  {option.swatches.map((color) => (
                    <div
                      key={color}
                      className="h-4 w-4 rounded-full border border-black/5 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="mb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-app-primary">Modo</h4>
          <p className="text-xs text-app-muted">Escolha entre tema claro e escuro.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODE_OPTIONS.map((option) => {
            const isActive = mode === option.value;

            return (
              <motion.button
                key={option.value}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onModeChange(option.value)}
                className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 transition-all ${
                  isActive
                    ? 'border-app-primary bg-app-primary/5 ring-2 ring-app-primary/20'
                    : 'border-app-border bg-app-surface/40 hover:border-app-primary/40 hover:bg-app-surface/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mode-active"
                    className="absolute inset-0 bg-app-primary/5"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className={`relative z-10 rounded-xl p-3 transition-colors ${isActive ? 'bg-app-primary text-white' : 'bg-app-muted-surface text-app-muted group-hover:text-app-primary'}`}>
                  <Icon name={option.icon} className="h-6 w-6" />
                </div>

                <div className="relative z-10 flex-1 text-left">
                  <span className={`block font-black tracking-tight ${isActive ? 'text-app-fg' : 'text-app-muted'}`}>
                    {option.label}
                  </span>
                  <span className="block text-[11px] text-app-muted">{option.description}</span>
                </div>

                {isActive && (
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-app-primary text-white shadow-lg">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
