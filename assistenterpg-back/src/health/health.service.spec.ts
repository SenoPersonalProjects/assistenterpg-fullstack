import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const queryRaw = jest.fn();
  const service = new HealthService({ $queryRaw: queryRaw } as never);

  beforeEach(() => {
    queryRaw.mockReset();
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
});
