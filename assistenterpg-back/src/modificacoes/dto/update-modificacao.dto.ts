// src/modificacoes/dto/update-modificacao.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateModificacaoDto } from './create-modificacao.dto';

export class UpdateModificacaoDto extends PartialType(CreateModificacaoDto) {}
