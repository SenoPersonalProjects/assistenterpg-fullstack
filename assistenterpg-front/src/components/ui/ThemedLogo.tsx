'use client';

import Image from 'next/image';
import { useTheme, type ThemePalette } from '@/context/ThemeContext';

const LOGO_BY_PALETTE: Record<ThemePalette, string> = {
  padrao: '/images/logos/logo-padrao.png',
  roxo: '/images/logos/logo-roxo.png',
  vermelho: '/images/logos/logo-vermelho.png',
};

type ThemedLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function ThemedLogo({ size = 48, className = '', priority = false }: ThemedLogoProps) {
  const { palette } = useTheme();

  return (
    <Image
      src={LOGO_BY_PALETTE[palette]}
      alt="Assistente RPG"
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
