import { PartialType } from '@nestjs/mapped-types';
import { CreateNpcAmeacaGrupoDto } from './create-npc-ameaca-grupo.dto';

export class UpdateNpcAmeacaGrupoDto extends PartialType(CreateNpcAmeacaGrupoDto) {}
