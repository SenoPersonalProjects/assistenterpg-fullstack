import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RemoverCondicaoSessaoDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  motivo?: string;
}
