'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

import { Icon, type IconName } from '@/components/ui/Icon';
import { type ThemeMode, type ThemePalette } from '@/context/ThemeContext';

type PaletteOption = {
  value: ThemePalette;
  label: string;
  description: string;
  logoSrc: string;
  swatches: string[];
};

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    value: 'padrao',
    label: 'Padrao',
    description: 'Azul de energia com base neutra.',
    logoSrc: '/images/logos/logo-padrao.png',
    swatches: ['#4fd6ff', '#0891b2', '#f9fafb', '#0b1020'],
  },
  {
    value: 'roxo',
    label: 'Roxo',
    description: 'Roxo com contraste mais marcado.',
    logoSrc: '/images/logos/logo-roxo.png',
    swatches: ['#7c5cfc', '#9b4de0', '#f8f5ff', '#151126'],
  },
  {
    value: 'vermelho',
    label: 'Vermelho',
    description: 'Vermelho como cor principal, com apoio quente.',
    logoSrc: '/images/logos/logo-vermelho.png',
    swatches: ['#780000', '#c1121f', '#ef233c', '#f43f5e', '#fdf0d5'],
  },
  {
    value: 'verde',
    label: 'Verde',
    description: 'Verde vibrante com apoio teal.',
    logoSrc: '/images/logos/logo-verde.png',
    swatches: ['#16db65', '#119da4', '#313628', '#998650', '#e8e9eb'],
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
  {
    value: 'superdark',
    label: 'Superescuro',
    icon: 'moon',
    description: 'Fundos quase pretos com destaque da paleta.',
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
      <div>
        <div className="mb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-app-primary">
            Paleta de cores
          </h4>
          <p className="text-xs text-app-muted">Escolha as cores principais do site.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PALETTE_OPTIONS.map((option) => {
            const isActive = palette === option.value;

            return (
              <motion.button
                key={option.value}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPaletteChange(option.value)}
                className={`group relative flex min-h-[210px] flex-col items-center overflow-hidden rounded-2xl border p-5 text-center transition-all ${
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

                {isActive && (
                  <div className="absolute right-4 top-4 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-app-primary text-white shadow-lg">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className="relative z-10 flex h-20 w-20 items-center justify-center">
                  <Image
                    src={option.logoSrc}
                    alt={`Logo ${option.label}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain drop-shadow-[0_0_16px_rgba(var(--primary-rgb),0.35)] transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="relative z-10 mt-4 flex flex-1 flex-col items-center">
                  <span
                    className={`font-black tracking-tight ${
                      isActive ? 'text-app-fg' : 'text-app-muted'
                    }`}
                  >
                    {option.label}
                  </span>
                  <p className="mt-1 text-[11px] leading-relaxed text-app-muted">
                    {option.description}
                  </p>
                </div>

                <div className="relative z-10 mt-5 flex justify-center gap-1.5">
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

      <div>
        <div className="mb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-app-primary">Modo</h4>
          <p className="text-xs text-app-muted">
            Escolha entre tema claro, escuro e superescuro.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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

                <div
                  className={`relative z-10 rounded-xl p-3 transition-colors ${
                    isActive
                      ? 'bg-app-primary text-white'
                      : 'bg-app-muted-surface text-app-muted group-hover:text-app-primary'
                  }`}
                >
                  <Icon name={option.icon} className="h-6 w-6" />
                </div>

                <div className="relative z-10 flex-1 text-left">
                  <span
                    className={`block font-black tracking-tight ${
                      isActive ? 'text-app-fg' : 'text-app-muted'
                    }`}
                  >
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
