import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const queryRaw = jest.fn();
  const registroBackupOperacional = { findFirst: jest.fn(), create: jest.fn() };
  const service = new HealthService({
    $queryRaw: queryRaw,
    registroBackupOperacional,
  } as never);

  beforeEach(() => {
    queryRaw.mockReset();
    registroBackupOperacional.findFirst.mockReset();
    registroBackupOperacional.create.mockReset();
  });

  it('informa vida sem depender do banco', () => {
    expect(service.live()).toMatchObject({
      status: 'ok',
      service: 'assistenterpg-back',
    });
  });

  it('informa prontidão quando o banco responde', async () => {
    queryRaw.mockResolvedValue([{ 1: 1 }]);

    await expect(service.ready()).resolves.toMatchObject({ status: 'ok' });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('não expõe o erro interno quando o banco não responde', async () => {
    queryRaw.mockRejectedValue(new Error('credencial interna'));

    await expect(service.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('registra metadados quando o token de backup e valido', async () => {
    const anterior = process.env.BACKUP_STATUS_TOKEN;
    process.env.BACKUP_STATUS_TOKEN = 'token-de-teste';
    registroBackupOperacional.create.mockResolvedValue({ id: 1 });

    await expect(
      service.registrarBackup('token-de-teste', {
        banco: 'test',
        arquivo: 'tidb_test.sql',
        tamanhoBytes: 10,
        sha256: 'a'.repeat(64),
      }),
    ).resolves.toEqual({ id: 1 });
    expect(registroBackupOperacional.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tamanhoBytes: BigInt(10) }),
      }),
    );
    if (anterior === undefined) delete process.env.BACKUP_STATUS_TOKEN;
    else process.env.BACKUP_STATUS_TOKEN = anterior;
  });
});
