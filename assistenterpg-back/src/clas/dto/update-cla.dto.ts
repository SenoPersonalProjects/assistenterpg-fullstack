// src/clas/dto/update-cla.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateClaDto } from './create-cla.dto';

export class UpdateClaDto extends PartialType(CreateClaDto) {}
