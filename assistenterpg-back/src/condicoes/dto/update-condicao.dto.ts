// src/condicoes/dto/update-condicao.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCondicaoDto } from './create-condicao.dto';

export class UpdateCondicaoDto extends PartialType(CreateCondicaoDto) {}
