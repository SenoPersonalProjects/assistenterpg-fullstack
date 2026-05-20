// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { PresenceProvider } from '@/context/PresenceContext';
import { ConditionalNav } from '@/components/layout/ConditionalNav';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  title: 'Assistente RPG - Maledicência RPG',
  description: 'Sistema completo para gerenciar personagens e campanhas de Maledicência RPG',
  icons: {
    icon: '/images/logos/logo-padrao.png',
  },
};

const themeInitScript = `
(function () {
  try {
    var key = 'assistenterpg_theme';
    var defaultTheme = 'padrao-dark';
    var stored = window.localStorage.getItem(key);
    var validThemes = {
      'padrao-light': true,
      'padrao-dark': true,
      'padrao-superdark': true,
      'roxo-light': true,
      'roxo-dark': true,
      'roxo-superdark': true,
      'vermelho-light': true,
      'vermelho-dark': true,
      'vermelho-superdark': true,
      'verde-light': true,
      'verde-dark': true,
      'verde-superdark': true
    };
    var logoByPalette = {
      padrao: 'url("/images/logos/logo-padrao.png")',
      roxo: 'url("/images/logos/logo-roxo.png")',
      vermelho: 'url("/images/logos/logo-vermelho.png")',
      verde: 'url("/images/logos/logo-verde.png")'
    };
    var theme = validThemes[stored] ? stored : defaultTheme;

    if (stored === 'light') theme = 'padrao-light';
    if (stored === 'dark') theme = 'padrao-dark';
    if (stored === 'jujutsu' || stored === 'padrao') theme = 'roxo-dark';

    var parts = theme.split('-');
    var palette = parts[0];
    var mode = parts[1];
    var root = document.documentElement;

    root.classList.remove(
      'theme-padrao',
      'theme-roxo',
      'theme-vermelho',
      'theme-verde',
      'theme-light',
      'theme-dark',
      'theme-superdark',
      'theme-jujutsu'
    );
    root.classList.toggle('dark', mode === 'dark' || mode === 'superdark');
    root.classList.add('theme-' + palette, 'theme-' + mode);
    root.dataset.theme = theme;
    root.dataset.themePalette = palette;
    root.dataset.themeMode = mode;
    root.style.setProperty('--theme-logo-url', logoByPalette[palette] || logoByPalette.padrao);
  } catch (error) {
    document.documentElement.style.setProperty('--theme-logo-url', 'url("/images/logos/logo-padrao.png")');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AuthProvider>
            <PresenceProvider>
              <ToastProvider>
                <ConditionalNav />
                <LayoutWrapper>{children}</LayoutWrapper>
                <ToastContainer />
              </ToastProvider>
            </PresenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
