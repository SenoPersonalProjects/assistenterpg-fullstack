// src/campanha/dto/update-status-campanha.dto.ts
import { IsEnum } from 'class-validator';

export class UpdateStatusCampanhaDto {
  @IsEnum(['ATIVA', 'PAUSADA', 'ENCERRADA'], {
    message: 'Status deve ser ATIVA, PAUSADA ou ENCERRADA',
  })
  status: 'ATIVA' | 'PAUSADA' | 'ENCERRADA';
}
