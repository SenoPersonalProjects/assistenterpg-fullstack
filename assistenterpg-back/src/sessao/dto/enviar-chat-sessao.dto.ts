import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EnviarChatSessaoDto {
  @IsString({ message: 'mensagem deve ser texto' })
  @IsNotEmpty({ message: 'mensagem e obrigatoria' })
  @MaxLength(800, { message: 'mensagem deve ter no maximo 800 caracteres' })
  mensagem: string;

  @IsOptional()
  @IsIn(['PUBLICA', 'SECRETA_MESTRE'], {
    message: 'visibilidade deve ser PUBLICA ou SECRETA_MESTRE',
  })
  visibilidade?: 'PUBLICA' | 'SECRETA_MESTRE';

  @IsOptional()
  @IsObject({ message: 'dadosRolagem deve ser um objeto' })
  dadosRolagem?: Record<string, unknown>;

  @IsOptional()
  @IsObject({ message: 'contextoRolagem deve ser um objeto' })
  contextoRolagem?: Record<string, unknown>;
}
