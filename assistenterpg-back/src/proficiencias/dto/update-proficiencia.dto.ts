import { PartialType } from '@nestjs/mapped-types';
import { CreateProficienciaDto } from './create-proficiencia.dto';

export class UpdateProficienciaDto extends PartialType(CreateProficienciaDto) {}
