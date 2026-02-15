// src/trilhas/dto/update-caminho.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCaminhoDto } from './create-caminho.dto';

export class UpdateCaminhoDto extends PartialType(CreateCaminhoDto) {}
