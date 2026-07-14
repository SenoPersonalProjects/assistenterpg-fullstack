import { ValidationPipe } from '@nestjs/common';
import { CriarRolagemFormulaSessaoDto } from './criar-rolagem-sessao.dto';

describe('CriarRolagemFormulaSessaoDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const metadata = {
    type: 'body' as const,
    metatype: CriarRolagemFormulaSessaoDto,
  };
  const payloadValido = {
    tipo: 'FORMULA',
    expressao: '2d6+3',
    contexto: { tipo: 'OUTRO' },
    clientRequestId: '9c871c5a-c103-4ab1-86d9-b7cdb20c5d77',
  };

  it('aceita apenas a intencao neutra de rolagem', async () => {
    await expect(
      pipe.transform(payloadValido, metadata),
    ).resolves.toMatchObject(payloadValido);
  });

  it.each(['dados', 'total', 'critico', 'bonus', 'dadosRolagem'])(
    'rejeita resultado calculado pelo cliente no campo %s',
    async (campo) => {
      await expect(
        pipe.transform({ ...payloadValido, [campo]: 20 }, metadata),
      ).rejects.toMatchObject({ status: 400 });
    },
  );

  it('rejeita contexto mecanico nesta fase', async () => {
    await expect(
      pipe.transform(
        {
          ...payloadValido,
          contexto: { tipo: 'ATAQUE', dt: 20 },
        },
        metadata,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
