//src/tecnicas-amaldicoadas/dto/update-habilidade-tecnica.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHabilidadeTecnicaDto } from './create-habilidade-tecnica.dto';

export class UpdateHabilidadeTecnicaDto extends PartialType(
  OmitType(CreateHabilidadeTecnicaDto, ['tecnicaId', 'codigo'] as const),
) {}
