import { ValidationPipe } from '@nestjs/common';
import { CriarRolagemSessaoDto } from './criar-rolagem-sessao.dto';

describe('CriarRolagemSessaoDto', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const metadata = {
    type: 'body' as const,
    metatype: CriarRolagemSessaoDto,
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

  it('aceita intencao de pericia de personagem sem resultado calculado', async () => {
    const payload = {
      tipo: 'PERICIA_PERSONAGEM',
      personagemSessaoId: 31,
      periciaCodigo: 'OCULTISMO',
      contexto: { dt: 20 },
      clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
    };

    await expect(pipe.transform(payload, metadata)).resolves.toMatchObject(
      payload,
    );
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

  it.each(['dados', 'total', 'critico', 'bonus', 'efeitoPendenteId'])(
    'rejeita campo mecanico %s na intencao de pericia',
    async (campo) => {
      await expect(
        pipe.transform(
          {
            tipo: 'PERICIA_PERSONAGEM',
            personagemSessaoId: 31,
            periciaCodigo: 'OCULTISMO',
            clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
            [campo]: 20,
          },
          metadata,
        ),
      ).rejects.toMatchObject({ status: 400 });
    },
  );

  it('rejeita campos da formula na intencao de pericia', async () => {
    await expect(
      pipe.transform(
        {
          tipo: 'PERICIA_PERSONAGEM',
          personagemSessaoId: 31,
          periciaCodigo: 'OCULTISMO',
          expressao: '1d20+5',
          clientRequestId: '7fe183a4-c5f4-4fd8-9da6-f9adabbbe0ca',
        },
        metadata,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
