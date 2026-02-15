// src/trilhas/dto/update-trilha.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateTrilhaDto } from './create-trilha.dto';

export class UpdateTrilhaDto extends PartialType(CreateTrilhaDto) {}
