// src/compendio/dto/update-categoria.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(
  OmitType(CreateCategoriaDto, ['codigo'] as const),
) {}
