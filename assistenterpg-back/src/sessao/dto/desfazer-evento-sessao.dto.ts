import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DesfazerEventoSessaoDto {
  @IsOptional()
  @IsString({ message: 'motivo deve ser texto' })
  @MaxLength(240, { message: 'motivo deve ter no máximo 240 caracteres' })
  motivo?: string;
}
