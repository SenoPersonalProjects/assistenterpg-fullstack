// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutWrapper } from './LayoutWrapper';

vi.mock('next/navigation', () => ({ usePathname: () => '/auth/login' }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ loading: false }) }));
vi.mock('@/components/ui/Loading', () => ({ Loading: () => <div>Carregando</div> }));
vi.mock('./AppShell', () => ({ AppShell: ({ children }: { children: React.ReactNode }) => children }));

describe('LayoutWrapper', () => {
  it('mantém um destino de conteúdo para o atalho global em rotas públicas', () => {
    render(
      <LayoutWrapper>
        <h1>Entrar</h1>
      </LayoutWrapper>,
    );

    const conteudo = screen.getByRole('heading', { name: 'Entrar' }).parentElement;
    expect(conteudo).toHaveProperty('id', 'conteudo-principal');
    expect(conteudo).toHaveProperty('tabIndex', -1);
  });
});
