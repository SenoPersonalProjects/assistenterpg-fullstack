import {
  IsIn,
  IsBoolean,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarSessaoAgendadaDto {
  @IsString({ message: 'título deve ser texto' })
  @MaxLength(120, { message: 'título deve ter no máximo 120 caracteres' })
  titulo!: string;

  @IsOptional()
  @IsString({ message: 'descrição deve ser texto' })
  @MaxLength(5000, { message: 'descrição deve ter no máximo 5000 caracteres' })
  descricao?: string;

  @IsISO8601({}, { message: 'inicioEm deve ser uma data ISO válida' })
  inicioEm!: string;

  @IsOptional()
  @IsISO8601({}, { message: 'fimEm deve ser uma data ISO válida' })
  fimEm?: string;

  @IsOptional()
  @IsInt({ message: 'duracaoMinutos deve ser um número inteiro' })
  @Min(15, { message: 'duração mínima é de 15 minutos' })
  @Max(24 * 60, { message: 'duração máxima é de 24 horas' })
  duracaoMinutos?: number;

  @IsString({ message: 'timezone deve ser texto' })
  @MaxLength(80, { message: 'timezone deve ter no máximo 80 caracteres' })
  timezone!: string;

  @IsOptional()
  @IsBoolean({ message: 'adicionarAoGoogleCalendar deve ser booleano' })
  adicionarAoGoogleCalendar?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'adicionarGoogleMeet deve ser booleano' })
  adicionarGoogleMeet?: boolean;
}

export class AtualizarSessaoAgendadaDto {
  @IsOptional()
  @IsString({ message: 'título deve ser texto' })
  @MaxLength(120, { message: 'título deve ter no máximo 120 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'descrição deve ser texto' })
  @MaxLength(5000, { message: 'descrição deve ter no máximo 5000 caracteres' })
  descricao?: string | null;

  @IsOptional()
  @IsISO8601({}, { message: 'inicioEm deve ser uma data ISO válida' })
  inicioEm?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'fimEm deve ser uma data ISO válida' })
  fimEm?: string;

  @IsOptional()
  @IsInt({ message: 'duracaoMinutos deve ser um número inteiro' })
  @Min(15, { message: 'duração mínima é de 15 minutos' })
  @Max(24 * 60, { message: 'duração máxima é de 24 horas' })
  duracaoMinutos?: number;

  @IsOptional()
  @IsString({ message: 'timezone deve ser texto' })
  @MaxLength(80, { message: 'timezone deve ter no máximo 80 caracteres' })
  timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'adicionarAoGoogleCalendar deve ser booleano' })
  adicionarAoGoogleCalendar?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'adicionarGoogleMeet deve ser booleano' })
  adicionarGoogleMeet?: boolean;
}

export class ConflitosSessaoAgendadaQueryDto {
  @IsISO8601({}, { message: 'inicioEm deve ser uma data ISO v\u00e1lida' })
  inicioEm!: string;

  @IsISO8601({}, { message: 'fimEm deve ser uma data ISO v\u00e1lida' })
  fimEm!: string;

  @IsOptional()
  @IsString({ message: 'incluirGoogle deve ser texto' })
  @IsIn(['true', 'false'], {
    message: 'incluirGoogle deve ser true ou false',
  })
  incluirGoogle?: 'true' | 'false';
}
