import { CampanhaRoletaService } from './campanha.roleta.service';
import {
  CampanhaRoletaAcessoNegadoException,
  CampanhaRoletaPermissaoInvalidaException,
} from '../common/exceptions/campanha-roleta.exception';

describe('CampanhaRoletaService - permissoes', () => {
  const acessoMestre = {
    garantirAcesso: jest.fn().mockResolvedValue({
      ehMestre: true,
      papel: 'MESTRE',
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('permite delegar configurar e girar somente a membro JOGADOR', async () => {
    const prisma = {
      membroCampanha: {
        findUnique: jest.fn().mockResolvedValue({ papel: 'JOGADOR' }),
      },
      campanhaRoletaPermissao: {
        upsert: jest.fn().mockResolvedValue({
          id: 1,
          usuarioId: 8,
          podeConfigurar: true,
          podeGirar: false,
          membro: { usuario: { id: 8, apelido: 'Jogador' } },
        }),
      },
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoMestre as never,
    );
    await expect(
      service.salvarPermissao(2, 8, 3, {
        podeConfigurar: true,
        podeGirar: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        usuarioId: 8,
        usuario: { id: 8, apelido: 'Jogador' },
      }),
    );
  });

  it.each(['MESTRE', 'OBSERVADOR'])(
    'rejeita delegacao para papel %s',
    async (papel) => {
      const prisma = {
        membroCampanha: { findUnique: jest.fn().mockResolvedValue({ papel }) },
      };
      const service = new CampanhaRoletaService(
        prisma as never,
        acessoMestre as never,
      );
      await expect(
        service.salvarPermissao(2, 8, 3, {
          podeConfigurar: false,
          podeGirar: true,
        }),
      ).rejects.toBeInstanceOf(CampanhaRoletaPermissaoInvalidaException);
    },
  );

  it('impede JOGADOR delegado de conceder permissoes', async () => {
    const acessoJogador = {
      garantirAcesso: jest.fn().mockResolvedValue({
        ehMestre: false,
        papel: 'JOGADOR',
      }),
    };
    const prisma = {
      campanhaRoletaPermissao: {
        findUnique: jest.fn().mockResolvedValue({
          podeConfigurar: true,
          podeGirar: true,
        }),
      },
    };
    const service = new CampanhaRoletaService(
      prisma as never,
      acessoJogador as never,
    );
    await expect(
      service.salvarPermissao(2, 8, 7, {
        podeConfigurar: true,
        podeGirar: true,
      }),
    ).rejects.toBeInstanceOf(CampanhaRoletaAcessoNegadoException);
  });
});
