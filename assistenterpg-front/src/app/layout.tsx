// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { PresenceProvider } from '@/context/PresenceContext';
import { FriendChatProvider } from '@/context/FriendChatContext';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { DialogProvider } from '@/components/ui/DialogProvider';
import { ClientRuntimeObserver } from '@/components/observabilidade/ClientRuntimeObserver';
import {
  googleSiteVerification,
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
  urlPublica,
} from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  category: 'Role-playing game',
  authors: [{ name: 'Maledicência RPG' }],
  creator: 'Maledicência RPG',
  publisher: 'Maledicência RPG',
  formatDetection: { telephone: false, address: false, email: false },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/icons/maledicencia-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
    apple: [{ url: '/icons/maledicencia-180.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: urlPublica('/'),
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: urlPublica('/images/logos/logo-padrao.png'),
        width: 1200,
        height: 1200,
        alt: 'Marca do Maledicência RPG',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [urlPublica('/images/logos/logo-padrao.png')],
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
        <a
          href="#conteudo-principal"
          className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-app-primary px-4 py-2 font-semibold text-app-on-primary shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-app-fg"
        >
          Ir para o conteúdo principal
        </a>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ClientRuntimeObserver />
        <ThemeProvider>
          <AuthProvider>
            <PresenceProvider>
              <FriendChatProvider>
                <ToastProvider>
                  <DialogProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                    <ToastContainer />
                  </DialogProvider>
                </ToastProvider>
              </FriendChatProvider>
            </PresenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
