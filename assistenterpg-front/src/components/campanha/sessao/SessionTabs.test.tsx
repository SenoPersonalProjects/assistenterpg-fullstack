// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SessionTabs } from './SessionTabs';

describe('SessionTabs', () => {
  it('percorre abas habilitadas com teclado e mantém o rótulo ativo disponível', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SessionTabs
        variant="icon-only"
        activeId="resumo"
        onChange={onChange}
        tabs={[
          { id: 'resumo', label: 'Resumo', icon: 'chart' },
          { id: 'acoes', label: 'Ações', icon: 'sword' },
          { id: 'bloqueada', label: 'Bloqueada', disabled: true },
        ]}
      />,
    );

    const resumo = screen.getByRole('tab', { name: 'Resumo' });
    resumo.focus();
    await usuario.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('acoes');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Ações' }));
    await usuario.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('resumo');
  });
});
