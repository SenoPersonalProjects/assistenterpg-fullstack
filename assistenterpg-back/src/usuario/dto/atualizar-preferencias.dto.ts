// src/usuario/dto/atualizar-preferencias.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AtualizarPreferenciasDto {
  @IsOptional()
  @IsBoolean()
  notificacoesEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesPush?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesConvites?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesAtualizacoes?: boolean;

  @IsOptional()
  @IsString()
  idioma?: string;
}
