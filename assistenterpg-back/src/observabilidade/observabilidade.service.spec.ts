import { Logger } from '@nestjs/common';
import { ObservabilidadeService } from './observabilidade.service';

describe('ObservabilidadeService', () => {
  it('registra somente o evento sanitizado recebido do cliente', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = new ObservabilidadeService();

    service.registrarErroCliente(12, {
      tipo: 'ERRO_JAVASCRIPT',
      mensagem: 'Falha ao abrir painel',
      rota: '/campanhas/1',
      versao: 'abc123',
      em: '2026-09-14T12:00:00.000Z',
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('"usuarioId":12'),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.not.stringContaining('DATABASE_URL'),
    );
  });
});
