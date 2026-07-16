import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RemoverCondicaoSessaoDto {
  @IsOptional()
  @IsUUID('4')
  clientRequestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  motivo?: string;
}
