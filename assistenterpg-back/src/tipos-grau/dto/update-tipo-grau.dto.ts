import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoGrauDto } from './create-tipo-grau.dto';

export class UpdateTipoGrauDto extends PartialType(CreateTipoGrauDto) {}
