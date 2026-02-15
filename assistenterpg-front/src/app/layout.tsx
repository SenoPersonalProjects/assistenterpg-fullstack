// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext'; // ✅ NOVO
import { ToastContainer } from '@/components/ui/Toast'; // ✅ NOVO
import { ConditionalNav } from '@/components/layout/ConditionalNav';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  title: 'Assistente RPG - Jujutsu Kaisen',
  description: 'Sistema completo para gerenciar personagens e campanhas de Jujutsu Kaisen RPG',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider> {/* ✅ NOVO */}
              <ConditionalNav />
              <LayoutWrapper>{children}</LayoutWrapper>
              <ToastContainer /> {/* ✅ NOVO */}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
