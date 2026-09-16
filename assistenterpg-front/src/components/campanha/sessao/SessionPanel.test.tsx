// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SessionPanel } from './SessionPanel';

describe('SessionPanel', () => {
  it('recolhe e expande o conteúdo preservando o controle acessível', async () => {
    const usuario = userEvent.setup();
    render(
      <SessionPanel title="Painel de teste" collapsible collapseLabel="painel de teste">
        <p>Conteúdo recolhível</p>
      </SessionPanel>,
    );

    const controle = screen.getByRole('button', { name: 'Recolher painel de teste' });
    expect(controle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Conteúdo recolhível')).toBeTruthy();

    await usuario.click(controle);

    expect(
      screen
        .getByRole('button', { name: 'Expandir painel de teste' })
        .getAttribute('aria-expanded'),
    ).toBe('false');
    expect(screen.queryByText('Conteúdo recolhível')).toBeNull();
  });
});
