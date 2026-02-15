// src/suplementos/dto/update-suplemento.dto.ts

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSuplementoDto } from './create-suplemento.dto';

export class UpdateSuplementoDto extends PartialType(
  OmitType(CreateSuplementoDto, ['codigo'] as const),
) {}
