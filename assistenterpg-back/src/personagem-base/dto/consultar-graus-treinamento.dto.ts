// src/personagem-base/dto/consultar-graus-treinamento.dto.ts
import { IsArray, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para consultar informações sobre graus de treinamento disponíveis
 * GET /personagens-base/graus-treinamento/info?nivel=10&intelecto=3
 */
export class ConsultarInfoGrausTreinamentoDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  nivel: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  intelecto: number;
}

/**
 * DTO para consultar perícias elegíveis para grau de treinamento
 * POST /personagens-base/graus-treinamento/pericias-elegiveis
 */
export class ConsultarPericiasElegiveisDto {
  @IsArray()
  @IsString({ each: true })
  periciasComGrauInicial: string[];
}
