// src/compendio/dto/update-subcategoria.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {}
