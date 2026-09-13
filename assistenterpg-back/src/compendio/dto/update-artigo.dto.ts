// src/compendio/dto/update-artigo.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateArtigoDto } from './create-artigo.dto';

export class UpdateArtigoDto extends PartialType(
  OmitType(CreateArtigoDto, ['codigo'] as const),
) {}
