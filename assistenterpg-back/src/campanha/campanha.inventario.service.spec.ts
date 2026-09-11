import { CampanhaInventarioService } from './campanha.inventario.service';

describe('CampanhaInventarioService - catálogo contextual', () => {
  const service = new CampanhaInventarioService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  it('mantém o catálogo público para campanhas legadas sem fontes configuradas', () => {
    const filtro = service['filtroFontesEquipamentosCampanha']({
      fontesCampanha: null,
      fontesPersonagem: null,
    });

    expect(filtro).toEqual({ usuarioId: null });
  });

  it('inclui somente suplementos e homebrews habilitados nas duas fontes', () => {
    const filtro = service['filtroFontesEquipamentosCampanha']({
      fontesCampanha: { suplementoIds: [10, 20], homebrewIds: [3, 4] },
      fontesPersonagem: { homebrewIds: [4, 5] },
    });

    expect(filtro).toEqual({
      OR: [
        { fonte: 'SISTEMA_BASE' },
        { fonte: 'SUPLEMENTO', suplementoId: { in: [10, 20] } },
        { fonte: 'HOMEBREW', homebrewOrigemId: { in: [4] } },
      ],
    });
  });
});
