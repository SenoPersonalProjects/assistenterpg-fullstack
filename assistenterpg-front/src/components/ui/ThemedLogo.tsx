'use client';

type ThemedLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function ThemedLogo({ size = 48, className = '' }: ThemedLogoProps) {
  return (
    <span
      role="img"
      aria-label="Assistente RPG"
      className={`themed-logo ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: 'var(--theme-logo-url, url("/images/logos/logo-padrao.png"))',
      }}
    />
  );
}
