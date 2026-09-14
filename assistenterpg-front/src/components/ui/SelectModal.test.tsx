// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogProvider } from './DialogProvider';
import { SelectModal } from './SelectModal';

describe('SelectModal', () => {
  it('permite selecionar e remover sem reabrir o catálogo', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DialogProvider>
        <SelectModal label="Classe" value="" onChange={onChange} options={[{ value: 'combatente', label: 'Combatente' }]} />
      </DialogProvider>,
    );

    await usuario.click(screen.getByRole('button', { name: 'Classe' }));
    await usuario.click(screen.getByRole('button', { name: /Combatente/ }));
    await usuario.click(screen.getByRole('button', { name: /Confirmar seleção/ }));
    expect(onChange).toHaveBeenCalledWith('combatente');

    rerender(
      <DialogProvider>
        <SelectModal label="Classe" value="combatente" onChange={onChange} options={[{ value: 'combatente', label: 'Combatente' }]} />
      </DialogProvider>,
    );
    await usuario.click(screen.getByRole('button', { name: 'Remover seleção' }));
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
