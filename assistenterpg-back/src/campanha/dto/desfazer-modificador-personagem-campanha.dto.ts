import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DesfazerModificadorPersonagemCampanhaDto {
  @IsOptional()
  @IsString({ message: 'motivo deve ser texto' })
  @MaxLength(500, { message: 'motivo deve ter no maximo 500 caracteres' })
  motivo?: string;
}
