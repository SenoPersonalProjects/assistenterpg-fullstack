// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimelinePanel } from './TimelinePanel';

const eventos = [
  {
    id: 1,
    sessaoId: 1,
    cenaId: 1,
    criadoEm: '2026-09-23T12:00:00.000Z',
    tipoEvento: 'DOMINIO_DISPUTA_INICIADA',
    descricao: 'Disputa de Domínios iniciada: Vazio × Sombra',
    desfeito: false,
    podeDesfazer: false,
    dados: null,
    autor: null,
    contexto: {
      categoria: 'DOMINIO' as const,
      dominios: [{ id: 10, nome: 'Vazio' }, { id: 11, nome: 'Sombra' }],
      personagens: [{ id: 100, nome: 'Ciel' }],
      npcs: [{ id: 200, nome: 'Viren' }],
    },
  },
  {
    id: 2,
    sessaoId: 1,
    cenaId: 1,
    criadoEm: '2026-09-23T12:01:00.000Z',
    tipoEvento: 'RECURSO_AJUSTADO',
    descricao: 'Recurso ajustado: EA',
    desfeito: false,
    podeDesfazer: false,
    dados: null,
    autor: null,
    contexto: { categoria: 'RECURSO' as const, dominios: [], personagens: [], npcs: [] },
  },
];

describe('TimelinePanel', () => {
  it('combina filtros por domínio e categoria e permite limpá-los', async () => {
    const usuario = userEvent.setup();
    render(
      <TimelinePanel
        eventosSessao={eventos}
        sessaoEncerrada={false}
        podeControlarSessao={true}
        desfazendoEventoId={null}
        onAbrirDetalhes={vi.fn()}
        onDesfazerEvento={vi.fn()}
      />,
    );

    expect(screen.getByText('Disputa de Domínios iniciada: Vazio × Sombra')).toBeTruthy();
    expect(screen.getByText('Recurso ajustado: EA')).toBeTruthy();

    await usuario.selectOptions(screen.getByLabelText('Domínio'), '10');
    expect(screen.getByText('Disputa de Domínios iniciada: Vazio × Sombra')).toBeTruthy();
    expect(screen.queryByText('Recurso ajustado: EA')).toBeNull();

    await usuario.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.getByText('Recurso ajustado: EA')).toBeTruthy();
  });
});
