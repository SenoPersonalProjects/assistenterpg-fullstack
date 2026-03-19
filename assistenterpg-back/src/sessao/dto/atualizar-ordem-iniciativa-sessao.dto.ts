import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrdemIniciativaItemDto {
  @IsIn(['PERSONAGEM', 'NPC'], {
    message: 'tipoParticipante deve ser PERSONAGEM ou NPC',
  })
  tipoParticipante!: 'PERSONAGEM' | 'NPC';

  @Type(() => Number)
  @IsInt({ message: 'id deve ser inteiro' })
  @Min(1, { message: 'id deve ser maior que zero' })
  id!: number;
}

export class AtualizarOrdemIniciativaSessaoDto {
  @IsArray({ message: 'ordem deve ser uma lista' })
  @ArrayMinSize(1, { message: 'ordem deve ter ao menos um participante' })
  @ValidateNested({ each: true })
  @Type(() => OrdemIniciativaItemDto)
  ordem!: OrdemIniciativaItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'indiceTurnoAtual deve ser inteiro' })
  @Min(0, { message: 'indiceTurnoAtual nao pode ser negativo' })
  indiceTurnoAtual?: number;
}
