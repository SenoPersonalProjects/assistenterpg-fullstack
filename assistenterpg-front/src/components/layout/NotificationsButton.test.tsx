// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogProvider } from '@/components/ui/DialogProvider';
import { NotificationsButton } from './NotificationsButton';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/notificacoes/PendingNotificationsPanel', () => ({
  PendingNotificationsPanel: () => <div>Conteúdo das notificações</div>,
}));

describe('NotificationsButton', () => {
  it('abre e fecha por Escape, devolvendo foco ao sino', async () => {
    const usuario = userEvent.setup();
    render(
      <DialogProvider>
        <NotificationsButton pendingNotifications={0} />
      </DialogProvider>,
    );

    const sino = screen.getByRole('button', { name: 'Notificações' });
    await usuario.click(sino);
    expect(screen.getByRole('dialog', { name: 'Notificações pendentes' })).toBeTruthy();

    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Notificações pendentes' })).toBeNull();
    expect(document.activeElement).toBe(sino);
  });
});
