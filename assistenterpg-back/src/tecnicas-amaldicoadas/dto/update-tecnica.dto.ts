//src/tecnicas-amaldicoadas/dto/update-tecnica.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTecnicaDto } from './create-tecnica.dto';

export class UpdateTecnicaDto extends PartialType(
  OmitType(CreateTecnicaDto, ['codigo'] as const),
) {}
