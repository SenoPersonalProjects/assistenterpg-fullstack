import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class VincularPersonagemCampanhaDto {
  @IsInt({ message: 'personagemBaseId deve ser inteiro' })
  @Min(1, { message: 'personagemBaseId deve ser maior que zero' })
  personagemBaseId: number;

  @IsOptional()
  @IsBoolean()
  sincronizarTecnicaInata?: boolean;
}
