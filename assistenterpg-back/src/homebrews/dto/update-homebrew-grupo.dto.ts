import { PartialType } from '@nestjs/mapped-types';
import { CreateHomebrewGrupoDto } from './create-homebrew-grupo.dto';

export class UpdateHomebrewGrupoDto extends PartialType(CreateHomebrewGrupoDto) {}
