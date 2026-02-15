// src/suplementos/dto/filtrar-suplementos.dto.ts

import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusPublicacao } from '@prisma/client';

export class FiltrarSuplementosDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao;

  @IsOptional()
  @IsString()
  autor?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  apenasAtivos?: boolean; // Filtrar apenas suplementos ativos do usuário
}
