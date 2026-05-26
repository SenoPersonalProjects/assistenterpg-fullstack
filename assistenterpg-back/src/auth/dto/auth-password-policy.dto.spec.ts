import { validate } from 'class-validator';
import { AUTH_PASSWORD_MIN_LENGTH } from '../auth-security.config';
import { RegisterDto } from './register.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { AlterarSenhaDto } from 'src/usuario/dto/alterar-senha.dto';

describe('politica minima de senha em DTOs de auth', () => {
  it('rejeita cadastro com senha menor que 8 caracteres', async () => {
    const dto = new RegisterDto();
    dto.apelido = 'Usuário';
    dto.email = 'usuário@example.com';
    dto.senha = '1234567';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'senha')).toBe(true);
  });

  it('rejeita reset com senha menor que 8 caracteres', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'token-valido';
    dto.novaSenha = '1234567';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'novaSenha')).toBe(true);
  });

  it('rejeita alteracao com nova senha menor que 8 caracteres', async () => {
    const dto = new AlterarSenhaDto();
    dto.senhaAtual = 'senha-antiga';
    dto.novaSenha = '1234567';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'novaSenha')).toBe(true);
  });

  it('aceita senha com o tamanho minimo configurado', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'token-valido';
    dto.novaSenha = 'x'.repeat(AUTH_PASSWORD_MIN_LENGTH);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
