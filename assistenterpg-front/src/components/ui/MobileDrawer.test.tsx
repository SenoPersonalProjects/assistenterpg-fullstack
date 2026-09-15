// @vitest-environment jsdom

import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DialogProvider } from './DialogProvider';
import { MobileDrawer } from './MobileDrawer';

function DrawerHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir menu
      </button>
      <MobileDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        ariaLabel="Menu de teste"
      >
        <button type="button" onClick={() => setOpen(false)}>
          Fechar menu
        </button>
      </MobileDrawer>
    </>
  );
}

describe('MobileDrawer', () => {
  it('fecha por Escape e devolve o foco ao gatilho', async () => {
    const usuario = userEvent.setup();
    render(
      <DialogProvider>
        <DrawerHarness />
      </DialogProvider>,
    );

    const gatilho = screen.getByRole('button', { name: 'Abrir menu' });
    await usuario.click(gatilho);
    expect(screen.getByRole('dialog', { name: 'Menu de teste' })).toBeTruthy();

    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Menu de teste' })).toBeNull();
    expect(document.activeElement).toBe(gatilho);
  });
});
