// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { ToastContainer } from './Toast';

function ToastHarness({ onAction }: { onAction: () => Promise<void> }) {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        showToast('Transferência pendente.', 'info', {
          durationMs: null,
          actions: [{ label: 'Aceitar', onClick: onAction }],
        })
      }
    >
      Mostrar mensagem
    </button>
  );
}

describe('ToastContainer', () => {
  it('mantém a mensagem aberta quando a ação falha', async () => {
    const usuario = userEvent.setup();
    const onAction = vi.fn().mockRejectedValue(new Error('Falha remota'));
    render(
      <ToastProvider>
        <ToastHarness onAction={onAction} />
        <ToastContainer />
      </ToastProvider>,
    );

    await usuario.click(screen.getByRole('button', { name: 'Mostrar mensagem' }));
    expect(screen.getByRole('status').textContent).toContain('Transferência pendente.');

    await usuario.click(screen.getByRole('button', { name: 'Aceitar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('status')).toBeTruthy();
  });
});
