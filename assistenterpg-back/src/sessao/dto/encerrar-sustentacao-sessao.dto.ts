import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EncerrarSustentacaoSessaoDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  motivo?: string;
}
