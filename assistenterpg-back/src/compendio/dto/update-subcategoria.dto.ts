// src/compendio/dto/update-subcategoria.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';

export class UpdateSubcategoriaDto extends PartialType(
  OmitType(CreateSubcategoriaDto, ['codigo'] as const),
) {}
