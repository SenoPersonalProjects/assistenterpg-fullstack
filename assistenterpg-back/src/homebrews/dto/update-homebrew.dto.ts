// src/homebrews/dto/update-homebrew.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateHomebrewDto } from './create-homebrew.dto';

/**
 * DTO para atualização de Homebrew
 * Todos os campos são opcionais
 */
export class UpdateHomebrewDto extends PartialType(CreateHomebrewDto) {}
