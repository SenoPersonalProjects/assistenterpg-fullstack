import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class RegistrarBackupOperacionalDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  banco!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  arquivo!: string;

  @IsInt()
  @Min(1)
  tamanhoBytes!: number;

  @IsString()
  @Length(64, 64)
  sha256!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  retencao?: number;

  @IsOptional()
  @IsIn(['AGENDADO', 'MANUAL', 'PRE_UPDATE'])
  origem?: 'AGENDADO' | 'MANUAL' | 'PRE_UPDATE';

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  observacao?: string;
}
