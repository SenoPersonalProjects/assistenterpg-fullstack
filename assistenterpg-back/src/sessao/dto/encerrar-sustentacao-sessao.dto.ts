import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class EncerrarSustentacaoSessaoDto {
  @IsOptional()
  @IsUUID('4')
  clientRequestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  motivo?: string;
}
